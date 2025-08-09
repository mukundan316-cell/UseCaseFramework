import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Lock, 
  Unlock, 
  Play, 
  Eye, 
  CheckCircle, 
  TrendingUp,
  AlertCircle,
  Target,
  Lightbulb,
  ArrowRight,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReusableButton from './ReusableButton';

// Section data interface
export interface SectionSummaryData {
  sectionNumber: number;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  estimatedTime: number; // minutes
  actualTime?: number; // minutes
  isLocked: boolean;
  isCompleted: boolean;
  isStarted: boolean;
  maturityScore?: number; // 1-5 scale
  maturityLevel?: 'Beginner' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';
  completionPercentage: number;
  lastModified?: string;
  keyInsights: string[];
  sectionType: 'business_strategy' | 'ai_capabilities' | 'use_case_discovery' | 'technology_infrastructure' | 'people_process_change' | 'regulatory_compliance';
}

export interface SectionSummaryCardLegoBlockProps {
  sections: SectionSummaryData[];
  onSectionClick: (sectionNumber: number) => void;
  onResumeSection?: (sectionNumber: number) => void;
  onReviewSection?: (sectionNumber: number) => void;
  className?: string;
  showInsights?: boolean;
  compactMode?: boolean;
}

// Section type configurations
const SECTION_CONFIG = {
  business_strategy: {
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Target,
    category: 'Strategic Foundation'
  },
  ai_capabilities: {
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: TrendingUp,
    category: 'AI Maturity'
  },
  use_case_discovery: {
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Lightbulb,
    category: 'Opportunity Identification'
  },
  technology_infrastructure: {
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Target,
    category: 'Technical Foundation'
  },
  people_process_change: {
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    icon: TrendingUp,
    category: 'Organizational Readiness'
  },
  regulatory_compliance: {
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: AlertCircle,
    category: 'Risk & Compliance'
  }
};

