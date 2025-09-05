import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  ReferenceLine, Cell, LabelList
} from 'recharts';
import { 
  Target, Filter, ZoomIn, RotateCcw, TrendingUp, Award,
  AlertTriangle, Sparkles, Users, DollarSign, HelpCircle, Info, Table, BarChart3, Eye
} from 'lucide-react';
import { useUseCases } from '../../contexts/UseCaseContext';
import { getEffectiveQuadrant, getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';
import { APP_CONFIG } from '@shared/constants/app-config';
import { calculateTShirtSize } from '@shared/calculations';
import PortfolioTableView from './PortfolioTableView';

/**
 * Enhanced Matrix Plot for Executive Dashboard
 * Professional Gartner-style Magic Quadrant with executive insights
 */

export default function EnhancedMatrixPlot() {
  const { useCases, dashboardUseCases, metadata } = useUseCases();
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  // Dynamic bubble sizing based on business impact (RSA scoring alignment)
  function calculateBubbleSize(impactScore: number): number {
    const config = APP_CONFIG.EXECUTIVE_DASHBOARD.MATRIX_PLOT;
    const minSize = config.MIN_BUBBLE_SIZE;
    const maxSize = config.MAX_BUBBLE_SIZE;
    const maxScore = APP_CONFIG.SCORING.MAX_SCORE;
    
    // Enhanced scaling with exponential curve for better visual distinction
    const normalizedScore = Math.max(0, Math.min(maxScore, impactScore)) / maxScore;
    
    // Use moderate exponential scaling that's proportional to impact level
    const exponentialScale = Math.pow(normalizedScore, 1.3); // Reduced from 2 to 1.3 for more realistic scaling
    const calculatedSize = minSize + (exponentialScale * (maxSize - minSize));
    
    // Ensure minimum visual distinction and round for pixel-perfect rendering
    const finalSize = Math.max(minSize, Math.round(calculatedSize));
    
    return finalSize;
  }

  // Enhanced chart data with authentic database values (LEGO principle: reusable configuration)
  // useMemo to ensure proper recalculation when dashboardUseCases change
  const chartData = React.useMemo(() => {
    return dashboardUseCases.map(useCase => {
      const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
      const effectiveImpact = getEffectiveImpactScore(useCase as any);
      const effectiveEffort = getEffectiveEffortScore(useCase as any);
      
      // Dynamic bubble sizing based on business impact (aligned with RSA scoring framework)
      const bubbleSize = calculateBubbleSize(effectiveImpact);
      
      // Production ready - debug logs removed after bubble sizing verification
      
      return {
        id: useCase.id, // Add unique id for React key
        x: effectiveEffort,
        y: effectiveImpact,
        z: bubbleSize, // CRITICAL FIX: Use 'z' property instead of 'size' for Recharts ScatterChart
        name: useCase.title,
        quadrant: effectiveQuadrant,
        color: getQuadrantColor(effectiveQuadrant),
        gradientColor: getQuadrantGradient(effectiveQuadrant),
        size: bubbleSize, // Keep for backward compatibility
        useCase: useCase,
        lob: useCase.lineOfBusiness,
        segment: useCase.businessSegment,
        isHighValue: effectiveImpact >= APP_CONFIG.EXECUTIVE_DASHBOARD.MATRIX_PLOT.HIGH_VALUE_THRESHOLD,
        isLowEffort: effectiveEffort <= APP_CONFIG.EXECUTIVE_DASHBOARD.MATRIX_PLOT.LOW_EFFORT_THRESHOLD,
        impact: effectiveImpact,
        effort: effectiveEffort
      };
    });
  }, [dashboardUseCases]);

  // LEGO principle: Centralized configuration for consistent styling
  function getQuadrantColor(quadrant: string): string {
    const colors = APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.QUADRANTS;
    switch (quadrant) {
      case 'Quick Win': return colors.QUICK_WIN;
      case 'Strategic Bet': return colors.STRATEGIC_BET;
      case 'Experimental': return colors.EXPERIMENTAL;
      case 'Watchlist': return colors.WATCHLIST;
      default: return colors.DEFAULT;
    }
  }

  function getQuadrantGradient(quadrant: string): string {
    const baseColor = getQuadrantColor(quadrant);
    // Convert hex to rgba with transparency
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
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
  const avgImpact = totalUseCases > 0 ? (chartData.reduce((sum, d) => sum + d.impact, 0) / totalUseCases) : 0;

  const filteredData = selectedQuadrant 
    ? chartData.filter(d => d.quadrant === selectedQuadrant)
    : chartData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Calculate T-shirt sizing if available
      const tShirtConfig = metadata?.tShirtSizing;
      const sizing = tShirtConfig?.enabled 
        ? calculateTShirtSize(data.y, data.x, tShirtConfig)
        : null;

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
                <div className="text-xs text-gray-500 mt-1">
                  {data.y >= 4 ? "High Impact" : data.y >= 3 ? "Medium Impact" : "Low Impact"}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Implementation Effort:</span>
                <div className="text-lg font-bold text-amber-600">{data.x.toFixed(1)}/5</div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.x <= 2 ? "Low Effort" : data.x >= 4 ? "High Effort" : "Medium Effort"}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p><span className="font-medium">Strategic Position:</span> {data.quadrant}</p>
              <p><span className="font-medium">Business Unit:</span> {data.lob}</p>
              
              {/* T-shirt Sizing Information */}
              {sizing && sizing.size && !sizing.error ? (
                <>
                  <p><span className="font-medium">Project Size:</span> <span 
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ 
                      backgroundColor: tShirtConfig?.sizes.find((s: any) => s.name === sizing.size)?.color || '#6B7280' 
                    }}
                  >
                    {sizing.size}
                  </span></p>
                  {sizing.estimatedCostMin && sizing.estimatedCostMax && (
                    <p><span className="font-medium">Investment:</span> {formatCurrency(sizing.estimatedCostMin)} - {formatCurrency(sizing.estimatedCostMax)}</p>
                  )}
                  {sizing.estimatedWeeksMin && sizing.estimatedWeeksMax && (
                    <p><span className="font-medium">Timeline:</span> {formatDuration(sizing.estimatedWeeksMin)} - {formatDuration(sizing.estimatedWeeksMax)}</p>
                  )}
                  {sizing.teamSizeEstimate && (
                    <p><span className="font-medium">Team Size:</span> {sizing.teamSizeEstimate} people</p>
                  )}
                </>
              ) : (
                <>
                  <p><span className="font-medium">Impact/Effort Ratio:</span> {(data.y / Math.max(data.x, 0.1)).toFixed(1)}</p>
                  <p className="text-xs text-orange-600">Enable T-shirt sizing in Admin Panel for resource estimates</p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {data.isHighValue && (
                <div className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                  High-Value Initiative
                </div>
              )}
              {data.isLowEffort && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Quick Implementation
                </div>
              )}
              {sizing && sizing.size && data.y >= 4 && data.x <= 2 && (
                <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  High ROI Potential
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };



  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Executive Summary Dashboard with Help Tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{totalUseCases}</div>
                    <div className="text-sm text-blue-700">Total Initiatives</div>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Total number of AI use cases in your active portfolio. These represent all initiatives being evaluated for RSA implementation.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-2xl font-bold text-emerald-900">{highValueCount}</div>
                    <div className="text-sm text-emerald-700">High-Value Projects</div>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-emerald-400 hover:text-emerald-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Initiatives with Impact Score ≥ 4.0. These represent high business value opportunities that should be prioritized for implementation.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{lowEffortCount}</div>
                    <div className="text-sm text-amber-700">Low-Effort Wins</div>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-amber-400 hover:text-amber-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Initiatives with Effort Score ≤ 2.0. These are quick wins requiring minimal resources and can deliver fast results.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      {avgImpact.toFixed(1)}
                    </div>
                    <div className="text-sm text-purple-700">Avg Impact Score</div>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-purple-400 hover:text-purple-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Average business impact across your portfolio (1-5 scale). Higher scores indicate greater potential business value and ROI.</p>
                  </TooltipContent>
                </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-5 h-5 text-slate-300 hover:text-white cursor-help ml-2" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <div className="space-y-2">
                      <p className="font-semibold">Interactive Matrix Guide:</p>
                      <p>• <strong>X-axis:</strong> Implementation Effort (1-5 scale)</p>
                      <p>• <strong>Y-axis:</strong> Business Impact (1-5 scale)</p>
                      <p>• <strong>Bubble Size:</strong> Reflects impact magnitude</p>
                      <p>• <strong>ROI Categories:</strong> High (Impact≥4 & Effort≤2), Medium (Impact≥3 & Effort≤3), Standard (others)</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-slate-200 mt-2">
                Strategic portfolio positioning • Click quadrants to filter • Bubble size reflects business impact
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {/* View Toggle */}
              <div className="flex bg-white/10 rounded-md p-1">
                <Button
                  variant={viewMode === 'matrix' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('matrix')}
                  className={viewMode === 'matrix' 
                    ? "bg-white text-slate-900 hover:bg-white/90" 
                    : "text-white hover:bg-white/20"
                  }
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Matrix
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' 
                    ? "bg-white text-slate-900 hover:bg-white/90" 
                    : "text-white hover:bg-white/20"
                  }
                >
                  <Table className="w-4 h-4 mr-2" />
                  Table
                </Button>
              </div>
              
              {/* Unified Actions for both views */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'matrix') {
                    setShowLabels(!showLabels);
                  } else {
                    // For table view, we'll pass this to the table component
                    // For now, just show a simple toggle indication
                    setShowLabels(!showLabels);
                  }
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="button-toggle-details"
              >
                <Eye className="w-4 h-4 mr-2" />
                {viewMode === 'matrix' 
                  ? (showLabels ? 'Hide Details' : 'Show Details')
                  : (showLabels ? 'Hide Details' : 'Show Details')
                }
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'matrix') {
                    setSelectedQuadrant(null);
                  } else {
                    // For table view, we'll trigger a filter clear
                    // This will be handled by passing a ref or callback
                    window.dispatchEvent(new CustomEvent('clearTableFilters'));
                  }
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="button-clear-filters"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {viewMode === 'table' ? (
            <PortfolioTableView 
              useCases={dashboardUseCases} 
              metadata={metadata}
              showDetails={showLabels}
            />
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Matrix Chart - Takes 4/5 of the space */}
            <div className="lg:col-span-4">
              <div className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <ResponsiveContainer width="100%" height={640}>
                  <ScatterChart 
                    data={filteredData}
                    margin={{ top: 50, right: 70, bottom: 70, left: 80 }}
                    key={`chart-${filteredData.length}-${filteredData.map(d => `${d.id}-${d.z}`).join('-')}`}
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
                      x={3.0} 
                      stroke="#9CA3AF" 
                      strokeDasharray="6 3" 
                      strokeWidth={1.5}
                    />
                    <ReferenceLine 
                      y={3.0} 
                      stroke="#9CA3AF" 
                      strokeDasharray="6 3" 
                      strokeWidth={1.5}
                    />
                    
                    {/* Enhanced Axes with Better Typography */}
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[0.5, 5.5]} 
                      name="Implementation Effort"
                      tickCount={6}
                      ticks={[1, 2, 3, 4, 5]}
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
                      domain={[0.5, 5.5]} 
                      name="Business Impact"
                      tickCount={6}
                      ticks={[1, 2, 3, 4, 5]}
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
                    
                    <RechartsTooltip content={<CustomTooltip />} />
                    
                    <Scatter 
                      dataKey="y" 
                      fill="#3B82F6"
                      shape={(props: any) => {
                        const { cx, cy, payload } = props;
                        // CRITICAL FIX: Use payload.z directly for dynamic sizing
                        const bubbleRadius = payload?.z || APP_CONFIG.EXECUTIVE_DASHBOARD.MATRIX_PLOT.DEFAULT_BUBBLE_SIZE;
                        const index = chartData.findIndex(d => d.id === payload?.id);
                        
                        // Bubble sizing optimized for subtle proportional visualization (3-8px range)
                        
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={bubbleRadius}
                            fill={`url(#bubble-gradient-${index})`}
                            stroke="white"
                            strokeWidth={2}
                            key={`bubble-${payload?.id}-${bubbleRadius}`}
                          />
                        );
                      }}
                    >
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Portfolio</h4>
                    <p className="text-xs text-gray-600 mt-1">Click to filter</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <div className="space-y-2">
                        <p className="font-semibold">Portfolio Quadrants:</p>
                        <p>• <strong className="text-emerald-600">Quick Win:</strong> High Impact, Low Effort - Execute immediately</p>
                        <p>• <strong className="text-blue-600">Strategic Bet:</strong> High Impact, High Effort - Long-term investment</p>
                        <p>• <strong className="text-amber-600">Experimental:</strong> Low Impact, Low Effort - Learning opportunities</p>
                        <p>• <strong className="text-red-600">Watchlist:</strong> Low Impact, High Effort - Deprioritize or redesign</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-3 h-3 text-gray-300 hover:text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                {name === 'Quick Win' && 'High impact, low effort initiatives. Perfect for immediate execution and quick ROI.'}
                                {name === 'Strategic Bet' && 'High impact, high effort initiatives. Major investments requiring significant resources but delivering substantial value.'}
                                {name === 'Experimental' && 'Low impact, low effort initiatives. Good for learning, prototyping, and building capabilities.'}
                                {name === 'Watchlist' && 'Low impact, high effort initiatives. Consider deprioritizing or redesigning to improve the value proposition.'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
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
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}