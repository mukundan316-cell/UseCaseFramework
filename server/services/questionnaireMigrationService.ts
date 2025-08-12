import { db } from '../db';
import { 
  questions, 
  questionnaireSections, 
  questionnaireSubsections, 
  questionnaireResponses, 
  questionAnswers,
  responseSessions 
} from '../../shared/schema';
import { 
  QuestionnaireDefinition, 
  QuestionnaireResponse as JsonQuestionnaireResponse,
  QuestionDefinition,
  SectionDefinition,
  SubsectionDefinition
} from '../../shared/questionnaireTypes';
import { QuestionnaireStorageService } from './questionnaireStorageService';
import { eq, and } from 'drizzle-orm';

export class QuestionnaireMigrationService {
  private storageService: QuestionnaireStorageService;

  constructor() {
    this.storageService = new QuestionnaireStorageService();
  }

  /**
   * Migrate existing questionnaire from PostgreSQL to JSON blob storage
   */
  async migrateQuestionnaireToJson(questionnaireId: string): Promise<string | null> {
    try {
      console.log(`Starting migration of questionnaire ${questionnaireId} to JSON storage`);

      // 1. Fetch questionnaire structure from PostgreSQL
      const sections = await db
        .select()
        .from(questionnaireSections)
        .where(eq(questionnaireSections.questionnaireId, questionnaireId));

      if (sections.length === 0) {
        console.log('No sections found for questionnaire');
        return null;
      }

      // 2. Fetch subsections
      const subsections = await db
        .select()
        .from(questionnaireSubsections)
        .where(eq(questionnaireSubsections.sectionId, sections[0].id)); // Assuming single questionnaire

      // 3. Fetch all questions
      const allQuestions = await db
        .select()
        .from(questions);

      // 4. Transform to JSON structure
      const questionnaireDefinition: QuestionnaireDefinition = {
        id: questionnaireId,
        title: 'RSA AI Strategy Assessment Framework',
        description: 'Comprehensive assessment for AI readiness and use case prioritization',
        version: '1.0',
        createdAt: new Date().toISOString(),
        sections: sections.map(section => ({
          id: section.id,
          title: section.title,
          sectionOrder: section.sectionOrder,
          subsections: subsections
            .filter(sub => sub.sectionId === section.id)
            .map(sub => ({
              id: sub.id,
              title: sub.title,
              subsectionOrder: sub.subsectionOrder,
              sectionId: sub.sectionId
            }))
        })),
        questions: allQuestions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType as any,
          isRequired: q.isRequired === 'true',
          questionOrder: q.questionOrder,
          helpText: q.helpText || undefined,
          questionData: q.questionData || undefined,
          subQuestions: q.subQuestions ? JSON.parse(q.subQuestions) : undefined,
          displayCondition: q.displayCondition || undefined,
          scoringCategory: q.scoringCategory || undefined,
          sectionId: q.sectionId,
          subsectionId: q.subsectionId || undefined
        }))
      };

      // 5. Store in JSON blob storage
      const storagePath = await this.storageService.storeQuestionnaireDefinition(questionnaireDefinition);
      
      console.log(`Successfully migrated questionnaire to JSON storage: ${storagePath}`);
      return storagePath;

    } catch (error) {
      console.error('Failed to migrate questionnaire to JSON:', error);
      return null;
    }
  }

  /**
   * Migrate existing response from PostgreSQL to JSON blob storage
   */
  async migrateResponseToJson(responseId: string): Promise<string | null> {
    try {
      console.log(`Starting migration of response ${responseId} to JSON storage`);

      // 1. Fetch response from PostgreSQL
      const [response] = await db
        .select()
        .from(questionnaireResponses)
        .where(eq(questionnaireResponses.id, responseId));

      if (!response) {
        console.log('Response not found');
        return null;
      }

      // 2. Fetch all answers for this response
      const answers = await db
        .select()
        .from(questionAnswers)
        .where(eq(questionAnswers.responseId, responseId));

      // 3. Transform to JSON structure
      const jsonResponse: JsonQuestionnaireResponse = {
        id: responseId,
        questionnaireId: response.questionnaireId,
        questionnaireVersion: '1.0', // Default version
        respondentEmail: response.respondentEmail,
        respondentName: response.respondentName || undefined,
        status: response.status as any,
        startedAt: response.startedAt.toISOString(),
        lastUpdatedAt: response.completedAt?.toISOString() || response.startedAt.toISOString(),
        completedAt: response.completedAt?.toISOString(),
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          answerValue: this.parseAnswerValue(answer.answerValue),
          answeredAt: answer.answeredAt.toISOString()
        }))
      };

      // 4. Store in JSON blob storage
      const storagePath = await this.storageService.storeQuestionnaireResponse(jsonResponse);

      console.log(`Successfully migrated response to JSON storage: ${storagePath}`);
      return storagePath;

    } catch (error) {
      console.error('Failed to migrate response to JSON:', error);
      return null;
    }
  }

  /**
   * Create session tracking record for migrated response
   */
  async createSessionFromMigratedResponse(
    responseId: string, 
    questionnaireDefinitionPath: string, 
    responsePath: string
  ): Promise<boolean> {
    try {
      // Fetch original response data
      const [response] = await db
        .select()
        .from(questionnaireResponses)
        .where(eq(questionnaireResponses.id, responseId));

      if (!response) {
        return false;
      }

      // Count answers for progress calculation
      const answerCount = await db
        .select()
        .from(questionAnswers)
        .where(eq(questionAnswers.responseId, responseId));

      // Get total question count (assuming we know it's 52 from current system)
      const totalQuestions = 52;
      const answeredQuestions = answerCount.length;
      const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);

      // Create session record
      await db.insert(responseSessions).values({
        id: responseId,
        questionnaireId: response.questionnaireId,
        respondentEmail: response.respondentEmail,
        respondentName: response.respondentName || null,
        status: response.status as any,
        startedAt: response.startedAt,
        lastUpdatedAt: response.completedAt || response.startedAt,
        completedAt: response.completedAt || null,
        progressPercent,
        questionnaireDefinitionPath,
        responsePath,
        questionnaireVersion: '1.0',
        totalQuestions,
        answeredQuestions
      });

      console.log(`Created session record for response ${responseId}`);
      return true;

    } catch (error) {
      console.error('Failed to create session record:', error);
      return false;
    }
  }

  /**
   * Full migration: questionnaire + responses + session creation
   */
  async migrateFullQuestionnaire(questionnaireId: string): Promise<{
    questionnaireDefinitionPath: string | null;
    migratedResponses: Array<{ responseId: string; responsePath: string }>;
    sessionsCreated: number;
  }> {
    console.log(`Starting full migration of questionnaire ${questionnaireId}`);

    // 1. Migrate questionnaire definition
    const questionnaireDefinitionPath = await this.migrateQuestionnaireToJson(questionnaireId);
    if (!questionnaireDefinitionPath) {
      return {
        questionnaireDefinitionPath: null,
        migratedResponses: [],
        sessionsCreated: 0
      };
    }

    // 2. Get all responses for this questionnaire
    const responses = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.questionnaireId, questionnaireId));

    const migratedResponses: Array<{ responseId: string; responsePath: string }> = [];
    let sessionsCreated = 0;

    // 3. Migrate each response
    for (const response of responses) {
      const responsePath = await this.migrateResponseToJson(response.id);
      if (responsePath) {
        migratedResponses.push({
          responseId: response.id,
          responsePath
        });

        // 4. Create session record
        const sessionCreated = await this.createSessionFromMigratedResponse(
          response.id,
          questionnaireDefinitionPath,
          responsePath
        );
        if (sessionCreated) {
          sessionsCreated++;
        }
      }
    }

    console.log(`Migration completed: ${migratedResponses.length} responses migrated, ${sessionsCreated} sessions created`);

    return {
      questionnaireDefinitionPath,
      migratedResponses,
      sessionsCreated
    };
  }

  /**
   * Utility method to parse legacy answer values
   */
  private parseAnswerValue(answerValue: string): any {
    if (!answerValue) return null;

    // Handle the "[object Object]" corruption issue
    if (answerValue === '[object Object]') {
      return null; // Return null for corrupted data
    }

    // Try to parse as JSON first
    try {
      return JSON.parse(answerValue);
    } catch {
      // If not JSON, return as string
      return answerValue;
    }
  }

  /**
   * Cleanup old PostgreSQL data after successful migration
   */
  async cleanupOldData(questionnaireId: string, responseIds: string[]): Promise<boolean> {
    try {
      console.log(`Cleaning up old PostgreSQL data for questionnaire ${questionnaireId}`);

      // This would delete the old data after confirming migration success
      // For safety, we'll keep this as a separate manual step
      console.log('Cleanup not implemented - keeping PostgreSQL data for safety');
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      return false;
    }
  }

  /**
   * Verify migration integrity
   */
  async verifyMigration(responseId: string): Promise<{
    postgresqlCount: number;
    jsonAnswerCount: number;
    isValid: boolean;
  }> {
    try {
      // Count answers in PostgreSQL
      const postgresAnswers = await db
        .select()
        .from(questionAnswers)
        .where(eq(questionAnswers.responseId, responseId));

      // Count answers in JSON blob
      const jsonResponse = await this.storageService.getQuestionnaireResponse(responseId);
      const jsonAnswerCount = jsonResponse?.answers.length || 0;

      const isValid = postgresAnswers.length === jsonAnswerCount;

      return {
        postgresqlCount: postgresAnswers.length,
        jsonAnswerCount,
        isValid
      };
    } catch (error) {
      console.error('Failed to verify migration:', error);
      return {
        postgresqlCount: 0,
        jsonAnswerCount: 0,
        isValid: false
      };
    }
  }
}