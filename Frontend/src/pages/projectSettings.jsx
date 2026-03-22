import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserProjectApi,
  getProjectMembersApi,
  updateProjectSettingsApi,
  addProjectMemberApi
} from "../api/api.js";
import Loading from "../components/loading.jsx";
import { useNotification } from "../components/notificationContext.jsx";
import { useTheme } from "../components/themeContext.jsx";

const ProjectSettings = () => {
  const { projectId } = useParams();
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [role, setRole] = useState("member");

  const getUserDisplayName = (user) => {
    const name = user?.name?.trim();
    const email = user?.email?.trim();
    return name || email || "Unknown user";
  };

  const getRoleLabel = (value = "") => {
    const labels = {
      admin: "Admin",
      manager: "Manager",
      member: "Member",
      viewer: "Viewer"
    };

    return labels[value] || (value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Member");
  };

  const loadSettings = async () => {
    try {
      const [projectData, memberData] = await Promise.all([
        getUserProjectApi(projectId),
        getProjectMembersApi(projectId)
      ]);
      setProject(projectData);
      setMembers(memberData);
      setName(projectData.projectId?.name || "");
      setDescription(projectData.projectId?.description || "");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to load project settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      showNotification("Project name is required", "error");
      return;
    }
    try {
      setSaving(true);
      const data = await updateProjectSettingsApi(projectId, { name, description });
      setProject((prev) => ({
        ...prev,
        projectId: {
          ...prev.projectId,
          name: data.name,
          description: data.description
        }
      }));
      showNotification("Project settings updated", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update project", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!inviteEmail.includes("@")) {
      showNotification("Enter a valid email", "error");
      return;
    }
    try {
      setSaving(true);
      const res = await addProjectMemberApi(projectId, { email: inviteEmail, role });
      if (res?.member) {
        setMembers((prev) => [...prev, res.member]);
      }
      setInviteEmail("");
      setRole("member");
      showNotification("Member added", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to add member", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading variant="inline" text="Loading project settings..." />;
  if (!project) return (
    <div
      className={`rounded-xl border p-6 text-sm ${
        darkMode
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      Unable to load project settings.
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <h1 className="text-2xl font-semibold mb-6">Project Settings</h1>

      <div className="space-y-6">
        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Description</label>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </section>

        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-lg font-semibold mb-4">Members & Roles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="member@syncly.com"
              className={`rounded-lg border px-3 py-2 outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
              }`}
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={`rounded-lg border px-3 py-2 outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
              }`}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={handleAddMember}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              Add Member
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {members.map((member) => (
              <div
                key={member._id}
                className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{getUserDisplayName(member.userId)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  darkMode ? "bg-gray-800 text-blue-200" : "bg-white text-blue-700"
                }`}>
                  {getRoleLabel(member.role)}
                </span>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-gray-400">No members yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectSettings;
