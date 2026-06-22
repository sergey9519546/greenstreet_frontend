import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Mail, Slack, AlertTriangle, Filter, CheckCircle2, History, Database } from "lucide-react";

interface ArchivedMessage {
  id: string;
  sender: string;
  recipient: string;
  platform: "EMAIL" | "SLACK" | "TEAMS";
  timestamp: string;
  snippet: string;
  flagged: boolean;
  flagReason?: string;
  lexiconScore: "CLEAR" | "WARNING" | "FLAGGED";
}

export default function CommunicationsArchiveTab() {
  const [messages, setMessages] = useState<ArchivedMessage[]>([
    {
      id: "msg-1",
      sender: "johndoe@advisoryfirm.com",
      recipient: "client_investor@gmail.com",
      platform: "EMAIL",
      timestamp: "2026-06-22T10:15:30Z",
      snippet: "I guarantee we will hit at least a 15% return by the end of next fiscal quarter on this structured credit fund.",
      flagged: true,
      flagReason: "Lexicon Trigger: 'guarantee'",
      lexiconScore: "FLAGGED"
    },
    {
      id: "msg-2",
      sender: "sally_compliance",
      recipient: "trading_channel",
      platform: "SLACK",
      timestamp: "2026-06-22T10:04:12Z",
      snippet: "Make sure all trade clearance approvals are uploaded to Firestore before executing.",
      flagged: false,
      lexiconScore: "CLEAR"
    },
    {
      id: "msg-3",
      sender: "mark_broker@advisoryfirm.com",
      recipient: "lenders_group@teams.com",
      platform: "TEAMS",
      timestamp: "2026-06-22T09:44:00Z",
      snippet: "This asset is practically risk-free given the backing, you should allocate.",
      flagged: true,
      flagReason: "Lexicon Trigger: 'risk-free'",
      lexiconScore: "WARNING"
    },
    {
      id: "msg-4",
      sender: "johndoe@advisoryfirm.com",
      recipient: "marketing_team",
      platform: "SLACK",
      timestamp: "2026-06-22T08:12:00Z",
      snippet: "Here is the new draft for the SEC Blue Sky state lookup table.",
      flagged: false,
      lexiconScore: "CLEAR"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [lexiconFilter, setLexiconFilter] = useState<"ALL" | "FLAGGED" | "WARNING" | "CLEAR">("ALL");

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLexicon = lexiconFilter === "ALL" || m.lexiconScore === lexiconFilter;
    return matchesSearch && matchesLexicon;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="space-y-8"
    >
      {/* Archive Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-mint/40 text-midnight-green rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">Archived Messages</div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">4,281</div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">Lexicon Flagged</div>
            <div className="text-2xl font-extrabold text-red-700 font-display">2</div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-emerald/20 text-[#006565] rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">SEC 17a-4 Status</div>
            <div className="text-xl font-extrabold text-midnight-green font-display">WORM Compliant</div>
          </div>
        </div>
      </div>

      {/* Main Archive Console */}
      <div className="bg-[#fbfcfa] border border-midnight-green/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-midnight-green/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f7f8f6]">
          <div>
            <h3 className="text-midnight-green font-display font-bold text-lg">Communications Archive & Auditing</h3>
            <p className="text-midnight-green/60 text-xs mt-1">Immutable WORM archive logs with active compliance lexicon analysis</p>
          </div>
          <button className="px-4 py-2 border border-midnight-green/10 hover:border-midnight-green/30 text-midnight-green rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-sm bg-[#fbfcfa]">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail Ledger</span>
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
              placeholder="Search sender, recipient, keywords..."
              className="w-full pl-9 pr-4 py-2 bg-[#fbfcfa] border border-midnight-green/15 rounded-lg outline-none focus:border-emerald text-sm text-midnight-green placeholder-midnight-green/30"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-midnight-green/50" />
            <span className="font-bold text-midnight-green/70">Lexicon Flags:</span>
            <div className="flex gap-1">
              {(["ALL", "FLAGGED", "WARNING", "CLEAR"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLexiconFilter(l)}
                  className={`px-3 py-1 rounded-md font-bold transition text-[10px] uppercase tracking-wider ${
                    lexiconFilter === l 
                      ? "bg-midnight-green text-pistachio" 
                      : "text-midnight-green hover:bg-mint/30"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="divide-y divide-midnight-green/5">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="p-6 flex flex-col sm:flex-row items-start gap-4 hover:bg-mint/5 transition">
              {/* Channel badge */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  msg.platform === "EMAIL" 
                    ? "bg-midnight-green/10 text-midnight-green" 
                    : msg.platform === "SLACK"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {msg.platform === "EMAIL" && <Mail className="w-4 h-4" />}
                  {msg.platform === "SLACK" && <Slack className="w-4 h-4" />}
                  {msg.platform === "TEAMS" && <span className="font-bold text-xs">T</span>}
                </div>
                <span className="text-[10px] font-bold text-midnight-green/50">{msg.platform}</span>
              </div>

              {/* Message contents */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                  <div className="font-medium text-midnight-green/80">
                    From: <strong className="text-midnight-green">{msg.sender}</strong> → To: <strong className="text-midnight-green">{msg.recipient}</strong>
                  </div>
                  <span className="font-mono text-midnight-green/50 text-[10px]">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-sm bg-mint/5 p-3 rounded-lg border border-midnight-green/5 text-midnight-green/90 italic font-sans leading-relaxed">
                  "{msg.snippet}"
                </p>

                {msg.flagged && (
                  <div className={`flex items-center gap-2 p-2 rounded-md border text-xs font-semibold ${
                    msg.lexiconScore === "FLAGGED" 
                      ? "bg-red-50 border-red-200 text-red-700" 
                      : "bg-yellow-50 border-yellow-250 text-yellow-800"
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{msg.flagReason}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="p-12 text-center text-midnight-green/30">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No communications match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
