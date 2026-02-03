# Azure Deployment Guide

## Complete Package for Hosting Outside Replit

This guide provides everything needed to deploy the Hexaware AI Use Case Value Framework on Azure.

---

## 1. Files Included

| File | Description |
|------|-------------|
| `azure-database-export.sql` | Complete PostgreSQL schema + all data (138 use cases) |
| `AZURE_DEPLOYMENT_GUIDE.md` | This deployment guide |
| `/client/` | React frontend source |
| `/server/` | Express.js backend source |
| `/shared/` | Shared TypeScript schemas |

---

## 2. Required Environment Variables

Set these in Azure App Service > Configuration > Application Settings:

```bash
# Required - Database Connection
DATABASE_URL=postgresql://user:password@yourserver.postgres.database.azure.com:5432/hexaware_ai?sslmode=require

# Required - Session Secret (generate a random 32+ character string)
SESSION_SECRET=your-secure-random-session-secret-here

# Required - Node Environment
NODE_ENV=production

# Optional - Port (Azure will set this automatically)
PORT=5000
```

---

## 3. Azure PostgreSQL Setup

### Step 1: Create Azure Database for PostgreSQL
1. Go to Azure Portal > Create Resource > Azure Database for PostgreSQL
2. Choose "Flexible Server" (recommended)
3. Configure:
   - Server name: `hexaware-ai-db`
   - PostgreSQL version: 15 or higher
   - Compute: Standard_B1ms (minimum)
   - Storage: 32 GB

### Step 2: Configure Networking
1. Enable "Allow public access from any Azure service"
2. Add your IP to firewall rules for initial setup

### Step 3: Import Database
```bash
# Connect to Azure PostgreSQL and run the export
psql "host=yourserver.postgres.database.azure.com port=5432 dbname=hexaware_ai user=adminuser sslmode=require" -f azure-database-export.sql
```

---

## 4. Azure App Service Setup

### Step 1: Create App Service
1. Go to Azure Portal > Create Resource > Web App
2. Configure:
   - Name: `hexaware-ai-platform`
   - Runtime: Node.js 20 LTS
   - Operating System: Linux
   - Region: Same as database
   - Pricing: B1 or higher

### Step 2: Configure Build
In App Service > Configuration > General Settings:
- Startup Command: `npm run start`

### Step 3: Set Environment Variables
Go to Configuration > Application Settings and add:
- `DATABASE_URL` - Your Azure PostgreSQL connection string
- `SESSION_SECRET` - Random secure string
- `NODE_ENV` - `production`

---

## 5. Build and Deploy

### Option A: Deploy from GitHub
1. Fork this repository
2. Connect App Service to GitHub
3. Configure CI/CD pipeline

### Option B: Deploy via ZIP
```bash
# Build the application
npm install
npm run build

# Create deployment package
zip -r deployment.zip . -x "node_modules/*" -x ".git/*"

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group your-resource-group \
  --name hexaware-ai-platform \
  --src deployment.zip
```

### Option C: Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
```

---

## 6. Production Build Commands

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Start production server
npm run start
```

The `npm run start` script runs the compiled server which serves both the API and the React frontend.

---

## 7. File Upload Directory

Create an `uploads` directory for file attachments:
```bash
mkdir -p /home/site/wwwroot/uploads
```

Or configure Azure Blob Storage for production file storage.

---

## 8. Verification Checklist

After deployment, verify:

- [ ] Database connection works (check App Service logs)
- [ ] Homepage loads at your App Service URL
- [ ] Dashboard shows 28 use cases
- [ ] Can create/edit use cases
- [ ] Insights tabs load correctly
- [ ] Help & Guidance section displays

---

## 9. Troubleshooting

### Database Connection Issues
- Verify SSL mode is set to `require` in connection string
- Check Azure PostgreSQL firewall allows App Service IPs
- Ensure database user has proper permissions

### Build Failures
- Check Node.js version matches (20.x)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

### Application Errors
- Check App Service > Diagnose and solve problems
- View logs: App Service > Log stream
- Enable Application Insights for detailed monitoring

---

## 10. Optional: Custom Domain

1. Go to App Service > Custom domains
2. Add your domain (e.g., `ai-framework.yourdomain.com`)
3. Configure SSL certificate (Azure provides free managed certificates)

---

## Support

For issues specific to the application code, refer to `replit.md` for architecture details and feature documentation.
