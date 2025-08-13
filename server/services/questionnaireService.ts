import { QuestionnaireStorageService, QuestionnaireDefinition, QuestionnaireResponse } from './questionnaireStorageService';
import { db } from '../db';
import { responseSessions } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * Main service for questionnaire operations
 * Clean blob-first architecture with no legacy PostgreSQL dependencies
 * Features simple in-memory caching for questionnaire definitions
 */
export class QuestionnaireService {
  private storageService: QuestionnaireStorageService;
  private definitionCache: Map<string, QuestionnaireDefinition> = new Map();

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

    // Cache the newly created questionnaire
    this.definitionCache.set(questionnaireWithId.id, questionnaireWithId);
    console.log(`Cached newly created questionnaire definition: ${questionnaireWithId.id}`);

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
   * Start a new response session or return existing incomplete session
   */
  async startResponseSession(
    questionnaireId: string,
    respondentEmail: string,
    respondentName?: string
  ): Promise<string> {
    // Check for existing sessions with same email and questionnaire
    const existingSessions = await db.select()
      .from(responseSessions)
      .where(
        and(
          eq(responseSessions.questionnaireId, questionnaireId),
          eq(responseSessions.respondentEmail, respondentEmail)
        )
      )
      .orderBy(desc(responseSessions.startedAt));

    // If there's an existing session, handle based on status
    if (existingSessions.length > 0) {
      const latestSession = existingSessions[0];
      
      if (latestSession.status === 'completed') {
        // User has completed assessment, redirect them to results
        throw new Error(`COMPLETED_SESSION:${latestSession.id}`);
      } else {
        // Return existing incomplete session
        console.log(`Returning existing session ${latestSession.id} for ${respondentEmail}`);
        return latestSession.id;
      }
    }

    // Check if questionnaire exists, if not use defaults
    let questionnaire = await this.storageService.getQuestionnaireDefinition(questionnaireId);
    let questionnaireVersion = '2.0.0';
    let totalQuestions = 45; // Default based on our Survey.js questionnaire
    
    if (questionnaire) {
      questionnaireVersion = questionnaire.version || '2.0.0';
      console.log('Questionnaire loaded:', { id: questionnaire.id, hasPages: !!questionnaire.pages });
      
      // Count total questions from Survey.js pages format only
      if (questionnaire.pages && Array.isArray(questionnaire.pages)) {
        totalQuestions = this.countQuestionsFromSurveyJsPages(questionnaire.pages);
        console.log('Counted questions from Survey.js pages:', totalQuestions);
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
   * Check if element is a question (not just a container)
   */
  private isQuestionElement(element: any): boolean {
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

      // Handle Survey.js object format only
      const formattedAnswers: Array<{ questionId: string; answerValue: any }> = [];
      
      if (typeof answers === 'object' && answers !== null && !Array.isArray(answers)) {
        // Convert Survey.js object format to our Answer format
        Object.entries(answers).forEach(([questionId, answerValue]) => {
          if (questionId && answerValue !== undefined) {
            formattedAnswers.push({
              questionId,
              answerValue
            });
          }
        });
      } else {
        console.error('Invalid answers format. Expected Survey.js object format.');
        return false;
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
      
      // Calculate total questions from Survey.js pages format only
      let totalQuestions = 45; // Default fallback
      if (questionnaire && questionnaire.pages && questionnaire.pages.length > 0) {
        totalQuestions = this.countQuestionsFromSurveyJsPages(questionnaire.pages);
      }
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
   * Reset a response session - clear all answers and restart
   */
  async resetResponseSession(responseId: string): Promise<boolean> {
    try {
      // Get current response to preserve metadata
      const response = await this.storageService.getQuestionnaireResponse(responseId);
      if (!response) {
        console.error(`Response ${responseId} not found`);
        return false;
      }

      // Reset response data while keeping session metadata
      const resetResponse: QuestionnaireResponse = {
        ...response,
        status: 'started',
        lastUpdatedAt: new Date().toISOString(),
        answers: [],
        completedAt: undefined
      };

      // Save reset response to blob storage
      await this.storageService.storeQuestionnaireResponse(resetResponse);

      // Reset session progress in PostgreSQL
      await db
        .update(responseSessions)
        .set({
          answeredQuestions: 0,
          progressPercent: 0,
          lastUpdatedAt: new Date(),
          status: 'started',
          completedAt: null,
          currentSectionId: null,
          currentQuestionId: null
        })
        .where(eq(responseSessions.id, responseId));

      console.log(`Reset session ${responseId} successfully`);
      return true;
    } catch (error) {
      console.error('Failed to reset response session:', error);
      return false;
    }
  }

  /**
   * Get questionnaire definition by ID with caching
   */
  async getQuestionnaireDefinition(questionnaireId: string): Promise<QuestionnaireDefinition | null> {
    // Check cache first
    if (this.definitionCache.has(questionnaireId)) {
      console.log(`Cache hit for questionnaire definition: ${questionnaireId}`);
      return this.definitionCache.get(questionnaireId)!;
    }

    // Cache miss - load from storage
    console.log(`Cache miss for questionnaire definition: ${questionnaireId}, loading from storage`);
    const definition = await this.storageService.getQuestionnaireDefinition(questionnaireId);
    
    // Store in cache if found
    if (definition) {
      this.definitionCache.set(questionnaireId, definition);
      console.log(`Cached questionnaire definition: ${questionnaireId}`);
    }
    
    return definition;
  }

  /**
   * Clear cache for a specific questionnaire definition
   */
  clearDefinitionCache(questionnaireId: string): void {
    this.definitionCache.delete(questionnaireId);
    console.log(`Cleared cache for questionnaire definition: ${questionnaireId}`);
  }

  /**
   * Get all sections (definition IDs with titles and question counts)
   * This replaces the artificial section grouping with real definition-based sections
   */
  async getAllSections(): Promise<Array<{id: string; title: string; questions: number}>> {
    try {
      // Get all definition IDs by scanning the questionnaire storage folder
      const definitionIds = await this.storageService.getAllDefinitionIds();
      
      if (definitionIds.length === 0) {
        return [];
      }

      // Load all definitions in parallel
      const definitionPromises = definitionIds.map(async (id) => {
        try {
          const definition = await this.getQuestionnaireDefinition(id);
          if (!definition) {
            return null;
          }

          // Count first-level elements (panels/questions) per page
          let questionCount = 0;
          if (definition.pages) {
            definition.pages.forEach((page: any) => {
              if (page.elements) {
                questionCount += page.elements.length; // Count all first-level elements
              }
            });
          }

          return {
            id: id, // Use the folder name as ID
            title: definition.title || 'Untitled Section',
            questions: questionCount
          };
        } catch (error) {
          console.error(`Failed to load definition ${id}:`, error);
          return null; // Skip corrupted definitions
        }
      });

      // Wait for all promises and filter out null results
      const sections = await Promise.all(definitionPromises);
      return sections.filter((section): section is {id: string; title: string; questions: number} => section !== null);

    } catch (error) {
      console.error('Failed to get all sections:', error);
      return [];
    }
  }

  /**
   * Clear all definition cache
   */
  clearAllDefinitionCache(): void {
    this.definitionCache.clear();
    console.log('Cleared all questionnaire definition cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.definitionCache.size,
      keys: Array.from(this.definitionCache.keys())
    };
  }

  /**
   * Count questions from Survey.js pages format (unified method)
   */
  private countQuestionsFromSurveyJsPages(pages: any[]): number {
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
   * Get all response sessions lightweight from PostgreSQL (duplicate method)
   */
  async getAllSessionsLegacy(): Promise<any[]> {
    return await db.select().from(responseSessions);
  }
}

// Export singleton instance for shared cache
export const questionnaireServiceInstance = new QuestionnaireService();