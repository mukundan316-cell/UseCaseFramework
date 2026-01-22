import { derivePhase, DEFAULT_TOM_CONFIG, type TomConfig } from "@shared/tom";
import { 
  deriveValueEstimates, 
  calculateTotalEstimatedValue,
  DEFAULT_VALUE_REALIZATION_CONFIG,
  type ValueRealizationConfig,
  type UseCaseScores 
} from "@shared/valueRealization";
import { 
  deriveCapabilityDefaults, 
  DEFAULT_CAPABILITY_TRANSITION_CONFIG,
  type CapabilityTransitionConfig 
} from "@shared/capabilityTransition";

export interface DerivationConfigs {
  tomConfig: TomConfig;
  valueConfig: ValueRealizationConfig;
  capabilityConfig: CapabilityTransitionConfig;
}

export interface UseCaseForDerivation {
  id: string;
  title: string;
  useCaseStatus: string | null;
  deploymentStatus: string | null;
  tomPhaseOverride: string | null;
  processes: string[] | null;
  quadrant: string | null;
  tShirtSize: string | null;
  dataReadiness: number | null;
  technicalComplexity: number | null;
  adoptionReadiness: number | null;
  capabilityTransition?: any;
  valueRealization?: any;
  tomPhase?: string | null;
}

export interface DerivedFields {
  tomPhase?: string;
  valueRealization?: any;
  capabilityTransition?: any;
}

export function deriveAllFields(
  useCase: UseCaseForDerivation,
  configs: DerivationConfigs,
  options: { overwriteValue?: boolean; overwriteCapability?: boolean } = {}
): DerivedFields {
  const derived: DerivedFields = {};

  // 1. Derive TOM Phase (always recalculate - it's deterministic based on status)
  if (configs.tomConfig.enabled === 'true') {
    const phaseResult = derivePhase(
      useCase.useCaseStatus,
      useCase.deploymentStatus,
      useCase.tomPhaseOverride,
      configs.tomConfig
    );
    derived.tomPhase = phaseResult.id;
  }

  // 2. Derive Value Estimates (only if processes exist and either overwriting or no existing data)
  const processes = useCase.processes || [];
  if (
    configs.valueConfig.enabled === 'true' &&
    processes.length > 0 &&
    (options.overwriteValue || !useCase.valueRealization)
  ) {
    const scores: UseCaseScores = {
      dataReadiness: useCase.dataReadiness,
      technicalComplexity: useCase.technicalComplexity,
      adoptionReadiness: useCase.adoptionReadiness
    };

    const kpiLibrary = configs.valueConfig.kpiLibrary || {};
    const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
    const totalValue = calculateTotalEstimatedValue(valueEstimates);

    derived.valueRealization = {
      derived: true,
      derivedAt: new Date().toISOString(),
      kpiEstimates: valueEstimates.map(est => ({
        kpiId: est.kpiId,
        kpiName: est.kpiName,
        maturityLevel: est.maturityLevel,
        expectedRange: est.expectedRange,
        confidence: est.confidence,
        estimatedAnnualValueGbp: est.estimatedAnnualValueGbp,
        benchmarkProcess: est.benchmarkProcess
      })),
      totalEstimatedValue: totalValue,
      lastUpdated: new Date().toISOString()
    };
  }

  // 3. Derive Capability Transition (use existing logic)
  const shouldDeriveCapability = options.overwriteCapability || 
    !useCase.capabilityTransition || 
    useCase.capabilityTransition?.derived === true;

  if (shouldDeriveCapability) {
    const derivedCapability = deriveCapabilityDefaults(
      {
        id: useCase.id,
        title: useCase.title,
        tomPhase: derived.tomPhase || useCase.tomPhase || null,
        quadrant: useCase.quadrant,
        tShirtSize: useCase.tShirtSize,
        deploymentStatus: useCase.deploymentStatus,
        useCaseStatus: useCase.useCaseStatus
      },
      configs.capabilityConfig,
      configs.capabilityConfig.benchmarkConfig
    );
    derived.capabilityTransition = derivedCapability;
  }

  return derived;
}

export function getDefaultConfigs(metadata: any): DerivationConfigs {
  return {
    tomConfig: metadata?.tomConfig || DEFAULT_TOM_CONFIG,
    valueConfig: metadata?.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG,
    capabilityConfig: metadata?.capabilityTransitionConfig || DEFAULT_CAPABILITY_TRANSITION_CONFIG
  };
}

export interface EngagementConfigContext {
  tomPresetId: string;
  tomPhasesJson?: any;
  governanceConfig?: {
    customGates?: Array<{
      id: string;
      name: string;
      requiredFields: string[];
      order: number;
    }>;
    governanceBodies?: Array<{
      id: string;
      name: string;
      description?: string;
      approvalRequired?: boolean;
    }>;
  };
  valueConfig?: {
    kpiTargets?: Record<string, { target: number; baseline?: number }>;
    benchmarks?: Record<string, { industry: number; bestInClass: number }>;
    revenueMultiplier?: number;
    costMultiplier?: number;
  };
  capabilityConfig?: {
    knowledgeTransferMilestones?: Array<{
      id: string;
      name: string;
      targetWeek: number;
      criteria: string[];
    }>;
    independenceThresholds?: {
      targetVendorRatio: number;
      targetClientRatio: number;
      targetWeeks: number;
    };
  };
}

