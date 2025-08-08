/**
 * Calculates impact score using comprehensive RSA framework
 * Implements weighted scoring: (Revenue + Cost Savings + Risk + Broker Experience + Strategic Fit) × 20%
 * Per RSA AI Framework specification
 */
export function calculateImpactScore(
  revenueImpact: number,
  costSavings: number,
  riskReduction: number,
  brokerPartnerExperience: number,
  strategicFit: number
): number {
  return (revenueImpact + costSavings + riskReduction + brokerPartnerExperience + strategicFit) * 0.2;
}

/**
 * Calculates effort score using comprehensive RSA framework
 * Implements weighted scoring: (Data + Technical + Change + Model Risk + Adoption) × 20%
 * Per RSA AI Framework specification
 */
export function calculateEffortScore(
  dataReadiness: number,
  technicalComplexity: number,
  changeImpact: number,
  modelRisk: number,
  adoptionReadiness: number
): number {
  return (dataReadiness + technicalComplexity + changeImpact + modelRisk + adoptionReadiness) * 0.2;
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
 * Determines quadrant based on impact and effort scores
 * Updated to match visual matrix with 3.0 threshold:
 * - Quick Win: impact >= 3 && effort < 3 (Top Left - Green)
 * - Strategic Bet: impact >= 3 && effort >= 3 (Top Right - Blue)  
 * - Experimental: impact < 3 && effort < 3 (Bottom Left - Yellow)
 * - Watchlist: impact < 3 && effort >= 3 (Bottom Right - Red)
 */
export function calculateQuadrant(impactScore: number, effortScore: number): string {
  if (impactScore >= 3.0 && effortScore < 3.0) {
    return "Quick Win";
  } else if (impactScore >= 3.0 && effortScore >= 3.0) {
    return "Strategic Bet";
  } else if (impactScore < 3.0 && effortScore < 3.0) {
    return "Experimental";
  } else {
    return "Watchlist";
  }
}