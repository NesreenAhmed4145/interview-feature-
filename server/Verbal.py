import os
import librosa
import numpy as np
import whisper

# استيراد MoviePy بشكل آمن
try:
    from moviepy import VideoFileClip
except ImportError:
    import moviepy.editor as mp
    VideoFileClip = mp.VideoFileClip

# --- تحميل الموديل مرة واحدة عند تشغيل السيرفر ---
print("Loading Whisper medium.en model... This might take a minute...")
# نستخدم medium.en لأنه ممتاز للإنجليزية
whisper_model = whisper.load_model("medium.en")
print("Whisper Model loaded successfully! 🚀")

def extract_audio_optimized(video_path, audio_path):
    try:
        video = VideoFileClip(video_path)
        video.audio.write_audiofile(
            audio_path, 
            fps=16000, 
            nbytes=2, 
            codec='pcm_s16le', 
            ffmpeg_params=["-ac", "1"], 
            logger=None
        )
        video.close()
        return True
    except Exception as e:
        print(f"Error extraction: {e}")
        return False

def analyze_audio_metrics(audio_path):
    try:
        y, sr_rate = librosa.load(audio_path, sr=None)
        duration = librosa.get_duration(y=y, sr=sr_rate)

        pitches, magnitudes = librosa.piptrack(y=y, sr=sr_rate)
        threshold = magnitudes > np.median(magnitudes)
        pitch_values = pitches[threshold]
        
        pitch_values = pitch_values[(pitch_values > 70) & (pitch_values < 400)]
        
        stability_score = "N/A"
        if len(pitch_values) > 10:
            pitch_std = np.std(pitch_values)
            if pitch_std < 15: stability_score = "Monotone (Flat)"
            elif pitch_std < 70: stability_score = "Normal (Stable)"
            else: stability_score = "Dynamic (Expressive)"
        else:
            stability_score = "No Speech Detected"

        non_silent_intervals = librosa.effects.split(y, top_db=25)
        speech_duration = 0
        for interval in non_silent_intervals:
            speech_duration += (interval[1] - interval[0]) / sr_rate
            
        silence_duration = duration - speech_duration
        pause_ratio = (silence_duration / duration) * 100 if duration > 0 else 0

        pattern_feedback = "Balanced"
        if pause_ratio > 45: pattern_feedback = "Long Pauses (Hesitant)"
        elif pause_ratio < 15: pattern_feedback = "Continuous (Rushed)"

        return {
            "duration_sec": duration,
            "voice_stability": stability_score,
            "pause_ratio": round(pause_ratio, 1),
            "speech_pattern": pattern_feedback,
            "silence_sec": round(silence_duration, 2)
        }
    except Exception as e:
        print(f"Audio Analysis Error: {e}")
        return None

# 🔥 تم تصحيح اسم الدالة لتستقبل مسار الفيديو واللغة 🔥
def analyze_audio_features(video_path, language="en"):
    temp_audio = video_path + ".wav"
    
    try:
        if not extract_audio_optimized(video_path, temp_audio):
            return {"error": "Audio extraction failed", "transcript": ""}

        # 1. تحويل الصوت لنص بواسطة Whisper
        transcript_text = ""
        try:
            # Whisper ذكي جداً، يمكنه قراءة الفيديو مباشرة، لكننا نمرر الصوت المسحوب لضمان التوافق
            result = whisper_model.transcribe(temp_audio, language="en")
            transcript_text = result["text"].strip()
            print(f"📝 Whisper Transcript: {transcript_text}") # طباعة النص للتأكد
        except Exception as e:
            print(f"❌ Whisper Transcription Error: {e}")
            transcript_text = ""

        # 2. تحليل المقاييس بواسطة Librosa
        audio_metrics = analyze_audio_metrics(temp_audio)
        
        # 3. حساب سرعة الكلام (WPM)
        wpm = 0
        wpm_feedback = "Normal"
        
        if audio_metrics and audio_metrics["duration_sec"] > 0 and transcript_text:
            words = transcript_text.split()
            word_count = len(words)
            duration_min = audio_metrics["duration_sec"] / 60
            wpm = int(word_count / duration_min)

            if wpm < 110: wpm_feedback = "Slow"
            elif wpm > 160: wpm_feedback = "Fast"
            else: wpm_feedback = "Perfect"

        return {
            "transcript": transcript_text, 
            "wpm": wpm,
            "wpm_feedback": wpm_feedback,
            "tone": audio_metrics.get("voice_stability", "N/A") if audio_metrics else "N/A",
            "pause_ratio": audio_metrics.get("pause_ratio", 0) if audio_metrics else 0,
            "speech_pattern": audio_metrics.get("speech_pattern", "N/A") if audio_metrics else "N/A",
            "duration": round(audio_metrics.get("duration_sec", 0), 2) if audio_metrics else 0
        }

    except Exception as e:
        print(f"❌ Verbal Main Error: {e}")
        return {"error": str(e), "transcript": ""}

    finally:
        if os.path.exists(temp_audio):
            try: os.remove(temp_audio)
            except: pass