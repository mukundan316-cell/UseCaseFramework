export interface PhaseDataRequirements {
  entry: string[];
  exit: string[];
}

export interface CapabilityTransitionDefaults {
  hexawareFts: number | null;
  clientFts: number | null;
  independenceFts: number | null;
  targetIndependence: number | null;
  currentIndependence: number | null;
}

export interface ValueRealizationDefaults {
  expectedValueRangeMin: number | null;
  expectedValueRangeMax: number | null;
  defaultKpiCategories: string[];
}

export interface ResponsibleAIDefaults {
  riskTier: string | null;
  assessmentRequired: boolean;
  recommendedCheckpoints: string[];
}

export interface PhaseDefaults {
  capabilityTransition: CapabilityTransitionDefaults;
  valueRealization: ValueRealizationDefaults;
  responsibleAI: ResponsibleAIDefaults;
}

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
  dataRequirements?: PhaseDataRequirements;
  unlockedFeatures?: string[];
  phaseDefaults?: PhaseDefaults;
  staffingRatio?: StaffingRatio; // SSOT: Consolidated from presetProfiles[].staffingRatios
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
  matchedBy: 'status' | 'deployment' | 'priority' | 'manual' | 'disabled' | 'unmapped' | 'governance_entry' | 'unphased';
}

