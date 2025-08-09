import React, { useState, useEffect } from 'react';
import { Clock, Play, Trash2, User, Mail, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ReusableButton from './ReusableButton';

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

interface ResumeProgressLegoBlockProps {
  /** Callback when user resumes an assessment */
  onResumeAssessment: (responseId: string, questionnaireId: string) => void;
  /** Optional class name for styling */
  className?: string;
  /** Show detailed progress information */
  showDetailedProgress?: boolean;
  /** Maximum number of saved assessments to display */
  maxItems?: number;
}

/**
 * ResumeProgressLegoBlock - LEGO Component for Assessment Progress Management
 * 
 * LEGO Principles Applied:
 * - Independent operation with clear props interface
 * - Reusable across different contexts (dashboard, assessment page)
 * - Built-in state management for saved assessments
 * - Consistent RSA styling and user experience
 * - Database-first data retrieval with localStorage fallback
 * 
 * Key Features:
 * - Displays incomplete saved assessments with progress visualization
 * - Resume functionality with one-click access
 * - Delete saved progress with confirmation
 * - Auto-refresh to show latest saved states
 * - Mobile-responsive design
 */
export default function ResumeProgressLegoBlock({
  onResumeAssessment,
  className = '',
  showDetailedProgress = true,
  maxItems = 5
}: ResumeProgressLegoBlockProps) {
  const { toast } = useToast();
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved assessments from localStorage
  const loadSavedAssessments = () => {
    setIsLoading(true);
    const assessments: SavedAssessment[] = [];
    
    try {
      // Check all localStorage items for questionnaire progress
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
          } catch (error) {
            console.error('Failed to parse progress data for key:', key, error);
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }

      // Sort by timestamp (most recent first)
      assessments.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit to maxItems
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

  // Load assessments on mount and set up periodic refresh
  useEffect(() => {
    loadSavedAssessments();
    
    // Refresh every 30 seconds to catch new saves
    const interval = setInterval(loadSavedAssessments, 30000);
    return () => clearInterval(interval);
  }, [maxItems]);

  // Handle resume assessment
  const handleResume = (assessment: SavedAssessment) => {
    onResumeAssessment(assessment.responseId, assessment.questionnaireId);
    
    toast({
      title: "Resuming Assessment",
      description: `Continuing from ${assessment.completionPercentage}% completion`,
      duration: 3000
    });
  };

  // Handle delete saved progress
  const handleDelete = (assessment: SavedAssessment) => {
    if (confirm(`Are you sure you want to delete the saved progress for ${assessment.email}? This action cannot be undone.`)) {
      try {
        // Find and remove the corresponding localStorage key
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
        loadSavedAssessments();
        
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

  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-[#005DAA]" />
            <span>Saved Progress</span>
          </CardTitle>
          <CardDescription>Loading your saved assessments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (savedAssessments.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-[#005DAA]" />
            <span>Saved Progress</span>
          </CardTitle>
          <CardDescription>No saved assessment progress found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              Start an assessment to see your progress saved here. Your work is automatically saved as you complete each section.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Main component with saved assessments
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-[#005DAA]" />
            <span>Saved Progress</span>
            <Badge variant="secondary" className="ml-2">
              {savedAssessments.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSavedAssessments}
            className="text-xs"
          >
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Resume your AI maturity assessments where you left off
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedAssessments.map((assessment) => (
            <div
              key={assessment.responseId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#005DAA] transition-colors"
            >
              <div className="flex-1 space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span>{assessment.email}</span>
                  </div>
                  {assessment.name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-3 w-3" />
                      <span>{assessment.name}</span>
                    </div>
                  )}
                </div>

                {/* Progress Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      Section {assessment.currentSection} of {assessment.totalSections}
                    </span>
                    <span className="text-[#005DAA] font-semibold">
                      {assessment.completionPercentage}%
                    </span>
                  </div>
                  <Progress 
                    value={assessment.completionPercentage} 
                    className="h-2"
                  />
                </div>

                {/* Additional Details (if enabled) */}
                {showDetailedProgress && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{assessment.lastSaved}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(assessment.completionPercentage)}`}></div>
                      <span>{formatRelativeTime(assessment.timestamp)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={() => handleResume(assessment)}
                  icon={Play}
                  className="px-3 py-1"
                >
                  Resume
                </ReusableButton>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(assessment)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-refresh notice */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Progress automatically refreshed every 30 seconds
        </div>
      </CardContent>
    </Card>
  );
}