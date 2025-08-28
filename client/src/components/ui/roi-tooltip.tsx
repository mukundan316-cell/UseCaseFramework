import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { generateROIExplanation, getWeightImpactExplanation, getQuadrantThresholdExplanation } from "@shared/utils/roiExplanations";

interface ROITooltipProps {
  type: 'weight' | 'threshold' | 'quadrant' | 'formula';
  leverName?: string;
  weight?: number;
  threshold?: number;
  impactScore?: number;
  effortScore?: number;
  quadrant?: string;
  className?: string;
}

export function ROITooltip({ 
  type, 
  leverName, 
  weight, 
  threshold, 
  impactScore, 
  effortScore, 
  quadrant, 
  className = "" 
}: ROITooltipProps) {
  const getTooltipContent = () => {
    switch (type) {
      case 'weight':
        return leverName && weight !== undefined 
          ? getWeightImpactExplanation(leverName, weight)
          : 'Weight determines this factor\'s influence on ROI calculations';
      
      case 'threshold':
        return threshold !== undefined 
          ? getQuadrantThresholdExplanation(threshold)
          : 'Threshold determines ROI categorization boundaries';
      
      case 'quadrant':
        if (impactScore && effortScore && quadrant) {
          const explanation = generateROIExplanation(impactScore, effortScore, quadrant);
          return `${explanation.level}: ${explanation.summary}`;
        }
        return 'Quadrant position indicates ROI potential and implementation strategy';
      
      case 'formula':
        return 'ROI = Impact ÷ Effort. Higher impact with lower effort = better ROI';
      
      default:
        return 'Additional information about ROI calculation';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help ${className}`} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ROIExplanationPanelProps {
  impactScore: number;
  effortScore: number;
  quadrant: string;
}

export function ROIExplanationPanel({ impactScore, effortScore, quadrant }: ROIExplanationPanelProps) {
  const explanation = generateROIExplanation(impactScore, effortScore, quadrant);
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High ROI': return 'text-green-700 bg-green-50';
      case 'Medium ROI': return 'text-yellow-700 bg-yellow-50';
      case 'Low ROI': return 'text-orange-700 bg-orange-50';
      case 'Poor ROI': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white space-y-3">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-600" />
        <div className={`px-2 py-1 rounded text-sm font-medium ${getLevelColor(explanation.level)}`}>
          {explanation.level}
        </div>
      </div>
      
      <p className="text-sm text-gray-700">{explanation.summary}</p>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600">Key Factors:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          {explanation.factors.map((factor, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-blue-600 mt-1">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
        <span><strong>Timeframe:</strong> {explanation.timeframe}</span>
      </div>
      
      <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
        <strong>Recommendation:</strong> {explanation.recommendation}
      </div>
    </div>
  );
}