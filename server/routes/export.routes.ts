import { Router } from 'express';
import { UseCasePdfService } from '../services/useCasePdfService';
import { EnhancedUseCasePdfService } from '../services/enhancedUseCasePdfService';
import { CompactPdfService } from '../services/compactPdfService';
import { TabularPdfService } from '../services/tabularPdfService';
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
 * Export use case library as PDF (Tabular, Compact & Enhanced Versions)
 * GET /api/export/library?category=all&status=active&format=tabular
 */
router.get('/library', async (req, res) => {
  try {
    const { category = 'all', status = 'all', format = 'compact' } = req.query;
    
    if (format === 'tabular') {
      await TabularPdfService.generateTabularLibraryPdf(res, {
        category: category as string,
        status: status as string,
      });
    } else if (format === 'compact') {
      await CompactPdfService.generateCompactLibraryPdf(res, {
        category: category as string,
        status: status as string,
      });
    } else {
      await EnhancedUseCasePdfService.generateLibraryCatalog(res, {
        category: category as string,
        status: status as string,
      });
    }
  } catch (error) {
    console.error('Library PDF export error:', error);
    res.status(500).json({ error: 'Failed to export use case library' });
  }
});

/**
 * Export RSA active portfolio as PDF (Compact & Enhanced Versions)
 * GET /api/export/portfolio?format=compact
 */
router.get('/portfolio', async (req, res) => {
  try {
    const { format = 'compact' } = req.query;
    
    if (format === 'compact') {
      await CompactPdfService.generateCompactPortfolioPdf(res);
    } else {
      await EnhancedUseCasePdfService.generatePortfolioReport(res);
    }
  } catch (error) {
    console.error('Portfolio PDF export error:', error);
    res.status(500).json({ error: 'Failed to export portfolio report' });
  }
});

/**
 * Export individual use case as PDF (Compact & Enhanced Versions)
 * GET /api/export/use-case/:id?format=compact
 */
router.get('/use-case/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'compact' } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Use case ID is required' });
    }

    if (format === 'compact') {
      await CompactPdfService.generateCompactUseCasePdf(id, res);
    } else {
      await UseCasePdfService.generateUseCaseReport(id, res);
    }
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