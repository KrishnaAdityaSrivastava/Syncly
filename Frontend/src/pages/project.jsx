import { useEffect, useMemo, useState } from "react";
import { getUserProjectsApi, createProjectApi } from "../api/api.js";
import ProjectList from "../components/projects/projectList.jsx";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";

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
      const delay = Math.max(0, 800 - elapsed);
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

      // Normalize new project to match existing format
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
      showNotification("Project created", "success");
    } catch (err) {
      showNotification(
        err?.response?.data?.message || "Failed to create project",
        "error"
      );
    }
  };

  // Reset fields on modal close
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
    <div className="w-full">
      {/* Header actions */}
      <div className="mb-6 flex items-center justify-end">
        {/* Create Project Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition shadow-md hover:shadow-blue-500/25 font-medium"
        >
          + Create Project
        </button>
      </div>

      {/* Project List */}
      {loading ? (
        <Loading variant="inline" text="Loading Project List..." />
      ) : (
        <ProjectList projects={sortedProjects} darkMode={darkMode} />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div
            className={`w-full max-w-md p-6 rounded-xl shadow-xl animate-fadeIn ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"
            }`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              Create Project
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Project Name</label>
                <input
                  type="text"
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full mt-1 p-3 rounded-lg outline-none transition ${
                    darkMode
                      ? "bg-gray-700 border border-gray-600 focus:border-blue-500 text-gray-100"
                      : "bg-gray-100 border border-gray-300 focus:border-blue-500 text-gray-900"
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                <textarea
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full mt-1 p-3 rounded-lg outline-none min-h-[90px] transition ${
                    darkMode
                      ? "bg-gray-700 border border-gray-600 focus:border-blue-500 text-gray-100"
                      : "bg-gray-100 border border-gray-300 focus:border-blue-500 text-gray-900"
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg transition ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition shadow-md hover:shadow-blue-500/25 text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
