# RSA AI Use Case Value Framework

## Overview
Strategic AI use case prioritization platform for RSA Insurance. It features a comprehensive assessment system, a 10-lever scoring framework, and an executive analytics dashboard. The platform's business vision is to streamline AI use case prioritization, enhance decision-making, and provide clear insights into potential AI investments within RSA. Its market potential lies in offering a standardized, data-driven approach to AI strategy, which is critical for large enterprises. The project aims to be a foundational tool for AI adoption and value realization within RSA.

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
- **Use Case Management**: Complete CRUD operations integrated with the RSA 10-lever scoring framework.
- **Comprehensive Detail View**: Accordion-style detail drawer with 5 expandable sections (Overview & Scoring, Business Context, Implementation & Governance, Technology & Data, Risk & Compliance) providing complete use case information with progressive disclosure.
- **Intuitive Navigation**: Clickable use case cards for seamless detail access while preserving action button functionality.
- **Assessment System**: A 6-section questionnaire featuring 14 advanced question types (e.g., company_profile, business_lines_matrix, smart_rating, ranking).
- **Manual Override System**: Toggle-based score customization with database persistence.
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts.
- **Professional PDF Exports**: Executive-grade reports for use cases, library catalogs, active portfolios, and assessment responses.
- **Real-time Persistence**: Live database synchronization for immediate data updates.
- **Dynamic Questionnaire Selection System**: Comprehensive multi-questionnaire platform with sidebar navigation, automatic session creation, progress tracking across assessments, manual save system, and priority-based questionnaire selection (started → unstarted → completed).
- **Client-Side PDF Export**: Browser-based PDF generation using Survey.js native functionality for both blank templates and completed responses.
- **Simplified Storage Architecture**: Pure JSON blob storage for questionnaire data, eliminating data corruption and simplifying data handling.

### UI/UX Decisions
- **LEGO CRUD Card Design Standard**: All use case cards adhere to a consistent design: white cards with a blue left border, subtle gray border, hover shadow, standard padding, clear title and description, color-coded rounded pill-style tags (Process, Line of Business, Use Case Type), side-by-side score display (Impact, Effort), ghost-style action buttons, and contextual actions based on the view. Cards are fully clickable for detail access.
- **LEGO Detail View Standard**: UseCaseDetailDrawer follows accordion pattern with color-coded sections (blue=overview, green=business, purple=implementation, indigo=technology, red=governance), conditional rendering based on data availability, and appropriate empty states.
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

## AI Inventory Status & Deployment Semantics

### AI Inventory Status Values
The `aiInventoryStatus` field tracks the operational lifecycle of AI tools and models:

- **`active`**: Tool is operational and in regular use by business users
- **`development`**: Tool is being developed or enhanced, not yet ready for production use
- **`testing`**: Tool is undergoing testing, validation, or pilot deployment
- **`deprecated`**: Tool is being phased out, legacy support only, discouraged for new projects

### Deployment Status Values  
The `deploymentStatus` field indicates the technical deployment environment:

- **`production`**: Live system serving business operations
- **`staging`**: Pre-production environment for final testing and validation
- **`development`**: Development environment for ongoing engineering work
- **`local`**: Local development or sandbox environment

### Status Combination Guidelines
- **Active + Production**: Fully operational business-critical tool
- **Development + Development**: New tool under active development
- **Testing + Staging**: Tool ready for final validation before production
- **Deprecated + Production**: Legacy tool scheduled for retirement
- **Active + Local**: Personal/team productivity tool not enterprise-deployed

### Data Validation Rules
- Status fields use TEXT constraints with application-level validation
- All status values are lowercase with underscores for consistency
- Invalid statuses fall back to default display without breaking functionality
- Empty/null statuses are handled gracefully with appropriate empty states

## Current Implementation Status (August 27, 2025)

