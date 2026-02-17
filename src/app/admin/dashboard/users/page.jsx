"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { 
  useGetAllUsersQuery, 
  useCreateUserMutation, 
  useAssignRoleMutation, 
  useToggleBlockMutation 
} from "../../../../services/userApi";
import { 
  UserPlus, 
  UserX, 
  UserCheck, 
  Mail, 
  Shield,
  Loader2,
  Search,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  // --- API Hooks ---
  const { data, isLoading, error } = useGetAllUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [toggleBlock, { isLoading: isBlocking }] = useToggleBlockMutation();
  const [assignRole, { isLoading: isRoleUpdating }] = useAssignRoleMutation();

  // --- Local States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'editor' });
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'block', 'unblock', 'role'
    user: null,
    pendingRole: ''
  });

  // --- Optimized Filtering ---
  const filteredUsers = useMemo(() => {
    if (!data?.user) return [];
    return data.user.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // --- Handlers ---
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

  const openConfirmModal = (type, user, pendingRole = '') => {
    setConfirmModal({ isOpen: true, type, user, pendingRole });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', user: null, pendingRole: '' });
  };

  // --- UI Helpers ---
  const getRoleBadge = (role) => {
    const styles = {
      masterAdmin: "bg-purple-50 text-purple-700 border-purple-200",
      editor: "bg-blue-50 text-blue-700 border-blue-200",
      reviewer: "bg-amber-50 text-amber-700 border-amber-200",
      researcher: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return `px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[role] || styles.editor}`;
  };

  if (isLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
      <p className="text-gray-500 font-medium animate-pulse">Loading workspace...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
            <p className="text-gray-500 mt-2 text-sm">Control access levels and monitor team activity.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-indigo-200 active:scale-95"
          >
            <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Add New Staff</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Staff', val: data?.user?.length || 0, icon: Shield, color: 'indigo' },
            { label: 'Active Now', val: data?.user?.filter(u => !u.isBlocked).length, icon: CheckCircle2, color: 'emerald' },
            { label: 'Restricted', val: data?.user?.filter(u => u.isBlocked).length, icon: UserX, color: 'rose' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                <stat.icon size={28}/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-gray-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search staff by name or email..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                  <th className="px-8 py-5">User Profile</th>
                  <th className="px-8 py-5 text-center">Assign Role</th>
                  <th className="px-8 py-5 text-center">Status Badge</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base capitalize">{user.name}</p>
                          <div className="flex items-center text-sm text-gray-400 font-medium">
                            <Mail size={14} className="mr-1.5" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <select 
                        value={user.role}
                        onChange={(e) => openConfirmModal('role', user, e.target.value)}
                        className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer border-b-2 border-transparent hover:border-indigo-400 transition-all py-1"
                      >
                        <option value="editor">Editor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="researcher">Researcher</option>
                        <option value="masterAdmin">Admin</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={getRoleBadge(user.role)}>{user.role}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => openConfirmModal(user.isBlocked ? 'unblock' : 'block', user)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                          user.isBlocked 
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
                            : "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                        }`}
                      >
                        {user.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                        {user.isBlocked ? "Activate" : "Restrict"}
                      </button>
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
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsCreateModalOpen(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-0 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Add Staff</h2>
                <p className="text-gray-500 font-medium">Create access credentials</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" placeholder="Ex: Rahul Sharma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input required type="email" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" placeholder="rahul@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Security Password</label>
                <input required type="password"  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Primary Role</label>
                <select className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="researcher">Researcher</option>
                  <option value="masterAdmin">Master Admin</option>
                </select>
              </div>
              
              <button disabled={isCreating} type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70">
                {isCreating ? <Loader2 className="animate-spin" /> : "Verify & Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PROFESSIONAL CONFIRMATION (Block/Role) --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeConfirmModal} />
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${
                confirmModal.type === 'block' ? 'bg-rose-100 text-rose-600' : 
                confirmModal.type === 'unblock' ? 'bg-emerald-100 text-emerald-600' : 
                'bg-indigo-100 text-indigo-600'
              }`}>
                {confirmModal.type === 'block' && <AlertTriangle size={40} />}
                {confirmModal.type === 'unblock' && <UserCheck size={40} />}
                {confirmModal.type === 'role' && <RefreshCw size={40} />}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {confirmModal.type === 'block' && `You are about to restrict access for ${confirmModal.user?.name}. They won't be able to log in.`}
                {confirmModal.type === 'unblock' && `This will restore full system access for ${confirmModal.user?.name}.`}
                {confirmModal.type === 'role' && `Change ${confirmModal.user?.name}'s permissions from ${confirmModal.user?.role} to ${confirmModal.pendingRole}?`}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                  onClick={closeConfirmModal}
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.type === 'role' ? executeRoleChange : executeToggleBlock}
                  disabled={isBlocking || isRoleUpdating}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                    confirmModal.type === 'block' ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700' : 
                    confirmModal.type === 'unblock' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 
                    'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'
                  }`}
                >
                  {(isBlocking || isRoleUpdating) ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm"}
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