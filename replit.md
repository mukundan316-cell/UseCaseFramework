# RSA AI Use Case Value Framework - AI Strategy & Prioritization Platform

## Overview
This platform is a strategic AI use case prioritization tool for RSA Insurance. It enables the capture of AI use cases with associated business metadata, scores them using a proprietary 12-lever framework, and visualizes them within a dynamic prioritization matrix. The system supports real-time scoring, robust CRUD operations for use cases and metadata, and dynamic filtering. The business vision is to provide a comprehensive, data-driven approach for organizations to strategically identify, assess, and prioritize AI initiatives, maximizing their impact and alignment with business objectives.

## User Preferences
Preferred communication style: Simple, everyday language.

**LEGO-Style Architecture Mandate**: All buttons, modals, components and features must be implemented as reusable LEGO blocks where possible. Follow the "Build Once, Reuse Everywhere" principle to maintain consistency and reduce development overhead. Every new UI element should be evaluated for reusability potential before implementation.

**LEGO CRUD Card Design Standard**: All use case cards across the entire application must follow this exact design specification:
- **Card Structure**: Clean white cards with 4px blue left border (#3b82f6), subtle gray border, hover shadow
- **Content Padding**: p-5 for comfortable spacing
- **Title**: text-lg font-semibold text-gray-900 with mb-2 spacing
- **Description**: text-sm text-gray-600 with line-clamp-2
- **Tags**: Rounded pill-style tags with color-coded backgrounds:
  - Process: bg-blue-100 text-blue-800 with blue dot
  - Line of Business: bg-purple-100 text-purple-800 with purple dot  
  - Use Case Type: bg-orange-100 text-orange-800 with orange dot
- **Score Display**: Side-by-side grid with green (Impact) and blue (Effort) backgrounds, only for RSA Active Portfolio
- **Action Buttons**: Ghost-style buttons with proper icons, border-top separator
- **Contextual Actions**: Show appropriate buttons based on view (Edit/Delete for all, Move to Library/RSA as applicable)

This design must be used consistently for all CRUD cards throughout the application to maintain visual unity.

## System Architecture

### Core Architecture
The system employs a full-stack architecture:
-   **Frontend**: React/TypeScript Single Page Application (SPA) utilizing modular components, TanStack Query for data fetching, shadcn/ui for UI components, and Wouter for routing.
-   **Backend**: Node.js/Express with TypeScript, managing a PostgreSQL database via Drizzle ORM, exposed through a RESTful API with Zod validation.
-   **Database**: PostgreSQL with a schema featuring use_cases, metadata_config, and users tables, complemented by automatic migrations and real-time persistence.

### Design Principles & Features
-   **Modular LEGO-style Architecture**: Emphasizes reusable components to facilitate independent feature development and maintain architectural integrity, including comprehensive toggle functionality with consistent state synchronization.
-   **Manual Override System**: Complete manual score override functionality with toggle-based activation. Manual scores (Impact, Effort, Quadrant) take precedence over calculated scores. Real-time calculation engine displays current scoring weights while maintaining database persistence of both manual and calculated values.
-   **Metadata-Driven Design**: Captures and leverages extensive business metadata for use case categorization and analysis.
-   **AI Framework & Scoring Engine**: Implements RSA's 12-lever scoring system (Business Value, Feasibility, AI Governance) to calculate Impact and Effort scores in real-time. Automatic quadrant assignment is based on a 3.0 threshold.
-   **Assessment System**: Provides a complete workflow from email capture to results dashboard, featuring enhanced auto-save, session recovery, and integration. Includes a dynamic question registry and section progress tracking across 11 normalized tables with 14 advanced question types.
-   **Dashboard Consolidation**: Streamlined portfolio overview with interactive filtering, displaying four quadrant cards with authentic RSA branding.
-   **Database-First Persistence**: All data operations follow a clear Database → API → Frontend pattern, ensuring data integrity and real-time synchronization.
-   **Extensibility**: Designed to allow for future feature additions without regressing existing functionality.
-   **UI/UX Decisions**: Utilizes shadcn/ui and Tailwind CSS for a consistent and branded user experience. Components are highly configurable, and built-in state management handles loading, error, and empty states. Enhanced rating and ranking components provide intuitive user interaction with standardized LEGO CRUD card design. Implementation uses authentic RSA corporate branding.

## External Dependencies

-   **Database**: PostgreSQL (Neon for serverless deployment)
-   **Frontend Framework**: React
-   **UI Component Library**: shadcn/ui
-   **Styling Framework**: Tailwind CSS
-   **Data Fetching/State Management**: TanStack Query
-   **Form Management**: React Hook Form
-   **Schema Validation**: Zod
-   **Charting Library**: Recharts
-   **Routing**: Wouter
-   **Backend Framework**: Express (Node.js)
-   **ORM**: Drizzle ORM
-   **Module Bundler**: Vite
-   **Transpiler**: TypeScript
-   **JavaScript Bundler**: ESBuild