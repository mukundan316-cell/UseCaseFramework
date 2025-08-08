import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MatrixPlot from './MatrixPlot';
import SummaryMetricsLegoBlock from './lego-blocks/SummaryMetricsLegoBlock';
import ResumeProgressLegoBlock from './lego-blocks/ResumeProgressLegoBlock';

/**
 * DashboardView - Renamed from Matrix View and moved to front position
 * Provides comprehensive 2x2 matrix visualization for AI use case prioritization
 * Follows RSA Framework with enhanced scoring and database-first architecture
 * Enhanced with SummaryMetricsLegoBlock for clickable portfolio overview
 */
export default function DashboardView() {
  const [, setLocation] = useLocation();
  const [resumableProgress, setResumableProgress] = useState<any[]>([]);

  // Check for resumable progress on load
  useEffect(() => {
    const checkResumableProgress = () => {
      const progressItems = [];
      
      // Check all localStorage items for questionnaire progress
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('questionnaire-progress-')) {
          try {
            const progressData = JSON.parse(localStorage.getItem(key) || '');
            
            // Validate and include if not completed
            if (progressData.completionPercentage < 100 && progressData.responseId) {
              progressItems.push({
                completionPercentage: progressData.completionPercentage,
                currentSection: progressData.currentSection + 1, // 1-based for display
                totalSections: progressData.totalSections,
                lastSaved: progressData.lastSaved,
                email: progressData.email,
                name: progressData.name,
                responseId: progressData.responseId,
                questionnaireId: progressData.questionnaireId
              });
            }
          } catch (error) {
            console.error('Failed to parse progress data:', error);
          }
        }
      }

      // Sort by last saved (most recent first)
      progressItems.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
      setResumableProgress(progressItems);
    };

    checkResumableProgress();
    
    // Check periodically for new progress
    const interval = setInterval(checkResumableProgress, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleResumeAssessment = (responseId: string) => {
    // Find the progress data to get questionnaireId
    const progressKey = Object.keys(localStorage).find(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '');
        return data.responseId === responseId;
      } catch {
        return false;
      }
    });

    if (progressKey) {
      try {
        const progressData = JSON.parse(localStorage.getItem(progressKey) || '');
        // Navigate to questionnaire with the questionnaire ID
        setLocation('/questionnaire');
      } catch (error) {
        console.error('Failed to resume assessment:', error);
      }
    }
  };

  const handleDeleteProgress = (responseId: string) => {
    // Find and remove the progress data
    const progressKey = Object.keys(localStorage).find(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '');
        return data.responseId === responseId;
      } catch {
        return false;
      }
    });

    if (progressKey) {
      localStorage.removeItem(progressKey);
      // Refresh the resumable progress list
      setResumableProgress(prev => prev.filter(item => item.responseId !== responseId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Progress Section */}
      {resumableProgress.length > 0 && (
        <ResumeProgressLegoBlock
          progressItems={resumableProgress}
          onResume={handleResumeAssessment}
          onDelete={handleDeleteProgress}
        />
      )}

      {/* Summary Metrics - placed between resume section and matrix */}
      <SummaryMetricsLegoBlock />
      
      {/* Matrix Plot */}
      <MatrixPlot />
    </div>
  );
}