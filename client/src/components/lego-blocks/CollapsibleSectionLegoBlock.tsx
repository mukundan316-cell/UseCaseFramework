import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface CollapsibleSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  filledCount?: number;
  totalCount?: number;
  colorScheme?: 'gray' | 'blue' | 'green' | 'purple' | 'orange';
  children: React.ReactNode;
  className?: string;
}

const colorSchemes = {
  gray: {
    bg: 'bg-gray-50/50',
    border: 'border-gray-100',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  blue: {
    bg: 'bg-blue-50/50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50/50',
    border: 'border-green-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-50/50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-50/50',
    border: 'border-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
};

function CollapsibleSectionItem({
  id,
  icon: Icon,
  title,
  description,
  filledCount,
  totalCount,
  colorScheme = 'gray',
  children,
  className,
}: CollapsibleSectionProps) {
  const colors = colorSchemes[colorScheme];
  const showCompletion = filledCount !== undefined && totalCount !== undefined;
  const completionText = showCompletion ? `${filledCount} of ${totalCount}` : null;
  const isComplete = showCompletion && filledCount === totalCount && totalCount > 0;
  const isEmpty = showCompletion && filledCount === 0;

  return (
    <AccordionItem 
      value={id} 
      className={cn(
        'rounded-lg border overflow-hidden',
        colors.bg,
        colors.border,
        className
      )}
    >
      <AccordionTrigger 
        className="px-4 py-3 hover:no-underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [&[data-state=open]>div>.chevron]:rotate-180"
        data-testid={`accordion-trigger-${id}`}
        aria-label={`${title}${showCompletion ? `, ${filledCount} of ${totalCount} fields filled` : ''}`}
      >
        <div className="flex items-center justify-between w-full" role="heading" aria-level={3}>
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', colors.iconBg)} aria-hidden="true">
              <Icon className={cn('h-4 w-4', colors.iconColor)} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900">{title}</span>
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showCompletion && (
              <span 
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  isComplete ? 'bg-green-100 text-green-700' :
                  isEmpty ? 'bg-gray-100 text-gray-500' :
                  'bg-blue-100 text-blue-700'
                )}
                data-testid={`completion-indicator-${id}`}
                aria-hidden="true"
              >
                {completionText}
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

export interface CollapsibleSectionsContainerProps {
  expandedSections: string[];
  onExpandedChange: (sections: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

function CollapsibleSectionsContainer({
  expandedSections,
  onExpandedChange,
  children,
  className,
}: CollapsibleSectionsContainerProps) {
  return (
    <Accordion 
      type="multiple" 
      value={expandedSections}
      onValueChange={onExpandedChange}
      className={cn('space-y-4', className)}
    >
      {children}
    </Accordion>
  );
}

export { CollapsibleSectionItem, CollapsibleSectionsContainer };
export default CollapsibleSectionItem;
