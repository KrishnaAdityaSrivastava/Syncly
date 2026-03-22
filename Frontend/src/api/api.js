import axios from "axios";

const trimTrailingSlash = (value) => value?.replace(/\/$/, "");

const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5500"
);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // send cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && window?.location?.pathname !== "/signin") {
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export const sendOtpApi = async (data) => {
  const res = await api.post("/email/send-otp", { email: data.email });
  return res.data.success;
};

export const verifyOtpApi = async (data) => {
  const res = await api.post("/email/verify-otp", {
    email: data.email,
    otp: data.otp,
  });
  return res.data.success;
};

export const signUpApi = async (data) => {
  const res = await api.post("/auth/sign-up", {
    name: data.name,
    email: data.email,
    password: data.password
  });
  return res.data.success;
};

export const signInApi = async (data) => {
  const res = await api.post("/auth/sign-in", {
    email: data.email,
    password: data.password
  });
  return res.data.success;
}

export const signOutApi = async () => {
  const res = await api.post("/auth/sign-out");

  return res.data.success;
}

export const addTaskApi = async (data) => {

  const res = await api.post("/tasks/update", {
    action: 'push',
    task: {
      text: data,
      status: 'todo'
    }
  });

  return res.data.data
}

export const removeTaskApi = async (data) => {

  const res = await api.post("/tasks/update", {
    action: 'pull',
    task: {
      _id: data.task._id
    }
  });

  return res.data.data
}

export const updateTaskApi = async (data) => {

  const res = await api.post("/tasks/update", {
    action: 'update',
    task: {
      _id: data._id,
      data: data.data
    }
  });

  return res
}

export const upgradeTaskApi = async (data) => {

  if (data.status == 'todo') {
    try {
      const res = await api.post("/tasks/update", {
        action: 'update',
        task: {
          _id: data._id,
          data: {
            status: 'pending'
          }
        }
      })

      return res
    }
    catch (err) {
      return err
    }
  }
  if (data.status == 'pending') {
    try {
      const res = await api.post("/tasks/update", {
        action: 'update',
        task: {
          _id: data._id,
          data: {
            status: 'done'
          }
        }
      })

      return res
    }
    catch (err) {
      return err
    }
  }
}

export const dashBoardApi = async () => {
  //await updateTaskApi();
  const res = await api.get("/users/context");

  return res.data.data
}

export const createProjectApi = async (data) => {
  const res = await api.post("/projects/", {
    name: data.name,
    description: data.description || ""
  });
  return res.data; // contains { message, project }
};

export const getProjectActivityApi = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/activity`);
  return res.data.data;
};


export const getUserProjectsApi = async () => {
  const res = await api.get("/projects/");
  return res.data.data;
};

export const getUserProjectApi = async (projectId) => {
  const res = await api.get(`/projects/${projectId}`);
  return res.data.data;
};

export const getProjectMembersApi = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/members`);
  return res.data.data; // returns array of members
};

export const getProjectTasksApi = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data.data;
};

export const createProjectTaskApi = async (projectId, data) => {
  const res = await api.post(`/projects/${projectId}/tasks`, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assigneeId,
    dueDate: data.dueDate,
    labels: data.labels
  });
  return res.data.data;
};

export const updateProjectTaskApi = async (projectId, taskId, data) => {
  const res = await api.patch(`/projects/${projectId}/tasks/${taskId}`, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assigneeId,
    dueDate: data.dueDate,
    labels: data.labels
  });
  return res.data.data;
};

export const addTaskCommentApi = async (projectId, taskId, text) => {
  const res = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, {
    text
  });
  return res.data.data;
};

export const updateProjectSettingsApi = async (projectId, data) => {
  const res = await api.patch(`/projects/${projectId}/settings`, {
    name: data.name,
    description: data.description
  });
  return res.data.data;
};

export const addProjectMemberApi = async (projectId, data) => {
  const res = await api.post(`/projects/${projectId}/members`, {
    userId: data.userId,
    email: data.email,
    role: data.role || "member"
  });

  return res.data;
};

export const removeProjectMemberApi = async (projectId, userId) => {
  const res = await api.delete(`/projects/${projectId}/members`, {
    data: { userId }
  });
  return res.data;
};

export const sendProjectInviteApi = async (projectId, email) => {
  const res = await api.post(`/invites/${projectId}/invite`, { email });
  return res.data;
};

export const acceptProjectInviteApi = async (token) => {
  const res = await api.post("/invites/accept", { token });
  return res.data;
};

export const getUserSettingsApi = async () => {
  const res = await api.get("/users/settings");
  return res.data.data;
};

export const updateUserProfileApi = async (data) => {
  const res = await api.patch("/users/settings/profile", {
    name: data.name
  });
  return res.data.data;
};

export const updateUserPasswordApi = async (data) => {
  const res = await api.patch("/users/settings/password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword
  });
  return res.data;
};

export const updateUserNotificationsApi = async (data) => {
  const res = await api.patch("/users/settings/notifications", {
    email: data.email,
    inApp: data.inApp
  });
  return res.data.data;
};

export const getAdminHealthApi = async () => {
  const res = await api.get("/admin/health");
  return res.data.data;
};

export const getAdminStatsApi = async () => {
  const res = await api.get("/admin/stats");
  return res.data.data;
};

export const getAdminUsersApi = async () => {
  const res = await api.get("/admin/users");
  return res.data.data;
};

export const updateAdminUserApi = async (userId, data) => {
  const res = await api.patch(`/admin/users/${userId}`, {
    role: data.role,
    status: data.status
  });
  return res.data.data;
};

export const getAdminProjectsApi = async () => {
  const res = await api.get("/admin/projects");
  return res.data.data;
};

export const getAdminInvitesApi = async () => {
  const res = await api.get("/admin/invites");
  return res.data.data;
};

export const getChatContactsApi = async () => {
  const res = await api.get("/chats/contacts");
  return res.data.data;
};

export const getChatsApi = async () => {
  const res = await api.get("/chats");
  return res.data.data;
};

export const createChatApi = async (recipientId) => {
  const res = await api.post("/chats", { recipientId });
  return res.data.data;
};

export const getChatMessagesApi = async (chatId) => {
  const res = await api.get(`/chats/${chatId}/messages`);
  return res.data.data;
};

export const sendChatMessageApi = async (chatId, body) => {
  const res = await api.post(`/chats/${chatId}/messages`, { body });
  return res.data.data;
};

export const markChatReadApi = async (chatId) => {
  const res = await api.patch(`/chats/${chatId}/read`);
  return res.data;
};

export const getNotificationsApi = async () => {
  const res = await api.get("/notifications");
  return res.data.data;
};

export const markNotificationReadApi = async (notificationId) => {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  return res.data.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data;
};

export default api;
