/**
 * Cascade Benchmark Engine
 * 
 * Auto-derives capability transition defaults from use case attributes:
 * - TOM Phase → Archetype selection (independence range, FTE multipliers)
 * - Quadrant → Pace modifiers (Quick Win = faster, Strategic Bet = slower)
 * - T-shirt Size → Base FTE allocation
 * - Deployment Status → Current independence percentage
 * 
 * Aligns with NIST AI RMF and Hexaware's "Teach Us to Fish" capability transfer model.
 */

import { 
  deriveCapabilityDefaults, 
  DEFAULT_CAPABILITY_TRANSITION_CONFIG,
  DEFAULT_BENCHMARK_CONFIG,
  UseCaseForDerivation,
  UseCaseCapabilityTransition,
  shouldRecalculateCapability
} from '../../shared/capabilityTransition';
import { derivePhase } from '../../shared/tom';
import type { UseCase } from '../../shared/schema';

export interface DerivationResult {
  useCaseId: string;
  title: string;
  status: 'derived' | 'skipped' | 'error';
  reason?: string;
  independencePercentage?: number;
}

export interface CascadeResult {
  totalProcessed: number;
  derived: number;
  skipped: number;
  errors: number;
  results: DerivationResult[];
}

/**
 * Prepare a use case for capability derivation by extracting required attributes
 */
function prepareUseCaseForDerivation(useCase: UseCase, tomConfig?: any): UseCaseForDerivation {
  // Derive TOM phase if not already set
  let tomPhase = useCase.tomPhaseOverride;
  if (!tomPhase && tomConfig) {
    const derived = derivePhase(
      useCase.useCaseStatus,
      useCase.deploymentStatus,
      useCase.tomPhaseOverride,
      tomConfig
    );
    tomPhase = derived.id;
  }

  return {
    id: useCase.id,
    title: useCase.title || undefined,
    tomPhase: tomPhase,
    quadrant: useCase.quadrant,
    tShirtSize: useCase.tShirtSize,
    deploymentStatus: useCase.deploymentStatus,
    useCaseStatus: useCase.useCaseStatus,
    capabilityTransition: useCase.capabilityTransition as UseCaseCapabilityTransition | null
  };
}

/**
 * Derive capability defaults for a single use case
 */
export function deriveCapabilityForUseCase(
  useCase: UseCase,
  tomConfig?: any,
  forceRecalculate: boolean = false
): { capability: UseCaseCapabilityTransition | null; skipped: boolean; reason?: string } {
  const existing = useCase.capabilityTransition as UseCaseCapabilityTransition | null;
  
  // Check if we should recalculate
  if (!forceRecalculate && existing && !shouldRecalculateCapability(existing)) {
    return { 
      capability: null, 
      skipped: true, 
      reason: 'Has manual capability data - override protection' 
    };
  }

  const useCaseForDerivation = prepareUseCaseForDerivation(useCase, tomConfig);
  
  try {
    const capability = deriveCapabilityDefaults(
      useCaseForDerivation,
      DEFAULT_CAPABILITY_TRANSITION_CONFIG,
      DEFAULT_BENCHMARK_CONFIG
    );
    return { capability, skipped: false };
  } catch (error) {
    return { 
      capability: null, 
      skipped: true, 
      reason: `Derivation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Run cascade benchmark derivation across multiple use cases
 */
export async function runCascadeBenchmarkDerivation(
  useCases: UseCase[],
  tomConfig: any,
  updateFn: (id: string, capability: UseCaseCapabilityTransition) => Promise<void>,
  options: {
    forceRecalculate?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<CascadeResult> {
  const results: DerivationResult[] = [];
  let derived = 0;
  let skipped = 0;
  let errors = 0;

  for (const useCase of useCases) {
    const result = deriveCapabilityForUseCase(
      useCase, 
      tomConfig, 
      options.forceRecalculate || false
    );

    if (result.skipped) {
      skipped++;
      results.push({
        useCaseId: useCase.id,
        title: useCase.title || 'Untitled',
        status: 'skipped',
        reason: result.reason
      });
      continue;
    }

    if (!result.capability) {
      errors++;
      results.push({
        useCaseId: useCase.id,
        title: useCase.title || 'Untitled',
        status: 'error',
        reason: 'No capability data generated'
      });
      continue;
    }

    // Apply the update (unless dry run)
    if (!options.dryRun) {
      try {
        await updateFn(useCase.id, result.capability);
        derived++;
        results.push({
          useCaseId: useCase.id,
          title: useCase.title || 'Untitled',
          status: 'derived',
          independencePercentage: result.capability.independencePercentage
        });
      } catch (error) {
        errors++;
        results.push({
          useCaseId: useCase.id,
          title: useCase.title || 'Untitled',
          status: 'error',
          reason: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      // Dry run - count as derived but don't actually update
      derived++;
      results.push({
        useCaseId: useCase.id,
        title: useCase.title || 'Untitled',
        status: 'derived',
        independencePercentage: result.capability.independencePercentage,
        reason: 'Dry run - not saved'
      });
    }
  }

  return {
    totalProcessed: useCases.length,
    derived,
    skipped,
    errors,
    results
  };
}

/**
 * Get summary statistics for capability data population
 */
export function getCapabilityPopulationStats(useCases: UseCase[]): {
  total: number;
  withCapability: number;
  withDerivedCapability: number;
  withManualCapability: number;
  needsPopulation: number;
} {
  let withCapability = 0;
  let withDerivedCapability = 0;
  let withManualCapability = 0;

  for (const useCase of useCases) {
    const cap = useCase.capabilityTransition as UseCaseCapabilityTransition | null;
    if (cap) {
      withCapability++;
      if (cap.derived) {
        withDerivedCapability++;
      } else {
        withManualCapability++;
      }
    }
  }

  return {
    total: useCases.length,
    withCapability,
    withDerivedCapability,
    withManualCapability,
    needsPopulation: useCases.length - withCapability
  };
}
