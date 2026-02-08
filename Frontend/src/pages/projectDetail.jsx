import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProjectMembersApi,
  getUserProjectApi,
  sendProjectInviteApi,
} from "../api/api.js";

import { MessageSquare, Users, ClipboardList } from "lucide-react";
import Loading from "../components/loading.jsx"; 
import { useNotification } from "../components/notificationContext.jsx";


const ProjectDetail = ({ darkMode }) => {
  const { projectId } = useParams();
  const { showNotification } = useNotification();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const isDark = darkMode ?? true;

  const capitalize = (s = "") =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  // Fetch project + members
  useEffect(() => {
    const fetchData = async () => {
      try {
        const thisProject = await getUserProjectApi(projectId);
        setProject(thisProject);

        const memList = await getProjectMembersApi(projectId);
        setMembers(memList);

        // Temp activity log
        setActivities([
          { text: "Project created", time: "2 days ago" },
          { text: "3 tasks added", time: "1 day ago" },
          { text: "Invitation sent to John", time: "6 hrs ago" },
        ]);
      } catch (error) {
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
  if (!project) return <div className="p-6">Project not found.</div>;

  const proj = project.projectId;

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

  return (
    <div
      className={`p-6 min-h-screen transition ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{capitalize(proj?.name)}</h1>
      </div>

      {/* PROJECT STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className={`p-4 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <p className="text-sm text-gray-400">Members</p>
          <h2 className="text-2xl font-bold">{members.length}</h2>
        </div>

        <div className={`p-4 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <p className="text-sm text-gray-400">Tasks</p>
          <h2 className="text-2xl font-bold">{proj?.tasks?.length || 0}</h2>
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
                    <p className="font-medium">{a.text}</p>
                    <p className="text-xs opacity-60">{a.time}</p>
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
