import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signInApi } from "../api/api";
import { useNotification } from "../context/notificationContext.jsx";
import Loading from "../components/common/loading.jsx";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loading text="Logging in..." />
        </div>
      )}

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign In</h2>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register("password", { required: "Password is required" })}
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 pr-10 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Don't have an account?
          <a href="/signup" className="text-blue-600 hover:underline"> Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
