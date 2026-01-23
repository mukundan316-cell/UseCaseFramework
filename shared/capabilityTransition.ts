export interface IndependenceTarget {
  min: number;
  max: number;
  description: string;
}

export interface KnowledgeTransferMilestone {
  id: string;
  name: string;
  description: string;
  phase: 'foundation' | 'strategic' | 'transition' | 'steadyState';
  order: number;
  requiredArtifacts: string[];
}

export interface RoleTransition {
  role: string;
  vendorStartFte: number;
  clientEndFte: number;
  transitionMonth: number;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  estimatedHours: number;
}

// Benchmark archetype for auto-deriving capability defaults
export interface BenchmarkArchetype {
  independenceRange: [number, number];
  vendorFteMultiplier: number;
  clientFteMultiplier: number;
  transitionMonths: number;
}

export interface CapabilityBenchmarkConfig {
  archetypes: Record<string, BenchmarkArchetype>;
  paceModifiers: Record<string, number>;
  tShirtBaseFte: Record<string, number>;
}

export interface CapabilityTransitionConfig {
  enabled: string;
  independenceTargets: {
    foundation: IndependenceTarget;
    strategic: IndependenceTarget;
    transition: IndependenceTarget;
    steadyState: IndependenceTarget;
  };
  knowledgeTransferMilestones: KnowledgeTransferMilestone[];
  roleTransitions: RoleTransition[];
  certifications: Certification[];
  benchmarkConfig?: CapabilityBenchmarkConfig;
}

export interface IndependenceHistoryEntry {
  date: string;
  percentage: number;
  note: string;
}

export interface StaffingByRole {
  [role: string]: number;
}

export interface StaffingSnapshot {
  total: number;
  byRole: StaffingByRole;
}

export interface CurrentStaffing {
  vendor: StaffingSnapshot;
  client: StaffingSnapshot;
}

export interface PlannedStaffing {
  month6: { vendor: number; client: number };
  month12: { vendor: number; client: number };
  month18: { vendor: number; client: number };
}

export interface Staffing {
  current: CurrentStaffing;
  planned: PlannedStaffing;
}

export interface MilestoneNote {
  completedDate: string;
  signedOffBy: string;
  artifacts: string[];
}

export interface KnowledgeTransfer {
  completedMilestones: string[];
  inProgressMilestones: string[];
  milestoneNotes: Record<string, MilestoneNote>;
}

export interface CompletedCertification {
  certId: string;
  personName: string;
  completedDate: string;
}

export interface PlannedCertification {
  certId: string;
  personName: string;
  targetDate: string;
}

export interface Training {
  completedCertifications: CompletedCertification[];
  plannedCertifications: PlannedCertification[];
  totalTrainingHoursCompleted: number;
  totalTrainingHoursPlanned: number;
}

export interface SelfSufficiencyTarget {
  targetDate: string;
  targetIndependence: number;
  advisoryRetainer: string;
}

export interface RoleEvolutionEntry {
  roleId: string;
  roleName: string;
  baselineOwnership: 'vendor' | 'client' | 'shared';
  currentOwnership: 'vendor' | 'client' | 'shared';
  targetOwnership: 'vendor' | 'client' | 'shared';
  transitionHistory: Array<{
    date: string;
    fromOwnership: 'vendor' | 'client' | 'shared';
    toOwnership: 'vendor' | 'client' | 'shared';
    note: string;
    actor: string;
  }>;
  confidenceLevel: 'high' | 'medium' | 'low';
  targetTransitionDate: string | null;
}

export interface UseCaseCapabilityTransition {
  independencePercentage: number;
  independenceHistory: IndependenceHistoryEntry[];
  staffing: Staffing;
  knowledgeTransfer: KnowledgeTransfer;
  training: Training;
  selfSufficiencyTarget: SelfSufficiencyTarget;
  roleEvolution: RoleEvolutionEntry[];
  // Benchmark derivation tracking
  derived?: boolean;
  derivedAt?: string;
  derivedFrom?: {
    tomPhase?: string;
    quadrant?: string;
    tShirtSize?: string;
    operatingModel?: string;
  };
}

