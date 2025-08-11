-- Migration: Add Questionnaire Subsections Table
-- Purpose: Implement proper subsections as organizational containers instead of fake questions

-- Create subsections table
CREATE TABLE IF NOT EXISTS questionnaire_subsections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id VARCHAR NOT NULL REFERENCES questionnaire_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subsection_number TEXT NOT NULL,
  subsection_order INTEGER NOT NULL,
  estimated_time INTEGER,
  description TEXT,
  is_collapsible TEXT NOT NULL DEFAULT 'true',
  default_expanded TEXT NOT NULL DEFAULT 'false',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add subsection_id column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS subsection_id VARCHAR REFERENCES questionnaire_subsections(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subsections_section_id ON questionnaire_subsections(section_id);
CREATE INDEX IF NOT EXISTS idx_subsections_order ON questionnaire_subsections(subsection_order);
CREATE INDEX IF NOT EXISTS idx_questions_subsection_id ON questions(subsection_id);

-- Add comments for documentation
COMMENT ON TABLE questionnaire_subsections IS 'Organizational containers for questions - replaces fake "header" questions';
COMMENT ON COLUMN questionnaire_subsections.subsection_number IS 'Display number like "1.1", "1.2", "2.1"';
COMMENT ON COLUMN questions.subsection_id IS 'Optional - questions can be directly in section or grouped in subsection';