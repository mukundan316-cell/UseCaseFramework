/**
 * Percentage Target LEGO Block Component
 * 
 * A simplified percentage input component for capturing target percentages or splits
 * without enforcing 100% allocation constraints. Perfect for target metrics and KPIs.
 * 
 * Features:
 * - Individual percentage inputs for each category
 * - No 100% validation or enforcement
 * - Clean, simple interface
 * - Additional context support
 * - Informational total display
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Percent, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export interface PercentageTargetCategory {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
}

export interface PercentageTargetValues {
  [categoryId: string]: number;
}

export interface PercentageTargetLegoBlockProps {
  /** Categories to capture percentage targets for */
  categories: PercentageTargetCategory[];
  /** Current percentage values */
  values?: PercentageTargetValues;
  /** Change handler */
  onChange?: (values: PercentageTargetValues) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional label for the entire component */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Precision for percentage values (default: 1 decimal place) */
  precision?: number;
  /** Additional context value */
  additionalContext?: string;
  /** Handler for additional context changes */
  onAdditionalContextChange?: (value: string) => void;
  /** Label for additional context section */
  additionalContextLabel?: string;
  /** Whether to show the total percentage (default: true) */
  showTotal?: boolean;
}

// Utility functions for percentage formatting
const percentageTargetUtils = {
  /**
   * Calculate total percentage
   */
  calculateTotal: (values: PercentageTargetValues): number => {
    return Object.values(values).reduce((sum, value) => sum + (value || 0), 0);
  },

  /**
   * Format percentage value for display
   */
  formatPercentage: (value: number, precision: number = 1): string => {
    return value.toFixed(precision);
  },

  /**
   * Parse percentage input string to number
   */
  parsePercentage: (input: string): number | null => {
    const trimmed = input.trim();
    if (trimmed === '') return 0;
    
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) return null;
    
    return Math.max(0, Math.min(100, parsed));
  }
};

/**
 * Percentage Target LEGO Block Component
 */
export default function PercentageTargetLegoBlock({
  categories = [],
  values = {},
  onChange,
  disabled = false,
  className = '',
  label,
  helpText,
  required = false,
  error,
  precision = 1,
  additionalContext = '',
  onAdditionalContextChange,
  additionalContextLabel = 'Additional Context',
  showTotal = true
}: PercentageTargetLegoBlockProps) {
  const [localValues, setLocalValues] = useState<PercentageTargetValues>(values);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Update local values when props change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  // Calculate total
  const total = useMemo(() => percentageTargetUtils.calculateTotal(localValues), [localValues]);

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
      const parsedValue = percentageTargetUtils.parsePercentage(inputValue);
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

  const hasError = Boolean(error);
  const hasCategories = categories.length > 0;

  // Return placeholder if no categories provided
  if (!hasCategories) {
    return (
      <div className={cn('p-8 text-center border-2 border-dashed border-gray-200 rounded-lg', className)}>
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No target categories provided</p>
        <p className="text-sm text-gray-500 mt-2">Categories are required for percentage targets</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
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
      {hasError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Total Display - only show if showTotal is true */}
      {showTotal && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Percent className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Total Target</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {percentageTargetUtils.formatPercentage(total, precision)}%
          </span>
        </div>
      )}

      {/* Category Input Cards */}
      <div className="space-y-4">
        {categories.map((category) => {
          const value = localValues[category.id] || 0;
          const displayValue = inputValues[category.id] !== undefined 
            ? inputValues[category.id] 
            : percentageTargetUtils.formatPercentage(value, precision);

          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium text-gray-900">
                      {category.label}
                    </Label>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step={`0.${'1'.repeat(precision)}`}
                      value={displayValue}
                      onChange={(e) => handleInputChange(category.id, e.target.value)}
                      onBlur={(e) => handleValueChange(category.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleValueChange(category.id, e.currentTarget.value);
                        }
                      }}
                      placeholder={category.placeholder || '0.0'}
                      disabled={disabled}
                      className="w-24 text-right"
                    />
                    <span className="text-sm text-gray-500 min-w-[20px]">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Context Section */}
      {onAdditionalContextChange && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="text-sm font-medium text-blue-900">
            {additionalContextLabel}
          </Label>
          <Textarea
            value={additionalContext}
            onChange={(e) => onAdditionalContextChange(e.target.value)}
            placeholder="Add any additional context, assumptions, or notes about these percentage targets..."
            disabled={disabled}
            className="bg-white border-blue-200 focus:border-blue-400"
            rows={3}
          />
        </div>
      )}

      {/* Summary Section */}
      {categories.length > 0 && total > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Target className="h-4 w-4 text-blue-600 mr-2" />
              Target Summary
            </h4>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Total: {percentageTargetUtils.formatPercentage(total, precision)}%
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
                    {percentageTargetUtils.formatPercentage(value, precision)}%
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Export utilities for external use
export { percentageTargetUtils };