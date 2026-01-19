# Hexaware AI Use Case Value Framework

## Overview
Production-ready strategic platform for prioritizing AI use cases within Hexaware. Features comprehensive scoring framework, executive analytics dashboard, and full CRUD management system for streamlining AI strategy and decision-making.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components
- **Database**: camelCase field naming, string booleans ('true'/'false')
- **Code Quality**: Centralized config, comprehensive error handling, minimal validation
- **Development Focus**: Quick wins without complexity
- **Bubble Sizing**: Moderate exponential scaling (power 1.3)
- **Branding**: Hexaware official brand colors (#3C2CDA, #1D86FF, #14CBDE, #07125E), Manrope/Heebo fonts

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query v5
- **UI Components**: shadcn/ui + TailwindCSS
- **Forms**: react-hook-form + Zod validation
- **Charts**: Recharts
- **Surveys**: Survey.js ecosystem

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon-backed)
- **ORM**: Drizzle ORM
- **Session**: express-session + connect-pg-simple
- **File Processing**: Multer, PDFKit, LibreOffice, ImageMagick

### Development
- **Package Manager**: npm
- **TypeScript**: 5.x
- **Development Server**: tsx (hot reload)
- **Port**: 5000 (frontend + backend unified)

## Data Model

### Core Tables

#### use_cases
Primary entity storing AI use case information, scoring, and governance data.

**Core Fields**:
- `id` (uuid, PK): Auto-generated unique identifier
- `meaningful_id` (varchar, unique): Human-readable ID (HEX_INT_001, HEX_IND_001, HEX_AITOOL_001)
- `title` (text, required): Use case title
- `description` (text, required): Use case description
- `problem_statement` (text): Problem being solved

**Metadata Fields** (Multi-select arrays):
- `processes`, `activities`, `lines_of_business`, `business_segments`, `geographies`

**Scoring Fields** (1-5 scale integers):
- **Impact**: `revenue_impact`, `cost_savings`, `risk_reduction`, `broker_partner_experience`, `strategic_fit`
- **Effort**: `data_readiness`, `technical_complexity`, `change_impact`, `model_risk`, `adoption_readiness`
- **Calculated**: `impact_score`, `effort_score` (real), `quadrant` (text)

**Manual Override System**:
- `manual_impact_score`, `manual_effort_score`, `manual_quadrant`, `override_reason`

**Library Management**:
- `library_source` (text): 'rsa_internal', 'industry_standard', 'ai_inventory'
- `library_tier` (text): 'active', 'reference'
- `is_active_for_rsa` (text): 'true'/'false' (string boolean)
- `is_dashboard_visible` (text): 'true'/'false'
- `activation_reason`, `deactivation_reason`

**AI Governance**:
- `ai_or_model`, `risk_to_customers`, `risk_to_rsa`, `data_used`, `model_owner`
- `rsa_policy_governance`, `business_function`, `ai_inventory_status`, `deployment_status`

**Implementation**:
- `primary_business_owner`, `use_case_status`, `key_dependencies`, `implementation_timeline`
- `success_metrics`, `estimated_value`, `ai_ml_technologies[]`, `data_sources[]`, `stakeholder_groups[]`

**T-shirt Sizing**:
- `t_shirt_size` (XS/S/M/L/XL), `estimated_cost_min/max`, `estimated_weeks_min/max`, `team_size_estimate`

**File Attachments**:
- `presentation_file_id`, `presentation_pdf_file_id`, `has_presentation`

#### file_attachments
Metadata for locally stored files (PowerPoint, PDF, images).

**Fields**:
- `id` (uuid, PK)
- `use_case_id` (FK to use_cases)
- `file_name`, `original_name`, `mime_type`, `file_size`, `local_path`, `file_type`

#### metadata_config
Centralized configuration for dropdown options, scoring, and metadata.

**Fields**:
- Single row table (id: 1)
- `processes[]`, `activities[]`, `lines_of_business[]`, `business_segments[]`, `geographies[]`
- `use_case_types[]`, `use_case_statuses[]`, `source_types[]`
- `scoring_dropdown_options` (JSONB): Dynamic dropdown configurations for all 10 scoring levers
- `t_shirt_sizing_config` (JSONB): UK benchmark rates, overhead multipliers, size thresholds

#### response_sessions
Assessment questionnaire responses and recommendations.

**Fields**:
- `id` (uuid, PK)
- `session_data` (JSONB): Survey.js response data
- `responses` (JSONB): Structured questionnaire responses
- `status`, `current_step`, `completed_at`

#### users
Admin authentication.

**Fields**:
- `id` (uuid, PK), `username` (unique), `password` (hashed)

## Target Operating Model (TOM) Feature

### Overview
TOM provides a configurable operating model layer that maps use cases to lifecycle phases based on their status and deployment state. It supports four operating model presets (Centralized CoE, Federated Model, Hybrid Model, CoE-Led with Business Pods) and automatically derives phases from use case status.

