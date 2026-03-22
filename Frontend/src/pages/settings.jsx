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
      showNotification("Profile updated", "success");
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
      showNotification("Password updated", "success");
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
    <div
      className={`rounded-xl border p-6 text-sm ${
        darkMode
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      Unable to load settings.
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <div className="space-y-6">
        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
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
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={settings.email}
                disabled
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              Save Profile
            </button>
          </div>
        </section>

        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-xl font-semibold mb-4">Password</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
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
              onClick={handlePasswordSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              Update Password
            </button>
          </div>
        </section>

        <section className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Email notifications</span>
              <input
                type="checkbox"
                checked={settings.settings.notifications.email}
                onChange={() => handleNotificationToggle("email")}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">In-app notifications</span>
              <input
                type="checkbox"
                checked={settings.settings.notifications.inApp}
                onChange={() => handleNotificationToggle("inApp")}
                className="h-4 w-4"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
