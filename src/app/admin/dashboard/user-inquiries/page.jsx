"use client";
import React, { useState } from 'react';
import {
    useGetEnquiriesQuery,
    useDeleteEnquiryMutation
} from "../../../../services/enquiryApi";
import {
    Eye, Trash2, X, ChevronLeft, ChevronRight, Mail,
    MessageSquare, Clock, AlertCircle, Reply, AlertTriangle,
    Loader2
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
    const [selectedEnquiry, setSelectedEnquiry] = useState(null); // For View Modal
    const [enquiryToDelete, setEnquiryToDelete] = useState(null); // For Delete Confirmation Modal

    const itemsPerPage = 8;

    // ==========================================
    // 3. Data Extraction & Pagination Logic
    // ==========================================
    const enquiries = response?.data || [];

    const totalPages = Math.ceil(enquiries.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = enquiries.slice(indexOfFirstItem, indexOfLastItem);

    // ==========================================
    // 4. Helper Functions
    // ==========================================
    const confirmDelete = async () => {
        if (!enquiryToDelete) return;
        try {
            await deleteEnquiry(enquiryToDelete).unwrap();
            if (currentItems.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            }
            setEnquiryToDelete(null);
        } catch (error) {
            console.error("Failed to delete enquiry:", error);
            alert("Failed to delete enquiry. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // ==========================================
    // 5. Conditional Rendering (Loading & Error)
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
                    <p className="text-slate-500 text-sm">Problem fetching enquiries. Please refresh.</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // 6. Main UI Render
    // ==========================================
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section - Responsive Flex */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                                <MessageSquare className="w-5 h-5 sm:w-6 h-6" />
                            </div>
                            User Enquiries
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1">
                            Manage and reply to incoming user messages.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700">
                            Total: <span className="text-indigo-600">{enquiries.length}</span>
                        </span>
                    </div>
                </div>

                {/* Table Container - Scrollable on Mobile */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">User Info</th>
                                    <th className="px-6 py-4">Subject & Message</th>
                                    <th className="px-6 py-4">Received Date</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentItems.length > 0 ? (
                                    currentItems.map((enquiry) => (
                                        <tr key={enquiry._id} className="hover:bg-slate-50/50 transition-colors group">
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                        {getInitials(enquiry.name)}
                                                    </div>
                                                    <div className="flex flex-col max-w-[180px]">
                                                        <span className="font-semibold text-slate-800 truncate">{enquiry.name}</span>
                                                        <span className="text-xs text-slate-500 truncate">{enquiry.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Subject & Message - Truncated to prevent break */}
                                            <td className="px-6 py-4 max-w-md">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-800 font-semibold text-sm line-clamp-1">
                                                        {enquiry.subject}
                                                    </span>
                                                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                        {enquiry.message}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDate(enquiry.createdAt)}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <a
                                                        href={`mailto:${enquiry.email}?subject=Re: ${enquiry.subject}`}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        title="Reply"
                                                    >
                                                        <Reply className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => setSelectedEnquiry(enquiry)}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEnquiryToDelete(enquiry._id)}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">No messages found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Responsive Layout */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs text-slate-500 font-medium">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, enquiries.length)} of {enquiries.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page
                                                    ? "bg-indigo-600 text-white shadow-sm"
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
                                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Detail Modal - Fixed for Large Content */}
            {selectedEnquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                Enquiry Details
                            </h3>
                            <button onClick={() => setSelectedEnquiry(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable to prevent breaking */}
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                        {getInitials(selectedEnquiry.name)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{selectedEnquiry.name}</h4>
                                        <p className="text-sm text-indigo-600 font-medium">{selectedEnquiry.email}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Received On</p>
                                    <p className="text-sm text-slate-600 font-semibold">{formatDate(selectedEnquiry.createdAt)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1 ml-1">Subject</label>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-sm sm:text-base break-words">
                                    {selectedEnquiry.subject}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1 ml-1">Message Body</label>
                                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words min-h-[150px]">
                                    {selectedEnquiry.message}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedEnquiry(null)}
                                className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                            <a
                                href={`mailto:${selectedEnquiry.email}?subject=Re: ${selectedEnquiry.subject}`}
                                className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-100"
                            >
                                <Reply className="w-4 h-4" />
                                Reply via Email
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {enquiryToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
                        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Delete Enquiry?</h3>
                        <p className="text-sm text-slate-500 mt-2 mb-6">Are you sure? This action is permanent and cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setEnquiryToDelete(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}