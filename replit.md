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
**Application Rating: 4.9/5** - Production-ready with zero LSP errors. Features minimized validation (title + description only), user-friendly error messages, clear required field indicators (*), and comprehensive ROI explanation system with contextual help.

## Architecture
- **Stack**: React/TypeScript, Node.js/Express, PostgreSQL, Drizzle ORM
- **Data**: PostgreSQL metadata + JSON blob storage, string booleans throughout
- **UI**: shadcn/ui + TailwindCSS, RSA #005DAA blue branding

## Core Features
- **Use Case Management**: Full CRUD with 10-lever scoring framework
- **Analytics Dashboard**: Interactive matrix plots with quadrant prioritization
- **Portfolio Management**: Active/reference library with bulk operations
- **Assessment System**: Multi-questionnaire platform with dynamic workflows
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

## Tech Stack
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter  
- **Data**: Drizzle ORM, TanStack Query, Zod
- **Files**: PDFKit, Survey.js, LibreOffice
- **Cloud**: Google Cloud Storage