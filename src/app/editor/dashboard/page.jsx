"use client";

import React from "react";
import { 
  ArrowRight, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Users, 
  Settings2,
  Search,
  MoreVertical
} from "lucide-react";

// ==========================================
// 📌 DUMMY DATA (Added inside the file)
// ==========================================
const EDITOR_STATS_DATA =[
  { label: "New Assignments", value: "12", color: "text-blue-600", icon: "clipboard" },
  { label: "Awaiting Reviews", value: "34", color: "text-amber-500", icon: "clock" },
  { label: "Ready for Decision", value: "8", color: "text-emerald-600", icon: "check" },
  { label: "Total Handled", value: "156", color: "text-slate-800", icon: "file" },
];

const EDITOR_SUBMISSIONS =[
  {
    id: "MAN-2023-089",
    title: "Quantum Computing in Modern Cryptography",
    author: "Dr. Sarah Jenkins",
    reviewersAssigned: 2,
    dueDate: "24 Oct, 2023",
    status: "Awaiting Reviews",
  },
  {
    id: "MAN-2023-091",
    title: "AI Models for Climate Change Prediction",
    author: "James Chen",
    reviewersAssigned: 0,
    dueDate: "28 Oct, 2023",
    status: "Needs Reviewer",
  },
  {
    id: "MAN-2023-075",
    title: "Nanotechnology in Targeted Drug Delivery",
    author: "Elena Rodriguez",
    reviewersAssigned: 3,
    dueDate: "15 Oct, 2023",
    status: "Ready for Decision",
  },
  {
    id: "MAN-2023-102",
    title: "Blockchain Applications in Supply Chain",
    author: "Michael Chang",
    reviewersAssigned: 1,
    dueDate: "02 Nov, 2023",
    status: "Under Review",
  },
  {
    id: "MAN-2023-115",
    title: "Evolutionary Biology in Deep Sea Ecosystems",
    author: "Dr. Alan Grant",
    reviewersAssigned: 2,
    dueDate: "10 Nov, 2023",
    status: "Under Review",
  }
];

// ==========================================
// 📌 MAIN COMPONENT
// ==========================================
export default function EditorOverview() {
  
  // Helper for Stat Icons
  const getStatIcon = (iconName) => {
    switch(iconName) {
      case 'clipboard': return <ClipboardList size={22} className="text-blue-600" />;
      case 'clock': return <Clock size={22} className="text-amber-500" />;
      case 'check': return <CheckCircle2 size={22} className="text-emerald-600" />;
      case 'file': return <FileText size={22} className="text-slate-600" />;
      default: return <FileText size={22} className="text-slate-400" />;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- Header Section --- */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Editor Workspace
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editorial Desk</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base max-w-2xl">
            Manage your assigned manuscripts, track reviewer progress, and make final publication decisions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:shadow-sm transition-all">
            <Search size={16} className="text-slate-400" />
            Search
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-sm transition-all">
            <Settings2 size={16} />
            Board Settings
          </button>
        </div>
      </header>

      {/* --- Stats Grid (Premium Look) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {EDITOR_STATS_DATA.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -top-4 bg-slate-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out -z-10"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-white transition-colors z-10">
                {getStatIcon(stat.icon)}
              </div>
            </div>
            <div className="z-10 relative">
              <h3 className={`text-4xl font-black tracking-tight mb-1 ${stat.color}`}>
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- Actionable Table Section --- */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Manuscripts Needing Attention
            </h2>
            <p className="text-sm text-slate-500 mt-1">Showing active submissions assigned to your desk.</p>
          </div>
          <button className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 hover:underline">
            View Complete Desk <ArrowRight size={16} />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 font-bold">Manuscript ID & Title</th>
                <th className="px-6 py-5 font-bold">Author</th>
                <th className="px-6 py-5 font-bold text-center">Reviewers</th>
                <th className="px-6 py-5 font-bold">Target Date</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {EDITOR_SUBMISSIONS.map((paper) => (
                <tr
                  key={paper.id}
                  className="hover:bg-slate-50/80 transition-colors group bg-white"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 mb-1 tracking-wider">{paper.id}</span>
                      <span className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                        {paper.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{paper.author}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-600 bg-slate-50 py-1.5 px-3 rounded-lg w-max mx-auto border border-slate-100">
                      <Users size={14} className={paper.reviewersAssigned === 0 ? "text-rose-500" : "text-emerald-500"} />
                      <span className="font-bold">{paper.reviewersAssigned}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {paper.dueDate}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${getEditorStatusStyles(paper.status)}`}
                    >
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-sm px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        Manage
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
//  HELPER FUNCTIONS
// ==========================================
function getEditorStatusStyles(status) {
  switch (status.toLowerCase()) {
    case "needs reviewer":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    case "awaiting reviews":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "ready for decision":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "under review":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}