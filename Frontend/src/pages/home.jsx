import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  MessageSquareText,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const featureCards = [
  {
    title: "Project visibility",
    description: "Keep milestones, owners, and updates aligned in one place.",
    icon: FolderKanban,
  },
  {
    title: "Fast team communication",
    description: "Move from task planning to direct teammate updates without context switching.",
    icon: MessageSquareText,
  },
  {
    title: "Clear reporting",
    description: "Track delivery progress, workload, and momentum with simple summaries.",
    icon: BarChart3,
  },
];

const Home = () => {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const shellStyles = darkMode
    ? "bg-gray-950 text-gray-100"
    : "bg-slate-50 text-slate-900";
  const panelStyles = darkMode
    ? "border-white/10 bg-white/5 backdrop-blur-xl"
    : "border-slate-200 bg-white/90 backdrop-blur-xl";
  const mutedText = darkMode ? "text-gray-300" : "text-slate-600";
  const secondaryPanel = darkMode ? "bg-gray-900/80" : "bg-slate-100";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${shellStyles}`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute bottom-[-8%] left-1/3 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
          <header className={`flex items-center justify-between rounded-3xl border px-5 py-4 shadow-sm ${panelStyles}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">Syncly</p>
              <p className={`mt-1 text-sm ${mutedText}`}>Project coordination for teams that want clarity without clutter.</p>
            </div>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`rounded-2xl border p-3 transition ${darkMode ? "border-white/10 bg-gray-900 hover:bg-gray-800" : "border-slate-200 bg-white hover:bg-slate-100"}`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
            </button>
          </header>

          <main className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-14">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-5"
              >
                <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm ${darkMode ? "border-blue-400/20 bg-blue-500/10 text-blue-200" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                  Project management for focused teams
                </span>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                  Keep projects, tasks, and updates in one
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent"> connected workspace</span>.
                </h1>
                <p className={`max-w-2xl text-base leading-7 md:text-lg ${mutedText}`}>
                  Plan work, stay aligned, and keep progress visible without the extra noise.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <button
                  onClick={() => navigate("/signin")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
                >
                  Sign In
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className={`inline-flex items-center justify-center rounded-2xl border px-6 py-3 text-base font-semibold transition ${darkMode ? "border-white/10 bg-white/5 text-gray-100 hover:bg-white/10" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"}`}
                >
                  Create account
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="grid gap-4 md:grid-cols-3"
              >
                {featureCards.map(({ title, description, icon: Icon }) => (
                  <div key={title} className={`rounded-3xl border p-5 shadow-sm ${panelStyles}`}>
                    <div className={`inline-flex rounded-2xl p-3 ${darkMode ? "bg-gray-900 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
                      <Icon size={20} />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                    <p className={`mt-2 text-sm leading-6 ${mutedText}`}>{description}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`rounded-[2rem] border p-5 shadow-2xl ${panelStyles}`}
            >
              <div className={`rounded-[1.5rem] border p-5 ${darkMode ? "border-white/10 bg-gray-950/80" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-blue-500">Workspace snapshot</p>
                    <h2 className="mt-1 text-2xl font-semibold">Launch readiness</h2>
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-sm font-semibold ${darkMode ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
                    On track
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Projects", "12"],
                    ["Open tasks", "38"],
                    ["Team updates", "9"]
                  ].map(([label, value]) => (
                    <div key={label} className={`rounded-2xl p-4 ${secondaryPanel}`}>
                      <p className={`text-xs uppercase tracking-[0.25em] ${mutedText}`}>{label}</p>
                      <p className="mt-3 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-blue-500/15 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Weekly delivery</p>
                      <p className={`mt-1 text-sm ${mutedText}`}>Tasks, updates, and status in one view.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${darkMode ? "bg-blue-500/10 text-blue-200" : "bg-blue-50 text-blue-700"}`}>
                      84% complete
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "Finalize project scope with stakeholders",
                      "Review in-progress tasks across product and engineering",
                      "Share end-of-day updates in direct messages"
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-500" />
                        <p className={`text-sm leading-6 ${mutedText}`}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
