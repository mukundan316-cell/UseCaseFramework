import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TrendingUp, 
  Lightbulb,
  Info,
  Target
} from 'lucide-react';
import { 
  getApplicableKpis, 
  deriveValueEstimates, 
  calculateTotalEstimatedValue,
  DEFAULT_VALUE_REALIZATION_CONFIG,
  type UseCaseScores
} from '@shared/valueRealization';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ValueEstimationLegoBlockProps {
  processes: string[];
  scores: UseCaseScores;
  className?: string;
  volumeMultiplier?: number;
  compact?: boolean;
  showSelection?: boolean;
  selectedKpis?: string[];
  onKpiSelectionChange?: (kpis: string[]) => void;
}

export default function ValueEstimationLegoBlock({
  processes,
  scores,
  className = '',
  volumeMultiplier = 1000,
  compact = false,
  showSelection = false,
  selectedKpis = [],
  onKpiSelectionChange
}: ValueEstimationLegoBlockProps) {
  const kpiLibrary = DEFAULT_VALUE_REALIZATION_CONFIG.kpiLibrary;

  const { applicableKpis, valueEstimates, totalValue } = useMemo(() => {
    if (!processes?.length) {
      return { 
        applicableKpis: [], 
        valueEstimates: [], 
        totalValue: { min: 0, max: 0, currency: 'GBP' } 
      };
    }

    const applicable = getApplicableKpis(processes, kpiLibrary);
    const estimates = deriveValueEstimates(processes, scores, kpiLibrary, volumeMultiplier);
    const total = calculateTotalEstimatedValue(estimates);

    return {
      applicableKpis: applicable,
      valueEstimates: estimates,
      totalValue: total
    };
  }, [processes, scores, kpiLibrary, volumeMultiplier]);

  // Auto-select all suggested KPIs when processes change (if selection mode is enabled)
  useEffect(() => {
    if (showSelection && onKpiSelectionChange && valueEstimates.length > 0) {
      const suggestedKpiIds = valueEstimates.map(e => e.kpiId);
      // Only auto-select if no KPIs are currently selected
      if (selectedKpis.length === 0 && suggestedKpiIds.length > 0) {
        onKpiSelectionChange(suggestedKpiIds);
      }
    }
  }, [valueEstimates, showSelection, onKpiSelectionChange, selectedKpis.length]);

  const handleKpiToggle = (kpiId: string, checked: boolean) => {
    if (!onKpiSelectionChange) return;
    if (checked) {
      onKpiSelectionChange([...selectedKpis, kpiId]);
    } else {
      onKpiSelectionChange(selectedKpis.filter(id => id !== kpiId));
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `£${Math.round(amount / 1000)}K`;
    return `£${Math.round(amount).toLocaleString()}`;
  };

  const getMaturityColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-green-100 text-green-800 border-green-300';
      case 'developing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'foundational': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (!processes?.length) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-[#3C2CDA]" />
            <span>Value Estimation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Select processes to see applicable KPIs and value estimates</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasMonetaryEstimates = totalValue.min > 0 || totalValue.max > 0;

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasMonetaryEstimates ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <Target className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm font-medium">
                {hasMonetaryEstimates ? 'Estimated Annual Value' : 'KPI Improvement Estimates'}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-right">
                    {hasMonetaryEstimates ? (
                      <div className="font-bold text-green-700">
                        {formatCurrency(totalValue.min)} - {formatCurrency(totalValue.max)}
                      </div>
                    ) : (
                      <div className="font-bold text-blue-700">
                        {valueEstimates.length} KPI{valueEstimates.length !== 1 ? 's' : ''} matched
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {valueEstimates[0]?.maturityLevel || 'Foundational'} maturity
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="text-xs space-y-1">
                    <div className="font-medium">Based on:</div>
                    {valueEstimates.slice(0, 3).map(est => (
                      <div key={est.kpiId}>
                        • {est.kpiName}: {est.expectedRange.min}-{est.expectedRange.max}
                        {est.benchmark?.improvementUnit || '%'} improvement
                      </div>
                    ))}
                    {valueEstimates.length > 3 && (
                      <div>+ {valueEstimates.length - 3} more KPIs</div>
                    )}
                    <div className="mt-2 text-gray-400">
                      Industry benchmarks • System estimate
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#3C2CDA]" />
            <span>Value Estimation</span>
          </div>
          <Badge variant="outline" className="text-xs">
            System Estimate
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalValue.min > 0 || totalValue.max > 0 ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 font-medium">Estimated Annual Value</div>
                <div className="text-2xl font-bold text-green-800">
                  {formatCurrency(totalValue.min)} - {formatCurrency(totalValue.max)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              Based on cost-saving KPIs with monetary baselines
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium">KPI-Based Improvement Estimates</div>
                <div className="text-lg font-semibold text-blue-800">
                  {valueEstimates.length} applicable KPI{valueEstimates.length !== 1 ? 's' : ''} identified
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
            <div className="mt-2 text-xs text-blue-600">
              Add transaction volume data to calculate monetary value
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">
              {showSelection ? 'Select KPIs to Track' : 'Suggested KPIs'}
            </span>
            <span className="text-xs text-gray-500">
              (Based on: {processes.slice(0, 2).join(', ')}{processes.length > 2 ? ` +${processes.length - 2}` : ''})
            </span>
            {showSelection && selectedKpis.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedKpis.length} selected
              </Badge>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {valueEstimates.slice(0, 8).map((estimate) => {
              const hasMonetaryValue = estimate.estimatedAnnualValueGbp && 
                (estimate.estimatedAnnualValueGbp.min > 0 || estimate.estimatedAnnualValueGbp.max > 0);
              const isSelected = selectedKpis.includes(estimate.kpiId);
              return (
                <div 
                  key={estimate.kpiId}
                  className={`flex items-center justify-between p-2 rounded border text-sm ${
                    showSelection && isSelected 
                      ? 'bg-indigo-50 border-indigo-300' 
                      : hasMonetaryValue 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {showSelection && (
                    <div className="mr-3 flex-shrink-0">
                      <Checkbox
                        id={`kpi-${estimate.kpiId}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleKpiToggle(estimate.kpiId, checked === true)}
                        data-testid={`checkbox-kpi-${estimate.kpiId}`}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <label 
                        htmlFor={showSelection ? `kpi-${estimate.kpiId}` : undefined}
                        className={`font-medium text-gray-800 ${showSelection ? 'cursor-pointer' : ''}`}
                      >
                        {estimate.kpiName}
                      </label>
                      {hasMonetaryValue && (
                        <span className="text-xs text-green-600" title="Contributes to monetary value">
                          (£)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Expected: {estimate.expectedRange.min}-{estimate.expectedRange.max}
                      {estimate.benchmark?.improvementUnit || '%'} improvement
                      {estimate.benchmark && (
                        <span className="ml-1 text-gray-400">
                          • {estimate.benchmark.baselineSource}
                        </span>
                      )}
                    </div>
                    {hasMonetaryValue && estimate.estimatedAnnualValueGbp && (
                      <div className="text-xs text-green-700 font-medium mt-0.5">
                        Est. value: {formatCurrency(estimate.estimatedAnnualValueGbp.min)} - {formatCurrency(estimate.estimatedAnnualValueGbp.max)}/yr
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getMaturityColor(estimate.maturityLevel)} text-xs border`}>
                      {estimate.maturityLevel}
                    </Badge>
                    <span className={`text-xs ${getConfidenceColor(estimate.confidence)}`}>
                      {estimate.confidence}
                    </span>
                  </div>
                </div>
              );
            })}
            {valueEstimates.length > 8 && (
              <div className="text-xs text-center text-gray-500 py-1">
                + {valueEstimates.length - 8} more KPIs available
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2 flex items-start gap-2">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>
            Estimates derived from industry benchmarks and your maturity scores. 
            Override with actual values once implementation begins.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
