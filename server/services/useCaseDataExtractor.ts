import { UseCase } from '@shared/schema';
import { safeArrayParse } from '@shared/utils/safeMath';

/**
 * Use Case Data Extraction Service
 * 
 * Provides structured, comprehensive data extraction for PDF exports
 * with proper null handling and field mapping consistency.
 */

export interface ExtractedUseCaseData {
  // Basic Information
  basicInfo: {
    id: string;
    title: string;
    description: string;
    problemStatement: string | null;
    useCaseType: string;
    process: string;
    lineOfBusiness: string;
    businessSegment: string;
    geography: string;
    activity: string | null;
    createdAt: Date | null;
  };

  // Multi-select Arrays (properly formatted)
  multiSelectData: {
    linesOfBusiness: string[];
    processes: string[];
    activities: string[];
    businessSegments: string[];
    geographies: string[];
    aiMlTechnologies: string[];
    dataSources: string[];
    stakeholderGroups: string[];
  };

  // Business Context & Implementation
  implementation: {
    primaryBusinessOwner: string | null;
    useCaseStatus: string | null;
    keyDependencies: string | null;
    implementationTimeline: string | null;
    successMetrics: string | null;
    estimatedValue: string | null;
    valueMeasurementApproach: string | null;
    integrationRequirements: string | null;
  };

  // RSA Framework Scores
  businessValue: {
    revenueImpact: number;
    costSavings: number;
    riskReduction: number;
    brokerPartnerExperience: number;
    strategicFit: number;
  };

  feasibility: {
    dataReadiness: number;
    technicalComplexity: number;
    changeImpact: number;
    modelRisk: number;
    adoptionReadiness: number;
  };

  // Calculated & Manual Scores
  scoring: {
    calculatedImpactScore: number;
    calculatedEffortScore: number;
    calculatedQuadrant: string;
    manualImpactScore: number | null;
    manualEffortScore: number | null;
    manualQuadrant: string | null;
    overrideReason: string | null;
    finalImpactScore: number;
    finalEffortScore: number;
    finalQuadrant: string;
  };

  // Portfolio Management
  portfolioStatus: {
    isActiveForRsa: boolean;
    isDashboardVisible: boolean;
    libraryTier: string;
    librarySource: string;
    activationReason: string | null;
    deactivationReason: string | null;
    activationDate: Date | null;
  };

  // AI Inventory (Governance)
  aiInventory: {
    aiOrModel: string | null;
    riskToCustomers: string | null;
    riskToRsa: string | null;
    dataUsed: string | null;
    modelOwner: string | null;
    rsaPolicyGovernance: string | null;
    validationResponsibility: string | null;
    informedBy: string | null;
    businessFunction: string | null;
    thirdPartyProvidedModel: string | null;
    aiInventoryStatus: string | null;
    deploymentStatus: string | null;
    lastStatusUpdate: Date | null;
    // RSA Ethical Principles - moved here for proper export access
    explainabilityRequired: boolean | null;
    customerHarmRisk: string | null;
    dataOutsideUkEu: boolean | null;
    thirdPartyModel: boolean | null;
    humanAccountability: boolean | null;
    regulatoryCompliance: number | null;
  };

  // Display Helpers
  display: {
    statusBadge: string;
    statusColor: string;
    quadrantDisplay: string;
    scoresSummary: string;
    tagsFormatted: string[];
    isAiInventory: boolean;
    hasScoring: boolean;
  };
}

export class UseCaseDataExtractor {
  