// Governance status interface for gate-based phase assignment
export interface GovernanceGateInput {
  operatingModelPassed: boolean;
  intakePassed?: boolean;
  raiPassed?: boolean;
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
          expectedDurationWeeks: 4,
          staffingRatio: { vendor: 0.3, client: 0.7 },
          dataRequirements: {
            entry: ['title', 'description'],
            exit: ['primaryBusinessOwner', 'strategicAlignment']
          },
          unlockedFeatures: ['overview'],
          phaseDefaults: {
            capabilityTransition: {
              hexawareFts: 2,
              clientFts: 1,
              independenceFts: 5,
              targetIndependence: 10,
              currentIndependence: 0
            },
            valueRealization: {
              expectedValueRangeMin: null,
              expectedValueRangeMax: null,
              defaultKpiCategories: []
            },
            responsibleAI: {
              riskTier: 'low',
              assessmentRequired: false,
              recommendedCheckpoints: ['initial_screening']
            }
          }
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
          expectedDurationWeeks: 6,
          staffingRatio: { vendor: 0.5, client: 0.5 },
          dataRequirements: {
            entry: ['primaryBusinessOwner'],
            exit: ['scoringComplete', 'raiAssessment']
          },
          unlockedFeatures: ['overview', 'scoring', 'rai'],
          phaseDefaults: {
            capabilityTransition: {
              hexawareFts: 4,
              clientFts: 1,
              independenceFts: 10,
              targetIndependence: 20,
              currentIndependence: 5
            },
            valueRealization: {
              expectedValueRangeMin: null,
              expectedValueRangeMax: null,
              defaultKpiCategories: []
            },
            responsibleAI: {
              riskTier: 'medium',
              assessmentRequired: true,
              recommendedCheckpoints: ['bias_review', 'data_privacy']
            }
          }
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
          expectedDurationWeeks: 8,
          staffingRatio: { vendor: 0.75, client: 0.25 },
          dataRequirements: {
            entry: ['scoringComplete'],
            exit: ['processMapping']
          },
          unlockedFeatures: ['overview', 'scoring', 'rai', 'details'],
          phaseDefaults: {
            capabilityTransition: {
              hexawareFts: 6,
              clientFts: 2,
              independenceFts: 20,
              targetIndependence: 35,
              currentIndependence: 15
            },
            valueRealization: {
              expectedValueRangeMin: 25000,
              expectedValueRangeMax: 100000,
              defaultKpiCategories: ['efficiency']
            },
            responsibleAI: {
              riskTier: 'medium',
              assessmentRequired: true,
              recommendedCheckpoints: ['model_validation', 'fairness_testing']
            }
          }
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
          expectedDurationWeeks: 12,
          staffingRatio: { vendor: 0.8, client: 0.2 },
          dataRequirements: {
            entry: ['processMapping'],
            exit: ['tshirtSizing', 'capabilityData']
          },
          unlockedFeatures: ['overview', 'scoring', 'rai', 'details', 'tshirtSizing', 'capability'],
          phaseDefaults: {
            capabilityTransition: {
              hexawareFts: 8,
              clientFts: 2,
              independenceFts: 30,
              targetIndependence: 50,
              currentIndependence: 25
            },
            valueRealization: {
              expectedValueRangeMin: 50000,
              expectedValueRangeMax: 250000,
              defaultKpiCategories: ['efficiency', 'quality']
            },
            responsibleAI: {
              riskTier: 'medium',
              assessmentRequired: true,
              recommendedCheckpoints: ['pilot_evaluation', 'user_feedback']
            }
          }
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
          expectedDurationWeeks: 10,
          staffingRatio: { vendor: 0.5, client: 0.5 },
          dataRequirements: {
            entry: ['tshirtSizing'],
            exit: ['investmentData', 'kpiData']
          },
          unlockedFeatures: ['overview', 'scoring', 'rai', 'details', 'tshirtSizing', 'capability', 'investment', 'kpi'],
          phaseDefaults: {
            capabilityTransition: {
              hexawareFts: 4,
              clientFts: 5,
              independenceFts: 55,
              targetIndependence: 75,
              currentIndependence: 50
            },
            valueRealization: {
              expectedValueRangeMin: 150000,
              expectedValueRangeMax: 600000,
              defaultKpiCategories: ['efficiency', 'quality', 'cost_savings']
            },
            responsibleAI: {
              riskTier: 'high',
              assessmentRequired: true,
              recommendedCheckpoints: ['production_monitoring', 'incident_response']
            }
          }
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
          expectedDurationWeeks: null,
          staffingRatio: { vendor: 0.15, client: 0.85 },
          dataRequirements: {
            entry: ['kpiData'],
            exit: ['valueRealization']
          },
          unlockedFeatures: ['overview', 'scoring', 'rai', 'details', 'tshirtSizing', 'capability', 'investment', 'kpi', 'valueRealization'],
          phaseDefaults: {
            capabilityTransition: {
              hexawareFts: 1,
              clientFts: 8,
              independenceFts: 90,
              targetIndependence: 95,
              currentIndependence: 85
            },
            valueRealization: {
              expectedValueRangeMin: 300000,
              expectedValueRangeMax: 1500000,
              defaultKpiCategories: ['efficiency', 'quality', 'cost_savings', 'revenue']
            },
            responsibleAI: {
              riskTier: 'low',
              assessmentRequired: false,
              recommendedCheckpoints: ['annual_review', 'continuous_monitoring']
            }
          }
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
      expectedDurationWeeks: 8,
      staffingRatio: { vendor: 0.6, client: 0.4 },
      dataRequirements: {
        entry: ['title', 'description', 'primaryBusinessOwner'],
        exit: ['scoringComplete', 'raiAssessment']
      },
      unlockedFeatures: ['overview', 'scoring', 'rai'],
      phaseDefaults: {
        capabilityTransition: {
          hexawareFts: 5,
          clientFts: 1,
          independenceFts: 10,
          targetIndependence: 20,
          currentIndependence: 5
        },
        valueRealization: {
          expectedValueRangeMin: null,
          expectedValueRangeMax: null,
          defaultKpiCategories: []
        },
        responsibleAI: {
          riskTier: 'medium',
          assessmentRequired: true,
          recommendedCheckpoints: ['bias_review', 'data_privacy']
        }
      }
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
      expectedDurationWeeks: 16,
      staffingRatio: { vendor: 0.5, client: 0.5 },
      dataRequirements: {
        entry: ['scoringComplete'],
        exit: ['processMapping', 'tshirtSizing']
      },
      unlockedFeatures: ['overview', 'scoring', 'rai', 'details', 'tshirtSizing'],
      phaseDefaults: {
        capabilityTransition: {
          hexawareFts: 8,
          clientFts: 2,
          independenceFts: 20,
          targetIndependence: 40,
          currentIndependence: 15
        },
        valueRealization: {
          expectedValueRangeMin: 50000,
          expectedValueRangeMax: 200000,
          defaultKpiCategories: ['efficiency', 'quality']
        },
        responsibleAI: {
          riskTier: 'medium',
          assessmentRequired: true,
          recommendedCheckpoints: ['model_validation', 'fairness_testing']
        }
      }
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
      expectedDurationWeeks: 12,
      staffingRatio: { vendor: 0.35, client: 0.65 },
      dataRequirements: {
        entry: ['processMapping'],
        exit: ['investmentData', 'capabilityData']
      },
      unlockedFeatures: ['overview', 'scoring', 'rai', 'details', 'tshirtSizing', 'capability', 'investment'],
      phaseDefaults: {
        capabilityTransition: {
          hexawareFts: 4,
          clientFts: 4,
          independenceFts: 50,
          targetIndependence: 70,
          currentIndependence: 40
        },
        valueRealization: {
          expectedValueRangeMin: 100000,
          expectedValueRangeMax: 500000,
          defaultKpiCategories: ['efficiency', 'quality', 'cost_savings']
        },
        responsibleAI: {
          riskTier: 'high',
          assessmentRequired: true,
          recommendedCheckpoints: ['production_monitoring', 'incident_response']
        }
      }
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
      expectedDurationWeeks: null,
      staffingRatio: { vendor: 0.15, client: 0.85 },
      dataRequirements: {
        entry: ['investmentData', 'capabilityData'],
        exit: ['kpiData', 'valueRealization']
      },
      unlockedFeatures: ['overview', 'scoring', 'rai', 'details', 'tshirtSizing', 'capability', 'investment', 'kpi', 'valueRealization'],
      phaseDefaults: {
        capabilityTransition: {
          hexawareFts: 1,
          clientFts: 7,
          independenceFts: 85,
          targetIndependence: 95,
          currentIndependence: 80
        },
        valueRealization: {
          expectedValueRangeMin: 200000,
          expectedValueRangeMax: 1000000,
          defaultKpiCategories: ['efficiency', 'quality', 'cost_savings', 'revenue']
        },
        responsibleAI: {
          riskTier: 'low',
          assessmentRequired: false,
          recommendedCheckpoints: ['annual_review', 'continuous_monitoring']
        }
      }
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
  tomConfig: TomConfig,
  governanceGates?: GovernanceGateInput
): DerivedPhaseResult {
  if (!tomConfig || tomConfig.enabled !== 'true') {
    return { id: 'disabled', name: 'TOM Disabled', color: '#6B7280', isOverride: false, matchedBy: 'disabled' };
  }

  // GOVERNANCE GATE CHECK: Operating Model gate must be passed to enter TOM lifecycle
  // This aligns with AI governance best practices (NIST AI RMF, ISO 42001):
  // "Every AI initiative needs a named owner" before proceeding
  if (governanceGates && !governanceGates.operatingModelPassed) {
    return { 
      id: 'unphased', 
      name: 'Unphased', 
      color: '#9CA3AF', 
      isOverride: false, 
      matchedBy: 'unphased' 
    };
  }

  // Manual override takes precedence (if governance gate passed)
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

  // Find phases that match the current status
  const matchingPhases: TomPhase[] = [];
  for (const phase of tomConfig.phases) {
    if (phase.manualOnly) continue;
    if (useCaseStatus && phase.mappedStatuses.includes(useCaseStatus)) {
      matchingPhases.push(phase);
    }
  }

  // METADATA-DRIVEN ENTRY: If no status match but OM gate passed, 
  // enter the FIRST phase of the active preset (works for any TOM preset)
  if (matchingPhases.length === 0) {
    // Check if governance gates were provided (indicating gate-based flow)
    if (governanceGates && governanceGates.operatingModelPassed) {
      // Get phases sorted by order to find the entry phase
      const sortedPhases = [...tomConfig.phases].sort((a, b) => a.order - b.order);
      const entryPhase = sortedPhases.find(p => !p.manualOnly);
      if (entryPhase) {
        return {
          id: entryPhase.id,
          name: entryPhase.name,
          color: entryPhase.color,
          isOverride: false,
          matchedBy: 'governance_entry'
        };
      }
    }
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
    governanceGates?: GovernanceGateInput;
  }>,
  tomConfig: TomConfig
): Record<string, number> {
  const summary: Record<string, number> = {};
  
  for (const phase of tomConfig.phases) {
    summary[phase.id] = 0;
  }
  summary['unmapped'] = 0;
  summary['disabled'] = 0;
  summary['unphased'] = 0;

  for (const useCase of useCases) {
    const derived = derivePhase(
      useCase.useCaseStatus,
      useCase.deploymentStatus,
      useCase.tomPhaseOverride,
      tomConfig,
      useCase.governanceGates
    );
    summary[derived.id] = (summary[derived.id] || 0) + 1;
  }

  return summary;
}

