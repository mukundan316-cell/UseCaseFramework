/**
 * Progress Status LEGO Block
 * Shows real-time save status with timestamp and connection indicator
 */

import React from 'react';
import { CheckCircle2, Clock, Wifi, WifiOff, AlertCircle, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProgressStatusLegoBlockProps {
  lastSaved?: string;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  className?: string;
}

/**
 * LEGO Block for displaying real-time progress save status
 */
export default function ProgressStatusLegoBlock({
  lastSaved,
  isSaving = false,
  hasUnsavedChanges = false,
  isOnline = navigator.onLine,
  className
}: ProgressStatusLegoBlockProps) {
  
  const getStatusIcon = () => {
    if (isSaving) {
      return (
        <div className="w-4 h-4 border-2 border-[#005DAA] border-t-transparent rounded-full animate-spin" />
      );
    }
    
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (hasUnsavedChanges) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    
    if (lastSaved) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    
    return <Save className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isSaving) {
      return 'Auto-saving...';
    }
    
    if (!isOnline) {
      return 'Offline - Changes saved locally';
    }
    
    if (hasUnsavedChanges) {
      return 'Saving changes...';
    }
    
    if (lastSaved) {
      return `Last saved: ${lastSaved}`;
    }
    
    return 'Ready to save';
  };

  const getStatusVariant = () => {
    if (isSaving || hasUnsavedChanges) return 'secondary';
    if (!isOnline) return 'destructive';
    if (lastSaved) return 'default';
    return 'outline';
  };

  const getStatusColor = () => {
    if (isSaving) return 'text-[#005DAA]';
    if (!isOnline) return 'text-red-600';
    if (hasUnsavedChanges) return 'text-amber-600';
    if (lastSaved) return 'text-green-600';
    return 'text-gray-500';
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={cn("text-sm font-medium", getStatusColor())}>
          {getStatusText()}
        </span>
      </div>
      
      {/* Connection indicator */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        <Badge 
          variant={isOnline ? 'default' : 'destructive'}
          className="text-xs px-1"
        >
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>
    </div>
  );
}