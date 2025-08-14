import React, { useEffect } from 'react';
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
  Lightbulb,
  Home,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import ScoringDashboardLegoBlock, { type ScoringData } from './ScoringDashboardLegoBlock';
import ResponseExportLegoBlock from './ResponseExportLegoBlock';
import QuestionnaireExportLegoBlock from './QuestionnaireExportLegoBlock';
import ReusableButton from './ReusableButton';
import { useGenerateRecommendations, useRecommendations } from '@/hooks/useRecommendations';
import { useUseCases } from '@/contexts/UseCaseContext';

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
  
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY
  // Fetch response data if responseId is provided
  const { data: responseData } = useQuery({
    queryKey: ['response', actualResponseId],
    queryFn: () => fetch(`/api/responses/${actualResponseId}`).then(res => res.json()),
    enabled: !!actualResponseId
  });

  // Fetch maturity scores if responseId is provided  
  const { data: fetchedMaturityScores } = useQuery({
    queryKey: ['scores', actualResponseId],
    queryFn: () => fetch(`/api/responses/${actualResponseId}/scores`).then(res => res.json()),
    enabled: !!actualResponseId
  });

  // Hooks for recommendation system - ALWAYS CALL
  const { useCases } = useUseCases();
  const generateRecommendations = useGenerateRecommendations();
  const { data: existingRecommendations } = useRecommendations(actualResponseId);
  const [, setLocation] = useLocation();

  // Use fetched data or fallback to assessmentState
  const maturityScores = fetchedMaturityScores || assessmentState?.maturityScores;
  const totalScore = responseData?.totalScore || assessmentState?.totalScore || 0;
  const completedAt = fetchedMaturityScores?.completedAt || responseData?.completedAt || assessmentState?.completedAt;

  // Debug logging
  console.log('AssessmentResultsDashboard props:', { assessmentState, responseId, actualResponseId });
  console.log('Maturity scores:', maturityScores);
  console.log('Total score:', totalScore);

  // Auto-generate recommendations when assessment completes
  useEffect(() => {
    if (actualResponseId && maturityScores && useCases.length > 0 && !existingRecommendations) {
      const scores = {
        responseId: actualResponseId,
        overallScore: maturityScores.overallAverage * 20 || 0, // Convert to percentage
        aiStrategyMaturity: maturityScores.maturityLevels?.strategy?.average || 0,
        primaryFocusArea: 'automation', // This should come from assessment answers
        averageByCategory: {
          strategy: maturityScores.maturityLevels?.strategy?.average || 0,
          governance: maturityScores.maturityLevels?.governance?.average || 0,
          implementation: maturityScores.maturityLevels?.implementation?.average || 0
        }
      };

      generateRecommendations.mutate({
        assessmentId: actualResponseId,
        scores,
        useCases
      });
    }
  }, [actualResponseId, maturityScores, useCases, existingRecommendations, generateRecommendations]);

  // Early return AFTER all hooks are called - simplified check without scoring
  if (!actualResponseId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessment Not Found</h3>
          <p className="text-gray-600 mb-4">Please complete an assessment to view results</p>
          {onRetake && (
            <Button onClick={onRetake} className="bg-[#005DAA] hover:bg-[#004A8C]">
              Start Assessment
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Get recommended use cases (those marked by assessment)  
  const recommendations: Recommendation[] = useCases
    .filter(useCase => useCase.recommendedByAssessment === actualResponseId)
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
    }));

  // Basic assessment info without scoring complexity
  // TODO: Add scoring components after questionnaire completion is working

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#005DAA]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        
        <div className="flex items-center space-x-2 text-gray-500">
          <Home className="h-4 w-4" />
          <span>/</span>
          <span>Assessment Results</span>
        </div>
      </div>
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
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-gray-100 text-gray-800 text-sm px-3 py-1">
                    Assessment Completed
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                    {maturityScores?.answerCount || 0} Questions Answered
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Export Results */}
              {actualResponseId && (
                <ResponseExportLegoBlock
                  responseId={actualResponseId}
                  assessmentTitle="AI Maturity Assessment Results"
                  variant="outline"
                  size="default"
                />
              )}
              
              {/* Export Questionnaire */}
              <QuestionnaireExportLegoBlock
                questionnaireId={responseData?.questionnaire_id || assessmentState?.questionnaireId || '91684df8-9700-4605-bc3e-2320120e5e1b'}
                responseId={actualResponseId}
                assessmentTitle="AI Maturity Assessment"
                variant="outline"
                size="default"
              />
              
              <ReusableButton
                rsaStyle="secondary"
                onClick={() => setLocation('/questionnaire')}
                className="text-sm"
              >
                Retake Assessment
              </ReusableButton>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Assessment Summary</span>
          </CardTitle>
          <CardDescription>
            Your questionnaire has been completed and saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{maturityScores?.answerCount || 0}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {completedAt ? new Date(completedAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Completion Date</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">Ready</div>
              <div className="text-sm text-gray-600">For Export</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong> Your assessment responses have been saved. You can export the questionnaire and responses using the buttons above, or retake the assessment if needed.
            </p>
          </div>
        </CardContent>
      </Card>

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

        {/* Gap Analysis Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-[#005DAA]" />
              <span>Gap Analysis</span>
            </CardTitle>
            <CardDescription>
              Detailed analysis will be available after scoring implementation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Gap analysis coming soon</p>
              <p className="text-sm">Will be implemented with scoring system</p>
            </div>
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
              {actualResponseId && (
                <ResponseExportLegoBlock
                  responseId={actualResponseId}
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
              <ReusableButton
                rsaStyle="secondary"
                onClick={() => setLocation('/')}
                className="w-full text-xs"
              >
                View Framework
              </ReusableButton>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#005DAA]" />
              <h4 className="font-semibold text-sm text-gray-800 mb-1">Track Progress</h4>
              <p className="text-xs text-gray-600 mb-3">Retake assessment to monitor improvement</p>
              <ReusableButton
                rsaStyle="primary"
                onClick={() => setLocation('/questionnaire')}
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