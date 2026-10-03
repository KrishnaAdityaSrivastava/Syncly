import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserProjectApi,
  getProjectMembersApi,
  updateProjectSettingsApi,
  addProjectMemberApi,
  removeProjectMemberApi
} from "../api/api.js";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import { useDashboard } from "../context/dashboardContext.jsx";
import { Trash2, UserPlus, Save, Shield, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

const ProjectSettings = () => {
  const { projectId } = useParams();
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const { data: dashboardData } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [role, setRole] = useState("member");
  const [removingMemberId, setRemovingMemberId] = useState("");

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

  const currentUserId = dashboardData?.id;
  const canManageMembers = project?.role === "admin";

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
      showNotification("Member added to project", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to add member", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!canManageMembers) {
      showNotification("You are not allowed to remove members", "error");
      return;
    }

    try {
      setRemovingMemberId(member._id);
      await removeProjectMemberApi(projectId, member.userId?._id);
      setMembers((prev) => prev.filter((item) => item._id !== member._id));
      showNotification("Member removed", "success");
    } catch (err) {
      showNotification(err?.response?.data?.error || err?.response?.data?.message || "Failed to remove member", "error");
    } finally {
      setRemovingMemberId("");
    }
  };

  if (loading) return <Loading variant="inline" text="Loading Project Settings..." />;
  if (!project) return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">
      Unable to load project settings.
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500">
          Configuration
        </span>
        <h2 className={`mt-0.5 text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
          Project Settings
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Update project details, assign user roles, and manage team permissions.
        </p>
      </div>

      {/* Project Details Section */}
      <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl space-y-4 ${
        darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
      }`}>
        <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FolderKanban size={18} className="text-orange-500" /> General Project Details
        </h3>

        <div className="grid gap-4 md:grid-cols-2 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm font-semibold outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm font-medium outline-none focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </section>

      {/* Members & Roles Section */}
      <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl space-y-4 ${
        darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
      }`}>
        <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Shield size={18} className="text-orange-500" /> Members & Role Governance
        </h3>

        <div className="grid gap-3 md:grid-cols-3 pt-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@syncly.com"
            className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm outline-none focus:border-orange-500"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm font-semibold outline-none focus:border-orange-500"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddMember}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:border-orange-500 disabled:opacity-50"
          >
            <UserPlus size={15} />
            <span>Add Member</span>
          </motion.button>
        </div>

        {/* Members Table */}
        <div className="space-y-2.5 pt-4">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 text-xs"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {getUserDisplayName(member.userId)}
              </span>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-0.5 text-[10px] font-extrabold uppercase">
                  {getRoleLabel(member.role)}
                </span>

                {canManageMembers && member.userId?._id !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member)}
                    disabled={removingMemberId === member._id}
                    className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    <span>{removingMemberId === member._id ? "Removing..." : "Remove"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectSettings;
