import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  Edit, 
  Building2, 
  Users, 
  ExternalLink, 
  Tag,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  Clock,
  DollarSign,
  Shield,
  Database,
  Cpu,
  Network
} from 'lucide-react';
import { UseCase } from '../../types';
import { getEffectiveImpactScore, getEffectiveEffortScore, getEffectiveQuadrant, hasManualOverrides } from '@shared/utils/scoreOverride';
import { getSourceConfig, getSourceBackgroundTint } from '../../utils/sourceColors';
import { getQuadrantColor } from '../../utils/calculations';
import ReusableButton from './ReusableButton';

interface UseCaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  useCase: UseCase | null;
  onEdit?: (useCase: UseCase) => void;
  onDelete?: (useCase: UseCase) => void;
}

/**
 * LEGO Block: Use Case Detail Drawer
 * Comprehensive read-only view of use case details with conditional content rendering
 * Follows RSA styling with adaptive content based on data availability
 */
export default function UseCaseDetailDrawer({
  isOpen,
  onClose,
  useCase,
  onEdit,
  onDelete
}: UseCaseDetailDrawerProps) {
  
  if (!useCase) return null;

  // Get effective scores and overrides
  const hasScores = useCase.impactScore !== undefined && useCase.effortScore !== undefined;
  const effectiveImpact = hasScores ? getEffectiveImpactScore(useCase as any) : undefined;
  const effectiveEffort = hasScores ? getEffectiveEffortScore(useCase as any) : undefined;
  const effectiveQuadrant = hasScores ? getEffectiveQuadrant(useCase as any) : '';
  const hasOverrides = hasManualOverrides(useCase as any);
  
  // Get source styling
  const sourceConfig = getSourceConfig(useCase.librarySource || 'rsa_internal');
  
  // Check data availability for conditional rendering
  const extendedUseCase = useCase as any; // Cast to access extended fields
  const hasImplementationData = !!(
    extendedUseCase.primaryBusinessOwner || 
    extendedUseCase.keyDependencies || 
    extendedUseCase.successMetrics ||
    extendedUseCase.implementationTimeline ||
    extendedUseCase.estimatedValue
  );
  
  const hasGovernanceData = !!(
    extendedUseCase.aiOrModel ||
    extendedUseCase.riskToCustomers ||
    extendedUseCase.explainabilityRequired ||
    extendedUseCase.dataUsed ||
    extendedUseCase.modelOwner
  );
  
  const hasTechData = !!(
    extendedUseCase.aiMlTechnologies?.length ||
    extendedUseCase.dataSources?.length ||
    extendedUseCase.stakeholderGroups?.length ||
    extendedUseCase.integrationRequirements
  );

  // Score display component
  const ScoreDisplay = ({ label, score, icon: Icon, color }: { 
    label: string; 
    score: number; 
    icon: any; 
    color: string;
  }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-lg font-bold ${color}`}>{score}</span>
        <span className="text-xs text-gray-500">/ 5</span>
      </div>
    </div>
  );

  // Field display component
  const FieldDisplay = ({ label, value, icon: Icon }: { 
    label: string; 
    value: string | string[] | null | undefined; 
    icon?: any;
  }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 pl-6">{value}</p>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[700px] sm:max-w-none overflow-y-auto" side="right">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2 mb-2">
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: sourceConfig.badgeBackground, 
                    color: sourceConfig.badgeColor 
                  }}
                >
                  {useCase.librarySource === 'rsa_internal' ? (
                    <Building2 className="w-3 h-3 mr-1" />
                  ) : useCase.librarySource === 'hexaware_external' ? (
                    <ExternalLink className="w-3 h-3 mr-1" />
                  ) : (
                    <Users className="w-3 h-3 mr-1" />
                  )}
                  {sourceConfig.label}
                </span>
                {hasOverrides && (
                  <Badge variant="outline" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Manual Override
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-lg font-semibold text-gray-900 mb-2">
                {useCase.title}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-600">
                {useCase.description}
              </SheetDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              {onEdit && (
                <ReusableButton
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(useCase)}
                  icon={Edit}
                  className="text-xs"
                >
                  Edit
                </ReusableButton>
              )}
            </div>
          </div>
        </SheetHeader>

        <Accordion type="multiple" defaultValue={["overview", "business"]} className="space-y-2">
          
          {/* Overview Section */}
          <AccordionItem value="overview" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-semibold text-gray-900">Overview & Scoring</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Scoring Section */}
              {hasScores && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ScoreDisplay 
                      label="Impact Score" 
                      score={effectiveImpact!} 
                      icon={TrendingUp}
                      color="text-green-600"
                    />
                    <ScoreDisplay 
                      label="Effort Score" 
                      score={effectiveEffort!} 
                      icon={TrendingDown}
                      color="text-blue-600"
                    />
                  </div>
                  
                  {/* Quadrant Display */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Strategic Quadrant</span>
                      <Badge 
                        style={{ 
                          backgroundColor: getQuadrantColor(effectiveQuadrant as any),
                          color: 'white'
                        }}
                      >
                        {effectiveQuadrant}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {useCase.problemStatement && (
                <>
                  <Separator />
                  <FieldDisplay 
                    label="Problem Statement"
                    value={useCase.problemStatement}
                    icon={AlertTriangle}
                  />
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Business Context Section */}
          <AccordionItem value="business" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-semibold text-gray-900">Business Context</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <FieldDisplay 
                label="Process"
                value={useCase.process}
                icon={Settings}
              />
              
              <FieldDisplay 
                label="Line of Business"
                value={useCase.lineOfBusiness}
                icon={Building2}
              />
              
              <FieldDisplay 
                label="Business Segment"
                value={useCase.businessSegment}
                icon={Tag}
              />
              
              <FieldDisplay 
                label="Geography"
                value={useCase.geography}
                icon={Network}
              />
              
              <FieldDisplay 
                label="Use Case Type"
                value={useCase.useCaseType}
                icon={Tag}
              />

              {/* Multi-select arrays */}
              {useCase.processes && useCase.processes.length > 0 && (
                <FieldDisplay 
                  label="Additional Processes"
                  value={useCase.processes}
                  icon={Settings}
                />
              )}
              
              {useCase.activities && useCase.activities.length > 0 && (
                <FieldDisplay 
                  label="Activities"
                  value={useCase.activities}
                  icon={CheckCircle}
                />
              )}
              
              {useCase.businessSegments && useCase.businessSegments.length > 0 && (
                <FieldDisplay 
                  label="Additional Business Segments"
                  value={useCase.businessSegments}
                  icon={Building2}
                />
              )}
              
              {useCase.geographies && useCase.geographies.length > 0 && (
                <FieldDisplay 
                  label="Additional Geographies"
                  value={useCase.geographies}
                  icon={Network}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Implementation & Governance Section */}
          <AccordionItem value="implementation" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-semibold text-gray-900">Implementation & Governance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {hasImplementationData ? (
                <>
                  <FieldDisplay 
                    label="Primary Business Owner"
                    value={extendedUseCase.primaryBusinessOwner}
                    icon={Users}
                  />
                  
                  <FieldDisplay 
                    label="Implementation Timeline"
                    value={extendedUseCase.implementationTimeline}
                    icon={Clock}
                  />
                  
                  <FieldDisplay 
                    label="Key Dependencies"
                    value={extendedUseCase.keyDependencies}
                    icon={Network}
                  />
                  
                  <FieldDisplay 
                    label="Success Metrics"
                    value={extendedUseCase.successMetrics}
                    icon={Target}
                  />
                  
                  <FieldDisplay 
                    label="Estimated Value"
                    value={extendedUseCase.estimatedValue}
                    icon={DollarSign}
                  />
                  
                  <FieldDisplay 
                    label="Value Measurement Approach"
                    value={extendedUseCase.valueMeasurementApproach}
                    icon={TrendingUp}
                  />
                  
                  <FieldDisplay 
                    label="Integration Requirements"
                    value={extendedUseCase.integrationRequirements}
                    icon={Network}
                  />
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No implementation data available for this use case.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Technology & Data Section */}
          <AccordionItem value="technology" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-indigo-600" />
                <span className="font-semibold text-gray-900">Technology & Data</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {hasTechData ? (
                <>
                  <FieldDisplay 
                    label="AI/ML Technologies"
                    value={extendedUseCase.aiMlTechnologies}
                    icon={Cpu}
                  />
                  
                  <FieldDisplay 
                    label="Data Sources"
                    value={extendedUseCase.dataSources}
                    icon={Database}
                  />
                  
                  <FieldDisplay 
                    label="Stakeholder Groups"
                    value={extendedUseCase.stakeholderGroups}
                    icon={Users}
                  />
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Cpu className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No technology data available for this use case.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Risk & Compliance Section */}
          <AccordionItem value="governance" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-red-600" />
                <span className="font-semibold text-gray-900">Risk & Compliance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {hasGovernanceData ? (
                <>
                  <FieldDisplay 
                    label="AI/Model Type"
                    value={extendedUseCase.aiOrModel}
                    icon={Cpu}
                  />
                  
                  <FieldDisplay 
                    label="Risk to Customers"
                    value={extendedUseCase.riskToCustomers}
                    icon={AlertTriangle}
                  />
                  
                  <FieldDisplay 
                    label="Risk to RSA"
                    value={extendedUseCase.riskToRsa}
                    icon={Shield}
                  />
                  
                  <FieldDisplay 
                    label="Data Used"
                    value={extendedUseCase.dataUsed}
                    icon={Database}
                  />
                  
                  <FieldDisplay 
                    label="Model Owner"
                    value={extendedUseCase.modelOwner}
                    icon={Users}
                  />
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No governance data available for this use case.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SheetContent>
    </Sheet>
  );
}