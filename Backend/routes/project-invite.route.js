import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { loadProject, requireProjectAdmin } from "../middlewares/projectAccess.middleware.js";

import {
    sendProjectInvite,
    acceptProjectInvite,
} from "../controllers/project-invite.controller.js";

const inviteRouter = Router();

// Send invite email
inviteRouter.post(
    "/:projectId/invite",
    authorize,
    loadProject,
    requireProjectAdmin,
    sendProjectInvite
);

// Accept invite using token
inviteRouter.post(
    "/accept",
    acceptProjectInvite
);

export default inviteRouter;
