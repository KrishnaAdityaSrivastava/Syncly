import mongoose from "mongoose";
import ProjectTask from "../models/project-task.model.js";
import ProjectMember from "../models/project-member.model.js";
import { addProjectActivity } from "./project.controller.js";
import { createNotification } from "../utils/notification.utils.js";
import User from "../models/user.model.js";

const statusMap = ["todo", "in_progress", "review", "done"];
const priorityMap = ["low", "medium", "high", "urgent"];

export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const tasks = await ProjectTask.find({ projectId })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .lean();

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

export const createProjectTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate, labels } = req.body;

    if (!title || !title.trim()) {
      const error = new Error("Task title is required");
      error.statusCode = 400;
      throw error;
    }

    if (status && !statusMap.includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }

    if (priority && !priorityMap.includes(priority)) {
      const error = new Error("Invalid priority");
      error.statusCode = 400;
      throw error;
    }

    let assignee = null;
    if (assigneeId) {
      if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
        const error = new Error("Invalid assignee");
        error.statusCode = 400;
        throw error;
      }

      const membership = await ProjectMember.findOne({ projectId, userId: assigneeId });
      if (!membership) {
        const error = new Error("Assignee must be a project member");
        error.statusCode = 400;
        throw error;
      }
      assignee = assigneeId;
    }

    const task = await ProjectTask.create({
      projectId,
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      priority: priority || "medium",
      assignee,
      dueDate: dueDate ? new Date(dueDate) : null,
      labels: Array.isArray(labels) ? labels.map((label) => String(label).trim()).filter(Boolean) : [],
      createdBy: req.user._id
    });

    await addProjectActivity({
      projectId,
      type: "TASK_CREATED",
      text: `Task "${task.title}" created`,
      actor: req.user._id
    });

    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await createNotification({
        userId: assignee,
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${task.title}"`,
        entity: task._id,
        createdBy: req.user._id
      });
    }

    const populated = await ProjectTask.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .lean();

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate, labels } = req.body;

    const existingTask = await ProjectTask.findOne({ _id: taskId, projectId }).select("assignee title");
    if (!existingTask) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const updates = {};

    if (title !== undefined) {
      if (!title || !title.trim()) {
        const error = new Error("Task title is required");
        error.statusCode = 400;
        throw error;
      }
      updates.title = title.trim();
    }
    if (description !== undefined) {
      updates.description = description?.trim() || "";
    }
    if (status) {
      if (!statusMap.includes(status)) {
        const error = new Error("Invalid status");
        error.statusCode = 400;
        throw error;
      }
      updates.status = status;
    }
    if (priority) {
      if (!priorityMap.includes(priority)) {
        const error = new Error("Invalid priority");
        error.statusCode = 400;
        throw error;
      }
      updates.priority = priority;
    }
    if (assigneeId !== undefined) {
      if (assigneeId === null || assigneeId === "") {
        updates.assignee = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
          const error = new Error("Invalid assignee");
          error.statusCode = 400;
          throw error;
        }
        const membership = await ProjectMember.findOne({ projectId, userId: assigneeId });
        if (!membership) {
          const error = new Error("Assignee must be a project member");
          error.statusCode = 400;
          throw error;
        }
        updates.assignee = assigneeId;
      }
    }
    if (dueDate !== undefined) {
      updates.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (labels !== undefined) {
      updates.labels = Array.isArray(labels)
        ? labels.map((label) => String(label).trim()).filter(Boolean)
        : [];
    }

    const task = await ProjectTask.findOneAndUpdate(
      { _id: taskId, projectId },
      updates,
      { new: true }
    )
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .lean();

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    await addProjectActivity({
      projectId,
      type: "TASK_UPDATED",
      text: `Task "${task.title}" updated`,
      actor: req.user._id
    });

    const nextAssignee = task.assignee?._id?.toString() || task.assignee?.toString();
    const previousAssignee = existingTask.assignee?.toString();
    if (nextAssignee && nextAssignee !== previousAssignee && nextAssignee !== req.user._id.toString()) {
      await createNotification({
        userId: nextAssignee,
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${task.title}"`,
        entity: task._id,
        createdBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      const error = new Error("Comment text is required");
      error.statusCode = 400;
      throw error;
    }

    const task = await ProjectTask.findOneAndUpdate(
      { _id: taskId, projectId },
      {
        $push: {
          comments: {
            author: req.user._id,
            text: text.trim()
          }
        }
      },
      { new: true }
    )
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("comments.author", "name email")
      .lean();

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    await addProjectActivity({
      projectId,
      type: "TASK_COMMENTED",
      text: `Comment added to "${task.title}"`,
      actor: req.user._id
    });

    const mentionMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (mentionMatches) {
      const uniqueEmails = [...new Set(mentionMatches.map((email) => email.toLowerCase()))];
      const mentionedUsers = await User.find({ email: { $in: uniqueEmails } }).select("email");
      await Promise.all(
        mentionedUsers
          .filter((user) => user._id.toString() !== req.user._id.toString())
          .map((user) =>
            createNotification({
              userId: user._id,
              type: "MENTION",
              message: `You were mentioned in "${task.title}"`,
              entity: task._id,
              createdBy: req.user._id
            })
          )
      );
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};
