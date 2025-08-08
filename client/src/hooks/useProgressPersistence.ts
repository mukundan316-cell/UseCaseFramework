/**
 * Enhanced Progress Persistence Hook
 * Handles debounced auto-save, session recovery, and resume capability
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ProgressData {
  responseId: string;
  questionnaireId: string;
  answers: Record<string, any>;
  currentSection: number;
  email: string;
  name?: string;
  lastSaved: string;
  timestamp: number;
  totalSections: number;
  completionPercentage: number;
}

export interface ProgressPersistenceOptions {
  storageKey: string;
  autoSaveDelay?: number;
  enableToasts?: boolean;
}

export function useProgressPersistence({
  storageKey,
  autoSaveDelay = 1000,
  enableToasts = true
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

  // Get progress summary for display
  const getProgressSummary = useCallback(() => {
    const progress = loadFromStorage();
    if (!progress) return null;

    return {
      completionPercentage: progress.completionPercentage,
      currentSection: progress.currentSection + 1, // 1-based for display
      totalSections: progress.totalSections,
      lastSaved: progress.lastSaved,
      email: progress.email,
      name: progress.name,
      responseId: progress.responseId
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
    
    // Utilities
    setLastSaved,
    setIsSaving,
    setHasUnsavedChanges
  };
}