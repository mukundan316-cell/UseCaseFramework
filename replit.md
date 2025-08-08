# RSA AI Use Case Value Framework - AI Strategy & Prioritization Platform

## Overview

This is a modular and extensible microsite for RSA Insurance to manage and prioritize AI/GenAI use cases across commercial insurance operations. The application enables users to capture AI use cases with business metadata, score them based on impact and feasibility criteria, and visualize them in a dynamic 2×2 prioritization matrix. The system is designed with a LEGO-style modular architecture that allows new features to be added without disrupting existing components.

The core functionality includes use case submission with business context (value chain components, processes, lines of business, etc.), automated scoring using impact and effort calculations, matrix visualization showing prioritization quadrants (Quick Win, Strategic Bet, Experimental, Watchlist), and dynamic filtering capabilities across multiple business dimensions.

## User Preferences

Preferred communication style: Simple, everyday language.

**LEGO-Style Architecture Mandate (Updated January 2025)**: All buttons, modals, components and features must be implemented as reusable LEGO blocks where possible. Follow the "Build Once, Reuse Everywhere" principle to maintain consistency and reduce development overhead. Every new UI element should be evaluated for reusability potential before implementation.

## Project Reference Guide

The project follows strict architectural principles and coding standards documented in `REFERENCE.md`. All contributors and AI agents must review this guide before making changes to ensure consistency, modularity, and maintainability. Key principles include LEGO-style modularity, metadata-driven design, built-in quadrant logic, database-first persistence, and extensibility without regression.

## Enhanced RSA Framework Integration (January 2025)

The application implements the comprehensive RSA AI Framework with full database persistence:
- **Enhanced Scoring System**: 12 scoring levers across three dimensions with real-time calculations
  - Business Value: Revenue Impact, Cost Savings, Risk Reduction, Broker/Partner Experience, Strategic Fit
  - Feasibility: Data Readiness, Technical Complexity, Change Impact, Model Risk, Adoption Readiness  
  - AI Governance: Explainability/Bias, Regulatory Compliance
- **Database Schema**: Complete PostgreSQL schema with proper field mapping and constraints
- **Weighted Calculations**: Impact and Effort scores use averaging formula with quadrant logic
- **Real-time Updates**: Scoring calculations update instantly as users adjust slider values
- **Persistent Storage**: All framework data stored in PostgreSQL with automatic migrations
- **Visual Feedback**: Enhanced slider interface with dynamic color progression and hover effects

## Focused LEGO Block Architecture (January 2025)

The application implements a focused LEGO-style component system with full database integration:
- **MetadataLegoBlock**: Reusable CRUD components for all UI list of values with PostgreSQL persistence
- **CRUDUseCaseModal**: Complete modal interface with 12-lever scoring system and real-time calculations
- **Admin Panel**: Streamlined interface for managing metadata categories that drive dropdown options
- **Database-First Metadata**: All UI configurations stored in `metadata_config` table with proper timestamp tracking
- **Visual Slider Interface**: Enhanced range sliders with dynamic color feedback and smooth transitions
- **Component Library**: Reusable LEGO blocks (FormActionButtons, DataActionCard, ReusableButton, etc.)
- **Full CRUD Operations**: Create, Read, Update, Delete for all metadata categories with toast notifications

## System Architecture

### Frontend Architecture
The application uses React with TypeScript in a single-page application (SPA) architecture. The frontend follows a modular component design pattern with strict separation of concerns:

- **Component Structure**: Each major feature (UseCaseForm, MatrixPlot, Explorer, AdminPanel) is implemented as an independent React component that can be added, modified, or removed without affecting others
- **State Management**: Centralized state management through React Context (UseCaseContext) with localStorage persistence for offline capability
- **Routing**: Client-side routing using Wouter for lightweight navigation between different views
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for consistent styling and RSA brand colors

### Backend Architecture
The application uses a production-ready database-first architecture:

