import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const buildParticipantKey = (userId, recipientId) => {
  const ids = [userId.toString(), recipientId.toString()].sort();
  return `${ids[0]}:${ids[1]}`;
};

const formatChatForUser = async (chat, userId) => {
  const participant = chat.participants.find(
    (member) => member._id.toString() !== userId.toString()
  );

  const unreadCount = await Message.countDocuments({
    chatId: chat._id,
    recipientId: userId,
    readAt: null
  });

  return {
    id: chat._id,
    participant: participant
      ? {
          id: participant._id,
          name: participant.name,
          email: participant.email
        }
      : null,
    lastMessage: chat.lastMessage?.text
      ? {
          text: chat.lastMessage.text,
          sender: chat.lastMessage.sender,
          createdAt: chat.lastMessage.createdAt
        }
      : null,
    unreadCount
  };
};

export const getUserContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId }, status: "active" })
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

    const formattedChats = await Promise.all(
      chats.map((chat) => formatChatForUser(chat, userId))
    );

    res.status(200).json({
      success: true,
      data: formattedChats
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

    const recipient = await User.findOne({
      _id: recipientId,
      status: "active"
    }).select("name email");

    if (!recipient) {
      const error = new Error("Recipient not found");
      error.statusCode = 404;
      throw error;
    }

    const participantKey = buildParticipantKey(userId, recipientId);
    let chat = await Chat.findOne({ participantKey }).populate(
      "participants",
      "name email"
    );

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, recipientId],
        participantKey
      });
      chat = await Chat.findById(chat._id).populate(
        "participants",
        "name email"
      );
    }

    const formatted = await formatChatForUser(chat.toObject(), userId);

    res.status(201).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

const loadChat = async (chatId, userId) => {
  const chat = await Chat.findById(chatId).populate(
    "participants",
    "name email"
  );
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

export const getChatMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    await loadChat(chatId, userId);

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

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

    chat.lastMessage = {
      text: message.body,
      sender: userId,
      createdAt: message.createdAt
    };
    await chat.save();

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

    await loadChat(chatId, userId);

    await Message.updateMany(
      { chatId, recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    next(error);
  }
};
