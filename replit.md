# Hexaware AI Use Case Value Framework

## Overview
This project is a production-ready strategic platform for prioritizing AI use cases within Hexaware. It features a comprehensive scoring framework, an executive analytics dashboard, and a full CRUD management system. The platform aims to streamline AI strategy and decision-making by enabling efficient management, evaluation, and tracking of AI initiatives, ultimately supporting Hexaware's business vision and market potential in the AI domain.

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
The platform uses Hexaware's official branding, colors, and typography. UI components are built with shadcn/ui and TailwindCSS, emphasizing modularity. Interactive elements like matrix plots and bubble charts are optimized for executive analytics.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter, TanStack Query, react-hook-form with Zod, and Recharts.
- **Backend**: Node.js 20.x with Express.js, PostgreSQL (Neon-backed), and Drizzle ORM.
- **Development**: npm for package management, TypeScript 5.x, and tsx for hot-reloading. Both frontend and backend run on port 5000.

### Modular Architecture
- **Server Routes**: Domain-based modular structure in `server/routes/` with specialized modules for use cases, value, responses, assessments, capability, and TOM.
- **CRUD Modal Tabs**: Modular tab components in `client/src/components/lego-blocks/crud-modal-tabs/` for details, scoring, operating model, responsible AI, and guidance.
- **Benefits**: Improved maintainability, faster IDE performance, clearer separation of concerns.

### Feature Specifications
- **Core Data Management**: Full CRUD for AI use cases, including a 10-lever scoring framework with automated recalculation and manual override.
- **Data Model**: `clients`, `engagements`, `use_cases`, `file_attachments`, `metadata_config`, `response_sessions`, and `users` entities, forming a Client → Engagement → Use Cases hierarchy.
- **Target Operating Model (TOM)**: Configurable layer mapping use cases to lifecycle phases, aligned with NIST AI RMF and ISO 42001. Phase transitions are config-driven with specific gate requirements.
- **Analytics**: Interactive matrix plots, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform using Survey.js.
- **File Management**: Local filesystem storage (`uploads/`) with metadata tracking and a 50MB per file limit.
- **Modularity**: ~70 active LEGO components for reusability, with modular route and modal architectures.
- **In-App Help & Guidance**: Role-based documentation with step-by-step visual guides for Business Users (create use cases, link KPIs, scoring), Strategy/PMO (priority matrix, insights analysis, value validation), and Admins (client management, TOM configuration, gate definitions, KPI library). Uses visual cards with numbered steps and color-coded role sections.
- **Validation**: Minimal validation using Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export with auto-ID generation.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries, and secure session management.
- **Performance**: Client-side PDF generation, debounced search, and optimized rendering.
- **T-shirt Sizing**: Implements benchmark compliance for cost and timeline estimations.
- **Value Realization System**: KPI-based ROI tracking for use cases, including a comprehensive KPI library (169 KPIs), process mapping, and automated value estimation, supporting multi-currency. Includes KPI types, value streams, confidence factors, and a validation workflow.
- **Capability Transition Benchmark Derivation**: Automated population of capability transition data from use case attributes, using benchmark archetypes.
- **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults integrated into CRUD operations with override protection.
- **Database-Driven Configuration**: All framework features are driven by the `metadata_config` table.
- **Compliance Features**: Duplicate detection, full audit trail (`use_case_change_log`), and role evolution tracking.
- **Governance Workflow**: Foundation Layer gates must be cleared before use cases enter an active portfolio. Governance gates are enforced only when activating use cases. Includes visual gate-to-phase flow diagram showing which gates unlock which transitions, loaded dynamically from phaseTransitions config.
- **Soft Progressive Data Capture**: Phase-aligned guidance system indicates required data for each TOM phase.
- **Insights Dashboard Structure**: All four Insights tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) follow a consistent pattern: Summary Cards, Distribution Charts, and Use Case Table.

### Two-Tier Portfolio Model (Feb 2026)
Aligned with AWS Five V's Framework and HBR Portfolio Model best practices:
- **Reference Library = Ideation Phase**: Idea pool for strategic planning. Only includes reference-tier use cases, all counted as Ideation.
- **Active Portfolio = Assessment → Operate**: Committed pipeline. Only includes active-tier use cases. **Minimum phase is Assessment** (Ideation reserved for Reference Library only).
- **Activation Logic**: When activating a use case, it enters Assessment phase (minimum). Further progression based on status/deployment.
- **Phase Derivation**: `derivePhase()` in `shared/tom.ts` accepts `libraryTier` parameter to enforce phase logic.
- **API Scope Parameters**: 
  - `scope=active` or `scope=dashboard` → Active Portfolio only (active-tier use cases)
  - `scope=reference` → Reference Library only (reference-tier use cases, all Ideation)
  - `scope=all` → All use cases (for admin/reporting)
- **Insights Views**: All 4 tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) support scope toggle.
- **TOM Phase Distribution UI**: Two-section design for intuitive display:
  1. **Idea Pool Card** (purple): Shows Reference Library count with "View Library" link (only in Active Portfolio view)
  2. **Active Pipeline Section**: Shows Assessment → Operate phases only (Ideation filtered out from Active Portfolio view)

## Recent Changes (Feb 2026)
- **Two-Tier Portfolio Model**: Reference Library (Ideation) vs Active Portfolio (Assessment+) aligned with industry frameworks
- **Phase Derivation Refactor**: Added `libraryTier` parameter to `derivePhase()` for Reference Library use cases to always return Ideation
- **Activation Flow Update**: Scored use cases auto-enter Assessment phase on activation; unscored enter Ideation
- **Phase Summary API**: Updated to correctly calculate phase distribution based on scope (reference vs active vs all)
- **Admin Phase Distribution Fix**: When scope='all', API now uses each use case's actual libraryTier for correct phase counts in Admin panel
- **View Library Navigation**: /insights route now wrapped with Layout component for consistent navigation; tab clicks now navigate to proper URLs
- **Tab Navigation Fix**: Layout tabs now use wouter routing to navigate between pages, not just state updates
- **UI Descriptions**: Updated tooltips and dialog text to reflect "Idea pool" vs "Active Pipeline" mental model
- **Multi-tenancy**: Removed client-specific hardcoding (RSA/Markel references) for reusability across clients
- **Questionnaire Config**: Assessment questionnaire ID now configurable via `metadata.activeQuestionnaireId` with fallback to default
- **Duplicate Routes**: Consolidated `/api/derive/value-all` and `/api/value/derive-all` into single endpoint
- **LSP Fixes**: Resolved TypeScript errors for optional TOM config properties (phaseTransitions, gateDefinitions)
- **API Cleanup**: Aligned duplicate detection endpoints with storage interface (`/api/use-cases/check-duplicates`, `/api/use-cases/:id/resolve-duplicate`)

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion, Radix UI primitives
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session Management**: express-session, connect-pg-simple
- **Specialized**: Survey.js ecosystem