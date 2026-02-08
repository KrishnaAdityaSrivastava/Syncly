import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            data: users
        })
    }
    catch (error) {
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password -_id');

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: user
        })
    }
    catch (error) {
        next(error);
    }
}

export const getUserContext = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select(
            "name email totalProject taskProgress taskCompleted teamMember"
        );

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                totalProject: user.totalProject,
                taskProgress: user.taskProgress,
                taskCompleted: user.taskCompleted,
                teamMember: user.teamMember
            }
        })
    }
    catch (error) {
        next(error);
    }
}
