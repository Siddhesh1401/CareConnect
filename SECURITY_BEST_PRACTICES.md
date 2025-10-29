# 🔐 CareConnect Security Best Practices

## Environment Variables - CRITICAL RULES

### ✅ DO's
- ✅ Store ALL secrets in `.env` files (database URLs, API keys, passwords, tokens)
- ✅ Use `process.env.VARIABLE_NAME` to access secrets in the code
- ✅ Never hardcode any credentials in source code
- ✅ Use different `.env` files for development and production
- ✅ Commit `.env.example` with placeholder values to show what variables are needed
- ✅ Add `.env` and all `.env.*` files to `.gitignore`
- ✅ Validate that required environment variables exist on app startup
- ✅ Document which environment variables are required (see `.env.example`)

### ❌ DON'Ts
- ❌ Never commit `.env` files to version control
- ❌ Never hardcode credentials like email/password in source code
- ❌ Never use hardcoded fallback values like `process.env.EMAIL_USER || 'actual-email@gmail.com'`
- ❌ Never share `.env` files via email, Slack, or public channels
- ❌ Never commit API keys, passwords, or tokens to GitHub
- ❌ Never use the same credentials across multiple environments
- ❌ Never expose `.env` files in production builds

---

## Current Implementation

### Backend (.env Configuration)
All backend secrets are stored in `backend/.env`:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
```

### Frontend (.env Configuration)
Frontend configuration is stored in `.env`:
```bash
VITE_GOVERNMENT_EMAIL=your-email@gmail.com
VITE_API_URL=http://localhost:5000
```

Note: Frontend `.env` variables are **embedded in build output** (visible in browser). Only use for non-sensitive configuration like email addresses for contact forms.

---

## Accessing Environment Variables

### Backend (Node.js)
```typescript
// ✅ CORRECT
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

// ❌ WRONG - Don't use hardcoded fallbacks for secrets!
const emailUser = process.env.EMAIL_USER || 'actual-email@gmail.com';

// ✅ OK - Only for non-critical config
const port = parseInt(process.env.PORT || '5000');
```

### Frontend (Vite)
```typescript
// ✅ CORRECT - Variables must start with VITE_
const govEmail = import.meta.env.VITE_GOVERNMENT_EMAIL;

// ❌ WRONG - Won't work, not prefixed with VITE_
const apiKey = import.meta.env.API_KEY;
```

---

## Validation on Startup

The backend validates required environment variables on startup:

```typescript
// server.ts - Validates these required variables exist:
- MONGODB_URI
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASSWORD
```

If any required variable is missing, the app will **fail to start** with a clear error message.

---

## New Environment Variables - Setup Guide

### Step 1: Add to .env.example
Document the variable with a placeholder:
```bash
# .env.example
NEW_SECRET_KEY=your-new-secret-value
```

### Step 2: Add to .env
Set the actual value:
```bash
# backend/.env
NEW_SECRET_KEY=actual-secret-value-here
```

### Step 3: Use in Code
Access via environment variable only:
```typescript
const secretValue = process.env.NEW_SECRET_KEY;
if (!secretValue) {
  throw new Error('NEW_SECRET_KEY is required');
}
```

### Step 4: Add to Validation (if critical)
If it's a critical secret, add to `server.ts`:
```typescript
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'NEW_SECRET_KEY'  // ← Add here
];
```

---

## Rotation/Changing Credentials

When changing credentials (like email passwords):

1. **Update `.env` file only**
   ```bash
   # backend/.env
   EMAIL_PASSWORD=new-app-password-here
   ```

2. **Do NOT update source code** - it should already use `process.env.EMAIL_PASSWORD`

3. **Restart the application** to load new credentials

4. **Never commit .env** - it's already in `.gitignore`

---

## Security Audit Checklist

Before committing code:

- [ ] No hardcoded email addresses in source code
- [ ] No hardcoded passwords in source code  
- [ ] No hardcoded API keys in source code
- [ ] All secrets accessed via `process.env.*` (backend)
- [ ] All secrets accessed via `import.meta.env.VITE_*` (frontend)
- [ ] New variables documented in `.env.example`
- [ ] Critical variables added to startup validation
- [ ] `.env*` files are in `.gitignore`
- [ ] No commits contain sensitive data

---

## If You Accidentally Commit Credentials

1. **Immediately rotate the credentials** (change password, generate new API key)
2. **Never try to "uncommit"** - Git history is permanent
3. **Assume the credentials are compromised** and replace them
4. **Use `git filter-branch` or `BFG Repo-Cleaner`** to remove from history (complex)
5. **Inform team members** that credentials have been changed

---

## Files Affected by This Security Fix

| File | Change |
|------|--------|
| `backend/src/controllers/authController.ts` | Removed hardcoded credentials, now uses `process.env` only |
| `backend/src/controllers/adminController.ts` | Removed hardcoded credentials, now uses `process.env` only |
| `backend/src/controllers/documentController.ts` | Removed hardcoded credentials, now uses `process.env` only |
| `src/pages/GovernmentAccessPage.tsx` | Uses `VITE_GOVERNMENT_EMAIL` from `.env` |
| `backend/src/server.ts` | Added validation for required env variables |
| `.env` | Frontend configuration (created) |
| `.env.example` | Frontend configuration template (created) |
| `.gitignore` | Enhanced comments about security |
| `backend/.env.example` | Already exists with good practices |

---

## Additional Resources

- [OWASP: Secure Coding Best Practices](https://owasp.org/www-community/attacks/Sensitive_Data_Exposure)
- [12 Factor App: Config](https://12factor.net/config)
- [Node.js Best Practices: Environment Variables](https://nodejs.org/en/knowledge/file-system/security/introduction/)

