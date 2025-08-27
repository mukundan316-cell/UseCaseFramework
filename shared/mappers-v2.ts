/**
 * Enhanced Data Mappers for Boolean Field Migration
 * Simplified mapping with proper boolean types - no more string conversion needed!
 * Following replit.md principles: consistent camelCase and type safety
 */

import type { UseCase_v2 } from './schema-v2';

export interface UseCaseFrontend_v2 {
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
  
  // RSA Portfolio Selection fields - NOW WITH PROPER BOOLEAN TYPES!
  isActiveForRsa: boolean;  // No more string conversion needed
  isDashboardVisible: boolean;  // No more string conversion needed
  libraryTier?: string;
  librarySource?: string;
  activationReason?: string;
  activationDate?: Date;
  createdAt?: Date;
  
  // Manual Override fields
  manualImpactScore?: number | null;
  manualEffortScore?: number | null;
  manualQuadrant?: string | null;
  overrideReason?: string;
  
  // AI Inventory specific fields
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
  
  // RSA Ethical Principles - NOW WITH PROPER BOOLEAN TYPES!
  explainabilityRequired?: boolean;  // No more null checking needed
  customerHarmRisk?: string;
  dataOutsideUkEu?: boolean;  // No more null checking needed
  thirdPartyModel?: boolean;  // No more null checking needed
  humanAccountability?: boolean;  // No more null checking needed
  regulatoryCompliance?: number;
  thirdPartyProvidedModel?: string;
}

/**
 * Simplified mapper with proper boolean types - no more complex conversions!
 * This is much cleaner and follows TypeScript best practices
 */
export function mapUseCaseToFrontend_v2(dbUseCase: UseCase_v2): UseCaseFrontend_v2 {
  return {
    ...dbUseCase,
    // Boolean fields need null to undefined conversion for frontend compatibility
    explainabilityRequired: dbUseCase.explainabilityRequired ?? undefined,
    dataOutsideUkEu: dbUseCase.dataOutsideUkEu ?? undefined,
    thirdPartyModel: dbUseCase.thirdPartyModel ?? undefined,
    humanAccountability: dbUseCase.humanAccountability ?? undefined,
    
    // Add process as valueChainComponent alias for backward compatibility
    valueChainComponent: dbUseCase.process,
    
    // Array handling - convert null to undefined for frontend compatibility
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
    primaryBusinessOwner: dbUseCase.primaryBusinessOwner || undefined,
    useCaseStatus: dbUseCase.useCaseStatus || undefined,
    keyDependencies: dbUseCase.keyDependencies || undefined,
    implementationTimeline: dbUseCase.implementationTimeline || undefined,
    successMetrics: dbUseCase.successMetrics || undefined,
    estimatedValue: dbUseCase.estimatedValue || undefined,
    valueMeasurementApproach: dbUseCase.valueMeasurementApproach || undefined,
    integrationRequirements: dbUseCase.integrationRequirements || undefined,
    activationReason: dbUseCase.activationReason || undefined,
    thirdPartyProvidedModel: dbUseCase.thirdPartyProvidedModel || undefined,
    customerHarmRisk: dbUseCase.customerHarmRisk || undefined,
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
    createdAt: dbUseCase.createdAt || undefined
  };
}

/**
 * Simplified reverse mapper - boolean fields stay boolean!
 */
export function mapUseCaseToDatabase_v2(frontendUseCase: Partial<UseCaseFrontend_v2>): Partial<UseCase_v2> {
  const { valueChainComponent, ...rest } = frontendUseCase;
  return {
    ...rest,
    // No boolean conversion needed - they're already boolean!
    // isActiveForRsa: frontendUseCase.isActiveForRsa,  // Already boolean
    // isDashboardVisible: frontendUseCase.isDashboardVisible,  // Already boolean
  } as Partial<UseCase_v2>;
}