# Hexaware AI Use Case Value Framework

Strategic AI use case prioritization platform for Hexaware featuring comprehensive assessment, scoring, and analytics capabilities.

## Quick Start
```bash
npm run dev  # Starts application on port 5000
```

## Latest Accomplishments (Jan 2026)
- ✅ **Modular Architecture Refactor**: Server routes split into 17 domain modules (97% reduction in routes.ts)
- ✅ **CRUD Modal Modularization**: Tab components extracted to 6 specialized modules (52% reduction)
- ✅ **Value Realization System**: KPI-based ROI tracking with 9 insurance-specific metrics
- ✅ **Capability Transition**: "Teach Us to Fish" staffing curves and independence projections
- ✅ **Markel 9 Topics Compliance**: Duplicate detection, full audit trails, role evolution tracking
- ✅ **Auto-Derivation System**: Smart cascading derivation of TOM phase, value estimates, and capability defaults
- ✅ **Database-Driven Config**: All features driven by metadata_config table

## Previous Accomplishments (Q4 2024 - Q1 2025)
- ✅ **LEGO Component System**: 60% maintenance reduction through 3-phase rationalization
- ✅ **AI Inventory Integration**: 126 total records with full governance tracking
- ✅ **Enhanced T-shirt Sizing**: Configurable cost estimation and timeline projection
- ✅ **Client-side PDF Export**: Migrated for improved compatibility and performance  
- ✅ **Executive Analytics**: Matrix plot optimizations with ROI explanations
- ✅ **Manual Override System**: Flexible scoring adjustments with audit trails
- ✅ **Multi-dimensional Metadata**: Array support for complex business categorization
- ✅ **Horizontal Use Case Tracking**: Cross-functional use case identification

## Core Features
- **AI Use Case Management**: Complete CRUD with 10-lever scoring framework and automated recalculation
- **Assessment System**: 6-section AI maturity questionnaire with 25+ advanced question types  
- **Analytics Dashboard**: AI Value Matrix with interactive charts and quadrant-based ROI analysis
- **Value Realization**: KPI-based ROI tracking with industry benchmarks and confidence levels
- **Capability Transition**: Staffing curves, KT milestones, and path to self-sufficiency
- **Target Operating Model (TOM)**: 4 presets with phase-based governance gates
- **Markel 9 Topics Compliance**: Duplicate detection, audit trails, role evolution tracking
- **File Management System**: PowerPoint/image→PDF conversion with 50MB limit
- **PDF Export System**: Professional reports for use cases, assessments, and portfolios
- **Excel Import/Export**: Multi-worksheet structure with comprehensive validation
- **Manual Override System**: Toggle-based score customization with reason tracking
- **Admin Panel**: Comprehensive configuration with dynamic metadata management
- **LEGO Architecture**: 70+ rationalized components with modular route and modal architectures

## Database
- **PostgreSQL**: Production-ready schema with 4+ core tables and hybrid JSON blob storage
- **Live Data**: 126 use cases (49 Hexaware Internal + 31 Industry Standard + 46 AI Inventory) with governance tracking
- **File Storage**: Local filesystem + database metadata pattern for scalability
- **AI Inventory**: Full governance fields with risk assessment and policy compliance

## Tech Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS + Wouter
- **Backend**: Node.js + Express + Drizzle ORM + Zod validation
- **Database**: PostgreSQL with JSONB support and string boolean consistency
- **Charts**: Recharts with optimized bubble scaling (power 1.3)
- **PDF**: Client-side Survey.js PDF generation + server-side PDFKit for reports
- **File Processing**: LibreOffice + ImageMagick for document conversion
- **Assessment Platform**: Survey.js with React integration and 25+ question types
- **Dependencies**: 100+ specialized packages including T-shirt sizing engine

## Key Directories
- `client/` - React frontend application with 70+ LEGO components
  - `client/src/components/lego-blocks/crud-modal-tabs/` - Modular CRUD modal tabs
- `server/` - Express backend API with automated systems
  - `server/routes/` - 17 domain-based route modules (use-cases, value, tom, capability, etc.)
- `shared/` - Common schemas and types with unified utilities
- `attached_assets/` - User-uploaded assets and images
- `uploads/` - File storage with metadata tracking

## Documentation
- **Technical Details**: `replit.md` - Architecture, data model, deployment guide
- **User Guide**: `HEXAWARE_USER_GUIDE.md` - End-user training with feature walkthrough
- **Installation**: `INSTALLATION.md` - Full production deployment guide
- **Quick Start**: `QUICKSTART.md` - 5-minute setup instructions
