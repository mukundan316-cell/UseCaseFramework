-- Migration: Add new question types to support enhanced questionnaire components
-- Date: 2025-01-09
-- Description: Adds 'currency' and 'percentage_allocation' to question_type enum
--              Updates both questions and dynamic_questions tables

-- Note: Since we're using text fields for question_type (not enum), 
-- this migration serves as documentation and validation reference
-- The actual validation is handled by Zod schemas in the application layer

-- Add comments to document the new question types
COMMENT ON COLUMN questions.question_type IS 'Question type: text, number, select, multiselect, scale, boolean, smart_rating, ranking, currency, percentage_allocation';
COMMENT ON COLUMN dynamic_questions.question_type IS 'Question type: scale, multiChoice, ranking, allocation, text, boolean, matrix, compound, score, checkbox, textarea, number, email, url, date, smart_rating, currency, percentage_allocation';

-- Create indexes for performance on question_type if they don't exist
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_question_type ON dynamic_questions(question_type);

-- Add validation constraints to ensure question_type values are valid
-- Note: This uses CHECK constraints to enforce the enum values at the database level

-- For questions table
ALTER TABLE questions DROP CONSTRAINT IF EXISTS chk_questions_question_type;
ALTER TABLE questions ADD CONSTRAINT chk_questions_question_type 
CHECK (question_type IN (
  'text', 'number', 'select', 'multiselect', 'scale', 'boolean', 
  'smart_rating', 'ranking', 'currency', 'percentage_allocation'
));

-- For dynamic_questions table  
ALTER TABLE dynamic_questions DROP CONSTRAINT IF EXISTS chk_dynamic_questions_question_type;
ALTER TABLE dynamic_questions ADD CONSTRAINT chk_dynamic_questions_question_type 
CHECK (question_type IN (
  'scale', 'multiChoice', 'ranking', 'allocation', 'text', 'boolean', 
  'matrix', 'compound', 'score', 'checkbox', 'textarea', 'number', 
  'email', 'url', 'date', 'smart_rating', 'currency', 'percentage_allocation'
));

-- Migration complete
-- New question types available:
-- - currency: For monetary input with multi-currency support
-- - percentage_allocation: For percentage distribution across categories