import { APP_CONFIG } from './constants/app-config';
import { performanceMonitor } from './utils/performance';

/**
 * Calculates impact score using comprehensive RSA framework with weighted scoring
 * Applies configurable weights from database configuration
 * Per RSA AI Framework specification
 * 
 * @param revenueImpact - Revenue generation potential (1-5)
 * @param costSavings - Cost reduction opportunity (1-5)
 * @param riskReduction - Risk mitigation value (1-5)
 * @param brokerPartnerExperience - Partner experience improvement (1-5)
 * @param strategicFit - Strategic alignment score (1-5)
 * @param weights - Optional custom weights (defaults to equal 20% each)
 * @returns Weighted impact score (0-5 range)
 */
export function calculateImpactScore(
  revenueImpact: number,
  costSavings: number,
  riskReduction: number,
  brokerPartnerExperience: number,
  strategicFit: number,
  weights?: {
    revenueImpact: number;
    costSavings: number;
    riskReduction: number;
    brokerPartnerExperience: number;
    strategicFit: number;
  }
): number {
  // Add null safety for numeric inputs
  const safeRevenueImpact = revenueImpact ?? 0;
  const safeCostSavings = costSavings ?? 0;
  const safeRiskReduction = riskReduction ?? 0;
  const safeBrokerPartnerExperience = brokerPartnerExperience ?? 0;
  const safeStrategicFit = strategicFit ?? 0;

  // Use provided weights or default to equal weighting (20% each)
  const w = weights || {
    revenueImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.REVENUE_IMPACT,
    costSavings: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.COST_SAVINGS,
    riskReduction: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.RISK_REDUCTION,
    brokerPartnerExperience: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.BROKER_PARTNER_EXPERIENCE,
    strategicFit: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.STRATEGIC_FIT
  };

  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (safeRevenueImpact * w.revenueImpact / 100) +
    (safeCostSavings * w.costSavings / 100) +
    (safeRiskReduction * w.riskReduction / 100) +
    (safeBrokerPartnerExperience * w.brokerPartnerExperience / 100) +
    (safeStrategicFit * w.strategicFit / 100)
  );

  const result = Math.max(0, Math.min(5, weightedScore));
  
  // Log performance for monitoring (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    performanceMonitor.timeOperation('calculateImpactScore', () => result, {
      inputScores: { revenueImpact, costSavings, riskReduction, brokerPartnerExperience, strategicFit },
      result
    });
  }
  
  return result;
}

/**
 * Calculates effort score using comprehensive RSA framework with weighted scoring
 * Applies configurable weights from database configuration
 * Per RSA AI Framework specification
 */
export function calculateEffortScore(
  dataReadiness: number,
  technicalComplexity: number,
  changeImpact: number,
  modelRisk: number,
  adoptionReadiness: number,
  weights?: {
    dataReadiness: number;
    technicalComplexity: number;
    changeImpact: number;
    modelRisk: number;
    adoptionReadiness: number;
  }
): number {
  // Add null safety for numeric inputs
  const safeDataReadiness = dataReadiness ?? 0;
  const safeTechnicalComplexity = technicalComplexity ?? 0;
  const safeChangeImpact = changeImpact ?? 0;
  const safeModelRisk = modelRisk ?? 0;
  const safeAdoptionReadiness = adoptionReadiness ?? 0;

  // Use provided weights or default to equal weighting (20% each)
  const w = weights || {
    dataReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.DATA_READINESS,
    technicalComplexity: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.TECHNICAL_COMPLEXITY,
    changeImpact: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.CHANGE_IMPACT,
    modelRisk: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.MODEL_RISK,
    adoptionReadiness: APP_CONFIG.SCORING.DEFAULT_WEIGHTS.ADOPTION_READINESS
  };

  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (safeDataReadiness * w.dataReadiness / 100) +
    (safeTechnicalComplexity * w.technicalComplexity / 100) +
    (safeChangeImpact * w.changeImpact / 100) +
    (safeModelRisk * w.modelRisk / 100) +
    (safeAdoptionReadiness * w.adoptionReadiness / 100)
  );

  return Math.max(0, Math.min(5, weightedScore)); // Ensure result is within 0-5 range preserving full precision
}


