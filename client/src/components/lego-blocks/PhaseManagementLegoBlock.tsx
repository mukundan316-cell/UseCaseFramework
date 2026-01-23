import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Layers, Plus, Pencil, Trash2, GripVertical, Loader2, Sparkles } from 'lucide-react';
import type { TomPhase, TomConfig, TomGovernanceBody, PhaseDefaults } from '@shared/tom';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/hooks/useCurrency';

interface StaffingRatio {
  vendor: number;
  client: number;
}

interface PhaseFormData {
  id: string;
  name: string;
  description: string;
  color: string;
  governanceGate: string;
  expectedDurationWeeks: number | null;
  mappedStatuses: string[];
  mappedDeployments: string[];
  manualOnly: boolean;
  phaseDefaults: PhaseDefaults;
  staffingRatio: StaffingRatio;
}

const DEFAULT_PHASE_DEFAULTS: PhaseDefaults = {
  capabilityTransition: {
    hexawareFts: null,
    clientFts: null,
    independenceFts: null,
    targetIndependence: null,
    currentIndependence: null
  },
  valueRealization: {
    expectedValueRangeMin: null,
    expectedValueRangeMax: null,
    defaultKpiCategories: []
  },
  responsibleAI: {
    riskTier: null,
    assessmentRequired: false,
    recommendedCheckpoints: []
  }
};

const DEFAULT_COLORS = [
  '#9333EA', '#3C2CDA', '#1D86FF', '#14CBDE', '#10B981', '#07125E',
  '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16'
];

