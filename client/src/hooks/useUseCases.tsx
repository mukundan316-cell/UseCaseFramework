import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiDeleteRequest } from '../lib/queryClient';
import { UseCase, UseCaseFormData } from '../types';
import { InsertUseCase, MetadataConfig } from '@shared/schema';
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

  // Fetch metadata for weights and threshold
  const metadataQuery = useQuery({
    queryKey: ['/api', 'metadata'],
    queryFn: async () => {
      const response = await fetch('/api/metadata');
      if (!response.ok) throw new Error('Failed to fetch metadata');
      return response.json() as Promise<MetadataConfig>;
    }
  });

  const addUseCaseMutation = useMutation({
    mutationFn: async (formData: UseCaseFormData) => {
      const metadata = metadataQuery.data;
      
      // Extract weights from metadata or use defaults
      const businessValueWeights = metadata?.scoringModel?.businessValue || {
        revenueImpact: 20,
        costSavings: 20,
        riskReduction: 20,
        brokerPartnerExperience: 20,
        strategicFit: 20
      };
      
      const feasibilityWeights = metadata?.scoringModel?.feasibility || {
        dataReadiness: 20,
        technicalComplexity: 20,
        changeImpact: 20,
        modelRisk: 20,
        adoptionReadiness: 20
      };
      
      const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
      
      const impactScore = calculateImpactScore(
        formData.revenueImpact,
        formData.costSavings, 
        formData.riskReduction,
        formData.brokerPartnerExperience,
        formData.strategicFit,
        businessValueWeights
      );
      
      const effortScore = calculateEffortScore(
        formData.dataReadiness,
        formData.technicalComplexity,
        formData.changeImpact,
        formData.modelRisk,
        formData.adoptionReadiness,
        feasibilityWeights
      );

      const insertData: InsertUseCase & { impactScore: number; effortScore: number; quadrant: string } = {
        ...formData,
        impactScore,
        effortScore,
        quadrant: calculateQuadrant(impactScore, effortScore, threshold)
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
      await apiDeleteRequest(`/api/use-cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api', 'use-cases'] });
    }
  });

  return {
    useCases: useCasesQuery.data || [],
    metadata: metadataQuery.data,
    isLoading: useCasesQuery.isLoading || metadataQuery.isLoading,
    isError: useCasesQuery.isError || metadataQuery.isError,
    error: useCasesQuery.error || metadataQuery.error,
    addUseCase: addUseCaseMutation.mutateAsync,
    updateUseCase: (id: string, formData: UseCaseFormData) => 
      updateUseCaseMutation.mutateAsync({ id, formData }),
    deleteUseCase: deleteUseCaseMutation.mutateAsync,
    isAddingUseCase: addUseCaseMutation.isPending,
    isUpdatingUseCase: updateUseCaseMutation.isPending,
    isDeletingUseCase: deleteUseCaseMutation.isPending,
  };
}