import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Legacy LEGO blocks components removed - using Survey.js architecture
import { cn } from '@/lib/utils';
import { ArrowLeft, Home, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
// Survey.js CSS will be handled via CDN or package-specific imports

interface SurveyJsContainerProps {
  questionnaireId: string;
  className?: string;
}

export function SurveyJsContainer({ questionnaireId, className }: SurveyJsContainerProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const surveyRef = useRef<Model | null>(null);
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    questionnaire,
    responseSession,
    isLoadingQuestionnaire,
    isCheckingSession,
    startResponse,
    saveAnswers,
    completeResponse,
    isStartingResponse,
    isCompletingResponse,
    saveAnswersError,
    completeResponseError,
    startResponseError
  } = useQuestionnaire(questionnaireId);

  // Load Survey.js configuration
  useEffect(() => {
    const loadSurveyConfig = async () => {
      try {
        const response = await fetch(`/api/survey-config/${questionnaireId}`);
        const surveyJson = await response.json();
        
        const model = new Model(surveyJson);
    
        // Load existing answers if available
        if (responseSession?.answers) {
          try {
            // Convert our answer format to Survey.js format
            const surveyData: any = {};
            if (Array.isArray(responseSession.answers)) {
              responseSession.answers.forEach((answer: any) => {
                try {
                  if (answer.questionId && answer.answerValue !== undefined) {
                    // Try to parse JSON, fallback to string value
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

        // Handle completion
        model.onComplete.add(() => {
          handleCompleteAssessment(model.data);
        });

        surveyRef.current = model;
        setSurveyModel(model);
      } catch (error) {
        console.error('Error loading Survey.js config:', error);
      }
    };

    if (questionnaireId) {
      loadSurveyConfig();
    }
  }, [questionnaireId, responseSession]);

  // Calculate global question number
  const getGlobalQuestionNumber = (sectionIndex: number, questionIndex: number): number => {
    if (!questionnaire) return 1;
    
    let globalNumber = 1;
    for (let i = 0; i < sectionIndex; i++) {
      globalNumber += questionnaire.sections[i].questions.length;
    }
    return globalNumber + questionIndex;
  };

  // Convert question type to Survey.js type
  const getSurveyJsQuestionType = (type: string): string => {
    switch (type) {
      case 'radio': return 'radiogroup';
      case 'checkbox': return 'checkbox';
      case 'text': return 'text';
      case 'email': return 'text';
      case 'url': return 'text';
      case 'date': return 'text';
      case 'textarea': return 'comment';
      case 'number': return 'text';
      case 'smart_rating': return 'rating';
      case 'ranking': return 'ranking';
      default: return 'text';
    }
  };

  // Convert question properties
  const convertQuestionProps = (question: any) => {
    const props: any = {};
    
    if (question.options && question.options.length > 0) {
      props.choices = question.options.map((option: any) => ({
        value: option.optionValue || option.id,
        text: option.label
      }));
    }

    if (question.type === 'number') {
      props.inputType = 'number';
      if (question.min !== undefined) props.min = question.min;
      if (question.max !== undefined) props.max = question.max;
      if (question.step !== undefined) props.step = question.step;
    }

    if (question.type === 'email') {
      props.inputType = 'email';
      props.validators = [{ type: 'email' }];
    }

    if (question.type === 'url') {
      props.inputType = 'url';
    }

    if (question.type === 'date') {
      props.inputType = 'date';
    }

    if (question.type === 'smart_rating') {
      props.rateMin = 1;
      props.rateMax = 5;
      props.minRateDescription = "1 (Poor)";
      props.maxRateDescription = "5 (Excellent)";
    }

    if (question.helpText) {
      props.description = question.helpText;
    }

    return props;
  };

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
      // Save final answers
      await saveAnswers({
        responseId: responseSession.id,
        answers: data
      });
      
      // Mark as complete
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

  // Loading state
  if (isLoadingQuestionnaire || isCheckingSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-[#005DAA] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">
                {isCheckingSession ? 'Checking for existing session...' : 'Loading questionnaire...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show start form if no session
  if (!responseSession) {
    return (
      <div className={cn("max-w-4xl mx-auto p-6 space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {questionnaire?.title || 'RSA AI Assessment'}
            </CardTitle>
            <CardDescription>
              {questionnaire?.description || 'Complete this assessment to evaluate your AI readiness.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => startResponse({
                questionnaireId,
                respondentEmail: 'user@example.com',
                respondentName: 'Assessment User',
                metadata: {
                  startedAt: new Date().toISOString(),
                  userAgent: navigator.userAgent
                }
              })}
              disabled={isStartingResponse}
              className="w-full bg-[#005DAA] hover:bg-[#004A88] text-white"
            >
              {isStartingResponse ? 'Starting...' : 'Begin Assessment'}
            </Button>

            {startResponseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to start assessment. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = responseSession?.status === 'completed';
  const progress = calculateProgress();

  return (
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", className)}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setLocation('/assessment')}
          className="flex items-center space-x-2 border-[#005DAA] text-[#005DAA] hover:bg-[#005DAA] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assessment</span>
        </Button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <span>RSA AI Assessment</span>
        </div>
      </div>

      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {questionnaire?.title}
              </CardTitle>
              <CardDescription>
                AI Strategy Assessment powered by Survey.js
              </CardDescription>
            </div>
            
            {isCompleted && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium text-[#005DAA]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Enhanced Progress Status */}
          <div className="flex items-center justify-between">
            <ProgressStatusLegoBlock 
              lastSaved={lastSaved}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
            />

            {/* Save & Exit button */}
            {responseSession && !isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                disabled={isSaving}
                className="text-[#005DAA] border-[#005DAA] hover:bg-[#005DAA] hover:text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Survey.js Container */}
      {surveyModel && (
        <Card>
          <CardContent className="p-6">
            <Survey model={surveyModel} />
          </CardContent>
        </Card>
      )}

      {/* Error Alerts */}
      {(saveAnswersError || completeResponseError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {saveAnswersError || completeResponseError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}