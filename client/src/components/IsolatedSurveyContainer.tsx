import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useSaveStatus } from './SaveStatusProvider';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';

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
  
  // Use query but prevent updates during active editing
  const [isFormActive, setIsFormActive] = useState(false);
  const [frozenSession, setFrozenSession] = useState<any>(null);
  
  const { responseSession } = useQuestionnaire(questionnaireId);
  
  // Freeze session data when form becomes active
  useEffect(() => {
    if (responseSession && !frozenSession) {
      setFrozenSession(responseSession);
      console.log('Froze initial session data:', responseSession);
    }
  }, [responseSession, frozenSession]);
  
  // Use frozen data during active editing, live data when idle
  const activeSession = isFormActive ? frozenSession : responseSession;

  // Auto-save handler with proper UI feedback
  const handleAutoSave = useCallback(async (data: any) => {
    if (!activeSession) return;

    setSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
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
    
    const loadSurveyConfig = async () => {
      if (!questionnaireId) return;
      
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
          console.log('Loaded existing answers:', surveyData);
        }

        // Set up event handlers with form activity tracking
        const valueChangedHandler = () => {
          setIsFormActive(true); // Freeze session data during editing
          setUnsavedChanges(true);
          // Clear existing timeout
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          // Debounced auto-save
          saveTimeoutRef.current = setTimeout(() => {
            handleAutoSave(survey.data);
            // Allow session updates again after save completes
            setTimeout(() => setIsFormActive(false), 100);
          }, 2000);
        };
        
        survey.onValueChanged.add(valueChangedHandler);
        survey.onComplete.add(() => handleComplete(survey));

        setSurveyModel(survey);
      } catch (error) {
        console.error('Error loading Survey.js config:', error);
      } finally {
        if (isMounted) {
          setIsLoadingSurvey(false);
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
  }, [questionnaireId, frozenSession]); // Only load once when we have frozen session data

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

  return <Survey model={surveyModel} />;
});

IsolatedSurveyContainer.displayName = 'IsolatedSurveyContainer';