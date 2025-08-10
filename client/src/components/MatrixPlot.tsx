import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUseCases } from '../contexts/UseCaseContext';
import { getQuadrantColor } from '../utils/calculations';

export default function MatrixPlot() {
  const { useCases, getQuadrantCounts, getAverageImpact, filters, setFilters } = useUseCases();

  const quadrantCounts = getQuadrantCounts();
  const averageImpact = getAverageImpact();

  // Transform data for scatter plot - properly balanced coordinates
  const chartData = useCases.map(useCase => ({
    x: useCase.effortScore, // Use effort score directly (low = left, high = right)
    y: useCase.impactScore, // Use impact score directly (low = bottom, high = top)
    name: useCase.title,
    quadrant: useCase.quadrant,
    color: getQuadrantColor(useCase.quadrant),
    useCase: useCase,
    isRecommended: !!useCase.recommendedByAssessment // Flag for recommendation highlighting
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const useCase = data.useCase;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Quadrant:</span> {useCase.quadrant}</p>
            <p><span className="font-medium">Impact:</span> {useCase.impactScore.toFixed(1)}</p>
            <p><span className="font-medium">Effort:</span> {useCase.effortScore.toFixed(1)}</p>
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
                  const size = entry.isRecommended ? 10 : 8;
                  const color = entry.isRecommended ? "#FFD700" : entry.color;
                  
                  return (
                    <Scatter
                      key={index}
                      data={[entry]}
                      fill={color}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return (
                          <g>
                            {/* Glow effect for recommended use cases */}
                            {entry.isRecommended && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={size + 3}
                                fill="#FFD700"
                                opacity={0.3}
                              />
                            )}
                            {/* Main circle */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={size}
                              fill={entry.color}
                              stroke={entry.isRecommended ? "#FFD700" : "#fff"}
                              strokeWidth={entry.isRecommended ? 3 : 2}
                            />
                            {/* Recommendation star */}
                            {entry.isRecommended && (
                              <text
                                x={cx + size - 3}
                                y={cy - size + 3}
                                fontSize="10"
                                fill="#FFD700"
                                textAnchor="middle"
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

      {/* Quadrant Legend */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Quadrant Guide</h3>
        
        {/* Complexity Scale */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">LOW Complexity/Effort</span>
            <span className="mx-4">←→</span>
            <span className="font-medium">HIGH Complexity/Effort</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>(Easy to do)</span>
            <span>(Hard to do)</span>
          </div>
        </div>

        {/* Quadrant Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Quick Win (Top Left) */}
          <QuadrantLegendItem
            color="#22C55E"
            title="QUICK WIN"
            subtitle="Easy + Valuable"
            description="High-value opportunities with lower complexity. Ideal for immediate implementation."
            count={quadrantCounts['Quick Win'] || 0}
          />
          
          {/* Strategic Bet (Top Right) */}
          <QuadrantLegendItem
            color="#3B82F6"
            title="STRATEGIC BET"
            subtitle="Hard + Valuable"
            description="High impact initiatives requiring significant investment. Prime candidates for strategic focus."
            count={quadrantCounts['Strategic Bet'] || 0}
          />
          
          {/* Experimental (Bottom Left) */}
          <QuadrantLegendItem
            color="#EAB308"
            title="EXPERIMENTAL"
            subtitle="Easy + Low Value"
            description="Low-complexity but limited value. Consider for innovation labs or R&D."
            count={quadrantCounts['Experimental'] || 0}
          />
          
          {/* Watchlist (Bottom Right) */}
          <QuadrantLegendItem
            color="#EF4444"
            title="WATCHLIST/AVOID"
            subtitle="Hard + Low Value"
            description="High-complexity with uncertain returns. Monitor for future potential or avoid."
            count={quadrantCounts['Watchlist'] || 0}
          />
        </div>

        {/* Impact Scale */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-sm text-gray-600 mb-1">
            <span className="font-medium mr-2">HIGH Impact</span>
            <span className="mx-2">↑</span>
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span className="mx-2">↓</span>
            <span className="font-medium ml-2">LOW Impact</span>
          </div>
        </div>
      </div>

    </div>
  );
}
