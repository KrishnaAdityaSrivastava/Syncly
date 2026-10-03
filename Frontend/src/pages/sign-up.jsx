import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { sendOtpApi, signUpApi, verifyOtpApi } from "../api/api";
import { useNotification } from "../context/notificationContext.jsx";
import Loading from "../components/common/loading.jsx";

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
      showNotification("OTP sent", "success");
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
      showNotification("Email verified", "success");
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
      showNotification("OTP resent", "success");
    } catch (err) {
      const e = err.response?.data;
      showNotification(e?.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderLoader = loading && <Loading variant="inline" text="Processing..." />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
      <div className="w-full max-w-md space-y-6 border border-slate-200 bg-white p-7 shadow-[0_12px_32px_rgba(20,27,42,.08)]">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign Up</h2>

        {!emailVerificationRequired && (
          <p className="border border-[#f5c8b8] bg-[#fdf0eb] px-4 py-3 text-sm text-[#9a3d20]">
            Email verification is disabled in this environment. You can create your account directly.
          </p>
        )}

        {emailVerificationRequired && step === 1 && (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            <div>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 focus:border-[#e66a3d] focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-[#e66a3d] hover:bg-[#cb5630] transition active:scale-[.99]"
            >
              Send OTP
            </button>

            {renderLoader}
          </form>
        )}

        {emailVerificationRequired && step === 2 && (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <input type="hidden" {...register("email")} value={email} readOnly />

            <div>
              <input
                {...register("otp", { required: "OTP is required" })}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 focus:border-[#e66a3d] focus:outline-none"
              />
              {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-[#e66a3d] hover:bg-[#cb5630] transition active:scale-[.99]"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={resendOtp}
              className={`w-full px-4 py-2 mt-2 font-semibold transition ${
                resendCooldown > 0
                  ? "bg-gray-300 text-slate-500 cursor-not-allowed"
                  : "bg-[#e66a3d] text-white hover:bg-[#cb5630]"
              }`}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </button>

            {renderLoader}
          </form>
        )}

        {step === 3 && (
          <form className="space-y-5" onSubmit={handleSignUp}>
            <div>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 focus:border-[#e66a3d]"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="Name"
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 focus:border-[#e66a3d]"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 focus:border-[#e66a3d]"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <input
                {...register("confirmPassword", {
                  validate: (v) => v === password || "Passwords do not match",
                })}
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 focus:border-[#e66a3d]"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-[#e66a3d] hover:bg-[#cb5630] transition active:scale-[.99]"
            >
              Sign Up
            </button>

            {renderLoader}
          </form>
        )}

        {(emailVerificationRequired ? step !== 3 : true) && (
          <p className="text-sm text-center text-slate-500">
            Already have an account?
            <a href="/signin" className="font-medium text-[#bd4f29] hover:underline"> Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
