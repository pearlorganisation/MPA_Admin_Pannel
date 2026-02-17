"use client";

import { useState } from "react";
import { useLoginMutation } from "../../services/authApi";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
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
      toast.success(`Welcome back, ${res.user.name}!`);

      setTimeout(() => {
        if (res.user.role === "masterAdmin") {
          router.push("/admin/dashboard");
        } else if (res.user.role === "editor") {
          router.push("/editor/dashboard");
        } else {
          router.push("/hello");
        }
      }, 1000);
    } catch (err) {
      const errorMessage = err?.data?.message || "Invalid Credentials";
      toast.error(errorMessage);
    }
  };

  return (
    // Background fix: Added a solid slate-950 fallback and a clearer gradient
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Circles - Inse UI colorful lagega */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px]"></div>

      <div className="w-full max-w-md px-6 z-10 animate-in fade-in zoom-in duration-700">
        {/* Main Card */}
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-0">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
              MPA{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Admin
              </span>
            </h1>
            <p className="text-slate-400 ">
              Please enter your details to login
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/40 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="name@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-800/40 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading}
              type="submit"
              className="mt-10 group relative w-full flex items-center justify-center py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all hover:shadow-[0_20px_30px_-10px_rgba(79,70,229,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <span className="flex items-center">
                  Sign In{" "}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              )}
            </button>
          </form>

          {/* Bottom Footer */}
          <p className="text-center mt-8 text-sm text-slate-500">
            System Security Protocol Active{" "}
            <span className="text-green-500 ml-1">●</span>
          </p>
        </div>
      </div>
    </div>
  );
}
