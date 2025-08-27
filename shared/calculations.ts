import { APP_CONFIG } from './constants/app-config';

/**
 * Calculates impact score using comprehensive RSA framework with weighted scoring
 * Applies configurable weights from database configuration
 * Per RSA AI Framework specification
 */
export function calculateImpactScore(
  revenueImpact: number,
  costSavings: number,
  riskReduction: number,
  brokerPartnerExperience: number,
  strategicFit: number,
  weights?: {
    revenueImpact: number;
    costSavings: number;
    riskReduction: number;
    brokerPartnerExperience: number;
    strategicFit: number;
  }
): number {
  // Add null safety for numeric inputs
  const safeRevenueImpact = revenueImpact ?? 0;
  const safeCostSavings = costSavings ?? 0;
  const safeRiskReduction = riskReduction ?? 0;
  const safeBrokerPartnerExperience = brokerPartnerExperience ?? 0;
  const safeStrategicFit = strategicFit ?? 0;

  // Use provided weights or default to equal weighting (20% each)
  const w = weights || {
    revenueImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.REVENUE_IMPACT,
    costSavings: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.COST_SAVINGS,
    riskReduction: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.RISK_REDUCTION,
    brokerPartnerExperience: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.BROKER_PARTNER_EXPERIENCE,
    strategicFit: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.STRATEGIC_FIT
  };

  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (safeRevenueImpact * w.revenueImpact / 100) +
    (safeCostSavings * w.costSavings / 100) +
    (safeRiskReduction * w.riskReduction / 100) +
    (safeBrokerPartnerExperience * w.brokerPartnerExperience / 100) +
    (safeStrategicFit * w.strategicFit / 100)
  );

  return Math.max(0, Math.min(5, weightedScore)); // Ensure result is within 0-5 range preserving full precision
}

/**
 * Calculates effort score using comprehensive RSA framework with weighted scoring
 * Applies configurable weights from database configuration
 * Per RSA AI Framework specification
 */
export function calculateEffortScore(
  dataReadiness: number,
  technicalComplexity: number,
  changeImpact: number,
  modelRisk: number,
  adoptionReadiness: number,
  weights?: {
    dataReadiness: number;
    technicalComplexity: number;
    changeImpact: number;
    modelRisk: number;
    adoptionReadiness: number;
  }
): number {
  // Add null safety for numeric inputs
  const safeDataReadiness = dataReadiness ?? 0;
  const safeTechnicalComplexity = technicalComplexity ?? 0;
  const safeChangeImpact = changeImpact ?? 0;
  const safeModelRisk = modelRisk ?? 0;
  const safeAdoptionReadiness = adoptionReadiness ?? 0;

  // Use provided weights or default to equal weighting (20% each)
  const w = weights || {
    dataReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.DATA_READINESS,
    technicalComplexity: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.TECHNICAL_COMPLEXITY,
    changeImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.CHANGE_IMPACT,
    modelRisk: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.MODEL_RISK,
    adoptionReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.ADOPTION_READINESS
  };

  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (safeDataReadiness * w.dataReadiness / 100) +
    (safeTechnicalComplexity * w.technicalComplexity / 100) +
    (safeChangeImpact * w.changeImpact / 100) +
    (safeModelRisk * w.modelRisk / 100) +
    (safeAdoptionReadiness * w.adoptionReadiness / 100)
  );

  return Math.max(0, Math.min(5, weightedScore)); // Ensure result is within 0-5 range preserving full precision
}


/**
 * Determines quadrant based on impact and effort scores with configurable threshold
 * Y-axis = Business Value (Impact) - Higher is better
 * X-axis = Implementation Complexity (Effort) - Lower is better (left = easy, right = hard)
 * 
 * Quadrant Mapping (RSA Framework):
 * - Quick Win: impact >= threshold && effort < threshold (Top Left - High Value, Low Complexity - Easy + Valuable)
 * - Strategic Bet: impact >= threshold && effort >= threshold (Top Right - High Value, High Complexity - Hard + Valuable)  
 * - Experimental: impact < threshold && effort < threshold (Bottom Left - Low Value, Low Complexity - Easy + Low Value)
 * - Watchlist: impact < threshold && effort >= threshold (Bottom Right - Low Value, High Complexity - Hard + Low Value)
 */
export function calculateQuadrant(
  impactScore: number, 
  effortScore: number, 
  threshold: number = APP_CONFIG.SCORING.DEFAULT_THRESHOLD
): string {
  if (impactScore >= threshold && effortScore < threshold) {
    return "Quick Win";
  } else if (impactScore >= threshold && effortScore >= threshold) {
    return "Strategic Bet";
  } else if (impactScore < threshold && effortScore < threshold) {
    return "Experimental";
  } else {
    return "Watchlist";
  }
}

// Note: calculateGovernanceScore was removed as it's not implemented