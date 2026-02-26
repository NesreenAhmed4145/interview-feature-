// import React, { useState } from 'react';
// import SetupInterview from './components/SetupInterview';
// import RecordingStep from './components/RecordingStep';
// import FeedbackDashboard from './components/FeedbackDashboard';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({ track: 'Computer Science', level: 'Junior', language: 'en', numQuestions: 1 });
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
//   // حالات تخزين الإجابات والنتائج
//   const [recordedAnswers, setRecordedAnswers] = useState([]); 
//   const [allResults, setAllResults] = useState([]);
//   const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
//   const [analyzingProgress, setAnalyzingProgress] = useState(0);

//   const isArabic = formData.language === 'ar';

//   // دالة لحفظ إجابة السؤال والانتقال للتالي
//   const handleNextQuestion = (videoFile) => {
//       setRecordedAnswers(prev => [...prev, { question: questions[currentQuestionIndex], file: videoFile }]);
//       setCurrentQuestionIndex(prev => prev + 1);
//   };

//   // 🚀 الدالة المسؤولة عن إرسال الفيديوهات للباك إند (تم تبسيطها لتصبح فائقة السرعة) 🚀
//   const handleFinishAndAnalyze = async (lastVideoFile) => {
//       const finalAnswers = [...recordedAnswers, { question: questions[currentQuestionIndex], file: lastVideoFile }];
//       setRecordedAnswers(finalAnswers);
      
//       setIsAnalyzingAll(true);
//       setStep(3); // الانتقال لشاشة التحميل

//       const resultsArray = [];

//       // معالجة الفيديوهات واحداً تلو الآخر (لكي لا نضغط على الرامات)
//       for (let i = 0; i < finalAnswers.length; i++) {
//           setAnalyzingProgress(i + 1);
//           const answer = finalAnswers[i];
          
//           // دمج الفيديو والسؤال واللغة في "فورمة" واحدة
//           const form = new FormData();
//           form.append('file', answer.file);
//           form.append('question', answer.question);
//           form.append('language', formData.language);

//           try {
//               console.log(`🚀 Sending Question ${i+1} to MASTER Endpoint...`);
              
//               // 🔥 طلب واحد فقط للباك إند بدلاً من 6 طلبات 🔥
//               const response = await axios.post('http://localhost:5000/analyze/all', form);
//               const finalData = response.data;

//               // التأكد من عدم وجود خطأ قادم من السيرفر
//               if (finalData.error) {
//                   throw new Error(finalData.error);
//               }

//               // إضافة النتيجة الجاهزة مباشرة إلى المصفوفة
//               resultsArray.push({
//                   questionText: answer.question,
//                   vision: finalData.vision,
//                   speech: finalData.speech,
//                   content: finalData.content
//               });

//           } catch (err) {
//               console.error(`❌ Error analyzing question ${i+1}:`, err);
//               // دفع نتيجة فارغة في حال فشل سؤال معين حتى لا يتعطل باقي التقرير
//               resultsArray.push({ questionText: answer.question, error: true });
//           }
//       }

//       setAllResults(resultsArray);
//       setIsAnalyzingAll(false);
//   };

//   const handleStartNew = () => {
//       setStep(1);
//       setQuestions([]);
//       setRecordedAnswers([]);
//       setAllResults([]);
//       setCurrentQuestionIndex(0);
//   };

//   return (
//     <div className={`app-container ${isArabic ? 'rtl-mode' : ''}`}>
      
//       {step === 1 && (
//         <SetupInterview formData={formData} setFormData={setFormData} setQuestions={setQuestions} setStep={setStep} isArabic={isArabic} />
//       )}

//       {step === 2 && (
//         <RecordingStep 
//             questions={questions} 
//             currentQuestionIndex={currentQuestionIndex} 
//             isArabic={isArabic} 
//             onNext={handleNextQuestion}
//             onFinish={handleFinishAndAnalyze}
//         />
//       )}

