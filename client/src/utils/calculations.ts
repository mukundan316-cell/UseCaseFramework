import { QuadrantType } from '../types';
export { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '@shared/calculations';

export function getQuadrantColor(quadrant: QuadrantType): string {
  switch (quadrant) {
    case "Quick Win":
      return "#059669"; // green-600 - much darker green for prominence
    case "Strategic Bet":
      return "#2563EB"; // blue-600 - deeper blue for better visibility
    case "Experimental":
      return "#D97706"; // amber-600 - darker orange/amber instead of yellow
    case "Watchlist":
      return "#DC2626"; // red-600 - darker red for better contrast
    default:
      return "#4B5563"; // gray-600 - darker gray
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