// Legacy alias for backward compatibility
export type EngagementTomContext = EngagementConfigContext;

export function getConfigsFromEngagement(
  metadata: any,
  engagement?: EngagementConfigContext | null
): DerivationConfigs {
  const baseConfigs = getDefaultConfigs(metadata);
  
  if (!engagement) {
    return baseConfigs;
  }

  // 1. TOM Config: merge engagement preset into base config
  let tomConfig = { ...baseConfigs.tomConfig };
  if (engagement.tomPresetId) {
    tomConfig.activePreset = engagement.tomPresetId;
    // Auto-enable TOM when preset is selected
    if (engagement.tomPresetId !== 'none') {
      tomConfig.enabled = 'true';
    }
  }
  if (engagement.tomPhasesJson && Array.isArray(engagement.tomPhasesJson)) {
    tomConfig.phases = engagement.tomPhasesJson;
  }

  // 2. Value Config: keep base config, engagement kpiTargets are used for UI display only
  // (Engagement-level targets don't modify derivation formulas - they set goals for tracking)
  let valueConfig = { ...baseConfigs.valueConfig };
  if (engagement.valueConfig) {
    // Auto-enable value tracking when engagement has config
    if (Object.keys(engagement.valueConfig).length > 0) {
      valueConfig.enabled = 'true';
    }
  }

  // 3. Capability Config: merge engagement capability settings
  let capabilityConfig = { ...baseConfigs.capabilityConfig };
  if (engagement.capabilityConfig) {
    // Override knowledge transfer milestones if provided
    if (engagement.capabilityConfig.knowledgeTransferMilestones) {
      // Map simplified engagement milestones to full config structure
      const phaseMap: Record<number, 'foundation' | 'strategic' | 'transition' | 'steadyState'> = {
        0: 'foundation', 1: 'foundation',
        2: 'strategic', 3: 'strategic',
        4: 'transition', 5: 'transition',
        6: 'steadyState', 7: 'steadyState'
      };
      capabilityConfig.knowledgeTransferMilestones = engagement.capabilityConfig.knowledgeTransferMilestones.map((m, idx) => ({
        id: m.id,
        name: m.name,
        description: m.criteria.join('; '),
        phase: phaseMap[idx] || 'foundation',
        order: idx + 1,
        requiredArtifacts: m.criteria
      }));
    }
    // Override independence targets if thresholds provided
    if (engagement.capabilityConfig.independenceThresholds) {
      const t = engagement.capabilityConfig.independenceThresholds;
      // Map engagement thresholds to min/max percentages for steadyState
      capabilityConfig.independenceTargets = {
        ...capabilityConfig.independenceTargets,
        steadyState: {
          min: Math.round(t.targetClientRatio * 100),
          max: Math.round(t.targetClientRatio * 100),
          description: `Client at ${Math.round(t.targetClientRatio * 100)}% by week ${t.targetWeeks}`
        }
      };
    }
    // Auto-enable capability tracking when engagement has config
    if (Object.keys(engagement.capabilityConfig).length > 0) {
      capabilityConfig.enabled = 'true';
    }
  }

  return {
    tomConfig,
    valueConfig,
    capabilityConfig
  };
}

/**
 * Get engagement-level value targets for UI display (not derivation).
 * Derivation uses kpiLibrary for formulas; these targets are goals for tracking.
 */
export function getEngagementValueTargets(engagement?: EngagementConfigContext | null): {
  kpiTargets: Record<string, { target: number; baseline?: number }>;
  multipliers: { revenue?: number; cost?: number };
} {
  if (!engagement?.valueConfig) {
    return { kpiTargets: {}, multipliers: {} };
  }
  return {
    kpiTargets: engagement.valueConfig.kpiTargets || {},
    multipliers: {
      revenue: engagement.valueConfig.revenueMultiplier,
      cost: engagement.valueConfig.costMultiplier
    }
  };
}

export function shouldTriggerDerivation(
  changedFields: Record<string, any>,
  existingUseCase?: UseCaseForDerivation
): { tom: boolean; value: boolean; capability: boolean } {
  const triggers = { tom: false, value: false, capability: false };

  // TOM phase triggers: status changes
  if ('useCaseStatus' in changedFields || 'deploymentStatus' in changedFields || 'tomPhaseOverride' in changedFields) {
    triggers.tom = true;
    triggers.capability = true; // TOM affects capability
  }

  // Value triggers: process or score changes
  if (
    'processes' in changedFields ||
    'dataReadiness' in changedFields ||
    'technicalComplexity' in changedFields ||
    'adoptionReadiness' in changedFields
  ) {
    triggers.value = true;
  }

  // Capability triggers: size, quadrant, or TOM-affecting changes
  if (
    'tShirtSize' in changedFields ||
    'quadrant' in changedFields ||
    triggers.tom // TOM changes cascade to capability
  ) {
    triggers.capability = true;
  }

  return triggers;
}
