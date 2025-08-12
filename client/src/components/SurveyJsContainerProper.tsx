import React, { useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, AlertCircle } from 'lucide-react';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { AssessmentHeader } from './AssessmentHeader';
import { SurveyWithStatusBridge } from './SurveyWithStatusBridge';
import { SaveStatusProvider } from './SaveStatusProvider';

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
    saveAnswersError,
    completeResponseError,
  } = useQuestionnaire(questionnaireId);

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

  // Simple progress calculation - no complex state dependencies
  const progress = responseSession?.answers 
    ? Math.round((Object.keys(responseSession.answers).length / 87) * 100) 
    : 0;

  const answeredCount = responseSession?.answers ? Object.keys(responseSession.answers).length : 0;
  const totalQuestions = 87;
  const isCompleted = responseSession?.status === 'completed';

  // Save and exit handler
  const handleSaveAndExit = React.useCallback(() => {
    setLocation('/assessment');
  }, [setLocation]);

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
          {(saveAnswersError || completeResponseError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {saveAnswersError?.message || completeResponseError?.message || 'An error occurred'}
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
    </SaveStatusProvider>
  );
}