export interface PortfolioCapabilitySummary {
  overallIndependence: number;
  useCasesTracked: number;
  totalVendorFte: number;
  totalClientFte: number;
  ktMilestonesCompleted: number;
  ktMilestonesTotal: number;
  trainingHoursCompleted: number;
  trainingHoursPlanned: number;
  projectedFullIndependence: string | null;
}

export interface StaffingProjectionPoint {
  month: string;
  vendorFte: number;
  clientFte: number;
  independencePercentage: number;
}

export const DEFAULT_CAPABILITY_TRANSITION_CONFIG: CapabilityTransitionConfig = {
  enabled: 'true',
  independenceTargets: {
    foundation: { min: 0, max: 20, description: 'Vendor-led, client observing' },
    strategic: { min: 20, max: 50, description: 'Joint execution, client learning' },
    transition: { min: 50, max: 85, description: 'Client-led, vendor supporting' },
    steadyState: { min: 85, max: 100, description: 'Client self-sufficient' }
  },
  knowledgeTransferMilestones: [
    {
      id: 'kt_001',
      name: 'Solution Design Handover',
      description: 'Client team understands architecture and design decisions',
      phase: 'foundation',
      order: 1,
      requiredArtifacts: ['Architecture diagram', 'Design decisions doc']
    },
    {
      id: 'kt_002',
      name: 'Development Shadowing Complete',
      description: 'Client developers have paired on all major components',
      phase: 'strategic',
      order: 2,
      requiredArtifacts: ['Pairing log', 'Code walkthrough recordings']
    },
    {
      id: 'kt_003',
      name: 'Operations Handover',
      description: 'Client ops team can deploy, monitor, and troubleshoot',
      phase: 'strategic',
      order: 3,
      requiredArtifacts: ['Runbook', 'Monitoring dashboard access']
    },
    {
      id: 'kt_004',
      name: 'First Client-Led Release',
      description: 'Client team completes a release without vendor assistance',
      phase: 'transition',
      order: 4,
      requiredArtifacts: ['Release notes', 'Post-release review']
    },
    {
      id: 'kt_005',
      name: 'Model Retraining Capability',
      description: 'Client team can retrain and deploy model updates',
      phase: 'transition',
      order: 5,
      requiredArtifacts: ['Retraining procedure', 'Model registry access']
    },
    {
      id: 'kt_006',
      name: 'Full Independence Certification',
      description: 'Client team certified to operate without vendor support',
      phase: 'steadyState',
      order: 6,
      requiredArtifacts: ['Capability assessment', 'Sign-off document']
    }
  ],
  roleTransitions: [
    { role: 'Solution Architect', vendorStartFte: 1.0, clientEndFte: 1.0, transitionMonth: 12 },
    { role: 'Data Engineer', vendorStartFte: 2.0, clientEndFte: 2.0, transitionMonth: 9 },
    { role: 'ML Engineer', vendorStartFte: 2.0, clientEndFte: 1.5, transitionMonth: 12 },
    { role: 'Business Analyst', vendorStartFte: 1.0, clientEndFte: 1.0, transitionMonth: 6 },
    { role: 'QA Engineer', vendorStartFte: 1.0, clientEndFte: 1.0, transitionMonth: 9 },
    { role: 'Project Manager', vendorStartFte: 0.5, clientEndFte: 0.5, transitionMonth: 6 }
  ],
  certifications: [
    {
      id: 'cert_001',
      name: 'AI/ML Foundations',
      description: 'Basic understanding of AI/ML concepts',
      targetAudience: ['Business Analyst', 'Project Manager'],
      estimatedHours: 16
    },
    {
      id: 'cert_002',
      name: 'Platform Operations',
      description: 'Deployment, monitoring, and troubleshooting',
      targetAudience: ['Data Engineer', 'ML Engineer'],
      estimatedHours: 24
    },
    {
      id: 'cert_003',
      name: 'Model Development',
      description: 'Model training, evaluation, and optimization',
      targetAudience: ['ML Engineer', 'Data Scientist'],
      estimatedHours: 40
    },
    {
      id: 'cert_004',
      name: 'AI Governance & Ethics',
      description: 'Responsible AI principles and compliance',
      targetAudience: ['All roles'],
      estimatedHours: 8
    }
  ]
};

