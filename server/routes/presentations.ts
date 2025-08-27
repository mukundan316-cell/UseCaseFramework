import express from 'express';
import multer from 'multer';
import { presentationService } from '../services/presentationService';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  dest: '/tmp/presentations',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    try {
      // Use presentation service validation
      presentationService.validatePresentationFile(file);
      cb(null, true);
    } catch (error) {
      cb(error instanceof Error ? error : new Error('File validation failed'));
    }
  }
});

/**
 * Upload presentation endpoint
 */
router.post('/upload', upload.single('presentation'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    console.log(`📁 Processing presentation upload: ${file.originalname}`);
    
    try {
      // Process presentation using service
      const result = await presentationService.processPresentation(
        file.path,
        file.originalname,
        file.mimetype
      );
      
      // Clean up temporary file
      await presentationService.cleanupTempFile(file.path);
      
      res.json({
        success: true,
        ...result,
      });
      
    } catch (processingError) {
      console.error('Upload/conversion error:', processingError);
      
      // Clean up temporary file on error
      await presentationService.cleanupTempFile(file.path);
      
      throw processingError;
    }
    
  } catch (error) {
    console.error('Presentation upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
});

/**
 * Get presentation metadata endpoint
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you'd fetch from database
    // For now, this is a placeholder
    res.json({
      id,
      // Add metadata fields as needed
    });
    
  } catch (error) {
    console.error('Get presentation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get presentation' 
    });
  }
});

export default router;