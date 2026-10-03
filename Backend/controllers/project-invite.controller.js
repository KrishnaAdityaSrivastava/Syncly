import jwt from "jsonwebtoken";
import { sendProjectInviteEmail } from "../utils/send-emails.js";
import ProjectInvite from "../models/project-invite.model.js";
import ProjectMember from "../models/project-member.model.js";
import { addProjectActivity } from './project.controller.js';
import { CLIENT_URL, INVITE_SECRET } from "../config/env.js";
import { createHttpError, normalizeEmail, requireString } from "../utils/http-error.js";

export const sendProjectInvite = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { role = "member" } = req.body;
    const { project } = req;

    if (!["admin", "member", "viewer"].includes(role)) {
      throw createHttpError(400, "Invalid role", "VALIDATION_ERROR");
    }

    // Create invite token
    const token = jwt.sign(
      { email, projectId: project._id, role },
      INVITE_SECRET,
      { expiresIn: "72h" }
    );

    await ProjectInvite.findOneAndUpdate(
      { projectId: project._id, invitedEmail: email, status: "pending" },
      {
      projectId: project._id,
      invitedEmail: email,
      inviter: req.user._id,
      role,
      token,
      status: "pending",
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000)
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Send email
    await sendProjectInviteEmail({
      to: email,
      invitedBy: req.user.name,
      projectName: project.name,
      inviteLink: `${CLIENT_URL}/invites?token=${token}`,
    });

    await addProjectActivity({
      projectId: project._id,
      type: "INVITE_SENT",
      text: `Invitation sent to ${email}`,
      actor: req.user._id
    });

    return res.json({ success: true, message: "Invitation sent" });
  } catch (err) {
    return next(err);
  }
};

// Accept invite route (fixed, safe)
export const acceptProjectInvite = async (req, res, next) => {
  try {
    const token = requireString(req.body.token, "Token", { min: 20 });

    const decoded = jwt.verify(token, INVITE_SECRET);
    const { email, projectId, role } = decoded;

    if (req.user.email.toLowerCase() !== normalizeEmail(email)) {
      throw createHttpError(403, "This invitation belongs to a different account", "FORBIDDEN");
    }

    const invite = await ProjectInvite.findOne({ token, projectId, invitedEmail: normalizeEmail(email), status: "pending" });
    if (!invite || (invite.expiresAt && invite.expiresAt <= new Date())) {
      throw createHttpError(400, "Invitation is invalid or expired", "INVALID_INVITE");
    }

    const user = req.user;
    const existingMember = await ProjectMember.findOne({ userId: user._id, projectId });
    if (existingMember) {
      await ProjectInvite.updateOne({ _id: invite._id }, { $set: { status: "accepted" } });
      return res.json({ success: true,
        message: "You are already a member of this project",
        member: existingMember,
      });
    }

    const member = await ProjectMember.findOneAndUpdate(
      { userId: user._id, projectId },
      { $setOnInsert: { userId: user._id, projectId, role } },
      { upsert: true, new: true, runValidators: true }
    );

    await ProjectInvite.updateOne({ _id: invite._id }, { $set: { status: "accepted" } });

    await addProjectActivity({
      projectId,
      type: "MEMBER_ADDED",
      text: `${user.name} was added as ${role}`,
      actor: user._id,
    });

    return res.json({ success: true,
      message: "Invitation accepted",
      member,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(createHttpError(400, "Invitation is invalid or expired", "INVALID_INVITE"));
    }
    return next(err);
  }
};
