import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shirt, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Target,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useUseCases } from '../../contexts/UseCaseContext';
import { calculateTShirtSize } from '@shared/calculations';

/**
 * LEGO Block: T-shirt Sizing Display
 * Replaces ROI information with concrete resource planning data
 * Clean UI with progressive disclosure following RSA branding
 */

interface TShirtSizingDisplayLegoBlockProps {
  impactScore: number;
  effortScore: number;
  quadrant: string;
  className?: string;
}

export default function TShirtSizingDisplayLegoBlock({
  impactScore,
  effortScore,
  quadrant,
  className = ''
}: TShirtSizingDisplayLegoBlockProps) {
  const { metadata } = useUseCases();
  const tShirtConfig = metadata?.tShirtSizing;

  // Calculate T-shirt sizing if available
  const sizing = tShirtConfig?.enabled 
    ? calculateTShirtSize(impactScore, effortScore, tShirtConfig)
    : null;

  // Fallback to ROI-style display if T-shirt sizing not configured
  if (!sizing || sizing.error || !sizing.size) {
    const getQuadrantColor = (quad: string) => {
      switch (quad) {
        case 'Quick Win': return 'bg-green-100 text-green-800 border-green-200';
        case 'Strategic Bet': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Experimental': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Watchlist': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Strategic Analysis</span>
            </div>
            <Badge className={`${getQuadrantColor(quadrant)} border`}>
              {quadrant}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">Business Impact</div>
                <div className="text-gray-600">{impactScore.toFixed(1)}/5</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-medium">Implementation Effort</div>
                <div className="text-gray-600">{effortScore.toFixed(1)}/5</div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
            <div className="flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span><strong>Note:</strong> Enable T-shirt sizing in Admin Panel for detailed resource estimates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get size configuration for color
  const sizeConfig = tShirtConfig?.sizes.find((s: any) => s.name === sizing.size);
  const sizeColor = sizeConfig?.color || '#6B7280';

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'TBD';
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `£${(amount / 1000).toFixed(0)}K`;
    return `£${Math.round(amount).toLocaleString()}`;
  };

  // Format duration
  const formatDuration = (weeks: number | null) => {
    if (!weeks) return 'TBD';
    if (weeks >= 52) return `${(weeks / 52).toFixed(1)} years`;
    if (weeks >= 4) return `${Math.round(weeks / 4)} months`;
    return `${Math.round(weeks)} weeks`;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-[#005DAA]" />
            <span>Resource Planning</span>
          </div>
          <Badge 
            className="border text-white font-medium"
            style={{ backgroundColor: sizeColor }}
          >
            {sizing.size}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-sm font-medium">Investment</div>
              <div className="text-xs text-gray-600">
                {sizing.estimatedCostMin && sizing.estimatedCostMax 
                  ? `${formatCurrency(sizing.estimatedCostMin)} - ${formatCurrency(sizing.estimatedCostMax)}`
                  : 'TBD'
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium">Timeline</div>
              <div className="text-xs text-gray-600">
                {sizing.estimatedWeeksMin && sizing.estimatedWeeksMax
                  ? `${formatDuration(sizing.estimatedWeeksMin)} - ${formatDuration(sizing.estimatedWeeksMax)}`
                  : 'TBD'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Team Requirements */}
        {sizing.teamSizeEstimate && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Team Size</div>
              <div className="text-xs text-gray-600">{sizing.teamSizeEstimate} people</div>
            </div>
          </div>
        )}

        {/* Strategic Context */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Strategic Position</span>
            <Badge variant="outline" className="text-xs">
              {quadrant}
            </Badge>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Impact: {impactScore.toFixed(1)}/5 • Effort: {effortScore.toFixed(1)}/5
          </div>
        </div>

        {/* Strategy Recommendation */}
        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
          <div className="flex items-start gap-1">
            <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Strategy:</strong> {getStrategyRecommendation(quadrant, sizing)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStrategyRecommendation(quadrant: string, sizing: any): string {
  const cost = sizing.estimatedCostMin;
  const weeks = sizing.estimatedWeeksMin;

  switch (quadrant) {
    case 'Quick Win':
      return `Prioritize immediately - ${cost ? `£${Math.round(cost/1000)}K` : 'low'} investment with ${weeks ? `${Math.round(weeks)} weeks` : 'fast'} delivery`;
    
    case 'Strategic Bet':
      return `Plan carefully with adequate resources - ${cost ? `£${Math.round(cost/1000)}K` : 'significant'} investment requires ${weeks ? `${Math.round(weeks/4)} months` : 'extended timeline'}`;
    
    case 'Experimental':
      return `Consider for capability building - ${cost ? `£${Math.round(cost/1000)}K` : 'modest'} investment in ${weeks ? `${Math.round(weeks)} weeks` : 'short timeframe'}`;
    
    case 'Watchlist':
      return `Monitor for future potential - ${cost ? `£${Math.round(cost/1000)}K` : 'high'} cost may not justify ${weeks ? `${Math.round(weeks/4)} month` : 'extended'} effort`;
    
    default:
      return 'Evaluate against business priorities and available resources';
  }
}