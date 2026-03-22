import Sidebar from "./sidebar.jsx";
import Navbar from "./navbar.jsx";
import Loading from "./loading.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashBoardApi } from "../api/api";
import { useNotification } from "./notificationContext.jsx";
import { DashboardProvider } from "./dashboardContext.jsx";
import { ThemeProvider, useTheme } from "./themeContext.jsx";

const LayoutContent = ({ children }) => {
  const [active, setActive] = useState("");
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { darkMode } = useTheme();

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
              active={active}
              setActive={setActive}
              navigate={navigate}
              userRole={data.role}
            />
          </div>

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Navbar active={active} userName={data?.name || "User"} />
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
