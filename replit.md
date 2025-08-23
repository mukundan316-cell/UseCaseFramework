# RSA AI Use Case Value Framework

## Overview
Strategic AI use case prioritization platform for RSA Insurance. It features a comprehensive assessment system, a 12-lever scoring framework, and an executive analytics dashboard. The platform's business vision is to streamline AI use case prioritization, enhance decision-making, and provide clear insights into potential AI investments within RSA. Its market potential lies in offering a standardized, data-driven approach to AI strategy, which is critical for large enterprises. The project aims to be a foundational tool for AI adoption and value realization within RSA.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components following "Build Once, Reuse Everywhere" principle
- **Database**: Consistent camelCase field naming between Drizzle schema and queries

## System Architecture

### Core Principles
**"Build Once, Reuse Everywhere"** - Every component is designed as a reusable LEGO block with consistent design patterns across the entire application. This applies to UI components like CRUD cards and form elements.

### Tech Stack
- **Frontend**: React, TypeScript, shadcn/ui, TailwindCSS, Wouter
- **Backend**: Node.js, Express, Drizzle ORM, Zod validation
- **Database**: Hybrid approach utilizing PostgreSQL for session tracking and JSON blob storage for questionnaire data.

### Core Features
- **Use Case Management**: Complete CRUD operations integrated with the RSA 12-lever scoring framework.
- **Assessment System**: A 6-section questionnaire featuring 14 advanced question types (e.g., company_profile, business_lines_matrix, smart_rating, ranking).
- **Manual Override System**: Toggle-based score customization with database persistence.
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts.
- **Professional PDF Exports**: Executive-grade reports for use cases, library catalogs, active portfolios, and assessment responses.
- **Real-time Persistence**: Live database synchronization for immediate data updates.
- **Dynamic Questionnaire Selection System**: Comprehensive multi-questionnaire platform with sidebar navigation, automatic session creation, progress tracking across assessments, manual save system, and priority-based questionnaire selection (started → unstarted → completed).
- **Client-Side PDF Export**: Browser-based PDF generation using Survey.js native functionality for both blank templates and completed responses.
- **Simplified Storage Architecture**: Pure JSON blob storage for questionnaire data, eliminating data corruption and simplifying data handling.

### UI/UX Decisions
- **LEGO CRUD Card Design Standard**: All use case cards adhere to a consistent design: white cards with a blue left border, subtle gray border, hover shadow, standard padding, clear title and description, color-coded rounded pill-style tags (Process, Line of Business, Use Case Type), side-by-side score display (Impact, Effort), ghost-style action buttons, and contextual actions based on the view.
- **LEGO Form Standards**: Field labels use `text-base font-semibold text-gray-900`, consistent styling for all form inputs using shadcn/ui components, and standardized error/success states.

### System Design Choices
- **Questionnaire Data Storage**: Questionnaire definitions and response data are stored as structured JSON files in blob storage. Session tracking uses lightweight PostgreSQL records.
- **API Architecture**: Clean RESTful endpoints under `/api/questionnaire/` with a blob storage backend.
- **Database Schema**: Only essential PostgreSQL tables are maintained: `response_sessions`, `use_cases`, `users`, `metadata_config`.

## External Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **PDF**: PDFKit (for report generation), Survey.js (for client-side PDF export functionality)
- **Planned Integration**: Google Cloud Storage (for production blob storage)

## Current Implementation Status (August 23, 2025)

### ✅ **Completed Features**
1. **Dynamic Questionnaire Selection**: Multi-questionnaire platform with sidebar navigation fully operational
2. **Session Management Optimization**: Eliminated redundant API calls and HTTP caching issues  
3. **Automatic Session Creation**: Unstarted questionnaires create sessions seamlessly without user intervention
4. **Progress Tracking**: Real-time progress monitoring across multiple assessments
5. **Manual Save System**: User-controlled persistence triggers on questionnaire switching and completion
6. **Priority-Based Selection**: Automatic questionnaire selection (started → unstarted → completed)
7. **Survey.js Integration**: Full Survey.js library integration with 161 questions rendering correctly
8. **HTTP Cache Prevention**: No-cache headers implemented for real-time session data

### 🏗️ **Technical Achievements**
- **API Optimization**: `/api/responses/user-sessions` and `/api/responses/check-session` with cache prevention headers
- **Smart Session Logic**: System detects "not started" status and skips redundant session checks
- **Component Architecture**: Complete `useQuestionnaireSelection` hook, `AssessmentSideMenu`, and `SurveyJsAssessment` integration
- **Database Performance**: Lightweight PostgreSQL session tracking with JSON blob storage for questionnaire data
- **UX Improvements**: Eliminated "no active session" fallback screens, replaced with loading states during automatic session creation

### 🎯 **User Experience**
- **Seamless Navigation**: Users can switch between questionnaires without losing progress
- **Visual Progress Indicators**: Sidebar tiles show status badges (Not Started, X%, Completed)
- **Automatic Workflow**: No manual session creation required - system handles everything transparently
- **Save Confirmation**: Toast notifications confirm successful saves and questionnaire switches