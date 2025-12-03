// backend/models/Insight.js
const mongoose = require("mongoose");

const InsightSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  type: { type: String, default: "anomaly" }, // anomaly, drift, etc
  score: { type: Number },                     // anomaly score
  threshold: { type: Number },                 // threshold used
  detectedAt: { type: Date, default: Date.now },
  relatedLogId: { type: mongoose.Schema.Types.ObjectId, ref: "Log" },
  summary: { type: String },
  modelVersion: { type: String },
  metadata: { type: Object }, // extra info (features, window stats)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Insight", InsightSchema);
