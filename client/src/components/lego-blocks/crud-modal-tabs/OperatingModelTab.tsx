import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, User, Tag, AlertTriangle, AlertCircle } from 'lucide-react';
import RSASelectionToggleLegoBlock from '../RSASelectionToggleLegoBlock';
import HorizontalUseCaseLegoBlock from '../HorizontalUseCaseLegoBlock';
import { SectionHeader } from './utils';
import type { OperatingModelTabProps } from './types';

export default function OperatingModelTab({
  form,
  mode,
  useCase,
  governanceStatus,
  rsaSelection,
  handleRSAToggle,
  handleDashboardToggle,
  handleActivationReasonChange,
  handleDeactivationReasonChange,
  handleStatusChange,
  useCaseStatusOptions,
  sortedMetadata,
  metadata,
  isCheckingDuplicates,
  similarUseCases,
}: OperatingModelTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
        <SectionHeader icon={FileText} title="Use Case Identity" description="Basic information to identify this use case" />
        <div className="space-y-4">
          {mode === 'edit' && useCase?.meaningfulId && (
            <div>
              <Label className="text-sm font-semibold">Use Case ID</Label>
              <div className="mt-1 px-3 py-2 bg-white border border-gray-200 rounded-md">
                <span className="font-mono text-sm text-rsa-blue font-medium">{useCase.meaningfulId}</span>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="title" className="text-sm font-semibold">
              Use Case Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Automated Claims Triage"
              className="mt-1 bg-white"
              {...form.register('title')}
              data-testid="input-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1" data-testid="error-title">{form.formState.errors.title.message}</p>
            )}
            {isCheckingDuplicates && (
              <p className="mt-2 text-xs text-muted-foreground">Checking for similar use cases...</p>
            )}
            {!isCheckingDuplicates && similarUseCases.length > 0 && (
              <Alert className="mt-2 border-amber-500 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Potential duplicates:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    {similarUseCases.slice(0, 3).map((similar) => (
                      <li key={similar.meaningfulId}>{similar.meaningfulId}: {similar.title}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Brief description of what this use case does and its AI/automation approach..."
              className="mt-1 bg-white"
              {...form.register('description')}
              data-testid="textarea-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
        <SectionHeader icon={User} title="Ownership" description="Required for Operating Model gate" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">
              Primary Business Owner <span className="text-red-500">*</span>
              <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700">Gate Required</Badge>
            </Label>
            <Input
              placeholder="e.g., John Smith"
              className="mt-1 bg-white"
              value={form.watch('primaryBusinessOwner') || ''}
              onChange={(e) => form.setValue('primaryBusinessOwner', e.target.value)}
              data-testid="input-primary-owner"
            />
            <p className="text-xs text-gray-500 mt-1">The accountable person for this use case</p>
          </div>
          <div>
            <Label className="text-sm font-semibold">Business Function</Label>
            <Select 
              value={form.watch('businessFunction') || ''} 
              onValueChange={(value) => form.setValue('businessFunction', value)}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select function..." />
              </SelectTrigger>
              <SelectContent>
                {['Marketing', 'CIO', 'Claims', 'Underwriting', 'Finance', 'HR', 'Operations', 'Customer Service'].map(fn => (
                  <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
        <SectionHeader icon={Tag} title="Classification" description="Status and source categorization" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2">
              Status
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Gate Required</Badge>
            </Label>
            <Select 
              value={form.watch('useCaseStatus') || 'Discovery'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="mt-1 bg-white" data-testid="select-use-case-status">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {useCaseStatusOptions.filter(status => status && status.trim()).map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.watch('useCaseStatus') === 'Discovery' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm" data-testid="warning-discovery-status">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Use cases in Discovery cannot pass Gate 1. Change status to proceed with governance.</span>
              </div>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold">Source Type</Label>
            <Select 
              value={form.watch('librarySource') || 'internal'} 
              onValueChange={(value) => form.setValue('librarySource', value)}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                {sortedMetadata.getSortedItems('sourceTypes', metadata?.sourceTypes || ['internal']).filter((source: string) => source && source.trim()).map((source: string) => (
                  <SelectItem key={source} value={source}>
                    {source.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.watch('librarySource') === 'ai_inventory' && (
              <p className="text-xs text-emerald-600 mt-1">AI Inventory governance fields available in Details tab</p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <HorizontalUseCaseLegoBlock
            isHorizontalUseCase={form.watch('horizontalUseCase') || 'false'}
            selectedTypes={form.watch('horizontalUseCaseTypes') || []}
            onHorizontalUseCaseChange={(value) => form.setValue('horizontalUseCase', value)}
            onTypesChange={(types) => form.setValue('horizontalUseCaseTypes', types)}
          />
        </div>
      </div>

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
          governanceStatus={governanceStatus}
        />
      )}
    </div>
  );
}
