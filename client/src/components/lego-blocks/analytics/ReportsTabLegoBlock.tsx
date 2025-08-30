import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUseCases } from '@/contexts/UseCaseContext';
import type { UseCase } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, BarChart3, PieChart as PieChartIcon, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExecutiveAnalytics from '../analytics/ExecutiveAnalytics';

/**
 * Reports Tab LEGO Block
 * 
 * Dashboard reports using authentic database data only.
 * Features interactive charts and visualizations based on real use case data.
 * 
 * Features:
 * - Effort vs Impact scatter plot with real quadrant data
 * - Business segment distribution charts
 * - Quadrant summary cards with actual counts
 * - All data sourced from database with no hardcoding
 */
export default function ReportsTabLegoBlock() {
  const { useCases } = useUseCases();
  const isLoading = !useCases;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="enhanced" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="enhanced" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Executive Analytics
        </TabsTrigger>
        <TabsTrigger value="detailed" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Detailed Reports
        </TabsTrigger>
      </TabsList>

      <TabsContent value="enhanced">
        <ExecutiveAnalytics />
      </TabsContent>

      <TabsContent value="detailed">
        <DetailedReportsView useCases={useCases} />
      </TabsContent>
    </Tabs>
  );
}

function DetailedReportsView({ useCases }: { useCases: UseCase[] }) {
  // Filter use cases with complete scoring data AND active for RSA
  const scoredUseCases = useCases.filter((uc: UseCase) => 
    uc.impactScore !== null && 
    uc.effortScore !== null && 
    uc.quadrant &&
    (uc.isActiveForRsa === 'true' || uc.isActiveForRsa === true)
  );

  // Quadrant summary data
  const quadrantCounts = scoredUseCases.reduce((acc: Record<string, number>, uc: UseCase) => {
    const quadrant = uc.quadrant || 'Unassigned';
    acc[quadrant] = (acc[quadrant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalScored = scoredUseCases.length;

  const quadrantSummary = [
    { 
      name: 'Quick Win', 
      count: quadrantCounts['Quick Win'] || 0, 
      percentage: totalScored > 0 ? ((quadrantCounts['Quick Win'] || 0) / totalScored * 100).toFixed(1) : '0',
      color: 'bg-green-500',
      description: 'High Impact, Low Effort'
    },
    { 
      name: 'Strategic Bet', 
      count: quadrantCounts['Strategic Bet'] || 0, 
      percentage: totalScored > 0 ? ((quadrantCounts['Strategic Bet'] || 0) / totalScored * 100).toFixed(1) : '0',
      color: 'bg-blue-500',
      description: 'High Impact, High Effort'
    },
    { 
      name: 'Experimental', 
      count: quadrantCounts['Experimental'] || 0, 
      percentage: totalScored > 0 ? ((quadrantCounts['Experimental'] || 0) / totalScored * 100).toFixed(1) : '0',
      color: 'bg-yellow-500',
      description: 'Low Impact, Low Effort'
    },
    { 
      name: 'Watchlist', 
      count: quadrantCounts['Watchlist'] || 0, 
      percentage: totalScored > 0 ? ((quadrantCounts['Watchlist'] || 0) / totalScored * 100).toFixed(1) : '0',
      color: 'bg-red-500',
      description: 'Low Impact, High Effort'
    }
  ];

  // Scatter plot data for Impact vs Effort
  const scatterData = scoredUseCases.map((uc: UseCase) => ({
    x: uc.effortScore,
    y: uc.impactScore,
    quadrant: uc.quadrant,
    title: uc.title,
    lob: uc.lineOfBusiness,
    segment: uc.businessSegment
  }));

  // Business segment distribution
  const lobDistribution = scoredUseCases.reduce((acc: Record<string, number>, uc: UseCase) => {
    const lob = uc.lineOfBusiness || 'Unspecified';
    acc[lob] = (acc[lob] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lobData = Object.entries(lobDistribution).map(([name, value]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    fullName: name,
    value
  }));

  // Use case type distribution
  const typeDistribution = scoredUseCases.reduce((acc: Record<string, number>, uc: UseCase) => {
    const type = uc.useCaseType || 'Unspecified';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win': return '#10b981';
      case 'Strategic Bet': return '#3b82f6';
      case 'Experimental': return '#f59e0b';
      case 'Watchlist': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quadrant Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quadrantSummary.map((quadrant, index) => (
          <Card key={quadrant.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{quadrant.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{quadrant.count}</p>
                  <p className="text-sm text-gray-500">{quadrant.percentage}% of portfolio</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${quadrant.color} flex items-center justify-center`}>
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="outline" className="text-xs">
                  {quadrant.description}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="scatter" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scatter" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Impact vs Effort
          </TabsTrigger>
          <TabsTrigger value="lob" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Lines of Business
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Use Case Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scatter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact vs Effort Analysis</CardTitle>
              <CardDescription>
                Scatter plot showing {totalScored} RSA active use cases positioned by their impact and effort scores. 
                Each point is colored by its quadrant classification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Effort Score"
                      domain={[1, 5]}
                      label={{ value: 'Effort Score', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Impact Score"
                      domain={[1, 5]}
                      label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-semibold text-sm">{data.title}</p>
                              <p className="text-xs text-gray-600">{data.lob} - {data.segment}</p>
                              <p className="text-xs">Impact: {data.y.toFixed(1)}</p>
                              <p className="text-xs">Effort: {data.x.toFixed(1)}</p>
                              <Badge 
                                variant="outline" 
                                className="text-xs mt-1"
                                style={{ borderColor: getQuadrantColor(data.quadrant) }}
                              >
                                {data.quadrant}
                              </Badge>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Use Cases" 
                      data={scatterData} 
                      fill="#3b82f6"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lob" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution by Lines of Business</CardTitle>
              <CardDescription>
                RSA active use case count across different lines of business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lobData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = lobData.find(item => item.name === label);
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-semibold text-sm">{data?.fullName}</p>
                              <p className="text-sm">Use Cases: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Use Case Types Distribution</CardTitle>
              <CardDescription>
                Breakdown of AI use case types in the RSA active portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalScored}</p>
              <p className="text-sm text-gray-600">RSA Active Use Cases</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {totalScored > 0 ? (scoredUseCases.reduce((sum: number, uc: UseCase) => sum + (uc.impactScore || 0), 0) / totalScored).toFixed(1) : '0'}
              </p>
              <p className="text-sm text-gray-600">Avg Impact Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {totalScored > 0 ? (scoredUseCases.reduce((sum: number, uc: UseCase) => sum + (uc.effortScore || 0), 0) / totalScored).toFixed(1) : '0'}
              </p>
              <p className="text-sm text-gray-600">Avg Effort Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(lobDistribution).length}</p>
              <p className="text-sm text-gray-600">Lines of Business</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}