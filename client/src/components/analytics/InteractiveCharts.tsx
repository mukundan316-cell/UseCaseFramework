import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, PieChart, Pie, AreaChart, Area, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, Filter, Download, RotateCcw, ZoomIn,
  BarChart3, Target, AlertTriangle 
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * Interactive Charts for Executive Dashboard
 * Advanced visualization with drill-down and filtering capabilities
 */

interface InteractiveChartsProps {
  useCases: any[];
  onFilter?: (filters: any) => void;
  onExport?: (chartType: string) => void;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({ 
  useCases, 
  onFilter, 
  onExport 
}) => {
  const { formatCompact } = useCurrency();
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'bubble' | 'scatter' | 'heatmap'>('bubble');

  // Prepare data for advanced visualizations
  const activeUseCases = useCases.filter(uc => 
    uc.isActiveForRsa === true || uc.isActiveForRsa === 'true'
  );

  // Portfolio Performance Matrix (Bubble Chart)
  const portfolioMatrix = activeUseCases.map(uc => ({
    x: uc.manualEffortScore || uc.effortScore || 0,
    y: uc.manualImpactScore || uc.impactScore || 0,
    z: 60 + ((uc.manualImpactScore || uc.impactScore || 0) * 15), // Bubble size - increased for better visibility
    name: uc.title,
    quadrant: uc.quadrant,
    lob: uc.lineOfBusiness,
    segment: uc.businessSegment,
    color: getQuadrantColor(uc.quadrant),
    tShirtSize: (uc as any).tShirtSize,
    estimatedCost: (uc as any).estimatedCostMin && (uc as any).estimatedCostMax ? 
      `${formatCompact((uc as any).estimatedCostMin)}-${formatCompact((uc as any).estimatedCostMax)}` : null,
    estimatedWeeks: (uc as any).estimatedWeeksMin && (uc as any).estimatedWeeksMax ? 
      `${(uc as any).estimatedWeeksMin}-${(uc as any).estimatedWeeksMax} weeks` : null
  }));

  // Quadrant Distribution with Trend Analysis
  const quadrantTrends = [
    { name: 'Quick Win', current: portfolioMatrix.filter(p => p.quadrant === 'Quick Win').length, target: 8, color: '#22C55E' },
    { name: 'Strategic Bet', current: portfolioMatrix.filter(p => p.quadrant === 'Strategic Bet').length, target: 12, color: '#3B82F6' },
    { name: 'Experimental', current: portfolioMatrix.filter(p => p.quadrant === 'Experimental').length, target: 5, color: '#F59E0B' },
    { name: 'Watchlist', current: portfolioMatrix.filter(p => p.quadrant === 'Watchlist').length, target: 2, color: '#EF4444' }
  ];

  // Business Segment Performance
  const segmentPerformance = activeUseCases.reduce((acc, uc) => {
    const segment = uc.businessSegment || 'Unspecified';
    if (!acc[segment]) {
      acc[segment] = { 
        name: segment, 
        count: 0, 
        totalImpact: 0, 
        totalEffort: 0,
        efficiency: 0
      };
    }
    acc[segment].count++;
    acc[segment].totalImpact += (uc.manualImpactScore || uc.impactScore || 0);
    acc[segment].totalEffort += (uc.manualEffortScore || uc.effortScore || 0);
    acc[segment].efficiency = acc[segment].totalImpact / acc[segment].totalEffort || 0;
    return acc;
  }, {} as Record<string, any>);

  const segmentData = Object.values(segmentPerformance).map((seg: any) => ({
    ...seg,
    avgImpact: (seg.totalImpact / seg.count).toFixed(1),
    avgEffort: (seg.totalEffort / seg.count).toFixed(1)
  }));

  function getQuadrantColor(quadrant: string): string {
    switch (quadrant) {
      case 'Quick Win': return '#22C55E';
      case 'Strategic Bet': return '#3B82F6';
      case 'Experimental': return '#F59E0B';
      case 'Watchlist': return '#EF4444';
      default: return '#6B7280';
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <h4 className="font-semibold text-gray-900 mb-2">{data.name}</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Impact Score:</span> {data.y}/5</p>
            <p><span className="font-medium">Effort Score:</span> {data.x}/5</p>
            <p><span className="font-medium">Quadrant:</span> {data.quadrant}</p>
            {data.tShirtSize && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Project Size:</span>
                <span 
                  className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: 
                    data.tShirtSize === 'XS' ? '#10B981' : 
                    data.tShirtSize === 'S' ? '#3B82F6' : 
                    data.tShirtSize === 'M' ? '#F59E0B' : 
                    data.tShirtSize === 'L' ? '#EF4444' : 
                    data.tShirtSize === 'XL' ? '#8B5CF6' : '#6B7280' 
                  }}
                >
                  {data.tShirtSize}
                </span>
              </div>
            )}
            {data.estimatedCost && (
              <p><span className="font-medium">Estimated Cost:</span> {data.estimatedCost}</p>
            )}
            {data.estimatedWeeks && (
              <p><span className="font-medium">Timeline:</span> {data.estimatedWeeks}</p>
            )}
            <p><span className="font-medium">Line of Business:</span> {data.lob}</p>
            <p><span className="font-medium">Segment:</span> {data.segment}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleQuadrantFilter = (quadrant: string) => {
    const newFilter = selectedQuadrant === quadrant ? null : quadrant;
    setSelectedQuadrant(newFilter);
    onFilter?.(newFilter ? { quadrant: newFilter } : {});
  };

