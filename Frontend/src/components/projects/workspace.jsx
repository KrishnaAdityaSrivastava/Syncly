import { useState } from "react";
import { Plus } from "lucide-react";
import { addTaskApi, upgradeTaskApi } from "../../api/api";
import Loading from "../common/loading.jsx";
import { useNotification } from "../../context/notificationContext.jsx";
import { useTheme } from "../../context/themeContext.jsx";

const MainWorkspace = ({ stats, tasks, refreshDashboard }) => {
  const { darkMode } = useTheme();
  const columns = ["To Do", "In Progress", "Done"];
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const { showNotification } = useNotification();

  const handleAddTask = async () => {
    if (!title.trim()) return;
    try {
      setLoading(true);
      await addTaskApi(title);
      setTitle("");
      await refreshDashboard();
      showNotification("Task added successfully", "success");
    } catch {
      showNotification("Failed to add task", "error");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleUpgradeTask = async (task) => {
    if (task.status === "done") return;
    try {
      setLoading(true);
      await upgradeTaskApi(task);
      await refreshDashboard();
      showNotification(`Task "${task.text}" updated`, "success");
    } catch {
      showNotification(`Failed to update task "${task.text}"`, "error");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <main className="flex-1 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl shadow transition-colors ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</p>
            <h2 className="text-2xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Add Task */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={handleAddTask}
          disabled={loading}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50"
        >
          <Plus size={20} />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder="Add a task..."
          className={`px-3 py-2 w-72 border rounded-lg ${darkMode ? "bg-gray-800 text-gray-200 border-gray-700 focus:border-blue-400" : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"} outline-none`}
        />

        {loading && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Loading variant="button" text="Updating tasks..." />
          </div>
        )}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col}
            className={`p-4 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <h3 className="font-semibold mb-4">{col}</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {tasks(col === "To Do" ? "todo" : col === "In Progress" ? "pending" : "done").map((task) => (
                <div
                  key={task._id}
                  className={`p-3 rounded-lg cursor-pointer transition ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-blue-50"}`}
                  onClick={() => handleUpgradeTask(task)}
                >
                  {task.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MainWorkspace;
