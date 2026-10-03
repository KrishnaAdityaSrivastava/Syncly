import { useState } from "react";
import { LayoutDashboard, FolderKanban, BarChart3, Settings, LogOut, PanelLeftClose, PanelLeftOpen, MessageSquare, Bell, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { signOutApi } from "../../api/api";
import { useTheme } from "../../context/themeContext.jsx";
import { useNotification } from "../../context/notificationContext.jsx";

const Sidebar = ({ navigate, userRole }) => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    ["Dashboard", LayoutDashboard, "/dashboard"], ["Projects", FolderKanban, "/projects"],
    ["Messages", MessageSquare, "/messages"], ["Notifications", Bell, "/notifications"],
    ["Reports", BarChart3, "/reports"], ["Settings", Settings, "/settings"],
  ];
  const isActive = (path) => path === "/projects" ? location.pathname.startsWith(path) : location.pathname === path || location.pathname.startsWith(`${path}/`);
  const surface = darkMode ? "bg-[#151c29] border-[#2a3445] text-slate-300" : "bg-white border-slate-200 text-slate-600";

  const logout = async () => {
    try { await signOutApi(); showNotification("Logged out successfully", "success"); navigate("/signin"); }
    catch (error) { showNotification(error?.response?.data?.message || "Failed to log out", "error"); }
  };

  return <aside className={`flex h-full min-h-0 w-full flex-col border-b transition-[width] duration-200 lg:border-b-0 lg:border-r ${collapsed ? "lg:w-[76px]" : "lg:w-60"} ${surface}`}>
    <div className="flex h-16 items-center justify-between border-b border-inherit px-4">
      <button onClick={() => navigate("/dashboard")} className={`flex items-center gap-2 text-left font-semibold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`} aria-label="Go to dashboard">
        <span className="grid h-7 w-7 place-items-center bg-[#e66a3d] text-sm font-bold text-white">S</span>
        {!collapsed && <span>Syncly</span>}
      </button>
      <button onClick={() => setCollapsed((value) => !value)} className={`hidden p-1.5 transition hover:text-[#e66a3d] lg:block ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-100"}`} aria-label="Toggle navigation">
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
      {!collapsed && <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">Workspace</p>}
      {navItems.map(([label, Icon, path]) => <button key={label} onClick={() => navigate(path)} title={collapsed ? label : undefined} className={`flex w-full items-center gap-3 px-2.5 py-2 text-sm font-medium transition-all duration-150 ${isActive(path) ? "bg-[#fdf0eb] text-[#bd4f29] dark:bg-[#35231f] dark:text-[#ffad90]" : "hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/5 dark:hover:text-white"}`}>
        <Icon size={17} strokeWidth={isActive(path) ? 2.25 : 1.8} /> {!collapsed && <span>{label}</span>}
      </button>)}
      {userRole === "admin" && <div className="mt-5 border-t border-inherit pt-4"><p className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400 ${collapsed ? "hidden" : ""}`}>Administration</p><button onClick={() => navigate("/admin")} title={collapsed ? "Admin" : undefined} className={`flex w-full items-center gap-3 px-2.5 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/5 dark:hover:text-white ${isActive("/admin") ? "text-[#bd4f29]" : ""}`}><ShieldCheck size={17} /> {!collapsed && "Admin"}</button></div>}
    </nav>
    <div className="border-t border-inherit p-3"><button onClick={logout} title={collapsed ? "Log out" : undefined} className="flex w-full items-center gap-3 px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-300"><LogOut size={17} /> {!collapsed && "Log out"}</button></div>
  </aside>;
};
export default Sidebar;
