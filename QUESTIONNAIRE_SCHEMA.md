# Questionnaire System - Database Schema Documentation

## Overview

The Questionnaire System provides a comprehensive framework for creating structured surveys, evaluations, and data collection forms within the RSA AI Use Case Value Framework. This system uses 6 normalized PostgreSQL tables following database-first architecture principles.

## Schema Architecture

```
questionnaires (Master)
├── questionnaire_sections (Sections within questionnaire)
│   └── questions (Individual questions)
│       └── question_options (Multiple choice options)
└── questionnaire_responses (Response sessions)
    └── question_answers (Individual answers)
```

## Database Tables

### 1. `questionnaires` Table

Master table storing questionnaire definitions and metadata.

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

**Key Features:**
- UUID primary keys for distributed systems
- Version tracking for questionnaire iterations
- Status workflow (draft → active → archived)
- Automatic timestamp management

### 2. `questionnaire_sections` Table

Organizes questions into logical sections with ordering and time estimates.

```sql
CREATE TABLE questionnaire_sections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id VARCHAR NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  estimated_time INTEGER, -- minutes
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Key Features:**
- Hierarchical organization of questions
- Ordered sections for logical flow
- Time estimation for user experience
- Cascade deletion for data integrity

### 3. `questions` Table

Individual questions within sections with type definitions and requirements.

```sql
CREATE TABLE questions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id VARCHAR NOT NULL REFERENCES questionnaire_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- text, number, select, multiselect, scale, boolean
  is_required TEXT NOT NULL DEFAULT 'false',
  question_order INTEGER NOT NULL,
  help_text TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Supported Question Types:**
- `text` - Free-form text input
- `number` - Numeric input with validation
- `select` - Single choice from options
- `multiselect` - Multiple choices from options
- `scale` - Rating scale (typically 1-5)
- `boolean` - Yes/No or True/False

### 4. `question_options` Table

Multiple choice options for select/multiselect/scale questions.

```sql
CREATE TABLE question_options (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id VARCHAR NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_value TEXT NOT NULL,
  score_value INTEGER, -- For scoring questions
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Key Features:**
- Ordered options for consistent presentation
- Separate display text and stored value
- Optional scoring for evaluation questionnaires
- Support for weighted responses

### 5. `questionnaire_responses` Table

Tracks individual questionnaire completion sessions and metadata.

```sql
CREATE TABLE questionnaire_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id VARCHAR NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  respondent_email TEXT NOT NULL,
  respondent_name TEXT,
  status TEXT NOT NULL DEFAULT 'started', -- started, completed, abandoned
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP,
  total_score INTEGER,
  metadata TEXT -- JSON for additional context
);
```

**Response Status Values:**
- `started` - Response session initiated
- `completed` - All required questions answered
- `abandoned` - Session started but not completed

### 6. `question_answers` Table

Individual answers to specific questions with scoring support.

```sql
CREATE TABLE question_answers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id VARCHAR NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  question_id VARCHAR NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value TEXT NOT NULL,
  score INTEGER,
  answered_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Key Features:**
- Flexible answer storage as text (parsed by type)
- Individual question scoring
- Complete audit trail with timestamps
- Referential integrity with cascade deletes

## Data Types and Validation

### Schema Types (TypeScript)

```typescript
// Core Types
export type Questionnaire = typeof questionnaires.$inferSelect;
export type QuestionnaireSection = typeof questionnaireSections.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type QuestionAnswer = typeof questionAnswers.$inferSelect;

// Insert Types (for creation)
export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
// ... additional insert types
```

### Validation Rules

- Question types are validated against enum values
- Required fields enforced at database level
- Foreign key constraints maintain referential integrity
- Timestamps automatically managed
- UUID generation handled by PostgreSQL

## Usage Patterns

### Creating a Questionnaire