export default function PhaseManagementLegoBlock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { symbol: currencySymbol } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Sync with TomConfigurationLegoBlock's client selection via localStorage
  const [clientId, setClientId] = useState<string>(() => {
    return localStorage.getItem('tomClientId') || 'default';
  });
  
  // Listen for storage changes to sync with TomConfigurationLegoBlock
  React.useEffect(() => {
    const handleStorageChange = () => {
      const storedClientId = localStorage.getItem('tomClientId') || 'default';
      if (storedClientId !== clientId) {
        setClientId(storedClientId);
      }
    };
    
    // Check periodically for changes (storage event doesn't fire in same tab)
    const interval = setInterval(handleStorageChange, 500);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [clientId]);
  const [editingPhase, setEditingPhase] = useState<TomPhase | null>(null);
  const [formData, setFormData] = useState<PhaseFormData>({
    id: '',
    name: '',
    description: '',
    color: '#3C2CDA',
    governanceGate: 'working_group',
    expectedDurationWeeks: 8,
    mappedStatuses: [],
    mappedDeployments: [],
    manualOnly: false,
    phaseDefaults: DEFAULT_PHASE_DEFAULTS,
    staffingRatio: { vendor: 0.5, client: 0.5 }
  });

  const { data: tomConfig, isLoading } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', clientId],
    queryFn: () => fetch(`/api/tom/config?clientId=${clientId}`).then(r => r.json()),
  });

  const updatePhasesMutation = useMutation({
    mutationFn: async (phases: TomPhase[]) => {
      return apiRequest(`/api/tom/phases?clientId=${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({ phases }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tom/config', clientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tom/phase-summary', clientId] });
      toast({ title: 'Phases Updated', description: 'Phase configuration saved successfully.' });
    },
    onError: () => {
      toast({ title: 'Update Failed', description: 'Failed to update phases.', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      color: '#3C2CDA',
      governanceGate: 'working_group',
      expectedDurationWeeks: 8,
      mappedStatuses: [],
      mappedDeployments: [],
      manualOnly: false,
      phaseDefaults: DEFAULT_PHASE_DEFAULTS,
      staffingRatio: { vendor: 0.5, client: 0.5 }
    });
  };

  const handleAdd = () => {
    if (!tomConfig || !formData.name.trim()) return;
    
    const phaseId = formData.id || formData.name.toLowerCase().replace(/\s+/g, '_');
    const newPhase = {
      id: phaseId,
      name: formData.name,
      description: formData.description,
      order: tomConfig.phases.length + 1,
      priority: tomConfig.phases.length + 1,
      color: formData.color,
      mappedStatuses: formData.mappedStatuses,
      mappedDeployments: formData.mappedDeployments,
      manualOnly: formData.manualOnly,
      governanceGate: formData.governanceGate,
      expectedDurationWeeks: formData.expectedDurationWeeks,
      phaseDefaults: formData.phaseDefaults,
      staffingRatio: formData.staffingRatio
    };
    
    updatePhasesMutation.mutate([...tomConfig.phases, newPhase as TomPhase]);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!tomConfig || !editingPhase || !formData.name.trim()) return;
    
    const updatedPhases = tomConfig.phases.map(phase => 
      phase.id === editingPhase.id 
        ? {
            ...phase,
            name: formData.name,
            description: formData.description,
            color: formData.color,
            governanceGate: formData.governanceGate,
            expectedDurationWeeks: formData.expectedDurationWeeks,
            manualOnly: formData.manualOnly,
            phaseDefaults: formData.phaseDefaults,
            staffingRatio: formData.staffingRatio
          }
        : phase
    );
    
    updatePhasesMutation.mutate(updatedPhases);
    setEditingPhase(null);
    resetForm();
  };

  const handleDelete = (phaseId: string) => {
    if (!tomConfig) return;
    
    const updatedPhases = tomConfig.phases
      .filter(p => p.id !== phaseId)
      .map((p, idx) => ({ ...p, order: idx + 1, priority: idx + 1 }));
    
    updatePhasesMutation.mutate(updatedPhases);
  };

  const handleMovePhase = (phaseId: string, direction: 'up' | 'down') => {
    if (!tomConfig) return;
    
    const phases = [...tomConfig.phases];
    const idx = phases.findIndex(p => p.id === phaseId);
    if (idx === -1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= phases.length) return;
    
    [phases[idx], phases[newIdx]] = [phases[newIdx], phases[idx]];
    const reorderedPhases = phases.map((p, i) => ({ ...p, order: i + 1, priority: i + 1 }));
    
    updatePhasesMutation.mutate(reorderedPhases);
  };

  const openEditDialog = (phase: TomPhase) => {
    setEditingPhase(phase);
    
    setFormData({
      id: phase.id,
      name: phase.name,
      description: phase.description,
      color: phase.color,
      governanceGate: phase.governanceGate,
      expectedDurationWeeks: phase.expectedDurationWeeks,
      mappedStatuses: phase.mappedStatuses,
      mappedDeployments: phase.mappedDeployments,
      manualOnly: phase.manualOnly,
      phaseDefaults: phase.phaseDefaults || DEFAULT_PHASE_DEFAULTS,
      staffingRatio: phase.staffingRatio || { vendor: 0.5, client: 0.5 }
    });
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

  const phases = tomConfig?.phases || [];
  const governanceBodies = tomConfig?.governanceBodies || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Lifecycle Phases
            </CardTitle>
            <CardDescription>
              Configure the phases that use cases progress through in your operating model
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-phase">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Phase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Phase</DialogTitle>
                  <DialogDescription>Create a new lifecycle phase for your operating model</DialogDescription>
                </DialogHeader>
                <PhaseForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  governanceBodies={governanceBodies}
                  colors={DEFAULT_COLORS}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAdd} disabled={!formData.name.trim()} data-testid="button-save-phase">
                    Add Phase
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {phases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No phases configured. Add phases or load a preset to get started.
            </div>
          ) : (
            phases.map((phase, idx) => (
              <div 
                key={phase.id} 
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate"
                data-testid={`phase-item-${phase.id}`}
              >
                <div className="flex flex-col gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6"
                    disabled={idx === 0}
                    onClick={() => handleMovePhase(phase.id, 'up')}
                    data-testid={`button-move-up-${phase.id}`}
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6"
                    disabled={idx === phases.length - 1}
                    onClick={() => handleMovePhase(phase.id, 'down')}
                    data-testid={`button-move-down-${phase.id}`}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </div>
                
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: phase.color }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{phase.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {phase.order}
                    </Badge>
                    {phase.manualOnly && (
                      <Badge variant="secondary" className="text-xs">Manual Only</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{phase.description}</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{phase.expectedDurationWeeks ? `${phase.expectedDurationWeeks}w` : 'Ongoing'}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {phase.governanceGate.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Dialog open={editingPhase?.id === phase.id} onOpenChange={(open) => !open && setEditingPhase(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => openEditDialog(phase)}
                        data-testid={`button-edit-${phase.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Configure Phase: {phase.name}</DialogTitle>
                        <DialogDescription>Modify phase properties and default values</DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="properties" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="properties">Properties</TabsTrigger>
                          <TabsTrigger value="defaults" className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Defaults
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="properties" className="mt-4">
                          <PhaseForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            governanceBodies={governanceBodies}
                            colors={DEFAULT_COLORS}
                          />
                        </TabsContent>
                        <TabsContent value="defaults" className="mt-4">
                          <PhaseDefaultsForm 
                            defaults={formData.phaseDefaults}
                            onChange={(defaults) => setFormData(prev => ({ ...prev, phaseDefaults: defaults }))}
                            staffingRatio={formData.staffingRatio}
                            onStaffingChange={(ratio) => setFormData(prev => ({ ...prev, staffingRatio: ratio }))}
                          />
                        </TabsContent>
                      </Tabs>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPhase(null)}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={!formData.name.trim()} data-testid="button-update-phase">
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleDelete(phase.id)}
                    data-testid={`button-delete-${phase.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PhaseDefaultsForm({
  defaults,
  onChange,
  staffingRatio,
  onStaffingChange
}: {
  defaults: PhaseDefaults;
  onChange: (defaults: PhaseDefaults) => void;
  staffingRatio: StaffingRatio;
  onStaffingChange: (ratio: StaffingRatio) => void;
}) {
  const updateCapability = (field: string, value: number | null) => {
    onChange({
      ...defaults,
      capabilityTransition: { ...defaults.capabilityTransition, [field]: value }
    });
  };

  const updateValue = (field: string, value: number | null) => {
    onChange({
      ...defaults,
      valueRealization: { ...defaults.valueRealization, [field]: value }
    });
  };

  const updateRAI = (field: string, value: any) => {
    onChange({
      ...defaults,
      responsibleAI: { ...defaults.responsibleAI, [field]: value }
    });
  };

  const handleVendorChange = (vendorPercent: number) => {
    const vendor = Math.max(0, Math.min(100, vendorPercent)) / 100;
    const client = 1 - vendor;
    onStaffingChange({ vendor, client });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure default values that pre-populate when use cases enter this phase. Users can override these.
      </p>
      
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Staffing Ratio</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Vendor %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={Math.round(staffingRatio.vendor * 100)}
              onChange={(e) => handleVendorChange(Number(e.target.value))}
              data-testid="input-staffing-vendor"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Client %</Label>
            <Input
              type="number"
              value={Math.round(staffingRatio.client * 100)}
              disabled
              className="bg-muted"
              data-testid="input-staffing-client"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Adjust vendor percentage - client percentage auto-calculates to maintain 100% total.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Capability Transition Defaults</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hexaware FTS</Label>
            <Input
              type="number"
              value={defaults.capabilityTransition.hexawareFts ?? ''}
              onChange={(e) => updateCapability('hexawareFts', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-hexaware-fts"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Client FTS</Label>
            <Input
              type="number"
              value={defaults.capabilityTransition.clientFts ?? ''}
              onChange={(e) => updateCapability('clientFts', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-client-fts"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Independence %</Label>
            <Input
              type="number"
              value={defaults.capabilityTransition.independenceFts ?? ''}
              onChange={(e) => updateCapability('independenceFts', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-independence-fts"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Target Indep.</Label>
            <Input
              type="number"
              value={defaults.capabilityTransition.targetIndependence ?? ''}
              onChange={(e) => updateCapability('targetIndependence', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-target-independence"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Current Indep.</Label>
            <Input
              type="number"
              value={defaults.capabilityTransition.currentIndependence ?? ''}
              onChange={(e) => updateCapability('currentIndependence', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-current-independence"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Value Realization Defaults</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Expected Value Min ({currencySymbol})</Label>
            <Input
              type="number"
              value={defaults.valueRealization.expectedValueRangeMin ?? ''}
              onChange={(e) => updateValue('expectedValueRangeMin', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-value-min"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Expected Value Max ({currencySymbol})</Label>
            <Input
              type="number"
              value={defaults.valueRealization.expectedValueRangeMax ?? ''}
              onChange={(e) => updateValue('expectedValueRangeMax', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              data-testid="input-defaults-value-max"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Responsible AI Defaults</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Risk Tier</Label>
            <Select 
              value={defaults.responsibleAI.riskTier || ''} 
              onValueChange={(v) => updateRAI('riskTier', v || null)}
            >
              <SelectTrigger data-testid="select-defaults-risk-tier">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch
              id="defaults-assessment-required"
              checked={defaults.responsibleAI.assessmentRequired}
              onCheckedChange={(v) => updateRAI('assessmentRequired', v)}
              data-testid="toggle-defaults-assessment-required"
            />
            <Label htmlFor="defaults-assessment-required" className="text-sm">
              RAI Assessment Required
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhaseForm({ 
  formData, 
  setFormData, 
  governanceBodies,
  colors 
}: { 
  formData: PhaseFormData; 
  setFormData: React.Dispatch<React.SetStateAction<PhaseFormData>>;
  governanceBodies: TomGovernanceBody[];
  colors: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phase-name">Phase Name</Label>
        <Input
          id="phase-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Foundation, Build, Scale"
          data-testid="input-phase-name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phase-description">Description</Label>
        <Textarea
          id="phase-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what happens in this phase..."
          rows={2}
          data-testid="input-phase-description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-primary' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                data-testid={`color-${color}`}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phase-duration">Duration (weeks)</Label>
          <Input
            id="phase-duration"
            type="number"
            value={formData.expectedDurationWeeks ?? ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              expectedDurationWeeks: e.target.value ? parseInt(e.target.value) : null 
            }))}
            placeholder="Ongoing if empty"
            data-testid="input-phase-duration"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Governance Gate</Label>
        <Select 
          value={formData.governanceGate} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, governanceGate: v }))}
        >
          <SelectTrigger data-testid="select-governance-gate">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {governanceBodies.map(body => (
              <SelectItem key={body.id} value={body.id}>
                {body.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="manual-only"
          checked={formData.manualOnly}
          onChange={(e) => setFormData(prev => ({ ...prev, manualOnly: e.target.checked }))}
          className="rounded"
          data-testid="checkbox-manual-only"
        />
        <Label htmlFor="manual-only" className="text-sm">
          Manual assignment only (not auto-derived from status)
        </Label>
      </div>
    </div>
  );
}