  /**
   * Extract comprehensive structured data from a use case
   */
  static extractCompleteData(useCase: UseCase): ExtractedUseCaseData {
    
    // Basic Information
    const basicInfo = {
      id: useCase.id,
      title: useCase.title || 'Untitled Use Case',
      description: useCase.description || 'No description available',
      problemStatement: useCase.problemStatement || null,
      useCaseType: useCase.useCaseType || null,
      process: useCase.process || null,
      lineOfBusiness: useCase.lineOfBusiness || null,
      businessSegment: useCase.businessSegment || null,
      geography: useCase.geography || null,
      activity: useCase.activity || null,
      createdAt: useCase.createdAt || null,
    };

    // Multi-select Arrays with proper parsing
    const multiSelectData = {
      linesOfBusiness: safeArrayParse(useCase.linesOfBusiness),
      processes: safeArrayParse(useCase.processes),
      activities: safeArrayParse(useCase.activities),
      businessSegments: safeArrayParse(useCase.businessSegments),
      geographies: safeArrayParse(useCase.geographies),
      aiMlTechnologies: safeArrayParse(useCase.aiMlTechnologies),
      dataSources: safeArrayParse(useCase.dataSources),
      stakeholderGroups: safeArrayParse(useCase.stakeholderGroups),
    };

    // Implementation & Governance - include ALL fields from CRUD tabs
    const implementation = {
      primaryBusinessOwner: useCase.primaryBusinessOwner || null,
      useCaseStatus: useCase.useCaseStatus || null,
      keyDependencies: useCase.keyDependencies || null,
      implementationTimeline: useCase.implementationTimeline || null,
      successMetrics: useCase.successMetrics || null,
      estimatedValue: useCase.estimatedValue || null,
      valueMeasurementApproach: useCase.valueMeasurementApproach || null,
      integrationRequirements: useCase.integrationRequirements || null,
    };

    // Business Value (Impact) Scores
    const businessValue = {
      revenueImpact: useCase.revenueImpact || 0,
      costSavings: useCase.costSavings || 0,
      riskReduction: useCase.riskReduction || 0,
      brokerPartnerExperience: useCase.brokerPartnerExperience || 0,
      strategicFit: useCase.strategicFit || 0,
    };

    // Feasibility (Effort) Scores
    const feasibility = {
      dataReadiness: useCase.dataReadiness || 0,
      technicalComplexity: useCase.technicalComplexity || 0,
      changeImpact: useCase.changeImpact || 0,
      modelRisk: useCase.modelRisk || 0,
      adoptionReadiness: useCase.adoptionReadiness || 0,
    };

    // Scoring (Calculated vs Manual)
    const scoring = {
      calculatedImpactScore: useCase.impactScore || 0,
      calculatedEffortScore: useCase.effortScore || 0,
      calculatedQuadrant: useCase.quadrant || 'TBD',
      manualImpactScore: useCase.manualImpactScore || null,
      manualEffortScore: useCase.manualEffortScore || null,
      manualQuadrant: useCase.manualQuadrant || null,
      overrideReason: useCase.overrideReason || null,
      regulatoryCompliance: useCase.regulatoryCompliance || null,
      // Final scores (manual override takes precedence)
      finalImpactScore: useCase.manualImpactScore || useCase.impactScore || 0,
      finalEffortScore: useCase.manualEffortScore || useCase.effortScore || 0,
      finalQuadrant: useCase.manualQuadrant || useCase.quadrant || 'TBD',
    };

    // Portfolio Status
    const portfolioStatus = {
      isActiveForRsa: useCase.isActiveForRsa === 'true',
      isDashboardVisible: useCase.isDashboardVisible === 'true',
      libraryTier: useCase.libraryTier || 'reference',
      librarySource: useCase.librarySource || 'rsa_internal',
      activationReason: useCase.activationReason || null,
      deactivationReason: useCase.deactivationReason || null,
      activationDate: useCase.activationDate || null,
    };

    // AI Inventory (Governance fields) - include ALL RSA Ethical Principles
    const aiInventory = {
      aiOrModel: useCase.aiOrModel || null,
      riskToCustomers: useCase.riskToCustomers || null,
      riskToRsa: useCase.riskToRsa || null,
      dataUsed: useCase.dataUsed || null,
      modelOwner: useCase.modelOwner || null,
      rsaPolicyGovernance: useCase.rsaPolicyGovernance || null,
      validationResponsibility: useCase.validationResponsibility || null,
      informedBy: useCase.informedBy || null,
      businessFunction: useCase.businessFunction || null,
      thirdPartyProvidedModel: useCase.thirdPartyProvidedModel || null,
      aiInventoryStatus: useCase.aiInventoryStatus || null,
      deploymentStatus: useCase.deploymentStatus || null,
      lastStatusUpdate: useCase.lastStatusUpdate || null,
      // RSA Ethical Principles - FIXED: proper boolean handling for export
      explainabilityRequired: useCase.explainabilityRequired !== null ? useCase.explainabilityRequired : null,
      customerHarmRisk: useCase.customerHarmRisk || null,
      dataOutsideUkEu: useCase.dataOutsideUkEu !== null ? useCase.dataOutsideUkEu : null,
      thirdPartyModel: useCase.thirdPartyModel !== null ? useCase.thirdPartyModel : null,
      humanAccountability: useCase.humanAccountability !== null ? useCase.humanAccountability : null,
      regulatoryCompliance: useCase.regulatoryCompliance !== null ? useCase.regulatoryCompliance : null,
    };

    // Display Helpers
    const isAiInventory = useCase.librarySource === 'ai_inventory';
    const hasScoring = !isAiInventory && portfolioStatus.isActiveForRsa; // AI Inventory is for governance tracking, not scoring
    
    const display = {
      statusBadge: portfolioStatus.isActiveForRsa ? 'ACTIVE PORTFOLIO' : 'REFERENCE LIBRARY',
      statusColor: portfolioStatus.isActiveForRsa ? '#22C55E' : '#6B7280',
      quadrantDisplay: scoring.finalQuadrant,
      scoresSummary: hasScoring ? `Impact: ${scoring.finalImpactScore.toFixed(1)} | Effort: ${scoring.finalEffortScore.toFixed(1)}` : (isAiInventory ? 'AI Governance Tracking' : 'Not Activated for Portfolio'),
      tagsFormatted: this.formatTags(useCase),
      isAiInventory,
      hasScoring,
    };

    return {
      basicInfo,
      multiSelectData,
      implementation,
      businessValue,
      feasibility,
      scoring,
      portfolioStatus,
      aiInventory,
      display,
    };
  }


