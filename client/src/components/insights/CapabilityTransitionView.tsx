import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, TrendingUp, GraduationCap, CheckCircle2, Clock, Target,
  Loader2, AlertCircle, HelpCircle, ArrowUpRight, Building2, UserCheck, Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import type { 
  PortfolioCapabilitySummary, 
  StaffingProjectionPoint,
  CapabilityTransitionConfig 
} from '@shared/capabilityTransition';
import RoleEvolutionLegoBlock from '@/components/lego-blocks/RoleEvolutionLegoBlock';
import AuditTimelineLegoBlock from '@/components/lego-blocks/AuditTimelineLegoBlock';

export default function CapabilityTransitionView() {
  const { data: portfolioSummary, isLoading: summaryLoading, isError: summaryError } = useQuery<PortfolioCapabilitySummary>({
    queryKey: ['/api/capability/portfolio-summary'],
  });

  const { data: staffingProjection, isLoading: projectionLoading } = useQuery<StaffingProjectionPoint[]>({
    queryKey: ['/api/capability/staffing-projection'],
  });

  const { data: config, isLoading: configLoading } = useQuery<CapabilityTransitionConfig>({
    queryKey: ['/api/capability/config'],
  });

  const { toast } = useToast();

  const deriveAllMutation = useMutation({
    mutationFn: async (overwriteExisting: boolean) => {
      const response = await apiRequest('/api/capability/derive-all', {
        method: 'POST',
        body: JSON.stringify({ overwriteExisting }),
      });
      return response;
    },
    onSuccess: (data: { derived: number; skipped: number; total: number }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/capability/portfolio-summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/capability/staffing-projection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
      toast({
        title: 'Capability Defaults Derived',
        description: `Auto-populated ${data.derived} use cases from benchmark data (${data.skipped} skipped)`,
      });
    },
    onError: () => {
      toast({
        title: 'Derivation Failed',
        description: 'Failed to derive capability defaults. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const isLoading = summaryLoading || projectionLoading || configLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading capability analytics...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <span className="text-red-700">Failed to load capability transition data</span>
        </CardContent>
      </Card>
    );
  }

  const hasCapabilityData = portfolioSummary && portfolioSummary.useCasesTracked > 0;
  const ktProgress = portfolioSummary && portfolioSummary.ktMilestonesTotal > 0 
    ? Math.round((portfolioSummary.ktMilestonesCompleted / portfolioSummary.ktMilestonesTotal) * 100) 
    : 0;
  const trainingProgress = portfolioSummary && portfolioSummary.trainingHoursPlanned > 0
    ? Math.round((portfolioSummary.trainingHoursCompleted / portfolioSummary.trainingHoursPlanned) * 100)
    : 0;

  const getIndependenceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage >= 20) return 'text-amber-600';
    return 'text-red-600';
  };

  const getIndependencePhase = (percentage: number) => {
    if (percentage >= 85) return { label: 'Steady State', color: 'bg-green-100 text-green-800' };
    if (percentage >= 50) return { label: 'Transition', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 20) return { label: 'Strategic', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Foundation', color: 'bg-purple-100 text-purple-800' };
  };

  const phase = portfolioSummary ? getIndependencePhase(portfolioSummary.overallIndependence) : null;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="text-center flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Capability Transition - "Teach Us to Fish"</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track knowledge transfer progress, staffing curves, and path to self-sufficiency across the reference library.
            </p>
            <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
              Reference Library Analytics
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deriveAllMutation.mutate(true)}
                disabled={deriveAllMutation.isPending}
                className="shrink-0"
                data-testid="button-derive-capability-defaults"
              >
                {deriveAllMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Derive Defaults
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Auto-populate capability data from use case attributes</p>
              <p className="text-xs text-muted-foreground">(TOM phase, quadrant, t-shirt size)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {!hasCapabilityData && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <div className="text-center space-y-3">
                <Sparkles className="h-10 w-10 text-blue-500 mx-auto" />
                <p className="text-blue-800 font-medium">
                  Auto-derive capability data from benchmarks
                </p>
                <p className="text-blue-600 text-sm max-w-md mx-auto">
                  Click "Derive Defaults" above to automatically populate staffing curves, independence projections, 
                  and KT milestones based on each use case's TOM phase, quadrant placement, and t-shirt size.
                </p>
                <Button
                  variant="default"
                  onClick={() => deriveAllMutation.mutate(true)}
                  disabled={deriveAllMutation.isPending}
                  data-testid="button-derive-capability-defaults-cta"
                >
                  {deriveAllMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Derive Capability Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-purple-700 font-medium">Portfolio Independence</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Weighted average of client independence across tracked use cases</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserCheck className="h-8 w-8 text-purple-600" />
                <div>
                  <p className={`text-2xl font-bold ${getIndependenceColor(portfolioSummary?.overallIndependence || 0)}`}>
                    {portfolioSummary?.overallIndependence || 0}%
                  </p>
                  {phase && (
                    <Badge className={phase.color}>{phase.label}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-blue-700 font-medium">Staffing Split</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current FTE allocation between Hexaware (vendor) and client teams</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-blue-900">
                    {portfolioSummary?.totalVendorFte?.toFixed(1) || 0} / {portfolioSummary?.totalClientFte?.toFixed(1) || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    Hexaware / Client FTE
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-green-700 font-medium">KT Progress</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-green-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Knowledge transfer milestones completed across all tracked use cases</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    {portfolioSummary?.ktMilestonesCompleted || 0}/{portfolioSummary?.ktMilestonesTotal || 0}
                  </p>
                  <Progress value={ktProgress} className="h-2 w-24 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-amber-700 font-medium">Target Date</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Projected date for reaching 85% independence (Steady State)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-lg font-bold text-amber-900">
                    {portfolioSummary?.projectedFullIndependence || 'N/A'}
                  </p>
                  <p className="text-sm text-amber-600">
                    {portfolioSummary?.useCasesTracked || 0} use cases tracked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasCapabilityData && staffingProjection && staffingProjection.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Staffing Transition Curve
              </CardTitle>
              <CardDescription>
                Projected FTE transition from Hexaware to client teams over 18 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={staffingProjection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVendor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3C2CDA" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3C2CDA" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorClient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14CBDE" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14CBDE" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value + '-01');
                        return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'FTE', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number, name: string) => [
                        value.toFixed(1) + ' FTE',
                        name === 'vendorFte' ? 'Hexaware' : 'Client'
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label + '-01');
                        return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                      }}
                    />
                    <Legend 
                      formatter={(value) => value === 'vendorFte' ? 'Hexaware FTE' : 'Client FTE'}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="vendorFte" 
                      stackId="1"
                      stroke="#3C2CDA" 
                      fill="url(#colorVendor)" 
                      name="vendorFte"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clientFte" 
                      stackId="1"
                      stroke="#14CBDE" 
                      fill="url(#colorClient)" 
                      name="clientFte"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {hasCapabilityData && config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Knowledge Transfer Milestones
                </CardTitle>
                <CardDescription>
                  Standard milestones for capability handover
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {config.knowledgeTransferMilestones.map((milestone, idx) => (
                    <div 
                      key={milestone.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-full ${
                        milestone.phase === 'foundation' ? 'bg-purple-100 text-purple-600' :
                        milestone.phase === 'strategic' ? 'bg-blue-100 text-blue-600' :
                        milestone.phase === 'transition' ? 'bg-cyan-100 text-cyan-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{milestone.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {milestone.phase.replace('steadyState', 'Steady State')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{milestone.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {milestone.requiredArtifacts.map((artifact, aIdx) => (
                            <Badge key={aIdx} variant="secondary" className="text-xs">
                              {artifact}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                  Training & Certifications
                </CardTitle>
                <CardDescription>
                  {portfolioSummary?.trainingHoursCompleted || 0} / {portfolioSummary?.trainingHoursPlanned || 0} hours completed ({trainingProgress}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Progress value={trainingProgress} className="h-3" />
                </div>
                <div className="space-y-3">
                  {config.certifications.map((cert) => (
                    <div 
                      key={cert.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="mt-0.5 p-1.5 rounded-full bg-amber-100 text-amber-600">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{cert.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {cert.estimatedHours}h
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{cert.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cert.targetAudience.map((audience, aIdx) => (
                            <Badge key={aIdx} variant="secondary" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {hasCapabilityData && config && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
                Independence Journey
              </CardTitle>
              <CardDescription>
                Phase progression from vendor-led to client self-sufficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                {Object.entries(config.independenceTargets).map(([phase, target], idx) => {
                  const isActive = portfolioSummary && 
                    portfolioSummary.overallIndependence >= target.min && 
                    portfolioSummary.overallIndependence < target.max;
                  const isCompleted = portfolioSummary && portfolioSummary.overallIndependence >= target.max;
                  
                  return (
                    <div key={phase} className="flex-1">
                      <div className={`p-4 rounded-lg border-2 transition-all ${
                        isActive ? 'border-indigo-500 bg-indigo-50' :
                        isCompleted ? 'border-green-500 bg-green-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold capitalize ${
                            isActive ? 'text-indigo-700' :
                            isCompleted ? 'text-green-700' :
                            'text-gray-700'
                          }`}>
                            {phase.replace('steadyState', 'Steady State')}
                          </span>
                          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {isActive && <Clock className="h-5 w-5 text-indigo-600 animate-pulse" />}
                        </div>
                        <p className="text-xs text-gray-600">{target.description}</p>
                        <p className="text-sm font-medium mt-2 text-gray-700">
                          {target.min}% - {target.max}%
                        </p>
                      </div>
                      {idx < 3 && (
                        <div className="flex justify-center my-1">
                          <ArrowUpRight className="h-4 w-4 text-gray-400 rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Role Evolution Tracking (Topic 9.3 - Markel 9 Topics) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoleEvolutionLegoBlock 
            roleEvolution={[]}
            readOnly={true}
            emptyStateMessage="Role evolution is tracked at the individual use case level. View a specific use case to see its role transition details."
          />
          <AuditTimelineLegoBlock limit={20} />
        </div>
      </div>
    </TooltipProvider>
  );
}
