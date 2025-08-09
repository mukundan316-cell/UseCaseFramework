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
- **12-Lever Scoring System**: Business Value (5), Feasibility (5), AI Governance (2 levers)
- **Quadrant Logic**: 3.0 threshold for Quick Win, Strategic Bet, Experimental, Watchlist
- **Real-time Calculations**: Instant Impact/Effort score updates with PostgreSQL persistence

### Assessment System
- **Complete Workflow**: Email capture → maturity questions → results dashboard with export (PDF, Excel, JSON)
- **Progress Management**: Enhanced auto-save, localStorage backup, session recovery, resume incomplete assessments
- **Navigation**: Full integration between assessment, results, and main framework

### Dashboard Consolidation (January 2025)
- **Streamlined Portfolio Overview**: Single section displaying four quadrant cards with interactive filtering
- **Eliminated Redundancy**: Removed duplicate summary metrics and quadrant displays from matrix component
- **Clean Visual Hierarchy**: Top quadrant cards with colored borders, streamlined metric presentation
- **Maintained Functionality**: All clickable filters and matrix interactions preserved

### LEGO Component Architecture
- **4-Tab Admin Panel**: Data Management, Process Configuration, Assessment Management, System Configuration
- **Assessment Components**: QuestionnaireContainer with progress persistence, AssessmentResultsDashboard with export options
- **Progress Management**: ResumeProgressLegoBlock for incomplete assessments, ProgressStatusLegoBlock for save status
- **Portfolio Overview**: SummaryMetricsLegoBlock with interactive quadrant filtering
- **Use Case Management**: CRUDUseCaseModal with embedded scoring sliders
- **Navigation Components**: SectionTabNavigatorLegoBlock, BreadcrumbNavigationLegoBlock, SectionTransitionLegoBlock
- **Question Management**: QuestionRegistryLegoBlock, QuestionTemplateLibraryLegoBlock with 100+ RSA questions
- **UI Elements**: ReusableButton, ScoreSliderLegoBlock, InfoTooltipLegoBlock

## System Architecture

### Architecture

**Frontend**: React/TypeScript SPA with modular components, TanStack Query for data fetching, shadcn/ui components, and Wouter routing

**Backend**: Node.js/Express with TypeScript, PostgreSQL database via Drizzle ORM, RESTful API with Zod validation

**Database**: Three-table schema (use_cases, metadata_config, users) with automatic migrations and real-time persistence

### Key Features

**Scoring Engine**: Pure functions calculate Impact (Business Value average) and Effort (Feasibility average) scores, with automatic quadrant assignment using 3.0 thresholds

**Database Integration**: PostgreSQL with Neon hosting, Drizzle ORM, automatic migrations, 16+ seeded commercial insurance use cases, comprehensive questionnaire system with 12 normalized tables including dynamic question registry and section progress tracking

**Modular Design**: LEGO-style reusable components enable independent feature development without architectural disruption

**Real-time Operations**: All CRUD operations sync immediately to database with proper error handling and user feedback

## Technology Stack

**Frontend**: React, TypeScript, shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts, Wouter

**Backend**: Express, Drizzle ORM, Zod validation

**Database**: PostgreSQL (Neon serverless), twelve-table schema with automatic migrations

**Development**: Vite, TypeScript, ESBuild

## LEGO Architecture Audit (January 8, 2025)
- **Comprehensive LEGO Compliance Audit Completed**: Achieved 95% compliance with REFERENCE.md principles
- **20+ Reusable LEGO Components**: Complete library following "Build Once, Reuse Everywhere" mandate
- **Eliminated Component Duplication**: All assessment results now use single AssessmentResultsDashboard component
- **Database-First Architecture**: All data operations follow Database → API → Frontend pattern
- **Consistent RSA Branding**: Unified styling across all LEGO blocks
- **Props-Based Configuration**: All components highly configurable via props
- **Built-in State Management**: Loading, error, and empty states handled within components

## Recent Changes (January 2025)

### Assessment Progress Access Enhancement (January 9, 2025)
- **ResumeProgressLegoBlock**: LEGO component for accessing incomplete saved assessments with progress visualization
- **One-Click Resume**: Resume incomplete assessments directly from AI Assessment page below completed results
- **Progress Management**: Delete unwanted saved progress with confirmation, auto-refresh every 30 seconds
- **LEGO Compliance**: Independent operation, reusable design, props-based configuration per REFERENCE.md

## Recent Changes (January 2025)

