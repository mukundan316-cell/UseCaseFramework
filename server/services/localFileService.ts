import { promises as fs, existsSync, mkdirSync } from 'fs';
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

export class LocalFileService {
  private baseDir = path.join(process.cwd(), 'temp-presentation-storage');
  private presentationsDir = path.join(this.baseDir, 'presentations');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
    if (!existsSync(this.presentationsDir)) {
      mkdirSync(this.presentationsDir, { recursive: true });
    }
  }

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
   * Store file locally and save metadata to database
   */
  async storeFileLocally(
    filePath: string, 
    originalName: string, 
    mimeType: string,
    fileType: 'presentation' | 'pdf' = 'presentation',
    useCaseId?: string
  ): Promise<string> {
    try {
      console.log(`💾 Storing file locally: ${originalName}`);
      
      // Get file size
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;
      
      // Create use case directory if provided
      const storageDir = useCaseId 
        ? path.join(this.presentationsDir, useCaseId)
        : this.presentationsDir;
      
      await fs.mkdir(storageDir, { recursive: true });
      
      // Generate unique filename for storage
      const fileExtension = path.extname(originalName);
      const baseName = path.basename(originalName, fileExtension);
      const uniqueFileName = fileType === 'pdf' 
        ? `converted.pdf`
        : `original${fileExtension}`;
      
      // Local storage path
      const localPath = path.join(storageDir, uniqueFileName);
      const relativePath = path.relative(process.cwd(), localPath);
      
      // Copy file to local storage
      await fs.copyFile(filePath, localPath);
      
      // Insert metadata into database
      const insertResult = await db.insert(fileAttachments).values({
        useCaseId,
        fileName: uniqueFileName,
        originalName,
        mimeType,
        fileSize,
        localPath: relativePath,
        fileType,
      }).returning();
      
      const insertedFile = Array.isArray(insertResult) ? insertResult[0] : insertResult;
      console.log(`✅ File stored locally with ID: ${insertedFile.id} at ${relativePath}`);
      return insertedFile.id;
      
    } catch (error) {
      console.error('Local file storage failed:', error);
      throw new Error(`Failed to store file locally: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve file from local storage
   */
  async getFileFromLocal(fileId: string): Promise<{
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
      
      // Check if local_path is valid
      if (!file.localPath || file.localPath.trim() === '') {
        console.error(`File ${fileId} has no local path - this file was not properly stored`);
        throw new Error(`File not found locally - missing local path for file ${fileId}`);
      }
      
      // Read file from local storage
      const absolutePath = path.resolve(process.cwd(), file.localPath);
      const buffer = await fs.readFile(absolutePath);
      
      return {
        buffer,
        mimeType: file.mimeType,
        originalName: file.originalName,
        fileName: file.fileName,
        fileSize: file.fileSize,
      };
    } catch (error) {
      console.error('Failed to retrieve file from local storage:', error);
      throw new Error(`Failed to retrieve file from local storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process presentation with local file storage
   */
  async processPresentation(
    filePath: string,
    originalName: string,
    mimeType: string,
    useCaseId?: string
  ): Promise<PresentationUploadResult> {
    
    try {
      console.log(`📁 Processing presentation for local storage: ${originalName}`);
      
      // Store original file locally
      const presentationFileId = await this.storeFileLocally(
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
          // Store PDF version locally
          const pdfOriginalName = path.basename(originalName, path.extname(originalName)) + '.pdf';
          presentationPdfFileId = await this.storeFileLocally(
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
   * Delete files from local storage and database
   */
  async deleteFiles(fileIds: string[]): Promise<void> {
    for (const fileId of fileIds) {
      if (fileId) {
        try {
          console.log(`🗑️ Deleting file: ${fileId}`);
          
          // Get file metadata first
          const [file] = await db.select().from(fileAttachments).where(eq(fileAttachments.id, fileId));
          
          if (file && file.localPath) {
            // Delete from local storage
            const absolutePath = path.resolve(process.cwd(), file.localPath);
            try {
              await fs.unlink(absolutePath);
              console.log(`✅ Deleted local file: ${absolutePath}`);
            } catch (fileError) {
              console.warn(`Warning: Could not delete local file ${absolutePath}:`, fileError);
            }
          }
          
          // Delete metadata from database
          await db.delete(fileAttachments).where(eq(fileAttachments.id, fileId));
          console.log(`✅ Successfully deleted file metadata: ${fileId}`);
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

export const localFileService = new LocalFileService();

// Backward compatibility alias
export const databaseFileService = localFileService;