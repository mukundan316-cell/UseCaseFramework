# RSA AI Use Case Value Framework - AI Strategy & Prioritization Platform

## Overview
This platform is a strategic AI use case prioritization tool for RSA Insurance, designed with a modular architecture. It enables the capture of AI use cases with associated business metadata, scores them using a proprietary 12-lever framework, and visualizes them within a dynamic prioritization matrix. The system supports real-time scoring, robust CRUD operations for use cases and metadata, and dynamic filtering across various business dimensions. The business vision is to provide a comprehensive, data-driven approach for organizations to strategically identify, assess, and prioritize AI initiatives, maximizing their impact and alignment with business objectives.

## User Preferences
Preferred communication style: Simple, everyday language.

**LEGO-Style Architecture Mandate**: All buttons, modals, components and features must be implemented as reusable LEGO blocks where possible. Follow the "Build Once, Reuse Everywhere" principle to maintain consistency and reduce development overhead. Every new UI element should be evaluated for reusability potential before implementation.

## Recent Updates (January 2025)
**Section 1 Complete Implementation**: (January 9, 2025) Successfully implemented Section 1: Business Strategy & AI Vision with 16 questions (Q1-Q16) organized into four sub-sections following proper numbering distinction. Sub-section structure: "1.1 Company Profile & Business Context" (Q1-Q6), "1.2 AI Vision & Success Definition" (Q7-Q12), "1.3 Competitive & Market Position" (Q13-Q14), and "1.4 Investment Strategy" (Q15-Q16). Implemented comprehensive 45-minute business leader interview format covering company profile, business performance, competitive positioning, AI vision alignment, risk appetite, success metrics, market positioning, and investment strategy. All advanced question types properly integrated including company_profile, business_lines_matrix, percentage_allocation, multi_rating, smart_rating, ranking, and business_performance LEGO blocks with proper database persistence.

**Enhanced Question Type Implementation Complete**: (January 9, 2025) Successfully implemented and integrated all advanced question types including currency input, percentage allocation, smart rating, ranking, business lines matrix, and department skills matrix. All components follow LEGO-style architecture with proper JSON serialization, database persistence, and admin panel integration. System now supports comprehensive assessment workflows with complex data validation and real-time calculations.

**Database Schema Enhancement Complete**: (January 9, 2025) Added missing question types ('department_skills_matrix', 'textarea') to shared schema validation. Updated QuestionLegoBlock and QuestionRegistryLegoBlock for full question type support. All 14 question types now properly validated and integrated across the entire assessment system. Database testing confirms proper storage and retrieval of all question types.

**LEGO Block Standardization Complete**: (January 9, 2025) Implemented comprehensive standardization across all LEGO block components ensuring consistent user experience, spacing, and functionality. Created LEGO_BLOCK_STANDARDS.md documentation capturing all patterns and best practices. Key improvements: standardized question text display, enhanced spacing/alignment (`space-y-6`, `gap-6`), consistent Additional Context sections, duplicate prevention in QuestionRegistryLegoBlock, default options fallback patterns, and comprehensive error handling. All advanced question types now follow uniform standards while maintaining individual functionality.

**Percentage Target System Implementation**: (January 9, 2025) Successfully implemented simplified percentage target system to replace allocation constraints. Created PercentageTargetLegoBlock component for capturing percentage targets without 100% enforcement. Updated 5 questions (Q3, Q11, Q12, Q15, Q16) from percentage_allocation to percentage_target type. System now supports dual approach: PercentageTargetLegoBlock for goals/targets and PercentageAllocationLegoBlock for strict allocations when needed. Database schema, validation, and API routes updated to support new percentage_target question type with proper JSON serialization and persistence.

**Admin Configuration System Complete**: (January 9, 2025) Built comprehensive QuestionConfigurationLegoBlock admin interface for percentage_target questions with real-time toggle controls for showTotal setting. Created PATCH /api/questions/:id/config endpoint for dynamic configuration updates. Integrated into AdminPanel under Assessment Management tab with precision, placeholder, and context label controls. System achieves perfect consistency across database, questionnaire UI, admin panel, and LEGO components with Q3, Q11, Q12, Q15, Q16 proper numbering and Q11 configured to hide percentage totals for independent metrics.