export interface PhaseReadinessResult {
  currentPhase: TomPhase | null;
  nextPhase: TomPhase | null;
  entryRequirementsMet: string[];
  entryRequirementsPending: string[];
  exitRequirementsMet: string[];
  exitRequirementsPending: string[];
  readinessPercent: number;
  canProgress: boolean;
  recommendedTab: string;
}

export interface UseCaseDataForReadiness {
  title?: string | null;
  description?: string | null;
  primaryBusinessOwner?: string | null;
  processes?: string[] | null;
  activities?: string[] | null;
  revenueImpact?: number | null;
  costSavings?: number | null;
  riskReduction?: number | null;
  brokerPartnerExperience?: number | null;
  strategicFit?: number | null;
  technicalComplexity?: number | null;
  dataReadiness?: number | null;
  organizationalReadiness?: number | null;
  integrationComplexity?: number | null;
  regulatoryCompliance?: number | null;
  raiQuestionnaireComplete?: string | null;
  investmentCostGbp?: number | null;
  runCostPerYearGbp?: number | null;
  targetIndependence?: number | null;
  currentIndependence?: number | null;
  selectedKpis?: string[] | null;
}

export function checkDataRequirement(
  requirement: string,
  useCase: UseCaseDataForReadiness
): boolean {
  switch (requirement) {
    case 'title':
      return Boolean(useCase.title && useCase.title.trim().length > 0);
    case 'description':
      return Boolean(useCase.description && useCase.description.trim().length > 0);
    case 'primaryBusinessOwner':
      return Boolean(useCase.primaryBusinessOwner && useCase.primaryBusinessOwner.trim().length > 0);
    case 'scoringComplete':
      const hasImpactScores = [
        useCase.revenueImpact,
        useCase.costSavings,
        useCase.riskReduction,
        useCase.brokerPartnerExperience,
        useCase.strategicFit
      ].some(s => s !== null && s !== undefined);
      const hasEffortScores = [
        useCase.technicalComplexity,
        useCase.dataReadiness,
        useCase.organizationalReadiness,
        useCase.integrationComplexity,
        useCase.regulatoryCompliance
      ].some(s => s !== null && s !== undefined);
      return hasImpactScores && hasEffortScores;
    case 'strategicAlignment':
      return Boolean(useCase.strategicFit !== null && useCase.strategicFit !== undefined);
    case 'raiAssessment':
      return useCase.raiQuestionnaireComplete === 'true';
    case 'processMapping':
      const hasProcesses = Array.isArray(useCase.processes) && useCase.processes.length > 0;
      const hasActivities = Array.isArray(useCase.activities) && useCase.activities.length > 0;
      return hasProcesses || hasActivities;
    case 'tshirtSizing':
      return Boolean(useCase.investmentCostGbp && useCase.investmentCostGbp > 0);
    case 'investmentData':
      return Boolean(useCase.investmentCostGbp && useCase.investmentCostGbp > 0);
    case 'capabilityData':
      return Boolean(
        useCase.targetIndependence !== null && 
        useCase.targetIndependence !== undefined &&
        useCase.currentIndependence !== null &&
        useCase.currentIndependence !== undefined
      );
    case 'kpiData':
      return Array.isArray(useCase.selectedKpis) && useCase.selectedKpis.length > 0;
    case 'valueRealization':
      return Array.isArray(useCase.selectedKpis) && useCase.selectedKpis.length > 0;
    default:
      return false;
  }
}

