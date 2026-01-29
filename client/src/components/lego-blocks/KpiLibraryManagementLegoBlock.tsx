import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  Target, 
  Edit, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Percent,
  Clock,
  DollarSign,
  Info,
  CheckCircle2,
  XCircle,
  FileSearch,
  ClipboardCheck,
  FileText,
  Users,
  Calculator,
  Activity,
  Database,
  Shield,
  UserCheck,
  Lightbulb,
  Handshake,
  Sparkles,
  Server,
  Lock,
  Smile,
  Settings,
  Layers,
  Filter
} from 'lucide-react';
import type { KpiDefinition, IndustryBenchmark, MaturityRule, KpiCategoryId } from '@shared/valueRealization';
import { KPI_CATEGORIES, getCategoryName } from '@shared/valueRealization';

interface ValueConfig {
  enabled: string;
  kpiLibrary: Record<string, KpiDefinition>;
}

const MATURITY_LEVEL_ORDER = ['advanced', 'developing', 'foundational'] as const;

type ValueChainFilter = 'all' | 'insurance' | 'enterprise';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  underwriting: FileSearch,
  claims: ClipboardCheck,
  policy_admin: FileText,
  distribution: Users,
  finance_actuarial: Calculator,
  model_performance: Activity,
  data_quality: Database,
  tech_debt: Shield,
  talent: UserCheck,
  innovation: Lightbulb,
  business_alignment: Handshake,
  genai: Sparkles,
  it_infra: Server,
  security: Lock,
  customer_exp: Smile,
  operational_eff: Settings,
};

function getCategoryIcon(categoryId: string): React.ComponentType<{ className?: string }> {
  return CATEGORY_ICONS[categoryId] || Target;
}

function findMaturityRule(rules: MaturityRule[] | undefined, level: string): MaturityRule | undefined {
  return rules?.find(r => r.level === level);
}

function getUnitIcon(unit: string) {
  if (unit === '%') return <Percent className="h-4 w-4" />;
  if (unit.toLowerCase().includes('gbp') || unit.toLowerCase().includes('£')) return <DollarSign className="h-4 w-4" />;
  if (unit.toLowerCase().includes('min') || unit.toLowerCase().includes('hour')) return <Clock className="h-4 w-4" />;
  return <Target className="h-4 w-4" />;
}

function getDirectionBadge(direction: 'increase' | 'decrease') {
  if (direction === 'increase') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <TrendingUp className="h-3 w-3 mr-1" />
        Increase
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      <TrendingDown className="h-3 w-3 mr-1" />
      Decrease
    </Badge>
  );
}

interface KpiCardProps {
  kpiId: string;
  kpi: KpiDefinition;
  onEdit: (kpiId: string) => void;
}

