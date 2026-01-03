import { useState } from "react";
import { AxiosError } from "axios";
import api from "@/api/axios";

// --- Icons ---
const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      setError(axiosErr.response?.data?.error?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-['Montserrat'] bg-white">

      {/* --- LEFT SIDE: Brand & Visuals (50%) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-16 text-white">

        {/* Background Gradients & Noise */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/40 rounded-full blur-[100px]"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Top Logo Area */}
          <div>
            {/* Replace this div with your <img src="/logo.png" /> */}
            <div className="flex items-center gap-3">
              {/* Replace with actual logo SVG if needed */}
              <div className="img-wrapper w-12 lg:w-20">
                <img src="/logo.png" alt="Logo" className="w-12 lg:w-20" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tripower</span>
            </div>
          </div>

          {/* Middle Marketing Copy */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
              Your Workspace, <br /> Simplified.
            </h2>
            <p className="text-slate-400 text-lg mb-8 font-light">
              Access your schedules, track jobs, and manage your daily operations seamlessly.
            </p>

            {/* Feature List */}
            <ul className="space-y-4 text-slate-300 font-medium">
              <li className="flex items-center"><CheckIcon /> Daily Job Schedules</li>
              <li className="flex items-center"><CheckIcon /> Service History & Reports</li>
              <li className="flex items-center"><CheckIcon /> Team Communication</li>
            </ul>
          </div>

          {/* Bottom Copyright */}
          <div className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Tripower Services.
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Login Form (50%) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">

        {/* Mobile Header (Only visible on small screens) */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          {/* Replace with actual logo SVG if needed */}
          <div className="img-wrapper w-16 ">
            <img src="/logo.png" alt="Logo" className="w-16" />
          </div>
          <span className="text-lg font-bold text-gray-900">Tripower</span>
        </div>

        <div className="w-full max-w-[440px] animate-fade-in-up">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Please enter your details to access the portal.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm text-red-600 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Input */}
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm font-medium transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 placeholder:text-gray-400"
                  placeholder="admin@tripower.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm font-medium transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 placeholder:text-gray-400"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Secure Enterprise System</span>
              </div>
            </div>
          </form>
        </div>

        {/* Helper Footer (Right Side) */}
        <div className="absolute bottom-6 w-full text-center lg:text-left lg:pl-12">
          <p className="text-xs text-gray-400">Privacy Policy • Terms of Service</p>
        </div>
      </div>

      {/* Global Styles (Same animations as before) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-4px); }
          30% { transform: translateX(4px); }
          45% { transform: translateX(-2px); }
          60% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}