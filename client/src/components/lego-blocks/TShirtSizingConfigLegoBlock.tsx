import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '@/contexts/UseCaseContext';
import { 
  Shirt, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X,
  Settings,
  Target,
  AlertTriangle
} from 'lucide-react';

interface TShirtSize {
  name: string;
  minWeeks: number;
  maxWeeks: number;
  teamSizeMin: number;
  teamSizeMax: number;
  color: string;
  description?: string;
}

interface Role {
  type: string;
  dailyRateGBP: number;
}

interface MappingRule {
  name: string;
  condition: {
    impactMin?: number;
    impactMax?: number;
    effortMin?: number;
    effortMax?: number;
  };
  targetSize: string;
  priority: number;
}

interface TShirtSizingConfig {
  enabled: boolean;
  sizes: TShirtSize[];
  roles: Role[];
  overheadMultiplier: number;
  mappingRules: MappingRule[];
}

/**
 * LEGO Block: T-shirt Sizing Configuration Management
 * 
 * Features:
 * - Enable/disable T-shirt sizing feature
 * - Configure size definitions (XS-XL) with timelines and team sizes
 * - Manage role-based daily rates for cost calculation
 * - Configure impact/effort to size mapping rules
 * - Real-time configuration preview and validation
 * - Follows RSA branding and LEGO architecture principles
 */
