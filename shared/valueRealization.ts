export interface MaturityCondition {
  min?: number;
  max?: number;
}

export interface MaturityRule {
  level: 'advanced' | 'developing' | 'foundational';
  conditions: Record<string, MaturityCondition>;
  range: { min: number; max: number };
  confidence: 'high' | 'medium' | 'low';
}

export interface IndustryBenchmark {
  baselineValue: number;
  baselineUnit: string;
  baselineSource: string;
  improvementRange: { min: number; max: number };
  improvementUnit: string;
  typicalTimeline: string;
  maturityTiers: {
    foundational: { min: number; max: number };
    developing: { min: number; max: number };
    advanced: { min: number; max: number };
  };
}

export type KpiType = 'financial' | 'operational' | 'strategic' | 'compliance';
export type ValueStream = 'operational_savings' | 'cor_improvement' | 'revenue_uplift' | 'risk_mitigation' | 'customer_experience' | 'regulatory_compliance';
export type AggregationMethod = 'sum' | 'average' | 'latest' | 'none';

// KPI Category definitions - 5 insurance + 11 enterprise categories
export const KPI_CATEGORIES = [
  // Insurance Value Chain Categories
  { id: 'underwriting', name: 'Underwriting & Risk Selection', icon: 'FileSearch', valueChain: 'insurance' },
  { id: 'claims', name: 'Claims Management', icon: 'ClipboardCheck', valueChain: 'insurance' },
  { id: 'policy_admin', name: 'Policy Administration', icon: 'FileText', valueChain: 'insurance' },
  { id: 'distribution', name: 'Distribution & Broker', icon: 'Users', valueChain: 'insurance' },
  { id: 'finance_actuarial', name: 'Finance & Actuarial', icon: 'Calculator', valueChain: 'insurance' },
  // Enterprise / AI Operations Categories
  { id: 'model_performance', name: 'Model Performance & Reliability', icon: 'Activity', valueChain: 'enterprise' },
  { id: 'data_quality', name: 'Data Quality & Feature Management', icon: 'Database', valueChain: 'enterprise' },
  { id: 'tech_debt', name: 'Technical Debt & Platform Health', icon: 'Shield', valueChain: 'enterprise' },
  { id: 'talent', name: 'Talent & Team Sustainability', icon: 'UserCheck', valueChain: 'enterprise' },
  { id: 'innovation', name: 'Innovation Pipeline Metrics', icon: 'Lightbulb', valueChain: 'enterprise' },
  { id: 'business_alignment', name: 'Business Alignment & Stakeholder Health', icon: 'Handshake', valueChain: 'enterprise' },
  { id: 'genai', name: 'GenAI-Specific KPIs', icon: 'Sparkles', valueChain: 'enterprise' },
  { id: 'it_infra', name: 'IT Infrastructure & Operations', icon: 'Server', valueChain: 'enterprise' },
  { id: 'security', name: 'Security & Privacy Metrics', icon: 'Lock', valueChain: 'enterprise' },
  { id: 'customer_exp', name: 'Customer Experience KPIs', icon: 'Smile', valueChain: 'enterprise' },
  { id: 'operational_eff', name: 'Operational Efficiency Metrics', icon: 'Settings', valueChain: 'enterprise' },
] as const;

export type KpiCategoryId = typeof KPI_CATEGORIES[number]['id'];
export type KpiValueChain = 'insurance' | 'enterprise';

// Helper function to get category name from id
export function getCategoryName(categoryId: string): string {
  const category = KPI_CATEGORIES.find(c => c.id === categoryId);
  return category?.name || categoryId;
}

// Helper function to get category by id
export function getCategory(categoryId: string) {
  return KPI_CATEGORIES.find(c => c.id === categoryId);
}

export interface KpiDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: 'increase' | 'decrease';
  applicableProcesses?: string[]; // Optional - empty/undefined means org-wide KPI
  applicableActivities?: string[]; // Optional - activity-level filtering for more precise matching
  relevanceScore?: number; // 1-10: Higher = more commonly used, suggested first
  industryBenchmarks?: Record<string, IndustryBenchmark>;
  maturityRules?: MaturityRule[]; // Optional - defaults applied when deriving values
  kpiType?: KpiType; // Optional - defaults to 'operational'
  valueStream?: ValueStream;
  isMonetizable: boolean;
  monetizationFormula?: string;
  aggregationMethod?: AggregationMethod; // Optional - defaults to 'sum'
  // New category fields
  categoryId: KpiCategoryId;
  benchmark?: string; // Human-readable benchmark target e.g., "90-95% accuracy"
}

export interface KpiValue {
  baselineValue: number | null;
  baselineUnit: string;
  targetValue: number | null;
  targetUnit: string;
  derivedMaturityLevel: 'advanced' | 'developing' | 'foundational' | null;
  derivedRange: { min: number; max: number } | null;
  derivedConfidence: 'high' | 'medium' | 'low' | null;
  isOverridden: boolean;
  overrideValue: number | null;
  overrideReason: string | null;
}

export interface InvestmentData {
  initialInvestment: number;
  ongoingMonthlyCost: number;
  currency: string;
}

export interface TrackingEntry {
  month: string;
  actuals: Record<string, { value: number; unit: string }>;
  notes: string;
}

export interface CalculatedMetrics {
  currentRoi: number | null;
  projectedBreakevenMonth: string | null;
  cumulativeValueGbp: number | null;
  lastCalculated: string | null;
}

export type ValidationStatus = 'unvalidated' | 'pending_finance' | 'pending_actuarial' | 'fully_validated';

export interface ValueConfidence {
  conservativeFactor: number;
  validationStatus: ValidationStatus;
  adjustedValueGbp: number | null;
  rationale: string | null;
  lastValidatedAt?: string;
  lastValidatedBy?: string;
}

export interface ValueRealization {
  selectedKpis: string[];
  kpiValues: Record<string, KpiValue>;
  investment: InvestmentData | null;
  tracking: {
    entries: TrackingEntry[];
  };
  calculatedMetrics: CalculatedMetrics;
  valueConfidence?: ValueConfidence;
}

export interface ValueRealizationConfig {
  enabled: string;
  kpiLibrary: Record<string, KpiDefinition>;
  calculationConfig: {
    roiFormula: string;
    breakevenFormula: string;
    defaultCurrency: string;
    fiscalYearStart: number;
  };
}

export interface PortfolioValueSummary {
  totalInvestment: number;
  cumulativeValue: number;
  portfolioRoi: number | null;
  avgBreakevenMonths: number | null;
  useCasesWithValue: number;
  byPhase: Record<string, { investment: number; value: number; count: number }>;
  byQuadrant: Record<string, { investment: number; value: number; count: number }>;
}

export interface MaturityDerivationResult {
  level: 'advanced' | 'developing' | 'foundational';
  range: { min: number; max: number };
  confidence: 'high' | 'medium' | 'low';
  matchedConditions: Record<string, { actual: number; required: MaturityCondition }>;
}

export interface UseCaseScores {
  dataReadiness?: number | null;
  technicalComplexity?: number | null;
  adoptionReadiness?: number | null;
  changeImpact?: number | null;
  modelRisk?: number | null;
  riskReduction?: number | null;
  revenueImpact?: number | null;
  costImpact?: number | null;
  regulatoryImpact?: number | null;
  customerExperience?: number | null;
}

export function deriveMaturityLevel(
  scores: UseCaseScores,
  maturityRules?: MaturityRule[]
): MaturityDerivationResult {
  // If no maturity rules provided, return foundational defaults
  if (!maturityRules || maturityRules.length === 0) {
    return {
      level: 'foundational',
      range: { min: 0, max: 10 },
      confidence: 'low',
      matchedConditions: {}
    };
  }
  
  for (const rule of maturityRules) {
    const matchedConditions: Record<string, { actual: number; required: MaturityCondition }> = {};
    let allConditionsMet = true;

    for (const [scoreName, condition] of Object.entries(rule.conditions)) {
      const scoreValue = scores[scoreName as keyof UseCaseScores];
      
      if (scoreValue === null || scoreValue === undefined) {
        allConditionsMet = false;
        break;
      }

      let conditionMet = true;
      if (condition.min !== undefined && scoreValue < condition.min) {
        conditionMet = false;
      }
      if (condition.max !== undefined && scoreValue > condition.max) {
        conditionMet = false;
      }

      if (conditionMet) {
        matchedConditions[scoreName] = { actual: scoreValue, required: condition };
      } else {
        allConditionsMet = false;
        break;
      }
    }

    if (allConditionsMet) {
      return {
        level: rule.level,
        range: rule.range,
        confidence: rule.confidence,
        matchedConditions
      };
    }
  }

  const foundationalRule = maturityRules.find(r => r.level === 'foundational');
  if (foundationalRule) {
    return {
      level: 'foundational',
      range: foundationalRule.range,
      confidence: foundationalRule.confidence,
      matchedConditions: {}
    };
  }

  return {
    level: 'foundational',
    range: { min: 0, max: 10 },
    confidence: 'low',
    matchedConditions: {}
  };
}

