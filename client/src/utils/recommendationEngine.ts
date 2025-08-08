/**
 * RSA AI Use Case Recommendation Engine
 * Analyzes assessment results and matches low-scoring areas to relevant use cases
 */

import { UseCase } from '../types';

export interface MaturityScores {
  responseId: string;
  overallScore: number;
  aiStrategyMaturity: number;
  primaryFocusArea: string;
  averageByCategory: {
    strategy: number;
    governance: number;
    implementation: number;
  };
}

export interface RecommendationResult {
  recommendedUseCases: string[]; // Use case IDs
  reasoningMap: Record<string, string>; // Use case ID -> reasoning
  focusAreas: string[];
}

/**
 * Core recommendation engine that analyzes assessment scores
 * and identifies relevant use cases based on maturity gaps
 */
export function generateRecommendations(
  scores: MaturityScores,
  useCases: UseCase[]
): RecommendationResult {
  const recommendations: string[] = [];
  const reasoningMap: Record<string, string> = {};
  const focusAreas: string[] = [];

  // Identify low-scoring areas that need improvement
  const maturityThreshold = 3.0; // Scores below this indicate improvement opportunities
  
  // Focus area mapping from assessment to use case categories
  const focusAreaMappings: Record<string, string[]> = {
    'automation': ['Claims Processing', 'Underwriting', 'Policy Administration'],
    'customer_experience': ['Customer Experience', 'Broker Experience', 'Digital Services'],
    'risk_management': ['Risk Assessment', 'Fraud Detection', 'Compliance']
  };

  // Business value categories for matching
  const businessValueCategories = {
    'Revenue Generation': ['Revenue', 'Growth', 'Sales'],
    'Cost Optimization': ['Cost', 'Efficiency', 'Automation'],
    'Risk Management': ['Risk', 'Compliance', 'Security', 'Fraud'],
    'Customer Experience': ['Customer', 'Experience', 'Service', 'Satisfaction']
  };

  // 1. Match primary focus area from assessment
  if (scores.primaryFocusArea && focusAreaMappings[scores.primaryFocusArea]) {
    focusAreas.push(...focusAreaMappings[scores.primaryFocusArea]);
  }

  // 2. Identify low maturity areas for targeted recommendations
  if (scores.aiStrategyMaturity < maturityThreshold) {
    focusAreas.push('Strategic Planning', 'Governance');
  }

  if (scores.averageByCategory.implementation < maturityThreshold) {
    focusAreas.push('Process Automation', 'Technical Implementation');
  }

  if (scores.averageByCategory.governance < maturityThreshold) {
    focusAreas.push('Risk Management', 'Compliance');
  }

  // 3. Match use cases based on focus areas and business context
  useCases.forEach(useCase => {
    let matchScore = 0;
    let reasoning = '';

    // Match by primary focus area
    if (scores.primaryFocusArea === 'automation' && 
        (useCase.title.toLowerCase().includes('automat') || 
         useCase.description.toLowerCase().includes('automat') ||
         (useCase.valueChainComponent || useCase.process).toLowerCase().includes('process'))) {
      matchScore += 0.4;
      reasoning = `Matches your automation focus area and process improvement needs`;
    }

    if (scores.primaryFocusArea === 'customer_experience' && 
        (useCase.title.toLowerCase().includes('customer') || 
         useCase.title.toLowerCase().includes('experience') ||
         useCase.description.toLowerCase().includes('customer'))) {
      matchScore += 0.4;
      reasoning = `Aligns with your customer experience improvement goals`;
    }

    if (scores.primaryFocusArea === 'risk_management' && 
        (useCase.title.toLowerCase().includes('risk') || 
         useCase.title.toLowerCase().includes('fraud') ||
         useCase.description.toLowerCase().includes('risk'))) {
      matchScore += 0.4;
      reasoning = `Addresses your risk management and compliance priorities`;
    }

    // Match by maturity gaps
    if (scores.aiStrategyMaturity < maturityThreshold && useCase.quadrant === 'Quick Win') {
      matchScore += 0.3;
      reasoning += reasoning ? ' and provides quick wins for AI strategy development' : 
        'Recommended as a quick win to build AI strategy maturity';
    }

    if (scores.averageByCategory.implementation < maturityThreshold && 
        (useCase.title.toLowerCase().includes('automat') || 
         (useCase.valueChainComponent || useCase.process).toLowerCase().includes('operation'))) {
      matchScore += 0.2;
      reasoning += reasoning ? ' and helps improve implementation capabilities' : 
        'Helps build implementation experience and operational maturity';
    }

    // Prioritize Quick Wins for organizations with lower overall maturity
    if (scores.overallScore < 60 && useCase.quadrant === 'Quick Win') {
      matchScore += 0.3;
      reasoning += reasoning ? ' with high impact and low complexity' : 
        'Quick win opportunity ideal for building AI confidence';
    }

    // Add use case if it meets minimum match threshold
    if (matchScore >= 0.3) {
      recommendations.push(useCase.id);
      reasoningMap[useCase.id] = reasoning;
    }
  });

  // Limit to top 6 recommendations to avoid overwhelming users
  const topRecommendations = recommendations.slice(0, 6);
  const filteredReasoningMap = Object.fromEntries(
    topRecommendations.map(id => [id, reasoningMap[id]])
  );

  return {
    recommendedUseCases: topRecommendations,
    reasoningMap: filteredReasoningMap,
    focusAreas: Array.from(new Set(focusAreas)) // Remove duplicates with Array.from for compatibility
  };
}

/**
 * Updates use cases in database with recommendation flags
 */
export async function applyRecommendations(
  assessmentId: string,
  recommendationResult: RecommendationResult
): Promise<void> {
  try {
    // First, clear existing recommendations for this assessment
    await fetch(`/api/recommendations/clear/${assessmentId}`, {
      method: 'POST'
    });

    // Then apply new recommendations
    await fetch('/api/recommendations/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assessmentId,
        useCaseIds: recommendationResult.recommendedUseCases,
        reasoning: recommendationResult.reasoningMap
      })
    });
  } catch (error) {
    console.error('Failed to apply recommendations:', error);
    throw error;
  }
}

/**
 * Helper function to get recommendation reasoning for display
 */
export function getRecommendationReason(useCase: UseCase, scores: MaturityScores): string {
  if (!useCase.recommendedByAssessment) return '';
  
  // Generate contextual reasoning based on use case and scores
  const focusAreaMatch = scores.primaryFocusArea === 'automation' && 
    useCase.title.toLowerCase().includes('automat');
  
  const maturityMatch = scores.overallScore < 60 && useCase.quadrant === 'Quick Win';
  
  if (focusAreaMatch && maturityMatch) {
    return `Recommended based on your ${scores.primaryFocusArea} focus and as a quick win for AI maturity building`;
  } else if (focusAreaMatch) {
    return `Matches your primary focus area: ${scores.primaryFocusArea}`;
  } else if (maturityMatch) {
    return `Quick win opportunity ideal for your current AI maturity level`;
  }
  
  return 'Recommended based on your assessment results';
}