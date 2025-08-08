import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit } from 'lucide-react';
import { ScoreSliderLegoBlock } from './ScoreSliderLegoBlock';
import { UseCase, UseCaseFormData } from '../../types';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '@shared/calculations';
import { ContextualProcessActivityField } from './ProcessActivityManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MultiSelectField from './MultiSelectField';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  process: z.string().min(1, 'Process is required'),
  lineOfBusiness: z.string().min(1, 'Line of business is required'),
  // Multi-select arrays (optional)
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  linesOfBusiness: z.array(z.string()).optional(),
  businessSegment: z.string().min(1, 'Business segment is required'),
  geography: z.string().min(1, 'Geography is required'),
  useCaseType: z.string().min(1, 'Use case type is required'),
  activity: z.string().optional(),
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

  // SliderField component for scoring interface - now using LEGO component
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
      <ScoreSliderLegoBlock
        label={label}
        field={field}
        value={currentValue}
        onChange={handleSliderChange}
        tooltip={tooltip}
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        minValue={1}
        maxValue={5}
        disabled={false}
        showTooltip={true}
        valueDisplay="inline"
      />
    );
  };

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && useCase) {
      const formData = {
        title: useCase.title || '',
        description: useCase.description || '',
        process: useCase.process || '',
        lineOfBusiness: useCase.lineOfBusiness || '',
        linesOfBusiness: (useCase as any).linesOfBusiness || [useCase.lineOfBusiness].filter(Boolean),
        businessSegment: useCase.businessSegment || '',
        geography: useCase.geography || '',
        useCaseType: useCase.useCaseType || '',
        activity: (useCase as any).activity || '',
        // Multi-select arrays with backward compatibility
        processes: (useCase as any).processes || [useCase.process].filter(Boolean),
        activities: (useCase as any).activities || [(useCase as any).activity].filter(Boolean),
        businessSegments: (useCase as any).businessSegments || [useCase.businessSegment].filter(Boolean),
        geographies: (useCase as any).geographies || [useCase.geography].filter(Boolean),
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
        process: '',
        lineOfBusiness: '',
        linesOfBusiness: [],
        businessSegment: '',
        geography: '',
        useCaseType: '',
        activity: '',
        // Multi-select arrays
        processes: [],
        activities: [],
        businessSegments: [],
        geographies: [],
        ...scores,
      };
      form.reset(defaultData);
    }
  }, [mode, useCase, form]);

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Submitting form data:', data);
      
      if (mode === 'edit' && useCase) {
        // For edit mode, only send changed fields to prevent overwriting unchanged values
        const originalData = {
          title: useCase.title,
          description: useCase.description,
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
          explainabilityBias: (useCase as any).explainabilityBias,
          regulatoryCompliance: (useCase as any).regulatoryCompliance,
        };
        
        // Only include fields that have actually changed
        const changedData: any = {};
        Object.keys(data).forEach(key => {
          if (data[key as keyof FormData] !== originalData[key as keyof typeof originalData]) {
            changedData[key] = data[key as keyof FormData];
          }
        });
        
        // Always include multi-select arrays as they may have been updated
        if (data.linesOfBusiness) changedData.linesOfBusiness = data.linesOfBusiness;
        if (data.processes) changedData.processes = data.processes;
        if (data.activities) changedData.activities = data.activities;
        if (data.businessSegments) changedData.businessSegments = data.businessSegments;
        if (data.geographies) changedData.geographies = data.geographies;
        
        console.log('Sending only changed data:', changedData);
        const result = await updateUseCase(useCase.id, changedData);
        console.log('Update successful:', result);
        toast({
          title: "Use case updated successfully",
          description: `"${data.title}" has been updated.`,
        });
      } else {
        console.log('Calling addUseCase...');
        const result = await addUseCase(data);
        console.log('Add successful:', result);
        toast({
          title: "Use case created successfully",
          description: `"${data.title}" has been added to the database.`,
        });
      }
      console.log('About to call onClose...');
      onClose();
      console.log('onClose called');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: `Error ${mode === 'edit' ? 'updating' : 'creating'} use case`,
        description: `Please try again. ${error instanceof Error ? error.message : 'Unknown error'}`,
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

          {/* Business Context - Aligned with Explorer: Process → Activity → LOB → Segment → Geography */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                items={metadata.linesOfBusiness}
                selectedItems={form.watch('linesOfBusiness') || (useCase?.linesOfBusiness || [useCase?.lineOfBusiness].filter(Boolean) as string[])}
                onSelectionChange={(newItems) => {
                  form.setValue('linesOfBusiness', newItems);
                  // Backward compatibility
                  if (newItems.length > 0) {
                    form.setValue('lineOfBusiness', newItems[0]);
                  }
                }}
                singleValue={form.watch('lineOfBusiness') || ''}
                onSingleValueChange={(value) => form.setValue('lineOfBusiness', value)}
                helpText="Select one or more lines of business"
              />
              
              {/* Business Segments Multi-Select */}
              <MultiSelectField
                label="Business Segments"
                items={metadata.businessSegments}
                selectedItems={(form.watch('businessSegments') as string[]) || [form.watch('businessSegment')].filter(Boolean)}
                onSelectionChange={(newItems) => {
                  form.setValue('businessSegments', newItems);
                  // Backward compatibility
                  if (newItems.length > 0) {
                    form.setValue('businessSegment', newItems[0]);
                  }
                }}
                singleValue={form.watch('businessSegment') || ''}
                onSingleValueChange={(value) => form.setValue('businessSegment', value)}
                helpText="Select one or more business segments"
              />
              
              {/* Geographies Multi-Select */}
              <MultiSelectField
                label="Geographies"
                items={metadata.geographies}
                selectedItems={(form.watch('geographies') as string[]) || [form.watch('geography')].filter(Boolean)}
                onSelectionChange={(newItems) => {
                  form.setValue('geographies', newItems);
                  // Backward compatibility
                  if (newItems.length > 0) {
                    form.setValue('geography', newItems[0]);
                  }
                }}
                singleValue={form.watch('geography') || ''}
                onSingleValueChange={(value) => form.setValue('geography', value)}
                helpText="Select one or more geographic markets"
              />
              
              {/* Process Activities - LEGO Contextual Component */}
              <ContextualProcessActivityField
                selectedProcess={form.watch('process') || ''}
                selectedActivities={(form.watch('activities') as string[]) || [form.watch('activity')].filter(Boolean)}
                onActivitiesChange={(newItems) => {
                  form.setValue('activities', newItems);
                  // Backward compatibility
                  if (newItems.length > 0) {
                    form.setValue('activity', newItems[0]);
                  } else {
                    form.setValue('activity', '');
                  }
                }}
                helpText={form.watch('process') ? "Activities filtered by selected process" : "Select process first to enable activities"}
                placeholder={!form.watch('process') ? "Select process first" : "Select activities..."}
              />
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