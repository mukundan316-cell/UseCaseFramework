# RSA AI Use Case Value Framework - On-Premises Installation Guide

## Overview
This guide will help you deploy the RSA AI Use Case Value Framework on your own infrastructure outside of Replit.

## System Requirements

### Hardware Requirements (Recommended)
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB minimum (for application, database, and file uploads)
- **Network**: Internet connection for initial setup and npm package installation

### Software Requirements
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2
- **Node.js**: v20.x or later
- **PostgreSQL**: 14.x or later
- **Git**: For cloning the repository

### Optional Dependencies
- **LibreOffice**: For PowerPoint to PDF conversion (if using presentation features)
- **ImageMagick**: For image processing (if needed)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/mukundan316-cell/UseCaseFramework.git
cd UseCaseFramework
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

#### Option A: Using existing PostgreSQL instance

```bash
# Connect to your PostgreSQL instance
psql -U postgres

# Create database
CREATE DATABASE rsa_ai_framework;

# Create a dedicated user (optional but recommended)
CREATE USER rsa_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rsa_ai_framework TO rsa_admin;
```

#### Option B: Install PostgreSQL locally

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### 4. Restore Database Backup

The repository includes a complete database backup with 124+ use cases and all configuration.

```bash
# Restore the database backup
psql -U postgres -d rsa_ai_framework < database_backup.sql

# Or if using a custom user:
psql -U rsa_admin -d rsa_ai_framework < database_backup.sql
```

**Note:** If you prefer to start with an empty database, you can skip the restore step and the application will initialize the schema automatically.

### 5. Configure Environment Variables

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your actual configuration
nano .env  # or use your preferred editor
```

**Critical configurations to update in `.env`:**

```env
# Database connection string
DATABASE_URL=postgresql://rsa_admin:your_secure_password@localhost:5432/rsa_ai_framework

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-generated-secret-key

# Node environment
NODE_ENV=production

# Server port (default: 5000)
PORT=5000
```

### 6. Initialize Database Schema (if not restoring backup)

If you're starting fresh without the database backup:

```bash
# Push schema to database using Drizzle
npm run db:push
```

### 7. Create Upload Directory

```bash
# Create directory for file uploads (presentations, PDFs)
mkdir -p uploads
chmod 755 uploads
```

### 8. Build the Application

```bash
# Build both frontend and backend for production
npm run build
```

### 9. Start the Application

```bash
# Start in production mode
npm start
```

The application will be available at: `http://localhost:5000`

## Optional Components

### LibreOffice (for PowerPoint to PDF conversion)

**Ubuntu/Debian:**
```bash
sudo apt install libreoffice
```

**macOS:**
```bash
brew install --cask libreoffice
```

### ImageMagick (for image processing)

**Ubuntu/Debian:**
```bash
sudo apt install imagemagick
```

**macOS:**
```bash
brew install imagemagick
```

## Production Deployment Considerations

### 1. Process Management

Use a process manager to keep the application running:

**Using PM2:**
```bash
npm install -g pm2
pm2 start npm --name "rsa-framework" -- start
pm2 save
pm2 startup
```

### 2. Reverse Proxy (Nginx)

Configure Nginx as a reverse proxy for better performance and SSL support:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    client_max_body_size 50M;  # Match MAX_FILE_SIZE
}
```

### 3. SSL/TLS Configuration

Use Let's Encrypt for free SSL certificates:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Database Backup Strategy

Set up automated database backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-rsa-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/rsa-framework"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U rsa_admin rsa_ai_framework > $BACKUP_DIR/backup_$TIMESTAMP.sql
# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-rsa-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-rsa-db.sh") | crontab -
```

### 5. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If accessing database remotely
sudo ufw allow 5432/tcp

sudo ufw enable
```

### 6. Performance Optimization

**Database Indexing:**
The schema already includes primary keys and foreign keys. For better performance with large datasets, consider adding indexes:

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_use_cases_quadrant ON use_cases(quadrant);
CREATE INDEX idx_use_cases_library_tier ON use_cases(library_tier);
CREATE INDEX idx_use_cases_is_dashboard_visible ON use_cases(is_dashboard_visible);
```

**Node.js Memory:**
For large datasets, increase Node.js memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Security Checklist

- [ ] Change default SESSION_SECRET to a strong random value
- [ ] Use strong database passwords
- [ ] Configure PostgreSQL to only accept connections from localhost (unless needed)
- [ ] Set up SSL/TLS certificates for HTTPS
- [ ] Enable firewall rules
- [ ] Set appropriate file permissions on uploads directory
- [ ] Regularly update Node.js dependencies (`npm audit`, `npm update`)
- [ ] Set up automated database backups
- [ ] Configure log rotation for application logs
- [ ] Implement rate limiting for API endpoints (if needed)

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart rsa-framework
```

### Database Migrations

When schema changes are made:

```bash
# Apply schema changes
npm run db:push

# Or force push if needed
npm run db:push --force
```

### Monitor Application

**Using PM2:**
```bash
pm2 status        # Check status
pm2 logs          # View logs
pm2 monit         # Real-time monitoring
```

### Troubleshooting

**Application won't start:**
- Check `.env` file configuration
- Verify database connection: `psql $DATABASE_URL`
- Check port availability: `lsof -i :5000`
- Review logs: `pm2 logs` or check console output

**Database connection errors:**
- Verify DATABASE_URL format
- Check PostgreSQL is running: `systemctl status postgresql`
- Verify database exists: `psql -U postgres -l`
- Check firewall/network access

**File upload issues:**
- Verify uploads directory exists and has proper permissions
- Check MAX_FILE_SIZE in .env
- Ensure disk space is available

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 14+ with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts
- **File Processing**: Multer, LibreOffice (optional)

### Key Features
- 10-lever scoring framework with automated calculations
- Interactive matrix plot for quadrant-based prioritization
- T-shirt sizing system with UK benchmark costs
- Excel import/export (multi-worksheet support)
- PowerPoint presentation integration with PDF conversion
- AI Inventory governance tracking (82 records)
- Assessment questionnaire platform (Survey.js)
- Executive analytics dashboard
- Portfolio resource planning

### Database Schema
The complete schema is defined in `shared/schema.ts` with:
- **use_cases**: Core use case data with 60+ fields
- **metadata_config**: System configuration and LOVs
- **file_attachments**: File metadata for uploads
- **response_sessions**: Questionnaire response tracking
- **users**: Authentication (simple username/password)

## Support

For issues or questions:
1. Check the `replit.md` file for architecture documentation
2. Review the code comments in `shared/schema.ts` and `shared/calculations.ts`
3. Examine logs for error details
4. Consult the PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`

## License

[Add your license information here]

## Version History

- **v1.0**: Initial release with 124 use cases, T-shirt sizing, executive analytics
- See Git commit history for detailed changes
