import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, DollarSign } from 'lucide-react';

// Supported currency types
export type CurrencyType = 'GBP' | 'USD' | 'EUR' | 'CAD';

// Currency configuration
export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
  locale: string;
}

// Component props interface
export interface CurrencyInputLegoBlockProps {
  /** Current currency value as number */
  value?: number | null;
  /** Change handler that receives the numeric value */
  onChange?: (value: number | null) => void;
  /** Selected currency code */
  currency?: CurrencyType;
  /** Currency change handler */
  onCurrencyChange?: (currency: CurrencyType) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Additional CSS classes */
  className?: string;
  /** Optional label */
  label?: string;
  /** Show currency selector */
  showCurrencySelector?: boolean;
  /** Error message */
  error?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
}

// Currency configurations
export const CURRENCY_CONFIGS: Record<CurrencyType, CurrencyConfig> = {
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' }
};

// Utility functions for currency formatting and validation
export const currencyUtils = {
  /**
   * Format a number as currency string
   */
  formatCurrency: (value: number | null, currency: CurrencyType = 'GBP'): string => {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    const config = CURRENCY_CONFIGS[currency];
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    } catch {
      return `${config.symbol}${value.toLocaleString()}`;
    }
  },

  /**
   * Parse currency string to number
   */
  parseCurrency: (input: string): number | null => {
    if (!input || typeof input !== 'string') return null;
    
    // Remove currency symbols, commas, and whitespace
    const cleaned = input
      .replace(/[£$€C\s,]/g, '')
      .replace(/[^\d.-]/g, '');
    
    if (cleaned === '' || cleaned === '-') return null;
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  },

  /**
   * Validate currency value
   */
  validateCurrency: (value: number | null, min?: number, max?: number): string | null => {
    if (value === null || value === undefined) return null;
    
    if (isNaN(value)) return 'Please enter a valid number';
    
    if (min !== undefined && value < min) {
      return `Value must be at least ${min}`;
    }
    
    if (max !== undefined && value > max) {
      return `Value must be no more than ${max}`;
    }
    
    return null;
  },

  /**
   * Format number for input display (no currency symbol)
   */
  formatForInput: (value: number | null): string => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return value.toString();
  }
};

/**
 * CurrencyInputLegoBlock - Reusable currency input component
 * 
 * Features:
 * - Multi-currency support (GBP, USD, EUR, CAD)
 * - Number formatting and validation
 * - Optional currency selector
 * - Accessible form input patterns
 * - LEGO-style props-based configuration
 */
export const CurrencyInputLegoBlock: React.FC<CurrencyInputLegoBlockProps> = ({
  value = null,
  onChange,
  currency = 'GBP',
  onCurrencyChange,
  disabled = false,
  placeholder,
  min,
  max,
  className = '',
  label,
  showCurrencySelector = false,
  error,
  helpText,
  required = false
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize input value from prop
  useEffect(() => {
    setInputValue(currencyUtils.formatForInput(value));
  }, [value]);

  // Handle input change with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);

    // Parse and validate the input
    const parsedValue = currencyUtils.parseCurrency(newInputValue);
    const validation = currencyUtils.validateCurrency(parsedValue, min, max);
    
    setValidationError(validation);

    // Call onChange with parsed value (or null if invalid)
    if (onChange) {
      onChange(validation ? null : parsedValue);
    }
  }, [onChange, min, max]);

  // Handle currency change
  const handleCurrencyChange = useCallback((newCurrency: CurrencyType) => {
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
  }, [onCurrencyChange]);

  // Handle blur to format the input
  const handleBlur = useCallback(() => {
    const parsedValue = currencyUtils.parseCurrency(inputValue);
    if (parsedValue !== null && !validationError) {
      setInputValue(currencyUtils.formatForInput(parsedValue));
    }
  }, [inputValue, validationError]);

  const currentConfig = CURRENCY_CONFIGS[currency];
  const displayError = error || validationError;
  const hasError = Boolean(displayError);

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

      {/* Input Container */}
      <div className="relative">
        <div className="flex">
          {/* Currency Symbol */}
          <div className={cn(
            'flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50',
            hasError ? 'border-red-300' : 'border-input',
            disabled && 'opacity-50'
          )}>
            <span className="text-sm font-medium text-gray-600">
              {currentConfig.symbol}
            </span>
          </div>

          {/* Input Field */}
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'rounded-l-none flex-1',
              showCurrencySelector && 'rounded-r-none',
              hasError && 'border-red-300 focus-visible:ring-red-500'
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'currency-error' : helpText ? 'currency-help' : undefined}
          />

          {/* Currency Selector */}
          {showCurrencySelector && (
            <Select
              value={currency}
              onValueChange={handleCurrencyChange}
              disabled={disabled}
            >
              <SelectTrigger className={cn(
                'w-20 rounded-l-none border-l-0',
                hasError && 'border-red-300'
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCY_CONFIGS).map(([code, config]) => (
                  <SelectItem key={code} value={code}>
                    {config.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Error Icon */}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p id="currency-help" className="text-sm text-gray-600">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p id="currency-error" className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {displayError}
        </p>
      )}

      {/* Formatted Value Display (for debugging/info) */}
      {value !== null && !hasError && (
        <p className="text-xs text-gray-500">
          Formatted: {currencyUtils.formatCurrency(value, currency)}
        </p>
      )}
    </div>
  );
};

export default CurrencyInputLegoBlock;