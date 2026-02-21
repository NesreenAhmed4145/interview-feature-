from ultralytics import YOLO
import cv2
import numpy as np

# Load Model
model_path = 'C:/runs/detect/formal_wear_small_fast/weights/best.pt'
try:
    attire_model = YOLO(model_path)
except:
    attire_model = None

def analyze_attire(video_path):
    if not attire_model:
        return {"is_formal": False, "status": "Unknown", "score": 0}

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(0, total_frames-1, 15, dtype=int) if total_frames > 15 else range(total_frames)

    formal_points = 0
    frames_checked = 0

    for i in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if not ret: continue
        
        # Resize
        frame = cv2.resize(frame, (640, int(frame.shape[0]*640/frame.shape[1])))
        
        results = attire_model(frame, verbose=False, conf=0.5)
        points = 0
        for r in results:
            for box in r.boxes:
                label = attire_model.names[int(box.cls[0])].lower()
                if label in ['jacket', 'suit', 'tie']: points += 5
                elif label == 'shirt': points += 1
        
        if points >= 3: formal_points += 1
        frames_checked += 1
        
    cap.release()
    
    score = (formal_points / frames_checked * 100) if frames_checked > 0 else 0
    return {
        "is_formal": score >= 50,
        "status": "Formal" if score >= 50 else "Casual",
        "score": round(score, 1)
    }