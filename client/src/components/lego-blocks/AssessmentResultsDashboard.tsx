import React from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Star, 
  ArrowRight,
  BarChart3,
  Award,
  FileText,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import ScoringDashboardLegoBlock, { type ScoringData } from './ScoringDashboardLegoBlock';
import ResponseExportLegoBlock from './ResponseExportLegoBlock';
import ReusableButton from './ReusableButton';

interface AssessmentState {
  isCompleted: boolean;
  responseId?: string;
  totalScore?: number;
  maturityScores?: any;
  completedAt?: string;
  questionnaireId?: string;
}

interface AssessmentResultsDashboardProps {
  assessmentState?: AssessmentState;
  responseId?: string;
  onRetake?: () => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  impactScore?: number;
  effortScore?: number;
  quadrant?: string;
}

interface GapAnalysisItem {
  category: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: 'High' | 'Medium' | 'Low';
  recommendations: string[];
}

/**
 * Comprehensive Assessment Results Dashboard
 * Displays maturity scores, recommendations, gap analysis, and export functionality
 */
export default function AssessmentResultsDashboard({ 
  assessmentState, 
  responseId,
  onRetake 
}: AssessmentResultsDashboardProps) {
  // Use responseId if provided, otherwise fall back to assessmentState
  const actualResponseId = responseId || assessmentState?.responseId;
  
  // Fetch response data if responseId is provided
  const { data: responseData } = useQuery({
    queryKey: ['response', actualResponseId],
    queryFn: () => fetch(`/api/responses/${actualResponseId}`).then(res => res.json()),
    enabled: !!actualResponseId && !assessmentState
  });

  // Fetch maturity scores if responseId is provided  
  const { data: fetchedMaturityScores } = useQuery({
    queryKey: ['scores', actualResponseId],
    queryFn: () => fetch(`/api/responses/${actualResponseId}/scores`).then(res => res.json()),
    enabled: !!actualResponseId && !assessmentState
  });

  // Use fetched data or fallback to assessmentState
  const maturityScores = fetchedMaturityScores || assessmentState?.maturityScores;
  const totalScore = responseData?.totalScore || assessmentState?.totalScore || 0;
  const completedAt = responseData?.completedAt || assessmentState?.completedAt;

  // Fetch recommendations from API
  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: ['/api/use-cases'],
    select: (data: any[]) => data
      .filter(useCase => useCase.quadrant === 'Quick Win' || useCase.impactScore >= 3.5)
      .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
      .slice(0, 8)
      .map(useCase => ({
        id: useCase.id,
        title: useCase.title,
        description: useCase.description,
        priority: useCase.quadrant === 'Quick Win' ? 'High' : 
                 useCase.impactScore >= 4 ? 'High' : 
                 useCase.impactScore >= 3 ? 'Medium' : 'Low',
        category: useCase.process || useCase.processes?.[0] || 'General',
        impactScore: useCase.impactScore,
        effortScore: useCase.effortScore,
        quadrant: useCase.quadrant
      }))
  });

  // Transform maturity scores data for ScoringDashboardLegoBlock
  const scoringData: ScoringData | undefined = maturityScores ? {
    overallScore: maturityScores.overallAverage || 0,
    overallLevel: getMaturityLevel(maturityScores.overallAverage || 0),
    overallPercentage: Math.round((maturityScores.overallAverage || 0) * 20),
    totalResponses: Object.values(maturityScores.averageScores || {}).reduce((sum: number, data: any) => sum + (data.count || 0), 0),
    completedAt: completedAt || new Date().toISOString(),
    dimensionScores: Object.entries(maturityScores.maturityLevels || {}).map(([category, data]: [string, any]) => ({
      category,
      score: data.average || 0,
      level: data.level || 'Initial',
      percentage: data.percentage || 0,
      description: getDescriptionForCategory(category)
    })),
    gapAnalysis: {
      strengths: ['Assessment completed successfully', 'Structured evaluation framework'],
      improvements: ['Focus on identified gaps', 'Implement recommended actions'],
      criticalGaps: Object.entries(maturityScores.maturityLevels || {})
        .filter(([_, data]: [string, any]) => (data.percentage || 0) < 60)
        .map(([category]) => category)
    }
  } : undefined;

  // Generate gap analysis for detailed view
  const detailedGapAnalysis = maturityScores ? generateDetailedGapAnalysis(maturityScores.maturityLevels || {}) : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-green-800 mb-1">Assessment Complete!</CardTitle>
                <CardDescription className="text-green-700 text-lg">
                  Completed on {completedAt ? new Date(completedAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Recently'}
                </CardDescription>
                {scoringData && (
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                      Overall Score: {scoringData.overallPercentage}%
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                      Maturity Level: {scoringData.overallLevel}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Export Results */}
              {assessmentState.responseId && (
                <ResponseExportLegoBlock
                  responseId={assessmentState.responseId}
                  assessmentTitle="AI Maturity Assessment Results"
                  variant="outline"
                  size="default"
                />
              )}
              
              <ReusableButton
                rsaStyle="secondary"
                onClick={onRetake}
                className="text-sm"
              >
                Retake Assessment
              </ReusableButton>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Scoring Dashboard */}
      <ScoringDashboardLegoBlock
        data={scoringData ? { ...scoringData, responseId: assessmentState.responseId } : undefined}
        showGapAnalysis={true}
        title="AI Maturity Assessment Results"
        description="Comprehensive evaluation across key dimensions"
      />

      {/* Recommendations Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Priority Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Recommended AI Use Cases</span>
            </CardTitle>
            <CardDescription>
              High-impact use cases aligned with your current maturity level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.slice(0, 4).map((rec) => (
                <div key={rec.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">{rec.title}</h4>
                    <Badge 
                      className={cn(
                        "text-xs",
                        rec.priority === 'High' && "bg-red-100 text-red-800",
                        rec.priority === 'Medium' && "bg-yellow-100 text-yellow-800",
                        rec.priority === 'Low' && "bg-green-100 text-green-800"
                      )}
                    >
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>Category: {rec.category}</span>
                      {rec.quadrant && (
                        <Badge variant="outline" className="text-xs">
                          {rec.quadrant}
                        </Badge>
                      )}
                    </div>
                    {rec.impactScore && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Impact: {rec.impactScore.toFixed(1)}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No specific recommendations available yet.</p>
                <p className="text-sm">Complete your profile for personalized suggestions.</p>
              </div>
            )}
            
            {recommendations.length > 4 && (
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All {recommendations.length} Recommendations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-[#005DAA]" />
              <span>Gap Analysis</span>
            </CardTitle>
            <CardDescription>
              Areas for improvement to reach target maturity levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedGapAnalysis.length > 0 ? (
              detailedGapAnalysis.slice(0, 4).map((gap, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-800">{gap.category}</span>
                    <Badge 
                      className={cn(
                        "text-xs",
                        gap.priority === 'High' && "bg-red-100 text-red-800",
                        gap.priority === 'Medium' && "bg-yellow-100 text-yellow-800",
                        gap.priority === 'Low' && "bg-green-100 text-green-800"
                      )}
                    >
                      {gap.gap}% Gap
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Current: {gap.currentScore}%</span>
                      <span>Target: {gap.targetScore}%</span>
                    </div>
                    <Progress 
                      value={gap.currentScore} 
                      className="h-2"
                    />
                  </div>
                  
                  {gap.recommendations.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="text-xs text-blue-800 font-medium mb-1">Key Recommendation:</p>
                      <p className="text-xs text-blue-700">{gap.recommendations[0]}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Gap analysis will be available after assessment completion.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Steps Card */}
      <Card className="border-[#005DAA] bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#005DAA]">
            <Award className="h-5 w-5" />
            <span>Next Steps</span>
          </CardTitle>
          <CardDescription>
            Recommended actions to advance your AI maturity journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[#005DAA]" />
              <h4 className="font-semibold text-sm text-gray-800 mb-1">Export Results</h4>
              <p className="text-xs text-gray-600 mb-3">Download detailed reports for stakeholders</p>
              {assessmentState.responseId && (
                <ResponseExportLegoBlock
                  responseId={assessmentState.responseId}
                  assessmentTitle="Assessment Summary"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
              )}
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-[#005DAA]" />
              <h4 className="font-semibold text-sm text-gray-800 mb-1">Explore Use Cases</h4>
              <p className="text-xs text-gray-600 mb-3">Browse AI use cases in the framework</p>
              <Button variant="outline" size="sm" className="w-full">
                View Framework
              </Button>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#005DAA]" />
              <h4 className="font-semibold text-sm text-gray-800 mb-1">Track Progress</h4>
              <p className="text-xs text-gray-600 mb-3">Retake assessment to monitor improvement</p>
              <ReusableButton
                rsaStyle="primary"
                onClick={onRetake}
                className="w-full text-xs"
              >
                Retake Assessment
              </ReusableButton>
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
    'text': 'Qualitative insights and strategic considerations',
    'AI Strategy': 'Strategic vision, governance, and leadership alignment',
    'Data Management': 'Data quality, accessibility, and governance frameworks',
    'Technology Infrastructure': 'Technical capabilities, scalability, and architecture',
    'Talent & Skills': 'Human capital, expertise, and capability development',
    'Risk & Ethics': 'Risk management, ethics, and compliance frameworks'
  };
  return descriptions[category] || 'Comprehensive evaluation of capabilities and maturity';
}

function generateGapAnalysis(maturityLevels: any) {
  const gaps = Object.entries(maturityLevels).map(([category, data]: [string, any]) => {
    const current = data.percentage || 0;
    const target = 80; // Target maturity level
    const gap = Math.max(0, target - current);
    
    return {
      category,
      currentScore: current,
      targetScore: target,
      gap: gap,
      priority: gap > 40 ? 'High' : gap > 20 ? 'Medium' : 'Low',
      recommendations: gap > 0 ? generateRecommendationsForCategory(category, gap) : []
    };
  });

  return {
    overallGap: gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length,
    criticalGaps: gaps.filter(g => g.priority === 'High').map(g => g.category),
    recommendations: gaps.flatMap(g => g.recommendations).slice(0, 5)
  };
}

function generateDetailedGapAnalysis(maturityLevels: any): GapAnalysisItem[] {
  return Object.entries(maturityLevels).map(([category, data]: [string, any]) => {
    const current = data.percentage || 0;
    const target = 80; // Standard target maturity level
    const gap = Math.max(0, target - current);
    
    return {
      category,
      currentScore: current,
      targetScore: target,
      gap: gap,
      priority: (gap > 40 ? 'High' : gap > 20 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      recommendations: generateRecommendationsForCategory(category, gap)
    };
  }).sort((a, b) => b.gap - a.gap); // Sort by highest gap first
}

function generateRecommendationsForCategory(category: string, gap: number): string[] {
  const recommendations: Record<string, string[]> = {
    'AI Strategy': [
      'Develop comprehensive AI strategy roadmap aligned with business objectives',
      'Establish AI governance framework and decision-making processes',
      'Define AI success metrics and KPIs with regular review cycles'
    ],
    'Data Management': [
      'Implement data quality management and validation processes',
      'Establish data governance policies and privacy controls',
      'Create comprehensive data inventory and catalog system'
    ],
    'Technology Infrastructure': [
      'Assess current infrastructure capabilities and identify gaps',
      'Implement MLOps and model lifecycle management systems',
      'Establish CI/CD pipelines for AI development and deployment'
    ],
    'Talent & Skills': [
      'Conduct AI skills assessment and gap analysis',
      'Develop AI training programs and certification pathways',
      'Build cross-functional AI teams and communities of practice'
    ],
    'Risk & Ethics': [
      'Develop AI ethics framework and guidelines',
      'Implement AI risk assessment and monitoring processes',
      'Establish model explainability and transparency practices'
    ]
  };
  
  const categoryKey = Object.keys(recommendations).find(key => 
    category.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(category.toLowerCase())
  );
  
  return categoryKey ? recommendations[categoryKey] : [
    'Focus on capability development and maturity improvement in this area',
    'Establish baseline measurements and improvement targets',
    'Develop action plan with clear timelines and ownership'
  ];
}