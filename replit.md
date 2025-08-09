# RSA AI Use Case Value Framework - AI Strategy & Prioritization Platform

## Overview
This platform is a strategic AI use case prioritization tool for RSA Insurance, designed with a modular architecture. It enables the capture of AI use cases with associated business metadata, scores them using a proprietary 12-lever framework, and visualizes them within a dynamic prioritization matrix. The system supports real-time scoring, robust CRUD operations for use cases and metadata, and dynamic filtering across various business dimensions. The business vision is to provide a comprehensive, data-driven approach for organizations to strategically identify, assess, and prioritize AI initiatives, maximizing their impact and alignment with business objectives.

## User Preferences
Preferred communication style: Simple, everyday language.

**LEGO-Style Architecture Mandate**: All buttons, modals, components and features must be implemented as reusable LEGO blocks where possible. Follow the "Build Once, Reuse Everywhere" principle to maintain consistency and reduce development overhead. Every new UI element should be evaluated for reusability potential before implementation.

## Recent Updates (January 2025)
**Database Integrity Resolution**: Resolved foreign key constraint violations in question_answers table (January 9, 2025). All question references verified as valid, complex answer types (currency, percentage_allocation) successfully validated and saved. System now fully supports JSON-based answers with proper serialization/deserialization.

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