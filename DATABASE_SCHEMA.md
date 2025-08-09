# RSA AI Framework - Database Schema Documentation

## Overview

The RSA AI Use Case Value Framework uses a PostgreSQL database with 11 comprehensive tables designed for scalability, data integrity, and real-time operations. The schema supports use case management, metadata configuration, complete questionnaire functionality with 69 assessment questions across 6 sections, dynamic question registry, section progress tracking, and response management. All database operations are handled through Drizzle ORM with type-safe queries and automatic migrations.

**Current Database Status** (January 2025):
- **11 Active Tables**: Complete questionnaire system operational
- **69 Assessment Questions**: RSA AI Maturity Assessment fully seeded
- **6 Assessment Sections**: Business Strategy through Governance & Compliance
- **29 Active Responses**: Real assessment data being collected

## Database Connection

- **Provider**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle with TypeScript
- **Connection**: Environment variable `DATABASE_URL`
- **Connection Pool**: Configured for production workloads

## Schema Tables

### 1. `use_cases` Table

**Purpose**: Stores all AI use case data with complete RSA framework scoring dimensions.

```sql
CREATE TABLE use_cases (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value_chain_component TEXT NOT NULL,
  process TEXT NOT NULL,
  line_of_business TEXT NOT NULL,
  lines_of_business TEXT[],
  business_segment TEXT NOT NULL,
  geography TEXT NOT NULL,
  use_case_type TEXT NOT NULL,
  
  -- Business Value Levers (Impact Score Components)
  revenue_impact INTEGER NOT NULL,
  cost_savings INTEGER NOT NULL,
  risk_reduction INTEGER NOT NULL,
  broker_partner_experience INTEGER NOT NULL,
  strategic_fit INTEGER NOT NULL,
  
  -- Feasibility Levers (Effort Score Components)
  data_readiness INTEGER NOT NULL,
  technical_complexity INTEGER NOT NULL,
  change_impact INTEGER NOT NULL,
  model_risk INTEGER NOT NULL,
  adoption_readiness INTEGER NOT NULL,
  
  -- AI Governance Levers
  explainability_bias INTEGER NOT NULL,
  regulatory_compliance INTEGER NOT NULL,
  
  -- Calculated Scores
  impact_score REAL NOT NULL,
  effort_score REAL NOT NULL,
  quadrant TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features**:
- 12 scoring dimensions (1-5 scale each)
- Real-time calculated impact/effort scores
- Automatic quadrant assignment
- Support for multiple lines of business
- UUID primary keys for distributed systems

### 2. `metadata_config` Table

**Purpose**: Stores UI list of values that drive all dropdown options and filters throughout the application.

```sql
CREATE TABLE metadata_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  value_chain_components TEXT[] NOT NULL,
  processes TEXT[] NOT NULL,
  lines_of_business TEXT[] NOT NULL,
  business_segments TEXT[] NOT NULL,
  geographies TEXT[] NOT NULL,
  use_case_types TEXT[] NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Key Features**:
- Single row configuration (id='default')
- Array fields for each metadata category
- Timestamp tracking for audit purposes
- Direct integration with form dropdowns
- Admin panel CRUD operations

### 3. `users` Table

**Purpose**: User authentication system (prepared for future multi-tenant expansion).

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

**Key Features**:
- UUID primary keys
- Unique username constraints
- Password field (for future authentication)
- Ready for session management

### 4. `questionnaires` Table

**Purpose**: Stores questionnaire definitions and metadata for the RSA AI Maturity Assessment system.

```sql
CREATE TABLE questionnaires (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, archived
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Key Features**:
- Version management for questionnaire iterations
- Status tracking (draft/active/archived)
- Timestamp tracking for audit purposes

### 5. `questionnaire_sections` Table

**Purpose**: Organizes questionnaire content into logical sections with unlock conditions.

```sql
CREATE TABLE questionnaire_sections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id VARCHAR NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  section_number INTEGER NOT NULL, -- 1-6 for main sections
  is_locked TEXT NOT NULL DEFAULT 'false',
  unlock_condition TEXT DEFAULT 'previous_complete',
  section_type TEXT NOT NULL, -- business_strategy, ai_capabilities, etc.
  estimated_time INTEGER, -- in minutes
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Current Sections**:
1. Business Strategy & AI Vision (5 questions)
2. Current AI & Data Capabilities (3 questions)
3. Use Case Discovery & Validation (2 questions)
4. Technology & Infrastructure Readiness (2 questions)
5. People, Process & Change Management (2 questions)
6. Governance, Risk & Compliance (2 questions)

