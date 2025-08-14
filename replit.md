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
- **Client-Side Survey.js PDF Export (August 14, 2025)**: Implemented proper browser-based PDF generation
  - **Authentic Survey.js Output**: PDFs now generated using Survey.js native functionality in browser environment
  - **Data Integrity Protection**: Filled questionnaires exported as read-only PDFs to preserve response integrity
  - **Existing Button Integration**: Updated existing export buttons instead of creating duplicates
  - **Client-Side Processing**: Eliminated server-side conversion issues by using Survey.js in its intended browser context
  - **Dual Export Modes**: Blank templates (editable) and completed responses (read-only) with proper Survey.js formatting
- **Legacy Route Cleanup Completed (August 14, 2025)**: Removed all unused legacy questionnaire routes for consistency
  - **Complete Legacy Removal**: Cleaned up unused session management, answer handling, and completion routes
  - **Export Routes Re-enabled**: Restored PDF export functionality after blob migration completion
  - **Single API Pattern**: Ensured only one consistent way of performing actions in the system
  - **Clean Import Structure**: Removed unused service imports and simplified route organization
  - **Blob-Compatible Exports**: Assessment and use case PDF exports fully operational, questionnaire exports marked for future implementation
- **Fixed Start Over Button & Session Management (August 13, 2025)**: Implemented user-requested behavior changes
  - **Start Over Always Visible**: Button now shows when progress > 0% regardless of completion status
  - **Completed Sessions Reopenable**: Users can reopen completed assessments and use Start Over to restart
  - **No Auto-Completion**: Removed automatic completion at 100% progress - users must manually complete
  - **Progress Logic Fixed**: Panel questions now require ALL nested input elements to be completed (6/6 fields required)
  - **Session Status Correction**: Status remains "in_progress" until manually completed, allowing restarts
- **Simplified Survey.js Storage Architecture (August 13, 2025)**: Eliminated data corruption at the root cause
  - **Root Cause Fixed**: Replaced complex answer merging logic with direct Survey.js data replacement
  - **Clean Storage Format**: `surveyData: Record<string, any>` stores Survey.js data exactly as submitted
  - **No More Corruption**: Eliminates nested answer objects, merge conflicts, and "[object Object]" issues
  - **Legacy Cleanup**: Removed all corrupted answers arrays from existing response files
  - **Simplified Code**: Removed unnecessary conversion between Survey.js format and internal format
  - **Perfect Data Integrity**: Values stored exactly as `{fieldName: value}` matching Survey.js expectations
- **Clean Blob-First Architecture**: Complete migration from PostgreSQL to pure JSON blob storage for questionnaire data
  - **Questionnaire Definitions**: Stored as structured JSON files in blob storage for perfect data integrity
  - **Response Data**: Stored as JSON files eliminating all serialization corruption issues
  - **Session Tracking**: Lightweight PostgreSQL records via `response_sessions` table for progress monitoring
  - **Legacy Cleanup**: Removed all legacy PostgreSQL questionnaire tables and migration code for maintainer clarity
  - **File Storage**: Development uses file system (`temp-questionnaire-storage/`), production-ready for Google Cloud Storage
- **API Architecture**: Clean RESTful endpoints at `/api/questionnaire/` with blob storage backend
- **Database Architecture (August 12, 2025)**: Complete cleanup of legacy questionnaire tables
  - **Clean Schema**: Only 4 essential PostgreSQL tables: `response_sessions`, `use_cases`, `users`, `metadata_config`
  - **Persistence Fix**: Added missing `/api/responses/:id/answers` endpoint for proper answer saving
  - **Blob Storage**: All questionnaire data (definitions + responses) stored in JSON files with PostgreSQL session tracking
- **Survey.js Performance Fix (August 12, 2025)**: Solved critical page refresh issue
  - **Context API Architecture**: Created `SaveStatusProvider` to isolate save status from Survey.js component
  - **Component Isolation**: Built `IsolatedSurveyContainer` with zero re-render triggers
  - **Sticky Header**: Added sticky header functionality for improved user experience during scrolling
  - **Race Condition Fix**: Eliminated query invalidation during auto-save to prevent user input overwriting
  - **No More Page Refresh**: Save status updates are completely isolated from Survey.js form rendering
- **Section Listing System (August 13, 2025)**: Implemented proper definition-based sections
  - **Real-Time Section Discovery**: Added `/api/questionnaire/sections` endpoint that scans definition folders
  - **Accurate Question Counting**: Fixed question count logic to count actual Survey.js elements (86 vs 16 previously)
  - **Parallel Definition Loading**: Efficient `Promise.all()` loading of multiple section definitions with caching
  - **Consistent Time Estimation**: Created centralized `TIME_ESTIMATION` constants (2.5-4 min multipliers) for app-wide consistency

### Survey.js Integration & Performance Optimization (August 13, 2025)
- **Library Integration**: Successfully installed and configured Survey.js (version 2.30) packages
- **Simplified Architecture**: Removed legacy format conversion code for cleaner, faster implementation
- **In-Memory Caching**: Added simple dictionary-based caching for questionnaire definitions to improve performance
  - **Cache Implementation**: `Map<string, QuestionnaireDefinition>` in `QuestionnaireService`
  - **Cache Hit/Miss Logging**: Detailed logging for performance monitoring
  - **Cache Management APIs**: Added endpoints for cache statistics and manual cache clearing
  - **Automatic Cache Updates**: New questionnaires automatically cached upon creation
- **Code Cleanup**: Removed unused `SurveyJsService` and legacy `/api/questionnaires/:id` endpoint
- **Direct Storage Access**: Survey configurations served directly from blob storage without conversion overhead
- **Components Created**:
  - `SurveyJsContainer.tsx`: Full-featured Survey.js integration with auto-save
  - `SimpleSurveyJsDemo.tsx`: Basic Survey.js demonstration
  - `StandaloneSurveyDemo.tsx`: Database-independent Survey.js showcase
  - `ProgressStatusLegoBlock.tsx`: Reusable LEGO component for save status display
- **Routes Added**: 
  - `/surveyjs-demo`: Simple Survey.js integration test
  - `/surveyjs-standalone`: Advanced RSA assessment showcase with Survey.js
  - `/assessment/surveyjs`: Full Survey.js assessment integration
- **Enhanced Question Types**: Matrix questions, rating scales, conditional logic, and responsive design
- **Database Bridge**: Seamless conversion between Survey.js data format and existing blob storage system

## Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **PDF**: PDFKit for professional report generation

## Development Guidelines

### Question Counting Logic (August 14, 2025)
**IMPORTANT: Do NOT modify this logic - it is working as designed**

The system correctly counts **top-level Survey.js elements (panels) as questions**, not individual input fields within panels:
- **Design Logic**: Each `element` in Survey.js pages counts as 1 question
- **Panel Behavior**: A panel with 6 input fields = 1 question (correct)
- **Completion Logic**: Panel is "answered" only when ALL nested input elements have values
- **Database Storage**: `answered_questions` reflects panel-level completion (e.g., 1 panel = 1 answered question)
- **Frontend Display**: Should show database value, not input field count

**Example**: Assessment with 1 panel containing 6 fields shows "1 Question Answered" (not 7).

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