export function getRequirementLabel(requirement: string): string {
  const labels: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    primaryBusinessOwner: 'Business Owner',
    strategicAlignment: 'Strategic Alignment',
    scoringComplete: '10-Lever Scoring',
    raiAssessment: 'RAI Assessment',
    processMapping: 'Process & Activity Mapping',
    tshirtSizing: 'T-Shirt Sizing',
    investmentData: 'Investment Data',
    capabilityData: 'Capability Transition Data',
    kpiData: 'KPI Selection',
    valueRealization: 'Value Realization Data'
  };
  return labels[requirement] || requirement;
}

export const REQUIREMENT_TAB_MAPPING: Record<string, string> = {
  title: 'basic',
  description: 'basic',
  primaryBusinessOwner: 'basic',
  strategicAlignment: 'assessment',
  scoringComplete: 'assessment',
  raiAssessment: 'rai',
  processMapping: 'details',
  tshirtSizing: 'details',
  investmentData: 'details',
  capabilityData: 'details',
  kpiData: 'details',
  valueRealization: 'details'
};

export function calculatePhaseReadiness(
  useCase: UseCaseDataForReadiness,
  currentPhaseId: string,
  tomConfig: TomConfig
): PhaseReadinessResult {
  const currentPhase = tomConfig.phases.find(p => p.id === currentPhaseId) || null;
  const nextPhaseIndex = currentPhase 
    ? tomConfig.phases.findIndex(p => p.id === currentPhaseId) + 1 
    : 0;
  const nextPhase = nextPhaseIndex < tomConfig.phases.length 
    ? tomConfig.phases[nextPhaseIndex] 
    : null;

  const entryRequirements = currentPhase?.dataRequirements?.entry || [];
  const exitRequirements = currentPhase?.dataRequirements?.exit || [];

  const entryRequirementsMet = entryRequirements.filter(r => checkDataRequirement(r, useCase));
  const entryRequirementsPending = entryRequirements.filter(r => !checkDataRequirement(r, useCase));
  const exitRequirementsMet = exitRequirements.filter(r => checkDataRequirement(r, useCase));
  const exitRequirementsPending = exitRequirements.filter(r => !checkDataRequirement(r, useCase));

  const totalRequirements = entryRequirements.length + exitRequirements.length;
  const metRequirements = entryRequirementsMet.length + exitRequirementsMet.length;
  const readinessPercent = totalRequirements > 0 
    ? Math.round((metRequirements / totalRequirements) * 100) 
    : 100;

  const canProgress = exitRequirementsPending.length === 0;

  let recommendedTab = 'basic';
  const allPendingRequirements = [...entryRequirementsPending, ...exitRequirementsPending];
  if (allPendingRequirements.length > 0) {
    const firstPending = allPendingRequirements[0];
    recommendedTab = REQUIREMENT_TAB_MAPPING[firstPending] || 'basic';
  }

  return {
    currentPhase,
    nextPhase,
    entryRequirementsMet,
    entryRequirementsPending,
    exitRequirementsMet,
    exitRequirementsPending,
    readinessPercent,
    canProgress,
    recommendedTab
  };
}

