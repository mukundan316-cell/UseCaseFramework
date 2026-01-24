import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTabsListLegoBlock from './ResponsiveTabsListLegoBlock';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Plus, Edit, Target, Shield, BarChart3, Layers, HelpCircle, AlertTriangle, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { ScoreDropdownLegoBlock } from './ScoreDropdownLegoBlock';
import { UseCase } from '../../types';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant, calculateGovernanceStatus } from '@shared/calculations';
import GovernanceStepperLegoBlock from './GovernanceStepperLegoBlock';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { derivePhase, calculatePhaseReadiness, getRequirementLabel, type TomConfig, type UseCaseDataForReadiness } from '@shared/tom';
import PhaseReadinessLegoBlock from './PhaseReadinessLegoBlock';
import { useSortedMetadata } from '@/hooks/useSortedMetadata';
import { useEngagement } from '@/contexts/EngagementContext';
import { 
  OperatingModelTab, 
  DetailsTab, 
  ResponsibleAITab, 
  ScoringTab, 
  GuideTab,
  calculateSectionCompletion,
  getInitialExpandedSections,
  type ScoresState 
} from './crud-modal-tabs';

const formSchema = z.object({
  title: z.string().min(1, "Please enter a title for this use case").max(200, "Title must be shorter than 200 characters"),
  description: z.string().min(1, "Please provide a brief description").max(2000, "Description must be shorter than 2000 characters"),
  meaningfulId: z.string().optional(),
  problemStatement: z.string().optional(),
  process: z.string().optional(),
  lineOfBusiness: z.string().optional(),
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  linesOfBusiness: z.array(z.string()).optional(),
  businessSegment: z.string().optional(),
  geography: z.string().optional(),
  useCaseType: z.string().optional(),
  activity: z.string().optional(),
  librarySource: z.string().default('internal'),
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
  isActiveForRsa: z.union([z.literal('true'), z.literal('false'), z.string()]).default('false'),
  isDashboardVisible: z.union([z.literal('true'), z.literal('false'), z.string()]).default('false'),
  libraryTier: z.union([z.literal('active'), z.literal('reference'), z.string()]).default('reference'),
  activationReason: z.string().optional(),
  revenueImpact: z.number().optional(),
  costSavings: z.number().optional(),
  riskReduction: z.number().optional(),
  brokerPartnerExperience: z.number().optional(),
  strategicFit: z.number().optional(),
  dataReadiness: z.number().optional(),
  technicalComplexity: z.number().optional(),
  changeImpact: z.number().optional(),
  modelRisk: z.number().optional(),
  adoptionReadiness: z.number().optional(),
  explainabilityRequired: z.enum(['true', 'false']).optional(),
  customerHarmRisk: z.string().optional(),
  dataOutsideUkEu: z.enum(['true', 'false']).optional(),
  thirdPartyModel: z.enum(['true', 'false']).optional(),
  humanAccountability: z.enum(['true', 'false']).optional(),
  aiOrModel: z.string().optional(),
  riskToCustomers: z.string().optional(),
  riskToRsa: z.string().optional(),
  dataUsed: z.string().optional(),
  modelOwner: z.string().optional(),
  rsaPolicyGovernance: z.string().optional(),
  validationResponsibility: z.string().optional(),
  informedBy: z.string().optional(),
  manualImpactScore: z.union([z.number(), z.string(), z.null()]).optional(),
  manualEffortScore: z.union([z.number(), z.string(), z.null()]).optional(),
  manualQuadrant: z.union([z.string(), z.null()]).optional(),
  overrideReason: z.union([z.string(), z.null()]).optional(),
  businessFunction: z.string().optional(),
  thirdPartyProvidedModel: z.string().optional(),
  aiInventoryStatus: z.string().optional(),
  deploymentStatus: z.string().optional(),
  deactivationReason: z.string().optional(),
  regulatoryCompliance: z.union([z.number(), z.null()]).optional(),
  horizontalUseCase: z.enum(['true', 'false']).default('false'),
  horizontalUseCaseTypes: z.array(z.string()).optional(),
  presentationUrl: z.string().optional(),
  presentationPdfUrl: z.string().optional(),
  presentationFileName: z.string().optional(),
  tomPhaseOverride: z.string().optional().nullable(),
  tomOverrideReason: z.string().optional(),
  phaseTransitionReason: z.string().optional(),
  initialInvestment: z.union([z.number(), z.string(), z.null()]).optional(),
  ongoingMonthlyCost: z.union([z.number(), z.string(), z.null()]).optional(),
  selectedKpis: z.array(z.string()).optional(),
  capabilityVendorFte: z.union([z.number(), z.string(), z.null()]).optional(),
  capabilityClientFte: z.union([z.number(), z.string(), z.null()]).optional(),
  capabilityIndependence: z.union([z.number(), z.string(), z.null()]).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CRUDUseCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  useCase?: UseCase;
  context?: 'reference' | 'active' | 'dashboard';
}

export default function CRUDUseCaseModal({ isOpen, onClose, mode, useCase, context = 'active' }: CRUDUseCaseModalProps) {
  const { addUseCase, updateUseCase, metadata } = useUseCases();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sortedMetadata = useSortedMetadata();
  const { selectedClientId } = useEngagement();
  const { symbol: currencySymbol } = useCurrency();

  const { data: tomConfig } = useQuery<TomConfig>({
    queryKey: ['/api/tom/config', selectedClientId],
  });
  const isTomEnabled = tomConfig?.enabled === 'true';
  const tomPhases = tomConfig?.phases || [];

  const [rsaSelection, setRsaSelection] = useState({
    isActiveForRsa: 'false' as 'true' | 'false',
    isDashboardVisible: 'false' as 'true' | 'false',
    libraryTier: 'reference' as 'active' | 'reference',
    activationReason: '',
    deactivationReason: '',
  });

  const [scores, setScores] = useState<ScoresState>({
    revenueImpact: 0,
    costSavings: 0,
    riskReduction: 0,
    brokerPartnerExperience: 0,
    strategicFit: 0,
    dataReadiness: 0,
    technicalComplexity: 0,
    changeImpact: 0,
    modelRisk: 0,
    adoptionReadiness: 0,
  });
  
  const [similarUseCases, setSimilarUseCases] = useState<Array<{
    meaningfulId: string;
    title: string;
    similarityScore: number;
  }>>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [showPhaseTransitionWarning, setShowPhaseTransitionWarning] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  const [phaseTransitionReason, setPhaseTransitionReason] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [editCapabilityTransition, setEditCapabilityTransition] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['business-context']);

  const useCaseStatusOptions = sortedMetadata.getSortedItems('useCaseStatuses', metadata?.useCaseStatuses || []);
  const aiMlTechnologiesOptions = sortedMetadata.getSortedItems('aiMlTechnologies', metadata?.aiMlTechnologies || []);
  const dataSourcesOptions = sortedMetadata.getSortedItems('dataSources', metadata?.dataSources || []);
  const stakeholderGroupsOptions = sortedMetadata.getSortedItems('stakeholderGroups', metadata?.stakeholderGroups || []);

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
      librarySource: 'internal',
      isActiveForRsa: 'false',
      isDashboardVisible: 'false',
      libraryTier: 'reference',
      activationReason: '',
      useCaseStatus: 'Discovery',
      phaseTransitionReason: '',
      ...scores,
    },
  });

  const watchedStatus = form.watch('useCaseStatus');
  const watchedDeploymentStatus = form.watch('deploymentStatus');
  const watchedTomOverride = form.watch('tomPhaseOverride');
  
  const currentDerivedPhase = React.useMemo(() => {
    if (!isTomEnabled || !tomConfig) return null;
    return derivePhase(
      watchedStatus || null,
      watchedDeploymentStatus || null,
      watchedTomOverride || null,
      tomConfig
    );
  }, [isTomEnabled, tomConfig, watchedStatus, watchedDeploymentStatus, watchedTomOverride]);

  const phaseReadiness = React.useMemo(() => {
    if (!isTomEnabled || !tomConfig || !currentDerivedPhase || currentDerivedPhase.id === 'unphased' || currentDerivedPhase.id === 'disabled') {
      return null;
    }
    const formValues = form.getValues();
    const useCaseData: UseCaseDataForReadiness = {
      title: formValues.title,
      description: formValues.description,
      primaryBusinessOwner: formValues.primaryBusinessOwner,
      processes: formValues.processes,
      activities: formValues.activities,
      revenueImpact: formValues.revenueImpact,
      costSavings: formValues.costSavings,
      riskReduction: formValues.riskReduction,
      brokerPartnerExperience: formValues.brokerPartnerExperience,
      strategicFit: formValues.strategicFit,
      technicalComplexity: formValues.technicalComplexity,
      dataReadiness: formValues.dataReadiness,
      organizationalReadiness: formValues.changeImpact,
      integrationComplexity: formValues.modelRisk,
      regulatoryCompliance: formValues.adoptionReadiness,
      raiQuestionnaireComplete: (useCase as any)?.raiQuestionnaireComplete ?? null,
      investmentCostGbp: (useCase as any)?.investmentCostGbp ?? null,
      runCostPerYearGbp: (useCase as any)?.runCostPerYearGbp ?? null,
      targetIndependence: (useCase as any)?.targetIndependence ?? null,
      currentIndependence: (useCase as any)?.currentIndependence ?? null,
      selectedKpis: (useCase as any)?.selectedKpis ?? null
    };
    return calculatePhaseReadiness(useCaseData, currentDerivedPhase.id, tomConfig);
  }, [isTomEnabled, tomConfig, currentDerivedPhase, form, useCase]);

  const handleSliderChange = (field: keyof ScoresState, value: number) => {
    const newScores = { ...scores, [field]: value };
    setScores(newScores);
    form.setValue(field, value);
  };

  const handleRSAToggle = (active: 'true' | 'false') => {
    setRsaSelection(prev => ({
      ...prev,
      isActiveForRsa: active,
      libraryTier: active === 'true' ? 'active' : 'reference'
    }));
    form.setValue('isActiveForRsa', active);
    form.setValue('libraryTier', active === 'true' ? 'active' : 'reference');
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

  const handleStatusChange = (newStatus: string) => {
    if (!isTomEnabled || !tomConfig) {
      form.setValue('useCaseStatus', newStatus);
      return;
    }
    const newPhaseResult = derivePhase(
      newStatus,
      form.watch('deploymentStatus') || null,
      form.watch('tomPhaseOverride') || null,
      tomConfig
    );
    const newPhaseId = newPhaseResult?.id || null;
    const currentPhaseId = currentDerivedPhase?.id || null;
    if (newPhaseId && currentPhaseId && newPhaseId !== currentPhaseId && currentPhaseId !== 'unphased' && currentPhaseId !== 'disabled') {
      if (phaseReadiness && !phaseReadiness.canProgress) {
        setPendingStatusChange(newStatus);
        setShowPhaseTransitionWarning(true);
        return;
      }
    }
    form.setValue('useCaseStatus', newStatus);
  };

  const confirmPhaseTransition = () => {
    if (pendingStatusChange) {
      form.setValue('useCaseStatus', pendingStatusChange);
      form.setValue('phaseTransitionReason', phaseTransitionReason);
    }
    setShowPhaseTransitionWarning(false);
    setPendingStatusChange(null);
    setPhaseTransitionReason('');
  };

  const cancelPhaseTransition = () => {
    setShowPhaseTransitionWarning(false);
    setPendingStatusChange(null);
    setPhaseTransitionReason('');
  };

  const formValues = form.watch();

  const governanceStatus = React.useMemo(() => {
    const useCaseData = {
      primaryBusinessOwner: formValues.primaryBusinessOwner,
      useCaseStatus: formValues.useCaseStatus,
      businessFunction: formValues.businessFunction,
      revenueImpact: scores.revenueImpact,
      costSavings: scores.costSavings,
      riskReduction: scores.riskReduction,
      brokerPartnerExperience: scores.brokerPartnerExperience,
      strategicFit: scores.strategicFit,
      dataReadiness: scores.dataReadiness,
      technicalComplexity: scores.technicalComplexity,
      changeImpact: scores.changeImpact,
      modelRisk: scores.modelRisk,
      adoptionReadiness: scores.adoptionReadiness,
      explainabilityRequired: formValues.explainabilityRequired,
      customerHarmRisk: formValues.customerHarmRisk,
      humanAccountability: formValues.humanAccountability,
      dataOutsideUkEu: formValues.dataOutsideUkEu,
      thirdPartyModel: formValues.thirdPartyModel,
    };
    return calculateGovernanceStatus(useCaseData);
  }, [formValues, scores]);
  
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

  useEffect(() => {
    if (mode === 'edit' && useCase) {
      const rsaActive = (useCase as any).isActiveForRsa === 'true' || (useCase as any).isActiveForRsa === true;
      const dashboardVisible = (useCase as any).isDashboardVisible === 'true' || (useCase as any).isDashboardVisible === true;
      const hasManualOverrides = !!(
        (useCase as any).manualImpactScore || 
        (useCase as any).manualEffortScore || 
        (useCase as any).manualQuadrant
      );
      setIsOverrideEnabled(hasManualOverrides);
      const hasValueOverride = !!((useCase as any).successMetrics || (useCase as any).estimatedValue || (useCase as any).valueMeasurementApproach);
      setShowManualOverride(hasValueOverride);
      const hasCapabilityData = !!((useCase as any).capabilityVendorFte || (useCase as any).capabilityClientFte || (useCase as any).capabilityIndependence);
      setEditCapabilityTransition(hasCapabilityData);
      const initialCounts = calculateSectionCompletion(useCase as any, isTomEnabled);
      setExpandedSections(getInitialExpandedSections(initialCounts));
      
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
        librarySource: (useCase as any).librarySource || 'internal',
        processes: (useCase as any).processes || [],
        activities: (useCase as any).activities || [],
        linesOfBusiness: (useCase as any).linesOfBusiness || [],
        businessSegments: (useCase as any).businessSegments || [],
        geographies: (useCase as any).geographies || [],
        isActiveForRsa: rsaActive ? 'true' : 'false',
        isDashboardVisible: dashboardVisible ? 'true' : 'false',
        libraryTier: (useCase as any).libraryTier || (rsaActive ? 'active' : 'reference'),
        activationReason: (useCase as any).activationReason || '',
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
        explainabilityRequired: (useCase as any).explainabilityRequired !== null && (useCase as any).explainabilityRequired !== undefined ? (useCase as any).explainabilityRequired : undefined,
        customerHarmRisk: (useCase as any).customerHarmRisk || undefined,
        dataOutsideUkEu: (useCase as any).dataOutsideUkEu !== null && (useCase as any).dataOutsideUkEu !== undefined ? (useCase as any).dataOutsideUkEu : undefined,
        thirdPartyModel: (useCase as any).thirdPartyModel !== null && (useCase as any).thirdPartyModel !== undefined ? (useCase as any).thirdPartyModel : undefined,
        humanAccountability: (useCase as any).humanAccountability !== null && (useCase as any).humanAccountability !== undefined ? (useCase as any).humanAccountability : undefined,
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
        manualImpactScore: (useCase as any).manualImpactScore,
        manualEffortScore: (useCase as any).manualEffortScore,
        manualQuadrant: (useCase as any).manualQuadrant,
        overrideReason: (useCase as any).overrideReason || '',
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
        horizontalUseCase: ((useCase as any).horizontalUseCase === 'true' ? 'true' : 'false') as 'true' | 'false',
        horizontalUseCaseTypes: (useCase as any).horizontalUseCaseTypes || [],
        presentationUrl: (useCase as any).presentationUrl || '',
        presentationPdfUrl: (useCase as any).presentationPdfUrl || '',
        presentationFileName: (useCase as any).presentationFileName || '',
        tomPhaseOverride: (useCase as any).tomPhaseOverride || null,
        tomOverrideReason: (useCase as any).tomOverrideReason || '',
        phaseTransitionReason: '',
        initialInvestment: (useCase as any).valueRealization?.investment?.initialInvestment || null,
        ongoingMonthlyCost: (useCase as any).valueRealization?.investment?.ongoingMonthlyCost || null,
        selectedKpis: (useCase as any).valueRealization?.selectedKpis || [],
        capabilityVendorFte: (useCase as any).capabilityTransition?.staffing?.current?.vendor?.total || null,
        capabilityClientFte: (useCase as any).capabilityTransition?.staffing?.current?.client?.total || null,
        capabilityIndependence: (useCase as any).capabilityTransition?.independencePercentage || null,
      };
      
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
      
      form.reset(formData);
    } else {
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
        librarySource: 'internal',
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
    }
  }, [mode, useCase, form]);

  useEffect(() => {
    const currentLibrarySource = form.watch('librarySource');
    if (currentLibrarySource === 'ai_inventory' && activeTab === 'assessment') {
      setActiveTab('basic');
    }
  }, [form.watch('librarySource'), activeTab]);

  const resetFormToDefaults = () => {
    setIsOverrideEnabled(false);
    setActiveTab('basic');
    setShowManualOverride(false);
    setEditCapabilityTransition(false);
    setExpandedSections(['business-context']);
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
      librarySource: 'internal',
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
      initialInvestment: null,
      ongoingMonthlyCost: null,
      selectedKpis: [],
      capabilityVendorFte: null,
      capabilityClientFte: null,
      capabilityIndependence: null,
      ...scores,
    };
    form.reset(defaultData);
  };
  
  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');
  
  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!watchedTitle || watchedTitle.length < 5) {
        setSimilarUseCases([]);
        return;
      }
      
      setIsCheckingDuplicates(true);
      try {
        const response = await fetch('/api/use-cases/check-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: watchedTitle,
            description: watchedDescription || '',
            excludeId: mode === 'edit' ? useCase?.id : undefined
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSimilarUseCases(data.similarCases || []);
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      } finally {
        setIsCheckingDuplicates(false);
      }
    };
    
    const timeoutId = setTimeout(checkForDuplicates, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedTitle, watchedDescription, mode, useCase?.id]);

  const onSubmit = async (data: FormData) => {
    try {
      const sanitizedData = {
        ...data,
        title: data.title || '',
        description: data.description || '',
        problemStatement: data.problemStatement || '',
        useCaseType: data.useCaseType || '',
        primaryBusinessOwner: data.primaryBusinessOwner || '',
        useCaseStatus: data.useCaseStatus || 'Discovery',
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
        presentationUrl: data.presentationUrl || '',
        presentationPdfUrl: data.presentationPdfUrl || '',
        presentationFileName: data.presentationFileName || '',
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
        manualImpactScore: data.manualImpactScore,
        manualEffortScore: data.manualEffortScore, 
        manualQuadrant: data.manualQuadrant,
        horizontalUseCase: data.horizontalUseCase || 'false',
        horizontalUseCaseTypes: data.horizontalUseCaseTypes || [],
        tomPhaseOverride: data.tomPhaseOverride || null,
        tomOverrideReason: data.tomOverrideReason || '',
        phaseTransitionReason: data.phaseTransitionReason || ''
      };
      
      if (mode === 'edit' && useCase) {
        const changedData: any = { 
          ...sanitizedData,
          impactScore: currentImpactScore,
          effortScore: currentEffortScore,
          quadrant: currentQuadrant
        };
        
        delete changedData.meaningfulId;
        
        Object.keys(changedData).forEach(key => {
          const value = changedData[key];
          if (value === '' || value === 'null' || value === 'undefined') {
            if (['title', 'description'].includes(key)) {
              changedData[key] = '';
            } else {
              changedData[key] = null;
            }
          }
          if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 'thirdPartyModel', 'humanAccountability', 'horizontalUseCase', 'hasPresentation'].includes(key)) {
            if (typeof value === 'boolean') {
              changedData[key] = value.toString();
            } else if (value === 'true' || value === true) {
              changedData[key] = 'true';
            } else if (value === 'false' || value === false) {
              changedData[key] = 'false';
            }
          }
          if (['manualImpactScore', 'manualEffortScore', 'regulatoryCompliance'].includes(key)) {
            if (value === null || value === undefined) {
              changedData[key] = null;
            } else {
              const numValue = Number(value);
              changedData[key] = isNaN(numValue) ? null : numValue;
            }
          }
          if (['presentationUploadedAt'].includes(key)) {
            if (value === null || value === undefined || value === '') {
              changedData[key] = null;
            } else if (typeof value === 'string') {
              changedData[key] = new Date(value);
            }
          }
        });
        
        if (sanitizedData.isDashboardVisible === 'true' || sanitizedData.isActiveForRsa === 'true') {
          changedData.libraryTier = 'active';
        }
        
        const hasInvestmentData = sanitizedData.initialInvestment || sanitizedData.ongoingMonthlyCost || (sanitizedData.selectedKpis && sanitizedData.selectedKpis.length > 0);
        if (hasInvestmentData) {
          const existingValueRealization = (useCase as any).valueRealization || {};
          changedData.valueRealization = {
            ...existingValueRealization,
            selectedKpis: sanitizedData.selectedKpis || [],
            investment: {
              initialInvestment: Number(sanitizedData.initialInvestment) || 0,
              ongoingMonthlyCost: Number(sanitizedData.ongoingMonthlyCost) || 0,
              currency: 'GBP'
            },
            calculatedMetrics: existingValueRealization.calculatedMetrics || {
              currentRoi: null,
              projectedBreakevenMonth: null,
              cumulativeValueGbp: null,
              lastCalculated: null
            }
          };
          delete changedData.initialInvestment;
          delete changedData.ongoingMonthlyCost;
          delete changedData.selectedKpis;
        }
        
        const vendorFteVal = sanitizedData.capabilityVendorFte;
        const clientFteVal = sanitizedData.capabilityClientFte;
        const independenceVal = sanitizedData.capabilityIndependence;
        
        const isValidNumber = (val: any): boolean => {
          if (val === null || val === undefined || val === '') return false;
          const num = Number(val);
          return !isNaN(num);
        };
        
        const hasValidVendorFte = isValidNumber(vendorFteVal);
        const hasValidClientFte = isValidNumber(clientFteVal);
        const hasValidIndependence = isValidNumber(independenceVal);
        const hasCapabilityData = hasValidVendorFte || hasValidClientFte || hasValidIndependence;
        
        if (hasCapabilityData) {
          const existingCapability = (useCase as any).capabilityTransition || {};
          const vendorFte = hasValidVendorFte ? Number(vendorFteVal) : (existingCapability?.staffing?.current?.vendor?.total || 0);
          const clientFte = hasValidClientFte ? Number(clientFteVal) : (existingCapability?.staffing?.current?.client?.total || 0);
          const totalFte = vendorFte + clientFte;
          const calculatedIndependence = totalFte > 0 ? Math.round((clientFte / totalFte) * 100) : 0;
          const finalIndependence = hasValidIndependence
            ? Number(independenceVal) 
            : (existingCapability?.independencePercentage ?? calculatedIndependence);
          
          changedData.capabilityTransition = {
            ...existingCapability,
            independencePercentage: finalIndependence,
            staffing: {
              ...existingCapability.staffing,
              current: {
                vendor: { total: vendorFte, byRole: existingCapability?.staffing?.current?.vendor?.byRole || {} },
                client: { total: clientFte, byRole: existingCapability?.staffing?.current?.client?.byRole || {} }
              },
              planned: existingCapability?.staffing?.planned || {
                month6: { vendor: 0, client: 0 },
                month12: { vendor: 0, client: 0 },
                month18: { vendor: 0, client: 0 }
              }
            },
            knowledgeTransfer: existingCapability.knowledgeTransfer || {
              completedMilestones: [],
              inProgressMilestones: [],
              milestoneNotes: {}
            },
            training: existingCapability.training || {
              completedCertifications: [],
              plannedCertifications: [],
              totalTrainingHoursCompleted: 0,
              totalTrainingHoursPlanned: 0
            },
            selfSufficiencyTarget: existingCapability.selfSufficiencyTarget || {
              targetDate: '',
              targetIndependence: 90,
              advisoryRetainer: 'false'
            }
          };
          delete changedData.capabilityVendorFte;
          delete changedData.capabilityClientFte;
          delete changedData.capabilityIndependence;
        }
        
        if (changedData.phaseTransitionReason) {
          changedData.lastPhaseTransitionReason = changedData.phaseTransitionReason;
        }
        delete changedData.phaseTransitionReason;
        
        const result = await updateUseCase(useCase.id, changedData);
        
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'reference'] });
        
        delete (window as any).pendingPresentationData;
        
        toast({
          title: "Use case updated successfully",
          description: `"${sanitizedData.title}" has been updated. Scores: Impact ${currentImpactScore.toFixed(1)}, Effort ${currentEffortScore.toFixed(1)}`,
        });
        
        resetFormToDefaults();
      } else {
        const createData: any = { ...sanitizedData };
        createData.impactScore = currentImpactScore;
        createData.effortScore = currentEffortScore;
        createData.quadrant = currentQuadrant;
        delete createData.meaningfulId;
        
        Object.keys(createData).forEach(key => {
          const value = createData[key];
          if (value === '' || value === 'null' || value === 'undefined') {
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
              createData[key] = null;
            } else {
              const numValue = Number(value);
              createData[key] = isNaN(numValue) ? null : numValue;
            }
          }
          if (['presentationUploadedAt'].includes(key)) {
            if (value === null || value === undefined || value === '') {
              createData[key] = null;
            } else if (typeof value === 'string') {
              createData[key] = new Date(value);
            }
          }
        });
        
        const hasInvestmentData = sanitizedData.initialInvestment || sanitizedData.ongoingMonthlyCost || (sanitizedData.selectedKpis && sanitizedData.selectedKpis.length > 0);
        if (hasInvestmentData) {
          createData.valueRealization = {
            selectedKpis: sanitizedData.selectedKpis || [],
            kpiValues: {},
            investment: {
              initialInvestment: Number(sanitizedData.initialInvestment) || 0,
              ongoingMonthlyCost: Number(sanitizedData.ongoingMonthlyCost) || 0,
              currency: 'GBP'
            },
            tracking: { entries: [] },
            calculatedMetrics: {
              currentRoi: null,
              projectedBreakevenMonth: null,
              cumulativeValueGbp: null,
              lastCalculated: null
            }
          };
          delete createData.initialInvestment;
          delete createData.ongoingMonthlyCost;
          delete createData.selectedKpis;
        }
        
        const vendorFteValCreate = sanitizedData.capabilityVendorFte;
        const clientFteValCreate = sanitizedData.capabilityClientFte;
        const independenceValCreate = sanitizedData.capabilityIndependence;
        
        const isValidNumberCreate = (val: any): boolean => {
          if (val === null || val === undefined || val === '') return false;
          const num = Number(val);
          return !isNaN(num);
        };
        
        const hasValidVendorFteCreate = isValidNumberCreate(vendorFteValCreate);
        const hasValidClientFteCreate = isValidNumberCreate(clientFteValCreate);
        const hasValidIndependenceCreate = isValidNumberCreate(independenceValCreate);
        const hasCapabilityDataCreate = hasValidVendorFteCreate || hasValidClientFteCreate || hasValidIndependenceCreate;
        
        if (hasCapabilityDataCreate) {
          const vendorFte = hasValidVendorFteCreate ? Number(vendorFteValCreate) : 0;
          const clientFte = hasValidClientFteCreate ? Number(clientFteValCreate) : 0;
          const totalFte = vendorFte + clientFte;
          const calculatedIndependence = totalFte > 0 ? Math.round((clientFte / totalFte) * 100) : 0;
          const finalIndependenceCreate = hasValidIndependenceCreate
            ? Number(independenceValCreate) 
            : calculatedIndependence;
          
          createData.capabilityTransition = {
            independencePercentage: finalIndependenceCreate,
            independenceHistory: [],
            staffing: {
              current: {
                vendor: { total: vendorFte, byRole: {} },
                client: { total: clientFte, byRole: {} }
              },
              planned: {
                month6: { vendor: 0, client: 0 },
                month12: { vendor: 0, client: 0 },
                month18: { vendor: 0, client: 0 }
              }
            },
            knowledgeTransfer: {
              completedMilestones: [],
              inProgressMilestones: [],
              milestoneNotes: {}
            },
            training: {
              completedCertifications: [],
              plannedCertifications: [],
              totalTrainingHoursCompleted: 0,
              totalTrainingHoursPlanned: 0
            },
            selfSufficiencyTarget: {
              targetDate: '',
              targetIndependence: 90,
              advisoryRetainer: 'false'
            }
          };
          delete createData.capabilityVendorFte;
          delete createData.capabilityClientFte;
          delete createData.capabilityIndependence;
        }
        
        const result = await addUseCase(createData);
        
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/use-cases', 'reference'] });
        
        delete (window as any).pendingPresentationData;
        
        toast({
          title: "Use case created successfully",
          description: `"${sanitizedData.title}" has been added. Scores: Impact ${currentImpactScore.toFixed(1)}, Effort ${currentEffortScore.toFixed(1)}`,
        });
      }
      
      resetFormToDefaults();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = `Error ${mode === 'edit' ? 'updating' : 'creating'} use case`;
      
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
      
      if ((error as any)?.response?.data) {
        const responseData = (error as any).response.data;
        if (responseData.type === 'validation' && responseData.issues) {
          errorTitle = responseData.error || "Please check the following";
          errorMessage = Array.isArray(responseData.issues) 
            ? responseData.issues.join('\n• ') 
            : responseData.message || "Please check your entries and try again.";
          if (Array.isArray(responseData.issues) && responseData.issues.length > 1) {
            errorMessage = '• ' + errorMessage;
          }
        } else if (responseData.error) {
          errorTitle = responseData.error;
          errorMessage = responseData.message || "Something went wrong. Please try again.";
        }
      }
      
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
    <>
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

        {isTomEnabled && currentDerivedPhase && mode === 'edit' && (
          <div className="flex items-center gap-2 px-1 py-2 mb-2 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">TOM Phase:</span>
            <Badge 
              style={{ 
                backgroundColor: currentDerivedPhase.color,
                color: 'white'
              }}
              className="text-xs"
              data-testid="badge-tom-phase"
            >
              {currentDerivedPhase.name}
            </Badge>
            {currentDerivedPhase.isOverride && (
              <Badge variant="outline" className="text-xs" data-testid="badge-tom-manual">
                Manual
              </Badge>
            )}
            {currentDerivedPhase.matchedBy && !currentDerivedPhase.isOverride && (
              <span className="text-xs text-muted-foreground">
                (derived from {currentDerivedPhase.matchedBy})
              </span>
            )}
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Quick start:</span> Only <span className="text-red-500">*</span> required fields need to be filled to create a use case. All other fields are optional and can be added later.
          </p>
        </div>

        <GovernanceStepperLegoBlock 
          governanceStatus={governanceStatus} 
          className="mb-4"
        />

        {isTomEnabled && phaseReadiness && mode === 'edit' && (
          <PhaseReadinessLegoBlock 
            readiness={phaseReadiness}
            onTabChange={setActiveTab}
            compact={false}
          />
        )}

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
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
                  <Target className="h-4 w-4" />
                  Operating Model
                  <Badge variant="outline" className={`text-xs ml-1 ${governanceStatus.operatingModel.passed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {governanceStatus.operatingModel.passed ? '✓' : `${governanceStatus.operatingModel.progress}%`}
                  </Badge>
                </TabsTrigger>
                {form.watch('librarySource') !== 'ai_inventory' && (
                  <TabsTrigger value="assessment" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Intake & Scoring
                    <Badge variant="outline" className={`text-xs ml-1 ${governanceStatus.intake.passed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {governanceStatus.intake.passed ? '✓' : `${governanceStatus.intake.progress}%`}
                    </Badge>
                    {phaseReadiness?.recommendedTab === 'assessment' && !governanceStatus.intake.passed && (
                      <Badge variant="outline" className="text-xs ml-1 bg-amber-100 text-amber-700 border-amber-300">
                        Focus
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                <TabsTrigger value="rai" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Responsible AI
                  <Badge variant="outline" className={`text-xs ml-1 ${governanceStatus.rai.passed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {governanceStatus.rai.passed ? '✓' : `${governanceStatus.rai.progress}%`}
                  </Badge>
                  {phaseReadiness?.recommendedTab === 'rai' && !governanceStatus.rai.passed && (
                    <Badge variant="outline" className="text-xs ml-1 bg-amber-100 text-amber-700 border-amber-300">
                      Focus
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Details
                  {phaseReadiness?.recommendedTab === 'details' && (
                    <Badge variant="outline" className="text-xs ml-1 bg-amber-100 text-amber-700 border-amber-300">
                      Focus
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-2" data-testid="tab-guide">
                  <HelpCircle className="h-4 w-4" />
                  Guide
                </TabsTrigger>
              </ResponsiveTabsListLegoBlock>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <OperatingModelTab
                  form={form}
                  metadata={metadata}
                  mode={mode}
                  useCase={useCase}
                  governanceStatus={governanceStatus}
                  rsaSelection={rsaSelection}
                  handleRSAToggle={handleRSAToggle}
                  handleDashboardToggle={handleDashboardToggle}
                  handleActivationReasonChange={handleActivationReasonChange}
                  handleDeactivationReasonChange={handleDeactivationReasonChange}
                  handleStatusChange={handleStatusChange}
                  useCaseStatusOptions={useCaseStatusOptions}
                  sortedMetadata={sortedMetadata}
                  isCheckingDuplicates={isCheckingDuplicates}
                  similarUseCases={similarUseCases}
                />
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <DetailsTab
                  form={form}
                  metadata={metadata}
                  isTomEnabled={isTomEnabled}
                  tomConfig={tomConfig}
                  tomPhases={tomPhases}
                  currentDerivedPhase={currentDerivedPhase}
                  scores={scores}
                  sortedMetadata={sortedMetadata}
                  currencySymbol={currencySymbol}
                  aiMlTechnologiesOptions={aiMlTechnologiesOptions}
                  dataSourcesOptions={dataSourcesOptions}
                  stakeholderGroupsOptions={stakeholderGroupsOptions}
                  showManualOverride={showManualOverride}
                  setShowManualOverride={setShowManualOverride}
                  editCapabilityTransition={editCapabilityTransition}
                  setEditCapabilityTransition={setEditCapabilityTransition}
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                />
              </TabsContent>

              <TabsContent value="rai" className="space-y-6 mt-6">
                <ResponsibleAITab
                  form={form}
                  metadata={metadata}
                  governanceStatus={governanceStatus}
                />
              </TabsContent>

              <TabsContent value="assessment" className="space-y-6 mt-6">
                <ScoringTab
                  form={form}
                  metadata={metadata}
                  scores={scores}
                  handleSliderChange={handleSliderChange}
                  governanceStatus={governanceStatus}
                  currentImpactScore={currentImpactScore}
                  currentEffortScore={currentEffortScore}
                  currentQuadrant={currentQuadrant}
                  rsaSelection={rsaSelection}
                  setIsOverrideEnabled={setIsOverrideEnabled}
                  sliderTooltips={sliderTooltips}
                  useCase={useCase}
                />
              </TabsContent>

              <TabsContent value="guide" className="mt-6">
                <GuideTab governanceStatus={governanceStatus} />
              </TabsContent>
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

    <Dialog open={showPhaseTransitionWarning} onOpenChange={cancelPhaseTransition}>
      <DialogContent className="max-w-lg" data-testid="phase-transition-warning-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Phase Transition - Incomplete Exit Requirements
          </DialogTitle>
          <DialogDescription>
            This change will move the use case to a new phase, but exit requirements 
            for the current phase are not complete. Please review and provide a reason for proceeding.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {phaseReadiness?.currentPhase && (
            <div className="flex items-center justify-center gap-3 py-2">
              <Badge 
                className="font-medium text-white"
                style={{ backgroundColor: phaseReadiness.currentPhase.color }}
                data-testid="phase-from-badge"
              >
                <Layers className="h-3 w-3 mr-1" />
                {phaseReadiness.currentPhase.name}
              </Badge>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              {phaseReadiness.nextPhase ? (
                <Badge 
                  className="font-medium text-white"
                  style={{ backgroundColor: phaseReadiness.nextPhase.color }}
                  data-testid="phase-to-badge"
                >
                  <Layers className="h-3 w-3 mr-1" />
                  {phaseReadiness.nextPhase.name}
                </Badge>
              ) : (
                <Badge variant="outline" data-testid="phase-to-badge">
                  Next Phase
                </Badge>
              )}
            </div>
          )}

          {phaseReadiness && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Exit Requirements for {phaseReadiness.currentPhase?.name || 'Current Phase'}
              </p>
              
              {phaseReadiness.exitRequirementsMet.length > 0 && (
                <div className="space-y-1">
                  {phaseReadiness.exitRequirementsMet.map((req: string) => (
                    <div 
                      key={req} 
                      className="flex items-center gap-2 text-sm text-green-600"
                      data-testid={`exit-req-met-${req}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{getRequirementLabel(req)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {phaseReadiness.exitRequirementsPending.length > 0 && (
                <div className="space-y-1">
                  {phaseReadiness.exitRequirementsPending.map((req: string) => (
                    <div 
                      key={req} 
                      className="flex items-center gap-2 text-sm text-amber-600"
                      data-testid={`exit-req-pending-${req}`}
                    >
                      <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{getRequirementLabel(req)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div>
            <Label htmlFor="phaseTransitionReason" className="text-sm font-medium">
              Reason for Proceeding <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="phaseTransitionReason"
              placeholder="Explain why you are proceeding without completing exit requirements..."
              value={phaseTransitionReason}
              onChange={(e) => setPhaseTransitionReason(e.target.value)}
              className="mt-1.5"
              rows={3}
              data-testid="input-phase-transition-reason"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={cancelPhaseTransition} data-testid="button-cancel-transition">
            Cancel
          </Button>
          <Button 
            onClick={confirmPhaseTransition} 
            disabled={!phaseTransitionReason.trim()}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-confirm-transition"
          >
            Proceed Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
