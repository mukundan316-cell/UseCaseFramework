# RSA AI Use Case Value Framework

## Overview
The RSA AI Use Case Value Framework is a strategic platform designed to streamline AI use case prioritization for RSA Insurance. Its purpose is to enhance decision-making and provide clear insights into potential AI investments. The platform offers a comprehensive assessment system, a 10-lever scoring framework, and an executive analytics dashboard, aiming to establish a standardized, data-driven approach to AI strategy and foster AI adoption and value realization within RSA.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components following "Build Once, Reuse Everywhere" principle
- **Database**: Consistent camelCase field naming between Drizzle schema and queries
- **Data Consistency**: Complete boolean standardization and minimal transformations across all layers

## System Architecture

### Core Principles
The guiding principle is **"Build Once, Reuse Everywhere"**, meaning every component is designed as a reusable module with consistent design patterns across the entire application, including UI elements like CRUD cards and form components.

### Tech Stack
- **Frontend**: React, TypeScript, shadcn/ui, TailwindCSS, Wouter
- **Backend**: Node.js, Express, Drizzle ORM, Zod validation
- **Database**: Hybrid approach utilizing PostgreSQL for session tracking and JSON blob storage for questionnaire data.

### Core Features
- **Use Case Management**: Full CRUD operations integrated with the RSA 10-lever scoring framework.
- **Comprehensive Detail View**: Accordion-style detail drawer with 5 expandable sections.
- **Assessment System**: A 6-section questionnaire with 14 question types and a manual override system for score customization.
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts.
- **Professional PDF Exports**: Executive-grade reports for use cases, library catalogs, active portfolios, and assessment responses.
- **Real-time Persistence**: Live database synchronization for immediate data updates.
- **Dynamic Questionnaire Selection System**: Multi-questionnaire platform with sidebar navigation, automatic session creation, progress tracking, and manual save.
- **File Upload System**: Supports PDF, PowerPoint, and image formats with automatic PDF conversion for consistent preview. Utilizes object storage with LibreOffice for PowerPoint and ImageMagick for image conversion, featuring a secure backend proxy.
- **Enhanced Presentation Viewer**: Full-screen PDF viewer with page navigation and controls, integrated into both CRUD modal and detail drawer.

### UI/UX Decisions
- **LEGO CRUD Card Design Standard**: Consistent card design with white background, blue left border, color-coded tags, side-by-side score display, and ghost-style action buttons. Cards are fully clickable for detail access.
- **LEGO Detail View Standard**: Accordion pattern with color-coded sections and conditional rendering.
- **LEGO Form Standards**: Consistent styling for all form inputs using shadcn/ui components and standardized error/success states.

### System Design Choices
- **Questionnaire Data Storage**: Definitions and response data are stored as structured JSON files in blob storage; session tracking uses lightweight PostgreSQL records.
- **API Architecture**: Clean RESTful endpoints under `/api/questionnaire/` with a blob storage backend.
- **Database Schema**: Essential PostgreSQL tables include `response_sessions`, `use_cases`, `users`, and `metadata_config`.
- **AI Inventory Status & Deployment Semantics**: `aiInventoryStatus` tracks operational lifecycle; `deploymentStatus` indicates technical deployment environment. Both use TEXT constraints with application-level validation.
- **Data Integrity**: Enhanced null safety, score calculation safety, database validation, and safe fallback logic. All boolean fields are standardized to 'true'/'false' string types for consistency.
- **Manual Override Architecture**: Server-side `updateUseCase` method explicitly allows null values for manual override fields (`manualImpactScore`, `manualEffortScore`, `manualQuadrant`, `overrideReason`) to enable proper database clearing when toggles are disabled.
- **Presentation Integration**: "Use Case Definition Document" section positioned after Business Context. Database fields include `presentationUrl`, `presentationPdfUrl`, `presentationFileName`, `presentationUploadedAt`.

### Architectural Consistency Guidelines
- **Data Type Standardization**: Critical to use consistent string types ('true'/'false') across the entire application stack (Database Schema, Validation, Frontend Types, Components, Mappers, and Database Queries) to eliminate transformation layers and achieve minimal transformations. Scoring fields adhere to a 1-5 range. String enums maintain consistent casing.
- **Field Naming Consistency**: Database `snake_case` maps to Frontend `camelCase` automatically via Drizzle.
- **API Response Consistency**: Direct passthrough from storage layer to API routes.
- **Component Consistency Patterns**: Standardized interfaces and boolean handling for reusable components.
- **Migration Safety Rules**: Never change primary key types; safe boolean migration pattern involves adding a new text column, migrating data, and dropping the old column.
- **Validation Layer Simplification**: Clean Zod schemas with simple enum and range validations.
- **Error Prevention Checklist**: Focus on avoiding boolean ↔ string transformations, runtime case conversions, score range violations, enum mismatches, null/undefined inconsistencies, and ID type changes.
- **Toggle Component Null Value Handling**: Server-side logic explicitly allows and processes null values for fields that are intended to be cleared by toggle components, ensuring data integrity.
- **Database Migration Safety Protocol**: Adherence to a strict migration workflow using `npm run db:push` to ensure schema synchronization and data integrity.
- **Performance Optimization Guidelines**: Use efficient query patterns, preferring direct string comparisons and indexed fields for filtering.

## External Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **PDF**: PDFKit, Survey.js
- **Cloud Storage**: Google Cloud Storage (for production blob storage)