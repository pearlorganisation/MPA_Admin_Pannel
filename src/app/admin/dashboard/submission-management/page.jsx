"use client";
import React, { useState } from "react";
import {
  useGetAllSubmissionsQuery,
  useDeleteManuscriptAdminMutation,
  useEditManuscriptAdminMutation,
  useToggleEditorChoiceMutation
} from "../../../../services/manuscriptApi";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

// --- PROFESSIONAL SVG ICONS ---
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function SubmissionManagement() {
  // --- STATE MANAGEMENT ---
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal visibility states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [activeTab, setActiveTab] = useState("details"); // For Edit Modal

  // Selected Manuscript Data
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    discipline: "",
    manuscriptType: "",
    abstract: "",
    keywords: "",
    authors: [],
  });
  const [newFiles, setNewFiles] = useState({});

  // --- API HOOKS ---
  const { data, isLoading, isError, refetch } = useGetAllSubmissionsQuery({ page, limit });
  const [deleteManuscript, { isLoading: isDeleting }] = useDeleteManuscriptAdminMutation();
  const [editManuscript, { isLoading: isEditing }] = useEditManuscriptAdminMutation();
  const [toggleEditorChoice] = useToggleEditorChoiceMutation();
  // --- HANDLERS ---

  //Handle Toogle toggleEditorChoice
  const handleToggleEditorChoice = async (id, currentState) => {
    const loadingToast = toast.loading("Updating Editor Choice...");

    try {
      await toggleEditorChoice(id).unwrap();

      toast.dismiss(loadingToast);

      toast.success(
        currentState
          ? "Removed from Editor’s Choice"
          : "Marked as Editor’s Choice "
      );

      refetch();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  // Handle View (Read-Only)
  const handleOpenView = (manuscript) => {
    setSelectedManuscript(manuscript);
    setIsViewModalOpen(true);
  };

  // Handle Edit (Pre-fill Form)
  const handleOpenEdit = (manuscript) => {
    setSelectedManuscript(manuscript);
    setFormData({
      title: manuscript.title || "",
      discipline: manuscript.discipline || "",
      manuscriptType: manuscript.manuscriptType || "research",
      abstract: manuscript.abstract || "",
      keywords: Array.isArray(manuscript.keywords) ? manuscript.keywords.join(", ") : "",
      authors: manuscript.authors || [],
    });
    setNewFiles({});
    setActiveTab("details");
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteManuscript(deleteTargetId).unwrap();
      setDeleteTargetId(null);
      refetch();
    } catch (error) {
      alert("Delete failed: " + (error?.data?.message || "Error"));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Updating manuscript...");

    try {
      const submitData = new FormData();

      submitData.append("title", formData.title);
      submitData.append("discipline", formData.discipline);
      submitData.append("manuscriptType", formData.manuscriptType);
      submitData.append("abstract", formData.abstract);
      submitData.append("keywords", formData.keywords);
      submitData.append("authors", JSON.stringify(formData.authors));

      Object.keys(newFiles).forEach((key) => {
        if (newFiles[key]) {
          submitData.append(key, newFiles[key]);
        }
      });

      await editManuscript({
        id: selectedManuscript._id,
        formData: submitData,
      }).unwrap();

      toast.dismiss(loadingToast);

      toast.success("Updated successfully ");

      setIsEditModalOpen(false);
      refetch();

    } catch (error) {
      toast.dismiss(loadingToast);

      toast.error(error?.data?.message || "Update failed ");
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("pending") || s.includes("submitted")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (s.includes("review")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (s.includes("accept") || s.includes("published")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("reject")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (isError) return <div className="p-10 text-center text-red-500 font-semibold">Error loading data.</div>;

  const submissions = data?.submissions || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Submission Management</h1>
          <p className="text-slate-500 mt-1">Review, manage, and edit manuscript submissions professionally.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">Total Submissions:</span>
          <span className="ml-2 font-bold text-indigo-600">{data?.total || 0}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Manuscript ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Plagiarism</th>
                <th className="px-6 py-4 text-center text-amber-600">Choice</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub._id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600 uppercase">{sub.manuscriptId}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-medium max-w-xs truncate" title={sub.title}>{sub.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{sub.submittedBy?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`flex items-center justify-center flex-wrap  px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {sub.plagiarismStatus === "pending" ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 animate-pulse">
                        Checking...
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${sub.plagiarismScore > 40
                            ? "bg-red-100 text-red-600"
                            : sub.plagiarismScore > 20
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                            }`}
                        >
                          {sub.plagiarismScore}%
                        </span>

                        {/* mini progress bar */}
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sub.plagiarismScore > 40
                              ? "bg-red-500"
                              : sub.plagiarismScore > 20
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              }`}
                            style={{ width: `${sub.plagiarismScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleEditorChoice(sub._id, sub.isEditorChoice)}
                      disabled={sub.status !== "Published"}
                      className={`
      relative group inline-flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-500
      ${sub.status !== "Published" ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
      ${sub.isEditorChoice
                          ? "bg-amber-50 border-amber-200 shadow-sm"
                          : "bg-slate-50 border-transparent hover:border-slate-200"}
      border-2
    `}
                      title={sub.status !== "Published" ? "Only Published manuscripts can be Editor's Choice" : "Toggle Choice"}
                    >
                      <Star
                        size={18}
                        className={`transition-all duration-500 ${sub.isEditorChoice
                          ? "fill-amber-500 text-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "text-slate-300 group-hover:text-slate-400"
                          }`}
                      />

                      {/* Chota sa Indicator Text */}
                      <span className={`text-[8px] mt-1 font-bold uppercase tracking-widest transition-colors ${sub.isEditorChoice ? "text-amber-700" : "text-slate-400"
                        }`}>
                        {sub.isEditorChoice ? "Editor's Choice" : "Mark Choice"}
                      </span>

                      {/* Soft Glow effect for active items */}
                      {sub.isEditorChoice && (
                        <span className="absolute inset-0 rounded-xl border-amber-400 animate-pulse opacity-40"></span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenView(sub)} className="p-2 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg border border-transparent hover:border-slate-200 transition" title="View Details">
                      <EyeIcon />
                    </button>
                    <button onClick={() => handleOpenEdit(sub)} className="p-2 text-slate-600 hover:bg-white hover:text-amber-600 rounded-lg border border-transparent hover:border-slate-200 transition" title="Edit">
                      <EditIcon />
                    </button>
                    <button onClick={() => setDeleteTargetId(sub._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition">Next</button>
          </div>
        </div>
      </div>

      {/* --- VIEW DETAILS MODAL (READ ONLY) --- */}
      {isViewModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-start bg-slate-50">
              <div>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{selectedManuscript.manuscriptType}</span>
                <h2 className="text-2xl font-extrabold text-slate-800 mt-2">{selectedManuscript.title}</h2>
                <p className="text-sm text-slate-500 mt-1">Manuscript ID: <span className="text-indigo-600 font-mono font-bold">{selectedManuscript.manuscriptId}</span></p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition border border-slate-200"><CloseIcon /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Section 1: Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Abstract</h4>
                    <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedManuscript.abstract}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedManuscript.keywords?.map((kw, i) => (
                        <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                          {kw.replace(/[\[\]"]/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3">Submission Info</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Discipline:</span><span className="font-bold text-slate-800">{selectedManuscript.discipline}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Status:</span><span className={`font-bold ${getStatusColor(selectedManuscript.status)} px-2 rounded`}>{selectedManuscript.status}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Submitted:</span><span className="text-slate-800 font-medium">{new Date(selectedManuscript.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Authors */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Authors ({selectedManuscript.authors?.length} / 15)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedManuscript.authors?.map((author, idx) => (
                    <div key={idx} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition">
                      <span className="text-indigo-600 font-bold text-sm">{author.name}</span>
                      <span className="text-slate-500 text-xs">{author.email}</span>
                      <span className="text-slate-400 text-[11px] mt-2 italic">{author.affiliation || "No Affiliation"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Manuscript Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedManuscript.files || {}).map(([key, fileData]) => {
                    if (!fileData) return null;

                    if (Array.isArray(fileData)) {
                      return (
                        <div key={key} className="col-span-full">
                          <h3 className="text-sm font-bold text-slate-700 mb-3 capitalize">{key}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {fileData.map((imgObj, index) => {
                              const currentUrl = imgObj.url || "";
                              const clean = currentUrl.replace(".webp.webp", ".webp").replace(".jpeg.jpg", ".jpg");

                              return (
                                <div key={index} className="group relative rounded-xl overflow-hidden border shadow-sm">
                                  <img
                                    src={clean}
                                    className="w-full h-32 object-cover cursor-pointer group-hover:scale-105 transition"
                                    onClick={() => window.open(clean, "_blank")}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-3 transition">
                                    <a href={clean} target="_blank" className="bg-white p-2 rounded-full">👁</a>
                                    <a href={clean} download className="bg-white p-2 rounded-full">⬇</a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    const finalUrl = fileData?.url || fileData;
                    if (typeof finalUrl !== 'string') return null;

                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <a href={finalUrl} target="_blank" className="p-2 bg-white border rounded-lg hover:text-indigo-600 transition">
                          👁 View File
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition shadow-lg shadow-slate-200">Close Viewer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (EXISTING LOGIC) --- */}
      {isEditModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Edit Manuscript <span className="text-indigo-600 ml-2">#{selectedManuscript.manuscriptId}</span></h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><CloseIcon /></button>
            </div>

            <div className="flex bg-slate-50 px-6 border-b">
              {['details', 'authors', 'documents'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-4 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === t ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400'}`}>{t}</button>
              ))}
            </div>

            <form id="editForm" onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Title</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Discipline</label>
                    <input type="text" required value={formData.discipline} onChange={e => setFormData({ ...formData, discipline: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                    <select
                      value={formData.manuscriptType}
                      onChange={(e) =>
                        setFormData({ ...formData, manuscriptType: e.target.value })
                      }
                    >
                      <option value="Research Article">Research Article</option>
                      <option value="Review Article">Review Article</option>
                      <option value="Mini Review">Mini Review</option>
                      <option value="Systematic Review">Systematic Review</option>
                      <option value="Short Communication">Short Communication</option>
                      <option value="Case Report">Case Report</option>
                      <option value="Editorial">Editorial</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Abstract</label>
                    <textarea rows="6" value={formData.abstract} onChange={e => setFormData({ ...formData, abstract: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none" />
                  </div>
                </div>
              )}

              {activeTab === 'authors' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-slate-800 font-bold">Manage Authors</h3>
                    <button type="button" onClick={() => setFormData({ ...formData, authors: [...formData.authors, { name: '', email: '', affiliation: '' }] })} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200 transition">+ Add Author</button>
                  </div>
                  {formData.authors.map((auth, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 relative"
                    >
                      {/* NAME */}
                      <input
                        type="text"
                        placeholder="Name"
                        value={auth.name}
                        onChange={(e) => {
                          const updated = formData.authors.map((author, i) =>
                            i === idx ? { ...author, name: e.target.value } : author
                          );
                          setFormData({ ...formData, authors: updated });
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />

                      {/* EMAIL */}
                      <input
                        type="email"
                        placeholder="Email"
                        value={auth.email}
                        onChange={(e) => {
                          const updated = formData.authors.map((author, i) =>
                            i === idx ? { ...author, email: e.target.value } : author
                          );
                          setFormData({ ...formData, authors: updated });
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />

                      {/* AFFILIATION */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Affiliation"
                          value={auth.affiliation}
                          onChange={(e) => {
                            const updated = formData.authors.map((author, i) =>
                              i === idx ? { ...author, affiliation: e.target.value } : author
                            );
                            setFormData({ ...formData, authors: updated });
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              authors: formData.authors.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {["manuscriptFile", "coverLetter", "ethicalDeclaration", "aiReport", "figures", "tables"].map((fileKey) => (
                    <div key={fileKey} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">
                        {fileKey.replace(/([A-Z])/g, ' $1')}
                      </label>

                      <div className="text-[10px] mb-3 p-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium overflow-hidden truncate">
                        {(() => {
                          const fileData = selectedManuscript.files?.[fileKey];

                          if (!fileData) return "No file uploaded";

                          // Agar array hai (jaise Figures)
                          if (Array.isArray(fileData)) {
                            return `${fileData.length} files uploaded`;
                          }

                          // Agar object hai {url, publicId}, toh .url use karo, warna directly string use karo
                          const fileUrl = typeof fileData === 'object' ? fileData.url : fileData;

                          if (!fileUrl || typeof fileUrl !== 'string') return "No file path found";

                          return "Current: " + fileUrl.split("/").pop();
                        })()}
                      </div>

                      <input
                        type="file"
                        onChange={e => setNewFiles({ ...newFiles, [fileKey]: e.target.files[0] })}
                        className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div className="p-6 border-t flex justify-end gap-4 bg-slate-50">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-white transition">Cancel</button>
              <button
                type="submit"
                form="editForm"
                disabled={isEditing}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEditing ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Updating...
                  </>
                ) : (
                  "Save All Updates"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[70]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrashIcon /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Manuscript?</h3>
            <p className="text-slate-500 text-sm mb-6">This will permanently remove the submission and all uploaded files. This action is irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}