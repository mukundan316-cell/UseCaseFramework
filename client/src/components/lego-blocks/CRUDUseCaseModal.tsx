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
import ScoringLegoBlock from './ScoringLegoBlock';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  valueChainComponent: z.string().min(1, 'Value chain component is required'),
  process: z.string().min(1, 'Process is required'),
  lineOfBusiness: z.string().min(1, 'Line of business is required'),
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

  const form = useForm<FormData>({
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

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && useCase) {
      console.log('Edit mode - useCase data:', useCase); // Debug log
      
      const formData = {
        title: useCase.title || '',
        description: useCase.description || '',
        valueChainComponent: useCase.valueChainComponent || '',
        process: useCase.process || '',
        lineOfBusiness: useCase.lineOfBusiness || '',
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
      
      console.log('Form data mapping:', formData); // Debug log
      
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
      
      form.reset(formData);
    } else {
      // Reset for create mode
      form.reset({
        title: '',
        description: '',
        valueChainComponent: '',
        process: '',
        lineOfBusiness: '',
        businessSegment: '',
        geography: '',
        useCaseType: '',
        ...scores,
      });
    }
  }, [mode, useCase, form]);

  const handleSliderChange = (field: keyof typeof scores, value: number) => {
    const newScores = { ...scores, [field]: value };
    setScores(newScores);
    form.setValue(field, value);
  };

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
            {mode === 'edit' ? 'Update the use case details and scoring' : 'Define a new AI/GenAI use case with RSA framework scoring'}
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
                <Select onValueChange={(value) => form.setValue('useCaseType', value)}>
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
                <Select onValueChange={(value) => form.setValue('valueChainComponent', value)}>
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
                <Select onValueChange={(value) => form.setValue('process', value)}>
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
                <Label>Line of Business</Label>
                <Select onValueChange={(value) => form.setValue('lineOfBusiness', value)}>
                  <SelectTrigger className="mt-1">
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
                <Select onValueChange={(value) => form.setValue('geography', value)}>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Enhanced RSA Framework Assessment</h3>
            <p className="text-sm text-gray-600">Use the enhanced 12-lever framework to score this use case</p>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Framework scoring will be implemented in the detailed scoring interface</p>
            </div>
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