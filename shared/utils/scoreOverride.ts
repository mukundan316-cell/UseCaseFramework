import { UseCase } from '../schema';
import { safeNumber, validateScoreRange } from './safeMath';

/**
 * Gets the effective impact score (manual override or calculated)
 * Enhanced with null safety and bounds checking
 */
export function getEffectiveImpactScore(useCase: UseCase): number {
  const manualScore = safeNumber(useCase.manualImpactScore);
  const calculatedScore = safeNumber(useCase.impactScore);
  
  // Use manual override if valid, otherwise calculated score
  const effectiveScore = manualScore > 0 ? manualScore : calculatedScore;
  
  // Ensure score is within valid range
  return effectiveScore > 0 ? validateScoreRange(effectiveScore) : 0;
}

/**
 * Gets the effective effort score (manual override or calculated)
 * Enhanced with null safety and bounds checking
 */
export function getEffectiveEffortScore(useCase: UseCase): number {
  const manualScore = safeNumber(useCase.manualEffortScore);
  const calculatedScore = safeNumber(useCase.effortScore);
  
  // Use manual override if valid, otherwise calculated score
  const effectiveScore = manualScore > 0 ? manualScore : calculatedScore;
  
  // Ensure score is within valid range
  return effectiveScore > 0 ? validateScoreRange(effectiveScore) : 0;
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
 */
export function hasManualOverrides(useCase: UseCase): boolean {
  return !!(useCase.manualImpactScore || useCase.manualEffortScore || useCase.manualQuadrant);
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