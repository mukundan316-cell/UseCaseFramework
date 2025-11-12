export interface UseCase {
  id: string;
  meaningfulId?: string; // Human-readable ID like HEX_INT_001
  title: string;
  description: string;
  problemStatement?: string;
  process: string;
  lineOfBusiness: string;
  linesOfBusiness?: string[];
  businessSegment: string;
  geography: string;
  useCaseType: string;
  // Multi-select array fields for enhanced flexibility
  processes?: string[];
  activities?: string[];
  businessSegments?: string[];
  geographies?: string[];
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

  impactScore: number;
  effortScore: number;
  quadrant: QuadrantType;
  activity?: string;
  recommendedByAssessment?: string | null;
  valueChainComponent?: string; // Compatibility alias for process
  createdAt?: Date;
  // Two-tier library management fields - using consistent string types per replit.md
  isActiveForRsa?: 'true' | 'false' | null;
  isDashboardVisible?: 'true' | 'false' | null;
  libraryTier?: string;
  activationDate?: Date;
  deactivationReason?: string;
  librarySource?: string;
  // Manual score override fields
  manualImpactScore?: number;
  manualEffortScore?: number;
  manualQuadrant?: QuadrantType;
  overrideReason?: string;
  // AI Inventory specific fields
  aiOrModel?: string;
  riskToCustomers?: string;
  riskToRsa?: string;
  dataUsed?: string;
  modelOwner?: string;
  rsaPolicyGovernance?: string;
  validationResponsibility?: string;
  informedBy?: string;
  businessFunction?: string;
  thirdPartyProvidedModel?: string;
  aiInventoryStatus?: string;
  deploymentStatus?: string;
  // Presentation document fields
  presentationUrl?: string;
  presentationPdfUrl?: string;
  presentationFileName?: string;
  presentationUploadedAt?: string;
}

export type QuadrantType = "Quick Win" | "Strategic Bet" | "Experimental" | "Watchlist";



export interface UseCaseFormData {
  meaningfulId?: string; // Optional for manual entry during imports
  title: string;
  description: string;
  problemStatement?: string;
  process: string;
  lineOfBusiness: string;
  linesOfBusiness?: string[];
  businessSegment: string;
  geography: string;
  useCaseType: string;
  // Multi-select array fields for enhanced flexibility
  processes?: string[];
  activities?: string[];
  businessSegments?: string[];
  geographies?: string[];
  // Business Impact Levers (Impact Score)
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  brokerPartnerExperience: number;
  strategicFit: number;
  // Implementation Effort Levers (Effort Score)
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  modelRisk: number;
  adoptionReadiness: number;
  // AI Governance Levers

  activity?: string;
  // Assessment recommendation tracking
  recommendedByAssessment?: string;
}

export interface FilterState {
  search: string;
  process?: string;
  lineOfBusiness?: string;
  businessSegment?: string;
  geography?: string;
  useCaseType?: string;
  activity?: string;
  quadrant?: string;
  showRecommendations?: boolean;
}

export type TabType = "dashboard" | "explorer" | "admin" | "assessment";
