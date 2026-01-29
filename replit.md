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

### Modular Architecture (Refactored Jan 2026)
- **Server Routes**: Domain-based modular structure in `server/routes/` with 17 specialized modules:
  - `use-cases.routes.ts` - Core CRUD operations (856 lines)
  - `value.routes.ts` - Value realization endpoints (593 lines)
  - `responses.routes.ts` - Questionnaire responses (377 lines)
  - `assessments.routes.ts` - Assessment management (379 lines)
  - `capability.routes.ts` - Capability transitions (336 lines)
  - `tom.routes.ts` - Target Operating Model (313 lines)
  - `clients.routes.ts`, `metadata.routes.ts`, `governance.routes.ts`, `derivation.routes.ts`, `import.routes.ts`, `export.routes.ts`, and others
- **CRUD Modal Tabs**: Modular tab components in `client/src/components/lego-blocks/crud-modal-tabs/`:
  - `DetailsTab.tsx` - Overview and details (772 lines)
  - `ScoringTab.tsx` - 10-lever scoring (143 lines)
  - `OperatingModelTab.tsx` - TOM phase management (208 lines)
  - `ResponsibleAITab.tsx` - AI governance (169 lines)
  - `GuideTab.tsx` - Progressive guidance (15 lines)
  - `utils.tsx` - Shared utilities (91 lines)
- **Benefits**: Improved maintainability, faster IDE performance, clearer separation of concerns

### Feature Specifications
- **Core Data Management**: Full CRUD for AI use cases, including a 10-lever scoring framework with automated recalculation and manual override.
- **Data Model**: `clients`, `engagements`, `use_cases`, `file_attachments`, `metadata_config`, `response_sessions`, and `users` entities, forming a Client → Engagement → Use Cases hierarchy.
- **Target Operating Model (TOM)**: Configurable layer mapping use cases to lifecycle phases based on governance gates and status. Supports multiple presets and aligns with NIST AI RMF and ISO 42001.
- **Analytics**: Interactive matrix plots, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform using Survey.js.
- **File Management**: Local filesystem storage (`uploads/`) with metadata tracking and a 50MB per file limit.
- **Modularity**: ~70 active LEGO components for reusability, with modular route and modal architectures.
- **In-App Help & Guidance**: Role-based documentation accessible from Dashboard tab, covering:
  - Platform Overview with 6 core dimensions (Inventory, Prioritization, Lifecycle, Value, Compliance, Capability)
  - Navigation Guide showing tab purposes and intended users
  - TOM Phases visual guide - **dynamically loaded from TOM configuration** (not hardcoded)
  - Key Rules and Quick Reference for common actions
  - Role-specific content for Business Users, Strategy/PMO, and Admins (workflows, key tasks, tips, locations)
  - Visual icon cards, Framer Motion animations, and Hexaware brand colors
- **Validation**: Minimal validation using Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export with auto-ID generation.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries, and secure session management.
- **Performance**: Client-side PDF generation, debounced search, and optimized rendering.
- **T-shirt Sizing**: Implements benchmark compliance for cost and timeline estimations.
- **Value Realization System**: KPI-based ROI tracking for use cases, including a KPI library, process mapping, and automated value estimation. Supports multi-currency. Enhanced with:
  - **KPI Types**: financial, operational, strategic, compliance - enabling granular tracking of non-financial metrics
  - **Value Streams**: 6 insurance-specific categories (operational_savings, cor_improvement, revenue_uplift, risk_mitigation, customer_experience, regulatory_compliance)
  - **Value Confidence**: Conservative factor (50%-100%), 4-level validation workflow (unvalidated → pending_finance → pending_actuarial → fully_validated), adjusted value calculations
  - **Governance Roles**: deliveryOwner, valueValidator, valueGovernanceModel fields for accountability tracking
  - **Insights Dashboard**: Raw vs Adjusted Value comparison, Validation Status breakdown, Value Stream distribution, KPI Type analysis
  - **KPI Categories (16 total)**: Category-based organization with `categoryId` field. 5 Insurance categories (Underwriting, Claims, Policy Admin, Distribution, Finance/Actuarial) + 11 Enterprise/AI categories (Model Performance, Data Quality, Tech Debt, Talent, Innovation, Business Alignment, GenAI, IT Infrastructure, Security, Customer Experience, Operational Efficiency)
  - **Value Chain Filtering**: UI toggle in KPI Library to filter by Insurance vs Enterprise KPIs, with accordion-style category grouping
  - **Org-wide KPIs**: KPIs with empty `applicableProcesses` are treated as organization-wide, matching any process context
