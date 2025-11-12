import React, { useState } from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ScoringDashboardLegoBlock, { type ScoringData } from './ScoringDashboardLegoBlock';
import ReusableButton from './ReusableButton';

/**
 * Demo component showcasing ScoringDashboardLegoBlock with real API data
 * Demonstrates different configurations: full, compact, with/without gap analysis
 */
export default function ScoringDashboardDemo() {
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [showGapAnalysis, setShowGapAnalysis] = useState(true);

  // Mock response ID for demo - in real app this would come from user session
  const mockResponseId = '25b91961-6ba4-470a-b2c1-c0d0fa319093'; // From our test session

  // Fetch maturity scores from API
  const { 
    data: apiScores, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['maturity-scores', mockResponseId],
    queryFn: () => apiRequest(`/api/responses/${mockResponseId}/scores`),
    enabled: false, // Don't auto-fetch, let user trigger manually
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Transform API data to component format
  const transformedData: ScoringData | undefined = apiScores ? {
    overallScore: apiScores.overallAverage || 0,
    overallLevel: getMaturityLevel(apiScores.overallAverage || 0),
    overallPercentage: Math.round((apiScores.overallAverage || 0) * 20), // Convert 5-point scale to percentage
    totalResponses: Object.values(apiScores.averageScores || {}).reduce((sum: number, data: any) => sum + (data.count || 0), 0),
    completedAt: apiScores.completedAt || new Date().toISOString(),
    dimensionScores: Object.entries(apiScores.maturityLevels || {}).map(([category, data]: [string, any]) => ({
      category,
      score: data.average || 0,
      level: data.level || 'Initial',
      percentage: data.percentage || 0,
      description: getDescriptionForCategory(category)
    })),
    gapAnalysis: generateGapAnalysis(apiScores.maturityLevels || {})
  } : undefined;

  // Mock data for demonstration when API data is not available
  const mockScoringData: ScoringData = {
    overallScore: 3.2,
    overallLevel: 'Defined',
    overallPercentage: 64,
    totalResponses: 12,
    completedAt: new Date().toISOString(),
    dimensionScores: [
      {
        category: 'AI Strategy',
        score: 3.8,
        level: 'Managed',
        percentage: 76,
        description: 'Strong strategic vision with clear AI initiatives and governance'
      },
      {
        category: 'Data Management',
        score: 2.9,
        level: 'Defined',
        percentage: 58,
        description: 'Basic data infrastructure in place, needs quality improvements'
      },
      {
        category: 'Technology Infrastructure',
        score: 3.1,
        level: 'Defined',
        percentage: 62,
        description: 'Adequate technical capabilities with room for scaling'
      },
      {
        category: 'Talent & Skills',
        score: 2.6,
        level: 'Repeatable',
        percentage: 52,
        description: 'Limited AI expertise, significant training needs identified'
      },
      {
        category: 'Risk & Ethics',
        score: 3.5,
        level: 'Defined',
        percentage: 70,
        description: 'Basic governance frameworks established, monitoring in progress'
      }
    ],
    gapAnalysis: {
      strengths: [
        'Clear AI strategy and leadership buy-in',
        'Strong risk management awareness',
        'Established governance frameworks',
        'Good stakeholder engagement'
      ],
      improvements: [
        'Enhance data quality and accessibility',
        'Improve technical infrastructure scalability',
        'Develop internal AI capabilities',
        'Strengthen change management processes'
      ],
      criticalGaps: [
        'Limited AI talent and expertise',
        'Insufficient data quality standards',
        'Lack of advanced analytics capabilities',
        'Need for comprehensive training programs'
      ]
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-[#3C2CDA]" />
            <span>Scoring Dashboard LEGO Block Demo</span>
          </CardTitle>
          <CardDescription className="text-lg">
            Reusable component for displaying AI maturity scores with different configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'full' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('full')}
                >
                  Full
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                >
                  Compact
                </Button>
              </div>
            </div>

            {/* Gap Analysis Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Gap Analysis:</span>
              <Button
                variant={showGapAnalysis ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGapAnalysis(!showGapAnalysis)}
              >
                {showGapAnalysis ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Fetch Real Data */}
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => refetch()}
              loading={isLoading}
              icon={RefreshCw}
              size="sm"
            >
              Fetch API Data
            </ReusableButton>
          </div>

          {/* API Status */}
          {error && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                API data not available - showing mock data for demonstration
              </p>
            </div>
          )}

          {apiScores && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Displaying real API data from assessment response
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Components */}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {viewMode === 'full' ? 'Full Dashboard View' : 'Compact Card View'}
          </h3>
          
          <ScoringDashboardLegoBlock
            data={transformedData || mockScoringData}
            isLoading={isLoading}
            compact={viewMode === 'compact'}
            showGapAnalysis={showGapAnalysis}
            title="AI Maturity Assessment Results"
            description="Comprehensive evaluation across key dimensions"
          />
        </div>

        {/* Different Context Examples */}
        {viewMode === 'compact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoringDashboardLegoBlock
              data={transformedData || mockScoringData}
              compact={true}
              showGapAnalysis={false}
              title="Current Score"
            />
            
            <ScoringDashboardLegoBlock
              data={undefined} // Empty state
              compact={true}
              showGapAnalysis={false}
              title="Team Assessment"
              description="No data available"
            />
            
            <ScoringDashboardLegoBlock
              isLoading={true}
              compact={true}
              showGapAnalysis={false}
              title="Loading State"
            />
          </div>
        )}
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Main Dashboard</h4>
                <code className="text-xs text-gray-600">
                  &lt;ScoringDashboardLegoBlock<br/>
                  &nbsp;&nbsp;data={`{scoringData}`}<br/>
                  &nbsp;&nbsp;showGapAnalysis={`{true}`}<br/>
                  /&gt;
                </code>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Sidebar Widget</h4>
                <code className="text-xs text-gray-600">
                  &lt;ScoringDashboardLegoBlock<br/>
                  &nbsp;&nbsp;data={`{scoringData}`}<br/>
                  &nbsp;&nbsp;compact={`{true}`}<br/>
                  &nbsp;&nbsp;showGapAnalysis={`{false}`}<br/>
                  /&gt;
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getMaturityLevel(score: number): string {
  if (score >= 4.5) return 'Optimized';
  if (score >= 3.5) return 'Managed';
  if (score >= 2.5) return 'Defined';
  if (score >= 1.5) return 'Repeatable';
  return 'Initial';
}

function getDescriptionForCategory(category: string): string {
  const descriptions: Record<string, string> = {
    'scale': 'Assessment of strategic alignment and maturity levels',
    'select': 'Evaluation of implementation capabilities and readiness',
    'multi_choice': 'Analysis of governance and operational frameworks',
    'text': 'Qualitative insights and strategic considerations'
  };
  return descriptions[category] || 'Comprehensive evaluation of capabilities and maturity';
}

function generateGapAnalysis(maturityLevels: Record<string, any>) {
  const levels = Object.values(maturityLevels);
  const avgPercentage = levels.reduce((sum: number, level: any) => sum + (level.percentage || 0), 0) / levels.length;
  
  return {
    strengths: [
      'Clear assessment methodology established',
      'Structured evaluation framework in place',
      'Systematic scoring and tracking capabilities',
      'Regular monitoring and review processes'
    ],
    improvements: [
      'Enhance cross-functional collaboration',
      'Improve data collection and analysis',
      'Strengthen capability development programs',
      'Increase stakeholder engagement'
    ],
    criticalGaps: avgPercentage < 60 ? [
      'Significant capability gaps identified',
      'Need for comprehensive improvement strategy',
      'Require additional resource allocation',
      'Critical skill development requirements'
    ] : [
      'Minor optimization opportunities',
      'Fine-tuning of existing processes',
      'Enhanced monitoring capabilities needed',
      'Advanced analytics implementation'
    ]
  };
}