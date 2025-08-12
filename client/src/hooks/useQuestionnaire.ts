import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface QuestionnaireData {
  id: string;
  title: string;
  description: string;
  version: string;
  status: string;
  sections: SectionData[];
}

export interface SectionData {
  id: string;
  title: string;
  sectionOrder: number;
  estimatedTime?: number;
  questions: QuestionData[];
}

export interface QuestionData {
  id: string;
  questionText: string;
  questionType: 'score' | 'scale' | 'multi_choice' | 'select' | 'checkbox' | 'text' | 'textarea' | 'number';
  isRequired: string; // 'true' or 'false' from database
  questionOrder?: number;
  helpText?: string;
  options?: QuestionOption[];
  minValue?: number;
  maxValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  questionData?: Record<string, any>; // For advanced question types with field configurations
}

export interface QuestionOption {
  id: string;
  optionText: string;
  optionValue: string;
  scoreValue?: number;
  optionOrder: number;
}

export interface ResponseSession {
  id: string;
  questionnaireId: string;
  respondentEmail: string;
  respondentName?: string;
  status: 'started' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  totalScore?: number;
  metadata?: string;
}

export interface SaveAnswerData {
  answers: any; // Survey.js data format
}

export interface MaturityScores {
  responseId: string;
  totalScore?: number;
  completedAt?: string;
  averageScores: Record<string, {
    average: number;
    count: number;
    total: number;
  }>;
  maturityLevels: Record<string, {
    average: number;
    count: number;
    total: number;
    level: string;
    percentage: number;
  }>;
  overallAverage: number;
}

/**
 * Custom hook for questionnaire data fetching and management
 * Follows existing patterns from UseCaseContext for consistency
 */
export function useQuestionnaire(questionnaireId: string) {
  const queryClient = useQueryClient();

  // Fetch questionnaire with sections and questions
  const {
    data: questionnaire,
    isLoading: isLoadingQuestionnaire,
    error: questionnaireError
  } = useQuery<QuestionnaireData>({
    queryKey: ['questionnaire', questionnaireId],
    queryFn: () => apiRequest(`/api/questionnaires/${questionnaireId}`),
    enabled: !!questionnaireId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Start response session mutation
  const startResponseMutation = useMutation({
    mutationFn: (data: {
      questionnaireId: string;
      respondentEmail: string;
      respondentName?: string;
      metadata?: Record<string, any>;
    }) => apiRequest('/api/responses/start', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      // Update both session and response caches
      queryClient.setQueryData(['session', questionnaireId], data);
      queryClient.setQueryData(['response', data.responseId], data);
    }
  });

  // Save answers mutation with debouncing support
  const saveAnswersMutation = useMutation({
    mutationFn: ({ responseId, answers }: { responseId: string; answers: any }) => 
      apiRequest(`/api/responses/${responseId}/answers`, {
        method: 'PUT',
        body: JSON.stringify({ answers })
      }),
    onSuccess: (data, variables) => {
      // Do NOT invalidate queries during auto-save to prevent race conditions
      // The survey form should remain the source of truth during active editing
      // Only sync in one direction: form → server during auto-save
    }
  });

  // Complete response mutation
  const completeResponseMutation = useMutation({
    mutationFn: (responseId: string) => 
      apiRequest(`/api/responses/${responseId}/complete`, {
        method: 'POST'
      }),
    onSuccess: (data) => {
      // Update response data and invalidate scores for completion
      queryClient.setQueryData(['response', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['scores', data.id] });
      // Also invalidate session to reflect completion status
      queryClient.invalidateQueries({ queryKey: ['session', questionnaireId] });
    }
  });

  // Get response with answers
  const useResponse = (responseId?: string) => useQuery<ResponseSession & { answers?: any[] }>({
    queryKey: ['response', responseId],
    queryFn: () => apiRequest(`/api/responses/${responseId}`),
    enabled: !!responseId,
    staleTime: 1 * 60 * 1000 // 1 minute
  });

  // Get maturity scores
  const useMaturityScores = (responseId?: string) => useQuery<MaturityScores>({
    queryKey: ['scores', responseId],
    queryFn: () => apiRequest(`/api/responses/${responseId}/scores`),
    enabled: !!responseId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Check for existing session
  const {
    data: responseSession,
    isLoading: isCheckingSession,
    error: sessionError
  } = useQuery<ResponseSession & { answers?: any }>({
    queryKey: ['session', questionnaireId],
    queryFn: () => apiRequest(`/api/responses/check-session?questionnaireId=${questionnaireId}`),
    enabled: !!questionnaireId,
    staleTime: 0, // Always check for latest session
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (no session found)
      if (error?.status === 404) return false;
      return failureCount < 3;
    }
  });

  return {
    // Data
    questionnaire,
    responseSession,
    isLoadingQuestionnaire,
    isCheckingSession,
    questionnaireError,
    sessionError,
    
    // Mutations
    startResponse: startResponseMutation.mutate,
    startResponseAsync: startResponseMutation.mutateAsync,
    saveAnswers: saveAnswersMutation.mutate,
    completeResponse: completeResponseMutation.mutate,
    
    // Manual refresh function for explicit navigation
    refreshSession: () => queryClient.invalidateQueries({ queryKey: ['session', questionnaireId] }),
    
    // Mutation states
    isStartingResponse: startResponseMutation.isPending,
    isSavingAnswers: saveAnswersMutation.isPending,
    isCompletingResponse: completeResponseMutation.isPending,
    
    // Mutation errors
    startResponseError: startResponseMutation.error,
    saveAnswersError: saveAnswersMutation.error,
    completeResponseError: completeResponseMutation.error,
    
    // Nested hooks for response data
    useResponse,
    useMaturityScores
  };
}