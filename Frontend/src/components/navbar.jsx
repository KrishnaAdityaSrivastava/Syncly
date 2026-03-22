import { Sun, Moon, User } from "lucide-react";
import { useTheme } from "./themeContext.jsx";

const Navbar = ({ active, userName = "User" }) => {
  const { darkMode, toggleTheme } = useTheme();
  const capitalize = (value) => {
    const safeValue = String(value || "User");
    return safeValue.charAt(0).toUpperCase() + safeValue.slice(1).toLowerCase();
  };

  return (
    <header
      className={`flex flex-col gap-4 border-b px-4 py-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
      }`}
    >
      <h1 className="min-w-0 break-words text-xl font-semibold">{active}</h1>

      <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end">
        <button
          onClick={toggleTheme}
          className={`shrink-0 rounded-full border p-2 transition-colors ${
            darkMode
              ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
              : "bg-gray-200 border-gray-300 hover:bg-gray-300"
          }`}
        >
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
        </button>

        <span className="min-w-0 break-words text-sm sm:text-base">Hi {capitalize(userName.split(" ")[0] || "User")}</span>
        <User className="shrink-0" />
      </div>
    </header>
  );
};

export default Navbar;
