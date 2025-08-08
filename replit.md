# RSA GenAI Use Case Framework Microsite

## Overview

This is a modular and extensible microsite for RSA Insurance to manage and prioritize AI/GenAI use cases across commercial insurance operations. The application enables users to capture AI use cases with business metadata, score them based on impact and feasibility criteria, and visualize them in a dynamic 2×2 prioritization matrix. The system is designed with a LEGO-style modular architecture that allows new features to be added without disrupting existing components.

The core functionality includes use case submission with business context (value chain components, processes, lines of business, etc.), automated scoring using impact and effort calculations, matrix visualization showing prioritization quadrants (Quick Win, Strategic Bet, Experimental, Watchlist), and dynamic filtering capabilities across multiple business dimensions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Reference Guide

The project follows strict architectural principles and coding standards documented in `REFERENCE.md`. All contributors and AI agents must review this guide before making changes to ensure consistency, modularity, and maintainability. Key principles include LEGO-style modularity, metadata-driven design, built-in quadrant logic, database-first persistence, and extensibility without regression.

## Database-First Architecture Compliance

The application now fully adheres to database-first persistence principles:
- All data operations flow through PostgreSQL database via API endpoints
- No hardcoded arrays or localStorage used as primary data sources
- Metadata configuration stored in database table for dynamic admin editing
- Complete elimination of client-side storage dependencies
- Use cases and metadata retrieved exclusively through RESTful APIs

## System Architecture

### Frontend Architecture
The application uses React with TypeScript in a single-page application (SPA) architecture. The frontend follows a modular component design pattern with strict separation of concerns:

- **Component Structure**: Each major feature (UseCaseForm, MatrixPlot, Explorer, AdminPanel) is implemented as an independent React component that can be added, modified, or removed without affecting others
- **State Management**: Centralized state management through React Context (UseCaseContext) with localStorage persistence for offline capability
- **Routing**: Client-side routing using Wouter for lightweight navigation between different views
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for consistent styling and RSA brand colors

### Backend Architecture
The application currently uses a hybrid architecture designed for future scalability:

- **Express Server**: Node.js/Express backend with TypeScript for API endpoints and static file serving
- **Data Layer**: Currently uses in-memory storage (MemStorage) with localStorage persistence on the frontend, but includes Drizzle ORM schema definitions for PostgreSQL migration
- **Database Schema**: Structured schema for users and use cases with proper typing through Drizzle and Zod validation

### Data Storage Solutions
The system implements a flexible storage abstraction with full database integration:

- **Current Implementation**: PostgreSQL database with Neon serverless hosting for full persistence
- **Database Schema**: Complete use case schema implemented with Drizzle ORM, including proper relations and constraints
- **API Layer**: RESTful API endpoints for CRUD operations on use cases with proper validation
- **Data Models**: Comprehensive use case schema capturing business metadata (value chain, processes, LOB, geography) and scoring dimensions
- **Seeding**: Automatic database seeding with 6 sample insurance AI use cases on startup

### Scoring and Calculation Engine
Business logic implemented through pure functions for scoring consistency:

- **Impact Calculation**: Averages revenue impact, cost savings, risk reduction, and strategic fit (scale 1-5)
- **Effort Calculation**: Averages data readiness, technical complexity, change impact, and adoption readiness (scale 1-5)
- **Quadrant Logic**: Algorithmic assignment based on impact/effort thresholds (Quick Win: high impact + low effort, Strategic Bet: high impact + high effort, etc.)

### Modular Feature Architecture
The system follows a strict modular design:

- **Independent Components**: Each major feature (form, matrix, explorer, admin) operates independently with shared data access
- **Shared Services**: Common utilities and calculations available to all components through the context layer
- **Extensible Metadata**: Dynamic metadata management allowing business users to modify filter categories without code changes

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
- **PostgreSQL**: Production database solution with Neon serverless hosting
- **Connection Pooling**: Configured through connect-pg-simple for session management
- **Migration System**: Drizzle Kit for database schema management and migrations

The application is architected to seamlessly transition from localStorage to full database persistence when ready, with all necessary schemas and configurations already in place.