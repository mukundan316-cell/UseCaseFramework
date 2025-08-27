import { UseCase } from '../schema';
import { safeNumber, validateScoreRange } from './safeMath';

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
 * Gets the effective quadrant (manual override or stored database value)
 * Enhanced with validation and safe fallback
 */
export function getEffectiveQuadrant(useCase: UseCase): string {
  const validQuadrants = ['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist'];
  
  // First check if there's a manual quadrant override
  if (useCase.manualQuadrant && validQuadrants.includes(useCase.manualQuadrant)) {
    return useCase.manualQuadrant;
  }
  
  // Use the stored quadrant from database as authoritative source
  const dbQuadrant = useCase.quadrant;
  if (dbQuadrant && validQuadrants.includes(dbQuadrant)) {
    return dbQuadrant;
  }
  
  // Safe fallback based on scores if quadrant is invalid
  const impact = getEffectiveImpactScore(useCase);
  const effort = getEffectiveEffortScore(useCase);
  
  if (impact >= 3 && effort <= 3) return 'Quick Win';
  if (impact >= 3 && effort > 3) return 'Strategic Bet';
  if (impact < 3 && effort <= 3) return 'Experimental';
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