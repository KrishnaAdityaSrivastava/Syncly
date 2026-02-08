import bcrypt from "bcryptjs";
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

export const getUserSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("name email settings");

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                settings: user.settings
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            const error = new Error("Name is required");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true }
        ).select("name email settings");

        res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                settings: user.settings
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            const error = new Error("Current and new password are required");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(req.user._id).select("password");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            const error = new Error("Current password is incorrect");
            error.statusCode = 401;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserNotifications = async (req, res, next) => {
    try {
        const { email, inApp } = req.body;

        const user = await User.findById(req.user._id).select("settings name email");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (typeof email === "boolean") {
            user.settings.notifications.email = email;
        }
        if (typeof inApp === "boolean") {
            user.settings.notifications.inApp = inApp;
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                settings: user.settings
            }
        });
    } catch (error) {
        next(error);
    }
};
