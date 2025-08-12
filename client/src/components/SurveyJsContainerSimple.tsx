import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ArrowLeft, Home, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import '../styles/survey-custom.css';

interface SurveyJsContainerProps {
  questionnaireId: string;
  className?: string;
}

export function SurveyJsContainer({ questionnaireId, className }: SurveyJsContainerProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const surveyRef = useRef<Model | null>(null);
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);

  const {
    responseSession,
    isLoadingQuestionnaire,
    isCheckingSession,
    saveAnswers,
    completeResponse,
    isCompletingResponse,
    saveAnswersError,
    completeResponseError,
  } = useQuestionnaire(questionnaireId);

  // Load Survey.js configuration
  useEffect(() => {
    const loadSurveyConfig = async () => {
      setIsLoadingSurvey(true);
      try {
        const response = await fetch(`/api/survey-config/${questionnaireId}`);
        const surveyJson = await response.json();
        
        const model = new Model(surveyJson);
        
        // Configure Survey.js for better UX
        model.showProgressBar = "top";
        model.progressBarType = "pages";
        model.showNavigationButtons = "bottom";
        model.showTitle = false;
        model.showPageTitles = true;
        model.goNextPageAutomatic = false;
        model.checkErrorsMode = "onValueChanged";
        model.showQuestionNumbers = "onPage";
        model.questionErrorLocation = "bottom";
        
        // Apply modern theme
        model.applyTheme({
          "cssVariables": {
            "--sjs-corner-radius": "8px",
            "--sjs-base-unit": "8px",
            "--sjs-primary-color": "#005DAA",
            "--sjs-primary-forecolor": "#ffffff",
            "--sjs-secondary-color": "#f3f4f6",
            "--sjs-general-backcolor": "#ffffff",
            "--sjs-general-backcolor-dim": "#f9fafb",
            "--sjs-general-forecolor": "#374151",
            "--sjs-general-dim-forecolor": "#6b7280",
            "--sjs-border-light": "#e5e7eb"
          }
        });
    
        // Load existing answers if available
        if (responseSession?.answers) {
          try {
            const surveyData: any = {};
            if (Array.isArray(responseSession.answers)) {
              responseSession.answers.forEach((answer: any) => {
                try {
                  if (answer.questionId && answer.answerValue !== undefined) {
                    try {
                      surveyData[answer.questionId] = JSON.parse(answer.answerValue);
                    } catch {
                      surveyData[answer.questionId] = answer.answerValue;
                    }
                  }
                } catch (error) {
                  console.warn('Error loading answer:', answer, error);
                }
              });
            }
            model.data = surveyData;
          } catch (error) {
            console.error('Error loading existing answers:', error);
          }
        }

        // Set up auto-save on value change
        model.onValueChanged.add(() => {
          setHasUnsavedChanges(true);
          handleAutoSave(model.data);
        });

        // Handle page changes
        model.onCurrentPageChanged.add((_, options) => {
          setCurrentPageIndex(options.newCurrentPage.visibleIndex);
        });

        // Handle completion
        model.onComplete.add(() => {
          handleCompleteAssessment(model.data);
        });

        surveyRef.current = model;
        setSurveyModel(model);
      } catch (error) {
        console.error('Error loading Survey.js config:', error);
      } finally {
        setIsLoadingSurvey(false);
      }
    };

    if (questionnaireId && responseSession) {
      loadSurveyConfig();
    }
  }, [questionnaireId, responseSession]);

  // Auto-save handler
  const handleAutoSave = async (data: any) => {
    if (!responseSession) return;

    setIsSaving(true);
    try {
      await saveAnswers({
        responseId: responseSession.id,
        answers: data
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Complete assessment
  const handleCompleteAssessment = async (data: any) => {
    if (!responseSession) return;

    try {
      await saveAnswers({
        responseId: responseSession.id,
        answers: data
      });
      
      await completeResponse(responseSession.id);
      
      toast({
        title: "Assessment Completed!",
        description: "Redirecting to your results...",
        duration: 3000
      });
      
      setTimeout(() => {
        setLocation(`/results/${responseSession.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Save and exit
  const handleSaveAndExit = async () => {
    if (!surveyModel || !responseSession) return;

    setIsSaving(true);
    try {
      await saveAnswers({
        responseId: responseSession.id,
        answers: surveyModel.data
      });
      setLocation('/assessment');
    } catch (error) {
      console.error('Save and exit failed:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (!surveyModel) return 0;
    
    const allQuestions = surveyModel.getAllQuestions();
    const answeredQuestions = allQuestions.filter(q => q.value !== undefined && q.value !== null && q.value !== '');
    
    return Math.round((answeredQuestions.length / allQuestions.length) * 100);
  };

  // Get current page info
  const getCurrentPageInfo = () => {
    if (!surveyModel || !surveyModel.pages) return { current: 0, total: 0, title: '' };
    
    return {
      current: currentPageIndex + 1,
      total: surveyModel.pages.length,
      title: surveyModel.currentPage?.title || surveyModel.currentPage?.name || `Page ${currentPageIndex + 1}`
    };
  };

  // Loading state with better animation
  if (isLoadingQuestionnaire || isCheckingSession || isLoadingSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#005DAA] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Preparing Your Assessment
                  </p>
                  <p className="text-sm text-gray-600">
                    {isCheckingSession ? 'Checking for existing session...' : 
                     isLoadingSurvey ? 'Loading assessment questions...' : 
                     'Loading questionnaire...'}
                  </p>
                </div>
                <div className="w-64 mx-auto">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-[#005DAA] h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show redirect if no session
  if (!responseSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Session Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Please start a new assessment session to continue.
              </p>
              <Button
                onClick={() => setLocation('/assessment/start')}
                className="bg-[#005DAA] hover:bg-[#004488] text-white"
              >
                Start New Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCompleted = responseSession?.status === 'completed';
  const progress = calculateProgress();
  const pageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005DAA] via-[#0066BB] to-[#9F4F96] text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/assessment')}
              className="text-white hover:bg-white/20 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Assessment</span>
            </Button>
            
            <div className="flex items-center space-x-2 text-sm">
              <Home className="h-4 w-4" />
              <span>RSA AI Assessment</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold">
              RSA AI Strategy Assessment Framework
            </h1>
            <p className="text-blue-100 text-sm">
              Comprehensive assessment for AI readiness and use case prioritization
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section with Save Status */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Progress: {progress}%
              </span>
              <span className="text-sm text-gray-500">
                Page {pageInfo.current} of {pageInfo.total}
              </span>
              <span className="text-xs text-gray-500">
                Answered {surveyModel ? surveyModel.getAllQuestions().filter(q => q.value !== undefined && q.value !== null && q.value !== '').length : 0}/45 questions
              </span>
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {isSaving && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Saving...</span>
                </div>
              )}
              {lastSaved && !isSaving && !hasUnsavedChanges && (
                <span className="text-xs text-green-600">
                  ✓ Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {hasUnsavedChanges && !isSaving && (
                <span className="text-xs text-amber-600">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            {/* Error Alerts */}
            {(saveAnswersError || completeResponseError) && (
              <div className="p-6 border-b border-gray-200">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {saveAnswersError ? 'Failed to save answers. Please try again.' : 
                     'Failed to complete assessment. Please try again.'}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Survey.js Component with Custom Container */}
            <div className="survey-wrapper p-6">
              {surveyModel && (
                <Survey 
                  model={surveyModel}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="border-[#005DAA] text-[#005DAA] hover:bg-[#005DAA] hover:text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save & Exit
          </Button>

          {isCompleted && (
            <Button
              onClick={() => setLocation(`/results/${responseSession.id}`)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              View Results
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}