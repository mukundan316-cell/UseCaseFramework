import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Users, 
  RefreshCw, 
  Save,
  RotateCcw,
  Info,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useCurrency } from '@/hooks/useCurrency';
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
    hourlyRate?: number;
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

const DEFAULT_FORMULAS: DerivationFormulas = {
  valueRealization: {
    roi: {
      formula: 'ROI (%) = (Total Value - Investment) ÷ Investment × 100',
      description: 'Return on Investment shows how much value you get back for every pound invested. Example: If you invest £150,000 and generate £500,000 value, your ROI is 233%.'
    },
    breakeven: {
      formula: 'Breakeven = Total Investment ÷ Monthly Value',
      description: 'How many months until your investment pays for itself. Example: £180,000 investment ÷ £15,000/month = 12 months to breakeven.'
    },
    kpiMatching: {
      formula: 'Match use case processes to applicable KPIs from library',
      description: 'Automatically finds relevant KPIs based on which business processes a use case affects (e.g., Claims Processing → Claims Cycle Time KPI).'
    },
    hourlyRate: 45
  },
  capability: {
    baseFte: {
      formula: 'Team Size = T-shirt Size → FTE Mapping',
      description: 'Larger, more complex implementations need bigger teams. This maps project size to the baseline number of full-time staff needed.',
      values: { XS: 0.5, S: 1, M: 2, L: 4, XL: 8 }
    },
    transitionSpeed: {
      formula: 'Transition Speed = Quadrant × Pace Modifier',
      description: 'How quickly knowledge transfers from vendor to client. Quick Wins (simple projects) transfer 50% faster. Watchlist items (low priority) transfer 20% slower.',
      values: { 'Quick Win': 1.5, 'Experimental': 1.2, 'Strategic Bet': 1.0, 'Watchlist': 0.8 }
    },
    independence: {
      formula: 'Independence % = TOM Phase + Quadrant Speed',
      description: 'Percentage of work client can handle independently. Progresses from 10% (Foundation) to 85%+ (Steady State) over 18 months.'
    }
  },
  tomPhase: {
    formula: 'TOM Phase = Use Case Status → Lifecycle Phase',
    description: 'Automatically determines which lifecycle phase a use case is in based on its implementation status. Manual override available.',
    overrideField: 'tomPhaseOverride'
  }
};

const INDEPENDENCE_CURVE_TABLE = [
  { archetype: 'Quick Win', month3: 30, month6: 60, month12: 90, month18: 100, description: 'Simple, high-value - fast independence' },
  { archetype: 'Experimental', month3: 25, month6: 50, month12: 80, month18: 95, description: 'Exploratory - moderate pace' },
  { archetype: 'Strategic Bet', month3: 15, month6: 35, month12: 65, month18: 85, description: 'Complex, high-value - careful transition' },
  { archetype: 'Watchlist', month3: 10, month6: 25, month12: 50, month18: 70, description: 'Low priority - gradual handover' },
];

const PACE_MODIFIER_EXPLANATIONS = [
  { quadrant: 'Quick Win', multiplier: 1.5, meaning: '50% faster transition (simple to learn, high value)' },
  { quadrant: 'Experimental', multiplier: 1.2, meaning: '20% faster transition (low complexity exploration)' },
  { quadrant: 'Strategic Bet', multiplier: 1.0, meaning: 'Standard pace (complex but high value, needs care)' },
  { quadrant: 'Watchlist', multiplier: 0.8, meaning: '20% slower transition (lower priority, less focus)' },
];

