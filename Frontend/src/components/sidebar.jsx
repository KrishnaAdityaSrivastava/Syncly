import { useState } from "react";
import { LayoutDashboard, FolderKanban, BarChart3, Settings, LogOut, Menu, MessageSquare, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { signOutApi } from "../api/api";
import { useTheme } from "./themeContext.jsx";
import { useNotification } from "./notificationContext.jsx";

const Sidebar = ({ navigate, userRole }) => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Projects", icon: FolderKanban, path: "/projects" },
    { label: "Messages", icon: MessageSquare, path: "/messages" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];
  const adminItems = [
    { label: "Admin", icon: Settings, path: "/admin" }
  ];

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col border-b transition-all duration-300 lg:border-b-0 lg:border-r ${collapsed ? "lg:w-20" : "lg:w-64"} ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-blue-50 border-blue-200 shadow-sm"
      }`}
    >
      <div className={`flex items-center justify-between gap-3 border-b p-4 sm:p-6 ${darkMode ? "border-gray-700" : "border-blue-200"}`}>
        <span className={`min-w-0 break-words text-2xl font-bold tracking-wide ${darkMode ? "text-blue-400" : "text-blue-700"} ${collapsed ? "lg:hidden" : "block"}`}>
          SYNCLY
        </span>
        <Menu
          size={20}
          className={`shrink-0 cursor-pointer ${darkMode ? "text-blue-400" : "text-blue-700"}`}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = path === "/projects"
            ? location.pathname.startsWith("/projects")
            : location.pathname === path || location.pathname.startsWith(`${path}/`);
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`group relative flex w-full min-w-0 items-center rounded-lg px-4 py-2 font-medium overflow-hidden transition-colors ${
                isActive
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-blue-400"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
            >
              <Icon size={20} className="mr-3 shrink-0" />
              <span className={`${collapsed ? "lg:hidden" : "block"} min-w-0 truncate transition-all duration-300`}>{label}</span>

              {isActive && (
                <span
                  className={`absolute left-0 top-0 h-full w-1 rounded-r-full ${
                    darkMode ? "bg-blue-400" : "bg-white"
                  } transition-all duration-300`}
                />
              )}
            </button>
          );
        })}

        {userRole === "admin" && (
          <div className="pt-4">
            <p className="px-4 text-xs uppercase tracking-wide text-gray-500">Admin</p>
            {adminItems.map(({ label, icon: Icon, path }) => {
              const isActive = path === "/projects"
              ? location.pathname.startsWith("/projects")
              : location.pathname === path || location.pathname.startsWith(`${path}/`);
              return (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`group relative mt-2 flex w-full min-w-0 items-center rounded-lg px-4 py-2 font-medium overflow-hidden transition-colors ${
                    isActive
                      ? darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : darkMode
                        ? "text-gray-400 hover:bg-gray-800 hover:text-blue-400"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                  }`}
                >
                  <Icon size={20} className="mr-3 shrink-0" />
                  <span className={`${collapsed ? "lg:hidden" : "block"} min-w-0 truncate transition-all duration-300`}>{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className={`border-t p-4 ${darkMode ? "border-gray-700" : "border-blue-200"}`}>
        <button
          className={`flex w-full min-w-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
            darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={async () => {
            try {
              await signOutApi();
              navigate("/signin");
              showNotification("Logged out successfully", "success");
            } catch (err) {
              console.error(err);
              showNotification(
                err?.response?.data?.message || "Failed to log out",
                "error"
              );
            }
          }}
        >
          <LogOut size={16} className="mr-2 shrink-0" />
          <span className={`${collapsed ? "lg:hidden" : "block"} min-w-0 truncate`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
