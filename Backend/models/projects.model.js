import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    description: {
        type: String,
    },
    activity: [{
        _id: false,
        type: {
            type: String, // e.g. "PROJECT_CREATED", "MEMBER_ADDED"
            required: true
        },
        text: {
            type: String,
            required: true
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        time: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;
