import { Router } from 'express';
import { UseCasePdfService } from '../services/useCasePdfService';
import { EnhancedUseCasePdfService } from '../services/enhancedUseCasePdfService';
import { ExcelExportService } from '../services/excelExportService';
import { questionnaireServiceInstance } from '../services/questionnaireService';
// PDF services removed - using client-side Survey.js PDF export instead

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
 * Questionnaire PDF exports are now handled client-side using Survey.js
 * These server-side routes are disabled in favor of browser-based PDF generation
 * which provides better compatibility with Survey.js formatting and features
 */
router.get('/questionnaire/:questionnaireId/template', async (req, res) => {
  res.status(501).json({ 
    error: 'Server-side PDF export disabled',
    message: 'Questionnaire PDF exports are now handled client-side using Survey.js for better compatibility'
  });
});

router.get('/questionnaire/:responseId/responses', async (req, res) => {
  res.status(501).json({ 
    error: 'Server-side PDF export disabled',
    message: 'Questionnaire PDF exports are now handled client-side using Survey.js for better compatibility'
  });
});

// =============================================================================
// EXCEL EXPORT ROUTES
// Comprehensive Excel exports with multiple worksheets and structured data
// =============================================================================

/**
 * Export use case library as Excel (Comprehensive Multi-Sheet Version)
 * GET /api/export/excel/library?category=all&status=all
 */
router.get('/excel/library', async (req, res) => {
  try {
    const { category = 'all', status = 'all' } = req.query;
    
    await ExcelExportService.generateUseCaseLibraryExcel(res, {
      category: category as string,
      status: status as string,
    });
  } catch (error) {
    console.error('Library Excel export error:', error);
    res.status(500).json({ error: 'Failed to export use case library to Excel' });
  }
});

/**
 * Export RSA active portfolio as Excel
 * GET /api/export/excel/portfolio
 */
router.get('/excel/portfolio', async (req, res) => {
  try {
    await ExcelExportService.generateActivePortfolioExcel(res);
  } catch (error) {
    console.error('Portfolio Excel export error:', error);
    res.status(500).json({ error: 'Failed to export portfolio to Excel' });
  }
});

/**
 * Export individual use case as Excel
 * GET /api/export/excel/use-case/:id
 */
router.get('/excel/use-case/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Use case ID is required' });
    }

    await ExcelExportService.generateIndividualUseCaseExcel(id, res);
  } catch (error) {
    console.error('Use case Excel export error:', error);
    res.status(500).json({ error: 'Failed to export use case to Excel' });
  }
});

export default router;