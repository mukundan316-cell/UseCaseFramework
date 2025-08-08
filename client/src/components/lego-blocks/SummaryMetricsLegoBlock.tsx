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
        <p className="text-gray-600">
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
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        
        {/* Total Use Cases */}
        <MetricCard
          icon={BarChart3}
          label="Total Use Cases"
          value={filteredUseCases.length}
          subtitle="In current view"
        />

        {/* New This Month */}
        <MetricCard
          icon={Calendar}
          label="New This Month"
          value={newThisMonth}
          subtitle="Recently added"
          color="#059669"
        />

        {/* Quick Win Count */}
        <MetricCard
          icon={Zap}
          label="Quick Win"
          value={quadrantCounts['Quick Win'] || 0}
          subtitle="High impact, low effort"
          onClick={() => handleQuadrantFilter('Quick Win')}
          isActive={filters.quadrant === 'Quick Win'}
          color="#059669"
        />

        {/* Strategic Bet Count */}
        <MetricCard
          icon={Target}
          label="Strategic Bet"
          value={quadrantCounts['Strategic Bet'] || 0}
          subtitle="High impact, high effort"
          onClick={() => handleQuadrantFilter('Strategic Bet')}
          isActive={filters.quadrant === 'Strategic Bet'}
          color="#DC2626"
        />

        {/* Experimental Count */}
        <MetricCard
          icon={Sparkles}
          label="Experimental"
          value={quadrantCounts['Experimental'] || 0}
          subtitle="Low impact, low effort"
          onClick={() => handleQuadrantFilter('Experimental')}
          isActive={filters.quadrant === 'Experimental'}
          color="#7C3AED"
        />

        {/* Watchlist Count */}
        <MetricCard
          icon={Users}
          label="Watchlist"
          value={quadrantCounts['Watchlist'] || 0}
          subtitle="Low impact, high effort"
          onClick={() => handleQuadrantFilter('Watchlist')}
          isActive={filters.quadrant === 'Watchlist'}
          color="#9CA3AF"
        />

      </div>

      {/* Average Scores Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        
        {/* Average Impact Score */}
        <MetricCard
          icon={TrendingUp}
          label="Average Impact Score"
          value={averageImpact.toFixed(1)}
          subtitle="Business value potential"
          color="#F59E0B"
        />

        {/* Average Effort Score */}
        <MetricCard
          icon={Award}
          label="Average Effort Score"
          value={averageEffort.toFixed(1)}
          subtitle="Implementation complexity"
          color="#EF4444"
        />

      </div>
    </div>
  );
}