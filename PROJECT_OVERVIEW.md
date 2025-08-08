# RSA AI Use Case Value Framework - Complete Project Overview

## Core Purpose
Strategic AI use case prioritization platform for RSA Insurance that captures, evaluates, and prioritizes AI initiatives using a comprehensive 12-lever framework with real-time scoring and visualization.

## Architecture Overview

### Frontend Components
- **React/TypeScript SPA** with modular LEGO-style component architecture
- **TanStack Query** for data fetching and state management
- **Wouter** for client-side routing
- **shadcn/ui + Tailwind CSS** for consistent design system
- **Real-time calculations** with instant score updates

### Backend System
- **Node.js/Express** with TypeScript
- **PostgreSQL** database with Neon serverless hosting
- **Drizzle ORM** with automatic migrations
- **RESTful API** with Zod validation

### Database Schema
- **use_cases**: Main entities with 12-lever scoring
- **metadata_config**: Dynamic dropdown configuration
- **users**: Basic authentication support
- **questionnaire tables (6)**: Complete assessment workflow
- **Real-time persistence** with automatic backups

## Core Features

### 1. Use Case Management
- **Complete CRUD operations** with embedded scoring
- **12-lever RSA Framework** scoring system
- **Automatic quadrant assignment** (3.0 threshold logic)
- **Real-time score calculations** (Impact = Business Value avg, Effort = Feasibility avg)
- **Database-first persistence** with instant updates

### 2. Portfolio Visualization
- **Interactive 2x2 matrix** with scatter plot visualization
- **Four quadrants**: Quick Win, Strategic Bet, Experimental, Watchlist
- **Clickable metrics** with filtering integration
- **Real-time filtering** across 8 business dimensions
- **Recommendation highlighting** with gold star indicators

### 3. Assessment System
- **Complete questionnaire workflow** with email capture
- **AI maturity evaluation** across 5 key domains
- **Automatic scoring** and maturity level calculations
- **Results dashboard** with export capabilities (PDF, Excel, JSON)
- **Assessment-to-use case recommendations** with automatic matching

### 4. Progress Persistence
- **Enhanced auto-save** with 1-second debounced updates
- **Session recovery** on browser reload with validation
- **Dashboard resume capability** showing incomplete assessments
- **Real-time status indicators** with timestamps and connectivity
- **30-day retention** with automatic cleanup

### 5. Advanced Filtering
- **Multi-dimensional filtering**: Process, Activity, LOB, Segment, Geography, Type, Quadrant
- **Text search** across title and description
- **Recommendation filtering** based on assessment results
- **Interactive filter chips** with active state management
- **Filter persistence** across navigation

## LEGO Component Architecture

### Core Building Blocks
- **SummaryMetricsLegoBlock**: Portfolio overview with interactive filtering
- **CRUDUseCaseModal**: Complete use case management with scoring
- **MatrixPlot**: Interactive prioritization visualization
- **QuestionnaireContainer**: Full assessment workflow with persistence
- **ResumeProgressLegoBlock**: Dashboard resumable assessment display
- **ProgressStatusLegoBlock**: Real-time save status indicators
- **AssessmentResultsDashboard**: Complete results with export options
- **ResponseExportLegoBlock**: Multi-format export functionality

### Supporting Components
- **FilterChip**: Reusable filter selection
- **SectionLegoBlock**: Questionnaire section rendering
- **QuestionLegoBlock**: Individual question handling
- **ReusableButton**: Standardized RSA-styled buttons
- **NavigationTabs**: Primary app navigation

## Technology Stack

### Frontend Technologies
- React 18 with TypeScript
- TanStack Query v5 for data fetching
- Wouter for routing
- shadcn/ui component library
- Tailwind CSS for styling
- React Hook Form with Zod validation
- Recharts for data visualization
- Lucide React for icons

### Backend Technologies
- Node.js with Express
- TypeScript for type safety
- PostgreSQL with Neon hosting
- Drizzle ORM with kit for migrations
- Zod for API validation
- Express session handling

### Development Tools
- Vite for build tooling
- ESBuild for fast compilation
- TypeScript for type checking
- Automatic hot reload in development

## Current Implementation Status

### ✅ Completed Features
- Complete use case CRUD with 12-lever scoring
- Interactive matrix visualization with filtering
- Assessment questionnaire with progress persistence
- Results dashboard with multi-format export
- Dashboard resume functionality
- Real-time save status indicators
- Recommendation engine with highlighting
- Enhanced filter system with proper refresh handling
- Database-first architecture with migrations
- Responsive design across all components

### 🎯 Key Business Value
- **Strategic decision-making** through systematic AI use case evaluation
- **Resource optimization** via priority-based quadrant visualization  
- **Maturity assessment** enabling targeted capability development
- **Progress tracking** ensuring continuous improvement
- **Export capabilities** for reporting and stakeholder communication

## Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Main components and LEGO blocks
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Route components
│   │   └── types/          # TypeScript definitions
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data layer
├── shared/                 # Shared TypeScript types
└── data/                  # Seed data and migrations
```

This implementation provides a comprehensive, production-ready AI use case prioritization platform that follows modern development practices and maintains scalability for future enhancements.