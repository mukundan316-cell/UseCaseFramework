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
  const { data: definitions = [] } = useQuestionnaireDefinitions();
  const { data: userSessions = [] } = useUserSessions();
  
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

  // Selection logic: 1) not started, 2) in progress, 3) completed
  const selectDefaultQuestionnaire = (): string | null => {
    if (questionnairesWithProgress.length === 0) return null;
    
    // Check localStorage for last selection
    const lastSelected = localStorage.getItem('lastSelectedQuestionnaireId');
    if (lastSelected && questionnairesWithProgress.some(q => q.definition.id === lastSelected)) {
      return lastSelected;
    }
    
    // Find first not started questionnaire
    const notStarted = questionnairesWithProgress.find(q => !q.isStarted);
    if (notStarted) return notStarted.definition.id;
    
    // Find first in-progress (highest progress)
    const inProgress = questionnairesWithProgress
      .filter(q => q.isStarted && !q.isCompleted)
      .sort((a, b) => b.progressPercent - a.progressPercent);
    if (inProgress.length > 0) return inProgress[0].definition.id;
    
    // Find first completed (most recently updated)
    const completed = questionnairesWithProgress
      .filter(q => q.isCompleted)
      .sort((a, b) => {
        const dateA = new Date(a.session?.updatedAt || 0);
        const dateB = new Date(b.session?.updatedAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    if (completed.length > 0) return completed[0].definition.id;
    
    // Fallback to first questionnaire
    return questionnairesWithProgress[0].definition.id;
  };

  // Auto-select default questionnaire when data loads
  useEffect(() => {
    if (!selectedQuestionnaireId && questionnairesWithProgress.length > 0) {
      const defaultId = selectDefaultQuestionnaire();
      if (defaultId) {
        setSelectedQuestionnaireId(defaultId);
      }
    }
  }, [questionnairesWithProgress.length, selectedQuestionnaireId]);

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
    isLoading: !definitions.length || !userSessions.length
  };
}