"use client";

import useAuthRedirect from "../hooks/useAuthRedirect";
export default function AuthProvider({ children }) {
  const loading = useAuthRedirect();

  // Prevent page flash
  if (loading) return null;

  return children;
}