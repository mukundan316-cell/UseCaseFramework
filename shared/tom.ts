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

export interface PhaseOverride {
  governanceGate?: string;
  expectedDurationWeeks?: number | null;
}

export interface StaffingRatio {
  vendor: number;
  client: number;
}

export interface DeliveryTrack {
  id: string;
  name: string;
  description: string;
}

export interface TomPresetProfile {
  phaseOverrides: Record<string, PhaseOverride>;
  staffingRatios: Record<string, StaffingRatio>;
  deliveryTracks: DeliveryTrack[];
  phases?: TomPhase[]; // Optional preset-specific phase definitions
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
  presetProfiles: Record<string, TomPresetProfile>;
  phases: TomPhase[];
  governanceBodies: TomGovernanceBody[];
  derivationRules: TomDerivationRules;
}

export interface DerivedPhaseResult {
  id: string;
  name: string;
  color: string;
  isOverride: boolean;
  matchedBy: 'status' | 'deployment' | 'priority' | 'manual' | 'disabled' | 'unmapped';
}

export const DEFAULT_TOM_CONFIG: TomConfig = {
  enabled: 'false',
  activePreset: 'coe_led',
  presets: {
    centralized: { name: 'Centralized CoE', description: 'Single AI team owns all delivery' },
    federated: { name: 'Federated Model', description: 'Business units own AI with central standards' },
    hybrid: { name: 'Hybrid Model', description: 'Central platform, distributed execution' },
    coe_led: { name: 'CoE-Led with Business Pods', description: 'CoE leads with embedded business pods' },
    rsa_tom: { name: 'RSA Enterprise TOM', description: 'Six-phase enterprise model with extended governance' }
  },
  presetProfiles: {
    centralized: {
      phaseOverrides: {
        foundation: { governanceGate: 'ai_steerco', expectedDurationWeeks: 12 },
        strategic: { governanceGate: 'ai_steerco', expectedDurationWeeks: 20 },
        transition: { governanceGate: 'ai_steerco', expectedDurationWeeks: 16 },
        steady_state: { governanceGate: 'ai_steerco', expectedDurationWeeks: null }
      },
      staffingRatios: {
        foundation: { vendor: 0.9, client: 0.1 },
        strategic: { vendor: 0.8, client: 0.2 },
        transition: { vendor: 0.6, client: 0.4 },
        steady_state: { vendor: 0.2, client: 0.8 }
      },
      deliveryTracks: [
        { id: 'single_track', name: 'Unified Delivery', description: 'All initiatives through central CoE pipeline' }
      ]
    },
    federated: {
      phaseOverrides: {
        foundation: { governanceGate: 'working_group', expectedDurationWeeks: 6 },
        strategic: { governanceGate: 'business_owner', expectedDurationWeeks: 12 },
        transition: { governanceGate: 'business_owner', expectedDurationWeeks: 8 },
        steady_state: { governanceGate: 'none', expectedDurationWeeks: null }
      },
      staffingRatios: {
        foundation: { vendor: 0.4, client: 0.6 },
        strategic: { vendor: 0.3, client: 0.7 },
        transition: { vendor: 0.2, client: 0.8 },
        steady_state: { vendor: 0.1, client: 0.9 }
      },
      deliveryTracks: [
        { id: 'bu_owned', name: 'Business Unit Owned', description: 'Each business unit manages own AI initiatives' }
      ]
    },
    hybrid: {
      phaseOverrides: {
        foundation: { governanceGate: 'working_group', expectedDurationWeeks: 6 },
        strategic: { governanceGate: 'working_group', expectedDurationWeeks: 14 },
        transition: { governanceGate: 'business_owner', expectedDurationWeeks: 10 },
        steady_state: { governanceGate: 'none', expectedDurationWeeks: null }
      },
      staffingRatios: {
        foundation: { vendor: 0.6, client: 0.4 },
        strategic: { vendor: 0.5, client: 0.5 },
        transition: { vendor: 0.35, client: 0.65 },
        steady_state: { vendor: 0.15, client: 0.85 }
      },
      deliveryTracks: [
        { id: 'quick_wins', name: 'Quick Wins', description: 'Fast-track high-impact, low-effort initiatives' },
        { id: 'strategic', name: 'Strategic Initiatives', description: 'Long-term capability building and complex projects' }
      ]
    },
    coe_led: {
      phaseOverrides: {
        foundation: { governanceGate: 'ai_steerco', expectedDurationWeeks: 8 },
        strategic: { governanceGate: 'working_group', expectedDurationWeeks: 16 },
        transition: { governanceGate: 'business_owner', expectedDurationWeeks: 12 },
        steady_state: { governanceGate: 'none', expectedDurationWeeks: null }
      },
      staffingRatios: {
        foundation: { vendor: 0.7, client: 0.3 },
        strategic: { vendor: 0.55, client: 0.45 },
        transition: { vendor: 0.4, client: 0.6 },
        steady_state: { vendor: 0.2, client: 0.8 }
      },
      deliveryTracks: [
        { id: 'coe_track', name: 'CoE Pipeline', description: 'Primary delivery through CoE with business pod support' },
        { id: 'pod_track', name: 'Business Pods', description: 'Embedded teams handling domain-specific initiatives' }
      ]
    },
    rsa_tom: {
      phaseOverrides: {
        ideation: { governanceGate: 'innovation_board', expectedDurationWeeks: 4 },
        assessment: { governanceGate: 'ai_steerco', expectedDurationWeeks: 6 },
        foundation: { governanceGate: 'ai_steerco', expectedDurationWeeks: 8 },
        build: { governanceGate: 'working_group', expectedDurationWeeks: 12 },
        scale: { governanceGate: 'business_owner', expectedDurationWeeks: 10 },
        operate: { governanceGate: 'none', expectedDurationWeeks: null }
      },
      staffingRatios: {
        ideation: { vendor: 0.3, client: 0.7 },
        assessment: { vendor: 0.5, client: 0.5 },
        foundation: { vendor: 0.75, client: 0.25 },
        build: { vendor: 0.8, client: 0.2 },
        scale: { vendor: 0.5, client: 0.5 },
        operate: { vendor: 0.15, client: 0.85 }
      },
      deliveryTracks: [
        { id: 'innovation', name: 'Innovation Track', description: 'Exploratory initiatives and proof of concepts' },
        { id: 'transformation', name: 'Transformation Track', description: 'Large-scale enterprise transformation programs' },
        { id: 'enhancement', name: 'Enhancement Track', description: 'Incremental improvements to existing capabilities' }
      ],
      phases: [
        {
          id: 'ideation',
          name: 'Ideation',
          description: 'Early discovery, opportunity identification, and initial concept validation',
          order: 1,
          priority: 1,
          color: '#9333EA',
          mappedStatuses: ['Discovery'],
          mappedDeployments: [],
          manualOnly: false,
          governanceGate: 'innovation_board',
          expectedDurationWeeks: 4
        },
        {
          id: 'assessment',
          name: 'Assessment',
          description: 'Detailed feasibility analysis, business case development, and resource planning',
          order: 2,
          priority: 2,
          color: '#3C2CDA',
          mappedStatuses: ['Backlog', 'On Hold'],
          mappedDeployments: [],
          manualOnly: false,
          governanceGate: 'ai_steerco',
          expectedDurationWeeks: 6
        },
        {
          id: 'foundation',
          name: 'Foundation',
          description: 'Technical infrastructure setup, team onboarding, and governance alignment',
          order: 3,
          priority: 3,
          color: '#1D86FF',
          mappedStatuses: ['In-flight'],
          mappedDeployments: [],
          manualOnly: false,
          governanceGate: 'ai_steerco',
          expectedDurationWeeks: 8
        },
        {
          id: 'build',
          name: 'Build',
          description: 'Active development, integration, and pilot testing with controlled user groups',
          order: 4,
          priority: 4,
          color: '#14CBDE',
          mappedStatuses: [],
          mappedDeployments: ['PoC', 'Pilot'],
          manualOnly: false,
          governanceGate: 'working_group',
          expectedDurationWeeks: 12
        },
        {
          id: 'scale',
          name: 'Scale',
          description: 'Production deployment, user adoption, and capability transfer to client teams',
          order: 5,
          priority: 5,
          color: '#10B981',
          mappedStatuses: ['Implemented'],
          mappedDeployments: ['Production'],
          manualOnly: false,
          governanceGate: 'business_owner',
          expectedDurationWeeks: 10
        },
        {
          id: 'operate',
          name: 'Operate',
          description: 'Full client ownership, continuous optimization, and value realization tracking',
          order: 6,
          priority: 6,
          color: '#07125E',
          mappedStatuses: [],
          mappedDeployments: [],
          manualOnly: true,
          governanceGate: 'none',
          expectedDurationWeeks: null
        }
      ]
    }
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
      id: 'innovation_board',
      name: 'Innovation Board',
      role: 'Early-stage opportunity assessment and ideation approval',
      cadence: 'Weekly'
    },
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

export function ensureTomConfig(config: Partial<TomConfig> | null | undefined): TomConfig {
  if (!config) return DEFAULT_TOM_CONFIG;
  return {
    ...DEFAULT_TOM_CONFIG,
    ...config,
    presetProfiles: config.presetProfiles || DEFAULT_TOM_CONFIG.presetProfiles,
    presets: config.presets || DEFAULT_TOM_CONFIG.presets,
    phases: config.phases || DEFAULT_TOM_CONFIG.phases,
    governanceBodies: config.governanceBodies || DEFAULT_TOM_CONFIG.governanceBodies,
    derivationRules: config.derivationRules || DEFAULT_TOM_CONFIG.derivationRules
  };
}

export function mergePresetProfile(tomConfig: TomConfig): TomConfig {
  const activePreset = tomConfig.activePreset;
  const profile = tomConfig.presetProfiles?.[activePreset];
  
  if (!profile) return tomConfig;
  
  // Use preset-specific phases if defined, otherwise use default phases with overrides
  const basePhases = profile.phases || tomConfig.phases;
  
  const mergedPhases = basePhases.map(phase => {
    const override = profile.phaseOverrides?.[phase.id];
    if (!override) return phase;
    return {
      ...phase,
      governanceGate: override.governanceGate ?? phase.governanceGate,
      expectedDurationWeeks: override.expectedDurationWeeks !== undefined 
        ? override.expectedDurationWeeks 
        : phase.expectedDurationWeeks
    };
  });
  
  return {
    ...tomConfig,
    phases: mergedPhases
  };
}

export function getActivePresetProfile(tomConfig: TomConfig): TomPresetProfile | null {
  return tomConfig.presetProfiles?.[tomConfig.activePreset] || null;
}

export function derivePhase(
  useCaseStatus: string | null | undefined,
  deploymentStatus: string | null | undefined,
  tomPhaseOverride: string | null | undefined,
  tomConfig: TomConfig
): DerivedPhaseResult {
  if (!tomConfig || tomConfig.enabled !== 'true') {
    return { id: 'disabled', name: 'TOM Disabled', color: '#6B7280', isOverride: false, matchedBy: 'disabled' };
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
    return { id: 'unmapped', name: 'Unmapped', color: '#9CA3AF', isOverride: false, matchedBy: 'unmapped' };
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
