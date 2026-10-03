import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProjectMembersApi,
  getUserProjectApi,
  sendProjectInviteApi,
  getProjectActivityApi,
  getProjectTasksApi,
  createProjectTaskApi,
  updateProjectTaskApi,
  addTaskCommentApi
} from "../api/api.js";

import { MessageSquare, Users, ClipboardList, Settings, UserPlus, Plus, Calendar, Tag, CheckCircle2, Clock, Send, ShieldCheck, ArrowRight } from "lucide-react";
import Loading from "../components/common/loading.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useTheme } from "../context/themeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { showNotification } = useNotification();
  const { darkMode } = useTheme();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskLabels, setTaskLabels] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const isDark = darkMode;

  const capitalize = (s = "") =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  const getUserDisplayName = (user) => {
    const name = user?.name?.trim();
    const email = user?.email?.trim();
    return name || email || "Unknown user";
  };

  const getRoleLabel = (role = "") => {
    const labels = {
      admin: "Admin",
      manager: "Manager",
      member: "Member",
      viewer: "Viewer"
    };
    return labels[role] || capitalize(role) || "Member";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [thisProject, memList, activityList, taskList] = await Promise.all([
          getUserProjectApi(projectId),
          getProjectMembersApi(projectId),
          getProjectActivityApi(projectId),
          getProjectTasksApi(projectId)
        ]);

        setProject(thisProject);
        setMembers(memList);
        setActivities(activityList);
        setTasks(taskList);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load project.");
        showNotification(
          error?.response?.data?.message || "Failed to load project.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, showNotification]);

  if (loading) return <Loading variant="inline" text="Loading Workspace details..." />;
  if (errorMessage) return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300 backdrop-blur-md">
      {errorMessage}
    </div>
  );
  if (!project) return <div className="p-6 text-slate-400">Project not found.</div>;

  const proj = project.projectId;
  const statusColumns = [
    { key: "todo", label: "To Do", dot: "bg-slate-400" },
    { key: "in_progress", label: "In Progress", dot: "bg-amber-400" },
    { key: "review", label: "Review", dot: "bg-purple-400" },
    { key: "done", label: "Done", dot: "bg-emerald-400" }
  ];

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      showNotification("Task title is required", "error");
      return;
    }
    try {
      const created = await createProjectTaskApi(projectId, {
        title: taskTitle,
        description: taskDescription,
        status: "todo",
        priority: taskPriority,
        assigneeId: taskAssignee || null,
        dueDate: taskDueDate || null,
        labels: taskLabels
          .split(",")
          .map((label) => label.trim())
          .filter(Boolean)
      });
      setTasks((prev) => [created, ...prev]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskAssignee("");
      setTaskDueDate("");
      setTaskLabels("");
      showNotification("Task created in workspace", "success");
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to create task", "error");
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const updated = await updateProjectTaskApi(projectId, task._id, { status });
      setTasks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to update task", "error");
    }
  };

  const handleCommentSubmit = async (taskId) => {
    const text = commentDrafts[taskId];
    if (!text || !text.trim()) {
      showNotification("Comment cannot be empty", "error");
      return;
    }
    try {
      const updated = await addTaskCommentApi(projectId, taskId, text);
      setTasks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setCommentDrafts((prev) => ({ ...prev, [taskId]: "" }));
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to add comment", "error");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      showNotification("Enter a valid email address.", "error");
      return;
    }

    try {
      setInviteLoading(true);
      await sendProjectInviteApi(projectId, inviteEmail);
      showNotification("Invitation sent successfully!", "success");
      setInviteEmail("");
      setTimeout(() => setShowInviteModal(false), 300);
    } catch (error) {
      showNotification(error?.response?.data?.message || "Failed to send invite.", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="w-full space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500">
              Project Board
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className={`mt-0.5 text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {capitalize(proj?.name)}
          </h1>
        </div>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href={`/projects/${projectId}/settings`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-orange-500/50 transition-all shadow-sm self-start sm:self-auto"
        >
          <Settings size={15} />
          <span>Project Settings</span>
        </motion.a>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Team Members", value: members.length },
          { label: "Active Tasks", value: tasks.length },
          { label: "Created On", value: new Date(project.createdAt).toLocaleDateString() },
          { label: "Last Activity", value: new Date(project.updatedAt).toLocaleDateString() },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border p-4 backdrop-blur-md ${
              isDark ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
            }`}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-orange-500">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* TASK CREATION & KANBAN */}
      <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl ${
        isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
      }`}>
        <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Create Task
        </h2>

        {/* Create Task Form */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-8">
          <div className="lg:col-span-2 space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition-all"
            />
            <textarea
              placeholder="Task details/description..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div className="lg:col-span-2 space-y-3">
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition-all"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            <select
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition-all"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member._id} value={member.userId._id}>
                  {getUserDisplayName(member.userId)}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
            <input
              type="text"
              placeholder="Labels (e.g. bug, frontend)"
              value={taskLabels}
              onChange={(e) => setTaskLabels(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 transition-all"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateTask}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
            >
              <Plus size={16} />
              <span>Create Task</span>
            </motion.button>
          </div>
        </div>

        {/* Board Columns */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
          {statusColumns.map((column) => {
            const colTasks = tasks.filter((t) => t.status === column.key);
            return (
              <div
                key={column.key}
                className={`rounded-2xl border p-4 ${
                  isDark ? "border-slate-800/80 bg-slate-950/60" : "border-slate-200/80 bg-slate-50/70"
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-tight">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                    <span className={isDark ? "text-slate-100" : "text-slate-900"}>{column.label}</span>
                  </div>
                  <span className="grid h-5 w-5 place-items-center rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[160px]">
                  {colTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border p-3.5 space-y-3 shadow-sm ${
                        isDark ? "border-slate-800 bg-slate-900/90 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-extrabold tracking-tight">{task.title}</p>
                          {task.assignee && (
                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                              Assignee: {getUserDisplayName(task.assignee)}
                            </p>
                          )}
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-[10px] font-bold outline-none"
                        >
                          {statusColumns.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Labels */}
                      {task.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {task.labels.map((label) => (
                            <span key={label} className="rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 text-[10px] font-bold">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Comments */}
                      {task.comments?.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                          {task.comments.map((c, i) => (
                            <div key={i} className="rounded-lg bg-slate-100 dark:bg-slate-950 p-2 text-[11px]">
                              <p className="font-bold text-orange-400">{getUserDisplayName(c.author)}</p>
                              <p className="text-slate-400">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Draft Input */}
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          placeholder="Add comment..."
                          value={commentDrafts[task._id] || ""}
                          onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [task._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit(task._id)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-[11px] outline-none"
                        />
                        <button
                          onClick={() => handleCommentSubmit(task._id)}
                          className="rounded-lg bg-orange-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-orange-600"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {colTasks.length === 0 && (
                    <p className="text-center py-8 text-xs font-semibold text-slate-500">No tasks in column</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOWER SECTION: ACTIVITY & MEMBERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-lg ${
            isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200/80 bg-white"
          }`}>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-orange-500" /> Recent Activity Stream
            </h2>

            {activities.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400">No recorded activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((a, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{a.actor?.name || "System"}: </span>
                      <span className="text-slate-400">{a.text}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{timeAgo(a.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className={`rounded-2xl border p-6 backdrop-blur-md shadow-lg ${
          isDark ? "border-slate-800 bg-slate-900/80 text-white" : "border-slate-200/80 bg-white text-slate-900"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <Users size={18} className="text-orange-500" /> Team Members
            </h2>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/20"
            >
              <UserPlus size={14} /> Invite
            </motion.button>
          </div>

          <div className="space-y-2.5">
            {members.map((m) => (
              <div key={m._id} className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-xs">
                <span className="font-bold">{getUserDisplayName(m.userId)}</span>
                <span className="rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                  {getRoleLabel(m.role)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-white backdrop-blur-xl"
            >
              <h3 className="text-base font-extrabold mb-4">Invite Team Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading}
                    className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                  >
                    {inviteLoading ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
