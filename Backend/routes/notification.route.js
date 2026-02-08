import express from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authorize, getNotifications);
router.patch("/:notificationId/read", authorize, markNotificationRead);
router.patch("/read-all", authorize, markAllNotificationsRead);

export default router;
