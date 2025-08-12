import { Router } from 'express';
import { QuestionnaireService } from '../services/questionnaireService';
import { QuestionnaireDemoService } from '../services/questionnaireDemo';
import { db } from '../db';
import { responseSessions } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();
const questionnaireService = new QuestionnaireService();
const demoService = new QuestionnaireDemoService();

/**
 * GET /api/questionnaire/sessions
 * List all response sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await questionnaireService.getAllSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/questionnaire/sessions/:id
 * Get specific session details
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await questionnaireService.getSession(id);

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
 * GET /api/questionnaire/definitions
 * Get all questionnaire definitions from JSON storage
 */
router.get('/definitions', async (req, res) => {
  try {
    const definitions = await questionnaireService.getAllDefinitions();
    res.json(definitions);
  } catch (error) {
    console.error('Failed to fetch definitions:', error);
    res.status(500).json({ error: 'Failed to fetch definitions' });
  }
});

/**
 * GET /api/questionnaire/:id
 * Get specific questionnaire definition
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questionnaire = await questionnaireService.getQuestionnaireDefinition(id);
    
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
 * GET /api/questionnaire/stats
 * Get questionnaire statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await questionnaireService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/questionnaire/questionnaire/:id
 * Get questionnaire definition from JSON storage
 */
router.get('/questionnaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionnaire = await questionnaireService.getDefinition(id);
    
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
 * GET /api/questionnaire/response/:id
 * Get questionnaire response from JSON storage
 */
router.get('/response/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await questionnaireService.getResponse(id);
    
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

    const sessionId = questionnaireService.generateResponseId();

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
    const success = await questionnaireService.updateResponseAnswer(id, questionId, answerValue);
    
    if (!success) {
      return res.status(404).json({ error: 'Response not found or failed to update' });
    }

    // Update session progress
    const response = await questionnaireService.getResponse(id);
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
    await questionnaireService.completeResponse(id);

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

// Migration endpoints removed - clean blob-first approach

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
 * GET /api/questionnaire/demo/create-questionnaire
 * Create demo questionnaire for testing blob storage
 */
router.get('/demo/create-questionnaire', async (req, res) => {
  try {
    console.log('Creating demo questionnaire...');
    
    const result = await demoService.createDemoQuestionnaire();
    
    res.json({
      message: 'Demo questionnaire created successfully',
      result
    });
  } catch (error) {
    console.error('Demo questionnaire creation failed:', error);
    res.status(500).json({ error: 'Demo questionnaire creation failed' });
  }
});

/**
 * POST /api/questionnaire/demo
 * Run demo workflow to test the blob system
 */
router.post('/demo', async (req, res) => {
  try {
    console.log('Running blob questionnaire demo...');
    
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