"use client";

import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { SIDEBAR_LINKS, EDITOR_SIDEBAR_LINKS } from "../../constants/dummyData";
import { useGetMeQuery } from "../../services/userApi";
import { useGetAllSubmissionsQuery, useGetAssignedToEditorQuery } from "../../services/manuscriptApi";
import { baseApi } from "../../services/baseApi";
import { useDispatch } from "react-redux";

const ROLE_CONFIG = {
  admin: {
    title: "Admin",
    links: SIDEBAR_LINKS,
    theme: {
      badgeBg: "bg-blue-600",
      textActive: "text-blue-500",
      bgActive: "bg-blue-600/10",
      borderActive: "border-blue-600/20",
      shadowActive: "shadow-[0_0_8px_rgba(59,130,246,0.8)]",
      gradient: "from-blue-600 to-emerald-500"
    }
  },
  editor: {
    title: "Editor",
    links: EDITOR_SIDEBAR_LINKS,
    theme: {
      badgeBg: "bg-indigo-600",
      textActive: "text-indigo-400",
      bgActive: "bg-indigo-600/10",
      borderActive: "border-indigo-600/20",
      shadowActive: "shadow-[0_0_8px_rgba(99,102,241,0.8)]",
      gradient: "from-indigo-600 to-purple-500"
    }
  }
};

export default function Sidebar({ role = "admin" }) {
  const dispatch=useDispatch()
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // State to handle mobile menu toggle
  const [readItems, setReadItems] = useState([]);

  const currentRoleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const { theme, links, title } = currentRoleConfig;

  const { data: user, isLoading } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  // RTK Query with skip logic so it doesn't throw errors for wrong roles
  const { data: adminData } = useGetAllSubmissionsQuery(undefined, { skip: role !== "admin" });
  const { data: editorData } = useGetAssignedToEditorQuery(undefined, { skip: role !== "editor" });

  // Function to update read items from localStorage
  const updateReadItems = () => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("readManuscripts") || "[]");
      setReadItems(saved);
    }
  };

  // Listen for custom event from Activity Page to update badge instantly without refresh
  useEffect(() => {
    updateReadItems();
    window.addEventListener("manuscriptRead", updateReadItems);

    return () => {
      window.removeEventListener("manuscriptRead", updateReadItems);
    };
  }, []);

  // Logic to calculate unread submissions dynamically based on role
  const unreadCount = useMemo(() => {
    let list = [];
    if (role === "admin" && adminData?.submissions) {
      list = adminData.submissions;
    } else if (role === "editor" && editorData?.manuscripts) {
      list = editorData.manuscripts;
    }

    if (!list || list.length === 0) return 0;
    return list.filter(m => !readItems.includes(m._id)).length;
  }, [adminData, editorData, role, readItems]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(baseApi.util.resetApiState()); 

    router.replace("/login");
  };

  // Close mobile sidebar when clicking a link
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* --- MOBILE HAMBURGER BUTTON --- */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white shadow-xl"
        >
          {isOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE OVERLAY (Darkens background when sidebar is open) --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* --- MAIN SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-white border-r border-slate-800 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* --- TOP: Logo & Brand --- */}
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-9 h-9 ${theme.badgeBg} rounded-xl flex items-center justify-center shadow-lg`}>
              {role === 'editor' ? <Icons.Edit3 size={20} /> : <Icons.LayoutDashboard size={20} />}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
              Journal <span className={theme.textActive}>{title}</span>
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-12">
            Management System
          </p>
        </div>

        {/* --- MIDDLE: Navigation Links (SCROLLABLE) --- */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {links.map((link) => {
            const IconComponent = Icons[link.icon] || Icons.HelpCircle;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const isActivityCenter = link.name.includes("Activity");

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? `${theme.bgActive} ${theme.textActive} border ${theme.borderActive}`
                  : "hover:bg-slate-900/50 text-slate-400 hover:text-slate-100 border border-transparent"
                  }`}
              >
                <IconComponent
                  size={18}
                  className={`${isActive ? theme.textActive : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110 transition-all"}`}
                />
                <span className={`font-medium text-sm ${isActive ? "font-bold" : ""}`}>
                  {link.name}
                </span>

                {isActivityCenter && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-lg shadow-rose-900/40">
                    {unreadCount}
                  </span>
                )}

                {isActive && !isActivityCenter && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${theme.badgeBg} ${theme.shadowActive}`} />
                )}
              </Link>
            );
          })}

          {/* --- ADMIN SECTION --- */}
          {role === "admin" && (
            <div className="mt-8 pt-4 border-t border-slate-900">
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Website Settings</p>
              <Link
                href="/admin/dashboard/editorial-board"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-400 group`}
              >
                <Icons.Globe size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="font-medium text-sm">Editorial Board</span>
              </Link>
            </div>
          )}
        </nav>

        {/* --- BOTTOM: Profile & Logout --- */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50">
          {/* Profile Card */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer group">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${theme.gradient} flex items-center justify-center font-bold text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
              {user?.user?.name?.charAt(0) || title.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-200 truncate capitalize tracking-wide">
                {isLoading ? "Loading..." : user?.user?.name || `${title} User`}
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {user?.user?.email || `${role}@journal.com`}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200 group"
          >
            <Icons.LogOut size={18} className="group-hover:-translate-x-1 transition-all" />
            <span className="font-semibold text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* --- Global CSS --- */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </>
  );
}