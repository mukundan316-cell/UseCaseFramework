import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, Cell, LabelList
} from 'recharts';
import { 
  Target, Filter, ZoomIn, RotateCcw, TrendingUp, Award,
  AlertTriangle, Sparkles, Users, DollarSign
} from 'lucide-react';
import { useUseCases } from '../../contexts/UseCaseContext';
import { getEffectiveQuadrant, getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';

/**
 * Enhanced Matrix Plot for Executive Dashboard
 * Professional Gartner-style Magic Quadrant with executive insights
 */

export default function EnhancedMatrixPlot() {
  const { useCases, dashboardUseCases } = useUseCases();
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Enhanced chart data with sophisticated styling
  const chartData = dashboardUseCases.map(useCase => {
    const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
    const effectiveImpact = getEffectiveImpactScore(useCase as any);
    const effectiveEffort = getEffectiveEffortScore(useCase as any);
    
    return {
      x: effectiveEffort,
      y: effectiveImpact,
      name: useCase.title,
      quadrant: effectiveQuadrant,
      color: getQuadrantColor(effectiveQuadrant),
      gradientColor: getQuadrantGradient(effectiveQuadrant),
      size: 25 + (effectiveImpact * 8), // Dynamic sizing based on impact
      useCase: useCase,
      lob: useCase.lineOfBusiness,
      segment: useCase.businessSegment,
      isHighValue: effectiveImpact >= 4,
      isLowEffort: effectiveEffort <= 2,
      priority: calculatePriority(effectiveImpact, effectiveEffort)
    };
  });

  function getQuadrantColor(quadrant: string): string {
    switch (quadrant) {
      case 'Quick Win': return '#10B981';
      case 'Strategic Bet': return '#3B82F6';
      case 'Experimental': return '#F59E0B';
      case 'Watchlist': return '#EF4444';
      default: return '#6B7280';
    }
  }

  function getQuadrantGradient(quadrant: string): string {
    switch (quadrant) {
      case 'Quick Win': return 'rgba(16, 185, 129, 0.7)';
      case 'Strategic Bet': return 'rgba(59, 130, 246, 0.7)';
      case 'Experimental': return 'rgba(245, 158, 11, 0.7)';
      case 'Watchlist': return 'rgba(239, 68, 68, 0.7)';
      default: return 'rgba(107, 114, 128, 0.7)';
    }
  }

  function calculatePriority(impact: number, effort: number): number {
    // Executive priority algorithm: Higher impact, lower effort = higher priority
    return (impact * 2) - effort;
  }

  // Quadrant statistics for executive insights
  const quadrantStats = {
    'Quick Win': chartData.filter(d => d.quadrant === 'Quick Win').length,
    'Strategic Bet': chartData.filter(d => d.quadrant === 'Strategic Bet').length,
    'Experimental': chartData.filter(d => d.quadrant === 'Experimental').length,
    'Watchlist': chartData.filter(d => d.quadrant === 'Watchlist').length
  };

  const totalUseCases = chartData.length;
  const highValueCount = chartData.filter(d => d.isHighValue).length;
  const lowEffortCount = chartData.filter(d => d.isLowEffort).length;

  const filteredData = selectedQuadrant 
    ? chartData.filter(d => d.quadrant === selectedQuadrant)
    : chartData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div 
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: data.color }}
            />
            <h4 className="font-bold text-gray-900">{data.name}</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Business Impact:</span>
                <div className="text-lg font-bold text-emerald-600">{data.y.toFixed(1)}/5</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Implementation Effort:</span>
                <div className="text-lg font-bold text-amber-600">{data.x.toFixed(1)}/5</div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p><span className="font-medium">Strategic Position:</span> {data.quadrant}</p>
              <p><span className="font-medium">Business Unit:</span> {data.lob}</p>
              <p><span className="font-medium">Priority Score:</span> {data.priority.toFixed(1)}</p>
            </div>
            {data.isHighValue && (
              <div className="mt-2 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full text-center">
                High-Value Initiative
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const QuadrantCard = ({ 
    name, 
    count, 
    color, 
    description, 
    recommendation 
  }: { 
    name: string; 
    count: number; 
    color: string; 
    description: string;
    recommendation: string;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        selectedQuadrant === name 
          ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
          : 'hover:shadow-md hover:scale-105'
      }`}
      onClick={() => setSelectedQuadrant(selectedQuadrant === name ? null : name)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: color }}
            />
            <h4 className="font-semibold text-gray-900">{name}</h4>
          </div>
          <div className="text-2xl font-bold" style={{ color }}>
            {count}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <div className="text-xs text-gray-500 italic">
          {recommendation}
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Portfolio %</span>
            <span>{((count / totalUseCases) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${(count / totalUseCases) * 100}%`,
                backgroundColor: color 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Executive Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{totalUseCases}</div>
                <div className="text-sm text-blue-700">Total Initiatives</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-emerald-900">{highValueCount}</div>
                <div className="text-sm text-emerald-700">High-Value Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-900">{lowEffortCount}</div>
                <div className="text-sm text-amber-700">Low-Effort Wins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {(chartData.reduce((sum, d) => sum + d.priority, 0) / chartData.length).toFixed(1)}
                </div>
                <div className="text-sm text-purple-700">Avg Priority Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Matrix Visualization */}
      <Card className="bg-gradient-to-br from-slate-50 to-white shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-6 w-6" />
                </div>
                RSA AI Value Matrix - Executive View
              </CardTitle>
              <CardDescription className="text-slate-200 mt-2">
                Strategic portfolio positioning • Click quadrants to filter • Bubble size indicates business impact
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {showLabels ? 'Hide Labels' : 'Show Labels'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuadrant(null)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Matrix Chart */}
            <div className="lg:col-span-3">
              <div className="relative">
                <ResponsiveContainer width="100%" height={500}>
                  <ScatterChart data={filteredData}>
                    <defs>
                      {chartData.map((entry, index) => (
                        <radialGradient key={`gradient-${index}`} id={`bubble-gradient-${index}`}>
                          <stop offset="0%" stopColor={entry.color} />
                          <stop offset="70%" stopColor={entry.gradientColor} />
                          <stop offset="100%" stopColor={entry.color} />
                        </radialGradient>
                      ))}
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    
                    {/* Quadrant Reference Lines */}
                    <ReferenceLine 
                      x={2.5} 
                      stroke="#6B7280" 
                      strokeDasharray="8 4" 
                      strokeWidth={2}
                    />
                    <ReferenceLine 
                      y={2.5} 
                      stroke="#6B7280" 
                      strokeDasharray="8 4" 
                      strokeWidth={2}
                    />
                    
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[0, 5]} 
                      name="Implementation Effort"
                      tickCount={6}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      label={{ value: 'Implementation Effort →', position: 'insideBottom', offset: -10, style: { fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={[0, 5]} 
                      name="Business Impact"
                      tickCount={6}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      label={{ value: '← Business Impact', angle: -90, position: 'insideLeft', style: { fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Scatter dataKey="y" fill="#3B82F6">
                      {filteredData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#bubble-gradient-${chartData.findIndex(d => d.name === entry.name)})`}
                          r={entry.size / 2}
                        />
                      ))}
                      {showLabels && <LabelList dataKey="name" position="center" fontSize={10} />}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                
                {/* Quadrant Labels */}
                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg">
                  QUICK WIN
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg">
                  STRATEGIC BET
                </div>
                <div className="absolute bottom-4 left-4 bg-amber-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg">
                  EXPERIMENTAL
                </div>
                <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg">
                  WATCHLIST
                </div>
              </div>
            </div>

            {/* Quadrant Filter & Insights Panel */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-lg">Strategic Quadrants</h4>
              
              <QuadrantCard
                name="Quick Win"
                count={quadrantStats['Quick Win']}
                color="#10B981"
                description="High impact, low effort initiatives ready for immediate execution."
                recommendation="Prioritize for Q1 deployment"
              />
              
              <QuadrantCard
                name="Strategic Bet"
                count={quadrantStats['Strategic Bet']}
                color="#3B82F6"
                description="High-value, complex initiatives requiring strategic investment."
                recommendation="Plan for 12-18 month roadmap"
              />
              
              <QuadrantCard
                name="Experimental"
                count={quadrantStats['Experimental']}
                color="#F59E0B"
                description="Low-risk learning opportunities for capability building."
                recommendation="Allocate 10-15% of resources"
              />
              
              <QuadrantCard
                name="Watchlist"
                count={quadrantStats['Watchlist']}
                color="#EF4444"
                description="High-effort, low-impact initiatives requiring review."
                recommendation="Re-evaluate or discontinue"
              />
              
              {/* Executive Action Items */}
              <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                <CardContent className="p-4">
                  <h5 className="font-bold text-indigo-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Executive Actions
                  </h5>
                  <div className="space-y-2 text-sm">
                    {quadrantStats['Quick Win'] > 0 && (
                      <div className="text-emerald-700">
                        • Execute {quadrantStats['Quick Win']} Quick Wins immediately
                      </div>
                    )}
                    {quadrantStats['Strategic Bet'] > 0 && (
                      <div className="text-blue-700">
                        • Secure funding for {quadrantStats['Strategic Bet']} strategic bets
                      </div>
                    )}
                    {quadrantStats['Watchlist'] > 0 && (
                      <div className="text-red-700">
                        • Review {quadrantStats['Watchlist']} underperforming initiatives
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}