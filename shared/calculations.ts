export function calculateImpactScore(
  revenueImpact: number,
  costSavings: number,
  riskReduction: number,
  strategicFit: number
): number {
  return (revenueImpact + costSavings + riskReduction + strategicFit) / 4;
}

export function calculateEffortScore(
  dataReadiness: number,
  technicalComplexity: number,
  changeImpact: number,
  adoptionReadiness: number
): number {
  return (dataReadiness + technicalComplexity + changeImpact + adoptionReadiness) / 4;
}

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