import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface RegulatoryTask {
  id: string;
  title: string;
  dueDate: string;
  regulator: "SEC" | "FINRA" | "STATE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "COMPLETED" | "PENDING" | "OVERDUE";
  assignedTo: string;
}

export default function FirmComplianceTab() {
  const [tasks, setTasks] = useState<RegulatoryTask[]>([
    {
      id: "tsk-1",
      title: "Annual Form ADV Amendment Filing",
      dueDate: "2026-03-31",
      regulator: "SEC",
      priority: "HIGH",
      status: "COMPLETED",
      assignedTo: "Chief Compliance Officer",
    },
    {
      id: "tsk-2",
      title: "Form ADV Part 2A Brochure Annual Update & Distribution",
      dueDate: "2026-04-30",
      regulator: "SEC",
      priority: "HIGH",
      status: "COMPLETED",
      assignedTo: "Compliance Associate",
    },
    {
      id: "tsk-3",
      title: "Annual Compliance Program Review (Rule 206(4)-7)",
      dueDate: "2026-09-30",
      regulator: "SEC",
      priority: "HIGH",
      status: "PENDING",
      assignedTo: "Chief Compliance Officer",
    },
    {
      id: "tsk-4",
      title: "Quarterly Form 13F Holdings Report",
      dueDate: "2026-08-15",
      regulator: "SEC",
      priority: "MEDIUM",
      status: "PENDING",
      assignedTo: "Operations Lead",
    },
    {
      id: "tsk-5",
      title: "Quarterly Blue Sky State Audit Review",
      dueDate: "2026-06-30",
      regulator: "STATE",
      priority: "MEDIUM",
      status: "OVERDUE",
      assignedTo: "Compliance Associate",
    },
  ]);

  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED" | "OVERDUE"
  >("ALL");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-emerald/20 text-[#006565] rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">
              Completed
            </div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">
              2
            </div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-lemon-lime/20 text-midnight-green rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">
              Pending Review
            </div>
            <div className="text-2xl font-extrabold text-midnight-green font-display">
              2
            </div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">
              Overdue Tasks
            </div>
            <div className="text-2xl font-extrabold text-red-700 font-display">
              1
            </div>
          </div>
        </div>

        <div className="bg-[#fbfcfa] border border-midnight-green/10 p-6 rounded-xl shadow-sm flex items-center gap-4 transition hover:border-midnight-green/20">
          <div className="w-12 h-12 bg-mint/40 text-midnight-green rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-midnight-green/60 font-bold uppercase tracking-wider mb-1">
              Regulator
            </div>
            <div className="text-xl font-extrabold text-midnight-green font-display">
              SEC / State
            </div>
          </div>
        </div>
      </div>

      {/* Task board */}
      <div className="bg-[#fbfcfa] border border-midnight-green/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-midnight-green/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f7f8f6]">
          <div>
            <h3 className="text-midnight-green font-display font-bold text-lg">
              Regulatory Filing Calendar
            </h3>
            <p className="text-midnight-green/60 text-xs mt-1">
              Upcoming registration, reporting, and assessment requirements
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-lemon-lime hover:bg-[#c4c54c] text-midnight-green rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Event</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-mint/10 border-b border-midnight-green/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-midnight-green/50" />
            <span className="font-bold text-midnight-green/70">
              Filter Status:
            </span>
            <div className="flex gap-1">
              {(["ALL", "PENDING", "COMPLETED", "OVERDUE"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1 rounded-md font-bold transition text-[10px] uppercase tracking-wider ${
                      filter === s
                        ? "bg-midnight-green text-pistachio"
                        : "text-midnight-green hover:bg-mint/30"
                    }`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
          <span className="text-midnight-green/60 font-medium">
            Showing {filteredTasks.length} items
          </span>
        </div>

        {/* Task List */}
        <div className="divide-y divide-midnight-green/5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-mint/5 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                      task.regulator === "SEC"
                        ? "bg-midnight-green text-pistachio"
                        : "bg-emerald/20 text-[#006565]"
                    }`}
                  >
                    {task.regulator}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                      task.priority === "HIGH"
                        ? "bg-red-50 text-red-700"
                        : "bg-lemon-lime/20 text-midnight-green"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>
                <h4 className="text-midnight-green font-bold text-base font-display">
                  {task.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-midnight-green/60 font-medium">
                  <span>
                    Owner:{" "}
                    <strong className="text-midnight-green">
                      {task.assignedTo}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Due by:{" "}
                    <strong className="text-midnight-green font-mono">
                      {task.dueDate}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-midnight-green/5 md:border-none pt-3 md:pt-0">
                <div>
                  {task.status === "COMPLETED" && (
                    <div className="flex items-center gap-1.5 text-emerald bg-emerald/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                  {task.status === "PENDING" && (
                    <div className="flex items-center gap-1.5 text-midnight-green bg-lemon-lime/20 px-3 py-1 rounded-full text-xs font-bold w-fit">
                      <Clock className="w-4 h-4" />
                      <span>In Progress</span>
                    </div>
                  )}
                  {task.status === "OVERDUE" && (
                    <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                      <AlertCircle className="w-4 h-4" />
                      <span>Overdue</span>
                    </div>
                  )}
                </div>
                <button className="p-2 border border-midnight-green/10 hover:border-midnight-green/30 text-midnight-green/70 hover:text-midnight-green rounded-lg transition">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="p-12 text-center text-midnight-green/30">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">
                No tasks found matching this status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
