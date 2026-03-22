import { useEffect, useMemo, useState } from "react";
import { BarChart3, FolderKanban, Activity, CheckCircle2 } from "lucide-react";
import { getUserProjectsApi } from "../api/api.js";
import Loading from "../components/loading.jsx";
import { useNotification } from "../components/notificationContext.jsx";
import { useTheme } from "../components/themeContext.jsx";
import { useDashboard } from "../components/dashboardContext.jsx";

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
  const taskStats = useMemo(() => ({
    todo: taskItems.filter((task) => task.status === "todo").length,
    pending: taskItems.filter((task) => task.status === "pending").length,
    done: taskItems.filter((task) => task.status === "done").length
  }), [taskItems]);

  if (loading) return <Loading variant="inline" text="Loading reports..." />;

  return (
    <div className="space-y-6">
      <section className={`rounded-3xl border p-6 shadow-sm ${darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-3 ${darkMode ? "bg-gray-900 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Reports Overview</h2>
            <p className="text-sm text-gray-500">A quick snapshot of project health, task progress, and recent activity.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Projects", value: data?.totalProject || 0, icon: FolderKanban },
          { label: "Tasks In Progress", value: data?.taskProgress || 0, icon: Activity },
          { label: "Completed Tasks", value: data?.taskCompleted || 0, icon: CheckCircle2 },
          { label: "Team Members", value: data?.teamMember || 0, icon: BarChart3 }
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border p-5 ${darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">{label}</p>
              <Icon size={18} className="text-blue-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={`rounded-3xl border p-6 ${darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"}`}>
          <h3 className="text-lg font-semibold">Project Summary</h3>
          <p className="mt-1 text-sm text-gray-500">Latest projects first, using the most recent update timestamp when available.</p>
          <div className="mt-5 space-y-3">
            {sortedProjects.slice(0, 6).map((project) => (
              <div key={project._id} className={`rounded-2xl border px-4 py-3 ${darkMode ? "border-gray-700 bg-gray-900" : "border-blue-100 bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{project.projectId?.name || "Untitled project"}</p>
                    <p className="text-xs text-gray-500">{project.projectId?.description || "No description provided."}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${darkMode ? "bg-gray-800 text-blue-200" : "bg-white text-blue-700"}`}>
                    {(project.role || "member").replace(/^./, (value) => value.toUpperCase())}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Updated {new Date(project.projectId?.updatedAt || project.projectId?.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
            ))}
            {sortedProjects.length === 0 && <p className="text-sm text-gray-500">No projects available yet.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-3xl border p-6 ${darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"}`}>
            <h3 className="text-lg font-semibold">Task Stats</h3>
            <div className="mt-4 space-y-3">
              {[
                ["To Do", taskStats.todo],
                ["In Progress", taskStats.pending],
                ["Done", taskStats.done]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl border p-6 ${darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"}`}>
            <h3 className="text-lg font-semibold">Recent Activity Log</h3>
            <div className="mt-4 space-y-3">
              {taskItems.slice(0, 6).map((task) => (
                <div key={task._id || task.text} className={`rounded-2xl px-4 py-3 ${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>
                  <p className="font-medium">{task.text}</p>
                  <p className="text-xs text-gray-500">Status: {task.status}</p>
                </div>
              ))}
              {taskItems.length === 0 && <p className="text-sm text-gray-500">No recent task activity found.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
