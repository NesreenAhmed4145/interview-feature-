import google.generativeai as genai
import json

# 🔑 تأكدي من مفتاحك
GENAI_API_KEY = "AIzaSyBYMDUt_fCixOj6g6uaIj2QEMjMnBAqOoU" 
genai.configure(api_key=GENAI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

def generate_questions_ai(track, level, language, num_questions):
    """
    Generate an Array of random, SHORT interview questions.
    """
    prompt = f"""
    Act as an expert Technical Interviewer.
    Your task is to generate EXACTLY {num_questions} technical interview question(s) for a '{track}' developer at a '{level}' level.
    
    CRITICAL RULES:
    1. KEEP IT SHORT: Each question MUST be extremely short and direct (Maximum 1-2 sentences). Do not write long scenarios.
    2. VERBAL ANSWER ONLY: Ask them to explain a concept verbally, compare two things, or describe an approach. No code required.
    3. The questions MUST be written in this language: {language}.
    4. Output ONLY a valid JSON array of strings. No markdown, no introductions.
    
    Example format:
    ["Short question 1?", "Short question 2?"]
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.9,
                response_mime_type="application/json" # يجبره على إخراج مصفوفة JSON
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Question Error: {e}")
        # سؤال افتراضي قصير في حال الخطأ
        fallback_q = "ما هي التحديات التي واجهتك في مشروعك الأخير؟" if language == 'ar' else "What challenges did you face in your last project?"
        return [fallback_q] * int(num_questions)

def analyze_content_ai(question, user_transcript, language):
    """
    Evaluates the answer strictly in JSON format.
    """
    if not user_transcript or len(user_transcript.split()) < 3:
        return {
            "score": 0, 
            "feedback": "الإجابة قصيرة جداً أو غير مسموعة." if language == 'ar' else "Answer is too short or inaudible.", 
            "ideal_answer": "N/A", 
            "tips": ["تأكد من إعدادات الميكروفون وتحدث بوضوح" if language == 'ar' else "Check microphone and speak clearly"]
        }

    prompt = f"""
    You are an expert technical interviewer evaluating a candidate's verbal answer.
    
    Context:
    - Interview Track & Level: Technical Interview
    - The Question Asked: "{question}"
    - The Candidate's Answer (Transcribed Speech): "{user_transcript}"
    - Response Language: {language} (You MUST respond in this language)
    
    Task:
    Evaluate the candidate's spoken answer based on technical accuracy, clarity, and logical thinking.
    Keep in mind this is a spoken answer, so ignore minor grammatical errors and focus on the technical meaning.
    
    Scoring Rubric:
    - 0-30: Completely wrong or irrelevant.
    - 31-60: Partially correct but missing key technical details.
    - 61-85: Good answer, but could be more precise or structured better.
    - 86-100: Excellent, accurate, and comprehensive explanation.

    You must output your evaluation strictly as a JSON object with the following schema:
    {{
        "score": integer (0 to 100),
        "feedback": "string (Constructive feedback explaining the score)",
        "ideal_answer": "string (How an expert would explain this verbally and concisely)",
        "tips": ["string", "string", "string"] (Exactly 3 actionable tips for improvement)
    }}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3, 
                response_mime_type="application/json" 
            )
        )
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {
            "score": 0, 
            "feedback": "حدث خطأ أثناء تقييم الإجابة." if language == 'ar' else "Error analyzing content.", 
            "ideal_answer": "N/A", 
            "tips": []
        }