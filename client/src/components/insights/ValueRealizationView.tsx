import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { useEngagement } from '@/contexts/EngagementContext';
import { 
  TrendingUp, DollarSign, Clock, Target, 
  Loader2, AlertCircle, HelpCircle, ArrowUpRight, BarChart3, PieChart
} from 'lucide-react';
import type { PortfolioValueSummary, ValueRealizationConfig } from '@shared/valueRealization';
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
    kpiEstimates?: Array<{ kpiId: string; kpiName: string; estimatedAnnualValueGbp?: { min: number; max: number } | null }>;
    investment?: { initialInvestment: number; ongoingMonthlyCost: number };
  } | null;
}

interface ValueMetrics {
  totalUseCases: number;
  withEstimates: number;
  withTracking: number;
  noValue: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  quadrantDistribution: Record<string, { count: number; value: number }>;
  valueTiers: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
}

function formatCurrency(value: number, currency: string = 'GBP'): string {
  if (value >= 1000000) {
    return `${currency === 'GBP' ? '£' : '$'}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${currency === 'GBP' ? '£' : '$'}${(value / 1000).toFixed(0)}K`;
  }
  return `${currency === 'GBP' ? '£' : '$'}${value.toFixed(0)}`;
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
    quadrantDistribution: {},
    valueTiers: { high: 0, medium: 0, low: 0, none: 0 }
  };

  useCases.forEach(uc => {
    const vr = uc.valueRealization;
    const quadrant = uc.quadrant || 'Unknown';
    
    if (!metrics.quadrantDistribution[quadrant]) {
      metrics.quadrantDistribution[quadrant] = { count: 0, value: 0 };
    }
    metrics.quadrantDistribution[quadrant].count++;

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

export default function ValueRealizationView({ scope = 'all' }: ValueRealizationViewProps) {
  const { selectedEngagementId, selectedClientId } = useEngagement();
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
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Value Realization</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track investment returns and value generation across {metrics?.totalUseCases || 0} use cases in the {scope === 'active' ? 'active portfolio' : 'reference library'}.
          </p>
          <Badge variant="outline" className={`mt-2 text-xs ${scope === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {scope === 'active' ? 'Active Portfolio' : 'Reference Library Analytics'}
          </Badge>
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
                    {hasValueData ? formatCurrency(portfolioSummary.cumulativeValue) : '£0'}
                  </p>
                  <Progress value={coverageRate} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    High Value (&gt;£200K)
                  </span>
                  <span className="font-medium">{metrics?.valueTiers.high || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Medium Value (£50K-£200K)
                  </span>
                  <span className="font-medium">{metrics?.valueTiers.medium || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Low Value (&lt;£50K)
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
        </div>

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
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Est. Min</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Est. Max</th>
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
                          {displayValue?.min ? formatCurrency(displayValue.min) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {displayValue?.max ? formatCurrency(displayValue.max) : '-'}
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
