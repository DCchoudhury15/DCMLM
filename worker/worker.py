from redis import Redis
import json

redis = Redis(host="127.0.0.1", port=6379)
pubsub = redis.pubsub()
pubsub.subscribe("logs")

print("Worker subscribed to logs channel")

def process_log(log):
    print("Processing log:", log)

    # simple anomaly detection example
    message_length = len(log.get("message", ""))
    if message_length > 100:
        print("ANOMALY DETECTED: Message too long")
    else:
        print("Log OK")

print("Waiting for logs...")

for message in pubsub.listen():
    if message["type"] == "message":
        log = json.loads(message["data"].decode())
        process_log(log)