/**
 * Determines quadrant based on impact and effort scores with configurable threshold
 * Y-axis = Business Impact (Impact) - Higher is better
 * X-axis = Implementation Effort (Effort) - Lower is better (left = easy, right = hard)
 * 
 * Quadrant Mapping (RSA Framework):
 * - Quick Win: impact >= threshold && effort < threshold (Top Left - High Impact, Low Effort - Easy + Valuable)
 * - Strategic Bet: impact >= threshold && effort >= threshold (Top Right - High Impact, High Effort - Hard + Valuable)  
 * - Experimental: impact < threshold && effort < threshold (Bottom Left - Low Impact, Low Effort - Easy + Low Impact)
 * - Watchlist: impact < threshold && effort >= threshold (Bottom Right - Low Impact, High Effort - Hard + Low Impact)
 */
export function calculateQuadrant(
  impactScore: number, 
  effortScore: number, 
  threshold: number = APP_CONFIG.SCORING.DEFAULT_THRESHOLD
): string {
  if (impactScore >= threshold && effortScore < threshold) {
    return "Quick Win";
  } else if (impactScore >= threshold && effortScore >= threshold) {
    return "Strategic Bet";
  } else if (impactScore < threshold && effortScore < threshold) {
    return "Experimental";
  } else {
    return "Watchlist";
  }
}

// Note: calculateGovernanceScore was removed as it's not implemented

/**
 * T-shirt sizing configuration interface for type safety
 */
export interface TShirtSizingConfig {
  enabled: boolean;
  sizes: Array<{
    name: string;
    minWeeks: number;
    maxWeeks: number;
    teamSizeMin: number;
    teamSizeMax: number;
    color: string;
    description?: string;
  }>;
  roles: Array<{
    type: string;
    dailyRateGBP: number;
  }>;
  overheadMultiplier: number;
  mappingRules: Array<{
    name: string;
    condition: {
      impactMin?: number;
      impactMax?: number;
      effortMin?: number;
      effortMax?: number;
    };
    targetSize: string;
    priority: number;
  }>;
  benefitMultipliers?: {
    [sizeName: string]: number;
  };
  benefitRangePct?: number;
}

/**
 * Calculates T-shirt size based on impact and effort scores using configurable rules
 * Follows metadata-driven approach - no hard-coded thresholds
 */
