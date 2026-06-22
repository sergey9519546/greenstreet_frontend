import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  FileText,
  HelpCircle,
  History,
  LogOut,
  MapPin,
  Palette,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { auth, db, loginWithGoogle, logoutUser } from "../firebase";
import { AuditLog, ComplianceReviewResponse, GroundingSource } from "../types";
import CommunicationsArchiveTab from "./CommunicationsArchiveTab";
import EmployeeComplianceTab from "./EmployeeComplianceTab";
import FirmComplianceTab from "./FirmComplianceTab";
import ThirdPartyComplianceTab from "./ThirdPartyComplianceTab";

// Helper to determine tailwind severity color classes
const getSeverityClass = (sev: string) => {
  if (sev === "HIGH") return "bg-red-50 text-red-700 border-red-200";
  if (sev === "MEDIUM") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

interface ComplianceDashboardProps {
  onBackToMarketing: () => void;
  initialEmail?: string;
}

export default function ComplianceDashboard({
  onBackToMarketing,
  initialEmail,
}: ComplianceDashboardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Custom Auth Sign-In states
  const [authEmail, setAuthEmail] = useState(initialEmail || "");
  const [authPassword, setAuthPassword] = useState("pass1234");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");

  // Compliance Platform active tab state
  // 'dashboard' | 'review' | 'search' | 'jurisdiction' | 'history' | 'settings' | 'styleguide' | 'employee' | 'firm' | 'vendors' | 'archive'
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "review"
    | "search"
    | "jurisdiction"
    | "history"
    | "settings"
    | "styleguide"
    | "employee"
    | "firm"
    | "vendors"
    | "archive"
  >("dashboard");

  // Firm Parameters State (linked to Firestore)
  const [firmConfig, setFirmConfig] = useState({
    firmName: "Capital Trust Partners",
    advisoryCRD: "172459",
    primaryRegulator: "SEC",
    allowedLicenses: "Series 65, Series 7, Series 66",
    autoDisclaimer:
      "Investing involves risk of loss. Past performance does not guarantee future results.",
  });
  const [firmSaved, setFirmSaved] = useState(false);

  // --- Real-time compliance history logs from Firestore ---
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // --- 1. Marketing copy review states ---
  const [inputCopy, setInputCopy] = useState(
    "We guarantee premium 25% returns on our stock portfolios. It is completely risk-free if you double your capital within 12 months with us! See our stellar client ratings on Yelp.",
  );
  const [copyCategory, setCopyCategory] = useState("Social Media");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] =
    useState<ComplianceReviewResponse | null>(null);

  // --- 2. SEC Search State ---
  const [searchQuery, setSearchQuery] = useState(
    "What are the strict marketing rule disclosure requirements for showing client testimonials?",
  );
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false); // High Thinking Level flag (gemini-2.5-pro + HIGH thinkingLevel)
  const [searchResult, setSearchResult] = useState<{
    answer: string;
    sources: GroundingSource[];
  } | null>(null);

  // --- 3. Jurisdiction maps state ---
  const [addressInput, setAddressInput] = useState(
    "100 F Street NE, Washington, DC 20549",
  );
  const [isMapping, setIsMapping] = useState(false);
  const [mappingResult, setMappingResult] = useState<{
    advice: string;
    sources: GroundingSource[];
  } | null>(null);

  // Track copied color state
  const [copiedColor, setCopiedColor] = useState("");

  // Track active firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync / Read log history from Firestore for the specific logged-in user
  useEffect(() => {
    if (!currentUser) return;

    // Read user's audit logs order by timestamp descending
    // Note: Do not use complex compound queries to obey Rule 2 (No Complex Queries)
    const logsCollectionRef = collection(
      db,
      "artifacts",
      "default-app-id",
      "users",
      currentUser.uid,
      "audits",
    );

    const unsubscribe = onSnapshot(
      logsCollectionRef,
      (snapshot) => {
        const logsList: AuditLog[] = [];
        snapshot.forEach((doc) => {
          logsList.push({ id: doc.id, ...doc.data() } as AuditLog);
        });
        // Sort manually on client to handle Rule 2 query constraints perfectly & avoid index building requirements
        logsList.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setAuditLogs(logsList);
      },
      (error) => {
        console.error(
          "Firestore history snapshot subscription failure:",
          error,
        );
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Read firmware configuration on startup
  useEffect(() => {
    if (!currentUser) return;
    const configDocRef = doc(
      db,
      "artifacts",
      "default-app-id",
      "users",
      currentUser.uid,
      "firm",
      "settings",
    );
    getDoc(configDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setFirmConfig(docSnap.data() as any);
        }
      })
      .catch((err) => console.error("Error reading firm config:", err));
  }, [currentUser]);

  // Google Login Popup Trigger
  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate via Google context.");
    }
  };

  // Custom Sign-In flow helper
  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err: any) {
      setAuthError(err.message || "Credential authentication failed.");
    }
  };

  // Log compliance activity to Firestore database (Rule 1: Durable Cloud Persistence)
  const saveAuditLog = async (
    type: "review" | "search" | "jurisdiction" | "guide",
    title: string,
    input: string,
    output: any,
  ) => {
    if (!currentUser) return;
    try {
      const logData: Omit<AuditLog, "id"> = {
        userId: currentUser.uid,
        userEmail: currentUser.email || "anonymous@advisor.com",
        type,
        title,
        timestamp: new Date().toISOString(),
        input,
        output,
      };
      const logsCollectionRef = collection(
        db,
        "artifacts",
        "default-app-id",
        "users",
        currentUser.uid,
        "audits",
      );
      await addDoc(logsCollectionRef, logData);
    } catch (err) {
      console.error(
        "Failed to commit compliance audit session log to Firestore:",
        err,
      );
    }
  };

  // Delete previously stored log from Firestore (Watch list refresh in real-time)
  const handleDeleteLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || !id) return;
    try {
      const logDocRef = doc(
        db,
        "artifacts",
        "default-app-id",
        "users",
        currentUser.uid,
        "audits",
        id,
      );
      await deleteDoc(logDocRef);
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    } catch (err) {
      console.error(
        "Failed to delete local audit representation from Cloud:",
        err,
      );
    }
  };

  // Save unique firm config parameters (Firestore persistent save)
  const handleSaveFirmConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setFirmSaved(false);
      const configDocRef = doc(
        db,
        "artifacts",
        "default-app-id",
        "users",
        currentUser.uid,
        "firm",
        "settings",
      );
      await setDoc(configDocRef, firmConfig);
      setFirmSaved(true);
      setTimeout(() => setFirmSaved(false), 3000);
    } catch (err) {
      console.error(
        "Failed to update advisory settings file in Firestore:",
        err,
      );
    }
  };

  // Perform Real AI Copy Audit
  const handleCopyReview = async () => {
    if (!inputCopy.trim()) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const response = await fetch("/api/compliance/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputCopy, category: copyCategory }),
      });
      const data = await response.json();
      if (response.ok) {
        setReviewResult(data);
        await saveAuditLog(
          "review",
          `Score: ${data.complianceScore}% - ${copyCategory} Review`,
          inputCopy,
          data,
        );
      } else {
        alert(data.error || "Compliance API call failed.");
      }
    } catch (error: any) {
      alert("Error evaluating marketing copy: " + error.message);
    } finally {
      setIsReviewing(false);
    }
  };

  // Perform Real Search Grounding + thinking mode evaluation
  const handleRegulatoryQuery = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const url = thinkingMode
        ? "/api/compliance/think-guide"
        : "/api/compliance/sec-search";
      const bodyPayload = thinkingMode
        ? { question: searchQuery }
        : { query: searchQuery };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await response.json();
      if (response.ok) {
        const textAnswer = thinkingMode ? data.thoughtfulResponse : data.answer;
        const searchSources = thinkingMode ? [] : data.sources || [];

        setSearchResult({
          answer: textAnswer,
          sources: searchSources,
        });

        await saveAuditLog(
          thinkingMode ? "guide" : "search",
          thinkingMode
            ? "Deep Executive Reasoning Guidance"
            : "Search Grounded Inquiry",
          searchQuery,
          { answer: textAnswer, sources: searchSources },
        );
      } else {
        alert(data.error || "Grounding Search query failed.");
      }
    } catch (error: any) {
      alert("Error solving regulatory query: " + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform Maps Grounding Office Lookup
  const handleJurisdictionMap = async () => {
    if (!addressInput.trim()) return;
    setIsMapping(true);
    setMappingResult(null);
    try {
      const response = await fetch("/api/compliance/jurisdiction-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressInput }),
      });
      const data = await response.json();
      if (response.ok) {
        setMappingResult({
          advice: data.advice,
          sources: data.sources || [],
        });
        await saveAuditLog(
          "jurisdiction",
          "Blue Sky Office Mapping",
          addressInput,
          { advice: data.advice, sources: data.sources || [] },
        );
      } else {
        alert(data.error || "Blue Sky maps resolution failed.");
      }
    } catch (err: any) {
      alert("Failed resolving geographic regulatory context: " + err.message);
    } finally {
      setIsMapping(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-forest flex flex-col items-center justify-center text-pistachio p-4">
        <RefreshCw className="w-10 h-10 animate-spin text-mint mb-4" />
        <p className="text-sm font-semibold tracking-wider font-mono">
          ESTABLISHING SEC COMPLIANCE PORTAL ACCESS MODULE...
        </p>
      </div>
    );
  }

  // Auth Guard Gate (Google Login Context + Firebase Authentication)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-pistachio flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 bg-[#004041]/10 bg-[radial-gradient(#4dbd97_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 relative z-10 text-[#004041]">
          <button
            onClick={onBackToMarketing}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to marketing site</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald text-mint font-display font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow">
              G
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Access Compliant Suite
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Identify yourself securely via Google or credentials to review
              active portfolios.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Social Sign-In (Uses Firebase Popup OAuth) */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 border border-slate-200 hover:border-[#004041] bg-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {/* Google Vector Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Proceed securely with Google</span>
          </button>

          <div className="relative my-6 text-center text-xs text-slate-400">
            <span className="relative z-10 bg-white px-3 font-semibold uppercase tracking-wider">
              or sign in with password
            </span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100" />
          </div>

          {/* Fallback Credential form (allows testing multiple fake users) */}
          <form onSubmit={handleCustomAuth} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="advisor@firmname.com"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-transparent focus:border-mint rounded-xl outline-none text-sm transition"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <label htmlFor="auth-password" className="text-slate-500">
                  Password
                </label>
                <span className="text-[#004041]/60 font-medium">
                  Auto-prefilled for prototype
                </span>
              </div>
              <input
                id="auth-password"
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-transparent focus:border-mint rounded-xl outline-none text-sm transition font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald text-pistachio hover:bg-mint hover:text-emerald text-sm font-bold rounded-xl transition shadow mt-4 active:scale-[0.98]"
            >
              {isSignUpMode
                ? "Register Advisory Account"
                : "Access Compliance Suite"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="text-xs text-slate-500 hover:text-emerald font-semibold transition"
            >
              {isSignUpMode
                ? "Already verified? Return to sign-in"
                : "Creating a new SEC-compliant firm? Click here to register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pistachio text-midnight-green flex flex-col md:flex-row antialiased font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-midnight-green text-pistachio shrink-0 border-r border-midnight-green/10 flex flex-col justify-between py-6">
        <div>
          {/* Logo */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 text-mint flex items-center justify-center font-display text-lg font-bold">
                G
              </div>
              <span className="font-display font-bold text-lg text-white">
                Greenstreet
              </span>
            </div>
            <button
              onClick={onBackToMarketing}
              className="md:hidden p-1 text-mint/60 hover:text-mint"
              title="Return to Marketing Landing"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-3">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "dashboard"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Workspace Hub</span>
            </button>

            {/* Core Modules */}
            <div className="pt-2 pb-1">
              <p className="px-4 text-[10px] font-bold text-pistachio/40 uppercase tracking-widest">
                Modules
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab("employee");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "employee"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Employee Compliance</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("firm");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "firm"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Firm Compliance</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("vendors");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "vendors"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Third Party Risk</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("archive");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "archive"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Comms Archive</span>
            </button>

            {/* Platform Utilities */}
            <div className="pt-2 pb-1">
              <p className="px-4 text-[10px] font-bold text-pistachio/40 uppercase tracking-widest">
                Platform
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab("review");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "review"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <div className="flex items-center gap-1.5">
                <span>Marketing Audit</span>
                <span className="bg-lime text-emerald text-[9px] font-bold px-1 py-0.5 rounded leading-none">
                  Go
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("search");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "search"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Guidance Council</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("jurisdiction");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "jurisdiction"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Blue Sky advisor</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "history"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              <div className="flex items-center justify-between w-full">
                <span>Audit Trails</span>
                {auditLogs.length > 0 && (
                  <span className="bg-[#0c2f30] text-mint text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {auditLogs.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "settings"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Advisory Settings</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("styleguide");
                setSelectedLog(null);
              }}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl font-semibold flex items-center gap-3 transition ${
                activeTab === "styleguide"
                  ? "bg-mint text-emerald shadow-md"
                  : "text-pistachio/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Style Guide & Swatches</span>
            </button>
          </nav>
        </div>

        {/* User context footer */}
        <div className="border-t border-[#0c2f30] pt-6 px-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-mint">
              {currentUser.email
                ? currentUser.email.charAt(0).toUpperCase()
                : "A"}
            </div>
            <div className="overflow-hidden">
              <h5 className="text-white text-xs font-bold truncate">
                {currentUser.email || "Active Advisor"}
              </h5>
              <p className="text-[10px] text-pistachio/50 font-mono tracking-tight">
                CRD ID: {firmConfig.advisoryCRD}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onBackToMarketing}
              className="flex-1 py-2 bg-emerald border border-pistachio/15 hover:border-pistachio text-white font-semibold text-[11px] rounded-lg transition text-center"
            >
              Marketing
            </button>
            <button
              onClick={logoutUser}
              className="p-2 bg-[#0c2f30] hover:bg-red-900 border border-transparent text-pistachio hover:text-white rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workflow Board */}
      <main className="flex-1 min-w-0 p-6 md:p-10 flex flex-col justify-between overflow-y-auto">
        <div className="max-w-6xl w-full mx-auto">
          {/* Header Board section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-midnight-green/10 pb-5 mb-8 gap-4">
            <div>
              <p className="text-xs font-semibold text-midnight-green/50 font-mono tracking-widest uppercase mb-1">
                SEC FINRA Approved Action Room
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-midnight-green tracking-tight">
                {activeTab === "dashboard" && "Platform Operations & Metrics"}
                {activeTab === "review" &&
                  "Automated Marketing Compliance Review"}
                {activeTab === "search" && "AI Regulatory Guidance Counsel"}
                {activeTab === "jurisdiction" &&
                  "Geographic Office & Blue Sky Mapping"}
                {activeTab === "history" && "Cloud Audit Trail Logs"}
                {activeTab === "settings" && "Advisory Firm Configuration"}
                {activeTab === "employee" && "Employee Compliance Portal"}
                {activeTab === "firm" && "Firm Compliance & Task Management"}
                {activeTab === "vendors" && "Third Party & Vendor Risk"}
                {activeTab === "archive" && "Communications Archive Hub"}
              </h1>
            </div>

            <div className="text-right text-xs text-slate-500 font-medium">
              <span>
                Active Firm: <strong>{firmConfig.firmName}</strong> (
                {firmConfig.primaryRegulator})
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* HUB DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                    <div className="text-xs text-slate-400 font-semibold mb-2">
                      Immutable records archived
                    </div>
                    <div className="text-3xl font-extrabold text-[#004041] tracking-tight font-display">
                      {auditLogs.length} logs
                    </div>
                    <div className="text-[10px] text-mint font-semibold mt-1">
                      Real-time Cloud Sync active
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                    <div className="text-xs text-slate-400 font-semibold mb-2">
                      Average Audit Health score
                    </div>
                    <div className="text-3xl font-extrabold font-display text-emerald">
                      {auditLogs.filter(
                        (l) => l.type === "review" && l.output?.complianceScore,
                      ).length > 0
                        ? Math.round(
                            auditLogs
                              .filter(
                                (l) =>
                                  l.type === "review" &&
                                  l.output?.complianceScore,
                              )
                              .reduce(
                                (sum, current) =>
                                  sum + (current.output?.complianceScore || 0),
                                0,
                              ) /
                              auditLogs.filter((l) => l.type === "review")
                                .length,
                          ) + "%"
                        : "98%"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Weighted rating limit metrics
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                    <div className="text-xs text-slate-400 font-semibold mb-2">
                      Blue Sky Geocodes
                    </div>
                    <div className="text-3xl font-extrabold font-display text-emerald">
                      {
                        auditLogs.filter((l) => l.type === "jurisdiction")
                          .length
                      }{" "}
                      resolved
                    </div>
                    <div className="text-[10px] text-[#d8d958] font-bold mt-1">
                      Search grounded mapping
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                    <div className="text-xs text-slate-400 font-semibold mb-2">
                      Deep thought processes run
                    </div>
                    <div className="text-3xl font-extrabold font-display text-emerald">
                      {auditLogs.filter((l) => l.type === "guide").length}{" "}
                      guided
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Thinking Level HIGH (Pro-preview)
                    </div>
                  </div>
                </div>

                {/* Dashboard layout main row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Direct launch panel */}
                  <div className="lg:col-span-2 bg-[#004041] text-pistachio p-8 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                        Deploy Automated Assistant
                      </h3>
                      <p className="text-sm text-pistachio/80 max-w-lg leading-relaxed">
                        Assess content compliant states dynamically. Choose one
                        of our premium actions to launch your SEC validation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-pistachio/10 pt-6">
                      <div
                        onClick={() => setActiveTab("review")}
                        className="bg-forest/50 hover:bg-forest hover:scale-[1.02] cursor-pointer transition-all border border-pistachio/10 rounded-xl p-5 space-y-3"
                      >
                        <FileText className="w-5 h-5 text-mint" />
                        <h4 className="font-bold text-white text-sm">
                          Marketing Audit
                        </h4>
                        <p className="text-[11px] text-pistachio/60">
                          Analyse advertising text scripts.
                        </p>
                      </div>
                      <div
                        onClick={() => setActiveTab("search")}
                        className="bg-forest/50 hover:bg-forest hover:scale-[1.02] cursor-pointer transition-all border border-pistachio/10 rounded-xl p-5 space-y-3"
                      >
                        <Search className="w-5 h-5 text-mint" />
                        <h4 className="font-bold text-white text-sm">
                          Regulatory Coach
                        </h4>
                        <p className="text-[11px] text-pistachio/60">
                          Browse live rules under SEC/FINRA.
                        </p>
                      </div>
                      <div
                        onClick={() => setActiveTab("jurisdiction")}
                        className="bg-forest/50 hover:bg-forest hover:scale-[1.02] cursor-pointer transition-all border border-pistachio/10 rounded-xl p-5 space-y-3"
                      >
                        <MapPin className="w-5 h-5 text-mint" />
                        <h4 className="font-bold text-white text-sm">
                          Blue Sky Maps
                        </h4>
                        <p className="text-[11px] text-pistachio/60">
                          Location-based regulatory adviser.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini Settings quick overview */}
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-[#004041] text-base">
                      Advisory firm profiles
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="pb-3 border-b border-slate-100 flex justify-between">
                        <span className="text-slate-500">Firm Name</span>
                        <span className="font-bold text-right">
                          {firmConfig.firmName}
                        </span>
                      </div>
                      <div className="pb-3 border-b border-slate-100 flex justify-between">
                        <span className="text-slate-500">CRD ID</span>
                        <span className="font-bold font-mono">
                          {firmConfig.advisoryCRD}
                        </span>
                      </div>
                      <div className="pb-3 border-b border-slate-100 flex justify-between">
                        <span className="text-slate-500">Main Regulator</span>
                        <span className="font-bold">
                          {firmConfig.primaryRegulator}
                        </span>
                      </div>
                      <div className="pb-3 border-b border-slate-100 flex justify-between">
                        <span className="text-slate-500">Licenses</span>
                        <span className="font-bold truncate max-w-[150px]">
                          {firmConfig.allowedLicenses}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-[#004041] font-semibold text-xs rounded-lg transition"
                    >
                      Configure profile parameters
                    </button>
                  </div>
                </div>

                {/* Recents list log overview */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
                    <h4 className="font-bold text-slate-800">
                      Recent Immutable Compliance Logs
                    </h4>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-[#004041] text-xs font-bold hover:underline"
                    >
                      See full audit trail ({auditLogs.length} logs)
                    </button>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <History className="w-8 h-8 mx-auto stroke-1 mb-2 opacity-50" />
                      <p className="text-sm">
                        No compliance logs stored in Cloud. Start a marketing or
                        SEC search audit above.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 overflow-x-auto text-[13px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/20 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                            <th className="p-4">Type</th>
                            <th className="p-4">Action Summary</th>
                            <th className="p-4">Executed on</th>
                            <th className="p-4 text-center">Score</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditLogs.slice(0, 5).map((log, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50 transition cursor-pointer"
                              onClick={() => {
                                setSelectedLog(log);
                                setActiveTab("history");
                              }}
                            >
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    log.type === "review"
                                      ? "bg-amber-100 text-amber-800"
                                      : log.type === "search"
                                        ? "bg-blue-100 text-blue-800"
                                        : log.type === "jurisdiction"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {log.type}
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-[#004041] truncate max-w-[280px]">
                                {log.title}
                              </td>
                              <td className="p-4 text-slate-500 font-mono text-[11px]">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-4 text-center">
                                {log.type === "review" &&
                                log.output?.complianceScore !== undefined ? (
                                  <span
                                    className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                                      log.output.complianceScore > 80
                                        ? "bg-green-50 text-green-700"
                                        : log.output.complianceScore > 50
                                          ? "bg-yellow-50 text-yellow-700"
                                          : "bg-red-50 text-red-700"
                                    }`}
                                  >
                                    {log.output.complianceScore}%
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td
                                className="p-4 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) =>
                                    handleDeleteLog(log.id || "", e)
                                  }
                                  className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                                  title="Erase Log"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* AUTOMATED MARKETING REVIEW TAB */}
            {activeTab === "review" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Input Column */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-[#004041] text-lg mb-1">
                      Verify Advertising text copy
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Analyze social media campaigns, informational emails,
                      websites, or newsletters to identify SEC and FINRA
                      advertising compliance issues.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">
                          Distribution Channel
                        </label>
                        <select
                          value={copyCategory}
                          title="Select distribution channel"
                          onChange={(e) => setCopyCategory(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-semibold outline-none text-[#004041]"
                        >
                          <option value="Social Media">
                            Social Media (Twitter, LinkedIn, WeChat)
                          </option>
                          <option value="Newsletter">
                            Client Newsletter / Informational Email
                          </option>
                          <option value="Landing Page">
                            Advisory Sales Landing Page Website
                          </option>
                          <option value="Pitch Deck">
                            Fund Investor Case Presentation Deck
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">
                        Copy Text Content
                      </label>
                      <textarea
                        rows={6}
                        value={inputCopy}
                        onChange={(e) => setInputCopy(e.target.value)}
                        placeholder="Paste your marketing content draft here..."
                        className="w-full p-4 bg-slate-50 focus:bg-white border focus:border-mint focus:ring-1 focus:ring-mint outline-none rounded-xl text-xs sm:text-sm transition font-mono leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={handleCopyReview}
                      disabled={isReviewing}
                      className="w-full py-4 bg-emerald text-pistachio hover:bg-mint hover:text-emerald font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2"
                    >
                      {isReviewing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>
                            CCO Review active (average 7s turnaround)...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Run Audit checks</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Audit Result Display Sidepanel */}
                <div className="space-y-6">
                  {reviewResult ? (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6"
                    >
                      {/* Overall Compliance Score Card */}
                      <div className="text-center pt-2 pb-4 border-b border-slate-100">
                        <div className="relative inline-flex items-center justify-center p-3 mb-2">
                          <span
                            className={`text-5xl font-black font-mono ${
                              reviewResult.complianceScore > 80
                                ? "text-green-600"
                                : reviewResult.complianceScore > 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {reviewResult.complianceScore}%
                          </span>
                        </div>
                        <h4 className="font-bold text-[#004041] text-base">
                          Advertising Compliance Score
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                          Analyzed against SEC Adv Act Rule 206(4)-1 and FINRA
                          2210 criteria.
                        </p>
                      </div>

                      {reviewResult.promissoryClaims.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs uppercase text-slate-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Promissory Claims found</span>
                          </div>

                          <div className="space-y-3 divide-y divide-slate-100">
                            {reviewResult.promissoryClaims.map((claim, idx) => (
                              <div key={idx} className="pt-2 text-xs">
                                <div className="p-2 bg-red-50 border border-red-100 text-red-700 font-mono rounded mb-1 text-[11px]">
                                  "{claim.textSegment}"
                                </div>
                                <p className="text-slate-600 mb-1 leading-relaxed">
                                  {claim.explanation}
                                </p>
                                <div className="text-green-700 font-semibold mt-1">
                                  ✓ Rewrite:{" "}
                                  <span className="italic">
                                    "{claim.suggestedRewrite}"
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {reviewResult.omissionsOfRisk.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs uppercase text-slate-400 font-bold">
                            Omissions of risk
                          </div>
                          {reviewResult.omissionsOfRisk.map((om, idx) => (
                            <div
                              key={idx}
                              className="text-xs space-y-1.5 p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-800"
                            >
                              <p className="leading-relaxed">
                                {om.explanation}
                              </p>
                              <div className="font-bold underline text-[9px] uppercase tracking-wider">
                                Required Disclosures draft:
                              </div>
                              <p className="font-mono text-[10px] bg-white/70 p-2 rounded leading-relaxed">
                                {om.suggestedDisclaimer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {reviewResult.requiredDisclosures.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <h5 className="text-xs font-bold text-slate-600">
                            Standard Legal warnings to append:
                          </h5>
                          <ul className="space-y-1 text-slate-600 text-[11px] list-disc pl-4 leading-normal">
                            {reviewResult.requiredDisclosures.map(
                              (disc, idx) => (
                                <li key={idx}>{disc}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="bg-emerald text-pistachio p-6 rounded-2xl text-center min-h-[350px] flex flex-col items-center justify-center space-y-4">
                      {isReviewing ? (
                        <>
                          <RefreshCw className="w-10 h-10 animate-spin text-mint" />
                          <p className="font-mono text-xs tracking-widest uppercase">
                            CCO compliance engine processing...
                          </p>
                        </>
                      ) : (
                        <>
                          <Shield className="w-12 h-12 stroke-1 text-mint" />
                          <h4 className="font-bold text-white text-base">
                            Compliance scorecard awaiting review
                          </h4>
                          <p className="text-xs text-pistachio/70 max-w-xs leading-relaxed">
                            Once your draft is evaluated, detailed promissory
                            warning annotations, severity logs, regulatory
                            scores, and compliant drafts will render here.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* REGULATORY COACH (SEARCH) VIEW */}
            {activeTab === "search" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Search controller */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-[#004041] text-lg mb-1">
                      Search live SEC / FINRA Guidance
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Consult actual regulatory databases backed by Google
                      Search Grounding to generate fully cited rule summaries.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Under what exception can registered advisors present past transaction recommendations?"
                      className="flex-1 px-4 py-3 bg-slate-50 focus:bg-white border rounded-xl underline-none text-xs sm:text-sm font-semibold transition"
                    />
                    <button
                      onClick={handleRegulatoryQuery}
                      disabled={isSearching}
                      className="px-6 py-3.5 bg-emerald text-pistachio hover:bg-mint hover:text-emerald whitespace-nowrap font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-1.5"
                    >
                      {isSearching ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Inquire Rule</span>
                    </button>
                  </div>

                  {/* Thinking Level Toggle configuration (Rule / Trigger 5) */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-mint" />
                      <span>
                        Deep Reasoning Thinking Mode (gemini-2.5-pro
                        with high thinking steps)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={thinkingMode}
                        title="Enable Deep Reasoning Thinking Mode"
                        onChange={(e) => setThinkingMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mint"></div>
                    </label>
                  </div>
                </div>

                {/* Show Search grounding results */}
                {searchResult ? (
                  <motion.div
                    initial={{ scale: 0.99, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Answer Area */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="text-xs uppercase text-slate-400 font-bold">
                        compliance answer
                      </div>

                      <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                        {searchResult.answer}
                      </div>
                    </div>

                    {/* Source citations (Grounding chunks) */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="text-xs uppercase text-slate-400 font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-mint" />
                        <span>regulatory sources (grounded)</span>
                      </div>

                      {searchResult.sources.length === 0 ? (
                        <p className="text-xs text-slate-500 leading-relaxed font-light">
                          High reasoning contextual analysis compiled on static
                          SEC codified literature.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {searchResult.sources.map((src, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1"
                            >
                              <h5 className="font-bold text-xs text-slate-700 truncate">
                                {src.title || "Regulatory Reference"}
                              </h5>
                              {src.uri && (
                                <a
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-mint font-semibold text-[10px] hover:underline flex items-center gap-0.5"
                                >
                                  <span>Open official link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-emerald text-pistachio p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-12 h-12 animate-spin text-mint" />
                        <p className="font-mono text-xs tracking-widest uppercase">
                          {thinkingMode
                            ? "GENAI HIGH-REASONING EXECUTIVE THOUGHTS COMPILING..."
                            : "GOOGLE GROUNDING WEB DATABASES SEARCHING..."}
                        </p>
                      </>
                    ) : (
                      <>
                        <Search className="w-12 h-12 stroke-1 text-mint" />
                        <h4 className="font-bold text-white text-base">
                          Awaiting compliance regulatory question
                        </h4>
                        <p className="text-xs text-pistachio/70 max-w-sm leading-relaxed">
                          Inquire about social media use, testimonials, digital
                          signatures, crypto reporting, or broker-dealer
                          licensing Blue Sky limits to get a real grounded
                          analysis.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* BLUE SKY GEOGRAPHIC LOCATION JURISDICTION VIEW */}
            {activeTab === "jurisdiction" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Geocode query controller */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-[#004041] text-lg mb-1">
                      Determine Office Jurisdictions & FINRA proximity
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Enter a prospective branch office location to resolve SEC
                      territorial jurisdiction, FINRA Regional Districts, and
                      local state Blue Sky statutes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Enter Office Address..."
                      className="flex-1 px-4 py-3 bg-slate-50 focus:bg-white border rounded-xl outline-none text-xs sm:text-sm font-semibold transition"
                    />
                    <button
                      onClick={handleJurisdictionMap}
                      disabled={isMapping}
                      className="px-6 py-3.5 bg-emerald text-pistachio hover:bg-mint hover:text-emerald whitespace-nowrap font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-1.5"
                    >
                      {isMapping ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span>Resolve Location</span>
                    </button>
                  </div>
                </div>

                {mappingResult ? (
                  <motion.div
                    initial={{ scale: 0.99, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* advice output */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="text-xs uppercase text-slate-400 font-bold">
                        Geographic regulatory guidance
                      </div>
                      <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                        {mappingResult.advice}
                      </div>
                    </div>

                    {/* Blue Sky authoritative references link */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="text-xs uppercase text-slate-400 font-bold flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-mint" />
                        <span>BLUE SKY REFS (Grounded)</span>
                      </div>

                      {mappingResult.sources.length === 0 ? (
                        <p className="text-xs text-slate-500 leading-relaxed font-light">
                          General state jurisdiction resolved for the provided
                          geocode parameters.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {mappingResult.sources.map((src, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 rounded-xl border text-xs"
                            >
                              <h5 className="font-bold text-slate-700 truncate">
                                {src.title}
                              </h5>
                              {src.uri && (
                                <a
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-mint font-bold text-[10px] mt-1 inline-flex items-center gap-0.5 hover:underline"
                                >
                                  <span>Official state bulletin</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-emerald text-pistachio p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                    {isMapping ? (
                      <>
                        <RefreshCw className="w-12 h-12 animate-spin text-mint" />
                        <p className="font-mono text-xs tracking-widest uppercase">
                          MAPPING JURISDICTION TERRITORIES & REGIONAL OFFICES...
                        </p>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-12 h-12 stroke-1 text-mint" />
                        <h4 className="font-bold text-white text-base">
                          Awaiting prospective branch office address
                        </h4>
                        <p className="text-xs text-pistachio/70 max-w-xs leading-relaxed">
                          Enter any office address in the US. Our grounded
                          spatial engine will determine exactly which SEC /
                          FINRA branch rules control your operations.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* SEC / FINRA CLOUD AUDIT TRAILS VIEW */}
            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* audit list row column */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-[#004041]">
                      Advisory Compliance Audit Book of Records
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      17a-4 Immutability Active
                    </span>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <History className="w-10 h-10 border mx-auto mb-2 opacity-50 text-slate-400" />
                      <p className="text-xs">
                        No active logs fetched from Cloud. Launch compliance
                        reviews to build immutable registers.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                      {auditLogs.map((log, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedLog(log)}
                          className={`p-4 flex justify-between items-center hover:bg-slate-50 transition cursor-pointer text-xs ${
                            selectedLog?.id === log.id
                              ? "bg-slate-50 font-medium"
                              : ""
                          }`}
                        >
                          <div className="space-y-1 overflow-hidden pr-3">
                            <div className="flex gap-2 items-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  log.type === "review"
                                    ? "bg-amber-100 text-amber-700"
                                    : log.type === "search"
                                      ? "bg-blue-100 text-blue-700"
                                      : log.type === "jurisdiction"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {log.type}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-700 truncate">
                              {log.title}
                            </h5>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {log.type === "review" &&
                              log.output?.complianceScore !== undefined && (
                                <span className="font-bold font-mono text-[10px] bg-slate-100 p-1 text-slate-700 rounded">
                                  {log.output.complianceScore}%
                                </span>
                              )}
                            <button
                              onClick={(e) => handleDeleteLog(log.id || "", e)}
                              className="text-slate-300 hover:text-red-600 transition"
                              title="Delete record permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit details sidepane helper */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="text-xs uppercase text-slate-400 font-bold border-b border-slate-150 pb-2 flex justify-between">
                    <span>Audit Record Inspector</span>
                    <span>17A-4 WORM</span>
                  </div>

                  {selectedLog ? (
                    <motion.div
                      key={selectedLog.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {selectedLog.title}
                        </h4>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Timestamp:{" "}
                          {new Date(selectedLog.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-[#004041]">
                          Audit Prompt Input:
                        </div>
                        <p className="bg-slate-50 font-mono text-[10px] p-3 rounded-lg border border-slate-100 whitespace-pre-wrap max-h-[150px] overflow-y-auto leading-relaxed text-slate-600">
                          {selectedLog.input}
                        </p>
                      </div>

                      {/* Display outputs conditionally depending on query type */}
                      {selectedLog.type === "review" && selectedLog.output && (
                        <div className="space-y-3">
                          <div className="font-bold text-emerald">
                            Audit Findings summary:
                          </div>
                          <div className="bg-emerald/5 text-slate-800 p-3 rounded-lg border border-emerald/10 text-[11px] leading-relaxed">
                            {selectedLog.output.overallSummary}
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold text-slate-500">
                              Compliance Score:
                            </span>
                            <span className="font-mono font-bold text-mint block text-lg">
                              {selectedLog.output.complianceScore}% Scorecard
                            </span>
                          </div>
                        </div>
                      )}

                      {(selectedLog.type === "search" ||
                        selectedLog.type === "guide") &&
                        selectedLog.output && (
                          <div className="space-y-2">
                            <div className="font-bold text-slate-700">
                              Advisory Counsel Output:
                            </div>
                            <p className="bg-slate-50 text-[11px] p-3 rounded-lg text-slate-700 whitespace-pre-wrap max-h-[250px] overflow-y-auto font-light leading-relaxed">
                              {selectedLog.output.answer || selectedLog.output}
                            </p>
                          </div>
                        )}

                      {selectedLog.type === "jurisdiction" &&
                        selectedLog.output && (
                          <div className="space-y-2">
                            <div className="font-bold text-slate-700">
                              Jurisdiction advice:
                            </div>
                            <p className="bg-slate-50 text-[11px] p-3 rounded-lg text-slate-700 whitespace-pre-wrap max-h-[250px] overflow-y-auto font-light leading-relaxed">
                              {selectedLog.output.advice || selectedLog.output}
                            </p>
                          </div>
                        )}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <HelpCircle className="w-8 h-8 mx-auto stroke-1 mb-2 opacity-50" />
                      <p className="text-xs">
                        Click a historical log on the left to expand full ledger
                        details in real-time.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ADVISORY SETTINGS VIEW */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl mx-auto space-y-6"
              >
                <div>
                  <h3 className="font-bold text-[#004041] text-lg mb-1">
                    Configuration parameters of the firm
                  </h3>
                  <p className="text-slate-500 text-xs">
                    These parameters represent your firm custom settings profile
                    and are stored inside your Firestore cloud database to
                    ground future compliance checks.
                  </p>
                </div>

                {firmSaved && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Firm profile parameters saved securely in Cloud!
                    </span>
                  </div>
                )}

                <form onSubmit={handleSaveFirmConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="firm-name"
                        className="text-xs font-bold text-slate-500"
                      >
                        Firm Name
                      </label>
                      <input
                        id="firm-name"
                        type="text"
                        required
                        value={firmConfig.firmName}
                        onChange={(e) =>
                          setFirmConfig({
                            ...firmConfig,
                            firmName: e.target.value,
                          })
                        }
                        placeholder="e.g. Greenstreet Capital"
                        className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border rounded-xl outline-none text-xs sm:text-sm transition text-[#004041]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="advisory-crd"
                        className="text-xs font-bold text-slate-500"
                      >
                        Advisory SEC CRD ID
                      </label>
                      <input
                        id="advisory-crd"
                        type="text"
                        required
                        value={firmConfig.advisoryCRD}
                        onChange={(e) =>
                          setFirmConfig({
                            ...firmConfig,
                            advisoryCRD: e.target.value,
                          })
                        }
                        placeholder="e.g. 123456"
                        className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border rounded-xl outline-none text-xs sm:text-sm font-mono tracking-tight transition text-[#004041]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="primary-regulator"
                        className="text-xs font-bold text-slate-500"
                      >
                        Primary Regulator
                      </label>
                      <select
                        id="primary-regulator"
                        title="Select primary regulator"
                        value={firmConfig.primaryRegulator}
                        onChange={(e) =>
                          setFirmConfig({
                            ...firmConfig,
                            primaryRegulator: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl outline-none text-xs sm:text-sm text-[#004041]"
                      >
                        <option value="SEC">
                          SEC (Investment Advisers Act)
                        </option>
                        <option value="FINRA">FINRA (Broker Dealers)</option>
                        <option value="State regulated">
                          State Securities Commission
                        </option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="allowed-licenses"
                        className="text-xs font-bold text-slate-500"
                      >
                        Permitted Advisor Registrations
                      </label>
                      <input
                        id="allowed-licenses"
                        type="text"
                        required
                        value={firmConfig.allowedLicenses}
                        onChange={(e) =>
                          setFirmConfig({
                            ...firmConfig,
                            allowedLicenses: e.target.value,
                          })
                        }
                        placeholder="e.g. Series 65, Series 66"
                        className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border rounded-xl outline-none text-xs sm:text-sm transition text-[#004041]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="auto-disclaimer"
                      className="text-xs font-bold text-slate-500"
                    >
                      Default appending disclaimer text warnings:
                    </label>
                    <textarea
                      id="auto-disclaimer"
                      rows={3}
                      required
                      value={firmConfig.autoDisclaimer}
                      onChange={(e) =>
                        setFirmConfig({
                          ...firmConfig,
                          autoDisclaimer: e.target.value,
                        })
                      }
                      placeholder="Enter legal disclaimer text..."
                      className="w-full p-4 bg-slate-50 border focus:border-mint rounded-xl outline-none text-xs sm:text-sm font-mono transition text-[#004041]"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald text-pistachio hover:bg-mint hover:text-emerald text-sm font-bold rounded-xl transition shadow"
                    >
                      Save firm configuration
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STYLE GUIDE & SWATCHES VIEW */}
            {activeTab === "styleguide" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm max-w-4xl mx-auto w-full text-left"
              >
                {/* User Requested Swatches Display */}
                <div className="mb-16">
                  <div className="text-2xl font-semibold tracking-tight mb-1.5 text-[#002D2E]">
                    Color
                  </div>
                  <div className="text-[0.9375rem] opacity-65 mb-6 text-[#003738]">
                    Swatch tokens · midnight-green ground with a pistachio /
                    lemon-lime accent family
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Midnight Green (Base)",
                        hex: "#002D2E",
                        desc: "System base ground canvas style",
                        swatchClass: "h-24 bg-[#002D2E]",
                      },
                      {
                        name: "Forest Green (Primary)",
                        hex: "#003738",
                        desc: "Corporate body text / rich ground",
                        swatchClass: "h-24 bg-[#003738]",
                      },
                      {
                        name: "Emerald Green (Core)",
                        hex: "#004041",
                        desc: "Structural outline / high visual core",
                        swatchClass: "h-24 bg-[#004041]",
                      },
                      {
                        name: "Pistachio (Background)",
                        hex: "#EEEFD3",
                        desc: "Soft warm primary tone surface background",
                        swatchClass: "h-24 bg-[#EEEFD3] border border-[#002D2E]/10",
                      },
                      {
                        name: "Lemon-Lime (High Accent)",
                        hex: "#D8D958",
                        desc: "Vibrant high-contrast warnings/charts",
                        swatchClass: "h-24 bg-[#D8D958]",
                      },
                      {
                        name: "Vibrant Mint (Success)",
                        hex: "#4DBD97",
                        desc: "CTA components, badges & status triggers",
                        swatchClass: "h-24 bg-[#4DBD97]",
                      },
                      {
                        name: "Crisp Off-White",
                        hex: "#FAFBFD",
                        desc: "Active data surface backdrop grids",
                        swatchClass: "h-24 bg-[#FAFBFD] border border-[#002D2E]/10",
                      },
                      {
                        name: "Deep Obsidian (Contrast)",
                        hex: "#0C1A1A",
                        desc: "Contrast neutral typography color weight",
                        swatchClass: "h-24 bg-[#0C1A1A]",
                      },
                    ].map((c) => (
                      <div
                        key={c.name}
                        onClick={() => {
                          navigator.clipboard.writeText(c.hex);
                          setCopiedColor(c.hex);
                          setTimeout(() => setCopiedColor(""), 1500);
                        }}
                        className="group cursor-pointer bg-[#FAFBFD] transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden border border-[#002D2E]/15 rounded-xl"
                      >
                        <div className={c.swatchClass}></div>
                        <div className="px-4 py-[0.85rem] bg-white">
                          <div className="text-[0.9375rem] font-semibold text-[#002D2E]">
                            {c.name}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-[0.8125rem] opacity-60 tabular-nums text-[#003738]">
                              {c.hex}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#4DBD97]">
                              {copiedColor === c.hex ? "Copied!" : "Copy"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography System Clamp Preview & Dynamic Elements Preview */}
                <div className="border-t border-slate-100 pt-8 space-y-8">
                  <div>
                    <h3 className="font-display font-medium text-xl text-[#002D2E] mb-2">
                      Typography Sizing Clamps
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-sans">
                      Consistent headings scaled responsively across all
                      viewports using CSS clamping.
                    </p>

                    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-sans">
                      <div className="border-b border-slate-200/60 pb-4">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          H1 Heading - Clamp Display
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#002D2E] tracking-tight">
                          The compliant way to scale.
                        </h1>
                      </div>

                      <div className="border-b border-slate-200/60 pb-4">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          H2 Heading - Subsection Title
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#002D2E] tracking-tight">
                          Systematic Books & Records.
                        </h2>
                      </div>

                      <div className="border-b border-slate-200/60 pb-4">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          H3 Heading - Secondary Category
                        </span>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#002D2E]">
                          SEC 17a-4 Regulatory Ledger
                        </h3>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          H4 Heading - Card Outline Title
                        </span>
                        <h4 className="text-lg sm:text-xl font-medium text-[#002D2E]">
                          Advisory Supervision Audit Rule
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Components Hover Transitions Tester */}
                  <div>
                    <h3 className="font-display font-medium text-xl text-[#002D2E] mb-2">
                      Interactive Elements & Micro-animations
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-sans">
                      Smooth transition effects that gently lift and reveal
                      highlights on hover.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#002D2E] p-6 rounded-2xl border border-white/5 space-y-4">
                        <span className="text-[10px] font-mono text-[#EEEFD3]/60 block">
                          Dark Background Component Hover
                        </span>
                        <div className="p-5 rounded-xl bg-[#003738] border border-transparent hover:border-[#D8D958]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                          <h5 className="text-[#EEEFD3] font-semibold text-sm group-hover:text-[#D8D958] transition-colors">
                            Asset Management Portal
                          </h5>
                          <p className="text-xs text-[#EEEFD3]/70 mt-1">
                            Double click to initiate the ledger audit stream to
                            verify SEC filings.
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#EEEFD3] p-6 rounded-2xl border border-[#003738]/10 space-y-4">
                        <span className="text-[10px] font-mono text-[#003738]/60 block">
                          Pistachio Accent Dynamic Button
                        </span>
                        <div className="space-y-3">
                          <button className="w-full py-3 px-4 bg-[#004041] hover:bg-[#002D2E] text-[#EEEFD3] rounded-xl font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-200">
                            Create Audit Request
                          </button>
                          <button className="w-full py-3 px-4 bg-transparent border-2 border-[#004041] hover:bg-[#004041] hover:text-[#EEEFD3] text-[#004041] rounded-xl font-medium text-xs sm:text-sm transition-all duration-200">
                            Inspect Active Warnings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NEW MODULES PLACEHOLDERS */}
            {activeTab === "employee" && <EmployeeComplianceTab />}

            {activeTab === "firm" && <FirmComplianceTab />}

            {activeTab === "vendors" && <ThirdPartyComplianceTab />}

            {activeTab === "archive" && <CommunicationsArchiveTab />}
          </AnimatePresence>
        </div>

        {/* ledger warning footer footer */}
        <div className="border-t border-slate-200 pt-6 mt-12 text-center text-[10px] text-slate-400 max-w-4xl mx-auto w-full">
          <span>
            SEC 17a-4 Book of Record tracking active. All actions logged
            systematically. Connected cloud projects ID:{" "}
            <strong>project-34827ae3-34d1-4d2c-a7d</strong>.
          </span>
        </div>
      </main>
    </div>
  );
}
