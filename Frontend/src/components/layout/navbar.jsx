import { Sun, Moon, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/themeContext.jsx";

const Navbar = ({ active, userName = "User" }) => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const firstName = String(userName).trim().split(" ")[0] || "User";
  return <header className={`flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${darkMode ? "border-[#2a3445] bg-[#151c29]" : "border-slate-200 bg-white"}`}>
    <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">Workspace</span><ChevronRight size={14} className="text-slate-300" /><h1 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{active}</h1></div>
    <div className="flex items-center gap-2"><button onClick={toggleTheme} className={`grid h-8 w-8 place-items-center border transition hover:border-[#e66a3d] ${darkMode ? "border-[#344055] text-amber-300" : "border-slate-200 text-slate-600"}`} aria-label="Toggle color theme">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button><button type="button" onClick={() => navigate("/settings")} className={`flex items-center gap-2 border py-1 pl-1 pr-2 text-sm transition hover:border-[#e66a3d] ${darkMode ? "border-[#344055] text-slate-200" : "border-slate-200 text-slate-700"}`}><span className="grid h-6 w-6 place-items-center bg-[#e66a3d] text-xs font-semibold text-white">{firstName[0].toUpperCase()}</span><span className="hidden sm:inline">{firstName}</span><User size={14} /></button></div>
  </header>;
};
export default Navbar;
