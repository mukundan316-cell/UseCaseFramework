import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { ChevronLeft, ChevronRight, Save, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import SectionLegoBlock from './lego-blocks/SectionLegoBlock';
import ReusableButton from './lego-blocks/ReusableButton';
import { useQuestionnaire, type ResponseSession, type QuestionData } from '@/hooks/useQuestionnaire';

interface QuestionnaireContainerProps {
  questionnaireId: string;
  className?: string;
}

/**
 * Main Questionnaire Container Component
 * Orchestrates all LEGO blocks for complete questionnaire experience
 * Follows existing patterns from UseCaseForm and UseCaseContext
 */
export default function QuestionnaireContainer({ 
  questionnaireId, 
  className = "" 
}: QuestionnaireContainerProps) {
  const { toast } = useToast();
  
  // State management
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responseSession, setResponseSession] = useState<ResponseSession | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasStarted, setHasStarted] = useState(false);
  
  // User information for response session
  const [respondentEmail, setRespondentEmail] = useState('');
  const [respondentName, setRespondentName] = useState('');
  
  // Questionnaire hook
  const {
    questionnaire,
    isLoadingQuestionnaire,
    questionnaireError,
    startResponse,
    startResponseAsync,
    saveAnswers,
    completeResponse,
    isStartingResponse,
    isSavingAnswers,
    isCompletingResponse,
    startResponseError,
    saveAnswersError,
    completeResponseError,
    useResponse,
    useMaturityScores
  } = useQuestionnaire(questionnaireId);

  // Response data hooks (only when session exists)
  const { data: responseData } = useResponse(responseSession?.id);
  const { data: maturityScores } = useMaturityScores(
    responseSession?.status === 'completed' ? responseSession.id : undefined
  );

  // Progress persistence state
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debounce utility function
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    }) as T;
  }

  // Auto-save debounced function
  const debouncedSaveAnswers = useCallback(
    debounce(async (responseId: string, answers: Map<string, any>) => {
      if (answers.size === 0) return;
      
      setIsSaving(true);
      try {
        const answersArray = Array.from(answers.entries()).map(([questionId, value]) => ({
          questionId,
          answerValue: String(value || ''),
          score: typeof value === 'number' ? value : undefined
        }));
        
        await saveAnswers({ responseId, answers: answersArray });
        setLastSaved(new Date().toLocaleTimeString());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: "Auto-save failed",
          description: "Your progress may not be saved. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [saveAnswers, toast]
  );

  // Auto-save when responses change
  useEffect(() => {
    if (responseSession && responses.size > 0) {
      setHasUnsavedChanges(true);
      debouncedSaveAnswers(responseSession.id, responses);
    }
  }, [responses, responseSession, debouncedSaveAnswers]);

  // Progress recovery on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`questionnaire-progress-${questionnaireId}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (progress.responseId && progress.answers) {
          setResponseSession({ 
            id: progress.responseId, 
            status: 'started',
            questionnaireId 
          });
          setResponses(new Map(Object.entries(progress.answers)));
          setCurrentSectionIndex(progress.currentSection || 0);
          setRespondentEmail(progress.email || '');
          setRespondentName(progress.name || '');
          setHasStarted(true);
          setLastSaved(progress.lastSaved);
          
          toast({
            title: "Progress restored",
            description: "Your previous answers have been recovered.",
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Failed to restore progress:', error);
        localStorage.removeItem(`questionnaire-progress-${questionnaireId}`);
      }
    }
  }, [questionnaireId, toast]);

  // Save progress to localStorage
  const saveProgressToStorage = useCallback(() => {
    if (responseSession && responses.size > 0) {
      const progress = {
        responseId: responseSession.id,
        answers: Object.fromEntries(responses),
        currentSection: currentSectionIndex,
        email: respondentEmail,
        name: respondentName,
        lastSaved: new Date().toLocaleTimeString()
      };
      localStorage.setItem(`questionnaire-progress-${questionnaireId}`, JSON.stringify(progress));
    }
  }, [responseSession, responses, currentSectionIndex, respondentEmail, respondentName, questionnaireId]);

  // Handle response change with validation
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    setResponses(prev => {
      const newResponses = new Map(prev);
      newResponses.set(questionId, value);
      return newResponses;
    });

    // Clear error when user provides input
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }, [errors]);

  // Save & Exit handler
  const handleSaveAndExit = async () => {
    if (responseSession && responses.size > 0) {
      setIsSaving(true);
      try {
        const answersArray = Array.from(responses.entries()).map(([questionId, value]) => ({
          questionId,
          answerValue: String(value || ''),
          score: typeof value === 'number' ? value : undefined
        }));
        
        await saveAnswers({ responseId: responseSession.id, answers: answersArray });
        saveProgressToStorage();
        
        toast({
          title: "Progress saved",
          description: "Your answers have been saved. You can resume later.",
          duration: 3000
        });
      } catch (error) {
        toast({
          title: "Save failed",
          description: "Unable to save progress. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handle successful response session creation
  useEffect(() => {
    if (responseSession && !hasStarted) {
      setHasStarted(true);
      toast({
        title: "Assessment Started",
        description: "Your assessment session has begun.",
        duration: 3000
      });
    }
  }, [responseSession, hasStarted, toast]);

  // Start response session
  const handleStartResponse = async () => {
    if (!respondentEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to begin.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await startResponseAsync({
        questionnaireId,
        respondentEmail: respondentEmail.trim(),
        respondentName: respondentName.trim() || undefined,
        metadata: {
          startedAt: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });

      if (result) {
        setResponseSession(result);
      }
    } catch (error) {
      console.error('Failed to start response:', error);
      toast({
        title: "Failed to Start Assessment",
        description: "Unable to begin the assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Validate current section
  const validateCurrentSection = useCallback(() => {
    if (!questionnaire || !questionnaire.sections[currentSectionIndex]) {
      return true;
    }

    const currentSection = questionnaire.sections[currentSectionIndex];
    const newErrors: Record<string, string> = {};
    
    currentSection.questions.forEach((question: QuestionData) => {
      if (question.isRequired === 'true' || question.isRequired === true) {
        const value = responses.get(question.id);
        if (value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          newErrors[question.id] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [questionnaire, currentSectionIndex, responses]);

  // Navigate to next section
  const handleNextSection = () => {
    if (!validateCurrentSection()) {
      toast({
        title: "Required Fields Missing",
        description: "Please complete all required fields before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (questionnaire && currentSectionIndex < questionnaire.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous section
  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  // Complete questionnaire
  const handleCompleteQuestionnaire = async () => {
    if (!validateCurrentSection()) {
      toast({
        title: "Required Fields Missing",
        description: "Please complete all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!responseSession) return;

    completeResponse(responseSession.id);
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!questionnaire) return 0;
    
    let totalQuestions = 0;
    let answeredQuestions = 0;
    
    questionnaire.sections.forEach(section => {
      section.questions.forEach((question: QuestionData) => {
        totalQuestions++;
        const value = responses.get(question.id);
        if (value !== undefined && value !== '' && 
            (!Array.isArray(value) || value.length > 0)) {
          answeredQuestions++;
        }
      });
    });
    
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [questionnaire, responses]);

  // Loading state
  if (isLoadingQuestionnaire) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-[#005DAA] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Loading questionnaire...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (questionnaireError || !questionnaire) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load questionnaire. Please check the questionnaire ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Pre-start form
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {questionnaire.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {questionnaire.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-[#005DAA]/5 to-[#9F4F96]/5 p-6 rounded-lg border border-[#005DAA]/10">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Estimated time: {questionnaire.sections.reduce((total, section) => 
                      total + (section.estimatedTime || 0), 0)} minutes
                  </span>
                </div>
                <span>•</span>
                <span>{questionnaire.sections.length} sections</span>
                <span>•</span>
                <span>
                  {questionnaire.sections.reduce((total, section) => 
                    total + section.questions.length, 0)} questions
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name (Optional)
                </Label>
                <Input
                  id="name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>
            </div>

            <ReusableButton
              rsaStyle="primary"
              onClick={handleStartResponse}
              loading={isStartingResponse}
              disabled={!respondentEmail.trim()}
              className="w-full"
            >
              Begin Assessment
            </ReusableButton>

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

  const currentSection = questionnaire.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === questionnaire.sections.length - 1;
  const isCompleted = responseSession?.status === 'completed';

  return (
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", className)}>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {questionnaire.title}
              </CardTitle>
              <CardDescription>
                Section {currentSectionIndex + 1} of {questionnaire.sections.length}: {currentSection.title}
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
              <span className="font-medium text-[#005DAA]">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          {/* Progress persistence indicators */}
          <div className="flex items-center justify-between">
            {/* Auto-save indicator */}
            <div className="flex items-center space-x-4 text-sm">
              {isSaving && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-3 h-3 border-2 border-[#005DAA] border-t-transparent rounded-full animate-spin"></div>
                  <span>Auto-saving...</span>
                </div>
              )}
              {!isSaving && lastSaved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Last saved: {lastSaved}</span>
                </div>
              )}
              {hasUnsavedChanges && !isSaving && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <Clock className="h-3 w-3" />
                  <span>Saving in progress...</span>
                </div>
              )}
            </div>

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

      {/* Current Section */}
      <SectionLegoBlock
        section={{
          ...currentSection,
          questions: currentSection.questions.map(q => ({
            ...q,
            isRequired: q.isRequired === 'true' || q.isRequired === true
          }))
        }}
        responses={responses}
        onChange={handleResponseChange}
        errors={errors}
        readonly={isCompleted}
        showProgress={true}
        defaultExpanded={true}
      />

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0 || isCompleted}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-4">
              {!isLastSection ? (
                <ReusableButton
                  rsaStyle="primary"
                  onClick={handleNextSection}
                  disabled={isCompleted}
                  icon={ChevronRight}
                >
                  Next Section
                </ReusableButton>
              ) : (
                <ReusableButton
                  rsaStyle="primary"
                  onClick={handleCompleteQuestionnaire}
                  loading={isCompletingResponse}
                  disabled={isCompleted}
                  icon={CheckCircle2}
                >
                  Complete Assessment
                </ReusableButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alerts */}
      {(saveAnswersError || completeResponseError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {saveAnswersError && "Failed to save responses. Please try again."}
            {completeResponseError && "Failed to complete assessment. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Completion Results */}
      {isCompleted && maturityScores && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Assessment Complete</CardTitle>
            <CardDescription>
              Thank you for completing the {questionnaire.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-[#005DAA]">
                  {Math.round(maturityScores.overallAverage * 20)}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-[#005DAA]">
                  {maturityScores.totalScore || 0}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <div className="text-2xl font-bold text-[#005DAA]">
                  {Object.keys(maturityScores.averageScores).length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}