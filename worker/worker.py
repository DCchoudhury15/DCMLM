# worker/worker.py
import os
import json
import requests
from redis import Redis
from datetime import datetime
import joblib
import numpy as np
import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler
import subprocess

# -------------------------
# CONFIG
# -------------------------
REDIS_HOST = "127.0.0.1"
REDIS_PORT = 6379

BACKEND_INSIGHT_API = "http://localhost:5000/api/insights"
MODEL_META_PATH = "models/latest_model.json"
TRAIN_SCRIPT = "train.py"
RETRAIN_INTERVAL_MINUTES = 60  # retrain every 1 hour

# -------------------------
# Redis Setup
# -------------------------
redis = Redis(host=REDIS_HOST, port=REDIS_PORT)
pubsub = redis.pubsub()
pubsub.subscribe("logs")

print("Worker subscribed to Redis channel: logs")
print("Waiting for logs...")

# -------------------------
# Model Cache
# -------------------------
model_cache = {
    "model": None,
    "features": None,
    "version": None,
    "path": None
}

# -------------------------
# Load Latest ML Model
# -------------------------
def load_latest_model():
    if not os.path.exists(MODEL_META_PATH):
        print("⚠ No model found. Run train.py first.")
        return False

    with open(MODEL_META_PATH, "r") as f:
        meta = json.load(f)

    model_path = meta["model_path"]

    if model_cache["path"] != model_path:
        print(f"Loading ML model: {model_path}")
        obj = joblib.load(model_path)
        model_cache["model"] = obj["model"]
        model_cache["features"] = obj["features"]
        model_cache["version"] = meta["model_version"]
        model_cache["path"] = model_path

    return True

# -------------------------
# Feature Extraction
# -------------------------
def featurize_log(log):
    msg = log.get("message", "") or ""
    metrics = log.get("metrics") or {}

    row = {
        "message_length": len(msg),
        "num_words": len(msg.split()),
        "hour": pd.to_datetime(log.get("timestamp")).hour if log.get("timestamp") else 0,
        "is_error": 1 if (log.get("level") or "").lower() in ("error", "fatal") else 0,
        "cpu": float(metrics.get("cpu", 0) or 0),
        "mem": float(metrics.get("memory", metrics.get("mem", 0)) or 0)
    }

    features = model_cache["features"]
    vector = np.array([row.get(f, 0) for f in features]).reshape(1, -1)

    return vector, row

# -------------------------
# Send Insight to Backend
# -------------------------
def send_insight(insight):
    try:
        res = requests.post(BACKEND_INSIGHT_API, json=insight)
        print("Insight sent:", res.status_code)
    except Exception as e:
        print("Failed to send insight:", e)

# -------------------------
# Process Each Log
# -------------------------
def process_log(log):
    if not load_latest_model():
        print("⚠ Skipping ML scoring (no model available)")
        return

    model = model_cache["model"]

    vector, feature_details = featurize_log(log)

    try:
        score = model.decision_function(vector)[0]
        prediction = model.predict(vector)[0]  # -1 anomaly, 1 normal
    except Exception as e:
        print("ML model error:", e)
        return

    is_anomaly = prediction == -1

    if is_anomaly:
        print("\n🔥 ANOMALY DETECTED!")
        print("Score:", score)
        print("Log:", log)

        insight = {
            "projectId": log.get("projectId", "unknown"),
            "type": "anomaly",
            "score": float(score),
            "threshold": None,
            "detectedAt": datetime.utcnow().isoformat(),
            "relatedLogId": log.get("_id"),
            "summary": "Anomaly detected by ML model",
            "modelVersion": model_cache["version"],
            "metadata": {
                "features": feature_details
            }
        }

        send_insight(insight)
    else:
        print("Log OK | Score:", score)

# -------------------------
# Scheduled Retraining
# -------------------------
def retrain_model():
    print("\n🔁 Starting scheduled retraining...")
    try:
        subprocess.run(["python", TRAIN_SCRIPT], check=True)
        print("✔ Retraining complete.")
    except Exception as e:
        print("❌ Retraining failed:", e)

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(retrain_model, "interval", minutes=RETRAIN_INTERVAL_MINUTES)
scheduler.start()

# Load model at startup
load_latest_model()

# -------------------------
# Worker Event Loop
# -------------------------
for message in pubsub.listen():
    if message["type"] == "message":
        data = message["data"].decode()
        try:
            log = json.loads(data)
        except:
            print("Invalid log received!")
            continue

        process_log(log)
