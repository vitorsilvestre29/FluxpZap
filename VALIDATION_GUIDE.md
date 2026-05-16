# FluxoZap Manual Validation Guide

## Overview
This guide provides step-by-step instructions to validate all critical FluxoZap features:
1. **Authentication** - Signup, email verification, login, password reset
2. **Typebot SSO Integration** - Create flows, open editor via SSO
3. **WhatsApp Deployment** - Create clients/instances, link flows, deploy to Evolution

---

## Prerequisites
- FluxoZap running at `http://localhost:3000` (or configured APP_URL)
- Typebot builder running at TYPEBOT_BASE_URL
- Evolution API running at EVOLUTION_BASE_URL
- SMTP configured for email delivery
- Database migrations applied

---

## Test 1: Authentication Flow

### 1.1 - Signup New Agency
1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in:
   - **Agency Name**: "Test Agency X"
   - **Your Name**: "John Doe"
   - **Email**: "test-{timestamp}@test.local"
   - **Password**: "TestPass123!"
3. Click "Criar conta"
4. **Expected**: Redirected to `/auth/check-email` with message about verification email
   - If NODE_ENV !== 'production': Token is shown in query params for testing
   - If NODE_ENV === 'production': Email should be sent to configured SMTP

### 1.2 - Verify Email (Development)
1. From `/auth/check-email`, copy the token from URL
2. Navigate to `/auth/verify?token={token}`
3. **Expected**: Redirected to `/auth/login` with `verified=1` message

### 1.3 - Verify Email (Production)
1. Check email inbox for verification link
2. Click the link (should be: `http://localhost:3000/auth/verify?token={token}`)
3. **Expected**: Redirected to login page with success message

### 1.4 - Login
1. Navigate to `http://localhost:3000/auth/login`
2. Enter email and password from signup
3. Click "Entrar"
4. **Expected**: Redirected to `/dashboard` with user logged in

### 1.5 - Verify Session
1. In dashboard, check browser DevTools → Application → Cookies
2. **Expected**: `sessionToken` cookie should be present and non-empty

### 1.6 - Password Reset
1. From login page, click "Esqueceu a senha?"
2. Navigate to `http://localhost:3000/auth/reset`
3. Enter email and click "Enviar link"
4. **Expected**: Redirected to `/auth/check-email` with reset instructions

### 1.7 - Reset Password (Development)
1. Copy token from check-email page query params
2. Navigate to `/auth/reset/[token]` with copied token
3. Enter new password
4. **Expected**: Redirected to login with success message

### 1.8 - Reset Password (Production)
1. Check email for reset link
2. Click link (format: `/auth/reset/[token]`)
3. Enter new password
4. **Expected**: Redirected to login, can login with new password

---

## Test 2: Typebot SSO Integration

### Prerequisites
- Must be logged in (completed Test 1.4)
- TYPEBOT_BASE_URL configured
- TYPEBOT_SSO_SECRET or FLUXOZAP_SSO_SECRET configured

### 2.1 - Verify Visual Builder Status
1. Navigate to `/dashboard/flows`
2. Look for status indicator:
   - **"Motor visual conectado"** (green): SSO is configured
   - **"Motor visual pendente"** (gray): SSO not configured - STOP, configure secrets
3. **Expected**: "Motor visual conectado" appears

### 2.2 - Create New Flow
1. Click "+ Novo Fluxo"
2. Fill in:
   - **Flow Name**: "Test Flow 001"
   - **Description**: "E2E test flow"
3. Select **Provider**: "TYPEBOT"
4. Click "Criar"
5. **Expected**: 
   - Redirected to flows list
   - New flow appears with status "DRAFT"
   - Flow has no typebotId initially

### 2.3 - Provision Typebot
1. In flows list, click "Preparar motor visual" on the new flow
2. **Expected**:
   - Page shows loading indicator
   - Flow status updates to show Typebot ID
   - Error message if:
     - SSO secret not configured
     - TYPEBOT_BASE_URL not accessible
     - API call to Typebot fails

### 2.4 - Open Flow Editor (SSO Handoff)
1. From flows list, click the flow name or "Abrir editor"
2. **Expected**:
   - Redirected to `/dashboard/flows/[flowId]/editor`
   - Page shows iframe loading
   - SSO request to `/api/typebot/sso?flowId=[flowId]`
   - Typebot editor loads inside iframe
3. **Verification**: In browser console check:
   ```javascript
   // Should show Typebot editor loaded
   window.frames[0].location.href.includes('typebot.seudominio.com')
   ```

### 2.5 - Verify SSO Session Creation in Typebot
1. In Typebot builder (inside iframe), verify you're logged in
2. Navigate to Typebot admin → Users
3. **Expected**: New user entry with email from FluxoZap account

### 2.6 - Create Steps in Typebot
1. In Typebot editor, add steps:
   - Message: "Hello! What's your name?"
   - Input: Text
   - Message: "Nice to meet you, {Name}!"
2. Click "Publish"
3. **Expected**: Typebot generates public URL for bot

### 2.7 - Verify Flow Status Updates
1. Go back to FluxoZap dashboard `/dashboard/flows`
2. Click flow to open editor page
3. **Expected**: 
   - Published URL is accessible and shows bot preview
   - Flow status should reflect as "READY" or "PUBLISHED"

---

## Test 3: WhatsApp Client & Instance Setup

### Prerequisites
- Must be logged in
- Flow created and published (completed Test 2.2-2.6)
- EVOLUTION_BASE_URL configured
- EVOLUTION_API_KEY configured

