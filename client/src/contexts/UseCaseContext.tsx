import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UseCase, UseCaseFormData, FilterState, TabType } from '../types';
import { MetadataConfig } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useEngagement } from './EngagementContext';

interface UseCaseContextType {
  useCases: UseCase[];
  dashboardUseCases: UseCase[];
  referenceUseCases: UseCase[];
  metadata: MetadataConfig | undefined;
  activeTab: TabType;
  filters: FilterState;
  setActiveTab: (tab: TabType) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  addUseCase: (formData: UseCaseFormData) => Promise<void>;
  updateUseCase: (id: string, formData: UseCaseFormData) => Promise<void>;
  deleteUseCase: (id: string) => Promise<void>;
  updateMetadata: (metadata: MetadataConfig) => Promise<void>;
  addMetadataItem: (category: keyof MetadataConfig, item: string) => Promise<void>;
  removeMetadataItem: (category: keyof MetadataConfig, item: string) => Promise<void>;
  editMetadataItem: (category: keyof MetadataConfig, oldItem: string, newItem: string) => Promise<void>;
  exportData: () => any;
  importData: (data: any) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getFilteredUseCases: () => UseCase[];
  getQuadrantCounts: () => Record<string, number>;
  getAverageImpact: () => number;
  getAverageEffort: () => number;
  getNewThisMonthCount: () => number;
  
  // Two-tier library management
  activateUseCase: (id: string, reason?: string) => Promise<void>;
  deactivateUseCase: (id: string, reason?: string) => Promise<void>;
  toggleDashboardVisibility: (id: string) => Promise<void>;
  bulkUpdateTier: (ids: string[], tier: 'active' | 'reference') => Promise<void>;
  
  // Scoring dropdown management
  updateScoringDropdownOptions: (scoringField: string, options: any[]) => Promise<void>;
}

const UseCaseContext = createContext<UseCaseContextType | undefined>(undefined);

