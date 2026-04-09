"use client";
import React, { useState, useMemo } from 'react';
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useToggleBlockMutation,
  useDeleteUserMutation // Added delete mutation
} from "../../../../services/userApi";
import {
  UserPlus,
  UserX,
  UserCheck,
  Mail,
  Shield,
  
  Search,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle2,
  Trash2, 
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  // --- API Hooks ---
  const { data, isLoading } = useGetAllUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [toggleBlock, { isLoading: isBlocking }] = useToggleBlockMutation();
  const [assignRole, { isLoading: isRoleUpdating }] = useAssignRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // --- Local States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'editor' });

  // Combined Modal State for Block, Unblock, Role change, and Delete
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'block', 'unblock', 'role', 'delete'
    user: null,
    pendingRole: ''
  });

  // --- Search and Filter Logic ---
  const filteredUsers = useMemo(() => {
    if (!data?.user) return [];
    return data.user
      .filter(user => user.role !== "researcher")
      .filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [data, searchTerm]);

  // --- Action Handlers ---

  // Create new staff member
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData).unwrap();
      toast.success("User created successfully!");
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'editor' });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create user");
    }
  };

  // Change user role (Editor/Reviewer)
  const executeRoleChange = async () => {
    const { user, pendingRole } = confirmModal;
    try {
      await assignRole({ id: user._id, role: pendingRole }).unwrap();
      toast.success(`Role updated to ${pendingRole}`);
      closeConfirmModal();
    } catch (err) {
      toast.error("Role update failed");
    }
  };

  // Block or Unblock a user
  const executeToggleBlock = async () => {
    const { user } = confirmModal;
    try {
      const res = await toggleBlock(user._id).unwrap();
      toast.success(res.message || "Status updated");
      closeConfirmModal();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  // Permanently delete a user
  const executeDeleteUser = async () => {
    const { user } = confirmModal;
    try {
      await deleteUser(user._id).unwrap();
      toast.success("User deleted successfully");
      closeConfirmModal();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  // Helper to open confirmation modal
  const openConfirmModal = (type, user, pendingRole = '') => {
    setConfirmModal({ isOpen: true, type, user, pendingRole });
  };

  // Helper to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', user: null, pendingRole: '' });
  };

  // Badge styling based on role
  const getRoleBadge = (role) => {
    const styles = {
      masterAdmin: "bg-purple-50 text-purple-700 border-purple-200",
      editor: "bg-blue-50 text-blue-700 border-blue-200",
      reviewer: "bg-amber-50 text-amber-700 border-amber-200",
      researcher: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return `px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[role] || styles.editor}`;
  };

  // Loading state UI
  if (isLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
      <p className="text-gray-500 font-medium">Loading workspace...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-500 text-sm">Manage team access and permissions.</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <UserPlus size={18} />
            <span className="font-semibold text-sm">Add New Staff</span>
          </button>
        </div>

        {/* --- Quick Stats Bar (Compact) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Staff', val: data?.user?.length || 0, icon: Shield, color: 'indigo' },
            { label: 'Active', val: data?.user?.filter(u => !u.isBlocked).length, icon: CheckCircle2, color: 'emerald' },
            { label: 'Restricted', val: data?.user?.filter(u => u.isBlocked).length, icon: UserX, color: 'rose' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-black text-gray-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Search bar inside table container */}
          <div className="p-4 border-b border-gray-50 bg-white">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search staff by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">User Profile</th>
                  <th className="px-6 py-4 text-center">Assign Role</th>
                  <th className="px-6 py-4 text-center">Status Badge</th>
                  <th className="px-6 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm capitalize">{user.name}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <Mail size={12} className="mr-1" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <select
                        value={user.role}
                        disabled={user.role === 'masterAdmin'}
                        onChange={(e) => openConfirmModal('role', user, e.target.value)}
                        className="bg-transparent font-bold text-indigo-600 text-sm focus:outline-none cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="editor">Editor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="researcher">Researcher</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={getRoleBadge(user.role)}>{user.role}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Block/Unblock Button */}
                        <button
                          onClick={() => openConfirmModal(user.isBlocked ? 'unblock' : 'block', user)}
                          className={`p-2 rounded-lg transition-all ${user.isBlocked
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            }`}
                          title={user.isBlocked ? "Activate" : "Restrict"}
                        >
                          {user.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                        </button>
                        
                        {/* Delete Button (Added) */}
                        {user.role !== 'masterAdmin' && (
                          <button
                            onClick={() => openConfirmModal('delete', user)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL: CREATE USER --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">Add Staff</h2>
                <p className="text-gray-500 text-xs">Create new system credentials</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm" placeholder="Ex: Rahul Sharma" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
                <input required type="email" className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm" placeholder="rahul@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
                <input required type="password" minLength={6} className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Role</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm font-bold text-gray-700" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>

              <button disabled={isCreating} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70">
                {isCreating ? <Loader2 className="animate-spin size={18}" /> : "Create Staff Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRMATION (Block/Role/Delete) --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeConfirmModal} />
          <div className="bg-white rounded-[1.5rem] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                confirmModal.type === 'delete' || confirmModal.type === 'block' ? 'bg-rose-100 text-rose-600' :
                confirmModal.type === 'unblock' ? 'bg-emerald-100 text-emerald-600' :
                'bg-indigo-100 text-indigo-600'
              }`}>
                {confirmModal.type === 'block' && <AlertTriangle size={32} />}
                {confirmModal.type === 'unblock' && <UserCheck size={32} />}
                {confirmModal.type === 'role' && <RefreshCw size={32} />}
                {confirmModal.type === 'delete' && <Trash2 size={32} />}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {confirmModal.type === 'delete' ? 'Delete User?' : 'Are you sure?'}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {confirmModal.type === 'block' && `Restrict access for ${confirmModal.user?.name}?`}
                {confirmModal.type === 'unblock' && `Restore access for ${confirmModal.user?.name}?`}
                {confirmModal.type === 'role' && `Change ${confirmModal.user?.name}'s role to ${confirmModal.pendingRole}?`}
                {confirmModal.type === 'delete' && `This will permanently remove ${confirmModal.user?.name}. This action cannot be undone.`}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.type === 'role') executeRoleChange();
                    else if (confirmModal.type === 'delete') executeDeleteUser();
                    else executeToggleBlock();
                  }}
                  disabled={isBlocking || isRoleUpdating || isDeleting}
                  className={`px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md transition-all active:scale-95 flex items-center justify-center ${
                    confirmModal.type === 'delete' || confirmModal.type === 'block' ? 'bg-rose-600 hover:bg-rose-700' :
                    confirmModal.type === 'unblock' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {(isBlocking || isRoleUpdating || isDeleting) ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;