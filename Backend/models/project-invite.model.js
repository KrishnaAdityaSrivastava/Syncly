import mongoose from "mongoose";

const projectInviteSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  invitedEmail: { type: String, required: true, lowercase: true },
  inviter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["member", "admin", "viewer"], default: "member" },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "expired"], default: "pending" },
  expiresAt: { type: Date }
}, { timestamps: true });

const ProjectInvite = mongoose.model("ProjectInvite", projectInviteSchema);
export default ProjectInvite;
