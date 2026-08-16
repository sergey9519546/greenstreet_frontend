import React, { useState } from "react";
import { dc, Mono, H2, Lead } from "../design/dc";
import { radius } from "../theme";

export default function DSCRInvestorMindsetSection({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"tiers" | "rent" | "reserves" | "tax" | "checklist">("tiers");

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      window.location.href = "/" + view;
    }
  };

  return (
    <section
      style={{
        background: "#003738", // Deep midnight green
        color: dc.cream,
        padding: "clamp(60px, 8vw, 110px) clamp(1.5rem, 4vw, 3rem)",
        borderTop: "1px solid rgba(238, 239, 211, 0.12)",
        borderBottom: "1px solid rgba(238, 239, 211, 0.12)",
      }}
      id="investor-mindset-section"
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: dc.lemon,
              marginBottom: 12,
            }}
          >
            The DSCR Investor Underwriting Standard
          </div>
          <H2 style={{ color: dc.cream, fontSize: "clamp(24px, 4.5vw, 56px)", marginBottom: 16, lineHeight: 1.05 }}>
            Everything a DSCR Investor Needs to Know
          </H2>
          <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "66ch", margin: "0 auto" }}>
            No W-2s, no personal tax returns, and zero DTI calculations. Underwrite deals strictly on property rental coverage, credit score, reserves, and LLC vesting.
          </Lead>
        </div>

        {/* 5 Master Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          {[
            { id: "tiers", label: "1. Coverage Tiers & LTV" },
            { id: "rent", label: "2. Qualifying Rent Rules" },
            { id: "reserves", label: "3. Reserve Assets & FICO" },
            { id: "tax", label: "4. Cost Seg & Tax Edge" },
            { id: "checklist", label: "5. Closing Document Checklist" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 20px",
                  borderRadius: radius.sm,
                  background: isActive ? dc.lemon : "rgba(238, 239, 211, 0.06)",
                  color: isActive ? dc.dark : "rgba(238, 239, 211, 0.85)",
                  border: isActive ? `1px solid ${dc.lemon}` : "1px solid rgba(238, 239, 211, 0.16)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: dc.sans,
                  minHeight: 44,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Panel */}
        <div
          style={{
            background: "rgba(0, 55, 56, 0.65)",
            borderRadius: radius.lg,
            border: "1px solid rgba(238, 239, 211, 0.16)",
            padding: "clamp(24px, 4vw, 44px)",
          }}
        >
          {/* TAB 1: COVERAGE TIERS & LTV */}
          {activeTab === "tiers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 6 }}>
                  DSCR Underwriting & Dual-Track Science
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: dc.cream, margin: "0 0 10px" }}>
                  How Coverage Ratio Dictates Your Rate & Max LTV
                </h3>
                <p style={{ fontSize: 15, color: "rgba(238,239,211,0.8)", margin: "0 0 16px", lineHeight: 1.6 }}>
                  Greenstreet underwrites every deal on <strong>Dual-Track DSCR Science</strong>. Track 1 measures <strong>Lender Approval Qualification</strong> (Gross Rent ÷ PITIA). Track 2 measures <strong>Real Investor Net Cash Flow</strong> (factoring 8% vacancy, 8% property management, maintenance reserves, and property tax reassessments).
                </p>
              </div>

              {/* Dual Track Callout Box */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(0,37,38,0.7)", padding: "18px 20px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: dc.emerald, textTransform: "uppercase", marginBottom: 4 }}>
                    Track 1: Lender Qualification DSCR
                  </div>
                  <Mono style={{ fontSize: 16, fontWeight: 700, color: dc.cream }}>
                    Qualifying Rent ÷ PITIA
                  </Mono>
                  <div style={{ fontSize: 12, color: "rgba(238,239,211,0.65)", marginTop: 4 }}>
                    Lower of Signed Lease or Form 1007 Appraisal. Determines loan approval, max LTV, and pricing tier.
                  </div>
                </div>

                <div style={{ borderLeft: "1px solid rgba(238,239,211,0.12)", paddingLeft: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 4 }}>
                    Track 2: Investor Net Survival DSCR
                  </div>
                  <Mono style={{ fontSize: 16, fontWeight: 700, color: dc.cream }}>
                    (Rent × 92% - Mgmt - Maintenance) ÷ PITIA
                  </Mono>
                  <div style={{ fontSize: 12, color: "rgba(238,239,211,0.65)", marginTop: 4 }}>
                    Protects your balance sheet against negative cash carry (-$334/mo Godmode warning if Track 1 passes but Track 2 is negative).
                  </div>
                </div>
              </div>

              {/* Tiers Comparison Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(238,239,211,0.2)", color: dc.lemon }}>
                      <th style={{ padding: "12px 16px" }}>Coverage Floor</th>
                      <th style={{ padding: "12px 16px" }}>Purchase LTV</th>
                      <th style={{ padding: "12px 16px" }}>Refi LTV</th>
                      <th style={{ padding: "12px 16px" }}>Min FICO</th>
                      <th style={{ padding: "12px 16px" }}>PITIA Reserves</th>
                      <th style={{ padding: "12px 16px" }}>Pricing Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(238,239,211,0.1)", background: "rgba(35, 138, 117, 0.12)" }}>
                      <td style={{ padding: "16px", fontWeight: 700, color: dc.emerald }}>
                        1.25x+ (Strong Coverage)
                      </td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream, fontWeight: 700 }}>Up to 80%</Mono></td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream }}>Up to 75%</Mono></td>
                      <td style={{ padding: "16px" }}>660+</td>
                      <td style={{ padding: "16px" }}>3 Months</td>
                      <td style={{ padding: "16px", color: dc.emerald, fontWeight: 600 }}>Best Par Pricing (-0.25% Rate)</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(238,239,211,0.1)" }}>
                      <td style={{ padding: "16px", fontWeight: 700, color: dc.lemon }}>
                        1.00x – 1.24x (Standard Floor)
                      </td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream, fontWeight: 700 }}>Up to 75%</Mono></td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream }}>Up to 70%</Mono></td>
                      <td style={{ padding: "16px" }}>680+</td>
                      <td style={{ padding: "16px" }}>6 Months</td>
                      <td style={{ padding: "16px", color: dc.cream }}>Standard Par Rate</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(238,239,211,0.1)", background: "rgba(238,239,211,0.03)" }}>
                      <td style={{ padding: "16px", fontWeight: 700, color: "#e88a8a" }}>
                        0.75x – 0.99x (Low-Ratio)
                      </td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream, fontWeight: 700 }}>Up to 70%</Mono></td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream }}>Up to 65%</Mono></td>
                      <td style={{ padding: "16px" }}>700+</td>
                      <td style={{ padding: "16px" }}>6–12 Months</td>
                      <td style={{ padding: "16px", color: "#e88a8a" }}>+0.375% Rate Adjustment</td>
                    </tr>
                    <tr style={{ background: "rgba(238,239,211,0.06)" }}>
                      <td style={{ padding: "16px", fontWeight: 700, color: "#e88a8a" }}>
                        No-Ratio (&lt; 0.75x or Vacant)
                      </td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream, fontWeight: 700 }}>Up to 65%</Mono></td>
                      <td style={{ padding: "16px" }}><Mono style={{ color: dc.cream }}>Up to 60%</Mono></td>
                      <td style={{ padding: "16px" }}>720+</td>
                      <td style={{ padding: "16px" }}>12 Months</td>
                      <td style={{ padding: "16px", color: "#e88a8a" }}>+0.625% Rate Adjustment</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: QUALIFYING RENT RULES */}
          {activeTab === "rent" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 6 }}>
                  Income Verification Standards
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: dc.cream, margin: "0 0 10px" }}>
                  3 Ways to Document Property Rental Income
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div style={{ background: "rgba(0,37,38,0.7)", padding: "20px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: dc.emerald, textTransform: "uppercase", marginBottom: 8 }}>Option A: Active Lease</div>
                  <h4 style={{ fontSize: 18, color: dc.cream, margin: "0 0 8px" }}>Signed Lease + Proof of Rent</h4>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.75)", lineHeight: 1.5 }}>
                    Used for currently occupied properties. Requires active lease agreement + 2 months proof of bank deposit or property management ledger. Rent used is lower of lease or Form 1007 appraisal.
                  </p>
                </div>

                <div style={{ background: "rgba(0,37,38,0.7)", padding: "20px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 8 }}>Option B: Vacant / Form 1007</div>
                  <h4 style={{ fontSize: 18, color: dc.cream, margin: "0 0 8px" }}>Appraisal Market Rent Schedule</h4>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.75)", lineHeight: 1.5 }}>
                    Perfect for new acquisitions, turn-key flips, or under-rented units. The independent appraiser completes FNMA Form 1007 (Single Family) or Form 1025 (2-4 Units) to establish fair market rent. No lease needed.
                  </p>
                </div>

                <div style={{ background: "rgba(0,37,38,0.7)", padding: "20px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: dc.rain, textTransform: "uppercase", marginBottom: 8 }}>Option C: STR / Airbnb</div>
                  <h4 style={{ fontSize: 18, color: dc.cream, margin: "0 0 8px" }}>AirDNA / Rabbu Projected</h4>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.75)", lineHeight: 1.5 }}>
                    For short-term vacation rentals. Qualify on 50th-percentile projected revenue from AirDNA or Rabbu (with 20% haircut) OR 100% of 12-month platform actual payouts from Airbnb/VRBO account history.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESERVE ASSETS & FICO */}
          {activeTab === "reserves" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 6 }}>
                  Liquidity & Credit Criteria
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: dc.cream, margin: "0 0 10px" }}>
                  Accepted Liquid Reserve Assets & Credit Rules
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "rgba(0,37,38,0.7)", padding: "22px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: dc.lemon, marginBottom: 12 }}>
                    Accepted Reserve Assets (Valuation Haircuts)
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10, fontSize: 13, color: "rgba(238,239,211,0.8)" }}>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Bank Checking / Savings / Money Market</span>
                      <Mono style={{ color: dc.emerald, fontWeight: 700 }}>100% Value</Mono>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Public Stocks / Mutual Funds / ETFs</span>
                      <Mono style={{ color: dc.emerald, fontWeight: 700 }}>80% Value</Mono>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Vested 401(k) / Traditional & Roth IRA</span>
                      <Mono style={{ color: dc.lemon, fontWeight: 700 }}>70% Value</Mono>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Business Operating Accounts (LLC)</span>
                      <Mono style={{ color: dc.emerald, fontWeight: 700 }}>100% Value (if 100% owner)</Mono>
                    </li>
                  </ul>
                </div>

                <div style={{ background: "rgba(0,37,38,0.7)", padding: "22px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: dc.emerald, marginBottom: 12 }}>
                    Credit & Housing History Requirements
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10, fontSize: 13, color: "rgba(238,239,211,0.8)" }}>
                    <li><strong>Minimum FICO Score:</strong> 660 mid-score for 80% LTV; 620 for 70% LTV.</li>
                    <li><strong>Housing History:</strong> 0x30x12 (no 30-day late mortgage payments in past 12 months).</li>
                    <li><strong>Major Derogatory Events:</strong> 24–36 months seasoning required for Bankruptcy, Short Sale, or Foreclosure.</li>
                    <li><strong>First-Time Investors:</strong> Accepted on SFR properties with 0x30x24 primary housing history.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COST SEG & TAX EDGE */}
          {activeTab === "tax" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 6 }}>
                  Tax & Depreciation Strategy
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: dc.cream, margin: "0 0 10px" }}>
                  OBBBA 100% Cost Segregation Tax Shelter
                </h3>
              </div>

              <div style={{ background: "rgba(0,37,38,0.7)", padding: "24px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                <p style={{ fontSize: 15, color: "rgba(238,239,211,0.85)", lineHeight: 1.6, margin: "0 0 16px" }}>
                  When acquiring rental property using DSCR loans, combining <strong>LLC Vesting</strong> with an engineering-based <strong>Cost Segregation Study</strong> allows real estate investors to reclassify 20–30% of the building purchase price into 5-year, 7-year, and 15-year personal property and site improvements.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div style={{ background: "rgba(238,239,211,0.05)", padding: "16px", borderRadius: radius.sm }}>
                    <div style={{ fontSize: 12, color: dc.lemon, fontWeight: 700, textTransform: "uppercase" }}>5-Year Property</div>
                    <div style={{ fontSize: 13, color: dc.cream, marginTop: 4 }}>Appliances, carpeting, cabinetry, trade fixtures</div>
                  </div>
                  <div style={{ background: "rgba(238,239,211,0.05)", padding: "16px", borderRadius: radius.sm }}>
                    <div style={{ fontSize: 12, color: dc.emerald, fontWeight: 700, textTransform: "uppercase" }}>15-Year Property</div>
                    <div style={{ fontSize: 13, color: dc.cream, marginTop: 4 }}>Landscaping, paving, fencing, exterior lighting</div>
                  </div>
                  <div style={{ background: "rgba(238,239,211,0.05)", padding: "16px", borderRadius: radius.sm }}>
                    <div style={{ fontSize: 12, color: dc.rain, fontWeight: 700, textTransform: "uppercase" }}>Year-1 Bonus Write-Off</div>
                    <div style={{ fontSize: 13, color: dc.cream, marginTop: 4 }}>Claim 100% Year-1 OBBBA deduction to shelter cash flow</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLOSING CHECKLIST */}
          {activeTab === "checklist" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 6 }}>
                  Speed To Close
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: dc.cream, margin: "0 0 10px" }}>
                  The 5-Item DSCR Borrower Closing Package
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                  { num: "01", title: "Purchase Contract / Deed", desc: "Fully executed purchase agreement or existing title deed for refinance." },
                  { num: "02", title: "Lease or Form 1007", desc: "Current tenant lease + rent deposit proof OR request Form 1007 appraisal." },
                  { num: "03", title: "LLC Entity Docs", desc: "Articles of Organization, Operating Agreement, and IRS EIN Assignment letter." },
                  { num: "04", title: "2 Months Bank Statements", desc: "Bank statements showing down payment funds and required PITIA reserve liquid balances." },
                  { num: "05", title: "ID & Hazard Insurance", desc: "Government photo ID + hazard/flood insurance quote naming lender as loss payee." },
                ].map((item) => (
                  <div key={item.num} style={{ background: "rgba(0,37,38,0.7)", padding: "18px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                    <Mono style={{ fontSize: 22, fontWeight: 700, color: dc.lemon, display: "block", marginBottom: 6 }}>{item.num}</Mono>
                    <div style={{ fontSize: 15, fontWeight: 700, color: dc.cream, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(238,239,211,0.75)", lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Conversion Footer */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid rgba(238,239,211,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: dc.cream }}>
                Want to run your property's rent through the DSCR underwriter?
              </div>
              <div style={{ fontSize: 13, color: "rgba(238,239,211,0.65)" }}>
                Get an instant coverage ratio, monthly payment schedule, and program match in 60 seconds.
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleNavigate("dscr-calculator")}
                style={{
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 700,
                  fontSize: 14,
                  padding: "12px 22px",
                  borderRadius: radius.sm,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: dc.sans,
                  minHeight: 44,
                }}
              >
                Run DSCR Scenario Tool →
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("rate-quiz")}
                style={{
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 14,
                  padding: "11px 20px",
                  borderRadius: radius.sm,
                  border: "1px solid rgba(238,239,211,0.3)",
                  cursor: "pointer",
                  fontFamily: dc.sans,
                  minHeight: 44,
                }}
              >
                Rate & Tier Intelligence Quiz →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
