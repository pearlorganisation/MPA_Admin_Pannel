"use client";

import React, { useMemo } from "react";
import {
  useGetReviewerAssignmentsQuery,
  useRespondToInvitationMutation
} from "../../../services/reviewerApi";
import {
  BookOpen, Clock, CheckCircle2, AlertCircle,
  Sparkles, FileText, BarChart3, PieChart as PieChartIcon,
  ChevronRight, Check, X, ArrowUpRight, Award
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ReviewerDashboard() {

  const router = useRouter();
  // 1. Fetch data from your API logic (Restored exactly as before)
  const { data, isLoading } = useGetReviewerAssignmentsQuery();
  const [respondToInvite] = useRespondToInvitationMutation();

  const reviews = data?.reviews || [];

  // 2. Statistics Calculation (Keep your logic same)
  const stats = useMemo(() => {
    const pending = reviews.filter(r => r.invitationStatus === "Pending").length;
    const active = reviews.filter(r => r.invitationStatus === "Accepted" && r.reviewStatus === "Pending").length;
    const completed = reviews.filter(r => r.reviewStatus === "Completed").length;

    return [
      { label: "Total Assigned", value: reviews.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "New Invites", value: pending, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
      { label: "Active Reviews", value: active, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];
  }, [reviews]);

  // 3. Chart Data (Blue theme for charts)
  const pieChartData = useMemo(() => [
    { name: "New", value: reviews.filter(r => r.invitationStatus === "Pending").length, color: "#f43f5e" },
    { name: "Active", value: reviews.filter(r => r.invitationStatus === "Accepted" && r.reviewStatus === "Pending").length, color: "#f59e0b" },
    { name: "Completed", value: reviews.filter(r => r.reviewStatus === "Completed").length, color: "#10b981" },
  ], [reviews]);

  const recommendationData = useMemo(() => {
    const counts = { Accept: 0, "Minor revisions": 0, "Major revisions": 0, Reject: 0 };
    reviews.forEach(r => { if (r.recommendation) counts[r.recommendation]++; });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [reviews]);

  // 4. Action Handlers (Kept exactly same)
  const handleInvitationResponse = async (reviewId, status) => {
    try {
      await respondToInvite({ reviewId, status }).unwrap();
      toast.success(`Invitation ${status} Successfully!`)
    } catch (err) {
      toast.error("Something Went Wrong. Please try Again !");
    }
  };

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans text-slate-900">

      {/* Page Header - Matching the Screenshot Style */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            System <span className="text-orange-400">Overview</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back, Reviewer. Here is the real-time analysis of your work.
          </p>
        </div>

        <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Award size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Performance</p>
            <p className="text-md font-bold text-slate-800">Top 10% Contributor</p>
          </div>
        </div>
      </header>

      {/* 4 Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                <s.icon size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold mt-1 text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Progress Circle Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-slate-500">
            <PieChartIcon size={18} className="text-blue-600" /> Status Breakdown
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieChartData.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                <span className="text-xs text-slate-500 font-semibold">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-slate-500">
            <BarChart3 size={18} className="text-blue-600" /> Recommendation History
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recommendationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Invitations Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" /> Pending Invitations
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {reviews.filter(r => r.invitationStatus === "Pending").map((rev) => (
            <div
              key={rev._id}
              className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    New Request
                  </span>
                  <span className="text-slate-400 text-xs font-medium">#{rev.manuscriptId?.manuscriptId || "N/A"}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">{rev.manuscriptId?.title}</h4>
                <p className="text-slate-500 text-sm line-clamp-1 italic">"{rev.manuscriptId?.abstract}"</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleInvitationResponse(rev._id, "Declined")}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all text-sm"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleInvitationResponse(rev._id, "Accepted")}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 text-sm"
                >
                  Accept Review
                </button>
              </div>
            </div>
          ))}

          {/* If no items found */}
          {reviews.filter(r => r.invitationStatus === "Pending").length === 0 && (
            <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
              <p className="text-slate-400 font-medium italic">No pending invitations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-md font-bold text-slate-800">Active & Historical Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Manuscript Details</th>
                <th className="px-6 py-4 text-center">Invite</th>
                <th className="px-6 py-4 text-center">Review Progress</th>
                <th className="px-6 py-4">Recommendation</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.filter(r => r.invitationStatus !== "Pending").map((r) => (
                <tr key={r._id} className="group hover:bg-slate-50 transition-all duration-200">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[250px]">{r.manuscriptId?.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">ID: {r.manuscriptId?.manuscriptId}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${r.invitationStatus === "Accepted" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                      {r.invitationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${r.reviewStatus === "Completed" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                      }`}>
                      {r.reviewStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-600 italic">{r.recommendation || "Pending..."}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => router.push("/reviewer/dashboard/papers")}
                      disabled={r.reviewStatus === "Completed" || r.invitationStatus === "Declined"}
                      className={`p-2 rounded-lg transition-all ${r.reviewStatus === "Completed" || r.invitationStatus === "Declined"
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-blue-600 hover:bg-blue-50"
                        }`}
                    >
                      <ChevronRight size={20} />
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