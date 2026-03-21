import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "pending", "done"],
      default: "todo",
      index: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
