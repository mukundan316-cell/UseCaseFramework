/**
 * AssessmentStatsLegoBlock - LEGO Component for Assessment Statistics
 * Displays comprehensive assessment usage statistics
 * 
 * LEGO Principles:
 * ✓ Reusable across different admin contexts
 * ✓ Props-based configuration
 * ✓ Database-first data fetching
 * ✓ Built-in loading/error states
 * ✓ Independent operation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClipboardList, 
  Workflow, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import ReusableButton from './ReusableButton';

interface AssessmentStats {
  totalResponses: number;
  completionRate: number;
  averageScore: number;
  sectionPerformance: { [key: string]: number };
  totalQuestions: number;
  totalSections: number;
  estimatedTime: number;
  status: 'draft' | 'active' | 'archived';
  version: string;
}

interface AssessmentStatsLegoBlockProps {
  questionnaireId?: string;
  showActions?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const AssessmentStatsLegoBlock: React.FC<AssessmentStatsLegoBlockProps> = ({
  questionnaireId, // Will be set dynamically from available questionnaires
  showActions = true,
  onRefresh,
  className = ""
}) => {
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<any[]>([]);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>(questionnaireId || '');

  const loadAvailableQuestionnaires = async () => {
    try {
      const response = await fetch('/api/questionnaire/sections');
      if (response.ok) {
        const questionnaires = await response.json();
        setAvailableQuestionnaires(questionnaires);
        
        // Set "Current AI & Data Capabilities" as default, or fall back to first questionnaire
        if (!selectedQuestionnaireId && questionnaires.length > 0) {
          const aiCapabilities = questionnaires.find((q: any) => 
            q.title?.toLowerCase().includes('current ai') || 
            q.title?.toLowerCase().includes('ai & data capabilities')
          );
          const defaultId = aiCapabilities?.id || questionnaires[0].id;
          setSelectedQuestionnaireId(defaultId);
          loadStats(defaultId);
        }
      }
    } catch (error) {
      console.error('Failed to load questionnaires:', error);
    }
  };

  const loadStats = async (targetQuestionnaireId?: string) => {
    const currentId = targetQuestionnaireId || selectedQuestionnaireId;
    if (!currentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load questionnaire structure
      const questResponse = await fetch(`/api/questionnaire/${currentId}`);
      if (!questResponse.ok) throw new Error('Failed to load questionnaire');
      const questData = await questResponse.json();

      // Calculate basic stats from Survey.js format (pages instead of sections)
      let totalQuestions = 0;
      let totalSections = 0;
      let estimatedTime = 0;

      if (questData.pages && Array.isArray(questData.pages)) {
        questData.pages.forEach((page: any) => {
          if (page.elements && Array.isArray(page.elements)) {
            page.elements.forEach((element: any) => {
              if (element.type === 'panel' && element.elements) {
                totalSections++;
                totalQuestions += element.elements.length;
                // Estimate 2 minutes per question
                estimatedTime += element.elements.length * 2;
              } else if (element.type !== 'html') {
                totalQuestions++;
                estimatedTime += 2;
              }
            });
          }
        });
      }

      // Use fallback if no pages structure found
      if (totalQuestions === 0 && questData.sections) {
        totalQuestions = questData.sections.reduce((sum: number, section: any) => 
          sum + (section.questions?.length || 0), 0) || 0;
        totalSections = questData.sections.length || 0;
        estimatedTime = questData.sections.reduce((sum: number, section: any) => 
          sum + (section.estimatedTime || 5), 0) || 0;
      }

      // Try to load usage statistics from the actual available endpoint
      let usageStats = {
        totalResponses: 0,
        completionRate: 0,
        averageScore: 0,
        sectionPerformance: {}
      };

      try {
        // Use the actual questionnaire stats endpoint
        const statsResponse = await fetch('/api/questionnaire/stats');
        if (statsResponse.ok) {
          const questStats = await statsResponse.json();
          // Map the real questionnaire stats to our expected format
          usageStats = {
            totalResponses: questStats.totalResponses || 0,
            completionRate: questStats.completionRate || 0,
            averageScore: questStats.averageScore || 0,
            sectionPerformance: questStats.sectionPerformance || {}
          };
        }
      } catch {
        // Stats are optional - continue without them
      }

      setStats({
        ...usageStats,
        totalQuestions,
        totalSections,
        estimatedTime,
        status: questData.isActive ? 'active' : 'draft',
        version: questData.version || '1.0'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment statistics');
    } finally {
      setLoading(false);
    }
  };

  // Load questionnaires when component mounts
  useEffect(() => {
    loadAvailableQuestionnaires();
  }, []);

  // Load stats when questionnaire selection changes
  useEffect(() => {
    if (selectedQuestionnaireId) {
      loadStats();
    }
  }, [selectedQuestionnaireId]);

  const handleRefresh = () => {
    loadStats();
    onRefresh?.();
  };

  const handleQuestionnaireChange = (newId: string) => {
    setSelectedQuestionnaireId(newId);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Loading Assessment Statistics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error Loading Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {showActions && (
            <div className="mt-4">
              <ReusableButton
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                icon={RefreshCw}
              >
                Retry
              </ReusableButton>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            No Assessment Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No assessment data available. The RSA Assessment may need to be created.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isAssessmentReady = stats.totalQuestions >= 10;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Questionnaire Selector and Actions */}
      {showActions && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assessment Statistics</h3>
              <p className="text-sm text-gray-600">Real-time statistics from questionnaire responses</p>
            </div>
            <ReusableButton
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={loading}
            >
              Refresh
            </ReusableButton>
          </div>
          
          {/* Questionnaire Selector */}
          {availableQuestionnaires.length > 0 && (
            <div className="flex items-center space-x-4">
              <label htmlFor="questionnaire-select" className="text-sm font-medium text-gray-700">
                Questionnaire:
              </label>
              <select
                id="questionnaire-select"
                value={selectedQuestionnaireId}
                onChange={(e) => handleQuestionnaireChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableQuestionnaires.map((questionnaire) => (
                  <option key={questionnaire.id} value={questionnaire.id}>
                    {questionnaire.title} ({questionnaire.questions} questions)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sections</p>
                <p className="text-2xl font-bold">{stats.totalSections}</p>
              </div>
              <Workflow className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Est. Time</p>
                <p className="text-2xl font-bold">{stats.estimatedTime}m</p>
              </div>
              <Info className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={stats.status === 'active' ? 'default' : 'secondary'}>
                  {stats.status}
                </Badge>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${isAssessmentReady ? 'text-green-600' : 'text-orange-600'}`}>
            {isAssessmentReady ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Assessment Ready
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 mr-2" />
                Assessment Setup Required
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isAssessmentReady 
              ? 'The Hexaware AI Maturity Assessment is fully configured and ready for use.'
              : 'The assessment needs additional questions to be complete.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Version:</span> {stats.version}
              </div>
              <div>
                <span className="font-medium">Status:</span> {stats.status}
              </div>
              <div>
                <span className="font-medium">Total Questions:</span> {stats.totalQuestions}
              </div>
              <div>
                <span className="font-medium">Estimated Time:</span> {stats.estimatedTime} minutes
              </div>
            </div>
            
            {/* Usage Statistics (if available) */}
            {stats.totalResponses > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Responses:</span> {stats.totalResponses}
                  </div>
                  <div>
                    <span className="font-medium">Completion Rate:</span> {stats.completionRate.toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">Avg Score:</span> {stats.averageScore.toFixed(1)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentStatsLegoBlock;