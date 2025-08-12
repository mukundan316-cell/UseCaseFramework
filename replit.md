# RSA AI Use Case Value Framework

## Overview
Strategic AI use case prioritization platform for RSA Insurance featuring comprehensive assessment system, 12-lever scoring framework, and executive analytics dashboard.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components following "Build Once, Reuse Everywhere" principle
- **Database**: Consistent camelCase field naming between Drizzle schema and queries

## LEGO Design System

### Core LEGO Principles
**"Build Once, Reuse Everywhere"** - Every component must be designed as a reusable LEGO block with consistent design patterns across the entire application.

### LEGO CRUD Card Design Standard
All use case cards across the entire application must follow this exact specification:

- **Card Structure**: Clean white cards with 4px blue left border (#3b82f6), subtle gray border, hover shadow
- **Content Padding**: p-5 for comfortable spacing
- **Title**: text-lg font-semibold text-gray-900 with mb-2 spacing
- **Description**: text-sm text-gray-600 with line-clamp-2
- **Tags**: Rounded pill-style tags with color-coded backgrounds:
  - Process: bg-blue-100 text-blue-800 with blue dot
  - Line of Business: bg-purple-100 text-purple-800 with purple dot  
  - Use Case Type: bg-orange-100 text-orange-800 with orange dot
- **Score Display**: Side-by-side grid with green (Impact) and blue (Effort) backgrounds, only for RSA Active Portfolio
- **Action Buttons**: Ghost-style buttons with proper icons, border-top separator
- **Contextual Actions**: Show appropriate buttons based on view (Edit/Delete for all, Move to Library/RSA as applicable)

### LEGO Form Standards
- **Field Labels**: All questionnaire field labels must use `text-base font-semibold text-gray-900` for maximum visibility
- **Input Consistency**: Consistent styling across all form inputs using shadcn/ui components
- **Validation States**: Standardized error and success states across all forms

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS + Wouter
- **Backend**: Node.js + Express + Drizzle ORM + Zod validation  
- **Database**: Hybrid approach - PostgreSQL for session tracking + JSON blob storage for questionnaire data

### Core Features
- **Use Case Management**: Complete CRUD with RSA 12-lever scoring framework
- **Assessment System**: 6-section questionnaire with 14 advanced question types (company_profile, business_lines_matrix, smart_rating, ranking, etc.)
- **Manual Override System**: Toggle-based score customization with database persistence
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts
- **Professional PDF Exports**: Executive-grade reports for use cases, library catalogs, active portfolios, and assessment responses
- **Real-time Persistence**: Live database synchronization

### Recent Enhancements (August 2025)
- **Clean Blob-First Architecture**: Complete migration from PostgreSQL to pure JSON blob storage for questionnaire data
  - **Questionnaire Definitions**: Stored as structured JSON files in blob storage for perfect data integrity
  - **Response Data**: Stored as JSON files eliminating all serialization corruption issues
  - **Session Tracking**: Lightweight PostgreSQL records via `response_sessions` table for progress monitoring
  - **Legacy Cleanup**: Removed all legacy PostgreSQL questionnaire tables and migration code for maintainer clarity
  - **File Storage**: Development uses file system (`temp-questionnaire-storage/`), production-ready for Google Cloud Storage
- **API Architecture**: Clean RESTful endpoints at `/api/questionnaire/` with blob storage backend
- **Data Integrity**: No more "[object Object]" serialization issues - perfect JSON preservation
- **Database Architecture (August 12, 2025)**: Complete cleanup of legacy questionnaire tables
  - **Clean Schema**: Only 4 essential PostgreSQL tables: `response_sessions`, `use_cases`, `users`, `metadata_config`
  - **Persistence Fix**: Added missing `/api/responses/:id/answers` endpoint for proper answer saving
  - **Blob Storage**: All questionnaire data (definitions + responses) stored in JSON files with PostgreSQL session tracking

## Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **PDF**: PDFKit for professional report generation

## Development Guidelines

### Database Schema Consistency Principle
**Critical**: Always maintain consistent casing between Drizzle schema definitions and database operations.

- **Schema-Database Alignment**: Drizzle schema field names (camelCase) must match exactly in all database operations
- **Common Errors to Avoid**: 
  - Using `question_id` instead of `questionId` in queries
  - Mixing `answer_value` and `answerValue` in the same operation
  - Inconsistent casing in join conditions
- **Impact of Schema Mismatches**:
  - Answer persistence failures (users complete assessments but answers aren't saved)
  - Export errors (PDF generation fails with "Invalid time value" or "Questionnaire not found")
  - Foreign key violations during answer saving

### LEGO Architecture Standards
- **Component Reusability**: Every new UI element should be evaluated for reusability potential before implementation
- **Consistent Design**: All CRUD cards follow the exact same visual specification
- **Modular Components**: Components should be self-contained and reusable across different contexts

### Quality Assurance
Always verify these critical flows after any changes:
1. **Answer Persistence**: Complete a questionnaire section and verify answers save to database
2. **Assessment Completion**: Mark response as completed and check status updates
3. **PDF Exports**: Test both template and populated questionnaire exports
4. **Data Integrity**: Verify foreign key relationships remain intact