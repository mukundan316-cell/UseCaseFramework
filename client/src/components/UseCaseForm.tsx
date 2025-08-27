import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, RotateCcw, Info } from 'lucide-react';
import FormActionButtons from './lego-blocks/FormActionButtons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
// Enhanced form data type supporting all RSA framework dimensions
type UseCaseFormData = z.infer<typeof formSchema>;
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../utils/calculations';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  valueChainComponent: z.string().min(1, 'Value chain component is required'),
  process: z.string().min(1, 'Process is required'),
  lineOfBusiness: z.string().min(1, 'Line of business is required'),
  businessSegment: z.string().min(1, 'Business segment is required'),
  geography: z.string().min(1, 'Geography is required'),
  useCaseType: z.string().min(1, 'Use case type is required'),
  // Business Value Levers
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

export default function UseCaseForm() {
  const { addUseCase, metadata, setActiveTab } = useUseCases();
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

  const form = useForm<UseCaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      valueChainComponent: '',
      process: '',
      lineOfBusiness: '',
      businessSegment: '',
      geography: '',
      useCaseType: '',
      ...scores,
    },
  });
  
  // Loading state while metadata is being fetched (database-first compliance)
  if (!metadata) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Form Configuration...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">Loading metadata from database...</div>
        </CardContent>
      </Card>
    );
  }

  const currentImpactScore = calculateImpactScore(
    scores.revenueImpact,
    scores.costSavings,
    scores.riskReduction,
    scores.brokerPartnerExperience,
    scores.strategicFit
  );

  const currentEffortScore = calculateEffortScore(
    scores.dataReadiness,
    scores.technicalComplexity,
    scores.changeImpact,
    scores.modelRisk,
    scores.adoptionReadiness
  );

  const currentQuadrant = calculateQuadrant(currentImpactScore, currentEffortScore);

  const handleSliderChange = (field: keyof typeof scores, value: number) => {
    const newScores = { ...scores, [field]: value };
    setScores(newScores);
    form.setValue(field, value);
  };

  const onSubmit = async (data: UseCaseFormData) => {
    try {
      await addUseCase(data);
      toast({
        title: "Use case saved successfully",
        description: `"${data.title}" has been submitted for prioritization.`,
      });
      form.reset();
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
        explainabilityBias: 3,
        regulatoryCompliance: 3,
      });
      // Switch to matrix view to see the new use case
      setActiveTab('matrix');
    } catch (error) {
      toast({
        title: "Error saving use case",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    form.reset();
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
      explainabilityBias: 3,
      regulatoryCompliance: 3,
    });
  };

  const sliderTooltips = {
    revenueImpact: "Potential to increase revenue through new products or improved pricing",
    costSavings: "Operational cost reduction through automation or efficiency gains",
    riskReduction: "Ability to reduce operational, regulatory, or financial risks",
    brokerPartnerExperience: "Impact on broker/partner experience - faster TAT, self-service tools, analytics access",
    strategicFit: "Alignment with RSA's delegated, specialty, or mid-market focus",
    dataReadiness: "Quality, structure, and sufficient volume of available data",
    technicalComplexity: "Maturity of models needed (LLMs vs ML) and technical difficulty",
    changeImpact: "Degree of process and role redesign required for implementation",
    modelRisk: "Potential harm if model fails (regulatory, reputational, financial)",
    adoptionReadiness: "Stakeholder and user buy-in, especially in underwriting/claims",
    explainabilityBias: "Support for responsible AI principles and bias management",
    regulatoryCompliance: "FCA, GDPR, and UK/EU AI Act readiness",
  };

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
  }) => (
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
          <span className="font-semibold text-rsa-blue">{scores[field]}</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={scores[field]}
        onChange={(e) => handleSliderChange(field, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Submit New AI Use Case</CardTitle>
          <CardDescription>Define and score a new AI/GenAI use case for prioritization analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Use Case Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Automated FNOL Summarization"
                    className="mt-2"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="useCaseType">Use Case Type</Label>
                  <Select onValueChange={(value) => form.setValue('useCaseType', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata.useCaseTypes.filter(type => type && type.trim()).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.useCaseType && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.useCaseType.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Detailed description of the use case..."
                  className="mt-2"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Business Context */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Value Chain Component</Label>
                  <Select onValueChange={(value) => form.setValue('valueChainComponent', value)}>
                    <SelectTrigger className="mt-2">
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
                  <Select onValueChange={(value) => form.setValue('process', value)}>
                    <SelectTrigger className="mt-2">
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
                  <Label>Line of Business</Label>
                  <Select onValueChange={(value) => form.setValue('lineOfBusiness', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select LOB" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata.linesOfBusiness.filter(lob => lob && lob.trim()).map(lob => (
                        <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Business Segment</Label>
                  <Select onValueChange={(value) => form.setValue('businessSegment', value)}>
                    <SelectTrigger className="mt-2">
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
                  <Select onValueChange={(value) => form.setValue('geography', value)}>
                    <SelectTrigger className="mt-2">
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
                    <div className="text-lg font-semibold text-rsa-blue bg-white px-4 py-2 rounded-lg">
                      {currentQuadrant}
                    </div>
                    <div className="text-sm text-gray-600">Quadrant</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormActionButtons
              onReset={resetForm}
              resetType="button"
              saveType="submit"
              isLoading={form.formState.isSubmitting}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
