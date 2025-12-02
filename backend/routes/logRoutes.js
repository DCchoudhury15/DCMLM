const express = require("express");
const router = express.Router();

const {
  createLog,
  getLogs
} = require("../controllers/logController");

// POST /api/logs → create a log entry
router.post("/logs", createLog);

// GET /api/logs → fetch all logs
router.get("/logs", getLogs);

module.exports = router;
