import { 
  users, useCases, metadataConfig, sectionProgress, questionnaireResponses, questionAnswers,
  type User, type UseCase, type InsertUser, type InsertUseCase, type MetadataConfig,
  type SectionProgress, type InsertSectionProgress, type QuestionnaireResponse, type QuestionAnswer
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// Storage interface with metadata management for database-first compliance
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Use Case methods
  getAllUseCases(): Promise<UseCase[]>;
  getActiveUseCases(): Promise<UseCase[]>; // Only active tier use cases
  getDashboardUseCases(): Promise<UseCase[]>; // Only dashboard-visible use cases
  getReferenceLibraryUseCases(): Promise<UseCase[]>; // Only reference tier use cases
  createUseCase(useCase: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string }): Promise<UseCase>;
  updateUseCase(id: string, useCase: Partial<UseCase>): Promise<UseCase | undefined>;
  deleteUseCase(id: string): Promise<boolean>;
  
  // Two-tier library management
  activateUseCase(id: string, reason?: string): Promise<UseCase | undefined>;
  deactivateUseCase(id: string, reason?: string): Promise<UseCase | undefined>;
  toggleDashboardVisibility(id: string): Promise<UseCase | undefined>;
  bulkUpdateUseCaseTier(ids: string[], tier: 'active' | 'reference'): Promise<UseCase[]>;
  
  // Metadata methods for database-first compliance
  getMetadataConfig(): Promise<MetadataConfig | undefined>;
  updateMetadataConfig(metadata: Partial<MetadataConfig>): Promise<MetadataConfig>;
  
  // Individual metadata item CRUD operations
  addMetadataItem(category: string, item: string): Promise<MetadataConfig>;
  removeMetadataItem(category: string, item: string): Promise<MetadataConfig>;
  
  // Section progress management
  getSectionProgress(responseId: string): Promise<SectionProgress[]>;
  updateSectionProgress(responseId: string, sectionNumber: number, progress: Partial<InsertSectionProgress>): Promise<SectionProgress>;
  
  // Questionnaire response management
  updateQuestionnaireResponse(responseId: string, updates: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse | undefined>;
  
  // Question answer management
  saveQuestionAnswer(responseId: string, questionId: string, answerValue: any): Promise<QuestionAnswer>;
  getQuestionAnswersByResponse(responseId: string): Promise<QuestionAnswer[]>;
}

