import React from 'react';
import { ChevronRight, ArrowLeft, Home, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Breadcrumb item interface
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// Current context interface
export interface NavigationContext {
  assessmentTitle: string;
  sectionNumber: number;
  sectionTitle: string;
  questionNumber?: number;
  questionTitle?: string;
  sectionProgress?: number; // 0-100
  totalQuestions?: number;
  completedQuestions?: number;
}

export interface BreadcrumbNavigationLegoBlockProps {
  context: NavigationContext;
  onNavigateToHome?: () => void;
  onNavigateToSection?: (sectionNumber: number) => void;
  onNavigateToQuestion?: (questionNumber: number) => void;
  className?: string;
  showProgress?: boolean;
  mobileCollapse?: boolean;
}

/**
 * BreadcrumbNavigationLegoBlock - Context-aware navigation breadcrumbs
 * 
 * Features:
 * - Hierarchical navigation path display
 * - Clickable breadcrumbs for quick navigation
 * - Current location highlighting
 * - Question number and title display
 * - Section completion percentage
 * - Responsive design with mobile collapse
 * - Icons for different navigation levels
 */
export default function BreadcrumbNavigationLegoBlock({
  context,
  onNavigateToHome,
  onNavigateToSection,
  onNavigateToQuestion,
  className = '',
  showProgress = true,
  mobileCollapse = true
}: BreadcrumbNavigationLegoBlockProps) {
  
  // Build breadcrumb items based on context
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: 'home',
        label: context.assessmentTitle,
        onClick: onNavigateToHome,
        icon: Home
      }
    ];

    // Add section breadcrumb
    breadcrumbs.push({
      id: 'section',
      label: `Section ${context.sectionNumber}: ${context.sectionTitle}`,
      onClick: () => onNavigateToSection?.(context.sectionNumber),
      icon: BarChart3
    });

    // Add question breadcrumb if we're on a specific question
    if (context.questionNumber && context.questionTitle) {
      breadcrumbs.push({
        id: 'question',
        label: `Q${context.questionNumber}: ${context.questionTitle}`,
        onClick: () => onNavigateToQuestion?.(context.questionNumber!),
        isActive: true
      });
    } else {
      // Mark section as active if no specific question
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Handle breadcrumb click
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.onClick && !item.isActive) {
      item.onClick();
    }
  };

  // Mobile back button for collapsed view
  const renderMobileBack = () => {
    const previousItem = breadcrumbs[breadcrumbs.length - 2];
    if (!previousItem) return null;

    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        onClick={() => handleBreadcrumbClick(previousItem)}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-medium">Back to {previousItem.label.split(':')[0]}</span>
      </Button>
    );
  };

  // Desktop breadcrumbs
  const renderDesktopBreadcrumbs = () => (
    <nav className="flex items-center space-x-1 text-sm">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={item.id}>
            <div
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
                item.isActive 
                  ? "text-[#005DAA] font-medium bg-blue-50" 
                  : item.onClick 
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer" 
                    : "text-gray-500"
              )}
              onClick={() => handleBreadcrumbClick(item)}
            >
              {Icon && (
                <Icon className={cn(
                  "h-4 w-4",
                  item.isActive ? "text-[#005DAA]" : "text-gray-400"
                )} />
              )}
              <span className={cn(
                "truncate max-w-[200px]",
                item.isActive && "font-medium"
              )}>
                {item.label}
              </span>
            </div>
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("w-full border-b bg-white", className)}>
      <div className="px-4 py-3 space-y-3">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          {/* Mobile View */}
          {mobileCollapse && (
            <div className="flex md:hidden w-full">
              {renderMobileBack()}
            </div>
          )}
          
          {/* Desktop View */}
          <div className={cn(
            "w-full",
            mobileCollapse ? "hidden md:flex" : "flex"
          )}>
            {renderDesktopBreadcrumbs()}
          </div>
        </div>

        {/* Progress Section */}
        {showProgress && context.sectionProgress !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Progress Bar */}
              <div className="flex-1 max-w-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Section Progress</span>
                  <span className="text-xs font-medium text-gray-900">
                    {context.completedQuestions || 0} of {context.totalQuestions || 0} questions
                  </span>
                </div>
                <Progress 
                  value={context.sectionProgress} 
                  className="h-2"
                />
              </div>

              {/* Progress Badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center space-x-1",
                  context.sectionProgress >= 100 ? "border-green-500 text-green-700 bg-green-50" :
                  context.sectionProgress >= 50 ? "border-blue-500 text-blue-700 bg-blue-50" :
                  "border-gray-500 text-gray-700 bg-gray-50"
                )}
              >
                <span>{Math.round(context.sectionProgress)}%</span>
                {context.sectionProgress >= 100 && (
                  <span className="text-green-600">Complete</span>
                )}
              </Badge>
            </div>
          </div>
        )}

        {/* Current Question Context (if applicable) */}
        {context.questionNumber && context.questionTitle && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Question {context.questionNumber}
                  </Badge>
                  {context.totalQuestions && (
                    <span className="text-xs text-gray-500">
                      of {context.totalQuestions}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mt-1 leading-tight">
                  {context.questionTitle}
                </h3>
              </div>
              
              {/* Question Progress Indicator */}
              {context.totalQuestions && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Progress</div>
                  <div className="text-sm font-medium text-gray-900">
                    {Math.round((context.questionNumber / context.totalQuestions) * 100)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}