- **Express Server**: Node.js/Express backend with TypeScript for API endpoints and static file serving
- **Data Layer**: PostgreSQL database with Drizzle ORM for type-safe operations and automatic migrations
- **Database Schema**: Complete three-table normalized schema (see `DATABASE_SCHEMA.md` for full documentation)
- **RESTful API**: Comprehensive endpoints for use cases and metadata with Zod validation

### Data Storage Solutions
The system implements a database-first architecture with full PostgreSQL integration:

- **PostgreSQL Database**: Production database with Neon serverless hosting for scalable persistence
- **Database Schema**: Complete normalized schema with three main tables:
  - `use_cases`: Core use case data with 12 enhanced framework scoring dimensions
  - `metadata_config`: UI list of values for dropdown and filter options
  - `users`: User authentication (prepared for multi-tenant future)
- **Enhanced Framework**: 12 scoring levers across Business Value, Feasibility, and AI Governance dimensions
- **API Layer**: RESTful endpoints for CRUD operations with Zod validation and real-time calculations
- **Automatic Migration**: Database schema updates and data migration on startup
- **Comprehensive Seeding**: 16+ realistic commercial insurance AI use cases from industry analysis

### Scoring and Calculation Engine
Business logic implemented through pure functions for scoring consistency:

- **Impact Calculation**: Averages revenue impact, cost savings, risk reduction, and strategic fit (scale 1-5)
- **Effort Calculation**: Averages data readiness, technical complexity, change impact, and adoption readiness (scale 1-5)
- **Quadrant Logic**: Algorithmic assignment based on impact/effort thresholds (Quick Win: high impact + low effort, Strategic Bet: high impact + high effort, etc.)

### Modular Feature Architecture - LEGO-Style Reusability
The system follows a strict modular design with mandatory reusability:

- **LEGO-Style Components**: All UI elements implemented as reusable blocks (MetadataLegoBlock, ReusableButton, ReusableModal)
- **Independent Components**: Each major feature (form, matrix, explorer, admin) operates independently with shared data access
- **Shared Services**: Common utilities and calculations available to all components through the context layer
- **Extensible Metadata**: Dynamic metadata management allowing business users to modify filter categories without code changes
- **Build Once, Reuse Everywhere**: Every new component evaluated for reusability potential before implementation

## External Dependencies

### Frontend Libraries
- **React & TypeScript**: Core framework with strict typing for reliability
- **shadcn/ui & Radix UI**: Comprehensive component library for consistent UI/UX
- **Tailwind CSS**: Utility-first styling with custom RSA brand theming
- **React Hook Form & Zod**: Form management with client-side validation
- **Recharts**: Data visualization library for matrix plotting and charts
- **TanStack Query**: Data fetching and caching (prepared for API integration)

### Backend Libraries
- **Express**: Web framework for API routes and static serving
- **Drizzle ORM**: Type-safe ORM for PostgreSQL integration
- **Neon Database**: Serverless PostgreSQL provider (configured but not yet active)

### Development Tools
- **Vite**: Fast build tool with HMR for development experience
- **TypeScript**: Static typing throughout the application
- **ESBuild**: Fast bundling for production builds

### Database Integration
- **PostgreSQL with Neon**: Production-ready serverless database hosting with automatic scaling
- **Drizzle ORM**: Type-safe database operations with automatic migrations and schema validation
- **Database Schema**: Three-table normalized design:
  ```sql
  -- Use Cases: Core business data with enhanced framework scoring
  use_cases (id, title, description, business_context, 12_scoring_dimensions, calculated_scores)
  
  -- Metadata Configuration: UI list of values for dropdowns and filters  
  metadata_config (id, value_chain_components[], processes[], lines_of_business[], etc.)
  
  -- Users: Authentication system (prepared for multi-tenant expansion)
  users (id, username, password)
  ```
- **Real-time Persistence**: All CRUD operations immediately sync to database with proper error handling
- **Automatic Migrations**: Database schema updates and data transformations on application startup
- **Data Integrity**: Foreign key constraints, proper field validation, and transaction management