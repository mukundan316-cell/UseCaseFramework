/**
 * Data mappers for converting between database snake_case and frontend camelCase
 * Essential for proper form population in CRUD operations
 */

import type { UseCase } from './schema';

export interface UseCaseFrontend {
  id: string;
  title: string;
  description: string;
  problemStatement?: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  linesOfBusiness?: string[];
  businessSegment: string;
  geography: string;
  useCaseType: string;
  // Multi-select arrays
  processes?: string[];
  activities?: string[];
  businessSegments?: string[];
  geographies?: string[];
  // Enhanced RSA Framework fields
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  brokerPartnerExperience: number;
  strategicFit: number;
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  modelRisk: number;
  adoptionReadiness: number;
  impactScore: number;
  effortScore: number;
  quadrant: string;
  // RSA Portfolio Selection fields - consistent string types per replit.md
  isActiveForRsa?: 'true' | 'false' | null;
  isDashboardVisible?: 'true' | 'false' | null;
  libraryTier?: string;
  librarySource?: string;
  activationReason?: string;
  activationDate?: Date;
  createdAt?: Date;
  // Manual Override fields - match database nullable types
  manualImpactScore?: number | null;
  manualEffortScore?: number | null;
  manualQuadrant?: string | null;
  overrideReason?: string;
  // AI Inventory specific fields - match database null types
  aiInventoryStatus?: string | null;
  deploymentStatus?: string | null;
  businessFunction?: string;
  modelOwner?: string;
  lastStatusUpdate?: Date;
  // AI Governance fields
  aiOrModel?: string;
  riskToCustomers?: string;
  riskToRsa?: string;
  dataUsed?: string;
  rsaPolicyGovernance?: string;
  validationResponsibility?: string;
  informedBy?: string;
  // Implementation & Governance fields
  primaryBusinessOwner?: string;
  useCaseStatus?: string;
  keyDependencies?: string;
  implementationTimeline?: string;
  successMetrics?: string;
  estimatedValue?: string;
  valueMeasurementApproach?: string;
  integrationRequirements?: string;
  // Technology & Data fields
  aiMlTechnologies?: string[];
  dataSources?: string[];
  stakeholderGroups?: string[];
  // RSA Ethical Principles - consistent string types per replit.md
  explainabilityRequired?: 'true' | 'false' | null;
  customerHarmRisk?: string;
  dataOutsideUkEu?: 'true' | 'false' | null;
  thirdPartyModel?: 'true' | 'false' | null;
  humanAccountability?: 'true' | 'false' | null;
  regulatoryCompliance?: number;
  // Missing AI governance field from database
  thirdPartyProvidedModel?: string;
  // Presentation fields - support both legacy URLs and new database storage
  presentationUrl?: string;
  presentationPdfUrl?: string;
  presentationFileName?: string;
  hasPresentation?: 'true' | 'false';
}

/**
 * Maps database UseCase to frontend format with minimal transformation
 * Drizzle automatically handles snake_case ↔ camelCase conversion
 */
/**
 * Maps database UseCase (snake_case) to frontend format (camelCase)
 * Handles array serialization and null safety for form population
 * Essential for CRUD operations and data consistency
 */
