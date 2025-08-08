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
  getAverageEffort: () => number;
  getNewThisMonthCount: () => number;
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
  quadrant: ''
};

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const queryClient = useQueryClient();

  // Database-first data fetching per REFERENCE.md compliance
  const { data: useCases = [] } = useQuery({
    queryKey: ['/api/use-cases'],
  });

  const { data: metadata } = useQuery<MetadataConfig>({
    queryKey: ['/api/metadata'],
  });

  // Mutations for database operations
  const addUseCaseMutation = useMutation({
    mutationFn: async (data: UseCaseFormData) => {
      const response = await fetch('/api/use-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create use case');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
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
      const updatedMetadata: MetadataConfig = {
        ...metadata,
        [category]: [...currentArray, item],
        updatedAt: new Date()
      };
      await updateMetadata(updatedMetadata);
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
    
    const updatedMetadata: MetadataConfig = {
      ...metadata,
      [category]: currentArray.filter(i => i !== item),
      updatedAt: new Date()
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
    if (!useCases || !Array.isArray(useCases)) return [];
    return useCases.filter((useCase: any) => {
      // Search filter
      if (filters.search && !useCase.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !useCase.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Process filtering - check both single and array values
      if (filters.process && 
          useCase.process !== filters.process && 
          !(useCase.processes && useCase.processes.includes(filters.process))) {
        return false;
      }
      
      // Activity filtering - check both single and array values
      if (filters.activity && 
          useCase.activity !== filters.activity && 
          !(useCase.activities && useCase.activities.includes(filters.activity))) {
        return false;
      }
      
      // Line of Business filtering (already supports multi-select)
      if (filters.lineOfBusiness && filters.lineOfBusiness !== 'all') {
        const useCaseLOBs = useCase.linesOfBusiness || [useCase.lineOfBusiness];
        if (!useCaseLOBs.includes(filters.lineOfBusiness)) return false;
      }
      
      // Business Segment filtering - check both single and array values
      if (filters.businessSegment && 
          useCase.businessSegment !== filters.businessSegment && 
          !(useCase.businessSegments && useCase.businessSegments.includes(filters.businessSegment))) {
        return false;
      }
      
      // Geography filtering - check both single and array values
      if (filters.geography && 
          useCase.geography !== filters.geography && 
          !(useCase.geographies && useCase.geographies.includes(filters.geography))) {
        return false;
      }
      
      // Use Case Type filtering
      if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
      
      // Quadrant filtering
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

  const getAverageEffort = (): number => {
    const filteredUseCases = getFilteredUseCases();
    if (filteredUseCases.length === 0) return 0;
    const totalEffort = filteredUseCases.reduce((sum, useCase) => sum + useCase.effortScore, 0);
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

  const value: UseCaseContextType = {
    useCases: Array.isArray(useCases) ? useCases : [],
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
    exportData,
    importData,
    resetToDefaults,
    getFilteredUseCases,
    getQuadrantCounts,
    getAverageImpact,
    getAverageEffort,
    getNewThisMonthCount
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