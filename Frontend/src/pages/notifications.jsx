import { useEffect, useState, useMemo } from "react";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi
} from "../api/api";
import { useTheme } from "../context/themeContext.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { Bell, CheckCheck, Sparkles, Filter, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../components/common/loading.jsx";

const Notifications = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

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

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((item) => !item.readAt);
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500">
            System Alerts
          </span>
          <h2 className={`mt-0.5 text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            Notifications
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread alert${unreadCount === 1 ? "" : "s"} requiring attention.`
              : "All clear! No unread notifications."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 text-xs font-bold">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-slate-800 text-orange-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === "unread"
                  ? "bg-white dark:bg-slate-800 text-orange-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-40"
          >
            <CheckCheck size={15} />
            <span>Mark All Read</span>
          </motion.button>
        </div>
      </div>

      {/* Notifications List Container */}
      <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
        darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
      }`}>
        {loading ? (
          <Loading variant="inline" text="Loading notifications..." />
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={32} className="text-slate-500/40 mb-3" />
            <p className="text-sm font-bold text-slate-400">No notifications to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-all shadow-sm ${
                      isUnread
                        ? darkMode
                          ? "border-orange-500/40 bg-orange-500/10 text-white"
                          : "border-orange-200 bg-orange-50/70 text-slate-900"
                        : darkMode
                          ? "border-slate-800/80 bg-slate-950/60 text-slate-300"
                          : "border-slate-200/60 bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isUnread ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "bg-slate-600"}`} />
                      <div>
                        <p className="text-xs font-bold leading-relaxed">{n.message}</p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Clock size={11} />
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {isUnread && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-[11px] font-bold text-orange-400 hover:bg-orange-500 hover:text-white transition-all shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
