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

// Component props interface
export interface PercentageAllocationLegoBlockProps {
  /** Array of categories to allocate percentages across */
  categories: AllocationCategory[];
  /** Current allocation values as object with category IDs as keys */
  values: AllocationValues;
  /** Change handler that receives the updated allocation values */
  onChange: (values: AllocationValues) => void;
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

  // Handle individual category change
  const handleCategoryChange = useCallback((categoryId: string, inputValue: string) => {
    const parsedValue = allocationUtils.parsePercentage(inputValue);
    const newValues = {
      ...localValues,
      [categoryId]: parsedValue || 0
    };

    setLocalValues(newValues);
    
    if (onChange) {
      onChange(newValues);
    }
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
          {remaining > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoDistribute}
              disabled={disabled}
              className="text-xs"
            >
              Auto Distribute
            </Button>
          )}
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

      {/* Category Inputs */}
      <div className="space-y-3">
        {categories.map((category) => {
          const value = localValues[category.id] || 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          
          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-700">
                    {category.label}
                  </Label>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Input
                      type="number"
                      value={allocationUtils.formatPercentage(value, precision)}
                      onChange={(e) => handleCategoryChange(category.id, e.target.value)}
                      disabled={disabled}
                      min={category.minValue || 0}
                      max={category.maxValue || 100}
                      step={1 / Math.pow(10, precision)}
                      className="w-20 text-right pr-6"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Individual category progress bar */}
              <div className="flex items-center space-x-2">
                <Progress 
                  value={value} 
                  className="flex-1 h-2"
                  style={{
                    '--progress-background': category.color || undefined
                  } as React.CSSProperties}
                />
                <span className="text-xs text-gray-500 w-12 text-right">
                  {value > 0 && `${percentage.toFixed(0)}%`}
                </span>
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

      {/* Allocation Summary */}
      {categories.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Allocation Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categories.map((category) => {
              const value = localValues[category.id] || 0;
              return value > 0 ? (
                <div key={category.id} className="flex justify-between">
                  <span className="text-gray-600 truncate">{category.label}:</span>
                  <span className="font-medium">{allocationUtils.formatPercentage(value, precision)}%</span>
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