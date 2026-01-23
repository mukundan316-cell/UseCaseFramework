# Hexaware AI Use Case Value Framework

## Overview
This project is a production-ready strategic platform designed to prioritize AI use cases within Hexaware. It features a comprehensive scoring framework, an executive analytics dashboard, and a full CRUD management system. The platform aims to streamline AI strategy and decision-making by enabling efficient management, evaluation, and tracking of AI initiatives, ultimately supporting Hexaware's business vision and market potential in the AI domain.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components
- **Database**: camelCase field naming, string booleans ('true'/'false')
- **Code Quality**: Centralized config, comprehensive error handling, minimal validation
- **Development Focus**: Quick wins without complexity
- **Bubble Sizing**: Moderate exponential scaling (power 1.3)
- **Branding**: Hexaware official brand colors (#3C2CDA, #1D86FF, #14CBDE, #07125E), Manrope/Heebo fonts

## System Architecture

### UI/UX Decisions
The platform adopts Hexaware's official branding, utilizing colors (#3C2CDA, #1D86FF, #14CBDE, #07125E) and typography (Manrope/Heebo fonts). UI components are built with shadcn/ui and TailwindCSS, emphasizing a "LEGO-style" modularity for reusability and configurability. Interactive elements like matrix plots and bubble charts are optimized for executive analytics.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for state management, react-hook-form with Zod for forms, and Recharts for data visualization. Client-side PDF generation is used.
- **Backend**: Node.js 20.x with Express.js, PostgreSQL (Neon-backed) as the database, and Drizzle ORM for database interactions.
- **Development**: npm for package management, TypeScript 5.x, and tsx for hot-reloading development. Both frontend and backend run on port 5000.

### Feature Specifications
- **Core Data Management**: Full CRUD operations for AI use cases, including a 10-lever scoring framework with automated recalculation and manual override support.
- **Data Model**: `clients`, `engagements`, `use_cases`, `file_attachments`, `metadata_config`, `response_sessions`, and `users` entities, forming a Client → Engagement → Use Cases hierarchy. `metadata_config` centralizes dropdown options, scoring logic, T-shirt sizing, and Target Operating Model (TOM) configuration.
- **Target Operating Model (TOM)**: Configurable layer mapping use cases to lifecycle phases based on governance gates and status. Supports multiple presets (4-phase hybrid, 6-phase RSA TOM, custom). Gate-based phase assignment: use cases are "Unphased" until Operating Model gate passes (Primary Business Owner assigned), then enter first phase of active preset. Metadata-driven - no hardcoded phase names. Aligns with NIST AI RMF and ISO 42001 governance best practices.
- **Analytics**: Interactive matrix plots, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform using Survey.js for dynamic workflows.
- **File Management**: Local filesystem storage (`uploads/`) for various file types, with metadata tracking and a 50MB per file limit.
- **Modularity**: ~65 active LEGO components for reusability.
- **Validation**: Minimal validation (title + description) using Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export with auto-ID generation.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries, and secure session management.
- **Performance**: Client-side PDF generation, debounced search, and optimized rendering.
- **T-shirt Sizing**: Implements benchmark compliance for cost and timeline estimations (geo-agnostic).
- **Value Realization System**: KPI-based ROI tracking for use cases, including a KPI library, process mapping, and automated value estimation based on maturity scores. Multi-currency support (GBP, USD, EUR, CAD) with configurable hourly rates per currency (default: £45/hr GBP, $55/hr USD, €50/hr EUR, C$60/hr CAD).
- **Capability Transition Benchmark Derivation**: Automated population of capability transition data from use case attributes, using benchmark archetypes and pace modifiers.
- **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults integrated into CRUD operations with override protection.
- **Database-Driven Configuration**: All framework features are driven by the `metadata_config` table.
- **Compliance Features**: Duplicate detection, full audit trail (`use_case_change_log`), and role evolution tracking within capability transitions.
- **Governance Workflow**: Foundation Layer gates (Operating Model → Intake & Prioritization → Responsible AI → Activation) must be cleared before use cases enter active portfolio. Auto-calculated from field completeness. Backend enforcement blocks activation API calls and auto-deactivates if gates regress. Visual stepper in CRUD modal shows real-time gate progress.
- **Soft Progressive Data Capture**: Phase-aligned guidance system that shows users what data to complete for each TOM phase. Each phase has entry/exit dataRequirements and unlockedFeatures defined in metadata. PhaseReadinessLegoBlock displays current phase, readiness percentage, and pending requirements. CRUD modal tabs show "Focus" badges for recommended tabs. No hard blocking - all tabs remain accessible. Metadata-driven via REQUIREMENT_TAB_MAPPING constant. Supports both 4-phase hybrid and 6-phase RSA TOM presets with phase-agnostic functionality.
- **Phase Transition Governance**: When changing use case status triggers a phase transition, the system checks if exit requirements are met. If requirements are incomplete (canProgress=false), a warning dialog displays pending exit requirements and requires the user to provide a justification reason before proceeding. The override reason is stored in lastPhaseTransitionReason for audit purposes. Transitions from unphased/disabled states bypass this check since they have no exit requirements. Aligns with NAIC Model Bulletin, NIST AI RMF, and ISO 42001 industry governance standards.
- **Navigation**: All features accessible via tab navigation from home page: Dashboard View, Explorer, Insights, AI Assessment, Admin.

### Insights Dashboard Structure
All four Insights tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) follow a consistent pattern:
1. **Summary Cards**: 4 key metrics with icons and help tooltips
2. **Distribution Charts**: Visual breakdowns (bar charts, progress bars)
3. **Use Case Table**: Detailed list with status badges and key metrics

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion, Radix UI primitives
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session Management**: express-session, connect-pg-simple
- **Specialized**: Survey.js ecosystem