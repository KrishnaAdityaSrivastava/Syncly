import express from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createChat,
  getChatMessages,
  getChats,
  getUserContacts,
  markChatRead,
  sendChatMessage
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/contacts", authorize, getUserContacts);
router.get("/", authorize, getChats);
router.post("/", authorize, createChat);
router.get("/:chatId/messages", authorize, getChatMessages);
router.post("/:chatId/messages", authorize, sendChatMessage);
router.patch("/:chatId/read", authorize, markChatRead);

export default router;
