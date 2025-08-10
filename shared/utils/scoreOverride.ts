import { UseCase } from '../schema';

/**
 * Gets the effective impact score (manual override or calculated)
 */
export function getEffectiveImpactScore(useCase: UseCase): number {
  return useCase.manualImpactScore ?? useCase.impactScore ?? 0;
}

/**
 * Gets the effective effort score (manual override or calculated)
 */
export function getEffectiveEffortScore(useCase: UseCase): number {
  return useCase.manualEffortScore ?? useCase.effortScore ?? 0;
}

/**
 * Gets the effective quadrant (manual override or calculated)
 */
export function getEffectiveQuadrant(useCase: UseCase): string {
  // First check if there's a manual quadrant override
  if (useCase.manualQuadrant) {
    return useCase.manualQuadrant;
  }
  
  // If there are manual impact/effort scores, calculate quadrant from those
  if (useCase.manualImpactScore !== undefined || useCase.manualEffortScore !== undefined) {
    const effectiveImpact = getEffectiveImpactScore(useCase);
    const effectiveEffort = getEffectiveEffortScore(useCase);
    
    // Use standard 3.0 threshold for quadrant calculation
    if (effectiveImpact >= 3.0 && effectiveEffort < 3.0) return 'Quick Win';
    if (effectiveImpact >= 3.0 && effectiveEffort >= 3.0) return 'Strategic Bet';
    if (effectiveImpact < 3.0 && effectiveEffort < 3.0) return 'Experimental';
    if (effectiveImpact < 3.0 && effectiveEffort >= 3.0) return 'Watchlist';
    return 'Watchlist';
  }
  
  // Calculate quadrant from current scores (don't rely on potentially stale stored quadrant)
  const effectiveImpact = getEffectiveImpactScore(useCase);
  const effectiveEffort = getEffectiveEffortScore(useCase);
  
  if (effectiveImpact >= 3.0 && effectiveEffort < 3.0) return 'Quick Win';
  if (effectiveImpact >= 3.0 && effectiveEffort >= 3.0) return 'Strategic Bet';
  if (effectiveImpact < 3.0 && effectiveEffort < 3.0) return 'Experimental';
  if (effectiveImpact < 3.0 && effectiveEffort >= 3.0) return 'Watchlist';
  
  // Fallback to stored quadrant only if scores are invalid
  return useCase.quadrant || 'Unassigned';
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