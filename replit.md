# Hexaware AI Use Case Value Framework

## Overview
This project is a strategic decision-support platform for organizing and prioritizing AI use cases, including insurance opportunities. It includes scoring, executive analytics, use case management, value planning, and governance features. See [README.md](README.md) for the business-facing functional guide, insurer benefits, and verification boundaries. It manages initiatives rather than executing insurance AI solutions; production readiness has not been established.

## Publishing Check (15 October 2026)
- A private deployment is now configured, but its latest publish attempt was blocked before compilation by seven critical dependency findings. Dependency updates resolved those findings; the subsequent dependency audit reported zero critical findings, with 45 high, 32 moderate, and 6 low findings remaining. This is not a clean security audit.
- Publishing now uses `npm run start`, matching the build output and setting production mode. The local production build and a Survey.js model/PDF-generation smoke test passed. A new publish attempt is still required to verify hosted startup.
- Keep Survey.js core, React UI, and PDF packages on matching versions. The `jspdf` and `proxy-addr` overrides prevent the lockfile from retaining vulnerable transitive versions still allowed by parent dependency ranges; review compatibility and security findings before removing them.

## Dependency Maintenance (15 October 2026)
- Dependency remediation now yields zero findings from both `npm audit` and Replit's dependency scanner. The original SheetJS dependency was replaced with the security-hardened `@stackline/xlsx` fork, preserving `.xls` and `.xlsx` import/export support.
- See [dependency security maintenance](docs/dependency-security.md) for sources, the pinned guarded Braces derivative, toolchain compatibility constraints, and verification boundaries. Run `npm run test:dependencies` alongside the production build when changing overrides.

## Verification and Maintenance Caveats (12 October 2026 snapshot)
- Deployment metadata reports no active published deployment for this workspace; a production database read reports no production database. Development observations must not be described as production verification.
- Development dashboard and Insights rendered; read services returned portfolio and configuration data. The assessment landing page rendered with two missing-resource errors. Write flows, assessment completion, exports, and uploads were not acceptance-tested.
- `npm run check` failed with existing TypeScript errors during this review. The publishing-command mismatch found then was corrected on 15 October; see the publishing check above.
- The server entry point does not install authentication, authorization, or session middleware. Installed session packages and organizational client/engagement filters do not establish secure access or tenant isolation.
- Startup performs questionnaire initialization, client/engagement backfill, and showcase updates, not just empty-database seeding. This review observed 18 showcase updates on development startup. Data and benefit figures must not be represented as measured customer outcomes without provenance.
- The roadmap contains fixed illustrative progress values. Portfolio value aggregation can mix estimates and tracked values. Currency settings are not proof of audited currency conversion.
- User-facing documentation should emphasize functional features and insurer benefits rather than implementation details. Keep maintenance details here, and keep verification limits explicit.

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
- **Target Operating Model (TOM)**: Configurable lifecycle phases and gate requirements with framework-oriented NIST AI RMF/ISO 42001 guidance, not certification or independently verified regulatory compliance.
- **Analytics**: Interactive matrix plots, executive dashboards, and PDF export with ROI explanations.
- **Assessment System**: Multi-questionnaire platform using Survey.js.
- **File Management**: Presentations use `temp-presentation-storage/`, questionnaire materials use `temp-questionnaire-storage/`, and presentation upload staging uses `/tmp/presentations`. Presentation uploads have a 50MB limit. Confirm durability and backups before business use.
- **Modularity**: Reusable LEGO-style components with modular route and modal architectures; no fixed active-component count is asserted.
- **In-App Help & Guidance**: Role-based documentation with step-by-step visual guides for Business/IT Users (create use cases, link KPIs, scoring), Strategy/PMO (priority matrix, insights analysis, value validation), and Admins (client management, TOM configuration, gate definitions, KPI library). Uses visual cards with numbered steps and color-coded role sections. Includes Two-Tier Portfolio Overview explaining Idea Pool → Active Pipeline workflow.
- **Validation**: Minimal validation using Zod schemas and centralized configuration.
- **Excel Integration**: Multi-worksheet import/export with auto-ID generation.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Some input validation and ORM queries are implemented; secure session management and comprehensive access control are not wired into the current server. No security assurance is implied.
- **Reporting**: PDF generation includes server-side export services; downloadable reports were not exercised in the October review.
- **T-shirt Sizing**: Benchmark-based cost and timeline estimates, not quotes, commitments, or a compliance guarantee.
- **Value Realization System**: KPI-based ROI tracking for use cases, including a comprehensive KPI library (169 KPIs), process mapping, and automated value estimation, supporting multi-currency. Includes KPI types, value streams, confidence factors, and a validation workflow. Features activity-level KPI filtering that suggests top 5 most relevant KPIs based on process AND activity combination (relevance scoring with activity match bonus). **KPI Type Diversity**: Smart selection algorithm prioritizes picking 1-2 KPIs from each available type (Financial, Operational, Strategic, Compliance) before filling remaining slots by relevance score - ensures balanced value tracking across all dimensions.
- **Capability Transition Benchmark Derivation**: Automated population of capability transition data from use case attributes, using benchmark archetypes.
- **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults integrated into CRUD operations with override protection.
- **Configuration**: Framework configuration is persisted in `metadata_config`, with additional code defaults and static guidance content; not every feature is exclusively database-driven.
- **Review History**: Duplicate-detection, change-log, governance-decision history, and role-evolution features support review. Complete, tamper-proof auditing has not been established.
- **Governance Workflow**: Dedicated activation and status-transition paths include gate checks, and phase guidance uses configured transitions. Enforcement across all create/update/bulk paths has not been established; do not claim universal gate enforcement.
- **Soft Progressive Data Capture**: Phase-aligned guidance system indicates required data for each TOM phase.
- **Insights Dashboard Structure**: All four Insights tabs (Value Realization, Operating Model, Capability Transition, Responsible AI) follow a consistent pattern: Summary Cards, Distribution Charts, and Use Case Table.

### Two-Tier Portfolio Model (Feb 2026)
The implementation separates ideation from committed delivery; external best-practice references are not independent validation:
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

## Historical Notes (Feb 2026; not current verification)
- **High Risk Actions Required**: Added actionable guidance section to Responsible AI Insights tab - shows specific mitigations per NIST AI RMF for high-risk use cases (human oversight, explainability, quarterly review, impact assessment requirements)
- **Business Segment Analytics Fix**: Fixed Executive Analytics charts to correctly use `businessSegments` array instead of deprecated `businessSegment` field
- **Flexible Governance Model**: Schema now accepts any text value for `valueGovernanceModel` field to support legacy data
- **Complete Use Case Data Population**: 6 reference library use cases populated with complete data across all governance tabs (scoring, value realization, capability transition, responsible AI)
- **Documentation Cleanup**: Earlier redundant guides were removed. README.md is now the business-facing functional guide; replit.md retains project-maintenance context.
- **Two-Tier Portfolio Model**: Reference Library (Ideation) vs Active Portfolio (Assessment+) aligned with AWS Five V's Framework and HBR Portfolio Model
- **Visibility Enforcement**: Active portfolio use cases always visible on dashboard - UI toggle locked and backend enforces visibility
- **Multi-client organization**: Client/engagement organization supports reuse; it is not verified security isolation between tenants, and some seeded content and defaults remain client-specific.

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion, Radix UI primitives
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Installed session libraries**: express-session, connect-pg-simple (not wired into the current server entry point)
- **Specialized**: Survey.js ecosystem