export default function DerivationRulesLegoBlock() {
  const { toast } = useToast();
  const { symbol: currencySymbol, hourlyRate } = useCurrency();
  const [activeTab, setActiveTab] = useState('value');
  const [editedFormulas, setEditedFormulas] = useState<DerivationFormulas>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: formulas, isLoading } = useQuery<DerivationFormulas>({
    queryKey: ['/api/derivation/formulas']
  });

  useEffect(() => {
    if (formulas) {
      setEditedFormulas(formulas);
    }
  }, [formulas]);

  const saveFormulasMutation = useMutation({
    mutationFn: async (updatedFormulas: DerivationFormulas) => {
      return await apiRequest('/api/derivation/formulas', { 
        method: 'PUT',
        body: JSON.stringify(updatedFormulas)
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Derivation rules have been updated successfully.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/derivation/formulas'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save derivation rules configuration.",
        variant: "destructive"
      });
    }
  });

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/value/derive-all', { method: 'POST' });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Recalculation Complete",
        description: `${data.derived || 0} use cases updated with new derivations.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/value/portfolio-summary'] });
    },
    onError: () => {
      toast({
        title: "Recalculation Failed",
        description: "Could not recalculate derivations.",
        variant: "destructive"
      });
    }
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

  const handleReset = () => {
    setEditedFormulas(DEFAULT_FORMULAS);
    setHasChanges(true);
    toast({
      title: "Reset to Defaults",
      description: "Formulas reset. Click Save to apply changes.",
    });
  };

  const handleSave = () => {
    saveFormulasMutation.mutate({
      ...editedFormulas,
      lastUpdated: new Date().toISOString()
    });
  };

  const updateFormula = (section: string, key: string, field: string, value: any) => {
    setEditedFormulas(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: {
          ...((prev as any)[section]?.[key] || {}),
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const updateHourlyRate = (value: number) => {
    setEditedFormulas(prev => ({
      ...prev,
      valueRealization: {
        ...prev.valueRealization,
        hourlyRate: value
      }
    }));
    setHasChanges(true);
  };

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

  const displayFormulas = editedFormulas;

  return (
    <Card data-testid="derivation-rules-block">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Derivation Rules & Formulas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure how values, capabilities, and TOM phases are automatically derived. 
          All changes affect how use cases are calculated and projected.
        </p>
      </CardHeader>
      <CardContent>
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <span className="font-medium text-amber-800 dark:text-amber-200">Auto-Derivation Impact:</span>
              <span className="text-sm text-amber-700 dark:text-amber-300 ml-1">
                Changes to these formulas affect how value estimates, capability projections, and TOM phases are calculated. 
                Use "Recalculate All" to apply changes to existing use cases.
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-blue-800 mb-6" data-testid="derivation-flow-diagram">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            How Derivation Works
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">TOM & Independence Flow</p>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <Badge variant="outline" className="bg-white dark:bg-gray-800">Use Case Status</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">TOM Phase</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">Archetype</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">Independence %</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Value & Capability Flow</p>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <Badge variant="outline" className="bg-white dark:bg-gray-800">10 Scoring Levers</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">Quadrant</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">Pace Modifier</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Timeline</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">Staffing Flow</p>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <Badge variant="outline" className="bg-white dark:bg-gray-800">T-shirt Size</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">Base FTE</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Staffing Curve</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">Value Estimation Flow</p>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <Badge variant="outline" className="bg-white dark:bg-gray-800">Process/Activity</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">KPI Match</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="bg-white dark:bg-gray-800">{currencySymbol}{hourlyRate}/hr Rate</Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Value Est.</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saveFormulasMutation.isPending}
            data-testid="button-save-derivation"
          >
            {saveFormulasMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </Button>
          <Button 
            onClick={() => recalculateMutation.mutate()} 
            variant="outline"
            disabled={recalculateMutation.isPending}
            data-testid="button-recalculate-all"
          >
            {recalculateMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recalculate All
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline"
            data-testid="button-reset-derivation"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="value">
              <TrendingUp className="w-4 h-4 mr-1" />
              Value Realization
            </TabsTrigger>
            <TabsTrigger value="capability">
              <Users className="w-4 h-4 mr-1" />
              Capability Transition
            </TabsTrigger>
            <TabsTrigger value="tom">
              <Target className="w-4 h-4 mr-1" />
              TOM Phase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="value" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Value Formulas
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">ROI & Breakeven calculations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800 dark:text-green-200">ROI Calculation</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Return on Investment percentage</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-green-700">Formula</Label>
                    <Input
                      value={displayFormulas?.valueRealization?.roi?.formula || ''}
                      onChange={(e) => updateFormula('valueRealization', 'roi', 'formula', e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-roi-formula"
                    />
                    <Label className="text-xs text-green-700">Description</Label>
                    <Input
                      value={displayFormulas?.valueRealization?.roi?.description || ''}
                      onChange={(e) => updateFormula('valueRealization', 'roi', 'description', e.target.value)}
                      className="text-sm"
                      data-testid="input-roi-description"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Breakeven Month</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Months until investment is recovered</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-700">Formula</Label>
                    <Input
                      value={displayFormulas?.valueRealization?.breakeven?.formula || ''}
                      onChange={(e) => updateFormula('valueRealization', 'breakeven', 'formula', e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-breakeven-formula"
                    />
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Hourly Rate (GBP)</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-purple-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Used to convert hour-based KPI estimates to GBP value</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{currencySymbol}</span>
                      <Input
                        type="number"
                        value={displayFormulas?.valueRealization?.hourlyRate || 45}
                        onChange={(e) => updateHourlyRate(parseInt(e.target.value) || 45)}
                        className="w-24 font-mono"
                        data-testid="input-hourly-rate"
                      />
                      <span className="text-sm text-gray-500">/hour</span>
                    </div>
                    <p className="text-xs text-purple-600">
                      Applied when KPIs use hours as estimation unit
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">KPI Matching Logic</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Formula</Label>
                    <Input
                      value={displayFormulas?.valueRealization?.kpiMatching?.formula || ''}
                      onChange={(e) => updateFormula('valueRealization', 'kpiMatching', 'formula', e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-kpi-matching-formula"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Capability Formulas
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">Staffing & transition projections</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Base FTE by T-Shirt Size</h4>
                  <div className="space-y-2 mb-3">
                    <Label className="text-xs text-blue-700">Formula</Label>
                    <Input
                      value={displayFormulas?.capability?.baseFte?.formula || ''}
                      onChange={(e) => updateFormula('capability', 'baseFte', 'formula', e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-base-fte-formula"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayFormulas?.capability?.baseFte?.values && 
                      Object.entries(displayFormulas.capability.baseFte.values).map(([size, fte]) => (
                        <Badge key={size} variant="outline" className="font-mono">
                          {size}: {String(fte)} FTE
                        </Badge>
                      ))
                    }
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {displayFormulas?.capability?.baseFte?.description}
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-3">Transition Speed by Quadrant</h4>
                  <div className="space-y-2 mb-3">
                    <Label className="text-xs text-indigo-700">Formula</Label>
                    <Input
                      value={displayFormulas?.capability?.transitionSpeed?.formula || ''}
                      onChange={(e) => updateFormula('capability', 'transitionSpeed', 'formula', e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-transition-speed-formula"
                    />
                  </div>
                  <p className="text-xs text-indigo-600 mb-3">
                    {displayFormulas?.capability?.transitionSpeed?.description}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse" data-testid="table-pace-modifiers">
                      <thead>
                        <tr className="bg-indigo-100 dark:bg-indigo-900/50">
                          <th className="text-left p-2 border border-indigo-200 dark:border-indigo-700 font-medium">Quadrant</th>
                          <th className="text-center p-2 border border-indigo-200 dark:border-indigo-700 font-medium">Multiplier</th>
                          <th className="text-left p-2 border border-indigo-200 dark:border-indigo-700 font-medium">What This Means</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PACE_MODIFIER_EXPLANATIONS.map((row, idx) => (
                          <tr key={row.quadrant} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30" data-testid={`row-pace-modifier-${idx}`}>
                            <td className="p-2 border border-indigo-200 dark:border-indigo-700 font-medium" data-testid={`text-quadrant-${idx}`}>{row.quadrant}</td>
                            <td className="p-2 border border-indigo-200 dark:border-indigo-700 text-center">
                              <Badge variant="outline" className="font-mono" data-testid={`badge-multiplier-${idx}`}>{row.multiplier}x</Badge>
                            </td>
                            <td className="p-2 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300" data-testid={`text-meaning-${idx}`}>{row.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                  <h4 className="font-medium text-violet-800 dark:text-violet-200 mb-3">Independence Curve by Archetype</h4>
                  <div className="space-y-2 mb-3">
                    <Label className="text-xs text-violet-700">Formula</Label>
                    <Input
                      value={displayFormulas?.capability?.independence?.formula || ''}
                      onChange={(e) => updateFormula('capability', 'independence', 'formula', e.target.value)}
                      className="font-mono text-sm"
                      data-testid="input-independence-formula"
                    />
                  </div>
                  <p className="text-xs text-violet-600 mb-3">
                    {displayFormulas?.capability?.independence?.description}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse" data-testid="table-independence-curve">
                      <thead>
                        <tr className="bg-violet-100 dark:bg-violet-900/50">
                          <th className="text-left p-2 border border-violet-200 dark:border-violet-700 font-medium">Archetype</th>
                          <th className="text-center p-2 border border-violet-200 dark:border-violet-700 font-medium">Month 3</th>
                          <th className="text-center p-2 border border-violet-200 dark:border-violet-700 font-medium">Month 6</th>
                          <th className="text-center p-2 border border-violet-200 dark:border-violet-700 font-medium">Month 12</th>
                          <th className="text-center p-2 border border-violet-200 dark:border-violet-700 font-medium">Month 18</th>
                          <th className="text-left p-2 border border-violet-200 dark:border-violet-700 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {INDEPENDENCE_CURVE_TABLE.map((row, idx) => (
                          <tr key={row.archetype} className="hover:bg-violet-50/50 dark:hover:bg-violet-900/30" data-testid={`row-independence-${idx}`}>
                            <td className="p-2 border border-violet-200 dark:border-violet-700 font-medium" data-testid={`text-archetype-${idx}`}>{row.archetype}</td>
                            <td className="p-2 border border-violet-200 dark:border-violet-700 text-center">
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-month3-${idx}`}>{row.month3}%</Badge>
                            </td>
                            <td className="p-2 border border-violet-200 dark:border-violet-700 text-center">
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-month6-${idx}`}>{row.month6}%</Badge>
                            </td>
                            <td className="p-2 border border-violet-200 dark:border-violet-700 text-center">
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-month12-${idx}`}>{row.month12}%</Badge>
                            </td>
                            <td className="p-2 border border-violet-200 dark:border-violet-700 text-center">
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-month18-${idx}`}>{row.month18}%</Badge>
                            </td>
                            <td className="p-2 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-xs" data-testid={`text-curve-desc-${idx}`}>{row.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      TOM Phase Derivation
                    </Badge>
                    <Badge variant={displayFormulas?.tom?.enabled === 'true' || displayFormulas?.tom?.enabled === true ? 'default' : 'secondary'}>
                      {displayFormulas?.tom?.enabled === 'true' || displayFormulas?.tom?.enabled === true ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {displayFormulas?.tom?.activePreset && (
                    <Badge variant="outline">{displayFormulas.tom.activePreset}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3">Status → Phase Mapping</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Discovery / Backlog</code>
                      <span className="text-gray-500">→</span>
                      <Badge>Ideation</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">In-flight (POC)</code>
                      <span className="text-gray-500">→</span>
                      <Badge>Assessment</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">In-flight (MVP)</code>
                      <span className="text-gray-500">→</span>
                      <Badge>Foundation / Build</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Implemented</code>
                      <span className="text-gray-500">→</span>
                      <Badge>Scale / Operate</Badge>
                    </div>
                  </div>
                </div>

                {displayFormulas?.tom?.phases && displayFormulas.tom.phases.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Available Phases</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayFormulas.tom.phases.map((phase) => (
                        <Badge key={phase} variant="outline">
                          {phase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Override Support</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Use the <code className="bg-white dark:bg-gray-800 px-1 rounded">tomPhaseOverride</code> field 
                    to manually set a phase that won't be overwritten by automatic derivation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {displayFormulas?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-4 text-right">
            Last updated: {new Date(displayFormulas.lastUpdated).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