export function calculateTShirtSize(
  impactScore: number,
  effortScore: number,
  config?: TShirtSizingConfig
): {
  size: string | null;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  estimatedWeeksMin: number | null;
  estimatedWeeksMax: number | null;
  teamSizeEstimate: string | null;
  error?: string;
} {
  try {
    // Validate input parameters
    if (typeof impactScore !== 'number' || typeof effortScore !== 'number') {
      return {
        size: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null,
        error: 'Invalid input: impact and effort scores must be numbers'
      };
    }

    if (isNaN(impactScore) || isNaN(effortScore)) {
      return {
        size: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null,
        error: 'Invalid input: scores cannot be NaN'
      };
    }

    // Normalize scores to valid range (1-5)
    const normalizedImpact = Math.max(1, Math.min(5, impactScore));
    const normalizedEffort = Math.max(1, Math.min(5, effortScore));
    // Return null values if T-shirt sizing is disabled or not configured
    if (!config?.enabled) {
      return {
        size: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null
      };
    }

    // Validate configuration
    if (!config.sizes || config.sizes.length === 0) {
      return {
        size: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null,
        error: 'Invalid configuration: no sizes defined'
      };
    }

    if (!config.roles || config.roles.length === 0) {
      return {
        size: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null,
        error: 'Invalid configuration: no roles defined'
      };
    }

    if (!config.mappingRules || config.mappingRules.length === 0) {
      return {
        size: null,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null,
        error: 'Invalid configuration: no mapping rules defined'
      };
    }

    // Apply mapping rules in priority order (highest priority first)
    const sortedRules = [...config.mappingRules].sort((a, b) => b.priority - a.priority);
    
    let selectedSize: string | null = null;
    
    for (const rule of sortedRules) {
      try {
        const { condition } = rule;
        
        // Check if impact score matches the condition
        const impactMatch = (
          (condition.impactMin === undefined || normalizedImpact >= condition.impactMin) &&
          (condition.impactMax === undefined || normalizedImpact <= condition.impactMax)
        );
        
        // Check if effort score matches the condition
        const effortMatch = (
          (condition.effortMin === undefined || normalizedEffort >= condition.effortMin) &&
          (condition.effortMax === undefined || normalizedEffort <= condition.effortMax)
        );
        
        if (impactMatch && effortMatch) {
          selectedSize = rule.targetSize;
          break;
        }
      } catch (ruleError) {
        console.warn('Error processing mapping rule:', rule, ruleError);
        continue; // Skip this rule and continue with the next one
      }
    }
    
    // If no rule matches, use the smallest size as fallback
    if (!selectedSize && config.sizes.length > 0) {
      selectedSize = config.sizes[0].name;
    }
  
    // Find size configuration
    const sizeConfig = config.sizes.find(s => s.name === selectedSize);
    if (!sizeConfig) {
      return {
        size: selectedSize,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: null,
        estimatedWeeksMax: null,
        teamSizeEstimate: null,
        error: `Size configuration not found for: ${selectedSize}`
      };
    }
    
    // Calculate cost estimates based on team size and rates
    const dailyTeamCost = calculateDailyTeamCost(config.roles, sizeConfig, config.overheadMultiplier);
    
    if (dailyTeamCost <= 0) {
      return {
        size: selectedSize,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: sizeConfig.minWeeks,
        estimatedWeeksMax: sizeConfig.maxWeeks,
        teamSizeEstimate: `${sizeConfig.teamSizeMin}-${sizeConfig.teamSizeMax}`,
        error: 'Invalid cost calculation: daily team cost is zero or negative'
      };
    }
    
    const minCost = Math.round(dailyTeamCost * sizeConfig.minWeeks * 5); // 5 working days per week
    const maxCost = Math.round(dailyTeamCost * sizeConfig.maxWeeks * 5);
    
    // Sanity check on calculated costs
    if (minCost < 0 || maxCost < 0 || minCost > maxCost) {
      return {
        size: selectedSize,
        estimatedCostMin: null,
        estimatedCostMax: null,
        estimatedWeeksMin: sizeConfig.minWeeks,
        estimatedWeeksMax: sizeConfig.maxWeeks,
        teamSizeEstimate: `${sizeConfig.teamSizeMin}-${sizeConfig.teamSizeMax}`,
        error: 'Invalid cost calculation: negative costs or min > max'
      };
    }
    
    return {
      size: selectedSize,
      estimatedCostMin: minCost,
      estimatedCostMax: maxCost,
      estimatedWeeksMin: sizeConfig.minWeeks,
      estimatedWeeksMax: sizeConfig.maxWeeks,
      teamSizeEstimate: `${sizeConfig.teamSizeMin}-${sizeConfig.teamSizeMax}`
    };
  } catch (error) {
    console.error('Error in calculateTShirtSize:', error);
    return {
      size: null,
      estimatedCostMin: null,
      estimatedCostMax: null,
      estimatedWeeksMin: null,
      estimatedWeeksMax: null,
      teamSizeEstimate: null,
      error: `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Calculates daily team cost based on role rates and team composition
 */
function calculateDailyTeamCost(
  roles: TShirtSizingConfig['roles'],
  sizeConfig: TShirtSizingConfig['sizes'][0],
  overheadMultiplier: number
): number {
  try {
    // Validate inputs
    if (!roles || roles.length === 0) {
      console.warn('No roles provided for cost calculation');
      return 0;
    }

    if (!sizeConfig) {
      console.warn('No size configuration provided for cost calculation');
      return 0;
    }

    if (typeof overheadMultiplier !== 'number' || overheadMultiplier <= 0) {
      console.warn('Invalid overhead multiplier, using 1.0 as fallback');
      overheadMultiplier = 1.0;
    }

    // Use average team size for calculation
    const avgTeamSize = (sizeConfig.teamSizeMin + sizeConfig.teamSizeMax) / 2;
    
    if (avgTeamSize <= 0) {
      console.warn('Invalid team size configuration');
      return 0;
    }
    
    // Calculate weighted average daily rate based on typical team composition
    // Filter out invalid rates and calculate average
    const validRoles = roles.filter(role => 
      role && 
      typeof role.dailyRateGBP === 'number' && 
      role.dailyRateGBP > 0
    );

    if (validRoles.length === 0) {
      console.warn('No valid roles with positive rates found');
      return 0;
    }

    const avgDailyRate = validRoles.reduce((sum, role) => sum + role.dailyRateGBP, 0) / validRoles.length;
    
    // Apply team size and overhead multiplier
    const result = avgDailyRate * avgTeamSize * overheadMultiplier;
    
    // Sanity check
    if (isNaN(result) || result < 0) {
      console.warn('Invalid cost calculation result:', result);
      return 0;
    }
    
    return result;
  } catch (error) {
    console.error('Error calculating daily team cost:', error);
    return 0;
  }
}

/**
 * Calculate annual benefit range based on impact score and T-shirt size
 */
export function calculateAnnualBenefitRange(
  impactScore: number,
  tShirtSize: string | null,
  config?: TShirtSizingConfig
): {
  benefitMin: number | null;
  benefitMax: number | null;
  error?: string;
} {
  try {
    if (!config || !config.benefitMultipliers || !tShirtSize) {
      return {
        benefitMin: null,
        benefitMax: null,
        error: 'Configuration or T-shirt size not available'
      };
    }

    const multiplier = config.benefitMultipliers[tShirtSize];
    const rangePct = config.benefitRangePct || 0.20;

    if (!multiplier) {
      return {
        benefitMin: null,
        benefitMax: null,
        error: `No benefit multiplier found for size: ${tShirtSize}`
      };
    }

    // Normalize impact score to valid range
    const normalizedImpact = Math.max(1, Math.min(5, impactScore));
    
    // Calculate base benefit
    const baseBenefit = normalizedImpact * multiplier;
    
    // Apply range percentage
    const benefitMin = Math.round((baseBenefit * (1 - rangePct)) / 1000) * 1000;
    const benefitMax = Math.round((baseBenefit * (1 + rangePct)) / 1000) * 1000;

    return {
      benefitMin,
      benefitMax
    };
  } catch (error) {
    console.error('Error calculating annual benefit range:', error);
    return {
      benefitMin: null,
      benefitMax: null,
      error: `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Default T-shirt sizing configuration for RSA
 * Used as fallback when no configuration is provided
 */
export function getDefaultTShirtSizingConfig(): TShirtSizingConfig {
  return {
    enabled: true,
    sizes: [
      {
        name: 'XS',
        minWeeks: 2,
        maxWeeks: 4,
        teamSizeMin: 1,
        teamSizeMax: 2,
        color: '#10B981', // Green
        description: 'Simple automation or tool integration'
      },
      {
        name: 'S',
        minWeeks: 4,
        maxWeeks: 8,
        teamSizeMin: 2,
        teamSizeMax: 4,
        color: '#3B82F6', // Blue
        description: 'Basic ML model, RPA, or process optimization'
      },
      {
        name: 'M',
        minWeeks: 8,
        maxWeeks: 16,
        teamSizeMin: 3,
        teamSizeMax: 6,
        color: '#FBBF24', // Amber
        description: 'Advanced ML/NLP, data pipelines, multi-system integration'
      },
      {
        name: 'L',
        minWeeks: 16,
        maxWeeks: 26,
        teamSizeMin: 5,
        teamSizeMax: 10,
        color: '#EF4444', // Red
        description: 'Complex AI systems, agentic bots, cross-functional rollout'
      },
      {
        name: 'XL',
        minWeeks: 26,
        maxWeeks: 52,
        teamSizeMin: 8,
        teamSizeMax: 15,
        color: '#8B5CF6', // Purple
        description: 'Enterprise-wide transformation, end-to-end automation'
      }
    ],
    roles: [
      { type: 'Developer', dailyRateGBP: 400 },
      { type: 'Analyst', dailyRateGBP: 350 },
      { type: 'PM', dailyRateGBP: 500 },
      { type: 'Data Engineer', dailyRateGBP: 550 },
      { type: 'Architect', dailyRateGBP: 650 },
      { type: 'QA Engineer', dailyRateGBP: 300 }
    ],
    overheadMultiplier: 1.35, // 35% overhead for benefits, facilities, management
    mappingRules: [
      // TIER 1: Critical & High-Value Quick Wins (Highest Priority)
      {
        name: 'Critical Quick Fix',
        condition: { impactMin: 4.5, effortMax: 1.5 },
        targetSize: 'XS',
        priority: 150
      },
      {
        name: 'High-Value Quick Win', 
        condition: { impactMin: 4.0, effortMax: 2.5 },
        targetSize: 'S',
        priority: 140
      },
      {
        name: 'Strategic Quick Win',
        condition: { impactMin: 3.5, effortMax: 2.0 },
        targetSize: 'S',
        priority: 130
      },
      
      // TIER 2: Strategic Projects (High Priority)
      {
        name: 'Strategic Priority',
        condition: { impactMin: 4.0, effortMin: 2.5, effortMax: 3.5 },
        targetSize: 'M',
        priority: 120
      },
      {
        name: 'Major Strategic Bet',
        condition: { impactMin: 4.0, effortMin: 3.5, effortMax: 4.5 },
        targetSize: 'L',
        priority: 110
      },
      {
        name: 'Complex Strategic',
        condition: { impactMin: 3.5, effortMin: 4.5 },
        targetSize: 'XL',
        priority: 105
      },
      
      // TIER 3: Standard Projects (Medium Priority)
      {
        name: 'Standard Quick Win',
        condition: { impactMin: 3.0, effortMax: 2.5 },
        targetSize: 'S',
        priority: 100
      },
      {
        name: 'Important Project',
        condition: { impactMin: 3.5, effortMin: 2.0, effortMax: 3.5 },
        targetSize: 'M',
        priority: 95
      },
      {
        name: 'Strategic Project',
        condition: { impactMin: 3.0, effortMin: 3.5, effortMax: 4.5 },
        targetSize: 'L',
        priority: 90
      },
      
      // TIER 4: Medium-Impact Projects (Lower Priority)
      {
        name: 'Standard Project',
        condition: { impactMin: 2.5, effortMin: 2.5, effortMax: 3.5 },
        targetSize: 'M',
        priority: 80
      },
      {
        name: 'Complex Standard',
        condition: { impactMin: 2.5, effortMin: 3.5, effortMax: 4.5 },
        targetSize: 'M',
        priority: 75
      },
      {
        name: 'Resource-Heavy Project',
        condition: { impactMin: 2.5, effortMin: 4.5 },
        targetSize: 'L',
        priority: 70
      },
      
      // TIER 5: Small Tasks & Maintenance (Routine Work)
      {
        name: 'Small Project',
        condition: { impactMin: 2.0, effortMin: 1.5, effortMax: 2.5 },
        targetSize: 'S',
        priority: 65
      },
      {
        name: 'Maintenance Project',
        condition: { impactMax: 2.5, effortMin: 2.5, effortMax: 3.5 },
        targetSize: 'S',
        priority: 60
      },
      {
        name: 'Questionable Investment',
        condition: { impactMax: 2.5, effortMin: 3.5, effortMax: 4.5 },
        targetSize: 'M',
        priority: 55
      },
      
      // TIER 6: Money Pits & Poor Investments (Lowest Priority)
      {
        name: 'Low-Value Money Pit',
        condition: { impactMax: 2.5, effortMin: 4.5 },
        targetSize: 'XL',
        priority: 40
      },
      {
        name: 'Major Money Pit',
        condition: { impactMax: 1.5, effortMin: 3.5 },
        targetSize: 'XL',
        priority: 35
      },
      
      // TIER 7: Minor Tasks (Catch-All)
      {
        name: 'Minor Enhancement',
        condition: { impactMin: 2.0, effortMax: 1.5 },
        targetSize: 'XS',
        priority: 30
      },
      {
        name: 'Small Maintenance',
        condition: { impactMax: 2.0, effortMax: 2.5 },
        targetSize: 'XS',
        priority: 25
      },
      {
        name: 'Low-Value Work',
        condition: { impactMax: 1.5, effortMax: 3.5 },
        targetSize: 'S',
        priority: 20
      },
      
      // FINAL FALLBACK: Absolute Minimum
      {
        name: 'Trivial Task',
        condition: {},
        targetSize: 'XS',
        priority: 10
      }
    ],
    benefitMultipliers: {
      'XS': 20000,  // £4K per impact point - minor fixes, quick enhancements
      'S': 40000,   // £8K per impact point - quick wins, small projects  
      'M': 75000,   // £15K per impact point - standard medium projects
      'L': 150000,  // £30K per impact point - large strategic initiatives
      'XL': 300000  // £60K per impact point - major transformations
    },
    benefitRangePct: 0.20
  };
}

/**
 * Governance Gate Calculation Utilities
 * Foundation Layer: Operating Model → Intake & Prioritization → Responsible AI → Activation
 */

export interface GovernanceGateStatus {
  gate: 'operating_model' | 'intake' | 'rai';
  name: string;
  passed: boolean;
  completedFields: string[];
  missingFields: string[];
  progress: number; // 0-100
}

export interface GovernanceStatus {
  operatingModel: GovernanceGateStatus;
  intake: GovernanceGateStatus;
  rai: GovernanceGateStatus;
  allPassed: boolean;
  overallProgress: number; // 0-100
  canActivate: boolean;
  status: 'none' | 'pending' | 'in_review' | 'complete';
}

/**
 * Calculate Operating Model gate status
 * Required: primaryBusinessOwner, useCaseStatus (not Discovery), businessFunction
 */
export function calculateOperatingModelGate(useCase: any): GovernanceGateStatus {
  // Helper to check if a string value is present and non-empty
  const isNonEmptyString = (v: any): boolean => {
    return typeof v === 'string' && v.trim() !== '';
  };

  const requiredFields = [
    { key: 'primaryBusinessOwner', label: 'Primary Business Owner', validator: isNonEmptyString },
    { 
      key: 'useCaseStatus', 
      label: 'Use Case Status (not Discovery)', 
      validator: (v: any) => {
        // Must be a non-empty string AND not equal to 'Discovery' (case-insensitive, trimmed)
        if (!isNonEmptyString(v)) return false;
        return v.trim().toLowerCase() !== 'discovery';
      }
    },
    { key: 'businessFunction', label: 'Business Function', validator: isNonEmptyString }
  ];

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = useCase[field.key];
    const isComplete = field.validator(value);
    
    if (isComplete) {
      completedFields.push(field.label);
    } else {
      missingFields.push(field.label);
    }
  });

  const progress = Math.round((completedFields.length / requiredFields.length) * 100);

  return {
    gate: 'operating_model',
    name: 'Operating Model',
    passed: missingFields.length === 0,
    completedFields,
    missingFields,
    progress
  };
}

/**
 * Calculate Intake & Prioritization gate status
 * Required: All 10 scoring levers must be set to valid scores (1-5)
 * Scores of 0 are considered incomplete (not yet scored by user)
 */
export function calculateIntakeGate(useCase: any): GovernanceGateStatus {
  // Helper to validate scoring lever value - must be explicitly set to 1-5
  const isValidScore = (v: any): boolean => {
    if (v === null || v === undefined) return false;
    const num = typeof v === 'number' ? v : parseFloat(String(v));
    // Must be >= 1 AND <= 5 (0 is default/unscored)
    return !isNaN(num) && num >= 1 && num <= 5;
  };

  const impactFields = [
    { key: 'revenueImpact', label: 'Revenue Impact' },
    { key: 'costSavings', label: 'Cost Savings' },
    { key: 'riskReduction', label: 'Risk Reduction' },
    { key: 'brokerPartnerExperience', label: 'Broker/Partner Experience' },
    { key: 'strategicFit', label: 'Strategic Fit' }
  ];

  const effortFields = [
    { key: 'dataReadiness', label: 'Data Readiness' },
    { key: 'technicalComplexity', label: 'Technical Complexity' },
    { key: 'changeImpact', label: 'Change Impact' },
    { key: 'modelRisk', label: 'Model Risk' },
    { key: 'adoptionReadiness', label: 'Adoption Readiness' }
  ];

  const allFields = [...impactFields, ...effortFields];
  const completedFields: string[] = [];
  const missingFields: string[] = [];

  allFields.forEach(field => {
    const value = useCase[field.key];
    const isComplete = isValidScore(value);
    
    if (isComplete) {
      completedFields.push(field.label);
    } else {
      missingFields.push(field.label);
    }
  });

  const progress = Math.round((completedFields.length / allFields.length) * 100);

  return {
    gate: 'intake',
    name: 'Intake & Prioritization',
    passed: missingFields.length === 0,
    completedFields,
    missingFields,
    progress
  };
}

/**
 * Calculate Responsible AI gate status
 * Required: All 5 RAI fields must be explicitly answered
 * Boolean fields must be 'true' or 'false', select fields must have a valid selection
 */
export function calculateRAIGate(useCase: any): GovernanceGateStatus {
  // Helper to check if a boolean string field is explicitly answered
  // Accepts both 'true'/'false' strings AND actual booleans for backend compatibility
  const isBooleanStringSet = (v: any): boolean => {
    if (typeof v === 'boolean') return true;
    return v === 'true' || v === 'false';
  };

  // Helper to check if a select field has a valid non-empty value
  const isSelectFieldSet = (v: any): boolean => {
    if (typeof v !== 'string') return false;
    const trimmed = v.trim();
    return trimmed !== '' && trimmed !== 'undefined' && trimmed !== 'null';
  };

  const requiredFields = [
    { key: 'explainabilityRequired', label: 'Explainability Required', validator: isBooleanStringSet },
    { key: 'customerHarmRisk', label: 'Customer Harm Risk', validator: isSelectFieldSet },
    { key: 'humanAccountability', label: 'Human Accountability', validator: isBooleanStringSet },
    { key: 'dataOutsideUkEu', label: 'Data Outside UK/EU', validator: isBooleanStringSet },
    { key: 'thirdPartyModel', label: 'Third Party Model', validator: isBooleanStringSet }
  ];

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = useCase[field.key];
    const isComplete = field.validator(value);
    
    if (isComplete) {
      completedFields.push(field.label);
    } else {
      missingFields.push(field.label);
    }
  });

  const progress = Math.round((completedFields.length / requiredFields.length) * 100);

  return {
    gate: 'rai',
    name: 'Responsible AI',
    passed: missingFields.length === 0,
    completedFields,
    missingFields,
    progress
  };
}

