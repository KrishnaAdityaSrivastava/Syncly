import jwt from "jsonwebtoken"

import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";

const authorize = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const error = new Error("Unauthorized: no token");
      error.statusCode = 401;
      error.errorType = "UNAUTHORIZED";
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "name email role status lastActive totalProject taskProgress taskCompleted teamMember"
    );
    if (!user) {
      const error = new Error("Unauthorized: user not found");
      error.statusCode = 401;
      error.errorType = "UNAUTHORIZED";
      throw error;
    }

    if (user.status === "disabled") {
      const error = new Error("Account is disabled");
      error.statusCode = 403;
      error.errorType = "ACCOUNT_DISABLED";
      throw error;
    }

    req.user = user;

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    error.errorType = error.errorType || "UNAUTHORIZED";
    return next(error);
  }
};

export default authorize;
