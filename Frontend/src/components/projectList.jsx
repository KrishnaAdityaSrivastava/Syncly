import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/notificationContext.jsx";
import Loading from "./loading.jsx";
import { useState } from "react";

const ProjectList = ({ projects, darkMode }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const capitalize = (s = "") =>
    s.length === 0 ? "" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  if (loading) return <Loading variant="inline" text="Opening project..." />;

  if (!projects.length)
    return (
      <div
        className={`rounded-xl border p-6 text-center ${
          darkMode ? "border-gray-700 bg-gray-800 text-gray-300" : "border-gray-200 bg-white text-gray-600"
        }`}
      >
        <p className="text-sm">No projects found. Create one!</p>
      </div>
    );

  const openProject = async (id) => {
    try {
      setLoading(true);
      navigate(`/projects/${id}`);
    } catch {
      showNotification("Failed to open project", "error");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {projects.map((p) => (
        <div
          key={p._id}
          onClick={() => openProject(p.projectId._id)}
          className={`rounded-xl border p-5 shadow-sm transition cursor-pointer group ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-blue-400 hover:shadow-blue-500/10"
              : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-blue-500/10"
          }`}
        >
          <h2 className="text-lg font-semibold transition group-hover:text-blue-500">
            {capitalize(p.projectId.name)}
          </h2>

          {p.projectId.description && (
            <p className={`mt-2 line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {p.projectId.description}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {p.role === "admin" ? "Admin" : "Member"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
