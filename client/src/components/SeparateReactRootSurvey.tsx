import React, { useEffect, useRef } from 'react';
import { mountIsolatedSurvey } from './IsolatedSurveyRoot';

interface SeparateReactRootSurveyProps {
  questionnaireId: string;
  onSave: (data: any) => Promise<void>;
  onComplete: (data: any) => void;
  onSaveStatusChange?: (status: { isSaving: boolean; lastSaved: Date | null; hasUnsavedChanges: boolean }) => void;
}

// This component creates a separate React root for Survey.js
// It's completely isolated from the main React tree and its re-renders
export function SeparateReactRootSurvey({ 
  questionnaireId, 
  onSave, 
  onComplete,
  onSaveStatusChange 
}: SeparateReactRootSurveyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const unmountRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (containerRef.current && questionnaireId) {
      // Clear any existing root
      if (unmountRef.current) {
        unmountRef.current();
      }

      // Mount new isolated root
      unmountRef.current = mountIsolatedSurvey(
        containerRef.current,
        questionnaireId,
        onSave,
        onComplete,
        onSaveStatusChange
      );
    }

    return () => {
      if (unmountRef.current) {
        // Use setTimeout to avoid synchronous unmount during render
        setTimeout(() => {
          if (unmountRef.current) {
            unmountRef.current();
            unmountRef.current = null;
          }
        }, 0);
      }
    };
  }, [questionnaireId]); // Only remount if questionnaireId changes

  // This div will never re-render its contents because 
  // the Survey is mounted in a separate React root
  return <div ref={containerRef} />;
}