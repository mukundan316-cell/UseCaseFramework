import { type User, type InsertUser, type UseCase, type InsertUseCase } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Use Case methods
  getAllUseCases(): Promise<UseCase[]>;
  createUseCase(useCase: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string }): Promise<UseCase>;
  updateUseCase(id: string, useCase: Partial<UseCase>): Promise<UseCase | undefined>;
  deleteUseCase(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private useCases: Map<string, UseCase>;

  constructor() {
    this.users = new Map();
    this.useCases = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUseCases(): Promise<UseCase[]> {
    return Array.from(this.useCases.values());
  }

  async createUseCase(insertUseCase: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string }): Promise<UseCase> {
    const id = randomUUID();
    const useCase: UseCase = { 
      ...insertUseCase, 
      id,
      createdAt: new Date()
    };
    this.useCases.set(id, useCase);
    return useCase;
  }

  async updateUseCase(id: string, updates: Partial<UseCase>): Promise<UseCase | undefined> {
    const existingUseCase = this.useCases.get(id);
    if (!existingUseCase) return undefined;
    
    const updatedUseCase = { ...existingUseCase, ...updates };
    this.useCases.set(id, updatedUseCase);
    return updatedUseCase;
  }

  async deleteUseCase(id: string): Promise<boolean> {
    return this.useCases.delete(id);
  }
}

// Database Storage Implementation
import { db } from "./db";
import { users, useCases } from "@shared/schema";
import { eq } from "drizzle-orm";

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
    return await db.select().from(useCases);
  }

  async createUseCase(insertUseCase: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string }): Promise<UseCase> {
    const [useCase] = await db
      .insert(useCases)
      .values(insertUseCase)
      .returning();
    return useCase;
  }

  async updateUseCase(id: string, updates: Partial<UseCase>): Promise<UseCase | undefined> {
    const [updatedUseCase] = await db
      .update(useCases)
      .set(updates)
      .where(eq(useCases.id, id))
      .returning();
    return updatedUseCase || undefined;
  }

  async deleteUseCase(id: string): Promise<boolean> {
    const result = await db
      .delete(useCases)
      .where(eq(useCases.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// Use DatabaseStorage for production, MemStorage for development
export const storage = new DatabaseStorage();
