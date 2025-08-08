import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ScoreSliderLegoBlock } from './ScoreSliderLegoBlock';
import { InfoTooltipLegoBlock } from './InfoTooltipLegoBlock';

export interface QuestionOption {
  id: string;
  optionText: string;
  optionValue: string;
  scoreValue?: number;
  optionOrder: number;
}

export interface QuestionData {
  id: string;
  questionText: string;
  questionType: 'score' | 'scale' | 'multi_choice' | 'select' | 'checkbox' | 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date';
  isRequired: boolean;
  questionOrder?: number;
  helpText?: string;
  options?: QuestionOption[];
  // Score-specific properties
  minValue?: number;
  maxValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  // Validation properties
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
}

export interface QuestionLegoBlockProps {
  question: QuestionData;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readonly?: boolean;
  className?: string;
}

/**
 * LEGO Block: Question Component
 * Reusable question component supporting multiple input types
 * Follows RSA styling with consistent patterns across the application
 */
export default function QuestionLegoBlock({
  question,
  value,
  onChange,
  error,
  readonly = false,
  className = "",
}: QuestionLegoBlockProps) {

  const {
    id,
    questionText,
    questionType,
    isRequired,
    helpText,
    options = [],
    minValue = 1,
    maxValue = 5,
    leftLabel = "Low",
    rightLabel = "High"
  } = question;

  // Helper function to render question label with required indicator and help tooltip
  const renderQuestionLabel = () => (
    <div className="flex items-center justify-between mb-3">
      <Label className="text-sm font-medium text-gray-700 flex items-center">
        {questionText}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {helpText && (
        <InfoTooltipLegoBlock
          content={helpText}
          icon="info"
          iconSize="sm"
        />
      )}
    </div>
  );

  // Score slider component (1-5 scale)
  const renderScoreField = () => {
    const numericValue = typeof value === 'number' ? value : minValue;
    
    return (
      <div>
        {renderQuestionLabel()}
        <ScoreSliderLegoBlock
          label=""
          field=""
          value={numericValue}
          onChange={(_, newValue) => onChange(newValue)}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          minValue={minValue}
          maxValue={maxValue}
          disabled={readonly}
          showTooltip={false}
          valueDisplay="badge"
        />
      </div>
    );
  };

  // Multiple choice radio buttons and select dropdown
  const renderMultiChoiceField = () => {
    if (questionType === 'select' && options.length > 4) {
      // Use dropdown for select questions with many options
      return (
        <div>
          {renderQuestionLabel()}
          <select
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readonly}
            className={cn(
              "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005DAA] focus:border-transparent",
              error && "border-red-500 focus:ring-red-500",
              readonly && "bg-gray-50 cursor-not-allowed"
            )}
          >
            <option value="">Select an option...</option>
            {options
              .sort((a, b) => a.optionOrder - b.optionOrder)
              .map((option) => (
                <option key={option.id} value={option.optionValue}>
                  {option.optionText}
                  {option.scoreValue ? ` (Score: ${option.scoreValue})` : ''}
                </option>
              ))}
          </select>
        </div>
      );
    }

    // Use radio buttons for multi_choice or select with few options
    return (
      <div>
        {renderQuestionLabel()}
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          disabled={readonly}
          className="space-y-2"
        >
          {options
            .sort((a, b) => a.optionOrder - b.optionOrder)
            .map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.optionValue} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="text-sm font-normal text-gray-700 cursor-pointer flex-1"
                >
                  {option.optionText}
                  {option.scoreValue && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Score: {option.scoreValue})
                    </span>
                  )}
                </Label>
              </div>
            ))}
        </RadioGroup>
      </div>
    );
  };

  // Checkbox (single or multiple)
  const renderCheckboxField = () => {
    const isArray = Array.isArray(value);
    
    if (options.length === 0) {
      // Single checkbox (boolean)
      return (
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={readonly}
            />
            <Label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer">
              {questionText}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {helpText && (
              <InfoTooltipLegoBlock
                content={helpText}
                icon="info"
                iconSize="sm"
              />
            )}
          </div>
        </div>
      );
    }

    // Multiple checkboxes
    return (
      <div>
        {renderQuestionLabel()}
        <div className="space-y-2">
          {options
            .sort((a, b) => a.optionOrder - b.optionOrder)
            .map((option) => {
              const isChecked = isArray 
                ? value.includes(option.optionValue)
                : value === option.optionValue;
                
              return (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (isArray) {
                        const newValue = checked
                          ? [...(value || []), option.optionValue]
                          : (value || []).filter((v: string) => v !== option.optionValue);
                        onChange(newValue);
                      } else {
                        onChange(checked ? option.optionValue : '');
                      }
                    }}
                    disabled={readonly}
                  />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal text-gray-700 cursor-pointer flex-1"
                  >
                    {option.optionText}
                    {option.scoreValue && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Score: {option.scoreValue})
                      </span>
                    )}
                  </Label>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Text input field (with support for email, url, date types)
  const renderTextField = () => {
    const getInputType = () => {
      switch (questionType) {
        case 'email':
          return 'email';
        case 'url':
          return 'url';
        case 'date':
          return 'date';
        default:
          return 'text';
      }
    };

    const getPlaceholder = () => {
      if (question.placeholder) return question.placeholder;
      switch (questionType) {
        case 'email':
          return 'Enter your email address...';
        case 'url':
          return 'Enter a URL...';
        case 'date':
          return 'Select a date...';
        default:
          return 'Enter your answer...';
      }
    };

    return (
      <div>
        {renderQuestionLabel()}
        <Input
          id={id}
          type={getInputType()}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={readonly}
          minLength={question.minLength}
          maxLength={question.maxLength}
          pattern={question.pattern}
          className={cn(
            "w-full",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {question.maxLength && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {(value || '').length} / {question.maxLength} characters
          </div>
        )}
      </div>
    );
  };

  // Textarea field for longer responses
  const renderTextareaField = () => (
    <div>
      {renderQuestionLabel()}
      <Textarea
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your detailed answer..."
        disabled={readonly}
        rows={4}
        className={cn(
          "w-full resize-vertical",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );

  // Number input field
  const renderNumberField = () => (
    <div>
      {renderQuestionLabel()}
      <Input
        id={id}
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        placeholder="Enter a number..."
        disabled={readonly}
        className={cn(
          "w-full",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );

  // Main render function
  const renderQuestion = () => {
    switch (questionType) {
      case 'score':
      case 'scale':
        return renderScoreField();
      case 'multi_choice':
      case 'select':
        return renderMultiChoiceField();
      case 'checkbox':
        return renderCheckboxField();
      case 'text':
      case 'email':
      case 'url':
      case 'date':
        return renderTextField();
      case 'textarea':
        return renderTextareaField();
      case 'number':
        return renderNumberField();
      default:
        return (
          <div className="text-red-500 text-sm">
            Unsupported question type: {questionType}
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {renderQuestion()}
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center">
          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
          {error}
        </p>
      )}
      
      {/* Readonly indicator */}
      {readonly && (
        <p className="text-xs text-gray-400 italic">Read-only</p>
      )}
    </div>
  );
}