export function mapUseCaseToFrontend(dbUseCase: UseCase): UseCaseFrontend {
  return {
    ...dbUseCase,
    // Direct passthrough - no transformation needed per replit.md
    isActiveForRsa: dbUseCase.isActiveForRsa as 'true' | 'false' | null,
    isDashboardVisible: dbUseCase.isDashboardVisible as 'true' | 'false' | null,
    // Add process as valueChainComponent alias for backward compatibility
    valueChainComponent: dbUseCase.process,
    // Ensure arrays exist for backward compatibility - convert null to undefined
    linesOfBusiness: dbUseCase.linesOfBusiness || [dbUseCase.lineOfBusiness].filter(Boolean),
    businessSegments: dbUseCase.businessSegments || undefined,
    geographies: dbUseCase.geographies || undefined,
    processes: dbUseCase.processes || undefined,
    activities: dbUseCase.activities || undefined,
    aiMlTechnologies: dbUseCase.aiMlTechnologies || undefined,
    dataSources: dbUseCase.dataSources || undefined,
    stakeholderGroups: dbUseCase.stakeholderGroups || undefined,
    // Convert null to undefined for proper frontend handling
    problemStatement: dbUseCase.problemStatement || undefined,
    // Ensure all optional fields are properly mapped - convert null to undefined
    primaryBusinessOwner: dbUseCase.primaryBusinessOwner || undefined,
    useCaseStatus: dbUseCase.useCaseStatus || undefined,
    keyDependencies: dbUseCase.keyDependencies || undefined,
    implementationTimeline: dbUseCase.implementationTimeline || undefined,
    successMetrics: dbUseCase.successMetrics || undefined,
    estimatedValue: dbUseCase.estimatedValue || undefined,
    valueMeasurementApproach: dbUseCase.valueMeasurementApproach || undefined,
    integrationRequirements: dbUseCase.integrationRequirements || undefined,
    // Convert all null values to undefined for frontend compatibility
    activationReason: dbUseCase.activationReason || undefined,
    thirdPartyProvidedModel: dbUseCase.thirdPartyProvidedModel || undefined,
    // AI governance fields - direct passthrough per replit.md
    explainabilityRequired: dbUseCase.explainabilityRequired as 'true' | 'false' | null,
    customerHarmRisk: dbUseCase.customerHarmRisk || undefined,
    dataOutsideUkEu: dbUseCase.dataOutsideUkEu as 'true' | 'false' | null,
    thirdPartyModel: dbUseCase.thirdPartyModel as 'true' | 'false' | null,
    humanAccountability: dbUseCase.humanAccountability as 'true' | 'false' | null,
    regulatoryCompliance: dbUseCase.regulatoryCompliance !== null ? dbUseCase.regulatoryCompliance : undefined,
    aiOrModel: dbUseCase.aiOrModel || undefined,
    riskToCustomers: dbUseCase.riskToCustomers || undefined,
    riskToRsa: dbUseCase.riskToRsa || undefined,
    dataUsed: dbUseCase.dataUsed || undefined,
    modelOwner: dbUseCase.modelOwner || undefined,
    rsaPolicyGovernance: dbUseCase.rsaPolicyGovernance || undefined,
    validationResponsibility: dbUseCase.validationResponsibility || undefined,
    informedBy: dbUseCase.informedBy || undefined,
    businessFunction: dbUseCase.businessFunction || undefined,
    // Manual override fields - preserve null values for proper type compatibility
    manualImpactScore: dbUseCase.manualImpactScore,
    manualEffortScore: dbUseCase.manualEffortScore,
    manualQuadrant: dbUseCase.manualQuadrant || undefined,
    overrideReason: dbUseCase.overrideReason || undefined,
    // Convert Date fields from null to undefined
    activationDate: dbUseCase.activationDate || undefined,
    lastStatusUpdate: dbUseCase.lastStatusUpdate || undefined,
    createdAt: dbUseCase.createdAt || undefined,
    // Presentation fields - handle both legacy URLs and new database file IDs
    presentationUrl: dbUseCase.presentationFileId 
      ? `/api/presentations/files/${dbUseCase.presentationFileId}` 
      : (dbUseCase.presentationUrl || undefined),
    presentationPdfUrl: dbUseCase.presentationPdfFileId 
      ? `/api/presentations/files/${dbUseCase.presentationPdfFileId}` 
      : (dbUseCase.presentationPdfUrl || undefined),
    presentationFileName: dbUseCase.presentationFileName || undefined,
    hasPresentation: dbUseCase.hasPresentation as 'true' | 'false' || 'false'
  };
}

/**
 * Maps frontend UseCase data to database format for API calls
 * Drizzle automatically handles camelCase ↔ snake_case conversion
 */
/**
 * Maps frontend form data (camelCase) to database format (snake_case)
 * Serializes arrays to JSON and handles boolean string conversion
 * Used for create/update operations
 */
export function mapUseCaseToDatabase(frontendUseCase: Partial<UseCaseFrontend>): Partial<UseCase> {
  const { valueChainComponent, ...rest } = frontendUseCase;
  return {
    ...rest,
    // Direct passthrough - no transformation needed per replit.md
    isActiveForRsa: frontendUseCase.isActiveForRsa,
    isDashboardVisible: frontendUseCase.isDashboardVisible,
    explainabilityRequired: frontendUseCase.explainabilityRequired,
    dataOutsideUkEu: frontendUseCase.dataOutsideUkEu,
    thirdPartyModel: frontendUseCase.thirdPartyModel,
    humanAccountability: frontendUseCase.humanAccountability
  } as Partial<UseCase>;
}