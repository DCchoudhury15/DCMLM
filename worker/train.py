# worker/train.py
import os
import json
from datetime import datetime, timedelta
import joblib
import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import IsolationForest

# CONFIG: adjust as needed
MONGO_URI = "mongodb://127.0.0.1:27017"
DB_NAME = "dcmlm"
COLLECTION = "logs"
MODELS_DIR = "models"
MODEL_METADATA = os.path.join(MODELS_DIR, "latest_model.json")

os.makedirs(MODELS_DIR, exist_ok=True)

def connect_mongo():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db

def fetch_logs(db, days=7, limit=10000):
    # Get logs for last `days`
    since = datetime.utcnow() - timedelta(days=days)
    cursor = db[COLLECTION].find({"timestamp": {"$gte": since}}).sort("timestamp", -1).limit(limit)
    return list(cursor)

def featurize(logs):
    # logs: list of dict
    # produce DataFrame of numerical features per log
    rows = []
    for l in logs:
        msg = l.get("message", "") or ""
        metrics = l.get("metrics") or {}
        meta = l.get("meta") or {}

        # Basic numeric features:
        message_length = len(msg)
        num_words = len(msg.split())
        hour = pd.to_datetime(l.get("timestamp")).hour if l.get("timestamp") else 0
        is_error = 1 if (l.get("level") or "").lower() in ("error", "fatal") else 0

        cpu = float(metrics.get("cpu", 0)) if isinstance(metrics.get("cpu", 0), (int, float)) else 0.0
        mem = float(metrics.get("mem", metrics.get("memory", 0))) if isinstance(metrics.get("mem", 0), (int, float)) else 0.0

        rows.append({
            "message_length": message_length,
            "num_words": num_words,
            "hour": hour,
            "is_error": is_error,
            "cpu": cpu,
            "mem": mem
        })
    df = pd.DataFrame(rows).fillna(0)
    return df

def train_isolation_forest(X):
    model = IsolationForest(n_estimators=200, contamination=0.01, random_state=42)
    model.fit(X)
    return model

def save_model(model, X, metadata=None):
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    path = os.path.join(MODELS_DIR, f"model_{ts}.joblib")
    joblib.dump({"model": model, "features": list(X.columns)}, path)
    meta = {
        "model_path": path,
        "model_version": f"v{ts}",
        "trained_at": ts,
        "features": list(X.columns)
    }
    if metadata:
        meta.update(metadata)
    with open(MODEL_METADATA, "w") as f:
        json.dump(meta, f)
    return meta

def main():
    db = connect_mongo()
    print("Fetching logs...")
    logs = fetch_logs(db, days=14, limit=20000)  # train on 2 weeks of data (adjust)
    if not logs:
        print("No logs found for training.")
        return

    print(f"Fetched {len(logs)} logs. Featurizing...")
    X = featurize(logs)
    if X.shape[0] < 30:
        print("Not enough samples to train a model. Need >30.")
        return
    print("Training IsolationForest...")
    model = train_isolation_forest(X)
    print("Saving model...")
    meta = save_model(model, X)
    print("Model saved:", meta)

if __name__ == "__main__":
    main()
