import mongoose from "mongoose";
import taskSchema from './task.model.js'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User Name is required."],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, "User Email is required."],
        unique: true,
        trim: true,
        minLength: 5,
        maxLength: 255,
        match: [/\S+@\S+\.\S+/, "Please Fill Valid Email Address."]
    },
    password: {
        type: String,
        required: [true, "User Password is required."],
        minLength: 6,
    },
    totalProject: {
        type: Number,
        default: 0
    },
    taskProgress: {
        type: Number,
        default: 0
    },
    taskCompleted: {
        type: Number,
        default: 0
    },
    teamMember: {
        type: Number,
        default: 0
    },
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        }
    },
    task: { type: [taskSchema], default: [] }
    
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
