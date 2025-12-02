const { Queue } = require("bullmq");
const { redisConfig } = require("../redisConfig");

// Create a queue named "log-queue"
const logQueue = new Queue("log-queue", {
  connection: redisConfig
});

module.exports = { logQueue };
