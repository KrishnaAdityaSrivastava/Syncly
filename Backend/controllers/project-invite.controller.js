import jwt from "jsonwebtoken";
import { sendProjectInviteEmail } from "../utils/send-emails.js";
import ProjectMember from "../models/project-member.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const sendProjectInvite = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const { project } = req;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // Create invite token
    const token = jwt.sign(
      { email, projectId: project._id, role },
      process.env.INVITE_SECRET,
      { expiresIn: "72h" }
    );

    // Send email
    await sendProjectInviteEmail({
      to: email,
      invitedBy: req.user.name,
      projectName: project.name,
      inviteLink: `${process.env.CLIENT_URL}/invites?token=${token}`,
    });

    return res.json({ message: "Invitation sent" });
  } catch (err) {
    console.error("Invite error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Accept invite route (fixed)
export const acceptProjectInvite = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    // Decode token
    const decoded = jwt.verify(token, process.env.INVITE_SECRET);
    const { email, projectId, role } = decoded;

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message: "User not found. Ask them to sign up first.",
      });

    // Add user safely using upsert
    const newMember = await ProjectMember.findOneAndUpdate(
      { userId: mongoose.Types.ObjectId(user._id), projectId: mongoose.Types.ObjectId(projectId) },
      { $setOnInsert: { role } },
      { upsert: true, new: true }
    );

    return res.json({
      message: "Invitation accepted",
      member: newMember,
    });
  } catch (err) {
    console.error("Accept invite error:", err);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
