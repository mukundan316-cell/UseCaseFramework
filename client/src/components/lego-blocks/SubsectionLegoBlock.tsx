import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import QuestionLegoBlock, { QuestionData } from './QuestionLegoBlock';
import QuestionRegistryLegoBlock from './QuestionRegistryLegoBlock';

export interface SubsectionData {
  id: string;
  title: string;
  subsectionNumber: string;
  subsectionOrder: number;
  estimatedTime?: number;
  description?: string;
  isCollapsible: boolean;
  defaultExpanded: boolean;
  questions: QuestionData[];
}

export interface SubsectionLegoBlockProps {
  subsection: SubsectionData;
  responses: Map<string, any>;
  onChange: (questionId: string, value: any) => void;
  readonly?: boolean;
  errors?: Record<string, string>;
  className?: string;
  compact?: boolean;
}

/**
 * LEGO Block: Subsection Component
 * Renders collapsible subsections exactly like in the RSA Assessment UI
 * Preserves the look and feel from the screenshot while using proper subsection data
 */
export default function SubsectionLegoBlock({
  subsection,
  responses,
  onChange,
  readonly = false,
  errors = {},
  className = "",
  compact = false,
}: SubsectionLegoBlockProps) {
  const [isExpanded, setIsExpanded] = useState(subsection.defaultExpanded);

  const { id, title, subsectionNumber, questions, estimatedTime, description, isCollapsible } = subsection;

  // Sort questions by order
  const sortedQuestions = [...questions].sort((a, b) => 
    (a.questionOrder || 0) - (b.questionOrder || 0)
  );

  // Calculate subsection progress
  const completedQuestions = sortedQuestions.filter(q => {
    const value = responses.get(q.id);
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Render subsection header with exact styling from screenshot
  const renderSubsectionHeader = () => (
    <div className="border border-gray-200 rounded-lg bg-white mb-4">
      <Button
        variant="ghost"
        onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
        className="w-full justify-start p-5 h-auto hover:bg-gray-50 disabled:opacity-100 disabled:pointer-events-none"
        disabled={readonly || !isCollapsible}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            {/* Subsection number badge - exact styling from screenshot */}
            <div className="flex items-center justify-center w-8 h-8 bg-[#005DAA] text-white text-sm font-medium rounded">
              {subsectionNumber}
            </div>
            
            <div className="text-left">
              <h4 className="text-base font-semibold text-gray-900">
                {title}
              </h4>
              {!compact && estimatedTime && (
                <div className="text-sm text-gray-600">
                  {questions.length} questions
                </div>
              )}
            </div>
          </div>
          
          {/* Collapse/expand icon - only show if collapsible */}
          {isCollapsible && (
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </Button>
      
      {/* Subsection content - questions */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          {sortedQuestions.map((question, index) => {
            // Determine which component to use based on question type
            const isAdvancedQuestion = [
              'smart_rating', 'ranking', 'currency', 'percentage_allocation', 
              'percentage_target', 'business_lines_matrix', 'department_skills_matrix',
              'company_profile', 'business_performance', 'multi_rating', 'composite', 'risk_appetite',
              'dynamic_use_case_selector'
            ].includes(question.questionType);

            if (isAdvancedQuestion) {
              return (
                <QuestionRegistryLegoBlock
                  key={question.id}
                  questions={[{
                    id: question.id,
                    sectionId: 0,
                    questionOrder: question.questionOrder || 0,
                    questionType: question.questionType as any,
                    questionText: question.questionText,
                    isRequired: question.isRequired,
                    helpText: question.helpText,
                    questionData: question.questionData || {}
                  }]}
                  responses={new Map([[question.id, responses.get(question.id)]])}
                  onResponseChange={(questionId: string, value: any) => onChange(questionId, value)}
                  disabled={readonly}
                  showDebug={false}
                />
              );
            }

            return (
              <QuestionLegoBlock
                key={question.id}
                question={question}
                value={responses.get(question.id)}
                onChange={(value) => onChange(question.id, value)}
                error={errors[question.id]}
                readonly={readonly}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {renderSubsectionHeader()}
    </div>
  );
}