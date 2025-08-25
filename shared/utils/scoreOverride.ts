import { UseCase } from '../schema';

/**
 * Gets the effective impact score (manual override or calculated)
 */
export function getEffectiveImpactScore(useCase: UseCase | null | undefined): number {
  if (!useCase) return 0;
  return useCase.manualImpactScore ?? useCase.impactScore ?? 0;
}

/**
 * Gets the effective effort score (manual override or calculated)
 */
export function getEffectiveEffortScore(useCase: UseCase | null | undefined): number {
  if (!useCase) return 0;
  return useCase.manualEffortScore ?? useCase.effortScore ?? 0;
}

/**
 * Gets the effective quadrant (manual override or stored database value)
 */
export function getEffectiveQuadrant(useCase: UseCase | null | undefined): string {
  if (!useCase) return 'Unassigned';
  
  // First check if there's a manual quadrant override
  if (useCase.manualQuadrant) {
    return useCase.manualQuadrant;
  }
  
  // Use the stored quadrant from database as authoritative source
  // This ensures consistency with filtering logic that also uses stored quadrant
  return useCase.quadrant || 'Unassigned';
}

/**
 * Checks if any manual overrides are active
 */
export function hasManualOverrides(useCase: UseCase | null | undefined): boolean {
  if (!useCase) return false;
  return !!(useCase.manualImpactScore || useCase.manualEffortScore || useCase.manualQuadrant);
}

/**
 * Gets override status information for display
 */
export function getOverrideStatus(useCase: UseCase | null | undefined) {
  const hasOverrides = hasManualOverrides(useCase);
  
  if (!useCase) {
    return {
      hasOverrides: false,
      overrideCount: 0,
      reason: '',
      effectiveImpact: 0,
      effectiveEffort: 0,
      effectiveQuadrant: 'Unassigned'
    };
  }
  
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