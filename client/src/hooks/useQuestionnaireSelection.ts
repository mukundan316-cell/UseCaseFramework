import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface QuestionnaireDefinition {
  id: string;
  title: string;
  description?: string;
}

interface UserSession {
  id: string;
  questionnaireId: string;
  title: string;
  status: string;
  progressPercent: number;
  completedAt: string | null;
  updatedAt: string;
  isCompleted: boolean;
}

export interface QuestionnaireWithProgress {
  definition: QuestionnaireDefinition;
  session?: UserSession;
  status: string;
  progressPercent: number;
  isStarted: boolean;
  isCompleted: boolean;
}

export function useQuestionnaireDefinitions() {
  return useQuery({
    queryKey: ['/api/questionnaire/definitions'],
    queryFn: () => fetch('/api/questionnaire/definitions').then(res => res.json()) as Promise<QuestionnaireDefinition[]>
  });
}

export function useUserSessions() {
  return useQuery({
    queryKey: ['/api/responses/user-sessions'],
    queryFn: () => fetch('/api/responses/user-sessions').then(res => res.json()) as Promise<UserSession[]>
  });
}

export function useQuestionnaireSelection() {
  const { data: definitions = [], isLoading: isLoadingDefinitions } = useQuestionnaireDefinitions();
  const { data: userSessions = [], isLoading: isLoadingSessions } = useUserSessions();
  
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);

  // Combine definitions with user progress
  const questionnairesWithProgress: QuestionnaireWithProgress[] = definitions.map(definition => {
    const session = userSessions.find(s => s.questionnaireId === definition.id);
    
    let status = 'not started';
    let progressPercent = 0;
    let isStarted = false;
    let isCompleted = false;
    
    if (session) {
      status = session.status;
      progressPercent = session.progressPercent;
      isStarted = progressPercent > 0;
      isCompleted = session.isCompleted;
    }
    
    return {
      definition,
      session,
      status,
      progressPercent,
      isStarted,
      isCompleted
    };
  });

  // Selection logic: 1) first started, 2) first unstarted, 3) first completed
  const selectDefaultQuestionnaire = (): string | null => {
    if (questionnairesWithProgress.length === 0) return null;
    
    // 1. Find first started (in progress) assessment
    const started = questionnairesWithProgress.find(q => q.isStarted && !q.isCompleted);
    if (started) {
      return started.definition.id;
    }
    
    // 2. Find first unstarted assessment
    const unstarted = questionnairesWithProgress.find(q => !q.isStarted);
    if (unstarted) {
      return unstarted.definition.id;
    }
    
    // 3. Find first completed assessment
    const completed = questionnairesWithProgress.find(q => q.isCompleted);
    if (completed) {
      return completed.definition.id;
    }
    
    // Fallback to first questionnaire
    return questionnairesWithProgress[0].definition.id;
  };

  // Auto-select default questionnaire when data loads
  useEffect(() => {
    if (!selectedQuestionnaireId && questionnairesWithProgress.length > 0 && !isLoadingDefinitions && !isLoadingSessions) {
      const defaultId = selectDefaultQuestionnaire();
      if (defaultId) {
        setSelectedQuestionnaireId(defaultId);
        
        // Check if the selected questionnaire needs a session created
        const selectedQuestionnaire = questionnairesWithProgress.find(q => q.definition.id === defaultId);
        if (selectedQuestionnaire && !selectedQuestionnaire.session) {
          // This is an unstarted questionnaire - we'll need to create a session
          console.log('Auto-selected unstarted questionnaire, session will be created automatically');
        }
      }
    }
  }, [questionnairesWithProgress.length, selectedQuestionnaireId, isLoadingDefinitions, isLoadingSessions, questionnairesWithProgress]);

  const selectQuestionnaire = (questionnaireId: string) => {
    setSelectedQuestionnaireId(questionnaireId);
    localStorage.setItem('lastSelectedQuestionnaireId', questionnaireId);
  };

  const selectedQuestionnaire = questionnairesWithProgress.find(
    q => q.definition.id === selectedQuestionnaireId
  );

  return {
    questionnairesWithProgress,
    selectedQuestionnaireId,
    selectedQuestionnaire,
    selectQuestionnaire,
    isLoading: isLoadingDefinitions || isLoadingSessions
  };
}