export function calculateRoi(cumulativeValue: number, totalInvestment: number): number | null {
  if (totalInvestment <= 0) return null;
  return ((cumulativeValue - totalInvestment) / totalInvestment) * 100;
}

export function calculateBreakevenMonth(
  totalInvestment: number,
  monthlyValue: number,
  startDate: Date = new Date()
): string | null {
  if (monthlyValue <= 0) return null;
  
  const monthsToBreakeven = Math.ceil(totalInvestment / monthlyValue);
  const breakevenDate = new Date(startDate);
  breakevenDate.setMonth(breakevenDate.getMonth() + monthsToBreakeven);
  
  return breakevenDate.toISOString().slice(0, 7);
}

export function aggregatePortfolioValue(
  useCases: Array<{
    valueRealization?: ValueRealization | null;
    quadrant?: string | null;
    derivedPhase?: { id: string } | null;
  }>
): PortfolioValueSummary {
  const summary: PortfolioValueSummary = {
    totalInvestment: 0,
    cumulativeValue: 0,
    portfolioRoi: null,
    avgBreakevenMonths: null,
    useCasesWithValue: 0,
    byPhase: {},
    byQuadrant: {}
  };

  let totalBreakevenMonths = 0;
  let breakevenCount = 0;

  for (const uc of useCases) {
    const vr = uc.valueRealization as any;
    if (!vr) continue;
    
    let investment = 0;
    let value = 0;
    let hasTracking = false;
    
    // Check for manually tracked investment data first
    if (vr.investment) {
      investment = vr.investment.initialInvestment + (vr.investment.ongoingMonthlyCost * 12);
      value = vr.calculatedMetrics?.cumulativeValueGbp || 0;
      hasTracking = true;

      summary.totalInvestment += investment;
      summary.cumulativeValue += value;
      summary.useCasesWithValue++;
    }
    // Fall back to auto-derived estimates (from KPI matching)
    else if (vr.totalEstimatedValue || vr.kpiEstimates) {
      const estimatedValue = vr.totalEstimatedValue?.max || vr.totalEstimatedValue?.min || 0;
      const kpiValue = vr.kpiEstimates?.reduce((sum: number, kpi: any) => 
        sum + (kpi.estimatedAnnualValueGbp || 0), 0) || 0;
      value = estimatedValue || kpiValue;
      
      if (value > 0) {
        summary.cumulativeValue += value;
        summary.useCasesWithValue++;
      }
    } else {
      continue;
    }

    // Track by phase and quadrant (only for tracked values, not estimates)
    if (hasTracking) {
      const phaseId = uc.derivedPhase?.id || 'unknown';
      if (!summary.byPhase[phaseId]) {
        summary.byPhase[phaseId] = { investment: 0, value: 0, count: 0 };
      }
      summary.byPhase[phaseId].investment += investment;
      summary.byPhase[phaseId].value += value;
      summary.byPhase[phaseId].count++;

      const quadrant = uc.quadrant || 'unknown';
      if (!summary.byQuadrant[quadrant]) {
        summary.byQuadrant[quadrant] = { investment: 0, value: 0, count: 0 };
      }
      summary.byQuadrant[quadrant].investment += investment;
      summary.byQuadrant[quadrant].value += value;
      summary.byQuadrant[quadrant].count++;

      if (vr.calculatedMetrics?.projectedBreakevenMonth) {
        const now = new Date();
        const breakeven = new Date(vr.calculatedMetrics.projectedBreakevenMonth);
        const months = (breakeven.getFullYear() - now.getFullYear()) * 12 + 
                      (breakeven.getMonth() - now.getMonth());
        if (months > 0) {
          totalBreakevenMonths += months;
          breakevenCount++;
        }
      }
    }
  }

  if (summary.totalInvestment > 0) {
    summary.portfolioRoi = calculateRoi(summary.cumulativeValue, summary.totalInvestment);
  }

  if (breakevenCount > 0) {
    summary.avgBreakevenMonths = Math.round(totalBreakevenMonths / breakevenCount);
  }

  return summary;
}

export interface ApplicableKpiResult {
  kpiId: string;
  kpi: KpiDefinition;
  matchedProcesses: string[];
  matchedActivities: string[];
  industryBenchmark: IndustryBenchmark | null;
  benchmarkProcess: string | null;
  relevanceScore: number; // Combined score: base relevance + activity match bonus
  isSuggested: boolean; // Top 5 by relevance are marked as suggested
}

export interface ValueEstimateResult {
  kpiId: string;
  kpiName: string;
  maturityLevel: 'advanced' | 'developing' | 'foundational';
  expectedRange: { min: number; max: number };
  confidence: 'high' | 'medium' | 'low';
  benchmark: IndustryBenchmark | null;
  benchmarkProcess: string | null;
  estimatedAnnualValueGbp: { min: number; max: number } | null;
  kpiType?: KpiType; // For Insights KPI Type Distribution
  valueStream?: ValueStream; // For Insights Value by Stream
}

/**
 * Normalize process name for fuzzy matching
 * Removes parentheses content, extra spaces, and standardizes common variations
 */
function normalizeProcessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/&/g, 'and')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find matching process in KPI applicableProcesses with fuzzy matching
 * Returns the canonical KPI process name if found, null otherwise
 */
function findMatchingProcess(
  processToMatch: string,
  applicableProcesses: string[]
): string | null {
  // First try exact match
  if (applicableProcesses.includes(processToMatch)) {
    return processToMatch;
  }
  
  // Try normalized matching
  const normalizedInput = normalizeProcessName(processToMatch);
  for (const kpiProcess of applicableProcesses) {
    const normalizedKpiProcess = normalizeProcessName(kpiProcess);
    if (normalizedInput === normalizedKpiProcess) {
      return kpiProcess;
    }
    // Also check if one contains the other (for partial matches)
    if (normalizedInput.includes(normalizedKpiProcess) || normalizedKpiProcess.includes(normalizedInput)) {
      return kpiProcess;
    }
  }
  
  return null;
}

/**
 * Find matching activity in KPI applicableActivities with fuzzy matching
 */
function findMatchingActivity(
  activityToMatch: string,
  applicableActivities: string[]
): string | null {
  if (!applicableActivities || applicableActivities.length === 0) return null;
  
  const normalizedInput = normalizeProcessName(activityToMatch);
  for (const kpiActivity of applicableActivities) {
    const normalizedKpiActivity = normalizeProcessName(kpiActivity);
    if (normalizedInput === normalizedKpiActivity) {
      return kpiActivity;
    }
    // Partial match
    if (normalizedInput.includes(normalizedKpiActivity) || normalizedKpiActivity.includes(normalizedInput)) {
      return kpiActivity;
    }
  }
  return null;
}

export interface GetApplicableKpisOptions {
  activities?: string[];
  suggestedCount?: number; // Number of top KPIs to mark as suggested (default: 5)
}

