import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { acceptProjectInviteApi } from "../api/api";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const ProjectInvite = () => {
  const [status, setStatus] = useState("Validating invitation token...");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid or missing invitation link.");
      setLoading(false);
      return;
    }

    const acceptInvite = async () => {
      try {
        const res = await acceptProjectInviteApi(token);
        setStatus(res.message || "Invitation accepted! Redirecting to projects...");
        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
          navigate("/projects");
        }, 2000);
      } catch (error) {
        if (error?.response?.status === 401) {
          setStatus("Please sign in with the invited account before accepting this invitation.");
        } else {
          setStatus(error?.response?.data?.message || "Failed to accept invite or link expired.");
        }
        setLoading(false);
      }
    };

    acceptInvite();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-100 p-6">
      <div className="fixed inset-0 pointer-events-none bg-mesh-pattern opacity-80" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-orange-500">
          {success ? <CheckCircle2 size={24} className="text-emerald-400" /> : <Sparkles size={24} />}
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-white mb-2">Project Invitation</h2>
        <p className="text-xs font-medium text-slate-300 leading-relaxed">{status}</p>

        {loading && (
          <div className="mt-4 flex justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectInvite;
