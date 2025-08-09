import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield, Target, AlertTriangle } from 'lucide-react';

// Interface for risk appetite response
export interface RiskAppetiteResponse {
  overallRiskLevel?: string;
  specificAreas?: {
    customerFacingAI?: string;
    underwritingDecisions?: string;
    claimsAutomation?: string;
    pricingModels?: string;
  };
  redLines?: string;
  additionalContext?: string;
}

// Props interface
export interface RiskAppetiteLegoBlockProps {
  /** Current response value */
  value?: RiskAppetiteResponse;
  /** Change handler */
  onChange?: (value: RiskAppetiteResponse) => void;
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

// Risk level options
const RISK_LEVEL_OPTIONS = [
  {
    value: 'conservative',
    label: 'Conservative: Proven solutions only',
    description: 'Focus on well-established, thoroughly tested AI solutions',
    score: 1
  },
  {
    value: 'moderate',
    label: 'Moderate: Balanced approach',
    description: 'Balance innovation with proven track records',
    score: 3
  },
  {
    value: 'aggressive',
    label: 'Aggressive: Early adoption',
    description: 'Willing to be among the first to adopt new AI technologies',
    score: 5
  },
  {
    value: 'varies',
    label: 'Varies by use case',
    description: 'Risk appetite differs based on specific application area',
    score: 4
  }
];

// Specific area configurations
const SPECIFIC_AREAS = [
  {
    key: 'customerFacingAI',
    label: 'Customer-facing AI',
    placeholder: 'e.g., Conservative - customer trust is paramount'
  },
  {
    key: 'underwritingDecisions',
    label: 'Underwriting decisions',
    placeholder: 'e.g., Moderate - need accuracy but open to efficiency gains'
  },
  {
    key: 'claimsAutomation',
    label: 'Claims automation',
    placeholder: 'e.g., Aggressive - significant cost savings potential'
  },
  {
    key: 'pricingModels',
    label: 'Pricing models',
    placeholder: 'e.g., Conservative - regulatory compliance critical'
  }
];

/**
 * RiskAppetiteLegoBlock - Complex question for AI risk appetite assessment
 * 
 * Features:
 * - Radio button selection for overall risk level
 * - Text inputs for specific area risk assessments
 * - Text area for red lines and boundaries
 * - Additional context section
 */
export const RiskAppetiteLegoBlock: React.FC<RiskAppetiteLegoBlockProps> = ({
  value = {},
  onChange,
  label,
  helpText,
  required = false,
  disabled = false,
  error,
  className
}) => {
  const [localValue, setLocalValue] = useState<RiskAppetiteResponse>(value);

  // Handle changes to any field
  const handleChange = useCallback((field: keyof RiskAppetiteResponse, newValue: any) => {
    const updatedValue = {
      ...localValue,
      [field]: newValue
    };
    
    setLocalValue(updatedValue);
    
    if (onChange) {
      onChange(updatedValue);
    }
  }, [localValue, onChange]);

  // Handle overall risk level change
  const handleRiskLevelChange = useCallback((level: string) => {
    handleChange('overallRiskLevel', level);
  }, [handleChange]);

  // Handle specific area change
  const handleSpecificAreaChange = useCallback((areaKey: string, newValue: string) => {
    const updatedSpecificAreas = {
      ...localValue.specificAreas,
      [areaKey]: newValue
    };
    handleChange('specificAreas', updatedSpecificAreas);
  }, [localValue.specificAreas, handleChange]);

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
        {/* Overall Risk Level Selection */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Overall Risk Tolerance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={localValue.overallRiskLevel || ''}
              onValueChange={handleRiskLevelChange}
              disabled={disabled}
              className="space-y-4"
            >
              {RISK_LEVEL_OPTIONS.map((option) => (
                <div key={option.value} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`risk-${option.value}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`risk-${option.value}`} 
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

        {/* Specific Areas */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Specific Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPECIFIC_AREAS.map((area) => (
                <div key={area.key} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {area.label}
                  </Label>
                  <Input
                    value={localValue.specificAreas?.[area.key as keyof typeof localValue.specificAreas] || ''}
                    onChange={(e) => handleSpecificAreaChange(area.key, e.target.value)}
                    placeholder={area.placeholder}
                    disabled={disabled}
                    className="bg-white"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Red Lines */}
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Red Lines & Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                What are your absolute boundaries or red lines for AI implementation?
              </Label>
              <Textarea
                value={localValue.redLines || ''}
                onChange={(e) => handleChange('redLines', e.target.value)}
                placeholder="e.g., No fully automated customer claim denials, No AI without human oversight for high-value decisions, No customer data used for training external models..."
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
                Additional risk considerations or strategic context
              </Label>
              <Textarea
                value={localValue.additionalContext || ''}
                onChange={(e) => handleChange('additionalContext', e.target.value)}
                placeholder="Provide any additional context about risk appetite, regulatory constraints, or strategic considerations..."
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

// Utility functions for working with risk appetite data
export const riskAppetiteUtils = {
  /**
   * Calculate score based on overall risk level
   */
  calculateScore: (response: RiskAppetiteResponse): number => {
    const option = RISK_LEVEL_OPTIONS.find(opt => opt.value === response.overallRiskLevel);
    return option?.score || 0;
  },

  /**
   * Validate risk appetite response
   */
  validate: (response: RiskAppetiteResponse, required: boolean = false): string | null => {
    if (required && !response.overallRiskLevel) {
      return 'Please select an overall risk tolerance level';
    }
    
    return null;
  },

  /**
   * Check if response is complete
   */
  isComplete: (response: RiskAppetiteResponse): boolean => {
    return Boolean(response.overallRiskLevel);
  },

  /**
   * Format for display
   */
  formatForDisplay: (response: RiskAppetiteResponse): string => {
    const option = RISK_LEVEL_OPTIONS.find(opt => opt.value === response.overallRiskLevel);
    if (!option) return 'Not answered';
    
    const parts = [option.label];
    
    const specificAreaCount = Object.values(response.specificAreas || {}).filter(Boolean).length;
    if (specificAreaCount > 0) {
      parts.push(`${specificAreaCount} specific areas defined`);
    }
    
    if (response.redLines) {
      parts.push('Red lines defined');
    }
    
    return parts.join(' | ');
  }
};

export default RiskAppetiteLegoBlock;