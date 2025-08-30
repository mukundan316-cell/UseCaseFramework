import React, { useEffect, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Save, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReusableButton from '../ReusableButton';
import { useToast } from '@/hooks/use-toast';

export interface SectionContainerProps {
  /** Current section number (1-6) */
  currentSection: number;
  /** Total number of sections */
  totalSections: number;
  /** Section title */
  sectionTitle: string;
  /** Section content to render */
  children: React.ReactNode;
  /** Progress for current section */
  sectionProgress: { completed: number; total: number };
  /** Overall questionnaire progress */
  overallProgress: { completed: number; total: number };
  /** Navigation handlers */
  onPrevious: () => void;
  onNext: () => void;
  onSaveAndExit: () => void;
  /** Validation state */
  canProceed: boolean;
  hasUnsavedChanges: boolean;
  /** Auto-save state */
  lastSaved?: string;
  isSaving?: boolean;
  /** Optional customization */
  className?: string;
  /** Disable all navigation */
  disabled?: boolean;
  /** Custom navigation validation */
  onNavigationAttempt?: (direction: 'prev' | 'next') => boolean;
}

/**
 * QuestionnaireSectionContainerLegoBlock - LEGO component for section content management
 * 
 * Features:
 * - Consistent section layout with navigation
 * - Progress tracking and auto-save indicators
 * - Keyboard navigation support (← → arrows)
 * - Touch/swipe gestures for mobile
 * - Transition animations between sections
 * - Save & Exit functionality
 * - Validation before navigation
 * 
 * @example
 * <QuestionnaireSectionContainerLegoBlock
 *   currentSection={2}
 *   totalSections={6}
 *   sectionTitle="Current AI & Data Capabilities"
 *   sectionProgress={{ completed: 28, total: 35 }}
 *   overallProgress={{ completed: 45, total: 100 }}
 *   onPrevious={handlePrevious}
 *   onNext={handleNext}
 *   onSaveAndExit={handleSaveExit}
 *   canProceed={true}
 *   hasUnsavedChanges={false}
 * >
 *   <YourSectionContent />
 * </QuestionnaireSectionContainerLegoBlock>
 */
export default function QuestionnaireSectionContainerLegoBlock({
  currentSection,
  totalSections,
  sectionTitle,
  children,
  sectionProgress,
  overallProgress,
  onPrevious,
  onNext,
  onSaveAndExit,
  canProceed,
  hasUnsavedChanges,
  lastSaved,
  isSaving = false,
  className = '',
  disabled = false,
  onNavigationAttempt
}: SectionContainerProps) {
  const { toast } = useToast();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  // Calculate progress percentages
  const sectionPercent = Math.round((sectionProgress.completed / sectionProgress.total) * 100);
  const overallPercent = Math.round((overallProgress.completed / overallProgress.total) * 100);

  // Navigation with validation
  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (disabled) return;

    // Custom validation check
    if (onNavigationAttempt && !onNavigationAttempt(direction)) {
      return;
    }

    // Check for unsaved changes
    if (hasUnsavedChanges) {
      toast({
        title: "Unsaved Changes",
        description: "Your changes are being saved automatically. Please wait a moment.",
        variant: "default",
      });
      return;
    }

    // Validate before proceeding
    if (direction === 'next' && !canProceed) {
      toast({
        title: "Complete Required Questions",
        description: "Please answer all required questions before proceeding to the next section.",
        variant: "destructive",
      });
      return;
    }

    // Add transition animation
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === 'prev') {
        onPrevious();
      } else {
        onNext();
      }
      setIsTransitioning(false);
    }, 150);
  }, [disabled, hasUnsavedChanges, canProceed, onNavigationAttempt, onPrevious, onNext, toast]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentSection > 1) {
            handleNavigation('prev');
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentSection < totalSections) {
            handleNavigation('next');
          }
          break;
        case 'Escape':
          event.preventDefault();
          onSaveAndExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, totalSections, handleNavigation, onSaveAndExit]);

  // Touch/swipe gestures for mobile
  const handleTouchStart = (event: React.TouchEvent) => {
    setSwipeStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (swipeStartX === null) return;

    const swipeEndX = event.changedTouches[0].clientX;
    const swipeDistance = swipeStartX - swipeEndX;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentSection < totalSections) {
        // Swipe left = next section
        handleNavigation('next');
      } else if (swipeDistance < 0 && currentSection > 1) {
        // Swipe right = previous section
        handleNavigation('prev');
      }
    }

    setSwipeStartX(null);
  };

  // Format last saved time
  const formatLastSaved = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'Saved just now';
    if (diffSeconds < 3600) return `Saved ${Math.floor(diffSeconds / 60)}m ago`;
    return `Saved ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Navigation button states
  const canGoPrevious = currentSection > 1 && !disabled;
  const canGoNext = currentSection < totalSections && !disabled;

  return (
    <div className={cn("flex flex-col h-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50", className)}>
      {/* Header */}
      <Card className="rounded-none border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            {/* Section Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Badge variant="outline" className="bg-[#005DAA] text-white border-[#005DAA]">
                  Section {currentSection} of {totalSections}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    sectionPercent === 100 ? 'bg-green-50 text-green-700 border-green-300' :
                    sectionPercent > 0 ? 'bg-blue-50 text-blue-700 border-blue-300' :
                    'bg-gray-50 text-gray-700 border-gray-300'
                  )}
                >
                  {sectionPercent}% Complete
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{sectionTitle}</h1>
              
              {/* Progress Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Section Progress</span>
                    <span>{sectionProgress.completed} of {sectionProgress.total} questions</span>
                  </div>
                  <Progress value={sectionPercent} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{overallProgress.completed} of {overallProgress.total} questions</span>
                  </div>
                  <Progress value={overallPercent} className="h-2 bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Save & Exit Button */}
            <div className="flex flex-col items-end space-y-2 ml-6">
              <ReusableButton
                rsaStyle="secondary"
                onClick={onSaveAndExit}
                icon={Save}
                size="sm"
                disabled={disabled}
              >
                Save & Exit
              </ReusableButton>
              
              {/* Auto-save Status */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-[#005DAA] border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span>Unsaved changes</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>{formatLastSaved(lastSaved)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isTransitioning && "opacity-50 transform translate-x-2"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="max-w-4xl mx-auto p-6">
          {children}
        </CardContent>
      </div>

      {/* Navigation Footer */}
      <Card className="rounded-none border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {/* Previous Button */}
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => handleNavigation('prev')}
              icon={ChevronLeft}
              iconPosition="left"
              disabled={!canGoPrevious}
              className="min-w-[120px]"
            >
              Previous
            </ReusableButton>

            {/* Section Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Section {currentSection} of {totalSections}</span>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  Unsaved
                </Badge>
              )}
            </div>

            {/* Next Button */}
            <ReusableButton
              rsaStyle="primary"
              onClick={() => handleNavigation('next')}
              icon={ChevronRight}
              iconPosition="right"
              disabled={!canGoNext || !canProceed}
              className="min-w-[120px]"
            >
              {currentSection === totalSections ? 'Complete' : 'Next'}
            </ReusableButton>
          </div>

          {/* Mobile Progress Indicator */}
          <div className="md:hidden mt-4 text-center">
            <div className="flex justify-center space-x-1 mb-2">
              {Array.from({ length: totalSections }, (_, i) => (
                <div
                  key={i + 1}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i + 1 === currentSection ? 'bg-[#005DAA]' :
                    i + 1 < currentSection ? 'bg-green-500' :
                    'bg-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Section {currentSection} of {totalSections} • {overallPercent}% Complete
            </p>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="hidden lg:block mt-3 text-center text-xs text-gray-400">
            Use ← → arrow keys to navigate • ESC to save and exit
          </div>
        </CardContent>
      </Card>
    </div>
  );
}