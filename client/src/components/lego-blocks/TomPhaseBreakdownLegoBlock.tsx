import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useEngagement } from '@/contexts/EngagementContext';
import { Target, Loader2 } from 'lucide-react';
import type { TomConfig } from '@shared/tom';

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

interface PhaseSummary {
  enabled: boolean;
  summary: Record<string, number>;
  phases: Array<{ id: string; name: string; color: string; count: number }>;
}

interface TomPhaseBreakdownLegoBlockProps {
  scope?: 'dashboard' | 'all';
}

export default function TomPhaseBreakdownLegoBlock({ scope = 'dashboard' }: TomPhaseBreakdownLegoBlockProps) {
  const { selectedClientId } = useEngagement();
  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', selectedClientId],
  });

  const { data: phaseSummary, isLoading } = useQuery<PhaseSummary>({
    queryKey: [`/api/tom/phase-summary?scope=${scope}`],
    enabled: tomConfig?.enabled === 'true',
  });

  if (!tomConfig || tomConfig.enabled !== 'true') {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  const totalUseCases = phaseSummary?.phases.reduce((sum, p) => sum + p.count, 0) || 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
          <Target className="h-4 w-4" />
          TOM Phase Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {phaseSummary?.phases.map((phase) => {
            const percentage = totalUseCases > 0 ? Math.round((phase.count / totalUseCases) * 100) : 0;
            return (
              <Badge
                key={phase.id}
                variant="outline"
                className="flex items-center gap-2 px-3 py-1.5 text-sm"
                style={{ 
                  borderColor: phase.color, 
                  backgroundColor: hexToRgba(phase.color, 0.1)
                }}
                data-testid={`phase-badge-${phase.id}`}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: phase.color }}
                />
                <span style={{ color: phase.color }} className="font-semibold">
                  {phase.count}
                </span>
                <span className="text-muted-foreground">{phase.name}</span>
                <span className="text-xs text-muted-foreground/70">({percentage}%)</span>
              </Badge>
            );
          })}
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
          {phaseSummary?.phases.map((phase) => {
            const percentage = totalUseCases > 0 ? (phase.count / totalUseCases) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div
                key={phase.id}
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: phase.color 
                }}
                className="h-full first:rounded-l-full last:rounded-r-full"
                title={`${phase.name}: ${phase.count} (${Math.round(percentage)}%)`}
              />
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {totalUseCases} {scope === 'dashboard' ? 'active portfolio' : 'reference library'} use cases across {phaseSummary?.phases.filter(p => p.count > 0).length || 0} phases
        </div>
      </CardContent>
    </Card>
  );
}