  return (
    <div className="space-y-8">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={chartView === 'bubble' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('bubble')}
          >
            <Target className="w-4 h-4 mr-2" />
            Portfolio Matrix
          </Button>
          <Button
            variant={chartView === 'scatter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('scatter')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance Analysis
          </Button>
          <Button
            variant={chartView === 'heatmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('heatmap')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risk Assessment
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onExport?.(chartView)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedQuadrant(null)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Interactive Portfolio Matrix */}
      {chartView === 'bubble' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Interactive Portfolio Value Matrix
            </CardTitle>
            <CardDescription>
              Click quadrants to filter • Bubble size represents impact magnitude
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-3">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={portfolioMatrix.filter(p => 
                    !selectedQuadrant || p.quadrant === selectedQuadrant
                  )}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[0, 5]} 
                      name="Implementation Effort"
                      tickCount={6}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={[0, 5]} 
                      name="Business Impact"
                      tickCount={6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Quadrant Reference Lines */}
                    <ReferenceLine x={2.5} stroke="#9CA3AF" strokeDasharray="5 5" />
                    <ReferenceLine y={2.5} stroke="#9CA3AF" strokeDasharray="5 5" />
                    
                    <Scatter dataKey="y" fill="#3B82F6">
                      {portfolioMatrix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} r={Math.max(25, Math.min(50, entry.z / 2.5))} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Quadrant Filter Panel */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Filter by Quadrant</h4>
                {quadrantTrends.map((quadrant) => (
                  <Card 
                    key={quadrant.name}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedQuadrant === quadrant.name 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleQuadrantFilter(quadrant.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{quadrant.name}</h5>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: quadrant.color }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{quadrant.current}</span>
                        <span className="text-xs text-gray-500">/ {quadrant.target} target</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((quadrant.current / quadrant.target) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((quadrant.current / quadrant.target) * 100, 100)}%`,
                              backgroundColor: quadrant.color 
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Analysis */}
      {chartView === 'scatter' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Business Segment Performance Analysis
            </CardTitle>
            <CardDescription>
              Efficiency comparison across business segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Use Cases" />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#EF4444" strokeWidth={3} name="Efficiency Ratio" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Heat Map */}
      {chartView === 'heatmap' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment & Resource Allocation
            </CardTitle>
            <CardDescription>
              Strategic resource allocation recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* High-Risk Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">High-Risk Initiatives</h4>
                <div className="space-y-3">
                  {portfolioMatrix
                    .filter(item => item.x >= 4)
                    .sort((a, b) => b.x - a.x)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.segment}</p>
                        </div>
                        <Badge variant="destructive">Risk: {item.x}/5</Badge>
                      </div>
                    ))}
                </div>
              </div>

              {/* High-Value Opportunities */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">High-Value Opportunities</h4>
                <div className="space-y-3">
                  {portfolioMatrix
                    .filter(item => item.y >= 4)
                    .sort((a, b) => b.y - a.y)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.segment}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Value: {item.y}/5</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveCharts;