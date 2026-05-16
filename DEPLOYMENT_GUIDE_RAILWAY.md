# FluxoZap Railway Deployment Guide

## Prerequisites

- Railway CLI installed: `npm install -g @railway/cli`
- Railway account with project initialized
- GitHub repository connected to Railway (optional but recommended)
- All environment variables configured

## Step 1: Login to Railway

```bash
railway login
# Follow browser prompt to authenticate
```

## Step 2: Select Project

```bash
railway projects list
# Select fluxozap-typebot project
railway link
```

## Step 3: Verify Environment Configuration

```bash
# View all environment variables
railway env

# Should show:
# DATABASE_URL=postgresql://...
# AUTH_SECRET=...
# TYPEBOT_SSO_SECRET=...
# SMTP_HOST=...
# EVOLUTION_BASE_URL=...
# ... (all other vars)
```

### If Variables Are Missing:

```bash
# Set via CLI
railway env add VARIABLE_NAME value

# Or edit in Railway Dashboard:
# 1. Go to https://railway.app/project/[PROJECT_ID]
# 2. Click Settings → Variables
# 3. Add each missing variable
```

## Step 4: Database Migrations

Before deploying, ensure database schema is up to date:

```bash
# Run migrations
railway run npx prisma migrate deploy

# View migration status
railway run npx prisma migrate status
```

## Step 5: Build Validation

```bash
# Build locally to catch errors early
npm run build

# If build fails:
# 1. Check npm run build output for errors
# 2. Fix any TypeScript or dependency issues
# 3. Commit changes and try deploy again
```

## Step 6: Deploy to Railway

### Option A: Deploy via CLI (Recommended)

```bash
# Simple deploy
railway deploy

# Deploy with custom branch
railway deploy --branch main

# Force redeploy
railway deploy --force
```

### Option B: Deploy via GitHub (Auto-Deploy)

1. Connect GitHub repository to Railway
2. Every push to main branch automatically deploys
3. View deployment logs in Railway Dashboard

## Step 7: Monitor Deployment

```bash
# View deployment logs
railway logs

# View real-time logs
railway logs --follow

# View last 100 lines
railway logs --lines 100
```

### Expected Log Output:

```
[FluxoZap] Starting application...
> next-server starting...
[FluxoZap] Connected to database successfully
[FluxoZap] Typebot SSO configured
[FluxoZap] SMTP configured for production
[FluxoZap] Application ready on port 3000
```

### If Deployment Fails:

```bash
# Check error in logs
railway logs | grep -i error

# Common errors:
# - "DATABASE_URL not found" → Set DATABASE_URL env var
# - "SMTP connection refused" → Check SMTP credentials
# - "Migration failed" → Run: railway run npx prisma migrate deploy

# Rollback to previous version
railway rollback
```

## Step 8: Test Deployment

```bash
# Get deployed URL
railway env | grep RAILWAY_STATIC_URL
# Output: RAILWAY_STATIC_URL=https://fluxozap-production.railway.app

# Test health
curl https://fluxozap-production.railway.app/health

# Test signup endpoint
curl -X POST https://fluxozap-production.railway.app/api/auth/signup \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test&email=test@test.com&password=Test123!&agencyName=TestAgency"

# Check response status (should be 302 for redirect)
```

## Step 9: Validate Services

```bash
# Check all services are running
railway status

# Expected output:
# Service Status Health
# fluxozap DEPLOYED HEALTHY
# typebot-builder RUNNING HEALTHY
# typebot-viewer RUNNING HEALTHY
# postgres RUNNING HEALTHY
# redis RUNNING HEALTHY
```

## Step 10: Production Verification

### Checklist

- [ ] Application loads at deployed URL
- [ ] Signup page works
- [ ] Can create account and receive verification email
- [ ] Can login with created account
- [ ] Dashboard loads without errors
- [ ] Can create flows
- [ ] Can create clients
- [ ] Typebot SSO works (editor opens in iframe)
- [ ] Can deploy flows to WhatsApp

### Manual Testing in Production

1. **Signup Test**:
   ```
   URL: https://[deployed-url]/auth/signup
   - Fill form with test data
   - Verify email is sent (check email inbox)
   - Verify can login
   ```

2. **SSO Test**:
   ```
   - Goto dashboard/flows
   - Check "Motor visual conectado" status
   - Create new flow
   - Click "Abrir editor"
   - Verify Typebot loads in iframe
   ```

3. **Evolution Test**:
   ```
   - Goto dashboard/clients
   - Create new client
   - Go to instances
   - Create instance and scan QR code
   - Verify instance shows "CONNECTED"
   ```

## Step 11: Monitoring & Alerts