/**
 * Calculate complete governance status for a use case
 * Returns status of all 3 gates and overall activation eligibility
 * 
 * SEQUENTIAL GATING: Gates must be completed in order:
 * 1. Operating Model must pass before Intake can show as complete
 * 2. Intake must pass (and Operating Model) before RAI can show as complete
 */
export function calculateGovernanceStatus(useCase: any): GovernanceStatus {
  // Calculate raw gate status (independent of sequence)
  const operatingModelRaw = calculateOperatingModelGate(useCase);
  const intakeRaw = calculateIntakeGate(useCase);
  const raiRaw = calculateRAIGate(useCase);

  // Apply sequential gating - gates can only be "passed" if prior gates are complete
  // Operating Model is the first gate - no modification needed
  const operatingModel = operatingModelRaw;
  
  // Intake can only be "passed" if Operating Model is also passed
  const intake: GovernanceGateStatus = {
    ...intakeRaw,
    passed: operatingModel.passed && intakeRaw.passed
  };
  
  // RAI can only be "passed" if both Operating Model and Intake are passed
  const rai: GovernanceGateStatus = {
    ...raiRaw,
    passed: operatingModel.passed && intakeRaw.passed && raiRaw.passed
  };

  const allPassed = operatingModel.passed && intake.passed && rai.passed;
  const overallProgress = Math.round((operatingModel.progress + intakeRaw.progress + raiRaw.progress) / 3);

  // Determine status based on gate completion
  let status: 'none' | 'pending' | 'in_review' | 'complete' = 'none';
  if (allPassed) {
    status = 'complete';
  } else if (operatingModel.passed || intake.passed || rai.passed) {
    status = 'in_review';
  } else if (operatingModel.progress > 0 || intakeRaw.progress > 0 || raiRaw.progress > 0) {
    status = 'pending';
  }

  return {
    operatingModel,
    intake,
    rai,
    allPassed,
    overallProgress,
    canActivate: allPassed,
    status
  };
}

/**
 * Get a simple governance status string for database storage
 */
export function getGovernanceStatusString(useCase: any): 'none' | 'pending' | 'in_review' | 'complete' {
  return calculateGovernanceStatus(useCase).status;
}