/**
 * ROI Explanation Utilities
 * Provides contextual explanations for why ROI is rated as High/Medium/Low
 * without modifying any scoring logic
 */

export interface ROIExplanation {
  level: 'High ROI' | 'Medium ROI' | 'Low ROI' | 'Poor ROI';
  summary: string;
  factors: string[];
  timeframe: string;
  recommendation: string;
}

/**
 * Generate ROI explanation based on quadrant and scores
 */
export function generateROIExplanation(
  impactScore: number,
  effortScore: number,
  quadrant: string
): ROIExplanation {
  // Determine ROI level based on quadrant and scores
  const roiLevel = determineROILevel(impactScore, effortScore, quadrant);
  
  switch (quadrant) {
    case 'Quick Win':
      return {
        level: 'High ROI',
        summary: 'High business value with relatively low implementation effort creates excellent return potential.',
        factors: [
          `Strong impact score (${impactScore.toFixed(1)}/5) indicates significant business value`,
          `Lower effort score (${effortScore.toFixed(1)}/5) means faster, cheaper implementation`,
          'Minimal risk with quick payback period',
          'Resources can be deployed efficiently'
        ],
        timeframe: '3-9 months to realize returns',
        recommendation: 'Prioritize immediately - ideal for demonstrating AI value quickly'
      };

    case 'Strategic Bet':
      return {
        level: 'High ROI',
        summary: 'Significant long-term value justifies higher implementation investment and complexity.',
        factors: [
          `High impact score (${impactScore.toFixed(1)}/5) promises substantial business transformation`,
          `Higher effort score (${effortScore.toFixed(1)}/5) reflects complexity but not impossibility`,
          'Long-term competitive advantage potential',
          'Scales across multiple business areas'
        ],
        timeframe: '12-24 months for full value realization',
        recommendation: 'Plan carefully with adequate resources - high strategic importance'
      };

    case 'Experimental':
      return {
        level: 'Medium ROI',
        summary: 'Lower business impact but manageable effort makes this suitable for learning and capability building.',
        factors: [
          `Moderate impact score (${impactScore.toFixed(1)}/5) offers incremental benefits`,
          `Lower effort score (${effortScore.toFixed(1)}/5) allows for cost-effective testing`,
          'Good for building AI capabilities and experience',
          'Low risk of major resource drain'
        ],
        timeframe: '6-12 months with learning benefits',
        recommendation: 'Consider for skill development or as stepping stone to larger initiatives'
      };

    case 'Watchlist':
      return {
        level: 'Poor ROI',
        summary: 'Low business value combined with high implementation effort creates poor return prospects.',
        factors: [
          `Lower impact score (${impactScore.toFixed(1)}/5) limits business value creation`,
          `High effort score (${effortScore.toFixed(1)}/5) requires significant resources`,
          'Risk of resource drain with minimal benefit',
          'Opportunity cost of not pursuing better alternatives'
        ],
        timeframe: '18+ months with uncertain returns',
        recommendation: 'Defer or redesign - focus resources on higher-value opportunities'
      };

    default:
      return {
        level: 'Medium ROI',
        summary: 'Balanced scores suggest moderate return potential requiring careful evaluation.',
        factors: [
          `Impact score of ${impactScore.toFixed(1)}/5 indicates moderate business value`,
          `Effort score of ${effortScore.toFixed(1)}/5 suggests manageable complexity`,
          'Consider specific business context and strategic priorities'
        ],
        timeframe: '6-18 months depending on execution',
        recommendation: 'Evaluate against business priorities and available resources'
      };
  }
}

/**
 * Determine ROI level based on scores and quadrant
 */
function determineROILevel(
  impactScore: number,
  effortScore: number,
  quadrant: string
): 'High ROI' | 'Medium ROI' | 'Low ROI' | 'Poor ROI' {
  // ROI is essentially Impact/Effort ratio
  const roiRatio = impactScore / Math.max(effortScore, 0.1); // Avoid division by zero
  
  if (quadrant === 'Quick Win' || quadrant === 'Strategic Bet') {
    return 'High ROI';
  } else if (quadrant === 'Experimental' || roiRatio >= 0.8) {
    return 'Medium ROI';
  } else if (roiRatio >= 0.5) {
    return 'Low ROI';
  } else {
    return 'Poor ROI';
  }
}

/**
 * Get weight impact explanation for scoring configuration
 */
export function getWeightImpactExplanation(leverName: string, weight: number): string {
  const impact = weight > 30 ? 'high' : weight > 15 ? 'moderate' : 'low';
  
  const leverDescriptions: Record<string, string> = {
    'Revenue Impact': 'direct revenue generation and market expansion',
    'Cost Savings': 'operational efficiency and cost reduction',
    'Risk Reduction': 'compliance, security, and operational risk mitigation',
    'Broker Partner Experience': 'partner satisfaction and relationship enhancement',
    'Strategic Fit': 'alignment with long-term business strategy',
    'Data Readiness': 'availability and quality of required data',
    'Technical Complexity': 'implementation difficulty and technical challenges',
    'Change Impact': 'organizational change and adoption requirements',
    'Model Risk': 'AI model reliability and governance requirements',
    'Adoption Readiness': 'user acceptance and change management needs'
  };

  const description = leverDescriptions[leverName] || 'business factor evaluation';
  
  return `${weight}% weighting gives ${impact} priority to ${description} in ROI calculations.`;
}

/**
 * Get quadrant threshold explanation
 */
export function getQuadrantThresholdExplanation(threshold: number): string {
  return `Threshold of ${threshold.toFixed(1)} determines ROI categorization:
  
• **High ROI** (Quick Win/Strategic Bet): Use cases with Impact ≥ ${threshold.toFixed(1)}
• **Medium ROI** (Experimental): Use cases with both Impact and Effort < ${threshold.toFixed(1)}  
• **Poor ROI** (Watchlist): Use cases with Impact < ${threshold.toFixed(1)} but Effort ≥ ${threshold.toFixed(1)}

Higher threshold = more selective ROI requirements
Lower threshold = more use cases qualify for high ROI rating`;
}

/**
 * Get scoring formula explanation in plain English
 */
export function getScoringFormulaExplanation(): {
  impactFormula: string;
  effortFormula: string;
  roiConcept: string;
} {
  return {
    impactFormula: 'Impact Score = Weighted average of 5 business value factors (Revenue, Cost Savings, Risk Reduction, Partner Experience, Strategic Fit). Higher scores mean greater business value potential.',
    
    effortFormula: 'Effort Score = Weighted average of 5 feasibility factors (Data Readiness, Technical Complexity, Change Impact, Model Risk, Adoption Readiness). Higher scores mean easier implementation.',
    
    roiConcept: 'ROI Potential = Impact ÷ Effort ratio. High impact with lower effort = High ROI (Quick Win). High impact with high effort = High ROI but longer timeframe (Strategic Bet).'
  };
}