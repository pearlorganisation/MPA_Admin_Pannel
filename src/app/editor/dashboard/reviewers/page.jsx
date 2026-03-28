"use client";
import React, { useState, useMemo } from "react";
import {
  useGetAssignedToEditorQuery,
  useAssignReviewersMutation,
  useUpdateStatusMutation,
} from "../../../../services/manuscriptApi";
import { useGetAllReviewersQuery } from "../../../../services/userApi";
import {
  Users,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  X,
  MessageSquare,
  Search,
  ChevronRight,
  ChevronLeft,
  FileUp,
  History,
  Clock,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewersManagement() {
  // --- RTK Query Hooks ---
  const { data: manuscriptData, isLoading: isLoadingManuscripts, refetch } = useGetAssignedToEditorQuery();
  const { data: reviewersData, isLoading: isLoadingReviewers } = useGetAllReviewersQuery();
  const [assignReviewers, { isLoading: isAssigning }] = useAssignReviewersMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateStatusMutation();

  // --- States ---
  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'revision' | null
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [revisionFile, setRevisionFile] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const manuscripts = manuscriptData?.manuscripts || [];
  const availableReviewers = reviewersData?.data || [];

  const filteredManuscripts = useMemo(() => {
    return manuscripts.filter(m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manuscriptId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [manuscripts, searchQuery]);

  const totalPages = Math.ceil(filteredManuscripts.length / itemsPerPage);
  const paginatedManuscripts = filteredManuscripts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openAssignModal = (manuscript) => {
    setSelectedManuscript(manuscript);
    setSelectedReviewers(manuscript.assignedReviewers || []);
    setActiveModal("assign");
  };

  const openRevisionModal = (manuscript) => {
    setSelectedManuscript(manuscript);
    setRevisionFeedback("");
    setRevisionFile(null);
    setActiveModal("revision");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedManuscript(null);
    setSelectedReviewers([]);
    setRevisionFeedback("");
    setRevisionFile(null);
  };

  const toggleReviewerSelection = (reviewerId) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(selectedReviewers.filter((id) => id !== reviewerId));
    } else {
      setSelectedReviewers([...selectedReviewers, reviewerId]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (selectedReviewers.length < 2) {
      toast.error("Please select at least 2 reviewers.");
      return;
    }
    try {
      await assignReviewers({ manuscriptId: selectedManuscript._id, reviewerIds: selectedReviewers }).unwrap();
      toast.success("Reviewers assigned successfully!");
      closeModal();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign reviewers.");
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast.error("Please provide revision instructions.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("manuscriptId", selectedManuscript._id);
      formData.append("status", "Revision Required");
      formData.append("feedback", revisionFeedback);
      if (revisionFile) formData.append("feedbackFile", revisionFile);
      await updateStatus(formData).unwrap();
      toast.success("Revision request sent!");
      closeModal();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to process revision.");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      "Editor Assigned": "bg-blue-50 text-blue-700 border-blue-100",
      "Under Review": "bg-indigo-50 text-indigo-700 border-indigo-100",
      "Revision Required": "bg-amber-50 text-amber-700 border-amber-100",
      "Submitted": "bg-slate-50 text-slate-700 border-slate-100",
      "Rejected": "bg-red-50 text-red-700 border-red-100",
      "Accepted": "bg-emerald-50 text-emerald-700 border-emerald-100",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  if (isLoadingManuscripts) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Editorial Review Board
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage peer review and manuscript revisions.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID or Title..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-4">
        {paginatedManuscripts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">No manuscripts found</h3>
          </div>
        ) : (
          paginatedManuscripts.map((manuscript) => (
            <div key={manuscript._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded uppercase">{manuscript.manuscriptId}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusStyle(manuscript.status)}`}>{manuscript.status}</span>
                    {manuscript.isRevised && <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100"><History className="w-3 h-3" /> Revised</span>}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{manuscript.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(manuscript.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 uppercase tracking-tighter bg-slate-100 px-1.5 rounded">{manuscript.manuscriptType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:border-l lg:pl-6 border-slate-100">
                  <button onClick={() => openAssignModal(manuscript)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm">
                    <UserPlus className="w-4 h-4" /> Assign Reviewers
                  </button>
                  <button onClick={() => openRevisionModal(manuscript)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                    <MessageSquare className="w-4 h-4 text-amber-500" /> Revision
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border border-slate-200 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border border-slate-200 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* --- MODALS (Standard Conditional Rendering) --- */}
      {activeModal === "assign" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Assign Reviewers</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-3">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-800">
                <strong>Guideline:</strong> You must select at least 2 reviewers to proceed.
              </div>
              {availableReviewers.map((reviewer) => {
                const isSelected = selectedReviewers.includes(reviewer._id);
                return (
                  <label key={reviewer._id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{reviewer.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{reviewer.name}</p>
                        <p className="text-xs text-slate-500">{reviewer.email}</p>
                      </div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600" checked={isSelected} onChange={() => toggleReviewerSelection(reviewer._id)} />
                  </label>
                );
              })}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">{selectedReviewers.length} Reviewers Selected</span>
              <div className="flex gap-3">
                <button onClick={closeModal} className="px-5 py-2.5 text-slate-500 font-bold text-sm">Cancel</button>
                <button disabled={selectedReviewers.length < 2 || isAssigning} onClick={handleSubmitAssignment} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {isAssigning ? "Processing..." : "Assign & Notify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "revision" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-amber-500" /> Request Revision</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <textarea
                rows={5}
                className="w-full border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-slate-50/50"
                placeholder="Enter detailed feedback for the author..."
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
              />
              {!revisionFile ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center relative hover:bg-slate-50 transition-all">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setRevisionFile(e.target.files[0])} />
                  <FileUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Attach annotated manuscript (Optional)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-600" /><span className="text-sm font-medium text-slate-700 truncate">{revisionFile.name}</span></div>
                  <button onClick={() => setRevisionFile(null)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2.5 text-slate-500 font-bold text-sm">Cancel</button>
              <button disabled={!revisionFeedback.trim() || isUpdating} onClick={handleRequestRevision} className="px-8 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all">
                {isUpdating ? "Sending..." : "Request Revision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}