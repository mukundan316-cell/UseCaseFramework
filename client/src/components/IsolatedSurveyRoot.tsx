import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import { apiRequest } from '@/lib/queryClient';

interface IsolatedSurveyRootProps {
  questionnaireId: string;
  onSave: (data: any) => Promise<void>;
  onComplete: (data: any) => void;
  containerElement: HTMLDivElement;
  onSaveStatusChange?: (status: { isSaving: boolean; lastSaved: Date | null; hasUnsavedChanges: boolean }) => void;
}

// This component runs in its OWN React root, completely isolated
function IsolatedSurveyComponent({ questionnaireId, onSave, onComplete, containerElement, onSaveStatusChange }: IsolatedSurveyRootProps) {
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);



  // Load session and survey config
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Load session
        const sessionData = await apiRequest(`/api/responses/check-session?questionnaireId=${questionnaireId}`);

        
        if (isMounted) {
          setSession(sessionData);
        }

        // Load survey config
        const surveyConfig = await apiRequest(`/api/survey-config/${questionnaireId}`);

        // Load existing answers from session data (already included in check-session response)
        let existingAnswers = {};
        if (sessionData?.answers) {
          // Convert answer array to Survey.js data format
          // Filter out corrupted nested answers and only use the clean ones
          sessionData.answers.forEach((answer: any) => {
            // Skip answers with questionId that are numeric strings (corrupted data)
            if (answer.questionId && !answer.questionId.match(/^\d+$/)) {
              // Only use answers where answerValue is a primitive value, not an object
              if (typeof answer.answerValue !== 'object') {
                existingAnswers[answer.questionId] = answer.answerValue;
              }
            }
          });
          console.log('Filtered existing answers:', existingAnswers);
        }

        if (isMounted) {
          const survey = new Model(surveyConfig);
          
          // Load existing answers into survey
          if (Object.keys(existingAnswers).length > 0) {
            survey.data = existingAnswers;
            console.log('Loaded existing answers:', existingAnswers);
          }

          // Manual save handler
          const handleManualSave = async (data: any) => {
            if (!sessionData) return;
            
            setIsSaving(true);
            onSaveStatusChange?.({ isSaving: true, lastSaved, hasUnsavedChanges });
            try {
              await onSave(data);
              const savedTime = new Date();
              setLastSaved(savedTime);
              setHasUnsavedChanges(false);
              onSaveStatusChange?.({ isSaving: false, lastSaved: savedTime, hasUnsavedChanges: false });
            } catch (error) {
              console.error('Save error:', error);
              onSaveStatusChange?.({ isSaving: false, lastSaved, hasUnsavedChanges: true });
            } finally {
              setIsSaving(false);
            }
          };

          // Expose manual save function globally for button access
          (window as any).surveyManualSave = () => {
            if (survey) {
              handleManualSave(survey.data);
            }
          };

          // Set up event handlers
          survey.onValueChanged.add((sender: Model, options: any) => {
            setHasUnsavedChanges(true);
            onSaveStatusChange?.({ isSaving: false, lastSaved, hasUnsavedChanges: true });
          });

          // Save on page change
          survey.onCurrentPageChanged.add((sender: Model) => {
            handleManualSave(sender.data);
          });

          survey.onComplete.add(() => {
            onComplete(survey.data);
          });

          setSurveyModel(survey);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Load error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [questionnaireId, onSave, onComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (!surveyModel) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load assessment questions.</p>
      </div>
    );
  }

  return (
    <div>
      <Survey model={surveyModel} />
    </div>
  );
}

// Mount Survey.js in completely separate React root
export function mountIsolatedSurvey(
  containerElement: HTMLDivElement,
  questionnaireId: string,
  onSave: (data: any) => Promise<void>,
  onComplete: (data: any) => void,
  onSaveStatusChange?: (status: { isSaving: boolean; lastSaved: Date | null; hasUnsavedChanges: boolean }) => void
) {
  const root = createRoot(containerElement);
  
  root.render(
    <IsolatedSurveyComponent
      questionnaireId={questionnaireId}
      onSave={onSave}
      onComplete={onComplete}
      containerElement={containerElement}
      onSaveStatusChange={onSaveStatusChange}
    />
  );

  return () => {
    root.unmount();
  };
}