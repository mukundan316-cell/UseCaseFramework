import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, Plus, Edit } from 'lucide-react';
import { UseCase, UseCaseFormData } from '../../types';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '@shared/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  valueChainComponent: z.string().min(1, 'Value chain component is required'),
  process: z.string().min(1, 'Process is required'),
  lineOfBusiness: z.string().min(1, 'Line of business is required'),
  linesOfBusiness: z.array(z.string()).optional(),
  businessSegment: z.string().min(1, 'Business segment is required'),
  geography: z.string().min(1, 'Geography is required'),
  useCaseType: z.string().min(1, 'Use case type is required'),
  // Enhanced RSA Framework - Business Value Levers
  revenueImpact: z.number().min(1).max(5),
  costSavings: z.number().min(1).max(5),
  riskReduction: z.number().min(1).max(5),
  brokerPartnerExperience: z.number().min(1).max(5),
  strategicFit: z.number().min(1).max(5),
  // Feasibility Levers
  dataReadiness: z.number().min(1).max(5),
  technicalComplexity: z.number().min(1).max(5),
  changeImpact: z.number().min(1).max(5),
  modelRisk: z.number().min(1).max(5),
  adoptionReadiness: z.number().min(1).max(5),
  // AI Governance Levers
  explainabilityBias: z.number().min(1).max(5),
  regulatoryCompliance: z.number().min(1).max(5),
});

type FormData = z.infer<typeof formSchema>;

interface CRUDUseCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  useCase?: UseCase;
}

/**
 * LEGO Block: CRUD Modal for Use Case Management
 * Reusable modal component supporting both create and edit operations
 * Follows database-first architecture with full RSA framework compliance
 */
