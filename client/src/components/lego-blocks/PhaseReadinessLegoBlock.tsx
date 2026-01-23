import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Layers } from 'lucide-react';
import { 
  TomPhase, 
  PhaseReadinessResult, 
  getRequirementLabel 
} from '@shared/tom';

interface PhaseReadinessLegoBlockProps {
  readiness: PhaseReadinessResult;
  onTabChange?: (tab: string) => void;
  compact?: boolean;
}

export default function PhaseReadinessLegoBlock({
  readiness,
  onTabChange,
  compact = false
}: PhaseReadinessLegoBlockProps) {
  const { 
    currentPhase, 
    nextPhase, 
    entryRequirementsMet,
    entryRequirementsPending,
    exitRequirementsMet,
    exitRequirementsPending,
    readinessPercent,
    canProgress 
  } = readiness;

  if (!currentPhase) {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
        data-testid="phase-readiness-unphased"
      >
        <Layers className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Unphased - Assign owner to enter TOM lifecycle</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div 
        className="flex items-center gap-3"
        data-testid="phase-readiness-compact"
      >
        <Badge 
          variant="outline" 
          className="font-medium"
          style={{ 
            borderColor: currentPhase.color, 
            color: currentPhase.color,
            backgroundColor: `${currentPhase.color}10`
          }}
          data-testid="phase-readiness-badge"
        >
          <Layers className="h-3 w-3 mr-1" />
          {currentPhase.name}
        </Badge>
        <div className="flex items-center gap-2">
          <Progress 
            value={readinessPercent} 
            className="w-20 h-2"
            data-testid="phase-readiness-progress"
          />
          <span className="text-xs text-muted-foreground">{readinessPercent}%</span>
        </div>
        {canProgress && nextPhase && (
          <Badge variant="secondary" className="text-xs" data-testid="phase-readiness-can-progress">
            <ArrowRight className="h-3 w-3 mr-1" />
            Ready for {nextPhase.name}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div 
      className="space-y-4 p-4 bg-muted/30 rounded-lg border"
      data-testid="phase-readiness-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            className="font-medium text-white"
            style={{ backgroundColor: currentPhase.color }}
            data-testid="phase-readiness-current-phase"
          >
            <Layers className="h-3 w-3 mr-1" />
            {currentPhase.name} Phase
          </Badge>
          {nextPhase && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Next: {nextPhase.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Progress 
            value={readinessPercent} 
            className="w-24 h-2"
          />
          <span className="text-sm font-medium">{readinessPercent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Entry Requirements
          </p>
          <div className="space-y-1">
            {entryRequirementsMet.map(req => (
              <div 
                key={req} 
                className="flex items-center gap-2 text-sm text-green-600"
                data-testid={`requirement-met-${req}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{getRequirementLabel(req)}</span>
              </div>
            ))}
            {entryRequirementsPending.map(req => (
              <div 
                key={req} 
                className="flex items-center gap-2 text-sm text-muted-foreground"
                data-testid={`requirement-pending-${req}`}
              >
                <Circle className="h-3.5 w-3.5" />
                <span>{getRequirementLabel(req)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Exit Requirements
          </p>
          <div className="space-y-1">
            {exitRequirementsMet.map(req => (
              <div 
                key={req} 
                className="flex items-center gap-2 text-sm text-green-600"
                data-testid={`requirement-met-${req}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{getRequirementLabel(req)}</span>
              </div>
            ))}
            {exitRequirementsPending.map(req => (
              <button 
                key={req}
                onClick={() => onTabChange?.(readiness.recommendedTab)}
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                data-testid={`requirement-pending-${req}`}
              >
                <Circle className="h-3.5 w-3.5" />
                <span>{getRequirementLabel(req)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {canProgress && nextPhase && (
        <div 
          className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md text-sm"
          data-testid="phase-readiness-progress-ready"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Ready to progress to <strong>{nextPhase.name}</strong> phase</span>
        </div>
      )}

      {!canProgress && exitRequirementsPending.length > 0 && (
        <div 
          className="flex items-center gap-2 p-2 bg-amber-50 text-amber-700 rounded-md text-sm"
          data-testid="phase-readiness-guidance"
        >
          <Circle className="h-4 w-4" />
          <span>
            Complete {exitRequirementsPending.map(r => getRequirementLabel(r)).join(', ')} to progress
          </span>
        </div>
      )}
    </div>
  );
}
