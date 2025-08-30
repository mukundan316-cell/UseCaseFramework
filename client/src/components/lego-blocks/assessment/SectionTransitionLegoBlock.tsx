import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import ReusableButton from '../ReusableButton';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  X, 
  AlertTriangle,
  Sparkles,
  Trophy,
  Target,
  Clock,
  Eye,
  Loader2,
  PartyPopper
} from 'lucide-react';

// Section data interface
export interface SectionData {
  sectionNumber: number;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  isCompleted: boolean;
  isLocked: boolean;
  estimatedTime: number;
  completionPercentage: number;
  keyHighlights?: string[];
}

// Transition states
export type TransitionState = 'idle' | 'validating' | 'loading' | 'transitioning' | 'celebrating' | 'error';

export interface SectionTransitionLegoBlockProps {
  currentSection: SectionData;
  nextSection?: SectionData;
  previousSection?: SectionData;
  transitionState: TransitionState;
  onNavigateToSection: (sectionNumber: number) => Promise<void>;
  onSaveAndExit: () => Promise<void>;
  onCompleteSection: () => Promise<void>;
  onValidateSection?: () => Promise<boolean>;
  hasUnsavedChanges?: boolean;
  isAllSectionsComplete?: boolean;
  className?: string;
  showCelebration?: boolean;
  autoAdvance?: boolean;
}

/**
 * SectionTransitionLegoBlock - Handle smooth section navigation with validation
 * 
 * Features:
 * - Section completion validation before transition
 * - Confirmation dialogs for unsaved changes
 * - Loading states and transition animations
 * - Success celebrations on completion
 * - Next section preview
 * - Save & Exit functionality
 * - All sections completion celebration
 */
