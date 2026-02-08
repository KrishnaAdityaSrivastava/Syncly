import { Router } from "express";

import authorize from "../middlewares/auth.middleware.js";
import requireAdmin from "../middlewares/admin.middleware.js";
import {
  getAdminHealth,
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  getAdminProjects,
  getAdminInvites
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.get("/health", authorize, requireAdmin, getAdminHealth);
adminRouter.get("/stats", authorize, requireAdmin, getAdminStats);
adminRouter.get("/users", authorize, requireAdmin, getAdminUsers);
adminRouter.patch("/users/:userId", authorize, requireAdmin, updateAdminUser);
adminRouter.get("/projects", authorize, requireAdmin, getAdminProjects);
adminRouter.get("/invites", authorize, requireAdmin, getAdminInvites);

export default adminRouter;
