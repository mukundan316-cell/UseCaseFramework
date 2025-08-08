import { QuadrantType } from '../types';

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

export function calculateQuadrant(impactScore: number, effortScore: number): QuadrantType {
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

export function getQuadrantColor(quadrant: QuadrantType): string {
  switch (quadrant) {
    case "Quick Win":
      return "#22C55E"; // green-500
    case "Strategic Bet":
      return "#3B82F6"; // blue-500
    case "Experimental":
      return "#EAB308"; // yellow-500
    case "Watchlist":
      return "#EF4444"; // red-500
    default:
      return "#6B7280"; // gray-500
  }
}

export function getQuadrantBackgroundColor(quadrant: QuadrantType): string {
  switch (quadrant) {
    case "Quick Win":
      return "#DCFCE7"; // green-100
    case "Strategic Bet":
      return "#DBEAFE"; // blue-100
    case "Experimental":
      return "#FEF3C7"; // yellow-100
    case "Watchlist":
      return "#FEE2E2"; // red-100
    default:
      return "#F3F4F6"; // gray-100
  }
}
