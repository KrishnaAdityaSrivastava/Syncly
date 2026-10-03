import { useEffect, useMemo, useState } from "react";
import { BarChart3, FolderKanban, Activity, CheckCircle2, TrendingUp, Shield, Users } from "lucide-react";
import { getUserProjectsApi } from "../api/api.js";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import { useDashboard } from "../context/dashboardContext.jsx";
import { motion } from "framer-motion";

const Reports = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const { data } = useDashboard();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectData = await getUserProjectsApi();
        setProjects(projectData);
      } catch (error) {
        showNotification(error?.response?.data?.message || "Failed to load reports", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [showNotification]);

  const sortedProjects = useMemo(() => {
    const getTimestamp = (project) => {
      const candidate = project?.projectId?.updatedAt || project?.projectId?.createdAt || project?.updatedAt || project?.createdAt;
      const parsed = candidate ? new Date(candidate).getTime() : 0;
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...projects].sort((a, b) => getTimestamp(b) - getTimestamp(a));
  }, [projects]);

  const taskItems = data?.task || [];
  const roleStats = useMemo(() => {
    const counts = projects.reduce((acc, project) => {
      const key = project.role || "member";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { label: "Admin", value: counts.admin || 0, color: "bg-purple-500" },
      { label: "Member", value: counts.member || 0, color: "bg-orange-500" },
      { label: "Viewer", value: counts.viewer || 0, color: "bg-slate-400" }
    ];
  }, [projects]);

  const taskStats = useMemo(() => ({
    todo: taskItems.filter((task) => task.status === "todo").length,
    pending: taskItems.filter((task) => task.status === "pending").length,
    done: taskItems.filter((task) => task.status === "done").length
  }), [taskItems]);

  if (loading) return <Loading variant="inline" text="Loading Analytics & Reports..." />;

  return (
    <div className="w-full space-y-8">
      {/* Top Banner */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500">
          Analytics & Metrics
        </span>
        <h2 className={`mt-0.5 text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
          Performance Reports
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Real-time insights into project delivery rates, task velocity, and role governance.
        </p>
      </div>

      {/* Top Metric Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Projects", value: data?.totalProject || 0, icon: FolderKanban, color: "text-orange-500" },
          { label: "Tasks In Progress", value: data?.taskProgress || 0, icon: Activity, color: "text-amber-500" },
          { label: "Completed Tasks", value: data?.taskCompleted || 0, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Team Members", value: data?.teamMember || 0, icon: Users, color: "text-purple-500" }
        ].map(({ label, value, icon: Icon, color }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`spotlight-card rounded-2xl border p-5 backdrop-blur-md shadow-md ${
              darkMode ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
          </motion.div>
        ))}
      </section>

      {/* Main Charts & Lists Section */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Project Velocity Breakdown */}
        <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
          darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800 mb-5">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-500" /> Active Workspace Projects
            </h3>
            <span className="text-xs font-bold text-slate-400">{projects.length} Total</span>
          </div>

          <div className="space-y-3">
            {sortedProjects.slice(0, 6).map((project) => (
              <div
                key={project._id}
                className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4 transition-all hover:border-orange-500/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      {project.projectId?.name || "Untitled project"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-1 font-medium">
                      {project.projectId?.description || "No description provided."}
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                    {project.role || "member"}
                  </span>
                </div>
              </div>
            ))}
            {sortedProjects.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No projects recorded in history.</p>
            )}
          </div>
        </div>

        {/* Task Velocity Stats */}
        <div className="space-y-6">
          <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
            darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
          }`}>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Task Completion Status
            </h3>

            <div className="space-y-4">
              {[
                { label: "To Do", value: taskStats.todo, color: "bg-slate-500" },
                { label: "In Progress", value: taskStats.pending, color: "bg-amber-500" },
                { label: "Done", value: taskStats.done, color: "bg-emerald-500" }
              ].map(({ label, value, color }) => {
                const total = Math.max(taskItems.length, 1);
                const width = `${Math.round((value / total) * 100)}%`;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-900 dark:text-white">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Governance Breakdown */}
          <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
            darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
          }`}>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Role Governance Breakdown
            </h3>

            <div className="space-y-4">
              {roleStats.map(({ label, value, color }) => {
                const total = Math.max(projects.length, 1);
                const width = `${Math.round((value / total) * 100)}%`;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-900 dark:text-white">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
