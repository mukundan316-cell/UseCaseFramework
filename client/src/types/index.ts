export interface UseCase {
  id: string;
  title: string;
  description: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  businessSegment: string;
  geography: string;
  useCaseType: string;
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  strategicFit: number;
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  adoptionReadiness: number;
  impactScore: number;
  effortScore: number;
  quadrant: QuadrantType;
  createdAt?: Date;
}

export type QuadrantType = "Quick Win" | "Strategic Bet" | "Experimental" | "Watchlist";

export interface MetadataConfig {
  valueChainComponents: string[];
  processes: string[];
  linesOfBusiness: string[];
  businessSegments: string[];
  geographies: string[];
  useCaseTypes: string[];
}

export interface UseCaseFormData {
  title: string;
  description: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  businessSegment: string;
  geography: string;
  useCaseType: string;
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  strategicFit: number;
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  adoptionReadiness: number;
}

export interface FilterState {
  search: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  businessSegment: string;
  geography: string;
  useCaseType: string;
  quadrant: string;
}

export type TabType = "submit" | "matrix" | "explorer" | "admin";
