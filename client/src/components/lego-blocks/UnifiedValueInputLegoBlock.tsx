import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, DollarSign, Percent, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValueInputVariant = 'currency' | 'percentage_allocation' | 'percentage_target';

export interface UnifiedValueInputLegoBlockProps {
  /** Input variant determines the type and validation */
  variant: ValueInputVariant;
  /** Current value */
  value: string | number;
  /** Change handler */
  onChange: (value: string | number) => void;
  /** Field label */
  label: string;
  /** Help text for tooltip */
  helpText?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Required field indicator */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** For allocation variant - array of related inputs for 100% validation */
  allocationInputs?: number[];
  /** Maximum value for target variant */
  maxValue?: number;
  /** Minimum value */
  minValue?: number;
  /** Test ID for automation */
  testId?: string;
}

/**
 * UnifiedValueInputLegoBlock - LEGO Rationalization Phase 2
 * 
 * Consolidates three components into one:
 * - CurrencyInputLegoBlock (monetary values)
 * - PercentageAllocationLegoBlock (100% constraint)  
 * - PercentageTargetLegoBlock (no constraint)
 * 
 * Features:
 * - Unified number formatting and validation
 * - Consistent error handling patterns
 * - Reduced bundle size
 * - Single API for similar functionality
 */
export const UnifiedValueInputLegoBlock: React.FC<UnifiedValueInputLegoBlockProps> = ({
  variant,
  value,
  onChange,
  label,
  helpText,
  placeholder,
  disabled = false,
  error,
  required = false,
  className = '',
  allocationInputs = [],
  maxValue,
  minValue = 0,
  testId
}) => {
  
  // Format value based on variant
  const formatValue = (val: string | number): string => {
    if (val === '' || val === null || val === undefined) return '';
    
    const numVal = typeof val === 'number' ? val : parseFloat(val.toString());
    if (isNaN(numVal)) return '';
    
    switch (variant) {
      case 'currency':
        return numVal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      case 'percentage_allocation':
      case 'percentage_target':
        return `${numVal}%`;
      default:
        return numVal.toString();
    }
  };
  
  // Parse input value
  const parseInput = (inputValue: string): number => {
    // Remove currency symbols and formatting
    const cleaned = inputValue
      .replace(/[$,]/g, '')
      .replace(/%/g, '')
      .trim();
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };
  
  // Validate input based on variant
  const validateInput = (inputValue: number): string | null => {
    if (inputValue < minValue) {
      return `Value must be at least ${minValue}`;
    }
    
    if (maxValue && inputValue > maxValue) {
      return `Value must not exceed ${maxValue}`;
    }
    
    // Allocation constraint validation
    if (variant === 'percentage_allocation' && allocationInputs.length > 0) {
      const total = allocationInputs.reduce((sum, val) => sum + val, 0) + inputValue;
      if (total > 100) {
        return 'Total allocation cannot exceed 100%';
      }
    }
    
    return null;
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInput(rawValue);
    
    // Validate the input
    const validationError = validateInput(numericValue);
    if (validationError) {
      // Still update the value but let parent handle validation display
      onChange(numericValue);
      return;
    }
    
    onChange(numericValue);
  };
  
  // Get icon based on variant
  const getIcon = () => {
    switch (variant) {
      case 'currency':
        return <DollarSign className="h-4 w-4" />;
      case 'percentage_allocation':
        return <Percent className="h-4 w-4" />;
      case 'percentage_target':
        return <Target className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Get default placeholder
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (variant) {
      case 'currency':
        return 'Enter amount (e.g., $10,000)';
      case 'percentage_allocation':
        return 'Enter percentage (total must = 100%)';
      case 'percentage_target':
        return 'Enter target percentage';
      default:
        return 'Enter value';
    }
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Label with help text */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-gray-900 flex items-center">
          {getIcon()}
          <span className="ml-2">{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
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
      
      {/* Input field */}
      <div className="relative">
        <Input
          type="text"
          value={value?.toString() || ''}
          onChange={handleChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
          data-testid={testId || `input-unified-value-${variant}`}
          className={cn(
            "text-base",
            variant === 'currency' && "pl-8",
            (variant === 'percentage_allocation' || variant === 'percentage_target') && "pr-8",
            error && "border-red-500 focus:border-red-500",
            disabled && "bg-gray-50 cursor-not-allowed"
          )}
        />
        
        {/* Currency symbol */}
        {variant === 'currency' && (
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        
        {/* Percentage symbol */}
        {(variant === 'percentage_allocation' || variant === 'percentage_target') && (
          <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>
      
      {/* Allocation summary for allocation variant */}
      {variant === 'percentage_allocation' && allocationInputs.length > 0 && (
        <div className="text-sm text-gray-600">
          Total allocated: {allocationInputs.reduce((sum, val) => sum + val, 0) + parseInput(value?.toString() || '0')}% / 100%
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {/* Formatted display */}
      {value && !error && (
        <div className="text-sm text-gray-500">
          Formatted: {formatValue(value)}
        </div>
      )}
    </div>
  );
};

export default UnifiedValueInputLegoBlock;