// backend/scripts/generateSyntheticLogs.js
const mongoose = require("mongoose");
const Log = require("../models/Log");

const MONGO_URI = "mongodb://127.0.0.1:27017/dcmlm";

const messages = [
  "User logged in",
  "User logged out",
  "Payment request processed",
  "Cache miss",
  "Cache hit",
  "Database connection slow",
  "Error reading file",
  "Service timeout",
  "CPU spike detected",
  "Memory usage increased",
  "Background job started",
  "Background job finished",
  "Unhandled exception occurred",
  "API request succeeded",
  "API request failed",
  "Disk space low",
  "Configuration loaded",
  "Model inference started",
  "Model inference completed"
];

async function generateLogs(count = 100) {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const logs = [];

  for (let i = 0; i < count; i++) {
    logs.push({
      projectId: "demo",
      level: Math.random() < 0.1 ? "error" : "info",
      message: messages[Math.floor(Math.random() * messages.length)],
      metrics: {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 2048)
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // past 7 days
    });
  }

  await Log.insertMany(logs);
  console.log(`${count} synthetic logs inserted.`);

  mongoose.connection.close();
  console.log("Done.");
}

generateLogs(150); // generate 150 logs
