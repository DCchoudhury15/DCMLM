// frontend/src/InsightsDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchInsights } from "./api";
import { io } from "socket.io-client";


export default function InsightsDashboard() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  // 1. Load existing insights first
  const loadInsights = async () => {
    try {
      const data = await fetchInsights("demo");
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    } finally {
      setLoading(false);
    }
  };

  loadInsights();

  // 2. Connect to Socket.IO backend
  const socket = io("http://localhost:5000");

  // 3. Listen for real-time insights
  socket.on("new-insight", (newInsight) => {
    console.log("Real-time insight received:", newInsight);
    setInsights((prev) => [newInsight, ...prev]);
  });

  // 4. Clean up socket on unmount
  return () => {
    socket.disconnect();
  };
}, []);

  if (loading) return <div>Loading insights...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>ML Anomaly Insights</h1>

      {insights.length === 0 && (
        <p>No insights detected yet.</p>
      )}

      {insights.map((insight) => (
        <div
          key={insight._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: insight.type === "anomaly" ? "#ffe5e5" : "#e5ffe5",
          }}
        >
          <h3>
            {insight.type === "anomaly" ? "⚠️ Anomaly Detected" : "Normal Log"}
          </h3>
          <p><strong>Score:</strong> {insight.score}</p>
          <p><strong>Detected At:</strong> {new Date(insight.detectedAt).toLocaleString()}</p>
          <p><strong>Model Version:</strong> {insight.modelVersion}</p>

          <h4>Feature Breakdown:</h4>
          <pre style={{ background: "#f4f4f4", padding: "10px" }}>
{JSON.stringify(insight.metadata?.features, null, 2)}
          </pre>

          <p><strong>Summary:</strong> {insight.summary}</p>
        </div>
      ))}
    </div>
  );
}

