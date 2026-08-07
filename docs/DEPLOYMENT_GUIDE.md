# Production Deployment Guide — GreenStreet Finance Platform

**Target Domain**: `https://www.greenstreet.finance` (Canonical Apex: `greenstreet.finance`)  
**Runtime Engine**: Node 22.x / Vite 6.x / Express 4.x / Vitest 4.x  
**Cloud Hosting**: Vercel Serverless / Firebase App Hosting / Cloud Functions  

---

## 1. Environment Variable Configuration

Ensure the following environment variables are supplied in the production environment:

| Variable | Description | Example / Standard Value |
| :--- | :--- | :--- |
| `VITE_DOMAIN` | Canonical domain identity | `greenstreet.finance` |
| `VITE_API_URL` | API server endpoint | `https://www.greenstreet.finance/api` |
| `NODE_ENV` | Operational environment mode | `production` |
| `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK JSON credentials string | `{"type": "service_account", ...}` |

---

## 2. Server Reverse Proxy & Trust Security

The Express backend application in [`src/serverApp.ts`](file:///c:/Users/serge/OneDrive/Documents/DSCR_LOAN%20OFFICE/greenstreet_frontend/src/serverApp.ts) configures:

```ts
// Explicitly set trust proxy for Vercel/Firebase reverse proxies
app.set("trust proxy", 1);
```

### Security Headers Enforced
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 3. Domain & DNS Configuration

1. **Apex Redirect**: Configure 301 Permanent Redirect from `greenstreet.finance` to `https://www.greenstreet.finance`.
2. **Third-Party Domain Rejection**: Strictly reject routing for legacy or unaffiliated domains (`greenstreet.com`).

---

## 4. CI/CD Build & Verification Pipeline

Run the complete verification pipeline before triggering a deployment:

```bash
# 1. Vitest Unit Test Suite (40 test files / 411 tests)
npm test

# 2. TypeScript Type Check (0 errors)
npx tsc --noEmit

# 3. Production Bundle Build
npm run build
```
