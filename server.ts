import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = Number(process.env.PORT || 3000);
  const HMR_PORT = Number(process.env.HMR_PORT || 24678);

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Set PORT to a free port and try again.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });

  // Real-time Chat Logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Global authentication: user joins their own personal room
    socket.on("authenticate", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} authenticated and joined room user-${userId}`);
    });

    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined conversation room: ${room}`);
    });

    socket.on("send-message", (data) => {
      // data: { room, senderId, receiverId, senderName, text, timestamp, status, id, conversationId }
      // Emit to the specific conversation room EXCLUDING the sender (they already have it via optimistic UI)
      socket.to(data.room).emit("new-message", data);
      
      // Also emit to the receiver's personal room for global sidebar updates / toast notifications
      if (data.receiverId) {
        io.to(`user-${data.receiverId}`).emit("global-new-message", data);
      }
      // Emit to the sender's personal room for sidebar updates only (NOT as a chat message)
      if (data.senderId) {
        io.to(`user-${data.senderId}`).emit("global-new-message", data);
      }
    });

    socket.on("message-status-update", (data) => {
      // data: { room, messageId, status, receiverId, senderId }
      // emit to the conversation room
      io.to(data.room).emit("message-status-updated", data);
      
      // Emit to the original sender's personal room so their UI updates globally
      if (data.senderId) {
        io.to(`user-${data.senderId}`).emit("global-status-updated", data);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite Middleware for Dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: HMR_PORT,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
