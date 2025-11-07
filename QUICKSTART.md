# RSA AI Use Case Value Framework - Quick Start Guide

## 5-Minute Setup (Development Mode)

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 14+ installed and running
- Git installed

### Step 1: Clone & Install
```bash
git clone https://github.com/mukundan316-cell/UseCaseFramework.git
cd UseCaseFramework
npm install
```

### Step 2: Database Setup
```bash
# Create database
createdb rsa_ai_framework

# Restore backup with 124 use cases
psql -d rsa_ai_framework < database_backup.sql
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env - Minimal required changes:
# DATABASE_URL=postgresql://localhost:5432/rsa_ai_framework
# SESSION_SECRET=your-random-secret-here
```

### Step 4: Run Application
```bash
npm run dev
```

**Done!** Open http://localhost:5000

---

## What You Get Out of the Box

### 📊 124 Pre-loaded Use Cases
- Strategic use cases from RSA Insurance
- AI Inventory items (57 tools)
- Complete scoring and metadata

### 🎯 10-Lever Scoring Framework
**Impact Levers (50%):**
- Revenue Impact (20%)
- Cost Savings (20%)
- Risk Reduction (20%)
- Broker/Partner Experience (20%)
- Strategic Fit (20%)

**Effort Levers (50%):**
- Data Readiness (20%)
- Technical Complexity (20%)
- Change Impact (20%)
- Model Risk (20%)
- Adoption Readiness (20%)

### 📈 Executive Analytics
- **Matrix Plot**: Interactive bubble chart with 4 quadrants
  - Quick Win: High Impact, Low Effort
  - Strategic Bet: High Impact, High Effort
  - Experimental: Low Impact, Low Effort
  - Watchlist: Low Impact, High Effort
- **ROI Explanations**: Contextual guidance per quadrant
- **Filtering**: By tier, segment, geography, process

### 👕 T-shirt Sizing (XS-XL)
- **XS**: 2-4 weeks, 2-3 people, £15K-£30K
- **S**: 4-8 weeks, 3-4 people, £30K-£60K
- **M**: 8-16 weeks, 4-6 people, £60K-£120K
- **L**: 16-26 weeks, 6-8 people, £120K-£200K
- **XL**: 26-52 weeks, 8-12 people, £200K-£400K

UK benchmark costs with 6 professional roles:
- Developer: £400/day
- Business Analyst: £350/day
- Project Manager: £500/day
- Data Engineer: £550/day
- Solutions Architect: £650/day
- QA Engineer: £300/day

### 📁 Excel Import/Export
- Multi-worksheet support
- Auto-ID generation
- Validation matching UI forms
- Bulk operations

### 📎 PowerPoint Integration
- Upload presentations per use case
- Auto-conversion to PDF
- 50MB file limit
- Local filesystem storage

---

## Common Use Cases

### 1. View Portfolio
**Navigate to**: Dashboard → Use Case Portfolio
- See all use cases in table format
- Filter by quadrant, tier, segment
- Export to Excel

### 2. Add New Use Case
**Click**: "New Use Case" button
- Minimum required: Title + Description
- Score with 10 levers (1-5 scale each)
- Auto-calculated quadrant placement

### 3. Analyze Priorities
**Navigate to**: Analytics → Matrix Plot
- Bubble chart shows impact vs effort
- Bubble size = strategic fit
- Click bubbles for details
- Hover for ROI explanations

### 4. Size Initiatives
**Navigate to**: Portfolio Resource Planning
- Automatic T-shirt sizing based on scores
- UK benchmark cost estimates
- Timeline projections (weeks)
- Team composition breakdown

### 5. Bulk Import
**Navigate to**: Settings → Import/Export
- Download template Excel
- Fill in use cases
- Upload for bulk import
- Validation errors shown clearly

---

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/dashboard` | Quick overview, stats, recent activity |
| **Use Case Portfolio** | `/use-cases` | Full CRUD table, filtering, export |
| **Executive Analytics** | `/analytics` | Matrix plot, ROI insights |
| **Resource Planning** | `/resource-planning` | T-shirt sizing, cost estimates |
| **AI Inventory** | `/ai-inventory` | Governance, risk tracking |
| **Assessments** | `/questionnaire` | Survey platform for discovery |
| **Settings** | `/settings` | Metadata config, import/export |

---

## File Structure

```
UseCaseFramework/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   └── lib/           # Utilities, query client
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database interface
│   └── services/          # Business logic
├── shared/                # Shared between frontend/backend
│   ├── schema.ts          # Database schema + types
│   ├── calculations.ts    # Scoring logic
│   └── constants/         # App configuration
├── database_backup.sql    # Full DB backup (124 use cases)
├── .env.example           # Environment template
├── INSTALLATION.md        # Detailed deployment guide
└── package.json           # Dependencies
```

---

## Environment Variables Reference

```env
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=your-secret-key

# Optional
PORT=5000                    # Server port (default: 5000)
NODE_ENV=development         # development | production
MAX_FILE_SIZE=52428800       # 50MB in bytes
UPLOAD_DIR=./uploads         # File storage location
```

---

## Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -d rsa_ai_framework

# Verify DATABASE_URL in .env
```

### Port 5000 already in use
```bash
# Change PORT in .env
PORT=3000

# Or kill existing process
lsof -ti:5000 | xargs kill
```

### Import fails
- Ensure Excel matches template format
- Check for duplicate meaningful_id values
- Verify scoring levers are 1-5 (not 0)

### File uploads fail
```bash
# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Check MAX_FILE_SIZE in .env
```

---

## Next Steps

1. **Customize Metadata**: Settings → Metadata Configuration
   - Add your own processes, activities, segments
   - Configure custom dropdown options

2. **Create Assessments**: Questionnaire → Admin
   - Build discovery surveys
   - Collect stakeholder input
   - Auto-generate use cases from responses

3. **Set Up Users**: Currently uses simple auth
   - Default: Create users in database directly
   - Or integrate with your SSO/LDAP

4. **Configure Scoring**: `shared/constants/app-config.ts`
   - Adjust lever weights
   - Customize quadrant thresholds
   - Modify T-shirt sizing rules

5. **Production Deployment**: See `INSTALLATION.md`
   - PM2 process management
   - Nginx reverse proxy
   - SSL/TLS certificates
   - Automated backups

---

## Support & Documentation

- **Architecture**: See `replit.md` for detailed system design
- **Schema**: See `shared/schema.ts` for database structure
- **Calculations**: See `shared/calculations.ts` for scoring logic
- **Full Install Guide**: See `INSTALLATION.md` for production setup

---

## Default Credentials

The restored database includes a default admin user:
- **Username**: `admin`
- **Password**: Check database or create new user

**Change these immediately for production use!**

---

**Ready to prioritize your AI portfolio?** 🚀

For detailed installation and production deployment, see `INSTALLATION.md`.
