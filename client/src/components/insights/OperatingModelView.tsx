import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { 
  Target, CheckCircle2, AlertTriangle, Clock, 
  Loader2, AlertCircle, HelpCircle, Layers, Rocket, Zap
} from 'lucide-react';
import type { TomConfig } from '@shared/tom';

interface UseCase {
  id: string;
  title: string;
  quadrant: string;
  useCaseStatus: string | null;
  deploymentStatus: string | null;
  tomPhase: string | null;
  derivedPhase?: { id: string; name: string; color: string } | null;
}

interface PhaseSummary {
  enabled: boolean;
  summary: Record<string, number>;
  phases: Array<{ id: string; name: string; color: string; count: number }>;
}

interface TOMMetrics {
  totalUseCases: number;
  phasedUseCases: number;
  unphasedUseCases: number;
  activePhases: number;
  phaseDistribution: Array<{ id: string; name: string; color: string; count: number; percentage: number }>;
  statusCoverage: {
    defined: number;
    inProgress: number;
    deployed: number;
    undefined: number;
  };
}

function computeTOMMetrics(useCases: UseCase[], phaseSummary: PhaseSummary | undefined): TOMMetrics {
  const total = useCases.length;
  
  const statusCoverage = {
    defined: 0,
    inProgress: 0,
    deployed: 0,
    undefined: 0
  };

  useCases.forEach(uc => {
    const status = uc.useCaseStatus?.toLowerCase() || '';
    if (status.includes('deploy') || status.includes('live') || status.includes('production')) {
      statusCoverage.deployed++;
    } else if (status.includes('progress') || status.includes('development') || status.includes('pilot')) {
      statusCoverage.inProgress++;
    } else if (status && status !== '') {
      statusCoverage.defined++;
    } else {
      statusCoverage.undefined++;
    }
  });

  const phases = phaseSummary?.phases || [];
  const totalPhased = phases.reduce((sum, p) => sum + p.count, 0);
  const activePhases = phases.filter(p => p.count > 0).length;

  const phaseDistribution = phases.map(p => ({
    ...p,
    percentage: total > 0 ? Math.round((p.count / total) * 100) : 0
  }));

  return {
    totalUseCases: total,
    phasedUseCases: totalPhased,
    unphasedUseCases: total - totalPhased,
    activePhases,
    phaseDistribution,
    statusCoverage
  };
}

function getPhaseIcon(phaseName: string) {
  const name = phaseName.toLowerCase();
  if (name.includes('ideation') || name.includes('discovery')) return <Zap className="h-4 w-4" />;
  if (name.includes('pilot') || name.includes('poc')) return <Rocket className="h-4 w-4" />;
  if (name.includes('scale') || name.includes('production')) return <Layers className="h-4 w-4" />;
  return <Target className="h-4 w-4" />;
}

interface OperatingModelViewProps {
  scope?: 'active' | 'all';
}

export default function OperatingModelView({ scope = 'all' }: OperatingModelViewProps) {
  const useCasesEndpoint = scope === 'active' ? '/api/use-cases/dashboard' : '/api/use-cases';
  const phaseSummaryEndpoint = scope === 'active' ? '/api/tom/phase-summary?scope=dashboard' : '/api/tom/phase-summary?scope=all';
  
  const { data: useCases, isLoading: useCasesLoading, isError: useCasesError } = useQuery<UseCase[]>({
    queryKey: [useCasesEndpoint],
  });

  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config'],
  });

  const { data: phaseSummary, isLoading: summaryLoading } = useQuery<PhaseSummary>({
    queryKey: [phaseSummaryEndpoint],
    enabled: tomConfig?.enabled === 'true',
  });

  const isLoading = useCasesLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading operating model data...</span>
      </div>
    );
  }

  if (useCasesError || !useCases) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <span className="text-red-700">Failed to load portfolio data</span>
        </CardContent>
      </Card>
    );
  }

  if (tomConfig?.enabled !== 'true') {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-16 w-16 text-gray-300 mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Target Operating Model Disabled</h4>
          <p className="text-gray-500 max-w-md">
            Enable TOM in Admin settings to view phase distribution and lifecycle analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = computeTOMMetrics(useCases, phaseSummary);
  const completionRate = metrics.totalUseCases > 0 
    ? Math.round((metrics.phasedUseCases / metrics.totalUseCases) * 100) 
    : 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Operating Model</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI lifecycle phase distribution and status tracking across {metrics.totalUseCases} use cases in the {scope === 'active' ? 'active portfolio' : 'reference library'}.
          </p>
          <Badge variant="outline" className={`mt-2 text-xs ${scope === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {scope === 'active' ? 'Active Portfolio' : 'Reference Library Analytics'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-indigo-700 font-medium">Phased Use Cases</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-indigo-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases assigned to TOM lifecycle phases</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-indigo-900">{metrics.phasedUseCases}</p>
                  <p className="text-sm text-indigo-600">{completionRate}% of portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-yellow-700 font-medium">Unphased</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-yellow-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases not yet assigned to a phase</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{metrics.unphasedUseCases}</p>
                  <p className="text-sm text-yellow-600">Need assignment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-green-700 font-medium">Active Phases</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-green-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of phases with use cases</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Layers className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{metrics.activePhases}</p>
                  <p className="text-sm text-green-600">of {phaseSummary?.phases.length || 0} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-purple-700 font-medium">Model Coverage</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of portfolio with phase assignments</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
                  <Progress value={completionRate} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                Phase Distribution
              </CardTitle>
              <CardDescription>Use cases across lifecycle phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.phaseDistribution.map((phase) => (
                  <div key={phase.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: phase.color }}
                        />
                        {phase.name}
                      </span>
                      <span className="text-sm font-medium">{phase.count} ({phase.percentage}%)</span>
                    </div>
                    <Progress 
                      value={phase.percentage} 
                      className="h-2"
                      style={{ '--progress-background': phase.color } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Status Coverage
              </CardTitle>
              <CardDescription>Use case status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Deployed / Live
                  </span>
                  <span className="font-medium">{metrics.statusCoverage.deployed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    In Progress
                  </span>
                  <span className="font-medium">{metrics.statusCoverage.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Defined
                  </span>
                  <span className="font-medium">{metrics.statusCoverage.defined}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    Undefined
                  </span>
                  <span className="font-medium">{metrics.statusCoverage.undefined}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Use Case Phase Status</CardTitle>
            <CardDescription>Individual phase assignments across all use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm" data-testid="table-tom-status">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Use Case</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Phase</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Deployment</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Quadrant</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases.map((uc) => {
                    const phase = phaseSummary?.phases.find(p => p.id === uc.tomPhase) || 
                                  uc.derivedPhase;
                    return (
                      <tr key={uc.id} className="border-b hover-elevate" data-testid={`row-tom-${uc.id}`}>
                        <td className="py-3 px-2 max-w-xs truncate" title={uc.title}>{uc.title}</td>
                        <td className="py-3 px-2">
                          {phase ? (
                            <Badge 
                              variant="outline"
                              className="text-xs"
                              style={{ 
                                borderColor: phase.color, 
                                color: phase.color,
                                backgroundColor: `${phase.color}15`
                              }}
                            >
                              {phase.name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                              Unassigned
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-600">{uc.useCaseStatus || '-'}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-600">{uc.deploymentStatus || '-'}</span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">{uc.quadrant || '-'}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 text-center py-2">
                Showing all {useCases.length} use cases
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
