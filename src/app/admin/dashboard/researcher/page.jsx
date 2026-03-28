"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    MoreVertical,
    ShieldAlert,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    UserCog,
    Mail,
    Calendar,
    AlertTriangle,
    Trash2,
    Loader2
} from "lucide-react";

import {
    useGetAllUsersQuery,
    useToggleBlockMutation,
    useAssignRoleMutation,
    useDeleteUserMutation // Added Delete mutation
} from "../../../../services/userApi";
import toast from "react-hot-toast";

export default function ResearcherManagement() {
    // ==========================================
    // 1. API HOOKS
    // ==========================================
    const { data, isLoading, isError, refetch } = useGetAllUsersQuery();
    const [toggleBlock, { isLoading: isBlocking }] = useToggleBlockMutation();
    const [assignRole, { isLoading: isPromoting }] = useAssignRoleMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    // ==========================================
    // 2. LOCAL STATE
    // ==========================================
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    // Configuration for the confirmation modal (Block, Promote, Delete)
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // "block", "promote", or "delete"
        user: null,
    });

    const itemsPerPage = 8; // Reduced slightly to fit "One View" better

    // ==========================================
    // 3. DATA FILTERING & PAGINATION
    // ==========================================

    // Get only researchers
    const researchers = useMemo(() => {
        if (!data?.user) return [];
        return data.user.filter((user) => user.role === "researcher");
    }, [data]);

    // Apply search and status filters
    const filteredResearchers = useMemo(() => {
        return researchers.filter((r) => {
            const matchesSearch =
                r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "blocked"
                        ? r.isBlocked
                        : !r.isBlocked;

            return matchesSearch && matchesStatus;
        });
    }, [researchers, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredResearchers.length / itemsPerPage);

    // Get data for the current page
    const paginatedResearchers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredResearchers.slice(start, start + itemsPerPage);
    }, [filteredResearchers, currentPage]);

    // If page becomes empty (after delete/filter), go to previous page
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // ==========================================
    // 4. ACTION HANDLERS
    // ==========================================

    const openModal = (type, user) => {
        setActionMenuOpen(null); // Close dropdown
        setModalConfig({ isOpen: true, type, user });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, user: null });
    };

    const handleConfirmAction = async () => {
        const { type, user } = modalConfig;
        if (!user) return;

        try {
            if (type === "block") {
                await toggleBlock(user._id).unwrap();
                toast.success(user.isBlocked ? "Researcher Unblocked" : "Researcher Blocked");
            } else if (type === "promote") {
                await assignRole({ id: user._id, role: "reviewer" }).unwrap();
                toast.success("Promoted to Reviewer Successfully");
                refetch();
            } else if (type === "delete") {
                await deleteUser(user._id).unwrap();
                toast.success("Researcher Deleted Permanently");
            }
            closeModal();
        } catch (error) {
            toast.error(error?.data?.message || "Action failed");
        }
    };

    // ==========================================
    // 5. LOADING & ERROR STATES
    // ==========================================
    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="mt-2 text-gray-500 font-medium">Loading researchers...</p>
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                <ShieldAlert size={20} />
                <span className="font-bold">Failed to load data. Please try again.</span>
            </div>
        </div>
    );

    // ==========================================
    // 6. MAIN UI RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans selection:bg-indigo-100">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* --- HEADER & STATS --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Researcher Management</h1>
                        <p className="text-xs text-gray-500">Manage all registered researchers and their access.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><UserCog size={18} /></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">Total</p><p className="text-base font-black">{researchers.length}</p></div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="bg-red-50 p-2 rounded-lg text-red-600"><ShieldAlert size={18} /></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">Blocked</p><p className="text-base font-black">{researchers.filter(r => r.isBlocked).length}</p></div>
                        </div>
                    </div>
                </div>

                {/* --- TOOLBAR --- */}
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="flex gap-2">
                        {["all", "active", "blocked"].map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${statusFilter === s ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Researcher Info</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {paginatedResearchers.length > 0 ? (
                                    paginatedResearchers.map((r) => (
                                        <tr key={r._id} className="hover:bg-indigo-50/20 transition-colors group">
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                        {r.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{r.name}</p>
                                                        <p className="text-[11px] text-gray-400 flex items-center gap-1 font-medium"><Mail size={10} />{r.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${r.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                                    {r.isVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {r.isVerified ? "Verified" : "Pending"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${r.isBlocked ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                                                    {r.isBlocked ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                                                    {r.isBlocked ? "Blocked" : "Active"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500 font-medium">
                                                <div className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-300" /> {new Date(r.createdAt).toLocaleDateString()}</div>
                                            </td>

                                            <td className="px-6 py-3 whitespace-nowrap text-right relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === r._id ? null : r._id)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {actionMenuOpen === r._id && (
                                                    <div className="absolute right-12 top-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-150">
                                                        <button
                                                            onClick={() => openModal("block", r)}
                                                            className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 ${r.isBlocked ? "text-emerald-600" : "text-amber-600"}`}
                                                        >
                                                            {r.isBlocked ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                                            {r.isBlocked ? "Unblock User" : "Block User"}
                                                        </button>
                                                        <button
                                                            onClick={() => openModal("promote", r)}
                                                            className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <UserCog size={14} /> Promote to Reviewer
                                                        </button>
                                                        <div className="border-t border-gray-50 my-1"></div>
                                                        <button
                                                            onClick={() => openModal("delete", r)}
                                                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={14} /> Delete Permanently
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center">
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Search size={32} className="mb-2 opacity-20" />
                                                <p className="text-sm font-bold">No researchers found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION --- */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500 font-bold">
                                Showing {Math.min(filteredResearchers.length, itemsPerPage)} of {filteredResearchers.length} results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 transition-all hover:bg-gray-50"
                                ><ChevronLeft size={16} /></button>
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`h-8 w-8 text-xs font-bold rounded-lg transition-all ${currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-400 hover:border-indigo-200"}`}
                                        >{i + 1}</button>
                                    ))}
                                </div>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 transition-all hover:bg-gray-50"
                                ><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Background overlay to close dropdown */}
            {actionMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />}

            {/* ==========================================
          7. PROFESSIONAL ACTION MODAL 
      ========================================== */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">

                            {/* Modal Icon */}
                            <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${modalConfig.type === 'delete' || (modalConfig.type === 'block' && !modalConfig.user.isBlocked) ? 'bg-rose-100 text-rose-600' :
                                    modalConfig.type === 'promote' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                {modalConfig.type === 'block' && <AlertTriangle size={32} />}
                                {modalConfig.type === 'promote' && <UserCog size={32} />}
                                {modalConfig.type === 'delete' && <Trash2 size={32} />}
                            </div>

                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                {modalConfig.type === 'delete' ? 'Delete Permanently?' : 'Are you sure?'}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                {modalConfig.type === 'block' ? `Change access for ${modalConfig.user?.name}?` :
                                    modalConfig.type === 'promote' ? `Give Reviewer permissions to ${modalConfig.user?.name}?` :
                                        `This will completely erase ${modalConfig.user?.name} from the system. This cannot be undone.`}
                            </p>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl font-bold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    disabled={isBlocking || isPromoting || isDeleting}
                                    className={`px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center ${modalConfig.type === 'delete' || (modalConfig.type === 'block' && !modalConfig.user.isBlocked) ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                                        }`}
                                >
                                    {(isBlocking || isPromoting || isDeleting) ? <Loader2 className="animate-spin size={18}" /> : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}