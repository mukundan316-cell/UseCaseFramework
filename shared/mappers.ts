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
 * Maps database UseCase (snake_case) to frontend format (camelCase)
 */
export function mapUseCaseToFrontend(dbUseCase: UseCase): UseCaseFrontend {
  return {
    id: dbUseCase.id,
    title: dbUseCase.title,
    description: dbUseCase.description,
    problemStatement: dbUseCase.problemStatement ?? undefined,
    valueChainComponent: dbUseCase.process, // Using process as valueChainComponent
    process: dbUseCase.process,
    lineOfBusiness: dbUseCase.lineOfBusiness,
    linesOfBusiness: dbUseCase.linesOfBusiness || [dbUseCase.lineOfBusiness].filter(Boolean),
    businessSegment: dbUseCase.businessSegment,
    geography: dbUseCase.geography,
    useCaseType: dbUseCase.useCaseType,
    // Enhanced RSA Framework mappings
    revenueImpact: dbUseCase.revenueImpact,
    costSavings: dbUseCase.costSavings,
    riskReduction: dbUseCase.riskReduction,
    brokerPartnerExperience: dbUseCase.brokerPartnerExperience,
    strategicFit: dbUseCase.strategicFit,
    dataReadiness: dbUseCase.dataReadiness,
    technicalComplexity: dbUseCase.technicalComplexity,
    changeImpact: dbUseCase.changeImpact,
    modelRisk: dbUseCase.modelRisk,
    adoptionReadiness: dbUseCase.adoptionReadiness,
    impactScore: dbUseCase.impactScore,
    effortScore: dbUseCase.effortScore,
    quadrant: dbUseCase.quadrant,
    // RSA Portfolio Selection fields
    isActiveForRsa: dbUseCase.isActiveForRsa === 'true',
    isDashboardVisible: dbUseCase.isDashboardVisible === 'true',
    libraryTier: dbUseCase.libraryTier,
    librarySource: dbUseCase.librarySource,
    activationReason: dbUseCase.activationReason ?? undefined,
    deactivationReason: dbUseCase.deactivationReason ?? undefined,
    activationDate: dbUseCase.activationDate ?? undefined,
    createdAt: dbUseCase.createdAt ?? undefined,
    // Manual Override field mappings
    manualImpactScore: dbUseCase.manualImpactScore ?? undefined,
    manualEffortScore: dbUseCase.manualEffortScore ?? undefined,
    manualQuadrant: dbUseCase.manualQuadrant ?? undefined,
    overrideReason: dbUseCase.overrideReason ?? undefined,
    // AI Inventory specific fields
    aiInventoryStatus: dbUseCase.aiInventoryStatus ?? undefined,
    deploymentStatus: dbUseCase.deploymentStatus ?? undefined,
    businessFunction: dbUseCase.businessFunction ?? undefined,
    modelOwner: dbUseCase.modelOwner ?? undefined,
    lastStatusUpdate: dbUseCase.lastStatusUpdate ?? undefined,
    thirdPartyProvidedModel: dbUseCase.thirdPartyProvidedModel ?? undefined,
    // AI Governance fields
    aiOrModel: dbUseCase.aiOrModel ?? undefined,
    riskToCustomers: dbUseCase.riskToCustomers ?? undefined,
    riskToRsa: dbUseCase.riskToRsa ?? undefined,
    dataUsed: dbUseCase.dataUsed ?? undefined,
    rsaPolicyGovernance: dbUseCase.rsaPolicyGovernance ?? undefined,
    validationResponsibility: dbUseCase.validationResponsibility ?? undefined,
    informedBy: dbUseCase.informedBy ?? undefined,
    // Implementation & Governance fields
    primaryBusinessOwner: dbUseCase.primaryBusinessOwner ?? undefined,
    useCaseStatus: dbUseCase.useCaseStatus ?? undefined,
    keyDependencies: dbUseCase.keyDependencies ?? undefined,
    implementationTimeline: dbUseCase.implementationTimeline ?? undefined,
    successMetrics: dbUseCase.successMetrics ?? undefined,
    estimatedValue: dbUseCase.estimatedValue ?? undefined,
    valueMeasurementApproach: dbUseCase.valueMeasurementApproach ?? undefined,
    integrationRequirements: dbUseCase.integrationRequirements ?? undefined,
    // Technology & Data fields
    aiMlTechnologies: dbUseCase.aiMlTechnologies ?? undefined,
    dataSources: dbUseCase.dataSources ?? undefined,
    stakeholderGroups: dbUseCase.stakeholderGroups ?? undefined,
    // RSA Ethical Principles
    explainabilityRequired: dbUseCase.explainabilityRequired ?? undefined,
    customerHarmRisk: dbUseCase.customerHarmRisk ?? undefined,
    dataOutsideUkEu: dbUseCase.dataOutsideUkEu ?? undefined,
    thirdPartyModel: dbUseCase.thirdPartyModel ?? undefined,
    humanAccountability: dbUseCase.humanAccountability ?? undefined,
    // Multi-select arrays
    processes: dbUseCase.processes ?? undefined,
    activities: dbUseCase.activities ?? undefined,
    businessSegments: dbUseCase.businessSegments ?? undefined,
    geographies: dbUseCase.geographies ?? undefined
  };
}

/**
 * Maps frontend UseCase data to database format for API calls
 */
export function mapUseCaseToDatabase(frontendUseCase: Partial<UseCaseFrontend>): Partial<UseCase> {
  return {
    id: frontendUseCase.id,
    title: frontendUseCase.title,
    description: frontendUseCase.description,
    process: frontendUseCase.process,
    lineOfBusiness: frontendUseCase.lineOfBusiness,
    businessSegment: frontendUseCase.businessSegment,
    geography: frontendUseCase.geography,
    useCaseType: frontendUseCase.useCaseType,
    // Enhanced RSA Framework mappings
    revenueImpact: frontendUseCase.revenueImpact,
    costSavings: frontendUseCase.costSavings,
    riskReduction: frontendUseCase.riskReduction,
    brokerPartnerExperience: frontendUseCase.brokerPartnerExperience,
    strategicFit: frontendUseCase.strategicFit,
    dataReadiness: frontendUseCase.dataReadiness,
    technicalComplexity: frontendUseCase.technicalComplexity,
    changeImpact: frontendUseCase.changeImpact,
    modelRisk: frontendUseCase.modelRisk,
    adoptionReadiness: frontendUseCase.adoptionReadiness,
    impactScore: frontendUseCase.impactScore,
    effortScore: frontendUseCase.effortScore,
    quadrant: frontendUseCase.quadrant,
    createdAt: frontendUseCase.createdAt
  };
}