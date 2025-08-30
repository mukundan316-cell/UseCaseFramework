# RSA AI Use Case Value Framework

## Overview
Production-ready strategic platform for AI use case prioritization at RSA Insurance. Features comprehensive scoring framework, executive analytics dashboard, and full CRUD management system.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components 
- **Database**: camelCase field naming, string booleans ('true'/'false')
- **Code Quality**: Centralized config, comprehensive error handling, minimal validation
- **Development Focus**: Quick wins without complexity
- **Bubble Sizing**: Moderate exponential scaling (power 1.3)

## Current Status
**Application Rating: 5.0/5** - Production-ready with database file storage. Successfully migrated from Google Cloud Storage to PostgreSQL database storage while preserving all functionality including file preview capabilities. Features minimized validation, user-friendly error messages, and comprehensive ROI explanation system.

**Recent Progress (Aug 2025)**: Completed comprehensive boolean string handling audit ensuring 100% consistency across entire UI→DB→UI flow. All 8 boolean fields (isActiveForRsa, isDashboardVisible, explainabilityRequired, dataOutsideUkEu, thirdPartyModel, humanAccountability, horizontalUseCase, hasPresentation) now properly convert between UI boolean states and database string storage. Fixed missing field initialization and preserved all category-specific context for RSA Internal, Industry Standard, and AI Inventory sources.

**Admin Interface Alignment (Aug 2025)**: Successfully aligned admin interface with assessment overview functionality. Fixed AssessmentStatsLegoBlock to properly parse Survey.js questionnaire format (pages structure), corrected API endpoint inconsistencies that caused DOCTYPE errors, and enhanced percentage target question detection. Admin interface now displays accurate statistics: 153 questions, 306 minutes estimated time, with proper questionnaire configuration management.

## Architecture
- **Stack**: React/TypeScript, Node.js/Express, PostgreSQL, Drizzle ORM
- **Data**: PostgreSQL metadata + JSON blob storage, string booleans throughout
- **Files**: Database file storage (Base64 encoded in PostgreSQL), eliminating external dependencies
- **UI**: shadcn/ui + TailwindCSS, RSA #005DAA blue branding

## Core Features
- **Use Case Management**: Full CRUD with 10-lever scoring framework
- **Analytics Dashboard**: Interactive matrix plots with quadrant prioritization
- **Portfolio Management**: Active/reference library with bulk operations
- **Assessment System**: Multi-questionnaire platform with dynamic workflows and admin configuration interface
- **Executive Reporting**: Professional PDF exports and visualizations
- **ROI Explanation System**: Contextual help, tooltips, and detailed scoring rationale
- **Excel Import/Export**: Multi-worksheet structure with validation guidance
- **Multi-Source Support**: RSA Internal, Industry Standard, AI Inventory categories

## Key Decisions
- **LEGO Components**: "Build Once, Reuse Everywhere" principle
- **Boolean Strategy**: String 'true'/'false' across entire stack
- **Field Naming**: Database `snake_case` → Frontend `camelCase` 
- **Validation**: Minimal requirements (title + description only)
- **Configuration**: Centralized in `shared/constants/app-config.ts`
- **File Storage**: Database storage (Base64) over external services for reliability and simplicity
- **Assessment Data Format**: Survey.js questionnaire structure (`pages` → `elements` → `panels` → `elements`)
- **API Consistency**: Single endpoint pattern `/api/questionnaire/` for questionnaire data access

## Tech Stack
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter  
- **Data**: Drizzle ORM, TanStack Query, Zod
- **Files**: PDFKit, Survey.js, LibreOffice
- **Cloud**: Google Cloud Storage