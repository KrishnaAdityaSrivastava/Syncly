import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5500",
  withCredentials: true, // send cookies
});

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
  // console.log(res.data)

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
  // console.log(res);

  return res.data.data
}

export const removeTaskApi = async (data) => {

  const res = await api.post("/tasks/update", {
    action: 'pull',
    task: {
      id: data.task._id
    }
  });
  // console.log(res);

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
  // console.log(res);

  return res
}

export const upgradeTaskApi = async (data) => {

  // console.log("here")
  // console.log(data)
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
      console.log(err)
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
      console.log(err)
      return err
    }
  }
}

export const dashBoardApi = async () => {
  //await updateTaskApi();
  const res = await api.get("/users/data");
  // console.log(res.data.data);

  return res.data.data
}

export const createProjectApi = async (data) => {
  const res = await api.post("/projects/", {
    name: data.name,
    description: data.description || ""
  });
  // console.log(res.data)
  return res.data; // contains { message, project }
};

export const getUserProjectsApi = async () => {
  const res = await api.get("/projects/");
  // console.log(res.data.data);
  return res.data.data;
};

export const getProjectMembersApi = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/members`);
  // console.log("HERE")
  // console.log(res.data)
  return res.data.data; // returns array of members
};

export const addProjectMemberApi = async (projectId, data) => {
  const res = await api.post(`/projects/${projectId}/members`, {
    userId: data.userId,
    role: data.role || "member"
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


export default api;
