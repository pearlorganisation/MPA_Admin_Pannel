"use client";

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useGetAssignedToEditorQuery } from "../../../../services/manuscriptApi";

export default function Activity() {
  // Fetch manuscripts assigned to this editor using RTK Query
  const { data, isLoading, isError } = useGetAssignedToEditorQuery();

  // State to store which manuscripts have been read
  const [readItems, setReadItems] = useState([]);

  // State to handle the modal (stores the currently selected manuscript)
  const [selectedManuscript, setSelectedManuscript] = useState(null);

  // Load read manuscripts from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("readManuscripts") || "[]");
      setReadItems(saved);
    }
  }, []);

  // Function to open modal and mark manuscript as read
  const handleViewDetails = (manuscript) => {
    setSelectedManuscript(manuscript); // Open modal with this data

    // Check if the manuscript is NOT in the read list
    if (!readItems.includes(manuscript._id)) {
      const newReadItems = [...readItems, manuscript._id];

      // Update local state
      setReadItems(newReadItems);

      // Save to localStorage
      localStorage.setItem("readManuscripts", JSON.stringify(newReadItems));

      // IMPORTANT: Dispatch custom event to instantly update the Sidebar badge
      window.dispatchEvent(new Event("manuscriptRead"));
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedManuscript(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Failed to load activity. Please try again.
      </div>
    );
  }

  const manuscripts = data?.manuscripts || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
          <Icons.BellRing className="text-indigo-600" size={32} />
          Activity Center
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          View your newly assigned manuscripts and recent updates here.
        </p>
      </div>

      {/* Manuscripts Grid */}
      {manuscripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-200 rounded-2xl dark:bg-slate-900/50 dark:border-slate-800">
          <Icons.Inbox size={48} className="text-slate-400 mb-4" />
          <p className="text-slate-500 font-medium">No manuscripts assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manuscripts.map((manuscript) => {
            const isRead = readItems.includes(manuscript._id);

            return (
              <div
                key={manuscript._id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl cursor-pointer ${isRead
                  ? "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-80 hover:opacity-100" // Read styling
                  : "bg-indigo-50 border-indigo-200 shadow-md dark:bg-indigo-950/20 dark:border-indigo-500/30" // Unread styling
                  }`}
                onClick={() => handleViewDetails(manuscript)}
              >
                {/* "New" Badge for unread items */}
                {!isRead && (
                  <span className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                  </span>
                )}

                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md">
                    {manuscript.manuscriptId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full">
                    {manuscript.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2">
                  {manuscript.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4">
                  <Icons.User size={14} />
                  {manuscript.submittedBy?.name || "Unknown Author"}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Icons.Calendar size={12} />
                    {new Date(manuscript.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
                    View Details <Icons.ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL DESIGN --- */}
      {selectedManuscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div
            className="bg-white dark:bg-slate-950 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icons.FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    Manuscript Details
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedManuscript.manuscriptId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 rounded-full transition-colors"
              >
                <Icons.X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

              {/* Title & Status */}
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
                  {selectedManuscript.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-full text-sm font-semibold">
                  <Icons.Activity size={16} /> Status: {selectedManuscript.status}
                </span>
              </div>

              {/* Abstract */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Icons.AlignLeft size={18} /> Abstract
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  {selectedManuscript.abstract}
                </p>
              </div>

              {/* Authors List */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Icons.Users size={18} /> Authors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedManuscript.authors?.map((author, index) => (
                    <div key={index} className="flex flex-col p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{author.name}</span>
                      <span className="text-xs text-slate-500 truncate">{author.email}</span>
                      <span className="text-xs text-slate-400 mt-1 italic">{author.affiliation}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Downloadable Files Section */}
              {selectedManuscript.files && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Icons.Download size={18} /> Attachments
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {/* Loop through the files object and display buttons for available files */}
                    {Object.entries(selectedManuscript.files).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <a
                          key={key}
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          <Icons.File size={16} className="text-indigo-500" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-600/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}