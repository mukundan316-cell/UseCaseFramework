import { 
  users, useCases, metadataConfig, responseSessions,
  type User, type UseCase, type InsertUser, type InsertUseCase, type MetadataConfig,
  type ResponseSession, type InsertResponseSession
} from "@shared/schema";
import type { QuestionAnswer } from "@shared/questionnaireTypes";
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
  
  // Response session management (blob storage questionnaires)
  getResponseSessions(): Promise<ResponseSession[]>;
  getResponseSession(id: string): Promise<ResponseSession | undefined>;
  createResponseSession(session: InsertResponseSession): Promise<ResponseSession>;
  updateResponseSession(id: string, updates: Partial<ResponseSession>): Promise<ResponseSession | undefined>;
  
  // Clean blob-first questionnaire architecture - answers stored in JSON files
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
    // Enhanced data cleaning with null safety
    const cleanData: any = {};
    
    // Process each field with safe validation
    Object.entries(insertUseCase).forEach(([key, value]) => {
      // Skip null/undefined values except for required fields
      if (value === null || value === undefined) {
        if (['title', 'description', 'process', 'lineOfBusiness', 'businessSegment', 'geography', 'useCaseType'].includes(key)) {
          throw new Error(`Required field ${key} cannot be null or undefined`);
        }
        return;
      }
      
      // Handle empty strings for required text fields
      if (typeof value === 'string' && value.trim() === '' && 
          ['title', 'description', 'process', 'lineOfBusiness', 'businessSegment', 'geography', 'useCaseType'].includes(key)) {
        throw new Error(`Required field ${key} cannot be empty`);
      }
      
      // Handle scoring fields with range validation
      if (['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
           'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness',
           'impactScore', 'effortScore', 'manualImpactScore', 'manualEffortScore'].includes(key)) {
        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(numValue) && isFinite(numValue)) {
          cleanData[key] = Math.max(0, Math.min(5, numValue)); // Preserve full precision
        }
        return;
      }
      
      // Handle boolean strings (preserve existing system)
      if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 
           'thirdPartyModel', 'humanAccountability'].includes(key)) {
        if (typeof value === 'boolean') {
          cleanData[key] = value ? 'true' : 'false';
        } else if (typeof value === 'string' && ['true', 'false'].includes(value)) {
          cleanData[key] = value;
        }
        return;
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        const cleanArray = value.filter(item => item && typeof item === 'string' && item.trim());
        if (cleanArray.length > 0) {
          cleanData[key] = cleanArray;
        }
        return;
      }
      
      // Include other valid values
      cleanData[key] = value;
    });
    
    // Set required defaults for scoring fields
    const scoreFields = ['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
                         'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness'];
    scoreFields.forEach(field => {
      if (cleanData[field] === undefined) {
        cleanData[field] = 0;
      }
    });
    
    const [useCase] = await db
      .insert(useCases)
      .values(cleanData)
      .returning();
    return useCase;
  }

  async updateUseCase(id: string, updates: Partial<UseCase>): Promise<UseCase | undefined> {
    // Enhanced validation for updates
    const cleanUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      // Skip null/undefined values
      if (value === null || value === undefined) {
        return;
      }
      
      // Handle scoring fields with validation
      if (['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
           'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness',
           'impactScore', 'effortScore', 'manualImpactScore', 'manualEffortScore'].includes(key)) {
        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(numValue) && isFinite(numValue)) {
          cleanUpdates[key] = Math.max(0, Math.min(5, numValue)); // Preserve full precision
        }
        return;
      }
      
      // Handle boolean string fields - simplified validation
      if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 
           'thirdPartyModel', 'humanAccountability'].includes(key)) {
        if (typeof value === 'string' && ['true', 'false'].includes(value)) {
          cleanUpdates[key] = value;
        }
        return;
      }
      
      cleanUpdates[key] = value;
    });
    
    if (Object.keys(cleanUpdates).length === 0) {
      return undefined; // No valid updates
    }
    
    const [useCase] = await db
      .update(useCases)
      .set(cleanUpdates)
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
  // RESPONSE SESSION MANAGEMENT (BLOB STORAGE QUESTIONNAIRES)
  // ==================================================================================

  async getResponseSessions(): Promise<ResponseSession[]> {
    return await db.select().from(responseSessions);
  }

  async getResponseSession(id: string): Promise<ResponseSession | undefined> {
    const [session] = await db
      .select()
      .from(responseSessions)
      .where(eq(responseSessions.id, id));
    return session || undefined;
  }

  async createResponseSession(session: InsertResponseSession): Promise<ResponseSession> {
    const [created] = await db
      .insert(responseSessions)
      .values(session)
      .returning();
    return created;
  }

  async updateResponseSession(id: string, updates: Partial<ResponseSession>): Promise<ResponseSession | undefined> {
    const [updated] = await db
      .update(responseSessions)
      .set(updates)
      .where(eq(responseSessions.id, id))
      .returning();
    return updated || undefined;
  }

  // ==================================================================================
  // QUESTION ANSWER MANAGEMENT - Using blob storage, not database tables
  // ==================================================================================

  async saveQuestionAnswer(
    responseId: string, 
    questionId: string, 
    answerValue: any
  ): Promise<QuestionAnswer> {
    // This is handled by blob storage in the questionnaire service
    // Return a mock response for interface compatibility
    return {
      questionId,
      answerValue,
      answeredAt: new Date().toISOString()
    };
  }

  async getQuestionAnswersByResponse(responseId: string): Promise<QuestionAnswer[]> {
    // This is handled by blob storage in the questionnaire service
    // Return empty array for interface compatibility
    return [];
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
  // Clean blob-first questionnaire architecture
  // All questionnaire data is stored in JSON files
}

// Use DatabaseStorage for database-first compliance per REFERENCE.md
export const storage = new DatabaseStorage();