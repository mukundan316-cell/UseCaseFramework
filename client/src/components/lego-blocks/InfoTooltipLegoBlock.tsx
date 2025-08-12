import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';

interface InfoTooltipLegoBlockProps {
  content: string;
  icon?: 'info' | 'help' | 'alert';
  iconSize?: 'sm' | 'md' | 'lg';
  iconColor?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  className?: string;
}

export const InfoTooltipLegoBlock: React.FC<InfoTooltipLegoBlockProps> = ({
  content,
  icon = 'info',
  iconSize = 'sm',
  iconColor = 'text-gray-400',
  position = 'top',
  maxWidth = 'max-w-xs',
  className = ''
}) => {
  const getIconComponent = () => {
    const sizeClass = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }[iconSize];

    const iconProps = {
      className: `${sizeClass} ${iconColor} cursor-help ${className}`
    };

    switch (icon) {
      case 'help':
        return <HelpCircle {...iconProps} />;
      case 'alert':
        return <AlertCircle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {getIconComponent()}
        </TooltipTrigger>
        <TooltipContent side={position}>
          <p className={maxWidth}>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};