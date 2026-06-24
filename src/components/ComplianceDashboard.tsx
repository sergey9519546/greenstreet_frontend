import React, { useState, useEffect } from "react";
import { auth, db, loginWithGoogle, logoutUser, loginAnonymously } from "../firebase";
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Shield, CheckCircle, Search, MapPin, Sparkles, History,
  Trash2, LogOut, ArrowLeft, RefreshCw, AlertTriangle,
  Calculator, TrendingUp, BarChart2, Settings2, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { DSCRResult, BreakevenResult, StructureOption, PPPCheckResult, PITIABreakdown, DualTrackDSCR } from "../engine/types";
import type { AuditLog } from "../types";
import RefiTrackerPage from "../pages/RefiTrackerPage";
import ARMPage from "../pages/ARMPage";
import MonteCarloPage from "../pages/MonteCarloPage";
import ReturnsPage from "../pages/ReturnsPage";
import TaxEnginePage from "../pages/TaxEnginePage";
import StressMatrixPage from "../pages/StressMatrixPage";
import DecisionSupportPage from "../pages/DecisionSupportPage";
import STRUnderwritingPage from "../pages/STRUnderwritingPage";
import PortfolioPage from "../pages/PortfolioPage";

// ─── helpers ────────────────────────────────────────────────────────────────

