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

import { MessageSquare, Users, ClipboardList } from "lucide-react";
import Loading from "../components/loading.jsx";
import { useNotification } from "../components/notificationContext.jsx";
import { useTheme } from "../components/themeContext.jsx";


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

  // Fetch project + members
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

  if (loading) return <Loading variant="inline" text="Loading Project Details..." />;
  if (errorMessage) return (
    <div
      className={`rounded-xl border p-6 text-sm ${
        isDark
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {errorMessage}
    </div>
  );
  if (!project) return <div className="p-6">Project not found.</div>;

  const proj = project.projectId;
  const statusColumns = [
    { key: "todo", label: "Todo" },
    { key: "in_progress", label: "In Progress" },
    { key: "review", label: "Review" },
    { key: "done", label: "Done" }
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
      showNotification("Task created", "success");
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

  // Handle invitation
  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      showNotification("Enter a valid email.", "error");
      return;
    }

    try {
      setInviteLoading(true);

      await sendProjectInviteApi(projectId, inviteEmail);

      showNotification("Invitation sent!", "success");
      setInviteEmail("");

      setTimeout(() => setShowInviteModal(false), 500);
    } catch (err) {
      showNotification("Failed to send invite.", "error");
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
    <div
      className={`p-6 min-h-screen transition ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
    >
      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{capitalize(proj?.name)}</h1>
        <a
          href={`/projects/${projectId}/settings`}
          className={`rounded-lg border px-4 py-2 text-sm transition ${
            isDark
              ? "border-blue-500/40 text-blue-200 hover:bg-blue-500/10"
              : "border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Project Settings
        </a>
      </div>

      {/* PROJECT STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className={`p-4 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <p className="text-sm text-gray-400">Members</p>
          <h2 className="text-2xl font-bold">{members.length}</h2>
        </div>

        <div className={`p-4 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <p className="text-sm text-gray-400">Tasks</p>
          <h2 className="text-2xl font-bold">{tasks.length}</h2>
        </div>

        <div className={`p-4 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <p className="text-sm text-gray-400">Created On</p>
          <h2 className="text-xl font-semibold">
            {new Date(project.createdAt).toDateString()}
          </h2>
        </div>

        <div className={`p-4 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <p className="text-sm text-gray-400">Last Updated</p>
          <h2 className="text-xl font-semibold">
            {new Date(project.updatedAt).toDateString()}
          </h2>
        </div>
      </div>

      {/* TASKS */}
      <div className="mb-10">
        <div className={`p-5 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2 space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
              <textarea
                placeholder="Description (optional)"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none min-h-[90px] ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
            </div>
            <div className="space-y-3 lg:col-span-2">
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member.userId._id}>
                    {member.userId.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
              <input
                type="text"
                placeholder="Labels (comma separated)"
                value={taskLabels}
                onChange={(e) => setTaskLabels(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                }`}
              />
              <button
                onClick={handleCreateTask}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
              >
                Create Task
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusColumns.map((column) => (
              <div key={column.key} className={`rounded-xl border p-4 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                <h3 className="text-sm font-semibold mb-3">{column.label}</h3>
                <div className="space-y-3">
                  {tasks.filter((task) => task.status === column.key).map((task) => (
                    <div key={task._id} className={`rounded-lg border p-3 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.assignee && (
                            <p className="text-xs text-gray-400">Assignee: {task.assignee.name}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Priority: {task.priority} {task.dueDate ? `· Due ${new Date(task.dueDate).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          className={`rounded border px-2 py-1 text-xs ${
                            isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-900"
                          }`}
                        >
                          {statusColumns.map((status) => (
                            <option key={status.key} value={status.key}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {task.labels?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {task.labels.map((label) => (
                            <span
                              key={label}
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                isDark ? "bg-blue-500/10 text-blue-200" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      {task.comments?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {task.comments.map((comment) => (
                            <div key={comment._id || comment.createdAt} className={`rounded-md px-2 py-1 text-xs ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                              <p className="font-medium">{comment.author?.name || "User"}</p>
                              <p className="opacity-70">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-3">
                        <textarea
                          placeholder="Add comment"
                          value={commentDrafts[task._id] || ""}
                          onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [task._id]: e.target.value }))}
                          className={`w-full rounded-lg border px-2 py-1 text-xs outline-none ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                              : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                          }`}
                        />
                        <button
                          onClick={() => handleCommentSubmit(task._id)}
                          className="mt-2 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500"
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter((task) => task.status === column.key).length === 0 && (
                    <p className="text-xs text-gray-400">No tasks in this column.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-8">
          {/* ACTIVITY LOG */}
          <div className={`p-5 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={18} /> Recent Activity
            </h2>

            {activities.length === 0 ? (
              <p className="opacity-50">No activity yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((a, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <p className="font-medium">
                      {a.actor?.name ? `${capitalize(a.actor.name)}: ` : ""}{a.text}
                    </p>
                    <p className="text-xs opacity-60">{timeAgo(a.time)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OVERVIEW */}
          <div className={`p-5 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <ClipboardList size={18} /> Project Overview
            </h2>
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              {proj?.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION — MEMBERS */}
        <div className={`p-5 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users size={18} /> Team Members
            </h2>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm shadow"
            >
              Invite
            </button>
          </div>

          {members.length === 0 && (
            <p className="opacity-60 text-sm">No members yet.</p>
          )}

          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m._id}
                className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <p className="font-medium">{capitalize(m.userId.name)}</p>
                <p className="text-xs opacity-60">({capitalize(m.role)})</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md p-6 rounded-xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Invite Member</h2>

            <div className="space-y-4">
              {/* Email box */}
              <div>
                <label className="text-sm text-gray-300">User Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 shadow"
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
