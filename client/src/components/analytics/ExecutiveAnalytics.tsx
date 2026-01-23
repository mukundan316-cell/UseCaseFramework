import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, PieChart, Pie, Cell, LineChart, Line,
  ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Target, Users, DollarSign, Clock, AlertTriangle,
  Zap, Award, BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUseCases } from '../../contexts/UseCaseContext';
import { calculateTShirtSize } from '@shared/calculations';
import { getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';
import type { UseCase } from '../../types';
import AdvancedMetrics from './AdvancedMetrics';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * Executive Analytics Dashboard Enhancement
 * 
 * Advanced interactive analytics providing executive-level insights:
 * - Portfolio Performance Metrics with ROI projections
 * - Risk Heat Maps with drill-down capabilities
 * - Investment Analysis and Resource Allocation
 * - Strategic Recommendations Engine
 * - Advanced Scoring Visualization with trends
 * - Interactive drill-downs and contextual insights
 */

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  color?: string;
}

export default function ExecutiveAnalytics() {
  const { useCases, dashboardUseCases, getQuadrantCounts, metadata } = useUseCases();
  const { formatCompact } = useCurrency();
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'risk' | 'investment'>('overview');
  const [drillDownData, setDrillDownData] = useState<any>(null);

  // Calculate comprehensive analytics from authentic database values
  const calculateAnalytics = () => {
    const activeUseCases = useCases.filter(uc => uc.isActiveForRsa === 'true');
    const totalPortfolioValue = activeUseCases.length;
    
    // ROI Analysis
    const highImpactUseCases = activeUseCases.filter(uc => 
      (uc.manualImpactScore || uc.impactScore || 0) >= 4
    );
    
    const quickWins = activeUseCases.filter(uc => uc.quadrant === 'Quick Win');
    const strategicBets = activeUseCases.filter(uc => uc.quadrant === 'Strategic Bet');
    const experimental = activeUseCases.filter(uc => uc.quadrant === 'Experimental');
    const watchlist = activeUseCases.filter(uc => uc.quadrant === 'Watchlist');
    
    // Risk Assessment
    const highRiskUseCases = activeUseCases.filter(uc => 
      (uc.manualEffortScore || uc.effortScore || 0) >= 4
    );
    
    // Calculate average scores with proper null handling
    const avgImpact = activeUseCases.reduce((sum, uc) => 
      sum + (uc.manualImpactScore || uc.impactScore || 0), 0) / (activeUseCases.length || 1);
    const avgEffort = activeUseCases.reduce((sum, uc) => 
      sum + (uc.manualEffortScore || uc.effortScore || 0), 0) / (activeUseCases.length || 1);
    
    return {
      totalPortfolioValue,
      highImpactUseCases: highImpactUseCases.length,
      quickWinCount: quickWins.length,
      strategicBetCount: strategicBets.length,
      experimentalCount: experimental.length,
      watchlistCount: watchlist.length,
      highRiskCount: highRiskUseCases.length,
      averageImpact: avgImpact,
      averageEffort: avgEffort,
      portfolioBalance: quickWins.length / (activeUseCases.length || 1),
      riskExposure: highRiskUseCases.length / (activeUseCases.length || 1)
    };
  };

  const analytics = calculateAnalytics();

  // Executive KPI Metrics
  const executiveMetrics: AnalyticsMetric[] = [
    {
      label: 'Portfolio Value',
      value: analytics.totalPortfolioValue,
      description: 'Active use cases driving business value',
      color: '#3C2CDA',
      trend: 'up'
    },
    {
      label: 'High-Impact Initiatives',
      value: analytics.highImpactUseCases,
      change: `${((analytics.highImpactUseCases / analytics.totalPortfolioValue) * 100).toFixed(0)}%`,
      description: 'Use cases with impact score ≥ 4.0',
      color: '#22C55E',
      trend: 'up'
    },
    {
      label: 'Quick Wins Ready',
      value: analytics.quickWinCount,
      change: `${((analytics.quickWinCount / analytics.totalPortfolioValue) * 100).toFixed(0)}%`,
      description: 'High impact, low complexity initiatives',
      color: '#10B981',
      trend: 'stable'
    },
    {
      label: 'Strategic Investments',
      value: analytics.strategicBetCount,
      change: `${((analytics.strategicBetCount / analytics.totalPortfolioValue) * 100).toFixed(0)}%`,
      description: 'High impact, high complexity projects',
      color: '#3B82F6',
      trend: 'up'
    },
    {
      label: 'Average Impact Score',
      value: analytics.averageImpact.toFixed(1),
      description: 'Portfolio-wide business impact rating',
      color: '#8B5CF6',
      trend: 'up'
    },
    {
      label: 'Risk Exposure',
      value: `${(analytics.riskExposure * 100).toFixed(0)}%`,
      description: 'High-complexity initiatives requiring attention',
      color: '#EF4444',
      trend: 'down'
    }
  ];

  // Portfolio Distribution Data for Advanced Charts with Enhanced Styling
  const portfolioDistribution = [
    { 
      name: 'Quick Win', 
      value: analytics.quickWinCount, 
      color: '#10B981', 
      gradientColor: 'rgba(16, 185, 129, 0.8)',
      size: 'Medium',
      description: 'High Impact, Low Effort',
      percentage: ((analytics.quickWinCount / analytics.totalPortfolioValue) * 100).toFixed(1)
    },
    { 
      name: 'Strategic Bet', 
      value: analytics.strategicBetCount, 
      color: '#3B82F6', 
      gradientColor: 'rgba(59, 130, 246, 0.8)',
      size: 'Large',
      description: 'High Impact, High Effort',
      percentage: ((analytics.strategicBetCount / analytics.totalPortfolioValue) * 100).toFixed(1)
    },
    { 
      name: 'Experimental', 
      value: analytics.experimentalCount, 
      color: '#F59E0B', 
      gradientColor: 'rgba(245, 158, 11, 0.8)',
      size: 'Small',
      description: 'Low Impact, Low Effort',
      percentage: ((analytics.experimentalCount / analytics.totalPortfolioValue) * 100).toFixed(1)
    },
    { 
      name: 'Watchlist', 
      value: analytics.watchlistCount, 
      color: '#EF4444', 
      gradientColor: 'rgba(239, 68, 68, 0.8)',
      size: 'Variable',
      description: 'Low Impact, High Effort',
      percentage: ((analytics.watchlistCount / analytics.totalPortfolioValue) * 100).toFixed(1)
    }
  ];

  // Business Segment Analysis
  const segmentAnalysis = useCases.reduce((acc, uc) => {
    const segment = uc.businessSegment || 'Unspecified';
    if (!acc[segment]) {
      acc[segment] = { 
        name: segment, 
        count: 0, 
        impact: 0, 
        effort: 0,
        value: 0 
      };
    }
    acc[segment].count++;
    acc[segment].impact += (uc.manualImpactScore || uc.impactScore || 0);
    acc[segment].effort += (uc.manualEffortScore || uc.effortScore || 0);
    acc[segment].value = acc[segment].impact / acc[segment].effort || 0;
    return acc;
  }, {} as Record<string, any>);

  const segmentData = Object.values(segmentAnalysis).map((seg: any) => ({
    ...seg,
    avgImpact: (seg.impact / seg.count).toFixed(1),
    avgEffort: (seg.effort / seg.count).toFixed(1),
    efficiency: (seg.impact / seg.effort).toFixed(2)
  }));

  // Risk vs Value Matrix for Executive Decision Making using authentic database data
  const riskValueMatrix = useCases
    .filter(uc => uc.isActiveForRsa === 'true')
    .map(uc => ({
      name: uc.title,
      risk: uc.manualEffortScore || uc.effortScore || 0,
      value: uc.manualImpactScore || uc.impactScore || 0,
      quadrant: uc.quadrant,
      lob: uc.lineOfBusiness,
      segment: uc.businessSegment,
      size: 20 + (uc.manualImpactScore || uc.impactScore || 0) * 5 // Bubble size based on impact
    }));

  const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

  const ExecutiveMetricCard = ({ metric }: { metric: AnalyticsMetric }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => setDrillDownData({ type: 'metric', data: metric })}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              {metric.change && (
                <span className={`text-sm font-medium flex items-center ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {metric.change}
                </span>
              )}
            </div>
            {metric.description && (
              <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            )}
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity"
            style={{ backgroundColor: metric.color }}
          >
            <Activity className="w-6 h-6" style={{ color: metric.color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <h4 className="font-semibold text-gray-900 mb-2">{data.name}</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Business Value:</span> {data.value}</p>
            <p><span className="font-medium">Implementation Risk:</span> {data.risk}</p>
            <p><span className="font-medium">Quadrant:</span> {data.quadrant}</p>
            <p><span className="font-medium">Business Segment:</span> {data.segment}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Executive KPI Dashboard */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Analytics Dashboard</h2>
        <AdvancedMetrics 
          useCases={useCases} 
          onDrillDown={(metric, data) => setDrillDownData({ type: metric, data })}
        />
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Portfolio Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Analysis
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Investment Strategy
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Portfolio Distribution */}
            <Card className="bg-gradient-to-br from-slate-50 to-white shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <PieChartIcon className="h-6 w-6" />
                  </div>
                  Strategic Portfolio Distribution
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Investment allocation across strategic quadrants • Total: {analytics.totalPortfolioValue} initiatives
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Pie Chart */}
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={340}>
                      <PieChart>
                        <defs>
                          {portfolioDistribution.map((entry, index) => (
                            <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={entry.color} />
                              <stop offset="100%" stopColor={entry.gradientColor} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={portfolioDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={130}
                          innerRadius={65}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="white"
                          strokeWidth={3}
                        >
                          {portfolioDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                                  <h4 className="font-bold text-gray-900 mb-2">{data.name}</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Count:</span> {data.value} initiatives</p>
                                    <p><span className="font-medium">Percentage:</span> {data.percentage}%</p>
                                    <p><span className="font-medium">Project Size:</span> {data.size}</p>
                                    <p className="text-gray-600 italic">{data.description}</p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{analytics.totalPortfolioValue}</div>
                        <div className="text-sm text-gray-600">Total Initiatives</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Strategic Insights Panel */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg mb-4">Strategic Insights</h4>
                    {portfolioDistribution.map((quadrant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg"
                           style={{ backgroundColor: `${quadrant.color}10`, border: `2px solid ${quadrant.color}20` }}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full shadow-lg"
                            style={{ backgroundColor: quadrant.color }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{quadrant.name}</div>
                            <div className="text-sm text-gray-600">{quadrant.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: quadrant.color }}>
                            {quadrant.value}
                          </div>
                          <div className="text-sm text-gray-500">{quadrant.percentage}%</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Executive Recommendation */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Executive Recommendation</h5>
                      <p className="text-sm text-blue-800">
                        {(() => {
                          const tShirtConfig = metadata?.tShirtSizing;
                          if (tShirtConfig?.enabled) {
                            // Calculate resource requirements for Quick Wins and Strategic Bets
                            let quickWinCost = 0;
                            let strategicBetCost = 0;
                            let quickWinWeeks = 0;
                            let strategicBetWeeks = 0;
                            
                            useCases.filter(uc => uc.isActiveForRsa === 'true').forEach(useCase => {
                              const impactScore = getEffectiveImpactScore(useCase as any);
                              const effortScore = getEffectiveEffortScore(useCase as any);
                              const quadrant = (useCase as any).quadrant;
                              
                              if (impactScore && effortScore) {
                                const sizing = calculateTShirtSize(impactScore, effortScore, tShirtConfig);
                                if (sizing.size && !sizing.error) {
                                  if (quadrant === 'Quick Win') {
                                    quickWinCost += sizing.estimatedCostMin || 0;
                                    quickWinWeeks += sizing.estimatedWeeksMin || 0;
                                  } else if (quadrant === 'Strategic Bet') {
                                    strategicBetCost += sizing.estimatedCostMax || 0;
                                    strategicBetWeeks += sizing.estimatedWeeksMax || 0;
                                  }
                                }
                              }
                            });

                            const formatCurrencyLocal = (amount: number) => {
                              return formatCompact(amount);
                            };

                            if (analytics.quickWinCount > 0) {
                              return `Execute ${analytics.quickWinCount} Quick Wins requiring ${formatCurrencyLocal(quickWinCost)} investment over ${Math.round(quickWinWeeks/4)} months, while planning ${analytics.strategicBetCount} Strategic Bets with ${formatCurrencyLocal(strategicBetCost)} budget allocation.`;
                            } else {
                              return `Focus on ${analytics.strategicBetCount} Strategic Bet initiatives requiring ${formatCurrencyLocal(strategicBetCost)} investment and ${Math.round(strategicBetWeeks/4)} month timeline for capability building.`;
                            }
                          } else {
                            return analytics.quickWinCount > 0 ? 
                              `Prioritize ${analytics.quickWinCount} Quick Wins for immediate impact while building capabilities for ${analytics.strategicBetCount} Strategic Bets.` :
                              "Focus on building a balanced portfolio with more Quick Win opportunities.";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Business Segment Analysis */}
            <Card className="bg-gradient-to-br from-emerald-50 to-white shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  Business Segment Performance Matrix
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Strategic value analysis across business segments • Resource allocation efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={segmentData} margin={{ top: 30, right: 40, left: 30, bottom: 70 }}>
                    <defs>
                      <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="effortGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="2 2" 
                      stroke="#F3F4F6" 
                      strokeWidth={1}
                    />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={90}
                      tick={{ 
                        fontSize: 11, 
                        fill: '#6B7280', 
                        fontWeight: 500 
                      }}
                      axisLine={{ stroke: '#D1D5DB', strokeWidth: 1.5 }}
                      tickLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 11, 
                        fill: '#6B7280', 
                        fontWeight: 500 
                      }}
                      domain={[0, 5]}
                      axisLine={{ stroke: '#D1D5DB', strokeWidth: 1.5 }}
                      tickLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                      label={{ 
                        value: 'Score (0-5)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { 
                          textAnchor: 'middle',
                          fontSize: '12px', 
                          fontWeight: '600', 
                          fill: '#374151' 
                        } 
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                              <h4 className="font-bold text-gray-900 mb-2">{label}</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                                  <span className="text-sm">Average Impact: <strong>{payload[0]?.value}</strong>/5</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                                  <span className="text-sm">Average Effort: <strong>{payload[1]?.value}</strong>/5</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                  <span className="text-sm text-gray-600">
                                    Efficiency Ratio: <strong>{(((payload[0]?.value as number) || 0) / ((payload[1]?.value as number) || 1)).toFixed(2)}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="avgImpact" 
                      fill="url(#impactGradient)" 
                      name="Average Impact Score"
                      radius={[6, 6, 0, 0]}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <Bar 
                      dataKey="avgEffort" 
                      fill="url(#effortGradient)" 
                      name="Average Effort Score"
                      radius={[6, 6, 0, 0]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Performance Insights */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Top Performer</span>
                    </div>
                    <div className="text-sm text-emerald-700">
                      {segmentData.length > 0 ? 
                        segmentData.reduce((prev, current) => 
                          (prev.efficiency > current.efficiency) ? prev : current
                        ).name : 'No data'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Highest Impact</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      {segmentData.length > 0 ? 
                        segmentData.reduce((prev, current) => 
                          (prev.avgImpact > current.avgImpact) ? prev : current
                        ).name : 'No data'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">Needs Attention</span>
                    </div>
                    <div className="text-sm text-amber-700">
                      {segmentData.length > 0 ? 
                        segmentData.reduce((prev, current) => 
                          (prev.efficiency < current.efficiency) ? prev : current
                        ).name : 'No data'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Value vs Complexity Analysis
              </CardTitle>
              <CardDescription>Interactive portfolio positioning with drill-down capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={riskValueMatrix}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="risk" type="number" domain={[0, 5]} name="Implementation Risk" />
                  <YAxis dataKey="value" type="number" domain={[0, 5]} name="Business Value" />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter dataKey="value" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Heat Map
                </CardTitle>
                <CardDescription>High-risk initiatives requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskValueMatrix
                    .filter(item => item.risk >= 4)
                    .sort((a, b) => b.risk - a.risk)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.segment}</p>
                        </div>
                        <Badge variant="destructive">Risk: {item.risk}/5</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  High-Value Opportunities
                </CardTitle>
                <CardDescription>Top strategic opportunities for investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskValueMatrix
                    .filter(item => item.value >= 4)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.segment}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Value: {item.value}/5</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Strategy */}
        <TabsContent value="investment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Strategic Investment Recommendations
              </CardTitle>
              <CardDescription>AI-powered portfolio optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Investment Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Immediate Actions</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Focus on {analytics.quickWinCount} Quick Win initiatives for rapid value delivery
                    </p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Prioritize Quick Wins
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Strategic Focus</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Allocate resources to {analytics.strategicBetCount} high-impact strategic bets
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Plan Strategic Investments
                    </Button>
                  </div>
                </div>

                {/* Portfolio Balance Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={portfolioDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drill-down Modal/Detail View */}
      {drillDownData && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detailed Analysis: {drillDownData.data.label}</CardTitle>
            <Button variant="outline" onClick={() => setDrillDownData(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{drillDownData.data.description}</p>
            {/* Additional drill-down content would go here */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}