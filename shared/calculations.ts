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
} {
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

  // Apply mapping rules in priority order (highest priority first)
  const sortedRules = [...config.mappingRules].sort((a, b) => b.priority - a.priority);
  
  let selectedSize: string | null = null;
  
  for (const rule of sortedRules) {
    const { condition } = rule;
    
    // Check if impact score matches the condition
    const impactMatch = (
      (condition.impactMin === undefined || impactScore >= condition.impactMin) &&
      (condition.impactMax === undefined || impactScore <= condition.impactMax)
    );
    
    // Check if effort score matches the condition
    const effortMatch = (
      (condition.effortMin === undefined || effortScore >= condition.effortMin) &&
      (condition.effortMax === undefined || effortScore <= condition.effortMax)
    );
    
    if (impactMatch && effortMatch) {
      selectedSize = rule.targetSize;
      break;
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
      teamSizeEstimate: null
    };
  }
  
  // Calculate cost estimates based on team size and rates
  const dailyTeamCost = calculateDailyTeamCost(config.roles, sizeConfig, config.overheadMultiplier);
  
  const minCost = Math.round(dailyTeamCost * sizeConfig.minWeeks * 5); // 5 working days per week
  const maxCost = Math.round(dailyTeamCost * sizeConfig.maxWeeks * 5);
  
  return {
    size: selectedSize,
    estimatedCostMin: minCost,
    estimatedCostMax: maxCost,
    estimatedWeeksMin: sizeConfig.minWeeks,
    estimatedWeeksMax: sizeConfig.maxWeeks,
    teamSizeEstimate: `${sizeConfig.teamSizeMin}-${sizeConfig.teamSizeMax}`
  };
}

/**
 * Calculates daily team cost based on role rates and team composition
 */
function calculateDailyTeamCost(
  roles: TShirtSizingConfig['roles'],
  sizeConfig: TShirtSizingConfig['sizes'][0],
  overheadMultiplier: number
): number {
  // Use average team size for calculation
  const avgTeamSize = (sizeConfig.teamSizeMin + sizeConfig.teamSizeMax) / 2;
  
  // Calculate weighted average daily rate based on typical team composition
  // For simplicity, use equal distribution across roles for now
  const avgDailyRate = roles.reduce((sum, role) => sum + role.dailyRateGBP, 0) / roles.length;
  
  // Apply team size and overhead multiplier
  return avgDailyRate * avgTeamSize * overheadMultiplier;
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
        minWeeks: 1,
        maxWeeks: 3,
        teamSizeMin: 1,
        teamSizeMax: 2,
        color: '#10B981', // Green
        description: 'Quick fixes and small enhancements'
      },
      {
        name: 'S',
        minWeeks: 2,
        maxWeeks: 6,
        teamSizeMin: 2,
        teamSizeMax: 3,
        color: '#3B82F6', // Blue
        description: 'Small projects and proof of concepts'
      },
      {
        name: 'M',
        minWeeks: 4,
        maxWeeks: 12,
        teamSizeMin: 3,
        teamSizeMax: 5,
        color: '#F59E0B', // Yellow
        description: 'Medium-sized initiatives'
      },
      {
        name: 'L',
        minWeeks: 8,
        maxWeeks: 24,
        teamSizeMin: 5,
        teamSizeMax: 8,
        color: '#EF4444', // Red
        description: 'Large strategic projects'
      },
      {
        name: 'XL',
        minWeeks: 16,
        maxWeeks: 52,
        teamSizeMin: 8,
        teamSizeMax: 12,
        color: '#8B5CF6', // Purple
        description: 'Major transformation initiatives'
      }
    ],
    roles: [
      { type: 'Developer', dailyRateGBP: 400 },
      { type: 'Analyst', dailyRateGBP: 350 },
      { type: 'PM', dailyRateGBP: 500 }
    ],
    overheadMultiplier: 1.35, // 35% overhead for benefits, facilities, management
    mappingRules: [
      {
        name: 'Quick Win - High Impact, Low Effort',
        condition: { impactMin: 3.5, effortMax: 2.5 },
        targetSize: 'S',
        priority: 100
      },
      {
        name: 'Strategic Bet - High Impact, Medium Effort', 
        condition: { impactMin: 3.0, effortMin: 2.5, effortMax: 3.5 },
        targetSize: 'M',
        priority: 90
      },
      {
        name: 'Complex Strategic - High Impact, High Effort',
        condition: { impactMin: 2.5, effortMin: 3.5 },
        targetSize: 'L',
        priority: 80
      },
      {
        name: 'Small Experiment - Low to Medium Impact',
        condition: { impactMax: 3.0, effortMax: 3.0 },
        targetSize: 'XS',
        priority: 70
      }
    ]
  };
}