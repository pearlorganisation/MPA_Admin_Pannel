"use client";

import React, { useState, useEffect } from "react";
import { useGetAdminReviewTrackingQuery, useGetEligibleReviewersQuery } from "../../../../services/reviewerApi";
import { useUpdateSubmissionStatusMutation, useAssignReviewersMutation } from "../../../../services/manuscriptApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewTracking() {
  // 1. States to handle Modal and Form Data (Added publishDate for Accepted status)
  const[selectedManuscript, setSelectedManuscript] = useState(null);
  const [actionData, setActionData] = useState({ status: "", feedback: "", file: null, publishDate: "" });
  const[newReviewerId, setNewReviewerId] = useState("");

  // 2. Fetch tracking data from backend
  const { data, isLoading, refetch } = useGetAdminReviewTrackingQuery();

  const {
    data: reviewerOptionsData,
    isLoading: isReviewersLoading,
  } = useGetEligibleReviewersQuery(selectedManuscript?.manuscript?._id, {
    skip: !selectedManuscript?.manuscript?._id,
  });

  // 3. Mutations for actions
  const[updateStatus, { isLoading: isUpdating }] = useUpdateSubmissionStatusMutation();
  const [assignReviewers, { isLoading: isAssigning }] = useAssignReviewersMutation();

  // 4. Keep the selected manuscript updated automatically when data refreshes
  useEffect(() => {
    if (selectedManuscript && data?.reviews) {
      const updatedItem = data.reviews.find(
        (item) => item.manuscript._id === selectedManuscript.manuscript._id
      );
      if (updatedItem) setSelectedManuscript(updatedItem);
    }
  }, [data]);

  useEffect(() => {
    setNewReviewerId("");
  },[selectedManuscript?.manuscript?._id]);

  // Show loading screen while fetching data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="font-medium text-lg">Loading Review Details...</p>
      </div>
    );
  }

  // 5. Calculate if Admin is allowed to Accept/Publish (Minimum 2 Completed Reviews)
  const completedCount = selectedManuscript
    ? selectedManuscript.reviewers.filter((r) => r.reviewStatus === "Completed").length
    : 0;
  const canAcceptOrPublish = completedCount >= 2;

  // 6. Handle Assigning a New Reviewer Action
  const handleAssignNewReviewer = async () => {
    if (!newReviewerId.trim()) {
      return toast.error("Please select a reviewer.");
    }

    try {
      await assignReviewers({
        manuscriptId: selectedManuscript.manuscript._id,
        reviewerIds: [newReviewerId.trim()],
      }).unwrap();

      toast.success("New reviewer successfully assigned!");
      setNewReviewerId("");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign new reviewer.");
    }
  };

  // 7. Handle Final Editorial Decision Action
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionData.status) return toast.error("Please select a status first.");

    // Double security check for minimum reviews
    if (["Accepted", "Published"].includes(actionData.status) && !canAcceptOrPublish) {
      return toast.error("You need at least 2 completed reviews to Accept or Publish.");
    }

    const formData = new FormData();
    formData.append("manuscriptId", selectedManuscript.manuscript._id);
    formData.append("status", actionData.status);

    // If Admin selects "Accepted", ensure they picked a valid future date
    if (actionData.status === "Accepted") {
      if (!actionData.publishDate) {
        return toast.error("Please select a date and time to schedule publication.");
      }
      
      const selectedDate = new Date(actionData.publishDate);
      if (selectedDate <= new Date()) {
        return toast.error("Publication date and time must be in the future.");
      }
      
      // Send publishDate to backend
      formData.append("publishDate", actionData.publishDate);
    }

    if (actionData.feedback) formData.append("feedback", actionData.feedback);
    if (actionData.file) formData.append("feedbackFile", actionData.file);

    try {
      await updateStatus(formData).unwrap();
      toast.success(`Manuscript status successfully updated to ${actionData.status}`);
      setSelectedManuscript(null); // Close modal
      setActionData({ status: "", feedback: "", file: null, publishDate: "" }); // Reset form
      refetch(); // Refresh list
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update manuscript status.");
    }
  };

  // Helper function to render 5 stars for the score view
  const renderStars = (score) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icons.Star
            key={star}
            size={16}
            className={star <= (score || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Review Tracking Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare reviewer feedback, assign backup reviewers, and take final editorial decisions.
          </p>
        </div>
      </div>

      {/* List of All Manuscripts */}
      <div className="grid grid-cols-1 gap-5">
        {data?.reviews?.map((item) => {
          const compCount = item.reviewers.filter((r) => r.reviewStatus === "Completed").length;
          const totalReviewers = item.reviewers.length;

          return (
            <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
              {/* Left Side: Manuscript Identity Information */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-bold tracking-wider">
                    {item.manuscript.manuscriptId}
                  </span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider 
                    ${item.manuscript.status === "Published" ? "bg-emerald-100 text-emerald-700" :
                      item.manuscript.status === "Rejected" ? "bg-rose-100 text-rose-700" :
                        "bg-blue-100 text-blue-700"
                    }`}>
                    {item.manuscript.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-xl leading-tight">{item.manuscript.title}</h3>
              </div>

              {/* Right Side: Visualizing Reviewer Progress */}
              <div className="flex items-center gap-6 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                <div className="flex flex-col items-end">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Reviews Done</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-700">{compCount}/{totalReviewers}</span>
                    <div className="flex -space-x-3">
                      {item.reviewers.map((r, idx) => (
                        <div key={idx} title={`${r.name} - ${r.invitationStatus}`} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm
                          ${r.reviewStatus === 'Completed' ? 'bg-emerald-500' : r.invitationStatus === 'Declined' ? 'bg-rose-500' : 'bg-amber-400'}`}>
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedManuscript(item)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <Icons.LayoutDashboard size={18} />
                  Evaluate & Act
                </button>
              </div>
            </div>
          );
        })}

        {data?.reviews?.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Icons.FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No reviews tracking data available right now.</p>
          </div>
        )}
      </div>

      {/* PREMIUM FULL-SCREEN MODAL */}
      {selectedManuscript && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex justify-center items-center p-4 md:p-6">
          <div className="bg-white w-full max-w-[1500px] h-full max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="text-white">
                <p className="text-xs font-bold text-blue-400 mb-1 tracking-wider uppercase">Evaluating Manuscript</p>
                <h2 className="text-lg font-bold line-clamp-1">{selectedManuscript.manuscript.title}</h2>
              </div>
              <button onClick={() => {
                setSelectedManuscript(null);
                setActionData({ status: "", feedback: "", file: null, publishDate: "" });
              }} className="p-2 bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white rounded-full transition-colors">
                <Icons.X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-slate-50">
              
              {/* LEFT SIDE: Reviewers Feedback Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <Icons.Users size={20} className="text-blue-600" /> Reviewers Feedback Comparison
                </h3>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {selectedManuscript.reviewers.map((reviewer) => (
                    <div key={reviewer.reviewerId} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-100/50 p-5 border-b border-slate-100 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                            {reviewer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-base">{reviewer.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{reviewer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider 
                            ${reviewer.reviewStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              reviewer.invitationStatus === 'Declined' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {reviewer.reviewStatus === 'Completed' ? 'Completed' : reviewer.invitationStatus}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col gap-5">
                        {reviewer.invitationStatus === "Declined" && (
                          <div className="flex flex-col items-center justify-center py-10 text-rose-500 text-center bg-rose-50 rounded-xl border border-rose-100">
                            <Icons.UserX size={48} className="mb-3 opacity-60" />
                            <p className="font-black text-lg">Invitation Declined</p>
                            <p className="text-sm text-rose-600/80 mt-1">This reviewer rejected the request.</p>
                          </div>
                        )}

                        {reviewer.invitationStatus !== "Declined" && reviewer.reviewStatus !== "Completed" && (
                          <div className="flex flex-col items-center justify-center py-10 text-amber-500 text-center bg-amber-50 rounded-xl border border-amber-100">
                            <Icons.Clock size={48} className="mb-3 opacity-60" />
                            <p className="font-black text-lg">Awaiting Feedback</p>
                            <p className="text-sm text-amber-600/80 mt-1">
                              {reviewer.invitationStatus === "Pending" ? "Invitation not accepted yet." : "Review is in progress."}
                            </p>
                          </div>
                        )}

                        {reviewer.reviewStatus === "Completed" && (
                          <>
                            <div className={`p-4 rounded-xl border flex items-center justify-between 
                              ${reviewer.recommendation === 'Accept' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                reviewer.recommendation === 'Reject' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                                  'bg-amber-50 border-amber-100 text-amber-800'
                              }`}>
                              <span className="text-xs font-black uppercase tracking-wider opacity-70">Recommendation</span>
                              <span className="font-black text-lg">{reviewer.recommendation || 'None'}</span>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Evaluation Scores</p>
                              <div className="grid grid-cols-2 gap-3">
                                {['originality', 'clarity', 'methodology', 'contribution'].map((crit) => (
                                  <div key={crit} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                                    <span className="capitalize text-xs font-bold text-slate-600">{crit}</span>
                                    {renderStars(reviewer.scores?.[crit])}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                                <p className="text-xs flex items-center gap-1 uppercase font-black text-rose-600 mb-2 tracking-wider">
                                  <Icons.Lock size={14} /> Confidential (For Admin)
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                  {reviewer.commentsToEditor || <span className="text-slate-400 italic">No confidential comments provided.</span>}
                                </p>
                              </div>

                              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                <p className="text-xs flex items-center gap-1 uppercase font-black text-blue-600 mb-2 tracking-wider">
                                  <Icons.MessageSquare size={14} /> Feedback For Author
                                </p>
                                <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                  {reviewer.commentsToAuthor || <span className="text-slate-400 italic">No feedback provided for the author.</span>}
                                </div>
                              </div>
                            </div>

                            {reviewer.annotatedFile && (
                              <a href={reviewer.annotatedFile} target="_blank" rel="noreferrer"
                                className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
                                <Icons.DownloadCloud size={18} /> Download Annotated File
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE: Action Panel */}
              <div className="w-full lg:w-[450px] bg-slate-100 border-l border-slate-200 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10">
                <div className="p-6 border-b border-slate-200 bg-white">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Icons.Gavel size={24} className="text-blue-600" /> Administrative Panel
                  </h3>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  {!canAcceptOrPublish && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex gap-3 shadow-sm items-start">
                      <Icons.ShieldAlert size={20} className="shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-rose-700">Action Restricted</p>
                        <p className="text-xs text-rose-600 mt-1">
                          You need at least <strong>2 completed reviews</strong> to Accept or Publish. You currently have <strong>{completedCount}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SUB-PANEL 1: Final Editorial Decision Form */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                      <Icons.CheckCircle size={18} className="text-slate-600" /> Final Decision
                    </h4>

                    <form onSubmit={handleActionSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Status</label>
                        <select
                          required
                          value={actionData.status}
                          onChange={(e) => setActionData({ ...actionData, status: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
                        >
                          <option value="">-- Select Decision --</option>
                          <option value="Revision Required">Request Revision (Minor/Major)</option>
                          <option value="Rejected">Reject Manuscript</option>

                          {canAcceptOrPublish ? (
                            <>
                              <option value="Accepted">Accept Manuscript (Schedule Publish)</option>
                              <option value="Published">Publish Now (Immediate)</option>
                            </>
                          ) : (
                            <optgroup label="Needs 2 completed reviews">
                              <option value="Accepted" disabled>Accept Manuscript (Disabled)</option>
                              <option value="Published" disabled>Publish Now (Disabled)</option>
                            </optgroup>
                          )}
                        </select>
                      </div>

                      {/* NEW FEATURE: Date Time Picker ONLY shows when Status is "Accepted" */}
                      {actionData.status === "Accepted" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Icons.CalendarClock size={16} /> Schedule Publication Date
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={actionData.publishDate}
                            onChange={(e) => setActionData({ ...actionData, publishDate: e.target.value })}
                            className="w-full bg-emerald-50/50 border border-emerald-200 text-slate-700 font-medium rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          />
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            The system will automatically publish this manuscript exactly on the selected date and time.
                          </p>
                        </div>
                      )}

                      {/* Display textarea/upload only if Rejected or Revision needed */}
                      {['Revision Required', 'Rejected'].includes(actionData.status) && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message to Author</label>
                            <textarea
                              required
                              rows={5}
                              value={actionData.feedback}
                              onChange={(e) => setActionData({ ...actionData, feedback: e.target.value })}
                              placeholder="Paste the final summarized feedback here..."
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attach File (Optional)</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                              <input
                                type="file"
                                onChange={(e) => setActionData({ ...actionData, file: e.target.files[0] })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="flex flex-col items-center gap-1">
                                <Icons.UploadCloud size={20} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">
                                  {actionData.file ? actionData.file.name : "Click to upload feedback file"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        disabled={isUpdating}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-sm mt-2 shadow-md hover:shadow-lg hover:shadow-blue-500/30"
                      >
                        {isUpdating ? <Icons.Loader2 size={18} className="animate-spin" /> : <Icons.Check size={18} />}
                        {isUpdating ? "Processing..." : actionData.status === "Accepted" ? "Accept & Schedule Publish" : "Submit Decision"}
                      </button>
                    </form>
                  </div>

                  {/* SUB-PANEL 2: Assign More Reviewers */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mt-4">
                    <h4 className="font-bold text-slate-800 mb-2 border-b pb-2 flex items-center gap-2">
                      <Icons.UserPlus size={18} className="text-indigo-600" /> Assign Backup Reviewer
                    </h4>

                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      If a reviewer rejected the request, assign someone else to meet the 2 reviews quota. <br /><br />
                      <span className="font-bold text-slate-700">Note:</span> People who already rejected the invitation will be skipped automatically by the system.
                    </p>

                    <div className="flex flex-col gap-3">
                      <select
                        value={newReviewerId}
                        onChange={(e) => setNewReviewerId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">
                          {isReviewersLoading ? "Loading reviewers..." : "-- Select Reviewer --"}
                        </option>

                        {reviewerOptionsData?.reviewers?.map((reviewer) => (
                          <option key={reviewer._id} value={reviewer._id}>
                            {reviewer.name} ({reviewer.email})
                          </option>
                        ))}
                      </select>

                      {!isReviewersLoading && reviewerOptionsData?.reviewers?.length === 0 && (
                        <p className="text-xs text-rose-500 font-medium">
                          No eligible reviewers available for this manuscript.
                        </p>
                      )}

                      <button
                        onClick={handleAssignNewReviewer}
                        disabled={
                          isAssigning ||
                          !newReviewerId.trim() ||
                          isReviewersLoading ||
                          reviewerOptionsData?.reviewers?.length === 0
                        }
                        className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center gap-2 text-sm"
                      >
                        {isAssigning ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Send Reviewer Invitation"
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Basic Global Style to hide bulky scrollbars inside containers */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}