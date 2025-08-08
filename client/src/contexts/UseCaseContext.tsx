import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UseCase, UseCaseFormData, FilterState, TabType } from '../types';
import { MetadataConfig } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface UseCaseContextType {
  useCases: UseCase[];
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
  exportData: () => any;
  importData: (data: any) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getFilteredUseCases: () => UseCase[];
  getQuadrantCounts: () => Record<string, number>;
  getAverageImpact: () => number;
}

const UseCaseContext = createContext<UseCaseContextType | undefined>(undefined);

const initialFilters: FilterState = {
  search: '',
  valueChainComponent: '',
  process: '',
  lineOfBusiness: '',
  businessSegment: '',
  geography: '',
  useCaseType: '',
  quadrant: ''
};

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('submit');
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const queryClient = useQueryClient();

  // Database-first data fetching per REFERENCE.md compliance
  const { data: useCases = [] } = useQuery({
    queryKey: ['/api/use-cases'],
  });

  const { data: metadata } = useQuery({
    queryKey: ['/api/metadata'],
  });

  // Mutations for database operations
  const addUseCaseMutation = useMutation({
    mutationFn: (data: UseCaseFormData) => apiRequest('/api/use-cases', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
    }
  });

  const updateUseCaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UseCaseFormData }) => 
      apiRequest(`/api/use-cases/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
    }
  });

  const deleteUseCaseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/use-cases/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
    }
  });

  const updateMetadataMutation = useMutation({
    mutationFn: (data: MetadataConfig) => apiRequest('/api/metadata', { method: 'PUT', body: data }),
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

  const addMetadataItem = async (category: keyof MetadataConfig, item: string): Promise<void> => {
    if (!metadata) return;
    const currentArray = metadata[category] as string[];
    if (!currentArray.includes(item)) {
      const updatedMetadata = {
        ...metadata,
        [category]: [...currentArray, item]
      };
      await updateMetadata(updatedMetadata);
    }
  };

  const removeMetadataItem = async (category: keyof MetadataConfig, item: string): Promise<void> => {
    if (!metadata) return;
    const currentArray = metadata[category] as string[];
    const updatedMetadata = {
      ...metadata,
      [category]: currentArray.filter(i => i !== item)
    };
    await updateMetadata(updatedMetadata);
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
    return useCases.filter(useCase => {
      if (filters.search && !useCase.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !useCase.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.valueChainComponent && useCase.valueChainComponent !== filters.valueChainComponent) return false;
      if (filters.process && useCase.process !== filters.process) return false;
      if (filters.lineOfBusiness && useCase.lineOfBusiness !== filters.lineOfBusiness) return false;
      if (filters.businessSegment && useCase.businessSegment !== filters.businessSegment) return false;
      if (filters.geography && useCase.geography !== filters.geography) return false;
      if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
      if (filters.quadrant && useCase.quadrant !== filters.quadrant) return false;
      return true;
    });
  };

  const getQuadrantCounts = (): Record<string, number> => {
    const filteredUseCases = getFilteredUseCases();
    return filteredUseCases.reduce((acc, useCase) => {
      acc[useCase.quadrant] = (acc[useCase.quadrant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const getAverageImpact = (): number => {
    const filteredUseCases = getFilteredUseCases();
    if (filteredUseCases.length === 0) return 0;
    const totalImpact = filteredUseCases.reduce((sum, useCase) => sum + useCase.impactScore, 0);
    return totalImpact / filteredUseCases.length;
  };

  const value: UseCaseContextType = {
    useCases,
    metadata,
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
    exportData,
    importData,
    resetToDefaults,
    getFilteredUseCases,
    getQuadrantCounts,
    getAverageImpact
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