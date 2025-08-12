import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStatusLegoBlockProps {
  status?: 'saving' | 'saved' | 'error' | 'idle';
  lastSaved?: Date | string | null;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  className?: string;
}

/**
 * LEGO Block: Progress Status Display
 * Reusable component for showing save status across all assessment forms
 */
export function ProgressStatusLegoBlock({ 
  status,
  lastSaved, 
  isSaving = false,
  hasUnsavedChanges = false,
  className 
}: ProgressStatusLegoBlockProps) {
  // Derive status from props if not explicitly provided
  const derivedStatus = status || (isSaving ? 'saving' : (hasUnsavedChanges ? 'idle' : 'saved'));
  const getStatusDisplay = () => {
    switch (derivedStatus) {
      case 'saving':
        return {
          icon: Clock,
          text: 'Saving...',
          className: 'text-yellow-600'
        };
      case 'saved':
        const formatLastSaved = () => {
          if (!lastSaved) return 'Saved';
          if (typeof lastSaved === 'string') return `Saved ${lastSaved}`;
          if (lastSaved instanceof Date) return `Saved ${lastSaved.toLocaleTimeString()}`;
          return 'Saved';
        };
        return {
          icon: CheckCircle2,
          text: formatLastSaved(),
          className: 'text-green-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          className: 'text-red-600'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();
  
  if (!statusDisplay) return null;

  const Icon = statusDisplay.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 text-sm',
      statusDisplay.className,
      className
    )}>
      <Icon size={16} />
      <span>{statusDisplay.text}</span>
    </div>
  );
}