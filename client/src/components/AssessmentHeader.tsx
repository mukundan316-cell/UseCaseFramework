import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Home, CheckCircle2, Save } from 'lucide-react';
import { useSaveStatus } from './SaveStatusProvider';

interface AssessmentHeaderProps {
  questionnaireTitle?: string;
  progress: number;
  answeredCount: number;
  totalQuestions: number;
  isCompleted: boolean;
  onSaveAndExit?: () => void;
}

// Memoized save status component that uses context
const SaveStatus = React.memo(() => {
  const { isSaving, lastSaved, hasUnsavedChanges } = useSaveStatus();
  
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

export const AssessmentHeader = React.memo(({
  questionnaireTitle = "RSA AI Strategy Assessment Framework",
  progress,
  answeredCount,
  totalQuestions,
  isCompleted,
  onSaveAndExit
}: AssessmentHeaderProps) => {
  const [, setLocation] = useLocation();

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
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
              {questionnaireTitle}
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
              <SaveStatus />
              <Button
                onClick={() => {
                  // Trigger manual save via global function
                  if ((window as any).surveyManualSave) {
                    (window as any).surveyManualSave();
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
              {onSaveAndExit && (
                <Button
                  onClick={onSaveAndExit}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save & Exit</span>
                </Button>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
});

AssessmentHeader.displayName = 'AssessmentHeader';