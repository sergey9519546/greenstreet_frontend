import React, { useState } from "react";
import { motion } from "motion/react";
import { FileText, CheckCircle, Clock, AlertTriangle, Send, XCircle } from "lucide-react";

interface TradeRequest {
  id: string;
  ticker: string;
  action: "BUY" | "SELL";
  shares: number;
  status: "PENDING" | "APPROVED" | "DENIED";
  date: string;
}

export default function EmployeeComplianceTab() {
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [shares, setShares] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for initial render
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([
    { id: "trd-1", ticker: "AAPL", action: "BUY", shares: 50, status: "APPROVED", date: new Date(Date.now() - 86400000).toISOString() },
    { id: "trd-2", ticker: "TSLA", action: "SELL", shares: 100, status: "PENDING", date: new Date().toISOString() }
  ]);

  const handleSubmitTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !shares) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newTrade: TradeRequest = {
        id: `trd-${Date.now()}`,
        ticker: ticker.toUpperCase(),
        action,
        shares: Number(shares),
        status: "PENDING",
        date: new Date().toISOString()
      };
      setTradeRequests([newTrade, ...tradeRequests]);
      setTicker("");
      setShares("");
      setReason("");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="space-y-8"
    >
      {/* Top Stats - using brand green/cream cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-mint/40 text-midnight-green rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">Pending Trades</div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">
              {tradeRequests.filter(t => t.status === "PENDING").length}
            </div>
          </div>
        </div>
        
        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-emerald/20 text-rain-forest rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">Annual Attestations</div>
            <div className="text-xl font-extrabold text-midnight-green font-display">Completed</div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-lemon-lime/20 text-midnight-green rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">OBA Disclosures</div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">1 Active</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trade Request Form - styled in midnight-green wrapper */}
        <div className="lg:col-span-1 bg-[#fbfcfa] border border-midnight-green/10 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-midnight-green px-6 py-5">
            <h3 className="text-pistachio font-display font-bold text-lg leading-tight">Personal Trade Request</h3>
            <p className="text-mint/80 text-[11px] mt-1 font-medium">Pre-clearance required for all covered accounts</p>
          </div>
          <form onSubmit={handleSubmitTrade} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-midnight-green/70 mb-1 block">Ticker Symbol</label>
              <input 
                type="text" 
                required 
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                placeholder="e.g. AAPL" 
                className="w-full px-4 py-2.5 bg-mint/10 border border-midnight-green/15 rounded-lg outline-none focus:border-emerald font-mono text-sm text-midnight-green placeholder-midnight-green/30"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-midnight-green/70 mb-1 block">Action</label>
                <select 
                  value={action}
                  title="Select action type"
                  onChange={e => setAction(e.target.value as "BUY" | "SELL")}
                  className="w-full px-3 py-2.5 bg-mint/10 border border-midnight-green/15 rounded-lg outline-none focus:border-emerald text-sm font-semibold text-midnight-green"
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-midnight-green/70 mb-1 block">Shares / Qty</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={shares}
                  onChange={e => setShares(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="100" 
                  className="w-full px-4 py-2.5 bg-mint/10 border border-midnight-green/15 rounded-lg outline-none focus:border-emerald text-sm text-midnight-green"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-midnight-green/70 mb-1 block">Rationale / Notes</label>
              <textarea 
                rows={3} 
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Brief reason for trade..." 
                className="w-full px-4 py-3 bg-mint/10 border border-midnight-green/15 rounded-lg outline-none focus:border-emerald text-sm text-midnight-green placeholder-midnight-green/30 resize-none"
              ></textarea>
            </div>

            {/* Styled Primary Button: lemon-lime with micro-animation concept */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-lemon-lime hover:bg-[#c4c54c] text-midnight-green rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-midnight-green/30 border-t-midnight-green rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Pre-clearance</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Trade History */}
        <div className="lg:col-span-2 bg-[#fbfcfa] border border-midnight-green/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-midnight-green/10 flex justify-between items-center bg-[#f7f8f6]">
            <div>
              <h3 className="text-midnight-green font-display font-bold text-lg">Trade History</h3>
              <p className="text-midnight-green/60 text-xs mt-1">Your recent personal trade requests and status</p>
            </div>
            <button className="text-emerald text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-mint/15 text-midnight-green/60 text-xs uppercase tracking-wider border-b border-midnight-green/10">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Asset</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Qty</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-green/5 text-midnight-green">
                {tradeRequests.map((trade) => (
                  <tr key={trade.id} className="hover:bg-mint/5 transition">
                    <td className="px-6 py-4 text-midnight-green/60 font-mono text-xs">
                      {new Date(trade.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold font-mono">
                      {trade.ticker}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${trade.action === "BUY" ? "bg-emerald/10 text-emerald" : "bg-red-50 text-red-700"}`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {trade.shares}
                    </td>
                    <td className="px-6 py-4">
                      {trade.status === "APPROVED" && (
                        <div className="flex items-center gap-1.5 text-emerald bg-emerald/10 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-extrabold uppercase tracking-wider">Approved</span>
                        </div>
                      )}
                      {trade.status === "PENDING" && (
                        <div className="flex items-center gap-1.5 text-midnight-green/80 bg-lemon-lime/20 px-2.5 py-1 rounded-full w-fit">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-extrabold uppercase tracking-wider font-sans">Reviewing</span>
                        </div>
                      )}
                      {trade.status === "DENIED" && (
                        <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full w-fit">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-extrabold uppercase tracking-wider">Denied</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tradeRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-midnight-green/30">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>No trade requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
