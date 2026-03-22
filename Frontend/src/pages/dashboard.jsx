import { useDashboard } from "../context/dashboardContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import Loading from "../components/common/loading.jsx";
import MainWorkspace from "../components/projects/workspace.jsx";

const Dashboard = () => {
  const { data, refresh } = useDashboard();
  const { darkMode } = useTheme();

  if (!data) return <Loading variant="inline" text="Loading Dashboard..." />;

  const tasks = (type) => data?.task?.filter((task) => task.status === type) || [];

  const stats = [
    { label: "Total Projects", value: data.totalProject },
    { label: "Tasks In Progress", value: data.taskProgress },
    { label: "Completed Tasks", value: data.taskCompleted },
    { label: "Team Members", value: data.teamMember },
  ];

  return (
    <div className={`min-h-screen w-full pt-0 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <div className="px-6">
        <MainWorkspace
          stats={stats}
          tasks={tasks}
          refreshDashboard={refresh}
        />
      </div>
    </div>
  );
};

export default Dashboard;
