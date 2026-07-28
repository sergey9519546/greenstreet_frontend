import "dotenv/config"; // load .env for local dev — nothing else loads it (tsx doesn't)
import path from "path";
import dns from "node:dns";
import express from "express";
import { createServer as createViteServer } from "vite";
import { logger } from "./src/logger";
import { app } from "./src/serverApp";

dns.setDefaultResultOrder("ipv4first");

// ── Env validation at startup ────────────────────────────────────────────────
const REQUIRED_ENV: Record<string, string> = {
  ANTHROPIC_AUTH_TOKEN: "AI narration (/api/narrate) will be disabled",
};
for (const [key, impact] of Object.entries(REQUIRED_ENV)) {
  if (!process.env[key] || process.env[key]?.startsWith("MY_")) {
    logger.warn({ key, impact }, `[startup] WARNING: env var not set`);
  }
}

const PORT = Number(process.env.PORT) || 3000;

// ── Vite dev middleware + production static ────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, "Greenstreet DSCR Engine started");
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutdown signal received. Closing server gracefully...");
    server.close(() => {
      logger.info("All connections closed. Exiting.");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced exit after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

startServer().catch((err) => {
  logger.error({ err }, "Fatal: server failed to start");
  process.exit(1);
});