### Configuration (metadata_config.tomConfig)
- `enabled`: String boolean ('true'/'false') to toggle TOM features
- `activePreset`: One of 'centralized', 'federated', 'hybrid', 'coe_led'
- `presets`: Operating model templates with name and description
- `phases`: Array of phase definitions with status/deployment mappings
- `governanceBodies`: Governance body definitions (AI SteerCo, Working Group, Business Owner Review)
- `derivationRules`: Logic for phase matching (matchOrder, fallbackBehavior, nullDeploymentHandling)

### Phase Definitions
| Phase | Color | Mapped Statuses | Mapped Deployments | Manual Only |
|-------|-------|-----------------|-------------------|-------------|
| Foundation | #3C2CDA | Discovery, Backlog, On Hold | - | No |
| Strategic | #1D86FF | In-flight | PoC, Pilot | No |
| Transition | #14CBDE | Implemented | Production | No |
| Steady State | #07125E | - | - | Yes |

### Phase Derivation Logic
1. Check `tomPhaseOverride` (manual assignment takes precedence)
2. Match `useCaseStatus` against phase.mappedStatuses
3. If multiple matches, use `deploymentStatus` as tiebreaker
4. If still ambiguous, use lowest priority number
5. Steady State is manual-only (never auto-derived)

### use_cases TOM Fields
- `tomPhaseOverride` (text, nullable): Manual phase assignment
- `phaseEnteredAt` (timestamp): When use case entered current phase (auto-updated on phase changes)
- `tomOverrideReason` (text): Reason for manual override

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/tom/config | GET | Retrieve TOM configuration |
| /api/tom/config | PUT | Update TOM configuration |
| /api/tom/phase-summary | GET | Get use case counts per phase |
| /api/tom/seed-default | POST | Reset to default TOM configuration |

### UI Components
- **TomConfigurationLegoBlock**: Admin panel for TOM setup (enable/disable, preset selection, phase viewing)
- **TomPhaseBreakdownLegoBlock**: Dashboard widget showing phase distribution
- **TOM Phase Badge**: Use case modal indicator showing derived phase with color

### Derived Phase Response
When TOM is enabled, GET /api/use-cases returns `derivedPhase` for each use case:
```json
{
  "derivedPhase": {
    "id": "foundation",
    "name": "Foundation",
    "color": "#3C2CDA",
    "isOverride": false,
    "matchedBy": "status"
  }
}
```

## Deployment Guide (External Hosting)

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 14+ database
- 2GB+ RAM recommended
- LibreOffice (for document conversion)
- ImageMagick (for image processing)

### Environment Variables

Create `.env` file with:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Session (Required)
SESSION_SECRET=generate-random-64-char-string

# Node Environment
NODE_ENV=production
PORT=5000

# File Upload Limits
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=uploads      # Local directory for file storage
```

### Installation Steps

1. **Clone/Copy Project Files**
```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install Dependencies**
```bash
npm install
```

3. **Database Setup**

Run Drizzle migrations:
```bash
npx drizzle-kit push:pg
```

Seed initial metadata:
```bash
npm run seed  # Or execute server/seed.ts
```

4. **Build Frontend**
```bash
npm run build
```

5. **Start Production Server**
```bash
npm start  # Runs: NODE_ENV=production node server/index.js
```

### File Storage

The application uses local filesystem storage:
- **Directory**: `uploads/` (configurable via UPLOAD_DIR)
- **File Types**: PowerPoint (.pptx), PDF, images
- **Metadata**: Tracked in `file_attachments` table
- **Cleanup**: Orphaned files must be manually cleaned

**Production Recommendations**:
- Mount persistent volume to `uploads/` directory
- Set appropriate file permissions (readable/writable by Node.js process)
- Implement backup strategy for uploads directory
- Consider cloud storage migration (S3, Azure Blob) for scalability

### Database Migration

To migrate existing Replit database to external PostgreSQL:

1. Export data from Replit:
```bash
pg_dump $DATABASE_URL > backup.sql
```

2. Import to new database:
```bash
psql <new-database-url> < backup.sql
```

### Reverse Proxy (Production)

Use Nginx or similar to proxy requests:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Process Management

Use PM2 for production:

```bash
npm install -g pm2
pm2 start npm --name "hexaware-ai-framework" -- start
pm2 save
pm2 startup
```

### Health Checks

The application exposes:
- **Root**: `GET /` - Returns "AI Use Case Framework API"
- **Database**: Auto-initialized on startup with metadata seeding

Monitor:
- Server logs for database connection errors
- File upload directory disk space
- PostgreSQL connection pool status

### Security Considerations

