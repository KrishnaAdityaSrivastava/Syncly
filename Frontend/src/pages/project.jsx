import { useEffect, useMemo, useState } from "react";
import { getUserProjectsApi, createProjectApi } from "../api/api.js";
import ProjectList from "../components/projects/projectList.jsx";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import { Plus, FolderPlus, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Projects = () => {
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const sortedProjects = useMemo(() => {
    const getProjectTimestamp = (project) => {
      const projectMeta = project?.projectId || {};
      const candidate = projectMeta.updatedAt || projectMeta.createdAt || project.updatedAt || project.createdAt;
      const parsed = candidate ? new Date(candidate).getTime() : 0;
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...projects].sort((a, b) => getProjectTimestamp(b) - getProjectTimestamp(a));
  }, [projects]);

  // Fetch projects
  const fetchProjects = async () => {
    const start = Date.now();
    try {
      const data = await getUserProjectsApi();
      setProjects(data);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || "Failed to load projects",
        "error"
      );
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 400 - elapsed);
      setTimeout(() => setLoading(false), delay);
    }
  };

  // Create new project
  const handleCreate = async () => {
    if (!projectName.trim()) {
      showNotification("Project name is required", "error");
      return;
    }

    try {
      const res = await createProjectApi({ name: projectName, description });
      const newProject = res.project;

      const normalized = {
        _id: newProject._id,
        projectId: newProject,
        role: "admin",
        userId: newProject.createdBy,
      };

      setProjects((prev) => [normalized, ...prev]);
      setShowModal(false);
      setProjectName("");
      setDescription("");
      showNotification("Project created successfully", "success");
    } catch (err) {
      showNotification(
        err?.response?.data?.message || "Failed to create project",
        "error"
      );
    }
  };

  useEffect(() => {
    if (!showModal) {
      setProjectName("");
      setDescription("");
    }
  }, [showModal]);

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500">
            Workspace Hub
          </span>
          <h2 className={`mt-0.5 text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            Projects
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Browse and manage team projects, Kanban boards, and project settings.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Content */}
      {loading ? (
        <Loading variant="inline" text="Loading Projects..." />
      ) : (
        <ProjectList projects={sortedProjects} darkMode={darkMode} />
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl backdrop-blur-xl ${
                darkMode ? "border-slate-800 bg-slate-900/95 text-white" : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/10 text-orange-500">
                    <FolderPlus size={18} />
                  </div>
                  <h3 className="text-base font-extrabold tracking-tight">Create New Project</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-200 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile App Redesign 2026"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description (Optional)</label>
                  <textarea
                    placeholder="What is this project focused on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                  >
                    Create Project
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
