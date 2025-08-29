/**
 * Migration script to move existing Google Cloud Storage files to PostgreSQL database
 * This ensures all existing presentation files continue to work after the migration
 */

import { db } from '../db';
import { useCases, fileAttachments } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucketName) {
  throw new Error('DEFAULT_OBJECT_STORAGE_BUCKET_ID environment variable is required');
}
const bucket = storage.bucket(bucketName);

async function downloadFileFromGCS(url: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  console.log(`📥 Downloading from GCS: ${url}`);
  
  // Parse the Google Cloud Storage URL
  const urlParts = url.replace('https://storage.googleapis.com/', '').split('/');
  const bucketName = urlParts[0];
  const objectPath = urlParts.slice(1).join('/');
  
  const file = bucket.file(objectPath);
  
  // Check if file exists
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found: ${bucketName}/${objectPath}`);
  }
  
  // Get file metadata
  const [metadata] = await file.getMetadata();
  
  // Download file
  const [buffer] = await file.download();
  
  // Extract filename from object path
  const fileName = objectPath.split('/').pop() || 'unknown_file';
  
  return {
    buffer,
    mimeType: metadata.contentType || 'application/octet-stream',
    fileName
  };
}

async function storeFileInDatabase(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  fileType: 'presentation' | 'pdf',
  useCaseId: string
): Promise<string> {
  console.log(`💾 Storing in database: ${fileName}`);
  
  const fileData = buffer.toString('base64');
  const fileSize = buffer.length;
  
  const insertResult = await db.insert(fileAttachments).values({
    useCaseId,
    fileName,
    originalName: fileName,
    mimeType,
    fileSize,
    fileData,
    fileType,
  }).returning();
  
  const insertedFile = Array.isArray(insertResult) ? insertResult[0] : insertResult;
  return insertedFile.id;
}

export async function migrateFilesToDatabase(): Promise<void> {
  console.log('🚀 Starting file migration from Google Cloud Storage to PostgreSQL...');
  
  try {
    // Find all use cases with presentation URLs
    const useCasesWithFiles = await db.select().from(useCases).where(
      sql`presentation_url IS NOT NULL OR presentation_pdf_url IS NOT NULL`
    );
    
    console.log(`📋 Found ${useCasesWithFiles.length} use cases with presentation files`);
    
    for (const useCase of useCasesWithFiles) {
      console.log(`\n🔄 Processing use case: ${useCase.title}`);
      
      let presentationFileId: string | null = null;
      let presentationPdfFileId: string | null = null;
      
      try {
        // Migrate presentation file
        if (useCase.presentationUrl && !useCase.presentationFileId) {
          try {
            const fileData = await downloadFileFromGCS(useCase.presentationUrl);
            presentationFileId = await storeFileInDatabase(
              fileData.buffer,
              fileData.fileName,
              fileData.mimeType,
              'presentation',
              useCase.id
            );
            console.log(`✅ Migrated presentation file: ${fileData.fileName}`);
          } catch (error) {
            console.error(`❌ Failed to migrate presentation file: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Migrate PDF file
        if (useCase.presentationPdfUrl && !useCase.presentationPdfFileId) {
          try {
            const fileData = await downloadFileFromGCS(useCase.presentationPdfUrl);
            presentationPdfFileId = await storeFileInDatabase(
              fileData.buffer,
              fileData.fileName,
              fileData.mimeType,
              'pdf',
              useCase.id
            );
            console.log(`✅ Migrated PDF file: ${fileData.fileName}`);
          } catch (error) {
            console.error(`❌ Failed to migrate PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Update use case with new file IDs
        if (presentationFileId || presentationPdfFileId) {
          await db.update(useCases).set({
            presentationFileId: presentationFileId || useCase.presentationFileId,
            presentationPdfFileId: presentationPdfFileId || useCase.presentationPdfFileId,
          }).where(eq(useCases.id, useCase.id));
          
          console.log(`✅ Updated use case with database file references`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing use case ${useCase.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue with other use cases
      }
    }
    
    console.log('\n🎉 File migration completed successfully!');
    console.log('📝 Legacy URLs are preserved for backward compatibility');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// If run directly - ES module check
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateFilesToDatabase()
    .then(() => {
      console.log('Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}