import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';

// Growth trend types
export type GrowthTrend = 'up' | 'down' | 'stable';

// Business line data structure
export interface BusinessLineData {
  line: string;
  premium: number;
  trend: GrowthTrend;
}

// Component props interface
export interface BusinessLinesMatrixLegoBlockProps {
  /** Current business lines data */
  businessLines?: BusinessLineData[];
  /** Change handler that receives the updated business lines array */
  onChange?: (businessLines: BusinessLineData[]) => void;
  /** Enforce 100% total validation */
  enforceTotal?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional label */
  label?: string;
  /** Error message */
  error?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Minimum number of business lines */
  minLines?: number;
  /** Maximum number of business lines */
  maxLines?: number;
}

// Growth trend configurations
const GROWTH_TREND_CONFIG = {
  up: { 
    icon: TrendingUp, 
    label: 'Growing', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    symbol: '↑'
  },
  down: { 
    icon: TrendingDown, 
    label: 'Declining', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    symbol: '↓'
  },
  stable: { 
    icon: Minus, 
    label: 'Stable', 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    symbol: '→'
  }
};

// RSA-specific business line categories
const RSA_BUSINESS_LINES = [
  'Personal Auto',
  'Homeowners',
  'Commercial P&C',
  'Workers Comp',
  'Professional Liability',
  'Cyber Insurance',
  'Marine/Aviation',
  'Other Specialty'
];

/**
 * BusinessLinesMatrixLegoBlock - Table-based business line premium allocation
 * 
 * Features:
 * - Editable table with business line names and premium percentages
 * - Growth trend indicators with visual symbols
 * - Real-time 100% validation
 * - Add/remove business lines functionality
 * - JSON serialization for complex data storage
 */
