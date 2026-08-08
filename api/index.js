import { createRequire } from "node:module";

// Vercel's Node function builder preserves ESM imports verbatim. Loading the
// explicitly bundled CommonJS app avoids extensionless TypeScript imports at
// runtime while retaining the same Express application used elsewhere.
//
// The bundle is `api/_app.cjs`, emitted by `npm run build` from src/serverApp.ts.
// It lives beside this entry point (not in dist/) so it ships with the function
// bundle; the leading underscore keeps Vercel from routing to it as its own
// serverless function. Keep this path in sync with the build script — CI's
// "Verify Vercel function entry resolves" step fails the build if it drifts.
const require = createRequire(import.meta.url);
const { app } = require("./_app.cjs");

// An Express application is itself an (req, res) request listener, which is the
// handler shape Vercel's Node runtime invokes for a default export.
export default app;
