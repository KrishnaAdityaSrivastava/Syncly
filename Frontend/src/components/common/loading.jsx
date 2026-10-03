import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Loading = ({ variant = "inline", text = "Loading Syncly..." }) => {
  if (variant === "button") {
    return (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-current" />
        <span>{text}</span>
      </span>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16]/80 backdrop-blur-xl text-slate-100">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="h-16 w-16 rounded-full border-2 border-orange-500/20 border-t-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.4)]"
          />
          <div className="absolute grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-400 backdrop-blur-md">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-sm font-medium tracking-wide text-slate-300"
        >
          {text}
        </motion.p>
      </div>
    );
  }

  // default = inline
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="h-10 w-10 rounded-full border-2 border-orange-500/20 border-t-orange-500"
        />
        <Sparkles className="absolute h-4 w-4 text-orange-500 animate-pulse" />
      </div>
      {text && <p className="text-xs font-medium text-slate-400 tracking-wide">{text}</p>}
    </div>
  );
};

export default Loading;
