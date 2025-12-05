// ----------------- IMPORTS -----------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// ROUTES
const logRoutes = require("./routes/logRoutes");
const insightRoutes = require("./routes/insightRoutes");

// ----------------- CREATE EXPRESS APP -----------------
const app = express();
app.use(express.json());
app.use(cors());

// ----------------- MONGODB CONNECTION -----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/dcmlm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ----------------- API ROUTES -----------------
app.use("/api/logs", logRoutes);
app.use("/api/insights", insightRoutes);

// ----------------- CREATE SERVER + SOCKET.IO -----------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const socketManager = require("./socket");
socketManager.init(io); // store io instance


// Handle socket connections
io.on("connection", (socket) => {
  console.log("Frontend connected via socket:", socket.id);
});

// Export io so controllers can emit events

// ----------------- START SERVER -----------------
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
