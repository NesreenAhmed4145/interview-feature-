import cv2
import numpy as np
from deepface import DeepFace

def analyze_face_emotions(video_path):
    print(f"🚀 Starting Face Analysis for: {video_path}")
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # تحليل 20 فريم
    TARGET_FRAME_COUNT = 20
    if total_frames > TARGET_FRAME_COUNT:
        frames_to_analyze = np.linspace(0, total_frames-1, TARGET_FRAME_COUNT, dtype=int)
    else:
        frames_to_analyze = range(total_frames)

    emotions_count = {"happy": 0, "neutral": 0, "negative": 0}
    analyzed_count = 0
    
    for frame_idx in frames_to_analyze:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret: continue
            
        try:
            # 1. Resize (تحجيم الصورة)
            height, width = frame.shape[:2]
            target_width = 480 
            if width > target_width:
                scale = target_width / float(width)
                new_h = int(height * scale)
                frame = cv2.resize(frame, (target_width, new_h))
            
            # 2. RGB Conversion
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # 3. Analyze (تم حذف verbose=False)
            result = DeepFace.analyze(
                frame_rgb, 
                actions=['emotion'], 
                enforce_detection=False, 
                detector_backend='opencv', 
                align=False
            )
            
            if isinstance(result, list):
                dom = result[0]['dominant_emotion']
            else:
                dom = result['dominant_emotion']
            
            if dom == 'happy': 
                emotions_count['happy'] += 1
            elif dom in ['angry', 'disgust', 'fear', 'sad']: 
                emotions_count['negative'] += 1
            else: 
                emotions_count['neutral'] += 1
                
            analyzed_count += 1
            
        except Exception as e:
            # print(f"⚠️ Error on frame {frame_idx}: {e}")
            pass
            
    cap.release()
    
    # إذا لم يتم اكتشاف أي وجه، نعيد أصفاراً لتجنب الخطأ
    if analyzed_count == 0:
        print("⚠️ No faces detected in the video.")
        return {"positive": 0, "negative": 0, "neutral": 0}

    return {
        "positive": round((emotions_count['happy'] / analyzed_count) * 100, 1),
        "negative": round((emotions_count['negative'] / analyzed_count) * 100, 1),
        "neutral": round((emotions_count['neutral'] / analyzed_count) * 100, 1)
    }