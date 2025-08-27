import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUseCases } from '../contexts/UseCaseContext';
import { getQuadrantColor } from '../utils/calculations';
import { getEffectiveQuadrant, getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';

export default function MatrixPlot() {
  const { useCases, dashboardUseCases, getQuadrantCounts, getAverageImpact, filters, setFilters } = useUseCases();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const quadrantCounts = getQuadrantCounts();
  const averageImpact = getAverageImpact();

  // Transform data for scatter plot - properly balanced coordinates
  const chartData = dashboardUseCases.map(useCase => {
    const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
    const effectiveImpact = getEffectiveImpactScore(useCase as any);
    const effectiveEffort = getEffectiveEffortScore(useCase as any);
    return {
      x: effectiveEffort, // Use effective effort score (manual override or calculated)
      y: effectiveImpact, // Use effective impact score (manual override or calculated)
      name: useCase.title,
      quadrant: effectiveQuadrant,
      color: getQuadrantColor(effectiveQuadrant as any),
      useCase: useCase,
      isRecommended: !!useCase.recommendedByAssessment // Flag for recommendation highlighting
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const useCase = data.useCase;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Quadrant:</span> {getEffectiveQuadrant(useCase as any)}</p>
            <p><span className="font-medium">Impact:</span> {getEffectiveImpactScore(useCase as any).toFixed(1)}</p>
            <p><span className="font-medium">Effort:</span> {getEffectiveEffortScore(useCase as any).toFixed(1)}</p>
            <p><span className="font-medium">Component:</span> {useCase.valueChainComponent}</p>
            <p><span className="font-medium">LOB:</span> {useCase.lineOfBusiness}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const QuadrantLegendItem = ({ 
    color, 
    title, 
    subtitle, 
    count,
    description 
  }: { 
    color: string; 
    title: string; 
    subtitle: string; 
    count: number;
    description?: string;
  }) => (
    <div 
      className="quadrant-item group hover:scale-105 transition-all duration-300"
      style={{ '--quadrant-color': color } as React.CSSProperties}
    >
      <div className="flex flex-col items-center space-y-3">
        <div 
          className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            boxShadow: `0 4px 20px ${color}40`
          }}
        >
          {count}
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-gray-900 mb-1">{title}</div>
          <div className="text-sm text-gray-600 mb-2 font-medium">{subtitle}</div>
          {description && (
            <div className="text-xs text-gray-500 leading-relaxed">{description}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="matrix-container p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            RSA AI Use Case Value Framework
          </h2>
          <p className="text-gray-600 mb-2">AI Strategy & Prioritization Platform</p>
          <p className="text-sm text-gray-500">As of August 2025 © RSA Insurance</p>
        </div>
        
        {/* Gartner-Style Magic Quadrant */}
        <div className="bg-white border-2 border-gray-800 relative mx-auto" style={{ width: '700px', height: '500px' }}>
          {/* Quadrant Labels - RSA Framework Style */}
          <div className="absolute top-2 left-4 bg-gray-400 text-white px-3 py-1 text-sm font-semibold">
            QUICK WIN
          </div>
          <div className="absolute top-2 right-4 bg-gray-400 text-white px-3 py-1 text-sm font-semibold">
            STRATEGIC BET
          </div>
          <div className="absolute bottom-2 left-4 bg-gray-400 text-white px-3 py-1 text-sm font-semibold">
            EXPERIMENTAL
          </div>
          <div className="absolute bottom-2 right-4 bg-gray-400 text-white px-3 py-1 text-sm font-semibold">
            WATCHLIST
          </div>

          {/* Axis Labels */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-700">
            BUSINESS VALUE
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700 pb-2">
            IMPLEMENTATION COMPLEXITY
          </div>
          


          {/* Grid Lines */}
          <div className="absolute inset-0" style={{ margin: '40px 40px 50px 50px' }}>
            {/* Vertical center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 -translate-x-0.5"></div>
            {/* Horizontal center line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600 -translate-y-0.5"></div>
            
            {/* Light grid lines */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-300"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-300"></div>
            <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-300"></div>
            <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-300"></div>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 40, bottom: 50, left: 50 }}>
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[1, 5]} 
                  hide={true}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[1, 5]} 
                  hide={true}
                />

                <Tooltip content={<CustomTooltip />} />
                {chartData.map((entry, index) => {
                  // ULTRA PROMINENT BUBBLES - MAXIMUM MATRIX VISIBILITY
                  const baseSize = 60; // ULTRA LARGE for matrix prominence
                  const recommendedSize = 70; // MASSIVE for recommended items
                  const isHovered = hoveredIndex === index;
                  const size = entry.isRecommended ? recommendedSize : baseSize;
                  const hoverSize = isHovered ? size + 10 : size;
                  const color = entry.isRecommended ? "#FFD700" : entry.color;
                  
                  return (
                    <Scatter
                      key={index}
                      data={[entry]}
                      fill={color}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return (
                          <g 
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Enhanced shadow effect for depth */}
                            <circle
                              cx={cx + 4}
                              cy={cy + 4}
                              r={hoverSize}
                              fill="rgba(0, 0, 0, 0.35)"
                              opacity={isHovered ? 0.8 : 0.5}
                            />
                            
                            {/* Glow effect for recommended use cases or hover */}
                            {(entry.isRecommended || isHovered) && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={hoverSize + 16}
                                fill={entry.isRecommended ? "#FFD700" : entry.color}
                                opacity={isHovered ? 0.5 : 0.3}
                              />
                            )}
                            
                            {/* Outer ring for better definition */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={hoverSize + 3}
                              fill="rgba(255, 255, 255, 0.98)"
                              stroke="none"
                            />
                            
                            {/* Main circle with enhanced styling for matrix prominence */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={hoverSize}
                              fill={entry.color}
                              stroke={entry.isRecommended ? "#FFD700" : "#FFFFFF"}
                              strokeWidth={entry.isRecommended ? 8 : (isHovered ? 7 : 6)}
                              style={{
                                filter: isHovered 
                                  ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' 
                                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                transition: 'all 0.2s ease-in-out'
                              }}
                            />
                            
                            {/* Inner highlight for glossy effect */}
                            <circle
                              cx={cx - hoverSize/3}
                              cy={cy - hoverSize/3}
                              r={hoverSize/2.5}
                              fill="rgba(255, 255, 255, 0.5)"
                              stroke="none"
                            />
                            
                            {/* Recommendation star with better positioning */}
                            {entry.isRecommended && (
                              <text
                                x={cx + hoverSize - 8}
                                y={cy - hoverSize + 12}
                                fontSize="20"
                                fill="#FFD700"
                                textAnchor="middle"
                                style={{
                                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                                  fontWeight: 'bold'
                                }}
                              >
                                ★
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendation Info */}
          {useCases.some(useCase => !!useCase.recommendedByAssessment) && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600 text-lg">⭐</span>
                <h4 className="font-semibold text-yellow-800">Assessment Recommendations</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Use cases with gold borders and stars are recommended based on completed assessments.
              </p>
              <button
                onClick={() => setFilters({ showRecommendations: !filters.showRecommendations })}
                className="text-sm px-3 py-1 rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition-colors"
              >
                {filters.showRecommendations ? 'Show All Use Cases' : 'Show Recommendations Only'}
              </button>
            </div>
          )}
      </div>



    </div>
  );
}
