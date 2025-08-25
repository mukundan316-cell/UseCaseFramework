import React, { useRef, useState, useEffect } from 'react';
import { X, Edit, Save, Trash2, FileText, Building2, Users, ExternalLink, Target, AlertTriangle, Eye, GitCompare, FolderPlus, History, ChevronUp, Bot, Shield, Database, Briefcase, Calendar, User, Settings, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UseCase } from '../../types';
import { getEffectiveImpactScore, getEffectiveEffortScore, getEffectiveQuadrant, hasManualOverrides } from '@shared/utils/scoreOverride';
import { getSourceConfig } from '../../utils/sourceColors';
import { useUseCases } from '../../contexts/UseCaseContext';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../../utils/calculations';
import ExportButton from './ExportButton';
import { ScoreSliderLegoBlock } from './ScoreSliderLegoBlock';

// Comprehensive Zod schema from the original form
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  problemStatement: z.string().optional(),
  valueChainComponent: z.string().min(1, 'Value chain component is required'),
  process: z.string().min(1, 'Process is required'),
  lineOfBusiness: z.string().min(1, 'Line of business is required'),
  businessSegment: z.string().min(1, 'Business segment is required'),
  geography: z.string().min(1, 'Geography is required'),
  useCaseType: z.string().min(1, 'Use case type is required'),
  // 12 Lever Scores
  revenueImpact: z.number().min(1).max(5),
  costSavings: z.number().min(1).max(5),
  riskReduction: z.number().min(1).max(5),
  brokerPartnerExperience: z.number().min(1).max(5),
  strategicFit: z.number().min(1).max(5),
  dataReadiness: z.number().min(1).max(5),
  technicalComplexity: z.number().min(1).max(5),
  changeImpact: z.number().min(1).max(5),
  modelRisk: z.number().min(1).max(5),
  adoptionReadiness: z.number().min(1).max(5),
  explainabilityBias: z.number().min(1).max(5),
  regulatoryCompliance: z.number().min(1).max(5),
  // Additional form fields
  enableManualOverrides: z.boolean().optional(),
  manualImpactScore: z.string().optional(),
  manualEffortScore: z.string().optional(),
  manualQuadrant: z.string().optional(),
  overrideReason: z.string().optional(),
  // Additional fields that were missing
  implementationTimeline: z.string().optional(),
  successMetrics: z.string().optional(),
  estimatedValue: z.string().optional(),
  valueMeasurementApproach: z.string().optional(),
  technicalImplementation: z.string().optional(),
  isActiveForRsa: z.boolean().optional(),
  isDashboardVisible: z.boolean().optional(),
  activationReason: z.string().optional(),
  deactivationReason: z.string().optional(),
  // Multi-select arrays
  linesOfBusiness: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
});

type UseCaseFormData = z.infer<typeof formSchema>;

