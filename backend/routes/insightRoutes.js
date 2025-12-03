// backend/routes/insightRoutes.js
const express = require("express");
const router = express.Router();

const {
  createInsight,
  getInsights
} = require("../controllers/insightController");

// Worker will use this to store anomaly insights
router.post("/insights", createInsight);

// Frontend will use this to read insights
router.get("/insights", getInsights);

module.exports = router;
