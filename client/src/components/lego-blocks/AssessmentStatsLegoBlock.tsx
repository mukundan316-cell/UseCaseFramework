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
  questionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b', // RSA Assessment ID
  showActions = true,
  onRefresh,
  className = ""
}) => {
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load questionnaire structure
      const questResponse = await fetch(`/api/questionnaires/${questionnaireId}`);
      if (!questResponse.ok) throw new Error('Failed to load questionnaire');
      const questData = await questResponse.json();

      // Calculate basic stats
      const totalQuestions = questData.sections?.reduce((sum: number, section: any) => 
        sum + (section.questions?.length || 0), 0) || 0;
      const totalSections = questData.sections?.length || 0;
      const estimatedTime = questData.sections?.reduce((sum: number, section: any) => 
        sum + (section.estimatedTime || 5), 0) || 0;

      // Try to load usage statistics (optional)
      let usageStats = {
        totalResponses: 0,
        completionRate: 0,
        averageScore: 0,
        sectionPerformance: {}
      };

      try {
        const statsResponse = await fetch('/api/assessment-stats');
        if (statsResponse.ok) {
          usageStats = await statsResponse.json();
        }
      } catch {
        // Usage stats are optional - continue without them
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

  useEffect(() => {
    loadStats();
  }, [questionnaireId]);

  const handleRefresh = () => {
    loadStats();
    onRefresh?.();
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
      {/* Header with Actions */}
      {showActions && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Assessment Statistics</h3>
            <p className="text-sm text-gray-600">RSA AI Maturity Assessment overview</p>
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
              ? 'The RSA AI Maturity Assessment is fully configured and ready for use.'
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