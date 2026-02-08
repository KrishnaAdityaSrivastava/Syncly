import ProjectMember from '../models/project-member.model.js'
import Project from '../models/projects.model.js'

export const getUserProjects = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const projects = await ProjectMember.find({ userId }).populate("projectId", "name description");

        if (projects.length == 0) {
            const error = new Error('No projects was found for this user');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: projects
        })
    }
    catch (error) {
        next(error);
    }
}

export const getUserProject = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { projectId } = req.params;

        const project = await ProjectMember.findOne({ userId, projectId }).populate(
            "projectId",
            "name description activity createdBy createdAt updatedAt"
        );

        if (!project) {
            const error = new Error('Project was not found for this user');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: project
        })
    }
    catch (error) {
        next(error);
    }
}

export const getProjectMembers = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const members = await ProjectMember.find({ projectId }).populate("userId", "name email");

        if (!members) {
            const error = new Error('No user was found for this project');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: members
        })
    }
    catch (error) {
        next(error);
    }
}

export const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user._id;   // auth middleware must set this

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Project name is required." });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description?.trim() || "",
            createdBy: userId,
        });

        await ProjectMember.create({
            projectId: project._id,
            userId: userId,
            role: "admin",
        });

        return res.status(201).json({
            message: "Project created successfully",
            project,
        });
    } catch (err) {
        console.error("Error creating project:", err);

        return res.status(500).json({
            error: "Something went wrong",
            details: err.message,
        });
    }
};

export const addMemberToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, email, role } = req.body;
    const actorId = req.user._id;

    if (!role || !["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // find project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // ensure caller is admin (you may already have middleware; double-check)
    const actorMembership = await ProjectMember.findOne({ projectId, userId: actorId });
    if (!actorMembership || actorMembership.role !== "admin") {
      return res.status(403).json({ error: "Only project admins can add members" });
    }

    // find target user by id or email
    let targetUser = null;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }
      targetUser = await User.findById(userId);
    } else if (email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      return res.status(400).json({ error: "Provide userId or email" });
    }

    if (!targetUser) return res.status(404).json({ error: "Target user not found" });

    // create membership (unique index prevents duplicates)
    try {
      const member = await ProjectMember.create({
        projectId: project._id,
        userId: targetUser._id,
        role,
      });

      const populated = await ProjectMember.findById(member._id).populate("userId", "name email");
      return res.status(201).json({ success: true, member: populated });
    } catch (err) {
      // duplicate membership
      if (err.code === 11000) {
        return res.status(409).json({ error: "User is already a member of this project" });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a member from a project (admin only).
 * Params: projectId, memberId (the membership document id) OR body { userId }
 */
export const removeMemberFromProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body; // preferred
    const actorId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // actor is admin?
    const actorMembership = await ProjectMember.findOne({ projectId, userId: actorId });
    if (!actorMembership || actorMembership.role !== "admin") {
      return res.status(403).json({ error: "Only project admins can remove members" });
    }

    if (!userId) return res.status(400).json({ error: "Provide userId to remove" });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid userId" });

    const targetMembership = await ProjectMember.findOne({ projectId, userId });
    if (!targetMembership) return res.status(404).json({ error: "Member not found in project" });

    // Prevent removing the last admin
    if (targetMembership.role === "admin") {
      const adminCount = await ProjectMember.countDocuments({ projectId, role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot remove the last admin of the project" });
      }
    }

    await ProjectMember.deleteOne({ _id: targetMembership._id });

    return res.status(200).json({ success: true, message: "Member removed" });
  } catch (err) {
    next(err);
  }
};

/**
 * Change a member's role (admin only).
 * Body: { userId, role }
 */
export const changeMemberRole = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const actorId = req.user._id;

    if (!userId || !role) return res.status(400).json({ error: "userId and role are required" });
    if (!["admin", "member", "viewer"].includes(role)) return res.status(400).json({ error: "Invalid role" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // actor is admin?
    const actorMembership = await ProjectMember.findOne({ projectId, userId: actorId });
    if (!actorMembership || actorMembership.role !== "admin") {
      return res.status(403).json({ error: "Only project admins can change roles" });
    }

    const targetMembership = await ProjectMember.findOne({ projectId, userId });
    if (!targetMembership) return res.status(404).json({ error: "Member not found in project" });

    // Prevent demoting last admin
    if (targetMembership.role === "admin" && role !== "admin") {
      const adminCount = await ProjectMember.countDocuments({ projectId, role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot demote the last admin of the project" });
      }
    }

    targetMembership.role = role;
    await targetMembership.save();

    const populated = await ProjectMember.findById(targetMembership._id).populate("userId", "name email");
    return res.status(200).json({ success: true, member: populated });
  } catch (err) {
    next(err);
  }
};
