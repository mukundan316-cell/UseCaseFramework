import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

if (!bucketName) {
  throw new Error('DEFAULT_OBJECT_STORAGE_BUCKET_ID environment variable is required');
}

const bucket = storage.bucket(bucketName);

export interface PresentationUploadResult {
  presentationUrl: string;
  presentationPdfUrl: string;
  presentationFileName: string;
}

export class PresentationService {
  /**
   * Convert PowerPoint to PDF using LibreOffice
   */
  async convertToPdf(inputPath: string, outputDir: string): Promise<string> {
    try {
      console.log(`🔄 Converting PowerPoint to PDF: ${inputPath}`);
      
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Use LibreOffice headless mode to convert to PDF
      const command = `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('LibreOffice warning:', stderr);
      }
      
      // Generate expected PDF filename
      const inputName = path.basename(inputPath, path.extname(inputPath));
      const pdfPath = path.join(outputDir, `${inputName}.pdf`);
      
      // Check if PDF was created
      await fs.access(pdfPath);
      console.log(`✅ PDF conversion successful: ${pdfPath}`);
      
      return pdfPath;
    } catch (error) {
      console.error('PDF conversion failed:', error);
      throw new Error(`Failed to convert presentation to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload file to object storage
   */
  async uploadToStorage(filePath: string, fileName: string, contentType: string): Promise<string> {
    try {
      const destination = `presentations/${fileName}`;
      
      console.log(`📤 Uploading to object storage: ${destination}`);
      
      await bucket.upload(filePath, {
        destination,
        metadata: {
          contentType,
        },
      });
      
      // Return the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
      console.log(`✅ Upload successful: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Object storage upload failed:', error);
      throw new Error(`Failed to upload file to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process presentation upload: convert to PDF and upload both files
   */
  async processPresentation(
    filePath: string,
    originalName: string,
    mimeType: string
  ): Promise<PresentationUploadResult> {
    const fileId = randomUUID();
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    
    // Create unique filenames
    const originalFileName = `${fileId}_${baseName}${fileExtension}`;
    const pdfFileName = `${fileId}_${baseName}.pdf`;
    
    try {
      // Upload original file
      const presentationUrl = await this.uploadToStorage(
        filePath,
        originalFileName,
        mimeType
      );

      let presentationPdfUrl = '';

      // Convert to PDF if not already PDF
      if (mimeType !== 'application/pdf') {
        const tempDir = path.dirname(filePath);
        const pdfPath = await this.convertToPdf(filePath, tempDir);
        
        try {
          // Upload PDF version
          presentationPdfUrl = await this.uploadToStorage(
            pdfPath,
            pdfFileName,
            'application/pdf'
          );
          
          // Clean up temporary PDF
          await fs.unlink(pdfPath);
        } catch (pdfUploadError) {
          // Clean up PDF file if upload fails
          try {
            await fs.unlink(pdfPath);
          } catch (cleanupError) {
            console.error('Failed to clean up PDF file:', cleanupError);
          }
          throw pdfUploadError;
        }
      } else {
        // If original is PDF, use it for preview too
        presentationPdfUrl = presentationUrl;
      }

      return {
        presentationUrl,
        presentationPdfUrl,
        presentationFileName: originalName,
      };
    } catch (error) {
      console.error('Presentation processing failed:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`🧹 Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      console.error('Failed to clean up temporary file:', error);
      // Don't throw - cleanup errors shouldn't break the main flow
    }
  }

  /**
   * Validate presentation file
   */
  validatePresentationFile(file: Express.Multer.File): void {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      'application/pdf' // .pdf
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PowerPoint (.pptx, .ppt) and PDF files are allowed.');
    }

    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }
  }
}

// Export singleton instance
export const presentationService = new PresentationService();