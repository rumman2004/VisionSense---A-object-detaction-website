import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import requests

load_dotenv()

app = Flask(__name__)

# =========================
# CORS (Local + Vercel + Railway)
# =========================
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

CORS(app, resources={r"/*": {"origins": allowed_origins}})

# =========================
# Load YOLO Model
# =========================
model = YOLO("yolov8n.pt")

# =========================
# Object Descriptions
# =========================
OBJECT_SUMMARY = {
    "person": "A human being.",
    "dog": "A loyal domesticated animal.",
    "cat": "A small domesticated mammal.",
    "car": "A motor vehicle used for transportation.",
    "bicycle": "A human-powered two-wheeled vehicle.",
    "motorcycle": "A two-wheeled motor vehicle.",
    "bus": "A large passenger vehicle.",
    "truck": "A vehicle for transporting goods.",
    "laptop": "A portable computer.",
    "cell phone": "A handheld communication device."
}

# =========================
# Health Check
# =========================
@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "message": "YOLO backend running 🚀",
        "model": "yolov8n"
    })

# =========================
# Detect Objects
# =========================
@app.route("/detect", methods=["POST"])
def detect():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "No image URL provided"}), 400

    try:
        response = requests.get(image_url, stream=True, timeout=10)
        response.raise_for_status()

        image = Image.open(response.raw).convert("RGB")

        results = model(image, verbose=False)

        detections = []

        for r in results:
            if r.boxes is None:
                continue

            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                name = model.names[cls_id]

                detections.append({
                    "object": name,
                    "confidence": round(conf, 2),
                    "description": OBJECT_SUMMARY.get(name, "Detected object."),
                    "box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })

        return jsonify({
            "image_url": image_url,
            "detections": detections,
            "total_detections": len(detections)
        })

    except Exception as e:
        return jsonify({
            "error": "Detection failed",
            "details": str(e)
        }), 500

# =========================
# Entry Point
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
