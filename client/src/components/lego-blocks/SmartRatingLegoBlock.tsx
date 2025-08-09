import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  Info, 
  Star, 
  TrendingUp, 
  Shield, 
  Target,
  Award,
  Zap,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';

export type SmartRatingVariant = 'descriptive' | 'stars' | 'maturity' | 'capability';
export type SmartRatingSize = 'sm' | 'md' | 'lg';

export interface RatingOption {
  value: number;
  label: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface SmartRatingLegoBlockProps {
  /** Question data including text and help text */
  question: {
    id: string;
    questionText: string;
    helpText?: string;
    isRequired?: boolean;
  };
  /** Current selected value */
  value: number | null;
  /** Change handler */
  onChange: (value: number) => void;
  /** Rating variant determines the style and options */
  variant?: SmartRatingVariant;
  /** Component size */
  size?: SmartRatingSize;
  /** Show numerical score values */
  showScore?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Error message */
  error?: string;
  /** Minimum value (default: 1) */
  minValue?: number;
  /** Maximum value (default: 5) */
  maxValue?: number;
}

// Rating configuration for each variant
const RATING_CONFIGS: Record<SmartRatingVariant, (min: number, max: number) => RatingOption[]> = {
  descriptive: (min, max) => [
    { value: 1, label: 'Poor', description: 'Significantly below expectations', icon: <Circle className="h-4 w-4" />, color: 'text-red-600' },
    { value: 2, label: 'Fair', description: 'Below expectations with room for improvement', icon: <Circle className="h-4 w-4" />, color: 'text-orange-600' },
    { value: 3, label: 'Good', description: 'Meets expectations adequately', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-yellow-600' },
    { value: 4, label: 'Very Good', description: 'Exceeds expectations in most areas', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-blue-600' },
    { value: 5, label: 'Excellent', description: 'Significantly exceeds expectations', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' }
  ].slice(min - 1, max),

  stars: (min, max) => [
    { value: 1, label: '1 Star', description: 'Very poor quality or performance', icon: <Star className="h-4 w-4" />, color: 'text-red-600' },
    { value: 2, label: '2 Stars', description: 'Below average quality or performance', icon: <Star className="h-4 w-4" />, color: 'text-orange-600' },
    { value: 3, label: '3 Stars', description: 'Average quality or performance', icon: <Star className="h-4 w-4" />, color: 'text-yellow-600' },
    { value: 4, label: '4 Stars', description: 'Above average quality or performance', icon: <Star className="h-4 w-4" />, color: 'text-blue-600' },
    { value: 5, label: '5 Stars', description: 'Exceptional quality or performance', icon: <Star className="h-4 w-4" />, color: 'text-green-600' }
  ].slice(min - 1, max),

  maturity: (min, max) => [
    { value: 1, label: 'Initial', description: 'Ad-hoc processes, limited awareness', icon: <Circle className="h-4 w-4" />, color: 'text-red-600' },
    { value: 2, label: 'Developing', description: 'Basic processes defined, some implementation', icon: <TrendingUp className="h-4 w-4" />, color: 'text-orange-600' },
    { value: 3, label: 'Defined', description: 'Standardized processes, consistent implementation', icon: <Target className="h-4 w-4" />, color: 'text-yellow-600' },
    { value: 4, label: 'Managed', description: 'Measured processes, continuous improvement', icon: <Shield className="h-4 w-4" />, color: 'text-blue-600' },
    { value: 5, label: 'Optimized', description: 'Continuously improving, industry best practice', icon: <Award className="h-4 w-4" />, color: 'text-green-600' }
  ].slice(min - 1, max),

  capability: (min, max) => [
    { value: 1, label: 'None', description: 'No current capability or readiness', icon: <Circle className="h-4 w-4" />, color: 'text-red-600' },
    { value: 2, label: 'Limited', description: 'Basic capability with significant gaps', icon: <Circle className="h-4 w-4" />, color: 'text-orange-600' },
    { value: 3, label: 'Moderate', description: 'Adequate capability for current needs', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-yellow-600' },
    { value: 4, label: 'Strong', description: 'Well-developed capability with minor gaps', icon: <Zap className="h-4 w-4" />, color: 'text-blue-600' },
    { value: 5, label: 'Advanced', description: 'Leading capability, ready for innovation', icon: <Award className="h-4 w-4" />, color: 'text-green-600' }
  ].slice(min - 1, max)
};

/**
 * SmartRatingLegoBlock - Enhanced dropdown-style rating component
 * 
 * Replaces ScoreSliderLegoBlock with better UX featuring:
 * - Dropdown selector with descriptive labels
 * - 4 variants: descriptive, stars, maturity, capability
 * - Icons, labels, descriptions, and score values
 * - Mobile-friendly with keyboard navigation
 * - Full accessibility support
 */
export const SmartRatingLegoBlock: React.FC<SmartRatingLegoBlockProps> = ({
  question,
  value,
  onChange,
  variant = 'descriptive',
  size = 'md',
  showScore = true,
  disabled = false,
  className = '',
  error,
  minValue = 1,
  maxValue = 5
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get rating options for the current variant
  const options = RATING_CONFIGS[variant](minValue, maxValue);
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(value ? options.findIndex(opt => opt.value === value) : 0);
        } else if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex(prev => prev <= 0 ? options.length - 1 : prev - 1);
        }
        break;
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 text-sm px-3',
      dropdown: 'py-1',
      option: 'px-3 py-2 text-sm',
      icon: 'h-3 w-3',
      chevron: 'h-3 w-3'
    },
    md: {
      button: 'h-10 text-sm px-4',
      dropdown: 'py-2',
      option: 'px-4 py-3 text-sm',
      icon: 'h-4 w-4',
      chevron: 'h-4 w-4'
    },
    lg: {
      button: 'h-12 text-base px-5',
      dropdown: 'py-3',
      option: 'px-5 py-4 text-base',
      icon: 'h-5 w-5',
      chevron: 'h-5 w-5'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('w-full space-y-6', className)} ref={dropdownRef}>
      {/* Question Header */}
      {question && (
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-900">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.helpText && (
            <p className="text-sm text-gray-600">{question.helpText}</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Rating Component */}
      <div className="space-y-4">
        <Label className={cn(
          "font-medium text-gray-700",
          question.isRequired && "after:content-['*'] after:text-red-500 after:ml-1"
        )}>
          {question.questionText}
        </Label>
        
        {question.helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{question.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Dropdown Button */}
      <div className="relative">
        <Button
          ref={buttonRef}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full justify-between",
            config.button,
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "border-[#005DAA] ring-1 ring-[#005DAA]"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={error ? `${question.id}-error` : undefined}
        >
          <div className="flex items-center space-x-3">
            {selectedOption ? (
              <>
                <span className={cn(config.icon, selectedOption.color)}>
                  {selectedOption.icon}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{selectedOption.label}</span>
                  {showScore && (
                    <span className="text-xs bg-[#E6F2FF] text-[#005DAA] px-2 py-1 rounded">
                      {selectedOption.value}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-gray-500">Select a rating...</span>
            )}
          </div>
          <ChevronDown className={cn(
            config.chevron,
            "text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={cn(
            "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg",
            config.dropdown
          )}>
            <div
              role="listbox"
              aria-label={question.questionText}
              className="max-h-60 overflow-auto"
            >
              {options.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className={cn(
                    "cursor-pointer transition-colors",
                    config.option,
                    "flex items-start space-x-3",
                    index === focusedIndex && "bg-[#E6F2FF]",
                    value === option.value && "bg-blue-50 border-l-4 border-[#005DAA]",
                    "hover:bg-gray-50"
                  )}
                  onClick={() => handleOptionSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <span className={cn(config.icon, option.color, "mt-0.5 flex-shrink-0")}>
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {showScore && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">
                          {option.value}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${question.id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default SmartRatingLegoBlock;