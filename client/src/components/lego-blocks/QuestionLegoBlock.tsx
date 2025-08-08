import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  questionType: 'score' | 'multi_choice' | 'checkbox' | 'text' | 'textarea' | 'number';
  isRequired: boolean;
  helpText?: string;
  options?: QuestionOption[];
  // Score-specific properties
  minValue?: number;
  maxValue?: number;
  leftLabel?: string;
  rightLabel?: string;
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
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );

  // Score slider component (1-5 scale)
  const renderScoreField = () => {
    const numericValue = typeof value === 'number' ? value : minValue;
    
    return (
      <div>
        {renderQuestionLabel()}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{leftLabel}</span>
          <span className="font-semibold text-[#005DAA] bg-[#E6F2FF] px-2 py-1 rounded">
            {numericValue}
          </span>
          <span className="text-sm text-gray-600">{rightLabel}</span>
        </div>
        <Slider
          value={[numericValue]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={minValue}
          max={maxValue}
          step={1}
          disabled={readonly}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      </div>
    );
  };

  // Multiple choice radio buttons
  const renderMultiChoiceField = () => (
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

  // Text input field
  const renderTextField = () => (
    <div>
      {renderQuestionLabel()}
      <Input
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your answer..."
        disabled={readonly}
        className={cn(
          "w-full",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );

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
        return renderScoreField();
      case 'multi_choice':
        return renderMultiChoiceField();
      case 'checkbox':
        return renderCheckboxField();
      case 'text':
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