import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Building
} from 'lucide-react';
import { useUseCases } from '../../contexts/UseCaseContext';
import { calculateTShirtSize } from '@shared/calculations';
import { getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';

/**
 * LEGO Block: Resource Planning Metrics
 * Executive dashboard component for T-shirt sizing resource allocation insights
 * Follows RSA branding with comprehensive cost and timeline analytics
 */
export default function ResourcePlanningMetricsLegoBlock() {
  const { useCases, getFilteredUseCases, metadata } = useUseCases();
  
  const filteredUseCases = getFilteredUseCases();
  const tShirtConfig = metadata?.tShirtSizing;

  // Calculate comprehensive resource metrics
  const resourceMetrics = useMemo(() => {
    if (!tShirtConfig?.enabled || !filteredUseCases.length) {
      return {
        totalEstimatedCost: { min: 0, max: 0 },
        totalEstimatedWeeks: { min: 0, max: 0 },
        totalTeamMembers: { min: 0, max: 0 },
        sizingBreakdown: [],
        portfolioValue: 0,
        resourceUtilization: 0,
        averageCostPerProject: 0,
        highPriorityProjects: 0,
        quickWinValue: 0,
        strategicBetInvestment: 0,
        hasValidConfig: false
      };
    }

    let totalCostMin = 0;
    let totalCostMax = 0;
    let totalWeeksMin = 0;
    let totalWeeksMax = 0;
    let totalTeamMin = 0;
    let totalTeamMax = 0;
    const sizeCounts: Record<string, number> = {};
    const sizeBreakdown: Array<{ size: string; count: number; color: string; totalCostMin: number; totalCostMax: number }> = [];
    let validProjects = 0;
    let highPriorityCount = 0;
    let quickWinTotal = 0;
    let strategicBetTotal = 0;

    filteredUseCases.forEach(useCase => {
      const impactScore = getEffectiveImpactScore(useCase as any);
      const effortScore = getEffectiveEffortScore(useCase as any);
      
      if (impactScore && effortScore) {
        const sizing = calculateTShirtSize(impactScore, effortScore, tShirtConfig);
        
        if (sizing.size && !sizing.error) {
          validProjects++;
          
          // Accumulate totals
          if (sizing.estimatedCostMin) totalCostMin += sizing.estimatedCostMin;
          if (sizing.estimatedCostMax) totalCostMax += sizing.estimatedCostMax;
          if (sizing.estimatedWeeksMin) totalWeeksMin += sizing.estimatedWeeksMin;
          if (sizing.estimatedWeeksMax) totalWeeksMax += sizing.estimatedWeeksMax;
          
          // Parse team size estimates
          if (sizing.teamSizeEstimate) {
            const [minTeam, maxTeam] = sizing.teamSizeEstimate.split('-').map((s: string) => parseInt(s.trim()) || 0);
            totalTeamMin += minTeam;
            totalTeamMax += maxTeam;
          }

          // Track size breakdown
          sizeCounts[sizing.size] = (sizeCounts[sizing.size] || 0) + 1;
          
          // High priority projects (impact >= 4)
          if (impactScore >= 4) {
            highPriorityCount++;
          }

          // Quadrant-based investment analysis
          const quadrant = (useCase as any).quadrant || '';
          if (quadrant === 'Quick Win' && sizing.estimatedCostMin) {
            quickWinTotal += sizing.estimatedCostMin;
          } else if (quadrant === 'Strategic Bet' && sizing.estimatedCostMax) {
            strategicBetTotal += sizing.estimatedCostMax;
          }
        }
      }
    });

    // Build size breakdown with colors
    Object.entries(sizeCounts).forEach(([sizeName, count]) => {
      const sizeConfig = tShirtConfig.sizes.find(s => s.name === sizeName);
      if (sizeConfig) {
        // Calculate total cost for this size
        let sizeCostMin = 0;
        let sizeCostMax = 0;
        filteredUseCases.forEach(useCase => {
          const impactScore = getEffectiveImpactScore(useCase as any);
          const effortScore = getEffectiveEffortScore(useCase as any);
          const sizing = calculateTShirtSize(impactScore, effortScore, tShirtConfig);
          if (sizing.size === sizeName && !sizing.error) {
            if (sizing.estimatedCostMin) sizeCostMin += sizing.estimatedCostMin;
            if (sizing.estimatedCostMax) sizeCostMax += sizing.estimatedCostMax;
          }
        });

        sizeBreakdown.push({
          size: sizeName,
          count,
          color: sizeConfig.color,
          totalCostMin: sizeCostMin,
          totalCostMax: sizeCostMax
        });
      }
    });

    return {
      totalEstimatedCost: { min: totalCostMin, max: totalCostMax },
      totalEstimatedWeeks: { min: totalWeeksMin, max: totalWeeksMax },
      totalTeamMembers: { min: totalTeamMin, max: totalTeamMax },
      sizingBreakdown: sizeBreakdown.sort((a, b) => b.count - a.count),
      portfolioValue: validProjects,
      resourceUtilization: validProjects / Math.max(filteredUseCases.length, 1) * 100,
      averageCostPerProject: totalCostMin / Math.max(validProjects, 1),
      highPriorityProjects: highPriorityCount,
      quickWinValue: quickWinTotal,
      strategicBetInvestment: strategicBetTotal,
      hasValidConfig: true
    };
  }, [filteredUseCases, tShirtConfig]);

  // Format currency with RSA styling
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    }
    return `£${Math.round(amount).toLocaleString()}`;
  };

  // Format duration
  const formatDuration = (weeks: number) => {
    if (weeks >= 52) {
      return `${(weeks / 52).toFixed(1)} years`;
    } else if (weeks >= 4) {
      return `${Math.round(weeks / 4)} months`;
    }
    return `${Math.round(weeks)} weeks`;
  };

  if (!resourceMetrics.hasValidConfig) {
    return (
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">Resource Planning</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            T-shirt sizing is not configured. Enable it in the Admin Panel to see resource planning metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building className="h-6 w-6 text-[#005DAA]" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Resource Planning Dashboard</h3>
          <p className="text-sm text-gray-600">Enterprise-grade project estimation and resource allocation</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Portfolio Investment</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-green-900">
                    {formatCurrency(resourceMetrics.totalEstimatedCost.min)}
                  </span>
                  <span className="text-sm text-green-600">
                    - {formatCurrency(resourceMetrics.totalEstimatedCost.max)}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Avg: {formatCurrency(resourceMetrics.averageCostPerProject)} per project
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Portfolio Timeline</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-900">
                    {formatDuration(resourceMetrics.totalEstimatedWeeks.min)}
                  </span>
                  <span className="text-sm text-blue-600">
                    - {formatDuration(resourceMetrics.totalEstimatedWeeks.max)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  If executed sequentially
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Team Capacity */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Team Capacity Needed</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-purple-900">
                    {resourceMetrics.totalTeamMembers.min}
                  </span>
                  <span className="text-sm text-purple-600">
                    - {resourceMetrics.totalTeamMembers.max}
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Full-time equivalent roles
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* High Priority */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">High Priority Projects</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-orange-900">
                    {resourceMetrics.highPriorityProjects}
                  </span>
                  <span className="text-sm text-orange-600">
                    / {resourceMetrics.portfolioValue}
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Impact score ≥ 4.0
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* T-shirt Size Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#005DAA]" />
              Project Size Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resourceMetrics.sizingBreakdown.map((item) => (
                <div key={item.size} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.size}</span>
                    <Badge variant="outline">{item.count} projects</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(item.totalCostMin)} - {formatCurrency(item.totalCostMax)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((item.count / resourceMetrics.portfolioValue) * 100)}% of portfolio
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Allocation */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#005DAA]" />
              Strategic Investment Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Quick Wins</p>
                    <p className="text-sm text-green-600">High impact, low effort</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-800">
                    {formatCurrency(resourceMetrics.quickWinValue)}
                  </div>
                  <div className="text-xs text-green-600">Minimum investment</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Strategic Bets</p>
                    <p className="text-sm text-blue-600">High impact, high effort</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-800">
                    {formatCurrency(resourceMetrics.strategicBetInvestment)}
                  </div>
                  <div className="text-xs text-blue-600">Maximum investment</div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Resource Utilization</span>
                  <span className="font-medium">
                    {Math.round(resourceMetrics.resourceUtilization)}% of portfolio sized
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#005DAA] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, resourceMetrics.resourceUtilization)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}