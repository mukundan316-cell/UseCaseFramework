# RSA AI Use Case Value Framework

## Overview
The RSA AI Use Case Value Framework is a production-ready strategic platform designed to prioritize AI use cases within RSA Insurance. It features a comprehensive scoring framework, an executive analytics dashboard, and a full CRUD management system. The platform aims to streamline the prioritization process, offer robust data management, and provide clear insights for decision-making, ultimately enhancing RSA's AI strategy and market potential.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components
- **Database**: camelCase field naming, string booleans ('true'/'false')
- **Code Quality**: Centralized config, comprehensive error handling, minimal validation
- **Development Focus**: Quick wins without complexity
- **Bubble Sizing**: Moderate exponential scaling (power 1.3)

## System Architecture
The platform is built on a modern full-stack architecture using React/TypeScript for the frontend, Node.js/Express for the backend API, and PostgreSQL with Drizzle ORM for data persistence. UI/UX leverages shadcn/ui and TailwindCSS, adhering to RSA's #005DAA blue branding.

### Recent Accomplishments (Q4 2024 - Q1 2025):
- **LEGO Component Rationalization**: Completed 3-phase consolidation resulting in SmartRatingLegoBlock (5 variants), UnifiedValueInputLegoBlock (3 variants), and ConfigurationToggleLegoBlock (3 variants)
- **AI Inventory Integration**: Full governance system with 82 records (25 strategic use cases + 57 AI tools) including risk assessment and policy compliance tracking
- **T-shirt Sizing System Completion**: Full UK benchmark compliance with automated size mapping (XS-XL), 6 UK role types (£300-£650 daily rates), 1.35x overhead multiplier, and comprehensive resource planning across all 111 use cases
- **User Feedback Integration**: One-click feedback collection system with `/api/feedback` endpoint, context logging for T-shirt sizing estimates, and comprehensive user input tracking for continuous improvement
- **Stakeholder Validation**: Achieved 100% T-shirt sizing compliance across all use cases with validated UK cost ranges, timelines, and benefit calculations
- **Client-side PDF Generation**: Migrated from server-side to Survey.js-based PDF export for better compatibility and performance
- **Executive Analytics Enhancement**: Matrix plot optimizations with moderate exponential bubble sizing (power 1.3) and quadrant-based ROI explanations
- **Manual Override System**: Toggle-based score customization with reason tracking and effective scoring calculations
- **Multi-dimensional Metadata**: Support for processes, activities, business segments, and geographies as array fields
- **Horizontal Use Case Tracking**: Cross-functional use case identification and categorization system

### Key Architectural Decisions:
- **Core Data Management**: Full CRUD operations for use cases, supporting a 10-lever scoring framework with automated recalculation based on metadata changes
- **Data Storage**: PostgreSQL with structured metadata and JSON blob storage, consistently employing string booleans ('true'/'false') across the stack. Local filesystem storage for files with database metadata tracking
- **Analytics & Reporting**: Interactive matrix plots for quadrant prioritization, executive dashboards, and professional PDF export capabilities with ROI explanations
- **Assessment System**: Multi-questionnaire platform built with Survey.js, supporting dynamic workflows and admin configurations with 25+ advanced question types
- **File Management**: Local filesystem storage with PostgreSQL metadata for PowerPoint and image files, including conversion to PDF and a 50MB limit per file
- **Modularity**: Emphasis on "LEGO components" (reusable, configurable, well-documented) with 60% maintenance overhead reduction through rationalization
- **Validation & Configuration**: Minimal validation requirements (title + description only) with Zod schemas. Centralized configuration in `shared/constants/app-config.ts`
- **Excel Integration**: Multi-worksheet import/export with consistent validation matching UI forms, auto-ID generation, and robust error handling
- **API Design**: RESTful patterns with structured error responses and server-side validation
- **Security**: Input sanitization, parameterized queries (Drizzle ORM), and secure session management
- **Performance**: Client-side PDF generation, debounced search (300ms), and optimized bubble chart rendering
- **T-shirt Sizing Engine**: UK benchmark-compliant sizing system with automated mapping rules, 6 professional roles (Developer: £400, Analyst: £350, PM: £500, Data Engineer: £550, Architect: £650, QA Engineer: £300), configurable overhead multipliers, and comprehensive resource planning
- **User Feedback System**: Integrated feedback collection mechanism with contextual data capture, API endpoint integration, and systematic user input tracking for continuous platform improvement

## External Dependencies
The project integrates with several key external services and libraries:
- **UI Libraries**: shadcn/ui, TailwindCSS, Recharts, Wouter (for routing).
- **Data Management**: Drizzle ORM, TanStack Query, Zod (for schema validation).
- **File Processing**: PDFKit, Survey.js (for questionnaire functionality), LibreOffice (for document conversion), Multer (for file uploads), ImageMagick (for image processing).
- **Database**: PostgreSQL.
- **Specialized**: Over 100 specialized dependencies, including the Survey.js ecosystem and various file upload/processing libraries.