  /**
   * Format tags for display
   */
  private static formatTags(useCase: UseCase): string[] {
    const tags: string[] = [];
    
    if (useCase.process) tags.push(`Process: ${useCase.process}`);
    if (useCase.lineOfBusiness) tags.push(`LOB: ${useCase.lineOfBusiness}`);
    if (useCase.useCaseType) tags.push(`Type: ${useCase.useCaseType}`);
    if (useCase.librarySource) tags.push(`Source: ${this.formatLibrarySource(useCase.librarySource)}`);
    
    return tags;
  }

  /**
   * Format library source for display
   */
  private static formatLibrarySource(source: string): string {
    const sourceMap: Record<string, string> = {
      'rsa_internal': 'RSA Internal',
      'industry_standard': 'Industry Standard',
      'ai_inventory': 'AI Inventory',
    };
    
    return sourceMap[source] || source;
  }

  /**
   * Get formatted summary statistics
   */
  static getSummaryStats(useCases: UseCase[]) {
    const totalUseCases = useCases.length;
    const activeUseCases = useCases.filter(uc => uc.isActiveForRsa === 'true').length;
    const aiInventoryItems = useCases.filter(uc => uc.librarySource === 'ai_inventory').length;
    const strategicUseCases = useCases.filter(uc => uc.librarySource !== 'ai_inventory').length;
    
    return {
      totalUseCases,
      activeUseCases,
      referenceUseCases: totalUseCases - activeUseCases,
      aiInventoryItems,
      strategicUseCases,
      averageImpactScore: this.calculateAverageScore(useCases, 'impact'),
      averageEffortScore: this.calculateAverageScore(useCases, 'effort'),
    };
  }

  /**
   * Calculate average scores (excluding AI inventory items)
   */
  private static calculateAverageScore(useCases: UseCase[], scoreType: 'impact' | 'effort'): number {
    const strategicUseCases = useCases.filter(uc => uc.librarySource !== 'ai_inventory');
    
    if (strategicUseCases.length === 0) return 0;
    
    const scores = strategicUseCases.map(uc => {
      if (scoreType === 'impact') {
        return uc.manualImpactScore || uc.impactScore || 0;
      } else {
        return uc.manualEffortScore || uc.effortScore || 0;
      }
    });
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    return total / scores.length;
  }
}