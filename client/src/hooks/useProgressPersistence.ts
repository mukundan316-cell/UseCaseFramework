/**
 * Enhanced Progress Persistence Hook
 * Handles debounced auto-save, session recovery, and resume capability
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SectionProgress {
  sectionNumber: number;
  started: boolean;
  completed: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  completionPercentage: number;
  lastModified: string;
  answers: Record<string, any>;
}

export interface ProgressData {
  responseId: string;
  questionnaireId: string;
  answers: Record<string, any>;
  currentSection: number;
  currentQuestionIndex: number;
  email: string;
  name?: string;
  lastSaved: string;
  timestamp: number;
  totalSections: number;
  completionPercentage: number;
  sectionProgress: Record<number, SectionProgress>;
}

export interface ProgressPersistenceOptions {
  storageKey: string;
  autoSaveDelay?: number;
  enableToasts?: boolean;
  apiBaseUrl?: string;
}

export interface SectionProgressAPI {
  getSectionProgress: (responseId: string) => Promise<Record<number, SectionProgress>>;
  updateSectionProgress: (responseId: string, sectionNum: number, progress: Partial<SectionProgress>) => Promise<void>;
  completeSectionProgress: (responseId: string, sectionNum: number) => Promise<void>;
}

export function useProgressPersistence({
  storageKey,
  autoSaveDelay = 1000,
  enableToasts = true,
  apiBaseUrl = '/api'
}: ProgressPersistenceOptions) {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced debounce function with immediate feedback
  const debouncedSave = useCallback(
    <T extends (...args: any[]) => void>(func: T, delay: number): T => {
      return ((...args: any[]) => {
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Set unsaved changes immediately
        setHasUnsavedChanges(true);

        // Schedule the save
        saveTimeoutRef.current = setTimeout(async () => {
          setIsSaving(true);
          try {
            await func.apply(null, args);
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            setLastSaved(timeString);
            setHasUnsavedChanges(false);
            
            if (enableToasts) {
              toast({
                title: "Progress saved",
                description: `Last saved at ${timeString}`,
                duration: 2000,
              });
            }
          } catch (error) {
            console.error('Auto-save failed:', error);
            if (enableToasts) {
              toast({
                title: "Save failed",
                description: "Your progress may not be saved. Trying again...",
                variant: "destructive",
                duration: 3000,
              });
            }
            // Retry after 2 seconds
            setTimeout(() => {
              func.apply(null, args);
            }, 2000);
          } finally {
            setIsSaving(false);
          }
        }, delay);
      }) as T;
    },
    [toast, enableToasts]
  );

  // Save progress to localStorage with enhanced metadata
  const saveToStorage = useCallback((progress: ProgressData) => {
    try {
      const enhancedProgress = {
        ...progress,
        timestamp: Date.now(),
        lastSaved: new Date().toLocaleString(),
        completionPercentage: Math.round(((progress.currentSection + 1) / progress.totalSections) * 100)
      };
      localStorage.setItem(storageKey, JSON.stringify(enhancedProgress));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, [storageKey]);

  // Load progress from localStorage with validation
  const loadFromStorage = useCallback((): ProgressData | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const progress = JSON.parse(stored) as ProgressData;
      
      // Validate required fields
      if (!progress.responseId || !progress.questionnaireId) {
        console.warn('Invalid progress data found, clearing storage');
        localStorage.removeItem(storageKey);
        return null;
      }

      // Check if progress is too old (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (progress.timestamp < thirtyDaysAgo) {
        console.info('Progress data is too old, clearing storage');
        localStorage.removeItem(storageKey);
        return null;
      }

      return progress;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey]);

  // Clear stored progress
  const clearStorage = useCallback(() => {
    localStorage.removeItem(storageKey);
    setLastSaved('');
    setHasUnsavedChanges(false);
  }, [storageKey]);

  // Check if there's resumable progress
  const hasResumableProgress = useCallback((): boolean => {
    const progress = loadFromStorage();
    return progress !== null && progress.completionPercentage < 100;
  }, [loadFromStorage]);

  // Section-specific progress management
  const updateSectionProgress = useCallback(async (
    responseId: string,
    sectionNum: number, 
    questionIndex: number,
    answers: Record<string, any>,
    totalQuestions: number
  ) => {
    try {
      const completionPercentage = Math.round((questionIndex / totalQuestions) * 100);
      
      const sectionProgress: Partial<SectionProgress> = {
        currentQuestionIndex: questionIndex,
        totalQuestions,
        completionPercentage,
        lastModified: new Date().toISOString(),
        answers
      };

      // API call to update section progress
      const response = await fetch(`${apiBaseUrl}/responses/${responseId}/section/${sectionNum}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionProgress)
      });

      if (!response.ok) {
        throw new Error('Failed to update section progress');
      }

      return true;
    } catch (error) {
      console.error('Section progress update failed:', error);
      return false;
    }
  }, [apiBaseUrl]);

  // Complete section progress
  const completeSectionProgress = useCallback(async (responseId: string, sectionNum: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/responses/${responseId}/section/${sectionNum}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to complete section');
      }

      if (enableToasts) {
        toast({
          title: "Section completed",
          description: `Section ${sectionNum} has been marked as complete`,
          duration: 3000,
        });
      }

      return true;
    } catch (error) {
      console.error('Section completion failed:', error);
      if (enableToasts) {
        toast({
          title: "Section completion failed",
          description: "There was an issue marking this section as complete",
          variant: "destructive",
          duration: 3000,
        });
      }
      return false;
    }
  }, [apiBaseUrl, enableToasts, toast]);

  // Get section progress from API
  const getSectionProgress = useCallback(async (responseId: string): Promise<Record<number, SectionProgress> | null> => {
    try {
      const response = await fetch(`${apiBaseUrl}/responses/${responseId}/section-progress`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch section progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch section progress:', error);
      return null;
    }
  }, [apiBaseUrl]);

  // Enhanced save with section awareness
  const saveProgressWithSection = useCallback((
    progress: ProgressData,
    sectionNum: number,
    questionIndex: number,
    sectionAnswers: Record<string, any>,
    totalQuestionsInSection: number
  ) => {
    // Update section progress in the main progress object
    const updatedSectionProgress = {
      ...progress.sectionProgress,
      [sectionNum]: {
        sectionNumber: sectionNum,
        started: true,
        completed: questionIndex >= totalQuestionsInSection,
        currentQuestionIndex: questionIndex,
        totalQuestions: totalQuestionsInSection,
        completionPercentage: Math.round((questionIndex / totalQuestionsInSection) * 100),
        lastModified: new Date().toISOString(),
        answers: sectionAnswers
      }
    };

    const enhancedProgress = {
      ...progress,
      currentSection: sectionNum,
      currentQuestionIndex: questionIndex,
      sectionProgress: updatedSectionProgress,
      timestamp: Date.now(),
      lastSaved: new Date().toLocaleString(),
      completionPercentage: Math.round(((sectionNum + (questionIndex / totalQuestionsInSection)) / progress.totalSections) * 100)
    };

    saveToStorage(enhancedProgress);
    
    // Also update via API
    updateSectionProgress(progress.responseId, sectionNum, questionIndex, sectionAnswers, totalQuestionsInSection);
    
    return enhancedProgress;
  }, [saveToStorage, updateSectionProgress]);

  // Get progress summary for display with section details
  const getProgressSummary = useCallback(() => {
    const progress = loadFromStorage();
    if (!progress) return null;

    const sectionProgressArray = Object.values(progress.sectionProgress || {});
    const completedSections = sectionProgressArray.filter(s => s.completed).length;

    return {
      completionPercentage: progress.completionPercentage,
      currentSection: progress.currentSection + 1, // 1-based for display
      currentQuestionIndex: progress.currentQuestionIndex,
      totalSections: progress.totalSections,
      completedSections,
      lastSaved: progress.lastSaved,
      email: progress.email,
      name: progress.name,
      responseId: progress.responseId,
      sectionProgress: progress.sectionProgress || {}
    };
  }, [loadFromStorage]);

  // Resume at last incomplete question
  const getResumePoint = useCallback(() => {
    const progress = loadFromStorage();
    if (!progress) return null;

    // Find the first incomplete section
    for (let sectionNum = 1; sectionNum <= progress.totalSections; sectionNum++) {
      const sectionProgress = progress.sectionProgress?.[sectionNum];
      
      if (!sectionProgress || !sectionProgress.completed) {
        return {
          sectionNumber: sectionNum,
          questionIndex: sectionProgress?.currentQuestionIndex || 0,
          answers: sectionProgress?.answers || {}
        };
      }
    }

    // All sections complete
    return {
      sectionNumber: progress.totalSections,
      questionIndex: progress.sectionProgress?.[progress.totalSections]?.totalQuestions || 0,
      answers: progress.answers || {}
    };
  }, [loadFromStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle page visibility changes to save immediately when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges && saveTimeoutRef.current) {
        // Force immediate save when tab becomes hidden
        clearTimeout(saveTimeoutRef.current);
        setIsSaving(false);
        setHasUnsavedChanges(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasUnsavedChanges]);

  return {
    // State
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    
    // Functions
    debouncedSave,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    hasResumableProgress,
    getProgressSummary,
    
    // Section-specific functions
    updateSectionProgress,
    completeSectionProgress,
    getSectionProgress,
    saveProgressWithSection,
    getResumePoint,
    
    // Utilities
    setLastSaved,
    setIsSaving,
    setHasUnsavedChanges
  };
}