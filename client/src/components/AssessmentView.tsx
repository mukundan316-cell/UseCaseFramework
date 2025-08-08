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
      // In a real app, this would check for user's previous responses
      // For demo, we'll check localStorage
      const savedState = localStorage.getItem('rsa-assessment-state');
      return savedState ? JSON.parse(savedState) : null;
    },
    staleTime: 0 // Always check for fresh data
  });

  // Load assessment state on component mount
  useEffect(() => {
    if (existingResponses) {
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
    localStorage.removeItem('rsa-assessment-state');
    setAssessmentState({
      hasAssessment: false,
      isInProgress: false,
      isCompleted: false
    });

    toast({
      title: "Assessment Reset",
      description: "You can now start a new assessment."
    });
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

          <ReusableButton
            rsaStyle="primary"
            onClick={handleStartAssessment}
            icon={Play}
            className="px-8 py-3 text-lg"
          >
            Start AI Assessment
          </ReusableButton>
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

  // Completed State - Show Results Dashboard
  if (assessmentState.isCompleted) {
    const { totalScore = 0, maturityScores, completedAt } = assessmentState;
    const overallPercentage = Math.round((totalScore / 100) * 100); // Assuming max score of 100

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-green-800">Assessment Complete!</CardTitle>
                  <CardDescription className="text-green-700">
                    Completed on {completedAt ? new Date(completedAt).toLocaleDateString() : 'Recently'}
                  </CardDescription>
                </div>
              </div>
              
              <ReusableButton
                rsaStyle="secondary"
                onClick={handleRetakeAssessment}
                className="text-sm"
              >
                Retake Assessment
              </ReusableButton>
            </div>
          </CardHeader>
        </Card>

        {/* Results Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-[#005DAA]">{overallPercentage}%</div>
                <Progress value={overallPercentage} className="h-2" />
                <p className="text-sm text-gray-600">AI Maturity Level</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-[#9F4F96]">{totalScore}</div>
                <p className="text-sm text-gray-600">Out of 100 possible</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Maturity Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-gray-800">
                  {overallPercentage >= 90 ? 'Optimized' :
                   overallPercentage >= 70 ? 'Managed' :
                   overallPercentage >= 50 ? 'Defined' :
                   overallPercentage >= 30 ? 'Repeatable' : 'Initial'}
                </div>
                <p className="text-sm text-gray-600">Current maturity stage</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Assessment Results</CardTitle>
            <CardDescription>
              Your AI maturity breakdown across key dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {maturityScores ? (
                Object.entries(maturityScores.maturityLevels || {}).map(([category, data]: [string, any]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold capitalize">{category.replace(/([A-Z])/g, ' $1')}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-[#005DAA]">{data.level}</span>
                        <span className="text-sm text-gray-600">({data.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Detailed results will be available after completing the assessment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              Next steps to improve your AI maturity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Immediate Actions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Establish AI governance framework</li>
                  <li>• Define data quality standards</li>
                  <li>• Create AI ethics guidelines</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Strategic Initiatives</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Develop AI center of excellence</li>
                  <li>• Invest in employee AI training</li>
                  <li>• Build partnership ecosystem</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}