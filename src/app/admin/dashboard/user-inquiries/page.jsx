"use client";
import React, { useState } from 'react';
import { 
    useGetEnquiriesQuery, 
    useDeleteEnquiryMutation 
} from "../../../../services/enquiryApi"; 
import { 
    Eye, Trash2, X, ChevronLeft, ChevronRight, Mail, 
    MessageSquare, Clock, AlertCircle, Loader2, Reply, AlertTriangle
} from 'lucide-react';

export default function AdminEnquiry() {
    // ==========================================
    // 1. RTK Query Hooks (Backend Communication)
    // ==========================================
    const { data: response, isLoading, isError } = useGetEnquiriesQuery();
    const [deleteEnquiry, { isLoading: isDeleting }] = useDeleteEnquiryMutation();

    // ==========================================
    // 2. Component State Management
    // ==========================================
    const [currentPage, setCurrentPage] = useState(1);
    const[selectedEnquiry, setSelectedEnquiry] = useState(null); // For View Modal
    const [enquiryToDelete, setEnquiryToDelete] = useState(null); // For Delete Confirmation Modal
    
    const itemsPerPage = 8;

    // ==========================================
    // 3. Data Extraction & Pagination Logic
    // ==========================================
    // Extract data array from response (default to empty array if undefined)
    const enquiries = response?.data ||[];

    // Calculate pagination details
    const totalPages = Math.ceil(enquiries.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = enquiries.slice(indexOfFirstItem, indexOfLastItem);

    // ==========================================
    // 4. Helper Functions
    // ==========================================
    
    // Function to handle the actual deletion process
    const confirmDelete = async () => {
        if (!enquiryToDelete) return;
        
        try {
            await deleteEnquiry(enquiryToDelete).unwrap();
            // If we delete the last item on the current page, go back one page
            if (currentItems.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            }
            setEnquiryToDelete(null); // Close modal on success
        } catch (error) {
            console.error("Failed to delete enquiry:", error);
            alert("Failed to delete enquiry. Please try again.");
        }
    };

    // Function to format the date in a clean, modern way
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // Generate initials for the user avatar (e.g., "John Doe" -> "JD")
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // ==========================================
    // 5. Conditional Rendering (Loading & Error States)
    // ==========================================
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium text-lg animate-pulse">Fetching Enquiries...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to load data</h2>
                    <p className="text-slate-500 text-sm">There was a problem fetching the user enquiries. Please check your connection or try refreshing the page.</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // 6. Main UI Render
    // ==========================================
    return (
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            User Enquiries
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 ml-12">
                            Manage, view, and reply to all incoming messages from users.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-sm font-semibold text-slate-700">
                            Total Records: <span className="text-indigo-600">{enquiries.length}</span>
                        </span>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap sm:whitespace-normal">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-5">User Info</th>
                                    <th className="px-6 py-5">Subject & Message</th>
                                    <th className="px-6 py-5">Received Date</th>
                                    <th className="px-6 py-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentItems.length > 0 ? (
                                    currentItems.map((enquiry) => (
                                        <tr key={enquiry._id} className="hover:bg-slate-50/80 transition-all group">
                                            {/* User Info Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-inner shrink-0">
                                                        {getInitials(enquiry.name)}
                                                    </div>
                                                    <div className="flex flex-col min-w-[120px]">
                                                        <span className="font-semibold text-slate-800">{enquiry.name}</span>
                                                        <a href={`mailto:${enquiry.email}`} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                                                            {enquiry.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Subject & Message Column */}
                                            <td className="px-6 py-4 max-w-[300px]">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-800 font-semibold truncate text-sm mb-0.5" title={enquiry.subject}>
                                                        {enquiry.subject}
                                                    </span>
                                                    <span className="text-sm text-slate-500 truncate" title={enquiry.message}>
                                                        {enquiry.message}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                    {formatDate(enquiry.createdAt)}
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    {/* Quick Reply Action */}
                                                    <a 
                                                        href={`mailto:${enquiry.email}?subject=Re: ${enquiry.subject}`}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:scale-105 transition-all"
                                                        title="Reply directly via Email"
                                                    >
                                                        <Reply className="w-4 h-4" />
                                                    </a>
                                                    {/* View Detail Action */}
                                                    <button 
                                                        onClick={() => setSelectedEnquiry(enquiry)}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 hover:scale-105 transition-all"
                                                        title="View Full Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {/* Delete Action */}
                                                    <button 
                                                        onClick={() => setEnquiryToDelete(enquiry._id)}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:scale-105 transition-all"
                                                        title="Delete Enquiry"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* Empty State UI */
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Mail className="w-10 h-10 text-slate-300" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-700">No Enquiries Found</h3>
                                                <p className="text-slate-500 text-sm mt-1">You're all caught up! There are no new messages.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-2xl">
                            <span className="text-sm text-slate-500 font-medium">
                                Showing <span className="text-slate-800">{indexOfFirstItem + 1}</span> to <span className="text-slate-800">{Math.min(indexOfLastItem, enquiries.length)}</span> of <span className="text-slate-800">{enquiries.length}</span> entries
                            </span>
                            
                            <div className="flex gap-2">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </button>
                                
                                {/* Dynamic Page Numbers */}
                                <div className="hidden sm:flex items-center gap-1 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                                currentPage === page 
                                                ? "bg-indigo-600 text-white shadow-md" 
                                                : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* View Message Modal */}
            {/* ========================================== */}
            {selectedEnquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                Enquiry Details
                            </h3>
                            <button 
                                onClick={() => setSelectedEnquiry(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* User details card */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-inner">
                                    {getInitials(selectedEnquiry.name)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-slate-800 font-bold text-lg">{selectedEnquiry.name}</h4>
                                    <p className="text-indigo-600 font-medium text-sm">{selectedEnquiry.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Received On</span>
                                    <span className="text-sm text-slate-600 font-medium block mt-0.5">{formatDate(selectedEnquiry.createdAt)}</span>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div>
                                <h5 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 ml-1">Subject</h5>
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-800 font-semibold shadow-sm">
                                    {selectedEnquiry.subject}
                                </div>
                            </div>

                            <div>
                                <h5 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 ml-1">Message</h5>
                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[120px] shadow-inner text-sm sm:text-base">
                                    {selectedEnquiry.message}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer (Actions) */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedEnquiry(null)}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm"
                            >
                                Close
                            </button>
                            {/* Direct Reach Out Button */}
                            <a 
                                href={`mailto:${selectedEnquiry.email}?subject=Re: ${selectedEnquiry.subject}`}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm flex items-center gap-2"
                            >
                                <Reply className="w-4 h-4" />
                                Reply via Email
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* Custom Delete Confirmation Modal */}
            {/* ========================================== */}
            {enquiryToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-rose-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Enquiry?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Are you sure you want to delete this message? This action cannot be undone and will remove it permanently.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setEnquiryToDelete(null)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm w-full"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold text-sm w-full flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Yes, Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}