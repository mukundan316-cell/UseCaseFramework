import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, DollarSign, Clock, Target, 
  Loader2, AlertCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';
import type { PortfolioValueSummary, ValueRealizationConfig } from '@shared/valueRealization';
import type { TomConfig } from '@shared/tom';

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

export default function ValueRealizationView() {
  const { data: portfolioSummary, isLoading: summaryLoading, isError: summaryError } = useQuery<PortfolioValueSummary>({
    queryKey: ['/api/value/portfolio-summary'],
  });

  const { data: valueConfig, isLoading: configLoading } = useQuery<ValueRealizationConfig>({
    queryKey: ['/api/value/config'],
  });

  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config'],
  });

  const isLoading = summaryLoading || configLoading;

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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Value Realization</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track investment returns and value generation across your AI portfolio.
            {!hasValueData && ' Add value tracking to individual use cases to see aggregate metrics.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-blue-700 font-medium">Total Investment</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sum of initial + annualized ongoing costs across all use cases with value tracking</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {hasValueData ? formatCurrency(portfolioSummary.totalInvestment) : '£0'}
                  </p>
                  <p className="text-sm text-blue-600">
                    {portfolioSummary?.useCasesWithValue || 0} use cases tracked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-green-700 font-medium">Cumulative Value</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-green-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total value generated from implemented AI solutions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    {hasValueData ? formatCurrency(portfolioSummary.cumulativeValue) : '£0'}
                  </p>
                  <p className="text-sm text-green-600">
                    Total value delivered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-purple-700 font-medium">Portfolio ROI</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>(Cumulative Value - Investment) / Investment × 100</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {hasValueData && portfolioSummary.portfolioRoi !== null 
                      ? formatRoi(portfolioSummary.portfolioRoi) 
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-purple-600">
                    Return on investment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-amber-700 font-medium">Avg. Breakeven</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average months to recover initial investment</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {hasValueData && portfolioSummary.avgBreakevenMonths !== null 
                      ? `${portfolioSummary.avgBreakevenMonths} mo` 
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-amber-600">
                    Time to value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {tomConfig?.enabled === 'true' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Value by TOM Phase
              </CardTitle>
              <CardDescription>
                Investment and value distribution across Target Operating Model phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasValueData && Object.keys(portfolioSummary.byPhase).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-value-by-phase">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phase</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Use Cases</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Investment</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Value</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(portfolioSummary.byPhase).map(([phaseId, data]) => {
                        const phase = tomConfig.phases.find(p => p.id === phaseId);
                        const roi = data.investment > 0 
                          ? ((data.value - data.investment) / data.investment) * 100 
                          : null;
                        return (
                          <tr key={phaseId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: phase?.color || '#6B7280' }}
                                />
                                <span className="font-medium">{phase?.name || phaseId}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">{data.count}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(data.investment)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(data.value)}</td>
                            <td className="text-right py-3 px-4">
                              <Badge 
                                variant={roi !== null && roi >= 0 ? 'default' : 'secondary'}
                                className={roi !== null && roi >= 0 ? 'bg-green-100 text-green-700' : ''}
                              >
                                {roi !== null ? formatRoi(roi) : 'N/A'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No value data by phase available yet.</p>
                  <p className="text-sm mt-1">Add value tracking to use cases to see phase breakdown.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!hasValueData && (
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-16 w-16 text-slate-300 mb-4" />
              <h4 className="text-lg font-semibold text-slate-700 mb-2">Get Started with Value Tracking</h4>
              <p className="text-slate-500 max-w-md mb-4">
                Add value realization data to individual use cases to see portfolio-level ROI, 
                investment breakdowns, and value by TOM phase.
              </p>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                Coming in Phase 2B: Use Case Value Entry
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
