import { Router } from 'express';
import { AssessmentPdfService } from '../services/assessmentPdfService';
import { UseCasePdfService } from '../services/useCasePdfService';
import { QuestionnairePdfService } from '../services/questionnairePdfService';

const router = Router();

/**
 * Export assessment report as PDF
 * GET /api/export/assessment/:responseId
 */
router.get('/assessment/:responseId', async (req, res) => {
  try {
    const { responseId } = req.params;
    
    if (!responseId) {
      return res.status(400).json({ error: 'Response ID is required' });
    }

    console.log('Generating PDF for assessment:', responseId);
    await AssessmentPdfService.generateAssessmentReport(responseId, res);
  } catch (error) {
    console.error('Assessment PDF export error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to export assessment report' });
    }
  }
});

/**
 * Export use case library as PDF
 * GET /api/export/library?category=all&status=active
 */
router.get('/library', async (req, res) => {
  try {
    const { category = 'all', status = 'all' } = req.query;
    
    await UseCasePdfService.generateLibraryCatalog(res, {
      category: category as string,
      status: status as string,
    });
  } catch (error) {
    console.error('Library PDF export error:', error);
    res.status(500).json({ error: 'Failed to export use case library' });
  }
});

/**
 * Export RSA active portfolio as PDF
 * GET /api/export/portfolio
 */
router.get('/portfolio', async (req, res) => {
  try {
    await UseCasePdfService.generatePortfolioReport(res);
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
 * Export blank questionnaire template as PDF
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
 * Export populated questionnaire with responses as PDF
 * GET /api/export/questionnaire/:responseId/responses
 */
router.get('/questionnaire/:responseId/responses', async (req, res) => {
  try {
    const { responseId } = req.params;
    
    if (!responseId) {
      return res.status(400).json({ error: 'Response ID is required' });
    }

    await QuestionnairePdfService.generatePopulatedQuestionnaire(responseId, res);
  } catch (error) {
    console.error('Questionnaire responses export error:', error);
    res.status(500).json({ error: 'Failed to export questionnaire responses' });
  }
});

export default router;