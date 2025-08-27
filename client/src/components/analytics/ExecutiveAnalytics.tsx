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
import type { UseCase } from '../../types';
import AdvancedMetrics from './AdvancedMetrics';

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
  const { useCases, dashboardUseCases, getQuadrantCounts } = useUseCases();
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'risk' | 'investment'>('overview');
  const [drillDownData, setDrillDownData] = useState<any>(null);

  // Calculate comprehensive analytics
  const calculateAnalytics = () => {
    const activeUseCases = useCases.filter(uc => uc.isActiveForRsa === true || uc.isActiveForRsa === 'true');
    const totalPortfolioValue = activeUseCases.length;
    
    // ROI Analysis
    const highImpactUseCases = activeUseCases.filter(uc => 
      (uc.manualImpactScore || uc.impactScore || 0) >= 4
    );
    
    const quickWins = activeUseCases.filter(uc => uc.quadrant === 'Quick Win');
    const strategicBets = activeUseCases.filter(uc => uc.quadrant === 'Strategic Bet');
    
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
      color: '#005DAA',
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

  // Portfolio Distribution Data for Advanced Charts
  const portfolioDistribution = [
    { name: 'Quick Win', value: analytics.quickWinCount, color: '#22C55E', roi: 'High' },
    { name: 'Strategic Bet', value: analytics.strategicBetCount, color: '#3B82F6', roi: 'Medium-High' },
    { name: 'Experimental', value: useCases.filter(uc => uc.quadrant === 'Experimental').length, color: '#F59E0B', roi: 'Low' },
    { name: 'Watchlist', value: useCases.filter(uc => uc.quadrant === 'Watchlist').length, color: '#EF4444', roi: 'Negative' }
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

  // Risk vs Value Matrix for Executive Decision Making
  const riskValueMatrix = useCases
    .filter(uc => uc.isActiveForRsa === true || uc.isActiveForRsa === 'true')
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
            {/* Portfolio Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Portfolio Distribution
                </CardTitle>
                <CardDescription>Strategic allocation across quadrants</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Business Segment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Segment Performance
                </CardTitle>
                <CardDescription>Impact vs effort efficiency by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={segmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgImpact" fill="#3B82F6" name="Avg Impact" />
                    <Bar dataKey="avgEffort" fill="#EF4444" name="Avg Effort" />
                  </BarChart>
                </ResponsiveContainer>
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
                      Focus on {analytics.quickWinCount} Quick Win initiatives for rapid ROI
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