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

export interface KpiDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: 'increase' | 'decrease';
  applicableUseCaseTypes: string[];
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
    const vr = uc.valueRealization;
    if (!vr?.investment) continue;

    const investment = vr.investment.initialInvestment + (vr.investment.ongoingMonthlyCost * 12);
    const value = vr.calculatedMetrics?.cumulativeValueGbp || 0;

    summary.totalInvestment += investment;
    summary.cumulativeValue += value;
    summary.useCasesWithValue++;

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

  if (summary.totalInvestment > 0) {
    summary.portfolioRoi = calculateRoi(summary.cumulativeValue, summary.totalInvestment);
  }

  if (breakevenCount > 0) {
    summary.avgBreakevenMonths = Math.round(totalBreakevenMonths / breakevenCount);
  }

  return summary;
}

export const DEFAULT_VALUE_REALIZATION_CONFIG: ValueRealizationConfig = {
  enabled: 'true',
  kpiLibrary: {
    cycle_time_reduction: {
      id: 'cycle_time_reduction',
      name: 'Cycle Time Reduction',
      description: 'Reduction in end-to-end processing time',
      unit: '%',
      direction: 'decrease',
      applicableUseCaseTypes: ['claims_triage', 'underwriting', 'fnol'],
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
      applicableUseCaseTypes: ['claims_triage', 'premium_audit', 'underwriting'],
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
      applicableUseCaseTypes: ['claims_triage', 'underwriting', 'premium_audit', 'fnol'],
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
    }
  },
  calculationConfig: {
    roiFormula: '(cumulativeValue - totalInvestment) / totalInvestment * 100',
    breakevenFormula: 'totalInvestment / monthlyValue',
    defaultCurrency: 'GBP',
    fiscalYearStart: 4
  }
};
