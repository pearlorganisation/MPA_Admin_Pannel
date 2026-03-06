export const STATS_DATA = [
  { label: "Total Users", value: 1200, color: "text-blue-600" },
  { label: "Editors", value: 35, color: "text-purple-600" },
  { label: "Reviewers", value: 80, color: "text-orange-600" },
  { label: "Researchers", value: 1085, color: "text-green-600" },
  { label: "Total Submissions", value: 310, color: "text-indigo-600" },
  { label: "Pending Papers", value: 52, color: "text-yellow-600" },
  { label: "Approved Papers", value: 190, color: "text-emerald-600" },
  { label: "Rejected Papers", value: 68, color: "text-red-600" },
];

export const RECENT_SUBMISSIONS = [
  { id: 1, title: "AI in Medical Diagnosis", author: "Dr. Rahul Sharma", status: "Under Review", date: "2023-10-01" },
  { id: 2, title: "Cybersecurity in Blockchain", author: "Prof. Mehta", status: "Approved", date: "2023-10-05" },
  { id: 3, title: "Quantum Networks", author: "Dr. Patel", status: "Minor Revision", date: "2023-10-08" },
  { id: 4, title: "Deep Learning for Climate", author: "Sarah Jones", status: "Proofreading", date: "2023-10-10" },
];

export const SIDEBAR_LINKS = [
  { name: "Overview", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { name: "User Management", href: "/admin/dashboard/users", icon: "Users" },
  { name: "Journal Settings", href: "/admin/dashboard/journals", icon: "BookOpen" },
  { name: "Submissions", href: "/admin/dashboard/submissions", icon: "FileText" },
  { name: "Board Management", href: "/admin/dashboard/boards", icon: "ShieldCheck" },
  { name: "Activity Center", href: "/admin/dashboard/activity", icon: "Bell" },
];
export const EDITOR_SIDEBAR_LINKS = [
  { name: "Editorial Dashboard", href: "/editor/dashboard", icon: "LayoutDashboard" },
  { name: "Assigned Manuscripts", href: "/editor/dashboard/assignments", icon: "Files" },
  { name: "Reviewer Management", href: "/editor/dashboard/reviewers", icon: "Users" },
  { name: "Peer Review Tracking", href: "/editor/dashboard/reviews", icon: "ClipboardCheck" },
  { name: "Activity & Notifications", href: "/editor/dashboard/activity", icon: "BellRing" },
  { name: "Messages / Communication", href: "/editor/dashboard/messages", icon: "Mail" },

];