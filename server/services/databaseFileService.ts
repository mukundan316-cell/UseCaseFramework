import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';
import { db } from '../db';
import { fileAttachments, useCases } from '@shared/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

export interface PresentationUploadResult {
  presentationFileId: string;
  presentationPdfFileId: string;
  presentationFileName: string;
}

export class DatabaseFileService {
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
   * Convert image to PDF using ImageMagick
   */
  async convertImageToPdf(inputPath: string, outputDir: string): Promise<string> {
    try {
      console.log(`🔄 Converting image to PDF: ${inputPath}`);
      
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Generate output PDF filename
      const inputName = path.basename(inputPath, path.extname(inputPath));
      const pdfPath = path.join(outputDir, `${inputName}.pdf`);
      
      // Use ImageMagick to convert image to PDF
      const command = `convert "${inputPath}" "${pdfPath}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('ImageMagick warning:', stderr);
      }
      
      // Check if PDF was created
      await fs.access(pdfPath);
      console.log(`✅ Image to PDF conversion successful: ${pdfPath}`);
      
      return pdfPath;
    } catch (error) {
      console.error('Image to PDF conversion failed:', error);
      throw new Error(`Failed to convert image to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store file in database as base64
   */
  async storeFileInDatabase(
    filePath: string, 
    originalName: string, 
    mimeType: string,
    fileType: 'presentation' | 'pdf' = 'presentation',
    useCaseId?: string
  ): Promise<string> {
    try {
      console.log(`💾 Storing file in database: ${originalName}`);
      
      // Read file and convert to base64
      const fileBuffer = await fs.readFile(filePath);
      const fileSize = fileBuffer.length;
      const fileData = fileBuffer.toString('base64');
      
      // Generate unique filename for storage
      const fileExtension = path.extname(originalName);
      const baseName = path.basename(originalName, fileExtension);
      const uniqueFileName = `${randomUUID()}_${baseName}${fileExtension}`;
      
      // Insert file into database
      const insertResult = await db.insert(fileAttachments).values({
        useCaseId,
        fileName: uniqueFileName,
        originalName,
        mimeType,
        fileSize,
        fileData,
        fileType,
      }).returning();
      
      const insertedFile = Array.isArray(insertResult) ? insertResult[0] : insertResult;
      console.log(`✅ File stored in database with ID: ${insertedFile.id}`);
      return insertedFile.id;
      
    } catch (error) {
      console.error('Database file storage failed:', error);
      throw new Error(`Failed to store file in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve file from database
   */
  async getFileFromDatabase(fileId: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    fileName: string;
    fileSize: number;
  } | null> {
    try {
      const [file] = await db.select().from(fileAttachments).where(eq(fileAttachments.id, fileId));
      
      if (!file) {
        return null;
      }
      
      // Convert base64 back to buffer
      const buffer = Buffer.from(file.fileData, 'base64');
      
      return {
        buffer,
        mimeType: file.mimeType,
        originalName: file.originalName,
        fileName: file.fileName,
        fileSize: file.fileSize,
      };
    } catch (error) {
      console.error('Failed to retrieve file from database:', error);
      throw new Error(`Failed to retrieve file from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process presentation with database storage
   */
  async processPresentation(
    filePath: string,
    originalName: string,
    mimeType: string,
    useCaseId?: string
  ): Promise<PresentationUploadResult> {
    
    try {
      console.log(`📁 Processing presentation for database storage: ${originalName}`);
      
      // Store original file in database
      const presentationFileId = await this.storeFileInDatabase(
        filePath,
        originalName,
        mimeType,
        'presentation',
        useCaseId
      );

      let presentationPdfFileId = '';

      // Convert to PDF if not already PDF
      if (mimeType !== 'application/pdf') {
        const tempDir = path.dirname(filePath);
        let pdfPath: string;
        
        // Determine conversion method based on file type
        if (mimeType.startsWith('image/')) {
          // Use ImageMagick for images
          pdfPath = await this.convertImageToPdf(filePath, tempDir);
        } else {
          // Use LibreOffice for PowerPoint files
          pdfPath = await this.convertToPdf(filePath, tempDir);
        }
        
        try {
          // Store PDF version in database
          const pdfOriginalName = path.basename(originalName, path.extname(originalName)) + '.pdf';
          presentationPdfFileId = await this.storeFileInDatabase(
            pdfPath,
            pdfOriginalName,
            'application/pdf',
            'pdf',
            useCaseId
          );
          
          // Clean up temporary PDF
          await fs.unlink(pdfPath);
        } catch (pdfStorageError) {
          // Clean up PDF file if storage fails
          try {
            await fs.unlink(pdfPath);
          } catch (cleanupError) {
            console.error('Failed to clean up PDF file:', cleanupError);
          }
          throw pdfStorageError;
        }
      } else {
        // If original is PDF, reference the same file for both
        presentationPdfFileId = presentationFileId;
      }

      return {
        presentationFileId,
        presentationPdfFileId,
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
   * Delete files from database
   */
  async deleteFiles(fileIds: string[]): Promise<void> {
    for (const fileId of fileIds) {
      if (fileId) {
        try {
          console.log(`🗑️ Deleting file from database: ${fileId}`);
          await db.delete(fileAttachments).where(eq(fileAttachments.id, fileId));
          console.log(`✅ Successfully deleted file: ${fileId}`);
        } catch (error) {
          console.error(`❌ Failed to delete file ${fileId}:`, error);
          // Don't throw - continue with other deletions
        }
      }
    }
  }

  /**
   * Validate presentation file
   */
  validatePresentationFile(file: Express.Multer.File): void {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      'application/pdf', // .pdf
      'image/jpeg', // .jpg, .jpeg
      'image/jpg', // .jpg
      'image/png', // .png
      'image/gif', // .gif
      'image/bmp', // .bmp
      'image/webp' // .webp
    ];

    const maxFileSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Please upload a PowerPoint, PDF, or image file.');
    }

    if (file.size > maxFileSize) {
      throw new Error('File size too large. Maximum size is 50MB.');
    }

    console.log(`✅ File validation passed: ${file.originalname} (${file.mimetype}, ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }
}

export const databaseFileService = new DatabaseFileService();