export const DEFAULT_USE_CASE_CAPABILITY_TRANSITION: UseCaseCapabilityTransition = {
  independencePercentage: 0,
  independenceHistory: [],
  staffing: {
    current: {
      vendor: { total: 0, byRole: {} },
      client: { total: 0, byRole: {} }
    },
    planned: {
      month6: { vendor: 0, client: 0 },
      month12: { vendor: 0, client: 0 },
      month18: { vendor: 0, client: 0 }
    }
  },
  knowledgeTransfer: {
    completedMilestones: [],
    inProgressMilestones: [],
    milestoneNotes: {}
  },
  training: {
    completedCertifications: [],
    plannedCertifications: [],
    totalTrainingHoursCompleted: 0,
    totalTrainingHoursPlanned: 0
  },
  selfSufficiencyTarget: {
    targetDate: '',
    targetIndependence: 90,
    advisoryRetainer: 'false'
  },
  roleEvolution: []
};

export function calculateIndependenceFromStaffing(staffing: CurrentStaffing): number {
  const vendorFte = staffing.vendor.total;
  const clientFte = staffing.client.total;
  const totalFte = vendorFte + clientFte;
  
  if (totalFte === 0) return 0;
  
  return Math.round((clientFte / totalFte) * 100);
}

export function calculateOverallPortfolioIndependence(
  useCases: Array<{ capabilityTransition: UseCaseCapabilityTransition | null; investmentAmount?: number }>
): number {
  const trackedCases = useCases.filter(uc => uc.capabilityTransition && uc.capabilityTransition.independencePercentage > 0);
  
  if (trackedCases.length === 0) return 0;
  
  let totalWeightedIndependence = 0;
  let totalWeight = 0;
  
  for (const uc of trackedCases) {
    const weight = uc.investmentAmount || 1;
    totalWeightedIndependence += (uc.capabilityTransition?.independencePercentage || 0) * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? Math.round(totalWeightedIndependence / totalWeight) : 0;
}

export function projectIndependenceTimeline(
  currentStaffing: CurrentStaffing,
  plannedStaffing: PlannedStaffing,
  startMonth: string = new Date().toISOString().slice(0, 7)
): StaffingProjectionPoint[] {
  const projections: StaffingProjectionPoint[] = [];
  const startDate = new Date(startMonth + '-01');
  
  projections.push({
    month: startMonth,
    vendorFte: currentStaffing.vendor.total,
    clientFte: currentStaffing.client.total,
    independencePercentage: calculateIndependenceFromStaffing(currentStaffing)
  });
  
  const milestones = [
    { monthOffset: 6, planned: plannedStaffing.month6 },
    { monthOffset: 12, planned: plannedStaffing.month12 },
    { monthOffset: 18, planned: plannedStaffing.month18 }
  ];
  
  for (const milestone of milestones) {
    const projectedDate = new Date(startDate);
    projectedDate.setMonth(projectedDate.getMonth() + milestone.monthOffset);
    const monthStr = projectedDate.toISOString().slice(0, 7);
    
    const totalFte = milestone.planned.vendor + milestone.planned.client;
    const independence = totalFte > 0 ? Math.round((milestone.planned.client / totalFte) * 100) : 0;
    
    projections.push({
      month: monthStr,
      vendorFte: milestone.planned.vendor,
      clientFte: milestone.planned.client,
      independencePercentage: independence
    });
  }
  
  return projections;
}

export function calculateKtProgress(
  completedMilestones: string[],
  totalMilestones: number
): number {
  if (totalMilestones === 0) return 0;
  return Math.round((completedMilestones.length / totalMilestones) * 100);
}

export function calculateTrainingProgress(
  completedHours: number,
  plannedHours: number
): number {
  if (plannedHours === 0) return 0;
  return Math.min(100, Math.round((completedHours / plannedHours) * 100));
}

export function getPhaseFromIndependence(
  percentage: number,
  config: CapabilityTransitionConfig
): 'foundation' | 'strategic' | 'transition' | 'steadyState' {
  if (percentage >= config.independenceTargets.steadyState.min) return 'steadyState';
  if (percentage >= config.independenceTargets.transition.min) return 'transition';
  if (percentage >= config.independenceTargets.strategic.min) return 'strategic';
  return 'foundation';
}

export function aggregatePortfolioCapability(
  useCases: Array<{ 
    capabilityTransition: UseCaseCapabilityTransition | null;
    valueRealization?: { investment?: { initialInvestment?: number } | null } | null;
  }>,
  config: CapabilityTransitionConfig
): PortfolioCapabilitySummary {
  const trackedCases = useCases.filter(uc => uc.capabilityTransition !== null);
  
  let totalVendorFte = 0;
  let totalClientFte = 0;
  let ktMilestonesCompleted = 0;
  let trainingHoursCompleted = 0;
  let trainingHoursPlanned = 0;
  let totalWeightedIndependence = 0;
  let totalWeight = 0;
  
  for (const uc of trackedCases) {
    const ct = uc.capabilityTransition!;
    const investment = uc.valueRealization?.investment?.initialInvestment || 1;
    
    totalVendorFte += ct.staffing.current.vendor.total;
    totalClientFte += ct.staffing.current.client.total;
    ktMilestonesCompleted += ct.knowledgeTransfer.completedMilestones.length;
    trainingHoursCompleted += ct.training.totalTrainingHoursCompleted;
    trainingHoursPlanned += ct.training.totalTrainingHoursPlanned;
    
    totalWeightedIndependence += ct.independencePercentage * investment;
    totalWeight += investment;
  }
  
  const ktMilestonesTotal = trackedCases.length * config.knowledgeTransferMilestones.length;
  const overallIndependence = totalWeight > 0 ? Math.round(totalWeightedIndependence / totalWeight) : 0;
  
  let projectedFullIndependence: string | null = null;
  if (overallIndependence < 85 && trackedCases.length > 0) {
    const avgMonthlyGrowth = 5;
    const monthsToGo = Math.ceil((85 - overallIndependence) / avgMonthlyGrowth);
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsToGo);
    projectedFullIndependence = projectedDate.toISOString().slice(0, 7);
  }
  
  return {
    overallIndependence,
    useCasesTracked: trackedCases.length,
    totalVendorFte,
    totalClientFte,
    ktMilestonesCompleted,
    ktMilestonesTotal,
    trainingHoursCompleted,
    trainingHoursPlanned,
    projectedFullIndependence
  };
}

