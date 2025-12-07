import { Router } from "express";

import authorize from '../middlewares/auth.middleware.js'
import { addMemberToProject, removeMemberFromProject, changeMemberRole, createProject,getUserProjects, getProjectMembers } from "../controllers/project.controller.js";
import { loadProject, requireProjectAdmin, requireProjectMember } from "../middlewares/projectAccess.middleware.js";

const projectRouter = Router();

projectRouter.post("/", authorize, createProject);
projectRouter.get("/", authorize, getUserProjects);

projectRouter.get("/:projectId/members", authorize, loadProject, requireProjectMember, getProjectMembers);
projectRouter.post("/:projectId/members", authorize, loadProject, requireProjectAdmin, addMemberToProject);
projectRouter.delete("/:projectId/members", authorize, loadProject, requireProjectAdmin, removeMemberFromProject);
projectRouter.patch("/:projectId/members/role", authorize, loadProject, requireProjectAdmin, changeMemberRole);

export default projectRouter;