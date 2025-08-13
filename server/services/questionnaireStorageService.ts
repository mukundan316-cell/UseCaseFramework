import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

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
  // Survey.js format only
  pages: Array<any>;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  questionnaireVersion: string;
  respondentEmail: string;
  respondentName?: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  answers: Array<{
    questionId: string;
    answerValue: any;
    answeredAt: string;
  }>;
  metadata?: Record<string, any>;
}

export class QuestionnaireStorageService {
  private baseDir = path.join(process.cwd(), 'temp-questionnaire-storage');
  private questionnairesDir = path.join(this.baseDir, 'questionnaires');
  private responsesDir = path.join(this.baseDir, 'responses');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    if (!fs.existsSync(this.questionnairesDir)) {
      fs.mkdirSync(this.questionnairesDir, { recursive: true });
    }
    if (!fs.existsSync(this.responsesDir)) {
      fs.mkdirSync(this.responsesDir, { recursive: true });
    }
  }

  /**
   * Store questionnaire definition as JSON blob
   */
  async storeQuestionnaireDefinition(questionnaire: QuestionnaireDefinition): Promise<string> {
    const fileName = `${questionnaire.id}.json`;
    const filePath = path.join(this.questionnairesDir, fileName);
    const jsonContent = JSON.stringify(questionnaire, null, 2);
    
    // Store as file
    await fs.promises.writeFile(filePath, jsonContent, 'utf8');
    
    console.log(`Questionnaire definition stored: ${filePath}`);
    return filePath;
  }

  /**
   * Retrieve questionnaire definition from JSON blob
   */
  async getQuestionnaireDefinition(questionnaireId: string): Promise<QuestionnaireDefinition | null> {
    try {
      // Try both the old format (direct file) and new format (subdirectory)
      const directFilePath = path.join(this.questionnairesDir, `${questionnaireId}.json`);
      const subdirFilePath = path.join(this.questionnairesDir, questionnaireId, 'definition.json');
      
      let filePath: string;
      if (fs.existsSync(subdirFilePath)) {
        filePath = subdirFilePath;
      } else if (fs.existsSync(directFilePath)) {
        filePath = directFilePath;
      } else {
        return null;
      }

      const jsonContent = await fs.promises.readFile(filePath, 'utf8');
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
    const responseDir = path.join(this.responsesDir, response.id);
    const filePath = path.join(responseDir, 'response.json');
    const jsonContent = JSON.stringify(response, null, 2);
    
    // Ensure response directory exists
    if (!fs.existsSync(responseDir)) {
      fs.mkdirSync(responseDir, { recursive: true });
    }
    
    // Store as file
    await fs.promises.writeFile(filePath, jsonContent, 'utf8');
    
    console.log(`Questionnaire response stored: ${filePath}`);
    return filePath;
  }

  /**
   * Retrieve questionnaire response from JSON blob
   */
  async getQuestionnaireResponse(responseId: string): Promise<QuestionnaireResponse | null> {
    try {
      const filePath = path.join(this.responsesDir, responseId, 'response.json');
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const jsonContent = await fs.promises.readFile(filePath, 'utf8');
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
      const answerData = {
        questionId,
        answerValue,
        answeredAt: new Date().toISOString()
      };

      if (existingAnswerIndex >= 0) {
        response.answers[existingAnswerIndex] = answerData;
      } else {
        response.answers.push(answerData);
      }

      response.status = 'in_progress';
      
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
   * Generate unique questionnaire ID
   */
  generateQuestionnaireId(): string {
    return randomUUID();
  }

  /**
   * Generate unique response ID
   */
  generateResponseId(): string {
    return randomUUID();
  }

  /**
   * Get all definition IDs by scanning questionnaire folders
   */
  async getAllDefinitionIds(): Promise<string[]> {
    try {
      const entries = await fs.promises.readdir(this.questionnairesDir, { withFileTypes: true });
      // Return directory names as definition IDs
      return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    } catch (error) {
      console.error('Failed to get definition IDs:', error);
      return [];
    }
  }

  /**
   * Get all questionnaire definitions
   */
  async getAllDefinitions(): Promise<QuestionnaireDefinition[]> {
    try {
      const files = await fs.promises.readdir(this.questionnairesDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const definitions: QuestionnaireDefinition[] = [];
      
      for (const file of jsonFiles) {
        const filePath = path.join(this.questionnairesDir, file);
        try {
          const content = await fs.promises.readFile(filePath, 'utf8');
          const definition = JSON.parse(content) as QuestionnaireDefinition;
          definitions.push(definition);
        } catch (error) {
          console.error(`Failed to parse questionnaire file ${file}:`, error);
        }
      }
      
      return definitions;
    } catch (error) {
      console.error('Failed to get all definitions:', error);
      return [];
    }
  }
}