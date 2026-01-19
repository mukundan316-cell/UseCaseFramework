import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Settings, Target, Users, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { TomConfig, TomPhase, TomGovernanceBody } from '@shared/tom';

export default function TomConfigurationLegoBlock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const { data: tomConfig, isLoading } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config'],
  });

  const { data: phaseSummary } = useQuery<{
    enabled: boolean;
    summary: Record<string, number>;
    phases: Array<{ id: string; name: string; color: string; count: number }>;
  }>({
    queryKey: ['/api/tom/phase-summary'],
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<TomConfig>) => {
      const updated = { ...tomConfig, ...updates };
      return apiRequest('/api/tom/config', {
        method: 'PUT',
        body: JSON.stringify(updated),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tom/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tom/phase-summary'] });
      toast({
        title: 'TOM Configuration Updated',
        description: 'Target Operating Model configuration saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update TOM configuration.',
        variant: 'destructive',
      });
    },
  });

  const handleToggleEnabled = (checked: boolean) => {
    updateMutation.mutate({ enabled: checked ? 'true' : 'false' });
  };

  const handlePresetChange = (preset: string) => {
    updateMutation.mutate({ activePreset: preset });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!tomConfig) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          TOM configuration not found. Please seed default configuration.
        </CardContent>
      </Card>
    );
  }

  const isEnabled = tomConfig.enabled === 'true';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Target Operating Model (TOM)
              </CardTitle>
              <CardDescription>
                Configure the operating model framework that drives use case lifecycle phases
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="tom-enabled" className="text-sm font-medium">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="tom-enabled"
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
                data-testid="toggle-tom-enabled"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Operating Model Preset</Label>
            <Select value={tomConfig.activePreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-full max-w-md" data-testid="select-tom-preset">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tomConfig.presets).map(([key, preset]) => (
                  <SelectItem key={key} value={key} data-testid={`preset-${key}`}>
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEnabled && phaseSummary?.enabled && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-medium mb-3">Current Phase Distribution</h4>
              <div className="flex flex-wrap gap-2">
                {phaseSummary.phases.map((phase) => (
                  <Badge
                    key={phase.id}
                    variant="outline"
                    style={{ borderColor: phase.color, backgroundColor: `${phase.color}15` }}
                    data-testid={`phase-count-${phase.id}`}
                  >
                    <span style={{ color: phase.color }} className="font-semibold mr-1">
                      {phase.count}
                    </span>
                    {phase.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-4 w-4" />
            Lifecycle Phases
          </CardTitle>
          <CardDescription>
            Phases are derived from use case status and deployment status. Manual-only phases require explicit assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tomConfig.phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhase === phase.id}
              onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
              count={phaseSummary?.summary?.[phase.id] || 0}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-4 w-4" />
            Governance Bodies
          </CardTitle>
          <CardDescription>
            Review bodies and committees that provide oversight at phase gates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tomConfig.governanceBodies.map((body) => (
            <GovernanceBodyCard key={body.id} body={body} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  count,
}: {
  phase: TomPhase;
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
}) {
  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={onToggle}
      data-testid={`phase-card-${phase.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: phase.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{phase.name}</span>
              {phase.manualOnly && (
                <Badge variant="secondary" className="text-xs">Manual Only</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{phase.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{count} use cases</Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Mapped Statuses</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {phase.mappedStatuses.length > 0 ? (
                  phase.mappedStatuses.map((status) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {status}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs">None (manual only)</span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mapped Deployments</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {phase.mappedDeployments.length > 0 ? (
                  phase.mappedDeployments.map((deployment) => (
                    <Badge key={deployment} variant="outline" className="text-xs">
                      {deployment}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs">None</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Governance Gate</Label>
              <p className="mt-1">{phase.governanceGate === 'none' ? 'No gate' : phase.governanceGate}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Expected Duration</Label>
              <p className="mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {phase.expectedDurationWeeks ? `${phase.expectedDurationWeeks} weeks` : 'Ongoing'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GovernanceBodyCard({ body }: { body: TomGovernanceBody }) {
  return (
    <div
      className="rounded-lg border p-4"
      data-testid={`governance-body-${body.id}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{body.name}</span>
          <p className="text-sm text-muted-foreground">{body.role}</p>
        </div>
        <Badge variant="outline">{body.cadence}</Badge>
      </div>
    </div>
  );
}
