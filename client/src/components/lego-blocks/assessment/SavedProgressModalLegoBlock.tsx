import React, { useState, useEffect } from 'react';
import { Clock, Play, Trash2, User, Mail, Calendar, BarChart3, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ReusableButton from '../ReusableButton';

interface SavedAssessment {
  responseId: string;
  questionnaireId: string;
  completionPercentage: number;
  currentSection: number;
  totalSections: number;
  lastSaved: string;
  email: string;
  name?: string;
  timestamp: number;
}

interface SavedProgressModalLegoBlockProps {
  /** Callback when user resumes an assessment */
  onResumeAssessment: (responseId: string, questionnaireId: string) => void;
  /** Optional trigger text */
  triggerText?: string;
  /** Optional class name for trigger button */
  className?: string;
  /** Show detailed progress information */
  showDetailedProgress?: boolean;
  /** Maximum number of saved assessments to display */
  maxItems?: number;
  /** Modal trigger variant */
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * SavedProgressModalLegoBlock - LEGO Component for Modal Assessment Progress Management
 * 
 * LEGO Principles Applied:
 * - Independent modal operation with clear props interface
 * - Reusable across different contexts (assessment page, dashboard, admin)
 * - Built-in state management for saved assessments
 * - Consistent RSA styling and user experience
 * - Database-first data retrieval with localStorage fallback
 * - No duplication with dashboard component
 * 
 * Key Features:
 * - Modal interface for saved progress management
 * - Displays incomplete saved assessments with progress visualization
 * - Resume functionality with one-click access
 * - Delete saved progress with confirmation
 * - Auto-refresh and real-time updates
 * - Mobile-responsive modal design
 */
export default function SavedProgressModalLegoBlock({
  onResumeAssessment,
  triggerText = 'View Saved Progress',
  className = '',
  showDetailedProgress = true,
  maxItems = 10,
  triggerVariant = 'outline'
}: SavedProgressModalLegoBlockProps) {
  const { toast } = useToast();
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load saved assessments from both localStorage and database
  const loadSavedAssessments = async () => {
    setIsLoading(true);
    const assessments: SavedAssessment[] = [];
    
    try {
      // First, try to load from database
      try {
        const response = await fetch('/api/saved-progress');
        if (response.ok) {
          const dbAssessments = await response.json();
          assessments.push(...dbAssessments);
        }
      } catch (dbError) {
        console.warn('Database loading failed, falling back to localStorage:', dbError);
      }

      // Also load from localStorage as fallback/backup
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('questionnaire-progress-')) {
          try {
            const progressData = JSON.parse(localStorage.getItem(key) || '');
            
            // Validate and include if not completed and has required fields
            if (
              progressData.completionPercentage < 100 && 
              progressData.responseId && 
              progressData.questionnaireId &&
              progressData.email
            ) {
              // Check if we already have this from database
              const existsInDb = assessments.some(a => a.responseId === progressData.responseId);
              if (!existsInDb) {
                assessments.push({
                  responseId: progressData.responseId,
                  questionnaireId: progressData.questionnaireId,
                  completionPercentage: progressData.completionPercentage || 0,
                  currentSection: (progressData.currentSection || 0) + 1, // 1-based for display
                  totalSections: progressData.totalSections || 6,
                  lastSaved: progressData.lastSaved || 'Unknown',
                  email: progressData.email,
                  name: progressData.name,
                  timestamp: progressData.timestamp || Date.now()
                });
              }
            }
          } catch (error) {
            console.error('Failed to parse progress data for key:', key, error);
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }

      // Sort by timestamp (most recent first) and limit
      assessments.sort((a, b) => b.timestamp - a.timestamp);
      setSavedAssessments(assessments.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading saved assessments:', error);
      toast({
        title: "Error loading saved assessments",
        description: "Unable to retrieve your saved progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load assessments when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSavedAssessments();
    }
  }, [isOpen, maxItems]);

  // Handle resume assessment and close modal
  const handleResume = (assessment: SavedAssessment) => {
    onResumeAssessment(assessment.responseId, assessment.questionnaireId);
    setIsOpen(false);
    
    toast({
      title: "Resuming Assessment",
      description: `Continuing from ${assessment.completionPercentage}% completion`,
      duration: 3000
    });
  };

  // Handle delete saved progress from both database and localStorage
  const handleDelete = async (assessment: SavedAssessment) => {
    if (confirm(`Are you sure you want to delete the saved progress for ${assessment.email}? This action cannot be undone.`)) {
      try {
        // Try to delete from database first
        try {
          const response = await fetch(`/api/saved-progress/${assessment.responseId}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            console.warn('Database deletion failed, continuing with localStorage');
          }
        } catch (dbError) {
          console.warn('Database deletion error:', dbError);
        }

        // Also remove from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('questionnaire-progress-')) {
            try {
              const progressData = JSON.parse(localStorage.getItem(key) || '');
              if (progressData.responseId === assessment.responseId) {
                localStorage.removeItem(key);
                break;
              }
            } catch (error) {
              console.error('Error checking progress data:', error);
            }
          }
        }

        // Refresh the list
        await loadSavedAssessments();
        
        toast({
          title: "Progress deleted",
          description: "Saved assessment progress has been removed",
          duration: 3000
        });
      } catch (error) {
        console.error('Error deleting progress:', error);
        toast({
          title: "Delete failed",
          description: "Unable to delete saved progress. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get status color based on completion percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={className}>
          <FolderOpen className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-[#005DAA]" />
            <span>Saved Assessment Progress</span>
            {!isLoading && (
              <Badge variant="secondary" className="ml-2">
                {savedAssessments.length}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Resume your AI maturity assessments where you left off. Your progress is automatically saved as you complete each section.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {!isLoading && savedAssessments.length > 0 && (
                `Showing ${savedAssessments.length} saved assessment${savedAssessments.length !== 1 ? 's' : ''}`
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSavedAssessments}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && savedAssessments.length === 0 && (
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>
                No saved assessment progress found. Start an assessment to see your progress saved here automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Saved Assessments List */}
          {!isLoading && savedAssessments.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {savedAssessments.map((assessment) => (
                <div
                  key={assessment.responseId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#005DAA] transition-colors bg-white"
                >
                  <div className="flex-1 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="font-medium">{assessment.email}</span>
                      </div>
                      {assessment.name && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          <span>{assessment.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">
                          Section {assessment.currentSection} of {assessment.totalSections}
                        </span>
                        <span className="text-[#005DAA] font-semibold text-lg">
                          {assessment.completionPercentage}%
                        </span>
                      </div>
                      <Progress 
                        value={assessment.completionPercentage} 
                        className="h-3"
                      />
                    </div>

                    {/* Additional Details */}
                    {showDetailedProgress && (
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last saved: {assessment.lastSaved}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(assessment.completionPercentage)}`}></div>
                          <span>{formatRelativeTime(assessment.timestamp)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 ml-6">
                    <ReusableButton
                      rsaStyle="primary"
                      size="sm"
                      onClick={() => handleResume(assessment)}
                      icon={Play}
                      className="px-4 py-2"
                    >
                      Resume
                    </ReusableButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(assessment)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}