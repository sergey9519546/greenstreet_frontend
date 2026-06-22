import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, ShieldAlert, CheckCircle, Clock, Plus, Filter, FileSpreadsheet, ShieldCheck } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  riskRating: "HIGH" | "MEDIUM" | "LOW";
  lastReviewDate: string;
  ddqStatus: "SUBMITTED" | "PENDING" | "APPROVED";
  soc2Status: "VERIFIED" | "PENDING" | "NOT_AVAILABLE";
}

export default function ThirdPartyComplianceTab() {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "vnd-1",
      name: "Amazon Web Services (AWS)",
      category: "Cloud Infrastructure",
      riskRating: "HIGH",
      lastReviewDate: "2025-11-12",
      ddqStatus: "APPROVED",
      soc2Status: "VERIFIED"
    },
    {
      id: "vnd-2",
      name: "HubSpot Inc.",
      category: "CRM & Marketing",
      riskRating: "MEDIUM",
      lastReviewDate: "2026-01-20",
      ddqStatus: "APPROVED",
      soc2Status: "VERIFIED"
    },
    {
      id: "vnd-3",
      name: "DocuSign",
      category: "E-Signature Provider",
      riskRating: "HIGH",
      lastReviewDate: "2026-03-05",
      ddqStatus: "APPROVED",
      soc2Status: "VERIFIED"
    },
    {
      id: "vnd-4",
      name: "Slack Technologies",
      category: "Communications",
      riskRating: "MEDIUM",
      lastReviewDate: "2025-08-14",
      ddqStatus: "PENDING",
      soc2Status: "PENDING"
    },
    {
      id: "vnd-5",
      name: "Local Office Supplies LLC",
      category: "Facilities",
      riskRating: "LOW",
      lastReviewDate: "2024-06-01",
      ddqStatus: "SUBMITTED",
      soc2Status: "NOT_AVAILABLE"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "ALL" || v.riskRating === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="space-y-8"
    >
      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">High Risk Vendors</div>
            <div className="text-2xl font-extrabold text-red-700 font-display">2</div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-emerald/20 text-[#006565] rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">SOC 2 Verified</div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">3</div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-lemon-lime/20 text-midnight-green rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">DDQs Pending Review</div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">1</div>
          </div>
        </div>
      </div>

      {/* Main Vendor Audit list */}
      <div className="bg-[#fbfcfa] border border-midnight-green/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-midnight-green/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f7f8f6]">
          <div>
            <h3 className="text-midnight-green font-display font-bold text-lg">Third Party Vendor Risk Audit</h3>
            <p className="text-midnight-green/60 text-xs mt-1">Vendor due diligence logs, SOC 2 tracking, and risk ratings</p>
          </div>
          <button className="px-4 py-2 bg-lemon-lime hover:bg-[#c4c54c] text-midnight-green rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard New Vendor</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-mint/10 border-b border-midnight-green/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-midnight-green/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors or services..."
              className="w-full pl-9 pr-4 py-2 bg-[#fbfcfa] border border-midnight-green/15 rounded-lg outline-none focus:border-emerald text-sm text-midnight-green placeholder-midnight-green/30"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-midnight-green/50" />
            <span className="font-bold text-midnight-green/70">Risk Rating:</span>
            <div className="flex gap-1">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1 rounded-md font-bold transition text-[10px] uppercase tracking-wider ${
                    riskFilter === r 
                      ? "bg-midnight-green text-pistachio" 
                      : "text-midnight-green hover:bg-mint/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-midnight-green">
            <thead>
              <tr className="bg-mint/15 text-midnight-green/60 text-xs uppercase tracking-wider border-b border-midnight-green/10">
                <th className="px-6 py-4 font-semibold">Vendor Name</th>
                <th className="px-6 py-4 font-semibold">Risk Rating</th>
                <th className="px-6 py-4 font-semibold">Last DDQ Review</th>
                <th className="px-6 py-4 font-semibold">SOC 2 Status</th>
                <th className="px-6 py-4 font-semibold">Due Diligence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-green/5">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-mint/5 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold font-display">{vendor.name}</div>
                    <div className="text-xs text-midnight-green/60">{vendor.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      vendor.riskRating === "HIGH" 
                        ? "bg-red-50 text-red-700" 
                        : vendor.riskRating === "MEDIUM"
                        ? "bg-lemon-lime/20 text-midnight-green"
                        : "bg-emerald/10 text-emerald"
                    }`}>
                      {vendor.riskRating} RISK
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-medium text-midnight-green/80">
                    {vendor.lastReviewDate}
                  </td>
                  <td className="px-6 py-4">
                    {vendor.soc2Status === "VERIFIED" && (
                      <span className="text-xs text-emerald font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    )}
                    {vendor.soc2Status === "PENDING" && (
                      <span className="text-xs text-midnight-green/60 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting report</span>
                      </span>
                    )}
                    {vendor.soc2Status === "NOT_AVAILABLE" && (
                      <span className="text-xs text-red-600/80 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>None</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                        vendor.ddqStatus === "APPROVED" 
                          ? "bg-emerald/10 text-emerald" 
                          : "bg-lemon-lime/20 text-midnight-green"
                      }`}>
                        {vendor.ddqStatus}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-midnight-green/30">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">No vendors matched your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
