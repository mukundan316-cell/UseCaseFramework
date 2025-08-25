import React, { useRef, useState, useEffect } from 'react';
import { X, Edit, FileText, Building2, Users, ExternalLink, Target, AlertTriangle, Eye, GitCompare, FolderPlus, History, ChevronUp, Bot, Shield, Database, Briefcase, Calendar, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
    'implementation-details': useRef<HTMLDivElement>(null),
    'rsa-portfolio': useRef<HTMLDivElement>(null)
  };

  // Mini-map sections
  const sections = [
    { id: 'overview', label: 'Overview', ref: sectionRefs.overview },
    { id: 'strategic-scoring', label: 'Strategic Scoring', ref: sectionRefs['strategic-scoring'] },
    { id: 'business-context', label: 'Business Context', ref: sectionRefs['business-context'] },
    { id: 'implementation-details', label: 'Implementation & Governance', ref: sectionRefs['implementation-details'] },
    { id: 'rsa-portfolio', label: 'RSA Portfolio Selection', ref: useRef<HTMLDivElement>(null) }
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

  // Form state for editable fields - must be before early return to avoid hook count issues
  const [formData, setFormData] = useState({
    process: useCase?.process || '',
    linesOfBusiness: useCase?.linesOfBusiness || [useCase?.lineOfBusiness].filter(Boolean),
    businessSegments: useCase?.businessSegments || [useCase?.businessSegment].filter(Boolean),
    geographies: useCase?.geographies || [useCase?.geography].filter(Boolean),
    primaryBusinessOwner: (useCase as any)?.primaryBusinessOwner || '',
    useCaseStatus: (useCase as any)?.useCaseStatus || '',
    keyDependencies: (useCase as any)?.keyDependencies || '',
    implementationTimeline: (useCase as any)?.implementationTimeline || '',
    successMetrics: (useCase as any)?.successMetrics || '',
    estimatedValue: (useCase as any)?.estimatedValue || '',
    valueMeasurementApproach: (useCase as any)?.valueMeasurementApproach || '',
    technicalImplementation: (useCase as any)?.technicalImplementation || '',
    isActiveForRsa: useCase?.isActiveForRsa === 'true' || useCase?.isActiveForRsa === true,
    isDashboardVisible: useCase?.isDashboardVisible === 'true' || useCase?.isDashboardVisible === true,
    activationReason: (useCase as any)?.activationReason || '',
    deactivationReason: (useCase as any)?.deactivationReason || ''
  });

  if (!useCase) return null;

  // Sample data for dropdowns
  const processOptions = [
    'Underwriting', 'Claims Processing', 'Customer Service', 'Risk Assessment', 
    'Portfolio Management', 'Fraud Detection', 'Policy Administration', 'Marketing'
  ];

  const lobOptions = [
    'Commercial', 'Personal', 'Specialty', 'International', 'Reinsurance'
  ];

  const segmentOptions = [
    'Small Commercial', 'Middle Market', 'Large Commercial', 'Personal Lines', 
    'High Net Worth', 'Specialty Lines'
  ];

  const geographyOptions = [
    'UK', 'Europe', 'North America', 'Asia Pacific', 'Global'
  ];

  const statusOptions = [
    'Discovery', 'Development', 'Testing', 'Implementation', 'Live', 'On Hold', 'Cancelled'
  ];

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

              {/* 1. Business Context Section (collapsed by default) */}
              <AccordionItem value="business-context" ref={sectionRefs['business-context']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Business Context
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Process Dropdown */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Process</Label>
                    <Select value={formData.process} onValueChange={(value) => setFormData({...formData, process: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select process" />
                      </SelectTrigger>
                      <SelectContent>
                        {processOptions.map((process) => (
                          <SelectItem key={process} value={process}>
                            {process}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lines of Business multi-select checkboxes in 2 columns */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Lines of Business</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {lobOptions.map((lob) => (
                        <div key={lob} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lob-${lob}`}
                            checked={formData.linesOfBusiness.includes(lob)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({...formData, linesOfBusiness: [...formData.linesOfBusiness, lob]});
                              } else {
                                setFormData({...formData, linesOfBusiness: formData.linesOfBusiness.filter(l => l !== lob)});
                              }
                            }}
                          />
                          <Label htmlFor={`lob-${lob}`} className="text-sm text-gray-700">
                            {lob}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Selected LOB tags */}
                    {formData.linesOfBusiness.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.linesOfBusiness.map((lob) => (
                          <Badge key={lob} variant="secondary" className="bg-green-100 text-green-800">
                            {lob}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Business Segments multi-select checkboxes */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Business Segments</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {segmentOptions.map((segment) => (
                        <div key={segment} className="flex items-center space-x-2">
                          <Checkbox
                            id={`segment-${segment}`}
                            checked={formData.businessSegments.includes(segment)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({...formData, businessSegments: [...formData.businessSegments, segment]});
                              } else {
                                setFormData({...formData, businessSegments: formData.businessSegments.filter(s => s !== segment)});
                              }
                            }}
                          />
                          <Label htmlFor={`segment-${segment}`} className="text-sm text-gray-700">
                            {segment}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Selected segment tags */}
                    {formData.businessSegments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.businessSegments.map((segment) => (
                          <Badge key={segment} variant="secondary" className="bg-purple-100 text-purple-800">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Geographies multi-select checkboxes */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Geographies</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {geographyOptions.map((geo) => (
                        <div key={geo} className="flex items-center space-x-2">
                          <Checkbox
                            id={`geo-${geo}`}
                            checked={formData.geographies.includes(geo)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({...formData, geographies: [...formData.geographies, geo]});
                              } else {
                                setFormData({...formData, geographies: formData.geographies.filter(g => g !== geo)});
                              }
                            }}
                          />
                          <Label htmlFor={`geo-${geo}`} className="text-sm text-gray-700">
                            {geo}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Selected geography tags */}
                    {formData.geographies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.geographies.map((geo) => (
                          <Badge key={geo} variant="secondary" className="bg-orange-100 text-orange-800">
                            {geo}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Process Activities filtered by selected Process */}
                  {formData.process && (
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Process Activities</Label>
                      <p className="text-sm text-gray-500 mt-1">Activities filtered by selected process: {formData.process}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="border-blue-300 text-blue-800">Sample Activity 1</Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-800">Sample Activity 2</Badge>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 2. Implementation & Governance Section (collapsed) */}
              <AccordionItem value="implementation-details" ref={sectionRefs['implementation-details']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Implementation & Governance
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Project Management subsection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Primary Business Owner */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Primary Business Owner</Label>
                        <Input
                          value={formData.primaryBusinessOwner}
                          onChange={(e) => setFormData({...formData, primaryBusinessOwner: e.target.value})}
                          placeholder="Enter business owner name"
                          className="mt-2"
                        />
                      </div>

                      {/* Use Case Status */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Use Case Status</Label>
                        <Select value={formData.useCaseStatus} onValueChange={(value) => setFormData({...formData, useCaseStatus: value})}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Key Dependencies */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Key Dependencies</Label>
                        <Textarea
                          value={formData.keyDependencies}
                          onChange={(e) => setFormData({...formData, keyDependencies: e.target.value})}
                          placeholder="Describe key dependencies and requirements"
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      {/* Implementation Timeline */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Implementation Timeline</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Input
                            value={formData.implementationTimeline}
                            onChange={(e) => setFormData({...formData, implementationTimeline: e.target.value})}
                            placeholder="e.g., Q1 2024 - Q3 2024"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Value Realization subsection */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Value Realization</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Success Metrics/KPIs */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Success Metrics/KPIs</Label>
                        <Textarea
                          value={formData.successMetrics}
                          onChange={(e) => setFormData({...formData, successMetrics: e.target.value})}
                          placeholder="Define success metrics and key performance indicators"
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      {/* Estimated Value */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Estimated Value</Label>
                        <Input
                          value={formData.estimatedValue}
                          onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                          placeholder="e.g., £2.5M annual savings"
                          className="mt-2"
                        />
                      </div>

                      {/* Value Measurement Approach */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Value Measurement Approach</Label>
                        <Textarea
                          value={formData.valueMeasurementApproach}
                          onChange={(e) => setFormData({...formData, valueMeasurementApproach: e.target.value})}
                          placeholder="Describe how value will be measured and tracked"
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Implementation */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Technical Implementation</Label>
                    <Textarea
                      value={formData.technicalImplementation}
                      onChange={(e) => setFormData({...formData, technicalImplementation: e.target.value})}
                      placeholder="Describe technical approach, architecture, and implementation details"
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. RSA Portfolio Selection Section (collapsed) */}
              <AccordionItem value="rsa-portfolio" ref={sectionRefs['rsa-portfolio']}>
                <AccordionTrigger className="text-lg font-semibold">
                  RSA Portfolio Selection
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Portfolio Controls</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Active & Visible toggle */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Active for RSA</Label>
                          <p className="text-sm text-gray-600">Include this use case in RSA's active portfolio</p>
                        </div>
                        <Switch
                          checked={formData.isActiveForRsa}
                          onCheckedChange={(checked) => setFormData({...formData, isActiveForRsa: checked})}
                        />
                      </div>

                      {/* Dashboard Visibility toggle */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Dashboard Visibility</Label>
                          <p className="text-sm text-gray-600">Show this use case on executive dashboards</p>
                        </div>
                        <Switch
                          checked={formData.isDashboardVisible}
                          onCheckedChange={(checked) => setFormData({...formData, isDashboardVisible: checked})}
                        />
                      </div>

                      {/* Activation Reason - required if active */}
                      {formData.isActiveForRsa && (
                        <div>
                          <Label className="text-base font-semibold text-gray-900">
                            Activation Reason <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            value={formData.activationReason}
                            onChange={(e) => setFormData({...formData, activationReason: e.target.value})}
                            placeholder="Explain why this use case is being activated (required)"
                            className="mt-2"
                            rows={3}
                            required
                          />
                        </div>
                      )}

                      {/* Deactivation Reason - shows if inactive */}
                      {!formData.isActiveForRsa && (
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Deactivation Reason</Label>
                          <Textarea
                            value={formData.deactivationReason}
                            onChange={(e) => setFormData({...formData, deactivationReason: e.target.value})}
                            placeholder="Explain why this use case is inactive (optional)"
                            className="mt-2"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : useCase.librarySource === 'sharepoint_import' || useCase.librarySource === 'ai_inventory' ? (
            /* AI Inventory sections */
            <Accordion type="multiple" defaultValue={["ai-tool-overview", "governance-risk"]} className="w-full">
              {/* 1. AI Tool Overview (expanded) */}
              <AccordionItem value="ai-tool-overview" ref={sectionRefs.overview}>
                <AccordionTrigger className="text-lg font-semibold">
                  AI Tool Overview
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Title & Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Title</h4>
                    <p className="text-gray-700 leading-relaxed font-semibold">{useCase.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{useCase.description}</p>
                  </div>

                  {/* AI or Model type with icon */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(useCase as any).aiModelType && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">AI/Model Type</h4>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700">{(useCase as any).aiModelType}</span>
                        </div>
                      </div>
                    )}

                    {/* Purpose of Use field */}
                    {(useCase as any).purposeOfUse && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Purpose of Use</h4>
                        <p className="text-gray-700">{(useCase as any).purposeOfUse}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Governance & Risk (expanded) */}
              <AccordionItem value="governance-risk" ref={sectionRefs['strategic-scoring']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Governance & Risk
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Risk indicators with color coding */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Risk to Customers */}
                    {(useCase as any).riskToCustomers && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk to Customers</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (useCase as any).riskToCustomers?.toLowerCase() === 'high' ? 'bg-red-500' :
                            (useCase as any).riskToCustomers?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-gray-700">{(useCase as any).riskToCustomers}</span>
                        </div>
                      </div>
                    )}

                    {/* Risk to RSA */}
                    {(useCase as any).riskToRSA && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk to RSA</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (useCase as any).riskToRSA?.toLowerCase() === 'high' ? 'bg-red-500' :
                            (useCase as any).riskToRSA?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-gray-700">{(useCase as any).riskToRSA}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Model Owner and Governance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(useCase as any).modelOwner && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Model Owner</h4>
                        <p className="text-gray-700">{(useCase as any).modelOwner}</p>
                      </div>
                    )}

                    {(useCase as any).rsaPolicyGovernance && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">RSA Policy Governance</h4>
                        <p className="text-gray-700">{(useCase as any).rsaPolicyGovernance}</p>
                      </div>
                    )}
                  </div>

                  {/* Third Party Model */}
                  {(useCase as any).thirdPartyModel !== undefined && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Third Party Model</h4>
                      <Badge 
                        variant={
                          (useCase as any).thirdPartyModel === 'Yes' || (useCase as any).thirdPartyModel === true 
                            ? "destructive" 
                            : "secondary"
                        }
                      >
                        {typeof (useCase as any).thirdPartyModel === 'boolean' 
                          ? ((useCase as any).thirdPartyModel ? 'Yes' : 'No')
                          : (useCase as any).thirdPartyModel
                        }
                      </Badge>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 3. Data & Validation (collapsed) */}
              <AccordionItem value="data-validation" ref={sectionRefs['business-context']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Data & Validation
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Data Used */}
                  {(useCase as any).dataUsed && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Used</h4>
                      <p className="text-gray-700">{(useCase as any).dataUsed}</p>
                    </div>
                  )}

                  {/* Validation Responsibility */}
                  {(useCase as any).validationResponsibility && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Validation Responsibility</h4>
                      <p className="text-gray-700">{(useCase as any).validationResponsibility}</p>
                    </div>
                  )}

                  {/* Informed By */}
                  {(useCase as any).informedBy && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informed By</h4>
                      <p className="text-gray-700">{(useCase as any).informedBy}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 4. Business Application (collapsed) */}
              <AccordionItem value="business-application" ref={sectionRefs['implementation-details']}>
                <AccordionTrigger className="text-lg font-semibold">
                  Business Application
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Process, Function */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Process</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {useCase.process}
                      </Badge>
                    </div>

                    {(useCase as any).functionArea && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Function</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {(useCase as any).functionArea}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Risk areas impacted */}
                  {(useCase as any).riskAreasImpacted && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Risk Areas Impacted</h4>
                      {Array.isArray((useCase as any).riskAreasImpacted) ? (
                        <div className="flex flex-wrap gap-2">
                          {(useCase as any).riskAreasImpacted.map((risk: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-red-300 text-red-700">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">{(useCase as any).riskAreasImpacted}</p>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            /* Fallback for other non-strategic use cases */
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