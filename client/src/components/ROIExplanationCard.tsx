import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, Clock, Target } from "lucide-react";
import { generateROIExplanation } from "@shared/utils/roiExplanations";

interface ROIExplanationCardProps {
  impactScore: number;
  effortScore: number;
  quadrant: string;
  className?: string;
}

export function ROIExplanationCard({ 
  impactScore, 
  effortScore, 
  quadrant, 
  className = "" 
}: ROIExplanationCardProps) {
  const explanation = generateROIExplanation(impactScore, effortScore, quadrant);
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High ROI': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium ROI': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low ROI': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Poor ROI': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span>ROI Analysis</span>
          </div>
          <Badge className={`${getLevelColor(explanation.level)} border`}>
            {explanation.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{explanation.summary}</p>
        
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Key Factors
          </h4>
          <ul className="text-xs text-gray-600 space-y-1 ml-4">
            {explanation.factors.slice(0, 3).map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{explanation.timeframe}</span>
          </div>
        </div>
        
        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
          <div className="flex items-start gap-1">
            <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span><strong>Strategy:</strong> {explanation.recommendation}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}