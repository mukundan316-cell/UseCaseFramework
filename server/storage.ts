import { 
  users, useCases, metadataConfig, responseSessions, useCaseChangeLog, governanceAuditLog,
  clients, engagements,
  type User, type UseCase, type InsertUser, type InsertUseCase, type MetadataConfig,
  type ResponseSession, type InsertResponseSession, type UseCaseChangeLog, type InsertUseCaseChangeLog,
  type Client, type InsertClient, type Engagement, type InsertEngagement
} from "@shared/schema";
import type { QuestionAnswer } from "@shared/questionnaireTypes";
import { calculateTShirtSize, getDefaultTShirtSizingConfig, type TShirtSizingConfig, calculateGovernanceStatus, getGovernanceStatusString } from "@shared/calculations";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// Meaningful ID generation helpers
function createCategoryCode(valueChainComponent?: string, lineOfBusiness?: string): string {
  // Create short codes from valueChainComponent and lineOfBusiness
  const componentCode = valueChainComponent?.substring(0, 3).toUpperCase() || 'GEN';
  const lobCode = lineOfBusiness?.substring(0, 4).toUpperCase() || '';
  
  return lobCode ? `${componentCode}-${lobCode}` : componentCode;
}

async function getNextSequenceNumberSimple(prefix: string): Promise<number> {
  // Find the highest sequence number for this prefix
  const pattern = `${prefix}_%`;
  const result = await db.execute(sql`
    SELECT meaningful_id FROM use_cases 
    WHERE meaningful_id LIKE ${pattern}
    ORDER BY meaningful_id DESC
    LIMIT 1
  `);
  
  const rows: any[] = Array.isArray(result) ? result : (result as any).rows || [];
  
  if (rows.length === 0) {
    return 1; // First use case for this prefix
  }
  
  // Extract sequence number from the last ID (e.g., HEX_INT_005 → 5)
  const lastId = rows[0].meaningful_id;
  const sequencePart = lastId.split('_').pop();
  const lastSequence = parseInt(sequencePart || '0', 10);
  
  return lastSequence + 1;
}

async function generateMeaningfulId(useCase: any): Promise<string> {
  // Determine prefix based on librarySource
  const prefix = useCase.librarySource === 'rsa_internal' ? 'HEX_INT' : 
                useCase.librarySource === 'industry_standard' ? 'HEX_IND' : 'HEX_AITOOL';
  
  // Get next sequence number for this prefix (no category needed)
  const sequence = await getNextSequenceNumberSimple(prefix);
  
  return `${prefix}_${sequence.toString().padStart(3, '0')}`;
}

// Duplicate Detection Helper (Topic 3.4 - Markel 9 Topics)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  // Simple word overlap similarity (Jaccard-like)
  const words1Arr = s1.split(/\s+/).filter(w => w.length > 2);
  const words2Arr = s2.split(/\s+/).filter(w => w.length > 2);
  const words2Set = new Set(words2Arr);
  
  const intersectionCount = words1Arr.filter(w => words2Set.has(w)).length;
  const unionCount = new Set(words1Arr.concat(words2Arr)).size;
  
  if (unionCount === 0) return 0;
  
  return intersectionCount / unionCount;
}

async function findSimilarUseCases(title: string, description: string, excludeId?: string): Promise<Array<{
  meaningfulId: string;
  title: string;
  similarityScore: number;
}>> {
  // Get all use cases to compare
  const allUseCases = await db.select({
    id: useCases.id,
    meaningfulId: useCases.meaningfulId,
    title: useCases.title,
    description: useCases.description
  }).from(useCases);
  
  const similarCases: Array<{ meaningfulId: string; title: string; similarityScore: number }> = [];
  
  for (const uc of allUseCases) {
    if (excludeId && uc.id === excludeId) continue;
    
    // Calculate combined similarity (title weighted more heavily)
    const titleSim = calculateSimilarity(title, uc.title);
    const descSim = calculateSimilarity(description, uc.description);
    const combinedScore = (titleSim * 0.7) + (descSim * 0.3);
    
    // Flag if similarity is above threshold (0.6 = 60% similar)
    if (combinedScore >= 0.6) {
      similarCases.push({
        meaningfulId: uc.meaningfulId || uc.id,
        title: uc.title,
        similarityScore: Math.round(combinedScore * 100) / 100
      });
    }
  }
  
  // Sort by similarity score descending
  return similarCases.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
}

// Nested governance fields that require granular audit tracking
const NESTED_GOVERNANCE_PATHS = [
  { parent: 'valueRealization', child: 'valueConfidence', field: 'validationStatus' },
  { parent: 'valueRealization', child: 'valueConfidence', field: 'conservativeFactor' }
];

