"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const publicRoutes = ["/login", "/register"];

    //  Not logged in
    if (!token && !publicRoutes.includes(pathname)) {
      router.replace("/login");
      return;
    }

    // Already logged in
    if (token && publicRoutes.includes(pathname)) {
      if (role === "masterAdmin") {
        router.replace("/admin/dashboard");
      } else if (role === "editor") {
        router.replace("/editor/dashboard");
      } else {
        router.replace("/login");
      }
      return;
    }


    setLoading(false);
  }, [pathname, router]);

  return loading;
}