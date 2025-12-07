import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "member", "viewer"],
        required: true
    }
}, { timestamps: true });

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);
export default ProjectMember;
