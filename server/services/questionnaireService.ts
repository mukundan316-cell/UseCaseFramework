import { QuestionnaireStorageService, QuestionnaireDefinition, QuestionnaireResponse } from './questionnaireStorageService';
import { db } from '../db';
import { responseSessions } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Main service for questionnaire operations
 * Clean blob-first architecture with no legacy PostgreSQL dependencies
 */
export class QuestionnaireService {
  private storageService: QuestionnaireStorageService;

  constructor() {
    this.storageService = new QuestionnaireStorageService();
  }

  /**
   * Create a new questionnaire definition
   */
  async createQuestionnaire(questionnaire: Omit<QuestionnaireDefinition, 'id' | 'createdAt'>): Promise<{
    questionnaire: QuestionnaireDefinition;
    storagePath: string;
  }> {
    const questionnaireWithId: QuestionnaireDefinition = {
      ...questionnaire,
      id: this.storageService.generateQuestionnaireId(),
      createdAt: new Date().toISOString(),
    };

    const storagePath = await this.storageService.storeQuestionnaireDefinition(questionnaireWithId);

    return {
      questionnaire: questionnaireWithId,
      storagePath
    };
  }

  /**
   * Start a new response session
   */
  async startResponseSession(
    questionnaireId: string,
    respondentEmail: string,
    respondentName?: string
  ): Promise<string> {
    // Use dummy questionnaire for now since we don't have questionnaire definitions yet
    const sessionId = this.storageService.generateResponseId();

    // Create session in PostgreSQL for tracking
    await db.insert(responseSessions).values({
      id: sessionId,
      questionnaireId,
      respondentEmail,
      respondentName: respondentName || null,
      status: 'started',
      questionnaireDefinitionPath: `/questionnaires/${questionnaireId}.json`,
      questionnaireVersion: '2.0.0',
      totalQuestions: 52,
    });

    // Create empty response in blob storage
    const emptyResponse: QuestionnaireResponse = {
      id: sessionId,
      questionnaireId,
      questionnaireVersion: '2.0.0',
      respondentEmail,
      respondentName,
      status: 'started',
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      answers: []
    };

    await this.storageService.storeQuestionnaireResponse(emptyResponse);

    return sessionId;
  }

  /**
   * Save answer to a question
   */
  async saveAnswer(
    responseId: string,
    questionId: string,
    answerValue: any
  ): Promise<boolean> {
    try {
      // Update answer in blob storage
      const success = await this.storageService.updateResponseAnswer(responseId, questionId, answerValue);
      
      if (!success) {
        return false;
      }

      // Update session progress in PostgreSQL
      const response = await this.storageService.getQuestionnaireResponse(responseId);
      if (response) {
        const answeredQuestions = response.answers.length;
        
        // Get questionnaire to calculate progress
        const questionnaire = await this.storageService.getQuestionnaireDefinition(response.questionnaireId);
        const totalQuestions = questionnaire?.questions.length || 1;
        const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);

        await db
          .update(responseSessions)
          .set({
            answeredQuestions,
            progressPercent,
            lastUpdatedAt: new Date(),
            status: progressPercent === 100 ? 'completed' : 'in_progress',
            responsePath: `/responses/${responseId}.json`
          })
          .where(eq(responseSessions.id, responseId));
      }

      return true;
    } catch (error) {
      console.error('Failed to save answer:', error);
      return false;
    }
  }

  /**
   * Complete a response session
   */
  async completeResponse(responseId: string): Promise<boolean> {
    try {
      // Mark response as completed in blob storage
      await this.storageService.completeResponse(responseId);

      // Update session status in PostgreSQL
      await db
        .update(responseSessions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          lastUpdatedAt: new Date(),
          progressPercent: 100
        })
        .where(eq(responseSessions.id, responseId));

      return true;
    } catch (error) {
      console.error('Failed to complete response:', error);
      return false;
    }
  }

  /**
   * Get questionnaire definition by ID
   */
  async getQuestionnaireDefinition(questionnaireId: string): Promise<QuestionnaireDefinition | null> {
    return await this.storageService.getQuestionnaireDefinition(questionnaireId);
  }

  /**
   * Get all questionnaire definitions
   */
  async getAllDefinitions(): Promise<QuestionnaireDefinition[]> {
    return await this.storageService.getAllDefinitions();
  }

  /**
   * Get questionnaire response by ID
   */
  async getQuestionnaireResponse(responseId: string): Promise<QuestionnaireResponse | null> {
    return await this.storageService.getQuestionnaireResponse(responseId);
  }

  /**
   * Get all response sessions from PostgreSQL
   */
  async getAllSessions() {
    return await db.select().from(responseSessions).orderBy(desc(responseSessions.startedAt));
  }

  /**
   * Get specific session by ID
   */
  async getSession(sessionId: string) {
    const sessions = await db.select().from(responseSessions).where(eq(responseSessions.id, sessionId));
    return sessions[0] || null;
  }

  /**
   * Get stats for questionnaire system
   */
  async getStats() {
    try {
      const totalSessions = await db.select().from(responseSessions);
      const completedSessions = totalSessions.filter(s => s.status === 'completed');
      const inProgressSessions = totalSessions.filter(s => s.status === 'in_progress');
      
      return {
        totalSessions: totalSessions.length,
        completedSessions: completedSessions.length,
        inProgressSessions: inProgressSessions.length,
        averageCompletionRate: totalSessions.length > 0 ? (completedSessions.length / totalSessions.length) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Get questionnaire definition (alias method)
   */
  async getDefinition(questionnaireId: string) {
    return await this.getQuestionnaireDefinition(questionnaireId);
  }

  /**
   * Get questionnaire response (alias method)
   */
  async getResponse(responseId: string) {
    return await this.getQuestionnaireResponse(responseId);
  }

  /**
   * Generate response ID (alias method)
   */
  generateResponseId() {
    return this.storageService.generateResponseId();
  }

  /**
   * Get response with questionnaire data
   */
  async getResponseWithQuestionnaire(responseId: string): Promise<{
    response: QuestionnaireResponse;
    questionnaire: QuestionnaireDefinition;
  } | null> {
    try {
      const response = await this.storageService.getQuestionnaireResponse(responseId);
      if (!response) {
        return null;
      }

      const questionnaire = await this.storageService.getQuestionnaireDefinition(response.questionnaireId);
      if (!questionnaire) {
        return null;
      }

      return { response, questionnaire };
    } catch (error) {
      console.error('Failed to get response with questionnaire:', error);
      return null;
    }
  }

  /**
   * Get all response sessions (lightweight from PostgreSQL)
   */
  async getAllSessions(): Promise<any[]> {
    return await db.select().from(responseSessions);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<any | null> {
    const [session] = await db
      .select()
      .from(responseSessions)
      .where(eq(responseSessions.id, sessionId));

    return session || null;
  }
}