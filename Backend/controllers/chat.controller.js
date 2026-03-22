import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { createNotification } from "../utils/notification.utils.js";

const buildParticipantKey = (userId, recipientId) => {
  const ids = [userId.toString(), recipientId.toString()].sort();
  return `${ids[0]}:${ids[1]}`;
};

const activeUserFilter = {
  $or: [
    { status: "active" },
    { status: { $exists: false } },
    { status: null }
  ]
};

const formatChatForUser = async (chat, userId) => {
  const participant = chat.participants.find(
    (member) => member._id.toString() !== userId.toString()
  );

  const unreadCount = chat.status === "accepted"
    ? await Message.countDocuments({
        chatId: chat._id,
        recipientId: userId,
        readAt: null
      })
    : 0;

  const isRequester = chat.requestedBy?.toString?.() === userId.toString();

  return {
    id: chat._id,
    participant: participant
      ? {
          id: participant._id,
          name: participant.name,
          email: participant.email
        }
      : null,
    status: chat.status || "accepted",
    isRequester,
    lastMessage: chat.lastMessage?.text
      ? {
          text: chat.lastMessage.text,
          sender: chat.lastMessage.sender,
          createdAt: chat.lastMessage.createdAt
        }
      : null,
    unreadCount,
    requestedAt: chat.createdAt,
    acceptedAt: chat.acceptedAt || null
  };
};

const loadChat = async (chatId, userId) => {
  const chat = await Chat.findById(chatId).populate("participants", "name email");
  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }

  const isParticipant = chat.participants.some(
    (participant) => participant._id.toString() === userId.toString()
  );
  if (!isParticipant) {
    const error = new Error("Unauthorized chat access");
    error.statusCode = 403;
    throw error;
  }

  return chat;
};

const emitChatUpdate = async (req, userIds, payload) => {
  const io = req.app.get("io");
  if (!io) return;

  userIds.forEach((id) => {
    io.to(`user:${id.toString()}`).emit("chat:update", payload);
  });
};

export const getUserContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const users = await User.find({
      _id: { $ne: userId },
      ...activeUserFilter
    })
      .select("name email")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    const formattedChats = await Promise.all(chats.map((chat) => formatChatForUser(chat, userId)));

    res.status(200).json({
      success: true,
      data: {
        chats: formattedChats.filter((chat) => chat.status === "accepted"),
        incomingRequests: formattedChats.filter((chat) => chat.status === "pending" && !chat.isRequester),
        outgoingRequests: formattedChats.filter((chat) => chat.status === "pending" && chat.isRequester)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.body;

    if (!recipientId) {
      const error = new Error("Recipient is required");
      error.statusCode = 400;
      throw error;
    }

    if (recipientId.toString() === userId.toString()) {
      const error = new Error("Cannot start a chat with yourself");
      error.statusCode = 400;
      throw error;
    }

    const recipient = await User.findOne({ _id: recipientId, ...activeUserFilter }).select("name email");
    if (!recipient) {
      const error = new Error("Recipient not found");
      error.statusCode = 404;
      throw error;
    }

    const participantKey = buildParticipantKey(userId, recipientId);
    let chat = await Chat.findOne({ participantKey }).populate("participants", "name email");

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, recipientId],
        participantKey,
        status: "pending",
        requestedBy: userId
      });
      chat = await Chat.findById(chat._id).populate("participants", "name email");
    } else if (chat.status === "rejected") {
      chat.status = "pending";
      chat.requestedBy = userId;
      chat.acceptedAt = null;
      chat.lastMessage = { text: "", sender: null, createdAt: null };
      await chat.save();
    }

    const formatted = await formatChatForUser(chat.toObject(), userId);

    await createNotification({
      userId: recipient._id,
      type: "DIRECT_MESSAGE",
      message: `${req.user.name || "A teammate"} sent you a chat request`,
      entity: chat._id,
      createdBy: userId
    });

    await emitChatUpdate(req, [userId, recipientId], { type: "request_created", chatId: chat._id.toString() });

    res.status(201).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const updateChatRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) {
      const error = new Error("Invalid action");
      error.statusCode = 400;
      throw error;
    }

    const chat = await loadChat(chatId, userId);
    if (chat.status !== "pending") {
      const error = new Error("This request is no longer pending");
      error.statusCode = 400;
      throw error;
    }

    if (chat.requestedBy?.toString() === userId.toString()) {
      const error = new Error("You cannot respond to your own request");
      error.statusCode = 403;
      throw error;
    }

    chat.status = action === "accept" ? "accepted" : "rejected";
    chat.acceptedAt = action === "accept" ? new Date() : null;
    await chat.save();

    const requesterId = chat.requestedBy;
    await emitChatUpdate(req, [userId, requesterId], { type: `request_${action}ed`, chatId: chat._id.toString() });

    res.status(200).json({ success: true, data: await formatChatForUser(chat.toObject(), userId) });
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await loadChat(chatId, userId);
    if (chat.status !== "accepted") {
      return res.status(200).json({ success: true, data: [] });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).limit(200).lean();

    res.status(200).json({
      success: true,
      data: messages.map((message) => ({
        id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const sendChatMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      const error = new Error("Message body is required");
      error.statusCode = 400;
      throw error;
    }

    const chat = await loadChat(chatId, userId);
    if (chat.status !== "accepted") {
      const error = new Error("Chat request must be accepted before messaging");
      error.statusCode = 403;
      throw error;
    }

    const recipient = chat.participants.find(
      (participant) => participant._id.toString() !== userId.toString()
    );

    if (!recipient) {
      const error = new Error("Recipient not found");
      error.statusCode = 404;
      throw error;
    }

    const message = await Message.create({
      chatId: chat._id,
      senderId: userId,
      recipientId: recipient._id,
      body: body.trim()
    });

    await createNotification({
      userId: recipient._id,
      type: "DIRECT_MESSAGE",
      message: `New message from ${req.user.name || "a teammate"}`,
      entity: message._id,
      createdBy: userId
    });

    chat.lastMessage = {
      text: message.body,
      sender: userId,
      createdAt: message.createdAt
    };
    await chat.save();

    await emitChatUpdate(req, [userId, recipient._id], { type: "message_created", chatId: chat._id.toString() });

    res.status(201).json({
      success: true,
      data: {
        id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markChatRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await loadChat(chatId, userId);
    if (chat.status !== "accepted") {
      return res.status(200).json({ success: true, message: "No unread messages" });
    }

    await Message.updateMany(
      { chatId, recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};
