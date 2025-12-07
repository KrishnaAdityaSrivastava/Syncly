import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/notificationContext.jsx";
import Loading from "./loading.jsx";
import { useState } from "react";

const ProjectList = ({ projects }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const capitalize = (s = "") =>
    s.length === 0 ? "" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  if (loading) return <Loading variant="inline" text="Opening project..." />;

  if (!projects.length)
    return (
      <p className="text-gray-400 text-center py-10">
        No projects found. Create one!
      </p>
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
          className="
            bg-gray-800 border border-gray-700 rounded-xl p-5
            shadow-sm hover:shadow-lg hover:shadow-blue-500/10
            hover:border-blue-500 transition cursor-pointer
            group
          "
        >
          <h2 className="text-lg font-semibold group-hover:text-blue-400 transition">
            {capitalize(p.projectId.name)}
          </h2>

          {p.projectId.description && (
            <p className="text-gray-300 mt-2 line-clamp-2">
              {p.projectId.description}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <span className="text-sm text-gray-500">
              {p.role === "admin" ? "Admin" : "Member"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
