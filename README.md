# RSA AI Use Case Value Framework

Strategic AI use case prioritization platform for RSA Insurance featuring comprehensive assessment, scoring, and analytics capabilities.

## Quick Start
```bash
npm run dev  # Starts application on port 5000
```

## Core Features
- **AI Use Case Management**: Complete CRUD with RSA scoring framework
- **Assessment System**: 6-section AI maturity questionnaire with 14 question types  
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts
- **Manual Override System**: Toggle-based score customization
- **LEGO Architecture**: Reusable component design throughout

## Database
- **PostgreSQL**: 11 tables with 113 total records
- **Complete Export**: Available in `COMPLETE-DATABASE-EXPORT.sql`
- **Live Data**: 25 use cases (1 active, 24 reference), 49 assessment responses

## Tech Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS
- **Backend**: Node.js + Express + Drizzle ORM  
- **Database**: PostgreSQL with JSONB support
- **Charts**: Recharts for analytics visualization

## Key Directories
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Common schemas and types
- `attached_assets/` - User-uploaded assets and images

## Documentation
All technical details and user preferences are maintained in `replit.md`.