// Shared TypeScript types for questionnaire system

export interface QuestionOption {
  id: string;
  label: string;
  value?: string | number;
}

export interface QuestionDefinition {
  id: string;
  questionText: string;
  questionType: 'text' | 'textarea' | 'select' | 'multi_select' | 'radio' | 'checkbox' | 
                'number' | 'date' | 'email' | 'url' | 'score' | 'scale';
  isRequired: boolean;
  questionOrder: number;
  helpText?: string;
  placeholder?: string;
  options?: QuestionOption[];
  minValue?: number;
  maxValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  questionData?: Record<string, any>;
  subQuestions?: QuestionDefinition[];
  displayCondition?: string;
  scoringCategory?: string;
}

export interface SectionDefinition {
  id: string;
  title: string;
  sectionOrder: number;
  description?: string;
  questions: QuestionDefinition[];
}

export interface QuestionnaireDefinition {
  id: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt?: string;
  sections: SectionDefinition[];
  metadata?: {
    estimatedTimeMinutes?: number;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface QuestionAnswer {
  questionId: string;
  answerValue: any;
  answeredAt: string;
  metadata?: {
    timeSpentSeconds?: number;
    revisionCount?: number;
    [key: string]: any;
  };
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  questionnaireVersion: string;
  respondentEmail: string;
  respondentName?: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  surveyData: Record<string, any>; // Direct Survey.js data object
  progress?: {
    currentSectionId?: string;
    currentQuestionId?: string;
    completedQuestions: string[];
    totalQuestions: number;
    percentComplete: number;
  };
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    totalTimeSpentSeconds?: number;
    [key: string]: any;
  };
}

// Lightweight session tracking for PostgreSQL
export interface ResponseSession {
  id: string; // Same as response ID
  questionnaireId: string;
  respondentEmail: string;
  respondentName?: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
  progressPercent: number;
  currentSectionId?: string;
  currentQuestionId?: string;
  // File references
  questionnaireDefinitionPath: string; // Object storage path
  responsePath?: string; // Object storage path (created when first answer is saved)
  // Scoring and analytics
  totalScore?: number;
  sectionScores?: Record<string, number>;
  // Metadata for quick queries
  questionnaireVersion: string;
  totalQuestions: number;
  answeredQuestions: number;
}


// Validation schemas - Use these when metadata is not available
export const QuestionTypes = [
  'text', 'textarea', 'select', 'multi_select', 'radio', 'checkbox',
  'number', 'date', 'email', 'url', 'company_profile', 'business_lines_matrix',
  'smart_rating', 'multi_rating', 'percentage_allocation', 'percentage_target',
  'ranking', 'currency', 'department_skills_matrix', 'business_performance',
  'composite', 'dynamic_use_case_selector'
] as const;

export const ResponseStatuses = ['started', 'in_progress', 'completed', 'abandoned'] as const;

// Helper functions to get dynamic values from metadata when available
export function getQuestionTypes(metadata?: any): string[] {
  return metadata?.questionTypes || QuestionTypes.slice();
}

export function getResponseStatuses(metadata?: any): string[] {
  return metadata?.responseStatuses || ResponseStatuses.slice();
}

// Survey.js utility functions
export function getSurveyDataValue(response: QuestionnaireResponse, fieldName: string): any {
  return response.surveyData?.[fieldName];
}

export function getAnsweredFieldNames(response: QuestionnaireResponse): string[] {
  return Object.keys(response.surveyData || {}).filter(key => {
    const value = response.surveyData[key];
    return value !== undefined && value !== null && value !== '';
  });
}

export function calculateSurveyProgress(response: QuestionnaireResponse): number {
  const answeredFields = getAnsweredFieldNames(response);
  // Progress calculated at the service level with questionnaire context
  return answeredFields.length > 0 ? 50 : 0; // Simplified fallback
}