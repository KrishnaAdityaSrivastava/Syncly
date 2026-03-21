import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";

import { PORT, CORS_ORIGINS, NODE_ENV } from './config/env.js';

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

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestTimer);
// app.use(arcjetMiddleware);

app.get('/health', (_req, res) => {
  const databaseStatus = databaseStateLabel[getDatabaseStatus()] || 'unknown';

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
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

app.use(errorMiddleware);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: Array.from(allowedOrigins),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.info("User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.info(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on("sendMessage", ({ projectId, message }) => {
    socket.to(projectId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.info("User disconnected");
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.info(`Server running on port ${PORT}`);
  console.info(`Allowed CORS origins: ${Array.from(allowedOrigins).join(', ')}`);

  ConnectToDatabase().catch((error) => {
    if (error?.code === 'ENOTFOUND') {
      console.error('Database connection error: MongoDB hostname could not be resolved. Check your DB_URI Atlas host, credentials, and network access settings.');
      return;
    }

    console.error('Database connection error:', error.message);
  });
});

export default app;
