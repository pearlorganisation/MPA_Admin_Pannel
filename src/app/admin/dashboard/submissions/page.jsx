"use client";
import React, { useState } from "react";
import {
  useGetAllSubmissionsQuery,
  useUpdateStatusMutation,
  useAssignEditorMutation,
  useAssignReviewersMutation
} from "../../../../services/manuscriptApi";
import { useGetAllEditorsQuery, useGetAllReviewersQuery } from "../../../../services/userApi";
import {
  FileText, UserCheck, Users, XCircle,
  ChevronLeft, ChevronRight, ExternalLink,
  MoreHorizontal, Loader2, MessageSquare, AlertCircle, Edit
} from "lucide-react";
import { toast } from "react-hot-toast";

const AllSubmissions = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals State
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [modalType, setModalType] = useState(null); // 'editor', 'reviewer', 'reject'
  const [feedback, setFeedback] = useState("");
  const [selectedEditor, setSelectedEditor] = useState("");
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  // API Queries
  const { data, isLoading } = useGetAllSubmissionsQuery({ page, limit });
  const { data: editors } = useGetAllEditorsQuery();
  const { data: reviewers } = useGetAllReviewersQuery();

  // Mutations
  const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateStatusMutation();
  const [assignEditor, { isLoading: isAssigningEditor }] = useAssignEditorMutation();
  const [assignReviewers, { isLoading: isAssigningReviewer }] = useAssignReviewersMutation();

  // --- Handlers ---
  const closeModal = () => {
    setModalType(null);
    setSelectedManuscript(null);
    setFeedback("");
    setSelectedEditor("");
    setSelectedReviewers([]);
  };

  const handleReject = async () => {
    if (!feedback) return toast.error("Please provide rejection feedback");
    try {
      await updateStatus({
        manuscriptId: selectedManuscript._id,
        status: "Rejected",
        feedback
      }).unwrap();
      toast.success("Manuscript Rejected");
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reject");
    }
  };

  const handleRequestRevision = async () => {
    if (!feedback) return toast.error("Please provide revision feedback");
    try {
      await updateStatus({
        manuscriptId: selectedManuscript._id,
        status: "Revision Required",
        feedback
      }).unwrap();
      toast.success("Revision Request Sent to Author");
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to request revision");
    }
  };

  const handleAssignEditor = async () => {
    if (!selectedEditor) return toast.error("Please select an editor");
    try {
      await assignEditor({
        manuscriptId: selectedManuscript._id,
        editorId: selectedEditor
      }).unwrap();
      toast.success("Editor Assigned successfully");
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign");
    }
  };

  const handleAssignReviewers = async () => {
    if (selectedReviewers.length !== 2) return toast.error("Please select exactly 2 reviewers");
    try {
      await assignReviewers({
        manuscriptId: selectedManuscript._id,
        reviewerIds: selectedReviewers
      }).unwrap();
      toast.success("Reviewers Assigned successfully");
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign reviewers");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      "Submitted": "bg-blue-50 text-blue-700 border-blue-100",
      "Editor Assigned": "bg-indigo-50 text-indigo-700 border-indigo-100",
      "Under Review": "bg-amber-50 text-amber-700 border-amber-100",
      "Revision Required": "bg-orange-50 text-orange-700 border-orange-100", // <-- NAYA
      "Accepted": "bg-emerald-50 text-emerald-700 border-emerald-100",
      "Rejected": "bg-rose-50 text-rose-700 border-rose-100",
    };
    return styles[status] || "bg-gray-50 text-gray-600";
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
      <p className="text-gray-500 font-medium">Loading Submissions...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manuscript Control Panel</h1>
            <p className="text-gray-500 mt-1">Efficiently manage review cycles and editorial assignments.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Submissions</p>
              <p className="text-xl font-black text-indigo-600">{data?.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase">ID & Date</th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase">Manuscript Details</th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase">Team</th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.submissions?.map((item) => (
                  <tr key={item._id} className="hover:bg-indigo-50/30 transition-all duration-200">
                    <td className="p-5">
                      <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {item.manuscriptId}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                        <FileText size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-5 max-w-sm">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1" title={item.title}>{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1 italic">By: {item.submittedBy?.name}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="space-y-2">
                        {item.assignedEditor ? (
                          <div className="flex items-center gap-2 text-xs text-gray-700">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px]">ED</div>
                            <span className="font-medium">{item.assignedEditor.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-medium">No Editor</span>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users size={14} className="text-gray-400" />
                          <span>{item.assignedReviewers?.length || 0} / 2 Reviewers</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => { setSelectedManuscript(item); setModalType('editor'); }} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="Assign Editor"><UserCheck size={18} /></button>
                          <button onClick={() => { setSelectedManuscript(item); setModalType('reviewer'); }} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Assign Reviewers"><Users size={18} /></button>

                          {/* Request Revision */}
                          <button onClick={() => { setSelectedManuscript(item); setModalType('revise'); }} className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors" title="Request Revision">
                            <Edit size={18} />
                          </button>

                          <button onClick={() => { setSelectedManuscript(item); setModalType('reject'); }} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Reject Submission"><XCircle size={18} /></button>
                          <a href={item.files.manuscriptFile} target="_blank" className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><ExternalLink size={18} /></a>
                        </div>

                        {item.isRevised && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            Author Revised
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="font-bold text-gray-900">{data?.page}</span> of {data?.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data?.pages, p + 1))}
                disabled={page === data?.pages}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modalType === 'editor' && <><UserCheck className="text-indigo-600" /> Assign Editor</>}
                {modalType === 'reviewer' && <><Users className="text-emerald-600" /> Assign 2 Reviewers</>}
                {modalType === 'reject' && <><AlertCircle className="text-rose-600" /> Reject Manuscript</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8">
              <p className="text-sm text-gray-500 mb-4">
                Manuscript: <span className="font-bold text-gray-900">{selectedManuscript?.manuscriptId}</span>
              </p>

              {/* Editor Assignment */}
              {modalType === 'editor' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Select Editor</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={selectedEditor}
                    onChange={(e) => setSelectedEditor(e.target.value)}
                  >
                    <option value="">Choose an editor...</option>
                    {editors?.data?.map(ed => <option key={ed._id} value={ed._id}>{ed.name} ({ed.email})</option>)}
                  </select>
                  <button
                    onClick={handleAssignEditor}
                    disabled={isAssigningEditor}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex justify-center"
                  >
                    {isAssigningEditor ? <Loader2 className="animate-spin" /> : "Confirm Assignment"}
                  </button>
                </div>
              )}

              {/* Reviewer Assignment */}
              {modalType === 'reviewer' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase underline">Select Exactly 2 Reviewers</label>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {reviewers?.data?.map(rev => (
                      <label key={rev._id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedReviewers.includes(rev._id) ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 rounded"
                            checked={selectedReviewers.includes(rev._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedReviewers.length < 2) setSelectedReviewers([...selectedReviewers, rev._id]);
                                else toast.error("Only 2 reviewers allowed");
                              } else {
                                setSelectedReviewers(selectedReviewers.filter(id => id !== rev._id));
                              }
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{rev.name}</p>
                            <p className="text-[10px] text-gray-500">{rev.email}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleAssignReviewers}
                      disabled={isAssigningReviewer || selectedReviewers.length !== 2}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-gray-300 transition-all shadow-lg shadow-emerald-200 flex justify-center"
                    >
                      {isAssigningReviewer ? <Loader2 className="animate-spin" /> : `Assign ${selectedReviewers.length} / 2 Selected`}
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Modal */}
              {modalType === 'reject' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Reason for Rejection</label>
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm min-h-[120px]"
                    placeholder="Enter professional feedback for the author..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <button
                    onClick={handleReject}
                    disabled={isStatusUpdating}
                    className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex justify-center"
                  >
                    {isStatusUpdating ? <Loader2 className="animate-spin" /> : "Confirm Rejection"}
                  </button>
                </div>
              )}

              {/* Request Revision Modal */}
              {modalType === 'revise' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mb-2">
                    <p className="text-xs text-orange-800 font-medium">An email with a secure link will be sent to the author to fix these issues.</p>
                  </div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">What needs to be fixed?</label>
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm min-h-[120px]"
                    placeholder="e.g., Cover letter is missing, table formatting is incorrect..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <button
                    onClick={handleRequestRevision}
                    disabled={isStatusUpdating}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex justify-center"
                  >
                    {isStatusUpdating ? <Loader2 className="animate-spin" /> : "Send Revision Request"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSubmissions;