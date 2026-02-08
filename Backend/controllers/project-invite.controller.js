import jwt from "jsonwebtoken";
import { sendProjectInviteEmail } from "../utils/send-emails.js";
import ProjectInvite from "../models/project-invite.model.js";
import ProjectMember from "../models/project-member.model.js";
import User from "../models/user.model.js";
import {addProjectActivity} from './project.controller.js';

export const sendProjectInvite = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const { project } = req;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create invite token
    const token = jwt.sign(
      { email, projectId: project._id, role },
      process.env.INVITE_SECRET,
      { expiresIn: "72h" }
    );

    await ProjectInvite.create({
      projectId: project._id,
      invitedEmail: email,
      inviter: req.user._id,
      role,
      token,
      status: "pending",
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000)
    });

    // Send email
    await sendProjectInviteEmail({
      to: email,
      invitedBy: req.user.name,
      projectName: project.name,
      inviteLink: `${process.env.CLIENT_URL}/invites?token=${token}`,
    });

    await addProjectActivity({
      projectId: project._id,
      type: "INVITE_SENT",
      text: `Invitation sent to ${email}`,
      actor: req.user._id
    });

    return res.json({ message: "Invitation sent" });
  } catch (err) {
    console.error("Invite error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Accept invite route (fixed, safe)
export const acceptProjectInvite = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.INVITE_SECRET);
    const { email, projectId, role } = decoded;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Ask them to sign up first.",
      });
    }

    const existingMember = await ProjectMember.findOne({
      userId: user._id,
      projectId,
    });

    if (existingMember) {
      return res.json({
        message: "You are already a member of this project",
        member: existingMember,
      });
    }

    const member = await ProjectMember.create({
      userId: user._id,
      projectId,
      role,
    });

    await ProjectInvite.findOneAndUpdate(
      { token },
      { status: "accepted" },
      { new: true }
    );

    await addProjectActivity({
      projectId,
      type: "MEMBER_ADDED",
      text: `${user.name} was added as ${role}`,
      actor: user._id,
    });

    return res.json({
      message: "Invitation accepted",
      member,
    });
  } catch (err) {
    console.error("Accept invite error:", err);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
