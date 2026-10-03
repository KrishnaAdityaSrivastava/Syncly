import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { PORT, CORS_ORIGINS, NODE_ENV, REQUEST_TIMEOUT_MS, validateProductionEnv } from './config/env.js';

import ConnectToDatabase, { getDatabaseStatus } from './database/mongodb.js';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import emailVerifyRouter from './routes/email-verification.route.js';
import taskRouter from './routes/task.route.js';
import projectRouter from './routes/project.route.js';
import inviteRouter from './routes/project-invite.route.js';
import adminRouter from './routes/admin.route.js';
import chatRouter from './routes/chat.route.js';
import notificationRouter from './routes/notification.route.js';

import requestTimer from './middlewares/requestTimer.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcject.middleware.js';
import rateLimit from "./middlewares/rate-limit.middleware.js";
import { requestId, requestTimeout, securityHeaders } from "./middlewares/security.middleware.js";
import ProjectMember from "./models/project-member.model.js";
import mongoose from "mongoose";

const app = express();

const databaseStateLabel = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const allowedOrigins = new Set(CORS_ORIGINS);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error("Origin is not allowed");
    error.statusCode = 403;
    error.errorType = "CORS_NOT_ALLOWED";
    callback(error);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(requestId);
app.use(securityHeaders);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

app.use(requestTimer);
app.use(requestTimeout(REQUEST_TIMEOUT_MS));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/email", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use(arcjetMiddleware);

app.get('/health', (_req, res) => {
  const databaseStatus = databaseStateLabel[getDatabaseStatus()] || 'unknown';

  const ready = getDatabaseStatus() === 1;
  res.status(ready ? 200 : 503).json({
    success: true,
    data: {
      status: ready ? 'ok' : 'degraded',
      env: NODE_ENV,
      databaseStatus,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/email', emailVerifyRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/tasks', taskRouter);
app.use('/projects', projectRouter);
app.use("/invites", inviteRouter);
app.use("/admin", adminRouter);
app.use("/chats", chatRouter);
app.use("/notifications", notificationRouter);

app.use((req, _res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.errorType = "NOT_FOUND";
  next(error);
});

app.use(errorMiddleware);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: Array.from(allowedOrigins),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.use((socket, next) => {
  const token = socket.handshake.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("token="))
    ?.slice("token=".length);
  if (!token) return next(new Error("Unauthorized"));

  try {
    const decoded = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.info(JSON.stringify({ level: "info", message: "socket_connected", socketId: socket.id, userId: socket.userId }));

  socket.on("joinUser", (userId) => {
    if (userId?.toString() === socket.userId.toString()) socket.join(`user:${socket.userId}`);
  });

  socket.on("joinProject", async (projectId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) return;
      const membership = await ProjectMember.exists({ projectId, userId: socket.userId });
      if (membership) socket.join(`project:${projectId}`);
    } catch (error) {
      console.error(JSON.stringify({ level: "error", message: "socket_join_failed", error: error.message }));
    }
  });

  socket.on("sendMessage", async ({ projectId, message }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) return;
      const membership = await ProjectMember.exists({ projectId, userId: socket.userId });
      if (membership) socket.to(`project:${projectId}`).emit("receiveMessage", message);
    } catch (error) {
      console.error(JSON.stringify({ level: "error", message: "socket_message_failed", error: error.message }));
    }
  });

  socket.on("disconnect", () => {
    console.info("User disconnected");
  });
});

const startServer = async () => {
  validateProductionEnv();
  await ConnectToDatabase();
  await new Promise((resolve) => httpServer.listen(PORT, "0.0.0.0", resolve));
  console.info(JSON.stringify({ level: "info", message: "server_started", port: PORT, env: NODE_ENV }));
};

const shutdown = (signal) => {
  console.info(JSON.stringify({ level: "info", message: "shutdown_started", signal }));
  io.close();
  httpServer.close(async () => {
    await mongoose.connection.close().catch(() => undefined);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error(JSON.stringify({ level: "error", message: "startup_failed", error: error.message }));
    process.exit(1);
  });
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

export default app;
export { httpServer, startServer };
