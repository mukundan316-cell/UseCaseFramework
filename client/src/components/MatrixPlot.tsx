import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUseCases } from '../contexts/UseCaseContext';
import { getQuadrantColor } from '../utils/calculations';

export default function MatrixPlot() {
  const { useCases, getQuadrantCounts, getAverageImpact } = useUseCases();

  const quadrantCounts = getQuadrantCounts();
  const averageImpact = getAverageImpact();

  // Transform data for scatter plot - properly balanced coordinates
  const chartData = useCases.map(useCase => ({
    x: useCase.effortScore, // Use effort score directly (low = left, high = right)
    y: useCase.impactScore, // Use impact score directly (low = bottom, high = top)
    name: useCase.title,
    quadrant: useCase.quadrant,
    color: getQuadrantColor(useCase.quadrant),
    useCase: useCase
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
    count 
  }: { 
    color: string; 
    title: string; 
    subtitle: string; 
    count: number;
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
        <div>
          <div className="font-bold text-lg text-gray-900 mb-1">{title}</div>
          <div className="text-sm text-gray-600 leading-relaxed">{subtitle}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="matrix-container p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Impact vs Effort Matrix
          </h2>
          <p className="text-gray-600 text-lg">Visual prioritization of AI use cases across quadrants</p>
        </div>
        
        {/* Matrix Chart with Quadrant Backgrounds */}
        <div className="h-96 w-full matrix-grid relative">
          {/* Quadrant Background Colors */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0 rounded-lg overflow-hidden" style={{ margin: '60px 50px' }}>
            {/* Top Left - Quick Win (Green) */}
            <div className="bg-green-50/70 border-r border-b border-gray-200"></div>
            {/* Top Right - Strategic Bet (Blue) */}
            <div className="bg-blue-50/70 border-b border-gray-200"></div>
            {/* Bottom Left - Experimental (Yellow) */}
            <div className="bg-yellow-50/70 border-r border-gray-200"></div>
            {/* Bottom Right - Watchlist (Red) */}
            <div className="bg-red-50/70"></div>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 30, right: 50, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeWidth={1} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  tickCount={5}
                  label={{ value: 'Complexity (Low → High)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '12px', fill: '#64748b' } }}
                  axisLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  tickCount={5}
                  label={{ value: 'Business Impact', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px', fill: '#64748b' } }}
                  axisLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <ReferenceLine x={3} stroke="#005DAA" strokeWidth={2} strokeOpacity={0.7} />
                <ReferenceLine y={3} stroke="#005DAA" strokeWidth={2} strokeOpacity={0.7} />
                <Tooltip content={<CustomTooltip />} />
                {chartData.map((entry, index) => (
                  <Scatter
                    key={index}
                    data={[entry]}
                    fill={entry.color}
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

        {/* Quadrant Labels - Positioned like a proper 2x2 matrix */}
        <div className="relative mt-8 h-24">
          <div className="absolute top-0 left-0 w-1/2 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-green-700 font-semibold">Prioritise</span>
              <div className="text-xs text-green-600 mt-1">Low hanging fruits</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 text-center pl-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-blue-700 font-semibold">Investigate</span>
              <div className="text-xs text-blue-600 mt-1">The Gems</div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-1/2 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <span className="text-yellow-700 font-semibold">Consider</span>
              <div className="text-xs text-yellow-600 mt-1">The possibility</div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-1/2 text-center pl-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-red-700 font-semibold">Avoid</span>
              <div className="text-xs text-red-600 mt-1">The Trouble</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quadrant Legend */}
      <div className="quadrant-legend">
        <QuadrantLegendItem
          color="#22C55E"
          title="Quick Win"
          subtitle="High Impact, Low Effort"
          count={quadrantCounts["Quick Win"]}
        />
        <QuadrantLegendItem
          color="#3B82F6"
          title="Strategic Bet"
          subtitle="High Impact, High Effort"
          count={quadrantCounts["Strategic Bet"]}
        />
        <QuadrantLegendItem
          color="#EAB308"
          title="Experimental"
          subtitle="Low Impact, Low Effort"
          count={quadrantCounts["Experimental"]}
        />
        <QuadrantLegendItem
          color="#EF4444"
          title="Watchlist"
          subtitle="Low Impact, High Effort"
          count={quadrantCounts["Watchlist"]}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="futuristic-card p-6 floating-element">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Use Cases</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center pulse-glow">
              <span className="text-white text-lg">📊</span>
            </div>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {useCases.length}
          </div>
          <p className="text-sm text-gray-600">Across all quadrants</p>
        </div>
        
        <div className="futuristic-card p-6 floating-element" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">High Priority</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center pulse-glow">
              <span className="text-white text-lg">⭐</span>
            </div>
          </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {quadrantCounts["Quick Win"]}
            </div>
            <p className="text-sm text-gray-600">Quick wins identified</p>
        </div>
        
        <div className="futuristic-card p-6 floating-element" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Avg Impact</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center pulse-glow">
              <span className="text-white text-lg">📈</span>
            </div>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {averageImpact}
          </div>
          <p className="text-sm text-gray-600">Overall portfolio</p>
        </div>
      </div>
    </div>
  );
}
