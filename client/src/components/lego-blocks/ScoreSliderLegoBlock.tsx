import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { APP_CONFIG } from '@shared/constants/app-config';

interface ScoreSliderLegoBlockProps {
  label: string;
  field: string;
  value: number;
  onChange: (field: string, value: number) => void;
  tooltip?: string;
  leftLabel?: string;
  rightLabel?: string;
  minValue?: number;
  maxValue?: number;
  disabled?: boolean;
  showTooltip?: boolean;
  valueDisplay?: 'badge' | 'inline' | 'none';
  className?: string;
}

export const ScoreSliderLegoBlock: React.FC<ScoreSliderLegoBlockProps> = ({
  label,
  field,
  value,
  onChange,
  tooltip,
  leftLabel = "Low",
  rightLabel = "High", 
  minValue = APP_CONFIG.SCORING.MIN_SCORE,
  maxValue = APP_CONFIG.SCORING.MAX_SCORE,
  disabled = false,
  showTooltip = true,
  valueDisplay = 'badge',
  className = ''
}) => {
  const handleValueChange = (newValues: number[]) => {
    onChange(field, newValues[0]);
  };

  const renderValueDisplay = () => {
    switch (valueDisplay) {
      case 'badge':
        return (
          <span className="font-semibold text-[#3C2CDA] bg-[#E6F2FF] px-2 py-1 rounded">
            {value}
          </span>
        );
      case 'inline':
        return (
          <span className="font-semibold text-purple-600">{value}</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-base font-semibold text-gray-900">{label}</Label>
        <div className="flex items-center space-x-2">
          {showTooltip && tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {valueDisplay !== 'none' && renderValueDisplay()}
        </div>
      </div>

      {/* Slider with labels */}
      {leftLabel && rightLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{leftLabel}</span>
          <span className="text-sm text-gray-600">{rightLabel}</span>
        </div>
      )}

      <Slider
        value={[value]}
        onValueChange={handleValueChange}
        min={minValue}
        max={maxValue}
        step={1}
        disabled={disabled}
        data-testid={`slider-${field}`}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
};