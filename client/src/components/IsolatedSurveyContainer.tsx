import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useSaveStatus } from './SaveStatusProvider';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface IsolatedSurveyContainerProps {
  questionnaireId: string;
  onSave: (data: any) => Promise<void>;
  onComplete: (data: any) => Promise<void>;
}

export const IsolatedSurveyContainer = React.memo(({
  questionnaireId,
  onSave,
  onComplete
}: IsolatedSurveyContainerProps) => {
  console.log('🔥 ISOLATED SURVEY CONTAINER RE-RENDER - questionnaireId:', questionnaireId);
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [initialAnswersLoaded, setInitialAnswersLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Create internal save status state - completely isolated from context
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Freeze session data permanently and disable React Query after first load
  const [frozenSession, setFrozenSession] = useState<any>(null);
  const [disableQuery, setDisableQuery] = useState(false);
  
  // Completely bypass React Query - direct API call only once
  useEffect(() => {
    if (!frozenSession && !disableQuery && questionnaireId) {
      console.log('🔥 DIRECT API CALL FOR SESSION DATA');
      apiRequest(`/api/responses/check-session?questionnaireId=${questionnaireId}`)
        .then((data) => {
          console.log('🔥 DIRECT API RESPONSE:', data);
          setFrozenSession(data);
          setDisableQuery(true);
        })
        .catch((error) => {
          console.error('🔥 DIRECT API ERROR:', error);
        });
    }
  }, [questionnaireId, frozenSession, disableQuery]);
  
  // No longer needed - session is fetched directly without React Query
  
  // Always use frozen data once it's set
  const activeSession = frozenSession;
  
  console.log('🔥 ACTIVE SESSION STATE:', { activeSession: !!activeSession, frozenSession: !!frozenSession });

  // Auto-save handler with isolated UI feedback - no external context dependencies
  const handleAutoSave = useCallback(async (data: any) => {
    console.log('🔥 HANDLE AUTO-SAVE CALLED:', { activeSession: !!activeSession, data });
    if (!activeSession) {
      console.log('🔥 NO ACTIVE SESSION - ABORTING AUTO-SAVE');
      return;
    }

    console.log('🔥 STARTING AUTO-SAVE PROCESS');
    setIsSaving(true);
    try {
      await onSave(data);
      console.log('🔥 AUTO-SAVE SUCCESSFUL');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('🔥 AUTO-SAVE FAILED:', error);
    } finally {
      setIsSaving(false);
      console.log('🔥 AUTO-SAVE PROCESS COMPLETE');
    }
  }, [onSave, activeSession]);

  // Survey completion handler
  const handleComplete = useCallback(async (survey: Model) => {
    if (!activeSession) return;
    
    try {
      await onComplete(survey.data);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  }, [onComplete, activeSession]);

  // Load Survey.js configuration - this only runs once
  useEffect(() => {
    let isMounted = true;
    console.log('🔥 SURVEY EFFECT TRIGGERED - questionnaireId:', questionnaireId, 'frozenSession:', !!frozenSession);
    
    const loadSurveyConfig = async () => {
      if (!questionnaireId) {
        console.log('🔥 NO QUESTIONNAIRE ID - EXITING');
        return;
      }
      
      console.log('🔥 STARTING SURVEY CONFIG LOAD');
      setIsLoadingSurvey(true);
      try {
        const response = await fetch(`/api/survey-config/${questionnaireId}`);
        if (!response.ok) {
          throw new Error(`Failed to load survey config: ${response.status}`);
        }
        
        const surveyJson = await response.json();
        console.log('Loaded survey config:', surveyJson);
        
        if (!isMounted) return;
        
        const survey = new Model(surveyJson);
        
        // Configure the survey
        survey.showProgressBar = "top";
        survey.progressBarType = "pages";
        survey.showNavigationButtons = "bottom";
        survey.showTitle = true;
        survey.showPageTitles = true;
        survey.goNextPageAutomatic = false;
        survey.checkErrorsMode = "onValueChanged";
        survey.showQuestionNumbers = "onPage";
        survey.questionErrorLocation = "bottom";
        survey.questionTitleLocation = "top";
        survey.requiredText = "*";
        survey.questionDescriptionLocation = "underTitle";
        
        // Modern styling with improved spacing for sticky header
        survey.applyTheme({
          "cssVariables": {
            "--sjs-corner-radius": "8px",
            "--sjs-base-unit": "8px",
            "--sjs-primary-color": "#005DAA",
            "--sjs-primary-forecolor": "#ffffff",
            "--sjs-secondary-color": "#f3f4f6",
            "--sjs-general-backcolor": "#ffffff",
            "--sjs-general-backcolor-dim": "#f9fafb",
            "--sjs-general-forecolor": "#374151",
            "--sjs-general-dim-forecolor": "#6b7280",
            "--sjs-border-light": "#e5e7eb"
          }
        });
        
        // Ensure proper spacing for sticky header
        survey.css = {
          ...survey.css,
          page: {
            ...survey.css?.page,
            paddingTop: "0"
          }
        };

        // Load existing answers only once on initial load
        if (frozenSession?.answers && !initialAnswersLoaded) {
          console.log('🔥 LOADING EXISTING ANSWERS - count:', frozenSession.answers.length);
          const surveyData: any = {};
          if (Array.isArray(frozenSession.answers)) {
            frozenSession.answers.forEach((answer: any) => {
              try {
                if (answer.questionId && answer.answerValue !== undefined) {
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
          survey.data = surveyData;
          setInitialAnswersLoaded(true);
          console.log('🔥 SET SURVEY DATA:', surveyData);
        } else {
          console.log('🔥 SKIPPING ANSWER LOAD - frozenSession.answers:', !!frozenSession?.answers, 'initialAnswersLoaded:', initialAnswersLoaded);
        }

        // Set up event handlers - no form activity tracking needed since session is permanently frozen
        const valueChangedHandler = (sender: any, options: any) => {
          console.log('🔥 VALUE CHANGED EVENT:', {
            question: options?.name,
            value: options?.value,
            surveyData: survey.data
          });
          setHasUnsavedChanges(true);
          // Clear existing timeout
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          // Debounced auto-save
          saveTimeoutRef.current = setTimeout(() => {
            console.log('🔥 TRIGGERING AUTO-SAVE WITH DATA:', survey.data);
            handleAutoSave(survey.data);
          }, 2000);
        };
        
        survey.onValueChanged.add(valueChangedHandler);
        survey.onComplete.add(() => handleComplete(survey));

        console.log('🔥 SETTING SURVEY MODEL - about to call setSurveyModel');
        setSurveyModel(survey);
        console.log('🔥 SURVEY MODEL SET SUCCESSFULLY');
      } catch (error) {
        console.error('🔥 ERROR LOADING SURVEY CONFIG:', error);
      } finally {
        if (isMounted) {
          setIsLoadingSurvey(false);
          console.log('🔥 SURVEY LOADING COMPLETE');
        }
      }
    };

    loadSurveyConfig();
    
    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [questionnaireId, frozenSession]); // Only load once when session is frozen

  if (isLoadingSurvey) {
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

  // Show isolated save status within the survey component
  const renderSaveStatus = () => {
    if (isSaving) {
      return (
        <div className="flex items-center text-blue-600 text-sm mb-4">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          Saving...
        </div>
      );
    }
    if (lastSaved) {
      return (
        <div className="text-green-600 text-sm mb-4">
          ✓ Saved {lastSaved.toLocaleTimeString()}
        </div>
      );
    }
    if (hasUnsavedChanges) {
      return (
        <div className="text-orange-600 text-sm mb-4">
          • Unsaved changes
        </div>
      );
    }
    return null;
  };

  console.log('🔥 RENDERING SURVEY COMPONENT - model exists:', !!surveyModel);
  return (
    <div>
      {renderSaveStatus()}
      <Survey model={surveyModel} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if questionnaireId changes - ignore ALL other prop changes
  const shouldSkipRender = prevProps.questionnaireId === nextProps.questionnaireId;
  console.log('🔥 MEMO COMPARISON - shouldSkipRender:', shouldSkipRender, {
    prevQuestionnaireId: prevProps.questionnaireId,
    nextQuestionnaireId: nextProps.questionnaireId
  });
  return shouldSkipRender;
});

IsolatedSurveyContainer.displayName = 'IsolatedSurveyContainer';