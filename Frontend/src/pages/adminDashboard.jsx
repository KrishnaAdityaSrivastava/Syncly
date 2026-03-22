import { useEffect, useState } from "react";
import {
  getAdminHealthApi,
  getAdminStatsApi,
  getAdminUsersApi,
  getAdminProjectsApi,
  getAdminInvitesApi
} from "../api/api.js";
import Loading from "../components/loading.jsx";
import { useNotification } from "../components/notificationContext.jsx";
import { useTheme } from "../components/themeContext.jsx";

const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invites, setInvites] = useState([]);

  const getUserDisplayName = (user) => {
    const name = user?.name?.trim();
    const email = user?.email?.trim();
    return name || email || "Unknown user";
  };

  const loadAdminData = async () => {
    try {
      const [healthData, statsData, usersData, projectsData, invitesData] = await Promise.all([
        getAdminHealthApi(),
        getAdminStatsApi(),
        getAdminUsersApi(),
        getAdminProjectsApi(),
        getAdminInvitesApi()
      ]);
      setHealth(healthData);
      setStats(statsData);
      setUsers(usersData);
      setProjects(projectsData);
      setInvites(invitesData);
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) return <Loading variant="inline" text="Loading admin dashboard..." />;
  if (!health || !stats) {
    return (
      <div
        className={`rounded-xl border p-6 text-sm ${
          darkMode
            ? "border-red-500/30 bg-red-500/10 text-red-200"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        Unable to load admin data.
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Users", value: stats.users },
          { label: "Projects", value: stats.projects },
          { label: "Members", value: stats.projectMembers },
          { label: "Invites", value: stats.invites }].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 shadow-sm ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className="text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-lg font-semibold mb-4">Server Health</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Status: <span className="text-gray-200">{health.status}</span></p>
            <p>Uptime: <span className="text-gray-200">{Math.round(health.uptime)}s</span></p>
            <p>Timestamp: <span className="text-gray-200">{new Date(health.timestamp).toLocaleString()}</span></p>
          </div>
        </section>

        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project._id} className={`rounded-lg px-4 py-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-gray-400">
                  Members: {project.memberCount} · Activity: {project.activityCount}
                </p>
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-gray-400">No projects found.</p>}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="space-y-3">
            {users.slice(0, 6).map((user) => (
              <div key={user._id} className={`rounded-lg px-4 py-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className="font-medium">{getUserDisplayName(user)}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-400">Role: {user.role} · Status: {user.status}</p>
              </div>
            ))}
            {users.length === 0 && <p className="text-sm text-gray-400">No users found.</p>}
          </div>
        </section>

        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-lg font-semibold mb-4">Invites</h2>
          <div className="space-y-3">
            {invites.slice(0, 6).map((invite) => (
              <div key={invite._id} className={`rounded-lg px-4 py-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className="font-medium">{invite.invitedEmail}</p>
                <p className="text-xs text-gray-400">
                  Project: {invite.projectId?.name || "Unknown"} · Status: {invite.status}
                </p>
              </div>
            ))}
            {invites.length === 0 && <p className="text-sm text-gray-400">No invites found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
