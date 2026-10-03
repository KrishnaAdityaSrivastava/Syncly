import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signInApi } from "../api/api";
import { useNotification } from "../context/notificationContext.jsx";
import Loading from "../components/common/loading.jsx";
import { Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const SignInForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await signInApi(data);
      navigate("/dashboard");
    } catch (err) {
      const e = err.response?.data;
      if (!e) showNotification("Server not reachable", "error");
      else showNotification(e.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen bg-[#090d16] text-slate-100 lg:grid-cols-2 overflow-x-hidden">
      {/* Left Graphic Showcase Panel */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80 bg-mesh-pattern">
        <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />
        
        {/* Brand Header */}
        <button onClick={() => navigate("/")} className="relative z-10 flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 font-extrabold text-white shadow-lg shadow-orange-500/30">
            S
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Syncly</span>
        </button>

        {/* Center Copy */}
        <div className="relative z-10 max-w-md my-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400 backdrop-blur-md mb-6">
            <Sparkles size={14} className="animate-pulse" /> Workspace OS 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Work stays clear when every team member operates on the same frequency.
          </h1>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            Real-time project tracking, instant channel conversations, and automated progress metrics.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Socket.io real-time board updates",
              "Role-based permission security",
              "Integrated channel & direct messaging"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs font-semibold tracking-wide text-slate-500">
          © 2026 Syncly Technologies Inc. All rights reserved.
        </p>
      </section>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/80 backdrop-blur-md">
          <Loading text="Authenticating user..." />
        </div>
      )}

      {/* Right Form Container */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 font-extrabold text-white">
              S
            </div>
            <span className="text-lg font-extrabold text-white">Syncly</span>
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
              Welcome Back
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Sign in to your workspace
            </h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Enter your credentials to access your active boards and messages.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-semibold text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 pr-11 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all"
            >
              <span>Sign in to Workspace</span>
              <ArrowRight size={16} />
            </motion.button>
          </form>

          <p className="text-center text-xs font-medium text-slate-400">
            Don't have an account?{" "}
            <a href="/signup" className="font-bold text-orange-400 hover:underline">
              Create an account
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInForm;
