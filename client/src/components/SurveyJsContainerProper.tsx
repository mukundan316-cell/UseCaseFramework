import React, { useRef, useCallback, useState } from 'react';
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

// Import Survey.js default CSS
import 'survey-core/survey-core.css';

interface SurveyJsContainerProps {
  questionnaireId: string;
  className?: string;
}

export function SurveyJsContainer({ questionnaireId }: SurveyJsContainerProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
  } = useQuestionnaire(questionnaireId);

  const [showResetDialog, setShowResetDialog] = useState(false);

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
      // Save final answers
      await saveAnswers({
        responseId: responseSession.id,
        answers: data
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

  // Show loading state
  if (isLoadingQuestionnaire || isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (!responseSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No active assessment session found.</p>
          <Button onClick={() => setLocation('/assessment')}>
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SaveStatusProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AssessmentHeader
          progress={progress}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          isCompleted={isCompleted}
          onSaveAndExit={handleSaveAndExit}
          onStartOver={handleStartOver}
          isResetting={isResettingResponse}
        />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 mt-4">
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
}