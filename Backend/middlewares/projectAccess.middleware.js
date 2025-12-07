import Project from "../models/projects.model.js";
import ProjectMember from "../models/project-member.model.js";
import mongoose from "mongoose";

/**
 * Loads project by :projectId param and attaches to req.project
 * Use before handlers that need project details.
 */
export const loadProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid projectId param" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Ensures req.user is a member of req.project.
 * Requires loadProject earlier in the chain.
 */
export const requireProjectMember = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projectId = req.project._id;

    const membership = await ProjectMember.findOne({ projectId, userId });
    if (!membership) return res.status(403).json({ error: "You are not a member of this project" });

    req.projectMember = membership; // attach for later checks
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Ensures req.user is an admin of req.project.
 * Requires loadProject earlier in chain.
 */
export const requireProjectAdmin = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projectId = req.project._id;

    const membership = await ProjectMember.findOne({ projectId, userId });
    if (!membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.projectMember = membership;
    next();
  } catch (err) {
    next(err);
  }
};
