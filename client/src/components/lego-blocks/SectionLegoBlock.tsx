import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import QuestionLegoBlock, { QuestionData } from './QuestionLegoBlock';
import QuestionRegistryLegoBlock, { QuestionMetadata, QuestionType } from './QuestionRegistryLegoBlock';

export interface SectionData {
  id: string;
  title: string;
  sectionOrder: number;
  estimatedTime?: number;
  questions: QuestionData[];
}

export interface SectionLegoBlockProps {
  section: SectionData;
  responses: Map<string, any>;
  onChange: (questionId: string, value: any) => void;
  readonly?: boolean;
  defaultExpanded?: boolean;
  showProgress?: boolean;
  errors?: Record<string, string>;
  className?: string;
  onValidation?: (sectionId: string, isValid: boolean, requiredComplete: boolean) => void;
  compact?: boolean;
}

/**
 * LEGO Block: Section Component
 * Reusable section component that contains multiple questions
 * Features collapsible sections, progress tracking, and time estimates
 * Database-driven with no hardcoded content
 */
export default function SectionLegoBlock({
  section,
  responses,
  onChange,
  readonly = false,
  defaultExpanded = true,
  showProgress = true,
  errors = {},
  className = "",
  onValidation,
  compact = false,
}: SectionLegoBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const { id, title, sectionOrder, estimatedTime, questions } = section;

  // Enhanced section progress calculation that handles compound questions properly
  const calculateProgress = () => {
    if (questions.length === 0) return { completed: 0, total: 0, percentage: 0, required: { completed: 0, total: 0 }, optional: { completed: 0, total: 0 } };

    const requiredQuestions = questions.filter(q => q.isRequired);
    const optionalQuestions = questions.filter(q => !q.isRequired);
    
    // Helper function to check if a question is completed based on its type
    const isQuestionCompleted = (question: any) => {
      const value = responses.get(question.id);
      
      if (value === undefined || value === null) return false;
      
      // Handle compound questions with specific completion logic
      switch (question.questionType) {
        case 'company_profile':
          // Company profile is complete if at least company name and one other field are filled
          if (typeof value === 'object' && value !== null) {
            const profile = value as any;
            const hasCompanyName = profile.companyName && profile.companyName.trim() !== '';
            const hasGWP = profile.gwp && (profile.gwp.amount || profile.gwp.currency);
            const hasTier = profile.companyTier && profile.companyTier !== '';
            const hasMarkets = profile.primaryMarkets && Array.isArray(profile.primaryMarkets) && profile.primaryMarkets.length > 0;
            const hasGeoFocus = profile.geographicFocus && profile.geographicFocus.trim() !== '';
            
            // At least company name plus one other meaningful field
            return hasCompanyName && (hasGWP || hasTier || hasMarkets || hasGeoFocus);
          }
          return false;
          
        case 'business_lines_matrix':
          // Business lines matrix is complete if at least one line has data
          if (typeof value === 'object' && value !== null && value.businessLines) {
            return Array.isArray(value.businessLines) && value.businessLines.length > 0 &&
                   value.businessLines.some((line: any) => line.lineName || line.percentage > 0);
          }
          return false;
          
        case 'percentage_allocation':
          // Percentage allocation is complete if at least one category has a value > 0
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some((val: any) => typeof val === 'number' && val > 0);
          }
          return false;
          
        case 'department_skills_matrix':
          // Department skills matrix is complete if at least one department has data
          if (typeof value === 'object' && value !== null && value.departments) {
            return Array.isArray(value.departments) && value.departments.length > 0 &&
                   value.departments.some((dept: any) => dept.departmentName || dept.employeeCount > 0);
          }
          return false;
          
        case 'smart_rating':
        case 'scale':
          // Rating questions are complete if they have a numeric value
          return typeof value === 'number' && value > 0;
          
        case 'ranking':
          // Ranking is complete if at least one item is ranked
          return Array.isArray(value) && value.length > 0;
          
        case 'currency':
          // Currency input is complete if it has both amount and currency
          if (typeof value === 'object' && value !== null) {
            return (value.amount && value.amount !== '' && value.amount !== '0') || 
                   (value.currency && value.currency !== '');
          }
          return false;
          
        case 'business_performance':
          // Business performance is complete if at least one metric has data
          if (typeof value === 'object' && value !== null) {
            const hasFinancials = value.combinedRatio || value.expenseRatio || value.lossRatio;
            const hasGrowth = value.premiumGrowth || value.policyRetention;
            const hasOperational = value.processingTime || value.claimsSettlement;
            const hasCustomer = value.customerSatisfaction;
            const hasAreas = value.areasForImprovement && value.areasForImprovement.trim() !== '';
            return hasFinancials || hasGrowth || hasOperational || hasCustomer || hasAreas;
          }
          return false;
          
        case 'multi_rating':
          // Multi rating is complete if at least one rating has been provided
          if (typeof value === 'object' && value !== null && value.ratings) {
            const ratings = value.ratings;
            return Object.keys(ratings).length > 0 && 
                   Object.values(ratings).some((rating: any) => typeof rating === 'number' && rating > 0);
          }
          return false;
          
        case 'text':
        case 'textarea':
          // Text questions are complete if they have meaningful content
          return typeof value === 'string' && value.trim() !== '';
          
        case 'select':
        case 'multiselect':
          // Select questions are complete if they have a selection
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== '' && value !== undefined;
          
        case 'boolean':
        case 'checkbox':
          // Boolean questions are complete if they have any value (true or false)
          return typeof value === 'boolean' || value === 'true' || value === 'false';
          
        default:
          // Default completion check for unknown question types
          return value !== '' && (!Array.isArray(value) || value.length > 0);
      }
    };
    
    // Count completed required questions using enhanced logic
    const completedRequired = requiredQuestions.filter(isQuestionCompleted).length;

    // Count completed optional questions using enhanced logic
    const completedOptional = optionalQuestions.filter(isQuestionCompleted).length;

    const totalCompleted = completedRequired + completedOptional;
    const percentage = questions.length > 0 ? (totalCompleted / questions.length) * 100 : 0;

    return {
      completed: totalCompleted,
      total: questions.length,
      required: {
        completed: completedRequired,
        total: requiredQuestions.length
      },
      optional: {
        completed: completedOptional,
        total: optionalQuestions.length
      },
      percentage: Math.round(percentage)
    };
  };

  const progress = calculateProgress();
  const isCompleted = progress.percentage === 100;
  const hasRequiredIncomplete = progress.required.completed < progress.required.total;
  
  // Trigger validation callback when progress changes
  React.useEffect(() => {
    if (onValidation) {
      const isValid = !hasRequiredIncomplete && Object.keys(errors).length === 0;
      const requiredComplete = progress.required.completed === progress.required.total;
      onValidation(id, isValid, requiredComplete);
    }
  }, [progress.required.completed, progress.required.total, Object.keys(errors).length, onValidation, id, hasRequiredIncomplete]);

  // Sort questions by order
  const sortedQuestions = [...questions].sort((a, b) => 
    (a.questionOrder || 0) - (b.questionOrder || 0)
  );

  // Section header with collapsible functionality
  const renderSectionHeader = () => (
    <CardHeader className="pb-4">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start p-0 h-auto hover:bg-transparent"
        disabled={readonly}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start space-x-3">
            <div className="flex items-center space-x-2 mt-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              
              {/* Section number badge */}
              <div className="flex items-center justify-center w-6 h-6 bg-[#005DAA] text-white text-sm font-medium rounded-full">
                {sectionOrder}
              </div>
              
              {/* Completion status */}
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            <div className="text-left">
              <h3 className={cn(
                "font-semibold text-gray-900 mb-1",
                compact ? "text-base" : "text-lg"
              )}>
                {title}
              </h3>
              
              {!compact && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {estimatedTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{estimatedTime} min</span>
                    </div>
                  )}
                  
                  <span>
                    {progress.completed} of {progress.total} questions
                    {progress.required.total > 0 && (
                      <span className={cn(
                        "ml-1",
                        hasRequiredIncomplete ? "text-amber-600" : "text-green-600"
                      )}>
                        ({progress.required.completed}/{progress.required.total} required)
                      </span>
                    )}
                  </span>
                </div>
              )}
              
              {compact && (
                <div className="text-xs text-gray-500">
                  {progress.completed}/{progress.total} complete
                  {hasRequiredIncomplete && (
                    <span className="text-amber-600 ml-1">
                      • {progress.required.total - progress.required.completed} required remaining
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex flex-col items-end space-y-2 mt-1">
            <span className={cn(
              "text-sm font-medium",
              isCompleted ? "text-green-600" : 
              hasRequiredIncomplete ? "text-amber-600" : "text-[#005DAA]"
            )}>
              {progress.percentage}%
            </span>
          </div>
        </div>
      </Button>
      
      {/* Progress bar */}
      {showProgress && isExpanded && (
        <div className="mt-3">
          <Progress 
            value={progress.percentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Progress</span>
            <span>
              {hasRequiredIncomplete ? 
                `${progress.required.total - progress.required.completed} required remaining` :
                'All requirements met'
              }
            </span>
          </div>
        </div>
      )}
    </CardHeader>
  );

  // Section content with questions
  const renderSectionContent = () => {
    if (!isExpanded) return null;

    return (
      <CardContent className="pt-0">
        <div className="space-y-6">
          {sortedQuestions.map((question, index) => (
            <div 
              key={question.id}
              className={cn(
                "relative",
                index < sortedQuestions.length - 1 && "pb-6 border-b border-gray-100"
              )}
            >
              {/* Question number indicator */}
              <div className="absolute -left-2 top-0">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {index + 1}
                </div>
              </div>
              
              {/* Question content */}
              <div className="ml-6">
                {/* Use QuestionRegistryLegoBlock for advanced question types */}
                {['company_profile', 'currency', 'percentage_allocation', 'business_lines_matrix', 'department_skills_matrix', 'smart_rating', 'ranking', 'business_performance', 'multi_rating'].includes(question.questionType) ? (
                  <QuestionRegistryLegoBlock
                    questions={[{
                      id: question.id,
                      sectionId: 0, // Not used in rendering
                      questionOrder: question.questionOrder || 0,
                      questionType: question.questionType as any,
                      questionText: question.questionText,
                      isRequired: question.isRequired,
                      helpText: question.helpText,
                      questionData: (question as any).questionData || {}
                    }]}
                    responses={new Map([[question.id, responses.get(question.id)]])}
                    onResponseChange={(questionId: string, value: any) => onChange(questionId, value)}
                    disabled={readonly}
                    showDebug={false}
                  />
                ) : (
                  /* Use standard QuestionLegoBlock for basic question types */
                  <QuestionLegoBlock
                    question={question}
                    value={responses.get(question.id)}
                    onChange={(value) => onChange(question.id, value)}
                    error={errors[question.id]}
                    readonly={readonly}
                  />
                )}
              </div>
            </div>
          ))}
          
          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No questions available in this section</p>
            </div>
          )}
        </div>
      </CardContent>
    );
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isCompleted ? "border-green-200 bg-green-50/30" :
        hasRequiredIncomplete ? "border-amber-200 bg-amber-50/30" :
        "border-[#005DAA]/20",
        isExpanded && "shadow-md",
        className
      )}
    >
      {renderSectionHeader()}
      {renderSectionContent()}
    </Card>
  );
}