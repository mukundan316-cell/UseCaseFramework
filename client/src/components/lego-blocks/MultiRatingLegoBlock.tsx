import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Rating item interface
export interface RatingItem {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  helpText?: string;
}

// Rating values interface
export interface RatingValues {
  [itemId: string]: number;
}

// Component value interface (includes ratings and additional context)
export interface MultiRatingValue {
  ratings: RatingValues;
  additionalContext?: string;
}

// Component props interface
export interface MultiRatingLegoBlockProps {
  /** Array of items to rate */
  items: RatingItem[];
  /** Current rating values */
  value: MultiRatingValue;
  /** Change handler */
  onChange: (value: MultiRatingValue) => void;
  /** Rating scale minimum (default: 1) */
  minRating?: number;
  /** Rating scale maximum (default: 5) */
  maxRating?: number;
  /** Scale labels (e.g., ["Behind", "Leading"]) */
  scaleLabels?: [string, string];
  /** Question label */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional context prompt */
  contextPrompt?: string;
  /** Allow additional context */
  allowContext?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MultiRatingLegoBlock - Reusable component for multiple rating scales with context
 * 
 * Features:
 * - Multiple rating items in one component
 * - Visual star-based rating system
 * - Scale labels (e.g., "Behind" to "Leading")
 * - Optional additional context textarea
 * - Individual item validation
 * - Responsive design
 * - LEGO-style props-based configuration
 */
export const MultiRatingLegoBlock: React.FC<MultiRatingLegoBlockProps> = ({
  items = [],
  value = { ratings: {}, additionalContext: '' },
  onChange,
  minRating = 1,
  maxRating = 5,
  scaleLabels = ['Poor', 'Excellent'],
  label,
  helpText,
  required = false,
  disabled = false,
  contextPrompt = 'Additional context and notes:',
  allowContext = true,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState<MultiRatingValue>(value);

  // Update local value when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle rating change for specific item
  const handleRatingChange = useCallback((itemId: string, rating: number) => {
    const updatedRatings = {
      ...localValue.ratings,
      [itemId]: rating
    };
    
    const updatedValue = {
      ...localValue,
      ratings: updatedRatings
    };
    
    setLocalValue(updatedValue);
    onChange(updatedValue);
  }, [localValue, onChange]);

  // Handle additional context change
  const handleContextChange = useCallback((context: string) => {
    const updatedValue = {
      ...localValue,
      additionalContext: context
    };
    
    setLocalValue(updatedValue);
    onChange(updatedValue);
  }, [localValue, onChange]);

  // Generate rating scale buttons
  const renderRatingScale = (itemId: string, currentRating: number) => {
    const buttons = [];
    
    for (let i = minRating; i <= maxRating; i++) {
      const isSelected = currentRating === i;
      const isActive = currentRating >= i;
      
      buttons.push(
        <Button
          key={i}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => handleRatingChange(itemId, i)}
          disabled={disabled}
          className={cn(
            "w-10 h-10 p-0 transition-all duration-200",
            isSelected && "bg-blue-600 text-white border-blue-600",
            !isSelected && isActive && "bg-blue-50 border-blue-200 text-blue-700",
            !isSelected && !isActive && "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          )}
        >
          {i}
        </Button>
      );
    }
    
    return buttons;
  };

  // Get rating status icon
  const getRatingIcon = (rating: number) => {
    if (rating >= maxRating - 1) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rating <= minRating + 1) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  // Calculate completion stats
  const completedRatings = Object.keys(localValue.ratings).length;
  const requiredRatings = items.filter(item => item.required).length;
  const totalRatings = items.length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
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

      {/* Scale Reference */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-green-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-red-700">{minRating}</span>
          <span className="text-xs text-red-600">{scaleLabels[0]}</span>
        </div>
        
        <div className="flex space-x-1">
          {Array.from({ length: maxRating - minRating + 1 }, (_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-red-300 to-green-300" />
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-green-600">{scaleLabels[1]}</span>
          <span className="text-sm font-medium text-green-700">{maxRating}</span>
        </div>
      </div>

      {/* Rating Items */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const currentRating = localValue.ratings[item.id] || 0;
          const hasRating = currentRating > 0;
          
          return (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                hasRating ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"
              )}
            >
              <div className="space-y-3">
                {/* Item Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <Label className="text-base font-medium text-gray-900">
                        {item.label}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {hasRating && getRatingIcon(currentRating)}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 ml-12">{item.description}</p>
                    )}
                  </div>
                  
                  {hasRating && (
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={currentRating >= 4 ? "default" : currentRating >= 3 ? "secondary" : "destructive"}
                        className="text-sm"
                      >
                        {currentRating}/{maxRating}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Rating Scale */}
                <div className="ml-12">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 w-16">Rate:</span>
                    <div className="flex space-x-1">
                      {renderRatingScale(item.id, currentRating)}
                    </div>
                  </div>
                  
                  {item.helpText && (
                    <p className="text-xs text-gray-500 mt-2">{item.helpText}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Summary */}
      {totalRatings > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Progress: {completedRatings}/{totalRatings} items rated
            </span>
            {requiredRatings > 0 && (
              <span className="text-gray-600">
                Required: {Object.keys(localValue.ratings).filter(id => 
                  items.find(item => item.id === id)?.required
                ).length}/{requiredRatings}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional Context */}
      {allowContext && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {contextPrompt}
          </Label>
          <Textarea
            value={localValue.additionalContext || ''}
            onChange={(e) => handleContextChange(e.target.value)}
            placeholder="Provide additional context, competitive insights, or strategic notes..."
            disabled={disabled}
            className="min-h-[100px] resize-y"
          />
        </div>
      )}
    </div>
  );
};

export default MultiRatingLegoBlock;