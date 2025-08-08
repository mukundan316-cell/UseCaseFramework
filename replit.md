# RSA AI Use Case Value Framework - AI Strategy & Prioritization Platform

## Overview

This is a strategic AI use case prioritization platform for RSA Insurance built with a modular LEGO-style architecture. The application captures AI use cases with business metadata, scores them using the RSA AI Framework's 12-lever system, and visualizes them in a dynamic prioritization matrix with four quadrants (Quick Win, Strategic Bet, Experimental, Watchlist).

Core features include real-time scoring calculations, database-first persistence with PostgreSQL, comprehensive CRUD operations for use cases and metadata, and dynamic filtering across business dimensions.

## User Preferences

Preferred communication style: Simple, everyday language.

**LEGO-Style Architecture Mandate (Updated January 2025)**: All buttons, modals, components and features must be implemented as reusable LEGO blocks where possible. Follow the "Build Once, Reuse Everywhere" principle to maintain consistency and reduce development overhead. Every new UI element should be evaluated for reusability potential before implementation.

## Project Reference Guide

The project follows strict architectural principles and coding standards documented in `REFERENCE.md`. All contributors and AI agents must review this guide before making changes to ensure consistency, modularity, and maintainability. Key principles include LEGO-style modularity, metadata-driven design, built-in quadrant logic, database-first persistence, and extensibility without regression.

## Current Implementation (January 2025)

### RSA AI Framework
- **12-Lever Scoring System**: Business Value (5 levers), Feasibility (5 levers), AI Governance (2 levers)
- **Quadrant Logic**: 3.0 threshold determines Quick Win, Strategic Bet, Experimental, Watchlist assignments
- **Real-time Calculations**: Impact and Effort scores update instantly via averaging formulas
- **Database Persistence**: All scoring data stored in PostgreSQL with automatic migrations

### Questionnaire System API (January 2025)
- **RESTful Endpoints**: Complete questionnaire management and response handling APIs
- **Database-First Design**: No hardcoded content, all questionnaires stored in PostgreSQL
- **Response Sessions**: Full lifecycle management from start to completion with scoring
- **Maturity Scoring**: Automatic calculation of maturity levels and percentage assessments
- **Hierarchical Data**: Questionnaires → Sections → Questions → Options with proper relationships

### Enhanced Multi-Select System (January 2025)
- **Multi-Select LEGO Components**: Process Activities, Business Segments, and Geographies now support multi-dimensional selection using reusable MultiSelectField component
- **Backward Compatibility**: Single-value fields preserved alongside new array columns for seamless data migration
- **Contextual Activity Filtering**: Activities filtered by selected business process with multi-select support
- **Smart Filtering Logic**: Explorer filters check both single values and array values for comprehensive use case discovery
- **Authentic RSA Metadata**: Commercial insurance terminology with 40+ process-specific activities

### Progress Persistence System (January 2025)
- **Auto-save Functionality**: Debounced 1-second auto-save stores answers to database on every change
- **Progress Recovery**: Automatic restoration of previous answers on page reload using localStorage + database persistence
- **Save & Exit Button**: Manual progress preservation with user-friendly feedback and resume capability
- **Last Saved Indicator**: Real-time timestamp showing when progress was last saved to database
- **Resume from Dashboard**: Smart detection of existing progress with resume/restart options in assessment entry point
- **Database-First Storage**: All progress stored in questionnaire_responses and question_answers tables for reliability

### CRUD Operations (January 2025)
- **Fixed Delete Operations**: Resolved JSON parsing errors in DELETE responses (204 No Content)
- **Dual Implementation**: Both useUseCases hook and UseCaseContext support proper DELETE handling
- **Error Handling**: Comprehensive error states with user feedback via toast notifications
- **Data Integrity**: All CRUD operations maintain database consistency with proper validation

### LEGO Component Architecture
- **ProcessActivityManager**: Database-driven LEGO block providing centralized process-activity relationship management without duplication across the app
- **MultiSelectField**: Reusable multi-select component supporting both single-value and array-based selections with backward compatibility
- **MetadataLegoBlock**: Reusable CRUD interface for UI dropdown values including activities management  
- **CRUDUseCaseModal**: Complete use case management with embedded scoring sliders and multi-dimensional business context selection
- **Admin Panel**: Streamlined metadata management for all categories including process activities
- **Component Library**: Standardized UI blocks (FormActionButtons, DataActionCard, FilterChip, etc.)

## System Architecture

### Architecture

**Frontend**: React/TypeScript SPA with modular components, TanStack Query for data fetching, shadcn/ui components, and Wouter routing

**Backend**: Node.js/Express with TypeScript, PostgreSQL database via Drizzle ORM, RESTful API with Zod validation

**Database**: Three-table schema (use_cases, metadata_config, users) with automatic migrations and real-time persistence

### Key Features

**Scoring Engine**: Pure functions calculate Impact (Business Value average) and Effort (Feasibility average) scores, with automatic quadrant assignment using 3.0 thresholds

**Database Integration**: PostgreSQL with Neon hosting, Drizzle ORM, automatic migrations, 16+ seeded commercial insurance use cases, comprehensive questionnaire system with 6 normalized tables

**Modular Design**: LEGO-style reusable components enable independent feature development without architectural disruption

**Real-time Operations**: All CRUD operations sync immediately to database with proper error handling and user feedback

## Technology Stack

**Frontend**: React, TypeScript, shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts, Wouter

**Backend**: Express, Drizzle ORM, Zod validation

**Database**: PostgreSQL (Neon serverless), nine-table schema with automatic migrations including questionnaire system

**Development**: Vite, TypeScript, ESBuild

See `DATABASE_SCHEMA.md` for complete database documentation including the new questionnaire system tables.