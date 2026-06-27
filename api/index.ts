// Vercel's Node runtime builds this file as ESM and resolves imports per-file
// (no bundling), so it can't follow the extensionless `../src/*` import graph.
// Point it at a pre-bundled, self-contained CJS build of the Express app
// (`api/_app.cjs`, produced by `npm run build`). The `_` prefix keeps Vercel
// from exposing it as its own route.
// @ts-ignore — generated at build time
import bundled from "./_app.cjs";
export default bundled.app;
