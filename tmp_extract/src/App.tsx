import React, { useState, useEffect } from "react";
import MarketingSite from "./components/MarketingSite";
import ComplianceDashboard from "./components/ComplianceDashboard";

export default function App() {
  const [view, setView] = useState<"marketing" | "portal">("marketing");
  const [passedEmail, setPassedEmail] = useState("");

  useEffect(() => {
    // Keep original background creamish color across both views
    document.body.style.backgroundColor = "#EEEFD3";
    if (view === "marketing") {
      document.body.style.color = "#003738"; // Forest brand text color
    } else {
      document.body.style.color = "#002D2E"; // Rich dark green text color
    }
  }, [view]);

  const handleLoginClick = () => {
    setView("portal");
  };

  const handleGetStarted = (email: string) => {
    setPassedEmail(email);
    setView("portal");
  };

  return (
    <div className="font-sans antialiased text-slate-800">
      {view === "marketing" ? (
        <MarketingSite 
          onLoginClick={handleLoginClick} 
          onGetStartedClick={handleGetStarted} 
        />
      ) : (
        <ComplianceDashboard 
          onBackToMarketing={() => setView("marketing")} 
          initialEmail={passedEmail}
        />
      )}
    </div>
  );
}
