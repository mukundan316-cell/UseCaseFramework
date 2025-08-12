import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';

import { ChevronLeft, ChevronRight, Save, CheckCircle2, AlertCircle, Clock, Wifi, WifiOff, ArrowLeft, Home, Download } from 'lucide-react';
import ExportButton from './lego-blocks/ExportButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import SectionLegoBlock from './lego-blocks/SectionLegoBlock';
import ReusableButton from './lego-blocks/ReusableButton';
import { useQuestionnaire, type ResponseSession, type QuestionData } from '@/hooks/useQuestionnaire';
import { useProgressPersistence } from '@/hooks/useProgressPersistence';
import { ProgressStatusLegoBlock } from './lego-blocks/ProgressStatusLegoBlock';

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
  const [, setLocation] = useLocation();
  
  // State management
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responseSession, setResponseSession] = useState<ResponseSession | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
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

  // Enhanced progress persistence
  const progressPersistence = useProgressPersistence({
    storageKey: `questionnaire-progress-${questionnaireId}`,
    autoSaveDelay: 1000,
    enableToasts: false  // Disable intrusive saving notifications
  });

  const {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    debouncedSave,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    setLastSaved,
    setIsSaving,
    setHasUnsavedChanges
  } = progressPersistence;

  // Enhanced debounced save function
  const debouncedSaveAnswers = useCallback(
    debouncedSave(async (responseId: string, answers: Map<string, any>) => {
      if (answers.size === 0) return;
      
      const answersArray = Array.from(answers.entries()).map(([questionId, value]) => {
        // Find question type from questionnaire data
        const questionType = questionnaire?.sections
          ?.flatMap(section => section.questions)
          ?.find(q => q.id === questionId)?.questionType;
          
        return {
          questionId,
          questionType,
          // Enhanced serialization: complex objects are JSON stringified, primitives stay as strings
          // Server-side will parse JSON strings back to objects for proper JSONB storage
          answerValue: typeof value === 'object' && value !== null 
            ? JSON.stringify(value) 
            : String(value || ''),
          score: typeof value === 'number' ? value : undefined
        };
      });
      
      await saveAnswers({ responseId, answers: answersArray });
      
      // Also save to localStorage with enhanced metadata
      if (questionnaire) {
        saveToStorage({
          responseId,
          questionnaireId,
          answers: Object.fromEntries(answers),
          currentSection: currentSectionIndex,
          currentQuestionIndex: 0,
          email: respondentEmail,
          name: respondentName,
          lastSaved: new Date().toLocaleString(),
          timestamp: Date.now(),
          totalSections: questionnaire.sections.length,
          completionPercentage: Math.round(((currentSectionIndex + 1) / questionnaire.sections.length) * 100),
          sectionProgress: []
        });
      }
    }, 1000),
    [saveAnswers, debouncedSave, saveToStorage, questionnaireId, currentSectionIndex, respondentEmail, respondentName, questionnaire]
  );

  // Auto-save when responses change
  useEffect(() => {
    if (responseSession && responses.size > 0) {
      setHasUnsavedChanges(true);
      debouncedSaveAnswers(responseSession.id, responses);
    }
  }, [responses, responseSession, debouncedSaveAnswers]);

  // Enhanced progress recovery on component mount with session restoration
  useEffect(() => {
    const checkExistingSession = async () => {
      setIsCheckingSession(true);
      const savedProgress = loadFromStorage();
      
      if (savedProgress) {
        try {
          // Check if the saved response is completed - if so, don't restore it
          const response = await fetch(`/api/responses/${savedProgress.responseId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'completed') {
              // Clear the saved progress for completed assessments
              clearStorage();
              toast({
                title: "Starting Fresh",
                description: "Previous assessment was completed. Ready to start new assessment.",
                duration: 3000
              });
              setIsCheckingSession(false);
              return;
            }
          }
          
          // Only restore if assessment is still in progress
          setResponseSession({ 
            id: savedProgress.responseId, 
            status: 'started',
            questionnaireId: savedProgress.questionnaireId,
            respondentEmail: savedProgress.email,
            respondentName: savedProgress.name
          } as ResponseSession);
          setResponses(new Map(Object.entries(savedProgress.answers || {})));
          setCurrentSectionIndex(savedProgress.currentSection || 0);
          setRespondentEmail(savedProgress.email || '');
          setRespondentName(savedProgress.name || '');
          setHasStarted(true);
          
          toast({
            title: "Session Resumed",
            description: `Continuing from ${savedProgress.completionPercentage || 0}% completion`,
            duration: 3000
          });
        } catch (error) {
          console.error('Error checking response status:', error);
          // If we can't check the status, clear storage to be safe
          clearStorage();
        }
      }
      
      setIsCheckingSession(false);
    };
    
    checkExistingSession();
  }, [questionnaireId, toast, loadFromStorage, clearStorage]);

  // Enhanced progress save (now handled by useProgressPersistence)
  const saveProgressToStorage = useCallback(() => {
    if (responseSession && responses.size > 0 && questionnaire) {
      saveToStorage({
        responseId: responseSession.id,
        questionnaireId,
        answers: Object.fromEntries(responses),
        currentSection: currentSectionIndex,
        currentQuestionIndex: 0,
        email: respondentEmail,
        name: respondentName,
        lastSaved: new Date().toLocaleString(),
        timestamp: Date.now(),
        totalSections: questionnaire.sections.length,
        completionPercentage: Math.round(((currentSectionIndex + 1) / questionnaire.sections.length) * 100),
        sectionProgress: []
      });
    }
  }, [responseSession, responses, currentSectionIndex, respondentEmail, respondentName, questionnaireId, questionnaire, saveToStorage]);

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
        const answersArray = Array.from(responses.entries()).map(([questionId, value]) => {
          // Find question type from questionnaire data
          const questionType = questionnaire?.sections
            ?.flatMap(section => section.questions)
            ?.find(q => q.id === questionId)?.questionType;
            
          return {
            questionId,
            questionType,
            // Enhanced serialization: complex objects are JSON stringified, primitives stay as strings
            // Server-side will parse JSON strings back to objects for proper JSONB storage
            answerValue: typeof value === 'object' && value !== null 
              ? JSON.stringify(value) 
              : String(value || ''),
            score: typeof value === 'number' ? value : undefined
          };
        });
        
        await saveAnswers({ responseId: responseSession.id, answers: answersArray });
        saveProgressToStorage();
        
        toast({
          title: "Progress saved",
          description: "Your answers have been saved. You can resume later.",
          duration: 3000
        });
        
        // Navigate back to assessment landing page
        setTimeout(() => {
          setLocation('/assessment');
        }, 1000);
        
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
      const requestData = {
        questionnaireId,
        respondentEmail: respondentEmail.trim(),
        respondentName: respondentName.trim() || undefined,
        metadata: {
          startedAt: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };
      
      console.log('Starting assessment with data:', requestData);
      const result = await startResponseAsync(requestData);

      if (result) {
        setResponseSession(result);
        console.log('Assessment started successfully:', result);
      }
    } catch (error) {
      console.error('Failed to start response:', error);
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Failed to Start Assessment",
        description: errorMessage.includes('Validation error') 
          ? "Please check your input and try again." 
          : "Unable to begin the assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Simplified validation - allowing progress while maintaining LEGO framework
  const validateCurrentSection = useCallback(() => {
    if (!questionnaire || !questionnaire.sections[currentSectionIndex]) {
      return true;
    }

    const currentSection = questionnaire.sections[currentSectionIndex];
    const newErrors: Record<string, string> = {};
    
    // Only validate truly critical question-level requirements
    currentSection.questions.forEach((question: QuestionData) => {
      // Only block on explicit question-level requirements that are absolutely critical
      if (question.isRequired === true || question.isRequired === 'true' || question.isRequired as any === true) {
        const value = responses.get(question.id);
        // More lenient validation - allow progression with any data present
        if (value === undefined || value === null) {
          // Only show error if completely empty, not if partial data exists
          if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
            newErrors[question.id] = 'This field is required';
          }
        }
      }
      
      // Remove field-level validation that was causing blocking issues
      // Allow users to progress through assessment without strict field requirements
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [questionnaire, currentSectionIndex, responses]);

  // Navigate to next section with relaxed validation
  const handleNextSection = () => {
    // Allow progression even with validation warnings
    // Users can return to complete fields later if needed
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

  // Handle successful completion
  useEffect(() => {
    if (responseData && responseData.status === 'completed') {
      toast({
        title: "Assessment Completed!",
        description: "Redirecting to your results...",
        duration: 3000
      });
      
      // Navigate to results page
      setTimeout(() => {
        setLocation(`/results/${responseSession?.id}`);
      }, 1500);
    }
  }, [responseData, setLocation, responseSession, toast]);

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

  // Calculate overall progress (removed duplicate - using calculateOverallProgress function instead)

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
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Navigation Header for Email Capture */}
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

  // Calculate global question numbers across all sections
  const getAllQuestions = () => {
    const allQuestions: Array<QuestionData & { globalQuestionNumber: number }> = [];
    let globalQuestionNumber = 1;
    
    questionnaire.sections.forEach((section) => {
      section.questions.forEach((question) => {
        allQuestions.push({
          ...question,
          globalQuestionNumber
        });
        globalQuestionNumber++;
      });
    });
    
    return allQuestions;
  };

  // Get questions for current section with global numbering
  const getCurrentSectionQuestions = () => {
    const allQuestions = getAllQuestions();
    let startIndex = 0;
    
    for (let i = 0; i < currentSectionIndex; i++) {
      startIndex += questionnaire.sections[i].questions.length;
    }
    
    return allQuestions.slice(startIndex, startIndex + currentSection.questions.length);
  };

  // Calculate total answered questions across all sections for progress
  const calculateOverallProgress = () => {
    const allQuestions = getAllQuestions();
    const answeredCount = allQuestions.filter(q => {
      const answer = responses.get(q.id);
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
    
    return Math.round((answeredCount / allQuestions.length) * 100);
  };

  const currentOverallProgress = calculateOverallProgress();

  // Add safety check for currentSection
  if (!currentSection) {
    return (
      <div className={cn("max-w-4xl mx-auto p-6 space-y-6", className)}>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">Loading section...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <span className="font-medium text-[#005DAA]">{currentOverallProgress}%</span>
            </div>
            <Progress value={currentOverallProgress} className="h-2" />
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

      {/* Current Section */}
      <SectionLegoBlock
        section={{
          ...currentSection,
          questions: getCurrentSectionQuestions().map(q => ({
            ...q,
            questionOrder: q.globalQuestionNumber,
            isRequired: q.isRequired === true || q.isRequired === 'true' || q.isRequired as any === true
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
            
            {/* Export Assessment Report Button */}
            <div className="mt-6 flex justify-center">
              <ExportButton 
                exportType="assessment"
                exportId={responseSession?.id}
                variant="default"
                size="lg"
                className="bg-[#005DAA] hover:bg-[#004A8C] text-white px-8 py-3"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Full Report
              </ExportButton>
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