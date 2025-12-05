const Insight = require("../models/Insight");
const { getIO } = require("../socket");

// CREATE INSIGHT (called by worker)
exports.createInsight = async (req, res) => {
  try {
    const insight = new Insight(req.body);
    const savedInsight = await insight.save();

    // 🔥 EMIT REAL-TIME EVENT
getIO().emit("new-insight", savedInsight);

    res.json({ success: true, insight: savedInsight });
  } catch (err) {
    console.error("Insight save error:", err);
    res.status(500).json({ success: false, error: "Failed to create insight" });
  }
};

// GET INSIGHTS FOR A PROJECT
exports.getInsights = async (req, res) => {
  try {
    const { projectId } = req.query;

    const insights = await Insight.find({ projectId }).sort({
      detectedAt: -1
    });

    res.json({ success: true, insights });
  } catch (err) {
    console.error("Insight fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch insights" });
  }
};
