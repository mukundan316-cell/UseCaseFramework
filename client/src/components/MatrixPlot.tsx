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
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            RSA AI Value Use Case Framework
          </h2>
          <p className="text-gray-600">AI use case prioritization based on business value and implementation complexity</p>
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
          
          {/* Date stamp */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            As of August 2025 © RSA Insurance
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
                {chartData.map((entry, index) => (
                  <Scatter
                    key={index}
                    data={[entry]}
                    fill="#1E40AF"
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>


      </div>

      {/* Quadrant Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
