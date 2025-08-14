import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Play } from 'lucide-react';

interface QuestionnaireWithProgress {
  definition: {
    id: string;
    title: string;
    description?: string;
  };
  session?: {
    id: string;
    questionnaireId: string;
    title: string;
    status: string;
    progressPercent: number;
    completedAt: string | null;
    updatedAt: string;
    isCompleted: boolean;
  };
  status: string;
  progressPercent: number;
  isStarted: boolean;
  isCompleted: boolean;
}

interface AssessmentSideMenuProps {
  questionnaires: QuestionnaireWithProgress[];
  selectedId: string | null;
  onSelect: (questionnaireId: string) => void;
  onSaveBeforeSwitch?: () => Promise<void>;
}

function QuestionnaireCard({ 
  questionnaire, 
  isSelected, 
  onSelect,
  onSaveBeforeSwitch 
}: {
  questionnaire: QuestionnaireWithProgress;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onSaveBeforeSwitch?: () => Promise<void>;
}) {
  const { definition, status, progressPercent, isCompleted } = questionnaire;
  
  const handleClick = async () => {
    if (isSelected) return; // Don't allow clicking on selected item
    
    // Save current progress before switching
    if (onSaveBeforeSwitch) {
      await onSaveBeforeSwitch();
    }
    
    onSelect(definition.id);
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (progressPercent > 0) return <Clock className="h-4 w-4 text-blue-600" />;
    return <Play className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    }
    if (progressPercent > 0) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{progressPercent}%</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Not Started</Badge>;
  };

  return (
    <Button
      variant={isSelected ? "default" : "ghost"}
      className={cn(
        "w-full h-auto p-3 justify-start text-left",
        isSelected && "bg-blue-600 text-white hover:bg-blue-700",
        !isSelected && "hover:bg-gray-50",
        isSelected && "cursor-default" // Make selected item non-clickable
      )}
      onClick={handleClick}
      disabled={isSelected}
    >
      <div className="flex flex-col items-start w-full space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium text-sm truncate">{definition.title}</span>
          </div>
        </div>
        <div className="flex justify-end w-full">
          {getStatusBadge()}
        </div>
      </div>
    </Button>
  );
}

export default function AssessmentSideMenu({ 
  questionnaires, 
  selectedId, 
  onSelect,
  onSaveBeforeSwitch 
}: AssessmentSideMenuProps) {
  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Available Assessments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 p-4 pt-0">
            {questionnaires.map((questionnaire) => (
              <QuestionnaireCard
                key={questionnaire.definition.id}
                questionnaire={questionnaire}
                isSelected={selectedId === questionnaire.definition.id}
                onSelect={onSelect}
                onSaveBeforeSwitch={onSaveBeforeSwitch}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}