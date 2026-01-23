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
The platform adopts Hexaware's official branding, utilizing specified colors and typography. UI components are built with shadcn/ui and TailwindCSS, emphasizing a "LEGO-style" modularity. Interactive elements like matrix plots and bubble charts are optimized for executive analytics.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter, TanStack Query, react-hook-form with Zod, and Recharts.
- **Backend**: Node.js 20.x with Express.js, PostgreSQL (Neon-backed) as the database, and Drizzle ORM.
- **Development**: npm for package management, TypeScript 5.x, and tsx for hot-reloading. Both frontend and backend run on port 5000.

### Feature Specifications
- **Core Data Management**: Full CRUD for AI use cases, including a 10-lever scoring framework with automated recalculation and manual override.
- **Data Model**: `clients`, `engagements`, `use_cases`, `file_attachments`, `metadata_config`, `response_sessions`, and `users` entities, forming a Client → Engagement → Use Cases hierarchy.
- **Target Operating Model (TOM)**: Configurable layer mapping use cases to lifecycle phases based on governance gates and status. Supports multiple presets and aligns with NIST AI RMF and ISO 42001.
- **Analytics**: Interactive matrix plots, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform using Survey.js.
- **File Management**: Local filesystem storage (`uploads/`) with metadata tracking and a 50MB per file limit.
- **Modularity**: ~65 active LEGO components for reusability.
- **Validation**: Minimal validation using Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export with auto-ID generation.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries, and secure session management.
- **Performance**: Client-side PDF generation, debounced search, and optimized rendering.
- **T-shirt Sizing**: Implements benchmark compliance for cost and timeline estimations.
- **Value Realization System**: KPI-based ROI tracking for use cases, including a KPI library, process mapping, and automated value estimation. Supports multi-currency.
- **Capability Transition Benchmark Derivation**: Automated population of capability transition data from use case attributes, using benchmark archetypes.
- **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults integrated into CRUD operations with override protection.
- **Database-Driven Configuration**: All framework features are driven by the `metadata_config` table.
- **Compliance Features**: Duplicate detection, full audit trail (`use_case_change_log`), and role evolution tracking.
- **Governance Workflow**: Foundation Layer gates must be cleared before use cases enter active portfolio. Backend enforcement blocks activation API calls and auto-deactivates if gates regress.
- **Soft Progressive Data Capture**: Phase-aligned guidance system shows required data for each TOM phase via "Focus" badges.
- **Phase Transition Governance**: Checks for exit requirements during phase transitions, requiring justification for incomplete requirements.
- **Navigation**: All features accessible via tab navigation from home page: Dashboard View, Explorer, Insights, AI Assessment, Admin.

### Insights Dashboard Structure
All four Insights tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) follow a consistent pattern: Summary Cards, Distribution Charts, and Use Case Table.

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion, Radix UI primitives
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session Management**: express-session, connect-pg-simple
- **Specialized**: Survey.js ecosystem