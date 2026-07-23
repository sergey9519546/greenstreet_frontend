# Deployment & Firebase configuration

This repo currently carries **three** deploy paths for the *same* Express app
(`src/serverApp.ts`). Pick **one** as canonical and remove the others to end the
ambiguity. Nothing here changes runtime behavior — it documents what exists and
what you must decide.

## The one app, three wrappers

| Path | Entry | Config | Notes |
|---|---|---|---|
| **Firebase** (hosting + functions) | `src/function.ts` (`api` function) | `firebase.json`, `.firebaserc` | Hosting serves `dist/`; `/api/**` → the `api` function. Most complete. |
| **Vercel** (serverless) | `api/index.ts` (`export default app`) | `vercel.json` | Rewrites `/api/*` and `/health` to the app. |
| **Node / Cloud Run** | `server.ts` (`npm start` → `dist/server.cjs`) | `.gcloudignore` | Standalone Express + static `dist/`. Also the local dev server (`npm run dev`). |

> `server.ts` is **not** removable — it's the `dev` and `start` scripts. The
> Firebase-vs-Vercel choice is the real decision.

## Firebase project — single source of truth

The **client** Firebase config is read from environment variables at build time
(`src/firebase.ts`), not from any committed JSON:

```
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_API_KEY            # public-by-design Firebase web key (not a secret)
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
```

The **deploy** project is `.firebaserc` → `gen-lang-client-0809198072`.

A now-removed file, `firebase-applet-config.json` (Firebase Studio scaffolding,
unused by any code), referenced a **different** project. Its values are recorded
here so nothing is lost — if *this* is your real project, set the `VITE_*` vars
and `.firebaserc` to match it; otherwise ignore:

```
name:                Greenstreet DSCR Loan Engine
projectId:           project-34827ae3-34d1-4d2c-a7d
appId:               1:979007666870:web:5355368ed0e6da29020417
apiKey:              AIzaSyDbhJW82HLr2xxCsaMcWT7NicKW3RkXpYo   (public web key)
authDomain:          project-34827ae3-34d1-4d2c-a7d.firebaseapp.com
firestoreDatabaseId: ai-studio-ec90656a-daaa-4e6c-89d0-5e4a012cc880
storageBucket:       project-34827ae3-34d1-4d2c-a7d.firebasestorage.app
messagingSenderId:   979007666870
```

## Decisions needed (human)

1. **Pick one host** (Firebase, Vercel, or Node/Cloud Run) and delete the other
   wrappers/configs — e.g. if Firebase: remove `vercel.json` + `api/index.ts`;
   if Vercel: remove the `functions` block from `firebase.json` + `src/function.ts`.
2. **Confirm the Firebase project.** `.firebaserc` (`gen-lang-client-0809198072`)
   and the `VITE_FIREBASE_PROJECT_ID` you deploy with must be the **same**
   project, and it must be the one whose Firestore holds `firestore.rules`.
   Reconcile against the `project-34827ae3-…` id above.
3. **Set the runtime env** per `.env.production.example` (`ALLOWED_ORIGINS`,
   `ANTHROPIC_BASE_URL`/`ANTHROPIC_MODEL`, auth flags) — see the backend
   hardening in `src/serverApp.ts` / `src/routes/narrate.ts`.

## Verify before deploy

```
npm ci
npm run lint      # tsc --noEmit (strict)
npm test          # vitest
npm run build     # vite + esbuild bundles
```
