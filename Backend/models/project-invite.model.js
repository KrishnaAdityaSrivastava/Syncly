// models/ProjectInvite.js
const mongoose = require("mongoose");

const ProjectInviteSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  invitedEmail: { type: String, required: true, lowercase: true },
  inviter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["member", "admin"], default: "member" },
  token: { type: String, required: true, unique: true }, // random token
  status: { type: String, enum: ["pending", "accepted", "rejected", "expired"], default: "pending" },
  expiresAt: { type: Date }, // optional expiry
}, { timestamps: true });

module.exports = mongoose.model("ProjectInvite", ProjectInviteSchema);
