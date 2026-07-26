# Deployment

## Canonical production path

Production is deployed through the Vercel project **`greenstreet-frontend`**.
The canonical public host is **`https://www.greenstreet.finance`**; the apex
domain redirects to it. Git integration builds preview deployments for branches
and promotes `main` to production.

The Vercel function entry point is `api/index.js`. It loads the explicitly
bundled Express application in `dist/vercel.cjs`, so the serverless runtime does
not depend on extensionless TypeScript imports. `vercel.json` routes `/api` and
`/api/*` to that function, `/health` to the health handler, and all remaining
paths to the SPA entry point.

## Production runtime configuration

These non-secret production settings are configured in Vercel:

```text
ALLOWED_ORIGINS=https://www.greenstreet.finance,https://greenstreet.finance
APP_URL=https://www.greenstreet.finance
WORKER_POOL_SIZE=0
```

Do not set `PORT`, `NODE_ENV`, or `VERCEL`; Vercel owns those values. `WORKER_POOL_SIZE=0`
keeps the deterministic engine in-process inside a serverless function rather
than starting nested worker threads.

## Owner-confirmed settings required before accepting borrower leads

The browser lead form needs one confirmed Firebase project, with all of these
build-time variables set in Vercel:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

The historical Firebase configuration files and the legacy local environment
describe different project identities. Do not copy either into production until
the owner confirms which project owns the Firestore `leads` collection and its
rules have been deployed. Until then, the app truthfully reports that a lead was
not sent rather than storing financial/contact information in the visitor's
browser.

AI narration additionally requires an owner-provided `ANTHROPIC_AUTH_TOKEN`.
Do not enable `REQUIRE_AUTH` globally until the SPA sends Firebase ID tokens;
doing so would disable the public calculator endpoints.

## Other host wrappers

`server.ts` remains the local development and standalone Node entry point.
Firebase configuration is retained as a historical/alternative deployment path,
not as the production host. Do not remove either wrapper until the owner confirms
it is no longer needed.

## Release verification

```bash
npm ci
npm run lint
npm test
npm run build
npx vercel build --yes
```

Before promoting a release, verify a production-equivalent `/health`, a sample
`POST /api/dscr/solve`, and a direct SPA route such as `/products/platform`.
