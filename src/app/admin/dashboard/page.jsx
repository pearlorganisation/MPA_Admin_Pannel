"use client";
import React, { useMemo } from "react";
import { 
  ArrowUpRight, 
  FileText, 
  CheckCircle, 
  Clock, 
  Users, 
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

import { useGetAllSubmissionsQuery } from "../../../services/manuscriptApi";
import { useGetAllUsersQuery } from "../../../services/userApi";
export default function AdminOverview() {
  const { data: manuscriptData, isLoading: isLoadingManuscripts } = useGetAllSubmissionsQuery({ page: 1, limit: 100 });
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery();

  // --- DATA PROCESSING (Memoized for performance) ---
  const { stats, statusChartData, monthlyChartData, recentSubmissions } = useMemo(() => {
    const submissions = manuscriptData?.submissions ||[];
    const users = usersData?.user ||[];

    // 1. Calculate Top Stats
    const totalManuscripts = submissions.length;
    const publishedCount = submissions.filter(s => s.status === "Published").length;
    const underReviewCount = submissions.filter(s => s.status === "Under Review").length;
    const totalUsers = users.length;

    // 2. Calculate Data for Pie Chart (Manuscript Status Distribution)
    const statusCounts = submissions.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const statusChartData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    // 3. Calculate Data for Bar Chart (Monthly Submissions)
    const monthNames =["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCounts = {};
    
    submissions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const month = monthNames[date.getMonth()];
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Create array for last 6 months dynamically (simplified for this example to show available data)
    const monthlyChartData = Object.keys(monthlyCounts).map(key => ({
      name: key,
      Submissions: monthlyCounts[key]
    }));

    return {
      stats:[
        { label: "Total Manuscripts", value: totalManuscripts, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Published Articles", value: publishedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "Under Review", value: underReviewCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
      ],
      statusChartData,
      monthlyChartData,
      recentSubmissions: submissions.slice(0, 6) // Top 6 latest
    };
  }, [manuscriptData, usersData]);

  // Chart Colors
  const COLORS =['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#14b8a6'];

  // Loading State
  if (isLoadingManuscripts || isLoadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-1">
          Welcome back, Admin. Here is the real-time analysis of the journal.
        </p>
      </header>

      {/* --- 1. Top Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group"
          >
            <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. Analytics Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Bar Chart: Submissions Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Submission Trends</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <ChartTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Submissions" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart: Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Manuscript Status</h2>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- 3. Recent Submissions Table --- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Recent Submissions</h2>
            <p className="text-sm text-slate-500 mt-1">Latest manuscripts uploaded to the system</p>
          </div>
          <button className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
            View All <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Manuscript ID / Title</th>
                <th className="px-6 py-4 font-semibold">Submitted By</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((paper) => (
                  <tr key={paper._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-xs" title={paper.title}>
                        {paper.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">{paper.manuscriptId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 font-medium">
                        {paper.submittedBy?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">{paper.submittedBy?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(paper.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyles(paper.status)}`}>
                        {paper.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    No manuscripts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Complete Helper function mapping Exact Backend Enums
function getStatusStyles(status) {
  switch (status) {
    case "Submitted":
      return "bg-slate-100 text-slate-600 border border-slate-200";
    case "Editor Assigned":
      return "bg-cyan-100 text-cyan-700 border border-cyan-200";
    case "Under Review":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "Revision Required":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Accepted":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Published":
      return "bg-green-100 text-green-700 border border-green-200 shadow-sm";
    case "Rejected":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}