### Admin Panel Reorganization (January 9, 2025)
- **4-Tab LEGO Architecture**: Reorganized admin panel from 2 to 4 specialized tabs following REFERENCE.md principles
- **Data Management Tab**: Export/import actions, metadata LEGO blocks (Lines of Business, Business Segments, Geographies, Use Case Types)
- **Process Configuration Tab**: ProcessManagementBlock and ProcessActivityManagementBlock for business workflow management
- **Assessment Management Tab**: Complete QuestionTemplateLibraryLegoBlock integration for RSA's 100+ question templates
- **System Configuration Tab**: ScoringModelManagementBlock and advanced system settings
- **Intuitive Navigation**: Icon-based tabs with Database, Workflow, ClipboardList, and Settings icons for clear visual hierarchy
- **LEGO Compliance**: All components remain independent, reusable, and props-configurable per REFERENCE.md standards
- **User Workflow Optimization**: Logical grouping by function (data, process, assessment, system) for different user roles

### LEGO Architecture & Navigation Fixes (January 8, 2025)
- **Enhanced LEGO Compliance**: Created NavigationHeader LEGO block for reusable navigation patterns
- **Intuitive Naming**: Renamed "QuestionnaireContainer Demo" to "RSA AI Maturity Assessment" for better user understanding
- **Dual Route Support**: Added both `/questionnaire` and `/assessment` routes for backward compatibility
- **Navigation Integration**: Added "Back to Dashboard" functionality with proper breadcrumb navigation
- **Fixed Route References**: Updated all internal navigation to use consistent route patterns
- **Eliminated Assessment Results Duplication**: Consolidated to single AssessmentResultsDashboard component following LEGO principle - removed duplicate empty states from ScoringDashboardLegoBlock
- **Retake Assessment Fix**: Enhanced progress recovery logic to prevent completed assessments from auto-restoring
- **Component Reusability**: ScoringDashboardLegoBlock now properly returns null when no data, letting parent components handle empty states

### Dashboard Optimization
- Consolidated Portfolio Overview to eliminate redundant information display
- Streamlined layout with single quadrant card section and clean visual hierarchy
- Removed duplicate summary metrics while maintaining all interactive functionality

### Assessment System Completion
- Resolved all runtime errors in assessment completion workflow
- Added proper navigation between results page and main framework
- Implemented functional export and retake assessment capabilities using LEGO components

### Enhanced Section Progress Persistence System (January 9, 2025)
- **Section-Level Progress Tracking**: Independent progress tracking for each of 6 assessment sections with completion status
- **Enhanced useProgressPersistence Hook**: Section-aware auto-save, resume at exact question within last incomplete section, API integration
- **Database Storage Methods**: getSectionProgress, updateSectionProgress, saveQuestionAnswer for comprehensive backend persistence
- **API Endpoints**: Dedicated REST endpoints for section progress (GET/PUT/POST) with proper error handling and validation
- **Auto-Save Implementation**: Debounced auto-save on every answer plus section completion with real-time status indicators
- **Resume Capability**: Smart resume logic finds first incomplete section and exact question position
- **Progress Visualization**: Section completion grid, progress bars per section, overall completion percentage tracking
- **Database Schema Extension**: Added section_progress table with proper foreign key relationships and completion tracking

### Complete Assessment Navigation & Template System (January 9, 2025)
- **SectionSummaryCardLegoBlock**: Interactive section overview cards with progress tracking, maturity scoring, and navigation controls
- **BreadcrumbNavigationLegoBlock**: Context-aware navigation breadcrumbs with responsive design and hierarchical path display
- **SectionTransitionLegoBlock**: Smooth section navigation with validation, animations, celebration effects, and auto-advance capability
- **QuestionTemplateLibraryLegoBlock**: Comprehensive question template management with RSA's 100+ categorized questions, advanced search, bulk import, and dynamic section building
- **Enhanced Navigation System**: Complete navigation ecosystem supporting assessment flow from dashboard through sections to individual questions
- **Template-Driven Architecture**: Database-driven question templates enabling dynamic assessment customization and rapid deployment

## Complete Documentation

### Technical References
- `PROJECT_OVERVIEW.md`: Complete architecture and feature overview
- `FEATURE_REFERENCE.md`: Detailed feature documentation with usage guide
- `DATABASE_SCHEMA.md`: Complete database schema and relationships
- `LEGO-COMPONENTS.md`: Component architecture and reusability patterns
- `REFERENCE.md`: Development principles and coding standards

### Current Status
The platform is feature-complete with comprehensive use case management, assessment workflows, progress persistence, and export capabilities. All core functionality is operational with proper error handling and user feedback systems.