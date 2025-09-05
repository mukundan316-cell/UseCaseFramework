# RSA AI Use Case Value Framework

Strategic AI use case prioritization platform for RSA Insurance featuring comprehensive assessment, scoring, and analytics capabilities.

## Quick Start
```bash
npm run dev  # Starts application on port 5000
```

## Core Features
- **AI Use Case Management**: Complete CRUD with RSA 10-lever scoring framework and automated recalculation
- **Assessment System**: 6-section AI maturity questionnaire with 25+ advanced question types  
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts
- **File Management System**: PowerPoint/image→PDF conversion with 50MB limit
- **PDF Export System**: Professional reports for use cases, assessments, and portfolios
- **Excel Import/Export**: Multi-worksheet structure with comprehensive validation
- **Manual Override System**: Toggle-based score customization
- **Admin Panel**: Comprehensive configuration with dynamic metadata management
- **LEGO Architecture**: 40+ reusable components with rationalized design

## Database
- **PostgreSQL**: 4+ core tables with hybrid JSON blob storage for questionnaires
- **Live Data**: 106+ use cases successfully migrated, multiple assessment responses
- **File Storage**: Local filesystem + database metadata pattern for scalability

## Tech Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS + Wouter
- **Backend**: Node.js + Express + Drizzle ORM + Zod validation
- **Database**: PostgreSQL with JSONB support for complex data types
- **Charts**: Recharts for analytics visualization
- **PDF**: PDFKit for professional report generation
- **File Processing**: LibreOffice + ImageMagick for document conversion
- **Assessment Platform**: Survey.js with React integration
- **Dependencies**: 100+ specialized packages for enterprise features

## Key Directories
- `client/` - React frontend application with 40+ LEGO components
- `server/` - Express backend API with automated systems
- `shared/` - Common schemas and types with unified utilities
- `attached_assets/` - User-uploaded assets and images
- `temp-presentation-storage/` - Local file storage with metadata
- `temp-questionnaire-storage/` - Assessment data with JSON blob storage

## Documentation
All technical details and user preferences are maintained in `replit.md`.# RSAInsurancePortal
