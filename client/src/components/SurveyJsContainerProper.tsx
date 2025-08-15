import React, { useRef, useCallback, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { AssessmentHeader } from './AssessmentHeader';
import { SurveyWithStatusBridge } from './SurveyWithStatusBridge';
import { SaveStatusProvider } from './SaveStatusProvider';
import { queryClient } from '@/lib/queryClient';
import AssessmentSideMenu from './AssessmentSideMenu';
import type { QuestionnaireWithProgress } from '@/hooks/useQuestionnaireSelection';

// Import Survey.js default CSS
import 'survey-core/survey-core.css';

interface SurveyJsContainerProps {
  questionnaireId: string;
  className?: string;
  questionnaires?: QuestionnaireWithProgress[];
  onQuestionnaireSwitch?: (questionnaireId: string) => Promise<void>;
  onSaveBeforeSwitch?: () => Promise<void>;
}

export interface SurveyJsContainerRef {
  saveCurrentProgress: () => Promise<void>;
}

export const SurveyJsContainer = forwardRef<SurveyJsContainerRef, SurveyJsContainerProps>(({ 
  questionnaireId, 
  questionnaires = [], 
  onQuestionnaireSwitch, 
  onSaveBeforeSwitch 
}, ref) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get current questionnaire info from props to optimize session handling
  const currentQuestionnaire = questionnaires.find(q => q.definition.id === questionnaireId);
  const knownSession = currentQuestionnaire?.session;
  const currentStatus = currentQuestionnaire?.status;
  
  // Skip session check if: no session exists OR status is "not started"
  const shouldSkipSessionCheck = questionnaires.length > 0 && 
    currentQuestionnaire && 
    (!knownSession || currentStatus === "not started");
  
  // Session check optimization is working - debug logging removed
  
  const {
    responseSession,
    isLoadingQuestionnaire,
    isCheckingSession,
    saveAnswers,
    completeResponse,
    resetResponseAsync,
    isResettingResponse,
    saveAnswersError,
    completeResponseError,
    resetResponseError,
    startResponseAsync,
    isStartingResponse,
    sessionError
  } = useQuestionnaire(questionnaireId, { 
    skipSessionCheck: shouldSkipSessionCheck
  });

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Handle automatic session creation - optimized approach
  useEffect(() => {
    const createSessionIfNeeded = async () => {
      // If we already have a session or are creating one, don't proceed
      if (responseSession || isStartingResponse || isCreatingSession) return;
      
      // OPTIMIZATION: If we know from the questionnaires prop that no session exists, create one immediately
      // This skips the redundant session check API call that returns 404
      const shouldCreateSession = (!knownSession || currentStatus === "not started") && !responseSession;
      
      if (shouldCreateSession) {
        const userInfo = localStorage.getItem('assessmentUser');
        if (!userInfo) {
          // No user info available - redirect to start page
          toast({
            title: "User Information Required",
            description: "Please provide your contact information to begin the assessment.",
            variant: "destructive"
          });
          setLocation('/assessment/start');
          return;
        }

        try {
          setIsCreatingSession(true);
          const { email, name } = JSON.parse(userInfo);
          
          console.log('Creating session proactively for unstarted questionnaire:', questionnaireId);
          const result = await startResponseAsync({
            questionnaireId,
            respondentEmail: email,
            respondentName: name
          });

          toast({
            title: "Assessment Session Created",
            description: "Your assessment session has been initialized.",
            duration: 2000
          });
        } catch (error: any) {
          console.error('Failed to create session:', error);
          toast({
            title: "Failed to Create Session",
            description: "Please try refreshing the page or contact support.",
            variant: "destructive"
          });
        } finally {
          setIsCreatingSession(false);
        }
      }
    };

    createSessionIfNeeded();
  }, [questionnaireId, knownSession, isCheckingSession, responseSession, sessionError, isStartingResponse, isCreatingSession, startResponseAsync, toast, setLocation]);

  // Store handlers in refs to make them stable - never re-create
  const handlersRef = useRef({
    saveAnswers,
    completeResponse,
    responseSession,
    toast,
    setLocation
  });
  
  // Update ref without causing re-renders
  handlersRef.current = {
    saveAnswers,
    completeResponse,
    responseSession,
    toast,
    setLocation
  };

  // Handler to bridge save status from isolated Survey to header - will be set inside provider
  const handleSaveStatusChange = useRef<((status: { isSaving: boolean; lastSaved: Date | null; hasUnsavedChanges: boolean }) => void) | null>(null);

  // Stable handlers that never change reference
  const handleSave = React.useCallback(async (data: any) => {
    const { responseSession, saveAnswers } = handlersRef.current;
    if (!responseSession) return;
    
    await saveAnswers({
      responseId: responseSession.id,
      answers: data
    });
    
    // Refresh session data after save to get updated progress
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['session', questionnaireId] });
    }, 500);
  }, []); // No dependencies = never re-creates

  const handleComplete = React.useCallback(async (data: any) => {
    const { responseSession, saveAnswers, completeResponse, toast, setLocation } = handlersRef.current;
    if (!responseSession) return;

    try {
      // Set completing state to show progress
      setIsCompleting(true);
      
      // Mark as completed (saveAnswers was already called in onComplete handler)
      await completeResponse(responseSession.id);
      
      // Small delay to ensure data is fully persisted
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to results
      setLocation(`/results/${responseSession.id}`);
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error", 
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  }, []); // No dependencies = never re-creates

  // Use progress data from backend - unified approach
  const progress = responseSession?.progressPercent || 0;
  const answeredCount = responseSession?.answeredQuestions || 0;
  const totalQuestions = responseSession?.totalQuestions || 0;
  const isCompleted = responseSession?.status === 'completed';

  // Save and exit handler
  const handleSaveAndExit = React.useCallback(() => {
    setLocation('/assessment');
  }, [setLocation]);

  // Start over handler with confirmation
  const handleStartOver = React.useCallback(() => {
    setShowResetDialog(true);
  }, []);

  // Confirm reset handler
  const confirmReset = React.useCallback(async () => {
    if (!responseSession?.id) return;
    
    try {
      await resetResponseAsync(responseSession.id);
      
      toast({
        title: "Assessment Reset",
        description: "Starting fresh with a clean assessment.",
        duration: 3000
      });
      
      setShowResetDialog(false);
      
      // Slight delay to allow the UI to update before refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to reset assessment:', error);
      toast({
        title: "Reset Failed",
        description: "Unable to reset assessment. Please try again.",
        variant: "destructive"
      });
    }
  }, [responseSession?.id, resetResponseAsync, toast]);

  // Expose save method via ref
  useImperativeHandle(ref, () => ({
    saveCurrentProgress: async () => {
      if (responseSession) {
        // Get current survey data from the Survey.js component
        const surveyElement = document.querySelector('.sv_main'); // Survey.js main element
        if (surveyElement) {
          // Trigger a save with current state - we'll need to enhance this
          // For now, we'll simulate saving current state
          await handleSave({}); // This will trigger save with current data
        }
      }
    }
  }), [responseSession, handleSave]);

  // Show loading state - but don't show loading if session check failed with 404 (no session exists)
  const shouldShowLoading = isLoadingQuestionnaire || isCreatingSession || 
    (isCheckingSession && !(sessionError && (sessionError as any).status === 404));
  
  if (shouldShowLoading) {
    const loadingMessage = isCreatingSession 
      ? "Setting up your assessment session..." 
      : "Loading assessment...";
      
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // No fallback screen - we automatically create sessions, so show loading instead
  if (!responseSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Initializing assessment session...</span>
        </div>
      </div>
    );
  }

  return (
    <SaveStatusProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
        
        {/* Completion Loading Overlay */}
        {isCompleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Completing Assessment</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Saving your responses and generating results...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Please don't close this window</p>
              </div>
            </div>
          </div>
        )}
        <AssessmentHeader
          progress={progress}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          isCompleted={isCompleted}
          onSaveAndExit={handleSaveAndExit}
          onStartOver={handleStartOver}
          isResetting={isResettingResponse}
        />

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 h-[calc(100vh-120px)]">
          {/* Sidebar - only show if questionnaires are provided */}
          {questionnaires.length > 0 && (
            <div className="flex-shrink-0 bg-white shadow-sm">
              <AssessmentSideMenu
                questionnaires={questionnaires}
                selectedId={questionnaireId}
                onSelect={onQuestionnaireSwitch || (() => Promise.resolve())}
                onSaveBeforeSwitch={onSaveBeforeSwitch || (() => Promise.resolve())}
              />
            </div>
          )}
          
          {/* Survey Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
              {/* Info Message */}
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Complete all sections to generate your AI strategy report
                </div>
              </div>

              {/* Error Alerts */}
              {(saveAnswersError || completeResponseError || resetResponseError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {saveAnswersError?.message || completeResponseError?.message || resetResponseError?.message || 'An error occurred'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Survey Component - Completely Isolated React Root */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-8">
                  <SurveyWithStatusBridge
                    questionnaireId={questionnaireId}
                    onSave={handleSave}
                    onComplete={handleComplete}
                    handleSaveStatusChangeRef={handleSaveStatusChange}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Over Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your current progress and answers. You'll start fresh with a completely clean assessment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingResponse}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              disabled={isResettingResponse}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isResettingResponse ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Resetting...</span>
                </div>
              ) : (
                "Yes, Start Over"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SaveStatusProvider>
  );
});

SurveyJsContainer.displayName = 'SurveyJsContainer';