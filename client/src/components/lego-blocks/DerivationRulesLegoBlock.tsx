import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Users, 
  RefreshCw, 
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DerivationFormulas {
  scoring?: {
    impactScore?: {
      formula: string;
      description?: string;
      levers?: string[];
      weights?: Record<string, number>;
    };
    effortScore?: {
      formula: string;
      description?: string;
      levers?: string[];
      weights?: Record<string, number>;
    };
    quadrant?: {
      formula: string;
      description?: string;
      thresholdDefault?: number;
    };
  };
  valueRealization?: {
    roi?: { formula: string; description?: string };
    breakeven?: { formula: string; description?: string };
    kpiMatching?: { formula: string; description?: string };
    maturityLevel?: { formula: string; description?: string };
  };
  capability?: {
    baseFte?: { formula: string; description?: string; values?: Record<string, number> };
    transitionSpeed?: { formula: string; description?: string; values?: Record<string, number> };
    independence?: { formula: string; description?: string; archetypes?: Record<string, any> };
  };
  tomPhase?: {
    formula?: string;
    description?: string;
    overrideField?: string;
  };
  tom?: {
    enabled?: string | boolean;
    activePreset?: string;
    phases?: string[];
  };
  lastUpdated?: string;
}

export default function DerivationRulesLegoBlock() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('value');

  const { data: formulas, isLoading } = useQuery<DerivationFormulas>({
    queryKey: ['/api/derivation/formulas']
  });

  const syncProcessesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/value/sync-processes', { method: 'POST' });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Processes Synced",
        description: `${data.syncReport?.length || 0} KPIs updated to use canonical process names`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/value/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/derivation/formulas'] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Could not sync KPI processes with metadata",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading derivation rules...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const FormulaCard = ({ 
    title, 
    formula, 
    description, 
    icon: Icon 
  }: { 
    title: string; 
    formula: string; 
    description?: string; 
    icon: any;
  }) => (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block overflow-x-auto">
            {formula}
          </code>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card data-testid="derivation-rules-block">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Derivation Rules & Formulas</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>These formulas are used to automatically calculate scores, value estimates, and capability transitions when creating or updating use cases.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncProcessesMutation.mutate()}
          disabled={syncProcessesMutation.isPending}
          data-testid="button-sync-processes"
        >
          {syncProcessesMutation.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Sync KPI Processes
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="value" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Value
            </TabsTrigger>
            <TabsTrigger value="capability" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Capability
            </TabsTrigger>
            <TabsTrigger value="tom" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              TOM Phase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="value" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              How ROI and breakeven are calculated from value realization estimates.
            </div>
            
            <FormulaCard
              title="ROI Calculation"
              formula={formulas?.valueRealization?.roi?.formula || '((cumulativeValue - totalInvestment) / totalInvestment) × 100'}
              description={formulas?.valueRealization?.roi?.description || "Return on Investment as a percentage"}
              icon={TrendingUp}
            />
            
            <FormulaCard
              title="Breakeven Month"
              formula={formulas?.valueRealization?.breakeven?.formula || 'totalInvestment / monthlyValue'}
              description={formulas?.valueRealization?.breakeven?.description || "Number of months until investment is recovered"}
              icon={Target}
            />
            
            <FormulaCard
              title="KPI Matching"
              formula={formulas?.valueRealization?.kpiMatching?.formula || 'Match use case processes to KPI applicableProcesses'}
              description={formulas?.valueRealization?.kpiMatching?.description || "Fuzzy matching of processes to KPIs"}
              icon={Target}
            />
            
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Value Derivation Trigger</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Value estimates auto-derive when <code className="bg-muted px-1 rounded">processes[]</code> is populated. 
                KPIs are matched to processes via <code className="bg-muted px-1 rounded">applicableProcesses</code> field.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="capability" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              How capability transition staffing and timelines are derived.
            </div>
            
            {formulas?.capability?.baseFte && (
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium text-sm mb-2">Base FTE by T-Shirt Size</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">
                  {formulas.capability.baseFte.formula}
                </code>
                <div className="flex flex-wrap gap-2">
                  {formulas.capability.baseFte.values && Object.entries(formulas.capability.baseFte.values).map(([size, fte]) => (
                    <Badge key={size} variant="outline">
                      {size}: {String(fte)} FTE
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formulas.capability.baseFte.description}
                </p>
              </div>
            )}
            
            {formulas?.capability?.transitionSpeed && (
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium text-sm mb-2">Transition Speed by Quadrant</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">
                  {formulas.capability.transitionSpeed.formula}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  {formulas.capability.transitionSpeed.description}
                </p>
              </div>
            )}
            
            {formulas?.capability?.independence && (
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium text-sm mb-2">Independence Levels</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">
                  {formulas.capability.independence.formula}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  {formulas.capability.independence.description}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tom" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              How TOM lifecycle phase is derived from use case status.
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={formulas?.tom?.enabled === 'true' || formulas?.tom?.enabled === true ? 'default' : 'secondary'}>
                  {formulas?.tom?.enabled === 'true' || formulas?.tom?.enabled === true ? 'Enabled' : 'Disabled'}
                </Badge>
                {formulas?.tom?.activePreset && (
                  <Badge variant="outline">{formulas.tom.activePreset}</Badge>
                )}
              </div>
              
              <h4 className="font-medium text-sm mb-2">Phase Derivation Logic</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded">Discovery / Backlog</code>
                  <span>→</span>
                  <Badge variant="secondary">Ideation</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded">In-flight (POC)</code>
                  <span>→</span>
                  <Badge variant="secondary">Assessment</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded">In-flight (MVP)</code>
                  <span>→</span>
                  <Badge variant="secondary">Foundation / Build</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded">Implemented</code>
                  <span>→</span>
                  <Badge variant="secondary">Scale / Operate</Badge>
                </div>
              </div>
              
              {formulas?.tom?.phases && formulas.tom.phases.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Available Phases</h4>
                  <div className="flex flex-wrap gap-1">
                    {formulas.tom.phases.map((phase) => (
                      <Badge key={phase} variant="outline" className="text-xs">
                        {phase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
