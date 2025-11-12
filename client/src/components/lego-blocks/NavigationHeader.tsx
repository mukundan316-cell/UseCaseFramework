import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface NavigationHeaderProps {
  title?: string;
  backTo?: string;
  backLabel?: string;
  showBreadcrumb?: boolean;
  className?: string;
}

/**
 * NavigationHeader LEGO Block
 * Reusable navigation component with back button and breadcrumb
 * LEGO Principle: Single responsibility - handles navigation only
 */
export default function NavigationHeader({
  title = "AI Assessment",
  backTo = "/",
  backLabel = "Back to Dashboard",
  showBreadcrumb = true,
  className = ""
}: NavigationHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setLocation(backTo)}
        className="flex items-center space-x-2 text-gray-600 hover:text-[#3C2CDA] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{backLabel}</span>
      </Button>
      
      {showBreadcrumb && (
        <div className="flex items-center space-x-2 text-gray-500">
          <Home className="h-4 w-4" />
          <span>/</span>
          <span>{title}</span>
        </div>
      )}
    </div>
  );
}