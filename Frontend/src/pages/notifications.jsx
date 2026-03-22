import { useEffect, useState } from "react";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi
} from "../api/api";
import { useTheme } from "../context/themeContext.jsx";
import { useNotification } from "../context/notificationContext.jsx";

const Notifications = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotificationsApi();
      setNotifications(data);
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to load notifications",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      const data = await markNotificationReadApi(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, readAt: data.readAt } : item
        )
      );
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to mark notification read",
        "error"
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))
      );
      showNotification("All notifications marked as read", "success");
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to mark all as read",
        "error"
      );
    }
  };

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "No unread notifications."}
        </p>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
            unreadCount === 0 ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Mark all read
        </button>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-blue-200 bg-white"
        }`}
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border px-4 py-3 ${
                  notification.readAt
                    ? darkMode
                      ? "border-gray-700"
                      : "border-blue-100"
                    : darkMode
                      ? "border-blue-400 bg-gray-700"
                      : "border-blue-300 bg-blue-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.readAt && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
