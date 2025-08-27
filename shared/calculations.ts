/**
 * Calculates impact score using comprehensive RSA framework with weighted scoring
 * Applies configurable weights from database configuration
 * Per RSA AI Framework specification
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
    revenueImpact: 20,
    costSavings: 20,
    riskReduction: 20,
    brokerPartnerExperience: 20,
    strategicFit: 20
  };

  // Apply weighted calculation: (lever × weight) / 100, then sum
  const weightedScore = (
    (safeRevenueImpact * w.revenueImpact / 100) +
    (safeCostSavings * w.costSavings / 100) +
    (safeRiskReduction * w.riskReduction / 100) +
    (safeBrokerPartnerExperience * w.brokerPartnerExperience / 100) +
    (safeStrategicFit * w.strategicFit / 100)
  );

  return Math.max(0, Math.min(5, weightedScore)); // Ensure result is within 0-5 range preserving full precision
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
    dataReadiness: 20,
    technicalComplexity: 20,
    changeImpact: 20,
    modelRisk: 20,
    adoptionReadiness: 20
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
 * Y-axis = Business Value (Impact) - Higher is better
 * X-axis = Implementation Complexity (Effort) - Lower is better (left = easy, right = hard)
 * 
 * Quadrant Mapping (RSA Framework):
 * - Quick Win: impact >= threshold && effort < threshold (Top Left - High Value, Low Complexity - Easy + Valuable)
 * - Strategic Bet: impact >= threshold && effort >= threshold (Top Right - High Value, High Complexity - Hard + Valuable)  
 * - Experimental: impact < threshold && effort < threshold (Bottom Left - Low Value, Low Complexity - Easy + Low Value)
 * - Watchlist: impact < threshold && effort >= threshold (Bottom Right - Low Value, High Complexity - Hard + Low Value)
 */
export function calculateQuadrant(
  impactScore: number, 
  effortScore: number, 
  threshold: number = 3.0
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