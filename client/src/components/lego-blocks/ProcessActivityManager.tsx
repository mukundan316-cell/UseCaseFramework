import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetadataConfig } from '@shared/schema';

/**
 * LEGO Block: Process Activity Manager
 * Centralized hook for managing process-activity relationships
 * Provides contextual filtering without duplication across the app
 */
export function useProcessActivityManager() {
  const { data: metadata } = useQuery<MetadataConfig>({
    queryKey: ['/api/metadata'],
  });

  /**
   * Gets activities for a specific process from database metadata
   * @param process - The selected business process
   * @returns Array of relevant activities for that process
   */
  const getActivitiesForProcess = (process: string): string[] => {
    if (!process || !metadata?.processActivities) return [];
    return metadata.processActivities[process] || [];
  };

  /**
   * Gets all available processes from metadata
   * @returns Array of all business processes
   */
  const getAllProcesses = (): string[] => {
    return metadata?.processes || [];
  };

  /**
   * Gets all unique activities across all processes
   * @returns Array of all available activities
   */
  const getAllActivities = (): string[] => {
    if (!metadata?.processActivities) return metadata?.activities || [];
    return Object.values(metadata.processActivities).flat();
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
  selectedProcess: string;
  selectedActivities: string[];
  onActivitiesChange: (activities: string[]) => void;
  className?: string;
  placeholder?: string;
  helpText?: string;
}

export function ContextualProcessActivityField({
  selectedProcess,
  selectedActivities,
  onActivitiesChange,
  className = "",
  placeholder,
  helpText
}: ContextualProcessActivityFieldProps) {
  const { getActivitiesForProcess } = useProcessActivityManager();
  const availableActivities = getActivitiesForProcess(selectedProcess);

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
        {!selectedProcess ? (
          <p className="text-sm text-gray-500 italic">
            {placeholder || "Select process first to enable activities"}
          </p>
        ) : availableActivities.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No activities defined for this process
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