"use client";

import React, { useState, useMemo } from 'react';
import { 
  useGetAdminReviewTrackingQuery 
} from '../../../../services/reviewerApi';
import { 
  Search, 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Download,
  Star,
  MessageSquare,
  RefreshCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const ReviewerStatus = () => {
  // Fetch data using RTK Query
  const { data, isLoading, isError, refetch, isFetching } = useGetAdminReviewTrackingQuery();
  
  // Local States
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Production standard for dashboard lists

  // --- Logic: Filtering & Pagination ---
  
  // 1. Filter data based on search
  const filteredData = useMemo(() => {
    if (!data?.reviews) return [];
    return data.reviews.filter(item => 
      item.manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manuscript.manuscriptId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // 3. Stats Calculation (For Professional Look)
  const stats = useMemo(() => {
    if (!data?.reviews) return { total: 0, completed: 0, pending: 0 };
    const total = data.reviews.length;
    let completed = 0;
    data.reviews.forEach(m => {
      if (m.reviewers.every(r => r.reviewStatus === 'Completed')) completed++;
    });
    return { total, completed, pending: total - completed };
  }, [data]);

  // Handle page change
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedId(null); // Close expanded rows when changing page
  };

  // --- Sub-Components for Clean UI ---

  const StatusBadge = ({ status }) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Accepted: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Declined: "bg-rose-50 text-rose-700 border-rose-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status] || "bg-gray-50 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  // --- Render States ---

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium">Loading tracking data...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reviewer Tracking</h1>
            <p className="text-slate-500 mt-1">Manage and monitor the peer-review progress in real-time.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => refetch()}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-600"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by ID or Title..." 
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Manuscripts', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Fully Reviewed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Reviews', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* DATA TABLE / LIST */}
        <div className="space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div key={item._id} className={`bg-white border ${expandedId === item._id ? 'border-blue-200 ring-2 ring-blue-50' : 'border-slate-200'} rounded-2xl overflow-hidden transition-all duration-300 shadow-sm`}>
                
                {/* Manuscript Header Row */}
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-slate-100 p-3 rounded-xl hidden sm:block">
                      <FileText className="text-slate-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          ID: {item.manuscript.manuscriptId}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {item.reviewers.length} Reviewers
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 leading-snug">{item.manuscript.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Status</p>
                      <span className="text-sm font-semibold text-slate-700">{item.manuscript.status}</span>
                    </div>
                    <div className={`p-2 rounded-full transition-colors ${expandedId === item._id ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      {expandedId === item._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* EXPANDED SECTION: Reviewer Progress */}
                {expandedId === item._id && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {item.reviewers.map((rev, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                {rev.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{rev.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{rev.email}</p>
                              </div>
                            </div>
                            <StatusBadge status={rev.reviewStatus === "Completed" ? "Completed" : rev.invitationStatus} />
                          </div>

                          {rev.reviewStatus === "Completed" ? (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                              {/* Recommendation Label */}
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                                rev.recommendation === 'Accept' ? 'bg-emerald-50 text-emerald-700' : 
                                rev.recommendation === 'Reject' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                <BarChart3 className="w-3.5 h-3.5" /> Recommendation: {rev.recommendation}
                              </div>

                              {/* Scores Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(rev.scores || {}).map(([key, value]) => (
                                  <div key={key} className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">{key}</p>
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="font-bold text-slate-700 text-sm">{value}</span>
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Comments Section */}
                              <div className="space-y-3">
                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1.5 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> Internal Comments to Editor
                                  </p>
                                  <p className="text-sm text-slate-600 italic leading-relaxed leading-snug">
                                    "{rev.commentsToEditor || 'No specific comments provided.'}"
                                  </p>
                                </div>
                                
                                {rev.annotatedFile && (
                                  <a 
                                    href={rev.annotatedFile} 
                                    target="_blank" 
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-md"
                                  >
                                    <Download className="w-4 h-4" /> Download Annotated File
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                              <Clock className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                              <p className="text-xs font-medium text-slate-500">Review in progress...</p>
                              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Waiting for feedback</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No results found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">We couldn't find any manuscript matching "{searchTerm}". Try a different ID or title.</p>
            </div>
          )}
        </div>

        {/* MODERN PAGINATION CONTROL */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-900">{indexOfFirstItem + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="text-slate-900">{filteredData.length}</span> manuscripts
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all shadow-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all shadow-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewerStatus;