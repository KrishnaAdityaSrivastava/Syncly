import Task from "../models/task.model.js";
import User from "../models/user.model.js";

const buildTaskStats = (tasks = []) => ({
    taskProgress: tasks.filter((item) => item.status === "pending").length,
    taskCompleted: tasks.filter((item) => item.status === "done").length,
});

const migrateLegacyTasks = async (userId) => {
    const user = await User.findById(userId).select("task");
    if (!user || !user.task?.length) {
        return;
    }

    const existingCount = await Task.countDocuments({ userId });
    if (existingCount > 0) {
        return;
    }

    await Task.insertMany(
        user.task.map((item) => ({
            userId,
            text: item.text,
            status: item.status || "todo",
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }))
    );
};

const syncUserTaskCounters = async (userId, tasks) => {
    const stats = buildTaskStats(tasks);

    await User.findByIdAndUpdate(userId, {
        taskProgress: stats.taskProgress,
        taskCompleted: stats.taskCompleted,
    });

    return stats;
};

const loadUserTasks = async (userId) => {
    await migrateLegacyTasks(userId);
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();
    const stats = await syncUserTaskCounters(userId, tasks);

    return { tasks, stats };
};

export const updateTask = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { action, task } = req.body;

        if (action === "push") {
            if (!task?.text?.trim()) {
                return res.status(400).json({ success: false, message: "Task text is required" });
            }

            await Task.create({
                userId,
                text: task.text.trim(),
                status: task.status || "todo",
            });
        } else if (action === "pull") {
            await Task.deleteOne({ _id: task?._id, userId });
        } else if (action === "update") {
            const { _id, data } = task || {};
            if (!_id || !data || typeof data !== "object") {
                return res.status(400).json({ success: false, message: "Invalid task update payload" });
            }

            const updates = {};
            if (typeof data.text === "string" && data.text.trim()) {
                updates.text = data.text.trim();
            }
            if (typeof data.status === "string") {
                updates.status = data.status;
            }

            await Task.findOneAndUpdate(
                { _id, userId },
                updates,
                { new: true, runValidators: true }
            );
        } else {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const { tasks, stats } = await loadUserTasks(userId);

        res.status(200).json({
            success: true,
            data: tasks,
            meta: stats,
        });
    } catch (error) {
        next(error);
    }
};
