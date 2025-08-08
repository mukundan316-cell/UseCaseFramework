import { users, useCases, metadataConfig, type User, type UseCase, type InsertUser, type InsertUseCase, type MetadataConfig } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Storage interface with metadata management for database-first compliance
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Use Case methods
  getAllUseCases(): Promise<UseCase[]>;
  createUseCase(useCase: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string }): Promise<UseCase>;
  updateUseCase(id: string, useCase: Partial<UseCase>): Promise<UseCase | undefined>;
  deleteUseCase(id: string): Promise<boolean>;
  
  // Metadata methods for database-first compliance
  getMetadataConfig(): Promise<MetadataConfig | undefined>;
  updateMetadataConfig(metadata: Partial<MetadataConfig>): Promise<MetadataConfig>;
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

  async getMetadataConfig(): Promise<MetadataConfig | undefined> {
    const [config] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, 'default'));
    return config || undefined;
  }

  async updateMetadataConfig(metadata: Partial<MetadataConfig>): Promise<MetadataConfig> {
    // Add current timestamp for updatedAt field
    const metadataWithTimestamp = {
      ...metadata,
      updatedAt: new Date()
    };
    
    const [config] = await db
      .insert(metadataConfig)
      .values({ id: 'default', ...metadataWithTimestamp } as any)
      .onConflictDoUpdate({
        target: metadataConfig.id,
        set: metadataWithTimestamp
      })
      .returning();
    return config;
  }
}

// Use DatabaseStorage for database-first compliance per REFERENCE.md
export const storage = new DatabaseStorage();