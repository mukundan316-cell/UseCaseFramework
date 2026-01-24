import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { responseSessions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerResponseRoutes(app: Express): void {
  app.get('/api/responses/user-sessions', async (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const userEmail = (req.query.userEmail as string) || process.env.DEFAULT_USER_EMAIL || 'user@hexaware.com';
      
      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const definitions = await questionnaireServiceInstance.getAllDefinitions();
      
      const userSessions = await db.select()
        .from(responseSessions)
        .where(eq(responseSessions.respondentEmail, userEmail))
        .orderBy(desc(responseSessions.lastUpdatedAt));
      
      const existingSessionsMap = new Map();
      userSessions.forEach(session => {
        if (!existingSessionsMap.has(session.questionnaireId)) {
          existingSessionsMap.set(session.questionnaireId, session);
        }
      });
      
      const sessionsWithProgress = definitions.map(definition => {
        const existingSession = existingSessionsMap.get(definition.id);
        
        let status: string;
        let progressPercent = 0;
        
        if (existingSession?.completedAt) {
          status = 'completed';
          progressPercent = 100;
        } else if (existingSession && existingSession.answeredQuestions > 0) {
          progressPercent = existingSession.progressPercent || 0;
          status = `${progressPercent}%`;
        } else {
          status = 'not started';
          progressPercent = 0;
        }
        
        return {
          id: existingSession?.id || null,
          questionnaireId: definition.id,
          title: definition.title,
          status,
          progressPercent,
          completedAt: existingSession?.completedAt || null,
          updatedAt: existingSession?.lastUpdatedAt || new Date(),
          isCompleted: !!existingSession?.completedAt,
          session: existingSession || null
        };
      });
      
      res.json(sessionsWithProgress);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({ error: 'Failed to fetch user sessions' });
    }
  });

  app.get('/api/responses/check-session', async (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const { questionnaireId } = req.query;
      
      if (!questionnaireId) {
        return res.status(400).json({ error: 'Missing questionnaireId parameter' });
      }

      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const session = await questionnaireServiceInstance.getMostRecentSession(questionnaireId as string);
      
      if (!session) {
        return res.status(404).json({ error: 'No session found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error checking session:', error);
      res.status(500).json({ error: 'Failed to check session' });
    }
  });

  app.post('/api/responses/start', async (req, res) => {
    try {
      const { questionnaireId, respondentEmail, respondentName, metadata } = req.body;
      
      if (!questionnaireId || !respondentEmail) {
        return res.status(400).json({ 
          error: 'Missing required fields: questionnaireId and respondentEmail are required' 
        });
      }

      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const sessionId = await questionnaireServiceInstance.startResponseSession(
        questionnaireId, 
        respondentEmail, 
        respondentName
      );

      res.json({ 
        success: true, 
        responseId: sessionId,
        message: 'Assessment session started successfully'
      });
    } catch (error) {
      console.error('Error starting response session:', error);
      
      if (error instanceof Error && error.message && error.message.startsWith('COMPLETED_SESSION:')) {
        const completedSessionId = error.message.split(':')[1];
        return res.status(409).json({ 
          error: 'Assessment already completed',
          completedSessionId,
          message: 'You have already completed this assessment. Redirecting to results.'
        });
      }
      
      res.status(500).json({ error: 'Failed to start assessment session' });
    }
  });

  app.put('/api/responses/:id/answers', async (req, res) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      
      if (!answers) {
        return res.status(400).json({ 
          error: 'Missing answers data' 
        });
      }

      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      await questionnaireServiceInstance.saveResponseAnswers(id, answers);

      res.json({ 
        success: true, 
        message: 'Answers saved successfully'
      });
    } catch (error) {
      console.error('Error saving answers:', error);
      res.status(500).json({ error: 'Failed to save answers' });
    }
  });

  app.get('/api/responses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const response = await questionnaireServiceInstance.getResponse(id);
      
      if (!response) {
        return res.status(404).json({ error: 'Response not found' });
      }

      res.json(response);
    } catch (error) {
      console.error('Error getting response:', error);
      res.status(500).json({ error: 'Failed to get response' });
    }
  });
  
  app.get('/api/survey-config/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const config = await questionnaireServiceInstance.getQuestionnaireDefinition(id);
      
      if (!config) {
        return res.status(404).json({ error: 'Survey configuration not found' });
      }
      
      res.json(config);
    } catch (error) {
      console.error('Error loading survey config:', error);
      res.status(500).json({ error: 'Failed to load survey configuration' });
    }
  });

  app.get('/api/responses/:id/scores', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const session = await questionnaireServiceInstance.getSession(id);
      
      if (!session) {
        return res.status(404).json({ error: 'Response session not found' });
      }

      const scores = {
        answerCount: session.answeredQuestions ?? 0,
        completedAt: session.completedAt
      };

      res.json(scores);
    } catch (error) {
      console.error('Error getting response scores:', error);
      res.status(500).json({ error: 'Failed to get response scores' });
    }
  });

  app.post('/api/responses/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const completedResponse = await questionnaireServiceInstance.completeResponse(id);
      
      if (!completedResponse) {
        return res.status(404).json({ error: 'Response session not found' });
      }

      res.json({ 
        id: completedResponse.id,
        status: completedResponse.status,
        completedAt: completedResponse.completedAt,
        success: true, 
        message: 'Assessment completed successfully'
      });
    } catch (error) {
      console.error('Error completing response:', error);
      res.status(500).json({ error: 'Failed to complete response' });
    }
  });

  app.post('/api/responses/:id/reset', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { questionnaireServiceInstance } = await import('../services/questionnaireService');
      const success = await questionnaireServiceInstance.resetResponseSession(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Response session not found' });
      }

      res.json({ 
        success: true, 
        message: 'Response session reset successfully'
      });
    } catch (error) {
      console.error('Error resetting response session:', error);
      res.status(500).json({ error: 'Failed to reset response session' });
    }
  });

  app.get('/api/presentations/proxy/:encodedUrl(*)', async (req, res) => {
    try {
      const { encodedUrl } = req.params;
      const url = decodeURIComponent(encodedUrl);
      
      console.log(`📄 Proxying file - encoded: ${encodedUrl}`);
      console.log(`📄 Proxying file - decoded: ${url}`);
      
      if (url.startsWith('/api/presentations/files/')) {
        const fileId = url.replace('/api/presentations/files/', '');
        console.log(`📄 Local file request: ${fileId}`);
        
        const { localFileService } = await import('../services/localFileService');
        const fileData = await localFileService.getFileFromLocal(fileId);
        
        if (!fileData) {
          console.error(`Local file not found: ${fileId}`);
          return res.status(404).json({ error: 'File not found' });
        }
        
        console.log(`📄 Serving local file via proxy: ${fileData.mimeType}, size: ${fileData.fileSize}`);
        
        res.set({
          'Content-Type': fileData.mimeType || 'application/octet-stream',
          'Content-Length': fileData.fileSize.toString(),
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Credentials': 'false',
          'Content-Disposition': 'inline',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Cross-Origin-Embedder-Policy': 'unsafe-none'
        });
        
        return res.send(fileData.buffer);
      }
      
      return res.status(400).json({ error: 'Invalid file URL - only database file URLs are supported' });
      
    } catch (error) {
      console.error('Error proxying file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to serve file', details: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  });

  app.get('/api/saved-progress', async (req, res) => {
    try {
      const savedProgress = await storage.getSavedAssessmentProgress();
      res.json(savedProgress);
    } catch (error) {
      console.error('Error getting saved progress:', error);
      res.status(500).json({ error: 'Failed to get saved progress' });
    }
  });

  app.delete('/api/saved-progress/:responseId', async (req, res) => {
    try {
      const { responseId } = req.params;
      await storage.deleteSavedAssessmentProgress(responseId);
      res.json({ success: true, message: 'Saved progress deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved progress:', error);
      res.status(500).json({ error: 'Failed to delete saved progress' });
    }
  });

  app.post('/api/feedback', async (req, res) => {
    try {
      const { 
        useCaseId, 
        useCaseTitle, 
        currentTShirtSize, 
        currentCostRange, 
        currentTimeline, 
        feedback, 
        suggestedSize, 
        userEmail,
        timestamp = new Date().toISOString()
      } = req.body;

      if (!useCaseId || !feedback) {
        return res.status(400).json({ 
          error: 'Use case ID and feedback are required' 
        });
      }

      const feedbackData = {
        useCaseId,
        useCaseTitle: useCaseTitle || 'Unknown',
        currentTShirtSize: currentTShirtSize || 'Unknown',
        currentCostRange: currentCostRange || 'Unknown',
        currentTimeline: currentTimeline || 'Unknown',
        feedback: feedback.trim(),
        suggestedSize: suggestedSize || null,
        userEmail: userEmail || 'anonymous',
        timestamp,
        source: 'tshirt_sizing_preview'
      };

      console.log('T-shirt Sizing Feedback Received:', JSON.stringify(feedbackData, null, 2));
      
      res.status(201).json({ 
        message: 'Feedback received successfully',
        feedbackId: `feedback_${Date.now()}`,
        status: 'recorded'
      });

    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ 
        error: 'Failed to submit feedback',
        message: 'Please try again later'
      });
    }
  });
}
