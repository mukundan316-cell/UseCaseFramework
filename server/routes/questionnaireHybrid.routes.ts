import { Router } from 'express';
import { questionnaireServiceInstance } from '../services/questionnaireService';
import { db } from '../db';
import { responseSessions } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();
// Use singleton instance for shared cache across all API calls
const questionnaireService = questionnaireServiceInstance;

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
 * GET /api/questionnaire/sections
 * Get all sections (definitions with titles and question counts)
 */
router.get('/sections', async (req, res) => {
  try {
    const sections = await questionnaireService.getAllSections();
    res.json(sections);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

/**
 * GET /api/questionnaire/definitions
 * Get all questionnaire definitions from JSON storage
 */
router.get('/definitions', async (req, res) => {
  try {
    console.log('=== GET /definitions endpoint called ===');
    const definitions = await questionnaireService.getAllDefinitions();
    console.log(`=== Endpoint returning ${definitions.length} definitions ===`);
    res.json(definitions);
  } catch (error) {
    console.error('Failed to fetch definitions:', error);
    res.status(500).json({ error: 'Failed to fetch definitions' });
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
 * GET /api/questionnaire/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const cacheStats = questionnaireService.getCacheStats();
    res.json(cacheStats);
  } catch (error) {
    console.error('Failed to fetch cache stats:', error);
    res.status(500).json({ error: 'Failed to fetch cache stats' });
  }
});

/**
 * GET /api/questionnaire/:id
 * Get specific questionnaire definition
 * Note: This route must come after all specific routes like /sections, /definitions, etc.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't treat reserved routes as IDs
    if (['sections', 'definitions', 'stats', 'cache'].includes(id)) {
      return res.status(400).json({ error: 'Invalid questionnaire ID' });
    }
    
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
 * DELETE /api/questionnaire/cache
 * Clear all definition cache
 */
router.delete('/cache', async (req, res) => {
  try {
    questionnaireService.clearAllDefinitionCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

/**
 * DELETE /api/questionnaire/cache/:id
 * Clear cache for specific questionnaire
 */
router.delete('/cache/:id', async (req, res) => {
  try {
    const { id } = req.params;
    questionnaireService.clearDefinitionCache(id);
    res.json({ message: `Cache cleared for questionnaire ${id}` });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});









export default router;