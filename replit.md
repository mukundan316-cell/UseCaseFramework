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
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for state management, react-hook-form with Zod for forms, and Recharts for data visualization. Client-side PDF generation is used for better compatibility.
- **Backend**: Node.js 20.x with Express.js, PostgreSQL (Neon-backed) as the database, and Drizzle ORM for database interactions.
- **Development**: npm for package management, TypeScript 5.x, and tsx for hot-reloading development. Both frontend and backend run on port 5000.

### Feature Specifications
- **Core Data Management**: Full CRUD operations for AI use cases, including a 10-lever scoring framework with automated recalculation. Supports manual score overrides with reason tracking.
- **Data Model**: Primary `use_cases` entity stores detailed information, scoring, and governance data. `file_attachments` manage metadata for local files. `metadata_config` centralizes dropdown options, scoring logic, and configuration for features like T-shirt sizing and the Target Operating Model (TOM). `response_sessions` stores assessment questionnaire data, and `users` handles admin authentication.
- **Target Operating Model (TOM)**: A configurable layer that maps use cases to lifecycle phases based on their status and deployment state. It supports four operating model presets (Centralized CoE, Federated Model, Hybrid Model, CoE-Led with Business Pods) and dynamically derives phases. Includes specific API endpoints and UI components for configuration and visualization.
- **Analytics**: Interactive matrix plots for quadrant prioritization, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform built with Survey.js, supporting dynamic workflows and various question types.
- **File Management**: Local filesystem storage (`uploads/` directory) for PowerPoint, PDF, and image files, with metadata tracked in the `file_attachments` table. Supports conversion and has a 50MB per file limit.
- **Modularity**: Emphasizes "LEGO components" for reusability and configurability.
- **Validation**: Minimal validation requirements (title + description), utilizing Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export functionality with auto-ID generation (HEX_INT_*, HEX_IND_*, HEX_AITOOL_*).
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries (Drizzle ORM), and secure session management.
- **Performance**: Client-side PDF generation, debounced search, and optimized bubble chart rendering.
- **T-shirt Sizing**: Implements UK benchmark compliance for cost and timeline estimations across various professional roles with overhead multipliers.
- **User Feedback**: Integrated feedback collection system with contextual data capture.
- **Progressive Disclosure**: Utilization of hover tooltips and interactive headers for calculation transparency.

### Value Realization System (Jan 2026)
A comprehensive KPI-based ROI tracking system for the 126 insurance use cases:

- **KPI Library**: 9 insurance-specific KPIs with industry benchmarks (Claims Processing Time, First Contact Resolution, etc.) stored in `metadata_config.valueRealizationKpis`
- **Process Mapping**: KPIs mapped to 14 business processes using existing `processes[]` and `activities[]` fields (57% and 7% populated respectively)
- **Value Estimation**: Automated calculations based on maturity scores with confidence levels (high/medium/low)
- **Unit Handling**: Smart validation - only converts monetary units (GBP/USD/EUR) to value; time/percentage KPIs display improvement in native units
- **Admin Management**: KpiLibraryManagementLegoBlock in Admin Panel System tab for viewing/editing KPIs, benchmarks, and process mappings
- **CRUD Integration**: ValueEstimationLegoBlock in Implementation tab shows real-time KPI matching when selecting processes
- **Data Architecture**: Uses existing `valueRealization` JSONB field - no new schema columns required

Key files: `shared/valueRealization.ts`, `client/src/components/lego-blocks/ValueEstimationLegoBlock.tsx`, `client/src/components/lego-blocks/KpiLibraryManagementLegoBlock.tsx`

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer, ImageMagick
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session Management**: express-session, connect-pg-simple
- **Specialized**: Survey.js ecosystem, Radix UI primitives, and 100+ other development dependencies.

## Reference Assets
Source documents retained in `attached_assets/`:
- `Hexaware-Brand-Guidelines.pdf` - Official brand standards
- `AI-Tool-Inventory-Source-Data.xlsx` - Original use case data
- `Quadrant-Scoring-Methodology.docx` - Scoring framework reference
