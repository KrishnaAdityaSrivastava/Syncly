import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import EmailVerification from "../models/email-verification.model.js";
import { parseExpiryToMs } from "../utils/parseExpiry.js";
import { createHttpError, normalizeEmail, requireString } from "../utils/http-error.js";

import {
  JWT_SECRET,
  JWT_EXPIRE,
  COOKIE_SAME_SITE,
  COOKIE_SECURE,
  EMAIL_VERIFICATION_REQUIRED,
} from "../config/env.js";

const normalizedSameSite = COOKIE_SAME_SITE === 'none' ? 'None' : 'Strict';
const shouldPartitionCookie = normalizedSameSite === 'None';

const buildAuthCookie = (token, maxAge) => {
  const parts = [
    `token=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${normalizedSameSite}`,
    `Max-Age=${Math.floor(maxAge / 1000)}`,
  ];

  if (COOKIE_SECURE) {
    parts.push('Secure');
  }

  if (shouldPartitionCookie) {
    parts.push('Partitioned');
  }

  return parts.join('; ');
};

const clearAuthCookie = () => {
  const parts = [
    'token=',
    'Path=/',
    'HttpOnly',
    `SameSite=${normalizedSameSite}`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];

  if (COOKIE_SECURE) {
    parts.push('Secure');
  }

  if (shouldPartitionCookie) {
    parts.push('Partitioned');
  }

  return parts.join('; ');
};

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedName = requireString(name, "Name", { min: 2, max: 50 });
    const normalizedEmail = normalizeEmail(email);
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      throw createHttpError(400, "Password must be between 8 and 128 characters", "VALIDATION_ERROR");
    }

    const existingUser = await User.exists({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error("User already exists");
      error.errorType = "USER_EXIST";
      error.statusCode = 409;
      throw error;
    }

    if (EMAIL_VERIFICATION_REQUIRED) {
      const verification = await EmailVerification.findOne({ email: normalizedEmail });
      if (!verification || !verification.verified) {
        const error = new Error("Email not verified");
        error.errorType = "EMAIL_NOT_VERIFIED";
        error.statusCode = 400;
        throw error;
      }

      await EmailVerification.deleteOne({ email: normalizedEmail });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name: normalizedName, email: normalizedEmail, password: hashedPassword });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    const cookieMaxAge = parseExpiryToMs(JWT_EXPIRE);

    res.append("Set-Cookie", buildAuthCookie(token, cookieMaxAge));

    res.status(201).json({
      success: true,
      message: "User created and logged in successfully",
      data: { user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (typeof password !== "string" || !password) {
      throw createHttpError(400, "Password is required", "VALIDATION_ERROR");
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw createHttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
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

    res.append("Set-Cookie", buildAuthCookie(token, cookieMaxAge));

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
    res.append("Set-Cookie", clearAuthCookie());

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
