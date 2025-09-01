import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetadataConfig } from '@shared/schema';
import { useSortedMetadata } from '@/hooks/useSortedMetadata';

/**
 * LEGO Block: Process Activity Manager
 * Centralized hook for managing process-activity relationships
 * Provides contextual filtering without duplication across the app
 */
export function useProcessActivityManager() {
  const { data: metadata } = useQuery<MetadataConfig>({
    queryKey: ['/api/metadata'],
  });
  const sortedMetadata = useSortedMetadata();

  /**
   * Gets activities for a specific process from database metadata
   * @param process - The selected business process
   * @returns Array of relevant activities for that process
   */
  const getActivitiesForProcess = (process: string): string[] => {
    if (!process || !metadata?.processActivities) return [];
    
    // Handle both parsed object and JSON string formats
    let processActivitiesMap: Record<string, string[]>;
    if (typeof metadata.processActivities === 'string') {
      try {
        processActivitiesMap = JSON.parse(metadata.processActivities);
      } catch {
        return [];
      }
    } else {
      processActivitiesMap = metadata.processActivities;
    }
    
    return processActivitiesMap[process] || [];
  };

  /**
   * Gets activities for multiple processes from database metadata
   * @param processes - Array of selected business processes
   * @returns Array of unique activities from all selected processes
   */
  const getActivitiesForProcesses = (processes: string[]): string[] => {
    if (!processes || processes.length === 0 || !metadata?.processActivities) return [];
    
    // Handle both parsed object and JSON string formats
    let processActivitiesMap: Record<string, string[]>;
    if (typeof metadata.processActivities === 'string') {
      try {
        processActivitiesMap = JSON.parse(metadata.processActivities);
      } catch {
        return [];
      }
    } else {
      processActivitiesMap = metadata.processActivities;
    }
    
    // Aggregate activities from all selected processes
    const allActivities = processes.flatMap(process => processActivitiesMap[process] || []);
    // Remove duplicates and maintain sort order
    return sortedMetadata.getSortedItems('activities', Array.from(new Set(allActivities)));
  };

  /**
   * Gets all available processes from metadata
   * @returns Array of all business processes
   */
  const getAllProcesses = (): string[] => {
    return sortedMetadata.getSortedProcesses();
  };

  /**
   * Gets all unique activities across all processes
   * @returns Array of all available activities
   */
  const getAllActivities = (): string[] => {
    if (!metadata?.processActivities) return sortedMetadata.getSortedActivities();
    
    // Handle both parsed object and JSON string formats - get flat list then sort
    let processActivitiesMap: Record<string, string[]>;
    if (typeof metadata.processActivities === 'string') {
      try {
        processActivitiesMap = JSON.parse(metadata.processActivities);
        const flatActivities = Object.values(processActivitiesMap).flat();
        // Remove duplicates and return sorted
        const uniqueActivities = Array.from(new Set(flatActivities));
        return sortedMetadata.getSortedItems('activities', uniqueActivities);
      } catch {
        return sortedMetadata.getSortedActivities();
      }
    } else {
      const flatActivities = Object.values(metadata.processActivities).flat();
      // Remove duplicates and return sorted
      const uniqueActivities = Array.from(new Set(flatActivities));
      return sortedMetadata.getSortedItems('activities', uniqueActivities);
    }
  };

  /**
   * Validates if an activity belongs to a specific process
   * @param process - The business process to check
   * @param activity - The activity to validate
   * @returns Boolean indicating if the activity is valid for the process
   */
  const validateActivityForProcess = (process: string, activity: string): boolean => {
    if (!process) return true; // Allow any activity if no process selected
    const validActivities = getActivitiesForProcess(process);
    return validActivities.includes(activity);
  };

  return {
    getActivitiesForProcess,
    getActivitiesForProcesses,
    getAllProcesses,
    getAllActivities,
    validateActivityForProcess,
    isLoading: !metadata
  };
}

/**
 * LEGO Block: Contextual Process Activity Field
 * Reusable component that automatically filters activities based on selected process
 * Integrates with the ProcessActivityManager for consistent behavior across the app
 */
interface ContextualProcessActivityFieldProps {
  selectedProcess?: string; // Backward compatibility
  selectedProcesses?: string[]; // New multi-select support
  selectedActivities: string[];
  onActivitiesChange: (activities: string[]) => void;
  className?: string;
  placeholder?: string;
  helpText?: string;
}

export function ContextualProcessActivityField({
  selectedProcess,
  selectedProcesses,
  selectedActivities,
  onActivitiesChange,
  className = "",
  placeholder,
  helpText
}: ContextualProcessActivityFieldProps) {
  const { getActivitiesForProcess, getActivitiesForProcesses } = useProcessActivityManager();
  
  // Support both single and multiple processes for backward compatibility
  const processes = selectedProcesses || (selectedProcess ? [selectedProcess] : []);
  const availableActivities = processes.length > 0 ? getActivitiesForProcesses(processes) : [];

  const handleActivityToggle = (activity: string, isChecked: boolean) => {
    let newActivities: string[];
    if (isChecked) {
      newActivities = [...selectedActivities, activity];
    } else {
      newActivities = selectedActivities.filter(a => a !== activity);
    }
    onActivitiesChange(newActivities);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Process Activities
      </label>
      <div className="mt-1 p-3 border rounded-md max-h-32 overflow-y-auto bg-white">
        {processes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            {placeholder || "Select processes first to enable activities"}
          </p>
        ) : availableActivities.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No activities defined for selected processes
          </p>
        ) : (
          availableActivities.map(activity => {
            const isChecked = selectedActivities.includes(activity);
            
            return (
              <div key={activity} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id={`activity-${activity}`}
                  checked={isChecked}
                  onChange={(e) => handleActivityToggle(activity, e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label 
                  htmlFor={`activity-${activity}`} 
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {activity}
                </label>
              </div>
            );
          })
        )}
      </div>
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
}