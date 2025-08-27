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
  // RSA Portfolio Selection fields
  isActiveForRsa?: boolean;
  isDashboardVisible?: boolean;
  libraryTier?: string;
  librarySource?: string;
  activationReason?: string;
  deactivationReason?: string;
  activationDate?: Date;
  createdAt?: Date;
  // Manual Override fields
  manualImpactScore?: number;
  manualEffortScore?: number;
  manualQuadrant?: string;
  overrideReason?: string;
  // AI Inventory specific fields
  aiInventoryStatus?: string;
  deploymentStatus?: string;
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
  // RSA Ethical Principles
  explainabilityRequired?: string;
  customerHarmRisk?: string;
  dataOutsideUkEu?: string;
  thirdPartyModel?: string;
  humanAccountability?: string;
  explainabilityBias?: string;
  regulatoryCompliance?: number;
  // Missing AI governance field from database
  thirdPartyProvidedModel?: string;
}

/**
 * Maps database UseCase to frontend format with minimal transformation
 * Drizzle automatically handles snake_case ↔ camelCase conversion
 */
export function mapUseCaseToFrontend(dbUseCase: UseCase): UseCaseFrontend {
  return {
    ...dbUseCase,
    // Convert string booleans to actual booleans for UI
    isActiveForRsa: dbUseCase.isActiveForRsa === 'true',
    isDashboardVisible: dbUseCase.isDashboardVisible === 'true',
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
    deactivationReason: dbUseCase.deactivationReason || undefined,
    thirdPartyProvidedModel: dbUseCase.thirdPartyProvidedModel || undefined,
    // AI governance fields null conversion
    explainabilityRequired: dbUseCase.explainabilityRequired || undefined,
    customerHarmRisk: dbUseCase.customerHarmRisk || undefined,
    dataOutsideUkEu: dbUseCase.dataOutsideUkEu || undefined,
    thirdPartyModel: dbUseCase.thirdPartyModel || undefined,
    humanAccountability: dbUseCase.humanAccountability || undefined,
    aiOrModel: dbUseCase.aiOrModel || undefined,
    riskToCustomers: dbUseCase.riskToCustomers || undefined,
    riskToRsa: dbUseCase.riskToRsa || undefined,
    dataUsed: dbUseCase.dataUsed || undefined,
    modelOwner: dbUseCase.modelOwner || undefined,
    rsaPolicyGovernance: dbUseCase.rsaPolicyGovernance || undefined,
    validationResponsibility: dbUseCase.validationResponsibility || undefined,
    informedBy: dbUseCase.informedBy || undefined,
    // Convert Date fields from null to undefined
    activationDate: dbUseCase.activationDate || undefined,
    deactivationDate: dbUseCase.deactivationDate || undefined,
    lastStatusUpdate: dbUseCase.lastStatusUpdate || undefined,
    createdAt: dbUseCase.createdAt || undefined
  };
}

/**
 * Maps frontend UseCase data to database format for API calls
 * Drizzle automatically handles camelCase ↔ snake_case conversion
 */
export function mapUseCaseToDatabase(frontendUseCase: Partial<UseCaseFrontend>): Partial<UseCase> {
  const { valueChainComponent, ...rest } = frontendUseCase;
  return {
    ...rest,
    // Convert boolean back to string for database storage
    isActiveForRsa: frontendUseCase.isActiveForRsa ? 'true' : 'false',
    isDashboardVisible: frontendUseCase.isDashboardVisible ? 'true' : 'false'
  } as Partial<UseCase>;
}