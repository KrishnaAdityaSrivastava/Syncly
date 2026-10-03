import { useEffect, useState } from "react";
import {
  getAdminHealthApi,
  getAdminStatsApi,
  getAdminUsersApi,
  getAdminProjectsApi,
  getAdminInvitesApi
} from "../api/api.js";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import { ShieldCheck, Users, FolderKanban, Mail, Activity, Server, Clock } from "lucide-react";
import { motion } from "framer-motion";

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

  if (loading) return <Loading variant="inline" text="Loading Admin Console..." />;
  if (!health || !stats) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-xs text-rose-300">
        Unable to load admin data.
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-500">
            System Administration
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <h2 className={`mt-0.5 text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
          Admin Control Center
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Monitor server metrics, audit registered users, track invites, and inspect platform projects.
        </p>
      </div>

      {/* Top Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400" },
          { label: "Total Projects", value: stats.projects, icon: FolderKanban, color: "text-orange-400" },
          { label: "Project Members", value: stats.projectMembers, icon: Activity, color: "text-purple-400" },
          { label: "Pending Invites", value: stats.invites, icon: Mail, color: "text-emerald-400" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`spotlight-card rounded-2xl border p-5 backdrop-blur-md shadow-md ${
                darkMode ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{card.label}</span>
                <Icon size={18} className={card.color} />
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Health & Projects Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Server Health Card */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
          darkMode ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight mb-4 flex items-center gap-2">
            <Server size={18} className="text-emerald-400" /> Server Telemetry & Status
          </h3>

          <div className="space-y-3 text-xs font-semibold text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3">
              <span className="text-slate-400">System Status</span>
              <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {health.status}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3">
              <span className="text-slate-400">Uptime</span>
              <span className="font-bold text-slate-100">{Math.round(health.uptime)} seconds</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3">
              <span className="text-slate-400">Last Ping Timestamp</span>
              <span className="font-bold text-slate-100">{new Date(health.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Project Audit Overview */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
          darkMode ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight mb-4 flex items-center gap-2">
            <FolderKanban size={18} className="text-orange-500" /> Active Platform Projects
          </h3>

          <div className="space-y-2.5">
            {projects.slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-xs">
                <div>
                  <p className="font-extrabold">{p.name}</p>
                  <p className="text-[10px] text-slate-400">Members: {p.memberCount} · Activity Events: {p.activityCount}</p>
                </div>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">Active</span>
              </div>
            ))}
            {projects.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No projects registered.</p>}
          </div>
        </section>
      </div>

      {/* Users & Invites Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Registry */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
          darkMode ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-400" /> Registered User Directory
          </h3>

          <div className="space-y-2.5">
            {users.slice(0, 6).map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-xs">
                <div>
                  <p className="font-bold">{getUserDisplayName(u)}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <span className="rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                  {u.role}
                </span>
              </div>
            ))}
            {users.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No users found.</p>}
          </div>
        </section>

        {/* Invites Log */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
          darkMode ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight mb-4 flex items-center gap-2">
            <Mail size={18} className="text-emerald-400" /> Invitation Log
          </h3>

          <div className="space-y-2.5">
            {invites.slice(0, 6).map((inv) => (
              <div key={inv._id} className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-xs">
                <div>
                  <p className="font-bold">{inv.invitedEmail}</p>
                  <p className="text-[10px] text-slate-400">Project: {inv.projectId?.name || "Unknown"}</p>
                </div>
                <span className="rounded-full bg-slate-700 text-slate-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                  {inv.status}
                </span>
              </div>
            ))}
            {invites.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No invitations logged.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