//       {step === 3 && (
//           isAnalyzingAll ? (
//               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
//                   <svg style={{ animation: 'spin 1.5s linear infinite', marginBottom: '20px', color: '#2b5a4a' }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
//                   <h2 style={{ color: '#1e293b', fontSize: '1.8rem' }}>{isArabic ? "جاري تحليل المقابلة بالكامل..." : "Analyzing Entire Interview..."}</h2>
//                   <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 'bold' }}>
//                       {isArabic ? `تحليل السؤال ${analyzingProgress} من ${questions.length}` : `Analyzing Question ${analyzingProgress} of ${questions.length}`}
//                   </p>
//               </div>
//           ) : (
//               <FeedbackDashboard 
//                   allResults={allResults} 
//                   isArabic={isArabic} 
//                   handleStartNew={handleStartNew}
//               />
//           )
//       )}
//     </div>
//   );
// }

// export default App;




import React, { useState, useEffect } from 'react';
import SetupInterview from './components/SetupInterview';
import RecordingStep from './components/RecordingStep';
import FeedbackDashboard from './components/FeedbackDashboard';
import axios from 'axios';
import './App.css';

// ✨ [Menna & Roqia: Smart Loading Screen with Choice, Custom Icon, and Back Button]
const AnalyzingLoader = ({ isArabic, onStartWaiting, onSendToEmail, currentProgress, totalQuestions, onBackToSetup }) => {
    const primaryColor = '#58A492'; 
    const darkGreen = '#2F5D54';    

    const [viewState, setViewState] = useState('choice'); 
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSendingEmailReq, setIsSendingEmailReq] = useState(false);

    const handleStartWaiting = () => {
        setViewState('wait');
        onStartWaiting(); 
    };

    const handleSubmitEmail = async () => {
        if (!email.includes('@')) {
            alert(isArabic ? "الرجاء إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
            return;
        }
        setIsSendingEmailReq(true);
        await onSendToEmail(email); 
        setIsSendingEmailReq(false);
        setIsSubmitted(true);
    };

    return (
        <div style={{
            // ✨ [Menna & Roqia: Removed redundant background and border-radius so it blends perfectly with the global page background]
            minHeight: '80vh', display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', 
            fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px'
        }}>

            {/* 1. شاشة الاختيار */}
            {viewState === 'choice' && (
                <div style={{ 
                    backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', 
                    border: `1px solid #dbece8`, boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)', 
                    width: '100%', maxWidth: '500px', textAlign: 'center' 
                }}>
                     {/* ✨ [Menna & Roqia: Professional Checkmark SVG replacing the Party Emoji] */}
                     <h2 style={{ color: darkGreen, margin: '0 0 15px 0', fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        {isArabic ? "تم تسجيل إجاباتك بنجاح!" : "Answers recorded successfully!"}
                    </h2>
                    <p style={{ color: '#475569', marginBottom: '30px', fontSize: '1.1rem' }}>
                        {isArabic ? "كيف تفضل استلام نتيجة التحليل؟" : "How would you like to receive your analysis results?"}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button 
                            onClick={handleStartWaiting}
                            style={{ 
                                backgroundColor: primaryColor, color: '#ffffff', border: 'none', 
                                padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', 
                                fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease', 
                                boxShadow: '0 4px 10px rgba(88, 164, 146, 0.3)' 
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = darkGreen; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
                        >
                            {/* ✨ [Menna & Roqia: Clean Clock/Timer SVG replacing the Hourglass Emoji] */}
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 15 15"></polyline>
                                </svg>
                                {isArabic ? "الانتظار لمشاهدة التحليل الآن" : "Wait for Analysis Now"}
                            </span>
                        </button>

                        <button 
                            onClick={() => setViewState('email')}
                            style={{ 
                                backgroundColor: '#ffffff', color: darkGreen, border: `2px solid ${darkGreen}`, 
                                padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', 
                                fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s ease' 
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                           {/* ✨ [Menna & Roqia: Clean Envelope SVG replacing the Mail Emoji] */}
                           <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                {isArabic ? "إرسال التقرير إلى بريدي الإلكتروني" : "Send report to email"}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* 2. شاشة الانتظار */}
            {viewState === 'wait' && (
                <>
                    <div style={{
                        width: '60px', height: '60px', border: `6px solid #dbece8`, 
                        borderTop: `6px solid ${primaryColor}`, borderRadius: '50%', 
                        animation: 'spin 1s linear infinite', marginBottom: '20px'
                    }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

                    <h2 style={{ color: darkGreen, fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>
                        {isArabic ? "جاري تحليل أدائك بالذكاء الاصطناعي..." : "Analyzing your performance..."}
                    </h2>
                    
                    <p style={{ color: primaryColor, fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                        {isArabic ? `تحليل السؤال ${currentProgress} من ${totalQuestions}` : `Analyzing Question ${currentProgress} of ${totalQuestions}`}
                    </p>

                    <p style={{ color: '#64748b', fontSize: '1.1rem', textAlign: 'center' }}>
                        {isArabic ? "قد يستغرق هذا بضع دقائق." : "This might take a few minutes."}
                    </p>
                </>
            )}

            {/* 3. شاشة إدخال الإيميل ورسالة النجاح */}
            {viewState === 'email' && (
                <div style={{ 
                    backgroundColor: '#ffffff', padding: '40px 30px', borderRadius: '16px', 
                    border: `1px solid #dbece8`, boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)', 
                    width: '100%', maxWidth: '450px', textAlign: 'center' 
                }}>
                    {isSubmitted ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* ✨ [Menna & Roqia: Clean SVG Checkmark inside a circle] */}
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 12.5l3 3 5-6"></path>
                            </svg>
                            
                            <h3 style={{ color: darkGreen, margin: '0 0 10px 0', fontSize: '1.5rem' }}>
                                {isArabic ? "تم استلام طلبك بنجاح!" : "Request received!"}
                            </h3>
                            <p style={{ color: '#475569', margin: '0 0 25px 0', fontSize: '1rem', lineHeight: '1.6' }}>
                                {isArabic ? "سيقوم النظام بتحليل أدائك وإرسال النتيجة إلى بريدك فور اكتمالها." : "The system will analyze your performance and email the results once complete."}
                            </p>

                            <button 
                                onClick={onBackToSetup}
                                style={{
                                    backgroundColor: primaryColor, color: '#ffffff', border: 'none',
                                    padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                                    cursor: 'pointer', transition: 'all 0.2s ease', width: '100%',
                                    boxShadow: '0 4px 10px rgba(88, 164, 146, 0.3)'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = darkGreen; }}
                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
                            >
                                {isArabic ? "إعداد مقابلة جديدة" : "Setup New Interview"}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h4 style={{ color: darkGreen, margin: '0 0 5px 0', textAlign: isArabic ? 'right' : 'left', fontSize: '1.1rem' }}>
                                {isArabic ? "أدخل بريدك الإلكتروني:" : "Enter your email:"}
                            </h4>
                            <input 
                                type="email" 
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 15px', borderRadius: '8px', border: '1px solid #cbd5e1',
                                    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr',
                                    backgroundColor: '#f8fafc'
                                }}
                            />
                            <button 
                                onClick={handleSubmitEmail}
                                disabled={isSendingEmailReq}
                                style={{
                                    backgroundColor: primaryColor, color: '#ffffff', border: 'none',
                                    padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                                    cursor: isSendingEmailReq ? 'wait' : 'pointer', transition: 'all 0.2s ease', width: '100%',
                                    opacity: isSendingEmailReq ? 0.7 : 1, marginTop: '5px'
                                }}
                                onMouseOver={(e) => { if(!isSendingEmailReq) e.currentTarget.style.backgroundColor = darkGreen; }}
                                onMouseOut={(e) => { if(!isSendingEmailReq) e.currentTarget.style.backgroundColor = primaryColor; }}
                            >
                                {isSendingEmailReq ? "⏳..." : (isArabic ? "تأكيد الإرسال" : "Confirm")}
                            </button>
                            
                            <button 
                                onClick={() => setViewState('choice')}
                                disabled={isSendingEmailReq}
                                style={{ marginTop: '5px', backgroundColor: 'transparent', color: '#64748b', border: 'none', textDecoration: 'underline', fontSize: '0.95rem', cursor: 'pointer' }}
                            >
                                {isArabic ? "الرجوع للاختيارات" : "Back to options"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ track: 'Computer Science', level: 'Junior', language: 'en', numQuestions: 1 });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [recordedAnswers, setRecordedAnswers] = useState([]); 
  const [allResults, setAllResults] = useState([]);
  
  const [showLoaderOptions, setShowLoaderOptions] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  const isArabic = formData.language === 'ar';

  // ✨ [Menna & Roqia: Force the HTML and Body tags to adopt the background color globally]
  useEffect(() => {
      document.documentElement.style.backgroundColor = '#F0F7F5';
      document.body.style.backgroundColor = '#F0F7F5';
      document.body.style.margin = '0';
      return () => {
          document.documentElement.style.backgroundColor = '';
          document.body.style.backgroundColor = '';
      };
  }, []);

  const handleNextQuestion = (videoFile) => {
      setRecordedAnswers(prev => [...prev, { question: questions[currentQuestionIndex], file: videoFile }]);
      setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleFinishRecording = (lastVideoFile) => {
      const finalAnswers = [...recordedAnswers, { question: questions[currentQuestionIndex], file: lastVideoFile }];
      setRecordedAnswers(finalAnswers);
      setShowLoaderOptions(true);
      setStep(3); 
  };

  const startSequentialAnalysis = async () => {
      const resultsArray = [];

      for (let i = 0; i < recordedAnswers.length; i++) {
          setAnalyzingProgress(i + 1);
          const answer = recordedAnswers[i];
          
          const form = new FormData();
          form.append('file', answer.file);
          form.append('question', answer.question);
          form.append('language', formData.language);

          try {
              console.log(`🚀 Sending Question ${i+1} to MASTER Endpoint...`);
              const response = await axios.post('http://localhost:5000/analyze/all', form);
              
              if (response.data.error) throw new Error(response.data.error);

              resultsArray.push({
                  questionText: answer.question,
                  vision: response.data.vision,
                  speech: response.data.speech,
                  content: response.data.content
              });

          } catch (err) {
              console.error(`❌ Error analyzing question ${i+1}:`, err);
              resultsArray.push({ questionText: answer.question, error: true });
          }
      }

      setAllResults(resultsArray);
      setShowLoaderOptions(false); 
  };

  const handleSendToEmailAPI = async (userEmail) => {
      try {
          const bulkForm = new FormData();
          bulkForm.append('email', userEmail);
          bulkForm.append('language', formData.language);
          
          recordedAnswers.forEach((ans, index) => {
              bulkForm.append(`video_${index}`, ans.file);
              bulkForm.append(`question_${index}`, ans.question);
          });

          console.log(`📨 Sending all data to backend for background processing for email: ${userEmail}`);
          await axios.post('http://localhost:5000/api/analyze/background', bulkForm);
          
      } catch (err) {
          console.error("❌ Error sending background task to backend:", err);
          alert("Error communicating with server.");
      }
  };

  const handleStartNew = () => {
      setStep(1);
      setQuestions([]);
      setRecordedAnswers([]);
      setAllResults([]);
      setCurrentQuestionIndex(0);
      setShowLoaderOptions(false);
      setAnalyzingProgress(0);
  };

  return (
    // ✨ [Menna & Roqia: Added minHeight and backgroundColor directly to the root container to ensure 100% coverage]
    <div className={`app-container ${isArabic ? 'rtl-mode' : ''}`} style={{ minHeight: '100vh', backgroundColor: '#F0F7F5' }}>
      
      {step === 1 && (
        <SetupInterview formData={formData} setFormData={setFormData} setQuestions={setQuestions} setStep={setStep} isArabic={isArabic} />
      )}

      {step === 2 && (
        <RecordingStep 
            questions={questions} 
            currentQuestionIndex={currentQuestionIndex} 
            isArabic={isArabic} 
            onNext={handleNextQuestion}
            onFinish={handleFinishRecording} 
        />
      )}

      {step === 3 && (
          showLoaderOptions ? (
              <AnalyzingLoader 
                  isArabic={isArabic} 
                  onStartWaiting={startSequentialAnalysis} 
                  onSendToEmail={handleSendToEmailAPI}     
                  currentProgress={analyzingProgress}
                  totalQuestions={questions.length}
                  onBackToSetup={handleStartNew} 
              />
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