const initialFilters: FilterState = {
  search: '',
  process: '',
  lineOfBusiness: '',
  businessSegment: '',
  geography: '',
  useCaseType: '',
  activity: '',
  quadrant: '',
  showRecommendations: false
};

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const queryClient = useQueryClient();
  const { selectedEngagementId } = useEngagement();

  // Build endpoint URLs with engagement filter - used directly as queryKey
  const useCasesEndpoint = selectedEngagementId 
    ? `/api/use-cases?engagementId=${selectedEngagementId}` 
    : '/api/use-cases';
  const dashboardEndpoint = selectedEngagementId 
    ? `/api/use-cases/dashboard?engagementId=${selectedEngagementId}` 
    : '/api/use-cases/dashboard';
  const referenceEndpoint = selectedEngagementId 
    ? `/api/use-cases/reference?engagementId=${selectedEngagementId}` 
    : '/api/use-cases/reference';

  // Helper to invalidate all use case queries (matches any URL starting with /api/use-cases)
  const invalidateAllUseCaseQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.startsWith('/api/use-cases');
      }
    });
  };

  // Database-first data fetching - uses default fetcher
  const { data: useCases = [] } = useQuery<UseCase[]>({
    queryKey: [useCasesEndpoint],
  });

  // Two-tier system queries - engagement-scoped, uses default fetcher
  const { data: dashboardUseCases = [] } = useQuery<UseCase[]>({
    queryKey: [dashboardEndpoint],
  });

  const { data: referenceUseCases = [] } = useQuery<UseCase[]>({
    queryKey: [referenceEndpoint],
  });

  const { data: metadata } = useQuery<MetadataConfig>({
    queryKey: ['/api/metadata'],
  });

  // Mutations for database operations
  const addUseCaseMutation = useMutation({
    mutationFn: async (data: UseCaseFormData) => {
      // Include engagementId in the request body for auto-assignment
      const requestData = {
        ...data,
        engagementId: selectedEngagementId || undefined
      };
      const response = await fetch('/api/use-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create use case');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all use case queries to refetch with current engagement
      invalidateAllUseCaseQueries();
    }
  });

  const updateUseCaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UseCaseFormData }) => {
      const response = await fetch(`/api/use-cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update use case');
      }
      return response.json();
    },
    onSuccess: () => {
      // Force invalidate all use case related queries to prevent stale data
      invalidateAllUseCaseQueries();
    }
  });

  const deleteUseCaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/use-cases/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete use case');
      }
      // DELETE returns 204 No Content, don't parse JSON
      return;
    },
    onSuccess: () => {
      invalidateAllUseCaseQueries();
    }
  });

  const updateMetadataMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update metadata');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
    }
  });

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const addUseCase = async (formData: UseCaseFormData): Promise<void> => {
    await addUseCaseMutation.mutateAsync(formData);
  };

  const updateUseCase = async (id: string, formData: UseCaseFormData): Promise<void> => {
    await updateUseCaseMutation.mutateAsync({ id, data: formData });
  };

  const deleteUseCase = async (id: string): Promise<void> => {
    await deleteUseCaseMutation.mutateAsync(id);
  };

  const updateMetadata = async (newMetadata: MetadataConfig): Promise<void> => {
    await updateMetadataMutation.mutateAsync(newMetadata);
  };

  const addMetadataItem = async (category: string, item: string): Promise<void> => {
    if (!metadata) throw new Error('Metadata not loaded');
    
    // Skip 'id' and 'updatedAt' fields for metadata updates
    if (category === 'id' || category === 'updatedAt') return;
    
    const currentArray = (metadata as any)[category] as string[];
    if (!Array.isArray(currentArray)) {
      throw new Error(`Invalid category: ${category} is not an array`);
    }
    
    if (!currentArray.includes(item)) {
      // Use the backend API endpoint for adding metadata items
      const response = await apiRequest(`/api/metadata/${encodeURIComponent(category)}`, {
        method: 'POST',
        body: JSON.stringify({ item }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Invalidate and refetch metadata after addition
      queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
    }
  };

  const removeMetadataItem = async (category: string, item: string): Promise<void> => {
    if (!metadata) throw new Error('Metadata not loaded');
    
    // Skip 'id' and 'updatedAt' fields for metadata updates
    if (category === 'id' || category === 'updatedAt') return;
    
    const currentArray = (metadata as any)[category] as string[];
    if (!Array.isArray(currentArray)) {
      throw new Error(`Invalid category: ${category} is not an array`);
    }
    
    // Use the backend API endpoint for removing metadata items
    const response = await apiRequest(`/api/metadata/${encodeURIComponent(category)}/${encodeURIComponent(item)}`, {
      method: 'DELETE',
    });
    
    // Invalidate and refetch metadata after removal
    queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
  };

  const editMetadataItem = async (category: string, oldItem: string, newItem: string): Promise<void> => {
    if (!metadata) throw new Error('Metadata not loaded');
    
    // Skip 'id' and 'updatedAt' fields for metadata updates
    if (category === 'id' || category === 'updatedAt') return;
    
    const response = await apiRequest(`/api/metadata/${encodeURIComponent(category)}/${encodeURIComponent(oldItem)}`, {
      method: 'PUT',
      body: JSON.stringify({ newItem }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Invalidate and refetch metadata after edit
    queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
  };

  const exportData = () => {
    return {
      useCases,
      metadata,
      exportedAt: new Date().toISOString()
    };
  };

  const importData = async (data: any) => {
    // Note: This would require additional API endpoints for bulk operations
    console.log('Import not yet implemented for database-first architecture');
  };

  const resetToDefaults = async () => {
    // Note: This would reset to the original seeded metadata
    console.log('Reset to defaults not yet implemented');
  };

  const getFilteredUseCases = (): UseCase[] => {
    // Use dashboard use cases for main view, all use cases for admin/explorer views
    const targetUseCases = activeTab === 'dashboard' ? dashboardUseCases : useCases;
    if (!targetUseCases || !Array.isArray(targetUseCases)) return [];
    return targetUseCases.filter((useCase: any) => {
      // Search filter
      if (filters.search && !useCase.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !useCase.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Process filtering - check only array values
      if (filters.process && 
          !(useCase.processes && useCase.processes.includes(filters.process))) {
        return false;
      }
      
      // Activity filtering - check only array values
      if (filters.activity && 
          !(useCase.activities && useCase.activities.includes(filters.activity))) {
        return false;
      }
      
      // Line of Business filtering - check only array values
      if (filters.lineOfBusiness && filters.lineOfBusiness !== 'all') {
        if (!useCase.linesOfBusiness || !useCase.linesOfBusiness.includes(filters.lineOfBusiness)) return false;
      }
      
      // Business Segment filtering - check only array values
      if (filters.businessSegment && 
          !(useCase.businessSegments && useCase.businessSegments.includes(filters.businessSegment))) {
        return false;
      }
      
      // Geography filtering - check only array values
      if (filters.geography && 
          !(useCase.geographies && useCase.geographies.includes(filters.geography))) {
        return false;
      }
      
      // Use Case Type filtering
      if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
      
      // Quadrant filtering - use effective quadrant for accurate filtering
      if (filters.quadrant) {
        const effectiveQuadrant = (useCase as any).manualQuadrant || 
          (((useCase as any).manualImpactScore !== undefined || (useCase as any).manualEffortScore !== undefined) ?
            (() => {
              const impact = (useCase as any).manualImpactScore ?? useCase.impactScore ?? 0;
              const effort = (useCase as any).manualEffortScore ?? useCase.effortScore ?? 0;
              if (impact >= 3.0 && effort < 3.0) return 'Quick Win';
              if (impact >= 3.0 && effort >= 3.0) return 'Strategic Bet';
              if (impact < 3.0 && effort < 3.0) return 'Experimental';
              return 'Watchlist';
            })() : useCase.quadrant) || 'Unassigned';
        if (effectiveQuadrant !== filters.quadrant) return false;
      }
      
      // Assessment Recommendations filtering
      if (filters.showRecommendations && !useCase.recommendedByAssessment) return false;
      
      return true;
    });
  };

  const getQuadrantCounts = (): Record<string, number> => {
    // Use dashboard use cases for quadrant counts (following replit.md centralized config)
    const useCasesToCount = dashboardUseCases;
    // Get configurable threshold from metadata instead of hardcoded 3.0
    const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
    
    return useCasesToCount.reduce((acc, useCase) => {
      // Calculate effective quadrant for accurate counts using configurable threshold
      const effectiveQuadrant = (useCase as any).manualQuadrant || 
        (((useCase as any).manualImpactScore !== undefined || (useCase as any).manualEffortScore !== undefined) ?
          (() => {
            const impact = (useCase as any).manualImpactScore ?? useCase.impactScore ?? 0;
            const effort = (useCase as any).manualEffortScore ?? useCase.effortScore ?? 0;
            if (impact >= threshold && effort < threshold) return 'Quick Win';
            if (impact >= threshold && effort >= threshold) return 'Strategic Bet';
            if (impact < threshold && effort < threshold) return 'Experimental';
            return 'Watchlist';
          })() : useCase.quadrant) || 'Unassigned';
      acc[effectiveQuadrant] = (acc[effectiveQuadrant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const getAverageImpact = (): number => {
    const filteredUseCases = getFilteredUseCases();
    if (filteredUseCases.length === 0) return 0;
    const totalImpact = filteredUseCases.reduce((sum, useCase) => {
      // Use effective impact score (manual override or calculated)
      const effectiveScore = (useCase as any).manualImpactScore ?? useCase.impactScore ?? 0;
      return sum + effectiveScore;
    }, 0);
    return totalImpact / filteredUseCases.length;
  };

  const getAverageEffort = (): number => {
    const filteredUseCases = getFilteredUseCases();
    if (filteredUseCases.length === 0) return 0;
    const totalEffort = filteredUseCases.reduce((sum, useCase) => {
      // Use effective effort score (manual override or calculated)
      const effectiveScore = (useCase as any).manualEffortScore ?? useCase.effortScore ?? 0;
      return sum + effectiveScore;
    }, 0);
    return totalEffort / filteredUseCases.length;
  };

  const getNewThisMonthCount = (): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const filteredUseCases = getFilteredUseCases();
    return filteredUseCases.filter(useCase => {
      if (!useCase.createdAt) return false;
      const createdDate = new Date(useCase.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
  };

  // Library management mutations
  const activateUseCaseMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/use-cases/${id}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to activate use case');
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateAllUseCaseQueries();
    }
  });

  const deactivateUseCaseMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/use-cases/${id}/deactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deactivate use case');
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateAllUseCaseQueries();
    }
  });

  const toggleDashboardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/use-cases/${id}/toggle-dashboard`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle dashboard visibility');
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateAllUseCaseQueries();
    }
  });

  const bulkUpdateTierMutation = useMutation({
    mutationFn: async ({ ids, tier }: { ids: string[]; tier: 'active' | 'reference' }) => {
      const response = await fetch('/api/use-cases/bulk-tier', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, tier }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to bulk update tier');
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateAllUseCaseQueries();
    }
  });

  // Library management functions
  const activateUseCase = async (id: string, reason?: string): Promise<void> => {
    await activateUseCaseMutation.mutateAsync({ id, reason });
  };

  const deactivateUseCase = async (id: string, reason?: string): Promise<void> => {
    await deactivateUseCaseMutation.mutateAsync({ id, reason });
  };

  const toggleDashboardVisibility = async (id: string): Promise<void> => {
    await toggleDashboardMutation.mutateAsync(id);
  };

  const bulkUpdateTier = async (ids: string[], tier: 'active' | 'reference'): Promise<void> => {
    await bulkUpdateTierMutation.mutateAsync({ ids, tier });
  };

  const updateScoringDropdownOptions = async (scoringField: string, options: any[]): Promise<void> => {
    if (!metadata) throw new Error('Metadata not loaded');
    
    const updatedMetadata = {
      ...metadata,
      scoringDropdownOptions: {
        ...metadata.scoringDropdownOptions,
        [scoringField]: options
      }
    };
    
    await updateMetadata(updatedMetadata);
  };

  const value: UseCaseContextType = {
    useCases: Array.isArray(useCases) ? useCases : [],
    dashboardUseCases: Array.isArray(dashboardUseCases) ? dashboardUseCases : [],
    referenceUseCases: Array.isArray(referenceUseCases) ? referenceUseCases : [],
    metadata: metadata,
    activeTab,
    filters,
    setActiveTab,
    setFilters,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    updateMetadata,
    addMetadataItem,
    removeMetadataItem,
    editMetadataItem,
    exportData,
    importData,
    resetToDefaults,
    getFilteredUseCases,
    getQuadrantCounts,
    getAverageImpact,
    getAverageEffort,
    getNewThisMonthCount,
    activateUseCase,
    deactivateUseCase,
    toggleDashboardVisibility,
    bulkUpdateTier,
    updateScoringDropdownOptions
  };

  return (
    <UseCaseContext.Provider value={value}>
      {children}
    </UseCaseContext.Provider>
  );
}

export function useUseCases() {
  const context = useContext(UseCaseContext);
  if (context === undefined) {
    throw new Error('useUseCases must be used within a UseCaseProvider');
  }
  return context;
}