# head_server.py
import cv2
import mediapipe as mp
import numpy as np

def analyze_head_focus(video_path):
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

    cap = cv2.VideoCapture(video_path)
    
    focus_samples = 0
    total_samples = 0
    calibration_frames = []
    base_r, base_v = 0, 0
    calibrated = False

    directions_count = {"Left": 0, "Right": 0, "Up": 0, "Down": 0}

    # لعدم تحليل كل الفريمات (لتسريع التحليل)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(0, total_frames-1, 50, dtype=int) if total_frames > 50 else range(total_frames)

    for i in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        success, frame = cap.read()
        if not success: continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                nose = face_landmarks.landmark[1]
                left_eye = face_landmarks.landmark[33]
                right_eye = face_landmarks.landmark[263]

                curr_r = nose.x - (left_eye.x + right_eye.x) / 2
                curr_v = nose.y - (left_eye.y + right_eye.y) / 2

                if not calibrated:
                    if abs(curr_r) < 0.09 and abs(curr_v) < 0.09:
                        calibration_frames.append((curr_r, curr_v))
                        if len(calibration_frames) >= 5: # قللناها لـ 5 لسرعة المعايرة
                            base_r = sum(f[0] for f in calibration_frames) / 5
                            base_v = sum(f[1] for f in calibration_frames) / 5
                            calibrated = True
                else:
                    diff_r = (curr_r - base_r) * -1 
                    diff_v = curr_v - base_v
                    total_samples += 1
                    
                    if abs(diff_v) < 0.04 and abs(diff_r) < 0.04:
                        focus_samples += 1
                    else:
                        if abs(diff_v) > abs(diff_r):
                            if diff_v > 0: directions_count["Down"] += 1
                            else: directions_count["Up"] += 1
                        else:
                            if diff_r > 0: directions_count["Right"] += 1
                            else: directions_count["Left"] += 1

    cap.release()
    face_mesh.close()
    
    score = round((focus_samples / total_samples) * 100) if total_samples > 0 else 0
    
    # تحديد أكثر اتجاه نظر إليه بدلاً من الكاميرا
    most_distracted_dir = max(directions_count, key=directions_count.get) if score < 80 else "None"
    
    advice = "Perfect eye contact and focus!"
    if score < 50:
        advice = f"You seem distracted. You looked {most_distracted_dir} too often. Try to look at the camera."
    elif score < 80:
        advice = "Good, but try to maintain eye contact with the camera more consistently."

    return {
        "score": score,
        "advice": advice,
        "details": directions_count
    }