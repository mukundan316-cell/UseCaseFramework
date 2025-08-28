import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateROIExplanation } from "@shared/utils/roiExplanations";

interface ROIBadgeProps {
  impactScore: number;
  effortScore: number;
  quadrant: string;
  className?: string;
  showTooltip?: boolean;
}

export function ROIBadge({ 
  impactScore, 
  effortScore, 
  quadrant, 
  className = "",
  showTooltip = true
}: ROIBadgeProps) {
  const explanation = generateROIExplanation(impactScore, effortScore, quadrant);
  
  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'High ROI': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
      case 'Medium ROI': return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
      case 'Low ROI': return 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200';
      case 'Poor ROI': return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    }
  };

  const badge = (
    <Badge 
      variant="outline" 
      className={`${getBadgeColor(explanation.level)} ${className} cursor-help border`}
      data-testid={`roi-badge-${explanation.level.toLowerCase().replace(' ', '-')}`}
    >
      {explanation.level}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3" side="top">
          <div className="space-y-2">
            <p className="font-medium text-sm">{explanation.level}</p>
            <p className="text-xs">{explanation.summary}</p>
            <div className="text-xs text-gray-600 pt-1 border-t">
              <strong>Timeframe:</strong> {explanation.timeframe}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple text-based ROI indicator for cases where badge styling isn't needed
 */
export function ROIIndicator({ impactScore, effortScore, quadrant }: Omit<ROIBadgeProps, 'className' | 'showTooltip'>) {
  const explanation = generateROIExplanation(impactScore, effortScore, quadrant);
  return <span className="text-sm font-medium">{explanation.level}</span>;
}