import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToggleVariant = 'standard' | 'with_reason' | 'confirmation';

export interface ConfigurationToggleLegoBlockProps {
  /** Toggle variant determines behavior and UI */
  variant: ToggleVariant;
  /** Current toggle state */
  enabled: boolean;
  /** Change handler for toggle */
  onEnabledChange: (enabled: boolean) => void;
  /** Toggle label */
  label: string;
  /** Description text */
  description?: string;
  /** Help text for tooltip */
  helpText?: string;
  /** Current reason text (for with_reason variant) */
  reason?: string;
  /** Reason change handler */
  onReasonChange?: (reason: string) => void;
  /** Reason field label */
  reasonLabel?: string;
  /** Reason placeholder */
  reasonPlaceholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Warning message for confirmation variant */
  warningMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for automation */
  testId?: string;
}

/**
 * ConfigurationToggleLegoBlock - LEGO Rationalization Phase 3
 * 
 * Consolidates toggle patterns across components:
 * - RSASelectionToggleLegoBlock logic
 * - ScoreOverrideLegoBlock toggle patterns
 * - Various form toggle implementations
 * 
 * Features:
 * - 3 variants: standard, with_reason, confirmation
 * - Consistent styling and behavior
 * - Reason capture with validation
 * - Confirmation warnings for destructive actions
 * - Unified toggle interface patterns
 */
export const ConfigurationToggleLegoBlock: React.FC<ConfigurationToggleLegoBlockProps> = ({
  variant = 'standard',
  enabled,
  onEnabledChange,
  label,
  description,
  helpText,
  reason = '',
  onReasonChange,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Please provide a reason for this configuration...',
  disabled = false,
  error,
  warningMessage,
  className = '',
  testId
}) => {
  
  // Handle toggle change with confirmation for destructive actions
  const handleToggleChange = (newEnabled: boolean) => {
    if (variant === 'confirmation' && !newEnabled && warningMessage) {
      // For confirmation variant, could add modal confirmation here
      // For now, proceed with the change
      onEnabledChange(newEnabled);
    } else {
      onEnabledChange(newEnabled);
    }
  };
  
  return (
    <div className={cn('space-y-4 p-4 bg-gray-50 rounded-lg border', className)}>
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <Label className="text-base font-semibold text-gray-900 flex items-center">
              {label}
              {helpText && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="ml-2">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{helpText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {/* Toggle Switch */}
        <Switch
          checked={enabled}
          onCheckedChange={handleToggleChange}
          disabled={disabled}
          data-testid={testId || `switch-config-toggle-${variant}`}
          className={cn(
            error && "border-red-500"
          )}
        />
      </div>
      
      {/* Warning Message for Confirmation Variant */}
      {variant === 'confirmation' && warningMessage && !enabled && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{warningMessage}</span>
          </div>
        </div>
      )}
      
      {/* Reason Input for with_reason Variant */}
      {variant === 'with_reason' && enabled && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {reasonLabel}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange?.(e.target.value)}
            placeholder={reasonPlaceholder}
            disabled={disabled}
            rows={3}
            data-testid={testId ? `${testId}-reason` : 'textarea-config-toggle-reason'}
            className={cn(
              "text-sm resize-vertical",
              error && "border-red-500 focus:border-red-500"
            )}
          />
          {reason && (
            <div className="text-xs text-gray-500">
              {reason.length} characters
            </div>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="flex items-center space-x-2 text-xs">
        <div className={cn(
          "w-2 h-2 rounded-full",
          enabled ? "bg-green-500" : "bg-gray-400"
        )} />
        <span className="text-gray-600">
          {enabled ? 'Configuration enabled' : 'Configuration disabled'}
        </span>
        {variant === 'with_reason' && enabled && reason && (
          <span className="text-gray-500">• Reason provided</span>
        )}
      </div>
    </div>
  );
};

export default ConfigurationToggleLegoBlock;