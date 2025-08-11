import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  questionnaires, 
  questionnaireSections, 
  questionnaireSubsections,
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

    // Get sections with subsections, questions and options
    const sectionsWithData = await db
      .select({
        section: questionnaireSections,
        subsection: questionnaireSubsections,
        question: questions,
        option: questionOptions
      })
      .from(questionnaireSections)
      .leftJoin(questionnaireSubsections, eq(questionnaireSubsections.sectionId, questionnaireSections.id))
      .leftJoin(questions, eq(questions.subsectionId, questionnaireSubsections.id))
      .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
      .where(eq(questionnaireSections.questionnaireId, questionnaireId))
      .orderBy(
        questionnaireSections.sectionOrder, 
        questionnaireSubsections.subsectionOrder, 
        questions.questionOrder, 
        questionOptions.optionOrder
      );

    // Organize data hierarchically with subsections
    const sectionsMap = new Map();
    
    for (const row of sectionsWithData) {
      const { section, subsection, question, option } = row;
      
      // Initialize section if not exists
      if (!sectionsMap.has(section.id)) {
        sectionsMap.set(section.id, {
          ...section,
          subsections: new Map(),
          questions: new Map() // Direct section questions
        });
      }
      
      const sectionData = sectionsMap.get(section.id);
      
      // Add subsection if exists and not already added
      if (subsection && !sectionData.subsections.has(subsection.id)) {
        sectionData.subsections.set(subsection.id, {
          ...subsection,
          isCollapsible: subsection.isCollapsible === 'true',
          defaultExpanded: subsection.defaultExpanded === 'true',
          questions: new Map()
        });
      }
      
      // Add question to the appropriate container
      if (question && !sectionData.questions.has(question.id)) {
        const questionData = {
          ...question,
          questionData: question.questionData || null,
          options: []
        };
        
        if (question.subsectionId && sectionData.subsections.has(question.subsectionId)) {
          // Question belongs to a subsection
          sectionData.subsections.get(question.subsectionId).questions.set(question.id, questionData);
        } else {
          // Question belongs directly to the section
          sectionData.questions.set(question.id, questionData);
        }
      }
      
      // Add option if exists
      if (question && option) {
        let targetQuestion = sectionData.questions.get(question.id);
        if (!targetQuestion && question.subsectionId) {
          const subsectionData = sectionData.subsections.get(question.subsectionId);
          if (subsectionData) {
            targetQuestion = subsectionData.questions.get(question.id);
          }
        }
        if (targetQuestion) {
          targetQuestion.options.push(option);
        }
      }
    }

    // Convert to final structure
    const sections = Array.from(sectionsMap.values()).map(section => ({
      ...section,
      subsections: Array.from(section.subsections.values()).map(subsection => ({
        ...subsection,
        questions: Array.from(subsection.questions.values())
      })),
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

// Enhanced serialization helpers for JSONB storage
const prepareAnswerData = (value: any, questionType?: string): { answerValue: string; answerData: any } => {
  // For backward compatibility, always store string representation
  const answerValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Prepare structured data for JSONB storage
  let answerData;
  
  if (typeof value === 'string') {
    // Simple text answer
    answerData = { value, type: 'text' };
  } else if (questionType && ['currency', 'percentage_allocation', 'percentage_target', 'ranking', 'smart_rating', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'business_performance', 'multi_rating', 'composite'].includes(questionType)) {
    // Complex structured answer - store the actual object, not the string
    answerData = { 
      value, 
      type: questionType,
      timestamp: new Date().toISOString()
    };
  } else {
    // Generic object/array - store the actual object, not the string
    answerData = { 
      value, 
      type: 'object',
      timestamp: new Date().toISOString()
    };
  }
  
  return { answerValue, answerData };
};

// Enhanced deserialization with JSONB support
const deserializeAnswerValue = (answerValue: string, answerData?: any, questionType?: string): any => {
  // Prefer structured answerData if available
  if (answerData && typeof answerData === 'object' && answerData.value !== undefined) {
    return answerData.value;
  }
  
  // Fallback to legacy answerValue parsing
  if (questionType && ['currency', 'percentage_allocation', 'percentage_target', 'ranking', 'smart_rating', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'business_performance', 'multi_rating'].includes(questionType)) {
    try {
      return JSON.parse(answerValue);
    } catch {
      return answerValue; // Return as string if parsing fails
    }
  }
  
  // For other types, attempt JSON parse but fallback to string
  try {
    return JSON.parse(answerValue);
  } catch {
    return answerValue;
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

      // Parse JSON strings back to objects for complex question types before storage
      let processedAnswerValue = answerData.answerValue;
      
      // If answerValue is a JSON string for complex types, parse it back to object
      if (typeof answerData.answerValue === 'string' && answerData.questionType && 
          ['currency', 'percentage_allocation', 'percentage_target', 'ranking', 'smart_rating', 
           'business_lines_matrix', 'department_skills_matrix', 'company_profile', 
           'business_performance', 'multi_rating', 'composite'].includes(answerData.questionType)) {
        try {
          processedAnswerValue = JSON.parse(answerData.answerValue);
        } catch (e) {
          // If parsing fails, keep as string
          processedAnswerValue = answerData.answerValue;
        }
      }

      // Prepare answer data for JSONB storage
      const preparedData = prepareAnswerData(processedAnswerValue, answerData.questionType);

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
            answerValue: preparedData.answerValue,
            answerData: preparedData.answerData,
            score: answerData.score,
            answeredAt: new Date()
          })
          .where(eq(questionAnswers.id, existingAnswer.id))
          .returning();
        
        // Deserialize for response
        const responseAnswer = {
          ...updatedAnswer,
          answerValue: deserializeAnswerValue(updatedAnswer.answerValue, updatedAnswer.answerData, answerData.questionType)
        };
        savedAnswers.push(responseAnswer);
      } else {
        // Create new answer
        const [newAnswer] = await db
          .insert(questionAnswers)
          .values({
            responseId: responseId,
            questionId: answerData.questionId,
            answerValue: preparedData.answerValue,
            answerData: preparedData.answerData,
            score: answerData.score
          })
          .returning();
        
        // Deserialize for response
        const responseAnswer = {
          ...newAnswer,
          answerValue: deserializeAnswerValue(newAnswer.answerValue, newAnswer.answerData, answerData.questionType)
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

    // No scoring logic - just return basic response info with answer count

    const result = {
      responseId,
      totalScore: response.totalScore,
      completedAt: response.completedAt,
      averageScores: {}, // Empty until scoring is implemented
      maturityLevels: {}, // Empty until scoring is implemented
      overallAverage: 0, // TODO: Implement after questionnaire completion
      answerCount: answersWithQuestions.length
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

    // Deserialize answers based on question type with JSONB support
    const processedAnswers = answersWithQuestions.map(({ answer, question }) => ({
      ...answer,
      answerValue: deserializeAnswerValue(answer.answerValue, answer.answerData, question?.questionType),
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

// =============================================================================
// QUESTION CONFIGURATION
// =============================================================================

/**
 * PATCH /api/questions/:id/config
 * Update question configuration (like showTotal for percentage_target questions)
 */
router.patch('/questions/:id/config', async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;
    
    // Validate request body
    const configSchema = z.object({
      questionData: z.object({
        showTotal: z.boolean().optional(),
        precision: z.number().min(0).max(3).optional(),
        additionalContextLabel: z.string().optional(),
        placeholder: z.string().optional()
      }).optional()
    });
    
    const { questionData } = configSchema.parse(req.body);
    
    if (!questionData) {
      return res.status(400).json({ error: 'questionData is required' });
    }
    
    // Get current question
    const [currentQuestion] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));
      
    if (!currentQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Merge with existing questionData
    const updatedQuestionData = {
      ...(currentQuestion.questionData || {}),
      ...questionData
    };
    
    // Update question
    const [updatedQuestion] = await db
      .update(questions)
      .set({ 
        questionData: updatedQuestionData
      })
      .where(eq(questions.id, questionId))
      .returning();
    
    res.json({
      success: true,
      question: updatedQuestion,
      message: 'Question configuration updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating question configuration:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update question configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;