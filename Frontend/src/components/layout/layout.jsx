import Sidebar from "./sidebar.jsx";
import Navbar from "./navbar.jsx";
import Loading from "../common/loading.jsx";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dashBoardApi } from "../../api/api";
import { useNotification } from "../../context/notificationContext.jsx";
import { DashboardProvider } from "../../context/dashboardContext.jsx";
import { ThemeProvider, useTheme } from "../../context/themeContext.jsx";

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
      <div className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
        <Loading variant="fullscreen" text="Loading ..." />
      </div>
    );
  }

  return (
    <DashboardProvider data={data} refresh={fetchData}>
      <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
        <div className="flex min-h-screen flex-col lg:flex-row">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0">
            <Sidebar
              navigate={navigate}
              userRole={data.role}
            />
          </div>

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Navbar active={activeLabel} userName={data?.name || "User"} />
            <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
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
