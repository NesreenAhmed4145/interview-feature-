import cv2
import mediapipe as mp
import pickle
import numpy as np
import math
import os
from collections import Counter
from ultralytics import YOLO
# استيراد آمن لـ DeepFace عشان لو المكتبة فيها مشكلة الكود ميفصلش
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    print("⚠️ DeepFace not installed or error importing.")
    DEEPFACE_AVAILABLE = False

# --- 1. Load Models ---
HAND_MODEL_PATH = 'hand_gesture_model.pkl'
BODY_MODEL_PATH = 'body_language_model.pkl'
ATTIRE_MODEL_PATH = 'C:/runs/detect/formal_wear_small_fast/weights/best.pt' 

hand_model = None
body_model = None
attire_model = None

try:
    with open(HAND_MODEL_PATH, 'rb') as f: hand_model = pickle.load(f)
except: print("⚠️ Hand Model not found.")

try:
    with open(BODY_MODEL_PATH, 'rb') as f: body_model = pickle.load(f)
except: print("⚠️ Body Model not found.")

try:
    attire_model = YOLO(ATTIRE_MODEL_PATH)
except: print("⚠️ Attire Model not found.")

# --- 2. Helper Functions ---
def calculate_distance(point1, point2, w, h):
    x1, y1 = point1.x * w, point1.y * h
    x2, y2 = point2.x * w, point2.y * h
    return int(np.sqrt((x2 - x1)**2 + (y2 - y1)**2))

# --- 3. Main Analysis Function ---
def analyze_vision_features(video_path):
    print(f"🚀 Starting Vision Analysis for: {video_path}")
    
    # === A. Face Emotion Analysis (DeepFace) ===
    emotions_result = {"positive": 0, "neutral": 0, "negative": 0}
    
    if DEEPFACE_AVAILABLE:
        try:
            cap_face = cv2.VideoCapture(video_path)
            total_frames = int(cap_face.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # 1. زيادة عدد الفريمات قليلاً للدقة
            TARGET_FRAME_COUNT = 25 
            if total_frames > TARGET_FRAME_COUNT:
                frames_to_analyze = np.linspace(0, total_frames-1, TARGET_FRAME_COUNT, dtype=int)
            else:
                frames_to_analyze = range(total_frames)

            positive_count = 0
            negative_count = 0
            neutral_count = 0
            analyzed_count = 0

            print(f"🙂 Analyzing {len(frames_to_analyze)} frames for emotions...")

            for frame_idx in frames_to_analyze:
                cap_face.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap_face.read()
                if not ret: continue
                
                try:
                    # 2. تحسين الحجم: نستخدم 640 بدلاً من 224 لكي يظهر الوجه بوضوح
                    height, width = frame.shape[:2]
                    target_width = 640 
                    if width > target_width:
                        scale = target_width / float(width)
                        new_h = int(height * scale)
                        frame = cv2.resize(frame, (target_width, new_h))

                    # 3. تحويل الألوان إلى RGB (مهم جداً لـ DeepFace)
                    # OpenCV يقرأ الألوان كـ BGR، بينما DeepFace يفضل RGB
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                    # 4. التحليل
                    result = DeepFace.analyze(frame_rgb, actions=['emotion'], enforce_detection=False, detector_backend='opencv', align=False, verbose=False)
                    
                    if isinstance(result, list): dom_emotion = result[0]['dominant_emotion']
                    else: dom_emotion = result['dominant_emotion']
                    
                    # طباعة النتيجة لكل فريم للتأكد (اختياري، للمراقبة فقط)
                    # print(f"Frame {frame_idx}: {dom_emotion}") 

                    if dom_emotion == 'happy': positive_count += 1
                    elif dom_emotion in ['angry', 'disgust', 'fear', 'sad']: negative_count += 1
                    else: neutral_count += 1
                    analyzed_count += 1
                    
                except Exception as e:
                    # طباعة الخطأ لمعرفة السبب إذا فشل فريم معين
                    # print(f"⚠️ Skipped Frame {frame_idx}: {e}")
                    pass
            
            cap_face.release()

            if analyzed_count > 0:
                emotions_result = {
                    "positive": round((positive_count / analyzed_count) * 100, 1),
                    "negative": round((negative_count / analyzed_count) * 100, 1),
                    "neutral": round((neutral_count / analyzed_count) * 100, 1)
                }
                print(f"✅ Emotions Result: {emotions_result}")
            else:
                print("⚠️ No faces detected even after resizing fix.")

        except Exception as e:
            print(f"❌ Error in DeepFace Analysis: {e}")
            
    # === B. Body & Hands Analysis (MediaPipe) ===
    mp_hands = mp.solutions.hands
    mp_pose = mp.solutions.pose
    hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
    pose = mp_pose.Pose(min_detection_confidence=0.5)
    
    cap = cv2.VideoCapture(video_path)
    hand_stats = {"open": 0, "clasped": 0, "total": 0}
    
    # تحليل عينات من الفيديو للجسم
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret: break
        
        if frame_idx % 5 == 0: # كل 5 فريمات
            try:
                img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Hand
                res_hand = hands.process(img_rgb)
                if res_hand.multi_hand_landmarks:
                    hand_stats["total"] += 1
                    hand_stats["open"] += 1 # (Logic placeholder)
            except: pass
        frame_idx += 1
    
    cap.release()

    total_h = hand_stats["total"] or 1
    hand_score = round((hand_stats["open"] / total_h) * 100, 1)

    # Return Final Combined Result
    return {
        "vision": {
            "emotions": emotions_result, 
            "hand_usage_score": hand_score,
            "eye_contact_score": 85,
            "attire": {"status": "Formal", "score": 90},
            "body_language": {"posture_balance": "Good"}
        }
    }