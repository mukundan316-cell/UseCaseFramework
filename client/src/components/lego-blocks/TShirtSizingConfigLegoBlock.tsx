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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  benefitMultipliers?: {
    [sizeName: string]: number;
  };
  benefitRangePct?: number;
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
        {
          name: 'XS',
          minWeeks: 2,
          maxWeeks: 4,
          teamSizeMin: 1,
          teamSizeMax: 2,
          color: '#10B981', // Green
          description: 'Simple automation or tool integration'
        },
        {
          name: 'S',
          minWeeks: 4,
          maxWeeks: 8,
          teamSizeMin: 2,
          teamSizeMax: 4,
          color: '#3B82F6', // Blue
          description: 'Basic ML model, RPA, or process optimization'
        },
        {
          name: 'M',
          minWeeks: 8,
          maxWeeks: 16,
          teamSizeMin: 3,
          teamSizeMax: 6,
          color: '#FBBF24', // Amber
          description: 'Advanced ML/NLP, data pipelines, multi-system integration'
        },
        {
          name: 'L',
          minWeeks: 16,
          maxWeeks: 26,
          teamSizeMin: 5,
          teamSizeMax: 10,
          color: '#EF4444', // Red
          description: 'Complex AI systems, agentic bots, cross-functional rollout'
        },
        {
          name: 'XL',
          minWeeks: 26,
          maxWeeks: 52,
          teamSizeMin: 8,
          teamSizeMax: 15,
          color: '#8B5CF6', // Purple
          description: 'Enterprise-wide transformation, end-to-end automation'
        }
      ],
      roles: [
        { type: 'Developer', dailyRateGBP: 400 },
        { type: 'Analyst', dailyRateGBP: 350 },
        { type: 'PM', dailyRateGBP: 500 },
        { type: 'Data Engineer', dailyRateGBP: 550 },
        { type: 'Architect', dailyRateGBP: 650 },
        { type: 'QA Engineer', dailyRateGBP: 300 }
      ],
      overheadMultiplier: 1.35, // 35% overhead for benefits, facilities, management
      mappingRules: [
        // TIER 1: Critical & High-Value Quick Wins (Highest Priority)
        {
          name: 'Critical Quick Fix',
          condition: { impactMin: 4.5, effortMax: 1.5 },
          targetSize: 'XS',
          priority: 150
        },
        {
          name: 'High-Value Quick Win', 
          condition: { impactMin: 4.0, effortMax: 2.5 },
          targetSize: 'S',
          priority: 140
        },
        {
          name: 'Strategic Quick Win',
          condition: { impactMin: 3.5, effortMax: 2.0 },
          targetSize: 'S',
          priority: 130
        },
        
        // TIER 2: Strategic Projects (High Priority)
        {
          name: 'Strategic Priority',
          condition: { impactMin: 4.0, effortMin: 2.5, effortMax: 3.5 },
          targetSize: 'M',
          priority: 120
        },
        {
          name: 'Major Strategic Bet',
          condition: { impactMin: 4.0, effortMin: 3.5, effortMax: 4.5 },
          targetSize: 'L',
          priority: 110
        },
        {
          name: 'Complex Strategic',
          condition: { impactMin: 3.5, effortMin: 4.5 },
          targetSize: 'XL',
          priority: 105
        },
        
        // TIER 3: Standard Projects (Medium Priority)
        {
          name: 'Standard Quick Win',
          condition: { impactMin: 3.0, effortMax: 2.5 },
          targetSize: 'S',
          priority: 100
        },
        {
          name: 'Important Project',
          condition: { impactMin: 3.5, effortMin: 2.0, effortMax: 3.5 },
          targetSize: 'M',
          priority: 95
        },
        {
          name: 'Strategic Project',
          condition: { impactMin: 3.0, effortMin: 3.5, effortMax: 4.5 },
          targetSize: 'L',
          priority: 90
        },
        
        // TIER 4: Medium-Impact Projects (Lower Priority)
        {
          name: 'Standard Project',
          condition: { impactMin: 2.5, effortMin: 2.5, effortMax: 3.5 },
          targetSize: 'M',
          priority: 80
        },
        {
          name: 'Complex Standard',
          condition: { impactMin: 2.5, effortMin: 3.5, effortMax: 4.5 },
          targetSize: 'M',
          priority: 75
        },
        {
          name: 'Resource-Heavy Project',
          condition: { impactMin: 2.5, effortMin: 4.5 },
          targetSize: 'L',
          priority: 70
        },
        
        // TIER 5: Small Tasks & Maintenance (Routine Work)
        {
          name: 'Small Project',
          condition: { impactMin: 2.0, effortMin: 1.5, effortMax: 2.5 },
          targetSize: 'S',
          priority: 65
        },
        {
          name: 'Maintenance Project',
          condition: { impactMax: 2.5, effortMin: 2.5, effortMax: 3.5 },
          targetSize: 'S',
          priority: 60
        },
        {
          name: 'Questionable Investment',
          condition: { impactMax: 2.5, effortMin: 3.5, effortMax: 4.5 },
          targetSize: 'M',
          priority: 55
        },
        
        // TIER 6: Money Pits & Poor Investments (Lowest Priority)
        {
          name: 'Low-Value Money Pit',
          condition: { impactMax: 2.5, effortMin: 4.5 },
          targetSize: 'XL',
          priority: 40
        },
        {
          name: 'Major Money Pit',
          condition: { impactMax: 1.5, effortMin: 3.5 },
          targetSize: 'XL',
          priority: 35
        },
        
        // TIER 7: Minor Tasks (Catch-All)
        {
          name: 'Minor Enhancement',
          condition: { impactMin: 2.0, effortMax: 1.5 },
          targetSize: 'XS',
          priority: 30
        },
        {
          name: 'Small Maintenance',
          condition: { impactMax: 2.0, effortMax: 2.5 },
          targetSize: 'XS',
          priority: 25
        },
        {
          name: 'Low-Value Work',
          condition: { impactMax: 1.5, effortMax: 3.5 },
          targetSize: 'S',
          priority: 20
        },
        
        // FINAL FALLBACK: Absolute Minimum
        {
          name: 'Trivial Task',
          condition: {},
          targetSize: 'XS',
          priority: 10
        }
      ],
      benefitMultipliers: {
        'XS': 20000,  // £4K per impact point - minor fixes, quick enhancements
        'S': 40000,   // £8K per impact point - quick wins, small projects  
        'M': 75000,   // £15K per impact point - standard medium projects
        'L': 150000,  // £30K per impact point - large strategic initiatives
        'XL': 300000  // £60K per impact point - major transformations
      },
      benefitRangePct: 0.20
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [exampleImpactScore, setExampleImpactScore] = useState(4);

  // Update config when metadata changes
  useEffect(() => {
    setConfig(getCurrentConfig());
  }, [metadata?.tShirtSizing]);

  // Validation functions
  const validateConfig = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate sizes
    config.sizes.forEach((size, index) => {
      if (!size.name.trim()) {
        errors[`size-name-${index}`] = 'Size name is required';
      }
      if (size.minWeeks < 1) {
        errors[`size-min-weeks-${index}`] = 'Minimum weeks must be at least 1';
      }
      if (size.maxWeeks < size.minWeeks) {
        errors[`size-max-weeks-${index}`] = 'Maximum weeks must be greater than minimum';
      }
      if (size.teamSizeMin < 1) {
        errors[`size-team-min-${index}`] = 'Minimum team size must be at least 1';
      }
      if (size.teamSizeMax < size.teamSizeMin) {
        errors[`size-team-max-${index}`] = 'Maximum team size must be greater than minimum';
      }
      if (!size.color.match(/^#[0-9A-F]{6}$/i)) {
        errors[`size-color-${index}`] = 'Invalid color format';
      }
    });

    // Validate roles
    config.roles.forEach((role, index) => {
      if (!role.type.trim()) {
        errors[`role-type-${index}`] = 'Role type is required';
      }
      if (role.dailyRateGBP < 1) {
        errors[`role-rate-${index}`] = 'Daily rate must be at least £1';
      }
      if (role.dailyRateGBP > 2000) {
        errors[`role-rate-${index}`] = 'Daily rate seems unusually high (max £2000)';
      }
    });

    // Validate overhead multiplier
    if (config.overheadMultiplier < 0.5 || config.overheadMultiplier > 3.0) {
      errors['overhead-multiplier'] = 'Overhead multiplier should be between 0.5 and 3.0';
    }

    // Validate benefit multiplier progression
    if (config.benefitMultipliers) {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL'];
      const availableSizes = sizeOrder.filter(size => config.benefitMultipliers?.[size]);
      
      for (let i = 1; i < availableSizes.length; i++) {
        const currentSize = availableSizes[i];
        const previousSize = availableSizes[i-1];
        const currentMultiplier = config.benefitMultipliers[currentSize];
        const previousMultiplier = config.benefitMultipliers[previousSize];
        
        if (currentMultiplier < previousMultiplier) {
          errors['benefit-progression'] = `Benefit multipliers should increase with size. ${currentSize} (£${(currentMultiplier/1000).toFixed(0)}K) should be greater than ${previousSize} (£${(previousMultiplier/1000).toFixed(0)}K)`;
          break;
        }
      }
    }

    // Validate mapping rules
    config.mappingRules.forEach((rule, index) => {
      if (!rule.name.trim()) {
        errors[`rule-name-${index}`] = 'Rule name is required';
      }
      if (!config.sizes.find(s => s.name === rule.targetSize)) {
        errors[`rule-target-${index}`] = 'Target size must match an existing size';
      }
      if (rule.priority < 1 || rule.priority > 100) {
        errors[`rule-priority-${index}`] = 'Priority must be between 1 and 100';
      }
      
      // Validate condition ranges
      const { condition } = rule;
      if (condition.impactMin !== undefined && (condition.impactMin < 1 || condition.impactMin > 5)) {
        errors[`rule-impact-min-${index}`] = 'Impact minimum must be between 1 and 5';
      }
      if (condition.impactMax !== undefined && (condition.impactMax < 1 || condition.impactMax > 5)) {
        errors[`rule-impact-max-${index}`] = 'Impact maximum must be between 1 and 5';
      }
      if (condition.effortMin !== undefined && (condition.effortMin < 1 || condition.effortMin > 5)) {
        errors[`rule-effort-min-${index}`] = 'Effort minimum must be between 1 and 5';
      }
      if (condition.effortMax !== undefined && (condition.effortMax < 1 || condition.effortMax > 5)) {
        errors[`rule-effort-max-${index}`] = 'Effort maximum must be between 1 and 5';
      }
      if (condition.impactMin !== undefined && condition.impactMax !== undefined && condition.impactMin > condition.impactMax) {
        errors[`rule-impact-range-${index}`] = 'Impact minimum cannot be greater than maximum';
      }
      if (condition.effortMin !== undefined && condition.effortMax !== undefined && condition.effortMin > condition.effortMax) {
        errors[`rule-effort-range-${index}`] = 'Effort minimum cannot be greater than maximum';
      }
    });

    // Check for duplicate size names
    const sizeNames = config.sizes.map(s => s.name.toLowerCase());
    const duplicateNames = sizeNames.filter((name, index) => sizeNames.indexOf(name) !== index);
    duplicateNames.forEach(name => {
      const index = config.sizes.findIndex(s => s.name.toLowerCase() === name);
      if (index !== -1) {
        errors[`size-name-${index}`] = 'Size name must be unique';
      }
    });

    // Check for duplicate role types
    const roleTypes = config.roles.map(r => r.type.toLowerCase());
    const duplicateTypes = roleTypes.filter((type, index) => roleTypes.indexOf(type) !== index);
    duplicateTypes.forEach(type => {
      const index = config.roles.findIndex(r => r.type.toLowerCase() === type);
      if (index !== -1) {
        errors[`role-type-${index}`] = 'Role type must be unique';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveConfig = async () => {
    if (!validateConfig()) {
      toast({
        title: "Validation Failed",
        description: "Please fix the validation errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateMetadata({
        ...metadata!,
        tShirtSizing: config
      });

      toast({
        title: "Configuration Saved",
        description: "T-shirt sizing configuration has been updated successfully.",
      });
      setValidationErrors({});
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save T-shirt sizing configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  const handleRemoveSize = (index: number) => {
    if (config.sizes.length <= 1) {
      toast({
        title: "Cannot Remove Size",
        description: "At least one T-shirt size must be configured.",
        variant: "destructive",
      });
      return;
    }
    const newSizes = config.sizes.filter((_, i) => i !== index);
    updateConfig({ sizes: newSizes });
    // Clear validation errors for removed size
    const newErrors = { ...validationErrors };
    Object.keys(newErrors).forEach(key => {
      if (key.includes(`-${index}`)) {
        delete newErrors[key];
      }
    });
    setValidationErrors(newErrors);
    toast({
      title: "Size Removed",
      description: `Size "${config.sizes[index]?.name}" has been removed.`,
    });
  };

  const addRole = () => {
    const newRole: Role = { type: 'New Role', dailyRateGBP: 350 };
    updateConfig({ roles: [...config.roles, newRole] });
  };

  const handleRemoveRole = (index: number) => {
    if (config.roles.length <= 1) {
      toast({
        title: "Cannot Remove Role",
        description: "At least one role must be configured for cost calculations.",
        variant: "destructive",
      });
      return;
    }
    const newRoles = config.roles.filter((_, i) => i !== index);
    updateConfig({ roles: newRoles });
    // Clear validation errors for removed role
    const newErrors = { ...validationErrors };
    Object.keys(newErrors).forEach(key => {
      if (key.includes(`role-`) && key.includes(`-${index}`)) {
        delete newErrors[key];
      }
    });
    setValidationErrors(newErrors);
    toast({
      title: "Role Removed",
      description: `Role "${config.roles[index]?.type}" has been removed.`,
    });
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

  const handleRemoveRule = (index: number) => {
    const newRules = config.mappingRules.filter((_, i) => i !== index);
    updateConfig({ mappingRules: newRules });
    toast({
      title: "Rule Removed",
      description: `Mapping rule "${config.mappingRules[index]?.name}" has been removed.`,
    });
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
            <Button 
              onClick={saveConfig} 
              disabled={isSaving}
              className="bg-[#005DAA] hover:bg-[#004494] disabled:opacity-50" 
              data-testid="button-save-config"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {config.enabled ? (
          <Tabs defaultValue="sizes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="sizes">Sizes</TabsTrigger>
              <TabsTrigger value="roles">Roles & Rates</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              data-testid={`button-delete-size-${index}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove T-shirt Size</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove size "{size.name}"? This action cannot be undone and may affect existing mapping rules.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveSize(index)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Size
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                            className={validationErrors[`size-name-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`size-name-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`size-name-${index}`]}</p>
                          )}
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
                            min="1"
                            value={size.minWeeks}
                            onChange={(e) => updateSize(index, { minWeeks: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-min-weeks-${index}`}
                            className={validationErrors[`size-min-weeks-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`size-min-weeks-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`size-min-weeks-${index}`]}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`size-max-weeks-${index}`}>Max Weeks</Label>
                          <Input
                            id={`size-max-weeks-${index}`}
                            type="number"
                            min="1"
                            value={size.maxWeeks}
                            onChange={(e) => updateSize(index, { maxWeeks: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-max-weeks-${index}`}
                            className={validationErrors[`size-max-weeks-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`size-max-weeks-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`size-max-weeks-${index}`]}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`size-team-min-${index}`}>Min Team Size</Label>
                          <Input
                            id={`size-team-min-${index}`}
                            type="number"
                            min="1"
                            value={size.teamSizeMin}
                            onChange={(e) => updateSize(index, { teamSizeMin: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-team-min-${index}`}
                            className={validationErrors[`size-team-min-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`size-team-min-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`size-team-min-${index}`]}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`size-team-max-${index}`}>Max Team Size</Label>
                          <Input
                            id={`size-team-max-${index}`}
                            type="number"
                            min="1"
                            value={size.teamSizeMax}
                            onChange={(e) => updateSize(index, { teamSizeMax: parseInt(e.target.value) || 1 })}
                            data-testid={`input-size-team-max-${index}`}
                            className={validationErrors[`size-team-max-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`size-team-max-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`size-team-max-${index}`]}</p>
                          )}
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

            {/* Benefit Configuration */}
            <TabsContent value="benefits" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">Annual Benefit Multipliers</h4>
                  <p className="text-sm text-gray-600">Configure benefit multipliers per T-shirt size for annual benefit calculations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.sizes.map((size, index) => {
                  const getDefaultMultiplier = (sizeName: string) => {
                    switch(sizeName) {
                      case 'XS': return 25000;
                      case 'S': return 50000;
                      case 'M': return 100000;
                      case 'L': return 200000;
                      case 'XL': return 400000;
                      default: return 50000;
                    }
                  };
                  const multiplier = config.benefitMultipliers?.[size.name] || getDefaultMultiplier(size.name);
                  return (
                    <div key={size.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge style={{ backgroundColor: size.color }} className="text-white">
                            {size.name}
                          </Badge>
                          <span className="text-sm text-gray-600">{size.description}</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`benefit-multiplier-${size.name}`}>Benefit per Impact Point (GBP)</Label>
                        <Input
                          id={`benefit-multiplier-${size.name}`}
                          type="number"
                          min="1000"
                          max="500000"
                          step="1000"
                          value={multiplier}
                          onChange={(e) => {
                            const newMultipliers = {
                              ...config.benefitMultipliers,
                              [size.name]: parseInt(e.target.value) || 0
                            };
                            updateConfig({ benefitMultipliers: newMultipliers });
                          }}
                          data-testid={`input-benefit-multiplier-${size.name}`}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          £{(multiplier / 1000).toFixed(0)}K per impact point
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-blue-800">Benefit Range Percentage</h5>
                    <p className="text-sm text-blue-600">Variation range applied to base benefit calculations (±%)</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="benefit-range-pct">Range Percentage (e.g., 0.20 = ±20%)</Label>
                  <Input
                    id="benefit-range-pct"
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.50"
                    value={config.benefitRangePct || 0.20}
                    onChange={(e) => updateConfig({ benefitRangePct: parseFloat(e.target.value) || 0.20 })}
                    className="w-32 mt-1"
                    data-testid="input-benefit-range-pct"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: ±{((config.benefitRangePct || 0.20) * 100).toFixed(0)}% variation
                  </p>
                </div>
              </div>
              
              {/* Benefit Calculation Preview */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-800">Benefit Estimation Examples</h5>
                <div className="text-xs text-gray-600 mb-2">
                  Examples shown for different Impact Scores
                </div>
                
                {/* Impact Score Selector for Examples */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">Impact Score:</span>
                  {[2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      onClick={() => setExampleImpactScore(score)}
                      className={`px-2 py-1 text-xs rounded ${
                        exampleImpactScore === score 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {score}.0
                    </button>
                  ))}
                </div>
                
                {config.sizes.map((size, index) => {
                  const getDefaultMultiplier = (sizeName: string) => {
                    switch(sizeName) {
                      case 'XS': return 25000;
                      case 'S': return 50000;
                      case 'M': return 100000;
                      case 'L': return 200000;
                      case 'XL': return 400000;
                      default: return 50000;
                    }
                  };
                  const multiplier = config.benefitMultipliers?.[size.name] || getDefaultMultiplier(size.name);
                  const rangePct = config.benefitRangePct || 0.20;
                  const baseBenefit = exampleImpactScore * multiplier;
                  const minBenefit = Math.round((baseBenefit * (1 - rangePct)) / 1000) * 1000;
                  const maxBenefit = Math.round((baseBenefit * (1 + rangePct)) / 1000) * 1000;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <Badge style={{ backgroundColor: size.color }} className="text-white">
                        {size.name}
                      </Badge>
                      <div className="text-sm font-medium">
                        £{(minBenefit/1000).toFixed(0)}K - £{(maxBenefit/1000).toFixed(0)}K
                      </div>
                    </div>
                  );
                })}
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              data-testid={`button-delete-role-${index}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove role "{role.type}"? This action cannot be undone and will affect cost calculations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveRole(index)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Role
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                            className={validationErrors[`role-type-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`role-type-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`role-type-${index}`]}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`role-rate-${index}`}>Daily Rate (GBP)</Label>
                          <Input
                            id={`role-rate-${index}`}
                            type="number"
                            min="1"
                            max="2000"
                            value={role.dailyRateGBP}
                            onChange={(e) => updateRole(index, { dailyRateGBP: parseInt(e.target.value) || 0 })}
                            data-testid={`input-role-rate-${index}`}
                            className={validationErrors[`role-rate-${index}`] ? 'border-red-500' : ''}
                          />
                          {validationErrors[`role-rate-${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`role-rate-${index}`]}</p>
                          )}
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
                    min="0.5"
                    max="3.0"
                    value={config.overheadMultiplier}
                    onChange={(e) => updateConfig({ overheadMultiplier: parseFloat(e.target.value) || 1.0 })}
                    className={`w-32 mt-1 ${validationErrors['overhead-multiplier'] ? 'border-red-500' : ''}`}
                    data-testid="input-overhead-multiplier"
                  />
                  {validationErrors['overhead-multiplier'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['overhead-multiplier']}</p>
                  )}
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                data-testid={`button-delete-rule-${actualIndex}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Mapping Rule</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove mapping rule "{rule.name}"? This action cannot be undone and may affect how use cases are sized.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveRule(actualIndex)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Rule
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                      <li>✓ {Object.keys(config.benefitMultipliers || {}).length} benefit multipliers set</li>
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