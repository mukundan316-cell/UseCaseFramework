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

Key architectural decisions and features include:
- **Core Data Management**: Full CRUD operations for use cases, supporting a 10-lever scoring framework with automated recalculation based on metadata changes.
- **Data Storage**: PostgreSQL is used for structured metadata and JSON blob storage, consistently employing string booleans ('true'/'false') across the stack. File system storage is used for files, with metadata stored in the database.
- **Analytics & Reporting**: Interactive matrix plots for quadrant prioritization, executive dashboards, and professional PDF export capabilities.
- **Assessment System**: A multi-questionnaire platform built with Survey.js, supporting dynamic workflows and admin configurations.
- **File Management**: Local filesystem storage with PostgreSQL metadata for PowerPoint and image files, including conversion to PDF and a 50MB limit per file.
- **Modularity**: Emphasis on "LEGO components" (reusable, configurable, well-documented) and utility functions for consistent logic across the application.
- **Validation & Configuration**: Minimal validation requirements (title + description only) with Zod schemas. Centralized configuration in `shared/constants/app-config.ts`.
- **Excel Integration**: Multi-worksheet import/export with consistent validation matching UI forms, auto-ID generation, and robust error handling.
- **API Design**: RESTful patterns with structured error responses and server-side validation.
- **Security**: Input sanitization, parameterized queries (Drizzle ORM), and secure session management.

## External Dependencies
The project integrates with several key external services and libraries:
- **UI Libraries**: shadcn/ui, TailwindCSS, Recharts, Wouter (for routing).
- **Data Management**: Drizzle ORM, TanStack Query, Zod (for schema validation).
- **File Processing**: PDFKit, Survey.js (for questionnaire functionality), LibreOffice (for document conversion), Multer (for file uploads), ImageMagick (for image processing).
- **Database**: PostgreSQL.
- **Specialized**: Over 100 specialized dependencies, including the Survey.js ecosystem and various file upload/processing libraries.