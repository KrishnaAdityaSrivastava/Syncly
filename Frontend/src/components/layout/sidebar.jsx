import { useState } from "react";
import { 
  LayoutDashboard, FolderKanban, BarChart3, Settings, LogOut, 
  PanelLeftClose, PanelLeftOpen, MessageSquare, Bell, ShieldCheck, Sparkles 
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { signOutApi } from "../../api/api";
import { useTheme } from "../../context/themeContext.jsx";
import { useNotification } from "../../context/notificationContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ navigate, userRole }) => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    ["Dashboard", LayoutDashboard, "/dashboard"],
    ["Projects", FolderKanban, "/projects"],
    ["Messages", MessageSquare, "/messages"],
    ["Notifications", Bell, "/notifications"],
    ["Reports", BarChart3, "/reports"],
    ["Settings", Settings, "/settings"],
  ];

  const isActive = (path) => 
    path === "/projects" 
      ? location.pathname.startsWith(path) 
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const logout = async () => {
    try {
      await signOutApi();
      showNotification("Logged out successfully", "success");
      navigate("/signin");
    } catch (error) {
      showNotification(error?.response?.data?.message || "Failed to log out", "error");
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative z-20 flex h-full min-h-screen flex-col border-r transition-colors duration-300 ${
        darkMode 
          ? "border-slate-800/80 bg-[#0e1422]/90 backdrop-blur-xl text-slate-300" 
          : "border-slate-200/80 bg-white/90 backdrop-blur-xl text-slate-700"
      }`}
    >
      {/* Header / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-inherit px-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 text-left focus:outline-none group"
          aria-label="Go to dashboard"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 font-bold text-white shadow-lg shadow-orange-500/25 transition-transform duration-300 group-hover:scale-105">
            <span className="text-base tracking-wider font-extrabold">S</span>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0e1422]" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className={`text-base font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Syncly
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-orange-500 uppercase">
                PRO 2026
              </span>
            </motion.div>
          )}
        </button>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`hidden p-2 rounded-lg transition-colors lg:block ${
            darkMode 
              ? "hover:bg-slate-800 text-slate-400 hover:text-slate-100" 
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
          }`}
          aria-label="Toggle navigation"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5" aria-label="Main navigation">
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Workspace
          </p>
        )}

        {navItems.map(([label, Icon, path]) => {
          const active = isActive(path);
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
              className={`relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNavPill"
                  className={`absolute inset-0 rounded-xl ${
                    darkMode
                      ? "bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border border-orange-500/30"
                      : "bg-orange-50 border border-orange-200/80 shadow-sm"
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                size={19}
                className={`relative z-10 transition-transform duration-200 ${
                  active ? "scale-110 text-orange-500" : ""
                }`}
              />
              {!collapsed && (
                <span className="relative z-10 truncate tracking-tight">{label}</span>
              )}
            </button>
          );
        })}

        {userRole === "admin" && (
          <div className="mt-6 border-t border-slate-200/60 dark:border-slate-800/80 pt-4">
            {!collapsed && (
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Administration
              </p>
            )}
            <button
              onClick={() => navigate("/admin")}
              title={collapsed ? "Admin" : undefined}
              className={`relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive("/admin")
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
              }`}
            >
              {isActive("/admin") && (
                <motion.div
                  layoutId="activeNavPill"
                  className={`absolute inset-0 rounded-xl ${
                    darkMode
                      ? "bg-gradient-to-r from-orange-500/15 to-transparent border border-orange-500/30"
                      : "bg-orange-50 border border-orange-200/80"
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <ShieldCheck size={19} className="relative z-10 text-purple-500" />
              {!collapsed && <span className="relative z-10 truncate">Admin Console</span>}
            </button>
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/80 p-3">
        <button
          onClick={logout}
          title={collapsed ? "Log out" : undefined}
          className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
        >
          <LogOut size={19} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
