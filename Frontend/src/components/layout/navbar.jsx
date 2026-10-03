import { Sun, Moon, User, ChevronRight, Search, Sparkles, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/themeContext.jsx";
import { motion } from "framer-motion";

const Navbar = ({ active, userName = "User" }) => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const firstName = String(userName).trim().split(" ")[0] || "User";

  return (
    <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090d16]/85 px-6 py-3.5 backdrop-blur-xl transition-colors duration-300">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="text-slate-400 dark:text-slate-500 font-semibold tracking-wide text-xs uppercase">
          Workspace
        </span>
        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
        <motion.h1
          key={active}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base"
        >
          {active}
        </motion.h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut Badge */}
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-500 hover:border-orange-500/40 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <Search size={14} className="text-slate-400" />
          <span>Quick Search...</span>
          <kbd className="flex items-center gap-0.5 rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700">
            <Command size={10} /> K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-amber-400 shadow-sm transition-all hover:border-orange-500/50"
          aria-label="Toggle color theme"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </motion.button>

        {/* User Profile Pill */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 py-1 pl-1.5 pr-3 text-sm font-semibold shadow-sm transition-all hover:border-orange-500/40"
        >
          <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-xs font-extrabold text-white shadow-sm">
            {firstName[0].toUpperCase()}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
          </span>
          <span className="hidden sm:inline text-slate-800 dark:text-slate-200 tracking-tight text-xs font-bold">
            {firstName}
          </span>
          <User size={14} className="text-slate-400" />
        </motion.button>
      </div>
    </header>
  );
};

export default Navbar;
