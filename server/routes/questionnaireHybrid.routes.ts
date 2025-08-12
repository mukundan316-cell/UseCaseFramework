import { Router } from 'express';
import { QuestionnaireStorageService } from '../services/questionnaireStorageService';
import { QuestionnaireMigrationService } from '../services/questionnaireMigrationService';
import { QuestionnaireDemoService } from '../services/questionnaireDemo';
import { db } from '../db';
import { responseSessions } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();
const storageService = new QuestionnaireStorageService();
const migrationService = new QuestionnaireMigrationService();
const demoService = new QuestionnaireDemoService();

/**
 * GET /api/questionnaire-hybrid/sessions
 * List all response sessions with metadata for quick queries
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(responseSessions)
      .orderBy(desc(responseSessions.lastUpdatedAt));

    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/questionnaire-hybrid/sessions/:id
 * Get specific session details
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [session] = await db
      .select()
      .from(responseSessions)
      .where(eq(responseSessions.id, id));

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Failed to fetch session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * GET /api/questionnaire-hybrid/questionnaire/:id
 * Get questionnaire definition from JSON storage
 */
router.get('/questionnaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionnaire = await storageService.getQuestionnaireDefinition(id);
    
    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    res.json(questionnaire);
  } catch (error) {
    console.error('Failed to fetch questionnaire:', error);
    res.status(500).json({ error: 'Failed to fetch questionnaire' });
  }
});

/**
 * GET /api/questionnaire-hybrid/response/:id
 * Get questionnaire response from JSON storage
 */
router.get('/response/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await storageService.getQuestionnaireResponse(id);
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    res.json(response);
  } catch (error) {
    console.error('Failed to fetch response:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

/**
 * POST /api/questionnaire-hybrid/sessions
 * Create new response session
 */
router.post('/sessions', async (req, res) => {
  try {
    const { 
      questionnaireId, 
      respondentEmail, 
      respondentName,
      questionnaireDefinitionPath,
      questionnaireVersion,
      totalQuestions
    } = req.body;

    if (!questionnaireId || !respondentEmail || !questionnaireDefinitionPath) {
      return res.status(400).json({ 
        error: 'Missing required fields: questionnaireId, respondentEmail, questionnaireDefinitionPath' 
      });
    }

    const sessionId = storageService.generateResponseId();

    await db.insert(responseSessions).values({
      id: sessionId,
      questionnaireId,
      respondentEmail,
      respondentName: respondentName || null,
      status: 'started',
      questionnaireDefinitionPath,
      questionnaireVersion: questionnaireVersion || '1.0',
      totalQuestions: totalQuestions || 52,
    });

    const [session] = await db
      .select()
      .from(responseSessions)
      .where(eq(responseSessions.id, sessionId));

    res.status(201).json(session);
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * PUT /api/questionnaire-hybrid/sessions/:id/answer
 * Update answer in JSON storage and session progress
 */
router.put('/sessions/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, answerValue } = req.body;

    if (!questionId || answerValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: questionId, answerValue' 
      });
    }

    // Update answer in JSON storage
    const success = await storageService.updateResponseAnswer(id, questionId, answerValue);
    
    if (!success) {
      return res.status(404).json({ error: 'Response not found or failed to update' });
    }

    // Update session progress
    const response = await storageService.getQuestionnaireResponse(id);
    if (response) {
      const answeredQuestions = response.answers.length;
      const progressPercent = Math.round((answeredQuestions / 52) * 100);

      await db
        .update(responseSessions)
        .set({
          answeredQuestions,
          progressPercent,
          lastUpdatedAt: new Date(),
          status: progressPercent === 100 ? 'completed' : 'in_progress'
        })
        .where(eq(responseSessions.id, id));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update answer:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

/**
 * PUT /api/questionnaire-hybrid/sessions/:id/complete
 * Mark session as completed
 */
router.put('/sessions/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    // Mark response as completed in JSON storage
    await storageService.completeResponse(id);

    // Update session status
    await db
      .update(responseSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        lastUpdatedAt: new Date(),
        progressPercent: 100
      })
      .where(eq(responseSessions.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to complete session:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

/**
 * POST /api/questionnaire-hybrid/migrate/:questionnaireId
 * Migrate existing questionnaire from PostgreSQL to hybrid storage
 */
router.post('/migrate/:questionnaireId', async (req, res) => {
  try {
    const { questionnaireId } = req.params;

    console.log(`Starting migration for questionnaire ${questionnaireId}`);

    const result = await migrationService.migrateFullQuestionnaire(questionnaireId);

    if (!result.questionnaireDefinitionPath) {
      return res.status(404).json({ error: 'Questionnaire not found or migration failed' });
    }

    res.json({
      message: 'Migration completed successfully',
      questionnaireDefinitionPath: result.questionnaireDefinitionPath,
      migratedResponses: result.migratedResponses.length,
      sessionsCreated: result.sessionsCreated,
      details: result
    });
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
});

/**
 * GET /api/questionnaire-hybrid/verify/:responseId
 * Verify migration integrity for a specific response
 */
router.get('/verify/:responseId', async (req, res) => {
  try {
    const { responseId } = req.params;

    const verification = await migrationService.verifyMigration(responseId);

    res.json(verification);
  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /api/questionnaire-hybrid/stats
 * Get system statistics for the hybrid approach
 */
router.get('/stats', async (req, res) => {
  try {
    const totalSessions = await db
      .select()
      .from(responseSessions);

    const completedSessions = totalSessions.filter(s => s.status === 'completed');
    const inProgressSessions = totalSessions.filter(s => s.status === 'in_progress');
    const startedSessions = totalSessions.filter(s => s.status === 'started');

    const stats = {
      totalSessions: totalSessions.length,
      completedSessions: completedSessions.length,
      inProgressSessions: inProgressSessions.length,
      startedSessions: startedSessions.length,
      averageProgress: totalSessions.length > 0 
        ? Math.round(totalSessions.reduce((sum, s) => sum + s.progressPercent, 0) / totalSessions.length)
        : 0,
      totalAnswers: totalSessions.reduce((sum, s) => sum + s.answeredQuestions, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * POST /api/questionnaire-hybrid/demo
 * Run demo workflow to test the hybrid system
 */
router.post('/demo', async (req, res) => {
  try {
    console.log('Running hybrid questionnaire demo...');
    
    const result = await demoService.runDemo();
    
    if (!result.success) {
      return res.status(500).json({ error: 'Demo failed', result });
    }

    res.json({
      message: 'Demo completed successfully',
      result
    });
  } catch (error) {
    console.error('Demo failed:', error);
    res.status(500).json({ error: 'Demo failed' });
  }
});

export default router;