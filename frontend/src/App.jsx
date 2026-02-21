import React, { useState } from 'react';
import SetupInterview from './components/SetupInterview';
import RecordingStep from './components/RecordingStep';
import FeedbackDashboard from './components/FeedbackDashboard';
import axios from 'axios';
import './App.css';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ track: 'Computer Science', level: 'Junior', language: 'en', numQuestions: 1 });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // حالات تخزين الإجابات والنتائج
  const [recordedAnswers, setRecordedAnswers] = useState([]); 
  const [allResults, setAllResults] = useState([]);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  const isArabic = formData.language === 'ar';

  // دالة لحفظ إجابة السؤال والانتقال للتالي
  const handleNextQuestion = (videoFile) => {
      setRecordedAnswers(prev => [...prev, { question: questions[currentQuestionIndex], file: videoFile }]);
      setCurrentQuestionIndex(prev => prev + 1);
  };

  // 🚀 الدالة المسؤولة عن إرسال الفيديوهات للباك إند (تم تبسيطها لتصبح فائقة السرعة) 🚀
  const handleFinishAndAnalyze = async (lastVideoFile) => {
      const finalAnswers = [...recordedAnswers, { question: questions[currentQuestionIndex], file: lastVideoFile }];
      setRecordedAnswers(finalAnswers);
      
      setIsAnalyzingAll(true);
      setStep(3); // الانتقال لشاشة التحميل

      const resultsArray = [];

      // معالجة الفيديوهات واحداً تلو الآخر (لكي لا نضغط على الرامات)
      for (let i = 0; i < finalAnswers.length; i++) {
          setAnalyzingProgress(i + 1);
          const answer = finalAnswers[i];
          
          // دمج الفيديو والسؤال واللغة في "فورمة" واحدة
          const form = new FormData();
          form.append('file', answer.file);
          form.append('question', answer.question);
          form.append('language', formData.language);

          try {
              console.log(`🚀 Sending Question ${i+1} to MASTER Endpoint...`);
              
              // 🔥 طلب واحد فقط للباك إند بدلاً من 6 طلبات 🔥
              const response = await axios.post('http://localhost:5000/analyze/all', form);
              const finalData = response.data;

              // التأكد من عدم وجود خطأ قادم من السيرفر
              if (finalData.error) {
                  throw new Error(finalData.error);
              }

              // إضافة النتيجة الجاهزة مباشرة إلى المصفوفة
              resultsArray.push({
                  questionText: answer.question,
                  vision: finalData.vision,
                  speech: finalData.speech,
                  content: finalData.content
              });

          } catch (err) {
              console.error(`❌ Error analyzing question ${i+1}:`, err);
              // دفع نتيجة فارغة في حال فشل سؤال معين حتى لا يتعطل باقي التقرير
              resultsArray.push({ questionText: answer.question, error: true });
          }
      }

      setAllResults(resultsArray);
      setIsAnalyzingAll(false);
  };

  const handleStartNew = () => {
      setStep(1);
      setQuestions([]);
      setRecordedAnswers([]);
      setAllResults([]);
      setCurrentQuestionIndex(0);
  };

  return (
    <div className={`app-container ${isArabic ? 'rtl-mode' : ''}`}>
      
      {step === 1 && (
        <SetupInterview formData={formData} setFormData={setFormData} setQuestions={setQuestions} setStep={setStep} isArabic={isArabic} />
      )}

      {step === 2 && (
        <RecordingStep 
            questions={questions} 
            currentQuestionIndex={currentQuestionIndex} 
            isArabic={isArabic} 
            onNext={handleNextQuestion}
            onFinish={handleFinishAndAnalyze}
        />
      )}

      {step === 3 && (
          isAnalyzingAll ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                  <svg style={{ animation: 'spin 1.5s linear infinite', marginBottom: '20px', color: '#2b5a4a' }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  <h2 style={{ color: '#1e293b', fontSize: '1.8rem' }}>{isArabic ? "جاري تحليل المقابلة بالكامل..." : "Analyzing Entire Interview..."}</h2>
                  <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {isArabic ? `تحليل السؤال ${analyzingProgress} من ${questions.length}` : `Analyzing Question ${analyzingProgress} of ${questions.length}`}
                  </p>
              </div>
          ) : (
              <FeedbackDashboard 
                  allResults={allResults} 
                  isArabic={isArabic} 
                  handleStartNew={handleStartNew}
              />
          )
      )}
    </div>
  );
}

export default App;