export default function registerSocketHandlers(io) {

  io.on("connection", (socket) => {
    console.info("User connected:", socket.id);

    // join room
    socket.on("join_project", (projectId) => {
      socket.join(`project:${projectId}`);
      console.info(`${socket.id} joined project:${projectId}`);
    });

    // leave room
    socket.on("leave_project", (projectId) => {
      socket.leave(`project:${projectId}`);
      console.info(`${socket.id} left project:${projectId}`);
    });

    // send message
    socket.on("send_message", ({ projectId, message, user }) => {
      io.to(`project:${projectId}`).emit("receive_message", {
        user,
        message,
        createdAt: new Date(),
      });
    });

    // disconnect
    socket.on("disconnect", () => {
      console.info("User disconnected:", socket.id);
    });
  });

}
