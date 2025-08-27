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

  // Enhanced chart data with sophisticated styling using authentic database values
  const chartData = dashboardUseCases.map(useCase => {
    const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
    const effectiveImpact = getEffectiveImpactScore(useCase as any);
    const effectiveEffort = getEffectiveEffortScore(useCase as any);
    
    // RCA Complete - ensuring prominent bubble visibility
    
    return {
      x: effectiveEffort,
      y: effectiveImpact,
      name: useCase.title,
      quadrant: effectiveQuadrant,
      color: getQuadrantColor(effectiveQuadrant),
      gradientColor: getQuadrantGradient(effectiveQuadrant),
      size: Math.max(150, 80 + (effectiveImpact * 20)), // Prominent bubble sizing for portfolio visibility
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
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Matrix Chart - Takes 4/5 of the space */}
            <div className="lg:col-span-4">
              <div className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <ResponsiveContainer width="100%" height={640}>
                  <ScatterChart 
                    data={filteredData}
                    margin={{ top: 50, right: 70, bottom: 70, left: 80 }}
                  >
                    <defs>
                      {chartData.map((entry, index) => (
                        <radialGradient key={`gradient-${index}`} id={`bubble-gradient-${index}`}>
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                          <stop offset="70%" stopColor={entry.gradientColor} stopOpacity={0.7} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.8} />
                        </radialGradient>
                      ))}
                    </defs>
                    
                    <CartesianGrid 
                      strokeDasharray="2 2" 
                      stroke="#F3F4F6" 
                      strokeWidth={1}
                    />
                    
                    {/* Enhanced Quadrant Reference Lines */}
                    <ReferenceLine 
                      x={2.5} 
                      stroke="#9CA3AF" 
                      strokeDasharray="6 3" 
                      strokeWidth={1.5}
                    />
                    <ReferenceLine 
                      y={2.5} 
                      stroke="#9CA3AF" 
                      strokeDasharray="6 3" 
                      strokeWidth={1.5}
                    />
                    
                    {/* Enhanced Axes with Better Typography */}
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[0.2, 4.8]} 
                      name="Implementation Effort"
                      tickCount={5}
                      tick={{ 
                        fontSize: 12, 
                        fill: '#6B7280', 
                        fontWeight: 500,
                        dy: 10
                      }}
                      axisLine={{ stroke: '#D1D5DB', strokeWidth: 1.5 }}
                      tickLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                      label={{ 
                        value: 'Implementation Effort', 
                        position: 'insideBottom', 
                        offset: -20,
                        style: { 
                          textAnchor: 'middle',
                          fontSize: '14px', 
                          fontWeight: '600', 
                          fill: '#374151' 
                        } 
                      }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={[0.2, 4.8]} 
                      name="Business Impact"
                      tickCount={5}
                      tick={{ 
                        fontSize: 12, 
                        fill: '#6B7280', 
                        fontWeight: 500,
                        dx: -10
                      }}
                      axisLine={{ stroke: '#D1D5DB', strokeWidth: 1.5 }}
                      tickLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                      label={{ 
                        value: 'Business Impact', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: 15,
                        style: { 
                          textAnchor: 'middle',
                          fontSize: '14px', 
                          fontWeight: '600', 
                          fill: '#374151' 
                        } 
                      }}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Scatter dataKey="y" fill="#3B82F6">
                      {filteredData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#bubble-gradient-${chartData.findIndex(d => d.name === entry.name)})`}
                          r={Math.max(60, Math.min(90, entry.size / 2.2))}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                      {showLabels && (
                        <LabelList 
                          dataKey="name" 
                          position="center" 
                          fontSize={11}
                          fill="#1F2937"
                          fontWeight="600"
                          stroke="white"
                          strokeWidth={2}
                          paintOrder="stroke"
                        />
                      )}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                
                {/* Modernized Quadrant Labels with Better Positioning */}
                <div className="absolute top-12 left-20 bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm tracking-wide shadow-lg uppercase">
                  Quick Win
                </div>
                <div className="absolute top-12 right-20 bg-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm tracking-wide shadow-lg uppercase">
                  Strategic Bet
                </div>
                <div className="absolute bottom-24 left-20 bg-amber-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm tracking-wide shadow-lg uppercase">
                  Experimental
                </div>
                <div className="absolute bottom-24 right-20 bg-red-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm tracking-wide shadow-lg uppercase">
                  Watchlist
                </div>
              </div>
            </div>

            {/* Compact Quadrant Summary Panel */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-bold text-gray-900 text-lg">Portfolio</h4>
                <p className="text-xs text-gray-600 mt-1">Click to filter</p>
              </div>
              
              {/* Compact Quadrant Indicators */}
              <div className="space-y-3">
                {Object.entries(quadrantStats).map(([name, count]) => {
                  const colors = {
                    'Quick Win': '#10B981',
                    'Strategic Bet': '#3B82F6', 
                    'Experimental': '#F59E0B',
                    'Watchlist': '#EF4444'
                  };
                  const color = colors[name as keyof typeof colors];
                  return (
                    <div 
                      key={name}
                      className={`cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                        selectedQuadrant === name 
                          ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md' 
                          : 'hover:shadow-sm hover:scale-[1.02] border-gray-200'
                      }`}
                      onClick={() => setSelectedQuadrant(selectedQuadrant === name ? null : name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-gray-900">{name}</span>
                        </div>
                        <div className="text-xl font-bold" style={{ color }}>
                          {count}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Portfolio</span>
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
                    </div>
                  );
                })}
              </div>

              {/* Compact Executive Actions */}
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 border-0 shadow-sm">
                <CardContent className="p-4">
                  <h5 className="font-bold text-indigo-900 mb-3 flex items-center text-sm">
                    <Target className="w-4 h-4 mr-2" />
                    Key Actions
                  </h5>
                  <div className="space-y-2 text-xs">
                    {quadrantStats['Quick Win'] > 0 && (
                      <div className="flex items-center text-emerald-700">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                        Execute {quadrantStats['Quick Win']} Quick Wins
                      </div>
                    )}
                    {quadrantStats['Strategic Bet'] > 0 && (
                      <div className="flex items-center text-blue-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Fund {quadrantStats['Strategic Bet']} Strategic Bets
                      </div>
                    )}
                    {quadrantStats['Experimental'] > 0 && (
                      <div className="flex items-center text-amber-700">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                        Pilot {quadrantStats['Experimental']} Experiments
                      </div>
                    )}
                    {quadrantStats['Watchlist'] > 0 && (
                      <div className="flex items-center text-red-700">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                        Review {quadrantStats['Watchlist']} Watchlist Items
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