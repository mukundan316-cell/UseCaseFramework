# RSA AI Use Case Value Framework

## Overview
Production-ready strategic platform for AI use case prioritization at RSA Insurance. Features comprehensive scoring framework, executive analytics dashboard, and full CRUD management system. Enables data-driven AI investment decisions with standardized assessment workflows and portfolio visualization.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components following "Build Once, Reuse Everywhere" principle
- **Database**: Consistent camelCase field naming between Drizzle schema and queries
- **Boolean Strategy**: Use string booleans ('true'/'false') consistently across UI to DB - no native boolean types
- **Data Consistency**: Complete boolean standardization and minimal transformations across all layers
- **Code Quality**: Centralized configuration, comprehensive error handling, and loading states
- **Development Focus**: Quick wins and optimizations without adding complexity
- **Bubble Sizing**: Moderate exponential scaling (power 1.3) for proportional impact visualization in matrix plots

## Current Status
**Application Rating: 4.5/5** - Production-ready with excellent adherence to architectural standards. Recent fixes eliminated analytics calculation errors caused by boolean consistency issues. Core features (dashboard, scoring, CRUD, analytics) demonstrate mature LEGO block patterns with minimal technical debt.

## System Architecture
### Architecture
- **Core Principle**: "Build Once, Reuse Everywhere" - LEGO block component system
- **Data Strategy**: PostgreSQL + JSON blob storage hybrid approach
- **Frontend**: React/TypeScript with shadcn/ui and TailwindCSS
- **Backend**: Node.js/Express with Drizzle ORM and Zod validation

### Core Features
- **Use Case Management**: Full CRUD with RSA 10-lever scoring framework
- **Analytics Dashboard**: Interactive matrix plots with quadrant-based prioritization
- **Portfolio Management**: Active/reference library with bulk operations
- **Assessment System**: Multi-questionnaire platform with dynamic workflows
- **Executive Reporting**: Professional PDF exports and executive-grade visualizations
- **File Integration**: PDF/PowerPoint uploads with full-screen viewer
- **Multi-Source Support**: RSA Internal, Industry Standard, AI Inventory categories

### Design Standards
- **LEGO Cards**: White background, blue borders, color-coded tags, fully clickable
- **Detail Views**: Accordion pattern with conditional rendering
- **Forms**: Consistent shadcn/ui styling with standardized states
- **Branding**: RSA #005DAA blue throughout, quadrant-based color coding

### Architecture Decisions
- **Data Storage**: PostgreSQL for metadata/sessions, JSON blob storage for questionnaire data
- **Boolean Strategy**: String booleans ('true'/'false') across entire stack - no transformations
- **Field Naming**: Database `snake_case` → Frontend `camelCase` via Drizzle mapping
- **Manual Overrides**: Null values supported for score clearing when toggles disabled
- **Configuration**: Centralized constants in `shared/constants/app-config.ts`
- **Error Handling**: Contextual messages with graceful degradation
- **Loading States**: Standardized `LoadingSpinner` and `LoadingState` components

## Tech Stack
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter  
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **Files**: PDFKit, Survey.js, LibreOffice, ImageMagick
- **Cloud**: Google Cloud Storage (production)