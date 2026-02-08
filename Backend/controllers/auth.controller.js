import mongoose from "mongoose";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import EmailVerification from "../models/email-verification.model.js";
import { parseExpiryToMs } from "../utils/parseExpiry.js";

import { JWT_SECRET, JWT_EXPIRE } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.errorType = "USER_EXIST";
      error.statusCode = 409;
      throw error;
    }

    // Check if email is verified
    const verification = await EmailVerification.findOne({ email });
    if (!verification || !verification.verified) {
      const error = new Error("Email not verified");
      error.errorType = "EMAIL_NOT_VERIFIED";
      error.statusCode = 400;
      throw error;
    }

    await EmailVerification.deleteOne({ email: email });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [newUser] = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    const cookieMaxAge = parseExpiryToMs(JWT_EXPIRE);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: cookieMaxAge,
    });



    res.status(201).json({
      success: true,
      message: "User created and logged in successfully",
      data: { user: newUser }, // token already in cookie
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found. Please Sign Up instead");
      error.errorType = "USER_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Incorrect password. Please check the password you have entered");
      error.errorType = "INVALID_PASSWORD";
      error.statusCode = 401;
      throw error;
    }

    if (user.status === "disabled") {
      const error = new Error("Account is disabled");
      error.errorType = "ACCOUNT_DISABLED";
      error.statusCode = 403;
      throw error;
    }

    user.lastActive = new Date();
    await user.save();


    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    const cookieMaxAge = parseExpiryToMs(JWT_EXPIRE);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: cookieMaxAge,
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastActive: user.lastActive,
      totalProject: user.totalProject,
      taskProgress: user.taskProgress,
      taskCompleted: user.taskCompleted,
      teamMember: user.teamMember,
    };

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
