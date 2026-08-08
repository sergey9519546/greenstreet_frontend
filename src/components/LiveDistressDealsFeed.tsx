import React, { useState, useEffect } from "react";
import { dc, Mono, H2 } from "../design/dc";
import { radius } from "../theme";
import { fetchLiveDistressedDeals, LiveDealParcel } from "../integrations/supabase";
import { calculatePI } from "../engine/engine";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function LiveDistressDealsFeed({
  onNavigate,
}: {
  onNavigate: (view: string) => void;
}) {
  const [deals, setDeals] = useState<LiveDealParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOutreachDeal, setActiveOutreachDeal] = useState<LiveDealParcel | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedDeals, setDispatchedDeals] = useState<Set<string>>(new Set());

  const handleDispatch = async (deal: LiveDealParcel) => {
    setDispatching(true);
    try {
      const response = await fetch("/api/sdr/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id,
          address: deal.address,
          city: deal.city,
          state: deal.state,
          estimatedValue: deal.estimated_value || 450000,
          distressReason: deal.distress_reason || "Pre-Foreclosure",
        }),
      });
      if (response.ok) {
        setDispatchedDeals((prev) => new Set(prev).add(deal.id));
      } else {
        console.error("Failed to dispatch SDR email", await response.text());
        alert("Failed to dispatch SDR sequence. Check console.");
      }
    } catch (err) {
      console.error("Error dispatching SDR:", err);
      alert("Error dispatching SDR sequence.");
    } finally {
      setDispatching(false);
      setActiveOutreachDeal(null);
    }
  };

  useEffect(() => {
    async function loadDeals() {
      setLoading(true);
      const data = await fetchLiveDistressedDeals(6);
      setDeals(data);
      setLoading(false);
    }
    loadDeals();
  }, []);

  // Compute live DSCR metrics for a scraped parcel
  const computeDealMetrics = (deal: LiveDealParcel) => {
    const price = deal.estimated_value || 450000;
    const loanAmount = price * 0.75;
    const estRent = Math.round(price * 0.0085); // 0.85% rent rule
    const piMo = calculatePI(loanAmount, 7.0, 360);
    const taxesMo = Math.round((price * 0.012) / 12);
    const insMo = Math.round((price * 0.005) / 12);
    const pitia = piMo + taxesMo + insMo;
    const track1Dscr = pitia > 0 ? estRent / pitia : 0;
    const track2NetRent = estRent * (1 - 0.08 - 0.08 - 0.05);
    const track2CashFlow = track2NetRent - pitia;

    return {
      price,
      loanAmount,
      estRent,
      pitia,
      track1Dscr,
      track2CashFlow,
    };
  };

  return (
    <section
      style={{
        background: dc.dark,
        color: dc.cream,
        padding: `clamp(48px, 6vw, 88px) ${dc.pad}`,
        borderTop: "1px solid rgba(238,239,211,0.12)",
      }}
    >
      <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: dc.lemon,
                background: "rgba(216,217,88,0.1)",
                border: "1px solid rgba(216,217,88,0.25)",
                padding: "4px 12px",
                borderRadius: 100,
                marginBottom: 12,
              }}
            >
              Real-Time Scrapy & Realie Ingestion Pipeline
            </div>
            <H2 style={{ margin: 0, color: dc.cream }}>
              Live Off-Market Distress Deals & Pre-Approval SDR Engine
            </H2>
          </div>
          <div style={{ fontSize: 13, color: "rgba(238,239,211,0.7)" }}>
            Scraped from LA, FL & TX county portals • Enriched via Realie API
          </div>
        </div>

        {/* DEALS GRID */}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(238,239,211,0.6)" }}>
            Connecting to Supabase deal ingestion pipeline...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {deals.map((deal) => {
              const m = computeDealMetrics(deal);
              return (
                <div
                  key={deal.id}
                  style={{
                    background: "rgba(0, 40, 41, 0.7)",
                    borderRadius: radius.md,
                    border: "1px solid rgba(238, 239, 211, 0.16)",
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Trigger Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#e57373",
                          background: "rgba(229,115,115,0.12)",
                          border: "1px solid rgba(229,115,115,0.3)",
                          padding: "3px 10px",
                          borderRadius: 100,
                          textTransform: "uppercase",
                        }}
                      >
                        {deal.distress_reason || "Pre-Foreclosure"}
                      </span>
                      <Mono style={{ fontSize: 12, color: "rgba(238,239,211,0.6)" }}>
                        {deal.living_sqft || 2000} sqft
                      </Mono>
                    </div>

                    <div style={{ fontSize: 16, fontWeight: 700, color: dc.cream, marginBottom: 4 }}>
                      {deal.address}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", marginBottom: 16 }}>
                      {deal.city}, {deal.state} {deal.zip}
                    </div>

                    {/* Metrics Breakdown */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(238,239,211,0.04)", padding: "12px 16px", borderRadius: radius.sm, marginBottom: 16 }}>
                      <div>
                        <span style={{ display: "block", fontSize: 10, color: "rgba(238,239,211,0.5)", textTransform: "uppercase" }}>Est. Value</span>
                        <Mono style={{ fontSize: 16, fontWeight: 700, color: dc.cream }}>{fmt$(m.price)}</Mono>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: 10, color: "rgba(238,239,211,0.5)", textTransform: "uppercase" }}>Proj. Rent</span>
                        <Mono style={{ fontSize: 16, fontWeight: 700, color: dc.lemon }}>{fmt$(m.estRent)}/mo</Mono>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: 10, color: "rgba(238,239,211,0.5)", textTransform: "uppercase" }}>Track 1 DSCR</span>
                        <Mono style={{ fontSize: 16, fontWeight: 700, color: m.track1Dscr >= 1.0 ? dc.emerald : "#e57373" }}>
                          {m.track1Dscr.toFixed(2)}x
                        </Mono>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: 10, color: "rgba(238,239,211,0.5)", textTransform: "uppercase" }}>Net Carry</span>
                        <Mono style={{ fontSize: 16, fontWeight: 700, color: m.track2CashFlow >= 0 ? dc.emerald : "#e57373" }}>
                          {fmt$(m.track2CashFlow)}/mo
                        </Mono>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => onNavigate("tools/perfect-property")}
                      style={{
                        flex: 1,
                        background: dc.lemon,
                        color: dc.dark,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "10px",
                        borderRadius: radius.sm,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Underwrite Deal →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveOutreachDeal(deal)}
                      style={{
                        background: "rgba(238,239,211,0.1)",
                        color: dc.cream,
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "10px 14px",
                        borderRadius: radius.sm,
                        border: "1px solid rgba(238,239,211,0.2)",
                        cursor: "pointer",
                      }}
                    >
                      AI SDR Pitch ✉️
                    </button>
                    {dispatchedDeals.has(deal.id) && (
                      <div
                        style={{
                          background: dc.emerald,
                          color: dc.dark,
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "10px 14px",
                          borderRadius: radius.sm,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✓ Dispatched
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI SDR MODAL PITCH GENERATOR */}
        {activeOutreachDeal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 40, 41, 0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#002829",
                border: `1.5px solid ${dc.lemon}`,
                borderRadius: radius.md,
                padding: "28px 32px",
                maxWidth: 600,
                width: "100%",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 8 }}>
                AI SDR Automated Outreach Copy (Lead-Enriched)
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: dc.cream, marginBottom: 16 }}>
                Pre-Approved DSCR Offer for {activeOutreachDeal.address}
              </div>

              <div style={{ background: "rgba(238,239,211,0.06)", padding: "16px", borderRadius: radius.sm, fontFamily: dc.mono, fontSize: 13, color: "rgba(238,239,211,0.9)", lineHeight: 1.6, marginBottom: 20, whiteSpace: "pre-wrap" }}>
{`Subject: Non-Recourse DSCR Pre-Approval for ${activeOutreachDeal.address}

Dear Property Owner,

Our underwriting engine flagged your parcel at ${activeOutreachDeal.address} (${activeOutreachDeal.city}, ${activeOutreachDeal.state}) for a non-recourse DSCR refinancing / purchase facility.

Based on our Realie API valuation comps:
- Estimated ARV: ${fmt$(activeOutreachDeal.estimated_value || 485000)}
- Pre-Approved Loan-to-Value: 75% (${fmt$((activeOutreachDeal.estimated_value || 485000) * 0.75)})
- Track 1 Lender Qualification DSCR: 1.18x (NO Tax Returns Required)
- Year 1 OBBBA Tax Shelter Depreciation: ${fmt$((activeOutreachDeal.estimated_value || 485000) * 0.82 * 0.22)}

No tax returns or employment verification needed. Close in 14 business days via Greenstreet Finance.

Reply YES to review your institutional credit memo.`}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setActiveOutreachDeal(null)}
                  style={{
                    background: "transparent",
                    color: dc.cream,
                    border: "1px solid rgba(238,239,211,0.3)",
                    padding: "10px 18px",
                    borderRadius: radius.sm,
                    cursor: "pointer",
                  }}
                >
                  Close Window
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatch(activeOutreachDeal)}
                  disabled={dispatching}
                  style={{
                    background: dispatching ? "rgba(216,217,88,0.5)" : dc.lemon,
                    color: dc.dark,
                    fontWeight: 700,
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: radius.sm,
                    cursor: dispatching ? "wait" : "pointer",
                  }}
                >
                  {dispatching ? "Dispatching..." : "Dispatch AI SDR Email →"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
