import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStatusLegoBlockProps {
  status: 'saving' | 'saved' | 'error' | 'idle';
  lastSaved?: Date | null;
  className?: string;
}

/**
 * LEGO Block: Progress Status Display
 * Reusable component for showing save status across all assessment forms
 */
export function ProgressStatusLegoBlock({ 
  status, 
  lastSaved, 
  className 
}: ProgressStatusLegoBlockProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Clock,
          text: 'Saving...',
          className: 'text-yellow-600'
        };
      case 'saved':
        return {
          icon: CheckCircle2,
          text: lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Saved',
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