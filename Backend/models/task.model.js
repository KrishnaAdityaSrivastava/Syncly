import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },      // task description
    status: { type: String, default: "todo" },

}, { timestamps: true });

export default taskSchema;