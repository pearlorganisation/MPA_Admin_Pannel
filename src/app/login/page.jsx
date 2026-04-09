"use client";

import { useState } from "react";
import { useLoginMutation } from "../../services/authApi";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, BookOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }

    try {
      const res = await login({ email, password }).unwrap();
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      //Checing Role here
      if (res.user.role === "masterAdmin") {
        router.push("/admin/dashboard");
      } else if (res.user.role === "editor") {
        router.push("/editor/dashboard");
      } else if (res.user.role === "reviewer") {
        router.push("/reviewer/dashboard");
      } else {
        router.push("/");
      }

      toast.success(`Welcome back, ${res.user.name}!`);

    } catch (err) {
      const errorMessage = err?.data?.message || "Invalid Credentials";

      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090e17] relative overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* --- Premium Background Effects --- */}
      {/* Subtle Dashboard Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px][mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] px-5 sm:px-8 z-10 animate-in fade-in zoom-in-95 duration-700">

        {/* Main Glassmorphism Card */}
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden">

          {/* Subtle top highlight for 3D card effect */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

          {/* --- Header Section --- */}
          <div className="text-center relative">
            <div className="relative inline-block mb-6 group">
              {/* Icon Background Glow */}
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

              <div className="relative bg-gradient-to-br from-indigo-500 to-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 ring-1 ring-white/10 transition-transform duration-500 hover:scale-105">
                <ShieldCheck className="text-white w-8 h-8 drop-shadow-md" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              MPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Portal</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Journal Management System
            </p>
          </div>

          {/* --- Login Form --- */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-300 ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-inner"
                  placeholder="admin@journal.com"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-300 ml-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-inner"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors duration-300 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading}
              type="submit"
              className="relative w-full flex items-center justify-center py-3.5 px-4 mt-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-[15px] shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] border border-indigo-500/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
            >
              {/* Button Hover Glow Effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-indigo-100" />
              ) : (
                <span className="flex items-center gap-2">
                  Access Dashboard
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </span>
              )}
            </button>
          </form>

          {/* --- Bottom Footer Status --- */}
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
              Secure System Active
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}