### ✅ **Completed Features**
1. **Dynamic Questionnaire Selection**: Multi-questionnaire platform with sidebar navigation fully operational
2. **Session Management Optimization**: Eliminated redundant API calls and HTTP caching issues  
3. **Automatic Session Creation**: Unstarted questionnaires create sessions seamlessly without user intervention
4. **Progress Tracking**: Real-time progress monitoring across multiple assessments
5. **Manual Save System**: User-controlled persistence triggers on questionnaire switching and completion
6. **Priority-Based Selection**: Automatic questionnaire selection (started → unstarted → completed)
7. **Survey.js Integration**: Full Survey.js library integration with 161 questions rendering correctly
8. **HTTP Cache Prevention**: No-cache headers implemented for real-time session data
9. **Comprehensive Use Case Detail View**: Full accordion-style detail drawer with 5 expandable sections showing complete use case information
10. **Intuitive Card Navigation**: Clickable use case cards with preserved action button functionality for seamless user experience
11. **Enhanced AI Inventory Integration**: Complete support for three distinct use case types (RSA Internal, Industry Standard, AI Inventory) with unified interface and conditional rendering
12. **Tab-Based Filtering System**: Context-aware filtering with localStorage memory supporting "Strategic Use Cases" and "AI Tool Registry" views
13. **Accessibility Compliance**: WCAG AA compliant status indicators with non-color accessibility cues (icons, patterns, high contrast)

### 🏗️ **Technical Achievements**
- **API Optimization**: `/api/responses/user-sessions` and `/api/responses/check-session` with cache prevention headers
- **Smart Session Logic**: System detects "not started" status and skips redundant session checks
- **Component Architecture**: Complete `useQuestionnaireSelection` hook, `AssessmentSideMenu`, `SurveyJsAssessment`, and `UseCaseDetailDrawer` integration
- **Database Performance**: Lightweight PostgreSQL session tracking with JSON blob storage for questionnaire data
- **UX Improvements**: Eliminated "no active session" fallback screens, replaced with loading states during automatic session creation
- **Detail View Architecture**: Progressive disclosure pattern with conditional content rendering and appropriate empty states for missing data
- **Enhanced Database Schema**: Added AI Inventory fields (`aiInventoryStatus`, `deploymentStatus`, `lastStatusUpdate`) with TEXT constraints for flexible migrations
- **LEGO Component Evolution**: Extended existing CleanUseCaseCard and UseCaseDetailDrawer components following "Build Once, Reuse Everywhere" principle
- **Smart Filtering Logic**: Context-aware filters that adapt based on active tab (strategic vs inventory vs both) with automatic filter reset on tab changes

### ✅ **Critical Data Integrity Fixes (August 27, 2025)**
1. **Multi-Layer CRUD Data Flow Resolution**: Fixed critical type mismatches across database → storage → mappers → API → UI data flow
2. **Database Storage Layer**: Resolved array insertion errors in server/storage.ts preventing proper use case creation
3. **Mapper Layer Improvements**: Fixed null/undefined inconsistencies, added comprehensive null-to-undefined conversion for all optional fields
4. **Form Component Type Safety**: Resolved Select component type errors by implementing proper null checks for all AI governance fields
5. **Field Standardization**: Standardized thirdPartyModel/thirdPartyProvidedModel field naming across all system layers

### 🎯 **User Experience**
- **Seamless Navigation**: Users can switch between questionnaires without losing progress and access detailed use case information with single clicks
- **Visual Progress Indicators**: Sidebar tiles show status badges (Not Started, X%, Completed)
- **Automatic Workflow**: No manual session creation required - system handles everything transparently
- **Save Confirmation**: Toast notifications confirm successful saves and questionnaire switches
- **Comprehensive Detail Access**: Single-page accordion interface displaying all available use case data with expandable sections
- **Intelligent Empty States**: Graceful handling of missing data with informative empty state messages rather than hidden sections
- **Unified Multi-Type Interface**: Single interface serving both strategic use cases and AI inventory items with clear visual differentiation
- **Context-Aware Filtering**: Smart tab system that remembers user preference and shows relevant filters for each use case type
- **Enhanced Status Communication**: Clear status pills and deployment indicators with full accessibility support for users with visual impairments
- **Reliable CRUD Operations**: All create, read, update, delete operations now function correctly with proper data validation and type safety