// ============================================
// PHASE TRANSITION DETECTION UTILITIES
// Implements Phase Transition Governance per replit.md:
// "When changing use case status triggers a phase transition, 
//  the system checks if exit requirements are met."
// Aligns with NAIC Model Bulletin, NIST AI RMF, ISO 42001
// ============================================

export interface PhaseTransitionInfo {
  hasTransition: boolean;
  fromPhase: TomPhase | null;
  toPhase: TomPhase | null;
  fromPhaseId: string | null;
  toPhaseId: string | null;
  exitRequirementsMet: string[];
  exitRequirementsPending: string[];
  canProgressWithoutWarning: boolean;
  isExitingUnphasedOrDisabled: boolean;
}

export interface PhaseTransitionCheckInput {
  currentStatus: string | null;
  currentDeployment: string | null;
  currentOverride: string | null;
  newStatus: string | null;
  newDeployment: string | null;
  newOverride: string | null;
  useCaseData: UseCaseDataForReadiness;
  governanceGates?: GovernanceGateInput;
}

/**
 * Detects if a status/deployment/override change will trigger a phase transition.
 * Returns detailed information about the transition including exit requirement status.
 * 
 * Per replit.md: "Transitions from unphased/disabled states bypass this check 
 * since they have no exit requirements."
 */
