import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { sendOtpApi, signUpApi, verifyOtpApi } from "../api/api";
import { useNotification } from "../context/notificationContext.jsx";
import Loading from "../components/common/loading.jsx";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const emailVerificationRequired =
  String(import.meta.env.VITE_EMAIL_VERIFICATION_REQUIRED ?? "true").toLowerCase() !== "false";

const SignUpForm = () => {
  const [step, setStep] = useState(emailVerificationRequired ? 1 : 3);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const email = watch("email");
  const password = watch("password");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSendOtp = handleSubmit(async (data) => {
    try {
      setLoading(true);
      await sendOtpApi(data);
      setStep(2);
      setResendCooldown(30);
      showNotification("OTP sent to your email", "success");
    } catch (err) {
      const e = err.response?.data;
      if (!e) showNotification("Server not reachable", "error");
      else if (e.errorType === "USER_EXIST")
        showNotification("User already exists", "error");
      else showNotification(e.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  });

  const handleVerifyOtp = handleSubmit(async (data) => {
    try {
      setLoading(true);
      await verifyOtpApi(data);
      setStep(3);
      showNotification("Email verified successfully", "success");
    } catch (err) {
      const e = err.response?.data;
      showNotification(e?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  });

  const handleSignUp = handleSubmit(async (data) => {
    try {
      setLoading(true);
      await signUpApi(data);
      navigate("/dashboard");
    } catch (err) {
      const e = err.response?.data;
      if (!e) showNotification("Server not reachable", "error");
      else if (e.errorType === "USER_EXIST")
        showNotification("User already exists", "error");
      else if (e.errorType === "EMAIL_NOT_VERIFIED")
        showNotification("Please verify email first", "error");
      else showNotification(e.message || "Failed to sign up", "error");
    } finally {
      setLoading(false);
    }
  });

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      setLoading(true);
      await sendOtpApi({ email });
      setResendCooldown(30);
      showNotification("OTP resent successfully", "success");
    } catch (err) {
      const e = err.response?.data;
      showNotification(e?.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] text-slate-100 p-6 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none bg-mesh-pattern opacity-80" />
      <div className="fixed inset-0 pointer-events-none bg-grid-dots opacity-30" />

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/80 backdrop-blur-md">
          <Loading text="Processing request..." />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg space-y-7 rounded-2xl border border-slate-800 bg-slate-900/85 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 font-extrabold text-white shadow-md">
              S
            </div>
            <span className="text-xl font-extrabold text-white">Syncly</span>
          </button>
          
          {emailVerificationRequired && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              <span>Step {step} of 3</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {step === 1 && "Verify your email"}
            {step === 2 && "Enter verification code"}
            {step === 3 && "Complete your profile"}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {step === 1 && "We'll send a 6-digit confirmation code to your email address."}
            {step === 2 && `Enter the OTP sent to ${email || "your email"}.`}
            {step === 3 && "Set your display name and password to activate your account."}
          </p>
        </div>

        {!emailVerificationRequired && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            Email verification is disabled in this environment. You can create your account directly.
          </div>
        )}

        {/* Step 1: Send OTP */}
        {emailVerificationRequired && step === 1 && (
          <form className="space-y-5" onSubmit={handleSendOtp}>
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
              {errors.email && <p className="mt-1.5 text-xs font-semibold text-rose-400">{errors.email.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all"
            >
              <span>Send Verification Code</span>
              <ArrowRight size={16} />
            </motion.button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {emailVerificationRequired && step === 2 && (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <input type="hidden" {...register("email")} value={email} readOnly />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                6-Digit Security Code
              </label>
              <input
                {...register("otp", { required: "OTP is required" })}
                placeholder="123456"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-center text-lg font-bold tracking-widest text-slate-100 placeholder:text-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
              {errors.otp && <p className="mt-1.5 text-xs font-semibold text-rose-400">{errors.otp.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all"
            >
              <span>Verify Code</span>
              <ArrowRight size={16} />
            </motion.button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={resendCooldown > 0}
              className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all border ${
                resendCooldown > 0
                  ? "border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Security Code"}
            </button>
          </form>
        )}

        {/* Step 3: Complete Registration */}
        {step === 3 && (
          <form className="space-y-4" onSubmit={handleSignUp}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-orange-500 focus:outline-none transition-all"
              />
              {errors.email && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-orange-500 focus:outline-none transition-all"
              />
              {errors.name && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-orange-500 focus:outline-none transition-all"
              />
              {errors.password && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword", {
                  validate: (v) => v === password || "Passwords do not match",
                })}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 focus:border-orange-500 focus:outline-none transition-all"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-semibold text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all"
            >
              <span>Create Workspace Account</span>
              <ArrowRight size={16} />
            </motion.button>
          </form>
        )}

        {(emailVerificationRequired ? step !== 3 : true) && (
          <p className="text-center text-xs font-medium text-slate-400 border-t border-slate-800 pt-4">
            Already have an account?{" "}
            <a href="/signin" className="font-bold text-orange-400 hover:underline">
              Sign in
            </a>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default SignUpForm;
