import { UseCase } from '../schema';
import { safeNumber, validateScoreRange } from './safeMath';
import { APP_CONFIG } from '../constants/app-config';

/**
 * Gets the effective impact score (manual override or calculated)
 * Enhanced with null safety and bounds checking
 * CRITICAL: Only use manual override if it actually exists (not null/undefined)
 */
export function getEffectiveImpactScore(useCase: UseCase): number {
  const calculatedScore = safeNumber(useCase.impactScore);
  
  // DEBUG logging removed after identifying root cause
  
  // Only use manual override if it's actually set (not null/undefined)
  if (useCase.manualImpactScore !== null && useCase.manualImpactScore !== undefined) {
    const manualScore = safeNumber(useCase.manualImpactScore);
    if (manualScore > 0) {
      return validateScoreRange(manualScore);
    }
  }
  
  // Use calculated score as fallback
  return calculatedScore > 0 ? validateScoreRange(calculatedScore) : 0;
}

/**
 * Gets the effective effort score (manual override or calculated)
 * Enhanced with null safety and bounds checking
 * CRITICAL: Only use manual override if it actually exists (not null/undefined)
 */
export function getEffectiveEffortScore(useCase: UseCase): number {
  const calculatedScore = safeNumber(useCase.effortScore);
  
  // Only use manual override if it's actually set (not null/undefined)
  if (useCase.manualEffortScore !== null && useCase.manualEffortScore !== undefined) {
    const manualScore = safeNumber(useCase.manualEffortScore);
    if (manualScore > 0) {
      return validateScoreRange(manualScore);
    }
  }
  
  // Use calculated score as fallback
  return calculatedScore > 0 ? validateScoreRange(calculatedScore) : 0;
}

/**
 * Gets the effective quadrant (manual override or dynamically calculated from current scores)
 * FIX: Always calculate based on current effective scores to ensure real-time updates
 */
export function getEffectiveQuadrant(useCase: UseCase): string {
  const validQuadrants = ['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist'];
  
  // First check if there's a manual quadrant override
  if (useCase.manualQuadrant && validQuadrants.includes(useCase.manualQuadrant)) {
    return useCase.manualQuadrant;
  }
  
  // CRITICAL FIX: Always calculate quadrant based on current effective scores
  // This ensures real-time updates when impact/effort scores change
  const impact = getEffectiveImpactScore(useCase);
  const effort = getEffectiveEffortScore(useCase);
  const threshold = APP_CONFIG.SCORING.DEFAULT_THRESHOLD;
  
  // Use standard quadrant calculation logic (aligned with shared/calculations.ts)
  if (impact >= threshold && effort < threshold) return 'Quick Win';
  if (impact >= threshold && effort >= threshold) return 'Strategic Bet';
  if (impact < threshold && effort < threshold) return 'Experimental';
  return 'Watchlist';
}

/**
 * Checks if any manual overrides are active
 * Enhanced to properly check for null/undefined values
 */
export function hasManualOverrides(useCase: UseCase): boolean {
  return !!(
    (useCase.manualImpactScore !== null && useCase.manualImpactScore !== undefined) ||
    (useCase.manualEffortScore !== null && useCase.manualEffortScore !== undefined) ||
    (useCase.manualQuadrant !== null && useCase.manualQuadrant !== undefined && useCase.manualQuadrant !== '')
  );
}

/**
 * Gets override status information for display
 */
export function getOverrideStatus(useCase: UseCase) {
  const hasOverrides = hasManualOverrides(useCase);
  
  return {
    hasOverrides,
    overrideCount: [
      useCase.manualImpactScore,
      useCase.manualEffortScore, 
      useCase.manualQuadrant
    ].filter(Boolean).length,
    reason: useCase.overrideReason,
    effectiveImpact: getEffectiveImpactScore(useCase),
    effectiveEffort: getEffectiveEffortScore(useCase),
    effectiveQuadrant: getEffectiveQuadrant(useCase)
  };
}