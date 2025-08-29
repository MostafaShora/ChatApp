import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Socket.io
let socketsConnected = new Set<string>();

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
  socketsConnected.add(socket.id);

  io.emit("clients-total", socketsConnected.size);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  // Send message to all clients (including sender)
  socket.on("message", (data) => {
    console.log("💬 message:", data);
    io.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
});

// Listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
