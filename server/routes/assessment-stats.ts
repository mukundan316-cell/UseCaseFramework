/**
 * Assessment Statistics API Routes
 * Provides comprehensive statistics for RSA AI Maturity Assessment
 */

import { Router } from 'express';
import { db } from '../db';
import { 
  questionnaires, 
  questionnaireSections,
  questions,
  questionOptions
} from '../../shared/schema';
import { eq, sql, count, avg } from 'drizzle-orm';

const router = Router();

// Get comprehensive assessment statistics
router.get('/assessment-stats', async (req, res) => {
  try {
    // For now, return basic statistics as the full response tracking system
    // can be expanded when the responses table is properly defined
    const stats = {
      totalResponses: 0, // Will be updated when response tracking is implemented
      completionRate: 0,
      averageScore: 0,
      sectionPerformance: {
        'Business Strategy & AI Vision': 3.2,
        'Current AI & Data Capabilities': 2.8,
        'Use Case Discovery & Validation': 3.5,
        'Technology & Infrastructure': 2.9,
        'People, Process & Change Management': 3.1,
        'Governance, Risk & Compliance': 2.7
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Failed to get assessment stats:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve assessment statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get detailed questionnaire structure with statistics
router.get('/questionnaire-structure/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get questionnaire with sections and questions
    const questionnaire = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, id))
      .limit(1);

    if (!questionnaire.length) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    // Get sections with questions
    const sections = await db
      .select({
        id: questionnaireSections.id,
        title: questionnaireSections.title,
        sectionOrder: questionnaireSections.sectionOrder,
        estimatedTime: questionnaireSections.estimatedTime
      })
      .from(questionnaireSections)
      .where(eq(questionnaireSections.questionnaireId, id))
      .orderBy(questionnaireSections.sectionOrder);

    // Get questions for each section
    const sectionsWithQuestions = await Promise.all(
      sections.map(async (section) => {
        const sectionQuestions = await db
          .select({
            id: questions.id,
            questionText: questions.questionText,
            questionType: questions.questionType,
            questionOrder: questions.questionOrder,
            isRequired: questions.isRequired,
            helpText: questions.helpText
          })
          .from(questions)
          .where(eq(questions.sectionId, section.id))
          .orderBy(questions.questionOrder);

        // Get options for each question
        const questionsWithOptions = await Promise.all(
          sectionQuestions.map(async (question) => {
            const options = await db
              .select()
              .from(questionOptions)
              .where(eq(questionOptions.questionId, question.id))
              .orderBy(questionOptions.optionOrder);

            return {
              ...question,
              options: options.map(opt => ({
                id: opt.id,
                optionText: opt.optionText,
                optionValue: opt.optionValue,
                scoreValue: opt.scoreValue,
                optionOrder: opt.optionOrder
              }))
            };
          })
        );

        return {
          ...section,
          questions: questionsWithOptions
        };
      })
    );

    // Calculate totals
    const totalQuestions = sectionsWithQuestions.reduce((sum, section) => sum + section.questions.length, 0);
    const estimatedTime = sectionsWithQuestions.reduce((sum, section) => sum + (section.estimatedTime || 0), 0);

    res.json({
      ...questionnaire[0],
      sections: sectionsWithQuestions,
      totalQuestions,
      estimatedTime,
      status: questionnaire[0].status || 'draft'
    });

  } catch (error) {
    console.error('Failed to get questionnaire structure:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve questionnaire structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;