export default function CRUDUseCaseModal({ isOpen, onClose, mode, useCase }: CRUDUseCaseModalProps) {
  const { addUseCase, updateUseCase, metadata } = useUseCases();
  const { toast } = useToast();

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
    explainabilityBias: 3,
    regulatoryCompliance: 3,
  });

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
    explainabilityBias: "Support for responsible AI principles and bias management",
    regulatoryCompliance: "FCA, GDPR, and UK/EU AI Act readiness",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      valueChainComponent: '',
      process: '',
      lineOfBusiness: '',
      linesOfBusiness: [],
      businessSegment: '',
      geography: '',
      useCaseType: '',
      ...scores,
    },
  });

  const handleSliderChange = (field: keyof typeof scores, value: number) => {
    const newScores = { ...scores, [field]: value };
    setScores(newScores);
    form.setValue(field, value);
  };

  // Get current values from form for real-time calculations
  const formValues = form.watch();
  
  const currentImpactScore = calculateImpactScore(
    formValues.revenueImpact ?? scores.revenueImpact,
    formValues.costSavings ?? scores.costSavings,
    formValues.riskReduction ?? scores.riskReduction,
    formValues.brokerPartnerExperience ?? scores.brokerPartnerExperience,
    formValues.strategicFit ?? scores.strategicFit
  );

  const currentEffortScore = calculateEffortScore(
    formValues.dataReadiness ?? scores.dataReadiness,
    formValues.technicalComplexity ?? scores.technicalComplexity,
    formValues.changeImpact ?? scores.changeImpact,
    formValues.modelRisk ?? scores.modelRisk,
    formValues.adoptionReadiness ?? scores.adoptionReadiness
  );

  const currentQuadrant = calculateQuadrant(currentImpactScore, currentEffortScore);

  // SliderField component for scoring interface
  const SliderField = ({ 
    field, 
    label, 
    tooltip, 
    leftLabel, 
    rightLabel 
  }: { 
    field: keyof typeof scores; 
    label: string; 
    tooltip: string;
    leftLabel: string;
    rightLabel: string;
  }) => {
    // Use form.watch to get current value, fallback to scores state
    const currentValue = form.watch(field) ?? scores[field] ?? 3;
    
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
            <span className="font-semibold text-purple-600">{currentValue}</span>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={currentValue}
          onChange={(e) => handleSliderChange(field, parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    );
  };

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && useCase) {
      const formData = {
        title: useCase.title || '',
        description: useCase.description || '',
        valueChainComponent: useCase.valueChainComponent || '',
        process: useCase.process || '',
        lineOfBusiness: useCase.lineOfBusiness || '',
        linesOfBusiness: (useCase as any).linesOfBusiness || [useCase.lineOfBusiness].filter(Boolean),
        businessSegment: useCase.businessSegment || '',
        geography: useCase.geography || '',
        useCaseType: useCase.useCaseType || '',
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
        explainabilityBias: (useCase as any).explainabilityBias ?? 3,
        regulatoryCompliance: (useCase as any).regulatoryCompliance ?? 3,
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
        explainabilityBias: formData.explainabilityBias,
        regulatoryCompliance: formData.regulatoryCompliance,
      });
      
      // Reset form with all data
      form.reset(formData);
    } else {
      // Reset for create mode with default scores
      const defaultData = {
        title: '',
        description: '',
        valueChainComponent: '',
        process: '',
        lineOfBusiness: '',
        linesOfBusiness: [],
        businessSegment: '',
        geography: '',
        useCaseType: '',
        ...scores,
      };
      form.reset(defaultData);
    }
  }, [mode, useCase, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'edit' && useCase) {
        await updateUseCase(useCase.id, data);
        toast({
          title: "Use case updated successfully",
          description: `"${data.title}" has been updated.`,
        });
      } else {
        await addUseCase(data);
        toast({
          title: "Use case created successfully",
          description: `"${data.title}" has been added to the database.`,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: `Error ${mode === 'edit' ? 'updating' : 'creating'} use case`,
        description: "Please try again.",
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
            {mode === 'edit' ? 'Update the use case details and scoring' : 'Define a new AI use case with RSA framework scoring'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Use Case Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Automated Claims Triage"
                  className="mt-1"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <Label>Use Case Type</Label>
                <Select key={`useCaseType-${mode}-${useCase?.id}`} value={form.watch('useCaseType') || ''} onValueChange={(value) => form.setValue('useCaseType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.useCaseTypes.filter(type => type && type.trim()).map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Detailed description of the use case..."
                className="mt-1"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Business Context */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Value Chain Component</Label>
                <Select key={`valueChainComponent-${mode}-${useCase?.id}`} value={form.watch('valueChainComponent') || ''} onValueChange={(value) => form.setValue('valueChainComponent', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.valueChainComponents.filter(component => component && component.trim()).map(component => (
                      <SelectItem key={component} value={component}>{component}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Process</Label>
                <Select key={`process-${mode}-${useCase?.id}`} value={form.watch('process') || ''} onValueChange={(value) => form.setValue('process', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.processes.filter(process => process && process.trim()).map(process => (
                      <SelectItem key={process} value={process}>{process}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lines of Business</Label>
                <div className="mt-1 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {metadata.linesOfBusiness.filter(lob => lob && lob.trim()).map(lob => {
                    const currentLOBs = form.watch('linesOfBusiness') || (useCase?.linesOfBusiness || [useCase?.lineOfBusiness].filter(Boolean) as string[]);
                    const isChecked = currentLOBs.includes(lob);
                    
                    return (
                      <div key={lob} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id={`lob-${lob}`}
                          checked={isChecked}
                          onChange={(e) => {
                            const currentLOBs = form.watch('linesOfBusiness') || (useCase?.linesOfBusiness || [useCase?.lineOfBusiness].filter(Boolean) as string[]);
                            let newLOBs: string[];
                            if (e.target.checked) {
                              newLOBs = [...currentLOBs, lob];
                            } else {
                              newLOBs = currentLOBs.filter(l => l !== lob);
                            }
                            form.setValue('linesOfBusiness', newLOBs);
                            // Keep the old field for backwards compatibility
                            if (newLOBs.length > 0) {
                              form.setValue('lineOfBusiness', newLOBs[0]);
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor={`lob-${lob}`} className="text-sm text-gray-700">
                          {lob}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Business Segment</Label>
                <Select key={`businessSegment-${mode}-${useCase?.id}`} value={form.watch('businessSegment') || ''} onValueChange={(value) => form.setValue('businessSegment', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.businessSegments.filter(segment => segment && segment.trim()).map(segment => (
                      <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Geography</Label>
                <Select key={`geography-${mode}-${useCase?.id}`} value={form.watch('geography') || ''} onValueChange={(value) => form.setValue('geography', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select geography" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.geographies.filter(geo => geo && geo.trim()).map(geo => (
                      <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Enhanced RSA Framework Scoring */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Enhanced RSA Framework Assessment (1-5 Scale)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Business Value Levers */}
              <div className="space-y-6">
                <h4 className="font-medium text-green-700 text-sm uppercase tracking-wide">Business Value Levers</h4>
                <SliderField
                  field="revenueImpact"
                  label="Revenue Impact"
                  tooltip={sliderTooltips.revenueImpact}
                  leftLabel="Low"
                  rightLabel="High"
                />
                <SliderField
                  field="costSavings"
                  label="Cost Savings"
                  tooltip={sliderTooltips.costSavings}
                  leftLabel="Low"
                  rightLabel="High"
                />
                <SliderField
                  field="riskReduction"
                  label="Risk Reduction"
                  tooltip={sliderTooltips.riskReduction}
                  leftLabel="Low"
                  rightLabel="High"
                />
                <SliderField
                  field="brokerPartnerExperience"
                  label="Broker/Partner Experience"
                  tooltip={sliderTooltips.brokerPartnerExperience}
                  leftLabel="Low"
                  rightLabel="High"
                />
                <SliderField
                  field="strategicFit"
                  label="Strategic Fit"
                  tooltip={sliderTooltips.strategicFit}
                  leftLabel="Low"
                  rightLabel="High"
                />
              </div>
              {/* Feasibility Levers */}
              <div className="space-y-6">
                <h4 className="font-medium text-blue-700 text-sm uppercase tracking-wide">Feasibility Levers</h4>
                <SliderField
                  field="dataReadiness"
                  label="Data Readiness"
                  tooltip={sliderTooltips.dataReadiness}
                  leftLabel="Poor"
                  rightLabel="Excellent"
                />
                <SliderField
                  field="technicalComplexity"
                  label="Technical Complexity"
                  tooltip={sliderTooltips.technicalComplexity}
                  leftLabel="Simple"
                  rightLabel="Complex"
                />
                <SliderField
                  field="changeImpact"
                  label="Change Impact"
                  tooltip={sliderTooltips.changeImpact}
                  leftLabel="Minimal"
                  rightLabel="Extensive"
                />
                <SliderField
                  field="modelRisk"
                  label="Model Risk"
                  tooltip={sliderTooltips.modelRisk}
                  leftLabel="Low"
                  rightLabel="High"
                />
                <SliderField
                  field="adoptionReadiness"
                  label="Adoption Readiness"
                  tooltip={sliderTooltips.adoptionReadiness}
                  leftLabel="Low"
                  rightLabel="High"
                />
              </div>
              
              {/* AI Governance Levers */}
              <div className="space-y-6">
                <h4 className="font-medium text-purple-700 text-sm uppercase tracking-wide">AI Governance Levers</h4>
                <SliderField
                  field="explainabilityBias"
                  label="Explainability & Bias"
                  tooltip={sliderTooltips.explainabilityBias}
                  leftLabel="Low"
                  rightLabel="High"
                />
                <SliderField
                  field="regulatoryCompliance"
                  label="Regulatory Compliance"
                  tooltip={sliderTooltips.regulatoryCompliance}
                  leftLabel="Low"
                  rightLabel="High"
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update Use Case' : 'Create Use Case'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}