# Hexaware AI Use Case Value Framework

## Overview
This project is a production-ready strategic platform designed to prioritize AI use cases within Hexaware. It features a comprehensive scoring framework, an executive analytics dashboard, and a full CRUD management system. The platform aims to streamline AI strategy and decision-making by enabling efficient management, evaluation, and tracking of AI initiatives, ultimately supporting Hexaware's business vision and market potential in the AI domain.

## Recent Changes (January 2026)
- **Insights Scope Toggle (Latest)**: Added scope toggle to Insights page allowing users to switch between "Active Portfolio" (use cases that passed governance) and "Reference Library" (all use cases for planning). All 4 Insights tabs now respect the selected scope with dynamic API endpoints and badge styling.
- **Sequential Governance Gate UI**: Updated GovernanceStepperLegoBlock to show "Waiting" status with lock icons for gates blocked by prerequisites. Intake gate waits for Operating Model; RAI gate waits for Intake. Tooltips explain which prior gate is blocking.
- **Questionnaire Auto-Seeding**: Fixed Admin Assessment questionnaire loading by adding auto-initialization in seed.ts. Questionnaire storage now reads both flat JSON files and subdirectories. Demo questionnaire seeded automatically on startup.
- **Governance Workflow Enforcement**: Complete governance enforcement requiring all 3 Foundation Layer gates to pass before use case activation. Auto-calculation from field completeness (no manual approval). Backend blocks activation API calls when gates incomplete and auto-deactivates already-active cases if gates regress. No legacy grandfathering - all 125 use cases reset to reference library.
- **Governance Workflow System**: Implemented Foundation Layer governance gates (Operating Model → Intake & Prioritization → Responsible AI → Activation). Use cases must pass all three gates before entering active portfolio. Includes `governance_audit_log` table for compliance tracking.
- **Value Realization Improvements**: Fixed KPI-derived value estimation to properly aggregate £45/hr hourly rates, displaying £12.8M total across 72 use cases with estimates
- **Insights Tab Consistency**: Standardized all four Insights tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) with matching layout patterns including summary cards, distribution charts, and use case tables
- **Project Cleanup**: Removed 20 unused LEGO-block components, temp screenshot images, and outdated planning documentation
- **Bulk Value Derivation**: Added `/api/value/derive-all` endpoint for batch processing of value estimates across all use cases

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
- **Data Model**: `use_cases`, `file_attachments`, `metadata_config`, `response_sessions`, and `users` entities. `metadata_config` centralizes dropdown options, scoring logic, T-shirt sizing, and Target Operating Model (TOM) configuration.
- **Target Operating Model (TOM)**: Configurable layer mapping use cases to lifecycle phases based on status, supporting four operating model presets. Features API endpoints and UI for configuration and visualization. Supports multi-client configurations.
- **Analytics**: Interactive matrix plots, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform using Survey.js for dynamic workflows.
- **File Management**: Local filesystem storage (`uploads/`) for various file types, with metadata tracking and a 50MB per file limit.
- **Modularity**: ~65 active LEGO components for reusability (pruned from 85+).
- **Validation**: Minimal validation (title + description) using Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export with auto-ID generation.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries, and secure session management.
- **Performance**: Client-side PDF generation, debounced search, and optimized rendering.
- **T-shirt Sizing**: Implements UK benchmark compliance for cost and timeline estimations.
- **Value Realization System**: KPI-based ROI tracking for use cases, including a KPI library, process mapping, and automated value estimation based on maturity scores. Uses £45/hr for hour-based KPI estimates.
- **Capability Transition Benchmark Derivation**: Automated population of capability transition data (staffing curves, independence projections) from use case attributes, using benchmark archetypes and pace modifiers.
- **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults integrated into CRUD operations with override protection.
- **Database-Driven Configuration**: All framework features are driven by the `metadata_config` table, providing a flexible and configurable system with default fallbacks.
- **Compliance Features**: Duplicate detection, full audit trail (`use_case_change_log`), and role evolution tracking within capability transitions.
- **Governance Workflow**: Foundation Layer gates (Operating Model → Intake → RAI) must be cleared before use cases enter active portfolio. Auto-calculated from field completeness:
  - Operating Model: Primary Business Owner, Use Case Status (not Discovery), Business Function
  - Intake & Prioritization: All 10 scoring levers (1-5 range, 0 = incomplete)
  - Responsible AI: All 5 RAI fields answered (explainability, customer harm risk, human accountability, data location, third-party model)
  Backend enforcement blocks activation API calls and auto-deactivates if gates regress. Visual stepper in CRUD modal shows real-time gate progress.
- **Navigation**: All features accessible via tab navigation from home page: Dashboard View, Explorer, Insights, AI Assessment, Admin.

### Insights Dashboard Structure
All four Insights tabs follow a consistent pattern:
1. **Summary Cards**: 4 key metrics with icons and help tooltips
2. **Distribution Charts**: Visual breakdowns (bar charts, progress bars)
3. **Use Case Table**: Detailed list with status badges and key metrics

Tabs:
- **Value Realization**: Portfolio value tracking (£12.8M estimated, 72 use cases with estimates)
- **Operating Model**: TOM phase distribution and lifecycle management
- **Capability Transition**: Staffing projections and independence metrics
- **Responsible AI**: RAI compliance scoring and risk assessment

## Project Structure (Key Directories)
```
client/src/
├── components/
│   ├── insights/          # 4 Insights tab views
│   ├── lego-blocks/       # ~65 reusable LEGO components
│   ├── analytics/         # Dashboard and chart components
│   └── ui/                # shadcn/ui primitives
├── pages/                 # Route pages
└── lib/                   # Utilities and API client
server/
├── routes.ts              # All API endpoints
├── derivation.ts          # Value/TOM/capability derivation logic
└── storage.ts             # Database interface
shared/
├── schema.ts              # Drizzle ORM schema
└── valueRealization.ts    # Value calculation utilities
```

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session Management**: express-session, connect-pg-simple
- **Specialized**: Survey.js ecosystem, Radix UI primitives
