/**
 * Calculates impact score by averaging four business impact dimensions
 * Used in quadrant classification logic per REFERENCE.md specification
 */
export function calculateImpactScore(
  revenueImpact: number,
  costSavings: number,
  riskReduction: number,
  strategicFit: number
): number {
  return (revenueImpact + costSavings + riskReduction + strategicFit) / 4;
}

/**
 * Calculates effort score by averaging four implementation complexity dimensions
 * Used in quadrant classification logic per REFERENCE.md specification
 */
export function calculateEffortScore(
  dataReadiness: number,
  technicalComplexity: number,
  changeImpact: number,
  adoptionReadiness: number
): number {
  return (dataReadiness + technicalComplexity + changeImpact + adoptionReadiness) / 4;
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