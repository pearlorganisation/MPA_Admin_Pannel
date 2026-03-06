"use client";
import React, { useState } from "react";
import {
  useGetAssignedToEditorQuery,
  useAssignReviewersMutation,
  useUpdateStatusMutation,
} from "../../../../services/manuscriptApi";
import { useGetAllReviewersQuery } from "../../../../services/userApi";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  FileText,
  X,
  MessageSquare,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewersManagement() {
  // --- RTK Query Hooks ---
  const { data: manuscriptData, isLoading: isLoadingManuscripts } = useGetAssignedToEditorQuery();
  const { data: reviewersData, isLoading: isLoadingReviewers } = useGetAllReviewersQuery();
  const [assignReviewers, { isLoading: isAssigning }] = useAssignReviewersMutation();
  const [updateStatus, { isLoading: isRejecting }] = useUpdateStatusMutation();

  // --- States ---
  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'reject' | null
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [rejectFeedback, setRejectFeedback] = useState("");

  // Extract arrays from API response
  const manuscripts = manuscriptData?.manuscripts ||[];
  const availableReviewers = reviewersData?.data ||[];

  // --- Modal Handlers ---
  const openAssignModal = (manuscript) => {
    setSelectedManuscript(manuscript);
    setSelectedReviewers([]);
    setActiveModal("assign");
  };

  const openRejectModal = (manuscript) => {
    setSelectedManuscript(manuscript);
    setRejectFeedback("");
    setActiveModal("reject");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedManuscript(null);
    setSelectedReviewers([]);
    setRejectFeedback("");
  };

  // --- Actions ---
  const toggleReviewerSelection = (reviewerId) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(selectedReviewers.filter((id) => id !== reviewerId));
    } else {
      if (selectedReviewers.length < 2) {
        setSelectedReviewers([...selectedReviewers, reviewerId]);
      } else {
        toast.error("You can only select exactly 2 reviewers.");
      }
    }
  };

  const handleSubmitAssignment = async () => {
    if (selectedReviewers.length !== 2) {
      toast.error("Please select exactly 2 reviewers before assigning.");
      return;
    }

    try {
      await assignReviewers({
        manuscriptId: selectedManuscript._id,
        reviewerIds: selectedReviewers,
      }).unwrap();

      toast.success("Reviewers assigned successfully!");
      closeModal();
    } catch (error) {
      console.error("Failed to assign reviewers:", error);
      toast.error(error?.data?.message || "Something went wrong while assigning.");
    }
  };

  const handleRejectManuscript = async () => {
    if (!rejectFeedback.trim()) {
      toast.error("Please provide feedback for rejection.");
      return;
    }

    try {
      await updateStatus({
        manuscriptId: selectedManuscript._id,
        status: "Rejected",
        feedback: rejectFeedback,
      }).unwrap();

      toast.success("Manuscript rejected and author notified via email!");
      closeModal();
    } catch (error) {
      console.error("Failed to reject manuscript:", error);
      toast.error(error?.data?.message || "Failed to reject manuscript.");
    }
  };

  // --- Helper: Status Badge Color ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Under Review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Editor Assigned":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (isLoadingManuscripts) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading manuscripts...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Reviewer Management
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Manage your assigned manuscripts. Assign reviewers or reject with feedback.
          </p>
        </div>
      </div>

      {/* Manuscript Table */}
      {manuscripts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-200 flex flex-col items-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Manuscripts Assigned</h3>
          <p className="text-gray-500 max-w-md">
            You currently have no manuscripts to manage. New assignments will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Manuscript Details</th>
                  <th className="px-6 py-4 font-semibold">Author</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manuscripts.map((manuscript) => (
                  <tr
                    key={manuscript._id}
                    className="hover:bg-gray-50 transition duration-150 group"
                  >
                    {/* Details Column */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                          {manuscript.manuscriptId}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                          {manuscript.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {manuscript.abstract}
                        </p>
                      </div>
                    </td>

                    {/* Author Column */}
                    <td className="px-6 py-5 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {manuscript.submittedBy?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {manuscript.submittedBy?.name || "Unknown Author"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {manuscript.submittedBy?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-5 align-top whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          manuscript.status
                        )}`}
                      >
                        {manuscript.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-5 align-top text-right">
                      {manuscript.status === "Rejected" ? (
                        <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg">
                          <XCircle className="w-4 h-4" /> Rejected
                        </span>
                      ) : manuscript.assignedReviewers?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                          <CheckCircle className="w-4 h-4" /> Assigned
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {/* Assign Button */}
                          <button
                            onClick={() => openAssignModal(manuscript)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                            title="Assign Reviewers"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Assign</span>
                          </button>
                          
                          {/* Reject Button */}
                          <button
                            onClick={() => openRejectModal(manuscript)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                            title="Reject Manuscript"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Assign Reviewers Modal --- */}
      {activeModal === "assign" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Assign Reviewers
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow bg-gray-50/50">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                  Selected Manuscript
                </p>
                <p className="text-gray-900 font-semibold">{selectedManuscript?.title}</p>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">Available Reviewers</h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    selectedReviewers.length === 2
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  Selected: {selectedReviewers.length} / 2
                </span>
              </div>

              {isLoadingReviewers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableReviewers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-100">
                  <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>No reviewers found in the system.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableReviewers.map((reviewer) => {
                    const isSelected = selectedReviewers.includes(reviewer._id);
                    const isDisabled = !isSelected && selectedReviewers.length >= 2;

                    return (
                      <label
                        key={reviewer._id}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                            : "border-gray-200 hover:border-blue-300 hover:bg-white bg-white shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {reviewer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{reviewer.name}</p>
                            <p className="text-sm text-gray-500">{reviewer.email}</p>
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                            checked={isSelected}
                            onChange={() => toggleReviewerSelection(reviewer._id)}
                            disabled={isDisabled}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={selectedReviewers.length !== 2 || isAssigning}
                className={`px-6 py-2.5 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                  selectedReviewers.length === 2
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer hover:shadow-md"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Reject Manuscript Modal --- */}
      {activeModal === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Reject Manuscript
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-700 bg-white hover:bg-red-50 p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white">
              <p className="text-sm text-gray-600 mb-4">
                You are about to reject the manuscript <span className="font-bold text-gray-900">"{selectedManuscript?.title}"</span>. 
                The researcher will receive an automated email notifying them of this decision along with your feedback below.
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Rejection Feedback (Required)
                </label>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm text-gray-800 resize-none bg-gray-50 focus:bg-white"
                  placeholder="Provide a detailed reason for rejecting this manuscript..."
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectManuscript}
                disabled={isRejecting || !rejectFeedback.trim()}
                className={`px-6 py-2.5 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                  !rejectFeedback.trim()
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 hover:shadow-md cursor-pointer"
                }`}
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}