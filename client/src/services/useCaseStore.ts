import { UseCase, MetadataConfig, UseCaseFormData } from '../types';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../utils/calculations';
import { sampleUseCases, defaultMetadata } from '../data/sampleData';

const USE_CASES_KEY = 'rsa-use-cases';
const METADATA_KEY = 'rsa-metadata';

export class UseCaseStore {
  private useCases: UseCase[] = [];
  private metadata: MetadataConfig = defaultMetadata;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUseCases = localStorage.getItem(USE_CASES_KEY);
      const storedMetadata = localStorage.getItem(METADATA_KEY);

      if (storedUseCases) {
        this.useCases = JSON.parse(storedUseCases);
      } else {
        this.useCases = [...sampleUseCases];
        this.saveToStorage();
      }

      if (storedMetadata) {
        this.metadata = JSON.parse(storedMetadata);
      } else {
        this.metadata = defaultMetadata;
        this.saveMetadataToStorage();
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.useCases = [...sampleUseCases];
      this.metadata = defaultMetadata;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(USE_CASES_KEY, JSON.stringify(this.useCases));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private saveMetadataToStorage() {
    try {
      localStorage.setItem(METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving metadata to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getAllUseCases(): UseCase[] {
    return [...this.useCases];
  }

  getUseCaseById(id: string): UseCase | undefined {
    return this.useCases.find(useCase => useCase.id === id);
  }

  addUseCase(formData: UseCaseFormData): UseCase {
    const impactScore = calculateImpactScore(
      formData.revenueImpact,
      formData.costSavings,
      formData.riskReduction,
      formData.strategicFit
    );

    const effortScore = calculateEffortScore(
      formData.dataReadiness,
      formData.technicalComplexity,
      formData.changeImpact,
      formData.adoptionReadiness
    );

    const quadrant = calculateQuadrant(impactScore, effortScore);

    const newUseCase: UseCase = {
      id: `uc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      impactScore,
      effortScore,
      quadrant,
      createdAt: new Date()
    };

    this.useCases.push(newUseCase);
    this.saveToStorage();
    this.notifyListeners();
    
    return newUseCase;
  }

  updateUseCase(id: string, formData: UseCaseFormData): UseCase | null {
    const index = this.useCases.findIndex(useCase => useCase.id === id);
    if (index === -1) return null;

    const impactScore = calculateImpactScore(
      formData.revenueImpact,
      formData.costSavings,
      formData.riskReduction,
      formData.strategicFit
    );

    const effortScore = calculateEffortScore(
      formData.dataReadiness,
      formData.technicalComplexity,
      formData.changeImpact,
      formData.adoptionReadiness
    );

    const quadrant = calculateQuadrant(impactScore, effortScore);

    const updatedUseCase: UseCase = {
      ...this.useCases[index],
      ...formData,
      impactScore,
      effortScore,
      quadrant
    };

    this.useCases[index] = updatedUseCase;
    this.saveToStorage();
    this.notifyListeners();
    
    return updatedUseCase;
  }

  deleteUseCase(id: string): boolean {
    const index = this.useCases.findIndex(useCase => useCase.id === id);
    if (index === -1) return false;

    this.useCases.splice(index, 1);
    this.saveToStorage();
    this.notifyListeners();
    
    return true;
  }

  getMetadata(): MetadataConfig {
    return { ...this.metadata };
  }

  updateMetadata(newMetadata: MetadataConfig) {
    this.metadata = { ...newMetadata };
    this.saveMetadataToStorage();
    this.notifyListeners();
  }

  addMetadataItem(category: keyof MetadataConfig, item: string) {
    if (!this.metadata[category].includes(item)) {
      this.metadata[category].push(item);
      this.saveMetadataToStorage();
      this.notifyListeners();
    }
  }

  removeMetadataItem(category: keyof MetadataConfig, item: string) {
    this.metadata[category] = this.metadata[category].filter(i => i !== item);
    this.saveMetadataToStorage();
    this.notifyListeners();
  }

  exportData() {
    return {
      useCases: this.useCases,
      metadata: this.metadata,
      exportDate: new Date().toISOString()
    };
  }

  importData(data: { useCases: UseCase[], metadata: MetadataConfig }) {
    this.useCases = data.useCases || [];
    this.metadata = data.metadata || defaultMetadata;
    this.saveToStorage();
    this.saveMetadataToStorage();
    this.notifyListeners();
  }

  resetToDefaults() {
    this.useCases = [...sampleUseCases];
    this.metadata = { ...defaultMetadata };
    this.saveToStorage();
    this.saveMetadataToStorage();
    this.notifyListeners();
  }

  getQuadrantCounts() {
    const counts = {
      "Quick Win": 0,
      "Strategic Bet": 0,
      "Experimental": 0,
      "Watchlist": 0
    };

    this.useCases.forEach(useCase => {
      counts[useCase.quadrant]++;
    });

    return counts;
  }

  getAverageImpact(): number {
    if (this.useCases.length === 0) return 0;
    const total = this.useCases.reduce((sum, useCase) => sum + useCase.impactScore, 0);
    return Number((total / this.useCases.length).toFixed(1));
  }
}

export const useCaseStore = new UseCaseStore();
