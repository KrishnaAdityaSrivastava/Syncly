import User from "../models/user.model.js";

// export const getTask = async (req, res, next) => {
//     try {
//         const task = await User.findById(req.user._id).task;//.select('-email');

//         if (!task) {
//             const error = new Error('No task found');
//             error.statusCode = 404;
//             throw error;
//         }

//         res.status(200).json({
//             success: true,
//             data: task
//         })
//     }
//     catch (error) {
//         next(error);
//     }
// }

export const updateTask = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const { action, task } = req.body;
        // action: "push" or "pull"
        // task: object to push OR {_id: "..."} to pull

        let updateQuery = {};

        if (action === "push") {
            updateQuery = { $push: { task: task } };
        } else if (action === "pull") {
            updateQuery = { $pull: { task: { _id: task._id } } };
        } else if (action === "update") {
            const { _id, data } = task;
            updateQuery = { $set: {} };
            for (const [key, value] of Object.entries(data)) {
                updateQuery.$set[`task.$.${key}`] = value;
            }

            await User.updateOne(
                { _id: userId, "task._id": _id },
                updateQuery
            );

            const updatedUser = await User.findById(userId);
            return res.status(200).json({
                success: true,
                data: updatedUser.task,
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateQuery,
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedUser.task,
        });
    } catch (error) {
        next(error);
    }
};