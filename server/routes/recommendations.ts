import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { useCases } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Schema for applying recommendations
const applyRecommendationsSchema = z.object({
  assessmentId: z.string(),
  useCaseIds: z.array(z.string()),
  reasoning: z.record(z.string()) // useCase.id -> reasoning string
});

/**
 * Apply recommendations by updating use cases with assessment ID
 */
router.post('/apply', async (req, res) => {
  try {
    const { assessmentId, useCaseIds, reasoning } = applyRecommendationsSchema.parse(req.body);

    // Update use cases to mark them as recommended by this assessment
    for (const useCaseId of useCaseIds) {
      await db
        .update(useCases)
        .set({ 
          recommendedByAssessment: assessmentId
          // Note: metadata field could be added to schema if reasoning storage is needed
        })
        .where(eq(useCases.id, useCaseId));
    }

    res.json({ 
      success: true, 
      message: `Applied recommendations for ${useCaseIds.length} use cases`,
      assessmentId,
      recommendedCount: useCaseIds.length
    });
  } catch (error) {
    console.error('Error applying recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to apply recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clear existing recommendations for an assessment
 */
router.post('/clear/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Clear recommendations by setting recommendedByAssessment to null
    await db
      .update(useCases)
      .set({ 
        recommendedByAssessment: null
      })
      .where(eq(useCases.recommendedByAssessment, assessmentId));

    res.json({ 
      success: true, 
      message: `Cleared recommendations for assessment ${assessmentId}`
    });
  } catch (error) {
    console.error('Error clearing recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to clear recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all recommendations for an assessment
 */
router.get('/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const recommendedUseCases = await db
      .select()
      .from(useCases)
      .where(eq(useCases.recommendedByAssessment, assessmentId));

    res.json({
      assessmentId,
      recommendedUseCases,
      count: recommendedUseCases.length
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;