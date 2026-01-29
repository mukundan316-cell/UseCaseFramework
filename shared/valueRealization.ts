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
  industryBenchmarks?: Record<string, IndustryBenchmark>;
  maturityRules: MaturityRule[];
  kpiType: KpiType;
  valueStream?: ValueStream;
  isMonetizable: boolean;
  monetizationFormula?: string;
  aggregationMethod: AggregationMethod;
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
  maturityRules: MaturityRule[]
): MaturityDerivationResult {
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
  industryBenchmark: IndustryBenchmark | null;
  benchmarkProcess: string | null;
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

export function getApplicableKpis(
  processes: string[],
  kpiLibrary: Record<string, KpiDefinition>
): ApplicableKpiResult[] {
  const results: ApplicableKpiResult[] = [];
  const addedKpis = new Set<string>();

  for (const process of processes) {
    for (const [kpiId, kpi] of Object.entries(kpiLibrary)) {
      // Use fuzzy matching instead of exact match
      const matchedKpiProcess = findMatchingProcess(process, kpi.applicableProcesses);
      
      if (matchedKpiProcess && !addedKpis.has(kpiId)) {
        // Use the matched KPI process name for benchmark lookup
        const benchmark = kpi.industryBenchmarks?.[matchedKpiProcess] || null;
        const existingResult = results.find(r => r.kpiId === kpiId);
        
        if (existingResult) {
          existingResult.matchedProcesses.push(process);
          if (!existingResult.industryBenchmark && benchmark) {
            existingResult.industryBenchmark = benchmark;
            existingResult.benchmarkProcess = matchedKpiProcess;
          }
        } else {
          results.push({
            kpiId,
            kpi,
            matchedProcesses: [process],
            industryBenchmark: benchmark,
            benchmarkProcess: benchmark ? matchedKpiProcess : null
          });
          addedKpis.add(kpiId);
        }
      }
    }
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
      estimatedAnnualValueGbp
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
    cycle_time_reduction: {
      id: 'cycle_time_reduction',
      name: 'Cycle Time Reduction',
      description: 'Reduction in end-to-end processing time',
      unit: '%',
      direction: 'decrease',
      applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Submission & Quote', 'Policy Servicing', 'Billing', 'Financial Management', 'Regulatory & Compliance', 'Reinsurance', 'Customer Servicing', 'Product & Rating', 'Human Resources'],
      industryBenchmarks: {
        'Claims Management': {
          baselineValue: 45,
          baselineUnit: 'minutes',
          baselineSource: 'McKinsey Insurance Operations 2024',
          improvementRange: { min: 40, max: 70 },
          improvementUnit: '%',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 20, max: 30 },
            developing: { min: 40, max: 50 },
            advanced: { min: 60, max: 70 }
          }
        },
        'Underwriting & Triage': {
          baselineValue: 120,
          baselineUnit: 'minutes',
          baselineSource: 'BCG Insurance Benchmarks 2024',
          improvementRange: { min: 30, max: 60 },
          improvementUnit: '%',
          typicalTimeline: '9-18 months',
          maturityTiers: {
            foundational: { min: 15, max: 25 },
            developing: { min: 30, max: 45 },
            advanced: { min: 50, max: 60 }
          }
        },
        'Submission & Quote': {
          baselineValue: 60,
          baselineUnit: 'minutes',
          baselineSource: 'Deloitte Insurance Study 2023',
          improvementRange: { min: 35, max: 65 },
          improvementUnit: '%',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 20, max: 30 },
            developing: { min: 35, max: 50 },
            advanced: { min: 55, max: 65 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: {
            dataReadiness: { min: 4 },
            technicalComplexity: { max: 2 },
            adoptionReadiness: { min: 4 }
          },
          range: { min: 60, max: 70 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: {
            dataReadiness: { min: 3 },
            technicalComplexity: { max: 3 }
          },
          range: { min: 40, max: 50 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 20, max: 30 },
          confidence: 'low'
        }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      monetizationFormula: 'time_saved_hours * hourly_rate',
      aggregationMethod: 'sum',
      categoryId: 'operational_eff',
      benchmark: '40-70% reduction in processing time'
    },
    cost_per_transaction: {
      id: 'cost_per_transaction',
      name: 'Cost Per Transaction Reduction',
      description: 'Reduction in cost to process each transaction',
      unit: '%',
      direction: 'decrease',
      applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Submission & Quote', 'Policy Servicing', 'Billing', 'Financial Management', 'Reinsurance'],
      industryBenchmarks: {
        'Claims Management': {
          baselineValue: 125,
          baselineUnit: 'GBP',
          baselineSource: 'McKinsey Insurance Operations 2024',
          improvementRange: { min: 20, max: 35 },
          improvementUnit: '%',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 8, max: 15 },
            developing: { min: 20, max: 28 },
            advanced: { min: 30, max: 35 }
          }
        },
        'Underwriting & Triage': {
          baselineValue: 450,
          baselineUnit: 'GBP',
          baselineSource: 'BCG Insurance Benchmarks 2024',
          improvementRange: { min: 15, max: 30 },
          improvementUnit: '%',
          typicalTimeline: '9-18 months',
          maturityTiers: {
            foundational: { min: 8, max: 12 },
            developing: { min: 15, max: 22 },
            advanced: { min: 25, max: 30 }
          }
        },
        'Billing': {
          baselineValue: 35,
          baselineUnit: 'GBP',
          baselineSource: 'Deloitte Insurance Study 2023',
          improvementRange: { min: 25, max: 45 },
          improvementUnit: '%',
          typicalTimeline: '3-6 months',
          maturityTiers: {
            foundational: { min: 15, max: 22 },
            developing: { min: 28, max: 36 },
            advanced: { min: 40, max: 45 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 }, changeImpact: { max: 2 } },
          range: { min: 25, max: 35 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 15, max: 25 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 8, max: 15 },
          confidence: 'low'
        }
      ],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'sum',
      categoryId: 'finance_actuarial',
      benchmark: '20-35% cost reduction per transaction'
    },
    fte_efficiency: {
      id: 'fte_efficiency',
      name: 'FTE Efficiency Gain',
      description: 'FTE hours saved or reallocated per month',
      unit: 'hours/month',
      direction: 'increase',
      applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Submission & Quote', 'Policy Servicing', 'Billing', 'Financial Management', 'Regulatory & Compliance', 'Risk Consulting', 'Sales & Distribution (Including Broker Relationships)', 'Customer Servicing', 'General', 'Product & Rating', 'Human Resources'],
      industryBenchmarks: {
        'Claims Management': {
          baselineValue: 160,
          baselineUnit: 'hours/FTE/month',
          baselineSource: 'Industry Average',
          improvementRange: { min: 15, max: 40 },
          improvementUnit: '%',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 50, max: 100 },
            developing: { min: 200, max: 400 },
            advanced: { min: 500, max: 800 }
          }
        },
        'Underwriting & Triage': {
          baselineValue: 160,
          baselineUnit: 'hours/FTE/month',
          baselineSource: 'Industry Average',
          improvementRange: { min: 20, max: 45 },
          improvementUnit: '%',
          typicalTimeline: '9-18 months',
          maturityTiers: {
            foundational: { min: 80, max: 150 },
            developing: { min: 250, max: 450 },
            advanced: { min: 600, max: 1000 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 }, adoptionReadiness: { min: 4 } },
          range: { min: 500, max: 1000 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 200, max: 500 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 50, max: 200 },
          confidence: 'low'
        }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      monetizationFormula: 'hours_saved * 75',
      aggregationMethod: 'sum',
      categoryId: 'operational_eff',
      benchmark: '200-800 hours saved per month'
    },
    accuracy_improvement: {
      id: 'accuracy_improvement',
      name: 'Accuracy Improvement',
      description: 'Improvement in decision or data accuracy',
      unit: '%',
      direction: 'increase',
      applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Policy Servicing', 'Billing', 'Financial Management', 'Regulatory & Compliance', 'Reinsurance', 'Product & Rating'],
      industryBenchmarks: {
        'Claims Management': {
          baselineValue: 85,
          baselineUnit: '% accuracy',
          baselineSource: 'Industry Average',
          improvementRange: { min: 5, max: 12 },
          improvementUnit: 'percentage points',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 2, max: 4 },
            developing: { min: 5, max: 8 },
            advanced: { min: 10, max: 12 }
          }
        },
        'Underwriting & Triage': {
          baselineValue: 82,
          baselineUnit: '% accuracy',
          baselineSource: 'BCG Insurance Benchmarks 2024',
          improvementRange: { min: 8, max: 15 },
          improvementUnit: 'percentage points',
          typicalTimeline: '12-18 months',
          maturityTiers: {
            foundational: { min: 3, max: 6 },
            developing: { min: 8, max: 11 },
            advanced: { min: 13, max: 15 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 }, technicalComplexity: { max: 3 } },
          range: { min: 10, max: 15 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 5, max: 10 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 2, max: 5 },
          confidence: 'low'
        }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '5-15 percentage point improvement'
    },
    loss_ratio_reduction: {
      id: 'loss_ratio_reduction',
      name: 'Loss Ratio Reduction',
      description: 'Reduction in claims loss ratio',
      unit: 'percentage points',
      direction: 'decrease',
      applicableProcesses: ['Claims Management', 'Risk Consulting', 'Underwriting & Triage'],
      industryBenchmarks: {
        'Claims Management': {
          baselineValue: 65,
          baselineUnit: '% loss ratio',
          baselineSource: 'McKinsey Insurance Operations 2024',
          improvementRange: { min: 1, max: 5 },
          improvementUnit: 'percentage points',
          typicalTimeline: '12-24 months',
          maturityTiers: {
            foundational: { min: 0.5, max: 1.5 },
            developing: { min: 2, max: 3.5 },
            advanced: { min: 4, max: 5 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 }, adoptionReadiness: { min: 4 } },
          range: { min: 4, max: 5 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 2, max: 3.5 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 0.5, max: 1.5 },
          confidence: 'low'
        }
      ],
      kpiType: 'financial',
      valueStream: 'cor_improvement',
      isMonetizable: true,
      monetizationFormula: 'loss_ratio_points * premium_volume * 0.01',
      aggregationMethod: 'sum',
      categoryId: 'claims',
      benchmark: '1-5 percentage points reduction'
    },
    customer_satisfaction: {
      id: 'customer_satisfaction',
      name: 'Customer/Broker Satisfaction',
      description: 'Improvement in NPS or satisfaction scores',
      unit: 'NPS points',
      direction: 'increase',
      applicableProcesses: ['Customer Servicing', 'Sales & Distribution (Including Broker Relationships)', 'Risk Consulting', 'Claims Management'],
      industryBenchmarks: {
        'Customer Servicing': {
          baselineValue: 35,
          baselineUnit: 'NPS',
          baselineSource: 'Industry Average',
          improvementRange: { min: 5, max: 20 },
          improvementUnit: 'NPS points',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 3, max: 7 },
            developing: { min: 8, max: 14 },
            advanced: { min: 15, max: 20 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { adoptionReadiness: { min: 4 }, changeImpact: { max: 2 } },
          range: { min: 15, max: 20 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { adoptionReadiness: { min: 3 } },
          range: { min: 8, max: 14 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 3, max: 7 },
          confidence: 'low'
        }
      ],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'customer_exp',
      benchmark: '5-20 NPS point improvement'
    },
    decision_consistency: {
      id: 'decision_consistency',
      name: 'Decision Consistency',
      description: 'Improvement in consistency of underwriting decisions',
      unit: '%',
      direction: 'increase',
      applicableProcesses: ['Underwriting & Triage', 'Claims Management'],
      industryBenchmarks: {
        'Underwriting & Triage': {
          baselineValue: 72,
          baselineUnit: '% consistency',
          baselineSource: 'Industry Average',
          improvementRange: { min: 10, max: 25 },
          improvementUnit: 'percentage points',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 5, max: 10 },
            developing: { min: 12, max: 18 },
            advanced: { min: 20, max: 25 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 }, technicalComplexity: { max: 2 } },
          range: { min: 20, max: 25 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 12, max: 18 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 5, max: 10 },
          confidence: 'low'
        }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'underwriting',
      benchmark: '10-25 percentage point improvement'
    },
    conversion_rate: {
      id: 'conversion_rate',
      name: 'Conversion Rate Improvement',
      description: 'Improvement in quote-to-bind or lead-to-policy conversion',
      unit: 'percentage points',
      direction: 'increase',
      applicableProcesses: ['Submission & Quote', 'Sales & Distribution (Including Broker Relationships)'],
      industryBenchmarks: {
        'Submission & Quote': {
          baselineValue: 25,
          baselineUnit: '% conversion',
          baselineSource: 'Industry Average',
          improvementRange: { min: 3, max: 10 },
          improvementUnit: 'percentage points',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 1, max: 3 },
            developing: { min: 4, max: 7 },
            advanced: { min: 8, max: 10 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 }, adoptionReadiness: { min: 4 } },
          range: { min: 8, max: 10 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 4, max: 7 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 1, max: 3 },
          confidence: 'low'
        }
      ],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      isMonetizable: true,
      monetizationFormula: 'conversion_improvement * average_premium',
      aggregationMethod: 'sum',
      categoryId: 'distribution',
      benchmark: '3-10 percentage point improvement'
    },
    compliance_rate: {
      id: 'compliance_rate',
      name: 'Compliance Rate Improvement',
      description: 'Improvement in regulatory compliance and audit pass rates',
      unit: '%',
      direction: 'increase',
      applicableProcesses: ['Regulatory & Compliance'],
      industryBenchmarks: {
        'Regulatory & Compliance': {
          baselineValue: 88,
          baselineUnit: '% compliance',
          baselineSource: 'Industry Average',
          improvementRange: { min: 5, max: 10 },
          improvementUnit: 'percentage points',
          typicalTimeline: '6-12 months',
          maturityTiers: {
            foundational: { min: 2, max: 4 },
            developing: { min: 5, max: 7 },
            advanced: { min: 8, max: 10 }
          }
        }
      },
      maturityRules: [
        {
          level: 'advanced',
          conditions: { dataReadiness: { min: 4 } },
          range: { min: 8, max: 10 },
          confidence: 'high'
        },
        {
          level: 'developing',
          conditions: { dataReadiness: { min: 3 } },
          range: { min: 5, max: 7 },
          confidence: 'medium'
        },
        {
          level: 'foundational',
          conditions: {},
          range: { min: 2, max: 4 },
          confidence: 'low'
        }
      ],
      kpiType: 'compliance',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'security',
      benchmark: '5-10 percentage point improvement'
    },
    // ========== ENTERPRISE / AI OPERATIONS KPIs ==========
    // Model Performance & Reliability (6 KPIs)
    model_accuracy: {
      id: 'model_accuracy',
      name: 'Model Accuracy',
      description: 'Percentage of correct predictions vs total predictions',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 93, max: 98 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 88, max: 93 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 80, max: 88 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'model_performance',
      benchmark: '90-95% accuracy target'
    },
    model_precision: {
      id: 'model_precision',
      name: 'Model Precision',
      description: 'True positives / (True positives + False positives)',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 90, max: 98 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 82, max: 90 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 70, max: 82 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'model_performance',
      benchmark: '85-95% precision'
    },
    model_recall: {
      id: 'model_recall',
      name: 'Model Recall',
      description: 'True positives / (True positives + False negatives)',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 88, max: 95 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 78, max: 88 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 65, max: 78 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'model_performance',
      benchmark: '80-90% recall'
    },
    model_f1_score: {
      id: 'model_f1_score',
      name: 'F1 Score',
      description: 'Harmonic mean of precision and recall',
      unit: 'score',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 0.90, max: 0.98 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 0.80, max: 0.90 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 0.65, max: 0.80 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'model_performance',
      benchmark: '0.85-0.95 F1'
    },
    model_drift_rate: {
      id: 'model_drift_rate',
      name: 'Model Drift Rate',
      description: 'Rate of performance degradation over time',
      unit: '%',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 0, max: 2 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 2, max: 5 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 5, max: 10 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'model_performance',
      benchmark: '<5% drift threshold'
    },
    inference_latency: {
      id: 'inference_latency',
      name: 'Inference Latency',
      description: 'Time to generate model prediction (p95)',
      unit: 'ms',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 10, max: 50 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 50, max: 100 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 100, max: 500 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'model_performance',
      benchmark: '<100ms p95 latency'
    },
    // Data Quality & Feature Management (6 KPIs)
    data_completeness: {
      id: 'data_completeness',
      name: 'Data Completeness',
      description: 'Percentage of required fields populated',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 98, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 92, max: 98 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 80, max: 92 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '>95% completeness'
    },
    data_accuracy: {
      id: 'data_accuracy',
      name: 'Data Accuracy',
      description: 'Percentage of data values that are correct',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 99, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 95, max: 99 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 88, max: 95 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '>98% accuracy'
    },
    data_freshness: {
      id: 'data_freshness',
      name: 'Data Freshness',
      description: 'Time since last data update',
      unit: 'hours',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 0, max: 4 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 4, max: 12 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 12, max: 48 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '<24hr lag for critical data'
    },
    data_consistency: {
      id: 'data_consistency',
      name: 'Data Consistency',
      description: 'Agreement of data across different systems',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 99, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 95, max: 99 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 85, max: 95 }, confidence: 'low' }
      ],
      kpiType: 'compliance',
      valueStream: 'regulatory_compliance',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '100% cross-system consistency'
    },
    feature_store_coverage: {
      id: 'feature_store_coverage',
      name: 'Feature Store Coverage',
      description: 'Percentage of ML features centrally managed',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 90, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 70, max: 90 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 40, max: 70 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '>80% features in store'
    },
    pipeline_success_rate: {
      id: 'pipeline_success_rate',
      name: 'Pipeline Success Rate',
      description: 'Percentage of data pipelines completing successfully',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 99.5, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 97, max: 99.5 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 90, max: 97 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'data_quality',
      benchmark: '>99% success rate'
    },
    // Technical Debt & Platform Health (6 KPIs)
    code_coverage: {
      id: 'code_coverage',
      name: 'Code Coverage',
      description: 'Percentage of code covered by automated tests',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 85, max: 95 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 70, max: 85 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 50, max: 70 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'tech_debt',
      benchmark: '>80% test coverage'
    },
    tech_debt_ratio: {
      id: 'tech_debt_ratio',
      name: 'Technical Debt Ratio',
      description: 'Time spent on tech debt vs new features',
      unit: '%',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 0, max: 5 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 5, max: 15 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 15, max: 30 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'tech_debt',
      benchmark: '<5% of development time'
    },
    security_vulnerabilities: {
      id: 'security_vulnerabilities',
      name: 'Security Vulnerabilities',
      description: 'Number of unresolved security issues',
      unit: 'count',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 0, max: 0 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 0, max: 3 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 3, max: 10 }, confidence: 'low' }
      ],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      isMonetizable: true,
      aggregationMethod: 'sum',
      categoryId: 'tech_debt',
      benchmark: '0 critical/high vulnerabilities'
    },
    platform_uptime: {
      id: 'platform_uptime',
      name: 'Platform Uptime',
      description: 'Percentage of time platform is operational',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 99.95, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 99.5, max: 99.95 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 98, max: 99.5 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'tech_debt',
      benchmark: '>99.9% availability'
    },
    mttr: {
      id: 'mttr',
      name: 'Mean Time to Recovery',
      description: 'Average time to restore service after incident',
      unit: 'hours',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 0, max: 0.5 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 0.5, max: 2 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 2, max: 8 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'tech_debt',
      benchmark: '<1 hour MTTR'
    },
    deployment_frequency: {
      id: 'deployment_frequency',
      name: 'Deployment Frequency',
      description: 'Number of production deployments per time period',
      unit: 'count/week',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 10, max: 50 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 3, max: 10 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 0.5, max: 3 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'tech_debt',
      benchmark: 'Multiple deployments per day'
    },
    // Talent & Team Sustainability (6 KPIs)
    ai_ml_headcount: {
      id: 'ai_ml_headcount',
      name: 'AI/ML Headcount',
      description: 'Number of AI/ML specialists on team',
      unit: 'count',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 20, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 8, max: 20 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 2, max: 8 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: false,
      aggregationMethod: 'sum',
      categoryId: 'talent',
      benchmark: 'Per organizational target'
    },
    skill_coverage: {
      id: 'skill_coverage',
      name: 'Skill Coverage',
      description: 'Percentage of required AI skills present in team',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 95, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 80, max: 95 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 60, max: 80 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'talent',
      benchmark: '>90% critical skills covered'
    },
    training_hours: {
      id: 'training_hours',
      name: 'Training Hours per Employee',
      description: 'Average AI training hours per team member',
      unit: 'hours/year',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 60, max: 120 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 30, max: 60 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 10, max: 30 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'customer_experience',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'talent',
      benchmark: '40+ hours/year'
    },
    certification_rate: {
      id: 'certification_rate',
      name: 'Certification Rate',
      description: 'Percentage of team with AI certifications',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 75, max: 95 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 50, max: 75 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 20, max: 50 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'customer_experience',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'talent',
      benchmark: '>60% certified'
    },
    ai_team_attrition: {
      id: 'ai_team_attrition',
      name: 'AI Team Attrition Rate',
      description: 'Annual turnover rate for AI specialists',
      unit: '%',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 0, max: 8 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 8, max: 15 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 15, max: 25 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'talent',
      benchmark: '<15% annual attrition'
    },
    self_sufficiency_score: {
      id: 'self_sufficiency_score',
      name: 'Self-Sufficiency Score',
      description: 'Percentage of AI work done without external vendors',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 85, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 60, max: 85 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 30, max: 60 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'talent',
      benchmark: '>80% internal capability'
    },
    // Innovation Pipeline Metrics (6 KPIs)
    experiments_run: {
      id: 'experiments_run',
      name: 'Experiments Run',
      description: 'Number of AI experiments conducted',
      unit: 'count/quarter',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 20, max: 50 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 8, max: 20 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 2, max: 8 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'revenue_uplift',
      isMonetizable: false,
      aggregationMethod: 'sum',
      categoryId: 'innovation',
      benchmark: '>10 experiments/quarter'
    },
    experiment_success_rate: {
      id: 'experiment_success_rate',
      name: 'Experiment Success Rate',
      description: 'Percentage of experiments meeting success criteria',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 40, max: 60 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 25, max: 40 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 10, max: 25 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'revenue_uplift',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'innovation',
      benchmark: '25-40% success rate'
    },
    idea_to_production: {
      id: 'idea_to_production',
      name: 'Idea to Production Time',
      description: 'Average time from concept to production deployment',
      unit: 'weeks',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 4, max: 8 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 8, max: 16 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 16, max: 32 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'innovation',
      benchmark: '<12 weeks average'
    },
    poc_conversion_rate: {
      id: 'poc_conversion_rate',
      name: 'PoC to Production Rate',
      description: 'Percentage of PoCs that reach production',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 50, max: 70 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 30, max: 50 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 15, max: 30 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'innovation',
      benchmark: '>40% PoC to production'
    },
    ai_portfolio_growth: {
      id: 'ai_portfolio_growth',
      name: 'AI Portfolio Growth',
      description: 'Number of new AI use cases added per quarter',
      unit: 'count/quarter',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 10, max: 25 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 4, max: 10 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 1, max: 4 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      isMonetizable: false,
      aggregationMethod: 'sum',
      categoryId: 'innovation',
      benchmark: '5-10 new use cases/quarter'
    },
    reuse_rate: {
      id: 'reuse_rate',
      name: 'Component Reuse Rate',
      description: 'Percentage of AI components reused across projects',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 60, max: 80 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 35, max: 60 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 15, max: 35 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'innovation',
      benchmark: '>50% reuse rate'
    },
    // GenAI-Specific KPIs (6 KPIs)
    token_cost_per_query: {
      id: 'token_cost_per_query',
      name: 'Token Cost per Query',
      description: 'Average cost of LLM tokens per user query',
      unit: 'GBP',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 0, max: 0.005 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 0.005, max: 0.02 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 0.02, max: 0.10 }, confidence: 'low' }
      ],
      kpiType: 'financial',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'genai',
      benchmark: '<$0.01 per query average'
    },
    hallucination_rate: {
      id: 'hallucination_rate',
      name: 'Hallucination Rate',
      description: 'Percentage of responses containing factual errors',
      unit: '%',
      direction: 'decrease',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 0, max: 2 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 2, max: 5 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 5, max: 15 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'genai',
      benchmark: '<5% hallucination'
    },
    response_quality_score: {
      id: 'response_quality_score',
      name: 'Response Quality Score',
      description: 'Human-rated quality of LLM responses (1-5 scale)',
      unit: 'score',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 4.5, max: 5 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 3.8, max: 4.5 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 3, max: 3.8 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'customer_experience',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'genai',
      benchmark: '>4.0 average score'
    },
    context_window_utilization: {
      id: 'context_window_utilization',
      name: 'Context Window Utilization',
      description: 'Efficient use of LLM context window',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 70, max: 90 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 50, max: 70 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 25, max: 50 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'operational_savings',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'genai',
      benchmark: '60-80% efficient utilization'
    },
    rag_retrieval_accuracy: {
      id: 'rag_retrieval_accuracy',
      name: 'RAG Retrieval Accuracy',
      description: 'Accuracy of retrieved context in RAG systems',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 90, max: 98 }, confidence: 'high' },
        { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 75, max: 90 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 55, max: 75 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'risk_mitigation',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'genai',
      benchmark: '>85% retrieval accuracy'
    },
    prompt_injection_blocks: {
      id: 'prompt_injection_blocks',
      name: 'Prompt Injection Block Rate',
      description: 'Percentage of prompt injection attempts blocked',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { technicalComplexity: { max: 2 } }, range: { min: 99, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { technicalComplexity: { max: 3 } }, range: { min: 95, max: 99 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 85, max: 95 }, confidence: 'low' }
      ],
      kpiType: 'compliance',
      valueStream: 'risk_mitigation',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'genai',
      benchmark: '>99% block rate'
    },
    // Business Alignment (4 KPIs)
    stakeholder_satisfaction: {
      id: 'stakeholder_satisfaction',
      name: 'Stakeholder Satisfaction',
      description: 'Business stakeholder satisfaction with AI initiatives',
      unit: 'score',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 4.5, max: 5 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 3.5, max: 4.5 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 2.5, max: 3.5 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'customer_experience',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'business_alignment',
      benchmark: '>4.0 satisfaction score'
    },
    ai_strategy_alignment: {
      id: 'ai_strategy_alignment',
      name: 'AI Strategy Alignment',
      description: 'Percentage of AI projects aligned with business strategy',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 95, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 80, max: 95 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 60, max: 80 }, confidence: 'low' }
      ],
      kpiType: 'strategic',
      valueStream: 'revenue_uplift',
      isMonetizable: false,
      aggregationMethod: 'average',
      categoryId: 'business_alignment',
      benchmark: '>90% strategic alignment'
    },
    business_case_realization: {
      id: 'business_case_realization',
      name: 'Business Case Realization',
      description: 'Percentage of projected business value actually realized',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 90, max: 120 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 70, max: 90 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 40, max: 70 }, confidence: 'low' }
      ],
      kpiType: 'financial',
      valueStream: 'revenue_uplift',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'business_alignment',
      benchmark: '>80% value realization'
    },
    adoption_rate: {
      id: 'adoption_rate',
      name: 'User Adoption Rate',
      description: 'Percentage of target users actively using AI tools',
      unit: '%',
      direction: 'increase',
      maturityRules: [
        { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 85, max: 100 }, confidence: 'high' },
        { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 60, max: 85 }, confidence: 'medium' },
        { level: 'foundational', conditions: {}, range: { min: 30, max: 60 }, confidence: 'low' }
      ],
      kpiType: 'operational',
      valueStream: 'customer_experience',
      isMonetizable: true,
      aggregationMethod: 'average',
      categoryId: 'business_alignment',
      benchmark: '>75% adoption'
    }
  },
  calculationConfig: {
    roiFormula: '(cumulativeValue - totalInvestment) / totalInvestment * 100',
    breakevenFormula: 'totalInvestment / monthlyValue',
    defaultCurrency: 'GBP',
    fiscalYearStart: 4
  }
};
