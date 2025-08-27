import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiDeleteRequest } from '../lib/queryClient';
import { UseCase, UseCaseFormData } from '../types';
import { InsertUseCase, MetadataConfig } from '@shared/schema';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../utils/calculations';
import { APP_CONFIG } from '@shared/constants/app-config';

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
        revenueImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.REVENUE_IMPACT,
        costSavings: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.COST_SAVINGS,
        riskReduction: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.RISK_REDUCTION,
        brokerPartnerExperience: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.BROKER_PARTNER_EXPERIENCE,
        strategicFit: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.STRATEGIC_FIT
      };
      
      const feasibilityWeights = metadata?.scoringModel?.feasibility || {
        dataReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.DATA_READINESS,
        technicalComplexity: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.TECHNICAL_COMPLEXITY,
        changeImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.CHANGE_IMPACT,
        modelRisk: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.MODEL_RISK,
        adoptionReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.ADOPTION_READINESS
      };
      
      const threshold = metadata?.scoringModel?.quadrantThreshold || APP_CONFIG.SCORING.DEFAULT_THRESHOLD;
      
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