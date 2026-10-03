import { useState } from "react";
import { Plus, ArrowRight, Check, Sparkles, FolderKanban, Clock, CheckCircle2 } from "lucide-react";
import { addTaskApi, upgradeTaskApi } from "../../api/api";
import Loading from "../common/loading.jsx";
import { useNotification } from "../../context/notificationContext.jsx";
import { useTheme } from "../../context/themeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

const statuses = [
  { name: "To do", value: "todo", dot: "bg-slate-400", border: "border-slate-500/30" },
  { name: "In progress", value: "pending", dot: "bg-amber-400", border: "border-amber-500/30" },
  { name: "Done", value: "done", dot: "bg-emerald-400", border: "border-emerald-500/30" }
];

const MainWorkspace = ({ stats, tasks, refreshDashboard }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const { showNotification } = useNotification();

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      setLoading(true);
      await addTaskApi(title);
      setTitle("");
      await refreshDashboard();
      showNotification("Task added to workspace", "success");
    } catch {
      showNotification("Failed to add task", "error");
    } finally {
      setLoading(false);
    }
  };

  const advance = async (task) => {
    if (task.status === "done") return;
    try {
      setLoading(true);
      await upgradeTaskApi(task);
      await refreshDashboard();
      showNotification("Task status updated", "success");
    } catch {
      showNotification("Unable to update task", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Stats Banner */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`spotlight-card rounded-2xl border p-5 transition-all ${
              darkMode 
                ? "border-slate-800 bg-slate-900/80 text-slate-100 shadow-xl" 
                : "border-slate-200/80 bg-white text-slate-900 shadow-sm"
            }`}
          >
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {stat.label}
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tracking-tight text-orange-500 dark:text-orange-400">
                {stat.value || 0}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                Live Status
              </span>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Quick Add Bar */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center shadow-lg backdrop-blur-md ${
          darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
        }`}
      >
        <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 px-4 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
          <Plus size={18} className="text-orange-500" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new personal task..."
            className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            aria-label="New task title"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addTask}
          disabled={loading || !title.trim()}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loading variant="button" text="Adding..." />
          ) : (
            <>
              <span>Add Task</span>
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </motion.section>

      {/* Kanban Task Columns */}
      <section className="grid gap-6 lg:grid-cols-3">
        {statuses.map((status) => {
          const items = tasks(status.value);
          return (
            <div
              key={status.value}
              className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
                darkMode ? "border-slate-800/80 bg-slate-900/60" : "border-slate-200/80 bg-white/80"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight">
                  <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                  <span className={darkMode ? "text-slate-100" : "text-slate-900"}>{status.name}</span>
                </div>
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                  {items.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3 min-h-[220px]">
                <AnimatePresence mode="popLayout">
                  {items.length ? (
                    items.map((task) => (
                      <motion.button
                        key={task._id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        whileHover={{ y: -2 }}
                        onClick={() => advance(task)}
                        className={`group flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition-all shadow-sm ${
                          darkMode 
                            ? "border-slate-800 bg-slate-950/70 text-slate-100 hover:border-orange-500/40" 
                            : "border-slate-200/80 bg-white text-slate-800 hover:border-orange-500/40"
                        }`}
                      >
                        <span className="line-clamp-2 pr-2">{task.text}</span>
                        {status.value === "done" ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <Check size={14} /> Done
                          </span>
                        ) : (
                          <ArrowRight
                            size={16}
                            className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                          />
                        )}
                      </motion.button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Clock size={24} className="text-slate-400 dark:text-slate-600 mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-400">No tasks in {status.name.toLowerCase()}</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default MainWorkspace;
