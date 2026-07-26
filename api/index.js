import { createRequire } from "node:module";

// Vercel's Node function builder preserves ESM imports verbatim. Loading the
// explicitly bundled CommonJS app avoids extensionless TypeScript imports at
// runtime while retaining the same Express application used elsewhere.
const require = createRequire(import.meta.url);
const { app } = require("../dist/vercel.cjs");

export default app;