function dscrColor(dscr: number): string {
  if (dscr >= 1.25) return "text-emerald";
  if (dscr >= 1.10) return "text-rain-forest";
  if (dscr >= 1.00) return "text-lemon-lime";
  if (dscr >= 0.75) return "text-orange-500";
  return "text-red-600";
}
function dscrBg(dscr: number): string {
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
function pppBadgeColor(status: string) {
  if (status === "ALLOWED") return "bg-emerald/20 text-emerald border-emerald/30";
  if (status === "PROHIBITED") return "bg-red-500/20 text-red-500 border-red-500/30";
  if (status === "CONDITIONAL") return "bg-lemon-lime/20 text-lemon-lime border-lemon-lime/30";
  return "bg-slate-100 text-slate-700 border-slate-200";
}
const fmt$ = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtPct = (n: number) => `${n.toFixed(3)}%`;

// ─── types ──────────────────────────────────────────────────────────────────

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
  | "refi" | "arm" | "montecarlo" | "returns" | "tax" | "stress" | "decision" | "str" | "portfolio";
interface ComplianceDashboardProps { onBackToMarketing: () => void; initialEmail?: string; initialTab?: DashboardTab }

// ─── component ──────────────────────────────────────────────────────────────

export default function ComplianceDashboard({ onBackToMarketing, initialEmail, initialTab }: ComplianceDashboardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const userUid = currentUser?.uid ?? "demo-user";
  const userEmail = currentUser?.email ?? "demo@greenstreet.dev";
  const [authEmail, setAuthEmail] = useState(initialEmail || "");
  const [authPassword, setAuthPassword] = useState("pass1234");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab || "dashboard");

  const [brokerConfig, setBrokerConfig] = useState({ brokerName: "Capital Mortgage Group", nmls: "123456", licenseType: "Mortgage Broker", primaryMarket: "Florida, California, Texas", autoDisclaimer: "Rates and terms subject to change. Not a commitment to lend. NMLS#123456." });
  const [brokerSaved, setBrokerSaved] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [dealForm, setDealForm] = useState<DealForm>({
    purchasePrice: "450000", loanAmount: "337500", monthlyRent: "3200",
    state: "FL", propertyType: "SFR", loanPurpose: "PURCHASE",
    ficoScore: "740", strategy: "LTR", hoa: "0",
  });

  const [isRunning, setIsRunning] = useState(false);
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);
  const [sensResult, setSensResult] = useState<SensResult | null>(null);
  const [optResult, setOptResult] = useState<OptResult | null>(null);
  const [stateInput, setStateInput] = useState("FL");
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [stateResult, setStateResult] = useState<StateResult | null>(null);

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

  const handleAnalyze = async () => {
    const payload = buildPayload();
    setIsRunning(true);
    setSolveResult(null); setSensResult(null); setOptResult(null);
    try {
      const [solveRes, sensRes, optRes] = await Promise.all([
        fetch("/api/dscr/solve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        fetch("/api/dscr/sensitivity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        fetch("/api/dscr/optimize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      ]);
      const [solve, sens, opt] = await Promise.all([solveRes.json(), sensRes.json(), optRes.json()]);
      if (!solveRes.ok) throw new Error(solve.error || "Solve failed");
      setSolveResult(solve);
      if (sensRes.ok) setSensResult(sens);
      if (optRes.ok) setOptResult(opt);
      await saveLog("analyze",
        `DSCR ${solve.deal.dscr.toFixed(2)}x — ${dealForm.propertyType} ${dealForm.state} ${dscrLabel(solve.deal.dscr)}`,
        JSON.stringify(payload), solve);
    } catch (err: any) {
      alert("Engine error: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStateRules = async () => {
    if (!stateInput.trim()) return;
    setIsLoadingState(true); setStateResult(null);
    try {
      const res = await fetch("/api/dscr/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: stateInput }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStateResult(data);
      await saveLog("state-rules", `State PPP: ${stateInput.toUpperCase()}`, stateInput, data);
    } catch (err: any) {
      alert("State lookup error: " + err.message);
    } finally {
      setIsLoadingState(false);
    }
  };

  const ltv = dealForm.purchasePrice && dealForm.loanAmount
    ? ((parseFloat(dealForm.loanAmount) / parseFloat(dealForm.purchasePrice)) * 100).toFixed(1)
    : "—";

  // ── Auth loading ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#003738] flex flex-col items-center justify-center text-pistachio p-4">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald mb-4" />
        <p className="text-sm font-semibold tracking-wider font-mono">LOADING DSCR ENGINE...</p>
      </div>
    );
  }

  // ── Auth screen ────────────────────────────────────────────────────────────
  if (!currentUser && !demoMode) {
    return (
      <div className="min-h-screen bg-pistachio flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 bg-dark-teal/10 bg-[radial-gradient(var(--color-emerald)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 relative z-10 text-dark-teal">
          <button onClick={onBackToMarketing} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald mb-6 transition">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back</span>
          </button>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-dark-teal text-emerald font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow">G</div>
            <h3 className="font-display text-2xl font-bold tracking-tight">DSCR Deal Engine</h3>
            <p className="text-slate-500 text-xs mt-1">Underwriting math runs server-side. Sign in to start pricing deals.</p>
          </div>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{authError}</span>
            </div>
          )}
          <button onClick={() => setDemoMode(true)}
            className="w-full py-2.5 border border-dashed border-slate-200 hover:border-dark-teal bg-slate-50 rounded-xl text-xs font-semibold text-slate-500 hover:text-dark-teal transition mb-3">
            Try demo (no account needed)
          </button>
          <button onClick={async () => { try { setAuthError(""); await loginWithGoogle(); } catch (e: any) { setAuthError(e.message); } }}
            className="w-full py-3.5 border border-slate-200 hover:border-dark-teal bg-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
          <div className="relative my-6 text-center text-xs text-slate-400">
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100" />
            <span className="relative z-10 bg-white px-3 font-semibold uppercase tracking-wider">or email</span>
          </div>
          <form onSubmit={async (e) => { e.preventDefault(); setAuthError(""); try { isSignUpMode ? await createUserWithEmailAndPassword(auth, authEmail, authPassword) : await signInWithEmailAndPassword(auth, authEmail, authPassword); } catch (err: any) { setAuthError(err.message); } }} className="space-y-3">
            <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="broker@yourfirm.com" className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition" />
            <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition font-mono" />
            <button type="submit" className="w-full py-3.5 bg-dark-teal text-pistachio hover:bg-emerald hover:text-dark-teal text-sm font-bold rounded-xl transition shadow mt-4 active:scale-[0.98]">
              {isSignUpMode ? "Create Account" : "Access Engine"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-xs text-slate-500 hover:text-dark-teal font-semibold transition">
              {isSignUpMode ? "Already registered? Sign in" : "New broker? Create account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Portal ─────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "dashboard", icon: <Shield className="w-4 h-4" />, label: "Hub" },
    { key: "analyze", icon: <Calculator className="w-4 h-4" />, label: "DSCR Analyzer" },
    { key: "sensitivity", icon: <BarChart2 className="w-4 h-4" />, label: "Sensitivity" },
    { key: "optimize", icon: <Zap className="w-4 h-4" />, label: "Optimizer" },
    { key: "state", icon: <MapPin className="w-4 h-4" />, label: "State PPP" },
    { key: "refi", icon: <RefreshCw className="w-4 h-4" />, label: "Refi Tracker" },
    { key: "arm", icon: <TrendingUp className="w-4 h-4" />, label: "ARM Reset" },
    { key: "montecarlo", icon: <BarChart2 className="w-4 h-4" />, label: "Monte Carlo" },
    { key: "returns", icon: <TrendingUp className="w-4 h-4" />, label: "Returns / IRR" },
    { key: "tax", icon: <Calculator className="w-4 h-4" />, label: "Tax Engine" },
    { key: "stress", icon: <BarChart2 className="w-4 h-4" />, label: "Stress Matrix" },
    { key: "decision", icon: <Shield className="w-4 h-4" />, label: "Decision Support" },
    { key: "str", icon: <Sparkles className="w-4 h-4" />, label: "STR Underwriting" },
    { key: "portfolio", icon: <History className="w-4 h-4" />, label: "Portfolio" },
    { key: "history", icon: <History className="w-4 h-4" />, label: "History", count: auditLogs.length },
    { key: "settings", icon: <Settings2 className="w-4 h-4" />, label: "Profile" },
  ] as const;

  const deal = solveResult?.deal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased font-sans">

      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-dark-teal text-pistachio shrink-0 border-r border-midnight-green/30 flex flex-col justify-between py-6">
        <div>
          <div className="px-5 mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald flex items-center justify-center font-bold text-lg">G</div>
            <span className="font-bold text-lg text-white tracking-tight">Greenstreet</span>
          </div>
          <nav className="space-y-1 px-3">
            {tabs.map(({ key, icon, label, count }: any) => (
              <button key={key} onClick={() => { setActiveTab(key); setSelectedLog(null); }}
                className={`w-full px-3 py-2.5 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${activeTab === key ? "bg-emerald text-dark-teal shadow" : "text-pistachio/70 hover:bg-white/10 hover:text-white"}`}>
                {icon}
                <span className="flex-1">{label}</span>
                {count !== undefined && count > 0 && (
                  <span className="bg-[#0c2f30] text-emerald text-[10px] px-2 py-0.5 rounded-full font-bold">{count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-midnight-green/30 pt-5 px-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-emerald">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">{userEmail}</p>
              <p className="text-[10px] text-pistachio/50 font-mono">NMLS {brokerConfig.nmls}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onBackToMarketing} className="flex-1 py-2 border border-[#EEEFD3]/15 hover:border-[#EEEFD3] text-white font-semibold text-[11px] rounded-lg transition">
              ← Site
            </button>
            <button onClick={logoutUser} className="p-2 bg-[#0c2f30] hover:bg-red-900 text-pistachio rounded-lg transition" title="Sign Out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 mb-7 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase mb-0.5">DSCR Non-QM Wholesale · Sovereign OS</p>
              <h1 className="font-bold text-2xl text-dark-teal tracking-tight">
                {activeTab === "dashboard" && "Workspace Hub"}
                {activeTab === "analyze" && "DSCR Deal Analyzer"}
                {activeTab === "sensitivity" && "Sensitivity & Breakeven"}
                {activeTab === "optimize" && "Loan Structure Optimizer"}
                {activeTab === "state" && "State PPP / Prepay Rules"}
                {activeTab === "refi" && "Refi Tracker"}
                {activeTab === "arm" && "ARM Reset Risk"}
                {activeTab === "montecarlo" && "Monte Carlo Rate Paths"}
                {activeTab === "returns" && "Returns & IRR"}
                {activeTab === "tax" && "After-Tax IRR (Tax Engine)"}
                {activeTab === "stress" && "Stress Matrix"}
                {activeTab === "decision" && "Decision Support (IC Memo)"}
                {activeTab === "str" && "STR Underwriting (3 Worlds)"}
                {activeTab === "portfolio" && "Portfolio Analyzer"}
                {activeTab === "history" && "Deal History"}
                {activeTab === "settings" && "Broker Profile"}
              </h1>
            </div>
            <span className="text-xs text-slate-400">{brokerConfig.brokerName} · NMLS {brokerConfig.nmls}</span>
          </div>

          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Deals analyzed", value: auditLogs.filter(l => l.type === "analyze").length, suffix: "", sub: "in your history" },
                    { label: "Avg DSCR", value: auditLogs.filter(l => l.type === "analyze" && l.output?.deal?.dscr).length > 0 ? (auditLogs.filter(l => l.type === "analyze" && l.output?.deal?.dscr).reduce((s, l) => s + (l.output?.deal?.dscr || 0), 0) / auditLogs.filter(l => l.type === "analyze" && l.output?.deal?.dscr).length).toFixed(2) : "—", suffix: "x", sub: "target ≥ 1.0x" },
                    { label: "States researched", value: auditLogs.filter(l => l.type === "state-rules").length, suffix: "", sub: "PPP lookups" },
                    { label: "Engine version", value: "v11", suffix: "", sub: "69 golden tests" },
                  ].map(({ label, value, suffix, sub }) => (
                    <div key={label} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                      <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
                      <p className="text-3xl font-extrabold text-dark-teal font-mono">{value}{suffix}</p>
                      <p className="text-[10px] text-emerald font-semibold mt-1">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-dark-teal text-pistachio p-7 rounded-2xl space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">How the math runs</h3>
                    <p className="text-sm text-pistachio/70 max-w-2xl">Every number here is computed by the Sovereign Engine: dual-track DSCR solver, 19-lender provenance database, breakeven and tornado analysis, and a loan structure optimizer. The LLM is only used to narrate results.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#EEEFD3]/10 pt-5">
                    {[
                      { key: "analyze", icon: <Calculator className="w-4 h-4 text-emerald" />, label: "DSCR Analyzer", desc: "Dual-track solve + PITIA" },
                      { key: "sensitivity", icon: <BarChart2 className="w-4 h-4 text-emerald" />, label: "Sensitivity", desc: "Breakeven + tornado" },
                      { key: "optimize", icon: <Zap className="w-4 h-4 text-emerald" />, label: "Optimizer", desc: "Structure comparison" },
                      { key: "state", icon: <MapPin className="w-4 h-4 text-emerald" />, label: "State PPP", desc: "Prepay legality by state" },
                    ].map(({ key, icon, label, desc }) => (
                      <div key={key} onClick={() => setActiveTab(key as any)}
                        className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10 rounded-xl p-4 space-y-2 transition">
                        {icon}
                        <p className="font-bold text-white text-xs">{label}</p>
                        <p className="text-[11px] text-pistachio/50">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {auditLogs.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <h3 className="font-bold text-dark-teal text-sm mb-3">Recent</h3>
                    <div className="space-y-2">
                      {auditLogs.slice(0, 5).map(log => (
                        <div key={log.id} onClick={() => { setSelectedLog(log); setActiveTab("history"); }}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[var(--color-emerald)] hover:bg-slate-50 cursor-pointer transition">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${log.type === "analyze" ? "bg-emerald" : "bg-yellow-400"}`} />
                            <span className="text-sm font-semibold text-slate-700 truncate max-w-xs">{log.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ANALYZE ── */}
            {activeTab === "analyze" && (
              <motion.div key="analyze" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                  {/* Input form */}
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="font-bold text-dark-teal">Deal Parameters</h2>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Purchase Price", key: "purchasePrice", type: "number" },
                        { label: "Loan Amount", key: "loanAmount", type: "number" },
                        { label: "Monthly Gross Rent", key: "monthlyRent", type: "number" },
                        { label: "FICO Score", key: "ficoScore", type: "number" },
                        { label: "HOA (monthly)", key: "hoa", type: "number" },
                      ].map(({ label, key, type }) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">{label}</label>
                          <input type={type} value={(dealForm as any)[key]}
                            onChange={e => setDealForm(p => ({ ...p, [key]: e.target.value }))}
                            className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition font-mono" />
                        </div>
                      ))}

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">State (2-letter)</label>
                        <input type="text" maxLength={2} value={dealForm.state}
                          onChange={e => setDealForm(p => ({ ...p, state: e.target.value.toUpperCase() }))}
                          className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition font-mono uppercase" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Property Type</label>
                        <select value={dealForm.propertyType} onChange={e => setDealForm(p => ({ ...p, propertyType: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-xs transition">
                          <option value="SFR">SFR</option>
                          <option value="2-4_UNIT">2-4 Unit</option>
                          <option value="CONDO_WARRANTABLE">Condo</option>
                          <option value="CONDO_NON_WARRANTABLE">Non-Warrantable</option>
                          <option value="5+_UNIT">5+ Unit</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Purpose</label>
                        <select value={dealForm.loanPurpose} onChange={e => setDealForm(p => ({ ...p, loanPurpose: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-xs transition">
                          <option value="PURCHASE">Purchase</option>
                          <option value="REFI_RATE_TERM">Rate/Term Refi</option>
                          <option value="CASH_OUT_REFI">Cash-Out Refi</option>
                          <option value="DELAYED_FINANCING">Delayed Financing</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Strategy</label>
                        <select value={dealForm.strategy} onChange={e => setDealForm(p => ({ ...p, strategy: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-xs transition">
                          <option value="LTR">LTR</option>
                          <option value="STR">STR</option>
                          <option value="MTR">MTR</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">LTV: {ltv}% · Rate auto-solved by engine</div>

                    <button onClick={handleAnalyze} disabled={isRunning}
                      className="w-full py-3 bg-dark-teal hover:bg-emerald hover:text-dark-teal text-pistachio font-bold rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-60">
                      {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                      {isRunning ? "Running engine..." : "Analyze Deal"}
                    </button>

                    {!solveResult && !isRunning && (
                      <p className="text-[11px] text-slate-400 text-center">Engine runs solve + sensitivity + optimizer in parallel</p>
                    )}
                  </div>

                  {/* Results */}
                  <div className="lg:col-span-3 space-y-4">
                    {!solveResult && !isRunning && (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                        <Calculator className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-semibold">Enter deal parameters and run analysis.</p>
                        <p className="text-xs mt-1">Dual-track DSCR, PITIA breakdown, rate headroom.</p>
                      </div>
                    )}
                    {isRunning && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-dark-teal" />
                        <p className="text-sm font-bold text-dark-teal">Solving deal...</p>
                      </div>
                    )}

                    {deal && (
                      <>
                        {/* DSCR verdict card */}
                        <div className={`p-6 rounded-2xl border ${dscrBg(deal.dscr)}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className={`text-5xl font-extrabold font-mono ${dscrColor(deal.dscr)}`}>{deal.dscr.toFixed(2)}x</div>
                              <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">DSCR — Track 1</div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl font-bold text-sm border ${dscrBg(deal.dscr)} ${dscrColor(deal.dscr)}`}>
                              {dscrLabel(deal.dscr)}
                            </div>
                          </div>
                          <p className="text-sm opacity-80">{deal.dualTrackDSCR.verdict.summary}</p>
                        </div>

                        {/* Dual-track */}
                        <div className="grid grid-cols-2 gap-3">
                          {[deal.dualTrackDSCR.track1, deal.dualTrackDSCR.track2].map(track => (
                            <div key={track.label} className={`rounded-xl border p-4 ${track.passes ? "bg-emerald/10 border-emerald/20" : "bg-red-50 border-red-200"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-600">{track.label}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${track.passes ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {track.passes ? "PASS" : "FAIL"}
                                </span>
                              </div>
                              <div className={`text-2xl font-extrabold font-mono ${track.passes ? "text-emerald-700" : "text-red-700"}`}>{track.dscr.toFixed(2)}x</div>
                              <div className="text-[11px] text-slate-500 mt-1">Qualifying rent: {fmt$(track.qualifyingRent)}/mo</div>
                            </div>
                          ))}
                        </div>

                        {/* PITIA breakdown */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                          <h4 className="font-bold text-dark-teal text-sm mb-3">PITIA Breakdown</h4>
                          <div className="space-y-2">
                            {[
                              { label: "Principal & Interest", value: deal.monthlyPITIA.principalAndInterest },
                              { label: "Annual Taxes (monthly)", value: deal.monthlyPITIA.taxes },
                              { label: "Insurance (monthly)", value: deal.monthlyPITIA.insurance },
                              ...(deal.monthlyPITIA.hoa > 0 ? [{ label: "HOA", value: deal.monthlyPITIA.hoa }] : []),
                              ...(deal.monthlyPITIA.floodInsurance > 0 ? [{ label: "Flood Insurance", value: deal.monthlyPITIA.floodInsurance }] : []),
                            ].map(({ label, value }) => (
                              <div key={label} className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">{label}</span>
                                <span className="font-mono font-semibold text-slate-700">{fmt$(value)}/mo</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center text-sm font-bold border-t border-slate-100 pt-2 mt-2">
                              <span className="text-dark-teal">Total PITIA</span>
                              <span className="font-mono text-dark-teal text-base">{fmt$(deal.monthlyPITIA.total)}/mo</span>
                            </div>
                          </div>
                        </div>

                        {/* Key metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { label: "Solved Rate", value: fmtPct(deal.solvedRate), sub: deal.tripleRate.dateStamp },
                            { label: "Deal-Break Rate", value: fmtPct(deal.dealBreakRate), sub: "rate where DSCR = 1.0" },
                            { label: "Rate Headroom", value: `${deal.rateHeadroomBps} bps`, sub: deal.rateHeadroomBps > 0 ? "buffer before failure" : "rate too high" },
                            { label: "Loan Amount", value: fmt$(deal.loanAmount), sub: `${ltv}% LTV` },
                            { label: "Debt Yield", value: `${deal.debtYield.toFixed(2)}%`, sub: "NOI / loan amount" },
                            { label: "Cash to Close", value: fmt$(deal.cashToClose.total), sub: "base estimate" },
                          ].map(({ label, value, sub }) => (
                            <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                              <p className="text-[11px] text-slate-400 font-semibold mb-1">{label}</p>
                              <p className="font-bold text-dark-teal font-mono text-base">{value}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                            </div>
                          ))}
                        </div>

                        {/* Top lenders — minimal */}
                        {solveResult.topLenders.length > 0 && (
                          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                            <h4 className="font-bold text-dark-teal text-sm mb-3">Top Matching Lenders</h4>
                            <div className="flex flex-wrap gap-2">
                              {solveResult.topLenders.map((l, i) => (
                                <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                  <span className="font-bold text-dark-teal">{l.name}</span>
                                  <span className="text-slate-400 ml-2">{l.score}/100</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick-nav hints */}
                        {(sensResult || optResult) && (
                          <div className="flex gap-3">
                            {sensResult && (
                              <button onClick={() => setActiveTab("sensitivity")} className="flex-1 py-2.5 bg-slate-100 hover:bg-dark-teal hover:text-white text-dark-teal text-xs font-bold rounded-xl transition border border-slate-200 hover:border-dark-teal">
                                View Sensitivity →
                              </button>
                            )}
                            {optResult && (
                              <button onClick={() => setActiveTab("optimize")} className="flex-1 py-2.5 bg-slate-100 hover:bg-dark-teal hover:text-white text-dark-teal text-xs font-bold rounded-xl transition border border-slate-200 hover:border-dark-teal">
                                View Optimizer →
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SENSITIVITY ── */}
            {activeTab === "sensitivity" && (
              <motion.div key="sensitivity" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {!sensResult ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                    <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">Run DSCR Analyzer first to populate sensitivity data.</p>
                    <button onClick={() => setActiveTab("analyze")} className="mt-4 px-5 py-2 bg-dark-teal text-white text-xs font-bold rounded-xl transition">
                      Go to Analyzer →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Rent breakeven */}
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                        <h4 className="font-bold text-dark-teal text-sm mb-4">Rent Breakeven</h4>
                        <div className="space-y-3">
                          {[
                            { label: "1.0x DSCR (floor)", value: sensResult.sensitivity.rentBreakeven.for1_0, color: "text-lemon-lime" },
                            { label: "1.10x DSCR", value: sensResult.sensitivity.rentBreakeven.for1_10, color: "text-rain-forest" },
                            { label: "1.25x DSCR (strong)", value: sensResult.sensitivity.rentBreakeven.for1_25, color: "text-emerald" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">{label}</span>
                              <span className={`font-mono font-bold text-sm ${color}`}>{fmt$(value)}/mo</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rate breakeven */}
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                        <h4 className="font-bold text-dark-teal text-sm mb-4">Max Rate</h4>
                        <div className="space-y-3">
                          {[
                            { label: "Still qualifies (1.0x)", value: sensResult.sensitivity.rateBreakeven.maxRateFor1_0, color: "text-lemon-lime" },
                            { label: "Comfortable (1.10x)", value: sensResult.sensitivity.rateBreakeven.maxRateFor1_10, color: "text-rain-forest" },
                            { label: "Strong (1.25x)", value: sensResult.sensitivity.rateBreakeven.maxRateFor1_25, color: "text-emerald" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">{label}</span>
                              <span className={`font-mono font-bold text-sm ${color}`}>{fmtPct(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price breakeven */}
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                        <h4 className="font-bold text-dark-teal text-sm mb-4">Max Purchase Price</h4>
                        <div className="space-y-3">
                          {[
                            { label: "1.0x DSCR", value: sensResult.sensitivity.priceBreakeven.for1_0, color: "text-lemon-lime" },
                            { label: "1.10x DSCR", value: sensResult.sensitivity.priceBreakeven.for1_10, color: "text-rain-forest" },
                            { label: "1.25x DSCR", value: sensResult.sensitivity.priceBreakeven.for1_25, color: "text-emerald" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">{label}</span>
                              <span className={`font-mono font-bold text-sm ${color}`}>{fmt$(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* IO / 40yr structure impact */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                      <h4 className="font-bold text-dark-teal text-sm mb-4">Structure Alternatives</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {deal && [
                          { label: "Current (30yr P&I)", dscr: deal.dscr, active: true },
                          { label: "Interest-Only", dscr: sensResult.sensitivity.structureBreakeven.dscrWithIO, active: false },
                          { label: "40yr Amortization", dscr: sensResult.sensitivity.structureBreakeven.dscrWith40yr, active: false },
                          { label: "IO savings/mo", dscr: null, value: fmt$(sensResult.sensitivity.structureBreakeven.monthlySavingsIO), active: false },
                        ].map(({ label, dscr, value, active }) => (
                          <div key={label} className={`rounded-xl p-4 border ${active ? "bg-dark-teal border-dark-teal" : "bg-slate-50 border-slate-200"}`}>
                            <p className={`text-[11px] font-bold mb-1 ${active ? "text-pistachio/70" : "text-slate-500"}`}>{label}</p>
                            {dscr !== null ? (
                              <p className={`text-xl font-extrabold font-mono ${active ? "text-emerald" : dscrColor(dscr!)}`}>
                                {dscr!.toFixed(2)}x
                              </p>
                            ) : (
                              <p className="text-xl font-extrabold font-mono text-emerald">{value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tornado chart */}
                    {sensResult.sensitivity.tornadoData.length > 0 && (
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                        <h4 className="font-bold text-dark-teal text-sm mb-1">DSCR Sensitivity — Tornado</h4>
                        <p className="text-[11px] text-slate-400 mb-4">Which inputs move DSCR the most (ranked by impact)</p>
                        <div className="space-y-2">
                          {sensResult.sensitivity.tornadoData.slice(0, 8).map((item) => {
                            const maxImpact = sensResult.sensitivity.tornadoData[0].impact;
                            const barWidth = Math.max(8, Math.round((item.impact / maxImpact) * 100));
                            return (
                              <div key={item.lever} className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-600 w-36 shrink-0 font-medium">{item.lever}</span>
                                <div className="flex-1 flex items-center gap-1">
                                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <div className="h-full bg-dark-teal rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-500 w-14 text-right shrink-0">
                                    {item.dscrAtLow.toFixed(2)}–{item.dscrAtHigh.toFixed(2)}x
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Joint appraisal risk */}
                    {sensResult.sensitivity.jointAppraisalRisk && (
                      <div className={`rounded-2xl border p-5 ${
                        sensResult.sensitivity.jointAppraisalRisk.combinedRiskRating === "LOW" ? "bg-emerald/10 border-emerald/20" :
                        sensResult.sensitivity.jointAppraisalRisk.combinedRiskRating === "MODERATE" ? "bg-lemon-lime/10 border-lemon-lime/20" :
                        "bg-red-50 border-red-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-dark-teal">Joint Appraisal Risk</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            sensResult.sensitivity.jointAppraisalRisk.combinedRiskRating === "LOW" ? "bg-emerald-100 text-emerald-700" :
                            sensResult.sensitivity.jointAppraisalRisk.combinedRiskRating === "MODERATE" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {sensResult.sensitivity.jointAppraisalRisk.combinedRiskRating}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{sensResult.sensitivity.jointAppraisalRisk.summary}</p>
                        <div className="mt-3 text-xs text-slate-600">
                          Rent breakpoint: <strong>{fmt$(sensResult.sensitivity.jointAppraisalRisk.rentBreakpoint)}/mo</strong> ·
                          Stress test (rent -10% + value -10%): <strong>{sensResult.sensitivity.jointAppraisalRisk.combinedStressTest.stressedDSCR.toFixed(2)}x DSCR</strong>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── OPTIMIZER ── */}
            {activeTab === "optimize" && (
              <motion.div key="optimize" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {!optResult ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                    <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">Run DSCR Analyzer first to generate structure options.</p>
                    <button onClick={() => setActiveTab("analyze")} className="mt-4 px-5 py-2 bg-dark-teal text-white text-xs font-bold rounded-xl transition">
                      Go to Analyzer →
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-500">{optResult.options.length} structures evaluated — sorted by Track 1 DSCR</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...optResult.options].sort((a, b) => b.track1DSCR - a.track1DSCR).map((opt, i) => {
                        const isBest = i === 0;
                        return (
                          <div key={opt.name} className={`rounded-2xl border p-5 space-y-3 ${isBest ? "bg-dark-teal border-dark-teal shadow-lg" : "bg-white border-slate-100 shadow-sm"}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`font-bold text-sm ${isBest ? "text-white" : "text-dark-teal"}`}>{opt.name}</p>
                                {isBest && <span className="text-[10px] bg-emerald text-dark-teal font-bold px-2 py-0.5 rounded mt-1 inline-block">BEST DSCR</span>}
                              </div>
                              <div className={`text-2xl font-extrabold font-mono ${isBest ? "text-emerald" : dscrColor(opt.track1DSCR)}`}>
                                {opt.track1DSCR.toFixed(2)}x
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {[
                                { label: "Rate", value: fmtPct(opt.rate) },
                                { label: "Monthly P&I", value: fmt$(opt.monthlyPayment) },
                                { label: "Monthly Cash Flow", value: `${opt.monthlyCashFlow >= 0 ? "+" : ""}${fmt$(opt.monthlyCashFlow)}` },
                                { label: "Track 2 DSCR", value: `${opt.track2DSCR.toFixed(2)}x` },
                              ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between text-xs">
                                  <span className={isBest ? "text-pistachio/60" : "text-slate-500"}>{label}</span>
                                  <span className={`font-mono font-semibold ${isBest ? "text-pistachio" : "text-slate-700"}`}>{value}</span>
                                </div>
                              ))}
                            </div>
                            {opt.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1 border-t border-current/10">
                                {opt.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isBest ? "bg-white/10 text-pistachio" : "bg-slate-100 text-slate-600"}`}>{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── STATE PPP ── */}
            {activeTab === "state" && (
              <motion.div key="state" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                  <div>
                    <h2 className="font-bold text-dark-teal mb-1">Prepayment Penalty Legality</h2>
                    <p className="text-xs text-slate-500">Engine checks statute database for PPP restrictions, entity rules, and ARM restrictions by state.</p>
                  </div>
                  <div className="flex gap-3">
                    <input type="text" maxLength={2} value={stateInput}
                      onChange={e => setStateInput(e.target.value.toUpperCase())}
                      placeholder="FL"
                      className="w-24 px-4 py-3 bg-slate-50 focus:bg-white border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition font-mono uppercase font-bold" />
                    <button onClick={handleStateRules} disabled={isLoadingState}
                      className="px-6 py-3 bg-dark-teal hover:bg-emerald hover:text-dark-teal text-pistachio font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-60">
                      {isLoadingState ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      Look Up
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["FL", "CA", "TX", "NY", "GA", "IL", "PA", "MN", "KS", "NM"].map(s => (
                      <button key={s} onClick={() => setStateInput(s)}
                        className="text-[11px] px-3 py-1.5 bg-slate-100 hover:bg-dark-teal hover:text-white rounded-lg font-bold transition font-mono">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {stateResult && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className={`p-6 rounded-2xl border ${pppBadgeColor(stateResult.ppp.status)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{stateResult.state} — Prepayment Penalty</h3>
                          <p className="text-xs opacity-70 mt-0.5 font-mono">{stateResult.ppp.status.replace(/_/g, " ")}</p>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1.5 rounded-xl border ${pppBadgeColor(stateResult.ppp.status)}`}>
                          {stateResult.ppp.allowed ? "ALLOWED" : "RESTRICTED"}
                        </span>
                      </div>
                      <p className="text-sm">{stateResult.ppp.reason}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Available prepay options */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="font-bold text-dark-teal text-sm mb-3">Allowed Prepay Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {stateResult.ppp.adjustedOptions.map(opt => (
                            <span key={opt} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">{opt}</span>
                          ))}
                          {stateResult.ppp.adjustedOptions.length === 0 && (
                            <span className="text-xs text-slate-400">No standard PPP options available in this state</span>
                          )}
                        </div>
                      </div>

                      {/* Cost of no PPP */}
                      {!stateResult.ppp.allowed && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                          <h4 className="font-bold text-orange-700 text-sm mb-3">No-PPP Cost Premium</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-orange-600">Rate premium</span>
                              <span className="font-mono font-bold text-orange-800">+{fmtPct(stateResult.ppp.noPPPPremiumRate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-orange-600">Fee premium</span>
                              <span className="font-mono font-bold text-orange-800">+{(stateResult.ppp.noPPPPremiumFee * 100).toFixed(3)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Entity notes */}
                      {stateResult.ppp.requiresEntityVesting && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                          <h4 className="font-bold text-blue-700 text-sm mb-2">Entity Requirement</h4>
                          <p className="text-sm text-blue-600">{stateResult.ppp.entityNote}</p>
                        </div>
                      )}
                    </div>

                    {stateResult.ppp.legalWarning && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{stateResult.ppp.legalWarning}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── HISTORY ── */}
            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {auditLogs.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No deal history yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      {auditLogs.map(log => (
                        <div key={log.id} onClick={() => setSelectedLog(log)}
                          className={`bg-white border rounded-2xl p-4 cursor-pointer transition shadow-sm ${selectedLog?.id === log.id ? "border-[var(--color-emerald)] shadow-md" : "border-slate-100 hover:border-slate-200"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${log.type === "analyze" ? "bg-emerald" : "bg-yellow-400"}`} />
                              <p className="text-sm font-semibold text-slate-700 truncate">{log.title}</p>
                            </div>
                            <button onClick={e => deleteLog(log.id!, e)} className="p-1 hover:text-red-500 text-slate-300 transition shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.type === "analyze" ? "bg-emerald/15 text-dark-teal" : "bg-yellow-50 text-lemon-lime"}`}>
                              {log.type === "analyze" ? "DSCR Deal" : "State PPP"}
                            </span>
                            <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedLog && (
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 overflow-auto max-h-[600px]">
                        <h3 className="font-bold text-dark-teal text-sm mb-1">{selectedLog.title}</h3>
                        <p className="text-[10px] text-slate-400 mb-3">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                        <pre className="text-xs bg-slate-50 rounded-xl p-4 overflow-auto text-slate-600 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── REFI TRACKER ── */}
            {activeTab === "refi" && (
              <motion.div key="refi" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <RefiTrackerPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── ARM RESET ── */}
            {activeTab === "arm" && (
              <motion.div key="arm" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ARMPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── MONTE CARLO ── */}
            {activeTab === "montecarlo" && (
              <motion.div key="montecarlo" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <MonteCarloPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── RETURNS ── */}
            {activeTab === "returns" && (
              <motion.div key="returns" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ReturnsPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── TAX ENGINE ── */}
            {activeTab === "tax" && (
              <motion.div key="tax" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TaxEnginePage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── STRESS MATRIX ── */}
            {activeTab === "stress" && (
              <motion.div key="stress" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <StressMatrixPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── DECISION SUPPORT ── */}
            {activeTab === "decision" && (
              <motion.div key="decision" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <DecisionSupportPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── STR UNDERWRITING ── */}
            {activeTab === "str" && (
              <motion.div key="str" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <STRUnderwritingPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── PORTFOLIO ── */}
            {activeTab === "portfolio" && (
              <motion.div key="portfolio" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <PortfolioPage onBack={() => setActiveTab("dashboard")} onNavigate={() => setActiveTab("dashboard")} />
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 max-w-xl">
                  <h2 className="font-bold text-dark-teal text-lg mb-6">Broker Profile</h2>
                  <form onSubmit={saveBrokerConfig} className="space-y-4">
                    {[
                      { key: "brokerName", label: "Broker / Company Name" },
                      { key: "nmls", label: "NMLS License Number" },
                      { key: "licenseType", label: "License Type" },
                      { key: "primaryMarket", label: "Primary Markets (States)" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">{label}</label>
                        <input type="text" value={(brokerConfig as any)[key]}
                          onChange={e => setBrokerConfig(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition" />
                      </div>
                    ))}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Default Disclaimer</label>
                      <textarea rows={3} value={brokerConfig.autoDisclaimer}
                        onChange={e => setBrokerConfig(p => ({ ...p, autoDisclaimer: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-transparent focus:border-[var(--color-emerald)] rounded-xl outline-none text-sm transition resize-none" />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-dark-teal hover:bg-emerald hover:text-dark-teal text-pistachio font-bold rounded-xl transition shadow">
                      {brokerSaved ? "✓ Saved" : "Save Profile"}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
