import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Home, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';

// Import Survey.js default CSS
import 'survey-core/survey-core.css';

// Memoized save status component to prevent unnecessary re-renders
const SaveStatus = React.memo(({ isSaving, lastSaved, hasUnsavedChanges }: {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}) => {
  if (isSaving) {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs">Saving...</span>
      </div>
    );
  }
  
  if (lastSaved && !hasUnsavedChanges) {
    return (
      <span className="text-xs text-green-600">
        ✓ Saved {lastSaved.toLocaleTimeString()}
      </span>
    );
  }
  
  if (hasUnsavedChanges) {
    return (
      <span className="text-xs text-amber-600">
        Unsaved changes
      </span>
    );
  }
  
  return null;
});

SaveStatus.displayName = 'SaveStatus';

interface SurveyJsContainerProps {
  questionnaireId: string;
  className?: string;
}

export function SurveyJsContainer({ questionnaireId }: SurveyJsContainerProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    responseSession,
    isLoadingQuestionnaire,
    isCheckingSession,
    saveAnswers,
    completeResponse,
    saveAnswersError,
    completeResponseError,
  } = useQuestionnaire(questionnaireId);

  // Auto-save handler with stable reference
  const handleAutoSave = useCallback(async (data: any) => {
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
  }, [responseSession?.id, saveAnswers]); // Only depend on stable values

  // Handle survey completion
  const surveyComplete = useCallback(async (survey: Model) => {
    if (!responseSession) return;

    try {
      // Save final answers
      await saveAnswers({
        responseId: responseSession.id,
        answers: survey.data
      });
      
      // Mark as completed
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
  }, [responseSession, saveAnswers, completeResponse, toast, setLocation]);

  // Load Survey.js configuration
  useEffect(() => {
    const loadSurveyConfig = async () => {
      if (!questionnaireId || !responseSession) return;
      
      setIsLoadingSurvey(true);
      try {
        const response = await fetch(`/api/survey-config/${questionnaireId}`);
        if (!response.ok) {
          throw new Error(`Failed to load survey config: ${response.status}`);
        }
        
        const surveyJson = await response.json();
        console.log('Loaded survey config:', surveyJson);
        
        const survey = new Model(surveyJson);
        
        // Configure the survey
        survey.showProgressBar = "top";
        survey.progressBarType = "pages";
        survey.showNavigationButtons = "bottom";
        survey.showTitle = true;
        survey.showPageTitles = true;
        survey.goNextPageAutomatic = false;
        survey.checkErrorsMode = "onValueChanged";
        survey.showQuestionNumbers = "onPage";
        
        // Load existing answers if available
        if (responseSession.answers && Array.isArray(responseSession.answers)) {
          const surveyData: any = {};
          responseSession.answers.forEach((answer: any) => {
            if (answer.questionId && answer.answerValue !== undefined) {
              try {
                // Try to parse JSON, fall back to raw value
                surveyData[answer.questionId] = typeof answer.answerValue === 'string' 
                  ? JSON.parse(answer.answerValue) 
                  : answer.answerValue;
              } catch {
                surveyData[answer.questionId] = answer.answerValue;
              }
            }
          });
          survey.data = surveyData;
          console.log('Loaded existing answers:', surveyData);
        }

        // Set up event handlers with debouncing to prevent page refresh
        let saveTimeout: NodeJS.Timeout;
        const valueChangedHandler = () => {
          setHasUnsavedChanges(true);
          // Clear existing timeout
          if (saveTimeout) {
            clearTimeout(saveTimeout);
          }
          // Debounced auto-save without causing re-renders
          saveTimeout = setTimeout(() => {
            handleAutoSave(survey.data);
          }, 2000);
        };
        
        survey.onValueChanged.add(valueChangedHandler);

        survey.onComplete.add(surveyComplete);

        setSurveyModel(survey);
      } catch (error) {
        console.error('Error loading Survey.js config:', error);
        toast({
          title: "Error",
          description: "Failed to load assessment questions. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingSurvey(false);
      }
    };

    loadSurveyConfig();
  }, [questionnaireId, responseSession?.id, handleAutoSave, surveyComplete, toast]); // Use stable ID reference

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
    const answeredQuestions = allQuestions.filter(q => 
      q.value !== undefined && q.value !== null && q.value !== ''
    );
    
    return Math.round((answeredQuestions.length / allQuestions.length) * 100);
  };

  // Loading state
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
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
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
  const answeredCount = surveyModel ? surveyModel.getAllQuestions().filter(q => 
    q.value !== undefined && q.value !== null && q.value !== ''
  ).length : 0;
  const totalQuestions = surveyModel ? surveyModel.getAllQuestions().length : 45;

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
                Answered {answeredCount}/{totalQuestions} questions
              </span>
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <SaveStatus 
                isSaving={isSaving}
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Error Alerts */}
        {(saveAnswersError || completeResponseError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {saveAnswersError ? 'Failed to save answers. Please try again.' : 
               'Failed to complete assessment. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Survey Component */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {surveyModel && (
              <Survey model={surveyModel} />
            )}
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