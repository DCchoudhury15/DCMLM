const Log = require("../models/Log");
const redis = require("../redisClient");

// Create a new log entry
exports.createLog = async (req, res) => {
  try {
    const log = await Log.create(req.body);

    // publish to redis
    redis.publish("logs", JSON.stringify(log));

    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// Get all logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