### 6. `questions` Table

**Purpose**: Stores individual assessment questions with metadata and scoring information.

```sql
CREATE TABLE questions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id VARCHAR NOT NULL REFERENCES questionnaire_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- text, number, select, multiselect, scale, boolean
  is_required TEXT NOT NULL DEFAULT 'false',
  question_order INTEGER NOT NULL,
  help_text TEXT,
  sub_questions TEXT, -- JSON for compound questions
  display_condition TEXT, -- JSON for conditional logic
  scoring_category TEXT, -- business_value, feasibility, ai_governance
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Current Status**: 16 primary questions with 53 additional sub-questions (69 total)

### 7. `question_options` Table

**Purpose**: Stores answer options for select/multiselect questions with scoring values.

```sql
CREATE TABLE question_options (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id VARCHAR NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_value TEXT NOT NULL,
  score_value INTEGER, -- For scoring questions (1-5 scale)
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 8. `questionnaire_responses` Table

**Purpose**: Tracks individual assessment responses with completion status and scoring.

```sql
CREATE TABLE questionnaire_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id VARCHAR NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  respondent_email TEXT NOT NULL,
  respondent_name TEXT,
  status TEXT NOT NULL DEFAULT 'started', -- started, completed, abandoned
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP,
  total_score INTEGER, -- Calculated aggregate score
  metadata TEXT -- JSON for additional context data
);
```

**Current Status**: 29 active assessment responses

### 9. `question_answers` Table

**Purpose**: Stores individual question responses with scoring and timestamps.

```sql
CREATE TABLE question_answers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id VARCHAR NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  question_id VARCHAR NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value TEXT NOT NULL, -- Stored as string, parsed by type
  score INTEGER, -- Individual question score
  answered_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 10. `dynamic_questions` Table

**Purpose**: Registry for dynamically generated questions and question templates.

```sql
CREATE TABLE dynamic_questions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id INTEGER NOT NULL,
  question_order INTEGER NOT NULL,
  question_type TEXT NOT NULL, -- scale, multiChoice, ranking, etc.
  question_text TEXT NOT NULL,
  is_required TEXT NOT NULL DEFAULT 'false',
  is_starred TEXT DEFAULT 'false',
  help_text TEXT,
  depends_on TEXT[], -- Array of question IDs
  conditional_logic TEXT, -- JSON for conditional rules
  question_data TEXT NOT NULL, -- JSON for question-specific data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 11. `section_progress` Table

**Purpose**: Tracks section-level progress for assessment completion and resume functionality.

```sql
CREATE TABLE section_progress (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_response_id VARCHAR NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  section_number INTEGER NOT NULL, -- 1-6
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_modified_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 0, -- 0-100
  is_complete TEXT NOT NULL DEFAULT 'false'
);
```

## Data Relationships

### Current Relationships
- `use_cases.value_chain_component` → References values in `metadata_config.value_chain_components[]`
- `use_cases.process` → References values in `metadata_config.processes[]`
- `use_cases.line_of_business` → References values in `metadata_config.lines_of_business[]`
- `use_cases.business_segment` → References values in `metadata_config.business_segments[]`
- `use_cases.geography` → References values in `metadata_config.geographies[]`
- `use_cases.use_case_type` → References values in `metadata_config.use_case_types[]`

### Future Relationships
- `use_cases.created_by` → `users.id` (for user attribution)
- Organization/tenant tables for multi-tenant support

## Scoring Framework Implementation

### Business Value Levers (Impact Score)
1. **Revenue Impact** (1-5): Direct revenue generation potential
2. **Cost Savings** (1-5): Operational cost reduction capability
3. **Risk Reduction** (1-5): Risk mitigation and compliance improvement
4. **Broker/Partner Experience** (1-5): External relationship enhancement
5. **Strategic Fit** (1-5): Alignment with company strategic objectives

### Feasibility Levers (Effort Score)
1. **Data Readiness** (1-5): Data availability and quality (inverted for effort)
2. **Technical Complexity** (1-5): Implementation complexity
3. **Change Impact** (1-5): Organizational change requirements
4. **Model Risk** (1-5): AI/ML model risks and uncertainties
5. **Adoption Readiness** (1-5): User acceptance potential (inverted for effort)

### AI Governance Levers
1. **Explainability/Bias** (1-5): Model transparency and fairness
2. **Regulatory Compliance** (1-5): Regulatory adherence requirements

### Score Calculations
```typescript
// Impact Score: Average of Business Value levers
impactScore = (revenueImpact + costSavings + riskReduction + brokerPartnerExperience + strategicFit) / 5

// Effort Score: Average of Feasibility levers (with inversions)
effortScore = ((6-dataReadiness) + technicalComplexity + changeImpact + modelRisk + (6-adoptionReadiness)) / 5

// Quadrant Assignment:
// - Quick Win: impact >= 3.5 && effort < 3.5
// - Strategic Bet: impact >= 3.5 && effort >= 3.5
// - Experimental: impact < 3.5 && effort < 3.5
// - Watchlist: impact < 3.5 && effort >= 3.5
```

## Migration and Seeding

### Automatic Migration Process
1. **Schema Validation**: Drizzle checks current schema against defined models
2. **Column Addition**: New framework columns added automatically
3. **Data Migration**: Existing records updated with enhanced framework values
4. **Score Recalculation**: All impact/effort scores recalculated using new formula

### Initial Data Seeding
- **Use Cases**: 16+ realistic commercial insurance AI use cases
- **Metadata Config**: Default values for all dropdown categories
- **Enhanced Framework**: All use cases include complete 12-lever scoring

## Performance Considerations

### Indexing Strategy
- Primary keys (UUID) automatically indexed
- Consider composite indexes on frequently filtered columns
- Text search indexes for title/description fields

### Query Optimization
- Use proper TypeScript types from Drizzle inference
- Batch operations for bulk updates
- Connection pooling for concurrent requests

### Scaling Considerations
- Neon serverless automatically scales connections
- Consider read replicas for reporting workloads
- Implement caching for metadata configuration

## Data Integrity and Validation

### Database Constraints
- NOT NULL constraints on required fields
- Array fields for proper metadata storage
- Timestamp fields with proper defaults

### Application-Level Validation
- Zod schemas for API request validation
- Type-safe database operations through Drizzle
- Real-time score calculation validation

### Backup and Recovery
- Neon provides automatic backups
- Point-in-time recovery capabilities
- Export functionality for configuration backup

## API Integration

### RESTful Endpoints

**Use Case Management**:
- `GET /api/use-cases` - Retrieve all use cases
- `POST /api/use-cases` - Create new use case
- `PUT /api/use-cases/:id` - Update existing use case
- `DELETE /api/use-cases/:id` - Delete use case

**Metadata Configuration**:
- `GET /api/metadata` - Retrieve metadata configuration
- `PUT /api/metadata` - Update metadata configuration

**Assessment System** (Current Active Endpoints):
- `GET /api/questionnaires/:id` - Retrieve questionnaire with sections and questions
- `POST /api/responses/start` - Start new assessment response
- `PUT /api/responses/:id/answers` - Update question answers
- `GET /api/responses/:id` - Retrieve assessment response
- `PUT /api/section-progress/:responseId/:sectionNumber` - Update section progress
- `POST /api/section-progress/:responseId/:sectionNumber/complete` - Mark section complete
- `GET /api/responses/:id/resume-point` - Get resume point for incomplete assessment
- `GET /api/assessment-stats` - Retrieve assessment statistics

### Response Format
All API responses include proper TypeScript typing and consistent error handling with appropriate HTTP status codes.

---

*Last Updated: January 2025*
*Database Version: PostgreSQL 14+ (Neon Serverless)*
*ORM Version: Drizzle 0.x with TypeScript*