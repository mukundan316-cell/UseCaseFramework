import React from 'react';
import { BarChart3, Target, TrendingUp, Sparkles, Users, Award, Zap, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUseCases } from '../../contexts/UseCaseContext';

/**
 * LEGO Block: Summary Metrics Display
 * Reusable metrics component with clickable filters for matrix interaction
 * Follows RSA branding with #005DAA blue accents and database-first queries
 */
export default function SummaryMetricsLegoBlock() {
  const { 
    getFilteredUseCases, 
    getQuadrantCounts, 
    getAverageImpact, 
    getAverageEffort,
    getNewThisMonthCount,
    setFilters,
    filters 
  } = useUseCases();

  const filteredUseCases = getFilteredUseCases();
  const quadrantCounts = getQuadrantCounts();
  const averageImpact = getAverageImpact();
  const averageEffort = getAverageEffort();
  const newThisMonth = getNewThisMonthCount();

  // Metric click handlers for matrix filtering
  const handleQuadrantFilter = (quadrant: string) => {
    setFilters({ quadrant: filters.quadrant === quadrant ? '' : quadrant });
  };

  const clearAllFilters = () => {
    setFilters({ 
      search: '', 
      process: '', 
      lineOfBusiness: '', 
      businessSegment: '', 
      geography: '', 
      useCaseType: '', 
      activity: '', 
      quadrant: '' 
    });
  };

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subtitle, 
    onClick,
    isActive = false,
    color = '#005DAA'
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    onClick?: () => void;
    isActive?: boolean;
    color?: string;
  }) => (
    <Card 
      className={`
        cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${isActive ? 'ring-2 ring-[#005DAA] bg-blue-50' : 'hover:ring-1 hover:ring-[#005DAA]/30'}
        ${onClick ? 'hover:bg-blue-50/50' : ''}
      `}
      onClick={onClick}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, #005DAA10 0%, #005DAA05 100%)'
          : undefined
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                border: `1px solid ${color}20`
              }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {onClick && (
            <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to filter
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Overview</h2>
        <p className="text-gray-600 mb-3">
          Current metrics across {filteredUseCases.length} use cases
          {filters.quadrant || filters.search || filters.process ? (
            <button 
              onClick={clearAllFilters}
              className="ml-2 text-[#005DAA] hover:text-[#005DAA]/80 underline text-sm"
            >
              (clear filters)
            </button>
          ) : null}
        </p>
        
        {/* Complexity and Impact Scale Indicators */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            <span className="mr-2">Effort/Complexity:</span>
            <span className="text-xs">Easy</span>
            <span className="mx-2">←→</span>
            <span className="text-xs">Hard</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Impact/Value:</span>
            <span className="text-xs">Low</span>
            <span className="mx-2">↑↓</span>
            <span className="text-xs">High</span>
          </div>
        </div>
      </div>

      {/* Quadrant Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        {/* Quick Win */}
        <Card 
          className={`
            cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-t-4 border-t-green-500
            ${filters.quadrant === 'Quick Win' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:ring-1 hover:ring-green-500/30'}
          `}
          onClick={() => handleQuadrantFilter('Quick Win')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{quadrantCounts['Quick Win'] || 0}</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Quick Win</h3>
            <p className="text-xs text-gray-600 mb-2 font-medium">Easy + Valuable</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              High-value opportunities with lower complexity. Ideal for immediate implementation.
            </div>
            <div className="mt-2 text-xs text-green-600 font-medium">
              Low Effort • High Impact
            </div>
          </CardContent>
        </Card>

        {/* Strategic Bet */}
        <Card 
          className={`
            cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-t-4 border-t-blue-500
            ${filters.quadrant === 'Strategic Bet' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:ring-1 hover:ring-blue-500/30'}
          `}
          onClick={() => handleQuadrantFilter('Strategic Bet')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{quadrantCounts['Strategic Bet'] || 0}</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Strategic Bet</h3>
            <p className="text-xs text-gray-600 mb-2 font-medium">Hard + Valuable</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              High impact initiatives requiring significant investment. Prime candidates for strategic focus.
            </div>
            <div className="mt-2 text-xs text-blue-600 font-medium">
              High Effort • High Impact
            </div>
          </CardContent>
        </Card>

        {/* Experimental */}
        <Card 
          className={`
            cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-t-4 border-t-yellow-500
            ${filters.quadrant === 'Experimental' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:ring-1 hover:ring-yellow-500/30'}
          `}
          onClick={() => handleQuadrantFilter('Experimental')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{quadrantCounts['Experimental'] || 0}</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Experimental</h3>
            <p className="text-xs text-gray-600 mb-2 font-medium">Easy + Low Value</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              Low-complexity but limited value. Consider for innovation labs or R&D.
            </div>
            <div className="mt-2 text-xs text-yellow-600 font-medium">
              Low Effort • Low Impact
            </div>
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card 
          className={`
            cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-t-4 border-t-red-500
            ${filters.quadrant === 'Watchlist' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:ring-1 hover:ring-red-500/30'}
          `}
          onClick={() => handleQuadrantFilter('Watchlist')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{quadrantCounts['Watchlist'] || 0}</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Watchlist</h3>
            <p className="text-xs text-gray-600 mb-2 font-medium">Hard + Low Value</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              High-complexity with uncertain returns. Monitor for future potential or avoid.
            </div>
            <div className="mt-2 text-xs text-red-600 font-medium">
              High Effort • Low Impact
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}