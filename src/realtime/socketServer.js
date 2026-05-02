const { Server } = require("socket.io");

let io;

function attachSocket(httpServer, options = {}) {
  io = new Server(httpServer, {
    cors: {
      origin: options.origin ?? process.env.CORS_ORIGIN ?? "*",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("join:proctor", (examAttemptId) => {
      if (!examAttemptId) return;
      socket.join(`proctor:${examAttemptId}`);
    });

    socket.on("leave:proctor", (examAttemptId) => {
      if (!examAttemptId) return;
      socket.leave(`proctor:${examAttemptId}`);
    });

    socket.on("join:live-class", (liveClassId) => {
      if (!liveClassId) return;
      socket.join(`live:${liveClassId}`);
    });

    socket.on("leave:live-class", (liveClassId) => {
      if (!liveClassId) return;
      socket.leave(`live:${liveClassId}`);
    });

    socket.on("join:presence", (sectionId) => {
      if (!sectionId) return;
      socket.join(`presence:${sectionId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized; call attachSocket(server) after listen()");
  }
  return io;
}

module.exports = { attachSocket, getIO };
