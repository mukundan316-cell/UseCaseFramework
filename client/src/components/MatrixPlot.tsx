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
    <Card className={`border-2`} style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
      <CardContent className="p-4 text-center">
        <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: color }}></div>
        <div className="font-semibold" style={{ color: color }}>{title}</div>
        <div className="text-xs text-gray-600 mb-1">{subtitle}</div>
        <div className="text-lg font-bold text-gray-900">{count}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Impact vs Effort Matrix</CardTitle>
          <CardDescription>Visual prioritization of AI use cases across quadrants</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Matrix Chart */}
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
                <Scatter 
                  data={chartData} 
                  fill={(entry: any) => entry.color}
                />
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
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="text-left">Bottom Left: Experimental</div>
            <div className="text-right">Bottom Right: Watchlist</div>
            <div className="text-left">Top Left: Quick Win</div>
            <div className="text-right">Top Right: Strategic Bet</div>
          </div>
        </CardContent>
      </Card>

      {/* Quadrant Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Use Cases</h3>
              <div className="w-8 h-8 bg-rsa-blue rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{useCases.length}</div>
            <p className="text-sm text-gray-600">Across all quadrants</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">High Priority</h3>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⭐</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">{quadrantCounts["Quick Win"]}</div>
            <p className="text-sm text-gray-600">Quick wins identified</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Avg Impact</h3>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📈</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{averageImpact}</div>
            <p className="text-sm text-gray-600">Overall portfolio</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
