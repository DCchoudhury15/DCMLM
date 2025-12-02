const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  level: { type: String, default: "info" }, // info, warn, error
  message: { type: String },
  service: { type: String },
  meta: { type: Object },
  metrics: { type: Object }
});

module.exports = mongoose.model("Log", LogSchema);
