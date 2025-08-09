import React, { useMemo, useCallback } from 'react';
import { AlertCircle, Star, HelpCircle, Plus, Trash2, Edit3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import existing LEGO blocks for question types
import { ScoreSliderLegoBlock } from './ScoreSliderLegoBlock';
import { SmartRatingLegoBlock } from './SmartRatingLegoBlock';
import { RankingLegoBlock } from './RankingLegoBlock';
import { CurrencyInputLegoBlock } from './CurrencyInputLegoBlock';
import { PercentageAllocationLegoBlock } from './PercentageAllocationLegoBlock';
import BusinessLinesMatrixLegoBlock from './BusinessLinesMatrixLegoBlock';
import DepartmentSkillsMatrixLegoBlock from './DepartmentSkillsMatrixLegoBlock';
import CompanyProfileLegoBlock from './CompanyProfileLegoBlock';
import CompetitiveAwarenessLegoBlock from './CompetitiveAwarenessLegoBlock';
import RiskAppetiteLegoBlock from './RiskAppetiteLegoBlock';
import BusinessPerformanceLegoBlock from './BusinessPerformanceLegoBlock';
import MultiRatingLegoBlock from './MultiRatingLegoBlock';
import QuestionLegoBlock, { QuestionData, QuestionOption } from './QuestionLegoBlock';
import ReusableButton from './ReusableButton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Extended question types for dynamic registry
export type QuestionType = 
  | 'scale' 
  | 'multiChoice' 
  | 'ranking' 
  | 'allocation' 
  | 'text' 
  | 'boolean' 
  | 'matrix' 
  | 'compound'
  | 'score'
  | 'smart_rating'
  | 'ranking'
  | 'checkbox'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'currency'
  | 'percentage_allocation'
  | 'business_lines_matrix'
  | 'department_skills_matrix'
  | 'company_profile'
  | 'business_performance'
  | 'multi_rating'
  | 'composite'
  | 'risk_appetite';

export interface QuestionMetadata {
  id: string;
  sectionId: number;
  questionOrder: number;
  questionType: QuestionType;
  questionText: string;
  isRequired: boolean;
  isStarred?: boolean;
  helpText?: string;
  dependsOn?: string[]; // Question IDs this depends on
  conditionalLogic?: ConditionalRule[];
  questionData: Record<string, any>; // JSON data specific to question type
  createdAt?: string;
  updatedAt?: string;
}

export interface ConditionalRule {
  dependentQuestionId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface QuestionRegistryLegoBlockProps {
  questions: QuestionMetadata[];
  responses: Map<string, any>;
  onResponseChange: (questionId: string, value: any) => void;
  onQuestionChange?: (action: 'add' | 'edit' | 'delete', question: QuestionMetadata) => void;
  editMode?: boolean;
  showDebug?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * QuestionRegistryLegoBlock - Dynamic question management system
 */
export default function QuestionRegistryLegoBlock({
  questions,
  responses,
  onResponseChange,
  onQuestionChange,
  editMode = false,
  showDebug = false,
  className = '',
  disabled = false
}: QuestionRegistryLegoBlockProps) {

  // Question type component registry
  const componentRegistry = useMemo(() => {
    return {
      scale: 'ScoreSliderLegoBlock',
      score: 'ScoreSliderLegoBlock',
      smart_rating: 'SmartRatingLegoBlock',
      ranking: 'RankingLegoBlock',
      currency: 'CurrencyInputLegoBlock',
      percentage_allocation: 'PercentageAllocationLegoBlock',
      allocation: 'PercentageAllocationLegoBlock',
      business_lines_matrix: 'BusinessLinesMatrixLegoBlock',
      department_skills_matrix: 'DepartmentSkillsMatrixLegoBlock',
      company_profile: 'CompanyProfileLegoBlock',
      business_performance: 'BusinessPerformanceLegoBlock',
      multi_rating: 'MultiRatingLegoBlock',
      composite: 'CompetitiveAwarenessLegoBlock',
      risk_appetite: 'RiskAppetiteLegoBlock',
      multiChoice: 'QuestionLegoBlock',
      text: 'QuestionLegoBlock',
      boolean: 'QuestionLegoBlock',
      matrix: 'QuestionLegoBlock',
      compound: 'QuestionLegoBlock',
      checkbox: 'QuestionLegoBlock',
      textarea: 'QuestionLegoBlock',
      number: 'QuestionLegoBlock',
      email: 'QuestionLegoBlock',
      url: 'QuestionLegoBlock',
      date: 'QuestionLegoBlock'
    } as const;
  }, []);

  // Evaluate conditional logic for a question
  const evaluateConditionalLogic = useCallback((question: QuestionMetadata) => {
    let isVisible = true;
    let isRequired = question.isRequired;
    let isDisabled = disabled;

    if (!question.conditionalLogic || question.conditionalLogic.length === 0) {
      return { isVisible, isRequired, isDisabled };
    }

    for (const rule of question.conditionalLogic) {
      const dependentValue = responses.get(rule.dependentQuestionId);
      let conditionMet = false;

      switch (rule.operator) {
        case 'equals':
          conditionMet = dependentValue === rule.value;
          break;
        case 'not_equals':
          conditionMet = dependentValue !== rule.value;
          break;
        case 'greater_than':
          conditionMet = Number(dependentValue) > Number(rule.value);
          break;
        case 'less_than':
          conditionMet = Number(dependentValue) < Number(rule.value);
          break;
        case 'contains':
          conditionMet = String(dependentValue).includes(String(rule.value));
          break;
        case 'in':
          conditionMet = Array.isArray(rule.value) && rule.value.includes(dependentValue);
          break;
      }

      if (conditionMet) {
        switch (rule.action) {
          case 'show':
            isVisible = true;
            break;
          case 'hide':
            isVisible = false;
            break;
          case 'require':
            isRequired = true;
            break;
          case 'disable':
            isDisabled = true;
            break;
        }
      }
    }

    return { isVisible, isRequired, isDisabled };
  }, [responses, disabled]);

  // Convert QuestionMetadata to QuestionData for existing components
  const convertToQuestionData = useCallback((questionMeta: QuestionMetadata): QuestionData => {
    // Map dynamic question types to standard QuestionData types
    const questionTypeMapping: Record<string, QuestionData['questionType']> = {
      'scale': 'scale',
      'multiChoice': 'multi_choice',
      'text': 'text',
      'boolean': 'checkbox',
      'checkbox': 'checkbox',
      'textarea': 'textarea',
      'number': 'number',
      'email': 'email',
      'url': 'url',
      'date': 'date',
      'smart_rating': 'smart_rating',
      'ranking': 'ranking',
      'currency': 'text', // Fallback to text for QuestionLegoBlock compatibility
      'percentage_allocation': 'text' // Fallback to text for QuestionLegoBlock compatibility
    };

    return {
      id: questionMeta.id,
      questionText: questionMeta.questionText,
      questionType: questionTypeMapping[questionMeta.questionType] || 'text',
      isRequired: questionMeta.isRequired,
      questionOrder: questionMeta.questionOrder,
      helpText: questionMeta.helpText,
      ...questionMeta.questionData
    };
  }, []);

  // Render individual question based on type
  const renderQuestion = useCallback((questionMeta: QuestionMetadata) => {
    const logic = evaluateConditionalLogic(questionMeta);
    
    if (!logic.isVisible) return null;

    const questionData = convertToQuestionData(questionMeta);
    const currentValue = responses.get(questionMeta.id);

    // Render question component function
    const renderQuestionComponent = () => {
      // Render RankingLegoBlock for ranking type
      if (questionMeta.questionType === 'ranking') {
        const rawItems = questionMeta.questionData.items || [];
        // Convert string items to RankingItem objects if needed
        const rankingItems = rawItems.map((item: any, index: number) => {
          if (typeof item === 'string') {
            return {
              id: item.toLowerCase().replace(/[^a-z0-9]/g, '_'),
              label: item,
              description: `${item} objective`,
              category: 'strategic'
            };
          }
          return item;
        });
        
        return (
          <RankingLegoBlock
            question={{
              id: questionMeta.id,
              questionText: questionMeta.questionText,
              helpText: questionMeta.helpText,
              isRequired: logic.isRequired
            }}
            items={rankingItems}
            value={currentValue || null}
            onChange={(value: string[]) => onResponseChange(questionMeta.id, value)}
            maxRank={questionMeta.questionData.maxRank}
            disabled={logic.isDisabled}
            showNumbers={questionMeta.questionData.showNumbers !== false}
            allowPartial={questionMeta.questionData.allowPartial || false}
            additionalContext={currentValue?.additionalContext || ''}
            onAdditionalContextChange={(value: string) => {
              const updatedValue = { 
                ...currentValue, 
                additionalContext: value 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            additionalContextLabel={questionMeta.questionData.additionalContextLabel || 'Additional Context'}
          />
        );
      }

      // Render SmartRatingLegoBlock for smart_rating type
      if (questionMeta.questionType === 'smart_rating') {
        return (
          <SmartRatingLegoBlock
            question={{
              id: questionMeta.id,
              questionText: questionMeta.questionText,
              helpText: questionMeta.helpText,
              isRequired: logic.isRequired
            }}
            value={currentValue || null}
            onChange={(value: number) => onResponseChange(questionMeta.id, value)}
            variant={questionMeta.questionData.variant || 'descriptive'}
            size={questionMeta.questionData.size || 'md'}
            showScore={questionMeta.questionData.showScore !== false}
            disabled={logic.isDisabled}
            minValue={questionMeta.questionData.minValue || 1}
            maxValue={questionMeta.questionData.maxValue || 5}
            additionalContext={currentValue?.additionalContext || ''}
            onAdditionalContextChange={(value: string) => {
              const updatedValue = { 
                ...currentValue, 
                additionalContext: value 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            additionalContextLabel={questionMeta.questionData.additionalContextLabel || 'Additional Context'}
          />
        );
      }

      // Render ScoreSliderLegoBlock for scale/score types
      if (questionMeta.questionType === 'scale' || questionMeta.questionType === 'score') {
        return (
          <ScoreSliderLegoBlock
            label={questionMeta.questionText}
            field={questionMeta.id}
            value={currentValue || questionMeta.questionData.minValue || 1}
            onChange={(field: string, value: number) => onResponseChange(questionMeta.id, value)}
            minValue={questionMeta.questionData.minValue || 1}
            maxValue={questionMeta.questionData.maxValue || 5}
            leftLabel={questionMeta.questionData.leftLabel || 'Low'}
            rightLabel={questionMeta.questionData.rightLabel || 'High'}
            disabled={logic.isDisabled}
            tooltip={questionMeta.helpText}
          />
        );
      }

      // Render CurrencyInputLegoBlock for currency type
      if (questionMeta.questionType === 'currency') {
        return (
          <CurrencyInputLegoBlock
            label={questionMeta.questionText}
            value={currentValue?.value || null}
            onChange={(value: number | null) => onResponseChange(questionMeta.id, {
              value,
              currency: currentValue?.currency || questionMeta.questionData.defaultCurrency || 'GBP'
            })}
            currency={currentValue?.currency || questionMeta.questionData.defaultCurrency || 'GBP'}
            onCurrencyChange={(currency: string) => onResponseChange(questionMeta.id, {
              ...currentValue,
              currency
            })}
            disabled={logic.isDisabled}
            placeholder={questionMeta.questionData.placeholder}
            min={questionMeta.questionData.min}
            max={questionMeta.questionData.max}
            showCurrencySelector={questionMeta.questionData.showCurrencySelector !== false}
            helpText={questionMeta.helpText}
            required={logic.isRequired}
          />
        );
      }

      // Render PercentageAllocationLegoBlock for percentage_allocation or allocation type
      if (questionMeta.questionType === 'percentage_allocation' || questionMeta.questionType === 'allocation') {
        const categoryNames = questionMeta.questionData.categories || [];
        const categories = categoryNames.map((name: string, index: number) => ({
          id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          label: name,
          description: `${name} distribution percentage`,
          color: `hsl(${(index * 60) % 360}, 60%, 50%)`
        }));
        
        return (
          <PercentageAllocationLegoBlock
            label={questionMeta.questionText}
            categories={categories}
            values={currentValue?.allocations || {}}
            onChange={(values: Record<string, number>) => {
              const updatedValue = { 
                ...currentValue, 
                allocations: values 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            additionalFields={questionMeta.questionData.additionalFields || []}
            additionalValues={currentValue?.additionalFields || {}}
            onAdditionalChange={(fieldId: string, value: any) => {
              const updatedValue = { 
                ...currentValue, 
                additionalFields: { 
                  ...currentValue?.additionalFields, 
                  [fieldId]: value 
                } 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            disabled={logic.isDisabled}
            allowPartial={questionMeta.questionData.allowPartial || false}
            helpText={questionMeta.helpText}
            required={logic.isRequired}
            showRemaining={questionMeta.questionData.showRemaining !== false}
            precision={questionMeta.questionData.precision || 1}
            additionalContext={currentValue?.additionalContext || ''}
            onAdditionalContextChange={(value: string) => {
              const updatedValue = { 
                ...currentValue, 
                additionalContext: value 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            additionalContextLabel={questionMeta.questionData.additionalContextLabel || 'Additional Context'}
          />
        );
      }

      // Render BusinessLinesMatrixLegoBlock for business_lines_matrix type
      if (questionMeta.questionType === 'business_lines_matrix') {
        return (
          <BusinessLinesMatrixLegoBlock
            businessLines={currentValue?.businessLines || []}
            onChange={(businessLines) => onResponseChange(questionMeta.id, { businessLines })}
            disabled={logic.isDisabled}
            label={questionMeta.questionText}
            helpText={questionMeta.helpText}
            required={logic.isRequired}
            enforceTotal={questionMeta.questionData.enforceTotal !== false}
            minLines={questionMeta.questionData.minLines || 1}
            maxLines={questionMeta.questionData.maxLines || 10}
            additionalContext={currentValue?.additionalContext || ''}
            onAdditionalContextChange={(value: string) => {
              const updatedValue = { 
                ...currentValue, 
                additionalContext: value 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            additionalContextLabel={questionMeta.questionData.additionalContextLabel || 'Additional Context'}
          />
        );
      }

      // Render DepartmentSkillsMatrixLegoBlock for department_skills_matrix type
      if (questionMeta.questionType === 'department_skills_matrix') {
        return (
          <DepartmentSkillsMatrixLegoBlock
            departments={currentValue?.departments || []}
            onChange={(departments) => onResponseChange(questionMeta.id, { departments })}
            disabled={logic.isDisabled}
            label={questionMeta.questionText}
            helpText={questionMeta.helpText}
            required={logic.isRequired}
            showTotals={questionMeta.questionData.showTotals !== false}
            minDepartments={questionMeta.questionData.minDepartments || 1}
            maxDepartments={questionMeta.questionData.maxDepartments || 15}
            additionalContext={currentValue?.additionalContext || ''}
            onAdditionalContextChange={(value: string) => {
              const updatedValue = { 
                ...currentValue, 
                additionalContext: value 
              };
              onResponseChange(questionMeta.id, updatedValue);
            }}
            additionalContextLabel={questionMeta.questionData.additionalContextLabel || 'Additional Context'}
          />
        );
      }

      // Render CompanyProfileLegoBlock for company_profile type
      if (questionMeta.questionType === 'company_profile') {
        return (
          <CompanyProfileLegoBlock
            questionData={questionMeta.questionData}
            value={currentValue || {}}
            onChange={(value) => onResponseChange(questionMeta.id, value)}
            disabled={logic.isDisabled}
          />
        );
      }

      // Render BusinessPerformanceLegoBlock for business_performance type
      if (questionMeta.questionType === 'business_performance') {
        return (
          <BusinessPerformanceLegoBlock
            question={{
              id: questionMeta.id,
              questionText: questionMeta.questionText,
              helpText: questionMeta.helpText,
              isRequired: logic.isRequired
            }}
            questionData={questionMeta.questionData}
            value={currentValue || {}}
            onChange={(value) => onResponseChange(questionMeta.id, value)}
            disabled={logic.isDisabled}
          />
        );
      }

      // Render MultiRatingLegoBlock for multi_rating type
      if (questionMeta.questionType === 'multi_rating') {
        return (
          <MultiRatingLegoBlock
            label={questionMeta.questionText}
            items={questionMeta.questionData.items || []}
            value={currentValue || { ratings: {}, additionalContext: '' }}
            onChange={(value) => onResponseChange(questionMeta.id, value)}
            minRating={questionMeta.questionData.minRating || 1}
            maxRating={questionMeta.questionData.maxRating || 5}
            scaleLabels={questionMeta.questionData.scaleLabels || ['Poor', 'Excellent']}
            helpText={questionMeta.helpText}
            required={logic.isRequired}
            disabled={logic.isDisabled}
            allowContext={questionMeta.questionData.allowContext !== false}
            contextPrompt={questionMeta.questionData.contextPrompt || 'Additional context:'}
          />
        );
      }

      // Render CompetitiveAwarenessLegoBlock for composite type  
      if (questionMeta.questionType === 'composite') {
        return (
          <CompetitiveAwarenessLegoBlock
            label={questionMeta.questionText}
            helpText={questionMeta.helpText}
            value={currentValue || {}}
            onChange={(value: any) => onResponseChange(questionMeta.id, value)}
            disabled={logic.isDisabled}
            required={logic.isRequired}
          />
        );
      }

      // Render RiskAppetiteLegoBlock for risk_appetite type  
      if (questionMeta.questionType === 'risk_appetite') {
        return (
          <RiskAppetiteLegoBlock
            label={questionMeta.questionText}
            helpText={questionMeta.helpText}
            value={currentValue || {}}
            onChange={(value: any) => onResponseChange(questionMeta.id, value)}
            disabled={logic.isDisabled}
            required={logic.isRequired}
          />
        );
      }

      // For all other question types, use QuestionLegoBlock
      return (
        <QuestionLegoBlock
          question={{ ...questionData, isRequired: logic.isRequired }}
          value={currentValue}
          onChange={(value: any) => onResponseChange(questionMeta.id, value)}
          readonly={logic.isDisabled}
        />
      );
    };

    return (
      <div key={questionMeta.id} className="relative">
        {/* Question Header with Metadata - removed duplicate numbering */}
        {showDebug && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {questionMeta.questionOrder}
              </Badge>
              {questionMeta.isStarred && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            {logic.isRequired && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
            {questionMeta.dependsOn && questionMeta.dependsOn.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs">
                      Conditional
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Depends on: {questionMeta.dependsOn.join(', ')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Edit Mode Controls */}
          {editMode && onQuestionChange && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuestionChange('edit', questionMeta)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuestionChange('delete', questionMeta)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        )}

        {/* Question Component */}
        {renderQuestionComponent()}

        {/* Additional Context & Notes Section - Only show for non-advanced question types */}
        {questionMeta.questionData?.allowNotes && 
         !['business_performance', 'multi_rating', 'smart_rating', 'ranking', 'percentage_allocation', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'composite', 'risk_appetite'].includes(questionMeta.questionType) && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Context & Notes
            </Label>
            <Textarea
              value={currentValue?.notes || ''}
              onChange={(e) => {
                const newValue = typeof currentValue === 'object' && currentValue !== null
                  ? { ...currentValue, notes: e.target.value }
                  : { notes: e.target.value };
                onResponseChange(questionMeta.id, newValue);
              }}
              placeholder={
                questionMeta.questionData?.notesPrompt || 
                "Additional context about RSA's market position, strategy, or business profile..."
              }
              className="min-h-[80px] bg-gray-50 border-gray-200 placeholder:text-gray-500"
              disabled={logic.isDisabled}
            />
          </div>
        )}

        {/* Debug Information */}
        {showDebug && (
          <Card className="mt-2 bg-gray-50 border-gray-200">
            <CardContent className="p-2 text-xs text-gray-600">
              <div>Type: {questionMeta.questionType}</div>
              <div>Visible: {logic.isVisible ? 'Yes' : 'No'}</div>
              <div>Required: {logic.isRequired ? 'Yes' : 'No'}</div>
              <div>Disabled: {logic.isDisabled ? 'Yes' : 'No'}</div>
              <div>Value: {JSON.stringify(currentValue)}</div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }, [
    evaluateConditionalLogic,
    convertToQuestionData,
    responses,
    onResponseChange,
    editMode,
    onQuestionChange,
    showDebug
  ]);

  // Sort questions by order
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.questionOrder - b.questionOrder);
  }, [questions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => responses.has(q.id)).length;
    const requiredQuestions = questions.filter(q => evaluateConditionalLogic(q).isRequired).length;
    const requiredAnswered = questions.filter(q => 
      evaluateConditionalLogic(q).isRequired && responses.has(q.id)
    ).length;
    const conditionalQuestions = questions.filter(q => 
      q.conditionalLogic && q.conditionalLogic.length > 0
    ).length;

    return {
      totalQuestions,
      answeredQuestions,
      requiredQuestions,
      requiredAnswered,
      conditionalQuestions,
      completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
      requiredCompletionRate: requiredQuestions > 0 ? 
        Math.round((requiredAnswered / requiredQuestions) * 100) : 100
    };
  }, [questions, responses, evaluateConditionalLogic]);

  if (questions.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Questions Available</h3>
            <p className="text-sm">
              {editMode ? 'Add questions to get started' : 'Questions will appear here when available'}
            </p>
            {editMode && onQuestionChange && (
              <ReusableButton
                rsaStyle="primary"
                onClick={() => onQuestionChange('add', {} as QuestionMetadata)}
                icon={Plus}
                className="mt-4"
              >
                Add First Question
              </ReusableButton>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Add Question Button (Edit Mode) */}
      {editMode && onQuestionChange && (
        <div className="flex justify-end">
          <ReusableButton
            rsaStyle="secondary"
            onClick={() => onQuestionChange('add', {} as QuestionMetadata)}
            icon={Plus}
            size="sm"
          >
            Add Question
          </ReusableButton>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {sortedQuestions.map(renderQuestion)}
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <Card className="bg-gray-50 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Registry Stats:</strong>
                <ul className="mt-2 space-y-1">
                  <li>Total Questions: {stats.totalQuestions}</li>
                  <li>Answered: {stats.answeredQuestions}</li>
                  <li>Required: {stats.requiredQuestions}</li>
                  <li>Conditional: {stats.conditionalQuestions}</li>
                </ul>
              </div>
              <div>
                <strong>Supported Types:</strong>
                <ul className="mt-2 space-y-1">
                  {Object.keys(componentRegistry).map(type => (
                    <li key={type} className="text-xs">
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}