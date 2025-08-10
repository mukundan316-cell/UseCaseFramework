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
  // Use provided weights or default to equal weighting (20% each)
  const w = weights || {
    revenueImpact: 20,
    costSavings: 20,
    riskReduction: 20,
    brokerPartnerExperience: 20,
    strategicFit: 20
  };
  
  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (revenueImpact * w.revenueImpact / 100) +
    (costSavings * w.costSavings / 100) +
    (riskReduction * w.riskReduction / 100) +
    (brokerPartnerExperience * w.brokerPartnerExperience / 100) +
    (strategicFit * w.strategicFit / 100)
  );
  
  return weightedScore;
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
  // Use provided weights or default to equal weighting (20% each)
  const w = weights || {
    dataReadiness: 20,
    technicalComplexity: 20,
    changeImpact: 20,
    modelRisk: 20,
    adoptionReadiness: 20
  };
  
  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (dataReadiness * w.dataReadiness / 100) +
    (technicalComplexity * w.technicalComplexity / 100) +
    (changeImpact * w.changeImpact / 100) +
    (modelRisk * w.modelRisk / 100) +
    (adoptionReadiness * w.adoptionReadiness / 100)
  );
  
  return weightedScore;
}

/**
 * Calculates AI Governance composite score
 * Combines explainability/bias and regulatory compliance dimensions
 */
export function calculateGovernanceScore(
  explainabilityBias: number,
  regulatoryCompliance: number
): number {
  return (explainabilityBias + regulatoryCompliance) / 2;
}

/**
 * Determines quadrant based on impact and effort scores with configurable threshold
 * Y-axis = Business Value (Impact) - Higher is better
 * X-axis = Implementation Complexity (Effort) - Lower is better (left = easy, right = hard)
 * 
 * Quadrant Mapping (RSA Framework):
 * - Strategic Bet: impact >= threshold && effort < threshold (Top Left - High Value, Low Complexity)
 * - Quick Win: impact >= threshold && effort >= threshold (Top Right - High Value, High Complexity)  
 * - Watchlist: impact < threshold && effort < threshold (Bottom Left - Low Value, Low Complexity)
 * - Experimental: impact < threshold && effort >= threshold (Bottom Right - Low Value, High Complexity)
 */
export function calculateQuadrant(
  impactScore: number, 
  effortScore: number, 
  threshold: number = 3.0
): string {
  if (impactScore >= threshold && effortScore < threshold) {
    return "Strategic Bet";
  } else if (impactScore >= threshold && effortScore >= threshold) {
    return "Quick Win";
  } else if (impactScore < threshold && effortScore < threshold) {
    return "Watchlist";
  } else {
    return "Experimental";
  }
}