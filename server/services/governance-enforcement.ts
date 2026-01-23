/**
 * Governance Enforcement Service
 * 
 * Centralizes all governance gate logic, activation blocking,
 * auto-deactivation, and phase transition enforcement.
 * 
 * Industry Standards Alignment:
 * - NIST AI RMF (GOVERN function)
 * - ISO 42001 (AI lifecycle management)
 * - NAIC Model Bulletin (insurance governance)
 */

import { 
  calculateGovernanceStatus, 
  calculateOperatingModelGate, 
  calculateIntakeGate, 
  calculateRAIGate,
  GovernanceGateStatus 
} from '../../shared/calculations';
import { 
  detectPhaseTransition, 
  getRequirementLabel,
  TomConfig,
  UseCaseDataForReadiness,
  PhaseTransitionInfo,
  GovernanceGateInput
} from '../../shared/tom';

// Use cases active before this date bypass auto-deactivation (warning logged instead)
export const GOVERNANCE_ENFORCEMENT_DATE = new Date('2026-01-24T00:00:00Z');

// Status values that require governance completion before activation
export const ACTIVATION_STATUSES = ['In-flight', 'Implemented'];

// Status values that bypass governance checks (pre-active states)
export const BYPASS_STATUSES = ['Discovery', 'Backlog', 'On Hold'];

// Governance audit log action types
export type GovernanceAuditAction = 
  | 'ACTIVATION_BLOCKED'
  | 'AUTO_DEACTIVATION'
  | 'PHASE_TRANSITION_OVERRIDE'
  | 'LEGACY_GOVERNANCE_WARNING';

// Types
export interface GateResult {
  passed: boolean;
  issues: string[];
  progress: number;
}

export interface GovernanceCheckResult {
  canActivate: boolean;
  governanceStatus: 'complete' | 'incomplete' | 'blocked';
  gates: {
    operatingModel: GateResult;
    intake: GateResult;
    responsibleAI: GateResult;
  };
  missingFields: string[];
  overallProgress: number;
}

export interface ActivationBlockResult {
  blocked: boolean;
  reason?: string;
  governanceCheck?: GovernanceCheckResult;
}

export interface GovernanceRegressionResult {
  shouldDeactivate: boolean;
  reason?: string;
  regressedGate?: string;
  isLegacyUseCase?: boolean;
}

export interface PhaseTransitionResult {
  allowed: boolean;
  requiresJustification: boolean;
  currentPhase: string;
  targetPhase: string;
  pendingExitRequirements: string[];
  isExitingUnphasedOrDisabled: boolean;
}

// Helper to convert GovernanceGateStatus to GateResult
function toGateResult(status: GovernanceGateStatus): GateResult {
  return {
    passed: status.passed,
    issues: status.missingFields || [],
    progress: status.progress
  };
}

/**
 * Perform full governance check across all 3 gates
 * Returns comprehensive status including which fields are missing
 */
export function performFullGovernanceCheck(useCase: any): GovernanceCheckResult {
  const gate1 = calculateOperatingModelGate(useCase);
  const gate2 = calculateIntakeGate(useCase);
  const gate3 = calculateRAIGate(useCase);

  // Apply sequential gating - Gate 2 requires Gate 1, Gate 3 requires Gate 2
  const gate1Result = toGateResult(gate1);
  
  const gate2Result: GateResult = gate1.passed 
    ? toGateResult(gate2)
    : { passed: false, issues: ['Gate 1 (Operating Model) must pass first'], progress: 0 };
  
  const gate3Result: GateResult = gate1.passed && gate2.passed
    ? toGateResult(gate3)
    : { passed: false, issues: ['Gate 2 (Intake & Prioritization) must pass first'], progress: 0 };

  const allIssues = [
    ...gate1Result.issues,
    ...(gate1.passed ? gate2Result.issues : []),
    ...(gate1.passed && gate2.passed ? gate3Result.issues : [])
  ];

  const overallProgress = Math.round((gate1.progress + (gate1.passed ? gate2.progress : 0) + (gate1.passed && gate2.passed ? gate3.progress : 0)) / 3);

  return {
    canActivate: gate1.passed && gate2.passed && gate3.passed,
    governanceStatus: (gate1.passed && gate2.passed && gate3.passed) ? 'complete' : 'incomplete',
    gates: {
      operatingModel: gate1Result,
      intake: gate2Result,
      responsibleAI: gate3Result
    },
    missingFields: allIssues,
    overallProgress
  };
}