// Interactive Slider Component with Tooltips
const InteractiveSlider = ({ 
  field, 
  label, 
  tooltip, 
  leftLabel, 
  rightLabel, 
  form,
  disabled = false
}: { 
  field: keyof UseCaseFormData; 
  label: string; 
  tooltip: string;
  leftLabel: string;
  rightLabel: string;
  form: any;
  disabled?: boolean;
}) => {
  const value = form.watch(field) as number;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="font-semibold text-blue-600">{value}</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => form.setValue(field, parseInt(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

interface UseCaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (useCase: UseCase) => Promise<void>;
  onDelete?: (useCase: UseCase) => Promise<void>;
  onEdit?: (useCase: UseCase) => void;
  useCase: UseCase | null;
  mode?: 'view' | 'edit' | 'create';
}

export default function UseCaseDrawer({ isOpen, onClose, onSave, onDelete, onEdit, useCase, mode = 'view' }: UseCaseDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState<string>('overview');
  const { metadata } = useUseCases();
  const sectionRefs = {
    overview: useRef<HTMLDivElement>(null),
    'strategic-scoring': useRef<HTMLDivElement>(null),
    'business-context': useRef<HTMLDivElement>(null),
    'implementation-details': useRef<HTMLDivElement>(null),
    'rsa-portfolio': useRef<HTMLDivElement>(null)
  };

  // Mini-map sections
  const sections = [
    { id: 'overview', label: 'Overview', ref: sectionRefs.overview },
    { id: 'strategic-scoring', label: 'Strategic Scoring', ref: sectionRefs['strategic-scoring'] },
    { id: 'business-context', label: 'Business Context', ref: sectionRefs['business-context'] },
    { id: 'implementation-details', label: 'Implementation & Governance', ref: sectionRefs['implementation-details'] },
    { id: 'rsa-portfolio', label: 'RSA Portfolio Selection', ref: sectionRefs['rsa-portfolio'] }
  ];

  // Track current section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const containerHeight = scrollContainerRef.current.clientHeight;
      
      // Find which section is currently most visible
      let currentSectionId = 'overview';
      let maxVisibility = 0;

      sections.forEach(({ id, ref }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const containerRect = scrollContainerRef.current!.getBoundingClientRect();
          
          const visibleTop = Math.max(rect.top, containerRect.top);
          const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const sectionHeight = rect.height;
          const visibility = visibleHeight / sectionHeight;
          
          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            currentSectionId = id;
          }
        }
      });

      setCurrentSection(currentSectionId);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current && scrollContainerRef.current) {
      const elementTop = ref.current.offsetTop;
      scrollContainerRef.current.scrollTo({ top: elementTop - 20, behavior: 'smooth' });
    }
  };

  // react-hook-form with proper validation
  const form = useForm<UseCaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: useCase?.title || '',
      description: useCase?.description || '',
      problemStatement: useCase?.problemStatement || '',
      valueChainComponent: useCase?.valueChainComponent || '',
      process: useCase?.process || '',
      lineOfBusiness: useCase?.lineOfBusiness || '',
      businessSegment: useCase?.businessSegment || '',
      geography: useCase?.geography || '',
      useCaseType: useCase?.useCaseType || '',
      // Default scores to 3 for new use cases
      revenueImpact: useCase?.revenueImpact || 3,
      costSavings: useCase?.costSavings || 3,
      riskReduction: useCase?.riskReduction || 3,
      brokerPartnerExperience: useCase?.brokerPartnerExperience || 3,
      strategicFit: useCase?.strategicFit || 3,
      dataReadiness: useCase?.dataReadiness || 3,
      technicalComplexity: useCase?.technicalComplexity || 3,
      changeImpact: useCase?.changeImpact || 3,
      modelRisk: useCase?.modelRisk || 3,
      adoptionReadiness: useCase?.adoptionReadiness || 3,
      explainabilityBias: useCase?.explainabilityBias || 3,
      regulatoryCompliance: useCase?.regulatoryCompliance || 3,
      // Additional form state
      enableManualOverrides: hasManualOverrides(useCase),
      manualImpactScore: (useCase as any)?.manualImpactScore || '',
      manualEffortScore: (useCase as any)?.manualEffortScore || '',
      manualQuadrant: (useCase as any)?.manualQuadrant || '',
      overrideReason: (useCase as any)?.overrideReason || '',
      // Multi-select arrays
      linesOfBusiness: useCase?.linesOfBusiness || [],
      businessSegments: useCase?.businessSegments || [],
      geographies: useCase?.geographies || [],
    }
  });

  // Watch form values for real-time calculations
  const formValues = form.watch();
  const currentImpactScore = calculateImpactScore(
    formValues.revenueImpact,
    formValues.costSavings,
    formValues.riskReduction,
    formValues.brokerPartnerExperience,
    formValues.strategicFit
  );
  const currentEffortScore = calculateEffortScore(
    formValues.dataReadiness,
    formValues.technicalComplexity,
    formValues.changeImpact,
    formValues.modelRisk,
    formValues.adoptionReadiness
  );
  const currentQuadrant = calculateQuadrant(currentImpactScore, currentEffortScore);

  const { toast } = useToast();
  
  // CRUD handlers with form validation
  const handleSave = async (data: UseCaseFormData) => {
    try {
      if (onSave) {
        const updatedUseCase = {
          ...(useCase || {}),
          ...data,
          // Calculate final scores
          impactScore: currentImpactScore,
          effortScore: currentEffortScore,
          quadrant: currentQuadrant,
          // Ensure proper date handling
          updatedAt: new Date().toISOString(),
        } as UseCase;
        
        await onSave(updatedUseCase);
        toast({
          title: "Success",
          description: `Use case ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} use case`,
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = () => {
    form.handleSubmit(handleSave)();
  };

  const handleDelete = async () => {
    if (useCase && onDelete) {
      try {
        await onDelete(useCase);
        toast({
          title: "Success",
          description: "Use case deleted successfully",
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to delete use case",
          variant: "destructive",
        });
      }
    }
  };
  
  if (!useCase && mode !== 'create') return null;

  // Sample data for dropdowns
  const processOptions = [
    'Underwriting', 'Claims Processing', 'Customer Service', 'Risk Assessment', 
    'Portfolio Management', 'Fraud Detection', 'Policy Administration', 'Marketing'
  ];

  const lobOptions = [
    'Commercial', 'Personal', 'Specialty', 'International', 'Reinsurance'
  ];

  const segmentOptions = [
    'Small Commercial', 'Middle Market', 'Large Commercial', 'Personal Lines', 
    'High Net Worth', 'Specialty Lines'
  ];

  const geographyOptions = [
    'UK', 'Europe', 'North America', 'Asia Pacific', 'Global'
  ];

  const statusOptions = [
    'Discovery', 'Development', 'Testing', 'Implementation', 'Live', 'On Hold', 'Cancelled'
  ];

  const quadrantOptions = [
    { value: 'Strategic Bet', label: 'Strategic Bet', color: '#10b981' },
    { value: 'Quick Win', label: 'Quick Win', color: '#3b82f6' },
    { value: 'Fill-in', label: 'Fill-in', color: '#f59e0b' },
    { value: 'Questionable', label: 'Questionable', color: '#ef4444' }
  ];

  // Get effective scores (manual overrides take precedence)
  const effectiveImpact = getEffectiveImpactScore(useCase as any);
  const effectiveEffort = getEffectiveEffortScore(useCase as any);
  const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
  const hasScores = effectiveImpact !== undefined && effectiveEffort !== undefined;

  // Get source configuration for badge colors
  const sourceConfig = getSourceConfig(useCase?.librarySource || 'rsa_internal');

  // Get source badge info
  const getSourceBadge = () => {
    const source = useCase?.librarySource || 'rsa_internal';
    let icon = <Building2 className="w-3 h-3 mr-1" />;
    let label = 'RSA Internal';
    let bgColor = '#2563eb';
    let textColor = '#ffffff';

    switch (source) {
      case 'rsa_internal':
        icon = <Building2 className="w-3 h-3 mr-1" />;
        label = 'RSA Internal';
        bgColor = '#2563eb';
        textColor = '#ffffff';
        break;
      case 'industry_standard':
        icon = <Users className="w-3 h-3 mr-1" />;
        label = 'Industry Standard';
        bgColor = '#16a34a';
        textColor = '#ffffff';
        break;
      case 'ai_inventory':
        icon = <ExternalLink className="w-3 h-3 mr-1" />;
        label = 'AI Inventory';
        bgColor = '#9333ea';
        textColor = '#ffffff';
        break;
      default:
        break;
    }

    return { icon, label, bgColor, textColor };
  };

  // Get quadrant badge color
  const getQuadrantBadgeColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win':
        return { bgColor: '#16a34a', textColor: '#ffffff' };
      case 'Strategic Bet':
        return { bgColor: '#2563eb', textColor: '#ffffff' };
      case 'Experimental':
        return { bgColor: '#ca8a04', textColor: '#ffffff' };
      case 'Watchlist':
        return { bgColor: '#dc2626', textColor: '#ffffff' };
      default:
        return { bgColor: '#6b7280', textColor: '#ffffff' };
    }
  };

  const sourceBadge = getSourceBadge();
  const quadrantBadge = effectiveQuadrant ? getQuadrantBadgeColor(effectiveQuadrant) : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full md:w-[65%]`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Source Badge */}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: sourceBadge.bgColor,
                    color: sourceBadge.textColor
                  }}
                >
                  {sourceBadge.icon}
                  {sourceBadge.label}
                </span>

                {/* Quadrant Badge - Only for strategic cases */}
                {quadrantBadge && effectiveQuadrant && ['Strategic Bet', 'Watchlist', 'Experimental'].includes(effectiveQuadrant) && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: quadrantBadge.bgColor,
                      color: quadrantBadge.textColor
                    }}
                  >
                    {effectiveQuadrant}
                  </span>
                )}
              </div>

              {/* Title */}
              {mode === 'edit' || mode === 'create' ? (
                <div>
                  <Input
                    {...form.register('title')}
                    className="text-2xl font-semibold mb-1 border-0 p-0 focus:ring-0 bg-transparent"
                    placeholder="Enter use case title..."
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>
              ) : (
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {useCase?.title || 'New Use Case'}
                </h2>
              )}

              {/* Subtitle with Impact/Effort for strategic cases */}
              {hasScores && ['Strategic Bet', 'Watchlist', 'Experimental', 'Quick Win'].includes(effectiveQuadrant) && (
                <p className="text-sm text-gray-600">
                  Impact: {effectiveImpact?.toFixed(1)} | Effort: {effectiveEffort?.toFixed(1)}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {mode === 'view' ? (
                <Button
                  onClick={() => useCase && onEdit?.(useCase)}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleFormSubmit}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={form.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  {mode === 'edit' && onDelete && (
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </>
              )}

              {useCase && (
                <ExportButton
                  exportType="use-case"
                  exportId={useCase.id}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Export PDF
                </ExportButton>
              )}

              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 pb-24" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {/* Check if this is a strategic use case */}
          {(useCase?.librarySource === 'rsa_internal' || useCase?.librarySource === 'hexaware_external') ? (
            <Accordion type="multiple" defaultValue={["overview", "strategic-scoring", "business-context"]} className="w-full">
              {/* Overview Section */}
              <AccordionItem value="overview" ref={sectionRefs.overview}>
                <AccordionTrigger className="text-lg font-semibold">
                  Overview
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    {mode === 'edit' || mode === 'create' ? (
                      <div>
                        <Textarea
                          {...form.register('description')}
                          placeholder="Enter use case description..."
                          className="min-h-[80px]"
                        />
                        {form.formState.errors.description && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{useCase?.description}</p>
                    )}
                  </div>

                  {/* Problem Statement */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Problem Statement</h4>
                    {mode === 'edit' || mode === 'create' ? (
                      <Textarea
                        {...form.register('problemStatement')}
                        placeholder="Describe the problem this use case solves..."
                        className="min-h-[80px]"
                      />
                    ) : useCase?.problemStatement ? (
                      <p className="text-gray-700 leading-relaxed">{useCase.problemStatement}</p>
                    ) : (
                      <p className="text-gray-500 italic">No problem statement defined</p>
                    )}
                  </div>

                  {/* Current Quadrant Placement */}
                  {hasScores && effectiveQuadrant && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Quadrant Placement</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <div 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: quadrantBadge?.bgColor || '#6b7280',
                              color: quadrantBadge?.textColor || '#ffffff'
                            }}
                          >
                            {effectiveQuadrant}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Impact: {effectiveImpact?.toFixed(1)} | Effort: {effectiveEffort?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Strategic Scoring Section */}
              <AccordionItem value="strategic-scoring" ref={sectionRefs['strategic-scoring']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Strategic Scoring
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Manual Override Controls */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Enable Manual Overrides</Label>
                        <p className="text-sm text-gray-600">Override calculated scores with manual values</p>
                      </div>
                      <Switch
                        checked={form.watch('enableManualOverrides') || false}
                        onCheckedChange={(checked) => form.setValue('enableManualOverrides', checked)}
                      />
                    </div>

                    {/* Manual Override Fields - Show when enabled */}
                    {form.watch('enableManualOverrides') && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-yellow-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Manual Impact Score */}
                          <div>
                            <Label className="text-base font-semibold text-gray-900">Manual Impact Score</Label>
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={form.watch('manualImpactScore') || ''}
                              onChange={(e) => form.setValue('manualImpactScore', e.target.value)}
                              placeholder="0.0 - 5.0"
                              className="mt-2 bg-yellow-50 border-yellow-300 focus:border-yellow-500"
                            />
                            {effectiveImpact && (
                              <p className="text-sm text-gray-500 mt-1">
                                Original calculated: {effectiveImpact.toFixed(1)}
                              </p>
                            )}
                          </div>

                          {/* Manual Effort Score */}
                          <div>
                            <Label className="text-base font-semibold text-gray-900">Manual Effort Score</Label>
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={form.watch('manualEffortScore') || ''}
                              onChange={(e) => form.setValue('manualEffortScore', e.target.value)}
                              placeholder="0.0 - 5.0"
                              className="mt-2 bg-yellow-50 border-yellow-300 focus:border-yellow-500"
                            />
                            {effectiveEffort && (
                              <p className="text-sm text-gray-500 mt-1">
                                Original calculated: {effectiveEffort.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Manual Quadrant */}
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Manual Quadrant</Label>
                          <Select 
                            value={form.watch('manualQuadrant') || ''} 
                            onValueChange={(value) => form.setValue('manualQuadrant', value)}
                          >
                            <SelectTrigger className="mt-2 bg-yellow-50 border-yellow-300 focus:border-yellow-500">
                              <SelectValue placeholder="Select quadrant" />
                            </SelectTrigger>
                            <SelectContent>
                              {quadrantOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: option.color }}
                                    />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {effectiveQuadrant && (
                            <p className="text-sm text-gray-500 mt-1">
                              Original calculated: {effectiveQuadrant}
                            </p>
                          )}
                        </div>

                        {/* Override Reason - Required */}
                        <div>
                          <Label className="text-base font-semibold text-gray-900">
                            Override Reason <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            value={form.watch('overrideReason') || ''}
                            onChange={(e) => form.setValue('overrideReason', e.target.value)}
                            placeholder="Explain why manual overrides are needed (required)"
                            className="mt-2 bg-yellow-50 border-yellow-300 focus:border-yellow-500"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 12 Lever Scores - Interactive in edit/create mode */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Business Value Levers */}
                    <div className="space-y-6">
                      <h4 className="font-medium text-green-700 text-sm uppercase tracking-wide">Business Value Levers</h4>
                      <InteractiveSlider
                        field="revenueImpact"
                        label="Revenue Impact"
                        tooltip="Potential to increase revenue through new products or improved pricing"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="costSavings"
                        label="Cost Savings"
                        tooltip="Operational cost reduction through automation or efficiency gains"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="riskReduction"
                        label="Risk Reduction"
                        tooltip="Ability to reduce operational, regulatory, or financial risks"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="brokerPartnerExperience"
                        label="Broker/Partner Experience"
                        tooltip="Impact on broker/partner experience - faster TAT, self-service tools, analytics access"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="strategicFit"
                        label="Strategic Fit"
                        tooltip="Alignment with RSA's delegated, specialty, or mid-market focus"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                    </div>

                    {/* Feasibility Levers */}
                    <div className="space-y-6">
                      <h4 className="font-medium text-blue-700 text-sm uppercase tracking-wide">Feasibility Levers</h4>
                      <InteractiveSlider
                        field="dataReadiness"
                        label="Data Readiness"
                        tooltip="Quality, structure, and sufficient volume of available data"
                        leftLabel="Poor"
                        rightLabel="Excellent"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="technicalComplexity"
                        label="Technical Complexity"
                        tooltip="Maturity of models needed (LLMs vs ML) and technical difficulty"
                        leftLabel="Simple"
                        rightLabel="Complex"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="changeImpact"
                        label="Change Impact"
                        tooltip="Degree of process and role redesign required for implementation"
                        leftLabel="Minimal"
                        rightLabel="Extensive"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="modelRisk"
                        label="Model Risk"
                        tooltip="Potential harm if model fails (regulatory, reputational, financial)"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="adoptionReadiness"
                        label="Adoption Readiness"
                        tooltip="Stakeholder and user buy-in, especially in underwriting/claims"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                    </div>

                    {/* AI Governance Levers */}
                    <div className="space-y-6">
                      <h4 className="font-medium text-purple-700 text-sm uppercase tracking-wide">AI Governance Levers</h4>
                      <InteractiveSlider
                        field="explainabilityBias"
                        label="Explainability & Bias"
                        tooltip="Support for responsible AI principles and bias management"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                      <InteractiveSlider
                        field="regulatoryCompliance"
                        label="Regulatory Compliance"
                        tooltip="FCA, GDPR, and UK/EU AI Act readiness"
                        leftLabel="Low"
                        rightLabel="High"
                        form={form}
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>

                  {/* Calculated Scores - Real-time updates */}
                  <div className="mt-6 p-6 rounded-lg bg-gray-50 border">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Real-time Score Calculation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {currentImpactScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Impact Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {currentEffortScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Effort Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 bg-white px-4 py-2 rounded-lg border">
                          {currentQuadrant}
                        </div>
                        <div className="text-sm text-gray-600">Quadrant</div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 1. Business Context Section (collapsed by default) */}
              <AccordionItem value="business-context" ref={sectionRefs['business-context']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Business Context
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Business Context Fields - Now properly validated */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Value Chain Component */}
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Value Chain Component</Label>
                      {mode === 'edit' || mode === 'create' ? (
                        <div className="mt-2">
                          <Select onValueChange={(value) => form.setValue('valueChainComponent', value)} value={form.watch('valueChainComponent')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select component" />
                            </SelectTrigger>
                            <SelectContent>
                              {metadata?.valueChainComponents?.filter(component => component && component.trim()).map(component => (
                                <SelectItem key={component} value={component}>{component}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.valueChainComponent && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.valueChainComponent.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2">{useCase?.valueChainComponent || 'Not specified'}</p>
                      )}
                    </div>

                    {/* Use Case Type */}
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Use Case Type</Label>
                      {mode === 'edit' || mode === 'create' ? (
                        <div className="mt-2">
                          <Select onValueChange={(value) => form.setValue('useCaseType', value)} value={form.watch('useCaseType')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {metadata?.useCaseTypes?.filter(type => type && type.trim()).map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.useCaseType && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.useCaseType.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2">{useCase?.useCaseType || 'Not specified'}</p>
                      )}
                    </div>

                    {/* Process */}
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Process</Label>
                      {mode === 'edit' || mode === 'create' ? (
                        <div className="mt-2">
                          <Select onValueChange={(value) => form.setValue('process', value)} value={form.watch('process')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select process" />
                            </SelectTrigger>
                            <SelectContent>
                              {metadata?.processes?.filter(process => process && process.trim()).map(process => (
                                <SelectItem key={process} value={process}>{process}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.process && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.process.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2">{useCase?.process || 'Not specified'}</p>
                      )}
                    </div>

                    {/* Line of Business */}
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Line of Business</Label>
                      {mode === 'edit' || mode === 'create' ? (
                        <div className="mt-2">
                          <Select onValueChange={(value) => form.setValue('lineOfBusiness', value)} value={form.watch('lineOfBusiness')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select LOB" />
                            </SelectTrigger>
                            <SelectContent>
                              {metadata?.linesOfBusiness?.filter(lob => lob && lob.trim()).map(lob => (
                                <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.lineOfBusiness && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.lineOfBusiness.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2">{useCase?.lineOfBusiness || 'Not specified'}</p>
                      )}
                    </div>

                    {/* Business Segment */}
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Business Segment</Label>
                      {mode === 'edit' || mode === 'create' ? (
                        <div className="mt-2">
                          <Select onValueChange={(value) => form.setValue('businessSegment', value)} value={form.watch('businessSegment')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select segment" />
                            </SelectTrigger>
                            <SelectContent>
                              {metadata?.businessSegments?.filter(segment => segment && segment.trim()).map(segment => (
                                <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.businessSegment && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.businessSegment.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2">{useCase?.businessSegment || 'Not specified'}</p>
                      )}
                    </div>

                    {/* Geography */}
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Geography</Label>
                      {mode === 'edit' || mode === 'create' ? (
                        <div className="mt-2">
                          <Select onValueChange={(value) => form.setValue('geography', value)} value={form.watch('geography')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select geography" />
                            </SelectTrigger>
                            <SelectContent>
                              {metadata?.geographies?.filter(geo => geo && geo.trim()).map(geo => (
                                <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.geography && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.geography.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2">{useCase?.geography || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  {/* Note: Multi-select LOB functionality removed - using single select in Business Context */}

                  {/* Multi-select business segments removed - now using single select above */}

                  {/* Lines of Business multi-select checkboxes in 2 columns */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Lines of Business</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {metadata?.linesOfBusiness?.map((lob) => (
                        <div key={lob} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lob-${lob}`}
                            checked={(form.watch('linesOfBusiness') || []).includes(lob)}
                            onCheckedChange={(checked) => {
                              const currentLobs = form.watch('linesOfBusiness') || [];
                              if (checked) {
                                form.setValue('linesOfBusiness', [...currentLobs, lob]);
                              } else {
                                form.setValue('linesOfBusiness', currentLobs.filter(l => l !== lob));
                              }
                            }}
                          />
                          <Label htmlFor={`lob-${lob}`} className="text-sm text-gray-700">
                            {lob}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Selected LOB tags */}
                    {(form.watch('linesOfBusiness') || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(form.watch('linesOfBusiness') || []).map((lob) => (
                          <Badge key={lob} variant="secondary" className="bg-green-100 text-green-800">
                            {lob}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Business Segments multi-select checkboxes */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Business Segments</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {metadata?.businessSegments?.map((segment) => (
                        <div key={segment} className="flex items-center space-x-2">
                          <Checkbox
                            id={`segment-${segment}`}
                            checked={(form.watch('businessSegments') || []).includes(segment)}
                            onCheckedChange={(checked) => {
                              const currentSegments = form.watch('businessSegments') || [];
                              if (checked) {
                                form.setValue('businessSegments', [...currentSegments, segment]);
                              } else {
                                form.setValue('businessSegments', currentSegments.filter(s => s !== segment));
                              }
                            }}
                          />
                          <Label htmlFor={`segment-${segment}`} className="text-sm text-gray-700">
                            {segment}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Selected segments tags */}
                    {(form.watch('businessSegments') || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(form.watch('businessSegments') || []).map((segment) => (
                          <Badge key={segment} variant="secondary" className="bg-purple-100 text-purple-800">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Geographies multi-select checkboxes */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Geographies</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {metadata?.geographies?.map((geo) => (
                        <div key={geo} className="flex items-center space-x-2">
                          <Checkbox
                            id={`geo-${geo}`}
                            checked={(form.watch('geographies') || []).includes(geo)}
                            onCheckedChange={(checked) => {
                              const currentGeos = form.watch('geographies') || [];
                              if (checked) {
                                form.setValue('geographies', [...currentGeos, geo]);
                              } else {
                                form.setValue('geographies', currentGeos.filter(g => g !== geo));
                              }
                            }}
                          />
                          <Label htmlFor={`geo-${geo}`} className="text-sm text-gray-700">
                            {geo}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Selected geographies tags */}
                    {(form.watch('geographies') || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(form.watch('geographies') || []).map((geo) => (
                          <Badge key={geo} variant="secondary" className="bg-orange-100 text-orange-800">
                            {geo}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Process Activities filtered by selected Process */}
                  {form.watch('process') && (
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Process Activities</Label>
                      <p className="text-sm text-gray-500 mt-1">Activities filtered by selected process: {form.watch('process')}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="border-blue-300 text-blue-800">Sample Activity 1</Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-800">Sample Activity 2</Badge>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 2. Implementation & Governance Section (collapsed) */}
              <AccordionItem value="implementation-details" ref={sectionRefs['implementation-details']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Implementation & Governance
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Project Management subsection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Primary Business Owner */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Primary Business Owner</Label>
                        <Input
                          value={form.watch('primaryBusinessOwner') || ''}
                          onChange={(e) => form.setValue('primaryBusinessOwner', e.target.value)}
                          placeholder="Enter business owner name"
                          className="mt-2"
                        />
                      </div>

                      {/* Use Case Status */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Use Case Status</Label>
                        <Select value={form.watch('useCaseStatus') || ''} onValueChange={(value) => form.setValue('useCaseStatus', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Key Dependencies */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Key Dependencies</Label>
                        <Textarea
                          value={form.watch('keyDependencies') || ''}
                          onChange={(e) => form.setValue('keyDependencies', e.target.value)}
                          placeholder="Describe key dependencies and requirements"
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      {/* Implementation Timeline */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Implementation Timeline</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Input
                            {...form.register('implementationTimeline')}
                            placeholder="e.g., Q1 2024 - Q3 2024"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Value Realization subsection */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Value Realization</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Success Metrics/KPIs */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Success Metrics/KPIs</Label>
                        <Textarea
                          {...form.register('successMetrics')}
                          placeholder="Define success metrics and key performance indicators"
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      {/* Estimated Value */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Estimated Value</Label>
                        <Input
                          {...form.register('estimatedValue')}
                          placeholder="e.g., £2.5M annual savings"
                          className="mt-2"
                        />
                      </div>

                      {/* Value Measurement Approach */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Value Measurement Approach</Label>
                        <Textarea
                          {...form.register('valueMeasurementApproach')}
                          placeholder="Describe how value will be measured and tracked"
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Implementation */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Technical Implementation</Label>
                    <Textarea
                      {...form.register('technicalImplementation')}
                      placeholder="Describe technical approach, architecture, and implementation details"
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. RSA Portfolio Selection Section (collapsed) */}
              <AccordionItem value="rsa-portfolio" ref={sectionRefs['rsa-portfolio']}>
                <AccordionTrigger className="text-lg font-semibold">
                  RSA Portfolio Selection
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Portfolio Controls</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Active & Visible toggle */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Active for RSA</Label>
                          <p className="text-sm text-gray-600">Include this use case in RSA's active portfolio</p>
                        </div>
                        <Switch
                          checked={form.watch('isActiveForRsa') || false}
                          onCheckedChange={(checked) => form.setValue('isActiveForRsa', checked)}
                        />
                      </div>

                      {/* Dashboard Visibility toggle */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Dashboard Visibility</Label>
                          <p className="text-sm text-gray-600">Show this use case on executive dashboards</p>
                        </div>
                        <Switch
                          checked={form.watch('isDashboardVisible') || false}
                          onCheckedChange={(checked) => form.setValue('isDashboardVisible', checked)}
                        />
                      </div>

                      {/* Activation Reason - required if active */}
                      {form.watch('isActiveForRsa') && (
                        <div>
                          <Label className="text-base font-semibold text-gray-900">
                            Activation Reason <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            {...form.register('activationReason')}
                            placeholder="Explain why this use case is being activated (required)"
                            className="mt-2"
                            rows={3}
                            required
                          />
                        </div>
                      )}

                      {/* Deactivation Reason - shows if inactive */}
                      {!form.watch('isActiveForRsa') && (
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Deactivation Reason</Label>
                          <Textarea
                            {...form.register('deactivationReason')}
                            placeholder="Explain why this use case is inactive (optional)"
                            className="mt-2"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : useCase?.librarySource === 'sharepoint_import' || useCase?.librarySource === 'ai_inventory' ? (
            /* AI Inventory sections */
            <Accordion type="multiple" defaultValue={["ai-tool-overview", "governance-risk"]} className="w-full">
              {/* 1. AI Tool Overview (expanded) */}
              <AccordionItem value="ai-tool-overview" ref={sectionRefs.overview}>
                <AccordionTrigger className="text-lg font-semibold">
                  AI Tool Overview
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Title & Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Title</h4>
                    <p className="text-gray-700 leading-relaxed font-semibold">{useCase?.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{useCase?.description}</p>
                  </div>

                  {/* AI or Model type with icon */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(useCase as any).aiModelType && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">AI/Model Type</h4>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700">{(useCase as any).aiModelType}</span>
                        </div>
                      </div>
                    )}

                    {/* Purpose of Use field */}
                    {(useCase as any).purposeOfUse && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Purpose of Use</h4>
                        <p className="text-gray-700">{(useCase as any).purposeOfUse}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Governance & Risk (expanded) */}
              <AccordionItem value="governance-risk" ref={sectionRefs['strategic-scoring']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Governance & Risk
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Risk indicators with color coding */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Risk to Customers */}
                    {(useCase as any).riskToCustomers && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk to Customers</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (useCase as any).riskToCustomers?.toLowerCase() === 'high' ? 'bg-red-500' :
                            (useCase as any).riskToCustomers?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-gray-700">{(useCase as any).riskToCustomers}</span>
                        </div>
                      </div>
                    )}

                    {/* Risk to RSA */}
                    {(useCase as any).riskToRSA && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk to RSA</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (useCase as any).riskToRSA?.toLowerCase() === 'high' ? 'bg-red-500' :
                            (useCase as any).riskToRSA?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-gray-700">{(useCase as any).riskToRSA}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Model Owner and Governance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(useCase as any).modelOwner && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Model Owner</h4>
                        <p className="text-gray-700">{(useCase as any).modelOwner}</p>
                      </div>
                    )}

                    {(useCase as any).rsaPolicyGovernance && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">RSA Policy Governance</h4>
                        <p className="text-gray-700">{(useCase as any).rsaPolicyGovernance}</p>
                      </div>
                    )}
                  </div>

                  {/* Third Party Model */}
                  {(useCase as any).thirdPartyModel !== undefined && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Third Party Model</h4>
                      <Badge 
                        variant={
                          (useCase as any).thirdPartyModel === 'Yes' || (useCase as any).thirdPartyModel === true 
                            ? "destructive" 
                            : "secondary"
                        }
                      >
                        {typeof (useCase as any).thirdPartyModel === 'boolean' 
                          ? ((useCase as any).thirdPartyModel ? 'Yes' : 'No')
                          : (useCase as any).thirdPartyModel
                        }
                      </Badge>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 3. Data & Validation (collapsed) */}
              <AccordionItem value="data-validation" ref={sectionRefs['business-context']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Data & Validation
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Data Used */}
                  {(useCase as any).dataUsed && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Used</h4>
                      <p className="text-gray-700">{(useCase as any).dataUsed}</p>
                    </div>
                  )}

                  {/* Validation Responsibility */}
                  {(useCase as any).validationResponsibility && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Validation Responsibility</h4>
                      <p className="text-gray-700">{(useCase as any).validationResponsibility}</p>
                    </div>
                  )}

                  {/* Informed By */}
                  {(useCase as any).informedBy && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informed By</h4>
                      <p className="text-gray-700">{(useCase as any).informedBy}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 4. Business Application (collapsed) */}
              <AccordionItem value="business-application" ref={sectionRefs['implementation-details']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Business Application
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Process, Function */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Process</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {useCase.process}
                      </Badge>
                    </div>

                    {(useCase as any).functionArea && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Function</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {(useCase as any).functionArea}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Risk areas impacted */}
                  {(useCase as any).riskAreasImpacted && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Risk Areas Impacted</h4>
                      {Array.isArray((useCase as any).riskAreasImpacted) ? (
                        <div className="flex flex-wrap gap-2">
                          {(useCase as any).riskAreasImpacted.map((risk: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-red-300 text-red-700">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">{(useCase as any).riskAreasImpacted}</p>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            /* Fallback for other non-strategic use cases */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{useCase.description}</p>
              </div>

              {useCase.problemStatement && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                  <p className="text-gray-700 leading-relaxed">{useCase.problemStatement}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Process</div>
                    <div className="text-gray-900">{useCase.process}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Line of Business</div>
                    <div className="text-gray-900">{useCase.lineOfBusiness}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Use Case Type</div>
                    <div className="text-gray-900">{useCase.useCaseType}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mini-map Navigation */}
        <div className="absolute right-2 top-1/3 transform -translate-y-1/2 z-10">
          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="group relative"
                >
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-16 h-4 rounded border transition-all duration-200 text-xs px-1 flex items-center justify-center ${
                      currentSection === section.id
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-600'
                    }`}
                    title={section.label}
                  >
                    {section.id === 'overview' ? '📋' : 
                     section.id === 'strategic-scoring' ? '📊' :
                     section.id === 'business-context' ? '🏢' :
                     section.id === 'implementation-details' ? '⚙️' : '📝'}
                  </button>
                  {/* Tooltip on hover */}
                  <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                    {section.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Full Report
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <GitCompare className="h-4 w-4 mr-1" />
                Compare
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                Add to Workspace
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
              >
                <History className="h-4 w-4 mr-1" />
                View History
              </Button>

              {/* Scroll to top button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-500 hover:bg-gray-100"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}