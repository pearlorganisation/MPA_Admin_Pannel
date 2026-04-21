"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSubmitReviewMutation } from "../../../../../services/reviewerApi";
import { UploadCloud, CheckCircle, ArrowLeft, FileText, Info } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGetReviewerAssignmentsQuery  } from "../../../../../services/reviewerApi";

export default function SubmitReviewPage() {
  const { id: reviewId } = useParams();
  const router = useRouter();
  const [submitReview, { isLoading }] = useSubmitReviewMutation();
  const { data } = useGetReviewerAssignmentsQuery();

  // Form state
  const [formData, setFormData] = useState({
    originality: 3,
    clarity: 3,
    methodology: 3,
    contribution: 3,
    commentsToAuthor: "",
    commentsToEditor: "",
    recommendation: "",
  });
  const [file, setFile] = useState(null);
  const currentReview = data?.reviews?.find(r => r._id === reviewId);
  const manuscript = currentReview?.manuscriptId;

  // Update form state on input change
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recommendation) return toast.error("Please select a recommendation");

    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
    if (file) payload.append("annotatedFile", file);

    try {
      await submitReview({ reviewId, formData: payload }).unwrap();
      toast.success("Review submitted successfully!");
      router.push("/reviewer/dashboard/papers");
    } catch (err) {
      toast.error(err?.data?.message || "Submission failed");
    }
  };

  // Helper component for the 1-5 rating system
  const renderRating = (name, label) => (
    <div className="mb-6">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 italic">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <label
            key={num}
            className={`flex-1 flex items-center justify-center h-12 rounded-xl border-2 cursor-pointer transition-all font-bold text-sm ${Number(formData[name]) === num
              ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm"
              : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
          >
            <input type="radio" name={name} value={num} className="hidden" onChange={handleInputChange} />
            {num}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-700">

      {/* Navigation Header */}
      <Link href="/reviewer/dashboard/papers" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Assignments
      </Link>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">

        {/* Form Title Section */}
        <div className="bg-slate-50/50 border-b border-slate-100 p-8 lg:p-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manuscript Review Form</h1>
          <p className="text-slate-500 mt-2">Please provide your expert evaluation and recommendation below.</p>
        </div>

        {/*  REVISION SECTION (NEW) */}
        {manuscript?.files?.reviewChecklist && (
          <div className="bg-white border-2 border-emerald-500/20 p-6 rounded-[24px] shadow-sm flex justify-between items-center mb-6">

            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-emerald-900 font-bold text-lg">
                  Researcher Revision Attached
                </p>
                <p className="text-slate-500 text-sm italic">
                  The author has submitted a point-by-point response to previous comments.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {manuscript?.files?.manuscriptFile?.url && (
                <a
                  href={manuscript.files.manuscriptFile}
                  target="_blank"
                  className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Revised MS
                </a>
              )}

              <a
                href={manuscript.files.reviewChecklist}
                target="_blank"
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
              >
                Checklist
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-12">

          {/* Top Section: Scores and Decision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left Column: Evaluation Scores */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <span className="p-2 bg-orange-100 rounded-lg text-orange-600"><Info size={18} /></span>
                <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Evaluation Scores (1-5)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6">
                {renderRating("originality", "Originality of Work")}
                {renderRating("clarity", "Clarity & Presentation")}
                {renderRating("methodology", "Research Methodology")}
                {renderRating("contribution", "Academic Contribution")}
              </div>
            </div>

            {/* Right Column: Decisions and Files */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText size={18} /></span>
                <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Decision & Attachments</h3>
              </div>

              {/* Recommendation Dropdown */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Final Recommendation *</label>
                <select
                  name="recommendation"
                  required
                  value={formData.recommendation}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="">-- Select Decision --</option>
                  <option value="Accept">Accept Manuscript</option>
                  <option value="Minor revisions">Minor Revisions</option>
                  <option value="Major revisions">Major Revisions</option>
                  <option value="Reject">Reject Manuscript</option>
                </select>
              </div>

              {/* File Upload Area */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Annotated Manuscript (Optional)</label>
                <div className="relative group">
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="file-upload" />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:bg-slate-50 hover:border-orange-300 transition-all cursor-pointer group"
                  >
                    <div className="bg-orange-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8 text-orange-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {file ? file.name : "Click to upload annotated file"}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">PDF, DOCX up to 10MB</p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Text Feedback */}
          <div className="space-y-8 pt-8 border-t border-slate-100">
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Detailed Comments to the Author</label>
              <textarea
                name="commentsToAuthor"
                rows="6"
                value={formData.commentsToAuthor}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-6 rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none transition-all"
                placeholder="Share constructive feedback to help the authors improve their work..."
              ></textarea>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Confidential Comments to Editor</label>
              <textarea
                name="commentsToEditor"
                rows="4"
                value={formData.commentsToEditor}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-6 rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none transition-all"
                placeholder="Provide internal notes that won't be visible to the authors..."
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-200 active:scale-[0.98]"
            >
              {isLoading ? (
                "Submitting Review..."
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Submit Final Review
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-4 font-medium uppercase tracking-tighter">
              Once submitted, you will not be able to edit this review.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}