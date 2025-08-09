import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, RotateCcw, Percent } from 'lucide-react';

// Category definition interface
export interface AllocationCategory {
  id: string;
  label: string;
  description?: string;
  color?: string;
  minValue?: number;
  maxValue?: number;
}

// Allocation values interface
export interface AllocationValues {
  [categoryId: string]: number;
}

// Additional fields for complex allocation questions
export interface AdditionalField {
  id: string;
  type: 'scale' | 'text' | 'number';
  label: string;
  helpText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
}

// Extended props interface to support additional fields
export interface PercentageAllocationLegoBlockProps {
  /** Array of categories to allocate percentages across */
  categories: AllocationCategory[];
  /** Current allocation values as object with category IDs as keys */
  values: AllocationValues;
  /** Change handler that receives the updated allocation values */
  onChange: (values: AllocationValues) => void;
  /** Additional fields to render (like digital maturity score) */
  additionalFields?: AdditionalField[];
  /** Additional field values */
  additionalValues?: Record<string, any>;
  /** Handler for additional field changes */
  onAdditionalChange?: (fieldId: string, value: any) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Allow partial allocation (less than 100%) */
  allowPartial?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional label for the entire allocation */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Show remaining percentage */
  showRemaining?: boolean;
  /** Precision for percentage values (default: 1 decimal place) */
  precision?: number;
}

// Validation utilities
export const allocationUtils = {
  /**
   * Calculate total allocation percentage
   */
  calculateTotal: (values: AllocationValues): number => {
    return Object.values(values).reduce((sum, value) => sum + (value || 0), 0);
  },

  /**
   * Calculate remaining percentage
   */
  calculateRemaining: (values: AllocationValues): number => {
    return 100 - allocationUtils.calculateTotal(values);
  },

  /**
   * Validate allocation values
   */
  validateAllocation: (
    values: AllocationValues, 
    categories: AllocationCategory[], 
    allowPartial: boolean = false
  ): string | null => {
    const total = allocationUtils.calculateTotal(values);

    // Check if total exceeds 100%
    if (total > 100) {
      return `Total allocation cannot exceed 100% (currently ${total.toFixed(1)}%)`;
    }

    // Check if total is less than 100% when not allowing partial
    if (!allowPartial && total < 100) {
      return `Total allocation must equal 100% (currently ${total.toFixed(1)}%)`;
    }

    // Validate individual category constraints
    for (const category of categories) {
      const value = values[category.id] || 0;
      
      if (category.minValue !== undefined && value < category.minValue) {
        return `${category.label} must be at least ${category.minValue}%`;
      }
      
      if (category.maxValue !== undefined && value > category.maxValue) {
        return `${category.label} cannot exceed ${category.maxValue}%`;
      }
    }

    return null;
  },

  /**
   * Normalize allocation to ensure it doesn't exceed 100%
   */
  normalizeAllocation: (values: AllocationValues): AllocationValues => {
    const total = allocationUtils.calculateTotal(values);
    if (total <= 100) return values;

    const normalized: AllocationValues = {};
    const factor = 100 / total;
    
    Object.keys(values).forEach(categoryId => {
      normalized[categoryId] = Math.round((values[categoryId] || 0) * factor * 10) / 10;
    });

    return normalized;
  },

  /**
   * Format percentage value for display
   */
  formatPercentage: (value: number, precision: number = 1): string => {
    return value.toFixed(precision);
  },

  /**
   * Parse percentage input
   */
  parsePercentage: (input: string): number | null => {
    if (!input || typeof input !== 'string') return null;
    
    const cleaned = input.replace(/[^\d.-]/g, '');
    if (cleaned === '' || cleaned === '-') return null;
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : Math.max(0, Math.min(100, parsed));
  }
};

/**
 * PercentageAllocationLegoBlock - Reusable percentage allocation component
 * 
 * Features:
 * - Allocation across multiple categories
 * - Real-time validation and feedback
 * - Visual progress indicators
 * - Configurable constraints per category
 * - LEGO-style props-based configuration
 */
