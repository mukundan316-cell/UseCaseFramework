import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { UseCase, UseCaseFormData } from '../types';
import { InsertUseCase } from '@shared/schema';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../utils/calculations';

export function useUseCases() {
  const queryClient = useQueryClient();

  const useCasesQuery = useQuery({
    queryKey: ['/api', 'use-cases'],
    queryFn: async () => {
      const response = await fetch('/api/use-cases');
      if (!response.ok) throw new Error('Failed to fetch use cases');
      return response.json() as Promise<UseCase[]>;
    }
  });

  const addUseCaseMutation = useMutation({
    mutationFn: async (formData: UseCaseFormData) => {
      const insertData: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string } = {
        ...formData,
        impactScore: calculateImpactScore(
          formData.revenueImpact,
          formData.costSavings, 
          formData.riskReduction,
          formData.strategicFit
        ),
        effortScore: calculateEffortScore(
          formData.dataReadiness,
          formData.technicalComplexity,
          formData.changeImpact,
          formData.adoptionReadiness
        ),
        quadrant: calculateQuadrant(
          calculateImpactScore(formData.revenueImpact, formData.costSavings, formData.riskReduction, formData.strategicFit),
          calculateEffortScore(formData.dataReadiness, formData.technicalComplexity, formData.changeImpact, formData.adoptionReadiness)
        )
      };

      const response = await apiRequest('POST', '/api/use-cases', insertData);
      return response.json() as Promise<UseCase>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api', 'use-cases'] });
    }
  });

  const updateUseCaseMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: UseCaseFormData }) => {
      const response = await apiRequest('PUT', `/api/use-cases/${id}`, formData);
      return response.json() as Promise<UseCase>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api', 'use-cases'] });
    }
  });

  const deleteUseCaseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/use-cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api', 'use-cases'] });
    }
  });

  return {
    useCases: useCasesQuery.data || [],
    isLoading: useCasesQuery.isLoading,
    isError: useCasesQuery.isError,
    error: useCasesQuery.error,
    addUseCase: addUseCaseMutation.mutateAsync,
    updateUseCase: (id: string, formData: UseCaseFormData) => 
      updateUseCaseMutation.mutateAsync({ id, formData }),
    deleteUseCase: deleteUseCaseMutation.mutateAsync,
    isAddingUseCase: addUseCaseMutation.isPending,
    isUpdatingUseCase: updateUseCaseMutation.isPending,
    isDeletingUseCase: deleteUseCaseMutation.isPending,
  };
}