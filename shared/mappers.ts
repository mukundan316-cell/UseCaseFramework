/**
 * Data mappers for converting between database snake_case and frontend camelCase
 * Essential for proper form population in CRUD operations
 */

import type { UseCase } from './schema';

export interface UseCaseFrontend {
  id: string;
  title: string;
  description: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  linesOfBusiness?: string[];
  businessSegment: string;
  geography: string;
  useCaseType: string;
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
  explainabilityBias: number;
  regulatoryCompliance: number;
  impactScore: number;
  effortScore: number;
  quadrant: string;
  createdAt?: Date;
}

/**
 * Maps database UseCase (snake_case) to frontend format (camelCase)
 */
export function mapUseCaseToFrontend(dbUseCase: UseCase): UseCaseFrontend {
  return {
    id: dbUseCase.id,
    title: dbUseCase.title,
    description: dbUseCase.description,
    valueChainComponent: dbUseCase.valueChainComponent,
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
    explainabilityBias: dbUseCase.explainabilityBias,
    regulatoryCompliance: dbUseCase.regulatoryCompliance,
    impactScore: dbUseCase.impactScore,
    effortScore: dbUseCase.effortScore,
    quadrant: dbUseCase.quadrant,
    createdAt: dbUseCase.createdAt ?? undefined
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
    valueChainComponent: frontendUseCase.valueChainComponent,
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
    explainabilityBias: frontendUseCase.explainabilityBias,
    regulatoryCompliance: frontendUseCase.regulatoryCompliance,
    impactScore: frontendUseCase.impactScore,
    effortScore: frontendUseCase.effortScore,
    quadrant: frontendUseCase.quadrant,
    createdAt: frontendUseCase.createdAt
  };
}