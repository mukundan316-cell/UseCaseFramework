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

export interface UseCaseCapabilityTransition {
  independencePercentage: number;
  independenceHistory: IndependenceHistoryEntry[];
  staffing: Staffing;
  knowledgeTransfer: KnowledgeTransfer;
  training: Training;
  selfSufficiencyTarget: SelfSufficiencyTarget;
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
  }
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
