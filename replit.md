# RSA AI Use Case Value Framework

## Overview
The RSA AI Use Case Value Framework is a strategic AI use case prioritization platform for RSA Insurance. Its purpose is to streamline AI use case prioritization, enhance decision-making, and provide clear insights into potential AI investments. The platform features a comprehensive assessment system, a 10-lever scoring framework, and an executive analytics dashboard, aiming to offer a standardized, data-driven approach to AI strategy and serve as a foundational tool for AI adoption and value realization within RSA.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components following "Build Once, Reuse Everywhere" principle
- **Database**: Consistent camelCase field naming between Drizzle schema and queries

## System Architecture

### Core Principles
**"Build Once, Reuse Everywhere"** - Every component is designed as a reusable LEGO block with consistent design patterns across the entire application, including UI components like CRUD cards and form elements.

### Tech Stack
- **Frontend**: React, TypeScript, shadcn/ui, TailwindCSS, Wouter
- **Backend**: Node.js, Express, Drizzle ORM, Zod validation
- **Database**: Hybrid approach utilizing PostgreSQL for session tracking and JSON blob storage for questionnaire data.

### Core Features
- **Use Case Management**: Complete CRUD operations integrated with the RSA 10-lever scoring framework.
- **Comprehensive Detail View**: Accordion-style detail drawer with 5 expandable sections (Overview & Scoring, Business Context, Implementation & Governance, Technology & Data, Risk & Compliance).
- **Intuitive Navigation**: Clickable use case cards for seamless detail access.
- **Assessment System**: A 6-section questionnaire with 14 advanced question types and a manual override system for score customization.
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts.
- **Professional PDF Exports**: Executive-grade reports for use cases, library catalogs, active portfolios, and assessment responses.
- **Real-time Persistence**: Live database synchronization for immediate data updates.
- **Dynamic Questionnaire Selection System**: Multi-questionnaire platform with sidebar navigation, automatic session creation, progress tracking, manual save system, and priority-based questionnaire selection.
- **Client-Side PDF Export**: Browser-based PDF generation for blank templates and completed responses.
- **Simplified Storage Architecture**: Pure JSON blob storage for questionnaire data.

### UI/UX Decisions
- **LEGO CRUD Card Design Standard**: Consistent card design with white background, blue left border, color-coded tags (Process, Line of Business, Use Case Type), side-by-side score display (Impact, Effort), and ghost-style action buttons. Cards are fully clickable for detail access.
- **LEGO Detail View Standard**: Accordion pattern with color-coded sections and conditional rendering based on data availability.
- **LEGO Form Standards**: Consistent styling for all form inputs using shadcn/ui components and standardized error/success states.

### System Design Choices
- **Questionnaire Data Storage**: Questionnaire definitions and response data are stored as structured JSON files in blob storage; session tracking uses lightweight PostgreSQL records.
- **API Architecture**: Clean RESTful endpoints under `/api/questionnaire/` with a blob storage backend.
- **Database Schema**: Essential PostgreSQL tables include `response_sessions`, `use_cases`, `users`, and `metadata_config`.
- **AI Inventory Status & Deployment Semantics**: `aiInventoryStatus` tracks operational lifecycle (`active`, `development`, `testing`, `deprecated`); `deploymentStatus` indicates technical deployment environment (`production`, `staging`, `development`, `local`). Statuses are TEXT constraints with application-level validation.
- **Data Integrity**: Implemented enhanced null safety, score calculation safety, database validation, and safe fallback logic for data operations. All boolean fields are standardized to 'true'/'false' string types for consistency.

## External Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **PDF**: PDFKit, Survey.js
- **Planned Integration**: Google Cloud Storage (for production blob storage)