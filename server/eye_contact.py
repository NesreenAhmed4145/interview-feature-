import cv2
import mediapipe as mp
import math

class EyeContactDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.target_width = 480 
        self.total_processed_frames = 0
        self.focused_frames = 0

    def _get_landmark_point(self, landmarks, idx, w, h):
        point = landmarks[idx]
        return int(point.x * w), int(point.y * h)

    def _euclidean_distance(self, p1, p2):
        x1, y1 = p1
        x2, y2 = p2
        return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

    def _get_eye_ratio(self, mesh_points, w, h, eye_indices):
        p_right = self._get_landmark_point(mesh_points, eye_indices[0], w, h)
        p_left = self._get_landmark_point(mesh_points, eye_indices[1], w, h)
        p_top = self._get_landmark_point(mesh_points, eye_indices[2], w, h)
        p_bottom = self._get_landmark_point(mesh_points, eye_indices[3], w, h)
        p_iris = self._get_landmark_point(mesh_points, eye_indices[4], w, h)

        width = self._euclidean_distance(p_iris, p_right) + self._euclidean_distance(p_iris, p_left)
        height = self._euclidean_distance(p_iris, p_top) + self._euclidean_distance(p_iris, p_bottom)
        
        if width == 0 or height == 0: return None, None
        return self._euclidean_distance(p_iris, p_right) / width, self._euclidean_distance(p_iris, p_top) / height

    def process_frame_data(self, frame):
        h, w, _ = frame.shape
        scale = self.target_width / w
        new_height = int(h * scale)
        frame = cv2.resize(frame, (self.target_width, new_height))
        h, w, _ = frame.shape
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        is_focused = False

        if results.multi_face_landmarks:
            mesh_points = results.multi_face_landmarks[0].landmark
            
            left_h, left_v = self._get_eye_ratio(mesh_points, w, h, [362, 263, 386, 374, 473])
            right_h, right_v = self._get_eye_ratio(mesh_points, w, h, [33, 133, 159, 145, 468])

            if left_h and right_h:
                avg_horiz = (left_h + right_h) / 2
                avg_vert = (left_v + right_v) / 2
                
                is_center_horiz = 0.35 < avg_horiz < 0.65
                is_center_vert = 0.30 < avg_vert < 0.60

                if is_center_horiz and is_center_vert:
                    is_focused = True
            
            self.total_processed_frames += 1
            if is_focused:
                self.focused_frames += 1

    def get_final_report(self):
        score = 0
        if self.total_processed_frames > 0:
            score = int((self.focused_frames / self.total_processed_frames) * 100)
        
        grade = ""
        advice = ""
        
        if score >= 90:
            grade = "EXCELLENT"
            advice = "Perfect eye contact! You showed great confidence."
        elif 50 <= score < 90:
            grade = "GOOD"
            advice = "Good job! Try to minimize looking away when thinking."
        else:
            grade = "NEEDS IMPROVEMENT"
            advice = "You looked away frequently. Try to look at the camera lens more often."
            
        # 🔥 CRITICAL FIX: Return a Dictionary, NOT a Tuple
        return {
            "score": score, 
            "grade": grade, 
            "advice": advice
        }

# Wrapper function used by main.py
def analyze_eye_contact(video_path):
    detector = EyeContactDetector()
    cap = cv2.VideoCapture(video_path)
    
    frame_index = 0
    PROCESS_EVERY_N_FRAMES = 5

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            if frame_index % PROCESS_EVERY_N_FRAMES == 0:
                detector.process_frame_data(frame)
            
            frame_index += 1
    finally:
        cap.release()

    return detector.get_final_report()