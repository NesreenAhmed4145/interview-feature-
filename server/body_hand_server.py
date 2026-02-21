import cv2
import mediapipe as mp
import pickle
import numpy as np
import math
from collections import Counter

# Load Body model only (We will use Math for Hands for 100% accuracy)
BODY_MODEL_PATH = 'body_language_model.pkl'

try:
    with open(BODY_MODEL_PATH, 'rb') as f: body_model = pickle.load(f)
except: body_model = None

def calculate_distance(point1, point2, w, h):
    x1, y1 = point1.x * w, point1.y * h
    x2, y2 = point2.x * w, point2.y * h
    return int(np.sqrt((x2 - x1)**2 + (y2 - y1)**2))

def is_hand_open(hand_landmarks):
    open_fingers = 0
    tips = [8, 12, 16, 20] 
    pips = [6, 10, 14, 18]
    wrist = hand_landmarks.landmark[0]
    
    for tip, pip in zip(tips, pips):
        lm_tip = hand_landmarks.landmark[tip]
        lm_pip = hand_landmarks.landmark[pip]
        
        dist_tip = math.hypot(lm_tip.x - wrist.x, lm_tip.y - wrist.y)
        dist_pip = math.hypot(lm_pip.x - wrist.x, lm_pip.y - wrist.y)
        
        if dist_tip > dist_pip:
            open_fingers += 1
            
    return open_fingers >= 3

def analyze_body_hand(video_path):
    mp_hands = mp.solutions.hands
    mp_pose = mp.solutions.pose
    
    hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
    pose = mp_pose.Pose(min_detection_confidence=0.5)

    cap = cv2.VideoCapture(video_path)
    
    # Stats Containers
    hand_stats = {"open_count": 0, "clasped_count": 0, "total_speed": 0, "speed_samples": 0}
    body_stats = {"predictions": [], "openness": [], "alignment": []}
    
    # 🔥 الحماية ضد توقف الكود وتعليق الملف 🔥
    try:
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # حماية إضافية لو كان الفيديو قصيراً جداً لتجنب قسمة الصفر
        indices = range(0, max(1, total_frames), 5)

        prev_wrist = None
        
        for i in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if not ret: continue
            
            target_w = 480
            h, w, _ = frame.shape
            scale = target_w / w
            frame = cv2.resize(frame, (target_w, int(h * scale)))
            curr_h, curr_w, _ = frame.shape
            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # --- Hands ---
            res_hand = hands.process(img_rgb)
            if res_hand.multi_hand_landmarks:
                for hl in res_hand.multi_hand_landmarks:
                    wrist = hl.landmark[0]
                    if prev_wrist:
                        dist = math.sqrt((wrist.x - prev_wrist.x)**2 + (wrist.y - prev_wrist.y)**2)
                        hand_stats["total_speed"] += dist
                        hand_stats["speed_samples"] += 1
                    prev_wrist = wrist
                    
                    if is_hand_open(hl):
                        hand_stats["open_count"] += 1
                    else:
                        hand_stats["clasped_count"] += 1
            
            # --- Body ---
            res_pose = pose.process(img_rgb)
            if res_pose.pose_landmarks:
                lm = res_pose.pose_landmarks.landmark
                
                sh_w = calculate_distance(lm[11], lm[12], curr_w, curr_h)
                el_w = calculate_distance(lm[13], lm[14], curr_w, curr_h)
                ratio = el_w / (sh_w + 1e-6)
                body_stats["openness"].append("Open" if ratio > 1.6 else "Closed")
                body_stats["alignment"].append("Balanced" if abs(lm[11].y - lm[12].y) < 0.05 else "Leaning")
                
                if body_model:
                    row = []
                    nose = lm[0]
                    for p in lm[:23]: 
                        row.extend([p.x-nose.x, p.y-nose.y, p.z-nose.z, p.visibility])
                    try:
                        # تطبيق الـ Confidence Score
                        probabilities = body_model.predict_proba([row])[0]
                        max_prob = max(probabilities)
                        pred_class = body_model.classes_[np.argmax(probabilities)]
                        
                        if pred_class == "Touching Face":
                            if max_prob > 0.80:
                                body_stats["predictions"].append(pred_class)
                        else:
                            body_stats["predictions"].append(pred_class)
                            
                    except AttributeError:
                        pred = body_model.predict([row])[0]
                        body_stats["predictions"].append(pred)
                    except: pass
                    
    finally:
        # 🟢 هذا السطر السحري سيتم تنفيذه دائماً لفك الحظر عن ملف الفيديو 🟢
        cap.release()

    # --- Calculations ---
    total_h = (hand_stats["open_count"] + hand_stats["clasped_count"]) or 1
    total_b = len(body_stats["predictions"]) or 1
    
    counts = Counter(body_stats["predictions"])
    print("🤖 Actual Model Predictions:", counts)

    # 1. نسبة الشرح 
    explaining_score = round((counts.get("Explaining", 0) / total_b) * 100, 1)

    # 2. نسبة الجلوس مستقيماً 
    straight_score = round((counts.get("Straight", 0) / total_b) * 100, 1)

    # 3. نسبة لمس الوجه 
    touch_face_score = round((counts.get("Touching Face", 0) / total_b) * 100, 1)

    # 4. نسبة تكتيف الذراعين 
    crossed_arm_score = round((counts.get("Crossed Arms", 0) / total_b) * 100, 1)

    # 5. حسابات اليد (مفتوحة ومغلقة وسرعة)
    open_percentage = (hand_stats["open_count"] / total_h) * 100
    clasped_percentage = (hand_stats["clasped_count"] / total_h) * 100
    avg_speed = hand_stats["total_speed"] / (hand_stats["speed_samples"] or 1)
    final_speed_percentage = min(100, int(avg_speed * 100))

    # 6. معادلة الـ Engagement Score
    engagement_score = int(20 + (explaining_score * 0.40) + (open_percentage * 0.20) + (final_speed_percentage * 0.20))
    engagement_score = max(0, min(100, engagement_score))

    return {
        "hand": {
            "open_score": round(open_percentage),
            "clasped_score": round(clasped_percentage),
            "average_speed": final_speed_percentage
        },
        "body": {
            "engagement_score": engagement_score,
            "explaining_score": explaining_score,
            "straight_score": straight_score,
            "touch_face_score": touch_face_score,
            "crossed_arm_score": crossed_arm_score,
            "body_openness": Counter(body_stats["openness"]).most_common(1)[0][0] if body_stats["openness"] else "Normal",
            "posture_balance": f"{min(100, round((body_stats['alignment'].count('Balanced') / (len(body_stats['alignment']) or 1)) * 100))}%"        }
    }