import { Router } from "express";
import { db } from "../db";
import { useCases, responseSessions } from "@shared/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { z } from "zod";

const router = Router();

/**
 * Assessment-to-UseCase Bridge API
 * Connects assessment results to actionable use case recommendations
 * Analyzes maturity gaps and recommends relevant use cases
 */

// Request schema for generating recommendations
const generateRecommendationsSchema = z.object({
  responseId: z.string().uuid(),
  criteriaWeights: z.object({
    maturityGaps: z.number().min(0).max(1).default(0.4),
    strategicAlignment: z.number().min(0).max(1).default(0.3),
    implementationReadiness: z.number().min(0).max(1).default(0.3)
  }).optional()
});

/**
 * POST /api/assessments/:responseId/recommendations
 * Analyze assessment scores and recommend relevant use cases based on maturity gaps
 */
router.post("/:responseId/recommendations", async (req, res) => {
  try {
    const { responseId } = req.params;
    const body = generateRecommendationsSchema.parse({
      responseId,
      ...req.body
    });

    // Validate that the response exists and is completed
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) {
      return res.status(404).json({ 
        error: "Assessment response not found" 
      });
    }

    if (response.status !== "completed") {
      return res.status(400).json({ 
        error: "Assessment must be completed before generating recommendations" 
      });
    }

    // Get assessment scores for gap analysis
    const assessmentAnswers = await db
      .select({
        questionId: questionAnswers.questionId,
        value: questionAnswers.answerValue,
        score: questionAnswers.score,
        questionType: questions.questionType,
        sectionId: questions.sectionId
      })
      .from(questionAnswers)
      .innerJoin(questions, eq(questionAnswers.questionId, questions.id))
      .where(eq(questionAnswers.responseId, responseId));

    // Calculate maturity scores by section/dimension
    const maturityAnalysis = analyzeMaturityGaps(assessmentAnswers);

    // Get all use cases for recommendation analysis
    const allUseCases = await db.select().from(useCases);

    // Generate recommendations based on maturity gaps and criteria
    const recommendations = generateUseCaseRecommendations(
      allUseCases,
      maturityAnalysis,
      body.criteriaWeights || {}
    );

    // Update recommended use cases in database
    if (recommendations.recommendedUseCases.length > 0) {
      await db
        .update(useCases)
        .set({ recommendedByAssessment: responseId })
        .where(inArray(useCases.id, recommendations.recommendedUseCases.map(r => r.id)));
    }

    // Clear previous recommendations for this response
    await db
      .update(useCases)
      .set({ recommendedByAssessment: null })
      .where(and(
        eq(useCases.recommendedByAssessment, responseId),
        sql`${useCases.id} NOT IN (${recommendations.recommendedUseCases.map(r => `'${r.id}'`).join(',')})`
      ));

    res.json({
      responseId,
      maturityAnalysis,
      recommendations: {
        total: recommendations.recommendedUseCases.length,
        highPriority: recommendations.recommendedUseCases.filter(r => r.priority === 'high').length,
        mediumPriority: recommendations.recommendedUseCases.filter(r => r.priority === 'medium').length,
        lowPriority: recommendations.recommendedUseCases.filter(r => r.priority === 'low').length,
        useCases: recommendations.recommendedUseCases
      },
      criteria: body.criteriaWeights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating use case recommendations:", error);
    res.status(500).json({ 
      error: "Failed to generate recommendations",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/assessments/:responseId/recommendations
 * Get existing recommendations for an assessment
 */
router.get("/:responseId/recommendations", async (req, res) => {
  try {
    const { responseId } = req.params;

    // Get recommended use cases for this assessment
    const recommendedUseCases = await db
      .select()
      .from(useCases)
      .where(eq(useCases.recommendedByAssessment, responseId))
      .orderBy(desc(useCases.impactScore));

    // Get assessment response details
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) {
      return res.status(404).json({ 
        error: "Assessment response not found" 
      });
    }

    res.json({
      responseId,
      response: {
        status: response.status,
        completedAt: response.completedAt,
        totalScore: response.totalScore
      },
      recommendations: {
        total: recommendedUseCases.length,
        useCases: recommendedUseCases.map(useCase => ({
          id: useCase.id,
          title: useCase.title,
          description: useCase.description,
          quadrant: useCase.quadrant,
          impactScore: useCase.impactScore,
          effortScore: useCase.effortScore,
          process: useCase.process,
          businessSegment: useCase.businessSegment,
          recommendedByAssessment: useCase.recommendedByAssessment
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ 
      error: "Failed to fetch recommendations",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * DELETE /api/assessments/:responseId/recommendations
 * Clear all recommendations for an assessment
 */
router.delete("/:responseId/recommendations", async (req, res) => {
  try {
    const { responseId } = req.params;

    // Clear recommendations
    await db
      .update(useCases)
      .set({ recommendedByAssessment: null })
      .where(eq(useCases.recommendedByAssessment, responseId));

    res.status(204).send();

  } catch (error) {
    console.error("Error clearing recommendations:", error);
    res.status(500).json({ 
      error: "Failed to clear recommendations",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Helper function to analyze maturity gaps from assessment responses
function analyzeMaturityGaps(assessmentAnswers: any[]) {
  const sectionScores: Record<string, { total: number; count: number; average: number }> = {};
  
  // Calculate average scores by section
  assessmentAnswers.forEach(answer => {
    if (answer.score !== null) {
      if (!sectionScores[answer.sectionId]) {
        sectionScores[answer.sectionId] = { total: 0, count: 0, average: 0 };
      }
      sectionScores[answer.sectionId].total += answer.score;
      sectionScores[answer.sectionId].count += 1;
    }
  });

  // Calculate averages and identify gaps
  const maturityGaps = [];
  let overallAverage = 0;
  let totalSections = 0;

  for (const [sectionId, scores] of Object.entries(sectionScores)) {
    scores.average = scores.total / scores.count;
    overallAverage += scores.average;
    totalSections++;

    // Identify gaps (scores below 3.0 are considered gaps)
    if (scores.average < 3.0) {
      maturityGaps.push({
        section: sectionId,
        score: scores.average,
        gapSeverity: scores.average < 2.0 ? 'critical' : scores.average < 2.5 ? 'major' : 'minor'
      });
    }
  }

  overallAverage = overallAverage / totalSections;

  return {
    overallAverage,
    sectionScores,
    maturityGaps,
    totalSections,
    gapCount: maturityGaps.length
  };
}

// Helper function to generate use case recommendations
function generateUseCaseRecommendations(
  useCases: any[],
  maturityAnalysis: any,
  criteriaWeights: any
) {
  const recommendedUseCases = [];

  for (const useCase of useCases) {
    const recommendation = evaluateUseCaseForRecommendation(useCase, maturityAnalysis, criteriaWeights);
    
    if (recommendation.shouldRecommend) {
      recommendedUseCases.push({
        ...useCase,
        recommendationScore: recommendation.score,
        priority: recommendation.priority,
        reasoning: recommendation.reasoning
      });
    }
  }

  // Sort by recommendation score (highest first)
  recommendedUseCases.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Limit to top 10 recommendations
  return {
    recommendedUseCases: recommendedUseCases.slice(0, 10)
  };
}

// Helper function to evaluate individual use cases for recommendation
function evaluateUseCaseForRecommendation(useCase: any, maturityAnalysis: any, criteriaWeights: any) {
  let score = 0;
  const reasoning = [];
  
  // Factor 1: Maturity Gap Alignment (40% weight by default)
  const maturityGapScore = calculateMaturityGapAlignment(useCase, maturityAnalysis);
  score += maturityGapScore * (criteriaWeights.maturityGaps || 0.4);
  
  if (maturityGapScore > 0.7) {
    reasoning.push("Addresses identified maturity gaps");
  }

  // Factor 2: Strategic Alignment (30% weight by default)  
  const strategicScore = calculateStrategicAlignment(useCase, maturityAnalysis);
  score += strategicScore * (criteriaWeights.strategicAlignment || 0.3);
  
  if (strategicScore > 0.7) {
    reasoning.push("High strategic value and business impact");
  }

  // Factor 3: Implementation Readiness (30% weight by default)
  const readinessScore = calculateImplementationReadiness(useCase, maturityAnalysis);
  score += readinessScore * (criteriaWeights.implementationReadiness || 0.3);
  
  if (readinessScore > 0.7) {
    reasoning.push("High implementation feasibility");
  }

  // Determine priority and recommendation threshold
  let priority = 'low';
  let shouldRecommend = score > 0.6; // Threshold for recommendation

  if (score > 0.8) {
    priority = 'high';
  } else if (score > 0.7) {
    priority = 'medium';
  }

  return {
    score,
    priority,
    shouldRecommend,
    reasoning
  };
}

// Calculate how well a use case addresses maturity gaps
function calculateMaturityGapAlignment(useCase: any, maturityAnalysis: any): number {
  let alignment = 0;
  const gaps = maturityAnalysis.maturityGaps;
  
  if (gaps.length === 0) return 0.5; // No gaps means moderate alignment
  
  // Use case categories that address specific maturity gaps
  const gapAddressingCategories = {
    'AI Strategy': ['strategic', 'governance', 'leadership'],
    'Data Management': ['data', 'analytics', 'quality'],
    'Technology': ['technical', 'infrastructure', 'platform'],
    'Risk & Ethics': ['risk', 'compliance', 'ethics'],
    'Talent': ['skills', 'training', 'capability']
  };

  // Check if use case addresses critical gaps
  gaps.forEach((gap: any) => {
    if (gap.gapSeverity === 'critical') {
      alignment += 0.3; // High weight for critical gaps
    } else if (gap.gapSeverity === 'major') {
      alignment += 0.2; // Medium weight for major gaps  
    } else {
      alignment += 0.1; // Low weight for minor gaps
    }
  });

  return Math.min(alignment, 1.0);
}

// Calculate strategic alignment based on business value
function calculateStrategicAlignment(useCase: any, maturityAnalysis: any): number {
  // Higher impact scores indicate better strategic alignment
  const impactNormalized = Math.min(useCase.impactScore / 5.0, 1.0);
  
  // Quick wins (high impact, low effort) get bonus points
  const quickWinBonus = useCase.quadrant === 'Quick Win' ? 0.2 : 0;
  
  return Math.min(impactNormalized + quickWinBonus, 1.0);
}

// Calculate implementation readiness based on effort and maturity
function calculateImplementationReadiness(useCase: any, maturityAnalysis: any): number {
  // Lower effort scores indicate higher readiness
  const effortNormalized = 1.0 - Math.min(useCase.effortScore / 5.0, 1.0);
  
  // Adjust based on overall maturity (higher maturity = higher readiness)
  const maturityBonus = maturityAnalysis.overallAverage > 3.0 ? 0.2 : 0;
  
  return Math.min(effortNormalized + maturityBonus, 1.0);
}

export default router;