# RSA AI Use Case Value Framework

Strategic AI use case prioritization platform for RSA Insurance featuring comprehensive assessment, scoring, and analytics capabilities.

## Quick Start
```bash
npm run dev  # Starts application on port 5000
```

## Core Features
- **AI Use Case Management**: Complete CRUD with RSA 10-lever scoring framework
- **Assessment System**: 6-section AI maturity questionnaire with 25+ advanced question types  
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts
- **PDF Export System**: Professional reports for use cases, assessments, and portfolios
- **Manual Override System**: Toggle-based score customization
- **LEGO Architecture**: Reusable component design throughout

## Database
- **PostgreSQL**: 4 core tables with hybrid JSON blob storage for questionnaires
- **Live Data**: 25 use cases, multiple assessment responses with structured answers

## Tech Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS + Wouter
- **Backend**: Node.js + Express + Drizzle ORM + Zod validation
- **Database**: PostgreSQL with JSONB support for complex data types
- **Charts**: Recharts for analytics visualization
- **PDF**: PDFKit for professional report generation

## Key Directories
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Common schemas and types
- `attached_assets/` - User-uploaded assets and images

## Documentation
All technical details and user preferences are maintained in `replit.md`.# RSAInsurancePortal
