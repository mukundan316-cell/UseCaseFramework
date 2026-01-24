import type { SectionCompletionCounts, FormData } from './types';

export const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
  <div className="flex items-start gap-3 pb-3 mb-4 border-b border-gray-200">
    <div className="p-2 bg-gray-100 rounded-lg">
      <Icon className="h-4 w-4 text-gray-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
  </div>
);

export const calculateSectionCompletion = (formData: Partial<FormData>, isTomEnabled: boolean): SectionCompletionCounts => {
  const hasStringValue = (val: unknown): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    return false;
  };
  
  const hasNumericValue = (val: unknown): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'number') return !isNaN(val);
    if (typeof val === 'string') return val.trim().length > 0 && !isNaN(Number(val));
    return false;
  };
  
  const hasArrayValue = (val: unknown): boolean => {
    return Array.isArray(val) && val.length > 0;
  };

  return {
    businessContext: {
      filled: [
        hasStringValue(formData.problemStatement),
        hasArrayValue(formData.processes),
        hasArrayValue(formData.activities),
        hasArrayValue(formData.linesOfBusiness),
        hasArrayValue(formData.businessSegments),
        hasArrayValue(formData.geographies),
        hasStringValue(formData.useCaseType),
      ].filter(Boolean).length,
      total: 7,
    },
    implementationPlanning: {
      filled: [
        hasStringValue(formData.keyDependencies),
        hasStringValue(formData.implementationTimeline),
        ...(isTomEnabled ? [hasStringValue(formData.tomPhaseOverride)] : []),
      ].filter(Boolean).length,
      total: isTomEnabled ? 3 : 2,
    },
    valueRealization: {
      filled: [
        hasNumericValue(formData.initialInvestment),
        hasNumericValue(formData.ongoingMonthlyCost),
        hasArrayValue(formData.selectedKpis),
      ].filter(Boolean).length,
      total: 3,
    },
    technicalDetails: {
      filled: [
        hasArrayValue(formData.aiMlTechnologies),
        hasArrayValue(formData.dataSources),
        hasArrayValue(formData.stakeholderGroups),
        hasStringValue(formData.integrationRequirements),
      ].filter(Boolean).length,
      total: 4,
    },
    capabilityTransition: {
      filled: [
        hasNumericValue(formData.capabilityVendorFte),
        hasNumericValue(formData.capabilityClientFte),
        hasNumericValue(formData.capabilityIndependence),
      ].filter(Boolean).length,
      total: 3,
    },
  };
};

export const getInitialExpandedSections = (counts: SectionCompletionCounts): string[] => {
  const sections: string[] = [];
  if (counts.businessContext.filled > 0) sections.push('business-context');
  if (counts.implementationPlanning.filled > 0) sections.push('implementation-planning');
  if (counts.valueRealization.filled > 0) sections.push('value-realization');
  if (counts.technicalDetails.filled > 0) sections.push('technical-details');
  if (counts.capabilityTransition.filled > 0) sections.push('capability-transition');
  if (sections.length === 0) sections.push('business-context');
  return sections;
};
