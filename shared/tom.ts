export interface TomPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  priority: number;
  color: string;
  mappedStatuses: string[];
  mappedDeployments: string[];
  manualOnly: boolean;
  governanceGate: string;
  expectedDurationWeeks: number | null;
}

export interface TomGovernanceBody {
  id: string;
  name: string;
  role: string;
  cadence: string;
}

export interface TomPreset {
  name: string;
  description: string;
}

export interface TomDerivationRules {
  matchOrder: string[];
  fallbackBehavior: string;
  nullDeploymentHandling: string;
}

export interface TomConfig {
  enabled: string;
  activePreset: string;
  presets: Record<string, TomPreset>;
  phases: TomPhase[];
  governanceBodies: TomGovernanceBody[];
  derivationRules: TomDerivationRules;
}

export interface DerivedPhaseResult {
  id: string;
  name: string;
  color: string;
  isOverride: boolean;
  matchedBy?: 'status' | 'deployment' | 'priority' | 'manual';
}

export const DEFAULT_TOM_CONFIG: TomConfig = {
  enabled: 'false',
  activePreset: 'coe_led',
  presets: {
    centralized: { name: 'Centralized CoE', description: 'Single AI team owns all delivery' },
    federated: { name: 'Federated Model', description: 'Business units own AI with central standards' },
    hybrid: { name: 'Hybrid Model', description: 'Central platform, distributed execution' },
    coe_led: { name: 'CoE-Led with Business Pods', description: 'CoE leads with embedded business pods' }
  },
  phases: [
    {
      id: 'foundation',
      name: 'Foundation',
      description: 'Initial setup, governance alignment, and backlog grooming',
      order: 1,
      priority: 1,
      color: '#3C2CDA',
      mappedStatuses: ['Discovery', 'Backlog', 'On Hold'],
      mappedDeployments: [],
      manualOnly: false,
      governanceGate: 'ai_steerco',
      expectedDurationWeeks: 8
    },
    {
      id: 'strategic',
      name: 'Strategic',
      description: 'Active development, pilots, and value validation',
      order: 2,
      priority: 2,
      color: '#1D86FF',
      mappedStatuses: ['In-flight'],
      mappedDeployments: ['PoC', 'Pilot'],
      manualOnly: false,
      governanceGate: 'working_group',
      expectedDurationWeeks: 16
    },
    {
      id: 'transition',
      name: 'Transition',
      description: 'Production deployment and capability transfer in progress',
      order: 3,
      priority: 3,
      color: '#14CBDE',
      mappedStatuses: ['Implemented'],
      mappedDeployments: ['Production'],
      manualOnly: false,
      governanceGate: 'business_owner',
      expectedDurationWeeks: 12
    },
    {
      id: 'steady_state',
      name: 'Steady State',
      description: 'Full client ownership, optimization mode',
      order: 4,
      priority: 4,
      color: '#07125E',
      mappedStatuses: [],
      mappedDeployments: [],
      manualOnly: true,
      governanceGate: 'none',
      expectedDurationWeeks: null
    }
  ],
  governanceBodies: [
    {
      id: 'ai_steerco',
      name: 'AI Steering Committee',
      role: 'Strategic oversight and investment decisions',
      cadence: 'Monthly'
    },
    {
      id: 'working_group',
      name: 'AI Working Group',
      role: 'Tactical execution and prioritization',
      cadence: 'Bi-weekly'
    },
    {
      id: 'business_owner',
      name: 'Business Owner Review',
      role: 'Value validation and adoption sign-off',
      cadence: 'Weekly'
    }
  ],
  derivationRules: {
    matchOrder: ['useCaseStatus', 'deploymentStatus'],
    fallbackBehavior: 'lowestPriority',
    nullDeploymentHandling: 'ignoreInMatching'
  }
};

export function derivePhase(
  useCaseStatus: string | null | undefined,
  deploymentStatus: string | null | undefined,
  tomPhaseOverride: string | null | undefined,
  tomConfig: TomConfig
): DerivedPhaseResult {
  if (!tomConfig || tomConfig.enabled !== 'true') {
    return { id: 'disabled', name: 'TOM Disabled', color: '#6B7280', isOverride: false };
  }

  if (tomPhaseOverride) {
    const overridePhase = tomConfig.phases.find(p => p.id === tomPhaseOverride);
    if (overridePhase) {
      return {
        id: overridePhase.id,
        name: overridePhase.name,
        color: overridePhase.color,
        isOverride: true,
        matchedBy: 'manual'
      };
    }
  }

  const matchingPhases: TomPhase[] = [];
  for (const phase of tomConfig.phases) {
    if (phase.manualOnly) continue;
    if (useCaseStatus && phase.mappedStatuses.includes(useCaseStatus)) {
      matchingPhases.push(phase);
    }
  }

  if (matchingPhases.length === 0) {
    return { id: 'unmapped', name: 'Unmapped', color: '#9CA3AF', isOverride: false };
  }

  if (matchingPhases.length === 1) {
    return {
      id: matchingPhases[0].id,
      name: matchingPhases[0].name,
      color: matchingPhases[0].color,
      isOverride: false,
      matchedBy: 'status'
    };
  }

  if (deploymentStatus) {
    for (const phase of matchingPhases) {
      if (phase.mappedDeployments.includes(deploymentStatus)) {
        return {
          id: phase.id,
          name: phase.name,
          color: phase.color,
          isOverride: false,
          matchedBy: 'deployment'
        };
      }
    }
  }

  const sortedByPriority = matchingPhases.sort((a, b) => a.priority - b.priority);
  return {
    id: sortedByPriority[0].id,
    name: sortedByPriority[0].name,
    color: sortedByPriority[0].color,
    isOverride: false,
    matchedBy: 'priority'
  };
}

export function calculatePhaseSummary(
  useCases: Array<{
    useCaseStatus: string | null;
    deploymentStatus: string | null;
    tomPhaseOverride: string | null;
  }>,
  tomConfig: TomConfig
): Record<string, number> {
  const summary: Record<string, number> = {};
  
  for (const phase of tomConfig.phases) {
    summary[phase.id] = 0;
  }
  summary['unmapped'] = 0;
  summary['disabled'] = 0;

  for (const useCase of useCases) {
    const derived = derivePhase(
      useCase.useCaseStatus,
      useCase.deploymentStatus,
      useCase.tomPhaseOverride,
      tomConfig
    );
    summary[derived.id] = (summary[derived.id] || 0) + 1;
  }

  return summary;
}