export function getApplicableKpis(
  processes: string[],
  kpiLibrary: Record<string, KpiDefinition>,
  options: GetApplicableKpisOptions = {}
): ApplicableKpiResult[] {
  const { activities = [], suggestedCount = 5 } = options;
  const results: ApplicableKpiResult[] = [];
  const addedKpis = new Set<string>();

  for (const process of processes) {
    for (const [kpiId, kpi] of Object.entries(kpiLibrary)) {
      // Org-wide KPIs (no applicableProcesses) match any process
      if (!kpi.applicableProcesses || kpi.applicableProcesses.length === 0) {
        if (!addedKpis.has(kpiId)) {
          results.push({
            kpiId,
            kpi,
            matchedProcesses: ['Organization-wide'],
            matchedActivities: [],
            industryBenchmark: null,
            benchmarkProcess: null,
            relevanceScore: kpi.relevanceScore || 3, // Lower relevance for org-wide
            isSuggested: false,
          });
          addedKpis.add(kpiId);
        }
        continue;
      }
      
      // Use fuzzy matching for process
      const matchedKpiProcess = findMatchingProcess(process, kpi.applicableProcesses);
      
      if (matchedKpiProcess && !addedKpis.has(kpiId)) {
        const benchmark = kpi.industryBenchmarks?.[matchedKpiProcess] || null;
        
        // Check activity matching for bonus relevance
        const matchedActivities: string[] = [];
        let activityBonus = 0;
        
        if (kpi.applicableActivities && kpi.applicableActivities.length > 0) {
          for (const activity of activities) {
            const matchedActivity = findMatchingActivity(activity, kpi.applicableActivities);
            if (matchedActivity && !matchedActivities.includes(matchedActivity)) {
              matchedActivities.push(matchedActivity);
              activityBonus += 3; // +3 relevance per activity match
            }
          }
        }
        
        // Calculate relevance: base score + activity bonus
        const baseRelevance = kpi.relevanceScore || 5;
        const relevanceScore = baseRelevance + activityBonus;
        
        const existingResult = results.find(r => r.kpiId === kpiId);
        
        if (existingResult) {
          existingResult.matchedProcesses.push(process);
          if (matchedActivities.length > 0) {
            existingResult.matchedActivities.push(...matchedActivities);
          }
          existingResult.relevanceScore = Math.max(existingResult.relevanceScore, relevanceScore);
          if (!existingResult.industryBenchmark && benchmark) {
            existingResult.industryBenchmark = benchmark;
            existingResult.benchmarkProcess = matchedKpiProcess;
          }
        } else {
          results.push({
            kpiId,
            kpi,
            matchedProcesses: [process],
            matchedActivities,
            industryBenchmark: benchmark,
            benchmarkProcess: benchmark ? matchedKpiProcess : null,
            relevanceScore,
            isSuggested: false,
          });
          addedKpis.add(kpiId);
        }
      }
    }
  }

  // Sort by relevance (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Prioritize KPI type diversity in suggestions
  // Group by kpiType and pick top from each available type
  const kpiTypes: KpiType[] = ['financial', 'operational', 'strategic', 'compliance'];
  const byType: Record<KpiType, ApplicableKpiResult[]> = {
    financial: [],
    operational: [],
    strategic: [],
    compliance: []
  };
  
  for (const result of results) {
    const type = result.kpi.kpiType || 'operational';
    byType[type].push(result);
  }
  
  // Select diverse KPIs: 1-2 from each available type, prioritized by relevance
  const suggestedIds = new Set<string>();
  const kpisPerType = Math.max(1, Math.floor(suggestedCount / 4)); // At least 1 per type
  
  // First pass: pick top N from each type that has KPIs
  for (const type of kpiTypes) {
    const typeKpis = byType[type];
    for (let i = 0; i < Math.min(kpisPerType, typeKpis.length); i++) {
      suggestedIds.add(typeKpis[i].kpiId);
    }
  }
  
  // Second pass: fill remaining slots with highest relevance KPIs
  let remainingSlots = suggestedCount - suggestedIds.size;
  for (const result of results) {
    if (remainingSlots <= 0) break;
    if (!suggestedIds.has(result.kpiId)) {
      suggestedIds.add(result.kpiId);
      remainingSlots--;
    }
  }
  
  // Mark suggested KPIs
  for (const result of results) {
    result.isSuggested = suggestedIds.has(result.kpiId);
  }

  return results;
}

const MONETARY_UNITS = ['GBP', 'USD', 'EUR', 'gbp', 'usd', 'eur', '£', '$', '€'];
const HOUR_BASED_UNITS = ['hours', 'hour', 'hrs', 'hr', 'fte'];

function isMonetaryUnit(unit: string): boolean {
  return MONETARY_UNITS.some(m => unit.toLowerCase().includes(m.toLowerCase()));
}

function isHourBasedUnit(unit: string): boolean {
  return HOUR_BASED_UNITS.some(h => unit.toLowerCase().includes(h.toLowerCase()));
}

const DEFAULT_HOURLY_RATE_GBP = 45;

export interface ValueEstimateOptions {
  hourlyRate?: number;
  currencyCode?: string;
}

export function deriveValueEstimates(
  processes: string[],
  scores: UseCaseScores,
  kpiLibrary: Record<string, KpiDefinition>,
  volumeMultiplier: number = 1000,
  options: ValueEstimateOptions = {}
): ValueEstimateResult[] {
  const hourlyRate = options.hourlyRate ?? DEFAULT_HOURLY_RATE_GBP;
  const applicableKpis = getApplicableKpis(processes, kpiLibrary);
  const results: ValueEstimateResult[] = [];

  for (const { kpiId, kpi, industryBenchmark, benchmarkProcess } of applicableKpis) {
    const maturityResult = deriveMaturityLevel(scores, kpi.maturityRules);
    
    let expectedRange = maturityResult.range;
    
    if (industryBenchmark && benchmarkProcess) {
      const tiers = industryBenchmark.maturityTiers;
      expectedRange = tiers[maturityResult.level] || maturityResult.range;
    }

    let estimatedAnnualValueGbp: { min: number; max: number } | null = null;
    
    if (industryBenchmark && isMonetaryUnit(industryBenchmark.baselineUnit)) {
      const baselineValue = industryBenchmark.baselineValue;
      const minSavingsRate = expectedRange.min / 100;
      const maxSavingsRate = expectedRange.max / 100;
      
      estimatedAnnualValueGbp = {
        min: Math.round(baselineValue * minSavingsRate * volumeMultiplier),
        max: Math.round(baselineValue * maxSavingsRate * volumeMultiplier)
      };
    } else if (industryBenchmark && isHourBasedUnit(industryBenchmark.baselineUnit)) {
      const monthlyHoursMin = expectedRange.min;
      const monthlyHoursMax = expectedRange.max;
      const annualMultiplier = 12;
      
      estimatedAnnualValueGbp = {
        min: Math.round(monthlyHoursMin * hourlyRate * annualMultiplier),
        max: Math.round(monthlyHoursMax * hourlyRate * annualMultiplier)
      };
    } else if (expectedRange) {
      const monthlyHoursMin = expectedRange.min;
      const monthlyHoursMax = expectedRange.max;
      const annualMultiplier = 12;
      
      estimatedAnnualValueGbp = {
        min: Math.round(monthlyHoursMin * hourlyRate * annualMultiplier),
        max: Math.round(monthlyHoursMax * hourlyRate * annualMultiplier)
      };
    }

    results.push({
      kpiId,
      kpiName: kpi.name,
      maturityLevel: maturityResult.level,
      expectedRange,
      confidence: maturityResult.confidence,
      benchmark: industryBenchmark,
      benchmarkProcess,
      estimatedAnnualValueGbp,
      kpiType: kpi.kpiType || 'operational',
      valueStream: kpi.valueStream
    });
  }

  return results;
}

export function calculateTotalEstimatedValue(
  valueEstimates: ValueEstimateResult[]
): { min: number; max: number; currency: string } {
  let totalMin = 0;
  let totalMax = 0;

  for (const estimate of valueEstimates) {
    if (estimate.estimatedAnnualValueGbp) {
      totalMin += estimate.estimatedAnnualValueGbp.min;
      totalMax += estimate.estimatedAnnualValueGbp.max;
    }
  }

  return {
    min: totalMin,
    max: totalMax,
    currency: 'GBP'
  };
}

/**
 * Reference mapping of processes to applicable KPIs.
 * Note: This is maintained for documentation/reference purposes.
 * The actual KPI matching logic uses the applicableProcesses field
 * defined within each KPI in the kpiLibrary.
 */
export const PROCESS_KPI_MAPPING: Record<string, string[]> = {
  'Claims Management': ['cycle_time_reduction', 'cost_per_transaction', 'fte_efficiency', 'accuracy_improvement', 'loss_ratio_reduction'],
  'Underwriting & Triage': ['cycle_time_reduction', 'cost_per_transaction', 'fte_efficiency', 'accuracy_improvement', 'decision_consistency'],
  'Submission & Quote': ['cycle_time_reduction', 'cost_per_transaction', 'fte_efficiency', 'conversion_rate'],
  'Risk Consulting': ['fte_efficiency', 'customer_satisfaction', 'loss_ratio_reduction'],
  'Reinsurance': ['cycle_time_reduction', 'cost_per_transaction', 'accuracy_improvement'],
  'Regulatory & Compliance': ['cycle_time_reduction', 'fte_efficiency', 'accuracy_improvement', 'compliance_rate'],
  'Financial Management': ['cycle_time_reduction', 'cost_per_transaction', 'fte_efficiency', 'accuracy_improvement'],
  'Sales & Distribution (Including Broker Relationships)': ['conversion_rate', 'customer_satisfaction', 'fte_efficiency'],
  'Customer Servicing': ['cycle_time_reduction', 'customer_satisfaction', 'fte_efficiency'],
  'Policy Servicing': ['cycle_time_reduction', 'cost_per_transaction', 'fte_efficiency', 'accuracy_improvement'],
  'Billing': ['cycle_time_reduction', 'cost_per_transaction', 'fte_efficiency', 'accuracy_improvement'],
  'General': ['fte_efficiency', 'cost_per_transaction'],
  'Product & Rating': ['cycle_time_reduction', 'accuracy_improvement', 'fte_efficiency'],
  'Human Resources': ['fte_efficiency', 'cycle_time_reduction']
};

