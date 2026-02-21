import cv2
import mediapipe as mp
import numpy as np
import math
import pickle
from collections import Counter
from deepface import DeepFace
from ultralytics import YOLO

# ==========================================
# 1. تحميل الموديلات الخارجية (مرة واحدة فقط)
# ==========================================
try:
    with open('body_language_model.pkl', 'rb') as f: 
        body_model = pickle.load(f)
except: body_model = None

try:
    attire_model = YOLO('C:/runs/detect/formal_wear_small_fast/weights/best.pt')
except: attire_model = None

# ==========================================
# 2. الدوال المساعدة (Helper Functions)
# ==========================================
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
        if dist_tip > dist_pip: open_fingers += 1
    return open_fingers >= 3

def _get_landmark_point(landmarks, idx, w, h):
    return int(landmarks[idx].x * w), int(landmarks[idx].y * h)

def _euclidean_distance(p1, p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

def _get_eye_ratio(mesh_points, w, h, eye_indices):
    p_right = _get_landmark_point(mesh_points, eye_indices[0], w, h)
    p_left = _get_landmark_point(mesh_points, eye_indices[1], w, h)
    p_top = _get_landmark_point(mesh_points, eye_indices[2], w, h)
    p_bottom = _get_landmark_point(mesh_points, eye_indices[3], w, h)
    p_iris = _get_landmark_point(mesh_points, eye_indices[4], w, h)

    width = _euclidean_distance(p_iris, p_right) + _euclidean_distance(p_iris, p_left)
    height = _euclidean_distance(p_iris, p_top) + _euclidean_distance(p_iris, p_bottom)
    if width == 0 or height == 0: return None, None
    return _euclidean_distance(p_iris, p_right) / width, _euclidean_distance(p_iris, p_top) / height

# ==========================================
# 3. الدالة الرئيسية (The Master Loop)
# ==========================================
def analyze_vision_single_pass(video_path):
    print(f"🚀 Starting MASTER Vision Analysis: {video_path}")
    
    # تهيئة MediaPipe مرة واحدة
    mp_hands = mp.solutions.hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
    mp_pose = mp.solutions.pose.Pose(min_detection_confidence=0.5)
    mp_face_mesh = mp.solutions.face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5, min_tracking_confidence=0.5)

    cap = cv2.VideoCapture(video_path)
    
    # --- حاويات البيانات ---
    # Body & Hand
    hand_stats = {"open_count": 0, "clasped_count": 0, "total_speed": 0, "speed_samples": 0}
    body_stats = {"predictions": [], "openness": [], "alignment": []}
    prev_wrist = None
    
    # Face (Emotions)
    emotions_count = {"happy": 0, "neutral": 0, "negative": 0}
    face_analyzed_count = 0
    
    # Attire
    formal_points_total = 0
    attire_frames_checked = 0
    
    # Eye Contact
    eye_total_frames = 0
    eye_focused_frames = 0
    
    # Head Focus
    head_focus_samples = 0
    head_total_samples = 0
    calibration_frames = []
    base_r, base_v = 0, 0
    calibrated = False
    directions_count = {"Left": 0, "Right": 0, "Up": 0, "Down": 0}

    frame_index = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # 🔥 القفز 5 فريمات لتسريع كل شيء 🔥
        if frame_index % 5 != 0:
            frame_index += 1
            continue

        # 1. تجهيز الصورة بأبعاد مناسبة للتحليل
        h_orig, w_orig, _ = frame.shape
        target_w = 480
        scale = target_w / w_orig
        new_h = int(h_orig * scale)
        frame_480 = cv2.resize(frame, (target_w, new_h))
        rgb_480 = cv2.cvtColor(frame_480, cv2.COLOR_BGR2RGB)

        # =======================================
        # 🟢 1. تحليل الوجه (المشاعر) - DeepFace
        # =======================================
        try:
            result_df = DeepFace.analyze(rgb_480, actions=['emotion'], enforce_detection=False, detector_backend='opencv', align=False)
            dom = result_df[0]['dominant_emotion'] if isinstance(result_df, list) else result_df['dominant_emotion']
            if dom == 'happy': emotions_count['happy'] += 1
            elif dom in ['angry', 'disgust', 'fear', 'sad']: emotions_count['negative'] += 1
            else: emotions_count['neutral'] += 1
            face_analyzed_count += 1
        except: pass

        # =======================================
        # 🟢 2. تحليل الملابس - YOLO
        # =======================================
        if attire_model:
            frame_640 = cv2.resize(frame, (640, int(h_orig*640/w_orig)))
            # رفع نسبة الثقة لـ 0.70 لتقليل الأخطاء
            results_yolo = attire_model(frame_640, verbose=False, conf=0.70)
            
            # 🔥 استخدام set لتخزين أسماء القطع المكتشفة بدون تكرار 🔥
            detected_items = set()
            for r in results_yolo:
                for box in r.boxes:
                    label = attire_model.names[int(box.cls[0])].lower()
                    detected_items.add(label)
            
            # 🔥 اللوجيك الصارم لتحديد ما إذا كان الفريم رسمياً أم لا 🔥
            is_formal_frame = False
            
            # 1. لو لابس جاكيت، بدلة، أو كرافتة -> أكيد رسمي
            if any(item in detected_items for item in ['jacket', 'suit', 'tie']):
                is_formal_frame = True
            # 2. لو لابس قميص (بشرط ميكونش الموديل شايف تيشيرت في نفس الوقت)
            elif 'shirt' in detected_items and 't-shirt' not in detected_items:
                is_formal_frame = True
                
            # زيادة عداد الفريمات الرسمية لو تحقق الشرط
            if is_formal_frame: 
                formal_points_total += 1
                
            attire_frames_checked += 1

        # =======================================
        # 🟢 3. تحليل الجسم واليدين - MediaPipe Pose & Hands
        # =======================================
        res_pose = mp_pose.process(rgb_480)
        if res_pose.pose_landmarks:
            lm = res_pose.pose_landmarks.landmark
            sh_w = calculate_distance(lm[11], lm[12], target_w, new_h)
            el_w = calculate_distance(lm[13], lm[14], target_w, new_h)
            ratio = el_w / (sh_w + 1e-6)
            body_stats["openness"].append("Open" if ratio > 1.6 else "Closed")
            body_stats["alignment"].append("Balanced" if abs(lm[11].y - lm[12].y) < 0.05 else "Leaning")
            
            if body_model:
                row = []
                nose = lm[0]
                for p in lm[:23]: row.extend([p.x-nose.x, p.y-nose.y, p.z-nose.z, p.visibility])
                try:
                    probabilities = body_model.predict_proba([row])[0]
                    max_prob = max(probabilities)
                    pred_class = body_model.classes_[np.argmax(probabilities)]
                    if pred_class == "Touching Face":
                        if max_prob > 0.80: body_stats["predictions"].append(pred_class)
                    else:
                        body_stats["predictions"].append(pred_class)
                except AttributeError:
                    pred = body_model.predict([row])[0]
                    body_stats["predictions"].append(pred)
                except: pass

        res_hand = mp_hands.process(rgb_480)
        if res_hand.multi_hand_landmarks:
            for hl in res_hand.multi_hand_landmarks:
                wrist = hl.landmark[0]
                if prev_wrist:
                    dist = math.sqrt((wrist.x - prev_wrist.x)**2 + (wrist.y - prev_wrist.y)**2)
                    hand_stats["total_speed"] += dist
                    hand_stats["speed_samples"] += 1
                prev_wrist = wrist
                if is_hand_open(hl): hand_stats["open_count"] += 1
                else: hand_stats["clasped_count"] += 1

        # =======================================
        # 🟢 4. تحليل العين والرأس معاً! (استخدام FaceMesh مرة واحدة)
        # =======================================
        res_mesh = mp_face_mesh.process(rgb_480)
        if res_mesh.multi_face_landmarks:
            mesh_points = res_mesh.multi_face_landmarks[0].landmark
            
            # --- Eye Contact Logic ---
            left_h, left_v = _get_eye_ratio(mesh_points, target_w, new_h, [362, 263, 386, 374, 473])
            right_h, right_v = _get_eye_ratio(mesh_points, target_w, new_h, [33, 133, 159, 145, 468])
            is_focused = False
            if left_h and right_h:
                avg_horiz = (left_h + right_h) / 2
                avg_vert = (left_v + right_v) / 2
                if 0.35 < avg_horiz < 0.65 and 0.30 < avg_vert < 0.60:
                    is_focused = True
            eye_total_frames += 1
            if is_focused: eye_focused_frames += 1

            # --- Head Focus Logic ---
            nose_p = mesh_points[1]
            l_eye_p = mesh_points[33]
            r_eye_p = mesh_points[263]
            curr_r = nose_p.x - (l_eye_p.x + r_eye_p.x) / 2
            curr_v = nose_p.y - (l_eye_p.y + r_eye_p.y) / 2

            if not calibrated:
                if abs(curr_r) < 0.09 and abs(curr_v) < 0.09:
                    calibration_frames.append((curr_r, curr_v))
                    if len(calibration_frames) >= 5:
                        base_r = sum(f[0] for f in calibration_frames) / 5
                        base_v = sum(f[1] for f in calibration_frames) / 5
                        calibrated = True
            else:
                diff_r = (curr_r - base_r) * -1 
                diff_v = curr_v - base_v
                head_total_samples += 1
                if abs(diff_v) < 0.04 and abs(diff_r) < 0.04:
                    head_focus_samples += 1
                else:
                    if abs(diff_v) > abs(diff_r):
                        if diff_v > 0: directions_count["Down"] += 1
                        else: directions_count["Up"] += 1
                    else:
                        if diff_r > 0: directions_count["Right"] += 1
                        else: directions_count["Left"] += 1

        frame_index += 1

    cap.release()
    mp_hands.close()
    mp_pose.close()
    mp_face_mesh.close()

    # ==========================================
    # 🎯 تجميع وحساب النتائج النهائية
    # ==========================================
    
    # 1. Body & Hand Calculations
    total_h = (hand_stats["open_count"] + hand_stats["clasped_count"]) or 1
    total_b = len(body_stats["predictions"]) or 1
    counts = Counter(body_stats["predictions"])
    
    explaining_score = round((counts.get("Explaining", 0) / total_b) * 100, 1)
    straight_score = round((counts.get("Straight", 0) / total_b) * 100, 1)
    touch_face_score = round((counts.get("Touching Face", 0) / total_b) * 100, 1)
    crossed_arm_score = round((counts.get("Crossed Arms", 0) / total_b) * 100, 1)
    
    open_percentage = (hand_stats["open_count"] / total_h) * 100
    clasped_percentage = (hand_stats["clasped_count"] / total_h) * 100
    avg_speed = hand_stats["total_speed"] / (hand_stats["speed_samples"] or 1)
    final_speed_percentage = min(100, int(avg_speed * 100))
    
    engagement_score = max(0, min(100, int(20 + (explaining_score * 0.40) + (open_percentage * 0.20) + (final_speed_percentage * 0.20))))

    # 2. Face Calculations
    face_f = face_analyzed_count or 1
    
    # 3. Attire Calculations
    attire_score = (formal_points_total / attire_frames_checked * 100) if attire_frames_checked > 0 else 0

    # 4. Eye Contact
    eye_score = int((eye_focused_frames / eye_total_frames) * 100) if eye_total_frames > 0 else 0
    if eye_score >= 90: grade, advice = "EXCELLENT", "Perfect eye contact! You showed great confidence."
    elif eye_score >= 50: grade, advice = "GOOD", "Good job! Try to minimize looking away."
    else: grade, advice = "NEEDS IMPROVEMENT", "Try to look at the camera lens more often."

    # 5. Head Focus
    head_score = round((head_focus_samples / head_total_samples) * 100) if head_total_samples > 0 else 0
    most_distracted_dir = max(directions_count, key=directions_count.get) if head_score < 80 else "None"
    if head_score < 50: h_advice = f"You looked {most_distracted_dir} too often. Look at the camera."
    elif head_score < 80: h_advice = "Good, but try to maintain eye contact."
    else: h_advice = "Perfect eye contact and focus!"

    # 🟢 إرجاع الـ JSON النهائي المطابق للـ Frontend
    return {
        "body": {
            "engagement_score": engagement_score,
            "explaining_score": explaining_score,
            "straight_score": straight_score,
            "touch_face_score": touch_face_score,
            "crossed_arm_score": crossed_arm_score,
            "body_openness": Counter(body_stats["openness"]).most_common(1)[0][0] if body_stats["openness"] else "Normal",
            "posture_balance": f"{min(100, round((body_stats['alignment'].count('Balanced') / (len(body_stats['alignment']) or 1)) * 100))}%"
        },
        "hand": {
            "open_score": round(open_percentage),
            "clasped_score": round(clasped_percentage),
            "average_speed": final_speed_percentage
        },
        "emotions": {
            "positive": round((emotions_count['happy'] / face_f) * 100, 1),
            "negative": round((emotions_count['negative'] / face_f) * 100, 1),
            "neutral": round((emotions_count['neutral'] / face_f) * 100, 1)
        },
        "attire": {
            "is_formal": attire_score >= 50,
            "status": "Formal" if attire_score >= 50 else "Casual",
            "score": round(attire_score, 1)
        },
        "eye_contact": {
            "score": eye_score, "grade": grade, "advice": advice
        },
        "head_focus": {
            "score": head_score, "advice": h_advice, "details": directions_count
        }
    }