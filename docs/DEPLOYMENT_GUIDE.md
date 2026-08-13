# Production Deployment Guide — GreenStreet Finance Platform

**Target Domain**: `https://www.greenstreet.finance` (Canonical Apex: `greenstreet.finance`)  
**Runtime Engine**: Node 22.x / Vite 6.x / Express 4.x / Vitest 4.x  
**Cloud Hosting**: Vercel Serverless (canonical production) / Firebase Hosting + Cloud Functions (alternative)

---

## 1. Environment Variable Configuration

Configure the following values in the production host. Values prefixed with
`VITE_` are compiled into the browser bundle; server credentials must never use
that prefix or be committed to the repository.

| Variable | Description | Example / Standard Value |
| :--- | :--- | :--- |
| `APP_URL` | Canonical server origin | `https://www.greenstreet.finance` |
| `ALLOWED_ORIGINS` | Exact browser origins allowed to call the API | `https://www.greenstreet.finance,https://greenstreet.finance` |
| `VITE_DOMAIN` | Optional build-time canonical client domain | `greenstreet.finance` |
| `VITE_API_URL` | Optional browser API base; leave unset for the same-origin default | `/api` |
| `VITE_FIREBASE_*` | Confirmed Firebase browser configuration for authenticated workspace features | Host-provided project values |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server-only Firebase Admin service-account JSON for a non-Google host such as Vercel | `{"type": "service_account", ...}` |
| `NODE_ENV` | Runtime mode | `production` (managed by Vercel; do not override there) |

Firebase Cloud Functions receives Application Default Credentials from its
managed runtime. A Vercel deployment instead needs
`FIREBASE_SERVICE_ACCOUNT_JSON` supplied as an encrypted server-side secret
before it can persist lead intake or use Firestore-backed rate limits.

---

## 2. Server Reverse Proxy & Trust Security

The Express backend application in [`src/serverApp.ts`](../src/serverApp.ts) configures:

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

Run the CI-equivalent verification pipeline before triggering a deployment:

```bash
# 1. Install the lockfile-resolved dependencies
npm ci

# 2. TypeScript type check
npm run typecheck

# 3. Full Vitest suite (node and DOM projects)
npm test

# 4. Homepage fidelity contract
npm run test:home-fidelity

# 5. Production bundle build
npm run build

# 6. Repository and delivery contracts (run after the build)
npm run test:project-brain
npm run test:delivery
```