// Maturity level configurations
const MATURITY_LEVELS = {
  1: { level: 'Beginner', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  2: { level: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  3: { level: 'Proficient', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  4: { level: 'Advanced', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  5: { level: 'Expert', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
};

/**
 * SectionSummaryCardLegoBlock - Display section overview cards with progress tracking
 * 
 * Features:
 * - Progress visualization with completion percentage
 * - Maturity scoring and level indicators
 * - Time tracking (estimated vs actual)
 * - Key insights display
 * - Interactive navigation (Resume/Review buttons)
 * - Lock status and completion states
 * - Responsive grid layout
 */
export default function SectionSummaryCardLegoBlock({
  sections,
  onSectionClick,
  onResumeSection,
  onReviewSection,
  className = '',
  showInsights = true,
  compactMode = false
}: SectionSummaryCardLegoBlockProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  // Format time display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get section configuration
  const getSectionConfig = (sectionType: SectionSummaryData['sectionType']) => {
    return SECTION_CONFIG[sectionType] || SECTION_CONFIG.business_strategy;
  };

  // Get maturity level configuration
  const getMaturityConfig = (score?: number) => {
    if (!score) return null;
    return MATURITY_LEVELS[score as keyof typeof MATURITY_LEVELS] || null;
  };

  // Handle section card click
  const handleCardClick = (section: SectionSummaryData) => {
    if (section.isLocked) return;
    onSectionClick(section.sectionNumber);
  };

  // Handle action button clicks
  const handleActionClick = (e: React.MouseEvent, section: SectionSummaryData, action: 'resume' | 'review') => {
    e.stopPropagation();
    
    if (action === 'resume' && onResumeSection) {
      onResumeSection(section.sectionNumber);
    } else if (action === 'review' && onReviewSection) {
      onReviewSection(section.sectionNumber);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "grid gap-4",
        compactMode ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
      )}>
        {sections.map((section) => {
          const config = getSectionConfig(section.sectionType);
          const maturityConfig = getMaturityConfig(section.maturityScore);
          const isHovered = hoveredSection === section.sectionNumber;
          
          return (
            <Card
              key={section.sectionNumber}
              className={cn(
                "relative transition-all duration-200 cursor-pointer hover:shadow-lg",
                section.isCompleted && "border-green-500 bg-green-50/50",
                section.isLocked && "opacity-60 cursor-not-allowed",
                isHovered && !section.isLocked && "transform -translate-y-1 shadow-xl",
                config.borderColor,
                compactMode ? "min-h-[280px]" : "min-h-[320px]"
              )}
              onClick={() => handleCardClick(section)}
              onMouseEnter={() => setHoveredSection(section.sectionNumber)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* Lock Overlay */}
              {section.isLocked && (
                <div className="absolute inset-0 bg-gray-100/80 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600 font-medium">Section Locked</p>
                    <p className="text-xs text-gray-500">Complete previous sections</p>
                  </div>
                </div>
              )}

              <CardHeader className={cn("pb-3", config.lightColor)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Section {section.sectionNumber}
                      </Badge>
                      {section.isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {section.isStarted && !section.isCompleted && (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <CardTitle className={cn(
                      "text-base leading-tight",
                      compactMode ? "text-sm" : "text-base"
                    )}>
                      {section.title}
                    </CardTitle>
                  </div>
                  <config.icon className={cn("h-5 w-5 flex-shrink-0", config.color.replace('bg-', 'text-'))} />
                </div>

                {!compactMode && (
                  <p className="text-xs text-gray-600 leading-relaxed mt-2">
                    {section.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {section.completedQuestions} of {section.totalQuestions} questions
                    </span>
                  </div>
                  <Progress 
                    value={section.completionPercentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{section.completionPercentage}% complete</span>
                    {section.lastModified && (
                      <span>Updated {new Date(section.lastModified).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Time Tracking */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Time</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>
                      {section.actualTime ? (
                        <span className={cn(
                          section.actualTime > section.estimatedTime ? "text-amber-600" : "text-green-600"
                        )}>
                          {formatTime(section.actualTime)}
                        </span>
                      ) : (
                        <span className="text-gray-500">~{formatTime(section.estimatedTime)}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Maturity Score */}
                {section.isCompleted && maturityConfig && (
                  <div className={cn(
                    "p-3 rounded-lg",
                    maturityConfig.bgColor,
                    maturityConfig.borderColor,
                    "border"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Maturity Level</p>
                        <p className={cn("font-medium text-sm", maturityConfig.color)}>
                          {maturityConfig.level}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < (section.maturityScore || 0) ? 
                                "text-yellow-400 fill-current" : 
                                "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                {showInsights && section.keyInsights.length > 0 && section.isCompleted && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 flex items-center">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Key Insights
                    </p>
                    <ul className="space-y-1">
                      {section.keyInsights.slice(0, compactMode ? 2 : 3).map((insight, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          <span className="leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                {!section.isLocked && (
                  <div className="pt-2 border-t">
                    {section.isCompleted ? (
                      <ReusableButton
                        rsaStyle="secondary"
                        size="sm"
                        onClick={(e) => handleActionClick(e, section, 'review')}
                        icon={Eye}
                        className="w-full"
                      >
                        Review Section
                      </ReusableButton>
                    ) : section.isStarted ? (
                      <ReusableButton
                        rsaStyle="primary"
                        size="sm"
                        onClick={(e) => handleActionClick(e, section, 'resume')}
                        icon={Play}
                        className="w-full"
                      >
                        Resume Section
                      </ReusableButton>
                    ) : (
                      <ReusableButton
                        rsaStyle="primary"
                        size="sm"
                        onClick={(e) => handleActionClick(e, section, 'resume')}
                        icon={ArrowRight}
                        className="w-full"
                      >
                        Start Section
                      </ReusableButton>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Hover Effect Arrow */}
              {isHovered && !section.isLocked && (
                <div className="absolute top-4 right-4 text-blue-600">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}