/**
 * Check if a use case can be activated (moved to an active status)
 * Returns blocking result if governance is incomplete
 */
export function checkActivationAllowed(
  useCase: any,
  targetStatus: string
): ActivationBlockResult {
  // Only enforce for activation statuses
  if (!ACTIVATION_STATUSES.includes(targetStatus)) {
    return { blocked: false };
  }

  // Check legacy flag - pre-governance use cases can bypass
  if (useCase.legacyActivationFlag === 'true') {
    return { blocked: false };
  }

  const governanceCheck = performFullGovernanceCheck(useCase);

  if (!governanceCheck.canActivate) {
    return {
      blocked: true,
      reason: 'GOVERNANCE_INCOMPLETE',
      governanceCheck
    };
  }

  return { blocked: false };
}

/**
 * Check if a use case was created before governance enforcement
 * Legacy use cases log warnings but aren't auto-deactivated
 */
export function isLegacyActiveUseCase(useCase: any): boolean {
  const isActive = ACTIVATION_STATUSES.includes(useCase.useCaseStatus);
  const createdAt = useCase.createdAt ? new Date(useCase.createdAt) : null;
  const createdBeforeEnforcement = createdAt ? createdAt < GOVERNANCE_ENFORCEMENT_DATE : false;
  
  return isActive && createdBeforeEnforcement;
}

/**
 * Check if updates would cause governance regression and require auto-deactivation
 * Legacy use cases log warnings but don't get deactivated
 */
export function checkGovernanceRegression(
  currentUseCase: any,
  updatedFields: Partial<any>
): GovernanceRegressionResult {
  // Only check if currently in an active status
  if (!ACTIVATION_STATUSES.includes(currentUseCase.useCaseStatus)) {
    return { shouldDeactivate: false };
  }

  // Check if this is a legacy use case
  const isLegacy = isLegacyActiveUseCase(currentUseCase);

  // Merge current with updates
  const merged = { ...currentUseCase, ...updatedFields };

  // Check if governance would still pass
  const currentGovernance = performFullGovernanceCheck(currentUseCase);
  const newGovernance = performFullGovernanceCheck(merged);

  if (currentGovernance.canActivate && !newGovernance.canActivate) {
    const regressedGate = identifyRegressedGate(currentGovernance, newGovernance);
    
    if (isLegacy) {
      // Legacy use cases: log warning but don't deactivate
      return {
        shouldDeactivate: false,
        reason: `Legacy use case would fail governance: ${regressedGate} gate no longer passes`,
        regressedGate,
        isLegacyUseCase: true
      };
    }
    
    return {
      shouldDeactivate: true,
      reason: `Governance regression detected: ${regressedGate} gate no longer passes`,
      regressedGate,
      isLegacyUseCase: false
    };
  }

  return { shouldDeactivate: false };
}

/**
 * Check phase transition requirements using existing tom.ts infrastructure
 * 
 * @param useCase - Full use case object (needs deploymentStatus, tomPhaseOverride, etc.)
 * @param currentStatus - Current useCaseStatus value
 * @param targetStatus - Target useCaseStatus value  
 * @param tomConfig - TOM configuration from metadata
 * @param justification - Optional override justification
 * @param governanceGates - Optional governance gate status
 */
