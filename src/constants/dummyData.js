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
  { name: "Reviewer Status", href: "/admin/dashboard/review-status", icon: "BookOpen" },
  { name: "Review & Decisions", href: "/admin/dashboard/review-decision", icon: "GitCompare" },
  { name: "Submission Management", href: "/admin/dashboard/submission-management", icon: "Settings" },
  { name: "Submissions", href: "/admin/dashboard/submissions", icon: "FileText" },
  { name: "Board Management", href: "/admin/dashboard/boards", icon: "ShieldCheck" },
  { name: "Activity Center", href: "/admin/dashboard/activity", icon: "Bell" },
  { name: "Researcher Management", href: "/admin/dashboard/researcher", icon: "UsersRound" }
];
export const EDITOR_SIDEBAR_LINKS = [
  { name: "Editorial Dashboard", href: "/editor/dashboard", icon: "LayoutDashboard" },
  { name: "Assigned Manuscripts", href: "/editor/dashboard/assignments", icon: "Files" },
  { name: "Reviewer Management", href: "/editor/dashboard/reviewers", icon: "Users" },
  { name: "Editor Decision", href: "/editor/dashboard/editor-decision", icon: "ClipboardCheck" },
  { name: "Reviewer Status", href: "/editor/dashboard/reviewer-status", icon: "UserCheck" },
  { name: "Activity & Notifications", href: "/editor/dashboard/activity", icon: "BellRing" },
];

export const REVIEWER_SIDEBAR_LINKS = [
  { name: "Reviewer Dashboard", href: "/reviewer/dashboard", icon: "LayoutDashboard" },
  { name: "Assigned Papers", href: "/reviewer/dashboard/papers", icon: "FileText" },
  { name: "Submit Review", href: "/reviewer/dashboard/reviews", icon: "ClipboardCheck" },
  { name: "Activity", href: "/reviewer/dashboard/activity", icon: "BellRing" },
  { name: "Messages", href: "/reviewer/dashboard/messages", icon: "Mail" },
];