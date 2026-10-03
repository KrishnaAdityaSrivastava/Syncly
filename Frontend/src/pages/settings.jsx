import { useEffect, useState } from "react";
import {
  getUserSettingsApi,
  updateUserProfileApi,
  updateUserPasswordApi,
  updateUserNotificationsApi
} from "../api/api.js";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import { User, Lock, Bell, Save, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Settings = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const loadSettings = async () => {
    try {
      const data = await getUserSettingsApi();
      setSettings(data);
      setName(data.name);
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleProfileSave = async () => {
    if (!name.trim()) {
      showNotification("Name is required", "error");
      return;
    }
    try {
      setSaving(true);
      const data = await updateUserProfileApi({ name });
      setSettings((prev) => ({ ...prev, name: data.name }));
      showNotification("Profile updated successfully", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword) {
      showNotification("Both password fields are required", "error");
      return;
    }
    try {
      setSaving(true);
      await updateUserPasswordApi({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      showNotification("Password updated successfully", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    try {
      setSaving(true);
      const nextValue = !settings.settings.notifications[key];
      const data = await updateUserNotificationsApi({
        email: key === "email" ? nextValue : settings.settings.notifications.email,
        inApp: key === "inApp" ? nextValue : settings.settings.notifications.inApp
      });
      setSettings((prev) => ({ ...prev, settings: data.settings }));
      showNotification("Notification preferences updated", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update notifications", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading variant="inline" text="Loading settings..." />;
  if (!settings) return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-xs text-rose-300">
      Unable to load settings.
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500">
          Preferences
        </span>
        <h2 className={`mt-0.5 text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
          Account Settings
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Manage your personal profile, credentials, and notification preferences.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Profile Details */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl space-y-4 ${
          darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-orange-500" /> Personal Identity
          </h3>

          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm font-semibold outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={settings.email}
                disabled
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40 p-3 text-sm font-medium opacity-60 cursor-not-allowed text-slate-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProfileSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              <Save size={15} />
              <span>Save Profile Changes</span>
            </motion.button>
          </div>
        </section>

        {/* Security Password */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl space-y-4 ${
          darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound size={18} className="text-orange-500" /> Password Security
          </h3>

          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-sm outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-bold text-white hover:border-orange-500 transition-all disabled:opacity-50"
            >
              <Lock size={15} />
              <span>Update Password</span>
            </motion.button>
          </div>
        </section>

        {/* Notifications */}
        <section className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl space-y-4 ${
          darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
        }`}>
          <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-orange-500" /> Notifications & Alerts
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { key: "email", label: "Email notifications for board activities & mentions" },
              { key: "inApp", label: "In-App workspace popup & badge alerts" }
            ].map(({ key, label }) => {
              const active = settings.settings.notifications[key];
              return (
                <div
                  key={key}
                  onClick={() => handleNotificationToggle(key)}
                  className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 cursor-pointer hover:border-orange-500/40 transition-all"
                >
                  <span className="text-xs font-semibold text-slate-300">{label}</span>
                  <div className={`h-6 w-11 rounded-full p-1 transition-colors ${active ? "bg-orange-500" : "bg-slate-700"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