export function detectPhaseTransition(
  input: PhaseTransitionCheckInput,
  tomConfig: TomConfig
): PhaseTransitionInfo {
  const result: PhaseTransitionInfo = {
    hasTransition: false,
    fromPhase: null,
    toPhase: null,
    fromPhaseId: null,
    toPhaseId: null,
    exitRequirementsMet: [],
    exitRequirementsPending: [],
    canProgressWithoutWarning: true,
    isExitingUnphasedOrDisabled: false
  };

  // If TOM is not enabled, no transition tracking needed
  if (tomConfig.enabled !== 'true') {
    return result;
  }

  // Derive current phase
  const currentDerived = derivePhase(
    input.currentStatus,
    input.currentDeployment,
    input.currentOverride,
    tomConfig,
    input.governanceGates
  );

  // Derive new phase after changes
  const newDerived = derivePhase(
    input.newStatus,
    input.newDeployment,
    input.newOverride,
    tomConfig,
    input.governanceGates
  );

  result.fromPhaseId = currentDerived.id;
  result.toPhaseId = newDerived.id;

  // Check if phase actually changes
  if (currentDerived.id === newDerived.id) {
    return result;
  }

  result.hasTransition = true;

  // Find actual phase objects
  result.fromPhase = tomConfig.phases.find(p => p.id === currentDerived.id) || null;
  result.toPhase = tomConfig.phases.find(p => p.id === newDerived.id) || null;

  // Check if exiting from unphased/disabled/unmapped - these have no exit requirements
  const bypassStates = ['unphased', 'disabled', 'unmapped'];
  if (bypassStates.includes(currentDerived.id)) {
    result.isExitingUnphasedOrDisabled = true;
    result.canProgressWithoutWarning = true;
    return result;
  }

  // Calculate exit requirements for current phase
  if (result.fromPhase?.dataRequirements?.exit) {
    const exitReqs = result.fromPhase.dataRequirements.exit;
    result.exitRequirementsMet = exitReqs.filter(r => checkDataRequirement(r, input.useCaseData));
    result.exitRequirementsPending = exitReqs.filter(r => !checkDataRequirement(r, input.useCaseData));
  }

  // Determine if warning is needed
  // Per replit.md: Show warning if "requirements are incomplete (canProgress=false)"
  result.canProgressWithoutWarning = result.exitRequirementsPending.length === 0;

  return result;
}

/**
 * Simple helper to check if a phase transition warning dialog should be shown.
 * Returns true if:
 * - TOM is enabled
 * - Phase will change
 * - Current phase has incomplete exit requirements
 * - Not exiting from unphased/disabled state
 */
export function shouldShowPhaseTransitionWarning(
  transitionInfo: PhaseTransitionInfo
): boolean {
  return (
    transitionInfo.hasTransition &&
    !transitionInfo.isExitingUnphasedOrDisabled &&
    !transitionInfo.canProgressWithoutWarning
  );
}

/**
 * Format exit requirements into a user-friendly summary for display in warning dialog.
 */
export function formatExitRequirementsSummary(
  met: string[],
  pending: string[]
): { metLabels: string[]; pendingLabels: string[] } {
  return {
    metLabels: met.map(r => getRequirementLabel(r)),
    pendingLabels: pending.map(r => getRequirementLabel(r))
  };
}
