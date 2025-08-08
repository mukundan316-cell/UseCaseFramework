/**
 * Resume Progress LEGO Block
 * Shows resumable assessments and allows users to continue where they left off
 */

import React from 'react';
import { Clock, PlayCircle, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ReusableButton from './ReusableButton';

interface ResumeProgressItem {
  completionPercentage: number;
  currentSection: number;
  totalSections: number;
  lastSaved: string;
  email: string;
  name?: string;
  responseId: string;
}

interface ResumeProgressLegoBlockProps {
  progressItems: ResumeProgressItem[];
  onResume: (responseId: string) => void;
  onDelete: (responseId: string) => void;
  className?: string;
}

/**
 * LEGO Block for displaying and managing resumable assessment progress
 */
export default function ResumeProgressLegoBlock({
  progressItems,
  onResume,
  onDelete,
  className
}: ResumeProgressLegoBlockProps) {
  if (progressItems.length === 0) {
    return null;
  }

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 80) return { color: 'bg-green-500', label: 'Almost Complete' };
    if (percentage >= 50) return { color: 'bg-blue-500', label: 'In Progress' };
    if (percentage >= 20) return { color: 'bg-yellow-500', label: 'Getting Started' };
    return { color: 'bg-gray-500', label: 'Just Started' };
  };

  const formatTimeAgo = (lastSaved: string) => {
    try {
      const savedDate = new Date(lastSaved);
      const now = new Date();
      const diffMs = now.getTime() - savedDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : 'Just now';
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card className={cn("border-blue-200 bg-blue-50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Resume Assessment</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Continue your assessment from where you left off
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {progressItems.map((item, index) => {
          const status = getProgressStatus(item.completionPercentage);
          
          return (
            <div
              key={item.responseId}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      className={cn(
                        "text-xs text-white",
                        status.color
                      )}
                    >
                      {status.label}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Section {item.currentSection} of {item.totalSections}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <strong>{item.name || 'Anonymous'}</strong>
                    {item.email && (
                      <span className="ml-2 text-gray-500">({item.email})</span>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(item.lastSaved)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.completionPercentage}% Complete
                  </span>
                  <span className="text-xs text-gray-500">
                    Last saved: {new Date(item.lastSaved).toLocaleTimeString()}
                  </span>
                </div>
                <Progress 
                  value={item.completionPercentage} 
                  className="h-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={() => onResume(item.responseId)}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Continue Assessment
                </ReusableButton>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.responseId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Status Messages */}
              {item.completionPercentage >= 90 && (
                <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Almost finished!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Just a few more questions to complete your assessment.
                  </p>
                </div>
              )}

              {item.completionPercentage < 20 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Just getting started</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Continue to unlock personalized insights and recommendations.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer Note */}
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Your progress is automatically saved as you complete each question. 
            You can safely close your browser and return anytime within 30 days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}