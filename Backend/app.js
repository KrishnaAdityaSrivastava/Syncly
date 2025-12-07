import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";

import { PORT } from './config/env.js';

import ConnectToDatabase from './database/mongodb.js';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import emailVerifyRouter from './routes/email-verification.route.js';
import taskRouter from './routes/task.route.js';
import projectRouter from './routes/project.route.js';
import inviteRouter from './routes/project-invite.route.js';

import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcject.middleware.js';

const app = express();

// EXPRESS CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

// ROUTES
app.use('/email', emailVerifyRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/tasks', taskRouter);
app.use('/projects', projectRouter);
app.use("/invites", inviteRouter);

// ERROR HANDLER
app.use(errorMiddleware);

// CREATE HTTP SERVER (NEEDED FOR SOCKET.IO)
const httpServer = createServer(app);

// SOCKET.IO SETUP
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on("sendMessage", ({ projectId, message }) => {
    socket.to(projectId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// START SERVER
httpServer.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await ConnectToDatabase();
});

export default app;
