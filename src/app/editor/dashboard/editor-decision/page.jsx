"use client";
import React, { useState, useEffect } from "react";
import {
  useGetAssignedToEditorQuery,
  useUpdateSubmissionStatusMutation,
  useAssignReviewersMutation
} from "../../../../services/manuscriptApi";
import {
  useGetAdminReviewTrackingQuery,
  useGetEligibleReviewersQuery
} from "../../../../services/reviewerApi";
import { Loader2 } from "lucide-react";
import * as Icons from "lucide-react";  
import toast from "react-hot-toast";

export default function EditorDecisionDashboard() {
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [actionData, setActionData] = useState({ status: "", feedback: "", file: null });
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  // Fetching Data
  const { data: assignments, isLoading: loadingAssignments, refetch: refetchAssignments } = useGetAssignedToEditorQuery();
  const { data: trackingData, refetch: refetchTracking } = useGetAdminReviewTrackingQuery();

  // Fetch eligible reviewers for the specific paper
  const { data: reviewerOptions, isLoading: isReviewersLoading } = useGetEligibleReviewersQuery(selectedPaper?._id, {
    skip: !selectedPaper?._id,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSubmissionStatusMutation();
  const [assignReviewers, { isLoading: isAssigning }] = useAssignReviewersMutation();

  // Find reviews for the currently selected manuscript
  const currentTracking = trackingData?.reviews?.find(r => r.manuscript._id === selectedPaper?._id);
  const acceptCount = currentTracking?.reviewers?.filter(r => r.recommendation === "Accept").length || 0;
  const canRecommendAccept = acceptCount >= 2;

  // Prevent changes if already sent to Admin
  const isLocked =
    selectedPaper?.status === "Awaiting Admin Decision" ||
    selectedPaper?.status === "Published";

  // Logic to handle reviewer assignment
  const handleAssignReviewer = async () => {
    if (selectedReviewers.length < 1) return toast.error("Please select at least one reviewer");
    try {
      await assignReviewers({ manuscriptId: selectedPaper._id, reviewerIds: selectedReviewers }).unwrap();
      toast.success("Reviewers assigned successfully");
      setSelectedReviewers([]);
      refetchTracking();
    } catch (error) {
      toast.error(error?.data?.message || "Assignment failed");
    }
  };

  // Submit Final Recommendation to Admin
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (actionData.status === "Accepted" && !canRecommendAccept) {
      return toast.error("At least 2 'Accept' recommendations required.");
    }

    const formData = new FormData();
    formData.append("manuscriptId", selectedPaper._id);
    formData.append("status", actionData.status);
    formData.append("feedback", actionData.feedback);
    if (actionData.file) {
      formData.append("feedbackFile", actionData.file);
    }

    try {
      await updateStatus(formData).unwrap();
      toast.success("Decision submitted to Chief Editor/Admin");
      setSelectedPaper(null);
      setActionData({ status: "", feedback: "", file: null });
      refetchAssignments();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update");
    }
  };

  if (loadingAssignments) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-slate-500 font-medium">Loading Editorial Dashboard...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-[#F8FAFC] min-h-screen font-sans">

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Icons.Gavel size={24} />
            </div>
            Editor Decision Hub
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage assignments, track reviews, and make final recommendations.</p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Assigned</p>
            <p className="text-2xl font-black text-slate-800">{assignments?.manuscripts?.length || 0}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-indigo-400 uppercase">Pending Review</p>
            <p className="text-2xl font-black text-indigo-700">
              {assignments?.manuscripts?.filter(m => m.status.includes('Review')).length || 0}
            </p>
          </div>
        </div>
      </header>

      {/* Manuscript List */}
      <div className="grid grid-cols-1 gap-4">
        {assignments?.manuscripts?.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <Icons.Inbox className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">No Manuscripts Assigned</h3>
            <p className="text-slate-500">You don't have any manuscripts assigned for decision yet.</p>
          </div>
        ) : (
          assignments?.manuscripts?.map((paper) => (
            <div key={paper._id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                    {paper.manuscriptId}
                  </span>
                  {/* REVISION ALERT BADGE */}
                  {(paper.status === "Revision Submitted" || paper.files?.reviewChecklist) && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-[11px] font-black uppercase flex items-center gap-1 animate-pulse">
                      <Icons.RefreshCw size={12} /> Revision Received
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-xl group-hover:text-indigo-600 transition-colors">{paper.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Icons.Clock size={14} /> {new Date(paper.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                    {paper.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPaper(paper)}
                className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-indigo-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
              >
                Evaluate & Decide <Icons.ChevronRight size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* DECISION MODAL */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-[1400px] h-[95vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/20">

            {/* Modal Header */}
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Icons.FileText className="text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Decision Portal</p>
                    <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedPaper.manuscriptId}</p>
                  </div>
                  <h2 className="text-xl font-bold line-clamp-1">{selectedPaper.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaper(null)}
                className="p-3 bg-white/10 hover:bg-rose-500 rounded-full transition-all group"
              >
                <Icons.X size={18} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

              {/* LEFT: Review Content & Proofs */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">

                {/* Author Revision Section (If exists) */}
                {selectedPaper.files?.reviewChecklist && (
                  <div className="bg-white border-2 border-emerald-500/20 p-6 rounded-[24px] shadow-sm flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                        <Icons.CheckSquare size={24} />
                      </div>
                      <div>
                        <p className="text-emerald-900 font-bold text-lg">Researcher Revision Attached</p>
                        <p className="text-slate-500 text-sm italic">The author has submitted a point-by-point response to previous comments.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={selectedPaper.files.manuscriptFile?.url} target="_blank" className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 flex items-center gap-2">
                        <Icons.FileDown size={14} /> Revised MS
                      </a>
                      <a href={selectedPaper.files.reviewChecklist?.url} target="_blank" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-2">
                        <Icons.Eye size={14} /> Checklist
                      </a>
                    </div>
                  </div>
                )}

                {/* Reviewer Cards Grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Icons.Users size={16} /> Peer Review Reports ({currentTracking?.reviewers?.length || 0})
                  </h3>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {currentTracking?.reviewers?.map((rev, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 transition-all">
                        <div className="flex justify-between mb-4 border-b border-slate-50 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                              {rev.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{rev.name}</p>
                              <p className="text-[10px] font-black text-indigo-500 uppercase">{rev.invitationStatus}</p>
                            </div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 
                            ${rev.recommendation === 'Accept' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              rev.recommendation === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                            {rev.recommendation || "Awaiting Review"}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                            <Icons.Quote className="absolute top-2 right-2 text-slate-200" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Confidential to Editor</p>
                            <p className="text-sm text-slate-600 italic leading-relaxed">"{rev.commentsToEditor || "No confidential comments provided."}"</p>
                          </div>

                          {rev.annotatedFile && (
                            <a href={rev.annotatedFile} target="_blank" className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 p-3 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all">
                              <Icons.Download size={14} /> Download Reviewer's Annotated File
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Action Sidebar */}
              <div className="w-full lg:w-[450px] border-l border-slate-100 bg-white p-8 overflow-y-auto">
                {isLocked ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="bg-amber-50 p-8 rounded-[40px] text-amber-500 animate-pulse">
                      <Icons.Lock size={64} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-slate-800">Recommendation Submitted</h3>
                      <p className="text-slate-500 mt-2">You have completed your evaluation. The paper is now with the Editor-in-Chief for final decision.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">

                    {/* Reviewer Assignment Section */}
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Icons.UserPlus size={16} /> Additional Reviewers
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (!e.target.value || selectedReviewers.includes(e.target.value)) return;
                              setSelectedReviewers([...selectedReviewers, e.target.value]);
                            }}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:border-indigo-500 outline-none appearance-none transition-all"
                          >
                            <option value="">Select backup reviewer...</option>
                            {reviewerOptions?.reviewers?.map(r => (
                              <option key={r._id} value={r._id}>{r.name} — ({r.email})</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Icons.ChevronDown size={18} />
                          </div>
                        </div>

                        {/* Selected List */}
                        <div className="flex flex-wrap gap-2">
                          {selectedReviewers.map(id => (
                            <div key={id} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                              {reviewerOptions?.reviewers?.find(r => r._id === id)?.name}
                              <button onClick={() => setSelectedReviewers(prev => prev.filter(x => x !== id))} className="hover:text-rose-200">
                                <Icons.X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleAssignReviewer}
                          disabled={isAssigning || selectedReviewers.length === 0}
                          className="w-full bg-slate-100 text-slate-800 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {isAssigning ? <Icons.Loader2 className="animate-spin" /> : <Icons.Send size={16} />}
                          Invite Selected Reviewers
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-10">
                      {/* Final Recommendation Form */}
                      <form onSubmit={handleActionSubmit} className="space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Icons.CheckCircle size={16} /> Editor Recommendation
                        </h4>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Proposed Status</label>
                          <select
                            required
                            value={actionData.status}
                            onChange={(e) => setActionData({ ...actionData, status: e.target.value })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-600 outline-none transition-all"
                          >
                            <option value="">-- Choose Decision --</option>
                            <option value="Revision Required">Major/Minor Revision Required</option>
                            <option value="Rejected" className="text-rose-600">Reject Manuscript</option>
                            <option value="Accepted" disabled={!canRecommendAccept}>Accept (Needs 2 Accepts)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Editorial Feedback</label>
                          <textarea
                            required
                            rows={6}
                            placeholder="Explain your decision to the author and admin..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm outline-none focus:border-indigo-500 transition-all leading-relaxed"
                            value={actionData.feedback}
                            onChange={(e) => setActionData({ ...actionData, feedback: e.target.value })}
                          />
                        </div>


                        {/*  SHOW ONLY WHEN REVISION REQUIRED */}
                        {["Revision Required", "Rejected"].includes(actionData.status) && (
                          <div className="space-y-3 animate-fadeIn">

                            <label className="text-xs font-bold text-indigo-600 ml-1">
                              {actionData.status === "Rejected"
                                ? "Upload Rejection Document (optional)"
                                : "Upload Revision File (optional)"}
                            </label>

                            <div className="relative border-2 border-dashed border-indigo-200 rounded-2xl p-6 bg-indigo-50/40 hover:bg-indigo-50 transition-all group cursor-pointer">

                              <input
                                type="file"
                                onChange={(e) => setActionData({ ...actionData, file: e.target.files[0] })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />

                              <div className="flex flex-col items-center justify-center text-center">
                                <Icons.UploadCloud
                                  className="text-indigo-400 group-hover:scale-110 transition-transform mb-3"
                                  size={28}
                                />

                                <p className="text-sm font-semibold text-slate-700">
                                  {actionData.file ? actionData.file.name : "Upload Revision Document"}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  PDF, DOCX allowed
                                </p>
                              </div>
                            </div>

                          </div>
                        )}

                        <button
                          disabled={isUpdating}
                          type="submit"
                          className="w-full bg-indigo-600 text-white py-5 rounded-[20px] font-black text-sm hover:shadow-2xl hover:shadow-indigo-200 flex items-center justify-center gap-3"
                        >
                          {isUpdating ? <Icons.Loader2 className="animate-spin" /> : <Icons.ShieldCheck size={20} />}
                          Send Decision
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}