export function generateAggregateStaffingProjection(
  useCases: Array<{ capabilityTransition: UseCaseCapabilityTransition | null }>
): StaffingProjectionPoint[] {
  const trackedCases = useCases.filter(uc => uc.capabilityTransition !== null);
  
  if (trackedCases.length === 0) {
    return [];
  }
  
  const now = new Date();
  const startMonth = now.toISOString().slice(0, 7);
  
  let currentVendor = 0;
  let currentClient = 0;
  let month6Vendor = 0;
  let month6Client = 0;
  let month12Vendor = 0;
  let month12Client = 0;
  let month18Vendor = 0;
  let month18Client = 0;
  
  for (const uc of trackedCases) {
    const ct = uc.capabilityTransition!;
    currentVendor += ct.staffing.current.vendor.total;
    currentClient += ct.staffing.current.client.total;
    month6Vendor += ct.staffing.planned.month6.vendor;
    month6Client += ct.staffing.planned.month6.client;
    month12Vendor += ct.staffing.planned.month12.vendor;
    month12Client += ct.staffing.planned.month12.client;
    month18Vendor += ct.staffing.planned.month18.vendor;
    month18Client += ct.staffing.planned.month18.client;
  }
  
  const calcIndependence = (vendor: number, client: number) => {
    const total = vendor + client;
    return total > 0 ? Math.round((client / total) * 100) : 0;
  };
  
  const projections: StaffingProjectionPoint[] = [
    {
      month: startMonth,
      vendorFte: currentVendor,
      clientFte: currentClient,
      independencePercentage: calcIndependence(currentVendor, currentClient)
    }
  ];
  
  const addMonths = (monthStr: string, offset: number): string => {
    const date = new Date(monthStr + '-01');
    date.setMonth(date.getMonth() + offset);
    return date.toISOString().slice(0, 7);
  };
  
  projections.push({
    month: addMonths(startMonth, 6),
    vendorFte: month6Vendor,
    clientFte: month6Client,
    independencePercentage: calcIndependence(month6Vendor, month6Client)
  });
  
  projections.push({
    month: addMonths(startMonth, 12),
    vendorFte: month12Vendor,
    clientFte: month12Client,
    independencePercentage: calcIndependence(month12Vendor, month12Client)
  });
  
  projections.push({
    month: addMonths(startMonth, 18),
    vendorFte: month18Vendor,
    clientFte: month18Client,
    independencePercentage: calcIndependence(month18Vendor, month18Client)
  });
  
  return projections;
}

// =============================================================================
// BENCHMARK-DRIVEN CAPABILITY DERIVATION
// Auto-derives capability defaults from use case attributes
// =============================================================================

export const DEFAULT_BENCHMARK_CONFIG: CapabilityBenchmarkConfig = {
  archetypes: {
    foundation_centralized: { 
      independenceRange: [0, 15], 
      vendorFteMultiplier: 0.9, 
      clientFteMultiplier: 0.1,
      transitionMonths: 18
    },
    foundation_coe: { 
      independenceRange: [5, 25], 
      vendorFteMultiplier: 0.7, 
      clientFteMultiplier: 0.3,
      transitionMonths: 15
    },
    strategic_centralized: { 
      independenceRange: [15, 35], 
      vendorFteMultiplier: 0.8, 
      clientFteMultiplier: 0.2,
      transitionMonths: 20
    },
    strategic_hybrid: { 
      independenceRange: [25, 50], 
      vendorFteMultiplier: 0.5, 
      clientFteMultiplier: 0.5,
      transitionMonths: 14
    },
    transition_centralized: { 
      independenceRange: [35, 55], 
      vendorFteMultiplier: 0.6, 
      clientFteMultiplier: 0.4,
      transitionMonths: 16
    },
    transition_hybrid: { 
      independenceRange: [50, 75], 
      vendorFteMultiplier: 0.35, 
      clientFteMultiplier: 0.65,
      transitionMonths: 10
    },
    steady_state_centralized: { 
      independenceRange: [60, 80], 
      vendorFteMultiplier: 0.2, 
      clientFteMultiplier: 0.8,
      transitionMonths: 6
    },
    steady_state_federated: { 
      independenceRange: [85, 100], 
      vendorFteMultiplier: 0.15, 
      clientFteMultiplier: 0.85,
      transitionMonths: 3
    }
  },
  paceModifiers: {
    'Quick Win': 0.7,
    'Strategic Bet': 1.0,
    'Experimental': 1.2,
    'Watchlist': 1.5
  },
  tShirtBaseFte: {
    XS: 2,
    S: 3,
    M: 5,
    L: 8,
    XL: 12
  }
};