### Setup Alerts in Railway

1. Go to Railway Dashboard
2. Click Project Settings
3. Set alerts for:
   - Memory > 500MB
   - CPU > 80%
   - Error rate > 5%
   - Deployment failures

### View Metrics

```bash
railway metrics

# Or in Dashboard:
# Project → Deployments → View metrics for each deployment
```

## Step 12: Backup Strategy

### Database Backups

```bash
# Auto-backups enabled by default on Railway Postgres
# View backups in Dashboard:
# Settings → Backups

# Manual backup
railway run "pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql"

# Restore from backup
railway run "psql $DATABASE_URL < backup-20241215.sql"
```

## Rollback Procedure

If issues occur after deployment:

### Option 1: Quick Rollback

```bash
railway rollback
# Returns to previous deployment
```

### Option 2: Redeploy Previous Version

```bash
# View deployment history
railway logs --lines 50 | grep "Deploying"

# Redeploy specific commit
railway deploy --commit [commit-hash]
```

## Common Production Issues & Solutions

### Issue: "503 Service Unavailable"
**Cause**: Application crashed on startup  
**Solution**:
```bash
railway logs | grep -i error
# Fix error, commit, redeploy
```

### Issue: "502 Bad Gateway"
**Cause**: Service temporarily down  
**Solution**:
```bash
# Restart service
railway restart
```

### Issue: "No database connection"
**Cause**: DATABASE_URL missing or wrong  
**Solution**:
```bash
# Verify DATABASE_URL
railway env | grep DATABASE_URL

# If missing, add it
railway env add DATABASE_URL postgresql://...

# Redeploy
railway deploy
```

### Issue: "Email not sending"
**Cause**: SMTP credentials wrong  
**Solution**:
```bash
# Verify SMTP vars
railway env | grep SMTP

# Test SMTP connection
railway run node -e "console.log(process.env.SMTP_HOST)"

# Update credentials if needed
railway env remove SMTP_PASSWORD
railway env add SMTP_PASSWORD new-password

# Redeploy
railway deploy
```

## Scaling Configuration

### Increase Memory/CPU

1. Go to Railway Dashboard
2. Click Service → Settings
3. Adjust resources:
   - Memory: 512MB → 1GB → 2GB
   - CPU: Standard → Pro

### Database Scaling

1. Settings → Postgres Configuration
2. Increase instance size if needed
3. Railway handles scaling without downtime

## Performance Optimization

### Caching

Already configured:
- Static asset caching (Next.js)
- Database query caching (Prisma)
- Typebot session caching

### Database Optimization

```bash
# Analyze query performance
railway run npx prisma studio

# In Prisma Studio:
# 1. Browse tables
# 2. Check for slow queries
# 3. Add indexes if needed

# Example: Add index on email
# npx prisma migrate dev --name add_email_index
# In migration file: CREATE INDEX idx_user_email ON users(email)
```

## Security Hardening for Production

### Environment Variables Check

```bash
# Verify no secrets in logs
railway logs | grep -i password
# Should return nothing

# Verify AUTH_SECRET is strong (32+ chars)
railway env | grep AUTH_SECRET
```

### SSL/HTTPS

- Automatically enabled by Railway
- Certificate auto-renewed every 90 days
- All traffic is encrypted

### Rate Limiting

Add to future roadmap or implement via middleware:

```typescript
// Example middleware in future versions
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

## Maintenance Tasks

### Weekly

- [ ] Check logs for errors
- [ ] Verify all services are running
- [ ] Test critical flows manually

### Monthly

- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Check for security patches

### Quarterly

- [ ] Full backup test
- [ ] Security audit
- [ ] Performance optimization review

## Support & Escalation

### Get Help

1. **Railway Support**: https://railway.app/support
2. **Documentation**: https://docs.railway.app
3. **Community**: Discord or GitHub issues

### Escalation Path

1. Check logs: `railway logs | grep error`
2. Review environment: `railway env`
3. Check service health: `railway status`
4. If unresolved, contact Railway support with logs

## Final Checklist Before Production

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Build succeeds locally
- [ ] Signup/login flows tested
- [ ] Email sending verified
- [ ] SSO to Typebot verified
- [ ] WhatsApp instance connection verified
- [ ] Error logs reviewed
- [ ] Performance acceptable (<2s response time)
- [ ] Team is trained on deployment/rollback

---

## Deployment Completed!

Your FluxoZap application is now running in production on Railway. 

**Monitor** the application regularly and follow the maintenance schedule to ensure stability and performance.

**Documentation**: Keep this guide for future deployments and troubleshooting.

---

**Emergency Contact**: [Contact info for your team]  
**Last Updated**: December 2024
