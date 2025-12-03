// frontend/src/api.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const fetchInsights = async (projectId = "demo") => {
  const res = await axios.get(`${API_BASE}/insights?projectId=${projectId}`);
  return res.data.insights;
};

export const fetchLogs = async (projectId = "demo") => {
  const res = await axios.get(`${API_BASE}/logs?projectId=${projectId}`);
  return res.data.logs;
};

