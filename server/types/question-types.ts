// =============================================================================
// QUESTION TYPE DEFINITIONS
// =============================================================================

/**
 * Standard question types supported by the questionnaire system
 */
export type QuestionType = 
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'scale'
  | 'boolean'
  | 'smart_rating'
  | 'ranking'
  | 'currency'
  | 'percentage_allocation'
  | 'percentage_target';

/**
 * Dynamic question types for the dynamic question registry
 */
export type DynamicQuestionType = 
  | 'scale'
  | 'multiChoice'
  | 'ranking'
  | 'allocation'
  | 'text'
  | 'boolean'
  | 'matrix'
  | 'compound'
  | 'score'
  | 'checkbox'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'smart_rating'
  | 'currency'
  | 'percentage_allocation'
  | 'percentage_target';

// =============================================================================
// QUESTION TYPE METADATA
// =============================================================================

/**
 * Metadata for each question type including validation rules and display info
 */
export interface QuestionTypeMetadata {
  type: QuestionType | DynamicQuestionType;
  label: string;
  description: string;
  requiresOptions: boolean;
  allowsMultipleAnswers: boolean;
  dataFormat: 'string' | 'number' | 'boolean' | 'json' | 'array';
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    allowedValues?: string[];
  };
}

/**
 * Question type metadata registry
 */
export const QUESTION_TYPE_METADATA: Record<string, QuestionTypeMetadata> = {
  // Standard text input
  text: {
    type: 'text',
    label: 'Text Input',
    description: 'Single-line text input field',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'string',
    validationRules: {
      maxLength: 1000
    }
  },

  // Numeric input
  number: {
    type: 'number',
    label: 'Number Input',
    description: 'Numeric input field with validation',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'number'
  },

  // Single selection dropdown
  select: {
    type: 'select',
    label: 'Dropdown Selection',
    description: 'Single choice from dropdown options',
    requiresOptions: true,
    allowsMultipleAnswers: false,
    dataFormat: 'string'
  },

  // Multiple selection
  multiselect: {
    type: 'multiselect',
    label: 'Multiple Selection',
    description: 'Multiple choices from available options',
    requiresOptions: true,
    allowsMultipleAnswers: true,
    dataFormat: 'array'
  },

  // Rating scale
  scale: {
    type: 'scale',
    label: 'Rating Scale',
    description: 'Numeric scale rating (1-5, 1-7, etc.)',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'number',
    validationRules: {
      minValue: 1,
      maxValue: 10
    }
  },

  // Boolean choice
  boolean: {
    type: 'boolean',
    label: 'Yes/No Question',
    description: 'Simple true/false or yes/no choice',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'boolean'
  },

  // Smart rating with variants
  smart_rating: {
    type: 'smart_rating',
    label: 'Smart Rating',
    description: 'Enhanced rating with descriptive labels and variants',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'json',
    validationRules: {
      minValue: 1,
      maxValue: 5
    }
  },

  // Drag-and-drop ranking
  ranking: {
    type: 'ranking',
    label: 'Ranking/Prioritization',
    description: 'Drag-and-drop ranking of items',
    requiresOptions: true,
    allowsMultipleAnswers: false,
    dataFormat: 'json'
  },

  // Currency input with multi-currency support
  currency: {
    type: 'currency',
    label: 'Currency Input',
    description: 'Monetary input with multi-currency support',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'json',
    validationRules: {
      minValue: 0,
      allowedValues: ['GBP', 'USD', 'EUR', 'CAD']
    }
  },

  // Percentage allocation across categories
  percentage_allocation: {
    type: 'percentage_allocation',
    label: 'Percentage Allocation',
    description: 'Allocate percentages across multiple categories',
    requiresOptions: true,
    allowsMultipleAnswers: false,
    dataFormat: 'json',
    validationRules: {
      minValue: 0,
      maxValue: 100
    }
  },

  // Percentage targets without allocation constraints
  percentage_target: {
    type: 'percentage_target',
    label: 'Percentage Targets',
    description: 'Set percentage targets or goals for different categories',
    requiresOptions: true,
    allowsMultipleAnswers: false,
    dataFormat: 'json',
    validationRules: {
      minValue: 0,
      maxValue: 100
    }
  },

  // Dynamic question types
  multiChoice: {
    type: 'multiChoice',
    label: 'Multiple Choice',
    description: 'Multiple choice question with radio buttons',
    requiresOptions: true,
    allowsMultipleAnswers: false,
    dataFormat: 'string'
  },

  allocation: {
    type: 'allocation',
    label: 'Resource Allocation',
    description: 'Allocate resources or percentages',
    requiresOptions: true,
    allowsMultipleAnswers: false,
    dataFormat: 'json'
  },

  checkbox: {
    type: 'checkbox',
    label: 'Checkbox Selection',
    description: 'Multiple selection with checkboxes',
    requiresOptions: true,
    allowsMultipleAnswers: true,
    dataFormat: 'array'
  },

  textarea: {
    type: 'textarea',
    label: 'Long Text',
    description: 'Multi-line text input area',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'string',
    validationRules: {
      maxLength: 5000
    }
  },

  email: {
    type: 'email',
    label: 'Email Address',
    description: 'Email input with validation',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'string',
    validationRules: {
      pattern: '^[^@]+@[^@]+\.[^@]+$'
    }
  },

  url: {
    type: 'url',
    label: 'URL/Website',
    description: 'URL input with validation',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'string',
    validationRules: {
      pattern: '^https?://.+'
    }
  },

  date: {
    type: 'date',
    label: 'Date Selection',
    description: 'Date picker input',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'string'
  },

  score: {
    type: 'score',
    label: 'Score Input',
    description: 'Numeric score with range validation',
    requiresOptions: false,
    allowsMultipleAnswers: false,
    dataFormat: 'number'
  },

  matrix: {
    type: 'matrix',
    label: 'Matrix Question',
    description: 'Grid of questions with multiple dimensions',
    requiresOptions: true,
    allowsMultipleAnswers: true,
    dataFormat: 'json'
  },

  compound: {
    type: 'compound',
    label: 'Compound Question',
    description: 'Multiple related questions grouped together',
    requiresOptions: true,
    allowsMultipleAnswers: true,
    dataFormat: 'json'
  }
};

