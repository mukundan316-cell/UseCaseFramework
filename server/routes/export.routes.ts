import { Router } from 'express';
import { UseCasePdfService } from '../services/useCasePdfService';
import { EnhancedUseCasePdfService } from '../services/enhancedUseCasePdfService';
import { questionnaireServiceInstance } from '../services/questionnaireService';
import { SurveyJsPdfService } from '../services/surveyJsPdfService';
import { QuestionnairePdfService } from '../services/questionnairePdfService';

const router = Router();

/**
 * Export assessment report as PDF (Enhanced Professional Version)
 * GET /api/export/assessment/:responseId
 */
router.get('/assessment/:responseId', async (req, res) => {
  try {
    res.status(501).json({ 
      error: 'Assessment PDF export temporarily disabled during blob migration',
      message: 'This feature will be re-implemented with the new Survey.js questionnaire system'
    });
  } catch (error) {
    console.error('Assessment PDF export error:', error);
    res.status(500).json({ error: 'Failed to export assessment report' });
  }
});

/**
 * Export use case library as PDF (Enhanced Professional Version)
 * GET /api/export/library?category=all&status=active
 */
router.get('/library', async (req, res) => {
  try {
    const { category = 'all', status = 'all' } = req.query;
    
    await EnhancedUseCasePdfService.generateLibraryCatalog(res, {
      category: category as string,
      status: status as string,
    });
  } catch (error) {
    console.error('Library PDF export error:', error);
    res.status(500).json({ error: 'Failed to export use case library' });
  }
});

/**
 * Export RSA active portfolio as PDF (Enhanced Professional Version)
 * GET /api/export/portfolio
 */
router.get('/portfolio', async (req, res) => {
  try {
    await EnhancedUseCasePdfService.generatePortfolioReport(res);
  } catch (error) {
    console.error('Portfolio PDF export error:', error);
    res.status(500).json({ error: 'Failed to export portfolio report' });
  }
});

/**
 * Export individual use case as PDF
 * GET /api/export/use-case/:id
 */
router.get('/use-case/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Use case ID is required' });
    }

    await UseCasePdfService.generateUseCaseReport(id, res);
  } catch (error) {
    console.error('Use case PDF export error:', error);
    res.status(500).json({ error: 'Failed to export use case report' });
  }
});

/**
 * Export blank questionnaire template as PDF using Survey.js
 * GET /api/export/questionnaire/:questionnaireId/template
 */
router.get('/questionnaire/:questionnaireId/template', async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    
    if (!questionnaireId) {
      return res.status(400).json({ error: 'Questionnaire ID is required' });
    }

    await QuestionnairePdfService.generateBlankQuestionnaire(questionnaireId, res);
  } catch (error) {
    console.error('Questionnaire template export error:', error);
    res.status(500).json({ error: 'Failed to export questionnaire template' });
  }
});

/**
 * Export populated questionnaire with responses as PDF using Survey.js
 * GET /api/export/questionnaire/:responseId/responses
 */
router.get('/questionnaire/:responseId/responses', async (req, res) => {
  try {
    const { responseId } = req.params;
    
    if (!responseId) {
      return res.status(400).json({ error: 'Response ID is required' });
    }

    await QuestionnairePdfService.generateFilledQuestionnaire(responseId, res);
  } catch (error) {
    console.error('Questionnaire responses export error:', error);
    res.status(500).json({ error: 'Failed to export questionnaire responses' });
  }
});

export default router;