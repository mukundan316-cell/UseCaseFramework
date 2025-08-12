import { QuestionnaireStorageService, QuestionnaireDefinition, QuestionnaireResponse } from './questionnaireStorageService';
import { db } from '../db';
import { responseSessions } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

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
   * Get the most recent session for a questionnaire
   */
  async getMostRecentSession(questionnaireId: string): Promise<any> {
    try {
      const sessions = await db.select()
        .from(responseSessions)
        .where(eq(responseSessions.questionnaireId, questionnaireId))
        .orderBy(desc(responseSessions.startedAt))
        .limit(1);

      if (sessions.length === 0) {
        return null;
      }

      const session = sessions[0];
      
      // Load answers from blob storage
      let answers = null;
      try {
        const response = await this.storageService.getQuestionnaireResponse(session.id);
        answers = response?.answers;
      } catch (error) {
        console.log(`No answers found for session ${session.id}`);
      }

      return {
        ...session,
        answers
      };
    } catch (error) {
      console.error('Error getting most recent session:', error);
      return null;
    }
  }

  /**
   * Start a new response session
   */
  async startResponseSession(
    questionnaireId: string,
    respondentEmail: string,
    respondentName?: string
  ): Promise<string> {
    // Check if questionnaire exists, if not use defaults
    let questionnaire = await this.storageService.getQuestionnaireDefinition(questionnaireId);
    let questionnaireVersion = '2.0.0';
    let totalQuestions = 45; // Default based on our Survey.js questionnaire
    
    if (questionnaire) {
      questionnaireVersion = questionnaire.version || '2.0.0';
      console.log('Questionnaire loaded:', { id: questionnaire.id, hasPages: !!questionnaire.pages, hasSections: !!questionnaire.sections });
      
      // Count total questions from Survey.js pages format
      if (questionnaire.pages && Array.isArray(questionnaire.pages)) {
        // Survey.js format - count questions from pages
        totalQuestions = this.countQuestionsFromSurveyJsPages(questionnaire.pages);
        console.log('Counted questions from Survey.js pages:', totalQuestions);
      } else if (questionnaire.sections && Array.isArray(questionnaire.sections)) {
        // Legacy format - count questions from sections
        totalQuestions = questionnaire.sections.reduce((total: number, section: any) => {
          return total + (section.questions ? section.questions.length : 0);
        }, 0);
        console.log('Counted questions from legacy sections:', totalQuestions);
      } else {
        console.log('Questionnaire format not recognized, using default count');
      }
    } else {
      console.log(`Questionnaire ${questionnaireId} not found, using defaults`);
    }

    const sessionId = this.storageService.generateResponseId();

    // Create session in PostgreSQL for tracking
    await db.insert(responseSessions).values({
      id: sessionId,
      questionnaireId,
      respondentEmail,
      respondentName: respondentName || null,
      status: 'started',
      questionnaireDefinitionPath: `/questionnaires/${questionnaireId}.json`,
      questionnaireVersion,
      totalQuestions,
    });

    // Create empty response in blob storage
    const emptyResponse: QuestionnaireResponse = {
      id: sessionId,
      questionnaireId,
      questionnaireVersion,
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
   * Count questions from Survey.js pages format
   */
  protected countQuestionsFromSurveyJsPages(pages: any[]): number {
    let totalQuestions = 0;
    
    const countElementsRecursively = (elements: any[]): void => {
      elements.forEach((element: any) => {
        if (element.type === 'panel' && element.elements) {
          // Recursively count in panels
          countElementsRecursively(element.elements);
        } else if (this.isQuestionElement(element)) {
          totalQuestions++;
        }
      });
    };

    pages.forEach((page: any) => {
      if (page.elements) {
        countElementsRecursively(page.elements);
      }
    });

    return totalQuestions;
  }

  /**
   * Check if element is a question (not just a container)
   */
  protected isQuestionElement(element: any): boolean {
    const questionTypes = ['text', 'radiogroup', 'checkbox', 'rating', 'comment', 'dropdown', 'boolean'];
    return questionTypes.includes(element.type);
  }

  /**
   * Save multiple answers to a response
   */
  async saveResponseAnswers(
    responseId: string,
    answers: any
  ): Promise<boolean> {
    try {
      // Get current response
      const response = await this.storageService.getQuestionnaireResponse(responseId);
      if (!response) {
        console.error(`Response ${responseId} not found`);
        return false;
      }

      // Handle both array format (legacy) and object format (Survey.js)
      const formattedAnswers: Array<{ questionId: string; answerValue: any }> = [];
      
      if (Array.isArray(answers)) {
        answers.forEach((answer: any) => {
          if (answer.questionId && answer.answerValue !== undefined) {
            formattedAnswers.push({
              questionId: answer.questionId,
              answerValue: answer.answerValue
            });
          }
        });
      } else if (typeof answers === 'object' && answers !== null) {
        // Convert Survey.js object format to our Answer format
        Object.entries(answers).forEach(([questionId, answerValue]) => {
          if (questionId && answerValue !== undefined) {
            formattedAnswers.push({
              questionId,
              answerValue
            });
          }
        });
      }

      // Update answers in response
      formattedAnswers.forEach(({ questionId, answerValue }) => {
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
      });

      // Update response metadata
      response.lastUpdatedAt = new Date().toISOString();

      // Save updated response to blob storage
      await this.storageService.storeQuestionnaireResponse(response);

      // Update session progress in PostgreSQL
      const answeredQuestions = response.answers.length;
      
      // Get questionnaire to calculate progress
      const questionnaire = await this.storageService.getQuestionnaireDefinition(response.questionnaireId);
      const totalQuestions = questionnaire ? 
        questionnaire.sections.reduce((total, section) => total + section.questions.length, 0) : 1;
      const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);

      await db
        .update(responseSessions)
        .set({
          answeredQuestions,
          progressPercent,
          lastUpdatedAt: new Date(),
          status: progressPercent === 100 ? 'completed' : 'in_progress',
          responsePath: `/responses/${responseId}/response.json`
        })
        .where(eq(responseSessions.id, responseId));

      return true;
    } catch (error) {
      console.error('Failed to save answers:', error);
      return false;
    }
  }

  /**
   * Get response with answers
   */
  async getResponse(responseId: string): Promise<QuestionnaireResponse | null> {
    try {
      return await this.storageService.getQuestionnaireResponse(responseId);
    } catch (error) {
      console.error('Failed to get response:', error);
      return null;
    }
  }

  /**
   * Save answer to a question (legacy method)
   */
  async saveAnswer(
    responseId: string,
    questionId: string,
    answerValue: any
  ): Promise<boolean> {
    return this.saveResponseAnswers(responseId, [{ questionId, answerValue }]);
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