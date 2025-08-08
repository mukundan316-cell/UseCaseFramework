import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUseCases } from '../contexts/UseCaseContext';
import { getQuadrantColor } from '../utils/calculations';

export default function MatrixPlot() {
  const { useCases, getQuadrantCounts, getAverageImpact } = useUseCases();

  const quadrantCounts = getQuadrantCounts();
  const averageImpact = getAverageImpact();

  // Transform data for scatter plot
  const chartData = useCases.map(useCase => ({
    x: 6 - useCase.effortScore, // Invert effort score (lower effort = left side)
    y: useCase.impactScore,
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
        
        {/* Matrix Chart */}
        <div className="h-96 w-full matrix-grid relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 30, right: 50, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[1, 5]} 
                  label={{ value: 'Effort (Inverted)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[1, 5]} 
                  label={{ value: 'Impact', angle: -90, position: 'insideLeft' }}
                />
                <ReferenceLine x={3.25} stroke="#666" strokeDasharray="2 2" />
                <ReferenceLine y={4} stroke="#666" strokeDasharray="2 2" />
                <Tooltip content={<CustomTooltip />} />
                {chartData.map((entry, index) => (
                  <Scatter
                    key={index}
                    data={[entry]}
                    fill={entry.color}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

        {/* Quadrant Labels */}
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm text-gray-600 font-medium">
          <div className="text-left">Bottom Left: <span className="text-yellow-600">Experimental</span></div>
          <div className="text-right">Bottom Right: <span className="text-red-600">Watchlist</span></div>
          <div className="text-left">Top Left: <span className="text-green-600">Quick Win</span></div>
          <div className="text-right">Top Right: <span className="text-blue-600">Strategic Bet</span></div>
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
