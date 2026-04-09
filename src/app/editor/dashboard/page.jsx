"use client";

import React, { useMemo } from "react";
import {
  ArrowRight, ClipboardList, Clock, CheckCircle2,
  FileText, Users, Settings2, Search, MoreVertical,
  AlertCircle, BarChart3, PieChart as PieIcon, Loader2
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";

import { useGetAssignedToEditorQuery } from "../../../services/manuscriptApi";
import { useRouter } from "next/navigation";
// --- UI Constants ---
const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#94a3b8"];

export default function EditorOverview() {

  const router = useRouter();

  // 1. Fetch Real Data from RTK Query
  const { data, isLoading, isError, refetch } = useGetAssignedToEditorQuery();
  const manuscripts = data?.manuscripts || [];

  // 2. Process Data for Stats and Charts (useMemo for performance)
  const stats = useMemo(() => {
    const total = manuscripts.length;
    const underReview = manuscripts.filter(m => m.status === "Under Review").length;
    const needsReviewer = manuscripts.filter(m => m.status === "Editor Assigned").length;
    const readyForDecision = manuscripts.filter(m => m.status === "Submitted" && m.isRevised).length;
    const published = manuscripts.filter(m => m.status === "Published").length;

    // Chart Data: Status Distribution
    const statusCounts = manuscripts.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    // Chart Data: Discipline Distribution
    const disciplineCounts = manuscripts.reduce((acc, m) => {
      acc[m.discipline] = (acc[m.discipline] || 0) + 1;
      return acc;
    }, {});

    const barData = Object.keys(disciplineCounts).map(key => ({
      name: key.substring(0, 10), // Truncate long names
      count: disciplineCounts[key]
    }));

    return { total, underReview, needsReviewer, readyForDecision, published, pieData, barData };
  }, [manuscripts]);

  if (isLoading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-medium">Loading Editorial Desk...</p>
    </div>
  );

  if (isError) return (
    <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-700">
      <AlertCircle />
      <p>Failed to load assigned manuscripts. Please try again later.</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">

      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              Editor-in-Chief Pannel
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Editorial Control</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Real-time tracking of <span className="text-blue-600 font-bold">{stats.total} assignments</span>.
            Monitor peer-review progress and manage publication workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
            <Clock size={18} className="text-slate-600" />
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-slate-200 transition-all">
            <Settings2 size={16} />
            Desk Settings
          </button>
        </div>
      </header>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Assigned" value={stats.total} icon={<FileText />} color="blue" />
        <StatCard label="Under Review" value={stats.underReview} icon={<Users />} color="amber" />
        <StatCard label="Awaiting Reviewers" value={stats.needsReviewer} icon={<ClipboardList />} color="rose" />
        <StatCard label="Ready for Decision" value={stats.readyForDecision} icon={<CheckCircle2 />} color="emerald" />
      </div>

      {/* --- Visual Analytics Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Manuscript Status Flow</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discipline Analytics Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">Submissions by Discipline</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData}>
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Main Table Section --- */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Manuscripts</h2>
            <p className="text-xs text-slate-500 font-medium">Direct management of your assigned queue</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter by ID or Title..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-4">Manuscript Info</th>
                <th className="px-6 py-4">Discipline</th>
                <th className="px-6 py-4 text-center">Reviewers</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-8 py-4 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {manuscripts.map((m) => (
                <tr key={m._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded uppercase tracking-tighter">
                        {m.manuscriptId}
                      </span>
                      <span className="font-bold text-slate-800 line-clamp-1 text-sm group-hover:text-blue-700">
                        {m.title}
                      </span>
                      <span className="text-xs text-slate-400 font-medium italic">
                        By {m.submittedBy?.name || "Unknown Author"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {m.discipline}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(m.assignedReviewers?.length || 0, 3))].map((_, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                            R{i + 1}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-black text-slate-700">
                        {m.assignedReviewers?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-8 py-5 text-right">

                    <button onClick={() => {
                      router.push("dashboard/editor-decision");
                    }} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                      Manage Workflow
                    </button>
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

// --- Sub-Components for Clean Code ---

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon, { size: 80 })}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Submitted": "bg-slate-100 text-slate-600",
    "Editor Assigned": "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700",
    "Accepted": "bg-emerald-100 text-emerald-700",
    "Published": "bg-indigo-100 text-indigo-700",
    "Rejected": "bg-rose-100 text-rose-700",
    "Revision Required": "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}