export const PercentageAllocationLegoBlock: React.FC<PercentageAllocationLegoBlockProps> = ({
  categories = [],
  values = {},
  onChange,
  additionalFields = [],
  additionalValues = {},
  onAdditionalChange,
  disabled = false,
  allowPartial = false,
  className = '',
  label,
  helpText,
  required = false,
  error,
  showRemaining = true,
  precision = 1
}) => {
  const [localValues, setLocalValues] = useState<AllocationValues>(values);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Update local values when props change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  // Calculate totals and validation
  const total = useMemo(() => allocationUtils.calculateTotal(localValues), [localValues]);
  const remaining = useMemo(() => allocationUtils.calculateRemaining(localValues), [localValues]);
  
  const validation = useMemo(() => 
    allocationUtils.validateAllocation(localValues, categories, allowPartial),
    [localValues, categories, allowPartial]
  );

  // Update validation error
  useEffect(() => {
    setValidationError(validation);
  }, [validation]);

  // Handle input change while typing (store as string)
  const handleInputChange = useCallback((categoryId: string, inputValue: string) => {
    setInputValues(prev => ({ ...prev, [categoryId]: inputValue }));
  }, []);

  // Handle value change (on blur or enter) - convert to number and update values
  const handleValueChange = useCallback((categoryId: string, inputValue: string) => {
    // Allow empty input to be treated as 0
    if (inputValue.trim() === '') {
      const newValues = {
        ...localValues,
        [categoryId]: 0
      };
      setLocalValues(newValues);
      if (onChange) {
        onChange(newValues);
      }
    } else {
      // Parse and validate the input
      const parsedValue = allocationUtils.parsePercentage(inputValue);
      if (parsedValue !== null) {
        const newValues = {
          ...localValues,
          [categoryId]: parsedValue
        };
        setLocalValues(newValues);
        if (onChange) {
          onChange(newValues);
        }
      }
    }
    
    // Clear the input value to use the actual value
    setInputValues(prev => {
      const newInputValues = { ...prev };
      delete newInputValues[categoryId];
      return newInputValues;
    });
  }, [localValues, onChange]);

  // Reset all allocations
  const handleReset = useCallback(() => {
    const resetValues: AllocationValues = {};
    categories.forEach(category => {
      resetValues[category.id] = 0;
    });
    
    setLocalValues(resetValues);
    if (onChange) {
      onChange(resetValues);
    }
  }, [categories, onChange]);

  // Auto-distribute remaining percentage equally
  const handleAutoDistribute = useCallback(() => {
    if (remaining <= 0) return;
    
    const unallocatedCategories = categories.filter(cat => (localValues[cat.id] || 0) === 0);
    if (unallocatedCategories.length === 0) return;
    
    const perCategory = Math.floor((remaining / unallocatedCategories.length) * Math.pow(10, precision)) / Math.pow(10, precision);
    const newValues = { ...localValues };
    
    unallocatedCategories.forEach(category => {
      newValues[category.id] = perCategory;
    });
    
    setLocalValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  }, [remaining, categories, localValues, onChange, precision]);

  const displayError = error || validationError;
  const hasError = Boolean(displayError);
  const isComplete = total === 100;
  const hasCategories = categories.length > 0;

  // Return placeholder if no categories provided
  if (!hasCategories) {
    return (
      <div className={cn('p-8 text-center border-2 border-dashed border-gray-200 rounded-lg', className)}>
        <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No categories provided</p>
        <p className="text-sm text-gray-500 mt-2">Categories are required for percentage allocation</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label and Controls */}
      <div className="flex items-center justify-between">
        {label && (
          <Label 
            className={cn(
              'text-base font-medium text-gray-700',
              required && "after:content-['*'] after:text-red-500 after:ml-1"
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="flex items-center space-x-2">
          {/* Smart Actions */}
          {remaining > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleAutoDistribute}
              disabled={disabled}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              Auto Distribute
            </Button>
          )}
          {total > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Total Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Allocation</span>
          <div className="flex items-center space-x-2">
            <span className={cn(
              'font-medium',
              isComplete ? 'text-green-600' : hasError ? 'text-red-600' : 'text-gray-900'
            )}>
              {allocationUtils.formatPercentage(total, precision)}%
            </span>
            {isComplete && <Check className="h-4 w-4 text-green-600" />}
            {hasError && <AlertCircle className="h-4 w-4 text-red-600" />}
          </div>
        </div>
        
        <Progress 
          value={Math.min(total, 100)} 
          className={cn(
            'h-3',
            total > 100 && 'bg-red-100'
          )}
        />
        
        {showRemaining && remaining !== 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {remaining > 0 ? 'Remaining' : 'Over limit'}: {Math.abs(remaining).toFixed(precision)}%
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Category Cards */}
      <div className="grid gap-4">
        {categories.map((category, index) => {
          const value = localValues[category.id] || 0;
          const isActive = value > 0;
          const colorIndex = index % 6; // Cycle through colors
          const cardColor = `hsl(${colorIndex * 60}, 65%, 95%)`;
          const borderColor = `hsl(${colorIndex * 60}, 65%, 75%)`;
          const progressColor = `hsl(${colorIndex * 60}, 65%, 55%)`;
          
          return (
            <div 
              key={category.id} 
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-200",
                isActive 
                  ? "border-blue-200 bg-blue-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              )}
              style={isActive ? { borderColor, backgroundColor: cardColor } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <Label className="text-base font-medium text-gray-900">
                    {category.label}
                  </Label>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      type="text"
                      value={inputValues[category.id] !== undefined ? inputValues[category.id] : (value === 0 ? '' : allocationUtils.formatPercentage(value, precision))}
                      onChange={(e) => handleInputChange(category.id, e.target.value)}
                      onBlur={(e) => handleValueChange(category.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleValueChange(category.id, (e.target as HTMLInputElement).value);
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      disabled={disabled}
                      placeholder="0.0"
                      className={cn(
                        "w-24 text-right pr-8 text-lg font-medium",
                        isActive && "border-blue-300 bg-white"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced progress visualization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Allocation</span>
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-gray-900" : "text-gray-400"
                  )}>
                    {value.toFixed(precision)}% of total
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={value} 
                    className="h-3 bg-gray-100"
                  />
                  <div 
                    className="absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${Math.min(value, 100)}%`,
                      backgroundColor: isActive ? progressColor : '#e5e7eb'
                    }}
                  />
                </div>
                
                {/* Quick preset buttons for common values */}
                {!disabled && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-1">
                      {[10, 25, 50].map((preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => handleValueChange(category.id, preset.toString())}
                          className="h-6 px-2 text-xs"
                          disabled={disabled}
                        >
                          {preset}%
                        </Button>
                      ))}
                    </div>
                    
                    {value > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleValueChange(category.id, '0')}
                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                        disabled={disabled}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-sm text-gray-600">{helpText}</p>
      )}

      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {displayError}
        </p>
      )}

      {/* Additional Fields (like digital maturity score) */}
      {additionalFields && additionalFields.length > 0 && (
        <div className="mt-6 space-y-4">
          {additionalFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'scale' && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{field.min || 1}</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={field.min || 1}
                      max={field.max || 5}
                      value={additionalValues[field.id] || ''}
                      onChange={(e) => onAdditionalChange?.(field.id, parseInt(e.target.value) || '')}
                      placeholder={field.placeholder || `Enter ${field.min || 1}-${field.max || 5}`}
                      disabled={disabled}
                      className="text-center"
                    />
                  </div>
                  <span className="text-sm text-gray-500">{field.max || 5}</span>
                </div>
              )}
              
              {field.type === 'number' && (
                <Input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={additionalValues[field.id] || ''}
                  onChange={(e) => onAdditionalChange?.(field.id, parseFloat(e.target.value) || '')}
                  placeholder={field.placeholder}
                  disabled={disabled}
                />
              )}
              
              {field.type === 'text' && (
                <Input
                  type="text"
                  value={additionalValues[field.id] || ''}
                  onChange={(e) => onAdditionalChange?.(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={disabled}
                />
              )}
              
              {field.helpText && (
                <p className="text-sm text-gray-600">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Smart Allocation Summary */}
      {categories.length > 0 && total > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              Allocation Overview
            </h4>
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              isComplete 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700"
            )}>
              {isComplete ? "Complete" : `${remaining.toFixed(precision)}% remaining`}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((category, index) => {
              const value = localValues[category.id] || 0;
              const colorIndex = index % 6;
              const dotColor = `hsl(${colorIndex * 60}, 65%, 55%)`;
              
              return value > 0 ? (
                <div key={category.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-sm text-gray-700 truncate">{category.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {allocationUtils.formatPercentage(value, precision)}%
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PercentageAllocationLegoBlock;