import { useLocation, useNavigate } from "react";
import { FolderKanban, ArrowUpRight, ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";

const ProjectList = ({ projects, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!projects.length) {
    return (
      <div className={`rounded-2xl border border-dashed p-12 text-center backdrop-blur-md ${
        darkMode ? "border-slate-800 bg-slate-900/40 text-slate-400" : "border-slate-300 bg-white/50 text-slate-500"
      }`}>
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-orange-500">
          <FolderKanban size={24} />
        </div>
        <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">No active projects yet</p>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Create a project to collaborate with your team, manage Kanban boards, and track progress.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => {
        const data = project.projectId || {};
        const path = `/projects/${data._id}`;
        const active = location.pathname.startsWith(path);
        const isAdmin = project.role === "admin";

        return (
          <motion.button
            key={project._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(path)}
            className={`spotlight-card group flex min-h-[200px] flex-col justify-between rounded-2xl border p-6 text-left transition-all shadow-md ${
              darkMode 
                ? "border-slate-800 bg-slate-900/80 hover:border-orange-500/40" 
                : "border-slate-200/80 bg-white hover:border-orange-500/40"
            } ${active ? "ring-2 ring-orange-500" : ""}`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                  <FolderKanban size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    isAdmin 
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  }`}>
                    {isAdmin ? <ShieldCheck size={12} /> : <User size={12} />}
                    {project.role || "member"}
                  </span>
                  <ArrowUpRight size={18} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <h2 className={`mt-5 text-lg font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                {data.name || "Untitled Project"}
              </h2>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400 font-medium">
                {data.description || "No project description provided."}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-200/60 dark:border-slate-800/80 pt-3 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>View Workspace</span>
              <span className="text-orange-500 font-bold group-hover:underline">Open →</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ProjectList;
