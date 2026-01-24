import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import type { GovernanceStatus } from '@shared/calculations';
import type { TomConfig, PhaseReadinessResult, DerivedPhaseResult } from '@shared/tom';

export type FormData = {
  title: string;
  description: string;
  meaningfulId?: string;
  problemStatement?: string;
  process?: string;
  lineOfBusiness?: string;
  processes?: string[];
  activities?: string[];
  businessSegments?: string[];
  geographies?: string[];
  linesOfBusiness?: string[];
  businessSegment?: string;
  geography?: string;
  useCaseType?: string;
  activity?: string;
  librarySource: string;
  primaryBusinessOwner?: string;
  deliveryOwner?: string;
  valueValidator?: string;
  valueGovernanceModel?: 'business_led' | 'it_led' | 'joint' | null;
  useCaseStatus?: string;
  keyDependencies?: string;
  implementationTimeline?: string;
  successMetrics?: string;
  estimatedValue?: string;
  valueMeasurementApproach?: string;
  integrationRequirements?: string;
  aiMlTechnologies?: string[];
  dataSources?: string[];
  stakeholderGroups?: string[];
  isActiveForRsa: string;
  isDashboardVisible: string;
  libraryTier: string;
  activationReason?: string;
  revenueImpact?: number;
  costSavings?: number;
  riskReduction?: number;
  brokerPartnerExperience?: number;
  strategicFit?: number;
  dataReadiness?: number;
  technicalComplexity?: number;
  changeImpact?: number;
  modelRisk?: number;
  adoptionReadiness?: number;
  explainabilityRequired?: 'true' | 'false';
  customerHarmRisk?: string;
  dataOutsideUkEu?: 'true' | 'false';
  thirdPartyModel?: 'true' | 'false';
  humanAccountability?: 'true' | 'false';
  aiOrModel?: string;
  riskToCustomers?: string;
  riskToRsa?: string;
  dataUsed?: string;
  modelOwner?: string;
  rsaPolicyGovernance?: string;
  validationResponsibility?: string;
  informedBy?: string;
  manualImpactScore?: number | string | null;
  manualEffortScore?: number | string | null;
  manualQuadrant?: string | null;
  overrideReason?: string | null;
  businessFunction?: string;
  thirdPartyProvidedModel?: string;
  aiInventoryStatus?: string;
  deploymentStatus?: string;
  deactivationReason?: string;
  regulatoryCompliance?: number | null;
  horizontalUseCase: 'true' | 'false';
  horizontalUseCaseTypes?: string[];
  presentationUrl?: string;
  presentationPdfUrl?: string;
  presentationFileName?: string;
  tomPhaseOverride?: string | null;
  tomOverrideReason?: string;
  phaseTransitionReason?: string;
  initialInvestment?: number | string | null;
  ongoingMonthlyCost?: number | string | null;
  selectedKpis?: string[];
  capabilityVendorFte?: number | string | null;
  capabilityClientFte?: number | string | null;
  capabilityIndependence?: number | string | null;
  conservativeFactor?: number | null;
  validationStatus?: 'unvalidated' | 'pending_finance' | 'pending_actuarial' | 'fully_validated';
  rationale?: string;
};

export type CRUDModalForm = UseFormReturn<FormData>;

export interface RSASelectionState {
  isActiveForRsa: 'true' | 'false';
  isDashboardVisible: 'true' | 'false';
  libraryTier: 'active' | 'reference';
  activationReason: string;
  deactivationReason: string;
}

export interface ScoresState {
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  brokerPartnerExperience: number;
  strategicFit: number;
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  modelRisk: number;
  adoptionReadiness: number;
}

export interface BaseTabProps {
  form: CRUDModalForm;
  metadata: any;
}

export interface OperatingModelTabProps extends BaseTabProps {
  mode: 'create' | 'edit';
  useCase?: any;
  governanceStatus: GovernanceStatus;
  rsaSelection: RSASelectionState;
  handleRSAToggle: (active: 'true' | 'false') => void;
  handleDashboardToggle: (visible: 'true' | 'false') => void;
  handleActivationReasonChange: (reason: string) => void;
  handleDeactivationReasonChange: (reason: string) => void;
  handleStatusChange: (status: string) => void;
  useCaseStatusOptions: string[];
  sortedMetadata: any;
  isCheckingDuplicates: boolean;
  similarUseCases: Array<{ meaningfulId: string; title: string; similarityScore: number }>;
}

export interface DetailsTabProps extends BaseTabProps {
  isTomEnabled: boolean;
  tomConfig: TomConfig | undefined;
  tomPhases: any[];
  currentDerivedPhase: DerivedPhaseResult | null;
  scores: ScoresState;
  sortedMetadata: any;
  currencySymbol: string;
  aiMlTechnologiesOptions: string[];
  dataSourcesOptions: string[];
  stakeholderGroupsOptions: string[];
  showManualOverride: boolean;
  setShowManualOverride: (show: boolean) => void;
  editCapabilityTransition: boolean;
  setEditCapabilityTransition: (edit: boolean) => void;
  expandedSections: string[];
  setExpandedSections: (sections: string[]) => void;
}

export interface ResponsibleAITabProps extends BaseTabProps {
  governanceStatus: GovernanceStatus;
}

export interface ScoringTabProps extends BaseTabProps {
  scores: ScoresState;
  handleSliderChange: (field: keyof ScoresState, value: number) => void;
  governanceStatus: GovernanceStatus;
  currentImpactScore: number;
  currentEffortScore: number;
  currentQuadrant: string;
  rsaSelection: RSASelectionState;
  setIsOverrideEnabled: (enabled: boolean) => void;
  sliderTooltips: Record<string, string>;
  useCase?: any;
}

export interface GuideTabProps {
  governanceStatus: GovernanceStatus;
}

export type SectionCompletionCounts = {
  businessContext: { filled: number; total: number };
  implementationPlanning: { filled: number; total: number };
  valueRealization: { filled: number; total: number };
  technicalDetails: { filled: number; total: number };
  capabilityTransition: { filled: number; total: number };
};