export default function SectionTransitionLegoBlock({
  currentSection,
  nextSection,
  previousSection,
  transitionState,
  onNavigateToSection,
  onSaveAndExit,
  onCompleteSection,
  onValidateSection,
  hasUnsavedChanges = false,
  isAllSectionsComplete = false,
  className = '',
  showCelebration = false,
  autoAdvance = false
}: SectionTransitionLegoBlockProps) {
  
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle celebration animation
  useEffect(() => {
    if (showCelebration) {
      setCelebrationVisible(true);
      const timer = setTimeout(() => setCelebrationVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Auto-advance to next section if enabled
  useEffect(() => {
    if (autoAdvance && currentSection.isCompleted && nextSection && !nextSection.isLocked) {
      const timer = setTimeout(() => {
        handleNavigateToSection(nextSection.sectionNumber);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, currentSection.isCompleted, nextSection]);

  // Validate section before transition
  const validateSectionTransition = async (): Promise<boolean> => {
    if (onValidateSection) {
      try {
        const isValid = await onValidateSection();
        if (!isValid) {
          setValidationError('Please complete all required questions before proceeding.');
          return false;
        }
      } catch (error) {
        setValidationError('Validation failed. Please try again.');
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  // Handle section navigation
  const handleNavigateToSection = async (sectionNumber: number) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      setPendingNavigation(sectionNumber);
      setShowTransitionDialog(true);
      return;
    }

    // Validate current section if moving forward
    if (sectionNumber > currentSection.sectionNumber) {
      const isValid = await validateSectionTransition();
      if (!isValid) return;
    }

    // Proceed with navigation
    try {
      await onNavigateToSection(sectionNumber);
    } catch (error) {
      setValidationError('Failed to navigate to section. Please try again.');
    }
  };

  // Handle section completion
  const handleCompleteSection = async () => {
    const isValid = await validateSectionTransition();
    if (!isValid) return;

    try {
      await onCompleteSection();
    } catch (error) {
      setValidationError('Failed to complete section. Please try again.');
    }
  };

  // Handle save and exit
  const handleSaveAndExit = async () => {
    setShowExitDialog(false);
    try {
      await onSaveAndExit();
    } catch (error) {
      setValidationError('Failed to save progress. Please try again.');
    }
  };

  // Confirm transition with unsaved changes
  const confirmTransition = async () => {
    setShowTransitionDialog(false);
    if (pendingNavigation) {
      await onNavigateToSection(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Cancel transition
  const cancelTransition = () => {
    setShowTransitionDialog(false);
    setPendingNavigation(null);
  };

  // Get transition button states
  const isLoading = transitionState === 'loading' || transitionState === 'validating';
  const isTransitioning = transitionState === 'transitioning';
  const canGoNext = nextSection && !nextSection.isLocked && !isLoading;
  const canGoPrevious = previousSection && !isLoading;

  return (
    <>
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        isTransitioning && "opacity-50",
        className
      )}>
        {/* Celebration Overlay */}
        {celebrationVisible && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center z-20 animate-pulse">
            <div className="text-center space-y-2">
              {isAllSectionsComplete ? (
                <>
                  <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-bounce" />
                  <h3 className="text-xl font-bold text-gray-900">🎉 Assessment Complete! 🎉</h3>
                  <p className="text-gray-600">Congratulations on completing all sections!</p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-10 w-10 mx-auto text-green-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-gray-900">Section Completed!</h3>
                  <p className="text-gray-600">Great progress on your assessment</p>
                </>
              )}
            </div>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Badge variant="outline">
                  Section {currentSection.sectionNumber}
                </Badge>
                <span>{currentSection.title}</span>
                {currentSection.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {currentSection.description}
              </p>
            </div>
            
            {/* Status Badge */}
            <Badge 
              variant={currentSection.isCompleted ? "default" : "secondary"}
              className={cn(
                "flex items-center space-x-1",
                currentSection.isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              )}
            >
              {transitionState === 'loading' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Loading</span>
                </>
              ) : transitionState === 'validating' ? (
                <>
                  <Clock className="h-3 w-3" />
                  <span>Validating</span>
                </>
              ) : currentSection.isCompleted ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <Target className="h-3 w-3" />
                  <span>In Progress</span>
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Section Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Section Progress</span>
              <span className="text-sm text-gray-600">
                {currentSection.completedQuestions} of {currentSection.totalQuestions} questions
              </span>
            </div>
            <Progress value={currentSection.completionPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{currentSection.completionPercentage}% complete</span>
              <span>Est. {currentSection.estimatedTime} minutes</span>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Validation Error</p>
                <p className="text-xs text-red-600 mt-1">{validationError}</p>
              </div>
            </div>
          )}

          {/* Next Section Preview */}
          {nextSection && currentSection.isCompleted && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Next Section Preview</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Section {nextSection.sectionNumber}:</strong> {nextSection.title}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">{nextSection.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{nextSection.totalQuestions} questions</span>
                    <span>~{nextSection.estimatedTime} minutes</span>
                    {nextSection.isLocked && (
                      <Badge variant="outline" className="text-xs">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Highlights */}
          {currentSection.keyHighlights && currentSection.keyHighlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Key Focus Areas
              </h4>
              <ul className="space-y-1">
                {currentSection.keyHighlights.map((highlight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {/* Previous Section */}
            {canGoPrevious && (
              <ReusableButton
                rsaStyle="secondary"
                size="sm"
                onClick={() => handleNavigateToSection(previousSection.sectionNumber)}
                icon={ArrowLeft}
                disabled={isLoading}
              >
                Previous Section
              </ReusableButton>
            )}

            {/* Complete Section */}
            {!currentSection.isCompleted && currentSection.completionPercentage >= 100 && (
              <ReusableButton
                rsaStyle="primary"
                size="sm"
                onClick={handleCompleteSection}
                icon={CheckCircle}
                disabled={isLoading}
              >
                Complete Section
              </ReusableButton>
            )}

            {/* Next Section */}
            {canGoNext && (
              <ReusableButton
                rsaStyle="primary"
                size="sm"
                onClick={() => handleNavigateToSection(nextSection.sectionNumber)}
                icon={ArrowRight}
                disabled={isLoading}
              >
                {currentSection.isCompleted ? 'Next Section' : 'Continue to Next'}
              </ReusableButton>
            )}

            {/* Save & Exit */}
            <ReusableButton
              rsaStyle="secondary"
              size="sm"
              onClick={() => setShowExitDialog(true)}
              icon={Save}
              disabled={isLoading}
            >
              Save & Exit
            </ReusableButton>
          </div>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                You have unsaved changes. They will be lost if you navigate away.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Progress and Exit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved and you can resume the assessment later from where you left off.
              {hasUnsavedChanges && " Any unsaved changes in the current question will be saved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndExit}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transition Confirmation Dialog */}
      <AlertDialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you navigate away. 
              Would you like to continue anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelTransition}>
              Stay Here
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmTransition}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}