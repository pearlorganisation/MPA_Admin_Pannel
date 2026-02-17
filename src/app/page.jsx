"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (user.role === "admin") {
      router.push("/admin/dashboard");
    } 
    else if (user.role === "editor") {
      router.push("/editor/dashboard");
    } 
    else {
      router.push("/login");
    }

  }, []);

  return null;
}
