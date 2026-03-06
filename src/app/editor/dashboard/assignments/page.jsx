"use client";
import React, { useState, useMemo } from "react";
import { useGetAssignedToEditorQuery } from "../../../../services/manuscriptApi";

export default function ReviewersManagement() {
  // 1. Fetch data using RTK Query (No changes to your API integration)
  const { data, isLoading, isError } = useGetAssignedToEditorQuery();

  // 2. States for Search, Sorting, Pagination, and Modal
  const[searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const[itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedManuscript, setSelectedManuscript] = useState(null); // For View Modal

  // Extract manuscripts from response
  const manuscripts = data?.manuscripts ||[];

  // 3. Filter Logic (Search functionality)
  const filteredManuscripts = useMemo(() => {
    return manuscripts.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchLower) ||
        item.manuscriptId?.toLowerCase().includes(searchLower) ||
        item.submittedBy?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [manuscripts, searchTerm]);

  // 4. Sorting Logic
  const sortedManuscripts = useMemo(() => {
    let sortableItems = [...filteredManuscripts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        // Determine which field to sort by
        if (sortConfig.key === "submittedBy.name") {
          aValue = a.submittedBy?.name || "";
          bValue = b.submittedBy?.name || "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  },[filteredManuscripts, sortConfig]);

  // 5. Pagination Logic
  const totalPages = Math.ceil(sortedManuscripts.length / itemsPerPage);
  const paginatedManuscripts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedManuscripts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedManuscripts, currentPage, itemsPerPage]);

  // Handle Sort Click
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to render status with color badges
  const renderStatusBadge = (status) => {
    const statusColors = {
      "Submitted": "bg-gray-100 text-gray-800 border-gray-200",
      "Editor Assigned": "bg-blue-100 text-blue-800 border-blue-200",
      "Under Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Revision Required": "bg-purple-100 text-purple-800 border-purple-200",
      "Accepted": "bg-green-100 text-green-800 border-green-200",
      "Rejected": "bg-red-100 text-red-800 border-red-200",
      "Published": "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    const colorClass = statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 font-semibold text-lg">Error loading manuscripts.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and view all manuscripts assigned to you.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by Title, ID, or Author..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Table Headers with Sorting functionality */}
                  {[
                    { label: "Manuscript ID", key: "manuscriptId" },
                    { label: "Title", key: "title" },
                    { label: "Submitted By", key: "submittedBy.name" },
                    { label: "Status", key: "status" },
                    { label: "Date", key: "createdAt" }
                  ].map((header) => (
                    <th
                      key={header.key}
                      onClick={() => requestSort(header.key)}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {header.label}
                        {sortConfig?.key === header.key && (
                          <span className="text-gray-400">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedManuscripts.length > 0 ? (
                  paginatedManuscripts.map((manuscript) => (
                    <tr key={manuscript._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {manuscript.manuscriptId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={manuscript.title}>
                        {manuscript.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {manuscript.submittedBy?.name || "Unknown"}
                        <div className="text-xs text-gray-400">{manuscript.submittedBy?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(manuscript.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(manuscript.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => setSelectedManuscript(manuscript)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No manuscripts found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between sm:flex-row flex-col gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{paginatedManuscripts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, sortedManuscripts.length)}</span> of <span className="font-semibold text-gray-900">{sortedManuscripts.length}</span> results
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  currentPage === totalPages || totalPages === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Detail View Modal */}
      {selectedManuscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manuscript Details</h2>
                <p className="text-sm text-blue-600 font-medium">{selectedManuscript.manuscriptId}</p>
              </div>
              <button 
                onClick={() => setSelectedManuscript(null)}
                className="text-gray-400 hover:text-red-500 transition-colors bg-gray-200 hover:bg-red-100 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedManuscript.title}</h3>
                   <div className="flex gap-3 items-center">
                     {renderStatusBadge(selectedManuscript.status)}
                     <span className="text-sm text-gray-500">Submitted on: {formatDate(selectedManuscript.createdAt)}</span>
                   </div>
                 </div>
              </div>

              {/* Abstract Section */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 border-b pb-1">Abstract</h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {selectedManuscript.abstract}
                </p>
              </div>

              {/* Authors & Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b pb-1">Authors</h4>
                  <ul className="space-y-3">
                    {selectedManuscript.authors?.map((author, index) => (
                      <li key={index} className="bg-blue-50/50 p-3 rounded-md border border-blue-100">
                        <p className="font-semibold text-gray-900 text-sm">{author.name}</p>
                        <p className="text-xs text-gray-500">{author.email}</p>
                        <p className="text-xs text-gray-500 italic">{author.affiliation}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b pb-1">Additional Info</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Keywords</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {/* Handling edge case if keywords are saved as stringified arrays by backend */}
                        {selectedManuscript.keywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">
                            {kw.replace(/[\[\]"]/g, '')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                       <p className="text-xs font-semibold text-gray-500 uppercase">Reviewers Assigned</p>
                       <p className="text-sm text-gray-800 font-medium">{selectedManuscript.assignedReviewers?.length || 0} Reviewers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Files Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b pb-1">Uploaded Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedManuscript.files || {}).map(([key, url]) => {
                    if (!url) return null;
                    // Format key into readable text (e.g. manuscriptFile -> Manuscript File)
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    return (
                      <a 
                        key={key} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group bg-white"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                           </div>
                           <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedManuscript(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}