1. **Database**: Always use SSL/TLS (`sslmode=require` in DATABASE_URL)
2. **Session**: Generate strong SESSION_SECRET (64+ random characters)
3. **File Uploads**: Validate file types and sizes server-side
4. **Environment**: Never commit `.env` file to version control
5. **CORS**: Configure allowed origins in production (see `server/index.ts`)

## Key Architectural Decisions

- **Core Data Management**: Full CRUD operations for use cases, supporting 10-lever scoring framework with automated recalculation
- **Data Storage**: PostgreSQL with structured metadata + JSON blobs, string booleans ('true'/'false'), local filesystem for files
- **Analytics**: Interactive matrix plots for quadrant prioritization, executive dashboards, PDF export with ROI explanations
- **Assessment System**: Multi-questionnaire platform (Survey.js), dynamic workflows, 25+ question types
- **File Management**: Local filesystem with PostgreSQL metadata, PowerPoint/PDF conversion, 50MB limit per file
- **Modularity**: LEGO components (reusable, configurable) with 60% maintenance overhead reduction
- **Validation**: Minimal requirements (title + description only), Zod schemas, centralized config in `shared/constants/app-config.ts`
- **Excel Integration**: Multi-worksheet import/export, auto-ID generation (HEX_INT_*, HEX_IND_*, HEX_AITOOL_*)
- **API Design**: RESTful patterns, structured error responses, server-side validation
- **Security**: Input sanitization, parameterized queries (Drizzle ORM), secure session management
- **Performance**: Client-side PDF generation, debounced search (300ms), optimized bubble chart rendering
- **T-shirt Sizing**: UK benchmark compliance, 6 professional roles (£300-£650 daily rates), 1.35x overhead multiplier
- **User Feedback**: Integrated feedback collection with contextual data capture at `/api/feedback`
- **Progressive Disclosure**: Hover tooltips and interactive headers for calculation transparency

## Recent Accomplishments (Q4 2024 - Q1 2025)

- **Complete Hexaware Rebranding**: Updated all RSA references to Hexaware including colors (#3C2CDA primary, #1D86FF bright, #14CBDE electric, #07125E dark), logo (simple wordmark), typography (Manrope/Heebo), and database record migrations (RSA_INT→HEX_INT, RSA_IND→HEX_IND, RSA_AITOOL→HEX_AITOOL)
- **LEGO Component Rationalization**: Consolidated to SmartRatingLegoBlock (5 variants), UnifiedValueInputLegoBlock (3 variants), ConfigurationToggleLegoBlock (3 variants), ResponsiveTabsListLegoBlock (flexible tab layout)
- **AI Inventory Integration**: Full governance system with 126 records (49 Hexaware Internal + 31 Industry Standard + 46 AI Inventory), risk assessment, policy compliance tracking
- **T-shirt Sizing System**: Full UK benchmark compliance with automated size mapping (XS-XL), resource planning across 126 use cases
- **User Feedback Integration**: One-click feedback collection system with contextual logging
- **Stakeholder Validation**: 100% T-shirt sizing compliance with validated UK cost ranges, timelines, benefit calculations
- **Client-side PDF Generation**: Migrated to Survey.js-based export for better compatibility
- **Executive Analytics Enhancement**: Matrix plot optimizations with moderate exponential bubble sizing (power 1.3)
- **Manual Override System**: Toggle-based score customization with reason tracking
- **Multi-dimensional Metadata**: Array fields for processes, activities, business segments, geographies
- **Horizontal Use Case Tracking**: Cross-functional use case identification and categorization

## Strategic Assets (attached_assets/)

Reference documents retained for platform development:

| File | Purpose |
|------|---------|
| `AI-Scale-Operating-Platform-Blueprint.txt` | Unified framework blueprint for multi-tab AI@Scale platform |
| `AI-Scale-Operating-Platform-Strategic-Vision.txt` | Strategic reframe addressing 9 Markel client topics |
| `Value-Realization-Architectural-Plan.txt` | Value realization module schema and LEGO component plan |
| `Hexaware-Brand-Guidelines.pdf` | Official Hexaware brand colors, typography, logo usage |
| `AI-Tool-Inventory-Source-Data.xlsx` | Source data for 46 AI Inventory use cases |
| `Quadrant-Scoring-Methodology.docx` | 10-lever scoring methodology documentation |

**Note:** Legacy screenshots, duplicate exports, and conversation artifacts were cleaned (Jan 2025) - reduced from 545+ files to 6 critical assets.

## External Dependencies

- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter, Framer Motion
- **Data Management**: Drizzle ORM, TanStack Query, Zod
- **File Processing**: PDFKit, Survey.js, LibreOffice, Multer, ImageMagick
- **Database**: PostgreSQL (@neondatabase/serverless)
- **Session**: express-session, connect-pg-simple
- **Specialized**: 100+ dependencies including Survey.js ecosystem, Radix UI primitives
