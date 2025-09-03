import express from 'express';
import multer from 'multer';
import { localFileService } from '../services/localFileService';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  dest: '/tmp/presentations',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    try {
      // Use local file service validation
      localFileService.validatePresentationFile(file);
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
      // Process presentation using local file service
      const result = await localFileService.processPresentation(
        file.path,
        file.originalname,
        file.mimetype
      );
      
      // Clean up temporary file
      await localFileService.cleanupTempFile(file.path);
      
      res.json({
        success: true,
        ...result,
      });
      
    } catch (processingError) {
      console.error('Upload/conversion error:', processingError);
      
      // Clean up temporary file on error
      await localFileService.cleanupTempFile(file.path);
      
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
 * Serve file from database by file ID
 */
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log(`📄 Serving file from local storage: ${fileId}`);
    
    const fileData = await localFileService.getFileFromLocal(fileId);
    
    if (!fileData) {
      console.error(`File not found: ${fileId}`);
      return res.status(404).json({ error: 'File not found' });
    }
    
    console.log(`📄 Serving file: ${fileData.mimeType}, size: ${fileData.fileSize}`);
    
    // Set appropriate headers for file streaming and iframe embedding
    res.set({
      'Content-Type': fileData.mimeType || 'application/octet-stream',
      'Content-Length': fileData.fileSize.toString(),
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': '*',
      'Content-Disposition': 'inline',
      'X-Frame-Options': 'ALLOWALL'
    });
    
    // Send the file buffer
    res.send(fileData.buffer);
    
  } catch (error) {
    console.error('Error serving file from local storage:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to serve file', details: error instanceof Error ? error.message : 'Unknown error' });
    }
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