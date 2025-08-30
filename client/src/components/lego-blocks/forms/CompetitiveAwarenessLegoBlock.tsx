import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Target, TrendingUp } from 'lucide-react';

// Interface for competitive awareness response
export interface CompetitiveAwarenessResponse {
  awarenessLevel?: string;
  competitorInitiatives?: string;
  competitiveAdvantages?: string;
  additionalContext?: string;
}

// Props interface
export interface CompetitiveAwarenessLegoBlockProps {
  /** Current response value */
  value?: CompetitiveAwarenessResponse;
  /** Change handler */
  onChange?: (value: CompetitiveAwarenessResponse) => void;
  /** Question label/text */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

// Awareness level options
const AWARENESS_OPTIONS = [
  {
    value: 'extensive',
    label: 'Extensive awareness',
    description: 'Detailed knowledge of competitor AI initiatives and strategies',
    score: 5
  },
  {
    value: 'some',
    label: 'Some awareness', 
    description: 'General understanding of competitor activities',
    score: 3
  },
  {
    value: 'limited',
    label: 'Limited awareness',
    description: 'Minimal knowledge of competitor AI initiatives',
    score: 1
  }
];

/**
 * CompetitiveAwarenessLegoBlock - Complex question for competitive AI awareness
 * 
 * Features:
 * - Radio button selection for awareness level
 * - Text areas for competitor initiatives and competitive advantages
 * - Additional context section
 * - Comprehensive validation and error handling
 */
export const CompetitiveAwarenessLegoBlock: React.FC<CompetitiveAwarenessLegoBlockProps> = ({
  value = {},
  onChange,
  label,
  helpText,
  required = false,
  disabled = false,
  error,
  className
}) => {
  const [localValue, setLocalValue] = useState<CompetitiveAwarenessResponse>(value);

  // Handle changes to any field
  const handleChange = useCallback((field: keyof CompetitiveAwarenessResponse, newValue: string) => {
    const updatedValue = {
      ...localValue,
      [field]: newValue
    };
    
    setLocalValue(updatedValue);
    
    if (onChange) {
      onChange(updatedValue);
    }
  }, [localValue, onChange]);

  // Handle awareness level change
  const handleAwarenessChange = useCallback((level: string) => {
    handleChange('awarenessLevel', level);
  }, [handleChange]);

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Question Header */}
      {label && (
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {helpText && (
            <p className="text-sm text-gray-600">{helpText}</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Awareness Level Selection */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Awareness Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={localValue.awarenessLevel || ''}
              onValueChange={handleAwarenessChange}
              disabled={disabled}
              className="space-y-4"
            >
              {AWARENESS_OPTIONS.map((option) => (
                <div key={option.value} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`awareness-${option.value}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`awareness-${option.value}`} 
                        className="text-sm font-medium text-gray-800 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Competitor Initiatives */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Key Competitor Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Describe specific AI initiatives you are aware of from competitors
              </Label>
              <Textarea
                value={localValue.competitorInitiatives || ''}
                onChange={(e) => handleChange('competitorInitiatives', e.target.value)}
                placeholder="e.g., Competitor X launched an AI-powered claims processing system, Competitor Y is using ML for risk assessment..."
                disabled={disabled}
                className="min-h-[100px] bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Desired Competitive Advantages */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Desired Competitive Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                What competitive advantages do you hope to achieve through AI?
              </Label>
              <Textarea
                value={localValue.competitiveAdvantages || ''}
                onChange={(e) => handleChange('competitiveAdvantages', e.target.value)}
                placeholder="e.g., Faster claims processing, better risk pricing, improved customer experience, operational efficiency..."
                disabled={disabled}
                className="min-h-[100px] bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Context */}
        <Card className="border-gray-200 bg-gray-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              Additional Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Additional competitive insights or strategic considerations
              </Label>
              <Textarea
                value={localValue.additionalContext || ''}
                onChange={(e) => handleChange('additionalContext', e.target.value)}
                placeholder="Provide any additional context about competitive positioning, market dynamics, or strategic considerations..."
                disabled={disabled}
                className="min-h-[80px] bg-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Utility functions for working with competitive awareness data
export const competitiveAwarenessUtils = {
  /**
   * Calculate score based on awareness level
   */
  calculateScore: (response: CompetitiveAwarenessResponse): number => {
    const option = AWARENESS_OPTIONS.find(opt => opt.value === response.awarenessLevel);
    return option?.score || 0;
  },

  /**
   * Validate competitive awareness response
   */
  validate: (response: CompetitiveAwarenessResponse, required: boolean = false): string | null => {
    if (required && !response.awarenessLevel) {
      return 'Please select an awareness level';
    }
    
    return null;
  },

  /**
   * Check if response is complete
   */
  isComplete: (response: CompetitiveAwarenessResponse): boolean => {
    return Boolean(response.awarenessLevel);
  },

  /**
   * Format for display
   */
  formatForDisplay: (response: CompetitiveAwarenessResponse): string => {
    const option = AWARENESS_OPTIONS.find(opt => opt.value === response.awarenessLevel);
    if (!option) return 'Not answered';
    
    const parts = [option.label];
    
    if (response.competitorInitiatives) {
      parts.push(`Initiatives: ${response.competitorInitiatives.substring(0, 50)}...`);
    }
    
    if (response.competitiveAdvantages) {
      parts.push(`Advantages: ${response.competitiveAdvantages.substring(0, 50)}...`);
    }
    
    return parts.join(' | ');
  }
};

export default CompetitiveAwarenessLegoBlock;