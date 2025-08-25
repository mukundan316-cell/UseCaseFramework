import React, { useRef, useState, useEffect } from 'react';
import { X, Edit, FileText, Building2, Users, ExternalLink, Target, AlertTriangle, Eye, GitCompare, FolderPlus, History, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { UseCase } from '../../types';
import { getEffectiveImpactScore, getEffectiveEffortScore, getEffectiveQuadrant, hasManualOverrides } from '@shared/utils/scoreOverride';
import { getSourceConfig } from '../../utils/sourceColors';
import ExportButton from './ExportButton';
import { ScoreSliderLegoBlock } from './ScoreSliderLegoBlock';

interface UseCaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  useCase: UseCase | null;
}

export default function UseCaseDrawer({ isOpen, onClose, onEdit, useCase }: UseCaseDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState<string>('overview');
  const sectionRefs = {
    overview: useRef<HTMLDivElement>(null),
    'strategic-scoring': useRef<HTMLDivElement>(null),
    'business-context': useRef<HTMLDivElement>(null),
    'implementation-details': useRef<HTMLDivElement>(null)
  };

  // Mini-map sections
  const sections = [
    { id: 'overview', label: 'Overview', ref: sectionRefs.overview },
    { id: 'strategic-scoring', label: 'Strategic Scoring', ref: sectionRefs['strategic-scoring'] },
    { id: 'business-context', label: 'Business Context', ref: sectionRefs['business-context'] },
    { id: 'implementation-details', label: 'Implementation Details', ref: sectionRefs['implementation-details'] }
  ];

  // Track current section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const containerHeight = scrollContainerRef.current.clientHeight;
      
      // Find which section is currently most visible
      let currentSectionId = 'overview';
      let maxVisibility = 0;

      sections.forEach(({ id, ref }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const containerRect = scrollContainerRef.current!.getBoundingClientRect();
          
          const visibleTop = Math.max(rect.top, containerRect.top);
          const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const sectionHeight = rect.height;
          const visibility = visibleHeight / sectionHeight;
          
          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            currentSectionId = id;
          }
        }
      });

      setCurrentSection(currentSectionId);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current && scrollContainerRef.current) {
      const elementTop = ref.current.offsetTop;
      scrollContainerRef.current.scrollTo({ top: elementTop - 20, behavior: 'smooth' });
    }
  };

  if (!useCase) return null;

  // Get effective scores (manual overrides take precedence)
  const effectiveImpact = getEffectiveImpactScore(useCase as any);
  const effectiveEffort = getEffectiveEffortScore(useCase as any);
  const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
  const hasScores = effectiveImpact !== undefined && effectiveEffort !== undefined;

  // Get source configuration for badge colors
  const sourceConfig = getSourceConfig(useCase.librarySource || 'rsa_internal');

  // Get source badge info
  const getSourceBadge = () => {
    const source = useCase.librarySource || 'rsa_internal';
    let icon = <Building2 className="w-3 h-3 mr-1" />;
    let label = 'RSA Internal';
    let bgColor = '#2563eb';
    let textColor = '#ffffff';

    switch (source) {
      case 'rsa_internal':
        icon = <Building2 className="w-3 h-3 mr-1" />;
        label = 'RSA Internal';
        bgColor = '#2563eb';
        textColor = '#ffffff';
        break;
      case 'industry_standard':
        icon = <Users className="w-3 h-3 mr-1" />;
        label = 'Industry Standard';
        bgColor = '#16a34a';
        textColor = '#ffffff';
        break;
      case 'ai_inventory':
        icon = <ExternalLink className="w-3 h-3 mr-1" />;
        label = 'AI Inventory';
        bgColor = '#9333ea';
        textColor = '#ffffff';
        break;
      default:
        break;
    }

    return { icon, label, bgColor, textColor };
  };

  // Get quadrant badge color
  const getQuadrantBadgeColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win':
        return { bgColor: '#16a34a', textColor: '#ffffff' };
      case 'Strategic Bet':
        return { bgColor: '#2563eb', textColor: '#ffffff' };
      case 'Experimental':
        return { bgColor: '#ca8a04', textColor: '#ffffff' };
      case 'Watchlist':
        return { bgColor: '#dc2626', textColor: '#ffffff' };
      default:
        return { bgColor: '#6b7280', textColor: '#ffffff' };
    }
  };

  const sourceBadge = getSourceBadge();
  const quadrantBadge = effectiveQuadrant ? getQuadrantBadgeColor(effectiveQuadrant) : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full md:w-[65%]`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Source Badge */}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: sourceBadge.bgColor,
                    color: sourceBadge.textColor
                  }}
                >
                  {sourceBadge.icon}
                  {sourceBadge.label}
                </span>

                {/* Quadrant Badge - Only for strategic cases */}
                {quadrantBadge && effectiveQuadrant && ['Strategic Bet', 'Watchlist', 'Experimental'].includes(effectiveQuadrant) && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: quadrantBadge.bgColor,
                      color: quadrantBadge.textColor
                    }}
                  >
                    {effectiveQuadrant}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {useCase.title}
              </h2>

              {/* Subtitle with Impact/Effort for strategic cases */}
              {hasScores && ['Strategic Bet', 'Watchlist', 'Experimental', 'Quick Win'].includes(effectiveQuadrant) && (
                <p className="text-sm text-gray-600">
                  Impact: {effectiveImpact?.toFixed(1)} | Effort: {effectiveEffort?.toFixed(1)}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}

              <ExportButton
                exportType="use-case"
                exportId={useCase.id}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-1" />
                Export PDF
              </ExportButton>

              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 pb-20">
          {/* Check if this is a strategic use case */}
          {(useCase.librarySource === 'rsa_internal' || useCase.librarySource === 'hexaware_external') ? (
            <Accordion type="multiple" defaultValue={["overview", "strategic-scoring"]} className="w-full">
              {/* Overview Section */}
              <AccordionItem value="overview" ref={sectionRefs.overview}>
                <AccordionTrigger className="text-lg font-semibold">
                  Overview
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{useCase.description}</p>
                  </div>

                  {/* Problem Statement */}
                  {useCase.problemStatement && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Problem Statement</h4>
                      <p className="text-gray-700 leading-relaxed">{useCase.problemStatement}</p>
                    </div>
                  )}

                  {/* Current Quadrant Placement */}
                  {hasScores && effectiveQuadrant && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Quadrant Placement</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <div 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: quadrantBadge?.bgColor || '#6b7280',
                              color: quadrantBadge?.textColor || '#ffffff'
                            }}
                          >
                            {effectiveQuadrant}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Impact: {effectiveImpact?.toFixed(1)} | Effort: {effectiveEffort?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Strategic Scoring Section */}
              <AccordionItem value="strategic-scoring" ref={sectionRefs['strategic-scoring']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Strategic Scoring
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Manual Override Banner */}
                  {hasManualOverrides(useCase as any) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Manual Override Active</span>
                      </div>
                      {useCase.overrideReason && (
                        <p className="text-sm text-yellow-700 mt-1">{useCase.overrideReason}</p>
                      )}
                    </div>
                  )}

                  {/* 10 Lever Scores in 2-column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Impact Levers */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Impact Levers</h4>
                      <div className="space-y-3">
                        <ScoreSliderLegoBlock
                          label="Revenue Impact"
                          field="revenueImpact"
                          value={useCase.revenueImpact}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Cost Savings"
                          field="costSavings"
                          value={useCase.costSavings}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Risk Reduction"
                          field="riskReduction"
                          value={useCase.riskReduction}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Broker/Partner Experience"
                          field="brokerPartnerExperience"
                          value={useCase.brokerPartnerExperience}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Strategic Fit"
                          field="strategicFit"
                          value={useCase.strategicFit}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </div>
                    </div>

                    {/* Effort Levers */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Effort Levers</h4>
                      <div className="space-y-3">
                        <ScoreSliderLegoBlock
                          label="Data Readiness"
                          field="dataReadiness"
                          value={useCase.dataReadiness}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Technical Complexity"
                          field="technicalComplexity"
                          value={useCase.technicalComplexity}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Change Impact"
                          field="changeImpact"
                          value={useCase.changeImpact}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Model Risk"
                          field="modelRisk"
                          value={useCase.modelRisk}
                          onChange={() => {}}
                          disabled={true}
                        />
                        <ScoreSliderLegoBlock
                          label="Adoption Readiness"
                          field="adoptionReadiness"
                          value={useCase.adoptionReadiness}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Scores */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center items-center gap-8">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Overall Impact</div>
                        <div className="text-2xl font-bold text-blue-600">{effectiveImpact?.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Overall Effort</div>
                        <div className="text-2xl font-bold text-orange-600">{effectiveEffort?.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Business Context Section */}
              <AccordionItem value="business-context" ref={sectionRefs['business-context']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Business Context
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Primary Context as Tag Pills */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Process</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {useCase.process}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Lines of Business</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.linesOfBusiness && useCase.linesOfBusiness.length > 0 ? 
                          useCase.linesOfBusiness.map((lob, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                              {lob}
                            </Badge>
                          )) :
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {useCase.lineOfBusiness}
                          </Badge>
                        }
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Business Segments</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.businessSegments && useCase.businessSegments.length > 0 ?
                          useCase.businessSegments.map((segment, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                              {segment}
                            </Badge>
                          )) :
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {useCase.businessSegment}
                          </Badge>
                        }
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Geographies</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.geographies && useCase.geographies.length > 0 ?
                          useCase.geographies.map((geo, index) => (
                            <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                              {geo}
                            </Badge>
                          )) :
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {useCase.geography}
                          </Badge>
                        }
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Use Case Type</h4>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        {useCase.useCaseType}
                      </Badge>
                    </div>
                  </div>

                  {/* Process Activities if available */}
                  {(useCase as any).activities && (useCase as any).activities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Process Activities</h4>
                      <div className="flex flex-wrap gap-2">
                        {(useCase as any).activities.map((activity: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-gray-300">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Implementation Details Section */}
              <AccordionItem value="implementation-details" ref={sectionRefs['implementation-details']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Implementation Details
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Project Management */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(useCase as any).primaryBusinessOwner && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Primary Business Owner</h4>
                        <p className="text-gray-700">{(useCase as any).primaryBusinessOwner}</p>
                      </div>
                    )}
                    {(useCase as any).useCaseStatus && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                        <Badge variant="secondary">{(useCase as any).useCaseStatus}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Timeline and Dependencies */}
                  {(useCase as any).implementationTimeline && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Implementation Timeline</h4>
                      <p className="text-gray-700">{(useCase as any).implementationTimeline}</p>
                    </div>
                  )}

                  {(useCase as any).keyDependencies && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Key Dependencies</h4>
                      <p className="text-gray-700">{(useCase as any).keyDependencies}</p>
                    </div>
                  )}

                  {/* Value Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(useCase as any).estimatedValue && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Estimated Value</h4>
                        <p className="text-gray-700">{(useCase as any).estimatedValue}</p>
                      </div>
                    )}
                    {(useCase as any).successMetrics && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Success Metrics</h4>
                        <p className="text-gray-700">{(useCase as any).successMetrics}</p>
                      </div>
                    )}
                  </div>

                  {(useCase as any).valueMeasurementApproach && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Value Measurement Approach</h4>
                      <p className="text-gray-700">{(useCase as any).valueMeasurementApproach}</p>
                    </div>
                  )}

                  {/* Integration Requirements */}
                  {(useCase as any).integrationRequirements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Integration Requirements</h4>
                      <p className="text-gray-700">{(useCase as any).integrationRequirements}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            /* Fallback for non-strategic use cases */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{useCase.description}</p>
              </div>

              {useCase.problemStatement && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                  <p className="text-gray-700 leading-relaxed">{useCase.problemStatement}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Process</div>
                    <div className="text-gray-900">{useCase.process}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Line of Business</div>
                    <div className="text-gray-900">{useCase.lineOfBusiness}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Use Case Type</div>
                    <div className="text-gray-900">{useCase.useCaseType}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mini-map Navigation */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="space-y-1">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="group relative"
                >
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-16 h-3 rounded border transition-all duration-200 ${
                      currentSection === section.id
                        ? 'bg-blue-500 border-blue-600'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                    title={section.label}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {section.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Full Report
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <GitCompare className="h-4 w-4 mr-1" />
                Compare
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                Add to Workspace
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
              >
                <History className="h-4 w-4 mr-1" />
                View History
              </Button>

              {/* Scroll to top button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-500 hover:bg-gray-100"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}