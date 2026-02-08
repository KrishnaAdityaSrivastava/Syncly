import mongoose from "mongoose";

const projectActivitySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },
  type: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxLength: 400 },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

projectActivitySchema.index({ projectId: 1, createdAt: -1 });

const ProjectActivity = mongoose.model("ProjectActivity", projectActivitySchema);
export default ProjectActivity;
