import { useState } from "react";
import { LayoutDashboard, FolderKanban, BarChart3, Settings, LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { signOutApi } from "../api/api";
import { useTheme } from "./themeContext.jsx";

const Sidebar = ({ setLoading, navigate }) => {
  const { darkMode } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Projects", icon: FolderKanban, path: "/projects" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className={`transition-all duration-300 ${collapsed ? "w-20" : "w-64"} flex flex-col border-r h-screen ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-indigo-50 border-indigo-300 shadow-sm"
      }`}
    >
      {/* Logo + collapse button */}
      <div className={`flex items-center justify-between p-6 border-b ${darkMode ? "border-gray-700" : "border-indigo-300"}`}>
        <span className={`text-2xl font-bold tracking-wide ${darkMode ? "text-indigo-400" : "text-indigo-700"} ${collapsed ? "hidden" : "block"}`}>
          SYNCLY
        </span>
        <Menu
          size={20}
          className={`cursor-pointer ${darkMode ? "text-indigo-400" : "text-indigo-700"}`}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`group relative flex items-center w-full px-4 py-2 rounded-lg transition-colors font-medium overflow-hidden ${
                isActive
                  ? darkMode
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-500 text-white"
                  : darkMode
                  ? "text-gray-400 hover:bg-gray-800 hover:text-indigo-400"
                  : "text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
              }`}
            >
              <Icon size={20} className="mr-3 flex-shrink-0" />
              <span className={`${collapsed ? "hidden" : "block"} transition-all duration-300`}>{label}</span>

              {isActive && (
                <span
                  className={`absolute left-0 top-0 h-full w-1 rounded-r-full ${
                    darkMode ? "bg-indigo-400" : "bg-white"
                  } transition-all duration-300`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-indigo-300"}`}>
        <button
          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition ${
            darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
          onClick={async () => {
            try {
              await signOutApi();
              navigate("/signin");
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <LogOut size={16} className="mr-2" />
          <span className={`${collapsed ? "hidden" : "block"}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
