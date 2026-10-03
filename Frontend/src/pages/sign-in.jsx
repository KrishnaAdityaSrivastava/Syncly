import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signInApi } from "../api/api";
import { useNotification } from "../context/notificationContext.jsx";
import Loading from "../components/common/loading.jsx";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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
    <div className="relative grid min-h-screen bg-[#f7f8fa] lg:grid-cols-[1fr_460px]">
      <section className="hidden bg-[#172033] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 font-semibold"><span className="grid h-7 w-7 place-items-center bg-[#e66a3d] text-sm">S</span> Syncly</div>
        <div className="max-w-lg"><p className="text-sm font-medium text-[#ffad90]">Your team’s operating system</p><h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight">Work stays clear when it has one home.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-400">Plan personal work, keep projects moving, and stay close to the conversations that matter.</p></div>
        <p className="text-xs text-slate-500">Syncly workspace</p>
      </section>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
          <Loading text="Logging in..." />
        </div>
      )}

      <div className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-sm space-y-7">
        <div className="lg:hidden flex items-center gap-2 font-semibold text-slate-900"><span className="grid h-7 w-7 place-items-center bg-[#e66a3d] text-sm text-white">S</span> Syncly</div>
        <div><p className="text-sm font-medium text-[#bd4f29]">Welcome back</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in to your workspace</h2><p className="mt-2 text-sm text-slate-500">Use your account to continue where you left off.</p></div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="Email"
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#e66a3d] focus:outline-none"
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
              className="w-full border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-[#e66a3d] focus:outline-none"
            />
            <button type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-[#e66a3d] px-4 py-2.5 font-semibold text-white transition hover:bg-[#cb5630] active:scale-[.99]"
          >
            Sign in <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-sm text-slate-500">
          Don't have an account?
          <a href="/signup" className="font-medium text-[#bd4f29] hover:underline"> Create an account</a>
        </p>
      </div></div>
    </div>
  );
};

export default SignInForm;
