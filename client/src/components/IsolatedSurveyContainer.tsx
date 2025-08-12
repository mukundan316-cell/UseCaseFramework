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
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [initialAnswersLoaded, setInitialAnswersLoaded] = useState(false);
  const { setSaving, setLastSaved, setUnsavedChanges } = useSaveStatus();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Freeze session data permanently and disable React Query after first load
  const [frozenSession, setFrozenSession] = useState<any>(null);
  const [disableQuery, setDisableQuery] = useState(false);
  
  // Direct query that we can disable after first load
  const { data: responseSession } = useQuery({
    queryKey: ['session', questionnaireId],
    queryFn: () => apiRequest('/api/responses/check-session'),
    enabled: !disableQuery,
    staleTime: Infinity, // Never refetch automatically
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  
  // Freeze session data permanently and disable query to prevent ANY future updates
  useEffect(() => {
    console.log('🔥 SESSION FREEZE EFFECT - responseSession:', !!responseSession, 'frozenSession:', !!frozenSession, 'disableQuery:', disableQuery);
    if (responseSession && !frozenSession) {
      console.log('🔥 FREEZING SESSION DATA');
      setFrozenSession(responseSession);
      setDisableQuery(true); // Disable query forever after first load
      console.log('🔥 SESSION FROZEN AND QUERY DISABLED:', responseSession);
    }
  }, [responseSession, frozenSession, disableQuery]);
  
  // Always use frozen data once it's set
  const activeSession = frozenSession;

  // Auto-save handler with proper UI feedback
  const handleAutoSave = useCallback(async (data: any) => {
    console.log('🔥 HANDLE AUTO-SAVE CALLED:', { activeSession: !!activeSession, data });
    if (!activeSession) {
      console.log('🔥 NO ACTIVE SESSION - ABORTING AUTO-SAVE');
      return;
    }

    console.log('🔥 STARTING AUTO-SAVE PROCESS');
    setSaving(true);
    try {
      await onSave(data);
      console.log('🔥 AUTO-SAVE SUCCESSFUL');
      setLastSaved(new Date());
      setUnsavedChanges(false);
    } catch (error) {
      console.error('🔥 AUTO-SAVE FAILED:', error);
    } finally {
      setSaving(false);
      console.log('🔥 AUTO-SAVE PROCESS COMPLETE');
    }
  }, [onSave, setSaving, setLastSaved, setUnsavedChanges, activeSession]);

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
          setUnsavedChanges(true);
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

  console.log('🔥 RENDERING SURVEY COMPONENT - model exists:', !!surveyModel);
  return <Survey model={surveyModel} />;
});

IsolatedSurveyContainer.displayName = 'IsolatedSurveyContainer';