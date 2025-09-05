import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpDown, ArrowUp, ArrowDown, Target, DollarSign, 
  Clock, Shirt, TrendingUp, Users, Eye
} from 'lucide-react';
import { getEffectiveQuadrant, getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';
import { calculateTShirtSize } from '@shared/calculations';
import { UseCase } from '../../types';

interface PortfolioTableViewProps {
  useCases: UseCase[];
  metadata: any;
  onViewUseCase?: (useCase: UseCase) => void;
}

type SortField = 'title' | 'impact' | 'effort' | 'tshirt' | 'cost' | 'quadrant';
type SortDirection = 'asc' | 'desc' | null;

interface TableRow {
  id: string;
  title: string;
  impact: number;
  effort: number;
  quadrant: string;
  quadrantColor: string;
  tshirtSize: string;
  tshirtColor: string;
  costMin: number | null;
  costMax: number | null;
  weeksMin: number | null;
  weeksMax: number | null;
  teamSize: string | null;
  annualBenefit: string;
  roiRange: string;
  useCase: UseCase;
}

export default function PortfolioTableView({ useCases, metadata, onViewUseCase }: PortfolioTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('impact');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Transform use cases into table data
  const tableData: TableRow[] = useMemo(() => {
    return useCases.map(useCase => {
      const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
      const effectiveImpact = getEffectiveImpactScore(useCase as any);
      const effectiveEffort = getEffectiveEffortScore(useCase as any);
      
      // Calculate T-shirt sizing if available
      const tShirtConfig = metadata?.tShirtSizing;
      const sizing = tShirtConfig?.enabled 
        ? calculateTShirtSize(effectiveImpact, effectiveEffort, tShirtConfig)
        : null;

      // Get size configuration for color
      const sizeConfig = tShirtConfig?.sizes?.find((s: any) => s.name === sizing?.size);
      
      // Calculate annual benefit estimate (simplified)
      const annualBenefit = effectiveImpact >= 4 ? '£500K+' : 
                          effectiveImpact >= 3 ? '£200K-500K' : 
                          effectiveImpact >= 2 ? '£50K-200K' : '£0-50K';
      
      // Calculate ROI range based on quadrant
      const roiRange = effectiveQuadrant === 'Quick Win' ? '150-400%' :
                      effectiveQuadrant === 'Strategic Bet' ? '200-500%' :
                      effectiveQuadrant === 'Experimental' ? '50-200%' : '-20-100%';

      return {
        id: useCase.id,
        title: useCase.title,
        impact: effectiveImpact,
        effort: effectiveEffort,
        quadrant: effectiveQuadrant,
        quadrantColor: getQuadrantColor(effectiveQuadrant),
        tshirtSize: sizing?.size || 'TBD',
        tshirtColor: sizeConfig?.color || '#6B7280',
        costMin: sizing?.estimatedCostMin || null,
        costMax: sizing?.estimatedCostMax || null,
        weeksMin: sizing?.estimatedWeeksMin || null,
        weeksMax: sizing?.estimatedWeeksMax || null,
        teamSize: sizing?.teamSizeEstimate || null,
        annualBenefit,
        roiRange,
        useCase
      };
    });
  }, [useCases, metadata]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return tableData;

    return [...tableData].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'impact':
          aVal = a.impact;
          bVal = b.impact;
          break;
        case 'effort':
          aVal = a.effort;
          bVal = b.effort;
          break;
        case 'tshirt':
          const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'TBD': 6 };
          aVal = sizeOrder[a.tshirtSize as keyof typeof sizeOrder] || 99;
          bVal = sizeOrder[b.tshirtSize as keyof typeof sizeOrder] || 99;
          break;
        case 'cost':
          aVal = a.costMin || 0;
          bVal = b.costMin || 0;
          break;
        case 'quadrant':
          const quadrantOrder = { 'Quick Win': 1, 'Strategic Bet': 2, 'Experimental': 3, 'Watchlist': 4 };
          aVal = quadrantOrder[a.quadrant as keyof typeof quadrantOrder] || 99;
          bVal = quadrantOrder[b.quadrant as keyof typeof quadrantOrder] || 99;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [tableData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortField('impact'); // Reset to default
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 text-blue-600" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4 text-blue-600" />;
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  const formatCurrency = (min: number | null, max: number | null) => {
    if (!min || !max) return 'TBD';
    const formatAmount = (amount: number) => {
      if (amount >= 1000000) return `£${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `£${(amount / 1000).toFixed(0)}K`;
      return `£${Math.round(amount).toLocaleString()}`;
    };
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  };

  const formatDuration = (min: number | null, max: number | null) => {
    if (!min || !max) return 'TBD';
    const formatWeeks = (weeks: number) => {
      if (weeks >= 52) return `${(weeks / 52).toFixed(1)}y`;
      if (weeks >= 4) return `${Math.round(weeks / 4)}m`;
      return `${Math.round(weeks)}w`;
    };
    return `${formatWeeks(min)} - ${formatWeeks(max)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Portfolio Resource Planning
        </CardTitle>
        <p className="text-sm text-gray-600">
          Strategic overview with T-shirt sizing and resource estimates for active portfolio
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    Use Case
                    {getSortIcon('title')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('impact')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    <Target className="h-4 w-4" />
                    Impact
                    {getSortIcon('impact')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('effort')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Effort
                    {getSortIcon('effort')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('tshirt')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    <Shirt className="h-4 w-4" />
                    T-Shirt
                    {getSortIcon('tshirt')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('cost')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    <DollarSign className="h-4 w-4" />
                    Cost Range
                    {getSortIcon('cost')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <TrendingUp className="h-4 w-4" />
                    Annual Benefit
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('quadrant')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    Quadrant
                    {getSortIcon('quadrant')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate" title={row.title}>
                      {row.title}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold text-green-700">
                      {row.impact.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold text-blue-700">
                      {row.effort.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Badge 
                      className="text-white font-medium"
                      style={{ backgroundColor: row.tshirtColor }}
                    >
                      {row.tshirtSize}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-mono text-sm">
                      {formatCurrency(row.costMin, row.costMax)}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-mono text-sm">
                      {formatDuration(row.weeksMin, row.weeksMax)}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-semibold text-emerald-600">
                      {row.annualBenefit}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${row.quadrantColor}20`,
                        color: row.quadrantColor 
                      }}
                    >
                      {row.quadrant}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    {onViewUseCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewUseCase(row.useCase)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No use cases available for display
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
          <div>Showing {sortedData.length} use cases</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Impact: Business value potential (1-5)</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Effort: Implementation complexity (1-5)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getQuadrantColor(quadrant: string): string {
  switch (quadrant) {
    case 'Quick Win': return '#10B981';
    case 'Strategic Bet': return '#3B82F6';
    case 'Experimental': return '#F59E0B';
    case 'Watchlist': return '#EF4444';
    default: return '#6B7280';
  }
}