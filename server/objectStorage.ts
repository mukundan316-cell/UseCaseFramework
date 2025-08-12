import { promises as fs, createReadStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Simple file system-based object storage for development
// In production, this would integrate with Google Cloud Storage
export class ObjectStorageService {
  private basePath: string;

  constructor() {
    this.basePath = join(process.cwd(), 'temp-questionnaire-storage');
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  getPublicObjectSearchPaths(): Array<string> {
    return [join(this.basePath, 'public')];
  }

  getPrivateObjectDir(): string {
    return join(this.basePath, 'private');
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const fileName = `${randomUUID()}.json`;
    const filePath = join(this.basePath, 'private', fileName);
    
    // Ensure private directory exists
    await fs.mkdir(join(this.basePath, 'private'), { recursive: true });
    
    return `file://${filePath}`;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith('file://')) {
      return rawPath.replace('file:/', '/objects');
    }
    return rawPath;
  }

  async getObjectEntityFile(objectPath: string): Promise<any> {
    // Convert object path back to file path
    const filePath = objectPath.replace('/objects/', this.basePath + '/private/');
    
    return {
      createReadStream: () => {
        return createReadStream(filePath);
      },
      exists: async () => {
        try {
          await fs.access(filePath);
          return [true];
        } catch {
          return [false];
        }
      }
    };
  }

  // Helper methods for file system operations
  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = filePath.replace('file://', '');
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = filePath.replace('file://', '');
    return await fs.readFile(fullPath, 'utf-8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = filePath.replace('file://', '');
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}