export default function TShirtSizingConfigLegoBlock() {
  const { updateMetadata, metadata } = useUseCases();
  const { toast } = useToast();
  
  // Get current T-shirt sizing config or use defaults
  const getCurrentConfig = (): TShirtSizingConfig => {
    const defaultConfig: TShirtSizingConfig = {
      enabled: true,
      sizes: [
        { name: 'XS', minWeeks: 1, maxWeeks: 3, teamSizeMin: 1, teamSizeMax: 2, color: '#10B981', description: 'Quick fixes and small enhancements' },
        { name: 'S', minWeeks: 2, maxWeeks: 6, teamSizeMin: 2, teamSizeMax: 3, color: '#3B82F6', description: 'Small projects and proof of concepts' },
        { name: 'M', minWeeks: 4, maxWeeks: 12, teamSizeMin: 3, teamSizeMax: 5, color: '#F59E0B', description: 'Medium-sized initiatives' },
        { name: 'L', minWeeks: 8, maxWeeks: 24, teamSizeMin: 5, teamSizeMax: 8, color: '#EF4444', description: 'Large strategic projects' },
        { name: 'XL', minWeeks: 16, maxWeeks: 52, teamSizeMin: 8, teamSizeMax: 12, color: '#8B5CF6', description: 'Major transformation initiatives' }
      ],
      roles: [
        { type: 'Developer', dailyRateGBP: 400 },
        { type: 'Analyst', dailyRateGBP: 350 },
        { type: 'PM', dailyRateGBP: 500 }
      ],
      overheadMultiplier: 1.35,
      mappingRules: [
        { name: 'Quick Win - High Impact, Low Effort', condition: { impactMin: 3.5, effortMax: 2.5 }, targetSize: 'S', priority: 100 },
        { name: 'Strategic Bet - High Impact, Medium Effort', condition: { impactMin: 3.0, effortMin: 2.5, effortMax: 3.5 }, targetSize: 'M', priority: 90 },
        { name: 'Complex Strategic - High Impact, High Effort', condition: { impactMin: 2.5, effortMin: 3.5 }, targetSize: 'L', priority: 80 },
        { name: 'Small Experiment - Low to Medium Impact', condition: { impactMax: 3.0, effortMax: 3.0 }, targetSize: 'XS', priority: 70 }
      ]
    };

    if (metadata?.tShirtSizing) {
      try {
        return typeof metadata.tShirtSizing === 'string' 
          ? JSON.parse(metadata.tShirtSizing) 
          : metadata.tShirtSizing as TShirtSizingConfig;
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  };

  const [config, setConfig] = useState<TShirtSizingConfig>(getCurrentConfig);
  const [editingSize, setEditingSize] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<number | null>(null);

  // Update config when metadata changes
  useEffect(() => {
    setConfig(getCurrentConfig());
  }, [metadata?.tShirtSizing]);

  const saveConfig = async () => {
    try {
      await updateMetadata({
        ...metadata!,
        tShirtSizing: config
      });

      toast({
        title: "Configuration Saved",
        description: "T-shirt sizing configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save T-shirt sizing configuration.",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (updates: Partial<TShirtSizingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateSize = (index: number, updates: Partial<TShirtSize>) => {
    const newSizes = [...config.sizes];
    newSizes[index] = { ...newSizes[index], ...updates };
    updateConfig({ sizes: newSizes });
  };

  const updateRole = (index: number, updates: Partial<Role>) => {
    const newRoles = [...config.roles];
    newRoles[index] = { ...newRoles[index], ...updates };
    updateConfig({ roles: newRoles });
  };

  const updateRule = (index: number, updates: Partial<MappingRule>) => {
    const newRules = [...config.mappingRules];
    newRules[index] = { ...newRules[index], ...updates };
    updateConfig({ mappingRules: newRules });
  };

  const addSize = () => {
    const newSize: TShirtSize = {
      name: `Size${config.sizes.length + 1}`,
      minWeeks: 1,
      maxWeeks: 4,
      teamSizeMin: 1,
      teamSizeMax: 3,
      color: '#6B7280',
      description: 'New size'
    };
    updateConfig({ sizes: [...config.sizes, newSize] });
  };

  const removeSize = (index: number) => {
    const newSizes = config.sizes.filter((_, i) => i !== index);
    updateConfig({ sizes: newSizes });
  };

  const addRole = () => {
    const newRole: Role = { type: 'New Role', dailyRateGBP: 350 };
    updateConfig({ roles: [...config.roles, newRole] });
  };

  const removeRole = (index: number) => {
    const newRoles = config.roles.filter((_, i) => i !== index);
    updateConfig({ roles: newRoles });
  };

  const addRule = () => {
    const newRule: MappingRule = {
      name: 'New Rule',
      condition: { impactMin: 1.0, effortMax: 3.0 },
      targetSize: config.sizes[0]?.name || 'S',
      priority: 50
    };
    updateConfig({ mappingRules: [...config.mappingRules, newRule] });
  };

  const removeRule = (index: number) => {
    const newRules = config.mappingRules.filter((_, i) => i !== index);
    updateConfig({ mappingRules: newRules });
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shirt className="h-5 w-5 text-[#005DAA]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">T-shirt Sizing Configuration</CardTitle>
              <CardDescription>Configure project sizing, cost estimates, and mapping rules for RSA use cases</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="tshirt-enabled">Enable T-shirt Sizing</Label>
              <Switch
                id="tshirt-enabled"
                checked={config.enabled}
                onCheckedChange={(enabled) => updateConfig({ enabled })}
                data-testid="switch-enable-tshirt"
              />
            </div>
            <Button onClick={saveConfig} className="bg-[#005DAA] hover:bg-[#004494]" data-testid="button-save-config">
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {config.enabled ? (
          <Tabs defaultValue="sizes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sizes">Sizes</TabsTrigger>
              <TabsTrigger value="roles">Roles & Rates</TabsTrigger>
              <TabsTrigger value="rules">Mapping Rules</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Size Configuration */}
            <TabsContent value="sizes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">T-shirt Size Definitions</h4>
                <Button onClick={addSize} variant="outline" size="sm" data-testid="button-add-size">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Size
                </Button>
              </div>
              
              <div className="space-y-3">
                {config.sizes.map((size, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge style={{ backgroundColor: size.color }} className="text-white">
                          {size.name}
                        </Badge>
                        <span className="text-sm text-gray-600">{size.description}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setEditingSize(editingSize === index ? null : index)}
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-size-${index}`}
                        >
                          {editingSize === index ? <X className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                        </Button>
                        <Button
                          onClick={() => removeSize(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          data-testid={`button-delete-size-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingSize === index && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`size-name-${index}`}>Name</Label>
                          <Input
                            id={`size-name-${index}`}
                            value={size.name}
                            onChange={(e) => updateSize(index, { name: e.target.value })}
                            data-testid={`input-size-name-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`size-color-${index}`}>Color</Label>
                          <Input
                            id={`size-color-${index}`}
                            type="color"
                            value={size.color}
                            onChange={(e) => updateSize(index, { color: e.target.value })}
                            data-testid={`input-size-color-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`size-min-weeks-${index}`}>Min Weeks</Label>
                          <Input
                            id={`size-min-weeks-${index}`}
                            type="number"
                            value={size.minWeeks}
                            onChange={(e) => updateSize(index, { minWeeks: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-min-weeks-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`size-max-weeks-${index}`}>Max Weeks</Label>
                          <Input
                            id={`size-max-weeks-${index}`}
                            type="number"
                            value={size.maxWeeks}
                            onChange={(e) => updateSize(index, { maxWeeks: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-max-weeks-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`size-team-min-${index}`}>Min Team Size</Label>
                          <Input
                            id={`size-team-min-${index}`}
                            type="number"
                            value={size.teamSizeMin}
                            onChange={(e) => updateSize(index, { teamSizeMin: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-team-min-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`size-team-max-${index}`}>Max Team Size</Label>
                          <Input
                            id={`size-team-max-${index}`}
                            type="number"
                            value={size.teamSizeMax}
                            onChange={(e) => updateSize(index, { teamSizeMax: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-team-max-${index}`}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`size-description-${index}`}>Description</Label>
                          <Textarea
                            id={`size-description-${index}`}
                            value={size.description || ''}
                            onChange={(e) => updateSize(index, { description: e.target.value })}
                            data-testid={`textarea-size-description-${index}`}
                          />
                        </div>
                      </div>
                    )}
                    
                    {editingSize !== index && (
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {size.minWeeks}-{size.maxWeeks} weeks
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {size.teamSizeMin}-{size.teamSizeMax} people
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Role Configuration */}
            <TabsContent value="roles" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">Role-Based Daily Rates</h4>
                  <p className="text-sm text-gray-600">Configure daily rates for different team member types</p>
                </div>
                <Button onClick={addRole} variant="outline" size="sm" data-testid="button-add-role">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
              
              <div className="space-y-3">
                {config.roles.map((role, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{role.type}</span>
                        <Badge variant="outline">£{role.dailyRateGBP}/day</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setEditingRole(editingRole === index ? null : index)}
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-role-${index}`}
                        >
                          {editingRole === index ? <X className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                        </Button>
                        <Button
                          onClick={() => removeRole(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          data-testid={`button-delete-role-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingRole === index && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label htmlFor={`role-type-${index}`}>Role Type</Label>
                          <Input
                            id={`role-type-${index}`}
                            value={role.type}
                            onChange={(e) => updateRole(index, { type: e.target.value })}
                            data-testid={`input-role-type-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`role-rate-${index}`}>Daily Rate (GBP)</Label>
                          <Input
                            id={`role-rate-${index}`}
                            type="number"
                            value={role.dailyRateGBP}
                            onChange={(e) => updateRole(index, { dailyRateGBP: parseInt(e.target.value) || 0 })}
                            data-testid={`input-role-rate-${index}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-blue-800">Overhead Multiplier</h5>
                    <p className="text-sm text-blue-600">Additional cost factor for benefits, facilities, and management</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="overhead-multiplier">Multiplier (e.g., 1.35 = 35% overhead)</Label>
                  <Input
                    id="overhead-multiplier"
                    type="number"
                    step="0.1"
                    value={config.overheadMultiplier}
                    onChange={(e) => updateConfig({ overheadMultiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-32 mt-1"
                    data-testid="input-overhead-multiplier"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Mapping Rules */}
            <TabsContent value="rules" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">Impact/Effort Mapping Rules</h4>
                  <p className="text-sm text-gray-600">Configure how impact and effort scores map to T-shirt sizes</p>
                </div>
                <Button onClick={addRule} variant="outline" size="sm" data-testid="button-add-rule">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-3">
                {config.mappingRules.sort((a, b) => b.priority - a.priority).map((rule, index) => {
                  const actualIndex = config.mappingRules.findIndex(r => r === rule);
                  return (
                    <div key={actualIndex} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Priority {rule.priority}</Badge>
                          <span className="font-medium">{rule.name}</span>
                          <Badge style={{ backgroundColor: config.sizes.find(s => s.name === rule.targetSize)?.color || '#6B7280' }} className="text-white">
                            {rule.targetSize}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => setEditingRule(editingRule === actualIndex ? null : actualIndex)}
                            variant="outline"
                            size="sm"
                            data-testid={`button-edit-rule-${actualIndex}`}
                          >
                            {editingRule === actualIndex ? <X className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                          </Button>
                          <Button
                            onClick={() => removeRule(actualIndex)}
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            data-testid={`button-delete-rule-${actualIndex}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingRule !== actualIndex && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex gap-4">
                            {rule.condition.impactMin !== undefined && <span>Impact ≥ {rule.condition.impactMin}</span>}
                            {rule.condition.impactMax !== undefined && <span>Impact ≤ {rule.condition.impactMax}</span>}
                            {rule.condition.effortMin !== undefined && <span>Effort ≥ {rule.condition.effortMin}</span>}
                            {rule.condition.effortMax !== undefined && <span>Effort ≤ {rule.condition.effortMax}</span>}
                          </div>
                        </div>
                      )}
                      
                      {editingRule === actualIndex && (
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="col-span-2">
                            <Label htmlFor={`rule-name-${actualIndex}`}>Rule Name</Label>
                            <Input
                              id={`rule-name-${actualIndex}`}
                              value={rule.name}
                              onChange={(e) => updateRule(actualIndex, { name: e.target.value })}
                              data-testid={`input-rule-name-${actualIndex}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rule-impact-min-${actualIndex}`}>Impact Min (optional)</Label>
                            <Input
                              id={`rule-impact-min-${actualIndex}`}
                              type="number"
                              step="0.1"
                              value={rule.condition.impactMin || ''}
                              onChange={(e) => updateRule(actualIndex, { 
                                condition: { ...rule.condition, impactMin: e.target.value ? parseFloat(e.target.value) : undefined }
                              })}
                              data-testid={`input-rule-impact-min-${actualIndex}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rule-impact-max-${actualIndex}`}>Impact Max (optional)</Label>
                            <Input
                              id={`rule-impact-max-${actualIndex}`}
                              type="number"
                              step="0.1"
                              value={rule.condition.impactMax || ''}
                              onChange={(e) => updateRule(actualIndex, { 
                                condition: { ...rule.condition, impactMax: e.target.value ? parseFloat(e.target.value) : undefined }
                              })}
                              data-testid={`input-rule-impact-max-${actualIndex}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rule-effort-min-${actualIndex}`}>Effort Min (optional)</Label>
                            <Input
                              id={`rule-effort-min-${actualIndex}`}
                              type="number"
                              step="0.1"
                              value={rule.condition.effortMin || ''}
                              onChange={(e) => updateRule(actualIndex, { 
                                condition: { ...rule.condition, effortMin: e.target.value ? parseFloat(e.target.value) : undefined }
                              })}
                              data-testid={`input-rule-effort-min-${actualIndex}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rule-effort-max-${actualIndex}`}>Effort Max (optional)</Label>
                            <Input
                              id={`rule-effort-max-${actualIndex}`}
                              type="number"
                              step="0.1"
                              value={rule.condition.effortMax || ''}
                              onChange={(e) => updateRule(actualIndex, { 
                                condition: { ...rule.condition, effortMax: e.target.value ? parseFloat(e.target.value) : undefined }
                              })}
                              data-testid={`input-rule-effort-max-${actualIndex}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rule-target-size-${actualIndex}`}>Target Size</Label>
                            <select
                              id={`rule-target-size-${actualIndex}`}
                              value={rule.targetSize}
                              onChange={(e) => updateRule(actualIndex, { targetSize: e.target.value })}
                              className="w-full px-3 py-2 border rounded-md"
                              data-testid={`select-rule-target-size-${actualIndex}`}
                            >
                              {config.sizes.map(size => (
                                <option key={size.name} value={size.name}>{size.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`rule-priority-${actualIndex}`}>Priority (higher = checked first)</Label>
                            <Input
                              id={`rule-priority-${actualIndex}`}
                              type="number"
                              value={rule.priority}
                              onChange={(e) => updateRule(actualIndex, { priority: parseInt(e.target.value) || 0 })}
                              data-testid={`input-rule-priority-${actualIndex}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Preview */}
            <TabsContent value="preview" className="space-y-4">
              <div className="text-center py-4">
                <h4 className="font-semibold text-gray-800 mb-2">Configuration Preview</h4>
                <p className="text-sm text-gray-600">Review your T-shirt sizing configuration</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Size Overview */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-800">Size Definitions</h5>
                  {config.sizes.map((size, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge style={{ backgroundColor: size.color }} className="text-white">
                          {size.name}
                        </Badge>
                        <div className="text-sm">
                          <div>{size.minWeeks}-{size.maxWeeks} weeks</div>
                          <div className="text-gray-500">{size.teamSizeMin}-{size.teamSizeMax} people</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Cost Estimation Preview */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-800">Cost Estimation Examples</h5>
                  {config.sizes.map((size, index) => {
                    const avgTeamSize = (size.teamSizeMin + size.teamSizeMax) / 2;
                    const avgRate = config.roles.reduce((sum, role) => sum + role.dailyRateGBP, 0) / config.roles.length;
                    const dailyCost = avgRate * avgTeamSize * config.overheadMultiplier;
                    const minCost = Math.round(dailyCost * size.minWeeks * 5);
                    const maxCost = Math.round(dailyCost * size.maxWeeks * 5);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <Badge style={{ backgroundColor: size.color }} className="text-white">
                          {size.name}
                        </Badge>
                        <div className="text-sm font-medium">
                          £{minCost.toLocaleString()} - £{maxCost.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">Configuration Ready</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ {config.sizes.length} T-shirt sizes configured</li>
                      <li>✓ {config.roles.length} role types with daily rates</li>
                      <li>✓ {config.mappingRules.length} mapping rules defined</li>
                      <li>✓ {config.overheadMultiplier}x overhead multiplier set</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 mb-2">T-shirt Sizing Disabled</h4>
              <p className="text-sm text-gray-600 mb-4">
                Enable T-shirt sizing to configure project size estimates and cost calculations.
              </p>
              <Button 
                onClick={() => updateConfig({ enabled: true })} 
                variant="outline"
                data-testid="button-enable-tshirt-from-disabled"
              >
                Enable T-shirt Sizing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}