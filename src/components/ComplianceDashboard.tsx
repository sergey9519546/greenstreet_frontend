import React, { useState, useEffect, useCallback } from "react";
import { auth, db, loginWithGoogle, logoutUser, loginAnonymously } from "../firebase";
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Shield, CheckCircle, Search, MapPin, Sparkles, History,
  Trash2, LogOut, ArrowLeft, RefreshCw, AlertTriangle,
  Calculator, TrendingUp, BarChart2, Settings2, Zap, ChevronDown, Menu, X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { DSCRResult, BreakevenResult, StructureOption, PPPCheckResult, PITIABreakdown, DualTrackDSCR } from "../engine/types";
import type { AuditLog } from "../engine/types";
import { swatch, radius } from "../theme";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor as artifactDscrColor } from "../design/artifacts";
import STRUnderwritingPage from "../pages/STRUnderwritingPage";
import PortfolioPage from "../pages/PortfolioPage";
import { SiteNav } from "../design/SiteShell";
import { DcEmbeddedContext } from "../design/dc";

// Tabs that embed a full tool page (each wraps itself in DcShell). Inside the
// workspace these must render bare — no duplicate marketing nav/footer.
const EMBEDDED_TOOL_TABS = new Set([
  "str", "portfolio",
]);

// ─── Design tokens (inline, flat — no shadow, no blur) ──────────────────────
const T = {
  // Surfaces — DARK workspace ("all green"): midnight page, darker-teal cards.
  pageBg: swatch.midnight,                  // #003738 dark page
  cardBg: "#064a4c",                         // panel clearly lifted off the midnight page
  cardBorder: "rgba(238,239,211,0.18)",      // readable border on dark
  inputBg: "rgba(238,239,211,0.06)",
  inputBorder: "rgba(238,239,211,0.2)",
  inputFocusBorder: swatch.lemon,            // lemon focus — accent pop
  // Typography — cream on dark
  ink: swatch.pistachio,
  muted: "rgba(238,239,211,0.72)",
  faint: "rgba(238,239,211,0.62)",
  // Sidebar — a touch darker than the page so it reads as a panel
  sidebarBg: "#00292a",
  sidebarText: swatch.pistachio,
  sidebarActive: "rgba(216,217,88,0.16)",    // lemon-tinted active
  // Danger / warn — dark-friendly tints
  dangerBg: "rgba(255,107,107,0.12)",
  dangerBorder: "rgba(255,107,107,0.32)",
  dangerText: "#ff8f8f",
  warnBg: "rgba(216,217,88,0.12)",
  warnBorder: "rgba(216,217,88,0.34)",
  warnText: "#e6e76b",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// dscrColor for Tailwind class usage (local — uses class names, not hex)
function dscrColorClass(dscr: number): string {
  if (dscr >= 1.25) return "text-emerald";
  if (dscr >= 1.10) return "text-rain-forest";
  if (dscr >= 1.00) return "text-lemon-lime";
  if (dscr >= 0.75) return "text-orange-500";
  return "text-red-600";
}
function dscrBgClass(dscr: number): string {
  if (dscr >= 1.25) return "bg-emerald/10 border-emerald/20";
  if (dscr >= 1.10) return "bg-rain-forest/10 border-rain-forest/20";
  if (dscr >= 1.00) return "bg-lemon-lime/10 border-lemon-lime/20";
  if (dscr >= 0.75) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}
function dscrLabel(dscr: number): string {
  if (dscr >= 1.25) return "STRONG";
  if (dscr >= 1.10) return "COMFORTABLE";
  if (dscr >= 1.00) return "MARGINAL";
  if (dscr >= 0.75) return "FRAGILE";
  return "DEAL BREAK";
}
function pppBadgeStyle(status: string): React.CSSProperties {
  if (status === "ALLOWED") return { color: swatch.emerald, background: `${swatch.emerald}16`, border: `1px solid ${swatch.rainforest}30` };
  if (status === "PROHIBITED") return { color: T.dangerText, background: T.dangerBg, border: `1px solid ${T.dangerBorder}` };
  if (status === "CONDITIONAL") return { color: swatch.midnight, background: `${swatch.lemon}40`, border: `1px solid ${swatch.lemon}80` };
  return { color: T.ink, background: T.cardBg, border: `1px solid ${T.cardBorder}` };
}
const fmt$ = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtPct = (n: number) => `${n.toFixed(3)}%`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface SolveResult { deal: DSCRResult; topLenders: { name: string; score: number; tier: string; rank: number | null; topReasons: string[] }[] }
interface SensResult { sensitivity: BreakevenResult }
interface OptResult { options: StructureOption[] }
interface StateResult { state: string; ppp: PPPCheckResult }

interface DealForm {
  purchasePrice: string; loanAmount: string; monthlyRent: string;
  state: string; propertyType: string; loanPurpose: string;
  ficoScore: string; strategy: string; hoa: string;
}

type DashboardTab = "dashboard" | "analyze" | "sensitivity" | "optimize" | "state" | "history" | "settings"
  | "str" | "portfolio";
interface ComplianceDashboardProps { onBackToMarketing: () => void; initialEmail?: string; initialTab?: DashboardTab }

const PORTAL_PATHS: Record<string, string> = {
  marketing: "/",
  portal: "/investgo",
  products: "/products",
  solutions: "/solutions",
  "brokers-partner": "/partnerships",
  blog: "/blog",
  "rate-quiz": "/rate-quiz",
};

const TAB_LABELS: Partial<Record<DashboardTab, string>> = {
  analyze: "Deal Workspace",
  sensitivity: "Sensitivity Lab",
  optimize: "Structure Optimizer",
  state: "State Rules",
  history: "Scenario History",
  settings: "Workspace Settings",
};

// ─── Reusable primitives ─────────────────────────────────────────────────────

/** Flat card — mint surface, 1px faded border, no shadow */
function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className}
      style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: radius.md, boxShadow: "0 12px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(238,239,211,0.06)", ...style }}>
      {children}
    </div>
  );
}

/** White surface card (for input panels that sit on mint) */
function WhiteCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className}
      style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: radius.md, boxShadow: "0 12px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(238,239,211,0.06)", ...style }}>
      {children}
    </div>
  );
}

/** Primary action button — midnight bg, pistachio text */
function PrimaryBtn({ children, onClick, disabled, type = "button", className = "" }:
  { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; className?: string }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold text-sm transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className}`}
      style={{ background: swatch.lemon, color: swatch.midnight, padding: "12px 22px", borderRadius: radius.sm, border: "none" }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "#e3e36a"; }}
      onMouseLeave={e => { e.currentTarget.style.background = swatch.lemon; }}>
      {children}
    </button>
  );
}

/** Secondary / ghost button */
function GhostBtn({ children, onClick, className = "" }:
  { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors ${className}`}
      style={{ color: swatch.pistachio, background: "transparent", padding: "9px 16px", borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.5)" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(238,239,211,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      {children}
    </button>
  );
}

/** Flat label input */
function FieldInput({ label, helper, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: T.muted }}>{label}</label>
      <input {...props}
        className="w-full px-3 py-2.5 text-sm font-mono outline-none transition-colors"
        style={{
          background: T.inputBg,
          border: `1px solid ${T.inputBorder}`,
          borderRadius: radius.sm,
          color: T.ink,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; e.currentTarget.style.background = "rgba(238,239,211,0.1)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg; }}
      />
      {helper && <p className="text-[10px]" style={{ color: T.faint }}>{helper}</p>}
    </div>
  );
}

/** Flat label select */
function FieldSelect({ label, helper, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; helper?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: T.muted }}>{label}</label>
      <select {...props}
        className="w-full px-3 py-2.5 text-sm outline-none transition-colors appearance-none"
        style={{
          background: T.inputBg,
          border: `1px solid ${T.inputBorder}`,
          borderRadius: radius.sm,
          color: T.ink,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; }}>
        {children}
      </select>
      {helper && <p className="text-[10px]" style={{ color: T.faint }}>{helper}</p>}
    </div>
  );
}

/** Loading skeleton bar */
function Skeleton({ h = 16, w = "100%", rounded = radius.sm }: { h?: number; w?: string | number; rounded?: string }) {
  return <div style={{ height: h, width: w, borderRadius: rounded, background: `${swatch.midnight}10` }} className="animate-pulse" />;
}

/** API error banner with retry */
function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 p-4" style={{ background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: radius.md, color: T.dangerText }}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Something went wrong</p>
        <p className="text-xs mt-0.5 opacity-80">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 text-xs font-bold underline" style={{ color: T.dangerText }}>Retry</button>
      )}
    </div>
  );
}

/** Tab-change motion wrapper — interaction only, no page-load from() */
function TabPane({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div key={id}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-5">
      {EMBEDDED_TOOL_TABS.has(id) ? (
        <DcEmbeddedContext.Provider value={true}>{children}</DcEmbeddedContext.Provider>
      ) : (
        children
      )}
    </motion.div>
  );
}

/** Returns true while viewport width >= minPx — re-evaluates on resize */
function useMinWidth(minPx: number): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= minPx : true
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minPx}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [minPx]);
  return matches;
}

