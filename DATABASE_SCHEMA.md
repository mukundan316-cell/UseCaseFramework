# RSA AI Framework - Database Schema Documentation

## Overview

The RSA AI Use Case Value Framework uses a PostgreSQL database with three main tables designed for scalability, data integrity, and real-time operations. All database operations are handled through Drizzle ORM with type-safe queries and automatic migrations.

## Database Connection

- **Provider**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle with TypeScript
- **Connection**: Environment variable `DATABASE_URL`
- **Connection Pool**: Configured for production workloads

## Schema Tables

### 1. `use_cases` Table

**Purpose**: Stores all AI use case data with complete RSA framework scoring dimensions.

```sql
CREATE TABLE use_cases (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value_chain_component TEXT NOT NULL,
  process TEXT NOT NULL,
  line_of_business TEXT NOT NULL,
  lines_of_business TEXT[],
  business_segment TEXT NOT NULL,
  geography TEXT NOT NULL,
  use_case_type TEXT NOT NULL,
  
  -- Business Value Levers (Impact Score Components)
  revenue_impact INTEGER NOT NULL,
  cost_savings INTEGER NOT NULL,
  risk_reduction INTEGER NOT NULL,
  broker_partner_experience INTEGER NOT NULL,
  strategic_fit INTEGER NOT NULL,
  
  -- Feasibility Levers (Effort Score Components)
  data_readiness INTEGER NOT NULL,
  technical_complexity INTEGER NOT NULL,
  change_impact INTEGER NOT NULL,
  model_risk INTEGER NOT NULL,
  adoption_readiness INTEGER NOT NULL,
  
  -- AI Governance Levers
  explainability_bias INTEGER NOT NULL,
  regulatory_compliance INTEGER NOT NULL,
  
  -- Calculated Scores
  impact_score REAL NOT NULL,
  effort_score REAL NOT NULL,
  quadrant TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features**:
- 12 scoring dimensions (1-5 scale each)
- Real-time calculated impact/effort scores
- Automatic quadrant assignment
- Support for multiple lines of business
- UUID primary keys for distributed systems

### 2. `metadata_config` Table

**Purpose**: Stores UI list of values that drive all dropdown options and filters throughout the application.

```sql
CREATE TABLE metadata_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  value_chain_components TEXT[] NOT NULL,
  processes TEXT[] NOT NULL,
  lines_of_business TEXT[] NOT NULL,
  business_segments TEXT[] NOT NULL,
  geographies TEXT[] NOT NULL,
  use_case_types TEXT[] NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Key Features**:
- Single row configuration (id='default')
- Array fields for each metadata category
- Timestamp tracking for audit purposes
- Direct integration with form dropdowns
- Admin panel CRUD operations

### 3. `users` Table

**Purpose**: User authentication system (prepared for future multi-tenant expansion).

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

**Key Features**:
- UUID primary keys
- Unique username constraints
- Password field (for future authentication)
- Ready for session management

## Data Relationships

### Current Relationships
- `use_cases.value_chain_component` → References values in `metadata_config.value_chain_components[]`
- `use_cases.process` → References values in `metadata_config.processes[]`
- `use_cases.line_of_business` → References values in `metadata_config.lines_of_business[]`
- `use_cases.business_segment` → References values in `metadata_config.business_segments[]`
- `use_cases.geography` → References values in `metadata_config.geographies[]`
- `use_cases.use_case_type` → References values in `metadata_config.use_case_types[]`

### Future Relationships
- `use_cases.created_by` → `users.id` (for user attribution)
- Organization/tenant tables for multi-tenant support

## Scoring Framework Implementation

### Business Value Levers (Impact Score)
1. **Revenue Impact** (1-5): Direct revenue generation potential
2. **Cost Savings** (1-5): Operational cost reduction capability
3. **Risk Reduction** (1-5): Risk mitigation and compliance improvement
4. **Broker/Partner Experience** (1-5): External relationship enhancement
5. **Strategic Fit** (1-5): Alignment with company strategic objectives

### Feasibility Levers (Effort Score)
1. **Data Readiness** (1-5): Data availability and quality (inverted for effort)
2. **Technical Complexity** (1-5): Implementation complexity
3. **Change Impact** (1-5): Organizational change requirements
4. **Model Risk** (1-5): AI/ML model risks and uncertainties
5. **Adoption Readiness** (1-5): User acceptance potential (inverted for effort)

### AI Governance Levers
1. **Explainability/Bias** (1-5): Model transparency and fairness
2. **Regulatory Compliance** (1-5): Regulatory adherence requirements

### Score Calculations
```typescript
// Impact Score: Average of Business Value levers
impactScore = (revenueImpact + costSavings + riskReduction + brokerPartnerExperience + strategicFit) / 5

// Effort Score: Average of Feasibility levers (with inversions)
effortScore = ((6-dataReadiness) + technicalComplexity + changeImpact + modelRisk + (6-adoptionReadiness)) / 5

// Quadrant Assignment:
// - Quick Win: impact >= 3.5 && effort < 3.5
// - Strategic Bet: impact >= 3.5 && effort >= 3.5
// - Experimental: impact < 3.5 && effort < 3.5
// - Watchlist: impact < 3.5 && effort >= 3.5
```

## Migration and Seeding

### Automatic Migration Process
1. **Schema Validation**: Drizzle checks current schema against defined models
2. **Column Addition**: New framework columns added automatically
3. **Data Migration**: Existing records updated with enhanced framework values
4. **Score Recalculation**: All impact/effort scores recalculated using new formula

### Initial Data Seeding
- **Use Cases**: 16+ realistic commercial insurance AI use cases
- **Metadata Config**: Default values for all dropdown categories
- **Enhanced Framework**: All use cases include complete 12-lever scoring

## Performance Considerations

### Indexing Strategy
- Primary keys (UUID) automatically indexed
- Consider composite indexes on frequently filtered columns
- Text search indexes for title/description fields

### Query Optimization
- Use proper TypeScript types from Drizzle inference
- Batch operations for bulk updates
- Connection pooling for concurrent requests

### Scaling Considerations
- Neon serverless automatically scales connections
- Consider read replicas for reporting workloads
- Implement caching for metadata configuration

## Data Integrity and Validation

### Database Constraints
- NOT NULL constraints on required fields
- Array fields for proper metadata storage
- Timestamp fields with proper defaults

### Application-Level Validation
- Zod schemas for API request validation
- Type-safe database operations through Drizzle
- Real-time score calculation validation

### Backup and Recovery
- Neon provides automatic backups
- Point-in-time recovery capabilities
- Export functionality for configuration backup

## API Integration

### RESTful Endpoints
- `GET /api/use-cases` - Retrieve all use cases
- `POST /api/use-cases` - Create new use case
- `PUT /api/use-cases/:id` - Update existing use case
- `DELETE /api/use-cases/:id` - Delete use case
- `GET /api/metadata` - Retrieve metadata configuration
- `PUT /api/metadata` - Update metadata configuration

### Response Format
All API responses include proper TypeScript typing and consistent error handling with appropriate HTTP status codes.

---

*Last Updated: January 2025*
*Database Version: PostgreSQL 14+ (Neon Serverless)*
*ORM Version: Drizzle 0.x with TypeScript*