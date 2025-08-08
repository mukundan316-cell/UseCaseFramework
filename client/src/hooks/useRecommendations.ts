/**
 * Hook for managing assessment-based recommendations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateRecommendations, applyRecommendations, type MaturityScores, type RecommendationResult } from '@/utils/recommendationEngine';
import { UseCase } from '@/types';

export interface RecommendationResponse {
  assessmentId: string;
  recommendedUseCases: UseCase[];
  count: number;
}

/**
 * Hook to generate and apply recommendations based on assessment results
 */
export function useGenerateRecommendations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assessmentId, 
      scores, 
      useCases 
    }: { 
      assessmentId: string; 
      scores: MaturityScores; 
      useCases: UseCase[] 
    }): Promise<RecommendationResult> => {
      // Generate recommendations using the engine
      const recommendations = generateRecommendations(scores, useCases);
      
      // Apply recommendations to database
      await applyRecommendations(assessmentId, recommendations);
      
      return recommendations;
    },
    onSuccess: () => {
      // Invalidate use cases to refresh with new recommendations
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
    }
  });
}

/**
 * Hook to fetch existing recommendations for an assessment
 */
export function useRecommendations(assessmentId?: string) {
  return useQuery<RecommendationResponse>({
    queryKey: ['recommendations', assessmentId],
    queryFn: () => apiRequest(`/api/recommendations/${assessmentId}`),
    enabled: !!assessmentId
  });
}

/**
 * Hook to clear recommendations for an assessment
 */
export function useClearRecommendations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      return apiRequest(`/api/recommendations/clear/${assessmentId}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    }
  });
}