export default function BusinessLinesMatrixLegoBlock({
  businessLines = [],
  onChange,
  enforceTotal = true,
  disabled = false,
  className = '',
  label = 'Business Lines Premium Distribution',
  error,
  helpText = 'Distribute premium percentages across business lines. Total must equal 100%.',
  required = false,
  minLines = 1,
  maxLines = 10
}: BusinessLinesMatrixLegoBlockProps) {

  const [localBusinessLines, setLocalBusinessLines] = useState<BusinessLineData[]>(
    businessLines.length > 0 ? businessLines : RSA_BUSINESS_LINES.map(line => ({
      line,
      premium: 0,
      trend: 'stable' as GrowthTrend
    }))
  );
  const [isEditing, setIsEditing] = useState<number | null>(null);

  // Calculate current total
  const currentTotal = localBusinessLines.reduce((sum, line) => sum + line.premium, 0);
  const isValidTotal = !enforceTotal || Math.abs(currentTotal - 100) < 0.01;

  // Update parent when local state changes
  useEffect(() => {
    if (onChange) {
      onChange(localBusinessLines);
    }
  }, [localBusinessLines, onChange]);

  // Handle business line name change
  const handleLineNameChange = useCallback((index: number, newName: string) => {
    setLocalBusinessLines(prev => prev.map((line, i) => 
      i === index ? { ...line, line: newName } : line
    ));
  }, []);

  // Handle premium percentage change
  const handlePremiumChange = useCallback((index: number, newPremium: number) => {
    const validPremium = Math.max(0, Math.min(100, newPremium));
    setLocalBusinessLines(prev => prev.map((line, i) => 
      i === index ? { ...line, premium: validPremium } : line
    ));
  }, []);

  // Handle growth trend change
  const handleTrendChange = useCallback((index: number, newTrend: GrowthTrend) => {
    setLocalBusinessLines(prev => prev.map((line, i) => 
      i === index ? { ...line, trend: newTrend } : line
    ));
  }, []);

  // Add new business line (including "Other" support)
  const addBusinessLine = useCallback((customName?: string) => {
    if (localBusinessLines.length >= maxLines) return;
    
    // Find unused RSA business line name or create custom one
    const usedNames = localBusinessLines.map(line => line.line);
    const availableName = customName || 
                         RSA_BUSINESS_LINES.find(name => !usedNames.includes(name)) || 
                         `Business Line ${localBusinessLines.length + 1}`;
    
    setLocalBusinessLines(prev => [...prev, { 
      line: availableName, 
      premium: 0, 
      trend: 'stable' 
    }]);
  }, [localBusinessLines.length, maxLines]);

  // Remove business line
  const removeBusinessLine = useCallback((index: number) => {
    if (localBusinessLines.length <= minLines) return;
    setLocalBusinessLines(prev => prev.filter((_, i) => i !== index));
  }, [localBusinessLines.length, minLines]);

  // Auto-distribute remaining percentage
  const autoDistribute = useCallback(() => {
    const remainingPercentage = 100 - currentTotal;
    const linesCount = localBusinessLines.length;
    const distributionPerLine = remainingPercentage / linesCount;

    setLocalBusinessLines(prev => prev.map(line => ({
      ...line,
      premium: Math.round((line.premium + distributionPerLine) * 100) / 100
    })));
  }, [currentTotal, localBusinessLines.length]);

  // Get trend configuration
  const getTrendConfig = (trend: GrowthTrend) => GROWTH_TREND_CONFIG[trend];

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Label and Help Text */}
      {label && (
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {helpText && (
            <p className="text-sm text-gray-600">{helpText}</p>
          )}
        </div>
      )}

      {/* Business Lines Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Building2 className="h-4 w-4" />
              <span>Business Lines Matrix</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isValidTotal ? "default" : "destructive"}>
                Total: {currentTotal.toFixed(1)}%
              </Badge>
              {!isValidTotal && enforceTotal && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={autoDistribute}
                  disabled={disabled}
                  className="text-xs h-7"
                >
                  Auto-Distribute
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 pb-2 border-b">
            <div className="col-span-5">Business Line</div>
            <div className="col-span-3">Premium %</div>
            <div className="col-span-3">Growth Trend</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Business Lines Rows */}
          <div className="space-y-2">
            {localBusinessLines.map((businessLine, index) => {
              const trendConfig = getTrendConfig(businessLine.trend);
              const TrendIcon = trendConfig.icon;

              return (
                <div key={index} className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg border hover:bg-gray-50">
                  {/* Business Line Name */}
                  <div className="col-span-5">
                    {isEditing === index ? (
                      <Input
                        value={businessLine.line}
                        onChange={(e) => handleLineNameChange(index, e.target.value)}
                        onBlur={() => setIsEditing(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditing(null);
                        }}
                        className="h-8 text-sm"
                        autoFocus
                        disabled={disabled}
                      />
                    ) : (
                      <div
                        className="text-sm cursor-pointer hover:text-blue-600 truncate"
                        onClick={() => !disabled && setIsEditing(index)}
                        title={businessLine.line}
                      >
                        {businessLine.line}
                      </div>
                    )}
                  </div>

                  {/* Premium Percentage */}
                  <div className="col-span-3">
                    <div className="relative">
                      <Input
                        type="number"
                        value={businessLine.premium}
                        onChange={(e) => handlePremiumChange(index, parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="h-8 text-sm pr-8"
                        disabled={disabled}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                    </div>
                  </div>

                  {/* Growth Trend */}
                  <div className="col-span-3">
                    <Select
                      value={businessLine.trend}
                      onValueChange={(value: GrowthTrend) => handleTrendChange(index, value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{trendConfig.symbol}</span>
                            <span className="hidden sm:inline">{trendConfig.label}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GROWTH_TREND_CONFIG).map(([key, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <span>{config.symbol}</span>
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBusinessLine(index)}
                      disabled={disabled || localBusinessLines.length <= minLines}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Business Line Button */}
          {localBusinessLines.length < maxLines && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBusinessLine()}
              disabled={disabled}
              className="w-full h-8 text-sm border-dashed"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Business Line
            </Button>
          )}

          {/* Validation Summary */}
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Allocation:</span>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "font-medium",
                  isValidTotal ? "text-green-600" : "text-red-600"
                )}>
                  {currentTotal.toFixed(1)}%
                </span>
                {enforceTotal && !isValidTotal && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {enforceTotal && !isValidTotal && (
              <div className="text-xs text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>
                  {currentTotal > 100 
                    ? `Over by ${(currentTotal - 100).toFixed(1)}%` 
                    : `Under by ${(100 - currentTotal).toFixed(1)}%`
                  }
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Utility functions for external use
export const businessLinesMatrixUtils = {
  /**
   * Validate business lines data
   */
  validateBusinessLines: (businessLines: BusinessLineData[], enforceTotal = true): string[] => {
    const errors: string[] = [];
    
    if (!businessLines || businessLines.length === 0) {
      errors.push('At least one business line is required');
      return errors;
    }

    const total = businessLines.reduce((sum, line) => sum + line.premium, 0);
    
    if (enforceTotal && Math.abs(total - 100) > 0.01) {
      errors.push(`Total must equal 100% (current: ${total.toFixed(1)}%)`);
    }

    businessLines.forEach((line, index) => {
      if (!line.line.trim()) {
        errors.push(`Business line ${index + 1} name is required`);
      }
      if (line.premium < 0 || line.premium > 100) {
        errors.push(`Business line ${index + 1} premium must be between 0% and 100%`);
      }
    });

    return errors;
  },

  /**
   * Format business lines data for display
   */
  formatBusinessLines: (businessLines: BusinessLineData[]): string => {
    return businessLines
      .map(line => `${line.line}: ${line.premium}% (${GROWTH_TREND_CONFIG[line.trend].symbol})`)
      .join(', ');
  },

  /**
   * Create default business lines data
   */
  createDefault: (lines: string[] = RSA_BUSINESS_LINES.slice(0, 3)): BusinessLineData[] => {
    const premiumPerLine = Math.round((100 / lines.length) * 10) / 10;
    return lines.map((line, index) => ({
      line,
      premium: index === lines.length - 1 ? 100 - (premiumPerLine * (lines.length - 1)) : premiumPerLine,
      trend: 'stable' as GrowthTrend
    }));
  }
};