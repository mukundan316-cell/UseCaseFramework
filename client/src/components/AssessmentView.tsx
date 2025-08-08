import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Play, CheckCircle2, BarChart3, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import QuestionnaireContainer from './QuestionnaireContainer';
import ReusableButton from './lego-blocks/ReusableButton';
import ScoringDashboardLegoBlock, { type ScoringData } from './lego-blocks/ScoringDashboardLegoBlock';
import ResponseExportLegoBlock from './lego-blocks/ResponseExportLegoBlock';
import AssessmentResultsDashboard from './lego-blocks/AssessmentResultsDashboard';

interface AssessmentState {
  hasAssessment: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  responseId?: string;
  questionnaireId?: string;
  progress?: number;
  completedAt?: string;
  totalScore?: number;
  maturityScores?: any;
}

/**
 * Assessment View Component
 * Manages the complete AI Assessment lifecycle within the main dashboard
 * Shows different states: No Assessment, In Progress, or Completed
 */
export default function AssessmentView() {
  const { toast } = useToast();
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    hasAssessment: false,
    isInProgress: false,
    isCompleted: false
  });

  // The test questionnaire ID from our database
  const questionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b';

  // Check for existing assessment state from localStorage or API
  const { data: existingResponses } = useQuery({
    queryKey: ['user-responses'],
    queryFn: async () => {
      // First check localStorage for saved state
      const savedState = localStorage.getItem('rsa-assessment-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // If we have a responseId but no scores, fetch from API
        if (parsed.responseId && parsed.status === 'completed' && !parsed.maturityScores) {
          try {
            const scoresResponse = await fetch(`/api/responses/${parsed.responseId}/scores`);
            if (scoresResponse.ok) {
              const scores = await scoresResponse.json();
              parsed.maturityScores = scores;
              parsed.totalScore = scores.totalScore;
              // Update localStorage with fetched data
              localStorage.setItem('rsa-assessment-state', JSON.stringify(parsed));
            }
          } catch (error) {
            console.error('Failed to fetch scores:', error);
          }
        }
        return parsed;
      }
      return null;
    },
    staleTime: 0 // Always check for fresh data
  });

  // Load assessment state on component mount
  useEffect(() => {
    if (existingResponses) {
      console.log('Loading assessment state from existingResponses:', existingResponses);
      setAssessmentState({
        hasAssessment: true,
        isInProgress: existingResponses.status === 'started',
        isCompleted: existingResponses.status === 'completed',
        responseId: existingResponses.responseId,
        questionnaireId: existingResponses.questionnaireId,
        progress: existingResponses.progress || 0,
        completedAt: existingResponses.completedAt,
        totalScore: existingResponses.totalScore,
        maturityScores: existingResponses.maturityScores
      });
    } else {
      // Check if we have a completed response directly in the database
      const checkForCompletedAssessment = async () => {
        try {
          const response = await fetch('/api/responses/7fa62115-ec9b-452a-8b24-eabf9617a5b7');
          if (response.ok) {
            const data = await response.json();
            if (data.completedAt) {
              // Fetch scores
              const scoresResponse = await fetch('/api/responses/7fa62115-ec9b-452a-8b24-eabf9617a5b7/scores');
              if (scoresResponse.ok) {
                const scores = await scoresResponse.json();
                
                const completedState = {
                  hasAssessment: true,
                  isInProgress: false,
                  isCompleted: true,
                  responseId: data.id,
                  questionnaireId: data.questionnaireId,
                  progress: 100,
                  completedAt: data.completedAt,
                  totalScore: scores.totalScore,
                  maturityScores: scores
                };
                
                setAssessmentState(completedState);
                
                // Save to localStorage for future loads
                localStorage.setItem('rsa-assessment-state', JSON.stringify({
                  status: 'completed',
                  ...completedState
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error checking for completed assessment:', error);
        }
      };
      
      checkForCompletedAssessment();
    }
  }, [existingResponses]);

  // Handle starting new assessment
  const handleStartAssessment = () => {
    setAssessmentState({
      hasAssessment: true,
      isInProgress: true,
      isCompleted: false,
      questionnaireId
    });

    // Save state to localStorage for persistence
    localStorage.setItem('rsa-assessment-state', JSON.stringify({
      status: 'started',
      questionnaireId,
      startedAt: new Date().toISOString()
    }));

    toast({
      title: "Assessment Started",
      description: "Complete your AI maturity assessment to get personalized insights."
    });
  };

  // Handle assessment completion (called from QuestionnaireContainer)
  const handleAssessmentComplete = (results: any) => {
    const completedState = {
      hasAssessment: true,
      isInProgress: false,
      isCompleted: true,
      responseId: results.responseId,
      questionnaireId,
      progress: 100,
      completedAt: new Date().toISOString(),
      totalScore: results.totalScore,
      maturityScores: results.maturityScores
    };

    setAssessmentState(completedState);

    // Save completed state to localStorage
    localStorage.setItem('rsa-assessment-state', JSON.stringify({
      ...completedState,
      status: 'completed'
    }));

    toast({
      title: "Assessment Complete!",
      description: "Your AI maturity results are now available.",
      duration: 5000
    });
  };

  // Handle retaking assessment
  const handleRetakeAssessment = () => {
    // Clear localStorage assessment state
    localStorage.removeItem('rsa-assessment-state');
    
    // Clear any questionnaire progress data
    const progressKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('questionnaire-progress-')) {
        progressKeys.push(key);
      }
    }
    
    // Remove all progress keys
    progressKeys.forEach(key => localStorage.removeItem(key));
    
    // Force a page reload to ensure clean state
    window.location.reload();
  };

  // Empty State - No Assessment
  if (!assessmentState.hasAssessment) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-r from-[#005DAA] to-[#9F4F96] rounded-full flex items-center justify-center mx-auto">
            <ClipboardCheck className="h-12 w-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">AI Maturity Assessment</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evaluate your organization's AI readiness, strategy, and implementation maturity across key commercial insurance operations.
            </p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-[#005DAA]" />
              <span>What You'll Get</span>
            </CardTitle>
            <CardDescription>
              Comprehensive insights into your AI maturity across multiple dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#005DAA] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Maturity Scoring</h4>
                    <p className="text-sm text-gray-600">Get scored across AI strategy, governance, and implementation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#005DAA] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Personalized Insights</h4>
                    <p className="text-sm text-gray-600">Targeted recommendations based on your responses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#005DAA] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Benchmark Comparison</h4>
                    <p className="text-sm text-gray-600">See how you compare to industry standards</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9F4F96] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Action Plan</h4>
                    <p className="text-sm text-gray-600">Clear next steps to improve your AI maturity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9F4F96] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Risk Assessment</h4>
                    <p className="text-sm text-gray-600">Identify potential risks and mitigation strategies</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9F4F96] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">ROI Projection</h4>
                    <p className="text-sm text-gray-600">Estimated returns on AI investments</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>10-15 minutes</span>
            </div>
            <span>•</span>
            <span>2 sections</span>
            <span>•</span>
            <span>Auto-saved progress</span>
          </div>

          {/* Check for existing progress */}
          {localStorage.getItem(`questionnaire-progress-${questionnaireId}`) ? (
            <div className="space-y-3">
              <ReusableButton
                rsaStyle="primary"
                onClick={handleStartAssessment}
                icon={Play}
                className="px-8 py-3 text-lg"
              >
                Resume AI Assessment
              </ReusableButton>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem(`questionnaire-progress-${questionnaireId}`);
                  handleStartAssessment();
                }}
                size="sm"
                className="mx-auto"
              >
                Start New Assessment
              </Button>
              <p className="text-xs text-amber-600 font-medium">
                Previous progress found - continue where you left off
              </p>
            </div>
          ) : (
            <ReusableButton
              rsaStyle="primary"
              onClick={handleStartAssessment}
              icon={Play}
              className="px-8 py-3 text-lg"
            >
              Start AI Assessment
            </ReusableButton>
          )}
        </div>
      </div>
    );
  }

  // In Progress State - Show QuestionnaireContainer
  if (assessmentState.isInProgress) {
    return (
      <div className="space-y-4">
        {/* Progress Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardCheck className="h-5 w-5 text-[#005DAA]" />
                  <span>AI Maturity Assessment</span>
                </CardTitle>
                <CardDescription>
                  Complete the assessment to receive your personalized AI maturity report
                </CardDescription>
              </div>
              
              <Button
                variant="outline"
                onClick={handleRetakeAssessment}
                className="text-sm"
              >
                Start Over
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* QuestionnaireContainer */}
        <QuestionnaireContainer
          questionnaireId={assessmentState.questionnaireId || questionnaireId}
        />
      </div>
    );
  }

  // Completed State - Show Comprehensive Results Dashboard
  if (assessmentState.isCompleted) {
    console.log('Rendering AssessmentResultsDashboard with state:', assessmentState);
    return (
      <AssessmentResultsDashboard 
        assessmentState={assessmentState} 
        responseId={assessmentState.responseId}
        onRetake={handleRetakeAssessment} 
      />
    );
  }

  return null;
}

// Helper functions for maturity scoring
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