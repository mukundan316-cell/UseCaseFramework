import React from 'react';
import { TrendingUp, Target, AlertTriangle, CheckCircle2, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ResponseExportLegoBlock from './ResponseExportLegoBlock';

export interface MaturityScore {
  category: string;
  score: number;
  level: string;
  percentage: number;
  description?: string;
  recommendations?: string[];
}

export interface ScoringData {
  overallScore: number;
  overallLevel: string;
  overallPercentage: number;
  totalResponses: number;
  completedAt: string;
  dimensionScores: MaturityScore[];
  gapAnalysis: {
    strengths: string[];
    improvements: string[];
    criticalGaps: string[];
  };
}

interface ScoringDashboardLegoBlockProps {
  data?: ScoringData & { responseId?: string };
  isLoading?: boolean;
  compact?: boolean;
  showGapAnalysis?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Reusable Scoring Dashboard LEGO Block
 * Displays maturity scores with color-coded levels and gap analysis
 * Can be used in different contexts (main dashboard, assessment results, admin reports)
 */
export default function ScoringDashboardLegoBlock({
  data,
  isLoading = false,
  compact = false,
  showGapAnalysis = true,
  className = "",
  title = "AI Maturity Scoring",
  description = "Current assessment results and maturity levels"
}: ScoringDashboardLegoBlockProps) {
  const { toast } = useToast();
  
  const generateRecommendations = async (responseId: string) => {
    try {
      toast({ title: "Generating recommendations...", description: "Analyzing your assessment results" });
      
      const response = await fetch(`/api/assessments/${responseId}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to generate recommendations');
      
      const result = await response.json();
      
      toast({
        title: "✅ Recommendations Generated",
        description: `${result.recommendedUseCases.length} use cases recommended based on your maturity gaps`,
        duration: 5000
      });
      
    } catch (error) {
      toast({
        title: "Failed to generate recommendations",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };

  // Maturity level configuration with RSA branding
  const maturityLevels = {
    'Initial': { color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
    'Repeatable': { color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
    'Defined': { color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
    'Managed': { color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    'Optimized': { color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' }
  };

  // Get maturity level styling
  const getLevelStyling = (level: string) => {
    return maturityLevels[level as keyof typeof maturityLevels] || maturityLevels.Initial;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-[#005DAA]" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no data
  if (!data) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Activity className="h-12 w-12 text-gray-300 mx-auto" />
            <div className="space-y-2">
              <p className="text-gray-500 font-medium">No Assessment Data</p>
              <p className="text-sm text-gray-400">
                Complete an AI maturity assessment to see your scores here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallStyling = getLevelStyling(data.overallLevel);

  // Compact view for smaller contexts
  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-[#005DAA]" />
              <span>AI Maturity</span>
            </span>
            <Badge 
              variant="outline" 
              className={cn(overallStyling.textColor, overallStyling.borderColor)}
            >
              {data.overallLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Score</span>
              <span className="font-semibold text-[#005DAA]">{data.overallPercentage}%</span>
            </div>
            <Progress value={data.overallPercentage} className="h-2" />
            <div className="text-xs text-gray-500">
              Based on {data.totalResponses} responses • {new Date(data.completedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full dashboard view
  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Overall Score Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <BarChart3 className="h-5 w-5 text-[#005DAA]" />
                <span>{title}</span>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-sm font-medium">{new Date(data.completedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className={cn(
              "p-6 rounded-xl border",
              overallStyling.bgColor,
              overallStyling.borderColor
            )}>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-gray-900">{data.overallPercentage}%</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className={cn("w-3 h-3 rounded-full", overallStyling.color)}></div>
                  <span className={cn("font-semibold", overallStyling.textColor)}>
                    {data.overallLevel}
                  </span>
                </div>
                <Progress value={data.overallPercentage} className="h-2 mt-3" />
                <div className="text-xs text-gray-600">Overall Maturity</div>
                <div className="flex flex-col space-y-2 mt-3">
                  {/* Generate Recommendations Button */}
                  <Button 
                    size="sm"
                    onClick={() => data.responseId && generateRecommendations(data.responseId)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    disabled={!data.responseId}
                  >
                    ⭐ Generate Recommendations
                  </Button>
                  
                  {/* Export Results Button */}
                  {data.responseId && (
                    <ResponseExportLegoBlock
                      responseId={data.responseId}
                      assessmentTitle="AI Maturity Assessment"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Total Responses */}
            <div className="p-6 rounded-xl border border-gray-200 bg-gray-50">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-gray-900">{data.totalResponses}</div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-gray-700">Responses</span>
                </div>
                <div className="text-xs text-gray-600">Assessment Completion</div>
              </div>
            </div>

            {/* Score Range */}
            <div className="p-6 rounded-xl border border-blue-200 bg-blue-50">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-gray-900">{data.overallScore.toFixed(1)}</div>
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-blue-700">out of 5.0</span>
                </div>
                <div className="text-xs text-gray-600">Scale Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-[#005DAA]" />
            <span>Dimension Scores</span>
          </CardTitle>
          <CardDescription>
            Detailed breakdown across key maturity dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.dimensionScores.map((dimension, index) => {
              const styling = getLevelStyling(dimension.level);
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {dimension.category.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          styling.textColor,
                          styling.borderColor
                        )}
                      >
                        {dimension.level}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="font-semibold text-[#005DAA]">
                        {dimension.percentage}%
                      </span>
                      <span className="text-gray-500">
                        ({dimension.score.toFixed(1)}/5.0)
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={dimension.percentage} className="h-2" />
                  
                  {dimension.description && (
                    <p className="text-sm text-gray-600 ml-0">
                      {dimension.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      {showGapAnalysis && data.gapAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span>Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {data.gapAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-green-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Improvement Areas */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <TrendingUp className="h-5 w-5" />
                <span>Improvements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {data.gapAnalysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2 text-blue-700">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Critical Gaps */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Critical Gaps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {data.gapAnalysis.criticalGaps.map((gap, index) => (
                  <li key={index} className="flex items-start space-x-2 text-orange-700">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}