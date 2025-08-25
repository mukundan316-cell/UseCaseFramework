import { Router } from 'express';
import multer from 'multer';
import { ExcelImportService } from '../services/excelImportService';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // Sometimes Excel files are detected as this
    ];
    
    // Also check file extension as backup
    const fileName = file.originalname.toLowerCase();
    const hasValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    console.log('File upload - Name:', file.originalname, 'MIME:', file.mimetype);
    
    if (allowedTypes.includes(file.mimetype) || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

/**
 * Upload and import use cases from Excel file
 * POST /api/import/excel/use-cases
 */
router.post('/excel/use-cases', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { mode = 'append', validateOnly = false } = req.body;
    
    if (!['append', 'replace'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be "append" or "replace"' });
    }

    // Import use cases from Excel
    const result = await ExcelImportService.importUseCasesFromExcel(
      req.file.buffer,
      { 
        mode: mode as 'append' | 'replace',
        validateOnly: validateOnly === 'true'
      }
    );

    if (result.success) {
      res.json({
        message: validateOnly ? 'Validation completed successfully' : 'Import completed successfully',
        ...result
      });
    } else {
      res.status(400).json({
        message: 'Import completed with errors',
        ...result
      });
    }

  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ 
      error: 'Failed to import Excel file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Validate Excel file without importing
 * POST /api/import/excel/validate
 */
router.post('/excel/validate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate only (don't import)
    const result = await ExcelImportService.importUseCasesFromExcel(
      req.file.buffer,
      { mode: 'append', validateOnly: true }
    );

    res.json({
      message: 'Validation completed',
      isValid: result.success,
      ...result
    });

  } catch (error) {
    console.error('Excel validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate Excel file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;