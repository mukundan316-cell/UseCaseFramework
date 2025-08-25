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
  thirdPartyProvidedModel?: string;
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
    // Ensure arrays exist for backward compatibility
    linesOfBusiness: dbUseCase.linesOfBusiness || [dbUseCase.lineOfBusiness].filter(Boolean)
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