export interface UseCaseForDerivation {
  id: string;
  title?: string;
  tomPhase?: string | null;
  quadrant?: string | null;
  tShirtSize?: string | null;
  deploymentStatus?: string | null;
  useCaseStatus?: string | null;
  capabilityTransition?: UseCaseCapabilityTransition | null;
}

function mapTomPhaseToArchetypeKey(tomPhase: string | null | undefined, operatingModel?: string): string {
  const phase = (tomPhase || 'foundation').toLowerCase();
  const model = (operatingModel || 'coe').toLowerCase();
  
  if (phase.includes('foundation')) {
    if (model.includes('centralized')) return 'foundation_centralized';
    return 'foundation_coe';
  }
  if (phase.includes('strategic')) {
    if (model.includes('centralized')) return 'strategic_centralized';
    return 'strategic_hybrid';
  }
  if (phase.includes('transition')) {
    if (model.includes('centralized')) return 'transition_centralized';
    return 'transition_hybrid';
  }
  if (phase.includes('steady') || phase.includes('state')) {
    if (model.includes('centralized')) return 'steady_state_centralized';
    return 'steady_state_federated';
  }
  return 'foundation_coe';
}

export interface PresetStaffingRatio {
  vendor: number;
  client: number;
}

export function getStaffingFromPresetProfile(
  tomPhase: string | null | undefined,
  presetStaffingRatios?: Record<string, PresetStaffingRatio>
): { vendorMultiplier: number; clientMultiplier: number } | null {
  if (!presetStaffingRatios) return null;
  const phase = (tomPhase || 'foundation').toLowerCase().replace('_', '');
  
  for (const [key, ratio] of Object.entries(presetStaffingRatios)) {
    if (phase.includes(key.replace('_', ''))) {
      return { vendorMultiplier: ratio.vendor, clientMultiplier: ratio.client };
    }
  }
  return null;
}

function getQuadrantFromScores(impactScore?: number, effortScore?: number): string {
  const impact = impactScore || 2.5;
  const effort = effortScore || 2.5;
  
  if (impact >= 2.5 && effort < 2.5) return 'Quick Win';
  if (impact >= 2.5 && effort >= 2.5) return 'Strategic Bet';
  if (impact < 2.5 && effort < 2.5) return 'Experimental';
  return 'Watchlist';
}

function deriveIndependenceFromDeploymentStatus(deploymentStatus: string | null | undefined): number {
  const status = (deploymentStatus || '').toLowerCase();
  if (status === 'production') return 65;
  if (status === 'pilot') return 40;
  if (status === 'poc') return 20;
  return 10;
}

function generateStaffingCurve(
  baseFte: number, 
  archetype: BenchmarkArchetype, 
  paceModifier: number
): { current: CurrentStaffing; planned: PlannedStaffing } {
  const vendorFte = Math.round(baseFte * archetype.vendorFteMultiplier * 10) / 10;
  const clientFte = Math.round(baseFte * archetype.clientFteMultiplier * 10) / 10;
  
  const transitionRate = 1 / paceModifier;
  
  const month6Vendor = Math.round(vendorFte * (1 - 0.25 * transitionRate) * 10) / 10;
  const month6Client = Math.round((baseFte - month6Vendor) * 10) / 10;
  
  const month12Vendor = Math.round(vendorFte * (1 - 0.6 * transitionRate) * 10) / 10;
  const month12Client = Math.round((baseFte - month12Vendor) * 10) / 10;
  
  const month18Vendor = Math.round(vendorFte * (1 - 0.85 * transitionRate) * 10) / 10;
  const month18Client = Math.round((baseFte - month18Vendor) * 10) / 10;
  
  return {
    current: {
      vendor: { total: vendorFte, byRole: {} },
      client: { total: clientFte, byRole: {} }
    },
    planned: {
      month6: { vendor: Math.max(0, month6Vendor), client: month6Client },
      month12: { vendor: Math.max(0, month12Vendor), client: month12Client },
      month18: { vendor: Math.max(0.5, month18Vendor), client: month18Client }
    }
  };
}