// =============================================================================
// ANSWER FORMAT TYPES
// =============================================================================

/**
 * Currency answer format
 */
export interface CurrencyAnswer {
  value: number;
  currency: 'GBP' | 'USD' | 'EUR' | 'CAD';
}

/**
 * Smart rating answer format
 */
export interface SmartRatingAnswer {
  value: number; // 1-5
  variant?: 'descriptive' | 'stars' | 'maturity' | 'capability';
  label?: string;
}

/**
 * Ranking answer format
 */
export interface RankingAnswer {
  id: string;
  label: string;
  rank: number;
}

/**
 * Percentage allocation answer format
 */
export interface PercentageAllocationAnswer {
  [categoryId: string]: number; // Category ID to percentage mapping
}

/**
 * Union type for all possible answer formats
 */
export type AnswerValue = 
  | string
  | number
  | boolean
  | string[]
  | CurrencyAnswer
  | SmartRatingAnswer
  | RankingAnswer[]
  | PercentageAllocationAnswer
  | Record<string, any>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get metadata for a specific question type
 */
export function getQuestionTypeMetadata(type: string): QuestionTypeMetadata | undefined {
  return QUESTION_TYPE_METADATA[type];
}

/**
 * Check if a question type requires options
 */
export function questionTypeRequiresOptions(type: string): boolean {
  const metadata = getQuestionTypeMetadata(type);
  return metadata?.requiresOptions || false;
}

/**
 * Check if a question type allows multiple answers
 */
export function questionTypeAllowsMultipleAnswers(type: string): boolean {
  const metadata = getQuestionTypeMetadata(type);
  return metadata?.allowsMultipleAnswers || false;
}

/**
 * Get the expected data format for a question type
 */
export function getQuestionTypeDataFormat(type: string): 'string' | 'number' | 'boolean' | 'json' | 'array' {
  const metadata = getQuestionTypeMetadata(type);
  return metadata?.dataFormat || 'string';
}

/**
 * Validate if a question type is supported
 */
export function isValidQuestionType(type: string): type is QuestionType | DynamicQuestionType {
  return type in QUESTION_TYPE_METADATA;
}