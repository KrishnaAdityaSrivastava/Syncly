import EmailVerification from "../models/email-verification.model.js"
import User from "../models/user.model.js"

import { sendVerificationEmail } from "../utils/send-emails.js";

export const sendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await EmailVerification.findOneAndUpdate(
            { email },
            { otp, expiresAt, verified: false },
            { upsert: true, new: true }
        );

        await sendVerificationEmail({
            to: email,
            otpCode: otp
        });

        res.json({ message: "OTP sent successfully" });
    }
    catch (error) {
        next(error);
    }
}

export const verifyOtp = async (req, res, next) => {
    try {

        const { email, otp } = req.body;

        const record = await EmailVerification.findOne({ email });
        if (!record) {
            const error = new Error('OTP not found');
            error.statusCode = 400;
            throw error;
        }

        if (record.expiresAt < new Date()) {
            const error = new Error('OTP expired');
            error.statusCode = 400;
            throw error;
        }

        if (record.otp !== otp) {
            const error = new Error('Invalid OTP');
            error.statusCode = 400;
            throw error;
        }

        record.verified = true;
        await record.save();

        res.json({ message: "Email verified successfully" });
    }
    catch (error) {
        next(error);
    }
}