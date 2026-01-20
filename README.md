# VisionSense - AI Object Detection

VisionSense is a full-stack web application that uses computer vision to detect and classify objects in images. It utilizes a **Flask** backend running the **YOLOv8** neural network and a **React (Vite)** frontend for the user interface.

## 🚀 Features

* **Real-time Object Detection:** Identifies 80+ classes of objects (people, vehicles, animals, etc.) using the YOLOv8 Nano model.
* **Confidence Scores:** Displays the confidence percentage for every detected object.
* **Smart Descriptions:** Provides context-aware descriptions for common objects (e.g., "A loyal domesticated animal" for dogs).
* **Bounding Boxes:** Returns precise coordinates to draw boxes around detected items.
* **CORS Secured:** Configured to work securely with specific frontend domains.

## 🛠️ Tech Stack

### Backend
* **Framework:** Python (Flask)
* **AI Model:** YOLOv8n (Ultralytics)
* **Image Processing:** Pillow (PIL), OpenCV (Headless)
* **Containerization:** Docker
* **Deployment:** Render

### Frontend
* **Framework:** React
* **Build Tool:** Vite
* **Deployment:** Vercel

---

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js & npm
* Docker (Optional)
---
### 1. Backend Setup (Flask)

Navigate to the backend directory:
```bash
cd Backend
```
Create a virtual environment:
```bash
Bashpython -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
Install dependencies:
```Bash
pip install -r requirements.txt
```
Create a .env file in the Backend folder:
```Ini, TOML
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
FRONTEND_URL=http://localhost:5173
YOLO_MODEL=yolov8n.pt
```
Run the server:
```Bash
python app.py
```
The backend will start at http://localhost:5000
---
### 2.Frontend Setup (React)

Navigate to the frontend directory:
```Bash
cd ../Frontend
```
Install dependencies:
```Bash
npm install
```
Run the development server:
```Bash
npm run dev
```
The frontend will start at http://localhost:5173
---
### 🐳 Docker DeploymentYou can containerize the backend using the included Dockerfile.
Build the image:
```Bash
docker build -t vision-backend ./Backend
```
Run the container:
```Bash
docker run -p 5000:5000 vision-backend
```
---
## 🔌 API Endpoints
1. Health Check
* URL: /
* Method: GET
* Response: Checks if the API and Model are running.

2. Detect Objects
* URL: /detect
Method: POST
Body:
```Json
{
  "image_url": "[https://example.com/photo.jpg](https://example.com/photo.jpg)"
}
```
Response:
```JSON
{
  "image_url": "...",
  "total_detections": 2,
  "detections": [
    {
      "object": "person",
      "confidence": 0.95,
      "description": "A human being.",
      "box": { "x1": 100, "y1": 50, "x2": 200, "y2": 300 }
    }
  ]
}
```
---
### 🌍 Environment Variables: 
Ensure these variables are set in your deployment environment (e.g., Render, Railway):

/Backend:
```Bash
# Flask
FLASK_ENV=development
FLASK_DEBUG=0
PORT=5000

# CORS / Frontend
FRONTEND_URL=http://localhost:5173

# YOLO
YOLO_MODEL=yolov8n.pt
```
/Frontend:
```Bash
VITE_BACKEND_URL=http://127.0.0.1:5000
```

---
### 📝 License: 
This project is open source and available under the MIT License.
