import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UseCase, MetadataConfig, UseCaseFormData, FilterState, TabType } from '../types';
import { useCaseStore } from '../services/useCaseStore';

interface UseCaseContextType {
  useCases: UseCase[];
  metadata: MetadataConfig;
  activeTab: TabType;
  filters: FilterState;
  setActiveTab: (tab: TabType) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  addUseCase: (formData: UseCaseFormData) => UseCase;
  updateUseCase: (id: string, formData: UseCaseFormData) => UseCase | null;
  deleteUseCase: (id: string) => boolean;
  updateMetadata: (metadata: MetadataConfig) => void;
  addMetadataItem: (category: keyof MetadataConfig, item: string) => void;
  removeMetadataItem: (category: keyof MetadataConfig, item: string) => void;
  exportData: () => any;
  importData: (data: any) => void;
  resetToDefaults: () => void;
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
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [metadata, setMetadata] = useState<MetadataConfig>(useCaseStore.getMetadata());
  const [activeTab, setActiveTab] = useState<TabType>('submit');
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);

  useEffect(() => {
    const unsubscribe = useCaseStore.subscribe(() => {
      setUseCases(useCaseStore.getAllUseCases());
      setMetadata(useCaseStore.getMetadata());
    });

    setUseCases(useCaseStore.getAllUseCases());

    return unsubscribe;
  }, []);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const addUseCase = (formData: UseCaseFormData) => {
    return useCaseStore.addUseCase(formData);
  };

  const updateUseCase = (id: string, formData: UseCaseFormData) => {
    return useCaseStore.updateUseCase(id, formData);
  };

  const deleteUseCase = (id: string) => {
    return useCaseStore.deleteUseCase(id);
  };

  const updateMetadata = (newMetadata: MetadataConfig) => {
    useCaseStore.updateMetadata(newMetadata);
  };

  const addMetadataItem = (category: keyof MetadataConfig, item: string) => {
    useCaseStore.addMetadataItem(category, item);
  };

  const removeMetadataItem = (category: keyof MetadataConfig, item: string) => {
    useCaseStore.removeMetadataItem(category, item);
  };

  const exportData = () => {
    return useCaseStore.exportData();
  };

  const importData = (data: any) => {
    useCaseStore.importData(data);
  };

  const resetToDefaults = () => {
    useCaseStore.resetToDefaults();
  };

  const getFilteredUseCases = (): UseCase[] => {
    return useCases.filter(useCase => {
      const matchesSearch = !filters.search || 
        useCase.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        useCase.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesValueChain = !filters.valueChainComponent || 
        useCase.valueChainComponent === filters.valueChainComponent;
      
      const matchesProcess = !filters.process || 
        useCase.process === filters.process;
      
      const matchesLOB = !filters.lineOfBusiness || 
        useCase.lineOfBusiness === filters.lineOfBusiness;
      
      const matchesSegment = !filters.businessSegment || 
        useCase.businessSegment === filters.businessSegment;
      
      const matchesGeography = !filters.geography || 
        useCase.geography === filters.geography;
      
      const matchesType = !filters.useCaseType || 
        useCase.useCaseType === filters.useCaseType;
      
      const matchesQuadrant = !filters.quadrant || 
        useCase.quadrant === filters.quadrant;

      return matchesSearch && matchesValueChain && matchesProcess && 
             matchesLOB && matchesSegment && matchesGeography && 
             matchesType && matchesQuadrant;
    });
  };

  const getQuadrantCounts = () => {
    return useCaseStore.getQuadrantCounts();
  };

  const getAverageImpact = () => {
    return useCaseStore.getAverageImpact();
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
