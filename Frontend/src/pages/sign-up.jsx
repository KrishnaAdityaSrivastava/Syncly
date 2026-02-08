import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { sendOtpApi, signUpApi, verifyOtpApi } from "../api/api";
import { useNotification } from "../components/notificationContext.jsx";
import Loading from "../components/loading.jsx";

const SignUpForm = () => {
  const [step, setStep] = useState(1);
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign Up</h2>

        {step === 1 && (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            <div>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              Send OTP
            </button>

            {renderLoader}
          </form>
        )}

        {step === 2 && (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <input type="hidden" {...register("email")} value={email} readOnly />

            <div>
              <input
                {...register("otp", { required: "OTP is required" })}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={resendOtp}
              className={`w-full px-4 py-2 mt-2 rounded-lg font-semibold ${
                resendCooldown > 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
                {...register("name", { required: "Name is required" })}
                placeholder="Name"
                className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
            >
              Sign Up
            </button>

            {renderLoader}
          </form>
        )}

        {step !== 3 && (
          <p className="text-sm text-center text-gray-600">
            Already have an account?
            <a href="/signin" className="text-blue-600 hover:underline"> Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
