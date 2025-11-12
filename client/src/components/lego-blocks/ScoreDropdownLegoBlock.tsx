import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ScoreDropdownOption {
  value: number;
  label: string;
  description: string;
}

interface ScoreDropdownLegoBlockProps {
  label: string;
  field: string;
  value: number;
  onChange: (field: string, value: number) => void;
  options: ScoreDropdownOption[];
  tooltip?: string;
  disabled?: boolean;
  showTooltip?: boolean;
  valueDisplay?: 'badge' | 'inline' | 'none';
  className?: string;
}

/**
 * LEGO Block: Score Dropdown Component
 * Replaces sliders with clear dropdown options for scoring consistency
 * Following replit.md LEGO principles: "Build Once, Reuse Everywhere"
 */
export const ScoreDropdownLegoBlock: React.FC<ScoreDropdownLegoBlockProps> = ({
  label,
  field,
  value,
  onChange,
  options,
  tooltip,
  disabled = false,
  showTooltip = true,
  valueDisplay = 'badge',
  className = ''
}) => {
  const handleValueChange = (stringValue: string) => {
    const numericValue = parseInt(stringValue, 10);
    if (!isNaN(numericValue)) {
      onChange(field, numericValue);
    }
  };

  const renderValueDisplay = () => {
    const selectedOption = options.find(opt => opt.value === value);
    
    switch (valueDisplay) {
      case 'badge':
        return (
          <span className="font-semibold text-[#3C2CDA] bg-[#E6F2FF] px-2 py-1 rounded text-sm">
            {value}: {selectedOption?.label || 'Unknown'}
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

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? `${selectedOption.value}: ${selectedOption.label}` : value.toString();

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

      <Select 
        value={value.toString()} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className="w-full"
          data-testid={`dropdown-${field}`}
        >
          <SelectValue placeholder={`Select ${label.toLowerCase()}`}>
            {displayValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              <div className="flex flex-col">
                <div className="font-medium">
                  {option.value}: {option.label}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {option.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};