```typescript
// 1. Create questionnaire
const questionnaire = await db.insert(questionnaires).values({
  title: "RSA AI Use Case Evaluation",
  description: "Comprehensive evaluation framework",
  status: "draft"
});

// 2. Add sections
const section = await db.insert(questionnaireSections).values({
  questionnaireId: questionnaire.id,
  title: "Business Impact Assessment",
  sectionOrder: 1,
  estimatedTime: 10
});

// 3. Add questions
const question = await db.insert(questions).values({
  sectionId: section.id,
  questionText: "What is the expected revenue impact?",
  questionType: "scale",
  questionOrder: 1,
  isRequired: "true"
});

// 4. Add options (for select/scale questions)
await db.insert(questionOptions).values([
  { questionId: question.id, optionText: "Very Low", optionValue: "1", scoreValue: 1, optionOrder: 1 },
  { questionId: question.id, optionText: "Low", optionValue: "2", scoreValue: 2, optionOrder: 2 },
  // ... additional options
]);
```

### Recording Responses

```typescript
// 1. Start response session
const response = await db.insert(questionnaireResponses).values({
  questionnaireId: questionnaireId,
  respondentEmail: "user@rsa.co.uk",
  respondentName: "John Smith",
  status: "started"
});

// 2. Record answers
await db.insert(questionAnswers).values({
  responseId: response.id,
  questionId: question.id,
  answerValue: "4",
  score: 4
});

// 3. Complete response
await db.update(questionnaireResponses)
  .set({ 
    status: "completed", 
    completedAt: new Date(),
    totalScore: calculateTotalScore(answers)
  })
  .where(eq(questionnaireResponses.id, response.id));
```

## Integration with RSA Framework

### Scoring Integration

The questionnaire system is designed to complement the existing RSA AI framework:

- **Use Case Evaluation**: Create questionnaires that map to RSA scoring dimensions
- **Stakeholder Input**: Collect structured feedback from business stakeholders  
- **Impact Assessment**: Gather quantitative data for impact/effort calculations
- **Governance Compliance**: Ensure proper AI governance through structured evaluation

### API Endpoints (To Be Implemented)

```typescript
// Questionnaire Management
GET    /api/questionnaires          // List all questionnaires
POST   /api/questionnaires          // Create new questionnaire
GET    /api/questionnaires/:id      // Get specific questionnaire
PUT    /api/questionnaires/:id      // Update questionnaire
DELETE /api/questionnaires/:id      // Delete questionnaire

// Response Management  
GET    /api/questionnaires/:id/responses     // Get all responses
POST   /api/questionnaires/:id/responses     // Start new response
PUT    /api/responses/:id                    // Update response
GET    /api/responses/:id/answers            // Get response answers
POST   /api/responses/:id/answers            // Submit answer
```

## Migration Status

✅ **Schema Created**: All 6 tables successfully created in database  
✅ **Migrations Applied**: Schema pushed to PostgreSQL via `npm run db:push`  
✅ **Types Generated**: TypeScript types and validation schemas defined  
🔄 **API Implementation**: RESTful endpoints to be implemented  
🔄 **UI Components**: LEGO-style components to be created  
🔄 **Integration Testing**: End-to-end functionality testing  

## Performance Considerations

### Indexing Strategy
- Primary keys (UUID) automatically indexed
- Foreign keys indexed for join performance
- Consider composite indexes on (questionnaire_id, section_order) and (section_id, question_order)
- Text search indexes on question_text for search functionality

### Query Optimization
- Use hierarchical queries to fetch complete questionnaire structures
- Implement pagination for response listings
- Cache questionnaire definitions for performance
- Use database views for complex reporting queries

### Scalability
- Neon serverless handles connection scaling
- Consider partitioning response tables by date for high-volume usage
- Implement response archiving for completed questionnaires
- Use read replicas for analytics and reporting workloads

---

*Created: January 2025*  
*Database: PostgreSQL 14+ (Neon Serverless)*  
*ORM: Drizzle with TypeScript*  
*Integration: RSA AI Use Case Value Framework*