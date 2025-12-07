import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false }
});

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);
export default EmailVerification;