from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import asyncio

# --- استيراد الملفات ---
from master_vision import analyze_vision_single_pass # 👈 استيراد الملف المجمع الجديد
from Verbal import analyze_audio_features 
from gemini_service import generate_questions_ai, analyze_content_ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def save_temp_file(file: UploadFile):
    unique_filename = f"temp_{uuid.uuid4()}.mp4"
    with open(unique_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return unique_filename

@app.post("/generate-question")
async def api_gen_question(track: str = Form(...), level: str = Form(...), language: str = Form(...), num_questions: int = Form(1)):
    questions_list = generate_questions_ai(track, level, language, num_questions)
    return {"questions": questions_list} 

# 🚀 المسار الشامل (الذي يجمع كل شيء بطلب واحد) 🚀
@app.post("/analyze/all")
async def api_analyze_all(file: UploadFile = File(...), question: str = Form(...), language: str = Form(...)):
    path = save_temp_file(file)
    
    try:
        # 1. تشغيل تحليل الرؤية (يعمل Single Pass) وتحليل الصوت (يعمل على ملف Audio) بالتوازي لسرعة مضاعفة
        vision_task = asyncio.to_thread(analyze_vision_single_pass, path)
        speech_task = asyncio.to_thread(analyze_audio_features, path, language)
        
        vision_res, speech_res = await asyncio.gather(vision_task, speech_task)
        
        # 2. تحليل المحتوى باستخدام الذكاء الاصطناعي
        transcript = speech_res.get("transcript", "")
        if transcript:
            content_res = analyze_content_ai(question, transcript, language)
        else:
            content_res = {
                "score": 0, "feedback": "No speech detected.", "tips": ["Speak louder"], "ideal_answer": "N/A"
            }
        
        # 3. إرجاع النتيجة للفرونت إند (مقسمة بنفس الشكل الذي يتوقعه App.jsx)
        return {
            "vision": {
                "emotions": vision_res["emotions"],
                "body": vision_res["body"],
                "hand": vision_res["hand"],
                "attire": vision_res["attire"],
                "eye_contact": vision_res["eye_contact"],
                "head_focus": vision_res["head_focus"]
            },
            "speech": speech_res,
            "content": content_res
        }

    except Exception as e:
        print(f"❌ Core Error: {e}")
        return {"error": str(e)}

    finally:
        # 4. مسح الفيديو بأمان بعد الانتهاء
        try:
            import time
            time.sleep(1)
            if os.path.exists(path): os.remove(path)
        except Exception as e:
            print(f"⚠️ Could not delete temp file {path}. Moving on...")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Master Server Running on Port 5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)