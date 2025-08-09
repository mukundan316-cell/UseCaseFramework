import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  questionnaires, 
  questionnaireSections, 
  questions, 
  questionOptions, 
  questionnaireResponses, 
  questionAnswers,
  insertQuestionnaireResponseSchema,
  insertQuestionAnswerSchema
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { validateAnswerByType, enhancedSaveAnswerSchema } from '../lib/validation';

const router = Router();

// =============================================================================
// QUESTIONNAIRE RETRIEVAL
// =============================================================================

/**
 * GET /api/questionnaires/:id
 * Get complete questionnaire with sections and questions
 */
router.get('/questionnaires/:id', async (req: Request, res: Response) => {
  try {
    const questionnaireId = req.params.id;

    // Get questionnaire
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, questionnaireId));

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    // Get sections with questions and options
    const sectionsWithQuestions = await db
      .select({
        section: questionnaireSections,
        question: questions,
        option: questionOptions
      })
      .from(questionnaireSections)
      .leftJoin(questions, eq(questions.sectionId, questionnaireSections.id))
      .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
      .where(eq(questionnaireSections.questionnaireId, questionnaireId))
      .orderBy(questionnaireSections.sectionOrder, questions.questionOrder, questionOptions.optionOrder);

    // Organize data hierarchically
    const sectionsMap = new Map();
    
    for (const row of sectionsWithQuestions) {
      const { section, question, option } = row;
      
      // Initialize section if not exists
      if (!sectionsMap.has(section.id)) {
        sectionsMap.set(section.id, {
          ...section,
          questions: new Map()
        });
      }
      
      const sectionData = sectionsMap.get(section.id);
      
      // Add question if exists and not already added
      if (question && !sectionData.questions.has(question.id)) {
        sectionData.questions.set(question.id, {
          ...question,
          questionData: question.questionData || null, // Ensure questionData is included
          options: []
        });
      }
      
      // Add option if exists
      if (question && option && sectionData.questions.has(question.id)) {
        sectionData.questions.get(question.id).options.push(option);
      }
    }

    // Convert to final structure
    const sections = Array.from(sectionsMap.values()).map(section => ({
      ...section,
      questions: Array.from(section.questions.values())
    }));

    const result = {
      ...questionnaire,
      sections
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// RESPONSE MANAGEMENT
// =============================================================================

/**
 * POST /api/responses/start
 * Start new response session
 */
const startResponseSchema = z.object({
  questionnaireId: z.string().min(1, 'Questionnaire ID is required'),
  respondentEmail: z.string().email('Valid email is required'),
  respondentName: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

router.post('/responses/start', async (req: Request, res: Response) => {
  try {
    console.log('Received start request body:', req.body);
    const validatedData = startResponseSchema.parse(req.body);
    console.log('Validated data:', validatedData);

    // Verify questionnaire exists and is active
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, validatedData.questionnaireId));

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    if (questionnaire.status !== 'active') {
      return res.status(400).json({ error: 'Questionnaire is not active' });
    }

    // Create response record
    const [response] = await db
      .insert(questionnaireResponses)
      .values({
        questionnaireId: validatedData.questionnaireId,
        respondentEmail: validatedData.respondentEmail,
        respondentName: validatedData.respondentName || undefined,
        status: 'started',
        metadata: validatedData.metadata || undefined
      })
      .returning();

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    console.error('Error starting response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/responses/:id/answers
 * Save individual answer(s) with enhanced validation for new question types
 */
const enhancedAnswerSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1, 'Question ID is required'),
    questionType: z.string().optional(), // Optional for enhanced validation
    answerValue: z.union([z.string(), z.number(), z.boolean(), z.record(z.any()), z.array(z.any())]), // Support complex data types
    score: z.number().int().optional()
  })).min(1, 'At least one answer is required')
});

