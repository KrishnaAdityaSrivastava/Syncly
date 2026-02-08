import { Sun, Moon, User } from "lucide-react";
import { useTheme } from "./themeContext.jsx";

const Navbar = ({ active, userName = "hi" }) => {
  const { darkMode, toggleTheme } = useTheme();
  const capitalize = (s) => String(s[0]).toUpperCase() + String(s).slice(1).toLowerCase();

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 shadow-sm border-b transition-colors ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
      }`}
    >
      <h1 className="text-xl font-semibold">{active}</h1>

      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition-colors ${
            darkMode
              ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
              : "bg-gray-200 border-gray-300 hover:bg-gray-300"
          }`}
        >
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
        </button>

        <span>Hello, {capitalize(userName.split(" ")[0])}</span>
        <User />
      </div>
    </header>
  );
};

export default Navbar;
