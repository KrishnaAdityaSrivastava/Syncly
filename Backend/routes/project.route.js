import { Router } from "express";

import authorize from '../middlewares/auth.middleware.js'

import { addMemberToProject, removeMemberFromProject, changeMemberRole, createProject, getUserProject, getUserProjects, getProjectMembers, getProjectActivity, updateProjectSettings } from "../controllers/project.controller.js";

import { loadProject, requireProjectAdmin, requireProjectMember } from "../middlewares/projectAccess.middleware.js";
import {
  createProjectTask,
  getProjectTasks,
  updateProjectTask,
  addTaskComment
} from "../controllers/project-task.controller.js";

const projectRouter = Router();

projectRouter.post("/", authorize, createProject);
projectRouter.get("/", authorize, getUserProjects);
projectRouter.get("/:projectId", authorize, getUserProject);

projectRouter.get("/:projectId/activity", authorize, loadProject, requireProjectMember,getProjectActivity);
projectRouter.get("/:projectId/members", authorize, loadProject, requireProjectMember, getProjectMembers);
projectRouter.post("/:projectId/members", authorize, loadProject, requireProjectAdmin, addMemberToProject);
projectRouter.delete("/:projectId/members", authorize, loadProject, requireProjectAdmin, removeMemberFromProject);
projectRouter.patch("/:projectId/members/role", authorize, loadProject, requireProjectAdmin, changeMemberRole);
projectRouter.patch("/:projectId/settings", authorize, loadProject, requireProjectAdmin, updateProjectSettings);
projectRouter.get("/:projectId/activity", authorize, loadProject, requireProjectMember, getProjectActivity);

projectRouter.get("/:projectId/tasks", authorize, loadProject, requireProjectMember, getProjectTasks);
projectRouter.post("/:projectId/tasks", authorize, loadProject, requireProjectMember, createProjectTask);
projectRouter.patch("/:projectId/tasks/:taskId", authorize, loadProject, requireProjectMember, updateProjectTask);
projectRouter.post("/:projectId/tasks/:taskId/comments", authorize, loadProject, requireProjectMember, addTaskComment);

export default projectRouter;