**Field-Level Validation Fix**: (January 9, 2025) Fixed critical validation bug where "Required Fields Missing" error appeared even when no questions were marked as required. Enhanced QuestionnaireContainer validation logic to check both question-level and field-level required flags. Now properly validates Company Name field in Q1 Company Profile question, which was marked as required at the field level but not being validated. System now correctly handles complex question types with nested field requirements.

**Assessment Landing Page Database Integration**: (January 10, 2025) Fixed hardcoded Assessment Sections overview to use dynamic database values. RSAAssessmentLandingPage now fetches questionnaire data via useQuestionnaire hook and calculates section counts, question totals, and time estimates from actual database content. Replaced static "5 questions" displays with real counts (Section 1: 20 questions, Section 2: 4 questions). Time estimates now dynamically calculated based on question complexity. Includes graceful fallback protection while ensuring data accuracy matches actual questionnaire structure.

**Authentic RSA Logo Implementation**: (January 10, 2025) Replaced stylized sunburst logo with authentic RSA corporate branding using direct image embedding of official RSA logo (image_1754800977193.png). RSAHeader component now displays the exact RSA corporate logo with perfect accuracy, including authentic sunburst pattern, official color scheme, proper typography, and "[intact] company" tagline. Implementation verified against RSA UK website standards (https://www.rsainsurance.co.uk/) and accounts for announced rebrand to Intact Insurance scheduled by end of 2025. Direct image embedding ensures 100% brand compliance versus SVG recreation.

## System Architecture

### Core Architecture
The system employs a full-stack architecture:
-   **Frontend**: React/TypeScript Single Page Application (SPA) utilizing modular components, TanStack Query for data fetching, shadcn/ui for UI components, and Wouter for routing.
-   **Backend**: Node.js/Express with TypeScript, managing a PostgreSQL database via Drizzle ORM, exposed through a RESTful API with Zod validation.
-   **Database**: PostgreSQL with a schema featuring use_cases, metadata_config, and users tables, complemented by automatic migrations and real-time persistence.

### Design Principles & Features
-   **Modular LEGO-style Architecture**: Emphasizes reusable components to facilitate independent feature development and maintain architectural integrity. This includes a comprehensive library of reusable components for various functionalities (e.g., admin panel, assessment components, navigation, rating systems, UI elements).
-   **Metadata-Driven Design**: Captures and leverages extensive business metadata for use case categorization and analysis.
-   **AI Framework & Scoring Engine**: Implements RSA's 12-lever scoring system (Business Value, Feasibility, AI Governance) to calculate Impact and Effort scores in real-time. Automatic quadrant assignment (Quick Win, Strategic Bet, Experimental, Watchlist) is based on a 3.0 threshold.
-   **Assessment System**: Provides a complete workflow from email capture to results dashboard, featuring enhanced auto-save, session recovery, and integration between assessment, results, and the main framework. Includes a dynamic question registry and section progress tracking across 11 normalized tables.
-   **Dashboard Consolidation**: Streamlined portfolio overview with interactive filtering, displaying four quadrant cards.
-   **Database-First Persistence**: All data operations follow a clear Database → API → Frontend pattern, ensuring data integrity and real-time synchronization.
-   **Extensibility**: Designed to allow for future feature additions without regressing existing functionality.
-   **UI/UX Decisions**: Utilizes shadcn/ui and Tailwind CSS for a consistent and branded user experience. Components are highly configurable via props, and built-in state management handles loading, error, and empty states. Enhanced rating and ranking components provide intuitive user interaction.

## External Dependencies

-   **Database**: PostgreSQL (specifically Neon for serverless deployment)
-   **Frontend Framework**: React
-   **UI Component Library**: shadcn/ui
-   **Styling Framework**: Tailwind CSS
-   **Data Fetching/State Management**: TanStack Query
-   **Form Management**: React Hook Form
-   **Schema Validation**: Zod (used in both frontend and backend)
-   **Charting Library**: Recharts
-   **Routing**: Wouter
-   **Backend Framework**: Express (Node.js)
-   **ORM**: Drizzle ORM
-   **Module Bundler**: Vite
-   **Transpiler**: TypeScript
-   **JavaScript Bundler**: ESBuild