function deriveKtMilestones(
  deploymentStatus: string | null | undefined,
  config: CapabilityTransitionConfig
): KnowledgeTransfer {
  const status = (deploymentStatus || '').toLowerCase();
  const milestones = config.knowledgeTransferMilestones || [];
  
  let completedCount = 0;
  if (status === 'production') completedCount = 4;
  else if (status === 'pilot') completedCount = 2;
  else if (status === 'poc') completedCount = 1;
  
  const completed = milestones.slice(0, completedCount).map(m => m.id);
  const inProgress = completedCount < milestones.length 
    ? [milestones[completedCount].id] 
    : [];
  
  return {
    completedMilestones: completed,
    inProgressMilestones: inProgress,
    milestoneNotes: {}
  };
}

export function deriveCapabilityDefaults(
  useCase: UseCaseForDerivation,
  config: CapabilityTransitionConfig,
  benchmarkConfig?: CapabilityBenchmarkConfig
): UseCaseCapabilityTransition {
  const benchmark = benchmarkConfig || DEFAULT_BENCHMARK_CONFIG;
  
  const archetypeKey = mapTomPhaseToArchetypeKey(useCase.tomPhase);
  const archetype = benchmark.archetypes[archetypeKey] || benchmark.archetypes.foundation_coe;
  
  const quadrant = useCase.quadrant || getQuadrantFromScores();
  const paceModifier = benchmark.paceModifiers[quadrant] || 1.0;
  
  const tShirtSize = useCase.tShirtSize || 'M';
  const baseFte = benchmark.tShirtBaseFte[tShirtSize] || 5;
  
  const staffing = generateStaffingCurve(baseFte, archetype, paceModifier);
  
  const independenceFromDeployment = deriveIndependenceFromDeploymentStatus(useCase.deploymentStatus);
  const [minIndependence, maxIndependence] = archetype.independenceRange;
  const independencePercentage = Math.min(
    maxIndependence, 
    Math.max(minIndependence, independenceFromDeployment)
  );
  
  const ktProgress = deriveKtMilestones(useCase.deploymentStatus, config);
  
  const now = new Date();
  const targetMonths = Math.round(archetype.transitionMonths * paceModifier);
  const targetDate = new Date(now.getTime() + targetMonths * 30 * 24 * 60 * 60 * 1000);
  
  return {
    independencePercentage,
    independenceHistory: [
      {
        date: now.toISOString().slice(0, 7),
        percentage: independencePercentage,
        note: 'Auto-derived from use case attributes'
      }
    ],
    staffing,
    knowledgeTransfer: ktProgress,
    training: {
      completedCertifications: [],
      plannedCertifications: [],
      totalTrainingHoursCompleted: 0,
      totalTrainingHoursPlanned: baseFte * 20
    },
    selfSufficiencyTarget: {
      targetDate: targetDate.toISOString().slice(0, 10),
      targetIndependence: 90,
      advisoryRetainer: independencePercentage >= 75 ? 'true' : 'false'
    },
    roleEvolution: [],
    derived: true,
    derivedAt: now.toISOString(),
    derivedFrom: {
      tomPhase: useCase.tomPhase || undefined,
      quadrant: quadrant,
      tShirtSize: tShirtSize,
      operatingModel: 'coe_led'
    }
  };
}

export function shouldRecalculateCapability(
  existingCapability: UseCaseCapabilityTransition | null | undefined
): boolean {
  if (!existingCapability) return true;
  if (existingCapability.derived === true) return true;
  return false;
}