// ─── Disclaimer footer (compliance) ─────────────────────────────────────────
function Disclaimer() {
  return (
    <p className="text-[10px] leading-relaxed" style={{ color: T.faint, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10 }}>
      Preliminary estimate — not a commitment to lend. Rates and terms subject to change. Submit a scenario review for exact underwriting.
    </p>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ComplianceDashboard({ onBackToMarketing, initialEmail, initialTab }: ComplianceDashboardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const userUid = currentUser?.uid ?? "demo-user";
  const userEmail = currentUser?.email ?? "demo@greenstreet.dev";
  const [authEmail, setAuthEmail] = useState(initialEmail || "");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Breakpoint hooks — must be at top level, before any early returns
  const isWide = useMinWidth(992);
  const isMd   = useMinWidth(768);

  const [brokerConfig, setBrokerConfig] = useState({ brokerName: "", nmls: "", licenseType: "", primaryMarket: "", autoDisclaimer: "Rates and terms subject to change. Not a commitment to lend." });
  const [brokerSaved, setBrokerSaved] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [dealForm, setDealForm] = useState<DealForm>({
    purchasePrice: "450000", loanAmount: "337500", monthlyRent: "3200",
    state: "FL", propertyType: "SFR", loanPurpose: "PURCHASE",
    ficoScore: "740", strategy: "LTR", hoa: "0",
  });

  const [isRunning, setIsRunning] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);
  const [sensError, setSensError] = useState<string | null>(null);
  const [optError, setOptError] = useState<string | null>(null);
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);
  const [sensResult, setSensResult] = useState<SensResult | null>(null);
  const [optResult, setOptResult] = useState<OptResult | null>(null);
  const [stateInput, setStateInput] = useState("FL");
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [stateResult, setStateResult] = useState<StateResult | null>(null);
  const requestedTool = initialTab ? TAB_LABELS[initialTab] : undefined;

  const handleSiteNavigate = (view: string) => {
    if (view === "marketing") { onBackToMarketing(); return; }
    const path = PORTAL_PATHS[view] || "/";
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => { document.title = "InvestGO | Greenstreet Finance"; }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { setCurrentUser(user); setAuthLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser && !demoMode) return;
    const ref = collection(db, "artifacts", "default-app-id", "users", userUid, "audits");
    const unsub = onSnapshot(ref, (snap) => {
      const logs: AuditLog[] = [];
      snap.forEach(d => logs.push({ id: d.id, ...d.data() } as AuditLog));
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAuditLogs(logs);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser && !demoMode) return;
    const ref = doc(db, "artifacts", "default-app-id", "users", userUid, "broker", "settings");
    getDoc(ref).then(snap => { if (snap.exists()) setBrokerConfig(snap.data() as any); });
  }, [currentUser]);

  const saveBrokerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser && !demoMode) return;
    const ref = doc(db, "artifacts", "default-app-id", "users", userUid, "broker", "settings");
    await setDoc(ref, brokerConfig);
    setBrokerSaved(true);
    setTimeout(() => setBrokerSaved(false), 3000);
  };

  const deleteLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ((!currentUser && !demoMode) || !id) return;
    await deleteDoc(doc(db, "artifacts", "default-app-id", "users", userUid, "audits", id));
    if (selectedLog?.id === id) setSelectedLog(null);
  };

  const saveLog = async (type: AuditLog["type"], title: string, input: string, output: any) => {
    if (!currentUser && !demoMode) return;
    const ref = collection(db, "artifacts", "default-app-id", "users", userUid, "audits");
    await addDoc(ref, { userId: userUid, userEmail, type, title, timestamp: new Date().toISOString(), input, output });
  };

  const buildPayload = () => ({
    purchasePrice: parseFloat(dealForm.purchasePrice),
    loanAmount: parseFloat(dealForm.loanAmount),
    monthlyRent: parseFloat(dealForm.monthlyRent),
    state: dealForm.state,
    propertyType: dealForm.propertyType,
    loanPurpose: dealForm.loanPurpose,
    ficoScore: parseInt(dealForm.ficoScore),
    strategy: dealForm.strategy,
    hoa: parseFloat(dealForm.hoa) || 0,
  });

  const handleAnalyze = useCallback(async () => {
    const payload = buildPayload();
    setIsRunning(true);
    setSolveResult(null); setSensResult(null); setOptResult(null);
    setSolveError(null); setSensError(null); setOptError(null);
    try {
      const [solveRes, sensRes, optRes] = await Promise.all([
        fetch("/api/dscr/solve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        fetch("/api/dscr/sensitivity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        fetch("/api/dscr/optimize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      ]);
      const [solve, sens, opt] = await Promise.all([solveRes.json(), sensRes.json(), optRes.json()]);
      if (!solveRes.ok) throw new Error(solve.error || "Solve failed");
      setSolveResult(solve);
      if (sensRes.ok) { setSensResult(sens); } else { setSensError(sens.error || "Sensitivity engine failed. Re-run from Deal Workspace."); }
      if (optRes.ok) { setOptResult(opt); } else { setOptError(opt.error || "Optimizer engine failed. Re-run from Deal Workspace."); }
      await saveLog("analyze",
        `DSCR ${solve.deal.dscr.toFixed(2)}x — ${dealForm.propertyType} ${dealForm.state} ${dscrLabel(solve.deal.dscr)}`,
        JSON.stringify(payload), solve);
    } catch (err: any) {
      setSolveError(err.message || "Engine error. Check your inputs and try again.");
    } finally {
      setIsRunning(false);
    }
  }, [dealForm]);

  const handleStateRules = useCallback(async () => {
    if (!stateInput.trim()) return;
    setIsLoadingState(true); setStateResult(null); setStateError(null);
    try {
      const res = await fetch("/api/dscr/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: stateInput }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStateResult(data);
      await saveLog("state-rules", `State PPP: ${stateInput.toUpperCase()}`, stateInput, data);
    } catch (err: any) {
      setStateError(err.message || "State lookup failed. Try again.");
    } finally {
      setIsLoadingState(false);
    }
  }, [stateInput]);

  const ltv = dealForm.purchasePrice && dealForm.loanAmount
    ? ((parseFloat(dealForm.loanAmount) / parseFloat(dealForm.purchasePrice)) * 100).toFixed(1)
    : "—";

  // Form validation — required fields must be non-zero numbers
  const dealFormValid =
    parseFloat(dealForm.purchasePrice) > 0 &&
    parseFloat(dealForm.loanAmount) > 0 &&
    parseFloat(dealForm.monthlyRent) > 0 &&
    parseInt(dealForm.ficoScore) >= 300 &&
    dealForm.state.trim().length === 2;

  const switchTab = (tab: DashboardTab) => { setActiveTab(tab); setSelectedLog(null); setSidebarOpen(false); };

  // ── Auth loading ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <SiteNav onNavigate={handleSiteNavigate} />
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: swatch.midnight }}>
          <RefreshCw className="w-8 h-8 animate-spin mb-4" style={{ color: swatch.emerald }} />
          <p className="text-sm font-semibold tracking-wider font-mono" style={{ color: swatch.pistachio }}>LOADING ENGINE…</p>
          {requestedTool && (
            <p className="text-xs font-medium mt-2" style={{ color: `${swatch.pistachio}70` }}>Preparing {requestedTool}</p>
          )}
        </div>
      </>
    );
  }

  // ── Auth screen ────────────────────────────────────────────────────────────
  if (!currentUser && !demoMode) {
    return (
      <>
        <SiteNav onNavigate={handleSiteNavigate} />
        <div className="flex items-center justify-center p-4" style={{ minHeight: "calc(100vh - 74px)", background: T.pageBg }}>
          <div className="max-w-md w-full p-8" style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: radius.lg }}>
            <button onClick={onBackToMarketing} className="flex items-center gap-1.5 text-xs font-bold mb-6 transition"
              style={{ color: T.muted }}
              onMouseEnter={e => e.currentTarget.style.color = swatch.lemon}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}>
              <ArrowLeft className="w-3.5 h-3.5" /><span>Back to site</span>
            </button>
            <div className="text-center mb-8">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 font-extrabold text-2xl"
                style={{ background: "rgba(216,217,88,0.14)", color: swatch.lemon, borderRadius: radius.md, border: "1px solid rgba(216,217,88,0.32)" }}>G</div>
              <h1 className="font-bold tracking-tight text-2xl" style={{ color: T.ink, letterSpacing: "-0.03em" }}>
                INVEST<span style={{ opacity: 0.45 }}>GO</span>
              </h1>
              <p className="text-xs mt-1.5" style={{ color: T.muted }}>
                {requestedTool
                  ? `${requestedTool} is part of the InvestGO workspace. Sign in or try demo mode.`
                  : "Every DSCR engine and calculation in one place. Sign in to start pricing deals."}
              </p>
            </div>
            {authError && (
              <div className="mb-4 p-3 flex items-start gap-2 text-xs" style={{ background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: radius.sm, color: T.dangerText }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{authError}</span>
              </div>
            )}
            <button onClick={() => setDemoMode(true)}
              className="w-full py-2.5 text-xs font-semibold transition mb-3"
              style={{ border: `1px dashed ${T.cardBorder}`, borderRadius: radius.sm, background: T.inputBg, color: T.muted }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(216,217,88,0.5)"; e.currentTarget.style.color = swatch.lemon; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.cardBorder; e.currentTarget.style.color = T.muted; }}>
              Try demo mode — no account needed
            </button>
            <button onClick={async () => { try { setAuthError(""); await loginWithGoogle(); } catch (e: any) { setAuthError(e.message); } }}
              className="w-full py-3 flex items-center justify-center gap-3 text-sm font-semibold transition"
              style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: radius.sm, background: "#ffffff", color: "#1f2430" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f2ee"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; }}>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
            <div className="relative my-5 text-center text-xs" style={{ color: T.faint }}>
              <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: T.cardBorder }} />
              <span className="relative px-3 font-semibold uppercase tracking-wider" style={{ background: T.cardBg }}>or email</span>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); setAuthError(""); try { isSignUpMode ? await createUserWithEmailAndPassword(auth, authEmail, authPassword) : await signInWithEmailAndPassword(auth, authEmail, authPassword); } catch (err: any) { setAuthError(err.message); } }}
              className="space-y-3">
              <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 text-sm outline-none transition-colors"
                style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: radius.sm, color: T.ink }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; }} />
              <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 text-sm outline-none transition-colors font-mono"
                style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: radius.sm, color: T.ink }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; }} />
              <PrimaryBtn type="submit" className="w-full mt-2">{isSignUpMode ? "Create Account" : "Access Engine"}</PrimaryBtn>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-xs font-semibold transition"
                style={{ color: T.muted }}
                onMouseEnter={e => e.currentTarget.style.color = swatch.lemon}
                onMouseLeave={e => e.currentTarget.style.color = T.muted}>
                {isSignUpMode ? "Already registered? Sign in" : "New here? Create account"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Portal ─────────────────────────────────────────────────────────────────
  const deal = solveResult?.deal;

  // ── Sidebar nav data ─────────────────────────────────────────────────────
  const navWorkspace = [
    { key: "dashboard",   icon: <BarChart2 className="w-4 h-4" />,   label: "Pipeline" },
    { key: "analyze",     icon: <Calculator className="w-4 h-4" />,   label: "DSCR Analyzer" },
    { key: "sensitivity", icon: <TrendingUp className="w-4 h-4" />,   label: "Sensitivity" },
    { key: "optimize",    icon: <Zap className="w-4 h-4" />,          label: "Optimizer" },
    { key: "history",     icon: <History className="w-4 h-4" />,      label: "History", count: auditLogs.length },
  ] as const;

  const navTools = [
    { key: "state",      icon: <MapPin className="w-4 h-4" />,     label: "State Rules" },
    { key: "str",        icon: <Settings2 className="w-4 h-4" />,  label: "STR Underwriting" },
    { key: "portfolio",  icon: <Shield className="w-4 h-4" />,     label: "Portfolio" },
    { key: "settings",   icon: <Settings2 className="w-4 h-4" />,  label: "Workspace Settings" },
  ] as const;

  const viewTitle: Record<DashboardTab, string> = {
    dashboard: "Pipeline",
    analyze: "Deal Workspace",
    sensitivity: "Sensitivity Lab",
    optimize: "Structure Optimizer",
    state: "State Rules",
    str: "STR Underwriting",
    portfolio: "Portfolio Analyzer",
    history: "Scenario History",
    settings: "Workspace Settings",
  };

  // Pipeline demo data
  const demoPipeline = [
    { prop: "1421 Oak St, Austin TX",    type: "SFR",    amt: 318750, dscr: 1.34, stage: "Submitted" },
    { prop: "88 Bayshore, Tampa FL",     type: "Duplex", amt: 364000, dscr: 1.51, stage: "Priced" },
    { prop: "7 Desert Vw, Phoenix AZ",   type: "SFR",    amt: 304200, dscr: 0.98, stage: "Review" },
    { prop: "200 Beale, Memphis TN",     type: "4-plex", amt: 435000, dscr: 1.62, stage: "Submitted" },
    { prop: "45 Harbor, Newark NJ",      type: "SFR",    amt: 280000, dscr: 1.12, stage: "Priced" },
    { prop: "19 Pine, Columbus OH",      type: "Duplex", amt: 255000, dscr: 1.28, stage: "Review" },
  ];

  const brokerInitials = brokerConfig.brokerName
    ? brokerConfig.brokerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : userEmail.charAt(0).toUpperCase();
  const brokerDisplayName = brokerConfig.brokerName || userEmail;
  const brokerMarket = brokerConfig.primaryMarket || "Your Market";

  // Sidebar shared render
  function SidebarContent() {
    const NavBtn = ({ navKey, icon, label, count }: { navKey: string; icon: React.ReactNode; label: string; count?: number }) => {
      const active = activeTab === navKey;
      return (
        <button onClick={() => switchTab(navKey as DashboardTab)}
          className="w-full flex items-center gap-2.5 text-left text-sm transition"
          style={{
            position: "relative",
            padding: "10px 12px",
            borderRadius: 9,
            fontWeight: active ? 700 : 500,
            color: active ? swatch.pistachio : "rgba(238,239,211,0.78)",
            background: active ? "rgba(216,217,88,0.1)" : "transparent",
          }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(238,239,211,0.06)"; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
          {active && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 99, background: swatch.lemon }} />}
          <span style={{ color: active ? swatch.lemon : "rgba(238,239,211,0.62)", display: "flex", alignItems: "center" }}>{icon}</span>
          <span className="flex-1">{label}</span>
          {count !== undefined && count > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 font-bold"
              style={{ background: active ? "rgba(216,217,88,0.22)" : "rgba(238,239,211,0.1)", color: active ? swatch.lemon : "rgba(238,239,211,0.7)", borderRadius: radius.pill }}>
              {count}
            </span>
          )}
        </button>
      );
    };
    const SectionLabel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
      <div className={`text-[10px] font-bold uppercase tracking-[0.1em] px-3 mb-2 ${className}`} style={{ color: "rgba(238,239,211,0.5)" }}>{children}</div>
    );
    return (
      <>
        {/* Brand lockup */}
        <button onClick={() => { onBackToMarketing(); setSidebarOpen(false); }}
          className="flex items-center gap-2.5 mb-5 px-1 transition"
          style={{ width: "100%" }}
          title="Back to greenstreetfinance.com"
          onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "#00201f", display: "grid", placeItems: "center", border: "1px solid rgba(238,239,211,0.12)", flexShrink: 0 }}>
            <span style={{ color: swatch.lemon, fontWeight: 900, fontSize: 17, letterSpacing: "-0.04em" }}>G</span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.05 }}>
            <span style={{ color: swatch.pistachio, fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em" }}>Greenstreet</span>
            <span style={{ color: "rgba(238,239,211,0.42)", fontWeight: 800, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>InvestGO Workspace</span>
          </span>
        </button>

        {/* Primary action */}
        <button onClick={() => switchTab("analyze")}
          className="w-full flex items-center justify-center gap-2 font-bold text-sm transition mb-5"
          style={{ background: swatch.lemon, color: swatch.midnight, padding: "11px 14px", borderRadius: 9 }}
          onMouseEnter={e => e.currentTarget.style.background = "#e3e36a"}
          onMouseLeave={e => e.currentTarget.style.background = swatch.lemon}>
          + New deal
        </button>

        <SectionLabel>Workspace</SectionLabel>
        <nav className="space-y-0.5 mb-2">
          {navWorkspace.map(({ key, icon, label, count }: any) => (
            <NavBtn key={key} navKey={key} icon={icon} label={label} count={count} />
          ))}
        </nav>

        <SectionLabel className="mt-5">Tools</SectionLabel>
        <nav className="space-y-0.5">
          {navTools.map(({ key, icon, label }) => (
            <NavBtn key={key} navKey={key} icon={icon} label={label} />
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 px-2 pt-4"
          style={{ borderTop: "1px solid rgba(238,239,211,0.16)" }}>
          <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{ background: swatch.emerald, color: swatch.midnight, borderRadius: "50%", boxShadow: "0 0 0 2px rgba(216,217,88,0.25)" }}>
            {brokerInitials}
          </span>
          <div className="overflow-hidden">
            <div className="text-[13px] font-semibold truncate" style={{ color: swatch.pistachio }}>{brokerDisplayName}</div>
            <div className="text-[11px] truncate" style={{ color: "rgba(238,239,211,0.62)" }}>{brokerMarket}</div>
          </div>
          <button onClick={logoutUser} className="ml-auto p-1.5 transition shrink-0"
            style={{ color: "rgba(238,239,211,0.62)", borderRadius: radius.sm }}
            title="Sign Out"
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(238,239,211,0.1)"; e.currentTarget.style.color = swatch.pistachio; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(238,239,211,0.62)"; }}>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* No marketing SiteNav here — the workspace has its own sidebar + top-bar.
          (Loading/gate states above still show SiteNav.) */}
      <div className="min-h-screen antialiased font-sans flex flex-col" style={{ background: T.pageBg }}>

        {/* Mobile top-bar */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden"
          style={{ background: swatch.midnight, borderBottom: `1px solid ${swatch.pistachio}18` }}>
          <span className="font-bold text-base" style={{ color: swatch.pistachio, letterSpacing: "-0.04em" }}>Greenstreet</span>
          <button onClick={() => setSidebarOpen(v => !v)} style={{ color: swatch.pistachio }}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar-drawer"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex md:hidden"
              onClick={() => setSidebarOpen(false)}>
              <div className="w-64 h-full flex flex-col p-5 overflow-y-auto"
                onClick={e => e.stopPropagation()}
                style={{ background: swatch.midnight }}>
                <SidebarContent />
              </div>
              <div className="flex-1" style={{ background: `${swatch.midnight}60` }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col w-[256px] shrink-0 p-5 overflow-y-auto sticky top-0"
            style={{ background: "#00292a", borderRight: "1px solid rgba(238,239,211,0.16)", height: "100vh" }}>
            <SidebarContent />
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

            {/* Sticky header */}
            <header className="sticky top-0 z-10 flex items-center justify-between"
              style={{
                background: T.pageBg,
                borderBottom: `1px solid ${T.cardBorder}`,
                padding: "18px clamp(16px, 3vw, 36px)",
              }}>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: swatch.lemon }}>Workspace</div>
                <div className="font-bold mt-0.5" style={{ fontSize: "clamp(18px, 2vw, 24px)", letterSpacing: "-0.03em", color: T.ink }}>
                  {viewTitle[activeTab] ?? "Dashboard"}
                </div>
              </div>
              <PrimaryBtn onClick={() => switchTab("analyze")}>
                + New deal
              </PrimaryBtn>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 md:p-7">
              <div className="w-full mx-auto" style={{ maxWidth: 1320 }}>
                <AnimatePresence mode="wait">

                  {/* ── DASHBOARD ── */}
                  {activeTab === "dashboard" && (
                    <TabPane id="dashboard">
                      {/* KPI row */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {([
                          { label: "Active deals",    value: "6",     delta: "+2 this week",       deltaColor: swatch.emerald },
                          { label: "Avg DSCR",        value: "1.31x", delta: "Healthy book",        deltaColor: swatch.emerald },
                          { label: "Pipeline vol.",   value: "$2.0M", delta: "+$0.4M MTD",           deltaColor: swatch.emerald },
                          { label: "Flagged states",  value: "2",     delta: "NJ · OH need review", deltaColor: "#e6e76b" },
                        ] as const).map(({ label, value, delta, deltaColor }) => (
                          <WhiteCard key={label} style={{ padding: "20px 20px 16px" }}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] mb-2" style={{ color: T.faint }}>{label}</div>
                            <div className="font-bold font-mono" style={{ fontSize: "clamp(24px, 2.4vw, 32px)", letterSpacing: "-0.03em", color: T.ink, fontVariantNumeric: "tabular-nums" }}>{value}</div>
                            <div className="text-[12px] font-medium mt-1.5" style={{ color: deltaColor }}>{delta}</div>
                          </WhiteCard>
                        ))}
                      </div>

                      {/* Two-column (stacks below 992px) */}
                      <div className="grid gap-4" style={{ gridTemplateColumns: isWide ? "minmax(0,1.5fr) minmax(0,1fr)" : "minmax(0,1fr)" }}>
                        {/* Pipeline table */}
                        <WhiteCard style={{ padding: "24px" }}>
                          <div className="text-base font-bold mb-4" style={{ color: T.ink, letterSpacing: "-0.02em" }}>Active pipeline</div>
                          <div>
                            {demoPipeline.map((d) => {
                              const riskLevel = riskFromDscr(d.dscr);
                              const dCol = artifactDscrColor(d.dscr);
                              const stagePill: React.CSSProperties = d.stage === "Submitted"
                                ? { color: swatch.emerald, background: `${swatch.emerald}16` }
                                : d.stage === "Priced"
                                  ? { color: swatch.emerald, background: `${swatch.emerald}16` }
                                  : { color: "#e6e76b", background: "rgba(154,123,0,0.1)" };
                              return (
                                <div key={d.prop}
                                  className="grid items-center gap-3 transition cursor-default"
                                  style={{
                                    gridTemplateColumns: "1fr auto auto auto",
                                    padding: "13px 10px",
                                    borderBottom: `1px solid ${T.cardBorder}`,
                                    borderRadius: radius.sm,
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = T.inputBg}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-semibold truncate" style={{ color: T.ink }}>{d.prop}</div>
                                    <div className="text-[11px] mt-0.5" style={{ color: T.muted }}>{d.type} · ${Math.round(d.amt).toLocaleString()}</div>
                                  </div>
                                  <div className="font-mono font-bold text-sm" style={{ color: dCol, fontVariantNumeric: "tabular-nums" }}>{d.dscr.toFixed(2)}x</div>
                                  <div className="text-[11px] font-semibold px-2.5 py-1" style={{ ...stagePill, borderRadius: radius.pill }}>{d.stage}</div>
                                  <button onClick={() => switchTab("analyze")}
                                    className="text-[12px] font-bold transition"
                                    style={{ color: swatch.rainforest }}
                                    onMouseEnter={e => e.currentTarget.style.color = swatch.midnight}
                                    onMouseLeave={e => e.currentTarget.style.color = swatch.rainforest}>
                                    Open →
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </WhiteCard>

                        {/* Right column */}
                        <div className="flex flex-col gap-4">
                          {/* Compliance status */}
                          <div className="rounded-lg p-5 flex-1" style={{ background: swatch.midnight, border: `1px solid ${swatch.midnight}`, borderRadius: radius.md }}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3" style={{ color: swatch.lemon }}>Compliance</div>
                            {([
                              { label: "17a-4 WORM archive", status: "Active" },
                              { label: "IC memos generated", status: "6 / 6" },
                              { label: "State rules current", status: "Synced" },
                              { label: "Exam export",         status: "Ready" },
                            ] as const).map(({ label, status }) => (
                              <div key={label} className="flex items-center justify-between py-2.5"
                                style={{ borderBottom: `1px solid ${swatch.pistachio}15` }}>
                                <span className="text-[13px] font-medium" style={{ color: `${swatch.pistachio}c0` }}>{label}</span>
                                <span className="text-[11px] font-bold px-2 py-0.5"
                                  style={{ color: swatch.midnight, background: swatch.emerald, borderRadius: radius.pill }}>
                                  {status}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* State alerts */}
                          <Card style={{ padding: "20px" }}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3" style={{ color: swatch.rainforest }}>State alerts</div>
                            {([
                              { mark: "✕", color: T.dangerText, text: "45 Harbor (NJ): prepay penalty high-risk for LLC — restructure or expect +0.25% rate." },
                              { mark: "~",  color: "#e6e76b",    text: "19 Pine (OH): threshold PPP — confirm loan clears $116,356 exemption." },
                              { mark: "~",  color: "#e6e76b",    text: "7 Desert Vw (AZ): DSCR 0.98x — route to a sub-1.0 program with reserves." },
                            ] as const).map(({ mark, color, text }) => (
                              <div key={text} className="flex gap-2.5 py-2.5" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                                <span className="font-bold shrink-0" style={{ color }}>{mark}</span>
                                <span className="text-[12px] font-medium leading-relaxed" style={{ color: T.muted }}>{text}</span>
                              </div>
                            ))}
                          </Card>
                        </div>
                      </div>
                    </TabPane>
                  )}

                  {/* ── ANALYZE (Deal Workspace) ── */}
                  {activeTab === "analyze" && (
                    <TabPane id="analyze">
                      {/* Purpose line */}
                      <div className="pb-1">
                        <p className="text-sm" style={{ color: T.muted }}>
                          Enter deal inputs below. The engine solves <strong>DSCR</strong> (whether the property's rent can cover the loan payment), pricing, and risk in one pass — sensitivity and optimizer run at the same time.
                        </p>
                      </div>

                      {/* Error */}
                      {solveError && <ErrorBanner message={solveError} onRetry={handleAnalyze} />}

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* Input form */}
                        <WhiteCard className="lg:col-span-2" style={{ padding: "24px" }}>
                          <h2 className="font-bold mb-4 text-base" style={{ color: T.ink }}>Deal Parameters</h2>

                          <div className="grid grid-cols-2 gap-3">
                            <FieldInput label="Purchase Price" type="number" value={dealForm.purchasePrice}
                              onChange={e => setDealForm(p => ({ ...p, purchasePrice: e.target.value }))}
                              helper="Total acquisition cost" />
                            <FieldInput label="Loan Amount" type="number" value={dealForm.loanAmount}
                              onChange={e => setDealForm(p => ({ ...p, loanAmount: e.target.value }))} />
                            <FieldInput label="Gross Monthly Rent" type="number" value={dealForm.monthlyRent}
                              onChange={e => setDealForm(p => ({ ...p, monthlyRent: e.target.value }))}
                              helper="Market rent before vacancy" />
                            <FieldInput label="FICO Score" type="number" value={dealForm.ficoScore}
                              onChange={e => setDealForm(p => ({ ...p, ficoScore: e.target.value }))} />
                            <FieldInput label="HOA (monthly)" type="number" value={dealForm.hoa}
                              onChange={e => setDealForm(p => ({ ...p, hoa: e.target.value }))}
                              helper="$0 if none" />
                            <FieldInput label="State" type="text" maxLength={2} value={dealForm.state}
                              onChange={e => setDealForm(p => ({ ...p, state: e.target.value.toUpperCase() }))}
                              helper="2-letter code" />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <FieldSelect label="Property" value={dealForm.propertyType}
                              onChange={e => setDealForm(p => ({ ...p, propertyType: e.target.value }))}>
                              <option value="SFR">SFR</option>
                              <option value="2-4_UNIT">2–4 Unit</option>
                              <option value="CONDO_WARRANTABLE">Condo</option>
                              <option value="CONDO_NON_WARRANTABLE">Non-Warrantable</option>
                              <option value="5+_UNIT">5+ Unit</option>
                            </FieldSelect>
                            <FieldSelect label="Purpose" value={dealForm.loanPurpose}
                              onChange={e => setDealForm(p => ({ ...p, loanPurpose: e.target.value }))}>
                              <option value="PURCHASE">Purchase</option>
                              <option value="REFI_RATE_TERM">Rate/Term Refi</option>
                              <option value="CASH_OUT_REFI">Cash-Out</option>
                              <option value="DELAYED_FINANCING">Delayed Fin.</option>
                            </FieldSelect>
                            <FieldSelect label="Strategy" value={dealForm.strategy}
                              onChange={e => setDealForm(p => ({ ...p, strategy: e.target.value }))}>
                              <option value="LTR">LTR</option>
                              <option value="STR">STR</option>
                              <option value="MTR">MTR</option>
                            </FieldSelect>
                          </div>

                          <p className="text-[10px] font-mono mt-3" style={{ color: T.faint }}>
                            LTV: {ltv}% · Rate auto-solved by engine
                          </p>

                          <PrimaryBtn onClick={handleAnalyze} disabled={isRunning || !dealFormValid} className="w-full mt-4">
                            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                            {isRunning ? "Solving…" : "Analyze Deal"}
                          </PrimaryBtn>

                          {!dealFormValid && !isRunning && (
                            <p className="text-[10px] text-center mt-2" style={{ color: T.dangerText }}>
                              Fill in purchase price, loan amount, rent, FICO, and state to run.
                            </p>
                          )}
                          {dealFormValid && !solveResult && !isRunning && !solveError && (
                            <p className="text-[10px] text-center mt-2" style={{ color: T.faint }}>
                              Solves DSCR · sensitivity · optimizer in one pass
                            </p>
                          )}
                        </WhiteCard>

                        {/* Results */}
                        <div className="lg:col-span-3 space-y-4">

                          {/* Loading skeleton */}
                          {isRunning && (
                            <Card style={{ padding: "28px" }}>
                              <div className="flex items-center gap-3 mb-6">
                                <RefreshCw className="w-5 h-5 animate-spin" style={{ color: swatch.rainforest }} />
                                <span className="text-sm font-semibold" style={{ color: T.ink }}>Solving deal…</span>
                              </div>
                              <div className="space-y-3">
                                <Skeleton h={80} rounded={radius.md} />
                                <div className="grid grid-cols-2 gap-3">
                                  <Skeleton h={64} rounded={radius.md} />
                                  <Skeleton h={64} rounded={radius.md} />
                                </div>
                                <Skeleton h={120} rounded={radius.md} />
                              </div>
                            </Card>
                          )}

                          {/* Empty state */}
                          {!deal && !isRunning && !solveError && (
                            <Card style={{ padding: "26px 24px" }}>
                              <div className="text-[11px] font-bold uppercase tracking-[0.08em] mb-4" style={{ color: T.faint }}>What the engine returns — in one pass</div>
                              <div className="space-y-3">
                                {[
                                  { t: "DSCR & pricing", d: "Whether the rent covers the full payment (PITIA), and the rate the deal can carry." },
                                  { t: "Sensitivity grid", d: "How the DSCR holds as rate and rent move against you — the stress map." },
                                  { t: "Structure optimizer", d: "The LTV / reserves mix that lifts a marginal file into approval." },
                                ].map((r, i) => (
                                  <div key={r.t} className="flex items-start gap-3.5" style={{ padding: "15px 16px", borderRadius: radius.md, border: `1px solid ${T.cardBorder}`, background: T.inputBg }}>
                                    <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(216,217,88,0.14)", color: swatch.lemon, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                                    <div>
                                      <div className="text-[14px] font-bold" style={{ color: T.ink, letterSpacing: "-0.01em" }}>{r.t}</div>
                                      <div className="text-[12px] mt-0.5 leading-relaxed" style={{ color: T.muted }}>{r.d}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] mt-4" style={{ color: T.faint }}>Set your deal on the left, then press <span style={{ color: swatch.lemon, fontWeight: 700 }}>Analyze Deal</span> to populate this panel.</p>
                            </Card>
                          )}

                          {deal && (() => {
                            const risk = riskFromDscr(deal.dscr);
                            return (
                              <>
                                {/* DSCR verdict card */}
                                <div className={`p-6 rounded-lg border ${dscrBgClass(deal.dscr)}`} style={{ borderRadius: radius.md }}>
                                  <div className="flex flex-wrap items-center gap-5 mb-4">
                                    {/* Gauge artifact */}
                                    <DscrGauge value={deal.dscr} size={120} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`text-4xl font-extrabold font-mono ${dscrColorClass(deal.dscr)}`}
                                          style={{ fontVariantNumeric: "tabular-nums" }}>
                                          {deal.dscr.toFixed(2)}x
                                        </span>
                                        {risk !== "none" && <RiskFlame level={risk} size={24} />}
                                      </div>
                                      <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dscrColorClass(deal.dscr)}`}>
                                        {dscrLabel(deal.dscr)} — Track 1 DSCR
                                      </div>
                                      <p className="text-sm" style={{ color: T.muted }}>{deal.dualTrackDSCR.verdict.summary}</p>
                                    </div>
                                  </div>
                                  <Disclaimer />
                                </div>

                                {/* Dual-track */}
                                <div className="grid grid-cols-2 gap-3">
                                  {[deal.dualTrackDSCR.track1, deal.dualTrackDSCR.track2].map(track => (
                                    <WhiteCard key={track.label} style={{ padding: "16px" }}>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold" style={{ color: T.muted }}>{track.label}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5"
                                          style={{
                                            borderRadius: radius.pill,
                                            color: track.passes ? swatch.midnight : T.dangerText,
                                            background: track.passes ? swatch.emerald : T.dangerBg,
                                          }}>
                                          {track.passes ? "PASS" : "FAIL"}
                                        </span>
                                      </div>
                                      <div className={`text-2xl font-extrabold font-mono ${track.passes ? "text-emerald-700" : "text-red-700"}`}
                                        style={{ fontVariantNumeric: "tabular-nums" }}>
                                        {track.dscr.toFixed(2)}x
                                      </div>
                                      <div className="text-[11px] mt-1" style={{ color: T.faint }}>Qualifying rent: {fmt$(track.qualifyingRent)}/mo</div>
                                    </WhiteCard>
                                  ))}
                                </div>

                                {/* PITIA breakdown */}
                                <WhiteCard style={{ padding: "20px" }}>
                                  <h4 className="font-bold text-sm mb-1" style={{ color: T.ink }}>PITIA Breakdown</h4>
                                  <p className="text-[11px] mb-3" style={{ color: T.faint }}>
                                    PITIA = the full monthly payment — principal, interest, taxes, insurance, HOA
                                  </p>
                                  <div className="space-y-2">
                                    {[
                                      { label: "Principal & Interest", value: deal.monthlyPITIA.principalAndInterest },
                                      { label: "Taxes (monthly est.)", value: deal.monthlyPITIA.taxes },
                                      { label: "Insurance (monthly)", value: deal.monthlyPITIA.insurance },
                                      ...(deal.monthlyPITIA.hoa > 0 ? [{ label: "HOA", value: deal.monthlyPITIA.hoa }] : []),
                                      ...(deal.monthlyPITIA.floodInsurance > 0 ? [{ label: "Flood Insurance", value: deal.monthlyPITIA.floodInsurance }] : []),
                                    ].map(({ label, value }) => (
                                      <div key={label} className="flex justify-between items-center text-sm">
                                        <span style={{ color: T.muted }}>{label}</span>
                                        <span className="font-mono font-semibold" style={{ color: T.ink, fontVariantNumeric: "tabular-nums" }}>{fmt$(value)}/mo</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between items-center text-sm font-bold pt-2 mt-2" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                                      <span style={{ color: T.ink }}>Total PITIA</span>
                                      <span className="font-mono text-base" style={{ color: T.ink, fontVariantNumeric: "tabular-nums" }}>{fmt$(deal.monthlyPITIA.total)}/mo</span>
                                    </div>
                                  </div>
                                </WhiteCard>

                                {/* Key metrics */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {[
                                    { label: "Solved Rate",    value: fmtPct(deal.solvedRate),          sub: deal.tripleRate.dateStamp },
                                    { label: "Break-Even Rate", value: fmtPct(deal.dealBreakRate),       sub: "rate where DSCR = 1.0" },
                                    { label: "Rate Headroom",  value: `${deal.rateHeadroomBps} bps`,    sub: deal.rateHeadroomBps > 0 ? "buffer before failure" : "rate too high" },
                                    { label: "Loan Amount",    value: fmt$(deal.loanAmount),            sub: `${ltv}% LTV` },
                                    { label: "Debt Yield",     value: `${deal.debtYield.toFixed(2)}%`,  sub: "NOI / loan amount" },
                                    { label: "Cash to Close",  value: fmt$(deal.cashToClose.total),     sub: "base estimate" },
                                  ].map(({ label, value, sub }) => (
                                    <WhiteCard key={label} style={{ padding: "14px 16px" }}>
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.05em] mb-1" style={{ color: T.faint }}>{label}</p>
                                      <p className="font-bold font-mono text-base" style={{ color: T.ink, fontVariantNumeric: "tabular-nums" }}>{value}</p>
                                      <p className="text-[10px] mt-0.5" style={{ color: T.faint }}>{sub}</p>
                                    </WhiteCard>
                                  ))}
                                </div>

                                {/* Top Programs */}
                                {solveResult!.topLenders.length > 0 && (
                                  <WhiteCard style={{ padding: "20px" }}>
                                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                                      <div>
                                        <h4 className="font-bold text-sm" style={{ color: T.ink }}>Top Matching Programs</h4>
                                        <p className="text-[11px] mt-0.5" style={{ color: T.faint }}>Programs ranked by fit score for this deal. Ready to submit to underwriting.</p>
                                      </div>
                                      <GhostBtn onClick={() => switchTab("optimize")}>
                                        See all structures →
                                      </GhostBtn>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {solveResult!.topLenders.map((l, i) => (
                                        <div key={i} className="px-3 py-1.5 text-xs"
                                          style={{ background: T.inputBg, border: `1px solid ${T.cardBorder}`, borderRadius: radius.sm }}>
                                          <span className="font-bold" style={{ color: T.ink }}>{l.name}</span>
                                          <span className="ml-2 font-mono" style={{ color: T.faint }}>{l.score}/100</span>
                                          {l.tier && <span className="ml-2 font-semibold uppercase text-[9px]" style={{ color: swatch.rainforest }}>{l.tier}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </WhiteCard>
                                )}

                                {/* Quick-nav */}
                                {(sensResult || optResult) && (
                                  <div className="flex flex-wrap gap-3">
                                    {sensResult && (
                                      <GhostBtn onClick={() => switchTab("sensitivity")}>View Sensitivity Lab →</GhostBtn>
                                    )}
                                    {optResult && (
                                      <GhostBtn onClick={() => switchTab("optimize")}>View Structure Optimizer →</GhostBtn>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </TabPane>
                  )}

                  {/* ── SENSITIVITY LAB ── */}
                  {activeTab === "sensitivity" && (
                    <TabPane id="sensitivity">
                      <div className="pb-1">
                        <p className="text-sm" style={{ color: T.muted }}>
                          Shows how far the deal can bend before it breaks — the rent floor, max rate, and highest purchase price that still clears each DSCR threshold. Run <strong>Analyze</strong> from Deal Workspace; sensitivity runs in the same engine call.
                        </p>
                      </div>

                      {/* Loading */}
                      {isRunning && (
                        <Card style={{ padding: "28px" }}>
                          <div className="flex items-center gap-3 mb-5">
                            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: swatch.rainforest }} />
                            <span className="text-sm font-semibold" style={{ color: T.ink }}>Running sensitivity analysis…</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton h={140} rounded={radius.md} />
                            <Skeleton h={140} rounded={radius.md} />
                            <Skeleton h={140} rounded={radius.md} />
                          </div>
                        </Card>
                      )}

                      {/* Error */}
                      {sensError && !isRunning && (
                        <ErrorBanner message={sensError} onRetry={() => { switchTab("analyze"); }} />
                      )}

                      {!isRunning && !sensError && !sensResult ? (
                        <Card style={{ padding: "64px 24px", textAlign: "center" }}>
                          <BarChart2 className="w-10 h-10 mx-auto mb-3" style={{ color: `${T.ink}25` }} />
                          <p className="text-sm font-semibold" style={{ color: T.muted }}>No sensitivity data yet.</p>
                          <p className="text-xs mt-1 mb-5" style={{ color: T.faint }}>Go to Deal Workspace, enter your inputs, and run Analyze. Sensitivity populates automatically.</p>
                          <PrimaryBtn onClick={() => switchTab("analyze")}>Go to Deal Workspace →</PrimaryBtn>
                        </Card>
                      ) : !isRunning && sensResult ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Rent breakeven */}
                            <WhiteCard style={{ padding: "20px" }}>
                              <h4 className="font-bold text-sm mb-1" style={{ color: T.ink }}>Rent Breakeven</h4>
                              <p className="text-[11px] mb-3" style={{ color: T.faint }}>Minimum monthly rent to hit each DSCR target</p>
                              <div className="space-y-3">
                                {[
                                  { label: "1.0x — floor (barely qualifies)", value: sensResult.sensitivity.rentBreakeven.for1_0, warn: true },
                                  { label: "1.10x — comfortable", value: sensResult.sensitivity.rentBreakeven.for1_10, warn: false },
                                  { label: "1.25x — strong / best pricing", value: sensResult.sensitivity.rentBreakeven.for1_25, warn: false },
                                ].map(({ label, value, warn }) => (
                                  <div key={label} className="flex items-center justify-between gap-3">
                                    <span className="text-xs flex-1" style={{ color: T.muted }}>{label}</span>
                                    <span className="font-mono font-bold text-sm shrink-0" style={{ color: warn ? "#e6e76b" : swatch.rainforest, fontVariantNumeric: "tabular-nums" }}>
                                      {fmt$(value)}/mo
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </WhiteCard>

                            {/* Rate breakeven */}
                            <WhiteCard style={{ padding: "20px" }}>
                              <h4 className="font-bold text-sm mb-1" style={{ color: T.ink }}>Max Rate</h4>
                              <p className="text-[11px] mb-3" style={{ color: T.faint }}>Highest rate that still clears each DSCR threshold</p>
                              <div className="space-y-3">
                                {[
                                  { label: "1.0x — absolute ceiling", value: sensResult.sensitivity.rateBreakeven.maxRateFor1_0 },
                                  { label: "1.10x — comfortable", value: sensResult.sensitivity.rateBreakeven.maxRateFor1_10 },
                                  { label: "1.25x — best execution", value: sensResult.sensitivity.rateBreakeven.maxRateFor1_25 },
                                ].map(({ label, value }) => (
                                  <div key={label} className="flex items-center justify-between gap-3">
                                    <span className="text-xs flex-1" style={{ color: T.muted }}>{label}</span>
                                    <span className="font-mono font-bold text-sm shrink-0" style={{ color: swatch.rainforest, fontVariantNumeric: "tabular-nums" }}>
                                      {fmtPct(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </WhiteCard>

                            {/* Price breakeven */}
                            <WhiteCard style={{ padding: "20px" }}>
                              <h4 className="font-bold text-sm mb-1" style={{ color: T.ink }}>Max Purchase Price</h4>
                              <p className="text-[11px] mb-3" style={{ color: T.faint }}>Highest price (at same LTV) that still qualifies</p>
                              <div className="space-y-3">
                                {[
                                  { label: "1.0x floor", value: sensResult.sensitivity.priceBreakeven.for1_0 },
                                  { label: "1.10x comfortable", value: sensResult.sensitivity.priceBreakeven.for1_10 },
                                  { label: "1.25x strong", value: sensResult.sensitivity.priceBreakeven.for1_25 },
                                ].map(({ label, value }) => (
                                  <div key={label} className="flex items-center justify-between gap-3">
                                    <span className="text-xs flex-1" style={{ color: T.muted }}>{label}</span>
                                    <span className="font-mono font-bold text-sm shrink-0" style={{ color: swatch.rainforest, fontVariantNumeric: "tabular-nums" }}>
                                      {fmt$(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </WhiteCard>
                          </div>

                          {/* Structure alternatives */}
                          <WhiteCard style={{ padding: "20px" }}>
                            <h4 className="font-bold text-sm mb-1" style={{ color: T.ink }}>Structure Alternatives</h4>
                            <p className="text-[11px] mb-4" style={{ color: T.faint }}>DSCR impact of amortization structure changes</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {deal && [
                                { label: "30yr P&I (current)", dscr: deal.dscr, active: true, value: null as string | null },
                                { label: "Interest-Only", dscr: sensResult.sensitivity.structureBreakeven.dscrWithIO, active: false, value: null as string | null },
                                { label: "40yr Amortization", dscr: sensResult.sensitivity.structureBreakeven.dscrWith40yr, active: false, value: null as string | null },
                                { label: "IO savings/month", dscr: null as number | null, active: false, value: fmt$(sensResult.sensitivity.structureBreakeven.monthlySavingsIO) },
                              ].map(({ label, dscr, value, active }) => {
                                const structRisk = dscr !== null ? riskFromDscr(dscr) : "none";
                                return (
                                  <div key={label} style={{
                                    padding: "14px 16px",
                                    borderRadius: radius.sm,
                                    background: active ? swatch.midnight : T.cardBg,
                                    border: `1px solid ${active ? swatch.midnight : T.cardBorder}`,
                                  }}>
                                    <p className="text-[10px] font-semibold mb-1.5" style={{ color: active ? `${swatch.pistachio}90` : T.faint }}>{label}</p>
                                    {dscr !== null ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xl font-extrabold font-mono" style={{ color: active ? swatch.emerald : artifactDscrColor(dscr), fontVariantNumeric: "tabular-nums" }}>
                                          {dscr.toFixed(2)}x
                                        </span>
                                        {!active && structRisk !== "none" && <RiskFlame level={structRisk} size={16} />}
                                      </div>
                                    ) : (
                                      <span className="text-xl font-extrabold font-mono" style={{ color: swatch.emerald, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </WhiteCard>

                          {/* Tornado chart */}
                          {sensResult.sensitivity.tornadoData.length > 0 && (
                            <WhiteCard style={{ padding: "20px" }}>
                              <h4 className="font-bold text-sm mb-1" style={{ color: T.ink }}>Sensitivity — Tornado</h4>
                              <p className="text-[11px] mb-4" style={{ color: T.faint }}>Which inputs move DSCR the most, ranked by impact</p>
                              <div className="space-y-2.5">
                                {sensResult.sensitivity.tornadoData.slice(0, 8).map((item) => {
                                  const maxImpact = sensResult.sensitivity.tornadoData[0].impact;
                                  const barWidth = Math.max(8, Math.round((item.impact / maxImpact) * 100));
                                  const isDangerous = item.dscrAtLow < 1.0;
                                  return (
                                    <div key={item.lever} className="flex items-center gap-3">
                                      <div className="flex items-center gap-1.5 w-36 shrink-0">
                                        <span className="text-[11px] font-medium" style={{ color: T.muted }}>{item.lever}</span>
                                        {isDangerous && <RiskFlame level="high" size={13} />}
                                      </div>
                                      <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: T.inputBg }}>
                                          <div className="h-full transition-all"
                                            style={{ width: `${barWidth}%`, background: isDangerous ? T.dangerText : swatch.rainforest, borderRadius: 999 }} />
                                        </div>
                                        <span className="text-[10px] font-mono w-20 text-right shrink-0" style={{ color: T.faint, fontVariantNumeric: "tabular-nums" }}>
                                          {item.dscrAtLow.toFixed(2)}–{item.dscrAtHigh.toFixed(2)}x
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </WhiteCard>
                          )}

                          {/* Joint appraisal risk */}
                          {sensResult.sensitivity.jointAppraisalRisk && (() => {
                            const rating = sensResult.sensitivity.jointAppraisalRisk.combinedRiskRating;
                            const ratingStyle: React.CSSProperties =
                              rating === "LOW" ? { color: swatch.emerald, background: `${swatch.emerald}16`, border: `1px solid ${swatch.rainforest}30` } :
                              rating === "MODERATE" ? { color: "#e6e76b", background: "#fffbe6", border: "1px solid #ffe58f" } :
                              { color: T.dangerText, background: T.dangerBg, border: `1px solid ${T.dangerBorder}` };
                            return (
                              <Card style={{ padding: "20px" }}>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-bold text-sm" style={{ color: T.ink }}>Joint Appraisal Risk</h4>
                                  <span className="text-xs font-bold px-2.5 py-1" style={{ ...ratingStyle, borderRadius: radius.pill }}>{rating}</span>
                                </div>
                                <p className="text-sm mb-3" style={{ color: T.muted }}>{sensResult.sensitivity.jointAppraisalRisk.summary}</p>
                                <div className="text-xs" style={{ color: T.muted }}>
                                  Rent breakpoint:{" "}
                                  <strong className="font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {fmt$(sensResult.sensitivity.jointAppraisalRisk.rentBreakpoint)}/mo
                                  </strong>
                                  {" · "}Stress (rent −10% + value −10%):{" "}
                                  <strong className="font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {sensResult.sensitivity.jointAppraisalRisk.combinedStressTest.stressedDSCR.toFixed(2)}x
                                  </strong>
                                </div>
                              </Card>
                            );
                          })()}
                        </>
                      ) : null}
                    </TabPane>
                  )}

                  {/* ── STRUCTURE OPTIMIZER ── */}
                  {activeTab === "optimize" && (
                    <TabPane id="optimize">
                      <div className="pb-1">
                        <p className="text-sm" style={{ color: T.muted }}>
                          Compares every loan structure Greenstreet offers — 30yr P&amp;I, interest-only, 40yr amort — ranked by DSCR so you can see which structure gives the deal the most room. Run <strong>Analyze</strong> in Deal Workspace first; optimizer runs in the same call.
                        </p>
                      </div>

                      {/* Loading */}
                      {isRunning && (
                        <Card style={{ padding: "28px" }}>
                          <div className="flex items-center gap-3 mb-5">
                            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: swatch.rainforest }} />
                            <span className="text-sm font-semibold" style={{ color: T.ink }}>Evaluating loan structures…</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1,2,3].map(i => <Skeleton key={i} h={160} rounded={radius.md} />)}
                          </div>
                        </Card>
                      )}

                      {/* Error */}
                      {optError && !isRunning && (
                        <ErrorBanner message={optError} onRetry={() => switchTab("analyze")} />
                      )}

                      {!isRunning && !optError && !optResult ? (
                        <Card style={{ padding: "64px 24px", textAlign: "center" }}>
                          <Zap className="w-10 h-10 mx-auto mb-3" style={{ color: `${T.ink}25` }} />
                          <p className="text-sm font-semibold" style={{ color: T.muted }}>No structure data yet.</p>
                          <p className="text-xs mt-1 mb-5" style={{ color: T.faint }}>Go to Deal Workspace, fill in the deal inputs, and run Analyze. The optimizer evaluates all structures in the same pass.</p>
                          <div className="mt-5"><PrimaryBtn onClick={() => switchTab("analyze")}>Go to Deal Workspace →</PrimaryBtn></div>
                        </Card>
                      ) : !isRunning && optResult ? (
                        <>
                          <p className="text-xs" style={{ color: T.faint }}>
                            {optResult.options.length} structures evaluated — sorted by Track 1 DSCR, highest first
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...optResult.options].sort((a, b) => b.track1DSCR - a.track1DSCR).map((opt, i) => {
                              const isBest = i === 0;
                              const optRisk = riskFromDscr(opt.track1DSCR);
                              return (
                                <div key={opt.name}
                                  style={{
                                    padding: "20px",
                                    borderRadius: radius.md,
                                    background: isBest ? swatch.pistachio : T.inputBg,
                                    border: `1px solid ${isBest ? swatch.pistachio : T.cardBorder}`,
                                  }}>
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="font-bold text-sm mb-1" style={{ color: isBest ? swatch.midnight : T.ink }}>{opt.name}</p>
                                      {isBest && (
                                        <span className="text-[10px] font-bold px-2 py-0.5"
                                          style={{ background: swatch.lemon, color: swatch.midnight, borderRadius: radius.pill }}>
                                          BEST DSCR
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-2xl font-extrabold font-mono"
                                        style={{ color: isBest ? swatch.rainforest : artifactDscrColor(opt.track1DSCR), fontVariantNumeric: "tabular-nums" }}>
                                        {opt.track1DSCR.toFixed(2)}x
                                      </span>
                                      {!isBest && optRisk !== "none" && <RiskFlame level={optRisk} size={18} />}
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    {[
                                      { label: "Rate",             value: fmtPct(opt.rate) },
                                      { label: "Monthly P&I",     value: fmt$(opt.monthlyPayment) },
                                      { label: "Monthly Cash Flow", value: `${opt.monthlyCashFlow >= 0 ? "+" : ""}${fmt$(opt.monthlyCashFlow)}` },
                                      { label: "Track 2 DSCR",    value: `${opt.track2DSCR.toFixed(2)}x` },
                                    ].map(({ label, value }) => (
                                      <div key={label} className="flex justify-between text-xs">
                                        <span style={{ color: isBest ? "rgba(0,55,56,0.55)" : T.muted }}>{label}</span>
                                        <span className="font-mono font-semibold" style={{ color: isBest ? swatch.midnight : T.ink, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                  {opt.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-2 mt-2" style={{ borderTop: `1px solid ${isBest ? "rgba(0,55,56,0.12)" : T.cardBorder}` }}>
                                      {opt.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 font-semibold"
                                          style={{
                                            borderRadius: radius.sm,
                                            background: isBest ? "rgba(0,55,56,0.07)" : T.inputBg,
                                            color: isBest ? "rgba(0,55,56,0.7)" : T.muted,
                                          }}>
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
                    </TabPane>
                  )}

                  {/* ── STATE RULES ── */}
                  {activeTab === "state" && (
                    <TabPane id="state">
                      <div className="pb-1">
                        <p className="text-sm" style={{ color: T.muted }}>
                          Checks each state's prepayment penalty (PPP) laws, entity requirements, and ARM restrictions. Select a state or type a 2-letter code and look it up.
                        </p>
                      </div>

                      <WhiteCard style={{ padding: "24px" }}>
                        <h2 className="font-bold mb-1" style={{ color: T.ink }}>State PPP / Prepay Lookup</h2>
                        <p className="text-xs mb-4" style={{ color: T.muted }}>
                          PPP = prepayment penalty. Checks whether a penalty clause is legally enforceable in the selected state, what options remain, and what it costs if PPP is restricted.
                        </p>
                        <div className="flex flex-wrap gap-3 items-end">
                          <FieldInput label="State (2-letter)" type="text" maxLength={2} value={stateInput}
                            onChange={e => setStateInput(e.target.value.toUpperCase())}
                            style={{ width: 88 }} />
                          <PrimaryBtn onClick={handleStateRules} disabled={isLoadingState}>
                            {isLoadingState ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                            Look Up
                          </PrimaryBtn>
                        </div>
                        {/* Quick-pick state chips */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {["FL", "CA", "TX", "NY", "GA", "IL", "PA", "MN", "KS", "NM"].map(s => (
                            <button key={s} onClick={() => setStateInput(s)}
                              className="text-[11px] font-bold font-mono transition"
                              style={{
                                padding: "6px 12px",
                                borderRadius: radius.sm,
                                border: `1px solid ${stateInput === s ? swatch.rainforest : T.cardBorder}`,
                                background: stateInput === s ? `${swatch.rainforest}10` : T.inputBg,
                                color: stateInput === s ? swatch.rainforest : T.muted,
                              }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </WhiteCard>

                      {/* Loading skeleton */}
                      {isLoadingState && (
                        <Card style={{ padding: "24px" }}>
                          <div className="flex items-center gap-3 mb-4">
                            <RefreshCw className="w-4 h-4 animate-spin" style={{ color: swatch.rainforest }} />
                            <span className="text-sm font-semibold" style={{ color: T.ink }}>Looking up state rules…</span>
                          </div>
                          <div className="space-y-3">
                            <Skeleton h={64} />
                            <div className="grid grid-cols-2 gap-3">
                              <Skeleton h={80} />
                              <Skeleton h={80} />
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Error */}
                      {stateError && !isLoadingState && <ErrorBanner message={stateError} onRetry={handleStateRules} />}

                      {stateResult && !isLoadingState && (
                        <div className="space-y-4">
                          {/* Verdict */}
                          <div style={{ ...pppBadgeStyle(stateResult.ppp.status), padding: "20px 24px", borderRadius: radius.md }}>
                            <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
                              <div>
                                <h3 className="font-bold text-lg" style={{ color: "inherit" }}>{stateResult.state} — Prepayment Penalty</h3>
                                <p className="text-xs font-mono mt-0.5 opacity-70">{stateResult.ppp.status.replace(/_/g, " ")}</p>
                              </div>
                              <span className="text-sm font-bold px-3 py-1.5"
                                style={{ ...pppBadgeStyle(stateResult.ppp.status), borderRadius: radius.sm }}>
                                {stateResult.ppp.allowed ? "PPP ALLOWED" : "PPP RESTRICTED"}
                              </span>
                            </div>
                            <p className="text-sm">{stateResult.ppp.reason}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Available options */}
                            <WhiteCard style={{ padding: "20px" }}>
                              <h4 className="font-bold text-sm mb-3" style={{ color: T.ink }}>Allowed Prepay Structures</h4>
                              <div className="flex flex-wrap gap-2">
                                {stateResult.ppp.adjustedOptions.map(opt => (
                                  <span key={opt} className="px-3 py-1.5 text-xs font-bold"
                                    style={{ background: `${swatch.rainforest}12`, color: swatch.rainforest, border: `1px solid ${swatch.rainforest}30`, borderRadius: radius.sm }}>
                                    {opt}
                                  </span>
                                ))}
                                {stateResult.ppp.adjustedOptions.length === 0 && (
                                  <span className="text-xs" style={{ color: T.faint }}>No standard PPP options available in this state</span>
                                )}
                              </div>
                            </WhiteCard>

                            {/* Cost of no PPP */}
                            {!stateResult.ppp.allowed && (
                              <div style={{ padding: "20px", background: T.warnBg, border: `1px solid ${T.warnBorder}`, borderRadius: radius.md }}>
                                <h4 className="font-bold text-sm mb-3" style={{ color: T.warnText }}>No-PPP Cost Premium</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span style={{ color: T.warnText }}>Rate premium</span>
                                    <span className="font-mono font-bold" style={{ color: T.warnText, fontVariantNumeric: "tabular-nums" }}>+{fmtPct(stateResult.ppp.noPPPPremiumRate)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span style={{ color: T.warnText }}>Fee premium</span>
                                    <span className="font-mono font-bold" style={{ color: T.warnText, fontVariantNumeric: "tabular-nums" }}>+{(stateResult.ppp.noPPPPremiumFee * 100).toFixed(3)}%</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Entity note */}
                            {stateResult.ppp.requiresEntityVesting && (
                              <Card style={{ padding: "20px" }}>
                                <h4 className="font-bold text-sm mb-2" style={{ color: swatch.rainforest }}>Entity Vesting Required</h4>
                                <p className="text-sm" style={{ color: T.muted }}>{stateResult.ppp.entityNote}</p>
                              </Card>
                            )}
                          </div>

                          {stateResult.ppp.legalWarning && (
                            <div className="flex items-start gap-3 p-4 text-sm"
                              style={{ background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: radius.md, color: T.dangerText }}>
                              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                              <p>{stateResult.ppp.legalWarning}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </TabPane>
                  )}

                  {/* ── HISTORY ── */}
                  {activeTab === "history" && (
                    <TabPane id="history">
                      <div className="pb-1">
                        <p className="text-sm" style={{ color: T.muted }}>
                          Every deal you've analyzed and every state lookup, in chronological order. Click a row to inspect the full result.
                        </p>
                      </div>

                      {auditLogs.length === 0 ? (
                        <Card style={{ padding: "64px 24px", textAlign: "center" }}>
                          <History className="w-10 h-10 mx-auto mb-3" style={{ color: `${T.ink}25` }} />
                          <p className="font-semibold text-sm" style={{ color: T.muted }}>No saved scenarios yet.</p>
                          <p className="text-xs mt-1 mb-5" style={{ color: T.faint }}>Run a deal analysis or state lookup to start building your history.</p>
                          <PrimaryBtn onClick={() => switchTab("analyze")}>Analyze a Deal →</PrimaryBtn>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Log list */}
                          <div className="space-y-2">
                            {auditLogs.map(log => (
                              <button key={log.id} onClick={() => setSelectedLog(log)} className="w-full text-left transition"
                                style={{
                                  background: selectedLog?.id === log.id ? "rgba(238,239,211,0.1)" : T.inputBg,
                                  border: `1px solid ${selectedLog?.id === log.id ? "rgba(238,239,211,0.3)" : T.cardBorder}`,
                                  borderRadius: radius.md,
                                  padding: "14px 16px",
                                }}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0"
                                      style={{ background: log.type === "analyze" ? swatch.emerald : swatch.lemon }} />
                                    <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>{log.title}</p>
                                  </div>
                                  <button onClick={e => { e.stopPropagation(); deleteLog(log.id!, e as any); }}
                                    className="p-1 transition shrink-0"
                                    style={{ color: T.faint, borderRadius: radius.sm }}
                                    onMouseEnter={e => e.currentTarget.style.color = T.dangerText}
                                    onMouseLeave={e => e.currentTarget.style.color = T.faint}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5"
                                    style={{
                                      borderRadius: radius.pill,
                                      background: log.type === "analyze" ? `${swatch.emerald}20` : `${swatch.lemon}40`,
                                      color: log.type === "analyze" ? swatch.rainforest : "#e6e76b",
                                    }}>
                                    {log.type === "analyze" ? "DSCR Deal" : "State PPP"}
                                  </span>
                                  <span className="text-[10px]" style={{ color: T.faint }}>{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Detail panel */}
                          {selectedLog ? (
                            <WhiteCard style={{ padding: "20px", overflow: "auto", maxHeight: 600 }}>
                              <h3 className="font-bold text-sm mb-0.5" style={{ color: T.ink }}>{selectedLog.title}</h3>
                              <p className="text-[10px] mb-4" style={{ color: T.faint }}>{new Date(selectedLog.timestamp).toLocaleString()}</p>
                              {/* Human-readable summary if analyze type */}
                              {selectedLog.type === "analyze" && selectedLog.output?.deal && (() => {
                                const d = selectedLog.output.deal as DSCRResult;
                                return (
                                  <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl font-extrabold font-mono" style={{ color: artifactDscrColor(d.dscr), fontVariantNumeric: "tabular-nums" }}>{d.dscr.toFixed(2)}x</span>
                                      <span className="text-xs font-bold" style={{ color: T.muted }}>DSCR — {dscrLabel(d.dscr)}</span>
                                    </div>
                                    <div className="text-xs space-y-1" style={{ color: T.muted }}>
                                      <div>Solved rate: <strong className="font-mono">{fmtPct(d.solvedRate)}</strong></div>
                                      <div>Total PITIA: <strong className="font-mono">{fmt$(d.monthlyPITIA?.total ?? 0)}/mo</strong></div>
                                      <div>Rate headroom: <strong className="font-mono">{d.rateHeadroomBps} bps</strong></div>
                                    </div>
                                  </div>
                                );
                              })()}
                              <pre className="text-xs overflow-auto whitespace-pre-wrap" style={{ background: T.inputBg, borderRadius: radius.sm, padding: "12px", color: T.muted }}>
                                {JSON.stringify(selectedLog.output, null, 2)}
                              </pre>
                            </WhiteCard>
                          ) : (
                            <Card style={{ padding: "40px 24px", textAlign: "center" }}>
                              <p className="text-sm" style={{ color: T.faint }}>Click a scenario on the left to inspect its result.</p>
                            </Card>
                          )}
                        </div>
                      )}
                    </TabPane>
                  )}

                  {/* ── SETTINGS ── */}
                  {activeTab === "settings" && (
                    <TabPane id="settings">
                      <WhiteCard className="max-w-xl" style={{ padding: "32px" }}>
                        <h2 className="font-bold text-lg mb-1" style={{ color: T.ink }}>Your Profile</h2>
                        <p className="text-xs mb-6" style={{ color: T.muted }}>
                          Your name and license info appear on IC memos and audit exports.
                        </p>
                        <form onSubmit={saveBrokerConfig} className="space-y-4">
                          {[
                            { key: "brokerName",    label: "Name / Company",    helper: "Displayed on all exports" },
                            { key: "nmls",          label: "NMLS License Number",      helper: "Required for compliance memos" },
                            { key: "licenseType",   label: "License Type",             helper: "Optional" },
                            { key: "primaryMarket", label: "Primary Markets (States)", helper: "e.g. FL, TX, GA" },
                          ].map(({ key, label, helper }) => (
                            <FieldInput key={key} label={label} helper={helper} type="text"
                              value={(brokerConfig as any)[key]}
                              onChange={e => setBrokerConfig(p => ({ ...p, [key]: e.target.value }))} />
                          ))}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: T.muted }}>Default Disclaimer</label>
                            <textarea rows={3} value={brokerConfig.autoDisclaimer}
                              onChange={e => setBrokerConfig(p => ({ ...p, autoDisclaimer: e.target.value }))}
                              className="w-full px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                              style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: radius.sm, color: T.ink }}
                              onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; e.currentTarget.style.background = "rgba(238,239,211,0.1)"; }}
                              onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg; }} />
                          </div>
                          <PrimaryBtn type="submit" className="w-full">
                            {brokerSaved ? <><CheckCircle className="w-4 h-4" /> Saved</> : "Save Profile"}
                          </PrimaryBtn>
                        </form>
                      </WhiteCard>
                    </TabPane>
                  )}

                  {/* ── EMBEDDED WORKSPACE TOOLS (broker/lender backend) ── */}
                  {activeTab === "str" && (
                    <TabPane id="str">
                      <STRUnderwritingPage onBack={() => switchTab("dashboard")} onNavigate={() => switchTab("dashboard")} />
                    </TabPane>
                  )}
                  {activeTab === "portfolio" && (
                    <TabPane id="portfolio">
                      <PortfolioPage onBack={() => switchTab("dashboard")} onNavigate={() => switchTab("dashboard")} />
                    </TabPane>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
