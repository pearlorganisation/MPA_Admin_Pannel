"use client";

import React, { useEffect, useState } from "react";
import { useGetAllSubmissionsQuery } from "../../../../services/manuscriptApi";
import { 
  CheckCheck, Bell, Clock, FileText, User, 
  ChevronRight, X, Calendar, Tag, Users, Info, ExternalLink, 
  FileDown, ShieldCheck, Image as ImageIcon, Table as TableIcon
} from "lucide-react";

const ActivityCenter = () => {
  const { data, isLoading } = useGetAllSubmissionsQuery();
  const [notifications, setNotifications] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  const formatFileName = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getFileIcon = (key) => {
    if (key.toLowerCase().includes('ethical')) return <ShieldCheck size={16} />;
    if (key.toLowerCase().includes('figure')) return <ImageIcon size={16} />;
    if (key.toLowerCase().includes('table')) return <TableIcon size={16} />;
    return <FileText size={16} />;
  };

  useEffect(() => {
    if (data?.submissions) {
      const saved = JSON.parse(localStorage.getItem("readManuscripts") || "[]");
      const mapped = data.submissions.map((m) => ({
        ...m,
        isRead: saved.includes(m._id),
      }));
      setNotifications([...mapped].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, [data]);

  const markAsRead = (id) => {
    const saved = JSON.parse(localStorage.getItem("readManuscripts") || "[]");
    if (!saved.includes(id)) {
      const updated = [...saved, id];
      localStorage.setItem("readManuscripts", JSON.stringify(updated));
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    }
  };

  const handleViewDetails = (submission) => {
    // DEBUG LOG: Open your browser console to see if all 5 files exist here
    console.log("Full Submission Data:", submission);
    console.log("Files Object:", submission.files);
    
    setSelectedSubmission(submission);
    markAsRead(submission._id);
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n._id);
    localStorage.setItem("readManuscripts", JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="text-blue-600" /> Activity Center
          </h2>
          <p className="text-slate-500 mt-1">Real-time manuscript tracking system</p>
        </div>
        <button onClick={markAllAsRead} className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No activity recorded yet.</p>
          </div>
        ) : (
          notifications.map((m) => (
            <div key={m._id} onClick={() => handleViewDetails(m)} className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:border-blue-300 ${m.isRead ? "bg-white border-slate-100 opacity-80" : "bg-white border-blue-100 shadow-md ring-1 ring-blue-50"}`}>
              {!m.isRead && <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-600 rounded-full" />}
              <div className={`p-3 rounded-xl ${m.isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}><FileText size={22} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-4">
                  <h4 className={`font-bold text-lg truncate ${m.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{m.manuscriptId}: {m.title}</h4>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${m.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{m.status}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium"><User size={14} className="text-slate-400" /><span>{m.submittedBy?.name}</span></div>
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /><span>{timeAgo(m.createdAt)}</span></div>
                </div>
              </div>
              <div className="flex items-center self-center pl-2"><ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${m.isRead ? 'text-slate-300' : 'text-blue-400'}`} /></div>
            </div>
          ))
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white"><Info size={20} /></div>
                <div><h3 className="font-bold text-slate-900 leading-none">{selectedSubmission.manuscriptId}</h3><p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Full Submission Details</p></div>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div><h2 className="text-xl font-bold text-slate-900 leading-snug">{selectedSubmission.title}</h2></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-1"><Clock size={14} /> Submission Date</div>
                  <p className="text-sm font-semibold text-slate-800">{new Date(selectedSubmission.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-1"><Users size={14} /> Authors</div>
                  <p className="text-sm font-semibold text-slate-800">{selectedSubmission.authors?.length || 0} Listed</p>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">Abstract</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl whitespace-pre-line">{selectedSubmission.abstract}</p>
              </div>
               <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">Manuscript Type</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl whitespace-pre-line">{selectedSubmission.manuscriptType}</p>
              </div>

              {/* ENHANCED FILE SECTION: Handling all potential schema keys */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">All Submitted Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["manuscriptFile", "coverLetter", "figures", "tables", "ethicalDeclaration"].map((key) => {
                    const fileData = selectedSubmission.files?.[key];
                    // Handle if fileData is a string URL or an object from Cloudinary
                    const url = typeof fileData === 'string' ? fileData : fileData?.[0]?.path || fileData?.path;

                    return url ? (
                      <a key={key} href={url} target="_blank" className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">{getFileIcon(key)}</div>
                          <span className="text-xs font-bold text-slate-700">{formatFileName(key)}</span>
                        </div>
                        <FileDown size={14} className="text-slate-400 group-hover:text-blue-600" />
                      </a>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">Author Details</h4>
                <div className="space-y-2">
                  {selectedSubmission.authors?.map((auth, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                      <p className="font-bold text-slate-800 text-sm">{auth.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-xs text-slate-500">{auth.email}</p>
                        <p className="text-xs text-blue-600 font-medium">{auth.affiliation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">Keywords</h4>
                 <div className="flex flex-wrap gap-2 pt-2">
                {selectedSubmission.keywords?.map((kw, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                    <Tag size={10} /> {kw.trim()}
                  </span>
                ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <a href={selectedSubmission.files?.manuscriptFile?.url} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200">
                <ExternalLink size={18} /> Open Main Manuscript
              </a>
              <button onClick={() => setSelectedSubmission(null)} className="px-6 py-3 border border-slate-200 font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-all bg-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCenter;