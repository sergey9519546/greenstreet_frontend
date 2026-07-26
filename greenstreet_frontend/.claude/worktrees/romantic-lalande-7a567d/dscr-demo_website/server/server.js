// ============================================================
// Greenstreet Finance — Node.js / Express Backend
// ============================================================
const express = require("express");
const path = require("path");
const {
  trustedLogos,
  testimonials,
  stepCards,
  valueItems,
  useCases,
  faqItems,
  liveData,
} = require("./data/dscr");

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "..", "public");

app.use(express.json());

// CORS for local dev
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------- API Routes ----------
app.get("/api/logos", (req, res) => res.json(trustedLogos));
app.get("/api/testimonials", (req, res) => res.json(testimonials));
app.get("/api/steps", (req, res) => res.json(stepCards));
app.get("/api/value", (req, res) => res.json(valueItems));
app.get("/api/usecases", (req, res) => res.json(useCases));
app.get("/api/faq", (req, res) => res.json(faqItems));
app.get("/api/live", (req, res) => res.json(liveData));
app.get("/api/blog", (req, res) => res.json([
  {
    eyebrow: "Greenstreet Guidance · Underwriting",
    title: "Why Track 1 vs Track 2 DSCR is the difference between qualifying and performing",
    text: "The two-track doctrine is the only way to model both lender approval and investor survival at once. Here's how we built it.",
    color: "mint"
  },
  {
    eyebrow: "Greenstreet Guidance · Lender Network",
    title: "Cake, Kiavi, Lima One, Newfi: how 4 lenders price the same DSCR deal differently",
    text: "Side-by-side pricing analysis on a real Atlanta duplex. The lender matrix isn't just about DSCR floor — it's about 14 other factors.",
    color: "lemon"
  },
  {
    eyebrow: "Greenstreet Guidance · STR",
    title: "AirDNA + a 20% haircut: how to underwrite STR without the lawsuits",
    text: "STR income is volatile and legally gated. Here's the underwriting approach that survives the regulator's call.",
    color: "emerald"
  }
]));

// ---------- DSCR Calculator ----------
// Track 1 = Lender Qualification DSCR (PITIA / ITIA, market rent, no vacancy)
// Track 2 = Investor Survival DSCR (effective rent after vacancy + mgmt fee / ITIA)
function calcDSCR({ rent, pitia, itia, vacancyPct = 8, mgmtFeePct = 8 }) {
  const track1 = rent / (pitia || itia);
  const effectiveRent = rent * (1 - vacancyPct / 100);
  const mgmtFee = effectiveRent * (mgmtFeePct / 100);
  const track2 = (effectiveRent - mgmtFee) / (itia || pitia);
  return {
    track1: Number(track1.toFixed(3)),
    track2: Number(track2.toFixed(3)),
    effectiveRent: Number(effectiveRent.toFixed(2)),
    mgmtFee: Number(mgmtFee.toFixed(2)),
    qualifies: track1 >= 1.0,
    survives: track2 >= 1.0,
    note:
      track1 >= 1.0 && track2 >= 1.0
        ? "QUALIFIES & SURVIVES"
        : track1 >= 1.0
        ? "QUALIFIES but Track 2 fails — reprice or walk"
        : "Does not qualify at current rent",
  };
}

app.post("/api/dscr", (req, res) => {
  const body = req.body || {};
  const { rent, pitia, itia } = body;
  if (!rent || !(pitia || itia)) {
    return res.status(400).json({
      error: "Required: rent, and at least one of pitia or itia",
    });
  }
  const out = calcDSCR({
    rent: Number(rent),
    pitia: pitia ? Number(pitia) : undefined,
    itia: itia ? Number(itia) : undefined,
    vacancyPct: Number(body.vacancyPct ?? 8),
    mgmtFeePct: Number(body.mgmtFeePct ?? 8),
  });
  res.json(out);
});

// ---------- Lead capture ----------
const leads = [];
app.post("/api/leads", (req, res) => {
  const lead = {
    id: "lead_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...req.body,
    receivedAt: new Date().toISOString(),
  };
  leads.push(lead);
  if (leads.length > 500) leads.shift(); // cap memory
  console.log("[lead]", lead.email || "(no email)", lead.source || "(no source)");
  res.status(201).json({ ok: true, id: lead.id });
});

app.get("/api/leads", (req, res) => {
  // admin endpoint — count + last 5
  res.json({ count: leads.length, recent: leads.slice(-5).reverse() });
});

// ---------- Static Frontend ----------
app.use(express.static(DIST, { extensions: ["html"] }));
app.get("/", (req, res) => res.sendFile(path.join(DIST, "index.html")));

// Healthcheck
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "greenstreet-finance-api", time: new Date().toISOString() })
);

// 404 — try to serve a category index for clean URLs, else fall back to SPA
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  // Try /<category>/<slug>.html before SPA fallback
  const cleanPath = req.path.replace(/\/$/, "");
  if (cleanPath && cleanPath !== "/") {
    const tryPath = path.join(DIST, cleanPath + ".html");
    try {
      if (require("fs").existsSync(tryPath)) {
        return res.sendFile(tryPath);
      }
    } catch (e) { /* fall through */ }
  }
  res.status(404).sendFile(path.join(DIST, "index.html")); // SPA-style fallback
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  Greenstreet Finance API`);
    console.log(`  ────────────────────────────`);
    console.log(`  Listening on http://localhost:${PORT}`);
    console.log(`  Frontend: ${DIST}`);
    console.log(`  API endpoints:`);
    console.log(`    GET  /api/logos`);
    console.log(`    GET  /api/testimonials`);
    console.log(`    GET  /api/steps`);
    console.log(`    GET  /api/value`);
    console.log(`    GET  /api/usecases`);
    console.log(`    GET  /api/faq`);
    console.log(`    GET  /api/live`);
    console.log(`    POST /api/dscr`);
    console.log(`    POST /api/leads\n`);
  });
}

module.exports = app;