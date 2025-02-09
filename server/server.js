import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store current text state
let currentText = "";

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  // Send current text to newly connected user
  socket.emit("initialText", currentText);

  socket.on("updateText", (text) => {
    currentText = text; // Update stored text
    socket.broadcast.emit("textUpdate", text);
  });

  socket.on("typing", (userId) => {
    socket.broadcast.emit("userTyping", userId);
  });

  socket.on("disconnect", () => {
    io.emit("userStoppedTyping", socket.id);
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
