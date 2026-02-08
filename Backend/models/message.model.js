import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    body: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
      maxlength: 2000
    },
    readAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
