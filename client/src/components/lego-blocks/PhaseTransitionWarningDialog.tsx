import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, ArrowRight, AlertTriangle, Layers } from 'lucide-react';
import type { PhaseTransitionInfo } from '@shared/tom';
import { getRequirementLabel } from '@shared/tom';

interface PhaseTransitionWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transitionInfo: PhaseTransitionInfo;
  onProceed: (reason: string) => void;
  onCancel: () => void;
}

export default function PhaseTransitionWarningDialog({
  open,
  onOpenChange,
  transitionInfo,
  onProceed,
  onCancel
}: PhaseTransitionWarningDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleProceed = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for proceeding without completing exit requirements');
      return;
    }
    setError(null);
    onProceed(reason.trim());
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    setError(null);
    onCancel();
  };

  const fromPhaseName = transitionInfo.fromPhase?.name || transitionInfo.fromPhaseId || 'Unknown';
  const toPhaseName = transitionInfo.toPhase?.name || transitionInfo.toPhaseId || 'Unknown';
  const fromPhaseColor = transitionInfo.fromPhase?.color || '#6B7280';
  const toPhaseColor = transitionInfo.toPhase?.color || '#6B7280';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg" data-testid="phase-transition-warning-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Phase Transition - Incomplete Exit Requirements
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                This change will move the use case to a new phase, but exit requirements 
                for the current phase are not complete. Please review and provide a reason 
                for proceeding.
              </p>

              <div className="flex items-center justify-center gap-3 py-3">
                <Badge 
                  className="font-medium text-white"
                  style={{ backgroundColor: fromPhaseColor }}
                  data-testid="phase-from-badge"
                >
                  <Layers className="h-3 w-3 mr-1" />
                  {fromPhaseName}
                </Badge>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <Badge 
                  className="font-medium text-white"
                  style={{ backgroundColor: toPhaseColor }}
                  data-testid="phase-to-badge"
                >
                  <Layers className="h-3 w-3 mr-1" />
                  {toPhaseName}
                </Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Exit Requirements for {fromPhaseName}
                </p>
                
                {transitionInfo.exitRequirementsMet.length > 0 && (
                  <div className="space-y-1">
                    {transitionInfo.exitRequirementsMet.map(req => (
                      <div 
                        key={req} 
                        className="flex items-center gap-2 text-sm text-green-600"
                        data-testid={`exit-req-met-${req}`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{getRequirementLabel(req)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {transitionInfo.exitRequirementsPending.length > 0 && (
                  <div className="space-y-1">
                    {transitionInfo.exitRequirementsPending.map(req => (
                      <div 
                        key={req} 
                        className="flex items-center gap-2 text-sm text-amber-600"
                        data-testid={`exit-req-pending-${req}`}
                      >
                        <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{getRequirementLabel(req)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transition-reason" className="text-sm font-medium">
                  Reason for Proceeding <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="transition-reason"
                  placeholder="Explain why you are proceeding without completing exit requirements..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError(null);
                  }}
                  className={error ? 'border-destructive' : ''}
                  rows={3}
                  data-testid="input-transition-reason"
                />
                {error && (
                  <p className="text-xs text-destructive" data-testid="transition-reason-error">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} data-testid="button-cancel-transition">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleProceed}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-proceed-transition"
          >
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