export function checkPhaseTransitionRequirements(
  useCase: any,
  currentStatus: string | null,
  targetStatus: string,
  tomConfig: TomConfig,
  justification?: string,
  governanceGates?: GovernanceGateInput
): PhaseTransitionResult {
  // Extract readiness data from full use case
  const useCaseData: UseCaseDataForReadiness = {
    title: useCase.title,
    description: useCase.description,
    primaryBusinessOwner: useCase.primaryBusinessOwner,
    processes: useCase.processes,
    activities: useCase.activities,
    revenueImpact: useCase.revenueImpact,
    costSavings: useCase.costSavings,
    riskReduction: useCase.riskReduction,
    brokerPartnerExperience: useCase.brokerPartnerExperience,
    strategicFit: useCase.strategicFit,
    technicalComplexity: useCase.technicalComplexity,
    dataReadiness: useCase.dataReadiness,
    raiQuestionnaireComplete: useCase.raiQuestionnaireComplete,
    investmentCostGbp: useCase.investmentCostGbp,
    selectedKpis: useCase.valueRealization?.selectedKpis,
    targetIndependence: useCase.capabilityTransition?.selfSufficiencyTarget?.targetIndependence,
    currentIndependence: useCase.capabilityTransition?.independencePercentage
  };

  // Use existing detectPhaseTransition from tom.ts
  const transitionInfo = detectPhaseTransition(
    {
      currentStatus,
      currentDeployment: useCase.deploymentStatus || null,
      currentOverride: useCase.tomPhaseOverride || null,
      newStatus: targetStatus,
      newDeployment: useCase.deploymentStatus || null,
      newOverride: useCase.tomPhaseOverride || null,
      useCaseData,
      governanceGates
    },
    tomConfig
  );

  // No phase change
  if (!transitionInfo.hasTransition) {
    return {
      allowed: true,
      requiresJustification: false,
      currentPhase: transitionInfo.fromPhaseId || 'unknown',
      targetPhase: transitionInfo.toPhaseId || 'unknown',
      pendingExitRequirements: [],
      isExitingUnphasedOrDisabled: false
    };
  }

  // Bypass check for unphased/disabled states (per replit.md)
  if (transitionInfo.isExitingUnphasedOrDisabled) {
    return {
      allowed: true,
      requiresJustification: false,
      currentPhase: transitionInfo.fromPhaseId || 'unphased',
      targetPhase: transitionInfo.toPhaseId || 'unknown',
      pendingExitRequirements: [],
      isExitingUnphasedOrDisabled: true
    };
  }

  // Get human-readable requirement labels
  const pendingLabels = transitionInfo.exitRequirementsPending.map(r => getRequirementLabel(r));

  // If requirements pending and no justification, require it
  if (pendingLabels.length > 0 && !justification) {
    return {
      allowed: false,
      requiresJustification: true,
      currentPhase: transitionInfo.fromPhase?.name || transitionInfo.fromPhaseId || 'unknown',
      targetPhase: transitionInfo.toPhase?.name || transitionInfo.toPhaseId || 'unknown',
      pendingExitRequirements: pendingLabels,
      isExitingUnphasedOrDisabled: false
    };
  }

  // Allowed (either no pending requirements or justification provided)
  return {
    allowed: true,
    requiresJustification: pendingLabels.length > 0,
    currentPhase: transitionInfo.fromPhase?.name || transitionInfo.fromPhaseId || 'unknown',
    targetPhase: transitionInfo.toPhase?.name || transitionInfo.toPhaseId || 'unknown',
    pendingExitRequirements: pendingLabels,
    isExitingUnphasedOrDisabled: false
  };
}

/**
 * Helper to identify which gate regressed
 */
function identifyRegressedGate(
  before: GovernanceCheckResult,
  after: GovernanceCheckResult
): string {
  if (before.gates.operatingModel.passed && !after.gates.operatingModel.passed) {
    return 'Operating Model';
  }
  if (before.gates.intake.passed && !after.gates.intake.passed) {
    return 'Intake & Prioritization';
  }
  if (before.gates.responsibleAI.passed && !after.gates.responsibleAI.passed) {
    return 'Responsible AI';
  }
  return 'Unknown';
}

/**
 * Build error response for blocked activation
 */
export function buildActivationBlockedResponse(result: ActivationBlockResult): {
  error: string;
  message: string;
  gates: GovernanceCheckResult['gates'];
  missingFields: string[];
  overallProgress: number;
} {
  return {
    error: result.reason || 'GOVERNANCE_INCOMPLETE',
    message: 'Use case cannot be activated until all governance gates pass',
    gates: result.governanceCheck!.gates,
    missingFields: result.governanceCheck!.missingFields,
    overallProgress: result.governanceCheck!.overallProgress
  };
}

/**
 * Build error response for phase transition requiring justification
 */
export function buildPhaseTransitionRequiredResponse(result: PhaseTransitionResult): {
  error: string;
  message: string;
  currentPhase: string;
  targetPhase: string;
  pendingExitRequirements: string[];
} {
  return {
    error: 'PHASE_TRANSITION_REQUIRES_JUSTIFICATION',
    message: 'Please provide phaseTransitionJustification to proceed with incomplete exit requirements',
    currentPhase: result.currentPhase,
    targetPhase: result.targetPhase,
    pendingExitRequirements: result.pendingExitRequirements
  };
}