export const DEFAULT_VALUE_REALIZATION_CONFIG: ValueRealizationConfig = {
  enabled: 'true',
  kpiLibrary: {
    'uw_001': {
      id: 'uw_001',
      name: 'Submission Processing Time',
      description: 'Submission Processing Time - measures submission intake & triage within Underwriting',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      applicableActivities: ['Submission Intake', 'Quote Generation', 'Triage'],
      relevanceScore: 9,
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '50-70%',
      isMonetizable: true
    },
    'uw_002': {
      id: 'uw_002',
      name: 'Auto-Classification Accuracy',
      description: 'Auto-Classification Accuracy - measures submission intake & triage within Underwriting',
      unit: '%',
      direction: 'increase',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '90%+',
      isMonetizable: false
    },
    'uw_003': {
      id: 'uw_003',
      name: 'Submission Leakage Rate',
      description: 'Submission Leakage Rate - measures submission intake & triage within Underwriting',
      unit: '%',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      benchmark: '50% reduction',
      isMonetizable: true
    },
    'uw_004': {
      id: 'uw_004',
      name: 'Risk Assessment Time',
      description: 'Risk Assessment Time - measures risk assessment & scoring within Underwriting',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      applicableActivities: ['Risk Assessment', 'Risk Scoring', 'Risk Analysis'],
      relevanceScore: 10,
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '60-80%',
      isMonetizable: true
    },
    'uw_005': {
      id: 'uw_005',
      name: 'Risk Score Accuracy',
      description: 'Risk Score Accuracy - measures risk assessment & scoring within Underwriting',
      unit: '%',
      direction: 'increase',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      applicableActivities: ['Risk Assessment', 'Risk Scoring', 'Risk Analysis'],
      relevanceScore: 9,
      kpiType: 'operational',
      valueStream: 'cor_improvement',
      benchmark: '85%+',
      isMonetizable: true
    },
    'uw_006': {
      id: 'uw_006',
      name: 'Adverse Selection Rate',
      description: 'Adverse Selection Rate - measures risk assessment & scoring within Underwriting',
      unit: '%',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '30% reduction',
      isMonetizable: true
    },
    'uw_007': {
      id: 'uw_007',
      name: 'Quote Generation Time',
      description: 'Quote Generation Time - measures pricing & rate adequacy within Underwriting',
      unit: 'minutes',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '70-90%',
      isMonetizable: true
    },
    'uw_008': {
      id: 'uw_008',
      name: 'Rate Adequacy Index',
      description: 'Rate Adequacy Index - measures pricing & rate adequacy within Underwriting',
      unit: 'score',
      direction: 'increase',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: 'Within 2% of target',
      isMonetizable: true
    },
    'uw_009': {
      id: 'uw_009',
      name: 'Premium Leakage',
      description: 'Premium Leakage - measures pricing & rate adequacy within Underwriting',
      unit: '%',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      benchmark: '50% reduction',
      isMonetizable: true
    },
    'uw_010': {
      id: 'uw_010',
      name: 'Referral Rate',
      description: 'Referral Rate - measures referral & exception handling within Underwriting',
      unit: '%',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '30% reduction',
      isMonetizable: true
    },
    'uw_011': {
      id: 'uw_011',
      name: 'Referral Resolution Time',
      description: 'Referral Resolution Time - measures referral & exception handling within Underwriting',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '50%',
      isMonetizable: true
    },
    'uw_012': {
      id: 'uw_012',
      name: 'False Positive Referral Rate',
      description: 'False Positive Referral Rate - measures referral & exception handling within Underwriting',
      unit: '%',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '60% reduction',
      isMonetizable: true
    },
    'uw_013': {
      id: 'uw_013',
      name: 'Quote-to-Bind Ratio',
      description: 'Quote-to-Bind Ratio - measures bind & policy issuance within Underwriting',
      unit: '%',
      direction: 'increase',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      benchmark: '10-15% improvement',
      isMonetizable: true
    },
    'uw_014': {
      id: 'uw_014',
      name: 'Policy Issuance Time',
      description: 'Policy Issuance Time - measures bind & policy issuance within Underwriting',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'uw_015': {
      id: 'uw_015',
      name: 'Document Accuracy Rate',
      description: 'Document Accuracy Rate - measures bind & policy issuance within Underwriting',
      unit: '%',
      direction: 'increase',
      categoryId: 'underwriting' as KpiCategoryId,
      applicableProcesses: ['underwriting'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99%+',
      isMonetizable: true
    },
    'cl_001': {
      id: 'cl_001',
      name: 'FNOL Capture Time',
      description: 'FNOL Capture Time - measures first notice of loss (fnol) within Claims Management',
      unit: 'minutes',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      applicableActivities: ['First Notice of Loss (FNOL)', 'First Report of Injury (FROI)', 'Claims Intake'],
      relevanceScore: 10,
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '60-80%',
      isMonetizable: true
    },
    'cl_002': {
      id: 'cl_002',
      name: 'FNOL Data Completeness',
      description: 'FNOL Data Completeness - measures first notice of loss (fnol) within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '95%+',
      isMonetizable: true
    },
    'cl_003': {
      id: 'cl_003',
      name: 'Self-Service FNOL Rate',
      description: 'Self-Service FNOL Rate - measures first notice of loss (fnol) within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '50%+',
      isMonetizable: true
    },
    'cl_004': {
      id: 'cl_004',
      name: 'Triage Accuracy',
      description: 'Triage Accuracy - measures claims triage & assignment within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '95%+',
      isMonetizable: true
    },
    'cl_005': {
      id: 'cl_005',
      name: 'Auto-Triage Rate',
      description: 'Auto-Triage Rate - measures claims triage & assignment within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '70%+',
      isMonetizable: true
    },
    'cl_006': {
      id: 'cl_006',
      name: 'Routing Efficiency',
      description: 'Routing Efficiency - measures claims triage & assignment within Claims Management',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'cl_007': {
      id: 'cl_007',
      name: 'Investigation Cycle Time',
      description: 'Investigation Cycle Time - measures claims investigation within Claims Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '40-60%',
      isMonetizable: true
    },
    'cl_008': {
      id: 'cl_008',
      name: 'Document Collection Time',
      description: 'Document Collection Time - measures claims investigation within Claims Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '70%',
      isMonetizable: true
    },
    'cl_009': {
      id: 'cl_009',
      name: 'Fraud Detection Rate',
      description: 'Fraud Detection Rate - measures claims investigation within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '50% improvement',
      isMonetizable: true
    },
    'cl_010': {
      id: 'cl_010',
      name: 'Reserve Accuracy',
      description: 'Reserve Accuracy - measures reserve setting & management within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: 'Within 5% of actual',
      isMonetizable: true
    },
    'cl_011': {
      id: 'cl_011',
      name: 'Initial Reserve Time',
      description: 'Initial Reserve Time - measures reserve setting & management within Claims Management',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'cl_012': {
      id: 'cl_012',
      name: 'Reserve Development Volatility',
      description: 'Reserve Development Volatility - measures reserve setting & management within Claims Management',
      unit: '%',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '50% reduction',
      isMonetizable: true
    },
    'cl_013': {
      id: 'cl_013',
      name: 'Average Settlement Time',
      description: 'Average Settlement Time - measures settlement & payment within Claims Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '40-60%',
      isMonetizable: true
    },
    'cl_014': {
      id: 'cl_014',
      name: 'Straight-Through Processing Rate',
      description: 'Straight-Through Processing Rate - measures settlement & payment within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '60%+',
      isMonetizable: true
    },
    'cl_015': {
      id: 'cl_015',
      name: 'Payment Accuracy',
      description: 'Payment Accuracy - measures settlement & payment within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99.5%+',
      isMonetizable: true
    },
    'cl_016': {
      id: 'cl_016',
      name: 'Claims Severity',
      description: 'Claims Severity - measures settlement & payment within Claims Management',
      unit: 'GBP',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '10-20% reduction',
      isMonetizable: true
    },
    'cl_017': {
      id: 'cl_017',
      name: 'Subrogation Identification Rate',
      description: 'Subrogation Identification Rate - measures subrogation & recovery within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '90%+',
      isMonetizable: true
    },
    'cl_018': {
      id: 'cl_018',
      name: 'Recovery Rate',
      description: 'Recovery Rate - measures subrogation & recovery within Claims Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '20% improvement',
      isMonetizable: true
    },
    'cl_019': {
      id: 'cl_019',
      name: 'Recovery Cycle Time',
      description: 'Recovery Cycle Time - measures subrogation & recovery within Claims Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'claims' as KpiCategoryId,
      applicableProcesses: ['claims'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '40%',
      isMonetizable: true
    },
    'pa_001': {
      id: 'pa_001',
      name: 'Policy Issuance Time',
      description: 'Policy Issuance Time - measures policy issuance within Policy Administration',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'pa_002': {
      id: 'pa_002',
      name: 'Straight-Through Issuance Rate',
      description: 'Straight-Through Issuance Rate - measures policy issuance within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '85%+',
      isMonetizable: true
    },
    'pa_003': {
      id: 'pa_003',
      name: 'Policy Document Accuracy',
      description: 'Policy Document Accuracy - measures policy issuance within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99%+',
      isMonetizable: true
    },
    'pa_004': {
      id: 'pa_004',
      name: 'Endorsement Processing Time',
      description: 'Endorsement Processing Time - measures endorsements & changes within Policy Administration',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '70%',
      isMonetizable: true
    },
    'pa_005': {
      id: 'pa_005',
      name: 'Auto-Endorsement Rate',
      description: 'Auto-Endorsement Rate - measures endorsements & changes within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '70%+',
      isMonetizable: true
    },
    'pa_006': {
      id: 'pa_006',
      name: 'Premium Adjustment Accuracy',
      description: 'Premium Adjustment Accuracy - measures endorsements & changes within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'revenue_uplift',
      benchmark: '99.5%+',
      isMonetizable: true
    },
    'pa_007': {
      id: 'pa_007',
      name: 'Renewal Rate',
      description: 'Renewal Rate - measures renewal processing within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      benchmark: '5% improvement',
      isMonetizable: true
    },
    'pa_008': {
      id: 'pa_008',
      name: 'Auto-Renewal Rate',
      description: 'Auto-Renewal Rate - measures renewal processing within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '75%+',
      isMonetizable: true
    },
    'pa_009': {
      id: 'pa_009',
      name: 'Renewal Cycle Time',
      description: 'Renewal Cycle Time - measures renewal processing within Policy Administration',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '50%',
      isMonetizable: true
    },
    'pa_010': {
      id: 'pa_010',
      name: 'Non-Renewal Prediction Accuracy',
      description: 'Non-Renewal Prediction Accuracy - measures renewal processing within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      benchmark: '85%+',
      isMonetizable: true
    },
    'pa_011': {
      id: 'pa_011',
      name: 'Cancellation Processing Time',
      description: 'Cancellation Processing Time - measures cancellation & reinstatement within Policy Administration',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'pa_012': {
      id: 'pa_012',
      name: 'Reinstatement Rate',
      description: 'Reinstatement Rate - measures cancellation & reinstatement within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      benchmark: '50% improvement',
      isMonetizable: true
    },
    'pa_013': {
      id: 'pa_013',
      name: 'Premium Refund Accuracy',
      description: 'Premium Refund Accuracy - measures cancellation & reinstatement within Policy Administration',
      unit: '%',
      direction: 'increase',
      categoryId: 'policy_admin' as KpiCategoryId,
      applicableProcesses: ['policy_admin'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99.5%+',
      isMonetizable: true
    },
    'bl_001': {
      id: 'bl_001',
      name: 'Invoice Generation Time',
      description: 'Invoice Generation Time - measures premium invoicing within Billing & Collections',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '90%',
      isMonetizable: true
    },
    'bl_002': {
      id: 'bl_002',
      name: 'Invoice Accuracy',
      description: 'Invoice Accuracy - measures premium invoicing within Billing & Collections',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99.5%+',
      isMonetizable: true
    },
    'bl_003': {
      id: 'bl_003',
      name: 'Digital Invoice Adoption',
      description: 'Digital Invoice Adoption - measures premium invoicing within Billing & Collections',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '90%+',
      isMonetizable: true
    },
    'bl_004': {
      id: 'bl_004',
      name: 'Payment Posting Time',
      description: 'Payment Posting Time - measures payment processing within Billing & Collections',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '95%',
      isMonetizable: true
    },
    'bl_005': {
      id: 'bl_005',
      name: 'Auto-Reconciliation Rate',
      description: 'Auto-Reconciliation Rate - measures payment processing within Billing & Collections',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '95%+',
      isMonetizable: true
    },
    'bl_006': {
      id: 'bl_006',
      name: 'Payment Exception Rate',
      description: 'Payment Exception Rate - measures payment processing within Billing & Collections',
      unit: '%',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80% reduction',
      isMonetizable: true
    },
    'bl_007': {
      id: 'bl_007',
      name: 'Collection Rate',
      description: 'Collection Rate - measures collections & delinquency within Billing & Collections',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      benchmark: '5% improvement',
      isMonetizable: true
    },
    'bl_008': {
      id: 'bl_008',
      name: 'Days Sales Outstanding',
      description: 'Days Sales Outstanding - measures collections & delinquency within Billing & Collections',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '30% reduction',
      isMonetizable: true
    },
    'bl_009': {
      id: 'bl_009',
      name: 'Write-Off Rate',
      description: 'Write-Off Rate - measures collections & delinquency within Billing & Collections',
      unit: '%',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['billing'],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      benchmark: '50% reduction',
      isMonetizable: true
    },
    'ri_001': {
      id: 'ri_001',
      name: 'Placement Cycle Time',
      description: 'Placement Cycle Time - measures treaty placement & negotiation within Reinsurance',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '40%',
      isMonetizable: true
    },
    'ri_002': {
      id: 'ri_002',
      name: 'Reinsurance Cost Optimization',
      description: 'Reinsurance Cost Optimization - measures treaty placement & negotiation within Reinsurance',
      unit: '%',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'operational',
      valueStream: 'cor_improvement',
      benchmark: '10-15% reduction',
      isMonetizable: true
    },
    'ri_003': {
      id: 'ri_003',
      name: 'Coverage Gap Analysis Accuracy',
      description: 'Coverage Gap Analysis Accuracy - measures treaty placement & negotiation within Reinsurance',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      benchmark: '98%+',
      isMonetizable: true
    },
    'ri_004': {
      id: 'ri_004',
      name: 'Bordereaux Generation Time',
      description: 'Bordereaux Generation Time - measures bordereaux processing within Reinsurance',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'ri_005': {
      id: 'ri_005',
      name: 'Bordereaux Accuracy',
      description: 'Bordereaux Accuracy - measures bordereaux processing within Reinsurance',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99%+',
      isMonetizable: true
    },
    'ri_006': {
      id: 'ri_006',
      name: 'Auto-Population Rate',
      description: 'Auto-Population Rate - measures bordereaux processing within Reinsurance',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '90%+',
      isMonetizable: true
    },
    'ri_007': {
      id: 'ri_007',
      name: 'Settlement Cycle Time',
      description: 'Settlement Cycle Time - measures reinsurance settlement within Reinsurance',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '50%',
      isMonetizable: true
    },
    'ri_008': {
      id: 'ri_008',
      name: 'Recovery Rate',
      description: 'Recovery Rate - measures reinsurance settlement within Reinsurance',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '99%+',
      isMonetizable: true
    },
    'ri_009': {
      id: 'ri_009',
      name: 'Commutation Opportunity Identification',
      description: 'Commutation Opportunity Identification - measures reinsurance settlement within Reinsurance',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['reinsurance'],
      kpiType: 'operational',
      valueStream: 'cor_improvement',
      benchmark: '90%+',
      isMonetizable: true
    },
    'cs_001': {
      id: 'cs_001',
      name: 'First Contact Resolution Rate',
      description: 'First Contact Resolution Rate - measures inquiry handling within Customer Service',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'operational',
      valueStream: 'customer_experience',
      benchmark: '90%+',
      isMonetizable: true
    },
    'cs_002': {
      id: 'cs_002',
      name: 'Average Handle Time',
      description: 'Average Handle Time - measures inquiry handling within Customer Service',
      unit: 'minutes',
      direction: 'decrease',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '40%',
      isMonetizable: true
    },
    'cs_003': {
      id: 'cs_003',
      name: 'Self-Service Deflection Rate',
      description: 'Self-Service Deflection Rate - measures inquiry handling within Customer Service',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '60%+',
      isMonetizable: true
    },
    'cs_004': {
      id: 'cs_004',
      name: 'Complaint Resolution Time',
      description: 'Complaint Resolution Time - measures complaint resolution within Customer Service',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'operational',
      valueStream: 'customer_experience',
      benchmark: '50%',
      isMonetizable: true
    },
    'cs_005': {
      id: 'cs_005',
      name: 'Complaint Escalation Rate',
      description: 'Complaint Escalation Rate - measures complaint resolution within Customer Service',
      unit: '%',
      direction: 'decrease',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      benchmark: '60% reduction',
      isMonetizable: true
    },
    'cs_006': {
      id: 'cs_006',
      name: 'Customer Satisfaction Post-Complaint',
      description: 'Customer Satisfaction Post-Complaint - measures complaint resolution within Customer Service',
      unit: 'score',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'operational',
      valueStream: 'customer_experience',
      benchmark: '4.5+',
      isMonetizable: false
    },
    'cs_007': {
      id: 'cs_007',
      name: 'Certificate Issuance Time',
      description: 'Certificate Issuance Time - measures certificate & evidence issuance within Customer Service',
      unit: 'minutes',
      direction: 'decrease',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '90%',
      isMonetizable: true
    },
    'cs_008': {
      id: 'cs_008',
      name: 'Auto-Issuance Rate',
      description: 'Auto-Issuance Rate - measures certificate & evidence issuance within Customer Service',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '90%+',
      isMonetizable: true
    },
    'cs_009': {
      id: 'cs_009',
      name: 'Certificate Accuracy',
      description: 'Certificate Accuracy - measures certificate & evidence issuance within Customer Service',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      applicableProcesses: ['customer_service'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99.5%+',
      isMonetizable: true
    },
    'ds_001': {
      id: 'ds_001',
      name: 'Onboarding Cycle Time',
      description: 'Onboarding Cycle Time - measures agent onboarding & licensing within Distribution & Agency Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '60%',
      isMonetizable: true
    },
    'ds_002': {
      id: 'ds_002',
      name: 'License Verification Automation',
      description: 'License Verification Automation - measures agent onboarding & licensing within Distribution & Agency Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '90%+',
      isMonetizable: true
    },
    'ds_003': {
      id: 'ds_003',
      name: 'Compliance Verification Rate',
      description: 'Compliance Verification Rate - measures agent onboarding & licensing within Distribution & Agency Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      benchmark: '100%',
      isMonetizable: true
    },
    'ds_004': {
      id: 'ds_004',
      name: 'Commission Processing Time',
      description: 'Commission Processing Time - measures commission processing within Distribution & Agency Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '70%',
      isMonetizable: true
    },
    'ds_005': {
      id: 'ds_005',
      name: 'Commission Accuracy',
      description: 'Commission Accuracy - measures commission processing within Distribution & Agency Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '99.5%+',
      isMonetizable: true
    },
    'ds_006': {
      id: 'ds_006',
      name: 'Commission Dispute Rate',
      description: 'Commission Dispute Rate - measures commission processing within Distribution & Agency Management',
      unit: '%',
      direction: 'decrease',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '80% reduction',
      isMonetizable: true
    },
    'ds_007': {
      id: 'ds_007',
      name: 'Agency Scorecard Automation',
      description: 'Agency Scorecard Automation - measures agency performance management within Distribution & Agency Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '95%+',
      isMonetizable: true
    },
    'ds_008': {
      id: 'ds_008',
      name: 'Book Roll Prediction Accuracy',
      description: 'Book Roll Prediction Accuracy - measures agency performance management within Distribution & Agency Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      benchmark: '85%+',
      isMonetizable: true
    },
    'ds_009': {
      id: 'ds_009',
      name: 'Cross-Sell Recommendation Accuracy',
      description: 'Cross-Sell Recommendation Accuracy - measures agency performance management within Distribution & Agency Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'distribution' as KpiCategoryId,
      applicableProcesses: ['distribution'],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      benchmark: '40%+',
      isMonetizable: true
    },
    'ac_001': {
      id: 'ac_001',
      name: 'Rate Filing Cycle Time',
      description: 'Rate Filing Cycle Time - measures rate development & filing within Actuarial & Pricing',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '40%',
      isMonetizable: true
    },
    'ac_002': {
      id: 'ac_002',
      name: 'Rate Model Accuracy',
      description: 'Rate Model Accuracy - measures rate development & filing within Actuarial & Pricing',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '97%+',
      isMonetizable: true
    },
    'ac_003': {
      id: 'ac_003',
      name: 'Competitive Rate Analysis Time',
      description: 'Competitive Rate Analysis Time - measures rate development & filing within Actuarial & Pricing',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '70%',
      isMonetizable: true
    },
    'ac_004': {
      id: 'ac_004',
      name: 'Reserve Analysis Cycle Time',
      description: 'Reserve Analysis Cycle Time - measures loss reserving within Actuarial & Pricing',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '50%',
      isMonetizable: true
    },
    'ac_005': {
      id: 'ac_005',
      name: 'Reserve Adequacy',
      description: 'Reserve Adequacy - measures loss reserving within Actuarial & Pricing',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: 'Within 2%',
      isMonetizable: true
    },
    'ac_006': {
      id: 'ac_006',
      name: 'IBNR Estimation Accuracy',
      description: 'IBNR Estimation Accuracy - measures loss reserving within Actuarial & Pricing',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '97%+',
      isMonetizable: true
    },
    'ac_007': {
      id: 'ac_007',
      name: 'Experience Report Generation Time',
      description: 'Experience Report Generation Time - measures experience analysis & reporting within Actuarial & Pricing',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '80%',
      isMonetizable: true
    },
    'ac_008': {
      id: 'ac_008',
      name: 'Trend Identification Lead Time',
      description: 'Trend Identification Lead Time - measures experience analysis & reporting within Actuarial & Pricing',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '60%',
      isMonetizable: true
    },
    'ac_009': {
      id: 'ac_009',
      name: 'Data Quality Score',
      description: 'Data Quality Score - measures experience analysis & reporting within Actuarial & Pricing',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['actuarial'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '98%+',
      isMonetizable: false
    },
    'cm_001': {
      id: 'cm_001',
      name: 'Regulatory Filing Cycle Time',
      description: 'Regulatory Filing Cycle Time - measures regulatory reporting within Compliance & Risk Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '50%',
      isMonetizable: true
    },
    'cm_002': {
      id: 'cm_002',
      name: 'Filing Accuracy Rate',
      description: 'Filing Accuracy Rate - measures regulatory reporting within Compliance & Risk Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      benchmark: '100%',
      isMonetizable: true
    },
    'cm_003': {
      id: 'cm_003',
      name: 'Auto-Population Rate',
      description: 'Auto-Population Rate - measures regulatory reporting within Compliance & Risk Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      benchmark: '90%+',
      isMonetizable: true
    },
    'cm_004': {
      id: 'cm_004',
      name: 'Audit Response Time',
      description: 'Audit Response Time - measures audit & examination support within Compliance & Risk Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '60%',
      isMonetizable: true
    },
    'cm_005': {
      id: 'cm_005',
      name: 'Document Retrieval Time',
      description: 'Document Retrieval Time - measures audit & examination support within Compliance & Risk Management',
      unit: 'hours',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '90%',
      isMonetizable: true
    },
    'cm_006': {
      id: 'cm_006',
      name: 'Audit Finding Rate',
      description: 'Audit Finding Rate - measures audit & examination support within Compliance & Risk Management',
      unit: 'count',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      benchmark: '50% reduction',
      isMonetizable: true
    },
    'cm_007': {
      id: 'cm_007',
      name: 'Fraud Detection Rate',
      description: 'Fraud Detection Rate - measures fraud detection & prevention within Compliance & Risk Management',
      unit: '%',
      direction: 'increase',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      benchmark: '50% improvement',
      isMonetizable: true
    },
    'cm_008': {
      id: 'cm_008',
      name: 'False Positive Rate',
      description: 'False Positive Rate - measures fraud detection & prevention within Compliance & Risk Management',
      unit: '%',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      benchmark: '70% reduction',
      isMonetizable: true
    },
    'cm_009': {
      id: 'cm_009',
      name: 'Time to Fraud Identification',
      description: 'Time to Fraud Identification - measures fraud detection & prevention within Compliance & Risk Management',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'finance_actuarial' as KpiCategoryId,
      applicableProcesses: ['compliance'],
      kpiType: 'operational',
      valueStream: 'cor_improvement',
      benchmark: '70%',
      isMonetizable: true
    },
    'mp_001': {
      id: 'mp_001',
      name: 'Model Accuracy Degradation Rate',
      description: 'Percentage performance decline from baseline over time',
      unit: '%',
      direction: 'decrease',
      categoryId: 'model_performance' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<5% per quarter',
      isMonetizable: false
    },
    'mp_002': {
      id: 'mp_002',
      name: 'Prediction Confidence Distribution',
      description: 'Percentage of predictions above confidence threshold',
      unit: '%',
      direction: 'increase',
      categoryId: 'model_performance' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>85% high-confidence',
      isMonetizable: false
    },
    'mp_003': {
      id: 'mp_003',
      name: 'Inference Latency (p95)',
      description: '95th percentile response time',
      unit: 'ms',
      direction: 'decrease',
      categoryId: 'model_performance' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<200ms real-time, <2s batch',
      isMonetizable: false
    },
    'mp_004': {
      id: 'mp_004',
      name: 'Model Drift Detection Rate',
      description: 'Percentage of models with detected drift addressed within SLA',
      unit: '%',
      direction: 'increase',
      categoryId: 'model_performance' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '100% within 72hrs',
      isMonetizable: false
    },
    'mp_005': {
      id: 'mp_005',
      name: 'Feature Importance Stability',
      description: 'Variance in top feature importance rankings over time',
      unit: 'score',
      direction: 'decrease',
      categoryId: 'model_performance' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<10% variance',
      isMonetizable: false
    },
    'mp_006': {
      id: 'mp_006',
      name: 'A/B Test Statistical Power',
      description: 'Percentage of experiments reaching statistical significance',
      unit: '%',
      direction: 'increase',
      categoryId: 'model_performance' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '>80%',
      isMonetizable: false
    },
    'dq_001': {
      id: 'dq_001',
      name: 'Data Freshness Score',
      description: 'Percentage of features within defined staleness threshold',
      unit: '%',
      direction: 'increase',
      categoryId: 'data_quality' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>95% fresh',
      isMonetizable: false
    },
    'dq_002': {
      id: 'dq_002',
      name: 'Feature Store Coverage',
      description: 'Percentage of production models using governed features',
      unit: '%',
      direction: 'increase',
      categoryId: 'data_quality' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '>80% Y2, >95% Y3',
      isMonetizable: false
    },
    'dq_003': {
      id: 'dq_003',
      name: 'Feature Reuse Rate',
      description: 'Average times each feature used across models',
      unit: 'score',
      direction: 'increase',
      categoryId: 'data_quality' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>3 models/feature',
      isMonetizable: false
    },
    'dq_004': {
      id: 'dq_004',
      name: 'Data Quality Score (DQS)',
      description: 'Composite: completeness, accuracy, consistency',
      unit: '%',
      direction: 'increase',
      categoryId: 'data_quality' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>90%',
      isMonetizable: false
    },
    'dq_005': {
      id: 'dq_005',
      name: 'Data Pipeline SLA Adherence',
      description: 'Percentage of pipelines meeting freshness/reliability targets',
      unit: '%',
      direction: 'increase',
      categoryId: 'data_quality' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>99%',
      isMonetizable: false
    },
    'dq_006': {
      id: 'dq_006',
      name: 'Schema Drift Incidents',
      description: 'Monthly count of unexpected schema changes causing issues',
      unit: 'count',
      direction: 'decrease',
      categoryId: 'data_quality' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<5/month',
      isMonetizable: false
    },
    'td_001': {
      id: 'td_001',
      name: 'Technical Debt Ratio',
      description: 'Rework hours / total development hours',
      unit: '%',
      direction: 'decrease',
      categoryId: 'tech_debt' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<15%',
      isMonetizable: false
    },
    'td_002': {
      id: 'td_002',
      name: 'API Error Rate',
      description: 'Percentage of API calls returning errors',
      unit: '%',
      direction: 'decrease',
      categoryId: 'tech_debt' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<0.1%',
      isMonetizable: false
    },
    'td_003': {
      id: 'td_003',
      name: 'Security Vulnerability Remediation Time',
      description: 'Time to patch critical/high vulnerabilities',
      unit: 'hours/days',
      direction: 'increase',
      categoryId: 'tech_debt' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: 'Critical <24hrs, High <7 days',
      isMonetizable: false
    },
    'td_004': {
      id: 'td_004',
      name: 'Platform Currency Score',
      description: 'Percentage of stack on supported/current versions',
      unit: '%',
      direction: 'increase',
      categoryId: 'tech_debt' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>90%',
      isMonetizable: false
    },
    'td_005': {
      id: 'td_005',
      name: 'Infrastructure Cost Efficiency',
      description: 'Cost per 1M inferences',
      unit: 'GBP',
      direction: 'increase',
      categoryId: 'tech_debt' as KpiCategoryId,
      kpiType: 'financial',
      benchmark: 'Declining QoQ',
      isMonetizable: false
    },
    'td_006': {
      id: 'td_006',
      name: 'Environment Parity',
      description: 'Configuration consistency across dev/staging/prod',
      unit: '%',
      direction: 'increase',
      categoryId: 'tech_debt' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>95%',
      isMonetizable: false
    },
    'ta_001': {
      id: 'ta_001',
      name: 'AI Talent Retention Rate',
      description: 'Percentage of AI/ML staff retained annually',
      unit: '%',
      direction: 'increase',
      categoryId: 'talent' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '>85%',
      isMonetizable: false
    },
    'ta_002': {
      id: 'ta_002',
      name: 'Skill Gap Closure Velocity',
      description: 'Time to close identified capability gaps',
      unit: 'months',
      direction: 'decrease',
      categoryId: 'talent' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '<6 months',
      isMonetizable: false
    },
    'ta_003': {
      id: 'ta_003',
      name: 'Knowledge Documentation Coverage',
      description: 'Percentage of models with complete runbooks/documentation',
      unit: '%',
      direction: 'increase',
      categoryId: 'talent' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>90%',
      isMonetizable: false
    },
    'ta_004': {
      id: 'ta_004',
      name: 'Bus Factor Risk',
      description: 'Percentage of models with single-person dependency',
      unit: '%',
      direction: 'decrease',
      categoryId: 'talent' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '<10%',
      isMonetizable: false
    },
    'ta_005': {
      id: 'ta_005',
      name: 'Team Utilization Rate',
      description: 'Productive hours / available hours',
      unit: '%',
      direction: 'increase',
      categoryId: 'talent' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '70-80% (sustainable)',
      isMonetizable: false
    },
    'ta_006': {
      id: 'ta_006',
      name: 'Internal Mobility/Growth',
      description: 'Percentage of promotions/role expansions within AI team',
      unit: '%',
      direction: 'increase',
      categoryId: 'talent' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '>20%',
      isMonetizable: false
    },
    'in_001': {
      id: 'in_001',
      name: 'Idea-to-PoC Conversion Rate',
      description: 'Percentage of submitted ideas reaching PoC stage',
      unit: '%',
      direction: 'increase',
      categoryId: 'innovation' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '20-30%',
      isMonetizable: false
    },
    'in_002': {
      id: 'in_002',
      name: 'PoC Cycle Time',
      description: 'Average time from approval to PoC completion',
      unit: 'weeks',
      direction: 'decrease',
      categoryId: 'innovation' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<6 weeks',
      isMonetizable: false
    },
    'in_003': {
      id: 'in_003',
      name: 'Experimentation Velocity',
      description: 'Number of experiments completed per quarter',
      unit: 'count',
      direction: 'increase',
      categoryId: 'innovation' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '10-15 Y1, 25+ Y3',
      isMonetizable: false
    },
    'in_004': {
      id: 'in_004',
      name: 'Failed Experiment Learning Capture',
      description: 'Percentage of failed experiments with documented learnings',
      unit: '%',
      direction: 'increase',
      categoryId: 'innovation' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '100%',
      isMonetizable: false
    },
    'in_005': {
      id: 'in_005',
      name: 'Innovation Funnel Health',
      description: 'Ratio of ideas:PoC:pilot:production',
      unit: 'score',
      direction: 'increase',
      categoryId: 'innovation' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '10:3:1.5:1',
      isMonetizable: false
    },
    'in_006': {
      id: 'in_006',
      name: 'External Partnership Value',
      description: 'Number of vendor/academic partnerships delivering value',
      unit: 'count',
      direction: 'increase',
      categoryId: 'innovation' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '>2 active',
      isMonetizable: false
    },
    'sh_001': {
      id: 'sh_001',
      name: 'Business Sponsor Satisfaction',
      description: 'NPS/satisfaction score from business stakeholders',
      unit: 'score',
      direction: 'increase',
      categoryId: 'business_alignment' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '>70 NPS',
      isMonetizable: false
    },
    'sh_002': {
      id: 'sh_002',
      name: 'Strategic Priority Alignment',
      description: 'Percentage of active projects tied to top-5 strategic priorities',
      unit: '%',
      direction: 'increase',
      categoryId: 'business_alignment' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '>80%',
      isMonetizable: false
    },
    'sh_003': {
      id: 'sh_003',
      name: 'Demand Backlog Age',
      description: 'Average age of items in intake queue',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'business_alignment' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<90 days',
      isMonetizable: false
    },
    'sh_004': {
      id: 'sh_004',
      name: 'Stakeholder Engagement Frequency',
      description: 'Regular touchpoints with business sponsors',
      unit: 'count',
      direction: 'increase',
      categoryId: 'business_alignment' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: 'Monthly minimum',
      isMonetizable: false
    },
    'sh_005': {
      id: 'sh_005',
      name: 'Value Realization Communication',
      description: 'Percentage of deployed models with communicated business impact',
      unit: '%',
      direction: 'increase',
      categoryId: 'business_alignment' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>90%',
      isMonetizable: false
    },
    'sh_006': {
      id: 'sh_006',
      name: 'Executive Dashboard Access',
      description: 'Number of executives actively using AI performance dashboards',
      unit: 'count',
      direction: 'increase',
      categoryId: 'business_alignment' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>5 active users',
      isMonetizable: false
    },
    'ga_001': {
      id: 'ga_001',
      name: 'Hallucination Rate',
      description: 'Percentage of outputs with factual errors/fabrications',
      unit: '%',
      direction: 'decrease',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<2% high-risk, <5% low-risk',
      isMonetizable: false
    },
    'ga_002': {
      id: 'ga_002',
      name: 'Human Override Rate',
      description: 'Percentage of GenAI outputs requiring human correction',
      unit: '%',
      direction: 'decrease',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<10% at steady state',
      isMonetizable: false
    },
    'ga_003': {
      id: 'ga_003',
      name: 'Prompt Effectiveness Rate',
      description: 'Percentage of prompts achieving intended outcome',
      unit: '%',
      direction: 'increase',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>85%',
      isMonetizable: false
    },
    'ga_004': {
      id: 'ga_004',
      name: 'Token Cost Efficiency',
      description: 'Cost per 1,000 successful completions',
      unit: 'GBP',
      direction: 'increase',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'financial',
      benchmark: 'Declining MoM',
      isMonetizable: false
    },
    'ga_005': {
      id: 'ga_005',
      name: 'Guardrail Trigger Rate',
      description: 'Percentage of requests hitting safety/compliance guardrails',
      unit: '%',
      direction: 'decrease',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<5%',
      isMonetizable: false
    },
    'ga_006': {
      id: 'ga_006',
      name: 'Context Window Utilization',
      description: 'Average context window usage per request',
      unit: '%',
      direction: 'increase',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '60-80% optimal',
      isMonetizable: false
    },
    'ga_007': {
      id: 'ga_007',
      name: 'RAG Retrieval Precision',
      description: 'Relevance of retrieved documents in RAG pipelines',
      unit: '%',
      direction: 'increase',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>90%',
      isMonetizable: false
    },
    'ga_008': {
      id: 'ga_008',
      name: 'Response Time SLA Compliance',
      description: 'Percentage of GenAI responses meeting latency SLA',
      unit: '%',
      direction: 'increase',
      categoryId: 'genai' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>95%',
      isMonetizable: false
    },
    'it_001': {
      id: 'it_001',
      name: 'Cloud Cost Optimization',
      description: 'Cost savings through rightsizing, reserved instances, spot usage',
      unit: '%',
      direction: 'decrease',
      categoryId: 'it_infra' as KpiCategoryId,
      kpiType: 'financial',
      benchmark: '20-30% reduction Y1',
      isMonetizable: false
    },
    'it_002': {
      id: 'it_002',
      name: 'Infrastructure Utilization',
      description: 'Average compute/GPU utilization across AI workloads',
      unit: '%',
      direction: 'increase',
      categoryId: 'it_infra' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>70%',
      isMonetizable: false
    },
    'it_003': {
      id: 'it_003',
      name: 'Deployment Frequency',
      description: 'Number of production deployments per time period',
      unit: 'count',
      direction: 'increase',
      categoryId: 'it_infra' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: 'Daily for mature orgs',
      isMonetizable: false
    },
    'it_004': {
      id: 'it_004',
      name: 'Mean Time to Recovery (MTTR)',
      description: 'Average time to restore service after incident',
      unit: 'minutes',
      direction: 'decrease',
      categoryId: 'it_infra' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<60 mins',
      isMonetizable: false
    },
    'it_005': {
      id: 'it_005',
      name: 'Change Failure Rate',
      description: 'Percentage of deployments causing degraded service',
      unit: '%',
      direction: 'decrease',
      categoryId: 'it_infra' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<15%',
      isMonetizable: false
    },
    'it_006': {
      id: 'it_006',
      name: 'Lead Time for Changes',
      description: 'Time from code commit to production deployment',
      unit: 'days',
      direction: 'decrease',
      categoryId: 'it_infra' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '<1 day for elite',
      isMonetizable: false
    },
    'sp_001': {
      id: 'sp_001',
      name: 'AI Security Incidents',
      description: 'Number of security breaches related to AI systems',
      unit: 'count',
      direction: 'increase',
      categoryId: 'security' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '0 critical',
      isMonetizable: false
    },
    'sp_002': {
      id: 'sp_002',
      name: 'Privacy Compliance Rate',
      description: 'Percentage of AI models compliant with GDPR/CCPA/sector regs',
      unit: '%',
      direction: 'increase',
      categoryId: 'security' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '100%',
      isMonetizable: false
    },
    'sp_003': {
      id: 'sp_003',
      name: 'Access Control Adherence',
      description: 'Percentage of AI resources with proper RBAC implementation',
      unit: '%',
      direction: 'increase',
      categoryId: 'security' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '>99%',
      isMonetizable: false
    },
    'sp_004': {
      id: 'sp_004',
      name: 'Data Encryption Coverage',
      description: 'Percentage of AI data encrypted at rest and in transit',
      unit: '%',
      direction: 'increase',
      categoryId: 'security' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '100%',
      isMonetizable: false
    },
    'sp_005': {
      id: 'sp_005',
      name: 'Model Adversarial Testing',
      description: 'Percentage of models tested for adversarial vulnerabilities',
      unit: '%',
      direction: 'increase',
      categoryId: 'security' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '>80% of high-risk',
      isMonetizable: false
    },
    'sp_006': {
      id: 'sp_006',
      name: 'PII Detection Coverage',
      description: 'Percentage of training datasets scanned for PII',
      unit: '%',
      direction: 'increase',
      categoryId: 'security' as KpiCategoryId,
      kpiType: 'compliance',
      benchmark: '100% of training data',
      isMonetizable: false
    },
    'cx_001': {
      id: 'cx_001',
      name: 'AI-Assisted Resolution Rate',
      description: 'Percentage of customer issues resolved with AI assistance',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>60%',
      isMonetizable: false
    },
    'cx_002': {
      id: 'cx_002',
      name: 'Self-Service Adoption Rate',
      description: 'Percentage of customers using AI-powered self-service',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>40%',
      isMonetizable: false
    },
    'cx_003': {
      id: 'cx_003',
      name: 'Response Time Improvement',
      description: 'Reduction in average customer wait/response time',
      unit: '%',
      direction: 'decrease',
      categoryId: 'customer_exp' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '50% reduction',
      isMonetizable: false
    },
    'cx_004': {
      id: 'cx_004',
      name: 'Customer Effort Score (AI)',
      description: 'Customer effort for AI-assisted interactions',
      unit: 'score',
      direction: 'decrease',
      categoryId: 'customer_exp' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '<3 (1-7 scale)',
      isMonetizable: false
    },
    'cx_005': {
      id: 'cx_005',
      name: 'First Contact Resolution (AI)',
      description: 'Percentage of issues resolved in first AI interaction',
      unit: '%',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>70%',
      isMonetizable: false
    },
    'cx_006': {
      id: 'cx_006',
      name: 'AI NPS Impact',
      description: 'NPS improvement attributable to AI-powered experiences',
      unit: 'points',
      direction: 'increase',
      categoryId: 'customer_exp' as KpiCategoryId,
      kpiType: 'strategic',
      benchmark: '+5-10 pts',
      isMonetizable: false
    },
    'oe_001': {
      id: 'oe_001',
      name: 'Process Automation Rate',
      description: 'Percentage of automatable processes using AI',
      unit: '%',
      direction: 'increase',
      categoryId: 'operational_eff' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>50% of eligible',
      isMonetizable: false
    },
    'oe_002': {
      id: 'oe_002',
      name: 'Straight-Through Processing Rate',
      description: 'Percentage of transactions completed without human touch',
      unit: '%',
      direction: 'increase',
      categoryId: 'operational_eff' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>60%',
      isMonetizable: false
    },
    'oe_003': {
      id: 'oe_003',
      name: 'Manual Intervention Reduction',
      description: 'Reduction in manual steps through AI automation',
      unit: '%',
      direction: 'decrease',
      categoryId: 'operational_eff' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '30-50% reduction',
      isMonetizable: false
    },
    'oe_004': {
      id: 'oe_004',
      name: 'Exception Handling Time',
      description: 'Reduction in time to handle process exceptions',
      unit: '%',
      direction: 'decrease',
      categoryId: 'operational_eff' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '40% reduction',
      isMonetizable: false
    },
    'oe_005': {
      id: 'oe_005',
      name: 'Predictive Accuracy (Operations)',
      description: 'Accuracy of AI predictions for operational planning',
      unit: '%',
      direction: 'increase',
      categoryId: 'operational_eff' as KpiCategoryId,
      kpiType: 'operational',
      benchmark: '>85%',
      isMonetizable: false
    },
    'oe_006': {
      id: 'oe_006',
      name: 'Resource Optimization Savings',
      description: 'Efficiency gains from AI-driven resource allocation',
      unit: '%',
      direction: 'increase',
      categoryId: 'operational_eff' as KpiCategoryId,
      kpiType: 'financial',
      benchmark: '15-25% efficiency gain',
      isMonetizable: false
    }
  },
  calculationConfig: {
    roiFormula: '(cumulativeValue - totalInvestment) / totalInvestment * 100',
    breakevenFormula: 'totalInvestment / monthlyValue',
    defaultCurrency: 'GBP',
    fiscalYearStart: 4
  }
};