- **Capability Transition Benchmark Derivation**: Automated population of capability transition data from use case attributes, using benchmark archetypes.
- **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults integrated into CRUD operations with override protection.
- **Database-Driven Configuration**: All framework features are driven by the `metadata_config` table.
- **Compliance Features**: Duplicate detection, full audit trail (`use_case_change_log`), and role evolution tracking.
- **Governance Workflow**: Foundation Layer gates must be cleared before use cases enter active portfolio. Backend enforcement blocks activation API calls and auto-deactivates if gates regress.
- **Phase Derivation vs Governance (NIST AI RMF 2024)**: Phase derivation is applied to ALL use cases for categorization and browsing. Governance gates are enforced ONLY when activating (moving from Reference Library to Active Portfolio). This separation allows Reference Library use cases to display phases for discovery while maintaining strict governance at activation.
- **Soft Progressive Data Capture**: Phase-aligned guidance system shows required data for each TOM phase via "Focus" badges.
- **Phase Transition Governance**: Checks for exit requirements during phase transitions, requiring justification for incomplete requirements.
- **Config-Driven Phase Transition Gates (Jan 2026)**: Phase transitions are governed by config-driven rules in `phaseTransitions` array within TOM config:
  - **Gate 1 (Operating Model)**: Ideation → Assessment requires business ownership (primaryBusinessOwner, businessFunction, status beyond Discovery)
  - **Gate 2 (Intake)**: Assessment → Foundation requires complete 10-lever scoring
  - **Gate 3 (RAI)**: Foundation → Build requires Responsible AI clearance (5 RAI fields)
  - **Post-gate transitions**: Build → Scale → Operate have no gate requirements
  - **Sequential gating**: Gate 2 requires Gate 1 to pass first; Gate 3 requires Gate 2 to pass first
  - **Architecture**: `PhaseTransitionRule` interface in `shared/tom.ts`, `checkPhaseTransition()` helper, and enforcement in `governance-enforcement.ts`
  - **Re-derivation endpoint**: `POST /api/tom/rederive-phases` recalculates phases for all use cases using preset-aware derivation
  - **Gate UI Definitions**: `GateDefinition` interface in `shared/tom.ts` with `gateDefinitions` array in TomConfig enables fully config-driven gate display (title, subtitle, principle, requirements, color, order). GovernanceGuideLegoBlock loads gates from config with sensible defaults.
- **Navigation**: All features accessible via tab navigation from home page: Dashboard View, Explorer, Insights, AI Assessment, Admin.

### Insights Dashboard Structure
All four Insights tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) follow a consistent pattern: Summary Cards, Distribution Charts, and Use Case Table.

### Data Completeness Achievement (Jan 2026)
All 126 use cases now have complete, contextually relevant data across all four Insights tabs:
- **Processes**: 126/126 (100%) - Derived using title/description/business_function keyword mapping
- **Value Realization**: 126/126 (100%) - KPIs matched and value estimates derived via auto-derivation system
- **TOM Phase**: 126/126 (100%) - All use cases assigned to lifecycle phases
- **Capability Transition**: 126/126 (100%) - Staffing ratios and timeline data populated
- **RAI Risk Tier**: 126/126 (100%) - Derived from TOM phase defaults (foundation→low, production→high)
- **RAI Assessment Required**: 126/126 (100%) - Set based on phase governance requirements
- **Scoring Levers**: 126/126 (100%) - Data readiness, technical complexity, adoption readiness
- **Activities**: 109/126 (87%) - Based on process-activity mappings from metadata_config
- **Data Integrity**: No duplicates (126 unique IDs and titles verified)

### Recent Enhancements (Jan 2026)
- **Comprehensive KPI Library (169 KPIs)**: Imported and integrated a comprehensive KPI library with 169 industry-validated KPIs:
  - Insurance Value Chain (107 KPIs): Underwriting (15), Claims (19), Policy Admin (13), Distribution (18), Finance/Actuarial (27), Customer Experience (15)
  - Enterprise/AI Operations (62 KPIs): Model Performance (6), Data Quality (6), Tech Debt (6), Talent (6), Innovation (6), Business Alignment (6), GenAI (8), IT Infrastructure (6), Security (6), Operational Efficiency (6)
  - Category mapping normalized from source (actuarial, reinsurance, compliance → finance_actuarial; stakeholder → business_alignment; security_privacy → security)
  - Optional fields in KpiDefinition interface (maturityRules, kpiType, aggregationMethod) allow simpler KPI definitions
- **Value Realization API Expansion**: New endpoints for adjusted value calculations (`/api/value/adjusted/:id`) and KPI aggregation by type/stream (`/api/value/kpi-aggregation`)
- **Auto-Derivation Enhancement**: Automatic population of valueConfidence defaults (conservativeFactor: 1.0, validationStatus: 'unvalidated') on use case creation/update
- **Governance Audit Trail**: Extended change logging to track deliveryOwner, valueValidator, valueGovernanceModel, and valueConfidence changes (validationStatus, conservativeFactor)
- **Excel Export Enhancement**: Added 11 new columns including governance fields, valueConfidence data, and KPI type/stream metadata from KPI library
- **Excel Import Enhancement**: Parsing for governance fields and valueConfidence from strategic and AI inventory import flows
- **PDF Export Enhancement**: Adjusted values, color-coded validation status badges, and governance roles in executive summary and use case pages
- **TOM Phase Requirements**: validationFullyValidated exit requirement for steady_state and RSA TOM's Operate phase (values must be fully validated before completing final phases)
- **Schema Type Alignment**: ValueStream type now includes all 6 insurance-specific categories across shared/schema.ts and shared/valueRealization.ts
- **Preset-Aware Phase Derivation Fix**: `derivePhase()` now uses `mergePresetProfile()` to resolve preset-specific phases (e.g., `rsa_tom.phases`) before matching, fixing misclassification when active preset phases differ from base config phases

## Critical Input Files (attached_assets/)
- **AI-Tool-Inventory-Source-Data.xlsx** - Source data for AI use case inventory
- **Hexaware-Brand-Guidelines.pdf** - Official Hexaware branding reference
- **Quadrant-Scoring-Methodology.docx** - Scoring framework methodology documentation
- **RSAAITOM_1768911783845.pdf** - RSA AI Target Operating Model reference
- **all-kpis-export_1769664483870.json** - Comprehensive 169-KPI library data

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion, Radix UI primitives
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session Management**: express-session, connect-pg-simple
- **Specialized**: Survey.js ecosystem