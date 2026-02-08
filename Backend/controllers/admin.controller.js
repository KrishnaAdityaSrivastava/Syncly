import Project from "../models/projects.model.js";
import ProjectMember from "../models/project-member.model.js";
import ProjectInvite from "../models/project-invite.model.js";
import User from "../models/user.model.js";

export const getAdminHealth = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [userCount, projectCount, memberCount, inviteCount] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      ProjectMember.countDocuments(),
      ProjectInvite.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        projects: projectCount,
        projectMembers: memberCount,
        invites: inviteCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name email role status lastActive createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, status } = req.body;
    const updates = {};

    if (role && ["admin", "member"].includes(role)) {
      updates.role = role;
    }
    if (status && ["active", "disabled"].includes(status)) {
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      const error = new Error("No valid user fields provided");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select("name email role status lastActive createdAt");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.aggregate([
      {
        $lookup: {
          from: "projectmembers",
          localField: "_id",
          foreignField: "projectId",
          as: "members"
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          memberCount: { $size: "$members" },
          activityCount: {
            $cond: [{ $isArray: "$activity" }, { $size: "$activity" }, 0]
          }
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminInvites = async (req, res, next) => {
  try {
    const invites = await ProjectInvite.find()
      .populate("projectId", "name")
      .populate("inviter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invites
    });
  } catch (error) {
    next(error);
  }
};
