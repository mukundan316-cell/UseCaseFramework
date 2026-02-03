import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useEngagement } from '@/contexts/EngagementContext';
import { Target, Loader2, Lightbulb, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
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
  scope?: 'dashboard' | 'all' | 'reference';
}

export default function TomPhaseBreakdownLegoBlock({ scope = 'dashboard' }: TomPhaseBreakdownLegoBlockProps) {
  const { selectedClientId } = useEngagement();
  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', selectedClientId],
  });

  const effectiveScope = scope === 'dashboard' ? 'active' : scope;
  
  const { data: phaseSummary, isLoading } = useQuery<PhaseSummary>({
    queryKey: ['/api/tom/phase-summary', selectedClientId, effectiveScope],
    queryFn: () => fetch(`/api/tom/phase-summary?scope=${effectiveScope}${selectedClientId ? `&clientId=${selectedClientId}` : ''}`).then(res => res.json()),
    enabled: tomConfig?.enabled === 'true',
  });

  const { data: referenceLibrarySummary } = useQuery<PhaseSummary>({
    queryKey: ['/api/tom/phase-summary', selectedClientId, 'reference'],
    queryFn: () => fetch(`/api/tom/phase-summary?scope=reference${selectedClientId ? `&clientId=${selectedClientId}` : ''}`).then(res => res.json()),
    enabled: tomConfig?.enabled === 'true' && scope === 'dashboard',
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

  const isActivePortfolio = scope === 'dashboard';
  const displayPhases = isActivePortfolio 
    ? phaseSummary?.phases.filter(p => p.id !== 'ideation') || []
    : phaseSummary?.phases || [];
  
  const totalUseCases = displayPhases.reduce((sum, p) => sum + p.count, 0) || 0;
  const ideaPoolCount = referenceLibrarySummary?.summary?.ideation || 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
          <Target className="h-4 w-4" />
          TOM Phase Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isActivePortfolio && (
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-purple-900">Idea Pool</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  {ideaPoolCount} in Ideation
                </Badge>
              </div>
              <p className="text-xs text-purple-600">
                {ideaPoolCount > 0 ? 'Use cases available for scoring and activation' : 'No use cases in the idea pool yet'}
              </p>
            </div>
            <Link href="/insights?scope=reference" className="text-xs text-purple-600 flex items-center gap-1" data-testid="link-view-library">
              View Library <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {isActivePortfolio && (
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium mb-1">
            <Rocket className="h-3.5 w-3.5" />
            Active Pipeline
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {displayPhases.map((phase) => {
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
          {displayPhases.map((phase) => {
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
          {totalUseCases} {isActivePortfolio ? 'active portfolio' : 'reference library'} use cases across {displayPhases.filter(p => p.count > 0).length || 0} phases
        </div>
      </CardContent>
    </Card>
  );
}
