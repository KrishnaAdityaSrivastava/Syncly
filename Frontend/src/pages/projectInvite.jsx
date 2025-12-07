import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { acceptProjectInviteApi } from "../api/api";

const ProjectInvite = () => {
  const [status, setStatus] = useState("Processing...");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid invite link.");
      setLoading(false);
      return;
    }

    const acceptInvite = async () => {
      try {
        const res = await acceptProjectInviteApi(token);
        setStatus(res.message || "Invitation accepted!");
        setLoading(false);

        // Redirect to project page after 2 seconds
        setTimeout(() => {
          navigate("/projects");
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus("Failed to accept invite or link expired.");
        setLoading(false);
      }
    };

    acceptInvite();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">Project Invitation</h2>
        <p className="text-gray-700 dark:text-gray-200">{status}</p>
        {loading && <p className="mt-2 text-sm text-gray-500">Please wait...</p>}
      </div>
    </div>
  );
};

export default ProjectInvite;
