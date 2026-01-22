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

export interface EngagementTomContext {
  tomPresetId: string;
  tomPhasesJson?: any;
}

export function getConfigsFromEngagement(
  metadata: any,
  engagement?: EngagementTomContext | null
): DerivationConfigs {
  const baseConfigs = getDefaultConfigs(metadata);
  
  if (!engagement) {
    return baseConfigs;
  }

  // Start with base TOM config
  let tomConfig = { ...baseConfigs.tomConfig };
  
  // Override activePreset with engagement's locked preset
  if (engagement.tomPresetId) {
    tomConfig.activePreset = engagement.tomPresetId;
  }
  
  // If engagement has custom phases, use them (preserving preset structure)
  if (engagement.tomPhasesJson && Array.isArray(engagement.tomPhasesJson)) {
    tomConfig.phases = engagement.tomPhasesJson;
  }

  return {
    ...baseConfigs,
    tomConfig
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
