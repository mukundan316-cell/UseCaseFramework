import React from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './loading-spinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSpinner?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  className,
  showSpinner = true
}) => {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center space-y-2 p-4',
        className
      )}
      data-testid="loading-state"
    >
      {showSpinner && <LoadingSpinner size={size} />}
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

export default LoadingState;