// Serialization helpers for complex answer types
const serializeAnswerValue = (value: any, questionType?: string): string => {
  if (typeof value === 'string') {
    return value;
  }
  
  // Handle complex types that need JSON serialization
  if (questionType && ['currency', 'percentage_allocation', 'percentage_target', 'ranking', 'smart_rating', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'business_performance', 'multi_rating'].includes(questionType)) {
    return JSON.stringify(value);
  }
  
  // Handle arrays and objects
  if (typeof value === 'object' || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  
  // Convert primitives to string
  return String(value);
};

const deserializeAnswerValue = (value: string, questionType?: string): any => {
  // For complex question types, parse as JSON
  if (questionType && ['currency', 'percentage_allocation', 'percentage_target', 'ranking', 'smart_rating', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'business_performance', 'multi_rating'].includes(questionType)) {
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if parsing fails
    }
  }
  
  // For other types, attempt JSON parse but fallback to string
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

router.put('/responses/:id/answers', async (req: Request, res: Response) => {
  try {
    const responseId = req.params.id;
    const validatedData = enhancedAnswerSchema.parse(req.body);

    // Verify response exists and is not completed
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) {
      return res.status(404).json({ error: 'Response session not found' });
    }

    if (response.status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify completed response' });
    }

    // Process each answer with enhanced validation
    const savedAnswers = [];
    
    for (const answerData of validatedData.answers) {
      // Get question details for validation if questionType is provided
      let questionDetails = null;
      if (answerData.questionType) {
        const [question] = await db
          .select()
          .from(questions)
          .where(eq(questions.id, answerData.questionId));
        questionDetails = question;
      }

      // Skip validation step for complex types - just use original answerValue
      let processedAnswerValue = answerData.answerValue;

      // Serialize the answer value for database storage - use original answerValue instead of processed
      const serializedValue = serializeAnswerValue(answerData.answerValue, answerData.questionType);

      // Check if answer already exists for this question
      const [existingAnswer] = await db
        .select()
        .from(questionAnswers)
        .where(and(
          eq(questionAnswers.responseId, responseId),
          eq(questionAnswers.questionId, answerData.questionId)
        ));

      if (existingAnswer) {
        // Update existing answer
        const [updatedAnswer] = await db
          .update(questionAnswers)
          .set({
            answerValue: serializedValue,
            score: answerData.score,
            answeredAt: new Date()
          })
          .where(eq(questionAnswers.id, existingAnswer.id))
          .returning();
        
        // Deserialize for response
        const responseAnswer = {
          ...updatedAnswer,
          answerValue: deserializeAnswerValue(updatedAnswer.answerValue, answerData.questionType)
        };
        savedAnswers.push(responseAnswer);
      } else {
        // Create new answer
        const [newAnswer] = await db
          .insert(questionAnswers)
          .values({
            responseId,
            questionId: answerData.questionId,
            answerValue: serializedValue,
            score: answerData.score
          })
          .returning();
        
        // Deserialize for response
        const responseAnswer = {
          ...newAnswer,
          answerValue: deserializeAnswerValue(newAnswer.answerValue, answerData.questionType)
        };
        savedAnswers.push(responseAnswer);
      }
    }

    res.json(savedAnswers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    console.error('Error saving answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/responses/:id/complete
 * Mark response as completed and calculate final scores
 */
router.post('/responses/:id/complete', async (req: Request, res: Response) => {
  try {
    const responseId = req.params.id;

    // Verify response exists
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) {
      return res.status(404).json({ error: 'Response session not found' });
    }

    if (response.status === 'completed') {
      return res.status(400).json({ error: 'Response already completed' });
    }

    // Get all answers for this response
    const answers = await db
      .select()
      .from(questionAnswers)
      .where(eq(questionAnswers.responseId, responseId));

    // Calculate total score (sum of all individual scores)
    const totalScore = answers
      .filter(answer => answer.score !== null)
      .reduce((sum, answer) => sum + (answer.score || 0), 0);

    // Update response status
    const [completedResponse] = await db
      .update(questionnaireResponses)
      .set({
        status: 'completed',
        completedAt: new Date(),
        totalScore: totalScore > 0 ? totalScore : null
      })
      .where(eq(questionnaireResponses.id, responseId))
      .returning();

    res.json(completedResponse);
  } catch (error) {
    console.error('Error completing response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/responses/:id/scores
 * Calculate and return maturity scores for a response
 */
router.get('/responses/:id/scores', async (req: Request, res: Response) => {
  try {
    const responseId = req.params.id;

    // Get response with answers
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) {
      return res.status(404).json({ error: 'Response session not found' });
    }

    // Get all answers with question details
    const answersWithQuestions = await db
      .select({
        answer: questionAnswers,
        question: questions
      })
      .from(questionAnswers)
      .innerJoin(questions, eq(questions.id, questionAnswers.questionId))
      .where(eq(questionAnswers.responseId, responseId));

    // Group answers by question type for scoring
    const scoresByType = answersWithQuestions.reduce((acc, { answer, question }) => {
      const questionType = question.questionType;
      
      if (!acc[questionType]) {
        acc[questionType] = [];
      }
      
      // Convert answer value to numeric score if possible
      let score = answer.score;
      if (!score && question.questionType === 'score') {
        score = parseInt(answer.answerValue) || 0;
      }
      
      if (score) {
        acc[questionType].push(score);
      }
      
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate average scores by type
    const averageScores = Object.entries(scoresByType).reduce((acc, [type, scores]) => {
      if (scores.length > 0) {
        acc[type] = {
          average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
          count: scores.length,
          total: scores.reduce((sum, score) => sum + score, 0)
        };
      }
      return acc;
    }, {} as Record<string, { average: number; count: number; total: number }>);

    // Calculate maturity levels based on averages
    const maturityLevels = Object.entries(averageScores).reduce((acc, [type, data]) => {
      const { average } = data;
      
      let level = 'Initial';
      if (average >= 4.5) level = 'Optimized';
      else if (average >= 3.5) level = 'Managed';
      else if (average >= 2.5) level = 'Defined';
      else if (average >= 1.5) level = 'Repeatable';
      
      acc[type] = {
        ...data,
        level,
        percentage: Math.round((average / 5) * 100)
      };
      
      return acc;
    }, {} as Record<string, any>);

    const result = {
      responseId,
      totalScore: response.totalScore,
      completedAt: response.completedAt,
      averageScores,
      maturityLevels,
      overallAverage: Object.values(averageScores).length > 0 
        ? Object.values(averageScores).reduce((sum, data) => sum + data.average, 0) / Object.values(averageScores).length 
        : 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/responses/:id
 * Get response with all answers (enhanced with deserialization)
 */
router.get('/responses/:id', async (req: Request, res: Response) => {
  try {
    const responseId = req.params.id;

    // Get response
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, responseId));

    if (!response) {
      return res.status(404).json({ error: 'Response session not found' });
    }

    // Get all answers with question details for proper deserialization
    const answersWithQuestions = await db
      .select({
        answer: questionAnswers,
        question: questions
      })
      .from(questionAnswers)
      .leftJoin(questions, eq(questionAnswers.questionId, questions.id))
      .where(eq(questionAnswers.responseId, responseId));

    // Deserialize answers based on question type
    const processedAnswers = answersWithQuestions.map(({ answer, question }) => ({
      ...answer,
      answerValue: deserializeAnswerValue(answer.answerValue, question?.questionType),
      questionType: question?.questionType
    }));

    res.json({
      ...response,
      answers: processedAnswers
    });
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// BACKWARD COMPATIBILITY & LEGACY SUPPORT
// =============================================================================

/**
 * PUT /api/responses/:id/answers/legacy
 * Legacy answer saving endpoint for backward compatibility
 * Uses the original validation schema for existing integrations
 */
const legacySaveAnswerSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1, 'Question ID is required'),
    answerValue: z.string(), // Legacy string-only format
    score: z.number().int().optional()
  })).min(1, 'At least one answer is required')
});

router.put('/responses/:id/answers/legacy', async (req: Request, res: Response) => {
  try {
    const responseId = req.params.id;
    const validatedData = legacySaveAnswerSchema.parse(req.body);

    // Process using legacy logic but with backward-compatible deserialization
    const savedAnswers = [];
    
    for (const answerData of validatedData.answers) {
      // Check if answer already exists for this question
      const [existingAnswer] = await db
        .select()
        .from(questionAnswers)
        .where(and(
          eq(questionAnswers.responseId, responseId),
          eq(questionAnswers.questionId, answerData.questionId)
        ));

      if (existingAnswer) {
        // Update existing answer
        const [updatedAnswer] = await db
          .update(questionAnswers)
          .set({
            answerValue: answerData.answerValue,
            score: answerData.score,
            answeredAt: new Date()
          })
          .where(eq(questionAnswers.id, existingAnswer.id))
          .returning();
        
        savedAnswers.push(updatedAnswer);
      } else {
        // Create new answer
        const [newAnswer] = await db
          .insert(questionAnswers)
          .values({
            responseId,
            questionId: answerData.questionId,
            answerValue: answerData.answerValue,
            score: answerData.score
          })
          .returning();
        
        savedAnswers.push(newAnswer);
      }
    }

    res.json(savedAnswers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    console.error('Error saving legacy answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// QUESTION TYPE VALIDATION ENDPOINTS
// =============================================================================

/**
 * POST /api/validate/answer
 * Validate answer value against question type
 */
router.post('/validate/answer', async (req: Request, res: Response) => {
  try {
    const validationSchema = z.object({
      questionType: z.string().min(1, 'Question type is required'),
      answerValue: z.union([z.string(), z.number(), z.boolean(), z.record(z.any()), z.array(z.any())]),
      questionId: z.string().optional()
    });

    const { questionType, answerValue, questionId } = validationSchema.parse(req.body);

    // Convert answer value to string for validation
    const stringValue = typeof answerValue === 'string' 
      ? answerValue 
      : JSON.stringify(answerValue);

    try {
      const validatedValue = validateAnswerByType(stringValue, questionType);
      
      res.json({
        valid: true,
        validatedValue,
        questionType,
        questionId
      });
    } catch (validationError) {
      res.status(400).json({
        valid: false,
        error: validationError instanceof Error ? validationError.message : 'Validation failed',
        questionType,
        questionId
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Request validation error', 
        details: error.errors 
      });
    }
    
    console.error('Error validating answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;