// Audit Trail Helper (Topic 8.2 - Markel 9 Topics)
async function logUseCaseChange(
  useCaseId: string,
  meaningfulId: string | null,
  changeType: string,
  beforeState: Record<string, any> | null,
  afterState: Record<string, any> | null,
  actor: string = 'system',
  changeReason?: string,
  source: string = 'api'
): Promise<void> {
  try {
    // Calculate which fields changed
    const changedFields: string[] = [];
    if (beforeState && afterState) {
      const allKeys = Array.from(new Set(Object.keys(beforeState).concat(Object.keys(afterState))));
      for (const key of allKeys) {
        if (JSON.stringify(beforeState[key]) !== JSON.stringify(afterState[key])) {
          changedFields.push(key);
          
          // Add granular tracking for governance fields in nested objects
          if (key === 'valueRealization') {
            for (const path of NESTED_GOVERNANCE_PATHS) {
              if (path.parent === key) {
                const beforeVal = beforeState[key]?.[path.child]?.[path.field];
                const afterVal = afterState[key]?.[path.child]?.[path.field];
                if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
                  changedFields.push(`${path.parent}.${path.child}.${path.field}`);
                }
              }
            }
          }
        }
      }
    }
    
    await db.insert(useCaseChangeLog).values({
      useCaseId,
      useCaseMeaningfulId: meaningfulId,
      changeType,
      actor,
      beforeState,
      afterState,
      changedFields: changedFields.length > 0 ? changedFields : null,
      changeReason,
      source
    });
  } catch (error) {
    console.error('Failed to log use case change:', error);
    // Don't throw - audit logging failure shouldn't break operations
  }
}

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
  
  // Multi-client metadata support (Topic 5 - TOM Multi-Client)
  getAllMetadataConfigIds(): Promise<string[]>;
  getMetadataConfigById(id: string): Promise<MetadataConfig | undefined>;
  updateMetadataConfigById(id: string, metadata: Partial<MetadataConfig>): Promise<MetadataConfig | undefined>;
  
  // Individual metadata item CRUD operations
  addMetadataItem(category: string, item: string): Promise<MetadataConfig>;
  removeMetadataItem(category: string, item: string): Promise<MetadataConfig>;
  editMetadataItem(category: string, oldItem: string, newItem: string): Promise<MetadataConfig>;
  updateMetadataSortOrder(category: string, orderedItems: string[]): Promise<MetadataConfig>;
  
  // Response session management (blob storage questionnaires)
  getResponseSessions(): Promise<ResponseSession[]>;
  getResponseSession(id: string): Promise<ResponseSession | undefined>;
  createResponseSession(session: InsertResponseSession): Promise<ResponseSession>;
  updateResponseSession(id: string, updates: Partial<ResponseSession>): Promise<ResponseSession | undefined>;
  
  // Duplicate Detection (Topic 3.4 - Markel 9 Topics)
  findSimilarUseCases(title: string, description: string, excludeId?: string): Promise<Array<{
    meaningfulId: string;
    title: string;
    similarityScore: number;
  }>>;
  resolveDuplicate(id: string, status: 'confirmed_duplicate' | 'reviewed_not_duplicate', reviewedBy: string): Promise<UseCase | undefined>;
  
  // Audit Trail (Topic 8.2 - Markel 9 Topics)
  getUseCaseChangeLog(useCaseId: string): Promise<UseCaseChangeLog[]>;
  getAllChangeLogs(limit?: number): Promise<UseCaseChangeLog[]>;
  
  // Governance Workflow (Foundation Layer gates)
  getGovernancePendingUseCases(): Promise<UseCase[]>;
  getGovernanceSummary(): Promise<{
    pending: number;
    inReview: number;
    complete: number;
    rejected: number;
    byGate: {
      operatingModel: { pending: number; approved: number; rejected: number };
      intake: { pending: number; approved: number; rejected: number; deferred: number };
      rai: { pending: number; approved: number; conditionallyApproved: number; rejected: number };
    };
    legacyActivated: number;
  }>;
  submitForGovernance(id: string, reason: string, submittedBy: string): Promise<UseCase | undefined>;
  processOperatingModelGate(id: string, decision: 'approved' | 'rejected' | 'not_required', notes: string, actor: string): Promise<UseCase | undefined>;
  processIntakeGate(id: string, decision: 'approved' | 'rejected' | 'deferred', notes: string, actor: string, priorityRank?: number): Promise<UseCase | undefined>;
  processRaiGate(id: string, decision: 'approved' | 'conditionally_approved' | 'rejected', notes: string, actor: string, riskLevel?: string): Promise<UseCase | undefined>;
  getGovernanceAuditLog(useCaseId: string): Promise<any[]>;
  
  // Client & Engagement Management
  getAllClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  
  getAllEngagements(): Promise<Engagement[]>;
  getEngagementsByClient(clientId: string): Promise<Engagement[]>;
  getEngagement(id: string): Promise<Engagement | undefined>;
  getDefaultEngagement(): Promise<Engagement | undefined>;
  createEngagement(engagement: InsertEngagement): Promise<Engagement>;
  updateEngagement(id: string, engagement: Partial<Engagement>): Promise<Engagement | undefined>;
  lockEngagementTom(id: string): Promise<Engagement | undefined>;
  deleteEngagement(id: string): Promise<boolean>;
  
  // Use case filtering by engagement
  getUseCasesByEngagement(engagementId: string): Promise<UseCase[]>;
}

/**
 * Database Storage Implementation
 * Ensures all data is persisted to PostgreSQL database per REFERENCE.md compliance
 */
export class DatabaseStorage implements IStorage {
  
  /**
   * Calculate T-shirt sizing for a use case based on impact and effort scores
   * Uses metadata configuration if available, falls back to defaults
   */
  private async calculateTShirtSizingForUseCase(impactScore: number, effortScore: number): Promise<{
    tShirtSize: string | null;
    estimatedCostMin: number | null;
    estimatedCostMax: number | null;
    estimatedWeeksMin: number | null;
    estimatedWeeksMax: number | null;
    teamSizeEstimate: string | null;
  }> {
    try {
      // Get T-shirt sizing configuration from metadata
      const metadata = await this.getMetadataConfig();
      const tShirtConfig = metadata?.tShirtSizing as TShirtSizingConfig;
      
      // Use config if available and enabled, otherwise use defaults
      const config = tShirtConfig?.enabled ? tShirtConfig : getDefaultTShirtSizingConfig();
      
      const result = calculateTShirtSize(impactScore, effortScore, config);
      
      return {
        tShirtSize: result.size,
        estimatedCostMin: result.estimatedCostMin,
        estimatedCostMax: result.estimatedCostMax,
        estimatedWeeksMin: result.estimatedWeeksMin,
        estimatedWeeksMax: result.estimatedWeeksMax,
        teamSizeEstimate: result.teamSizeEstimate
      };
    } catch (error) {
      console.warn('Failed to calculate T-shirt sizing:', error);
      // Return null values if calculation fails - this maintains backward compatibility
      return {
        tShirtSize: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null
      };
    }
  }
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
    // Enhanced data cleaning with null safety\n    // Implements minimal validation approach per replit.md - only title/description required
    const cleanData: any = {};
    
