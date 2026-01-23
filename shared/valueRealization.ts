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

export interface KpiDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: 'increase' | 'decrease';
  applicableProcesses: string[];
  industryBenchmarks?: Record<string, IndustryBenchmark>;
  maturityRules: MaturityRule[];
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

export interface ValueRealization {
  selectedKpis: string[];
  kpiValues: Record<string, KpiValue>;
  investment: InvestmentData | null;
  tracking: {
    entries: TrackingEntry[];
  };
  calculatedMetrics: CalculatedMetrics;
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }
  },
  calculationConfig: {
    roiFormula: '(cumulativeValue - totalInvestment) / totalInvestment * 100',
    breakevenFormula: 'totalInvestment / monthlyValue',
    defaultCurrency: 'GBP',
    fiscalYearStart: 4
  }
};
