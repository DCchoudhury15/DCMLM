// backend/controllers/insightController.js
const Insight = require("../models/Insight");

exports.createInsight = async (req, res) => {
  try {
    const insight = await Insight.create(req.body);
    return res.status(201).json({ success: true, insight });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const q = { ...(req.query.projectId ? { projectId: req.query.projectId } : {}) };
    const insights = await Insight.find(q).sort({ detectedAt: -1 }).limit(200);
    return res.status(200).json({ success: true, insights });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
