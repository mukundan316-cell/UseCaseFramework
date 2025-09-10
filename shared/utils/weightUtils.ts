/**
 * LEGO-style Weight Utility - Centralized weight retrieval for scoring calculations
 * Follows replit.md principles: reusable components, centralized config, quick wins without complexity
 */

import { APP_CONFIG } from '../constants/app-config';

export interface ImpactWeights {
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  brokerPartnerExperience: number;
  strategicFit: number;
}

export interface EffortWeights {
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  modelRisk: number;
  adoptionReadiness: number;
}

/**
 * Centralized function to get Impact (Business Value) weights from metadata
 * Consistent API field name: metadata.scoringModel.businessValue
 */
export function getImpactWeights(metadata: any): ImpactWeights {
  return metadata?.scoringModel?.businessValue || {
    revenueImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.REVENUE_IMPACT,
    costSavings: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.COST_SAVINGS,
    riskReduction: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.RISK_REDUCTION,
    brokerPartnerExperience: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.BROKER_PARTNER_EXPERIENCE,
    strategicFit: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.STRATEGIC_FIT
  };
}

/**
 * Centralized function to get Effort (Implementation) weights from metadata
 * Consistent API field name: metadata.scoringModel.feasibility
 */
export function getEffortWeights(metadata: any): EffortWeights {
  return metadata?.scoringModel?.feasibility || {
    dataReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.DATA_READINESS,
    technicalComplexity: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.TECHNICAL_COMPLEXITY,
    changeImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.CHANGE_IMPACT,
    modelRisk: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.MODEL_RISK,
    adoptionReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.ADOPTION_READINESS
  };
}

/**
 * Get formatted weight display string for tooltips
 * Used in UI components to show actual configured weights
 */
export function getImpactWeightDisplay(metadata: any): string {
  const weights = getImpactWeights(metadata);
  return `• Revenue Impact (${weights.revenueImpact}%)
• Cost Savings (${weights.costSavings}%)
• Risk Reduction (${weights.riskReduction}%)
• Broker/Partner Experience (${weights.brokerPartnerExperience}%)
• Strategic Fit (${weights.strategicFit}%)`;
}

/**
 * Get formatted effort weight display string for tooltips
 * Used in UI components to show actual configured weights
 */
export function getEffortWeightDisplay(metadata: any): string {
  const weights = getEffortWeights(metadata);
  return `• Data Readiness (${weights.dataReadiness}%)
• Technical Complexity (${weights.technicalComplexity}%)
• Change Impact (${weights.changeImpact}%)
• Model Risk (${weights.modelRisk}%)
• Adoption Readiness (${weights.adoptionReadiness}%)`;
}