    // Process each field with minimal validation - only title and description are essential
    Object.entries(insertUseCase).forEach(([key, value]) => {
      // Only require title and description - all other fields are optional
      if (value === null || value === undefined) {
        if (['title', 'description'].includes(key)) {
          throw new Error(`${key === 'title' ? 'Title' : 'Description'} is required`);
        }
        return;
      }
      
      // Handle empty strings only for essential fields
      if (typeof value === 'string' && value.trim() === '' && ['title', 'description'].includes(key)) {
        throw new Error(`${key === 'title' ? 'Please enter a title' : 'Please provide a description'}`);
      }
      
      // Handle scoring fields with range validation
      // Ensures all scores stay within 0-5 range per RSA framework requirements
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
      // Uses string 'true'/'false' instead of boolean for consistency per replit.md
      if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 
           'thirdPartyModel', 'humanAccountability', 'horizontalUseCase', 'hasPresentation'].includes(key)) {
        if (typeof value === 'boolean') {
          cleanData[key] = value ? 'true' : 'false';
        } else if (typeof value === 'string' && ['true', 'false'].includes(value)) {
          cleanData[key] = value;
        }
        return;
      }
      
      // Handle horizontal use case types array
      if (key === 'horizontalUseCaseTypes') {
        if (Array.isArray(value)) {
          const cleanArray = value.filter(item => item && typeof item === 'string' && item.trim());
          if (cleanArray.length > 0) {
            cleanData[key] = cleanArray;
          }
        }
        return;
      }
      
      // Handle arrays - serialize multi-select field data for database storage
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
    
    // Generate meaningful ID if not provided
    if (!cleanData.meaningfulId) {
      cleanData.meaningfulId = await generateMeaningfulId(cleanData);
    }
    
    // Set required defaults for scoring fields
    const scoreFields = ['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
                         'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness'];
    scoreFields.forEach(field => {
      if (cleanData[field] === undefined) {
        cleanData[field] = 0;
      }
    });
    
    // Calculate T-shirt sizing based on impact and effort scores
    const tShirtSizing = await this.calculateTShirtSizingForUseCase(
      cleanData.impactScore || 0,
      cleanData.effortScore || 0
    );
    
    // Add T-shirt sizing fields to the clean data
    Object.assign(cleanData, tShirtSizing);
    
    // Check for potential duplicates before creating
    const similarCases = await findSimilarUseCases(cleanData.title, cleanData.description);
    if (similarCases.length > 0) {
      cleanData.duplicateStatus = 'potential_duplicate';
      cleanData.duplicateSimilarTo = similarCases.map(s => s.meaningfulId);
      cleanData.duplicateSimilarityScore = similarCases[0].similarityScore;
    } else {
      cleanData.duplicateStatus = 'unique';
    }
    
    // Calculate and set governance status for new use cases
    cleanData.governanceStatus = getGovernanceStatusString(cleanData);
    
    // GOVERNANCE ENFORCEMENT: Block activation on create if governance gates are incomplete
    if (cleanData.isActiveForRsa === 'true') {
      const governanceStatus = calculateGovernanceStatus(cleanData);
      if (!governanceStatus.canActivate) {
        throw new Error(
          `Cannot activate use case on creation: Governance gates incomplete. ` +
          `Operating Model: ${governanceStatus.operatingModel.progress}%, ` +
          `Intake: ${governanceStatus.intake.progress}%, ` +
          `Responsible AI: ${governanceStatus.rai.progress}%`
        );
      }
    }
    
    const [useCase] = await db
      .insert(useCases)
      .values(cleanData)
      .returning() as UseCase[];
    
    // Log the creation in audit trail
    await logUseCaseChange(
      useCase.id,
      useCase.meaningfulId,
      'created',
      null,
      useCase as Record<string, any>,
      'system',
      undefined,
      'api'
    );
    
