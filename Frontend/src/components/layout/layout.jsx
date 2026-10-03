import Sidebar from "./sidebar.jsx";
import Navbar from "./navbar.jsx";
import Loading from "../common/loading.jsx";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dashBoardApi } from "../../api/api";
import { useNotification } from "../../context/notificationContext.jsx";
import { DashboardProvider } from "../../context/dashboardContext.jsx";
import { ThemeProvider, useTheme } from "../../context/themeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import "../../App.css";

const routeTitles = [
  { match: (pathname) => pathname.startsWith("/projects"), label: "Projects" },
  { match: (pathname) => pathname.startsWith("/messages"), label: "Messages" },
  { match: (pathname) => pathname.startsWith("/notifications"), label: "Notifications" },
  { match: (pathname) => pathname.startsWith("/reports"), label: "Reports" },
  { match: (pathname) => pathname.startsWith("/settings"), label: "Settings" },
  { match: (pathname) => pathname.startsWith("/admin"), label: "Admin" },
  { match: (pathname) => pathname.startsWith("/invites"), label: "Project Invite" },
  { match: (pathname) => pathname.startsWith("/dashboard"), label: "Dashboard" }
];

const LayoutContent = ({ children }) => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { darkMode } = useTheme();

  const activeLabel = useMemo(() => {
    const matchedRoute = routeTitles.find(({ match }) => match(location.pathname));
    return matchedRoute?.label || "Dashboard";
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const response = await dashBoardApi();
      setData(response);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || "Failed to load dashboard data",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) {
    return (
      <div className={`flex min-h-screen ${darkMode ? "dark bg-[#090d16] text-slate-100" : "bg-[#f4f6fb] text-slate-900"}`}>
        <Loading variant="fullscreen" text="Preparing Syncly Workspace..." />
      </div>
    );
  }

  return (
    <DashboardProvider data={data} refresh={fetchData}>
      <div className={`app-shell min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-[#090d16]" : "bg-[#f4f6fb]"}`}>
        <div className="bg-mesh-pattern relative min-h-screen">
          <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Sticky Sidebar Container */}
            <div className="lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0 z-40">
              <Sidebar navigate={navigate} userRole={data.role} />
            </div>

            {/* Main Section */}
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <Navbar active={activeLabel} userName={data?.name || "User"} />
              <AnimatePresence mode="wait">
                <motion.main
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8"
                >
                  {children}
                </motion.main>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

const Layout = ({ children }) => (
  <ThemeProvider>
    <LayoutContent>{children}</LayoutContent>
  </ThemeProvider>
);

export default Layout;
