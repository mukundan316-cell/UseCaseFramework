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
 * Implements exact logic from REFERENCE.md:
 * - Quick Win: impact >= 4 && effort <= 2.5
 * - Strategic Bet: impact >= 4 && effort > 2.5
 * - Experimental: impact < 4 && effort <= 2.5
 * - Watchlist: impact < 4 && effort > 2.5
 */
export function calculateQuadrant(impactScore: number, effortScore: number): string {
  if (impactScore >= 4 && effortScore <= 2.5) {
    return "Quick Win";
  } else if (impactScore >= 4 && effortScore > 2.5) {
    return "Strategic Bet";
  } else if (impactScore < 4 && effortScore <= 2.5) {
    return "Experimental";
  } else {
    return "Watchlist";
  }
}