    return useCase;
  }

  async updateUseCase(id: string, updates: Partial<UseCase>): Promise<UseCase | undefined> {
    // Enhanced validation for updates
    const cleanUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      // Allow null values for manual override fields to clear them
      const allowNullFields = ['manualImpactScore', 'manualEffortScore', 'manualQuadrant', 'overrideReason'];
      
      // Skip null/undefined values except for fields that need to be cleared
      if ((value === null || value === undefined) && !allowNullFields.includes(key)) {
        return;
      }
      
      // Handle scoring fields with validation
      if (['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
           'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness',
           'impactScore', 'effortScore'].includes(key)) {
        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(numValue) && isFinite(numValue)) {
          cleanUpdates[key] = Math.max(0, Math.min(5, numValue)); // Preserve full precision
        }
        return;
      }
      
      // Handle manual override fields - allow null to clear values
      if (['manualImpactScore', 'manualEffortScore'].includes(key)) {
        if (value === null || value === undefined) {
          cleanUpdates[key] = null; // Explicitly set to null to clear
        } else {
          const numValue = typeof value === 'number' ? value : parseFloat(value as string);
          if (!isNaN(numValue) && isFinite(numValue)) {
            cleanUpdates[key] = Math.max(0, Math.min(5, numValue));
          }
        }
        return;
      }
      
      // Handle manual quadrant field - allow null to clear
      if (key === 'manualQuadrant') {
        cleanUpdates[key] = value; // Allow null or string value
        return;
      }
      
      // Handle boolean string fields - normalize booleans to strings and validate
      if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 
           'thirdPartyModel', 'humanAccountability', 'horizontalUseCase', 'hasPresentation'].includes(key)) {
        // Normalize actual booleans to string representation
        if (typeof value === 'boolean') {
          cleanUpdates[key] = value ? 'true' : 'false';
        } else if (typeof value === 'string' && ['true', 'false'].includes(value)) {
          cleanUpdates[key] = value;
        }
        // Invalid values are silently dropped
        return;
      }
      
      // Handle horizontal use case types array
      if (key === 'horizontalUseCaseTypes') {
        if (Array.isArray(value)) {
          const cleanArray = value.filter(item => item && typeof item === 'string' && item.trim());
          cleanUpdates[key] = cleanArray;
        }
        return;
      }
      
      cleanUpdates[key] = value;
    });
    
    if (Object.keys(cleanUpdates).length === 0) {
      return undefined; // No valid updates
    }
    
    // Check if impact or effort scores are being updated - if so, recalculate T-shirt sizing
    const shouldRecalculateTShirtSizing = ['impactScore', 'effortScore', 'revenueImpact', 'costSavings', 
      'riskReduction', 'brokerPartnerExperience', 'strategicFit', 'dataReadiness', 'technicalComplexity', 
      'changeImpact', 'modelRisk', 'adoptionReadiness'].some(field => cleanUpdates.hasOwnProperty(field));
    
    // Get current use case before update for audit trail
    const [beforeUseCase] = await db.select().from(useCases).where(eq(useCases.id, id));
    if (!beforeUseCase) return undefined;
    
    // Always recalculate governance status on update
    const proposedState = { ...beforeUseCase, ...cleanUpdates };
    const governanceStatus = calculateGovernanceStatus(proposedState);
    cleanUpdates.governanceStatus = governanceStatus.status;
    
    // Determine what the final activation state would be
    // Handle string 'true' values per project convention (string booleans)
    const proposedActiveRaw = cleanUpdates.isActiveForRsa ?? beforeUseCase.isActiveForRsa;
    const proposedActiveState = proposedActiveRaw === 'true';
    const wasActiveRaw = beforeUseCase.isActiveForRsa;
    const wasActive = wasActiveRaw === 'true';
    const isNewActivation = cleanUpdates.isActiveForRsa === 'true' && !wasActive;
    
    // GOVERNANCE ENFORCEMENT: Enforce gates when trying to activate OR when already active
    if (proposedActiveState) {
      if (!governanceStatus.canActivate) {
        // If this is a new activation attempt, block it with an error
        if (isNewActivation) {
          throw new Error(
            `Cannot activate use case: Governance gates incomplete. ` +
            `Operating Model: ${governanceStatus.operatingModel.progress}%, ` +
            `Intake: ${governanceStatus.intake.progress}%, ` +
            `Responsible AI: ${governanceStatus.rai.progress}%`
          );
        }
        // If already active but gates became incomplete, auto-deactivate
        cleanUpdates.isActiveForRsa = 'false';
        cleanUpdates.isDashboardVisible = 'false';
        cleanUpdates.deactivationReason = 'Auto-deactivated: Governance gates incomplete';
      }
    }
    
    if (shouldRecalculateTShirtSizing) {
      // Calculate new T-shirt sizing with updated scores
      const newImpactScore = cleanUpdates.impactScore ?? beforeUseCase.impactScore;
      const newEffortScore = cleanUpdates.effortScore ?? beforeUseCase.effortScore;
      
      const tShirtSizing = await this.calculateTShirtSizingForUseCase(newImpactScore, newEffortScore);
      
      // Add T-shirt sizing fields to the updates
      Object.assign(cleanUpdates, tShirtSizing);
    }
    
    // Check for title/description changes to re-run duplicate detection
    if (cleanUpdates.title || cleanUpdates.description) {
      const newTitle = cleanUpdates.title || beforeUseCase.title;
      const newDesc = cleanUpdates.description || beforeUseCase.description;
      const similarCases = await findSimilarUseCases(newTitle, newDesc, id);
      
      if (similarCases.length > 0 && beforeUseCase.duplicateStatus !== 'reviewed_not_duplicate') {
        cleanUpdates.duplicateStatus = 'potential_duplicate';
        cleanUpdates.duplicateSimilarTo = similarCases.map(s => s.meaningfulId);
        cleanUpdates.duplicateSimilarityScore = similarCases[0].similarityScore;
      }
    }
    
    // Determine change type for audit
    let changeType = 'updated';
    if (cleanUpdates.useCaseStatus && cleanUpdates.useCaseStatus !== beforeUseCase.useCaseStatus) {
      changeType = 'status_change';
    } else if (cleanUpdates.tomPhase && cleanUpdates.tomPhase !== beforeUseCase.tomPhase) {
      changeType = 'phase_change';
    }
    
    const [useCase] = await db
      .update(useCases)
      .set(cleanUpdates)
      .where(eq(useCases.id, id))
      .returning();
    
    if (useCase) {
      // Log the update in audit trail
      await logUseCaseChange(
        useCase.id,
        useCase.meaningfulId,
        changeType,
        beforeUseCase as Record<string, any>,
        useCase as Record<string, any>,
        'system',
        cleanUpdates.overrideReason || undefined,
        'api'
      );
    }
    
    return useCase || undefined;
  }

  async deleteUseCase(id: string): Promise<boolean> {
    // Get use case before deletion for audit trail
    const [beforeUseCase] = await db.select().from(useCases).where(eq(useCases.id, id));
    
    const result = await db.delete(useCases).where(eq(useCases.id, id));
    const deleted = result.rowCount !== null && result.rowCount > 0;
    
    if (deleted && beforeUseCase) {
      // Log the deletion in audit trail
      await logUseCaseChange(
        beforeUseCase.id,
        beforeUseCase.meaningfulId,
        'deleted',
        beforeUseCase as Record<string, any>,
        null,
        'system',
        undefined,
        'api'
      );
    }
    
    return deleted;
  }

  // Two-tier library management methods
  async activateUseCase(id: string, reason?: string): Promise<UseCase | undefined> {
    // Check if use case is already active to prevent duplicates
    const [currentUseCase] = await db.select().from(useCases).where(eq(useCases.id, id));
    if (!currentUseCase) return undefined;
    
    if (currentUseCase.isActiveForRsa === 'true' && currentUseCase.libraryTier === 'active') {
      // Already active, return current state without changes
      return currentUseCase;
    }
    
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
    // Get current state of all use cases to check for duplicates
    const currentUseCases = await db.select().from(useCases).where(sql`id = ANY(${ids})`);
    
    // Filter out use cases that are already in the target tier to prevent unnecessary updates
    const useCasesToUpdate = currentUseCases.filter(useCase => {
      if (tier === 'active') {
        return useCase.isActiveForRsa !== 'true' || useCase.libraryTier !== 'active';
      } else {
        return useCase.isActiveForRsa !== 'false' || useCase.libraryTier !== 'reference';
      }
    });
    
    if (useCasesToUpdate.length === 0) {
      // All use cases are already in the target tier
      return currentUseCases;
    }
    
    const idsToUpdate = useCasesToUpdate.map(uc => uc.id);
    
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
      .where(sql`id = ANY(${idsToUpdate})`)
      .returning();
    
    // Return all originally requested use cases (updated and unchanged)
    return await db.select().from(useCases).where(sql`id = ANY(${ids})`);
  }

  async getMetadataConfig(): Promise<MetadataConfig | undefined> {
    const [config] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, 'default'));
    if (!config) return undefined;
    
    // Parse scoringModel if it's stored as JSON string (centralized parsing per replit.md)
    if (config.scoringModel && typeof config.scoringModel === 'string') {
      try {
        config.scoringModel = JSON.parse(config.scoringModel);
      } catch (error) {
        console.error('Failed to parse scoringModel JSON:', error);
        // Keep as string if parsing fails to prevent breaking
      }
    }
    
    return config;
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

  // Multi-client metadata support (Topic 5 - TOM Multi-Client)
  async getAllMetadataConfigIds(): Promise<string[]> {
    const configs = await db.select({ id: metadataConfig.id }).from(metadataConfig);
    return configs.map(c => c.id);
  }

  async getMetadataConfigById(id: string): Promise<MetadataConfig | undefined> {
    const [config] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, id));
    if (!config) {
      // Fallback to default if client-specific config not found
      if (id !== 'default') {
        return this.getMetadataConfig();
      }
      return undefined;
    }
    
    // Parse scoringModel if it's stored as JSON string
    if (config.scoringModel && typeof config.scoringModel === 'string') {
      try {
        config.scoringModel = JSON.parse(config.scoringModel);
      } catch (error) {
        console.error('Failed to parse scoringModel JSON:', error);
      }
    }
    
    return config;
  }

  async updateMetadataConfigById(id: string, metadata: Partial<MetadataConfig>): Promise<MetadataConfig | undefined> {
    // Check if the specific config exists (not just falling back to default)
    const [specificConfig] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, id));
    
    if (specificConfig) {
      // Update existing record
      const completeMetadata = {
        ...specificConfig,
        ...metadata,
        updatedAt: new Date()
      };

      const [config] = await db
        .update(metadataConfig)
        .set(completeMetadata)
        .where(eq(metadataConfig.id, id))
        .returning();
      
      return config;
    } else {
      // Insert new client-specific record (upsert behavior)
      const defaultConfig = await this.getMetadataConfig();
      const newConfig = {
        ...defaultConfig,
        ...metadata,
        id,
        updatedAt: new Date()
      };

      const [config] = await db
        .insert(metadataConfig)
        .values(newConfig as any)
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
      
      let updatedConfig = {
        ...currentConfig,
        [category]: updatedItems
      };

      // Auto-suggestion for new processes: Add logical activities based on RSA patterns
      if (category === 'processes') {
        const { processActivityMap } = await import('@shared/processActivityMap');
        const currentProcessActivities = currentConfig.processActivities 
          ? (typeof currentConfig.processActivities === 'string' 
             ? JSON.parse(currentConfig.processActivities) 
             : currentConfig.processActivities)
          : {};

        // Auto-suggest activities for new process based on predefined mapping
        if (processActivityMap[item] && !currentProcessActivities[item]) {
          updatedConfig.processActivities = {
            ...currentProcessActivities,
            [item]: processActivityMap[item]
          };
          console.log(`✅ Auto-suggested activities for new process "${item}":`, processActivityMap[item]);
        }
      }

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

  async editMetadataItem(category: string, oldItem: string, newItem: string): Promise<MetadataConfig> {
    const currentConfig = await this.getMetadataConfig();
    
    if (!currentConfig) {
      throw new Error('Metadata config not found');
    }

    // Get current items for the category
    const currentItems = (currentConfig as any)[category] || [];
    
    // Replace the old item with the new item
    const updatedItems = currentItems.map((item: string) => 
      item === oldItem ? newItem : item
    );

    // Handle process-activity mapping updates if editing processes
    let updatedConfig = {
      ...currentConfig,
      [category]: updatedItems
    };

    if (category === 'processes') {
      const currentProcessActivities = currentConfig.processActivities 
        ? (typeof currentConfig.processActivities === 'string' 
           ? JSON.parse(currentConfig.processActivities) 
           : currentConfig.processActivities)
        : {};

      // Update the process name in process-activity mapping
      if (currentProcessActivities[oldItem]) {
        const { [oldItem]: activities, ...rest } = currentProcessActivities;
        updatedConfig.processActivities = {
          ...rest,
          [newItem]: activities
        };
      }
    }
    
    return await this.updateMetadataConfig(updatedConfig);
  }

  async updateMetadataSortOrder(category: string, orderedItems: string[]): Promise<MetadataConfig> {
    const currentConfig = await this.getMetadataConfig();
    
    if (!currentConfig) {
      throw new Error('Metadata config not found');
    }

    // Create sort order mapping: item name -> index
    const sortOrder: Record<string, number> = {};
    orderedItems.forEach((item, index) => {
      sortOrder[item] = index;
    });

    // Determine the sort order field name
    const sortOrderFieldMap: Record<string, string> = {
      'activities': 'activitiesSortOrder',
      'processes': 'processesSortOrder',
      'linesOfBusiness': 'linesOfBusinessSortOrder',
      'businessSegments': 'businessSegmentsSortOrder',
      'geographies': 'geographiesSortOrder',
      'useCaseTypes': 'useCaseTypesSortOrder',
      'valueChainComponents': 'valueChainComponentsSortOrder',
      'sourceTypes': 'sourceTypesSortOrder',
      'useCaseStatuses': 'useCaseStatusesSortOrder',
      'aiMlTechnologies': 'aiMlTechnologiesSortOrder',
      'dataSources': 'dataSourcesSortOrder',
      'stakeholderGroups': 'stakeholderGroupsSortOrder',
      'quadrants': 'quadrantsSortOrder'
    };

    const sortOrderField = sortOrderFieldMap[category];
    if (!sortOrderField) {
      throw new Error(`Category ${category} does not support custom sorting`);
    }

    // Update the configuration with new sort order
    const updatedConfig = {
      ...currentConfig,
      [sortOrderField]: sortOrder
    };
    
    return await this.updateMetadataConfig(updatedConfig);
  }

  async updateProcessActivitySortOrder(processName: string, orderedActivities: string[]): Promise<MetadataConfig> {
    const currentConfig = await this.getMetadataConfig();
    
    if (!currentConfig) {
      throw new Error('Metadata config not found');
    }

    // Get current process-specific sort orders or initialize empty
    const currentProcessSortOrders = currentConfig.processActivitiesSortOrder || {};
    
    // Create sort order mapping for this process: activity name -> index
    const processSortOrder: Record<string, number> = {};
    orderedActivities.forEach((activity, index) => {
      processSortOrder[activity] = index;
    });

    // Update the nested structure
    const updatedProcessSortOrders = {
      ...currentProcessSortOrders,
      [processName]: processSortOrder
    };

    // Update the configuration with new process-specific sort order
    const updatedConfig = {
      ...currentConfig,
      processActivitiesSortOrder: updatedProcessSortOrders
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

      const rows: any[] = Array.isArray(result) ? result : (result as any).rows || [];
      
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
  
  // Duplicate Detection Implementation (Topic 3.4)
  async findSimilarUseCases(title: string, description: string, excludeId?: string): Promise<Array<{
    meaningfulId: string;
    title: string;
    similarityScore: number;
  }>> {
    return await findSimilarUseCases(title, description, excludeId);
  }
  
  async resolveDuplicate(id: string, status: 'confirmed_duplicate' | 'reviewed_not_duplicate', reviewedBy: string): Promise<UseCase | undefined> {
    const [useCase] = await db
      .update(useCases)
      .set({
        duplicateStatus: status,
        duplicateReviewedAt: new Date(),
        duplicateReviewedBy: reviewedBy
      })
      .where(eq(useCases.id, id))
      .returning();
    
    if (useCase) {
      await logUseCaseChange(
        useCase.id,
        useCase.meaningfulId,
        'duplicate_resolved',
        { duplicateStatus: useCase.duplicateStatus },
        { duplicateStatus: status, reviewedBy },
        reviewedBy,
        `Marked as ${status}`,
        'api'
      );
    }
    
    return useCase || undefined;
  }
  
  // Audit Trail Implementation (Topic 8.2)
  async getUseCaseChangeLog(useCaseId: string): Promise<UseCaseChangeLog[]> {
    const logs = await db.select()
      .from(useCaseChangeLog)
      .where(eq(useCaseChangeLog.useCaseId, useCaseId))
      .orderBy(sql`created_at DESC`);
    return logs;
  }
  
  async getAllChangeLogs(limit: number = 100): Promise<UseCaseChangeLog[]> {
    const logs = await db.select()
      .from(useCaseChangeLog)
      .orderBy(sql`created_at DESC`)
      .limit(limit);
    return logs;
  }
  
  // ==================== GOVERNANCE WORKFLOW IMPLEMENTATION ====================
  
  async getGovernancePendingUseCases(): Promise<UseCase[]> {
    const results = await db.select()
      .from(useCases)
      .where(sql`governance_status IN ('pending', 'in_review')`)
      .orderBy(sql`created_at DESC`);
    return results;
  }
  
  async getGovernanceSummary(): Promise<{
    pending: number;
    inReview: number;
    complete: number;
    rejected: number;
    byGate: {
      operatingModel: { pending: number; approved: number; rejected: number };
      intake: { pending: number; approved: number; rejected: number; deferred: number };
      rai: { pending: number; approved: number; conditionallyApproved: number; rejected: number };
    };
    legacyActivated: number;
  }> {
    const allUseCases = await db.select().from(useCases);
    
    const summary = {
      pending: 0,
      inReview: 0,
      complete: 0,
      rejected: 0,
      byGate: {
        operatingModel: { pending: 0, approved: 0, rejected: 0 },
        intake: { pending: 0, approved: 0, rejected: 0, deferred: 0 },
        rai: { pending: 0, approved: 0, conditionallyApproved: 0, rejected: 0 }
      },
      legacyActivated: 0
    };
    
    for (const uc of allUseCases) {
      // Main governance status
      if (uc.governanceStatus === 'pending') summary.pending++;
      else if (uc.governanceStatus === 'in_review') summary.inReview++;
      else if (uc.governanceStatus === 'complete') summary.complete++;
      else if (uc.governanceStatus === 'rejected') summary.rejected++;
      
      // Operating Model gate
      if (uc.operatingModelApproval === 'pending') summary.byGate.operatingModel.pending++;
      else if (uc.operatingModelApproval === 'approved') summary.byGate.operatingModel.approved++;
      else if (uc.operatingModelApproval === 'rejected') summary.byGate.operatingModel.rejected++;
      
      // Intake gate
      if (uc.intakeDecision === 'pending') summary.byGate.intake.pending++;
      else if (uc.intakeDecision === 'approved') summary.byGate.intake.approved++;
      else if (uc.intakeDecision === 'rejected') summary.byGate.intake.rejected++;
      else if (uc.intakeDecision === 'deferred') summary.byGate.intake.deferred++;
      
      // RAI gate
      if (uc.raiAssurance === 'pending') summary.byGate.rai.pending++;
      else if (uc.raiAssurance === 'approved') summary.byGate.rai.approved++;
      else if (uc.raiAssurance === 'conditionally_approved') summary.byGate.rai.conditionallyApproved++;
      else if (uc.raiAssurance === 'rejected') summary.byGate.rai.rejected++;
      
      // Legacy flag
      if (uc.legacyActivationFlag === 'true') summary.legacyActivated++;
    }
    
    return summary;
  }
  
  async submitForGovernance(id: string, reason: string, submittedBy: string): Promise<UseCase | undefined> {
    const [useCase] = await db
      .update(useCases)
      .set({
        governanceStatus: 'pending',
        governancePendingReason: reason,
        operatingModelApproval: 'pending',
        intakeDecision: 'pending',
        raiAssurance: 'pending'
      })
      .where(eq(useCases.id, id))
      .returning();
    
    if (useCase) {
      // Log to governance audit
      await db.insert(governanceAuditLog).values({
        useCaseId: useCase.id,
        useCaseMeaningfulId: useCase.meaningfulId,
        gateType: 'submission',
        action: 'submitted',
        actor: submittedBy,
        notes: reason,
        tomPhaseAtDecision: useCase.tomPhase
      });
    }
    
    return useCase || undefined;
  }
  
  async processOperatingModelGate(id: string, decision: 'approved' | 'rejected' | 'not_required', notes: string, actor: string): Promise<UseCase | undefined> {
    const [existing] = await db.select().from(useCases).where(eq(useCases.id, id));
    if (!existing) return undefined;
    
    const updates: Partial<UseCase> = {
      operatingModelApproval: decision,
      operatingModelApprovedAt: new Date(),
      operatingModelApprovedBy: actor,
      operatingModelNotes: notes
    };
    
    // If rejected, mark governance as rejected
    if (decision === 'rejected') {
      updates.governanceStatus = 'rejected';
    } else {
      updates.governanceStatus = 'in_review';
    }
    
    const [useCase] = await db
      .update(useCases)
      .set(updates)
      .where(eq(useCases.id, id))
      .returning();
    
    // Log to governance audit
    await db.insert(governanceAuditLog).values({
      useCaseId: useCase.id,
      useCaseMeaningfulId: useCase.meaningfulId,
      gateType: 'operating_model',
      action: decision,
      actor: actor,
      previousStatus: existing.operatingModelApproval,
      newStatus: decision,
      notes: notes,
      tomPhaseAtDecision: useCase.tomPhase
    });
    
    return useCase || undefined;
  }
  
  async processIntakeGate(id: string, decision: 'approved' | 'rejected' | 'deferred', notes: string, actor: string, priorityRank?: number): Promise<UseCase | undefined> {
    const [existing] = await db.select().from(useCases).where(eq(useCases.id, id));
    if (!existing) return undefined;
    
    // Gate sequencing validation: Operating Model must be approved first
    if (existing.operatingModelApproval !== 'approved' && existing.operatingModelApproval !== 'not_required') {
      throw new Error('GATE_SEQUENCE_ERROR: Operating Model gate must be approved before Intake decision');
    }
    
    const updates: Partial<UseCase> = {
      intakeDecision: decision,
      intakeDecisionAt: new Date(),
      intakeDecisionBy: actor,
      intakeDecisionNotes: notes,
      intakePriorityRank: priorityRank || null
    };
    
    // If rejected, mark governance as rejected
    if (decision === 'rejected') {
      updates.governanceStatus = 'rejected';
    }
    
    const [useCase] = await db
      .update(useCases)
      .set(updates)
      .where(eq(useCases.id, id))
      .returning();
    
    // Log to governance audit
    await db.insert(governanceAuditLog).values({
      useCaseId: useCase.id,
      useCaseMeaningfulId: useCase.meaningfulId,
      gateType: 'intake_decision',
      action: decision,
      actor: actor,
      previousStatus: existing.intakeDecision,
      newStatus: decision,
      notes: notes,
      tomPhaseAtDecision: useCase.tomPhase
    });
    
    return useCase || undefined;
  }
  
  async processRaiGate(id: string, decision: 'approved' | 'conditionally_approved' | 'rejected', notes: string, actor: string, riskLevel?: string): Promise<UseCase | undefined> {
    const [existing] = await db.select().from(useCases).where(eq(useCases.id, id));
    if (!existing) return undefined;
    
    // Gate sequencing validation: Operating Model and Intake must be approved first
    if (existing.operatingModelApproval !== 'approved' && existing.operatingModelApproval !== 'not_required') {
      throw new Error('GATE_SEQUENCE_ERROR: Operating Model gate must be approved before RAI assurance');
    }
    if (existing.intakeDecision !== 'approved') {
      throw new Error('GATE_SEQUENCE_ERROR: Intake decision must be approved before RAI assurance');
    }
    
    const updates: Partial<UseCase> = {
      raiAssurance: decision,
      raiAssuranceAt: new Date(),
      raiAssuranceBy: actor,
      raiAssuranceNotes: notes,
      raiRiskLevel: riskLevel || null
    };
    
    // Check if all gates will be complete after this update
    const allGatesApproved = 
      (existing.operatingModelApproval === 'approved' || existing.operatingModelApproval === 'not_required') &&
      existing.intakeDecision === 'approved' &&
      (decision === 'approved' || decision === 'conditionally_approved');
    
    if (decision === 'rejected') {
      updates.governanceStatus = 'rejected';
    } else if (allGatesApproved) {
      updates.governanceStatus = 'complete';
      updates.governanceCompletedAt = new Date();
      updates.governanceCompletedBy = actor;
      // Auto-activate to active portfolio
      updates.libraryTier = 'active';
      updates.activationDate = new Date();
    }
    
    const [useCase] = await db
      .update(useCases)
      .set(updates)
      .where(eq(useCases.id, id))
      .returning();
    
    // Log to governance audit
    await db.insert(governanceAuditLog).values({
      useCaseId: useCase.id,
      useCaseMeaningfulId: useCase.meaningfulId,
      gateType: 'rai_assurance',
      action: decision,
      actor: actor,
      previousStatus: existing.raiAssurance,
      newStatus: decision,
      notes: notes,
      tomPhaseAtDecision: useCase.tomPhase
    });
    
    // If fully activated, log activation
    if (allGatesApproved) {
      await db.insert(governanceAuditLog).values({
        useCaseId: useCase.id,
        useCaseMeaningfulId: useCase.meaningfulId,
        gateType: 'activation',
        action: 'activated',
        actor: actor,
        notes: 'All governance gates cleared - auto-activated to active portfolio',
        tomPhaseAtDecision: useCase.tomPhase
      });
    }
    
    return useCase || undefined;
  }
  
  async getGovernanceAuditLog(useCaseId: string): Promise<any[]> {
    const logs = await db.select()
      .from(governanceAuditLog)
      .where(eq(governanceAuditLog.useCaseId, useCaseId))
      .orderBy(sql`created_at DESC`);
    return logs;
  }

  /**
   * Create a governance audit log entry
   * Used by governance enforcement service for tracking:
   * - ACTIVATION_BLOCKED: When activation is rejected due to incomplete governance
   * - AUTO_DEACTIVATION: When use case is auto-deactivated due to gate regression
   * - PHASE_TRANSITION_OVERRIDE: When phase transition proceeds despite incomplete requirements
   * - LEGACY_GOVERNANCE_WARNING: When legacy use case would fail governance (warning only)
   */
  async createGovernanceAuditLog(entry: {
    useCaseId: string;
    useCaseMeaningfulId?: string;
    gateType: string;
    action: string;
    actor?: string;
    previousStatus?: string;
    newStatus?: string;
    notes?: string;
    evidence?: {
      documents?: string[];
      assessmentScores?: Record<string, number>;
      riskFactors?: string[];
      conditions?: string[];
    };
    tomPhaseAtDecision?: string;
  }): Promise<void> {
    await db.insert(governanceAuditLog).values({
      useCaseId: entry.useCaseId,
      useCaseMeaningfulId: entry.useCaseMeaningfulId || null,
      gateType: entry.gateType,
      action: entry.action,
      actor: entry.actor || 'system',
      previousStatus: entry.previousStatus || null,
      newStatus: entry.newStatus || null,
      notes: entry.notes || null,
      evidence: entry.evidence || null,
      tomPhaseAtDecision: entry.tomPhaseAtDecision || null
    });
  }

  // Client Management
  async getAllClients(): Promise<Client[]> {
    const result = await db.select().from(clients).orderBy(clients.name);
    return result;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values({
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  // Engagement Management
  async getAllEngagements(): Promise<Engagement[]> {
    const result = await db.select().from(engagements).orderBy(engagements.name);
    return result;
  }

  async getEngagementsByClient(clientId: string): Promise<Engagement[]> {
    const result = await db.select()
      .from(engagements)
      .where(eq(engagements.clientId, clientId))
      .orderBy(engagements.name);
    return result;
  }

  async getEngagement(id: string): Promise<Engagement | undefined> {
    const result = await db.select().from(engagements).where(eq(engagements.id, id));
    return result[0];
  }

  async getDefaultEngagement(): Promise<Engagement | undefined> {
    const result = await db.select()
      .from(engagements)
      .where(eq(engagements.isDefault, 'true'));
    return result[0];
  }

  async createEngagement(engagement: InsertEngagement): Promise<Engagement> {
    // createdAt and updatedAt are auto-generated by database defaults
    const result = await db.insert(engagements).values(engagement as typeof engagements.$inferInsert).returning();
    return result[0];
  }

  async updateEngagement(id: string, updates: Partial<Engagement>): Promise<Engagement | undefined> {
    // Prevent changing TOM preset if already locked
    const existing = await this.getEngagement(id);
    if (existing?.tomPresetLocked === 'true' && updates.tomPresetId && updates.tomPresetId !== existing.tomPresetId) {
      throw new Error('Cannot change TOM preset - it is already locked for this engagement');
    }
    
    const result = await db.update(engagements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(engagements.id, id))
      .returning();
    return result[0];
  }

  async lockEngagementTom(id: string): Promise<Engagement | undefined> {
    const result = await db.update(engagements)
      .set({ tomPresetLocked: 'true', updatedAt: new Date() })
      .where(eq(engagements.id, id))
      .returning();
    return result[0];
  }

  async deleteEngagement(id: string): Promise<boolean> {
    // Check if engagement has use cases
    const useCasesInEngagement = await this.getUseCasesByEngagement(id);
    if (useCasesInEngagement.length > 0) {
      throw new Error('Cannot delete engagement with existing use cases');
    }
    const result = await db.delete(engagements).where(eq(engagements.id, id)).returning();
    return result.length > 0;
  }

  // Use case filtering by engagement
  async getUseCasesByEngagement(engagementId: string): Promise<UseCase[]> {
    const result = await db.select()
      .from(useCases)
      .where(eq(useCases.engagementId, engagementId));
    return result;
  }
}

// Use DatabaseStorage for database-first compliance per REFERENCE.md
export const storage = new DatabaseStorage();