import mongoose from "mongoose";

const taskCommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxLength: 2000 }
}, { timestamps: true });

const projectTaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },
  title: { type: String, required: true, trim: true, maxLength: 200 },
  description: { type: String, trim: true, maxLength: 4000, default: "" },
  status: {
    type: String,
    enum: ["todo", "in_progress", "review", "done"],
    default: "todo",
    index: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  dueDate: { type: Date, default: null },
  labels: [{ type: String, trim: true, maxLength: 32 }],
  comments: { type: [taskCommentSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

projectTaskSchema.index({ projectId: 1, status: 1 });
projectTaskSchema.index({ projectId: 1, priority: 1 });

const ProjectTask = mongoose.model("ProjectTask", projectTaskSchema);
export default ProjectTask;
