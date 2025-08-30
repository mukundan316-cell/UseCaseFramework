import React from 'react';
import { CheckCircle2, Lock, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

export interface SectionData {
  id: number;
  title: string;
  questionCount: number;
  estimatedMinutes: number;
}

export interface SectionTabNavigatorLegoBlockProps {
  /** Current active section (1-6) */
  currentSection: number;
  /** Array of completed section IDs */
  completedSections: number[];
  /** Callback when user clicks a section tab */
  onSectionChange: (section: number) => void;
  /** Progress data for each section */
  sectionProgress: Map<number, { completed: number; total: number }>;
  /** Whether sections must be completed in order */
  enforceOrder?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Disable all navigation */
  disabled?: boolean;
}

/**
 * SectionTabNavigatorLegoBlock - LEGO component for assessment section navigation
 * 
 * Features:
 * - Responsive horizontal tabs with mobile scrolling
 * - Visual progress indicators and completion states
 * - Optional section locking for sequential completion
 * - Overall progress tracking below tabs
 * - RSA-styled with consistent theming
 * 
 * @example
 * <SectionTabNavigatorLegoBlock
 *   currentSection={2}
 *   completedSections={[1]}
 *   onSectionChange={handleSectionChange}
 *   sectionProgress={progressMap}
 *   enforceOrder={true}
 * />
 */
export default function SectionTabNavigatorLegoBlock({
  currentSection,
  completedSections,
  onSectionChange,
  sectionProgress,
  enforceOrder = true,
  className = '',
  disabled = false
}: SectionTabNavigatorLegoBlockProps) {

  // Section configuration with realistic RSA assessment data
  const sections: SectionData[] = [
    {
      id: 1,
      title: 'Business Strategy & AI Vision',
      questionCount: 17,
      estimatedMinutes: 45
    },
    {
      id: 2,
      title: 'Current AI & Data Capabilities',
      questionCount: 35,
      estimatedMinutes: 60
    },
    {
      id: 3,
      title: 'Use Case Discovery & Validation',
      questionCount: 8,
      estimatedMinutes: 30
    },
    {
      id: 4,
      title: 'Technology & Infrastructure',
      questionCount: 20,
      estimatedMinutes: 45
    },
    {
      id: 5,
      title: 'People, Process & Change',
      questionCount: 10,
      estimatedMinutes: 30
    },
    {
      id: 6,
      title: 'Regulatory, Compliance & Ethics',
      questionCount: 10,
      estimatedMinutes: 20
    }
  ];

  // Calculate overall progress
  const totalQuestions = sections.reduce((sum, section) => sum + section.questionCount, 0);
  const totalCompleted = Array.from(sectionProgress.values()).reduce(
    (sum, progress) => sum + progress.completed, 
    0
  );
  const overallProgress = Math.round((totalCompleted / totalQuestions) * 100);

  // Determine if a section is accessible
  const isSectionAccessible = (sectionId: number): boolean => {
    if (!enforceOrder || disabled) return !disabled;
    
    // Current section is always accessible
    if (sectionId === currentSection) return true;
    
    // Completed sections are always accessible
    if (completedSections.includes(sectionId)) return true;
    
    // Next section is accessible if previous is complete
    if (sectionId === 1) return true;
    return completedSections.includes(sectionId - 1);
  };

  // Get section visual state
  const getSectionState = (sectionId: number) => {
    if (completedSections.includes(sectionId)) return 'completed';
    if (sectionId === currentSection) return 'active';
    if (isSectionAccessible(sectionId)) return 'available';
    return 'locked';
  };

  // Get progress for a section
  const getSectionProgress = (sectionId: number) => {
    const progress = sectionProgress.get(sectionId);
    if (!progress) return { completed: 0, total: sections.find(s => s.id === sectionId)?.questionCount || 0 };
    return progress;
  };

  // Handle section click
  const handleSectionClick = (sectionId: number) => {
    if (disabled || !isSectionAccessible(sectionId)) return;
    onSectionChange(sectionId);
  };

  // Get styling for section state
  const getSectionStyling = (state: string, sectionId: number) => {
    const isClickable = isSectionAccessible(sectionId) && !disabled;
    
    const baseClasses = `
      relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300
      min-w-[200px] cursor-pointer group
      ${isClickable ? 'hover:shadow-lg hover:scale-105' : 'cursor-not-allowed opacity-60'}
    `;

    switch (state) {
      case 'completed':
        return `${baseClasses} bg-green-50 border-green-300 text-green-800 hover:bg-green-100`;
      case 'active':
        return `${baseClasses} bg-blue-50 border-[#005DAA] text-[#005DAA] ring-2 ring-[#005DAA]/30`;
      case 'available':
        return `${baseClasses} bg-white border-gray-300 text-gray-700 hover:border-[#005DAA] hover:bg-blue-50`;
      case 'locked':
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-400`;
      default:
        return baseClasses;
    }
  };

  // Get icon for section state
  const getSectionIcon = (state: string, sectionId: number) => {
    const progress = getSectionProgress(sectionId);
    const progressPercent = Math.round((progress.completed / progress.total) * 100);

    switch (state) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return (
          <div className="relative">
            <BarChart3 className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 text-xs font-bold bg-white rounded-full px-1">
              {progressPercent}%
            </span>
          </div>
        );
    }
  };

  return (
    <Card className={cn("w-full p-6 bg-gradient-to-r from-blue-50 to-purple-50", className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Progress</h2>
        <p className="text-gray-600 text-sm">
          Complete each section to build your AI maturity profile
        </p>
      </div>

      {/* Section Tabs - Horizontal scrollable on mobile */}
      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {sections.map((section) => {
            const state = getSectionState(section.id);
            const progress = getSectionProgress(section.id);
            const progressPercent = Math.round((progress.completed / progress.total) * 100);

            return (
              <div
                key={section.id}
                className={getSectionStyling(state, section.id)}
                onClick={() => handleSectionClick(section.id)}
              >
                {/* Section Number & Icon */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    state === 'completed' ? 'bg-green-500 text-white' :
                    state === 'active' ? 'bg-[#005DAA] text-white' :
                    state === 'available' ? 'bg-gray-100 text-gray-700' :
                    'bg-gray-100 text-gray-400'
                  )}>
                    {section.id}
                  </div>
                  {getSectionIcon(state, section.id)}
                </div>

                {/* Section Title */}
                <h3 className="text-sm font-semibold text-center mb-2 line-clamp-2">
                  {section.title}
                </h3>

                {/* Progress Bar */}
                <div className="w-full mb-2">
                  <Progress 
                    value={progressPercent} 
                    className="h-2 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{progress.completed}/{progress.total}</span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{section.estimatedMinutes}min</span>
                </div>

                {/* Active indicator */}
                {state === 'active' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#005DAA] rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {totalCompleted} of {totalQuestions} questions completed
          </span>
        </div>
        
        <Progress 
          value={overallProgress} 
          className="h-3 bg-gray-200"
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Started</span>
          <span className="font-medium text-[#005DAA]">{overallProgress}% Complete</span>
          <span>Finished</span>
        </div>
      </div>

      {/* Status Message */}
      {enforceOrder && !disabled && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Sequential Completion:</strong> Complete sections in order to unlock the next section.
            {currentSection < 6 && !completedSections.includes(currentSection) && 
              ` Finish Section ${currentSection} to proceed.`
            }
          </p>
        </div>
      )}
    </Card>
  );
}