/**
 * Database Storage Implementation
 * Ensures all data is persisted to PostgreSQL database per REFERENCE.md compliance
 */
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUseCases(): Promise<UseCase[]> {
    return await db.select().from(useCases).orderBy(sql`created_at DESC`);
  }

  async getActiveUseCases(): Promise<UseCase[]> {
    return await db.select().from(useCases)
      .where(and(
        eq(useCases.isActiveForRsa, 'true'),
        eq(useCases.libraryTier, 'active')
      ))
      .orderBy(sql`created_at DESC`);
  }

  async getDashboardUseCases(): Promise<UseCase[]> {
    return await db.select().from(useCases)
      .where(and(
        eq(useCases.isActiveForRsa, 'true'),
        eq(useCases.isDashboardVisible, 'true'),
        eq(useCases.libraryTier, 'active')
      ))
      .orderBy(sql`created_at DESC`);
  }

  async getReferenceLibraryUseCases(): Promise<UseCase[]> {
    return await db.select().from(useCases)
      .where(eq(useCases.libraryTier, 'reference'))
      .orderBy(sql`created_at DESC`);
  }

  async createUseCase(insertUseCase: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string }): Promise<UseCase> {
    const [useCase] = await db
      .insert(useCases)
      .values(insertUseCase)
      .returning();
    return useCase;
  }

  async updateUseCase(id: string, updates: Partial<UseCase>): Promise<UseCase | undefined> {
    const [useCase] = await db
      .update(useCases)
      .set(updates)
      .where(eq(useCases.id, id))
      .returning();
    return useCase || undefined;
  }

  async deleteUseCase(id: string): Promise<boolean> {
    const result = await db.delete(useCases).where(eq(useCases.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Two-tier library management methods
  async activateUseCase(id: string, reason?: string): Promise<UseCase | undefined> {
    const [useCase] = await db
      .update(useCases)
      .set({
        isActiveForRsa: 'true',
        libraryTier: 'active',
        isDashboardVisible: 'true',
        activationDate: new Date(),
        deactivationReason: null
      })
      .where(eq(useCases.id, id))
      .returning();
    return useCase || undefined;
  }

  async deactivateUseCase(id: string, reason?: string): Promise<UseCase | undefined> {
    const [useCase] = await db
      .update(useCases)
      .set({
        isActiveForRsa: 'false',
        libraryTier: 'reference',
        isDashboardVisible: 'false',
        deactivationReason: reason || 'Moved to reference library'
      })
      .where(eq(useCases.id, id))
      .returning();
    return useCase || undefined;
  }

  async toggleDashboardVisibility(id: string): Promise<UseCase | undefined> {
    // Get current state
    const [currentUseCase] = await db.select().from(useCases).where(eq(useCases.id, id));
    if (!currentUseCase) return undefined;
    
    const newVisibility = currentUseCase.isDashboardVisible === 'true' ? 'false' : 'true';
    
    const [useCase] = await db
      .update(useCases)
      .set({ isDashboardVisible: newVisibility })
      .where(eq(useCases.id, id))
      .returning();
    return useCase || undefined;
  }

  async bulkUpdateUseCaseTier(ids: string[], tier: 'active' | 'reference'): Promise<UseCase[]> {
    const updates = tier === 'active' 
      ? {
          isActiveForRsa: 'true',
          libraryTier: 'active',
          isDashboardVisible: 'true',
          activationDate: new Date(),
          deactivationReason: null
        }
      : {
          isActiveForRsa: 'false',
          libraryTier: 'reference',
          isDashboardVisible: 'false',
          deactivationReason: 'Bulk moved to reference library'
        };

    const result = await db
      .update(useCases)
      .set(updates)
      .where(sql`id = ANY(${ids})`)
      .returning();
    
    return result;
  }

  async getMetadataConfig(): Promise<MetadataConfig | undefined> {
    const [config] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, 'default'));
    return config || undefined;
  }

  async updateMetadataConfig(metadata: Partial<MetadataConfig>): Promise<MetadataConfig> {
    // Get existing config first to preserve all fields
    const existingConfig = await this.getMetadataConfig();
    
    // Merge with existing config to ensure no null values
    const completeMetadata = {
      ...existingConfig,
      ...metadata,
      updatedAt: new Date()
    };
    
    if (existingConfig) {
      // Update existing record
      const [config] = await db
        .update(metadataConfig)
        .set(completeMetadata)
        .where(eq(metadataConfig.id, 'default'))
        .returning();
      return config;
    } else {
      // Insert new record (should not happen with default seeded data)
      const [config] = await db
        .insert(metadataConfig)
        .values({ id: 'default', ...completeMetadata } as any)
        .returning();
      return config;
    }
  }

  async addMetadataItem(category: string, item: string): Promise<MetadataConfig> {
    const currentConfig = await this.getMetadataConfig();
    
    if (!currentConfig) {
      throw new Error('Metadata config not found');
    }

    // Get current items for the category
    const currentItems = (currentConfig as any)[category] || [];
    
    // Add new item if it doesn't already exist
    if (!currentItems.includes(item)) {
      const updatedItems = [...currentItems, item];
      // Preserve all existing metadata to avoid null constraint violations
      const updatedConfig = {
        ...currentConfig,
        [category]: updatedItems
      };
      return await this.updateMetadataConfig(updatedConfig);
    }
    
    return currentConfig;
  }

  async removeMetadataItem(category: string, item: string): Promise<MetadataConfig> {
    const currentConfig = await this.getMetadataConfig();
    
    if (!currentConfig) {
      throw new Error('Metadata config not found');
    }

    // Get current items for the category
    const currentItems = (currentConfig as any)[category] || [];
    
    // Remove the item
    const updatedItems = currentItems.filter((i: string) => i !== item);
    // Preserve all existing metadata to avoid null constraint violations
    const updatedConfig = {
      ...currentConfig,
      [category]: updatedItems
    };
    
    return await this.updateMetadataConfig(updatedConfig);
  }

  // ==================================================================================
  // SECTION PROGRESS MANAGEMENT
  // ==================================================================================

  async getSectionProgress(responseId: string): Promise<SectionProgress[]> {
    return await db
      .select()
      .from(sectionProgress)
      .where(eq(sectionProgress.userResponseId, responseId))
      .orderBy(sectionProgress.sectionNumber);
  }

  async updateSectionProgress(
    responseId: string, 
    sectionNumber: number, 
    progress: Partial<InsertSectionProgress>
  ): Promise<SectionProgress> {
    // Check if section progress already exists
    const existing = await db
      .select()
      .from(sectionProgress)
      .where(
        and(
          eq(sectionProgress.userResponseId, responseId),
          eq(sectionProgress.sectionNumber, sectionNumber)
        )
      );

    if (existing.length > 0) {
      // Update existing progress
      const [updated] = await db
        .update(sectionProgress)
        .set({
          ...progress,
          lastModifiedAt: sql`NOW()`
        })
        .where(
          and(
            eq(sectionProgress.userResponseId, responseId),
            eq(sectionProgress.sectionNumber, sectionNumber)
          )
        )
        .returning();
      return updated;
    } else {
      // Create new progress entry
      const [created] = await db
        .insert(sectionProgress)
        .values({
          userResponseId: responseId,
          sectionNumber,
          ...progress
        })
        .returning();
      return created;
    }
  }

  // ==================================================================================
  // QUESTIONNAIRE RESPONSE MANAGEMENT
  // ==================================================================================

  async updateQuestionnaireResponse(
    responseId: string, 
    updates: Partial<QuestionnaireResponse>
  ): Promise<QuestionnaireResponse | undefined> {
    const [updated] = await db
      .update(questionnaireResponses)
      .set(updates)
      .where(eq(questionnaireResponses.id, responseId))
      .returning();
    return updated || undefined;
  }

  // ==================================================================================
  // QUESTION ANSWER MANAGEMENT
  // ==================================================================================

  async saveQuestionAnswer(
    responseId: string, 
    questionId: string, 
    answerValue: any
  ): Promise<QuestionAnswer> {
    // Check if answer already exists
    const existing = await db
      .select()
      .from(questionAnswers)
      .where(
        and(
          eq(questionAnswers.responseId, responseId),
          eq(questionAnswers.questionId, questionId)
        )
      );

    const answerData = {
      responseId,
      questionId,
      answerValue: typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue)
    };

    if (existing.length > 0) {
      // Update existing answer
      const [updated] = await db
        .update(questionAnswers)
        .set(answerData)
        .where(
          and(
            eq(questionAnswers.responseId, responseId),
            eq(questionAnswers.questionId, questionId)
          )
        )
        .returning();
      return updated;
    } else {
      // Create new answer
      const [created] = await db
        .insert(questionAnswers)
        .values(answerData)
        .returning();
      return created;
    }
  }

  async getQuestionAnswersByResponse(responseId: string): Promise<QuestionAnswer[]> {
    return await db
      .select()
      .from(questionAnswers)
      .where(eq(questionAnswers.responseId, responseId));
  }

  async getSavedAssessmentProgress(): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM saved_assessment_progress
        ORDER BY timestamp DESC
        LIMIT 20
      `);

      const rows = Array.isArray(result) ? result : (result as any).rows || [];
      
      return rows.map((row: any) => ({
        responseId: row.responseId,
        questionnaireId: row.questionnaireId,
        completionPercentage: Number(row.completionPercentage),
        currentSection: Number(row.currentSection),
        totalSections: Number(row.totalSections),
        lastSaved: new Date(row.timestamp).toLocaleString(),
        email: row.respondentEmail,
        name: row.respondentName,
        timestamp: Number(row.timestamp)
      }));
    } catch (error) {
      console.error('Error getting saved assessment progress:', error);
      throw error;
    }
  }

  async deleteSavedAssessmentProgress(responseId: string): Promise<void> {
    try {
      await db.execute(sql`
        DELETE FROM questionnaire_responses 
        WHERE id = ${responseId} AND status != 'completed'
      `);
    } catch (error) {
      console.error('Error deleting saved assessment progress:', error);
      throw error;
    }
  }
}

// Use DatabaseStorage for database-first compliance per REFERENCE.md
export const storage = new DatabaseStorage();