import { STATS_DATA, RECENT_SUBMISSIONS } from "../../../constants/dummyData";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";

export default function AdminOverview() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">System Overview</h1>
        <p className="text-slate-500">
          Welcome back, Super Admin. Here's what's happening today.
        </p>
      </header>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STATS_DATA.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-medium text-slate-500 mb-1">
              {stat.label}
            </p>
            <div className="flex items-baseline justify-between">
              <h3 className={`text-3xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </h3>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-600 uppercase font-bold tracking-wider">
                Live
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- Tables Section --- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            Pending Actions & Submissions
          </h2>
          <button className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:underline">
            View All <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Manuscript Title</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Submission Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_SUBMISSIONS.map((paper) => (
                <tr
                  key={paper.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {paper.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{paper.author}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {paper.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusStyles(paper.status)}`}
                    >
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                      <MoreHorizontal size={18} className="text-slate-400" />
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

// Helper function for status colors
function getStatusStyles(status) {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "under review":
      return "bg-blue-100 text-blue-700";
    case "minor revision":
      return "bg-amber-100 text-amber-700";
    case "proofreading":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
