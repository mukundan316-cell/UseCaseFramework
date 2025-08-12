import { ObjectStorageService } from '../objectStorage';
import { randomUUID } from 'crypto';

export interface QuestionDefinition {
  id: string;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  questionOrder: number;
  helpText?: string;
  questionData?: Record<string, any>;
  subQuestions?: any[];
  displayCondition?: string;
  scoringCategory?: string;
  sectionId: string;
  subsectionId?: string;
}

export interface QuestionnaireDefinition {
  id: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  sections: Array<{
    id: string;
    title: string;
    sectionOrder: number;
    subsections?: Array<{
      id: string;
      title: string;
      subsectionOrder: number;
    }>;
  }>;
  questions: QuestionDefinition[];
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  questionnaireVersion: string;
  respondentEmail: string;
  respondentName?: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  answers: Array<{
    questionId: string;
    answerValue: any;
    answeredAt: string;
  }>;
  metadata?: Record<string, any>;
}

export class QuestionnaireStorageService {
  private objectStorage: ObjectStorageService;
  private questionnairesPath = 'questionnaires';
  private responsesPath = 'responses';

  constructor() {
    this.objectStorage = new ObjectStorageService();
  }

  /**
   * Store questionnaire definition as JSON blob
   */
  async storeQuestionnaireDefinition(questionnaire: QuestionnaireDefinition): Promise<string> {
    const fileName = `${questionnaire.id}.json`;
    const filePath = `${this.questionnairesPath}/${fileName}`;
    const jsonContent = JSON.stringify(questionnaire, null, 2);
    
    // Store in private object storage
    const objectPath = await this.uploadJsonFile(filePath, jsonContent);
    
    console.log(`Questionnaire definition stored: ${objectPath}`);
    return objectPath;
  }

  /**
   * Retrieve questionnaire definition from JSON blob
   */
  async getQuestionnaireDefinition(questionnaireId: string): Promise<QuestionnaireDefinition | null> {
    try {
      const fileName = `${questionnaireId}.json`;
      const filePath = `${this.questionnairesPath}/${fileName}`;
      const jsonContent = await this.downloadJsonFile(filePath);
      
      if (!jsonContent) {
        return null;
      }

      return JSON.parse(jsonContent) as QuestionnaireDefinition;
    } catch (error) {
      console.error('Failed to retrieve questionnaire definition:', error);
      return null;
    }
  }

  /**
   * Store questionnaire response as JSON blob
   */
  async storeQuestionnaireResponse(response: QuestionnaireResponse): Promise<string> {
    const filePath = `${this.responsesPath}/${response.id}/response.json`;
    const jsonContent = JSON.stringify(response, null, 2);
    
    // Store in private object storage
    const objectPath = await this.uploadJsonFile(filePath, jsonContent);
    
    console.log(`Questionnaire response stored: ${objectPath}`);
    return objectPath;
  }

  /**
   * Retrieve questionnaire response from JSON blob
   */
  async getQuestionnaireResponse(responseId: string): Promise<QuestionnaireResponse | null> {
    try {
      const filePath = `${this.responsesPath}/${responseId}/response.json`;
      const jsonContent = await this.downloadJsonFile(filePath);
      
      if (!jsonContent) {
        return null;
      }

      return JSON.parse(jsonContent) as QuestionnaireResponse;
    } catch (error) {
      console.error('Failed to retrieve questionnaire response:', error);
      return null;
    }
  }

  /**
   * Update specific answer in questionnaire response
   */
  async updateResponseAnswer(
    responseId: string, 
    questionId: string, 
    answerValue: any
  ): Promise<boolean> {
    try {
      const response = await this.getQuestionnaireResponse(responseId);
      if (!response) {
        return false;
      }

      // Find existing answer or create new one
      const existingAnswerIndex = response.answers.findIndex(a => a.questionId === questionId);
      const answer = {
        questionId,
        answerValue,
        answeredAt: new Date().toISOString()
      };

      if (existingAnswerIndex >= 0) {
        response.answers[existingAnswerIndex] = answer;
      } else {
        response.answers.push(answer);
      }

      // Store updated response
      await this.storeQuestionnaireResponse(response);
      return true;
    } catch (error) {
      console.error('Failed to update response answer:', error);
      return false;
    }
  }

  /**
   * Mark response as completed
   */
  async completeResponse(responseId: string): Promise<boolean> {
    try {
      const response = await this.getQuestionnaireResponse(responseId);
      if (!response) {
        return false;
      }

      response.status = 'completed';
      response.completedAt = new Date().toISOString();

      await this.storeQuestionnaireResponse(response);
      return true;
    } catch (error) {
      console.error('Failed to complete response:', error);
      return false;
    }
  }

  /**
   * Migrate existing questionnaire from PostgreSQL to JSON storage
   */
  async migrateQuestionnaireFromDB(questionnaireId: string): Promise<string | null> {
    try {
      // This would fetch from existing DB and convert to JSON format
      // Implementation depends on your current DB structure
      console.log(`Migrating questionnaire ${questionnaireId} from DB to JSON storage`);
      
      // Placeholder - you'd implement the actual migration logic here
      return null;
    } catch (error) {
      console.error('Failed to migrate questionnaire:', error);
      return null;
    }
  }

  /**
   * List all questionnaire versions
   */
  async listQuestionnaireVersions(questionnaireId: string): Promise<string[]> {
    try {
      // In a real implementation, you might store multiple versions
      const definition = await this.getQuestionnaireDefinition(questionnaireId);
      return definition ? [definition.version] : [];
    } catch (error) {
      console.error('Failed to list questionnaire versions:', error);
      return [];
    }
  }

  /**
   * Backup response data with timestamp
   */
  async backupResponse(responseId: string): Promise<string | null> {
    try {
      const response = await this.getQuestionnaireResponse(responseId);
      if (!response) {
        return null;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${this.responsesPath}/${responseId}/backups/response-${timestamp}.json`;
      const jsonContent = JSON.stringify(response, null, 2);
      
      return await this.uploadJsonFile(backupPath, jsonContent);
    } catch (error) {
      console.error('Failed to backup response:', error);
      return null;
    }
  }

  /**
   * Private helper: Upload JSON file to object storage
   */
  private async uploadJsonFile(filePath: string, jsonContent: string): Promise<string> {
    // Get upload URL for the file
    const uploadUrl = await this.objectStorage.getObjectEntityUploadURL();
    
    // Write content directly to file system (development approach)
    await this.objectStorage.writeFile(uploadUrl, jsonContent);

    // Return the normalized object path
    return this.objectStorage.normalizeObjectEntityPath(uploadUrl);
  }

  /**
   * Private helper: Download JSON file from object storage
   */
  private async downloadJsonFile(filePath: string): Promise<string | null> {
    try {
      // Convert file path to full storage path
      const fullPath = `file://${this.objectStorage.getPrivateObjectDir()}/${filePath}`;
      
      // Check if file exists
      if (!(await this.objectStorage.fileExists(fullPath))) {
        return null;
      }

      // Read file content
      return await this.objectStorage.readFile(fullPath);
    } catch (error) {
      console.error('Failed to download JSON file:', error);
      return null;
    }
  }

  /**
   * Generate new questionnaire response ID
   */
  generateResponseId(): string {
    return randomUUID();
  }

  /**
   * Generate new questionnaire ID
   */
  generateQuestionnaireId(): string {
    return randomUUID();
  }
}