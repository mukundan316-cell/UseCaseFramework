import React, { useCallback } from 'react';
import { SeparateReactRootSurvey } from './SeparateReactRootSurvey';
import { useSaveStatus } from './SaveStatusProvider';

interface SurveyWithStatusBridgeProps {
  questionnaireId: string;
  onSave: (data: any) => Promise<void>;
  onComplete: (data: any) => void;
  handleSaveStatusChangeRef: React.MutableRefObject<((status: { isSaving: boolean; lastSaved: Date | null; hasUnsavedChanges: boolean }) => void) | null>;
}

// This component is inside SaveStatusProvider and can use the hook
export function SurveyWithStatusBridge({ 
  questionnaireId, 
  onSave, 
  onComplete, 
  handleSaveStatusChangeRef 
}: SurveyWithStatusBridgeProps) {
  const saveStatus = useSaveStatus();

  // Create the handler that bridges save status from isolated Survey to header
  const handleSaveStatusChange = useCallback((status: { isSaving: boolean; lastSaved: Date | null; hasUnsavedChanges: boolean }) => {
    console.log('🔥 BRIDGING SAVE STATUS TO HEADER:', status);
    saveStatus.setSaving(status.isSaving);
    if (status.lastSaved) saveStatus.setLastSaved(status.lastSaved);
    saveStatus.setUnsavedChanges(status.hasUnsavedChanges);
  }, [saveStatus]);

  // Store handler in ref so parent can access it
  handleSaveStatusChangeRef.current = handleSaveStatusChange;

  return (
    <SeparateReactRootSurvey
      questionnaireId={questionnaireId}
      onSave={onSave}
      onComplete={onComplete}
      onSaveStatusChange={handleSaveStatusChange}
    />
  );
}