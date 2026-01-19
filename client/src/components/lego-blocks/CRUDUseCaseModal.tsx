import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTabsListLegoBlock from './ResponsiveTabsListLegoBlock';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Edit, AlertCircle, FileText, Building2, Settings, BarChart3, FolderOpen } from 'lucide-react';
import { ScoreSliderLegoBlock } from './ScoreSliderLegoBlock';
import { ScoreDropdownLegoBlock } from './ScoreDropdownLegoBlock';
import RSASelectionToggleLegoBlock from './RSASelectionToggleLegoBlock';
import ScoreOverrideLegoBlock from './ScoreOverrideLegoBlock';
import { UseCase } from '../../types';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '@shared/calculations';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import type { TomConfig } from '@shared/tom';
import { ContextualProcessActivityField } from './ProcessActivityManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MultiSelectField from './MultiSelectField';
import { useSortedMetadata } from '@/hooks/useSortedMetadata';
import PresentationUploadBlock from './PresentationUploadBlock';
import PresentationPreviewBlock from './PresentationPreviewBlock';
import HorizontalUseCaseLegoBlock from './HorizontalUseCaseLegoBlock';
import LoadingState from '@/components/ui/loading-state';


const formSchema = z.object({
  // Minimal validation - only title and description are required, relaxed character limits
  title: z.string().min(1, "Please enter a title for this use case").max(200, "Title must be shorter than 200 characters"),
  description: z.string().min(1, "Please provide a brief description").max(2000, "Description must be shorter than 2000 characters"),
  // Meaningful ID field - auto-generated if empty
  meaningfulId: z.string().optional(),
  // All other fields are optional to minimize validation barriers
  problemStatement: z.string().optional(),
  process: z.string().optional(),
  lineOfBusiness: z.string().optional(),
  // Multi-select arrays (optional)
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  linesOfBusiness: z.array(z.string()).optional(),
  businessSegment: z.string().optional(),
  geography: z.string().optional(),
  useCaseType: z.string().optional(),
  activity: z.string().optional(),
  // Source type selection
  librarySource: z.string().default('rsa_internal'), // Now dynamic from metadata
  // Tab 3: Implementation & Governance fields
  primaryBusinessOwner: z.string().optional(),
  useCaseStatus: z.string().optional(),
  keyDependencies: z.string().optional(),
  implementationTimeline: z.string().optional(),
  successMetrics: z.string().optional(),
  estimatedValue: z.string().optional(),
  valueMeasurementApproach: z.string().optional(),
  integrationRequirements: z.string().optional(),
  aiMlTechnologies: z.array(z.string()).optional(),
  dataSources: z.array(z.string()).optional(),
  stakeholderGroups: z.array(z.string()).optional(),
  // RSA Portfolio Management
  isActiveForRsa: z.union([z.literal('true'), z.literal('false'), z.string()]).default('false'),
  isDashboardVisible: z.union([z.literal('true'), z.literal('false'), z.string()]).default('false'),
  libraryTier: z.union([z.literal('active'), z.literal('reference'), z.string()]).default('reference'),
  activationReason: z.string().optional(),
  // Enhanced RSA Framework - Business Impact Levers (all optional - no validation restrictions)
  revenueImpact: z.number().optional(),
  costSavings: z.number().optional(),
  riskReduction: z.number().optional(),
  brokerPartnerExperience: z.number().optional(),
  strategicFit: z.number().optional(),
  // Implementation Effort Levers (all optional)
  dataReadiness: z.number().optional(),
  technicalComplexity: z.number().optional(),
  changeImpact: z.number().optional(),
  modelRisk: z.number().optional(),
  adoptionReadiness: z.number().optional(),
  // RSA Ethical Principles (all optional) - moved to Tab 3, consistent string enums per replit.md
  explainabilityRequired: z.enum(['true', 'false']).optional(),
  customerHarmRisk: z.string().optional(),
  dataOutsideUkEu: z.enum(['true', 'false']).optional(),
  thirdPartyModel: z.enum(['true', 'false']).optional(),
  humanAccountability: z.enum(['true', 'false']).optional(),
  // AI Inventory Governance Fields (all optional)
  aiOrModel: z.string().optional(),
  riskToCustomers: z.string().optional(),
  riskToRsa: z.string().optional(),
  dataUsed: z.string().optional(),
  modelOwner: z.string().optional(),
  rsaPolicyGovernance: z.string().optional(),
  validationResponsibility: z.string().optional(),
  informedBy: z.string().optional(),
  // Manual Score Override fields (completely optional, no validation when empty)
  manualImpactScore: z.union([z.number(), z.string(), z.null()]).optional(),
  manualEffortScore: z.union([z.number(), z.string(), z.null()]).optional(),
  manualQuadrant: z.union([z.string(), z.null()]).optional(), // Now dynamic from metadata
  overrideReason: z.union([z.string(), z.null()]).optional(),
  businessFunction: z.string().optional(),
  thirdPartyProvidedModel: z.string().optional(),
  aiInventoryStatus: z.string().optional(),
  deploymentStatus: z.string().optional(),
  deactivationReason: z.string().optional(),
  regulatoryCompliance: z.union([z.number(), z.null()]).optional(),
  // Horizontal Use Case fields - following replit.md string boolean pattern
  horizontalUseCase: z.enum(['true', 'false']).default('false'),
  horizontalUseCaseTypes: z.array(z.string()).optional(),
  // Presentation fields
  presentationUrl: z.string().optional(),
  presentationPdfUrl: z.string().optional(),
  presentationFileName: z.string().optional(),
  // TOM Phase Override fields
  tomPhaseOverride: z.string().optional().nullable(),
  tomOverrideReason: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CRUDUseCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  useCase?: UseCase;
  context?: 'reference' | 'active' | 'dashboard';
}

/**
 * LEGO Block: CRUD Modal for Use Case Management
 * Reusable modal component supporting both create and edit operations
 * Follows database-first architecture with full RSA framework compliance
 */
export default function CRUDUseCaseModal({ isOpen, onClose, mode, useCase, context = 'active' }: CRUDUseCaseModalProps) {
  const { addUseCase, updateUseCase, metadata } = useUseCases();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sortedMetadata = useSortedMetadata();

  // TOM Configuration query
  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config'],
  });
  const isTomEnabled = tomConfig?.enabled === 'true';
  const tomPhases = tomConfig?.phases || [];

  // RSA Portfolio state management
  const [rsaSelection, setRsaSelection] = useState({
    isActiveForRsa: 'false' as 'true' | 'false',
    isDashboardVisible: 'false' as 'true' | 'false',
    libraryTier: 'reference' as 'active' | 'reference',
    activationReason: '',
    deactivationReason: '',
  });

  const [scores, setScores] = useState({
    revenueImpact: 3,
    costSavings: 3,
    riskReduction: 3,
    brokerPartnerExperience: 3,
    strategicFit: 3,
    dataReadiness: 3,
    technicalComplexity: 3,
    changeImpact: 3,
    modelRisk: 3,
    adoptionReadiness: 3,
  });

  // Manual override toggle state - managed by ScoreOverrideLegoBlock
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);

  // Tab state management
  const [activeTab, setActiveTab] = useState('basic');

  // Dynamic options from database metadata (replacing hardcoded arrays)
  const useCaseStatusOptions = sortedMetadata.getSortedItems('useCaseStatuses', metadata?.useCaseStatuses || []);
  const aiMlTechnologiesOptions = sortedMetadata.getSortedItems('aiMlTechnologies', metadata?.aiMlTechnologies || []);
  const dataSourcesOptions = sortedMetadata.getSortedItems('dataSources', metadata?.dataSources || []);
  const stakeholderGroupsOptions = sortedMetadata.getSortedItems('stakeholderGroups', metadata?.stakeholderGroups || []);

  // Tooltip definitions
  const sliderTooltips = {
    revenueImpact: "Potential for new revenue, premium growth, or market expansion",
    costSavings: "Direct operational cost reductions and efficiency gains",
    riskReduction: "Lowering underwriting, claims, fraud, operational, or regulatory risks",
    brokerPartnerExperience: "Improving relationships and experience for brokers and partners",
    strategicFit: "Alignment with corporate strategy, digital transformation, and competitive positioning",
    dataReadiness: "Quality, availability, and usability of required data sets",
    technicalComplexity: "Maturity of models needed (LLMs vs ML) and technical difficulty",
    changeImpact: "Degree of process and role redesign required for implementation",
    modelRisk: "Potential harm if model fails (regulatory, reputational, financial)",
    adoptionReadiness: "Stakeholder and user buy-in, especially in underwriting/claims",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      process: '',
      lineOfBusiness: '',
      linesOfBusiness: [],
      businessSegment: '',
      geography: '',
      useCaseType: '',
      librarySource: 'rsa_internal',
      isActiveForRsa: 'false',
      isDashboardVisible: 'false',
      libraryTier: 'reference',
      activationReason: '',
      ...scores,
    },
  });

  const handleSliderChange = (field: keyof typeof scores, value: number) => {
    const newScores = { ...scores, [field]: value };
    setScores(newScores);
    form.setValue(field, value);
  };

  // RSA Selection handlers
  const handleRSAToggle = (active: 'true' | 'false') => {
    setRsaSelection(prev => ({
      ...prev,
      isActiveForRsa: active,
      libraryTier: active === 'true' ? 'active' : 'reference'
    }));
    form.setValue('isActiveForRsa', active);
    form.setValue('libraryTier', active === 'true' ? 'active' : 'reference');
    
    // If deactivating, also disable dashboard visibility
    if (active === 'false') {
      setRsaSelection(prev => ({ ...prev, isDashboardVisible: 'false' }));
      form.setValue('isDashboardVisible', 'false');
    }
  };

  const handleDashboardToggle = (visible: 'true' | 'false') => {
    setRsaSelection(prev => ({ ...prev, isDashboardVisible: visible }));
    form.setValue('isDashboardVisible', visible);
  };

  const handleActivationReasonChange = (reason: string) => {
    setRsaSelection(prev => ({ ...prev, activationReason: reason }));
    form.setValue('activationReason', reason);
  };

  const handleDeactivationReasonChange = (reason: string) => {
    setRsaSelection(prev => ({ ...prev, deactivationReason: reason }));
    form.setValue('deactivationReason', reason);
  };

  // Get current values from form for real-time calculations
  const formValues = form.watch();
  
  // Extract weights from metadata or use defaults for real-time calculations
  // Use centralized weight utilities for consistency
  const businessImpactWeights = metadata?.scoringModel?.businessValue || {
    revenueImpact: 20, costSavings: 20, riskReduction: 20, brokerPartnerExperience: 20, strategicFit: 20
  };
  const implementationEffortWeights = metadata?.scoringModel?.feasibility || {
    dataReadiness: 20, technicalComplexity: 20, changeImpact: 20, modelRisk: 20, adoptionReadiness: 20
  };
  
  const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
  
  const currentImpactScore = calculateImpactScore(
    formValues.revenueImpact ?? scores.revenueImpact,
    formValues.costSavings ?? scores.costSavings,
    formValues.riskReduction ?? scores.riskReduction,
    formValues.brokerPartnerExperience ?? scores.brokerPartnerExperience,
    formValues.strategicFit ?? scores.strategicFit,
    businessImpactWeights
  );

  const currentEffortScore = calculateEffortScore(
    formValues.dataReadiness ?? scores.dataReadiness,
    formValues.technicalComplexity ?? scores.technicalComplexity,
    formValues.changeImpact ?? scores.changeImpact,
    formValues.modelRisk ?? scores.modelRisk,
    formValues.adoptionReadiness ?? scores.adoptionReadiness,
    implementationEffortWeights
  );

  const currentQuadrant = calculateQuadrant(currentImpactScore, currentEffortScore, threshold);

  // DropdownField component for scoring interface - using LEGO dropdown component
  const DropdownField = ({ 
    field, 
    label, 
    tooltip 
  }: { 
    field: keyof typeof scores; 
    label: string; 
    tooltip: string;
  }) => {
    // Use form.watch to get current value, fallback to scores state
    const currentValue = form.watch(field) ?? scores[field] ?? 3;
    
    // Get dropdown options from metadata
    const dropdownOptions = metadata?.scoringDropdownOptions?.[field] || [];
    
    // Fallback to basic options if metadata not available
    const defaultOptions = [
      {value: 1, label: "1", description: "Lowest"},
      {value: 2, label: "2", description: "Low"},
      {value: 3, label: "3", description: "Moderate"},
      {value: 4, label: "4", description: "High"},
      {value: 5, label: "5", description: "Highest"}
    ];
    
    const options = dropdownOptions.length > 0 ? dropdownOptions : defaultOptions;
    
    return (
      <ScoreDropdownLegoBlock
        label={label}
        field={field}
        value={currentValue}
        onChange={(field, value) => handleSliderChange(field as keyof typeof scores, value)}
        options={options}
        tooltip={tooltip}
        valueDisplay="badge"
      />
    );
  };

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && useCase) {
      // RSA selection state initialization
      const rsaActive = (useCase as any).isActiveForRsa === 'true' || (useCase as any).isActiveForRsa === true;
      const dashboardVisible = (useCase as any).isDashboardVisible === 'true' || (useCase as any).isDashboardVisible === true;
      
      // Initialize override toggle state based on existing manual overrides
      const hasManualOverrides = !!(
        (useCase as any).manualImpactScore || 
        (useCase as any).manualEffortScore || 
        (useCase as any).manualQuadrant
      );
      setIsOverrideEnabled(hasManualOverrides);
      
      setRsaSelection({
        isActiveForRsa: rsaActive ? 'true' : 'false',
        isDashboardVisible: dashboardVisible ? 'true' : 'false',
        libraryTier: (useCase as any).libraryTier || (rsaActive ? 'active' : 'reference'),
        activationReason: (useCase as any).activationReason || '',
        deactivationReason: (useCase as any).deactivationReason || '',
      });

      const formData = {
        title: useCase.title || '',
        description: useCase.description || '',
        problemStatement: (useCase as any).problemStatement || '',
        useCaseType: useCase.useCaseType || '',
        librarySource: (useCase as any).librarySource || 'rsa_internal',
        // Multi-select arrays only
        processes: (useCase as any).processes || [],
        activities: (useCase as any).activities || [],
        linesOfBusiness: (useCase as any).linesOfBusiness || [],
        businessSegments: (useCase as any).businessSegments || [],
        geographies: (useCase as any).geographies || [],
        // RSA Portfolio fields
        isActiveForRsa: rsaActive ? 'true' : 'false',
        isDashboardVisible: dashboardVisible ? 'true' : 'false',
        libraryTier: (useCase as any).libraryTier || (rsaActive ? 'active' : 'reference'),
        activationReason: (useCase as any).activationReason || '',
        // Map all enhanced framework dimensions - now properly mapped from API
        revenueImpact: (useCase as any).revenueImpact ?? 3,
        costSavings: (useCase as any).costSavings ?? 3,
        riskReduction: (useCase as any).riskReduction ?? 3,
        brokerPartnerExperience: (useCase as any).brokerPartnerExperience ?? 3,
        strategicFit: (useCase as any).strategicFit ?? 3,
        dataReadiness: (useCase as any).dataReadiness ?? 3,
        technicalComplexity: (useCase as any).technicalComplexity ?? 3,
        changeImpact: (useCase as any).changeImpact ?? 3,
        modelRisk: (useCase as any).modelRisk ?? 3,
        adoptionReadiness: (useCase as any).adoptionReadiness ?? 3,
        // RSA Ethical Principles - preserve boolean false values, only default null/undefined
        explainabilityRequired: (useCase as any).explainabilityRequired !== null && (useCase as any).explainabilityRequired !== undefined ? (useCase as any).explainabilityRequired : undefined,
        customerHarmRisk: (useCase as any).customerHarmRisk || undefined,
        dataOutsideUkEu: (useCase as any).dataOutsideUkEu !== null && (useCase as any).dataOutsideUkEu !== undefined ? (useCase as any).dataOutsideUkEu : undefined,
        thirdPartyModel: (useCase as any).thirdPartyModel !== null && (useCase as any).thirdPartyModel !== undefined ? (useCase as any).thirdPartyModel : undefined,
        humanAccountability: (useCase as any).humanAccountability !== null && (useCase as any).humanAccountability !== undefined ? (useCase as any).humanAccountability : undefined,
        // AI Inventory Governance Fields
        aiOrModel: (useCase as any).aiOrModel || undefined,
        riskToCustomers: (useCase as any).riskToCustomers || undefined,
        riskToRsa: (useCase as any).riskToRsa || undefined,
        dataUsed: (useCase as any).dataUsed || undefined,
        modelOwner: (useCase as any).modelOwner || undefined,
        rsaPolicyGovernance: (useCase as any).rsaPolicyGovernance || undefined,
        validationResponsibility: (useCase as any).validationResponsibility || undefined,
        informedBy: (useCase as any).informedBy || undefined,
        businessFunction: (useCase as any).businessFunction || '',
        thirdPartyProvidedModel: (useCase as any).thirdPartyProvidedModel || '',
        aiInventoryStatus: (useCase as any).aiInventoryStatus || '',
        deploymentStatus: (useCase as any).deploymentStatus || '',
        deactivationReason: (useCase as any).deactivationReason || '',
        regulatoryCompliance: (useCase as any).regulatoryCompliance ?? 3,
        // Manual override fields
        manualImpactScore: (useCase as any).manualImpactScore,
        manualEffortScore: (useCase as any).manualEffortScore,
        manualQuadrant: (useCase as any).manualQuadrant,
        overrideReason: (useCase as any).overrideReason || '',
        // Tab 3: Implementation & Governance fields
        primaryBusinessOwner: (useCase as any).primaryBusinessOwner || '',
        useCaseStatus: (useCase as any).useCaseStatus || 'Discovery',
        keyDependencies: (useCase as any).keyDependencies || '',
        implementationTimeline: (useCase as any).implementationTimeline || '',
        successMetrics: (useCase as any).successMetrics || '',
        estimatedValue: (useCase as any).estimatedValue || '',
        valueMeasurementApproach: (useCase as any).valueMeasurementApproach || '',
        integrationRequirements: (useCase as any).integrationRequirements || '',
        aiMlTechnologies: (useCase as any).aiMlTechnologies || [],
        dataSources: (useCase as any).dataSources || [],
        stakeholderGroups: (useCase as any).stakeholderGroups || [],
        // Horizontal Use Case fields
        horizontalUseCase: ((useCase as any).horizontalUseCase === 'true' ? 'true' : 'false') as 'true' | 'false',
        horizontalUseCaseTypes: (useCase as any).horizontalUseCaseTypes || [],
        // Presentation fields
        presentationUrl: (useCase as any).presentationUrl || '',
        presentationPdfUrl: (useCase as any).presentationPdfUrl || '',
        presentationFileName: (useCase as any).presentationFileName || '',
        // TOM Phase Override fields
        tomPhaseOverride: (useCase as any).tomPhaseOverride || null,
        tomOverrideReason: (useCase as any).tomOverrideReason || '',
      };
      
      // Update scores state first
      setScores({
        revenueImpact: formData.revenueImpact,
        costSavings: formData.costSavings,
        riskReduction: formData.riskReduction,
        brokerPartnerExperience: formData.brokerPartnerExperience,
        strategicFit: formData.strategicFit,
        dataReadiness: formData.dataReadiness,
        technicalComplexity: formData.technicalComplexity,
        changeImpact: formData.changeImpact,
        modelRisk: formData.modelRisk,
        adoptionReadiness: formData.adoptionReadiness,
      });
      
      // Reset form with all data
      form.reset(formData);
    } else {
      // Reset for create mode with default scores and RSA selection
      setIsOverrideEnabled(false);
      setRsaSelection({
        isActiveForRsa: 'false',
        isDashboardVisible: 'false',
        libraryTier: 'reference',
        activationReason: '',
        deactivationReason: '',
      });

      const defaultData = {
        title: '',
        description: '',
        problemStatement: '',
        useCaseType: '',
        librarySource: 'rsa_internal',
        // Multi-select arrays
        processes: [],
        activities: [],
        linesOfBusiness: [],
        businessSegments: [],
        geographies: [],
        // RSA Portfolio defaults
        isActiveForRsa: 'false',
        isDashboardVisible: 'false',
        libraryTier: 'reference',
        activationReason: '',
        // Tab 3: Implementation & Governance defaults
        primaryBusinessOwner: '',
        useCaseStatus: 'Discovery',
        keyDependencies: '',
        implementationTimeline: '',
        successMetrics: '',
        estimatedValue: '',
        valueMeasurementApproach: '',
        integrationRequirements: '',
        aiMlTechnologies: [],
        dataSources: [],
        stakeholderGroups: [],
        // Horizontal Use Case defaults
        horizontalUseCase: 'false' as 'true' | 'false',
        horizontalUseCaseTypes: [],
        // Presentation defaults
        presentationUrl: '',
        presentationPdfUrl: '',
        presentationFileName: '',
        ...scores,
      };
      form.reset(defaultData);
    }
  }, [mode, useCase, form]);

  // Handle tab switching when library source changes to AI Inventory
  useEffect(() => {
    const currentLibrarySource = form.watch('librarySource');
    // If AI Inventory is selected and current tab is assessment (which is hidden), switch to basic tab
    if (currentLibrarySource === 'ai_inventory' && activeTab === 'assessment') {
      setActiveTab('basic');
    }
  }, [form.watch('librarySource'), activeTab]);

  // Helper function to reset form to clean defaults
  const resetFormToDefaults = () => {
    // Reset all state to defaults
    setIsOverrideEnabled(false);
    setActiveTab('basic');
    setRsaSelection({
      isActiveForRsa: 'false',
      isDashboardVisible: 'false',
      libraryTier: 'reference',
      activationReason: '',
      deactivationReason: '',
    });
    setScores({
      revenueImpact: 3,
      costSavings: 3,
      riskReduction: 3,
      brokerPartnerExperience: 3,
      strategicFit: 3,
      dataReadiness: 3,
      technicalComplexity: 3,
      changeImpact: 3,
      modelRisk: 3,
      adoptionReadiness: 3,
    });

    const defaultData = {
      title: '',
      description: '',
      problemStatement: '',
      useCaseType: '',
      librarySource: 'rsa_internal',
      processes: [],
      activities: [],
      linesOfBusiness: [],
      businessSegments: [],
      geographies: [],
      isActiveForRsa: 'false',
      isDashboardVisible: 'false',
      libraryTier: 'reference',
      activationReason: '',
      primaryBusinessOwner: '',
      useCaseStatus: 'Discovery',
      keyDependencies: '',
      implementationTimeline: '',
      successMetrics: '',
      estimatedValue: '',
      valueMeasurementApproach: '',
      integrationRequirements: '',
      aiMlTechnologies: [],
      dataSources: [],
      stakeholderGroups: [],
      horizontalUseCase: 'false' as 'true' | 'false',
      horizontalUseCaseTypes: [],
      presentationUrl: '',
      presentationPdfUrl: '',
      presentationFileName: '',
      ...scores,
    };
    form.reset(defaultData);
  };

  const onSubmit = async (data: FormData) => {
    try {
      
      // Convert any null values to appropriate defaults for submission
      const sanitizedData = {
        ...data,
        // Convert null values to empty strings for text fields
        title: data.title || '',
        description: data.description || '',
        problemStatement: data.problemStatement || '',
        useCaseType: data.useCaseType || '',
        primaryBusinessOwner: data.primaryBusinessOwner || '',
        useCaseStatus: data.useCaseStatus || '',
        keyDependencies: data.keyDependencies || '',
        implementationTimeline: data.implementationTimeline || '',
        successMetrics: data.successMetrics || '',
        estimatedValue: data.estimatedValue || '',
        valueMeasurementApproach: data.valueMeasurementApproach || '',
        integrationRequirements: data.integrationRequirements || '',
        activationReason: data.activationReason || '',
        customerHarmRisk: data.customerHarmRisk || '',
        aiOrModel: data.aiOrModel || '',
        riskToCustomers: data.riskToCustomers || '',
        riskToRsa: data.riskToRsa || '',
        dataUsed: data.dataUsed || '',
        modelOwner: data.modelOwner || '',
        rsaPolicyGovernance: data.rsaPolicyGovernance || '',
        informedBy: data.informedBy || '',
        // Presentation fields
        presentationUrl: data.presentationUrl || '',
        presentationPdfUrl: data.presentationPdfUrl || '',
        presentationFileName: data.presentationFileName || '',
        // Additional presentation fields from upload (these might not be in form schema)
        presentationFileId: (data as any).presentationFileId || (window as any).pendingPresentationData?.presentationFileId || '',
        presentationPdfFileId: (data as any).presentationPdfFileId || (window as any).pendingPresentationData?.presentationPdfFileId || '',
        hasPresentation: (data as any).hasPresentation || (window as any).pendingPresentationData?.hasPresentation || 'false',
        presentationUploadedAt: (data as any).presentationUploadedAt || (window as any).pendingPresentationData?.presentationUploadedAt || null,
        businessFunction: data.businessFunction || '',
        thirdPartyProvidedModel: data.thirdPartyProvidedModel || '',
        aiInventoryStatus: data.aiInventoryStatus || '',
        deploymentStatus: data.deploymentStatus || '',
        deactivationReason: data.deactivationReason || '',
        overrideReason: data.overrideReason || '',
        // CRITICAL: Preserve manual override null values - DO NOT convert to empty strings
        manualImpactScore: data.manualImpactScore,
        manualEffortScore: data.manualEffortScore, 
        manualQuadrant: data.manualQuadrant,
        // Horizontal Use Case fields
        horizontalUseCase: data.horizontalUseCase || 'false',
        horizontalUseCaseTypes: data.horizontalUseCaseTypes || [],
        // TOM Phase Override fields - preserve null for auto-derivation
        tomPhaseOverride: data.tomPhaseOverride || null,
        tomOverrideReason: data.tomOverrideReason || ''
      };
      
      
      if (mode === 'edit' && useCase) {
        // For edit mode, only send changed fields to prevent overwriting unchanged values
        const originalData = {
          title: useCase.title,
          description: useCase.description,
          problemStatement: (useCase as any).problemStatement,
          process: useCase.process,
          lineOfBusiness: useCase.lineOfBusiness,
          businessSegment: useCase.businessSegment,
          geography: useCase.geography,
          useCaseType: useCase.useCaseType,
          activity: (useCase as any).activity,
          revenueImpact: (useCase as any).revenueImpact,
          costSavings: (useCase as any).costSavings,
          riskReduction: (useCase as any).riskReduction,
          brokerPartnerExperience: (useCase as any).brokerPartnerExperience,
          strategicFit: (useCase as any).strategicFit,
          dataReadiness: (useCase as any).dataReadiness,
          technicalComplexity: (useCase as any).technicalComplexity,
          changeImpact: (useCase as any).changeImpact,
          modelRisk: (useCase as any).modelRisk,
          adoptionReadiness: (useCase as any).adoptionReadiness,
          // Manual override fields
          manualImpactScore: (useCase as any).manualImpactScore,
          manualEffortScore: (useCase as any).manualEffortScore,
          manualQuadrant: (useCase as any).manualQuadrant,
          overrideReason: (useCase as any).overrideReason,
          // TOM Phase Override fields
          tomPhaseOverride: (useCase as any).tomPhaseOverride,
          tomOverrideReason: (useCase as any).tomOverrideReason,
        };
        
        // For now, send all data to avoid change detection issues
        // TODO: Optimize to only send changed fields once working
        
        // Include real-time calculated scores in the submission
        // These are calculated on the frontend and need to be sent to the server
        const changedData: any = { 
          ...sanitizedData,
          // Include current calculated scores (these will trigger recalculation on server)
          impactScore: currentImpactScore,
          effortScore: currentEffortScore,
          quadrant: currentQuadrant
        };
        
        
        // Remove meaningfulId from submission data - it's auto-generated server-side
        delete changedData.meaningfulId;
        
        // Handle data type conversions and null values for robust persistence
        Object.keys(changedData).forEach(key => {
          const value = changedData[key];
          
          // IMPORTANT: Do not convert empty strings to null for required fields (title, description)
          if (value === '' || value === 'null' || value === 'undefined') {
            // Keep empty strings for required fields to avoid validation errors
            if (['title', 'description'].includes(key)) {
              changedData[key] = '';
            } else {
              changedData[key] = null;
            }
          }
          
          // Handle boolean fields stored as text in database
          if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 'thirdPartyModel', 'humanAccountability', 'horizontalUseCase', 'hasPresentation'].includes(key)) {
            if (typeof value === 'boolean') {
              changedData[key] = value.toString();
            } else if (value === 'true' || value === true) {
              changedData[key] = 'true';
            } else if (value === 'false' || value === false) {
              changedData[key] = 'false';
            }
          }
          
          // Handle numeric fields that might come as strings - ALLOW null values to pass through
          if (['manualImpactScore', 'manualEffortScore', 'regulatoryCompliance'].includes(key)) {
            if (value === null || value === undefined) {
              changedData[key] = null; // Explicitly set null values
            } else {
              const numValue = Number(value);
              changedData[key] = isNaN(numValue) ? null : numValue;
            }
          }
          
          // Handle timestamp fields that need proper Date conversion
          if (['presentationUploadedAt'].includes(key)) {
            if (value === null || value === undefined || value === '') {
              changedData[key] = null;
            } else if (typeof value === 'string') {
              changedData[key] = new Date(value);
            }
          }
        });
        
        // Auto-promote to active tier if marked for dashboard visibility
        if (sanitizedData.isDashboardVisible === 'true' || sanitizedData.isActiveForRsa === 'true') {
          changedData.libraryTier = 'active';
        }
        
        // Validation constraints removed to allow free form submission
        
        const result = await updateUseCase(useCase.id, changedData);
        
        // Force refresh of all queries to ensure UI updates
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'reference'] });
        
        // Clear pending presentation data after successful save
        delete (window as any).pendingPresentationData;
        
        toast({
          title: "Use case updated successfully",
          description: `"${sanitizedData.title}" has been updated. Scores: Impact ${currentImpactScore.toFixed(1)}, Effort ${currentEffortScore.toFixed(1)}`,
        });
        
        // Reset form state to defaults after successful operation
        resetFormToDefaults();
      } else {
        
        // Apply same data transformations for create mode
        const createData: any = { ...sanitizedData };
        
        // Include calculated scores for new use cases
        createData.impactScore = currentImpactScore;
        createData.effortScore = currentEffortScore;
        createData.quadrant = currentQuadrant;
        
        // Remove meaningfulId from submission data - it's auto-generated server-side  
        delete createData.meaningfulId;
        
        // Handle data type conversions for create
        Object.keys(createData).forEach(key => {
          const value = createData[key];
          
          if (value === '' || value === 'null' || value === 'undefined') {
            // Keep empty strings for required fields to avoid validation errors
            if (['title', 'description'].includes(key)) {
              createData[key] = '';
            } else {
              createData[key] = null;
            }
          }
          
          if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 'thirdPartyModel', 'humanAccountability', 'horizontalUseCase', 'hasPresentation'].includes(key)) {
            if (typeof value === 'boolean') {
              createData[key] = value.toString();
            } else if (value === 'true' || value === true) {
              createData[key] = 'true';
            } else if (value === 'false' || value === false) {
              createData[key] = 'false';
            }
          }
          
          if (['manualImpactScore', 'manualEffortScore', 'regulatoryCompliance'].includes(key)) {
            if (value === null || value === undefined) {
              createData[key] = null; // Explicitly set null values
            } else {
              const numValue = Number(value);
              createData[key] = isNaN(numValue) ? null : numValue;
            }
          }
          
          // Handle timestamp fields that need proper Date conversion
          if (['presentationUploadedAt'].includes(key)) {
            if (value === null || value === undefined || value === '') {
              createData[key] = null;
            } else if (typeof value === 'string') {
              createData[key] = new Date(value);
            }
          }
        });
        
        const result = await addUseCase(createData);
        
        // Force refresh for create operations too
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'reference'] });
        
        // Clear pending presentation data after successful save
        delete (window as any).pendingPresentationData;
        
        toast({
          title: "Use case created successfully",
          description: `"${sanitizedData.title}" has been added. Scores: Impact ${currentImpactScore.toFixed(1)}, Effort ${currentEffortScore.toFixed(1)}`,
        });
      }
      
      // Reset form state to defaults after successful operation
      resetFormToDefaults();
      
      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = `Error ${mode === 'edit' ? 'updating' : 'creating'} use case`;
      
      // Handle different error types with user-friendly messages
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('validation')) {
          errorTitle = "Please check your entries";
          if (errorText.includes('title')) {
            errorMessage = "Please enter a title for your use case.";
          } else if (errorText.includes('description')) {
            errorMessage = "Please provide a description for your use case.";
          } else if (errorText.includes('processes')) {
            errorMessage = "Please select one or more processes.";
          } else if (errorText.includes('lines of business')) {
            errorMessage = "Please select one or more lines of business.";
          } else {
            errorMessage = "Please fill in the required fields and try again.";
          }
        } else if (errorText.includes('network') || errorText.includes('fetch')) {
          errorTitle = "Connection issue";
          errorMessage = "Unable to save changes. Please check your connection and try again.";
        } else if (errorText.includes('duplicate') || errorText.includes('already exists')) {
          errorTitle = "Duplicate entry";
          errorMessage = "A use case with this title already exists. Please choose a different title.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Handle API response errors with validation details
      if ((error as any)?.response?.data) {
        const responseData = (error as any).response.data;
        if (responseData.type === 'validation' && responseData.issues) {
          errorTitle = responseData.error || "Please check the following";
          // Display user-friendly error messages with better formatting
          errorMessage = Array.isArray(responseData.issues) 
            ? responseData.issues.join('\n• ') 
            : responseData.message || "Please check your entries and try again.";
          // Add bullet point to first item if multiple issues
          if (Array.isArray(responseData.issues) && responseData.issues.length > 1) {
            errorMessage = '• ' + errorMessage;
          }
        } else if (responseData.error) {
          errorTitle = responseData.error;
          errorMessage = responseData.message || "Something went wrong. Please try again.";
        }
      }
      
      // Show validation errors if available from backend
      if ((error as any)?.issues) {
        const validationIssues = (error as any).issues;
        if (Array.isArray(validationIssues) && validationIssues.length > 0) {
          errorTitle = "Please fix the following";
          errorMessage = validationIssues.join('\n');
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!metadata) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {mode === 'edit' ? 'Edit Use Case' : 'Create New Use Case'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update the use case details and scoring' : 'Define a new AI use case with Hexaware framework scoring'}
          </DialogDescription>
        </DialogHeader>

        {/* Form Requirements Guide */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Quick start:</span> Only <span className="text-red-500">*</span> required fields need to be filled to create a use case. All other fields are optional and can be added later.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            
            // Check for form validation errors and provide user feedback
            const errors = form.formState.errors;
            if (Object.keys(errors).length > 0) {
              const errorMessages = Object.entries(errors).map(([field, error]) => {
                const fieldLabel = field === 'title' ? 'Title' : field === 'description' ? 'Description' : field;
                return `${fieldLabel}: ${error?.message || 'Invalid value'}`;
              });
              
              toast({
                title: "Please fix the following issues",
                description: errorMessages.join('\n'),
                variant: "destructive",
              });
              return;
            }
            
            onSubmit(form.getValues() as FormData);
          }} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <ResponsiveTabsListLegoBlock>
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Context
                </TabsTrigger>
                <TabsTrigger value="implementation" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Implementation & Governance
                </TabsTrigger>
                <TabsTrigger value="presentation" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Use case definition
                </TabsTrigger>
                {/* Hexaware Framework Assessment - Hidden for AI Inventory per user request */}
                {form.watch('librarySource') !== 'ai_inventory' && (
                  <TabsTrigger value="assessment" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Hexaware Framework Assessment
                  </TabsTrigger>
                )}
              </ResponsiveTabsListLegoBlock>

              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meaningful ID Field - Read-only for existing use cases with IDs */}
                  {mode === 'edit' && useCase?.meaningfulId && (
                    <div>
                      <Label className="text-sm font-semibold">
                        Use Case ID
                      </Label>
                      <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                        <span className="font-mono text-sm text-rsa-blue font-medium">
                          {useCase.meaningfulId}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This ID is automatically assigned and cannot be changed
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Use Case Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Automated Claims Triage"
                      className="mt-1"
                      {...form.register('title')}
                      data-testid="input-title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-title">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  
                  {/* For new use cases, ID field is hidden - auto-generated after creation */}
                  
                  <div>
                    <Label className="text-sm font-semibold">Use Case Type</Label>
                    <Select key={`useCaseType-${mode}-${useCase?.id}`} value={form.watch('useCaseType') || ''} onValueChange={(value) => form.setValue('useCaseType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedMetadata.getSortedUseCaseTypes().filter(type => type && type.trim()).map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Source Type</Label>
                    <Select key={`librarySource-${mode}-${useCase?.id}`} value={form.watch('librarySource') || 'rsa_internal'} onValueChange={(value) => form.setValue('librarySource', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedMetadata.getSortedItems('sourceTypes', metadata?.sourceTypes || ['rsa_internal']).filter(source => source && source.trim()).map(source => (
                          <SelectItem key={source} value={source}>
                            {source.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* AI Inventory Selection Hint */}
                    {form.watch('librarySource') === 'ai_inventory' && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="w-4 h-4 text-emerald-600" />
                          <p className="text-sm text-emerald-800 font-medium">AI Inventory Item Selected</p>
                        </div>
                        <p className="text-sm text-emerald-700 mt-1">
                          AI Inventory governance fields are available on the <strong>"Implementation & Governance"</strong> tab below the Hexaware Ethical Principles section.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="problemStatement" className="text-sm font-semibold">Problem Statement / Business Need</Label>
                  <Textarea
                    id="problemStatement"
                    rows={3}
                    placeholder="Describe the specific business problem or need this use case addresses (e.g., 'Our current claims processing time is 25% higher than industry average, leading to poor customer satisfaction and increased operational costs.')"
                    className="mt-1"
                    {...form.register('problemStatement')}
                  />
                  {form.formState.errors.problemStatement && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.problemStatement.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold">
                    AI/Automation or Solution considerations <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Brief description of what this use case does..."
                    className="mt-1"
                    {...form.register('description')}
                    data-testid="textarea-description"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-description">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                {/* RSA Portfolio Selection - Hidden for AI Inventory types */}
                {form.watch('librarySource') !== 'ai_inventory' && (
                  <RSASelectionToggleLegoBlock
                    isActiveForRsa={rsaSelection.isActiveForRsa}
                    isDashboardVisible={rsaSelection.isDashboardVisible}
                    activationReason={rsaSelection.activationReason}
                    deactivationReason={rsaSelection.deactivationReason}
                    libraryTier={rsaSelection.libraryTier}
                    onRSAToggle={handleRSAToggle}
                    onDashboardToggle={handleDashboardToggle}
                    onActivationReasonChange={handleActivationReasonChange}
                    onDeactivationReasonChange={handleDeactivationReasonChange}
                    className="mb-6"
                  />
                )}
              </TabsContent>

              {/* Tab 2: Business Context */}
              <TabsContent value="business" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Processes Multi-Select - LEGO Component */}
              <MultiSelectField
                label="Processes"
                items={sortedMetadata.getSortedProcesses()}
                selectedItems={(form.watch('processes') as string[]) || []}
                onSelectionChange={(newItems) => {
                  form.setValue('processes', newItems);
                }}
                helpText="Select one or more business processes"
              />
              {/* Process Activities handled by LEGO component below */}
              <div className="flex items-center justify-center text-sm text-gray-500 italic">
                Multi-select Process Activities available below
              </div>
            </div>
            {/* Multi-Select Business Context - Enhanced LEGO Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lines of Business Multi-Select */}
              <MultiSelectField
                label="Lines of Business"
                items={sortedMetadata.getSortedLinesOfBusiness()}
                selectedItems={(form.watch('linesOfBusiness') as string[]) || []}
                onSelectionChange={(newItems) => {
                  form.setValue('linesOfBusiness', newItems);
                }}
                helpText="Select one or more lines of business"
              />
              
              {/* Business Segments Multi-Select */}
              <MultiSelectField
                label="Business Segments"
                items={sortedMetadata.getSortedBusinessSegments()}
                selectedItems={(form.watch('businessSegments') as string[]) || []}
                onSelectionChange={(newItems) => {
                  form.setValue('businessSegments', newItems);
                }}
                helpText="Select one or more business segments"
              />
              
              {/* Geographies Multi-Select */}
              <MultiSelectField
                label="Geographies"
                items={sortedMetadata.getSortedGeographies()}
                selectedItems={(form.watch('geographies') as string[]) || []}
                onSelectionChange={(newItems) => {
                  form.setValue('geographies', newItems);
                }}
                helpText="Select one or more geographic markets"
              />
              
              {/* Process Activities - LEGO Contextual Component */}
              <ContextualProcessActivityField
                selectedProcesses={(form.watch('processes') as string[]) || []}
                selectedActivities={(form.watch('activities') as string[]) || []}
                onActivitiesChange={(newItems) => {
                  form.setValue('activities', newItems);
                }}
                helpText={(form.watch('processes') as string[])?.length > 0 ? "Activities filtered by selected processes" : "Select processes first to enable activities"}
                placeholder={!((form.watch('processes') as string[])?.length > 0) ? "Select processes first" : "Select activities..."}
              />

              {/* Horizontal Use Case Selection - LEGO Component */}
              <HorizontalUseCaseLegoBlock
                isHorizontalUseCase={form.watch('horizontalUseCase') || 'false'}
                selectedTypes={(form.watch('horizontalUseCaseTypes') as string[]) || []}
                onHorizontalUseCaseChange={(value: 'true' | 'false') => form.setValue('horizontalUseCase', value)}
                onTypesChange={(types) => form.setValue('horizontalUseCaseTypes', types)}
                className="w-full"
              />
            </div>
              </TabsContent>

              {/* Tab 3: Implementation & Governance */}
              <TabsContent value="implementation" className="space-y-4 mt-6">
                {/* Project Management Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Project Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryBusinessOwner" className="text-sm font-semibold">Primary Business Owner</Label>
                      <Input
                        id="primaryBusinessOwner"
                        placeholder="e.g., John Smith, Claims Director"
                        className="mt-1"
                        {...form.register('primaryBusinessOwner')}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Use Case Status</Label>
                      <Select value={form.watch('useCaseStatus') || 'Discovery'} onValueChange={(value) => form.setValue('useCaseStatus', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {useCaseStatusOptions.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* TOM Phase Override - only visible when TOM is enabled */}
                  {isTomEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          TOM Phase Override
                          <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                        </Label>
                        <Select 
                          value={form.watch('tomPhaseOverride') || ''} 
                          onValueChange={(value) => form.setValue('tomPhaseOverride', value === '' ? null : value)}
                        >
                          <SelectTrigger className="mt-1" data-testid="select-tom-phase-override">
                            <SelectValue placeholder="Auto-derive from status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Auto-derive from status</SelectItem>
                            {tomPhases.map(phase => (
                              <SelectItem key={phase.id} value={phase.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: phase.color }}
                                  />
                                  {phase.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tomOverrideReason" className="text-sm font-semibold">Override Reason</Label>
                        <Input
                          id="tomOverrideReason"
                          placeholder="Why is manual phase assignment needed?"
                          className="mt-1"
                          disabled={!form.watch('tomPhaseOverride')}
                          {...form.register('tomOverrideReason')}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keyDependencies" className="text-sm font-semibold">Key Dependencies</Label>
                      <Textarea
                        id="keyDependencies"
                        rows={2}
                        placeholder="e.g., Guidewire API completion, Project Atlas data feeds"
                        className="mt-1"
                        {...form.register('keyDependencies')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="implementationTimeline" className="text-sm font-semibold">Implementation Timeline</Label>
                      <Input
                        id="implementationTimeline"
                        placeholder="e.g., Q2 2024 - Q4 2024"
                        className="mt-1"
                        {...form.register('implementationTimeline')}
                      />
                    </div>
                  </div>
                </div>

                {/* Value Realization Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Value Realization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="successMetrics" className="text-sm font-semibold">Success Metrics / KPIs</Label>
                      <Textarea
                        id="successMetrics"
                        rows={2}
                        placeholder="e.g., Reduce manual review time by 30%, Increase quote-to-bind ratio by 5%"
                        className="mt-1"
                        {...form.register('successMetrics')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedValue" className="text-sm font-semibold">Estimated Value (£)</Label>
                      <Input
                        id="estimatedValue"
                        placeholder="e.g., £2.5M annual savings"
                        className="mt-1"
                        {...form.register('estimatedValue')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="valueMeasurementApproach" className="text-sm font-semibold">Value Measurement Approach</Label>
                    <Textarea
                      id="valueMeasurementApproach"
                      rows={2}
                      placeholder="How will success be tracked and reported?"
                      className="mt-1"
                      {...form.register('valueMeasurementApproach')}
                    />
                  </div>
                </div>

                {/* Technical Implementation Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Technical Implementation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MultiSelectField
                      label="AI/ML Technologies"
                      items={aiMlTechnologiesOptions}
                      selectedItems={form.watch('aiMlTechnologies') || []}
                      onSelectionChange={(newItems) => form.setValue('aiMlTechnologies', newItems)}
                      helpText="Select relevant AI/ML technologies"
                    />
                    <MultiSelectField
                      label="Data Sources"
                      items={dataSourcesOptions}
                      selectedItems={form.watch('dataSources') || []}
                      onSelectionChange={(newItems) => form.setValue('dataSources', newItems)}
                      helpText="Select required data sources"
                    />
                    <MultiSelectField
                      label="Stakeholder Groups"
                      items={stakeholderGroupsOptions}
                      selectedItems={form.watch('stakeholderGroups') || []}
                      onSelectionChange={(newItems) => form.setValue('stakeholderGroups', newItems)}
                      helpText="Select involved stakeholder groups"
                    />
                  </div>
                  <div>
                    <Label htmlFor="integrationRequirements" className="text-sm font-semibold">Integration Requirements</Label>
                    <Textarea
                      id="integrationRequirements"
                      rows={2}
                      placeholder="System touchpoints, API needs, data flows"
                      className="mt-1"
                      {...form.register('integrationRequirements')}
                    />
                  </div>
                </div>

                {/* Hexaware Ethical Principles Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Hexaware Ethical Principles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="explainabilityRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">Is explainability required?</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === 'yes' ? 'true' : value === 'no' ? 'false' : undefined)} 
                            value={field.value === 'true' ? 'yes' : field.value === 'false' ? 'no' : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerHarmRisk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">Customer harm risk?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataOutsideUkEu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">Data processing outside UK/EU?</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value)} 
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="thirdPartyModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">Third party model?</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value)} 
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="humanAccountability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">Human accountability required?</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value)} 
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="regulatoryCompliance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">Regulatory Compliance Score</FormLabel>
                          <FormControl>
                            <ScoreSliderLegoBlock
                              label="Regulatory Compliance"
                              field="regulatoryCompliance"
                              value={field.value ?? 3}
                              onChange={(fieldName, value) => {
                                field.onChange(value);
                                form.setValue('regulatoryCompliance', value);
                              }}
                              tooltip="Level of compliance with regulatory requirements"
                              leftLabel="Low Compliance"
                              rightLabel="High Compliance"
                              minValue={1}
                              maxValue={5}
                              disabled={false}
                              showTooltip={true}
                              valueDisplay="inline"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* AI Inventory Governance Section - Only show for AI inventory */}
                {form.watch('librarySource') === 'ai_inventory' && (
                  <div className="space-y-4 border-l-4 border-emerald-500 pl-4 bg-emerald-50/30 p-4 rounded-lg">
                    <h4 className="font-medium text-emerald-800 text-lg flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      AI Inventory Governance
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aiOrModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">AI or Model Classification</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select classification..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AI">AI</SelectItem>
                                <SelectItem value="Model">Model</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="validationResponsibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Validation Responsibility</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select responsibility..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Internal">Internal</SelectItem>
                                <SelectItem value="Third Party">Third Party</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="riskToCustomers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Risk to Customers</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe potential risks to customers..."
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="riskToRsa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Risk to Hexaware</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe Hexaware-specific risks..."
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dataUsed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Data Sources Used</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe data sources and types used..."
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="modelOwner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Model Owner</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Owner contact information..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rsaPolicyGovernance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Hexaware Policy Governance</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Governance framework reference..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="informedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Informed By</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Stakeholder information..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="businessFunction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Business Function</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Marketing, CIO, Claims, CFU..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thirdPartyProvidedModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Third Party Provided Model</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deploymentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">Deployment Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select deployment status..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="staging">Staging</SelectItem>
                                <SelectItem value="development">Development</SelectItem>
                                <SelectItem value="local">Local</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 4: Use case definition */}
              <TabsContent value="presentation" className="space-y-4 mt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Use Case Definition Document</h3>
                  </div>

                  {/* Upload Component */}
                  <PresentationUploadBlock
                    onUploadComplete={(result) => {
                      // Update form with presentation data
                      form.setValue('presentationUrl', result.presentationUrl);
                      form.setValue('presentationPdfUrl', result.presentationPdfUrl);
                      form.setValue('presentationFileName', result.presentationFileName);
                      
                      // Store additional fields in a way that will be accessible during form submission
                      // Using a ref or state would be better, but for now we'll store in window temporarily
                      (window as any).pendingPresentationData = {
                        presentationFileId: result.presentationFileId,
                        presentationPdfFileId: result.presentationPdfFileId,
                        hasPresentation: result.hasPresentation || 'true',
                        presentationUploadedAt: new Date().toISOString()
                      };
                      
                      // Show success message and keep modal open so user can see preview
                      toast({
                        title: "File uploaded successfully",
                        description: "Your presentation is now available for preview below. You can save when ready.",
                      });
                    }}
                  />

                  {/* Preview Component - shown when there's a presentation */}
                  {(form.watch('presentationPdfUrl') || (useCase as any)?.presentationPdfUrl) && (
                    <div className="mt-6">
                      <PresentationPreviewBlock
                        presentationUrl={form.watch('presentationUrl') || (useCase as any)?.presentationUrl}
                        presentationPdfUrl={form.watch('presentationPdfUrl') || (useCase as any)?.presentationPdfUrl}
                        presentationFileName={form.watch('presentationFileName') || (useCase as any)?.presentationFileName}
                        hasPresentation="true"
                        showTitle={false}
                      />
                    </div>
                  )}

                  {/* Help text */}
                  <div className="text-sm text-gray-600 mt-4">
                    <p>Upload PowerPoint presentations (.pptx, .ppt) or PDF files to provide detailed information about this use case. Files will be automatically converted to PDF for preview.</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: RSA Framework Assessment - Available for all source types except Reference Library context */}
              {(context as string) !== 'reference' && (
                <TabsContent value="assessment" className="space-y-4 mt-6">
                {rsaSelection.isActiveForRsa ? (
                  <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Impact Levers */}
              <div className="space-y-6">
                <h4 className="font-medium text-green-700 text-sm uppercase tracking-wide">Business Impact Levers</h4>
                {/* Strategic scoring fields available for all source types */}
                <>
                  <DropdownField
                    field="revenueImpact"
                    label="Revenue Impact"
                    tooltip={sliderTooltips.revenueImpact}
                  />
                  <DropdownField
                    field="costSavings"
                    label="Cost Savings"
                    tooltip={sliderTooltips.costSavings}
                  />
                </>
                <DropdownField
                  field="riskReduction"
                  label="Risk Reduction"
                  tooltip={sliderTooltips.riskReduction}
                />
                <DropdownField
                  field="brokerPartnerExperience"
                  label="Broker/Partner Experience"
                  tooltip={sliderTooltips.brokerPartnerExperience}
                />
                <DropdownField
                  field="strategicFit"
                  label="Strategic Fit"
                  tooltip={sliderTooltips.strategicFit}
                />
              </div>
              {/* Implementation Effort Levers */}
              <div className="space-y-6">
                <h4 className="font-medium text-blue-700 text-sm uppercase tracking-wide">Implementation Effort Levers</h4>
                <DropdownField
                  field="dataReadiness"
                  label="Data Readiness"
                  tooltip={sliderTooltips.dataReadiness}
                />
                <DropdownField
                  field="technicalComplexity"
                  label="Technical Complexity"
                  tooltip={sliderTooltips.technicalComplexity}
                />
                <DropdownField
                  field="changeImpact"
                  label="Change Impact"
                  tooltip={sliderTooltips.changeImpact}
                />
                <DropdownField
                  field="modelRisk"
                  label="Model Risk"
                  tooltip={sliderTooltips.modelRisk}
                />
                <DropdownField
                  field="adoptionReadiness"
                  label="Adoption Readiness"
                  tooltip={sliderTooltips.adoptionReadiness}
                />
              </div>
            </div>
            
            {/* Calculated Scores */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Calculated Scores</CardTitle>
              </CardHeader>
              <CardContent>
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
                    <div className="text-lg font-semibold text-purple-600 bg-white px-4 py-2 rounded-lg">
                      {currentQuadrant}
                    </div>
                    <div className="text-sm text-gray-600">Quadrant</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Manual Score Override Section - Show for Active RSA Use Cases */}
            {rsaSelection.isActiveForRsa && (
              <ScoreOverrideLegoBlock
                form={form}
                calculatedImpact={currentImpactScore}
                calculatedEffort={currentEffortScore}
                calculatedQuadrant={currentQuadrant}
                onToggleChange={setIsOverrideEnabled}
              />
            )}
                  </div>
                ) : (
                  <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Scoring Available After Hexaware Portfolio Selection
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Use cases in the reference library can be browsed and selected. 
                        Complete scoring and categorization becomes available once included in the Hexaware active portfolio.
                      </p>
                      <Alert className="border-blue-200 bg-blue-50 text-left">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Library-First Workflow:</strong> All use cases start in the reference library. 
                          Toggle "Include in Hexaware Active Portfolio" below to enable detailed assessment and scoring.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
                </TabsContent>
              )}
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" data-testid="button-submit">
                {mode === 'edit' ? 'Update Use Case' : 'Create Use Case'}
              </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}