### 3.1 - Create WhatsApp Client
1. Navigate to `/dashboard/clients`
2. Click "+ Novo Cliente"
3. Fill in:
   - **Name**: "Cliente Teste 001"
   - **WhatsApp Number**: "+5511999999999" (format: +5511 + 8 digits)
   - **Contact Name**: "John Doe"
   - **Contact Email**: "john@test.local"
   - **Contact Phone**: "(11) 9999-9999"
4. Click "Criar"
5. **Expected**: Redirected to clients list, new client appears

### 3.2 - Create WhatsApp Instance
1. Navigate to `/dashboard/instances`
2. Click "+ Nova Instância"
3. Fill in:
   - **Client**: Select the client from 3.1
   - **Instance Name**: "instance-teste-001"
4. Click "Criar"
5. **Expected**:
   - Instance appears with status "QR_READY"
   - QR code displays for scanning
   - Error message if Evolution API unreachable

### 3.3 - Scan QR Code (Production Test)
1. Open WhatsApp on phone
2. Go to Settings → Linked devices
3. Scan displayed QR code
4. **Expected**:
   - WhatsApp connects to instance
   - Instance status changes from "QR_READY" to "CONNECTED"
   - In Evolution API dashboard, instance shows as "online"

### 3.4 - Create Client-Flow Link
1. Navigate to `/dashboard/links`
2. Click "+ Novo Vínculo"
3. Fill in:
   - **Client**: Select from 3.1
   - **Flow**: Select from 3.2
   - **Instance**: Select from 3.2
4. Click "Vincular"
5. **Expected**: Link appears in links list with status "PENDING"

### 3.5 - Deploy Link to Evolution
1. In links list, click "Publicar" on the new link
2. **Expected**:
   - Page shows loading indicator
   - Link status changes to "ACTIVE"
   - Error message if:
     - Flow not published in Typebot
     - Instance not connected
     - Evolution API unreachable

### 3.6 - Configure Bot Trigger (Optional)
1. On link page, adjust settings:
   - **Trigger Type**: "KEYWORD" or "ALL"
   - **Trigger Value**: For keyword, set "!bot"
   - **Messages Configuration**: Adjust delay, stop conditions, etc.
2. Click "Atualizar"
3. **Expected**: Settings saved and applied to Evolution bot

### 3.7 - Test Bot in WhatsApp
1. Open WhatsApp on phone connected to instance
2. Send message to instance:
   - If ALL trigger: Send any message
   - If KEYWORD: Send "!bot"
3. **Expected**:
   - Typebot flow runs
   - Messages appear in sequence
   - Bot responds to inputs as configured

---

## Test 4: Full Integration Smoke Test

### Quick validation that all systems are working:

1. **Start at login** (`/auth/login`)
2. **Navigate through each module**:
   - Dashboard → flows, clients, instances, links
   - Each section should load without errors
3. **Check API responses** (DevTools → Network):
   - All `/api/*` requests should return 200/302 (no 500 errors)
   - No CORS errors
4. **Monitor browser console**:
   - No JavaScript errors (red messages in console)
   - No missing resource warnings

---

## Troubleshooting Guide

### SSO Secret Mismatch
**Symptom**: "Motor visual pendente" in flows page
**Solution**:
1. Ensure `TYPEBOT_SSO_SECRET` or `FLUXOZAP_SSO_SECRET` is set
2. Verify same secret is set in Typebot instance
3. Restart both services

### Email Not Sending
**Symptom**: No email received after signup
**Solution**:
1. Check NODE_ENV is "production" (dev mode logs to console)
2. Verify SMTP config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
3. Check `/api/auth/signup` response in DevTools Network tab
4. Look for errors in server logs

### Evolution API Not Responding
**Symptom**: Instance creation fails
**Solution**:
1. Verify `EVOLUTION_BASE_URL` is accessible: `curl -X GET http://localhost:8080/health`
2. Check `EVOLUTION_API_KEY` is correct
3. Verify Evolution service is running
4. Check network connectivity between services

### Typebot Editor Blank
**Symptom**: Editor iframe shows nothing
**Solution**:
1. Verify `TYPEBOT_BASE_URL` is correct
2. Check Typebot builder service is running
3. Verify SSO secret matches in both services
4. Check browser console for CORS errors

### Database Connection Error
**Symptom**: "Database error" on dashboard
**Solution**:
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/db`
2. Run `npx prisma migrate deploy` to apply migrations
3. Check database service is running: `psql -U user -h host -c "SELECT 1"`

---

## Production Deployment Checklist

Before deploying to production:

- [ ] EMAIL: Set `NODE_ENV=production` and configure real SMTP
- [ ] SSO: Ensure `TYPEBOT_SSO_SECRET` / `FLUXOZAP_SSO_SECRET` are set and match
- [ ] AUTH: `AUTH_SECRET` is at least 32 characters and random
- [ ] DATABASE: Using production PostgreSQL, backups configured
- [ ] EVOLUTION: Connected to production Evolution API instance
- [ ] TYPEBOT: Typebot services are in production mode
- [ ] SECURITY: All endpoints are HTTPS in production
- [ ] MONITORING: Error logs configured and monitored
- [ ] HEALTH: Setup health check endpoints for load balancer

---

## Next Steps After Validation

1. **If all tests pass**: Deploy to production using Railway CLI
2. **If tests fail**: Review troubleshooting guide, check logs, retry
3. **Performance testing**: Load test with multiple concurrent users
4. **Security audit**: Run security scanner on deployed app
