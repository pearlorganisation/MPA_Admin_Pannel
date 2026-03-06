"use client";
import React, { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  ExternalLink, 
  Mail, 
  Linkedin,
  Loader2,
  AlertTriangle,
  Users
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Importing RTK Query hooks from your service
import {
  useGetEditorialsQuery,
  useCreateEditorialMutation,
  useUpdateEditorialMutation,
  useDeleteEditorialMutation,
} from "../../../../services/editorialApi"; 

const EditorialAdmin = () => {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEditorial, setSelectedEditorial] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const[formData, setFormData] = useState({
    type: "editor",
    name: "",
    role: "",
    email: "",
    linkedin: "",
    bio: "",
    institution: "",
    interests: "",
    initials: "",
    profileLink: "",
  });
  const[imageFile, setImageFile] = useState(null);

  // --- API HOOKS ---
  const { data: editorials, isLoading, isError, refetch } = useGetEditorialsQuery();
  const[createEditorial, { isLoading: isCreating }] = useCreateEditorialMutation();
  const [updateEditorial, { isLoading: isUpdating }] = useUpdateEditorialMutation();
  const [deleteEditorial, { isLoading: isDeleting }] = useDeleteEditorialMutation();

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const openModal = (editorial = null) => {
    if (editorial) {
      setSelectedEditorial(editorial);
      setFormData({ 
        type: editorial.type || "editor",
        name: editorial.name || "",
        role: editorial.role || "",
        email: editorial.email || "",
        linkedin: editorial.linkedin || "",
        bio: editorial.bio || "",
        institution: editorial.institution || "",
        interests: editorial.interests || "",
        initials: editorial.initials || "",
        profileLink: editorial.profileLink || "",
      });
      setPreviewImage(editorial.image || null);
    } else {
      setSelectedEditorial(null);
      setFormData({
        type: "editor",
        name: "",
        role: "",
        email: "",
        linkedin: "",
        bio: "",
        institution: "",
        interests: "",
        initials: "",
        profileLink: "",
      });
      setPreviewImage(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (selectedEditorial) {
        await updateEditorial({ id: selectedEditorial._id, formData: data }).unwrap();
        toast.success("Board member updated successfully!");
      } else {
        await createEditorial(data).unwrap();
        toast.success("New board member added successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong while saving.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEditorial(selectedEditorial._id).unwrap();
      toast.success("Member removed successfully!");
      setIsDeleteModalOpen(false);
      setSelectedEditorial(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete the member.");
    }
  };

  // --- RENDER HELPERS ---
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading editorial board...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Failed to load data</h2>
        <p className="text-gray-500 mb-6">There was an error fetching the editorial board.</p>
        <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );

  const editorialList = editorials?.data ||[];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontWeight: '500' } }} />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Editorial Board</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Manage team leaders and regular editors effectively.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} />
            <span>Add Member</span>
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {editorialList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No board members found</h3>
              <p className="text-gray-500 max-w-sm mt-2 mb-6">Get started by adding your first top leader or editor to the board.</p>
              <button onClick={() => openModal()} className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2">
                <Plus size={18} /> Add New Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/75">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Info</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Type</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact & Links</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editorialList.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                      {/* Member Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{item.role}</div>
                        <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.type === 'topLeader' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {item.type === 'topLeader' ? 'Top Leader' : 'Editor'}
                        </span>
                      </td>

                      {/* Contact & Links */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-gray-400">
                          <a href={`mailto:${item.email}`} title="Email" className="hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-1.5 rounded-md">
                            <Mail size={16} />
                          </a>
                          {item.linkedin && (
                            <a href={item.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="hover:text-blue-700 transition-colors bg-gray-50 hover:bg-blue-50 p-1.5 rounded-md">
                              <Linkedin size={16} />
                            </a>
                          )}
                          {item.profileLink && (
                            <a href={item.profileLink} target="_blank" rel="noreferrer" title="External Profile" className="hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-200 p-1.5 rounded-md">
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal(item)} 
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Member"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedEditorial(item); setIsDeleteModalOpen(true); }} 
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Member"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm sm:p-6">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedEditorial ? "Edit Board Member" : "Add New Board Member"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="editorial-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Type Selection Tabs */}
                <div className="p-1 bg-gray-100/80 rounded-xl flex max-w-md mx-auto sm:mx-0">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'topLeader'})}
                    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${formData.type === 'topLeader' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Top Leader
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'editor'})}
                    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${formData.type === 'editor' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Regular Editor
                  </button>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo</label>
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 ring-2 ring-transparent hover:ring-blue-100 transition-all">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" size={28} />
                      )}
                    </div>
                    <label className="cursor-pointer group flex flex-col items-start">
                      <span className="bg-white border border-gray-300 group-hover:border-blue-500 group-hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
                        Choose Image
                      </span>
                      <span className="text-xs text-gray-400 mt-2">JPG, PNG up to 2MB</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Dr. Sarah Connor" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Role / Designation <span className="text-red-500">*</span></label>
                    <input type="text" name="role" value={formData.role} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Chief Editor" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">LinkedIn URL</label>
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="https://linkedin.com/in/..." />
                  </div>

                  {/* Dynamic Fields: Top Leader */}
                  {formData.type === "topLeader" && (
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Biography <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                        required={formData.type === "topLeader"} 
                        rows="4" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-y" 
                        placeholder="Write a professional biography..."></textarea>
                    </div>
                  )}

                  {/* Dynamic Fields: Editor */}
                  {formData.type === "editor" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Institution <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="institution" 
                          value={formData.institution} 
                          onChange={handleChange} 
                          required={formData.type === "editor"} 
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                          placeholder="Harvard University" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Initials</label>
                        <input 
                          type="text" 
                          name="initials" 
                          value={formData.initials} 
                          onChange={handleChange} 
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                          placeholder="e.g. SC" />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Research Interests <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="interests" 
                          value={formData.interests} 
                          onChange={handleChange} 
                          required={formData.type === "editor"} 
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                          placeholder="AI, Machine Learning, Data Ethics" />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">External Profile Link</label>
                        <input 
                          type="url" 
                          name="profileLink" 
                          value={formData.profileLink} 
                          onChange={handleChange} 
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                          placeholder="Link to university or research profile" />
                      </div>
                    </>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                form="editorial-form"
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {(isCreating || isUpdating) ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving...</>
                ) : (
                  selectedEditorial ? "Save Changes" : "Add Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-5 ring-4 ring-red-50/50">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Board Member?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Are you sure you want to remove <strong className="text-gray-800">{selectedEditorial?.name}</strong> from the editorial board? This action cannot be undone and will remove all their details permanently.
              </p>
            </div>
            
            <div className="mt-8 flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-70 outline-none shadow-sm"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorialAdmin;