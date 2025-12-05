const express = require("express");
const router = express.Router();
const { createInsight, getInsights } = require("../controllers/insightController");

router.post("/", createInsight);
router.get("/", getInsights);

module.exports = router;
