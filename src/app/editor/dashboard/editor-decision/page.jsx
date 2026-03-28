"use client";
import React, { useState, useMemo } from "react";
import {
  useGetAssignedToEditorQuery,
  useUpdateSubmissionStatusMutation
} from "../../../../services/manuscriptApi";
import { useGetAdminReviewTrackingQuery } from "../../../../services/reviewerApi";
import {
  Gavel, CheckCircle, XCircle, RefreshCcw,
  MessageSquare, UserCheck, FileText,
  ArrowLeft, ChevronLeft, ChevronRight as ChevronRightIcon,
  Eye, AlertCircle, Download, Info
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditorDecisionDashboard() {
  // --- STATE MANAGEMENT ---
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [decisionMode, setDecisionMode] = useState(""); // "Accepted" | "Rejected" | "Revision Required"
  const [feedback, setFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- API HOOKS ---
  const { data: assignments, isLoading: loadingAssignments } = useGetAssignedToEditorQuery();
  const { data: trackingData } = useGetAdminReviewTrackingQuery();
  const [updateStatus, { isLoading: isSubmitting }] = useUpdateSubmissionStatusMutation();

  // --- LOGIC: Filter reviews and count "Accept" recommendations ---
  const paperReviews = trackingData?.reviews?.find(r => r.manuscript._id === selectedPaper?._id);

  // Calculate how many reviewers recommended "Accept"
  const acceptCount = useMemo(() => {
    return paperReviews?.reviewers?.filter(rev => rev.recommendation === "Accept").length || 0;
  }, [paperReviews]);

  // Rule: Minimum 2 Accepts required for Editor to recommend Acceptance
  const isAcceptDisabled = acceptCount < 2;

  // --- LOGIC: Pagination ---
  const paginatedManuscripts = useMemo(() => {
    if (!assignments?.manuscripts) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return assignments.manuscripts.slice(startIndex, startIndex + itemsPerPage);
  }, [assignments, currentPage]);

  const totalPages = Math.ceil((assignments?.manuscripts?.length || 0) / itemsPerPage);

  // --- HANDLER: Submit Editorial Decision ---
  const handleDecision = async () => {
    if (!decisionMode) return toast.error("Please select a decision type");
    if (!feedback) return toast.error("Please provide feedback/comments");

    try {
      await updateStatus({
        manuscriptId: selectedPaper._id,
        status: decisionMode,
        feedback: feedback
      }).unwrap();

      const msg = decisionMode === "Revision Required"
        ? "Revision request sent to author!"
        : "Recommendation forwarded to Admin!";

      toast.success(msg);
      setSelectedPaper(null);
      setDecisionMode("");
      setFeedback("");
    } catch (err) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  if (loadingAssignments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Loading Editorial Data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Gavel size={20} />
              </div>
              <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase">Editor Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Decision <span className="text-indigo-600">Control Center</span>
            </h1>
          </div>
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase">Pending Actions</p>
            <p className="text-2xl font-black text-slate-800">{assignments?.manuscripts?.length || 0}</p>
          </div>
        </header>

        {!selectedPaper ? (
          /* LIST VIEW */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Manuscript ID</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Title & Author</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Type</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedManuscripts.map((paper) => (
                    <tr key={paper._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-5 font-mono text-xs font-bold text-slate-600">{paper.manuscriptId}</td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800 line-clamp-1">{paper.title}</p>
                        <p className="text-xs text-slate-500">{paper.submittedBy?.name}</p>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-slate-600">{paper.manuscriptType}</td>
                      <td className="px-6 py-5"><StatusPill status={paper.status} /></td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => setSelectedPaper(paper)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all">
                          <Eye size={14} className="inline mr-2" /> EVALUATE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft size={18} /></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border rounded-lg disabled:opacity-30"><ChevronRightIcon size={18} /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EVALUATION VIEW */
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedPaper(null)} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">
              <ArrowLeft size={18} /> Back to Manuscript List
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: DETAILS */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase mb-3 inline-block">{selectedPaper.manuscriptId}</span>
                  <h2 className="text-2xl font-black text-slate-900 mb-6">{selectedPaper.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-50">
                    <InfoBox label="Discipline" value={selectedPaper.discipline} />
                    <InfoBox label="Author" value={selectedPaper.submittedBy?.name} />
                    <InfoBox label="Type" value={selectedPaper.manuscriptType} />
                    <InfoBox label="Submitted" value={new Date(selectedPaper.createdAt).toLocaleDateString()} />
                  </div>
                </div>

                {/* REVIEWER REPORTS */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-8 py-5 border-b bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 flex items-center gap-2"><UserCheck className="text-indigo-600" size={20} /> Reviewer Reports</h3>
                    <span className="text-xs font-bold text-indigo-600">{paperReviews?.reviewers?.length || 0} Reports</span>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paperReviews?.reviewers?.map((rev, idx) => (
                      <div key={idx} className="border border-slate-100 rounded-3xl p-6 border-l-4 border-l-indigo-500">
                        <div className="flex justify-between mb-4">
                          <span className="font-black text-slate-400 text-[10px] uppercase">Reviewer {idx + 1}</span>
                          <RecBadge rec={rev.recommendation} />
                        </div>
                        <p className="text-xs text-slate-500 italic mb-4">"{rev.commentsToEditor || "No comments."}"</p>
                        {rev.annotatedFile && (
                          <a href={rev.annotatedFile} target="_blank" className="text-indigo-600 text-xs font-black flex items-center gap-1"><Download size={14} /> PDF</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: DECISION PANEL */}
              <div className="lg:col-span-4">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8">
                  <h3 className="text-xl font-black mb-6 text-indigo-400 flex items-center gap-2"><Gavel size={24} /> Decision Panel</h3>

                  <div className="space-y-3 mb-8">
                    {/* REVISION BUTTON */}
                    <DecisionBtn
                      icon={<RefreshCcw size={16} />}
                      label="Request Revision"
                      active={decisionMode === "Revision Required"}
                      onClick={() => setDecisionMode("Revision Required")}
                      activeClass="bg-amber-500 border-amber-500 text-white"
                    />

                    {/* ACCEPT BUTTON (WITH LOGIC) */}
                    <div className="relative group">
                      <DecisionBtn
                        icon={<CheckCircle size={16} />}
                        label={`Recommend Accept (${acceptCount}/2)`}
                        active={decisionMode === "Accepted"}
                        onClick={() => {
                          if (isAcceptDisabled) {
                            toast.error("At least 2 reviewer 'Accept' recommendations are required to recommend acceptance.");
                          } else {
                            setDecisionMode("Accepted");
                          }
                        }}
                        activeClass={isAcceptDisabled ? "opacity-40 cursor-not-allowed bg-slate-700" : "bg-emerald-500 border-emerald-500 text-white"}
                      />
                      {isAcceptDisabled && (
                        <p className="text-[9px] text-rose-400 mt-1 font-bold flex items-center gap-1">
                          <AlertCircle size={10} /> Requires 2 'Accept' reviews.
                        </p>
                      )}
                    </div>

                    {/* REJECT BUTTON */}
                    <DecisionBtn
                      icon={<XCircle size={16} />}
                      label="Recommend Reject"
                      active={decisionMode === "Rejected"}
                      onClick={() => setDecisionMode("Rejected")}
                      activeClass="bg-rose-500 border-rose-500 text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      {decisionMode === "Revision Required" ? "Instructions to Author" : "Internal Notes"}
                    </label>
                    <textarea
                      rows="5"
                      placeholder="Type rationale here..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />

                    <button
                      onClick={handleDecision}
                      disabled={isSubmitting || !decisionMode}
                      className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : "Submit Decision"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const InfoBox = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-700 truncate">{value || "—"}</p>
  </div>
);

const ScoreRow = ({ label, score }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold text-slate-500">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => <div key={s} className={`w-3 h-1.5 rounded-full ${s <= score ? "bg-indigo-500" : "bg-slate-200"}`} />)}
    </div>
  </div>
);

const DecisionBtn = ({ icon, label, active, onClick, activeClass }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-xs transition-all border ${active ? activeClass : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
      }`}
  >
    {icon} {label}
  </button>
);

const StatusPill = ({ status }) => {
  const config = {
    "Under Review": "bg-blue-50 text-blue-600",
    "Awaiting Admin Decision": "bg-purple-50 text-purple-600",
    "Revision Required": "bg-amber-50 text-amber-600",
    "Accepted": "bg-emerald-50 text-emerald-600",
    "Rejected": "bg-rose-50 text-rose-600",
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${config[status] || "bg-slate-50"}`}>{status}</span>;
};

const RecBadge = ({ rec }) => {
  const config = {
    "Accept": "text-emerald-600 bg-emerald-50",
    "Reject": "text-rose-600 bg-rose-50",
    "Minor revisions": "text-amber-600 bg-amber-50",
    "Major revisions": "text-orange-600 bg-orange-50",
  };
  return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${config[rec] || "bg-slate-100"}`}>{rec || "No Rec"}</span>;
};