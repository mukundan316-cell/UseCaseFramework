import { z } from 'zod';

// =============================================================================
// QUESTION TYPE VALIDATION SCHEMAS
// =============================================================================

/**
 * Base question type enum - matches the database schema
 */
export const QuestionTypeEnum = z.enum([
  'text', 
  'number', 
  'select', 
  'multiselect', 
  'scale', 
  'boolean', 
  'smart_rating', 
  'ranking', 
  'currency', 
  'percentage_allocation'
]);

/**
 * Dynamic question type enum - matches the dynamic questions schema
 */
export const DynamicQuestionTypeEnum = z.enum([
  'scale', 
  'multiChoice', 
  'ranking', 
  'allocation', 
  'text', 
  'boolean', 
  'matrix', 
  'compound', 
  'score', 
  'checkbox', 
  'textarea', 
  'number', 
  'email', 
  'url', 
  'date', 
  'smart_rating', 
  'currency', 
  'percentage_allocation'
]);

// =============================================================================
// ANSWER VALIDATION SCHEMAS BY QUESTION TYPE
// =============================================================================

/**
 * Validation schema for text answers
 */
export const textAnswerSchema = z.string().max(1000, 'Text answer too long');

/**
 * Validation schema for number answers
 */
export const numberAnswerSchema = z.string().transform((val) => {
  const parsed = parseFloat(val);
  if (isNaN(parsed)) {
    throw new Error('Invalid number format');
  }
  return parsed;
});

/**
 * Validation schema for select answers (single choice)
 */
export const selectAnswerSchema = z.string().min(1, 'Selection required');

/**
 * Validation schema for multiselect answers (multiple choices)
 */
export const multiselectAnswerSchema = z.string().transform((val) => {
  try {
    const parsed = JSON.parse(val);
    if (!Array.isArray(parsed)) {
      throw new Error('Multiselect answer must be an array');
    }
    return parsed;
  } catch {
    throw new Error('Invalid multiselect format');
  }
});

/**
 * Validation schema for scale answers (1-5, 1-7, etc.)
 */
export const scaleAnswerSchema = z.string().transform((val) => {
  const parsed = parseInt(val);
  if (isNaN(parsed) || parsed < 1 || parsed > 10) {
    throw new Error('Scale value must be between 1 and 10');
  }
  return parsed;
});

/**
 * Validation schema for boolean answers
 */
export const booleanAnswerSchema = z.string().transform((val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  throw new Error('Boolean answer must be "true" or "false"');
});

/**
 * Validation schema for smart rating answers
 */
export const smartRatingAnswerSchema = z.string().transform((val) => {
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Smart rating answer must be an object');
    }
    
    // Validate required fields
    if (typeof parsed.value !== 'number' || parsed.value < 1 || parsed.value > 5) {
      throw new Error('Smart rating value must be between 1 and 5');
    }
    
    return parsed;
  } catch {
    throw new Error('Invalid smart rating format');
  }
});

/**
 * Validation schema for ranking answers
 */
export const rankingAnswerSchema = z.string().transform((val) => {
  try {
    const parsed = JSON.parse(val);
    if (!Array.isArray(parsed)) {
      throw new Error('Ranking answer must be an array');
    }
    
    // Validate that all items have required fields
    for (const item of parsed) {
      if (typeof item !== 'object' || !item.id || typeof item.rank !== 'number') {
        throw new Error('Invalid ranking item format');
      }
    }
    
    return parsed;
  } catch {
    throw new Error('Invalid ranking format');
  }
});

/**
 * Validation schema for currency answers
 */
export const currencyAnswerSchema = z.string().transform((val) => {
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Currency answer must be an object');
    }
    
    // Validate required fields
    if (typeof parsed.value !== 'number' || parsed.value < 0) {
      throw new Error('Currency value must be a positive number');
    }
    
    if (!parsed.currency || !['GBP', 'USD', 'EUR', 'CAD'].includes(parsed.currency)) {
      throw new Error('Currency must be one of: GBP, USD, EUR, CAD');
    }
    
    return parsed;
  } catch {
    throw new Error('Invalid currency format');
  }
});

/**
 * Validation schema for percentage allocation answers
 */
export const percentageAllocationAnswerSchema = z.string().transform((val) => {
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Percentage allocation answer must be an object');
    }
    
    // Validate that all values are numbers and sum to 100 (or less if partial allowed)
    const values = Object.values(parsed);
    const total = values.reduce((sum: number, value: any) => {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error('Each allocation value must be between 0 and 100');
      }
      return sum + value;
    }, 0);
    
    if (total > 100) {
      throw new Error('Total allocation cannot exceed 100%');
    }
    
    return parsed;
  } catch {
    throw new Error('Invalid percentage allocation format');
  }
});

// =============================================================================
// DYNAMIC ANSWER VALIDATION
// =============================================================================

/**
 * Validate answer value based on question type
 */
export const validateAnswerByType = (answerValue: string, questionType: string) => {
  switch (questionType) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      return textAnswerSchema.parse(answerValue);
    
    case 'number':
      return numberAnswerSchema.parse(answerValue);
    
    case 'select':
    case 'checkbox':
      return selectAnswerSchema.parse(answerValue);
    
    case 'multiselect':
    case 'multiChoice':
      return multiselectAnswerSchema.parse(answerValue);
    
    case 'scale':
    case 'score':
      return scaleAnswerSchema.parse(answerValue);
    
    case 'boolean':
      return booleanAnswerSchema.parse(answerValue);
    
    case 'smart_rating':
      return smartRatingAnswerSchema.parse(answerValue);
    
    case 'ranking':
      return rankingAnswerSchema.parse(answerValue);
    
    case 'currency':
      return currencyAnswerSchema.parse(answerValue);
    
    case 'percentage_allocation':
    case 'allocation':
      return percentageAllocationAnswerSchema.parse(answerValue);
    
    case 'date':
      // Date validation - ensure it's a valid ISO date string
      const date = new Date(answerValue);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return answerValue;
    
    case 'company_profile':
    case 'business_lines_matrix':
    case 'department_skills_matrix':
    case 'business_performance':
      // For complex question types, validate that it's valid JSON
      try {
        const parsed = JSON.parse(answerValue);
        return parsed;
      } catch {
        throw new Error(`Invalid JSON format for ${questionType}`);
      }
    
    default:
      // For unknown types, just return the string value
      return answerValue;
  }
};

// =============================================================================
// QUESTION CREATION VALIDATION
// =============================================================================

/**
 * Validation schema for creating questions with new types
 */
export const createQuestionSchema = z.object({
  sectionId: z.string().min(1, 'Section ID is required'),
  questionText: z.string().min(1, 'Question text is required'),
  questionType: QuestionTypeEnum,
  isRequired: z.enum(['true', 'false']).default('false'),
  questionOrder: z.number().int().min(1),
  helpText: z.string().optional(),
  scoringCategory: z.enum(['business_value', 'feasibility', 'ai_governance', 'general']).optional(),
  // Additional validation for specific question types
  questionData: z.record(z.any()).optional(), // For storing type-specific configuration
});

/**
 * Validation schema for creating dynamic questions with new types
 */
export const createDynamicQuestionSchema = z.object({
  sectionId: z.number().int().min(1),
  questionOrder: z.number().int().min(1),
  questionType: DynamicQuestionTypeEnum,
  questionText: z.string().min(1, 'Question text is required'),
  isRequired: z.enum(['true', 'false']).default('false'),
  isStarred: z.enum(['true', 'false']).default('false'),
  helpText: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  conditionalLogic: z.string().optional(), // JSON string
  questionData: z.string().min(1, 'Question data is required'), // JSON string
});

// =============================================================================
// ENHANCED ANSWER SUBMISSION VALIDATION
// =============================================================================

/**
 * Enhanced answer validation that considers question type
 */
export const enhancedSaveAnswerSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1, 'Question ID is required'),
    questionType: QuestionTypeEnum.optional(), // Optional for backward compatibility
    answerValue: z.string(), // Will be validated based on questionType
    score: z.number().int().optional()
  })).min(1, 'At least one answer is required')
}).transform((data) => {
  // If questionType is provided, validate the answerValue
  return {
    answers: data.answers.map(answer => {
      if (answer.questionType) {
        try {
          const validatedValue = validateAnswerByType(answer.answerValue, answer.questionType);
          return {
            ...answer,
            answerValue: typeof validatedValue === 'string' ? validatedValue : JSON.stringify(validatedValue)
          };
        } catch (error) {
          throw new Error(`Invalid answer for question ${answer.questionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      return answer;
    })
  };
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type QuestionType = z.infer<typeof QuestionTypeEnum>;
export type DynamicQuestionType = z.infer<typeof DynamicQuestionTypeEnum>;
export type CreateQuestionData = z.infer<typeof createQuestionSchema>;
export type CreateDynamicQuestionData = z.infer<typeof createDynamicQuestionSchema>;
export type EnhancedAnswerData = z.infer<typeof enhancedSaveAnswerSchema>;