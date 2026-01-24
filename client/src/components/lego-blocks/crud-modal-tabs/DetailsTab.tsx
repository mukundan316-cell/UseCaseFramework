import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Briefcase, Clock, PoundSterling, Settings, Users, FolderOpen, FileText, ArrowRight, Edit, Plus, X } from 'lucide-react';
import { CollapsibleSectionItem, CollapsibleSectionsContainer } from '../CollapsibleSectionLegoBlock';
import MultiSelectField from '../MultiSelectField';
import { ContextualProcessActivityField } from '../ProcessActivityManager';
import ValueEstimationLegoBlock from '../ValueEstimationLegoBlock';
import PresentationUploadBlock from '../PresentationUploadBlock';
import PresentationPreviewBlock from '../PresentationPreviewBlock';
import { useToast } from '@/hooks/use-toast';
import { calculateSectionCompletion, SectionHeader } from './utils';
import type { DetailsTabProps } from './types';

export default function DetailsTab({
  form,
  metadata,
  isTomEnabled,
  tomConfig,
  tomPhases,
  currentDerivedPhase,
  scores,
  sortedMetadata,
  currencySymbol,
  aiMlTechnologiesOptions,
  dataSourcesOptions,
  stakeholderGroupsOptions,
  showManualOverride,
  setShowManualOverride,
  editCapabilityTransition,
  setEditCapabilityTransition,
  expandedSections,
  setExpandedSections,
}: DetailsTabProps) {
  const { toast } = useToast();
  
  const watchedFormData = {
    problemStatement: form.watch('problemStatement'),
    processes: form.watch('processes'),
    activities: form.watch('activities'),
    linesOfBusiness: form.watch('linesOfBusiness'),
    businessSegments: form.watch('businessSegments'),
    geographies: form.watch('geographies'),
    useCaseType: form.watch('useCaseType'),
    keyDependencies: form.watch('keyDependencies'),
    implementationTimeline: form.watch('implementationTimeline'),
    tomPhaseOverride: form.watch('tomPhaseOverride'),
    initialInvestment: form.watch('initialInvestment'),
    ongoingMonthlyCost: form.watch('ongoingMonthlyCost'),
    selectedKpis: form.watch('selectedKpis'),
    aiMlTechnologies: form.watch('aiMlTechnologies'),
    dataSources: form.watch('dataSources'),
    stakeholderGroups: form.watch('stakeholderGroups'),
    integrationRequirements: form.watch('integrationRequirements'),
    capabilityVendorFte: form.watch('capabilityVendorFte'),
    capabilityClientFte: form.watch('capabilityClientFte'),
    capabilityIndependence: form.watch('capabilityIndependence'),
  };
  const sectionCounts = calculateSectionCompletion(watchedFormData as any, isTomEnabled);

  return (
    <div>
      <CollapsibleSectionsContainer 
        expandedSections={expandedSections}
        onExpandedChange={setExpandedSections}
      >
        <CollapsibleSectionItem
          id="business-context"
          icon={Briefcase}
          title="Business Context"
          description="Problem statement, processes, and organizational scope"
          filledCount={sectionCounts.businessContext.filled}
          totalCount={sectionCounts.businessContext.total}
          colorScheme="gray"
        >
          <div className="mb-4">
            <Label htmlFor="problemStatement" className="text-sm font-semibold">Problem Statement / Business Need</Label>
            <Textarea
              id="problemStatement"
              rows={2}
              placeholder="Describe the specific business problem this use case addresses..."
              className="mt-1 bg-white"
              {...form.register('problemStatement')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MultiSelectField
              label="Processes"
              items={sortedMetadata.getSortedProcesses()}
              selectedItems={(form.watch('processes') as string[]) || []}
              onSelectionChange={(newItems) => form.setValue('processes', newItems)}
              helpText="Select one or more business processes"
            />
            <ContextualProcessActivityField
              selectedProcesses={(form.watch('processes') as string[]) || []}
              selectedActivities={(form.watch('activities') as string[]) || []}
              onActivitiesChange={(newItems) => form.setValue('activities', newItems)}
              helpText={(form.watch('processes') as string[])?.length > 0 ? "Filtered by processes" : "Select processes first"}
              placeholder={!((form.watch('processes') as string[])?.length > 0) ? "Select processes first" : "Select activities..."}
            />
            <MultiSelectField
              label="Lines of Business"
              items={sortedMetadata.getSortedLinesOfBusiness()}
              selectedItems={(form.watch('linesOfBusiness') as string[]) || []}
              onSelectionChange={(newItems) => form.setValue('linesOfBusiness', newItems)}
              helpText="Select applicable lines of business"
            />
            <MultiSelectField
              label="Business Segments"
              items={sortedMetadata.getSortedBusinessSegments()}
              selectedItems={(form.watch('businessSegments') as string[]) || []}
              onSelectionChange={(newItems) => form.setValue('businessSegments', newItems)}
              helpText="Select target business segments"
            />
            <MultiSelectField
              label="Geographies"
              items={sortedMetadata.getSortedGeographies()}
              selectedItems={(form.watch('geographies') as string[]) || []}
              onSelectionChange={(newItems) => form.setValue('geographies', newItems)}
              helpText="Select applicable regions"
            />
            <div>
              <Label className="text-sm font-semibold">Use Case Type</Label>
              <Select value={form.watch('useCaseType') || ''} onValueChange={(value) => form.setValue('useCaseType', value)}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {sortedMetadata.getSortedUseCaseTypes().filter((type: string) => type && type.trim()).map((type: string) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSectionItem>
        
        <CollapsibleSectionItem
          id="implementation-planning"
          icon={Clock}
          title="Implementation Planning"
          description="Timeline, dependencies, and TOM phase configuration"
          filledCount={sectionCounts.implementationPlanning.filled}
          totalCount={sectionCounts.implementationPlanning.total}
          colorScheme="blue"
        >
          {isTomEnabled && tomConfig && (
            <div className="space-y-3 p-4 mb-4 bg-muted/30 rounded-lg border border-dashed">
              {currentDerivedPhase?.id && currentDerivedPhase.id !== 'disabled' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current TOM Phase:</span>
                  <Badge 
                    style={{ 
                      backgroundColor: currentDerivedPhase?.color ?? '#6B7280',
                      color: 'white'
                    }}
                    className="no-default-hover-elevate no-default-active-elevate"
                    data-testid="badge-current-tom-phase"
                  >
                    {currentDerivedPhase?.name ?? 'Loading...'}
                    {currentDerivedPhase?.isOverride === true && ' (Override)'}
                  </Badge>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    TOM Phase Override
                    <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <Select 
                    value={form.watch('tomPhaseOverride') || '_auto'} 
                    onValueChange={(value) => form.setValue('tomPhaseOverride', value === '_auto' ? null : value)}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-tom-phase-override">
                      <SelectValue placeholder="Auto-derive from status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_auto">Auto-derive from status</SelectItem>
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
        </CollapsibleSectionItem>

        <CollapsibleSectionItem
          id="value-realization"
          icon={PoundSterling}
          title="Value Realization"
          description="Investment, KPIs, and expected business value"
          filledCount={sectionCounts.valueRealization.filled}
          totalCount={sectionCounts.valueRealization.total}
          colorScheme="green"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initialInvestment" className="text-sm font-semibold text-gray-700">
                  Initial Investment ({currencySymbol}) *
                </Label>
                <Input
                  id="initialInvestment"
                  type="number"
                  placeholder="e.g., 150000"
                  className="mt-1 bg-white"
                  data-testid="input-initial-investment"
                  {...form.register('initialInvestment', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">Implementation, licensing, training</p>
              </div>
              <div>
                <Label htmlFor="ongoingMonthlyCost" className="text-sm font-semibold text-gray-700">
                  Ongoing Monthly Cost ({currencySymbol})
                </Label>
                <Input
                  id="ongoingMonthlyCost"
                  type="number"
                  placeholder="e.g., 5000"
                  className="mt-1 bg-white"
                  data-testid="input-ongoing-monthly-cost"
                  {...form.register('ongoingMonthlyCost', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">Maintenance, support, licensing</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valueValidator" className="text-sm font-semibold text-gray-700">
                  Value Validator
                </Label>
                <Input
                  id="valueValidator"
                  placeholder="e.g., Finance Director, Actuary"
                  className="mt-1 bg-white"
                  data-testid="input-value-validator"
                  value={form.watch('valueValidator') || ''}
                  onChange={(e) => form.setValue('valueValidator', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Person responsible for signing off value</p>
              </div>
              <div>
                <Label htmlFor="validationStatus" className="text-sm font-semibold text-gray-700">
                  Validation Status
                </Label>
                <Select
                  value={form.watch('validationStatus') || 'unvalidated'}
                  onValueChange={(value) => form.setValue('validationStatus', value as any)}
                >
                  <SelectTrigger className="mt-1 bg-white" data-testid="select-validation-status">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unvalidated">Unvalidated</SelectItem>
                    <SelectItem value="pending_finance">Pending Finance Review</SelectItem>
                    <SelectItem value="pending_actuarial">Pending Actuarial Review</SelectItem>
                    <SelectItem value="fully_validated">Fully Validated</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Value sign-off workflow stage</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="conservativeFactor" className="text-sm font-semibold text-gray-700">
                Conservative Factor
              </Label>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((form.watch('conservativeFactor') ?? 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="conservativeFactor"
              min="0.5"
              max="1"
              step="0.05"
              value={form.watch('conservativeFactor') ?? 1}
              onChange={(e) => form.setValue('conservativeFactor', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              data-testid="slider-conservative-factor"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50% (Conservative)</span>
              <span>100% (Full estimate)</span>
            </div>
            <div className="mt-2">
              <Input
                placeholder="Rationale for conservative adjustment..."
                className="mt-1 bg-white text-sm"
                data-testid="input-rationale"
                value={form.watch('rationale') || ''}
                onChange={(e) => form.setValue('rationale', e.target.value)}
              />
            </div>
          </div>
          
          <ValueEstimationLegoBlock
            processes={(form.watch('processes') as string[]) || []}
            scores={{
              dataReadiness: scores.dataReadiness || null,
              technicalComplexity: scores.technicalComplexity || null,
              adoptionReadiness: scores.adoptionReadiness || null,
              changeImpact: scores.changeImpact || null,
              modelRisk: scores.modelRisk || null
            }}
            compact={false}
            onKpiSelectionChange={(kpis) => form.setValue('selectedKpis', kpis)}
            selectedKpis={form.watch('selectedKpis') || []}
            showSelection={true}
          />
          
          <div className="border-t pt-4 mt-4">
            {!showManualOverride ? (
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => setShowManualOverride(true)}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-show-manual-override"
              >
                <Plus className="h-4 w-4 mr-2" />
                Override system estimate
              </Button>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Manual Override</span>
                    <span className="text-xs text-gray-500">Override system estimates</span>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowManualOverride(false)}
                    className="h-8 w-8"
                    data-testid="button-hide-manual-override"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="successMetrics" className="text-sm font-semibold">Custom Success Metrics / KPIs</Label>
                    <Textarea
                      id="successMetrics"
                      rows={2}
                      placeholder="e.g., Reduce manual review time by 30%, Increase quote-to-bind ratio by 5%"
                      className="mt-1"
                      {...form.register('successMetrics')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedValue" className="text-sm font-semibold">Override Estimated Value ({currencySymbol})</Label>
                    <Input
                      id="estimatedValue"
                      placeholder={`e.g., ${currencySymbol}2.5M annual savings`}
                      className="mt-1"
                      {...form.register('estimatedValue')}
                    />
                  </div>
                </div>
                <div className="mt-3">
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
            )}
          </div>
        </CollapsibleSectionItem>

        <CollapsibleSectionItem
          id="technical-details"
          icon={Settings}
          title="Technical Details"
          description="AI/ML technologies, data sources, and integration requirements"
          filledCount={sectionCounts.technicalDetails.filled}
          totalCount={sectionCounts.technicalDetails.total}
          colorScheme="purple"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        </CollapsibleSectionItem>

        <CollapsibleSectionItem
          id="capability-transition"
          icon={Users}
          title="Capability Transition"
          description="Staffing levels and client independence metrics"
          filledCount={sectionCounts.capabilityTransition.filled}
          totalCount={sectionCounts.capabilityTransition.total}
          colorScheme="orange"
        >
          {!editCapabilityTransition ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Hexaware FTE</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {form.watch('capabilityVendorFte') || '—'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Client FTE</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {form.watch('capabilityClientFte') || '—'}
                    </p>
                  </div>
                  <div className="text-center border-l pl-6">
                    <p className="text-xs text-gray-500">Independence</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {form.watch('capabilityIndependence') ? `${form.watch('capabilityIndependence')}%` : '—'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditCapabilityTransition(true)}
                  data-testid="button-edit-capability"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Values auto-derived from use case attributes. Click Edit to override.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Edit staffing values</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditCapabilityTransition(false)}
                  data-testid="button-done-capability"
                >
                  Done
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capabilityVendorFte" className="text-sm font-semibold">Hexaware FTE</Label>
                  <Input
                    id="capabilityVendorFte"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 3.5"
                    className="mt-1 bg-white"
                    data-testid="input-capability-vendor-fte"
                    {...form.register('capabilityVendorFte', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Vendor team size</p>
                </div>
                <div>
                  <Label htmlFor="capabilityClientFte" className="text-sm font-semibold">Client FTE</Label>
                  <Input
                    id="capabilityClientFte"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 2.0"
                    className="mt-1 bg-white"
                    data-testid="input-capability-client-fte"
                    {...form.register('capabilityClientFte', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Client team size</p>
                </div>
                <div>
                  <Label htmlFor="capabilityIndependence" className="text-sm font-semibold">Independence %</Label>
                  <Input
                    id="capabilityIndependence"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Auto-calculated"
                    className="mt-1 bg-white"
                    data-testid="input-capability-independence"
                    {...form.register('capabilityIndependence', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Client / (Client + Vendor) × 100</p>
                </div>
              </div>
            </div>
          )}
        </CollapsibleSectionItem>
      </CollapsibleSectionsContainer>

      {form.watch('librarySource') === 'ai_inventory' && (
        <AIInventoryGovernanceSection form={form} />
      )}

      <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100 mt-6">
        <SectionHeader icon={FileText} title="Use Case Definition Document" description="Upload presentations or PDF documents for this use case" />
        <PresentationUploadBlock
          onUploadComplete={(result) => {
            form.setValue('presentationUrl', result.presentationUrl);
            form.setValue('presentationPdfUrl', result.presentationPdfUrl);
            form.setValue('presentationFileName', result.presentationFileName);
            (window as any).pendingPresentationData = {
              presentationFileId: result.presentationFileId,
              presentationPdfFileId: result.presentationPdfFileId,
              hasPresentation: result.hasPresentation || 'true',
              presentationUploadedAt: new Date().toISOString()
            };
            toast({
              title: "File uploaded successfully",
              description: "Your presentation is now available for preview below. You can save when ready.",
            });
          }}
        />
        {form.watch('presentationPdfUrl') && (
          <div className="mt-6">
            <PresentationPreviewBlock
              presentationUrl={form.watch('presentationUrl')}
              presentationPdfUrl={form.watch('presentationPdfUrl')}
              presentationFileName={form.watch('presentationFileName')}
              hasPresentation="true"
              showTitle={false}
            />
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Upload PowerPoint (.pptx, .ppt) or PDF files to document this use case. Files are auto-converted to PDF for preview.
        </p>
      </div>
    </div>
  );
}

function AIInventoryGovernanceSection({ form }: { form: any }) {
  return (
    <div className="space-y-4 border-l-4 border-emerald-500 pl-4 bg-emerald-50/30 p-4 rounded-lg mt-6">
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
              <FormLabel className="text-base font-semibold text-gray-900 flex items-center gap-2">
                Business Function
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Gate Required</Badge>
              </FormLabel>
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
  );
}
