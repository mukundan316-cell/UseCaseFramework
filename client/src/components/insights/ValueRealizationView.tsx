import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useEngagement } from '@/contexts/EngagementContext';
import { useCurrency } from '@/hooks/useCurrency';
import { 
  TrendingUp, DollarSign, Clock, Target, 
  Loader2, AlertCircle, HelpCircle, ArrowUpRight, BarChart3, PieChart, ShieldCheck, Filter, Activity
} from 'lucide-react';
import type { PortfolioValueSummary, ValueRealizationConfig, ValidationStatus, ValueStream, KpiType } from '@shared/valueRealization';
import type { TomConfig } from '@shared/tom';

interface UseCase {
  id: string;
  title: string;
  quadrant: string;
  tomPhase: string | null;
  derivedPhase?: { id: string; name: string; color: string } | null;
  valueRealization?: {
    derived?: boolean;
    totalEstimatedValue?: { min: number; max: number; currency: string };
    kpiEstimates?: Array<{ 
      kpiId: string; 
      kpiName: string; 
      kpiType?: KpiType;
      valueStream?: ValueStream | null;
      estimatedAnnualValueGbp?: { min: number; max: number } | null;
    }>;
    investment?: { initialInvestment: number; ongoingMonthlyCost: number };
    valueConfidence?: {
      conservativeFactor: number;
      validationStatus: ValidationStatus;
      adjustedValueGbp: number | null;
      rationale: string | null;
      lastValidatedAt?: string;
      lastValidatedBy?: string;
    };
  } | null;
}

interface ValueMetrics {
  totalUseCases: number;
  withEstimates: number;
  withTracking: number;
  noValue: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  totalAdjustedValue: number;
  quadrantDistribution: Record<string, { count: number; value: number }>;
  valueTiers: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  validationBreakdown: {
    unvalidated: number;
    pending_finance: number;
    pending_actuarial: number;
    fully_validated: number;
  };
  valueStreamBreakdown: Record<string, { count: number; value: number }>;
  kpiTypeBreakdown: {
    financial: number;
    operational: number;
    strategic: number;
    compliance: number;
  };
}


