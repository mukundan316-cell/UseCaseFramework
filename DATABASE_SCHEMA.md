# Database Schema Documentation

## Overview

The RSA AI Use Case Value Framework uses PostgreSQL with Drizzle ORM. The schema consists of 11 interconnected tables supporting use case management, metadata configuration, and comprehensive questionnaire functionality with saved progress capabilities.

## Core Tables

### use_cases
Primary table for AI use case data with enhanced RSA Framework scoring.

```sql
CREATE TABLE use_cases (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  -- RSA Framework Core Scoring (12 Levers)
  business_value DECIMAL DEFAULT 0,
  technical_feasibility DECIMAL DEFAULT 0,
  data_readiness DECIMAL DEFAULT 0,
  regulatory_compliance DECIMAL DEFAULT 0,
  implementation_complexity DECIMAL DEFAULT 0,
  strategic_alignment DECIMAL DEFAULT 0,
  market_potential DECIMAL DEFAULT 0,
  customer_value DECIMAL DEFAULT 0,
  revenue_impact DECIMAL DEFAULT 0,
  cost_reduction DECIMAL DEFAULT 0,
  risk_mitigation DECIMAL DEFAULT 0,
  governance_readiness DECIMAL DEFAULT 0,
  -- Calculated Scores
  impact_score DECIMAL DEFAULT 0,  -- Average of Business Value levers
  effort_score DECIMAL DEFAULT 0,  -- Average of Feasibility levers
  quadrant VARCHAR,               -- Auto-calculated based on 3.0 threshold
  -- Business Metadata
  line_of_business VARCHAR,
  business_segment VARCHAR,
  geography VARCHAR,
  use_case_type VARCHAR,
  priority_level VARCHAR DEFAULT 'Medium',
  status VARCHAR DEFAULT 'Identified',
  owner VARCHAR,
  estimated_effort_months INTEGER,
  estimated_value_usd INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### metadata_config
Business metadata and dropdown configurations.

```sql
CREATE TABLE metadata_config (
  id VARCHAR PRIMARY KEY DEFAULT 'default',
  value_chain_components TEXT[],
  business_segments TEXT[],
  geographies TEXT[],
  use_case_types TEXT[],
  process_activities JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Assessment System Tables

### questionnaires
Main questionnaire definitions.

```sql
CREATE TABLE questionnaires (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### sections
Questionnaire sections (6 sections for RSA Assessment).

```sql
CREATE TABLE sections (
  id VARCHAR PRIMARY KEY,
  questionnaire_id VARCHAR REFERENCES questionnaires(id),
  title VARCHAR NOT NULL,
  description TEXT,
  section_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### questions
Individual questions within sections (16 total for RSA Assessment).

```sql
CREATE TABLE questions (
  id VARCHAR PRIMARY KEY,
  section_id VARCHAR REFERENCES sections(id),
  question_text TEXT NOT NULL,
  question_type VARCHAR CHECK (question_type IN ('scale', 'select', 'multi_choice', 'text')),
  is_required BOOLEAN DEFAULT true,
  question_order INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### question_options
Answer options for questions (70+ options total).

```sql
CREATE TABLE question_options (
  id VARCHAR PRIMARY KEY,
  question_id VARCHAR REFERENCES questions(id),
  option_text VARCHAR NOT NULL,
  option_value VARCHAR NOT NULL,
  score_value DECIMAL DEFAULT 0,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### responses
User assessment responses with progress tracking.

```sql
CREATE TABLE responses (
  id VARCHAR PRIMARY KEY,
  questionnaire_id VARCHAR REFERENCES questionnaires(id),
  respondent_email VARCHAR,
  respondent_name VARCHAR,
  status VARCHAR DEFAULT 'in_progress',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);
```

### question_answers
Individual question responses.

```sql
CREATE TABLE question_answers (
  id VARCHAR PRIMARY KEY,
  response_id VARCHAR REFERENCES responses(id),
  question_id VARCHAR REFERENCES questions(id),
  answer_value TEXT,
  score_value DECIMAL DEFAULT 0,
  answered_at TIMESTAMP DEFAULT NOW()
);
```

### section_progress
Section-level progress tracking for enhanced saved progress.

```sql
CREATE TABLE section_progress (
  id VARCHAR PRIMARY KEY,
  response_id VARCHAR REFERENCES responses(id),
  section_id VARCHAR REFERENCES sections(id),
  section_number INTEGER NOT NULL,
  started BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  completion_percentage DECIMAL DEFAULT 0,
  last_modified TIMESTAMP DEFAULT NOW(),
  answers JSONB DEFAULT '{}'
);
```

### question_templates
Template library for question management (100+ templates).

```sql
CREATE TABLE question_templates (
  id VARCHAR PRIMARY KEY,
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  question_text TEXT NOT NULL,
  question_type VARCHAR NOT NULL,
  options JSONB DEFAULT '[]',
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### assessment_results
Cached assessment results and maturity scores.

```sql
CREATE TABLE assessment_results (
  id VARCHAR PRIMARY KEY,
  response_id VARCHAR REFERENCES responses(id),
  section_scores JSONB DEFAULT '{}',
  overall_score DECIMAL DEFAULT 0,
  maturity_level VARCHAR,
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

### question_dependencies
Question conditional logic.

```sql
CREATE TABLE question_dependencies (
  id VARCHAR PRIMARY KEY,
  question_id VARCHAR REFERENCES questions(id),
  depends_on_question_id VARCHAR REFERENCES questions(id),
  condition_type VARCHAR NOT NULL,
  condition_value VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### rsa_assessment_recommendations
AI-generated use case recommendations.

```sql
CREATE TABLE rsa_assessment_recommendations (
  id VARCHAR PRIMARY KEY,
  response_id VARCHAR REFERENCES responses(id),
  use_case_id VARCHAR REFERENCES use_cases(id),
  recommendation_text TEXT,
  priority_score DECIMAL DEFAULT 0,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Database Views

### saved_assessment_progress
Virtual view for saved progress modal functionality.

```sql
CREATE VIEW saved_assessment_progress AS
SELECT 
  r.id as response_id,
  r.questionnaire_id,
  COALESCE(AVG(sp.completion_percentage), 0) as completion_percentage,
  COALESCE(MAX(sp.section_number), 1) as current_section,
  COUNT(DISTINCT s.id) as total_sections,
  r.started_at as timestamp,
  r.respondent_email,
  r.respondent_name
FROM responses r
LEFT JOIN section_progress sp ON r.id = sp.response_id
LEFT JOIN sections s ON r.questionnaire_id = s.questionnaire_id
WHERE r.status = 'in_progress'
GROUP BY r.id, r.questionnaire_id, r.started_at, r.respondent_email, r.respondent_name
ORDER BY r.started_at DESC;
```

## Current Data

### Seeded Use Cases
16 commercial insurance use cases covering:
- Claims processing automation
- Risk assessment analytics
- Customer service enhancement  
- Underwriting optimization
- Fraud detection systems
- Policy administration
- Pricing optimization
- Compliance monitoring

### RSA Assessment Content
- **6 Sections**: Business Strategy, Data Capabilities, Use Case Discovery, Technology Readiness, People & Process, Governance & Risk
- **16 Questions**: Covering GWP, markets, AI strategy, technology stack, use case priorities
- **70+ Answer Options**: Multiple choice and scale responses with scoring
- **100+ Question Templates**: Categorized library for assessment customization

### Metadata Configuration
- **Business Segments**: Commercial Lines, Personal Lines, Specialty Lines, Reinsurance
- **Geographies**: North America, Europe, Asia Pacific, Latin America, Middle East & Africa
- **Use Case Types**: Automation, Analytics, Customer Experience, Risk Management, Operational Efficiency

## API Endpoints

### Core Operations
- `GET/POST/PUT/DELETE /api/use-cases` - Use case CRUD
- `GET /api/questionnaires/:id` - Assessment with sections/questions
- `GET/PUT /api/responses/:id` - Assessment responses
- `GET /api/assessment-progress` - Saved progress for modal
- `DELETE /api/assessment-progress/:responseId` - Delete saved progress
- `GET/PUT /api/section-progress/:responseId` - Section-level progress
- `GET /api/recommendations/:responseId` - Assessment recommendations

## Key Features

### Enhanced Scoring
- 12-lever RSA Framework with automatic quadrant assignment
- Real-time calculations: Impact = Business Value average, Effort = Feasibility average
- 3.0 threshold determines Quick Win/Strategic Bet/Experimental/Watchlist quadrants

### Progress Management  
- Section-level progress tracking with completion percentages
- Auto-save functionality with localStorage + database persistence
- Resume capability via SavedProgressModalLegoBlock
- Progress visualization and management through modal interface

### Database Integration
- PostgreSQL with Neon serverless hosting
- Drizzle ORM with automatic migrations via `npm run db:push`
- Comprehensive seeding system for use cases and assessment content
- Database-first architecture with real-time persistence