function KpiCard({ kpiId, kpi, onEdit }: KpiCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const benchmarkCount = Object.keys(kpi.industryBenchmarks || {}).length;
  const processCount = kpi.applicableProcesses?.length || 0;

  return (
    <Card className="hover-elevate" data-testid={`kpi-card-${kpiId}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getUnitIcon(kpi.unit)}
                <CardTitle className="text-base">{kpi.name}</CardTitle>
              </div>
              <CardDescription className="mt-1 text-sm">
                {kpi.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getDirectionBadge(kpi.direction)}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onEdit(kpiId)}
                data-testid={`button-edit-kpi-${kpiId}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-2">
            {processCount > 0 ? (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{processCount} processes</span>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                Org-wide
              </Badge>
            )}
            {benchmarkCount > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{benchmarkCount} benchmarks</span>
              </div>
            )}
            <Badge variant="secondary" className="text-xs">
              Unit: {kpi.unit}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                kpi.kpiType === 'financial' ? 'bg-green-50 text-green-700 border-green-200' :
                kpi.kpiType === 'operational' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                kpi.kpiType === 'strategic' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              {kpi.kpiType || 'financial'}
            </Badge>
            {kpi.valueStream && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                {kpi.valueStream.replace(/_/g, ' ')}
              </Badge>
            )}
            {kpi.isMonetizable === false && (
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                Non-monetary
              </Badge>
            )}
            {kpi.benchmark && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                Target: {kpi.benchmark}
              </Badge>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs">
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-3 space-y-4">
            {/* Applicable Processes */}
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Applicable Processes</h5>
              <div className="flex flex-wrap gap-1">
                {kpi.applicableProcesses?.slice(0, 6).map((process) => (
                  <Badge key={process} variant="outline" className="text-xs">
                    {process}
                  </Badge>
                ))}
                {(kpi.applicableProcesses?.length || 0) > 6 && (
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    +{(kpi.applicableProcesses?.length || 0) - 6} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Industry Benchmarks */}
            {kpi.industryBenchmarks && Object.keys(kpi.industryBenchmarks).length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Industry Benchmarks</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(kpi.industryBenchmarks).slice(0, 4).map(([process, benchmark]) => (
                    <div key={process} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium text-gray-800">{process}</div>
                      <div className="text-gray-600 mt-1">
                        Baseline: {benchmark.baselineValue} {benchmark.baselineUnit}
                        <span className="ml-2 text-gray-400">• {benchmark.baselineSource}</span>
                      </div>
                      <div className="text-gray-600">
                        Improvement: {benchmark.improvementRange.min}-{benchmark.improvementRange.max}{benchmark.improvementUnit}
                      </div>
                    </div>
                  ))}
                  {Object.keys(kpi.industryBenchmarks).length > 4 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{Object.keys(kpi.industryBenchmarks).length - 4} more benchmarks
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Maturity Rules */}
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Maturity Tier Ranges</h5>
              <div className="grid grid-cols-3 gap-2">
                {MATURITY_LEVEL_ORDER.map((level) => {
                  const rule = findMaturityRule(kpi.maturityRules, level);
                  return (
                    <div key={level} className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs font-medium capitalize text-gray-700">{level}</div>
                      <div className="text-xs text-gray-600">
                        {rule ? `${rule.range.min}-${rule.range.max}%` : '-'}
                      </div>
                      {rule && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {rule.confidence} confidence
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

interface KpiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiId: string | null;
  kpi: KpiDefinition | null;
  allProcesses: string[];
  onSave: (kpiId: string, updates: Partial<KpiDefinition>) => void;
  isNew?: boolean;
}

function KpiEditModal({ isOpen, onClose, kpiId, kpi, allProcesses, onSave, isNew }: KpiEditModalProps) {
  const [formData, setFormData] = useState<Partial<KpiDefinition>>({});

  useEffect(() => {
    if (!isOpen) return;
    
    if (kpi) {
      setFormData({
        name: kpi.name,
        description: kpi.description,
        unit: kpi.unit,
        direction: kpi.direction,
        applicableProcesses: kpi.applicableProcesses || [],
        maturityRules: kpi.maturityRules,
        kpiType: kpi.kpiType || 'financial',
        valueStream: kpi.valueStream,
        isMonetizable: kpi.isMonetizable ?? true,
        monetizationFormula: kpi.monetizationFormula,
        aggregationMethod: kpi.aggregationMethod || 'sum',
        categoryId: kpi.categoryId,
        benchmark: kpi.benchmark,
      });
    } else if (isNew) {
      setFormData({
        name: '',
        description: '',
        unit: '%',
        direction: 'increase',
        applicableProcesses: [],
        maturityRules: [
          { level: 'advanced', conditions: { dataReadiness: { min: 4 } }, range: { min: 40, max: 60 }, confidence: 'high' },
          { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 20, max: 40 }, confidence: 'medium' },
          { level: 'foundational', conditions: {}, range: { min: 5, max: 20 }, confidence: 'low' },
        ],
        kpiType: 'financial',
        isMonetizable: true,
        aggregationMethod: 'sum',
        categoryId: 'operational_eff',
      });
    }
  }, [isOpen, kpiId, isNew, kpi]);

  const handleSave = () => {
    if (kpiId && formData.name) {
      onSave(kpiId, formData);
      onClose();
    }
  };

  const toggleProcess = (process: string) => {
    const current = formData.applicableProcesses || [];
    if (current.includes(process)) {
      setFormData({
        ...formData,
        applicableProcesses: current.filter(p => p !== process),
      });
    } else {
      setFormData({
        ...formData,
        applicableProcesses: [...current, process],
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Add New KPI' : `Edit KPI: ${kpi?.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kpi-name">KPI Name</Label>
              <Input
                id="kpi-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cycle Time Reduction"
                data-testid="input-kpi-name"
              />
            </div>
            <div>
              <Label htmlFor="kpi-category">Category</Label>
              <Select
                value={formData.categoryId || ''}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value as KpiCategoryId })}
              >
                <SelectTrigger data-testid="select-kpi-category">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Insurance Value Chain</SelectLabel>
                    {KPI_CATEGORIES.filter(c => c.valueChain === 'insurance').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Enterprise / AI Operations</SelectLabel>
                    {KPI_CATEGORIES.filter(c => c.valueChain === 'enterprise').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kpi-unit">Unit</Label>
              <Select
                value={formData.unit || '%'}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger data-testid="select-kpi-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">Percentage (%)</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="hours/month">Hours/Month</SelectItem>
                  <SelectItem value="ms">Milliseconds</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="count/week">Count/Week</SelectItem>
                  <SelectItem value="count/quarter">Count/Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kpi-benchmark">Benchmark Target</Label>
              <Input
                id="kpi-benchmark"
                value={formData.benchmark || ''}
                onChange={(e) => setFormData({ ...formData, benchmark: e.target.value })}
                placeholder="e.g., 90-95% accuracy"
                data-testid="input-kpi-benchmark"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="kpi-description">Description</Label>
            <Textarea
              id="kpi-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this KPI measures..."
              rows={2}
              data-testid="input-kpi-description"
            />
          </div>

          <div>
            <Label>Direction</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={formData.direction === 'increase' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, direction: 'increase' })}
                data-testid="button-direction-increase"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Increase is Better
              </Button>
              <Button
                type="button"
                variant={formData.direction === 'decrease' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, direction: 'decrease' })}
                data-testid="button-direction-decrease"
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Decrease is Better
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kpi-type">KPI Type</Label>
              <Select
                value={formData.kpiType || 'financial'}
                onValueChange={(value) => setFormData({ ...formData, kpiType: value as any })}
              >
                <SelectTrigger data-testid="select-kpi-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">How this KPI's value is categorized</p>
            </div>
            <div>
              <Label htmlFor="value-stream">Value Stream</Label>
              <Select
                value={formData.valueStream || ''}
                onValueChange={(value) => setFormData({ ...formData, valueStream: value as any || undefined })}
              >
                <SelectTrigger data-testid="select-value-stream">
                  <SelectValue placeholder="Select value stream..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational_savings">Operational Savings</SelectItem>
                  <SelectItem value="cor_improvement">COR Improvement</SelectItem>
                  <SelectItem value="revenue_uplift">Revenue Uplift</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Insurance portfolio classification</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aggregation-method">Aggregation Method</Label>
              <Select
                value={formData.aggregationMethod || 'sum'}
                onValueChange={(value) => setFormData({ ...formData, aggregationMethod: value as any })}
              >
                <SelectTrigger data-testid="select-aggregation-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum (total across use cases)</SelectItem>
                  <SelectItem value="average">Average (mean value)</SelectItem>
                  <SelectItem value="latest">Latest (most recent value)</SelectItem>
                  <SelectItem value="none">None (track individually)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monetizable</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant={formData.isMonetizable ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, isMonetizable: true })}
                  data-testid="button-monetizable-yes"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!formData.isMonetizable ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, isMonetizable: false })}
                  data-testid="button-monetizable-no"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  No
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Can be converted to GBP value?</p>
            </div>
          </div>

          {formData.isMonetizable && (
            <div>
              <Label htmlFor="monetization-formula">Monetization Formula</Label>
              <Input
                id="monetization-formula"
                value={formData.monetizationFormula || ''}
                onChange={(e) => setFormData({ ...formData, monetizationFormula: e.target.value })}
                placeholder="e.g., hours_saved * 75"
                data-testid="input-monetization-formula"
              />
              <p className="text-xs text-gray-500 mt-1">Formula to convert KPI value to GBP (optional)</p>
            </div>
          )}

          <div>
            <Label>Applicable Processes</Label>
            <p className="text-xs text-gray-500 mb-2">Select which business processes this KPI applies to</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
              {allProcesses.map((process) => {
                const isSelected = formData.applicableProcesses?.includes(process);
                return (
                  <button
                    key={process}
                    type="button"
                    onClick={() => toggleProcess(process)}
                    className={`flex items-center gap-2 p-2 rounded text-left text-sm ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200 text-blue-800' 
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    data-testid={`toggle-process-${process.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{process}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Maturity Tier Ranges</Label>
            <p className="text-xs text-gray-500 mb-2">Expected improvement range at each maturity level (read-only)</p>
            <div className="grid grid-cols-3 gap-3">
              {MATURITY_LEVEL_ORDER.map((level) => {
                const rule = formData.maturityRules?.find(r => r.level === level);
                return (
                  <div key={level} className="p-2 bg-gray-50 rounded border">
                    <Label className="text-xs capitalize font-medium">{level}</Label>
                    <div className="text-sm text-gray-700 mt-1">
                      {rule ? `${rule.range.min}-${rule.range.max}%` : 'Not configured'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rule?.confidence || '-'} confidence
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Maturity rules define how value estimates scale based on use case readiness scores.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-kpi">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-kpi">
            {isNew ? 'Add KPI' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface KpiLibraryManagementLegoBlockProps {
  className?: string;
}

export default function KpiLibraryManagementLegoBlock({ className }: KpiLibraryManagementLegoBlockProps) {
  const { toast } = useToast();
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [valueChainFilter, setValueChainFilter] = useState<ValueChainFilter>('all');

  const { data: valueConfig, isLoading } = useQuery<ValueConfig>({
    queryKey: ['/api/value/config'],
  });

  const { data: metadata } = useQuery<{ processes?: string[] }>({
    queryKey: ['/api/metadata'],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<ValueConfig>) => {
      return apiRequest('/api/value/config', {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/value/config'] });
      toast({
        title: 'KPI Library Updated',
        description: 'Your changes have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Saving Changes',
        description: 'Failed to update KPI library. Please try again.',
        variant: 'destructive',
      });
      console.error('Failed to update KPI config:', error);
    },
  });

  const kpiLibrary = valueConfig?.kpiLibrary || {};
  const allProcesses = metadata?.processes || [
    'Claims Management',
    'Underwriting & Triage',
    'Submission & Quote',
    'Risk Consulting',
    'Reinsurance',
    'Regulatory & Compliance',
    'Financial Management',
    'Sales & Distribution (Including Broker Relationships)',
    'Customer Servicing',
    'Policy Servicing',
    'Billing',
    'General',
    'Product & Rating',
    'Human Resources',
  ];

  // Group KPIs by category and filter by value chain
  const groupedKpis = useMemo(() => {
    const kpiEntries = Object.entries(kpiLibrary);
    
    // Filter by value chain
    const filteredKpis = kpiEntries.filter(([, kpi]) => {
      if (valueChainFilter === 'all') return true;
      const category = KPI_CATEGORIES.find(c => c.id === kpi.categoryId);
      return category?.valueChain === valueChainFilter;
    });

    // Separate uncategorized KPIs
    const uncategorizedKpis = filteredKpis.filter(([, kpi]) => 
      !kpi.categoryId || !KPI_CATEGORIES.find(c => c.id === kpi.categoryId)
    );

    // Group by category
    const categorizedGroups = KPI_CATEGORIES
      .filter(cat => valueChainFilter === 'all' || cat.valueChain === valueChainFilter)
      .map(category => ({
        ...category,
        kpis: filteredKpis.filter(([, kpi]) => kpi.categoryId === category.id)
      }))
      .filter(group => group.kpis.length > 0);

    // Add uncategorized group if any exist
    if (uncategorizedKpis.length > 0) {
      categorizedGroups.push({
        id: 'uncategorized' as KpiCategoryId,
        name: 'Uncategorized',
        icon: 'HelpCircle',
        valueChain: 'enterprise' as const,
        kpis: uncategorizedKpis
      });
    }

    return categorizedGroups;
  }, [kpiLibrary, valueChainFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalKpis = Object.keys(kpiLibrary).length;
    const insuranceKpis = Object.values(kpiLibrary).filter(kpi => {
      const cat = KPI_CATEGORIES.find(c => c.id === kpi.categoryId);
      return cat?.valueChain === 'insurance';
    }).length;
    const enterpriseKpis = totalKpis - insuranceKpis;
    const visibleCategories = groupedKpis.length;
    const visibleKpis = groupedKpis.reduce((sum, g) => sum + g.kpis.length, 0);
    
    return { totalKpis, insuranceKpis, enterpriseKpis, visibleCategories, visibleKpis };
  }, [kpiLibrary, groupedKpis]);

  const handleSaveKpi = (kpiId: string, updates: Partial<KpiDefinition>) => {
    const updatedLibrary = {
      ...kpiLibrary,
      [kpiId]: {
        ...kpiLibrary[kpiId],
        ...updates,
        id: kpiId,
      },
    };

    updateConfigMutation.mutate({
      kpiLibrary: updatedLibrary,
    });
  };

  const handleAddNewKpi = (kpiId: string, newKpi: Partial<KpiDefinition>) => {
    const updatedLibrary = {
      ...kpiLibrary,
      [kpiId]: {
        ...newKpi,
        id: kpiId,
      } as KpiDefinition,
    };

    updateConfigMutation.mutate({
      kpiLibrary: updatedLibrary,
    });
  };

  const editingKpi = editingKpiId ? kpiLibrary[editingKpiId] : null;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#3C2CDA]" />
                KPI Library Management
              </CardTitle>
              <CardDescription>
                Configure KPIs, industry benchmarks, and process mappings for value estimation
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddingNew(true)}
              data-testid="button-add-kpi"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add KPI
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#3C2CDA]">{stats.totalKpis}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total KPIs</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.insuranceKpis}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Insurance</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.enterpriseKpis}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Enterprise</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.visibleCategories}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>

          {/* Value Chain Filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={valueChainFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setValueChainFilter('all')}
                data-testid="button-filter-all"
              >
                <Layers className="h-3 w-3 mr-1" />
                All ({stats.totalKpis})
              </Button>
              <Button
                size="sm"
                variant={valueChainFilter === 'insurance' ? 'default' : 'outline'}
                onClick={() => setValueChainFilter('insurance')}
                className={valueChainFilter === 'insurance' ? '' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}
                data-testid="button-filter-insurance"
              >
                Insurance ({stats.insuranceKpis})
              </Button>
              <Button
                size="sm"
                variant={valueChainFilter === 'enterprise' ? 'default' : 'outline'}
                onClick={() => setValueChainFilter('enterprise')}
                className={valueChainFilter === 'enterprise' ? '' : 'border-purple-200 text-purple-700 hover:bg-purple-50'}
                data-testid="button-filter-enterprise"
              >
                Enterprise ({stats.enterpriseKpis})
              </Button>
            </div>
          </div>

          {/* Category Accordion */}
          {groupedKpis.length > 0 ? (
            <Accordion type="multiple" className="space-y-2" defaultValue={[groupedKpis[0]?.id]}>
              {groupedKpis.map((category) => {
                const CategoryIcon = getCategoryIcon(category.id);
                const isInsurance = category.valueChain === 'insurance';
                
                return (
                  <AccordionItem 
                    key={category.id} 
                    value={category.id}
                    className={`border rounded-lg ${
                      isInsurance 
                        ? 'border-blue-200 dark:border-blue-800' 
                        : 'border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    <AccordionTrigger 
                      className={`px-4 py-3 hover:no-underline ${
                        isInsurance 
                          ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                          : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                      data-testid={`accordion-category-${category.id}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          isInsurance 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        }`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {category.kpis.length} KPIs
                            <Badge 
                              variant="outline" 
                              className={`ml-2 text-xs ${
                                isInsurance 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {isInsurance ? 'Insurance' : 'Enterprise'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                        {category.kpis.map(([kpiId, kpi]) => (
                          <KpiCard
                            key={kpiId}
                            kpiId={kpiId}
                            kpi={kpi}
                            onEdit={setEditingKpiId}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No KPIs Found</h3>
              <p className="text-sm mt-1">
                {valueChainFilter !== 'all' 
                  ? `No ${valueChainFilter} KPIs configured. Try changing the filter.`
                  : 'Add your first KPI to start tracking value realization.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <KpiEditModal
        isOpen={!!editingKpiId}
        onClose={() => setEditingKpiId(null)}
        kpiId={editingKpiId}
        kpi={editingKpi}
        allProcesses={allProcesses}
        onSave={handleSaveKpi}
      />

      <KpiEditModal
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        kpiId={`custom_kpi_${Date.now()}`}
        kpi={null}
        allProcesses={allProcesses}
        onSave={handleAddNewKpi}
        isNew
      />
    </div>
  );
}