function formatRoi(roi: number | null): string {
  if (roi === null) return 'N/A';
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%`;
}

function getEstimatedValueFromKpis(vr: UseCase['valueRealization']): { min: number; max: number } {
  if (!vr?.kpiEstimates || vr.kpiEstimates.length === 0) return { min: 0, max: 0 };
  
  let totalMin = 0;
  let totalMax = 0;
  
  for (const kpi of vr.kpiEstimates) {
    if (kpi.estimatedAnnualValueGbp) {
      totalMin += kpi.estimatedAnnualValueGbp.min || 0;
      totalMax += kpi.estimatedAnnualValueGbp.max || 0;
    }
  }
  
  return { min: totalMin, max: totalMax };
}

function computeValueMetrics(useCases: UseCase[]): ValueMetrics {
  const metrics: ValueMetrics = {
    totalUseCases: useCases.length,
    withEstimates: 0,
    withTracking: 0,
    noValue: 0,
    totalEstimatedMin: 0,
    totalEstimatedMax: 0,
    totalAdjustedValue: 0,
    quadrantDistribution: {},
    valueTiers: { high: 0, medium: 0, low: 0, none: 0 },
    validationBreakdown: { unvalidated: 0, pending_finance: 0, pending_actuarial: 0, fully_validated: 0 },
    valueStreamBreakdown: {},
    kpiTypeBreakdown: { financial: 0, operational: 0, strategic: 0, compliance: 0 }
  };

  useCases.forEach(uc => {
    const vr = uc.valueRealization;
    const quadrant = uc.quadrant || 'Unknown';
    
    if (!metrics.quadrantDistribution[quadrant]) {
      metrics.quadrantDistribution[quadrant] = { count: 0, value: 0 };
    }
    metrics.quadrantDistribution[quadrant].count++;

    // Track validation status
    const validationStatus = vr?.valueConfidence?.validationStatus || 'unvalidated';
    metrics.validationBreakdown[validationStatus]++;

    // Track KPI types and value streams
    if (vr?.kpiEstimates) {
      vr.kpiEstimates.forEach(kpi => {
        const kpiType = kpi.kpiType || 'financial';
        metrics.kpiTypeBreakdown[kpiType]++;
        
        if (kpi.valueStream) {
          if (!metrics.valueStreamBreakdown[kpi.valueStream]) {
            metrics.valueStreamBreakdown[kpi.valueStream] = { count: 0, value: 0 };
          }
          metrics.valueStreamBreakdown[kpi.valueStream].count++;
          if (kpi.estimatedAnnualValueGbp) {
            metrics.valueStreamBreakdown[kpi.valueStream].value += kpi.estimatedAnnualValueGbp.max || 0;
          }
        }
      });
    }

    // Check for tracking (investment data) - can coexist with estimates
    const hasTracking = vr?.investment && (vr.investment.initialInvestment > 0 || vr.investment.ongoingMonthlyCost > 0);
    if (hasTracking) {
      metrics.withTracking++;
    }

    // Check for estimates - independent of tracking status
    const totalEstValue = vr?.totalEstimatedValue;
    const kpiValue = getEstimatedValueFromKpis(vr);
    
    const hasDirectEstimate = totalEstValue && (totalEstValue.max > 0 || totalEstValue.min > 0);
    const hasKpiEstimate = kpiValue.max > 0 || kpiValue.min > 0;
    
    if (hasDirectEstimate || hasKpiEstimate) {
      metrics.withEstimates++;
      
      const minValue = hasDirectEstimate ? totalEstValue!.min : kpiValue.min;
      const maxValue = hasDirectEstimate ? totalEstValue!.max : kpiValue.max;
      
      metrics.totalEstimatedMin += minValue;
      metrics.totalEstimatedMax += maxValue;
      metrics.quadrantDistribution[quadrant].value += maxValue;
      
      // Apply conservative factor for adjusted value
      const conservativeFactor = vr?.valueConfidence?.conservativeFactor ?? 1;
      const adjustedMax = maxValue * conservativeFactor;
      metrics.totalAdjustedValue += adjustedMax;
      
      const avgValue = (minValue + maxValue) / 2;
      if (avgValue >= 200000) {
        metrics.valueTiers.high++;
      } else if (avgValue >= 50000) {
        metrics.valueTiers.medium++;
      } else {
        metrics.valueTiers.low++;
      }
    } else if (!hasTracking) {
      // Only count as "no value" if neither tracked nor estimated
      metrics.noValue++;
      metrics.valueTiers.none++;
    }
  });

  return metrics;
}

function getValueStatus(uc: UseCase): 'tracked' | 'estimated' | 'none' {
  if (uc.valueRealization?.investment) return 'tracked';
  const vr = uc.valueRealization;
  if (vr?.totalEstimatedValue?.max && vr.totalEstimatedValue.max > 0) return 'estimated';
  const kpiValue = getEstimatedValueFromKpis(vr);
  if (kpiValue.max > 0) return 'estimated';
  return 'none';
}

function getDisplayValue(vr: UseCase['valueRealization']): { min: number; max: number } | null {
  if (vr?.totalEstimatedValue?.max && vr.totalEstimatedValue.max > 0) {
    return vr.totalEstimatedValue;
  }
  const kpiValue = getEstimatedValueFromKpis(vr);
  if (kpiValue.max > 0) {
    return kpiValue;
  }
  return null;
}

interface ValueRealizationViewProps {
  scope?: 'active' | 'all';
}

const VALUE_STREAM_LABELS: Record<string, string> = {
  operational_savings: 'Operational Savings',
  cor_improvement: 'COR Improvement',
  revenue_uplift: 'Revenue Uplift',
  risk_mitigation: 'Risk Mitigation',
  customer_experience: 'Customer Experience',
  regulatory_compliance: 'Regulatory Compliance'
};

const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  unvalidated: 'Unvalidated',
  pending_finance: 'Pending Finance',
  pending_actuarial: 'Pending Actuarial',
  fully_validated: 'Fully Validated'
};

export default function ValueRealizationView({ scope = 'all' }: ValueRealizationViewProps) {
  const [valueStreamFilter, setValueStreamFilter] = useState<string>('all');
  const { selectedEngagementId, selectedClientId } = useEngagement();
  const { formatCompact: formatCurrency, symbol: currencySymbol } = useCurrency();
  const useCasesEndpoint = scope === 'active' 
    ? (selectedEngagementId ? `/api/use-cases/dashboard?engagementId=${selectedEngagementId}` : '/api/use-cases/dashboard')
    : (selectedEngagementId ? `/api/use-cases?engagementId=${selectedEngagementId}` : '/api/use-cases');
  const summaryEndpoint = scope === 'active' ? '/api/value/portfolio-summary?scope=dashboard' : '/api/value/portfolio-summary?scope=all';
  
  const { data: useCases, isLoading: useCasesLoading } = useQuery<UseCase[]>({
    queryKey: [useCasesEndpoint],
  });

  const { data: portfolioSummary, isLoading: summaryLoading, isError: summaryError } = useQuery<PortfolioValueSummary>({
    queryKey: [summaryEndpoint],
  });

  const { data: valueConfig, isLoading: configLoading } = useQuery<ValueRealizationConfig>({
    queryKey: ['/api/value/config'],
  });

  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', selectedClientId],
  });

  const isLoading = summaryLoading || configLoading || useCasesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading value analytics...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <span className="text-red-700">Failed to load portfolio value data</span>
        </CardContent>
      </Card>
    );
  }

  const hasValueData = portfolioSummary && portfolioSummary.useCasesWithValue > 0;
  const metrics = useCases ? computeValueMetrics(useCases) : null;
  const coverageRate = metrics && metrics.totalUseCases > 0 
    ? Math.round(((metrics.withEstimates + metrics.withTracking) / metrics.totalUseCases) * 100)
    : 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-start justify-between py-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Value Realization</h3>
            <p className="text-gray-600 max-w-2xl">
              Track investment returns and value generation across {metrics?.totalUseCases || 0} use cases in the {scope === 'active' ? 'active portfolio' : 'reference library'}.
            </p>
            <Badge variant="outline" className={`mt-2 text-xs ${scope === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {scope === 'active' ? 'Active Portfolio' : 'Reference Library Analytics'}
            </Badge>
          </div>
          <div className="flex items-center gap-2" data-testid="filter-value-stream">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={valueStreamFilter} onValueChange={setValueStreamFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Value Stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Value Streams</SelectItem>
                {Object.entries(VALUE_STREAM_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-green-700 font-medium">With Estimates</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-green-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases with auto-derived KPI value estimates</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{metrics?.withEstimates || 0}</p>
                  <p className="text-sm text-green-600">{coverageRate}% of portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-blue-700 font-medium">With Tracking</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases with manual investment tracking</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{metrics?.withTracking || 0}</p>
                  <p className="text-sm text-blue-600">Active tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-amber-700 font-medium">No Value Data</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases without value estimates (may need process mapping)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">{metrics?.noValue || 0}</p>
                  <p className="text-sm text-amber-600">Need enrichment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-purple-700 font-medium">Total Estimated</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cumulative estimated annual value across portfolio</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {hasValueData ? formatCurrency(portfolioSummary.cumulativeValue) : `${currencySymbol}0`}
                  </p>
                  <Progress value={coverageRate} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                Raw vs Adjusted Value
              </CardTitle>
              <CardDescription>Value comparison with conservative factor applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Raw Estimated Value</span>
                  <span className="font-bold text-lg">{formatCurrency(metrics?.totalEstimatedMax || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Adjusted Value (Conservative)</span>
                  <span className="font-bold text-lg text-indigo-600">{formatCurrency(metrics?.totalAdjustedValue || 0)}</span>
                </div>
                <Progress 
                  value={metrics?.totalEstimatedMax ? ((metrics.totalAdjustedValue || 0) / metrics.totalEstimatedMax) * 100 : 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {metrics?.totalEstimatedMax && metrics.totalAdjustedValue 
                    ? `${Math.round((metrics.totalAdjustedValue / metrics.totalEstimatedMax) * 100)}% of raw value after adjustments`
                    : 'No adjustments applied'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Validation Status
              </CardTitle>
              <CardDescription>Value validation workflow progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Fully Validated
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">{metrics?.validationBreakdown.fully_validated || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Pending Finance
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">{metrics?.validationBreakdown.pending_finance || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Pending Actuarial
                  </span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">{metrics?.validationBreakdown.pending_actuarial || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    Unvalidated
                  </span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">{metrics?.validationBreakdown.unvalidated || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Value Tier Distribution
              </CardTitle>
              <CardDescription>Use cases by estimated annual value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    High Value (&gt;{currencySymbol}200K)
                  </span>
                  <span className="font-medium">{metrics?.valueTiers.high || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Medium Value ({currencySymbol}50K-{currencySymbol}200K)
                  </span>
                  <span className="font-medium">{metrics?.valueTiers.medium || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Low Value (&lt;{currencySymbol}50K)
                  </span>
                  <span className="font-medium">{metrics?.valueTiers.low || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    Not Estimated
                  </span>
                  <span className="font-medium">{metrics?.valueTiers.none || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-500" />
                Value by Quadrant
              </CardTitle>
              <CardDescription>Estimated value distribution across strategic quadrants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics && Object.entries(metrics.quadrantDistribution)
                  .sort(([, a], [, b]) => b.value - a.value)
                  .map(([quadrant, data]) => (
                    <div key={quadrant}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{quadrant}</span>
                        <span className="text-sm font-medium">
                          {data.count} ({data.value > 0 ? formatCurrency(data.value) : '-'})
                        </span>
                      </div>
                      <Progress 
                        value={metrics.totalEstimatedMax > 0 ? (data.value / metrics.totalEstimatedMax) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-500" />
                Value by Stream
              </CardTitle>
              <CardDescription>Insurance-specific value stream breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics && Object.entries(metrics.valueStreamBreakdown).length > 0 ? (
                  Object.entries(metrics.valueStreamBreakdown)
                    .sort(([, a], [, b]) => b.value - a.value)
                    .map(([stream, data]) => (
                      <div key={stream}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{VALUE_STREAM_LABELS[stream] || stream}</span>
                          <span className="text-sm font-medium">
                            {data.count} ({data.value > 0 ? formatCurrency(data.value) : '-'})
                          </span>
                        </div>
                        <Progress 
                          value={metrics.totalEstimatedMax > 0 ? (data.value / metrics.totalEstimatedMax) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No value stream data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              KPI Type Distribution
            </CardTitle>
            <CardDescription>Breakdown by financial vs non-financial KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-2xl font-bold text-green-700">{metrics?.kpiTypeBreakdown.financial || 0}</p>
                <p className="text-xs text-green-600">Financial</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-700">{metrics?.kpiTypeBreakdown.operational || 0}</p>
                <p className="text-xs text-blue-600">Operational</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-2xl font-bold text-purple-700">{metrics?.kpiTypeBreakdown.strategic || 0}</p>
                <p className="text-xs text-purple-600">Strategic</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-2xl font-bold text-amber-700">{metrics?.kpiTypeBreakdown.compliance || 0}</p>
                <p className="text-xs text-amber-600">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Use Case Value Status</CardTitle>
            <CardDescription>Individual value tracking status across all use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm" data-testid="table-value-status">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Use Case</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Est. Max</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Adjusted</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Validation</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">KPIs</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Quadrant</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases?.map((uc) => {
                    const status = getValueStatus(uc);
                    const vr = uc.valueRealization;
                    const kpiCount = vr?.kpiEstimates?.length || 0;
                    const displayValue = getDisplayValue(vr);
                    const conservativeFactor = vr?.valueConfidence?.conservativeFactor ?? 1;
                    const adjustedMax = displayValue?.max ? displayValue.max * conservativeFactor : null;
                    const validationStatus = vr?.valueConfidence?.validationStatus || 'unvalidated';
                    return (
                      <tr key={uc.id} className="border-b hover-elevate" data-testid={`row-value-${uc.id}`}>
                        <td className="py-3 px-2 max-w-xs truncate" title={uc.title}>{uc.title}</td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant={status === 'tracked' ? 'default' : status === 'estimated' ? 'secondary' : 'outline'}
                            className={
                              status === 'tracked' ? 'bg-blue-100 text-blue-800' : 
                              status === 'estimated' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-500'
                            }
                          >
                            {status === 'tracked' ? 'Tracked' : status === 'estimated' ? 'Estimated' : 'None'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {displayValue?.max ? formatCurrency(displayValue.max) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {adjustedMax ? (
                            <span className={conservativeFactor < 1 ? 'text-amber-600' : ''}>
                              {formatCurrency(adjustedMax)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              validationStatus === 'fully_validated' ? 'bg-green-50 text-green-700' :
                              validationStatus === 'pending_finance' ? 'bg-blue-50 text-blue-700' :
                              validationStatus === 'pending_actuarial' ? 'bg-purple-50 text-purple-700' :
                              'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {VALIDATION_STATUS_LABELS[validationStatus]}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {kpiCount > 0 ? (
                            <Badge variant="outline" className="text-xs">{kpiCount} KPIs</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">{uc.quadrant || '-'}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 text-center py-2">
                Showing all {useCases?.length || 0} use cases
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
