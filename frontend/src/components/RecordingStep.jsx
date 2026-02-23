import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";

// ✨ [Menna & Roqia: Helper function to format seconds into MM:SS]
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// ==========================================
// 🎨 مكون الكاميرا 
// ==========================================
const VideoPreview = ({ stream, isArabic, isRecording, timeLeft }) => {
    const videoRef = useRef(null);
    const primaryColor = '#58A492'; // لون النعناع
    const darkGreen = '#2F5D54';    // الأخضر الغامق
    
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', background: '#0f172a', border: isRecording ? `3px solid ${darkGreen}` : '1px solid #dbece8', boxShadow: isRecording ? '0 0 0 4px rgba(47, 93, 84, 0.2)' : '0 4px 20px rgba(47, 93, 84, 0.08)', transition: 'all 0.3s ease' }}>
            <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(47, 93, 84, 0.8)', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: isRecording ? darkGreen : primaryColor, borderRadius: '50%', animation: isRecording ? 'pulse 1s infinite' : 'none' }}></div>
                    
                    {/* ✨ [Menna & Roqia: Separated the timer in a fixed-width span to stop jumping] */}
                    {isRecording ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{isArabic ? "جاري التسجيل" : "Recording"}</span>
                            <span style={{ display: 'inline-block', minWidth: '45px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                                ({formatTime(timeLeft)})
                            </span>
                        </div>
                    ) : (
                        <span>{isArabic ? "الكاميرا جاهزة" : "Camera Ready"}</span>
                    )}

                </div>
                <div style={{ position: 'absolute', top: '5%', left: '5%', right: '5%', bottom: '12%', border: '3px dashed rgba(255, 255, 255, 0.6)', borderRadius: '16px' }}></div>
                <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
                    <span style={{ background: primaryColor, color: '#ffffff', padding: '8px 20px', borderRadius: '25px', fontSize: '0.95rem', fontWeight: '500', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                        {isArabic ? "💡 اجعل الجزء العلوي من جسمك داخل الإطار" : "💡 Keep your upper body within the frame"}
                    </span>
                </div>
            </div>
            <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
        </div>
    );
};

// ==========================================
// 🚀 المكون الرئيسي للخطوة
// ==========================================
const RecordingStep = ({ questions, currentQuestionIndex, isArabic, onNext, onFinish }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    // ✨ [Menna & Roqia: State for countdown timer (60 seconds = 1 min)]
    const [timeLeft, setTimeLeft] = useState(60);
    
    // 🎨 باليت ألوان الموقع المعتمدة
    const primaryColor = '#58A492'; // النعناع 
    const darkGreen = '#2F5D54';    // الأخضر الغامق 
    const bgColor = '#F0F7F5';      // الأوف وايت المخضر 

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    const { status, startRecording, stopRecording, mediaBlobUrl, previewStream, clearBlobUrl } = useReactMediaRecorder({ 
        video: true, audio: true, askPermissionOnMount: true
    });

    // ✨ [Menna & Roqia: Timer logic to stop automatically at 0]
    useEffect(() => {
        let timerInterval;

        if (status === 'recording' && timeLeft > 0) {
            timerInterval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && status === 'recording') {
            stopRecording(); // Auto stop when time is up
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [status, timeLeft, stopRecording]);

    // ✨ [Menna & Roqia: Wrapper to ensure timer resets to 60 on start]
    const handleStartRecording = () => {
        setTimeLeft(60);
        startRecording();
    };

    // جعل خلفية الصفحة بالكامل باللون الأوف وايت المخضر
    useEffect(() => {
        document.body.style.backgroundColor = bgColor;
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    // تحويل الـ URL الخاص بالفيديو إلى ملف حقيقي وإرساله للـ App.jsx
    const processVideoAndProceed = async (actionType) => {
        if (!mediaBlobUrl) return;
        setIsProcessing(true);
        const videoBlob = await fetch(mediaBlobUrl).then(r => r.blob());
        const videoFile = new File([videoBlob], `answer_${currentQuestionIndex}.mp4`, { type: "video/mp4" });
        
        if (actionType === 'next') {
            onNext(videoFile);
            clearBlobUrl(); // تفريغ الفيديو استعداداً للسؤال التالي
            setTimeLeft(60); // ✨ [Menna & Roqia: Reset timer for the next question]
        } else {
            onFinish(videoFile);
        }
        setIsProcessing(false);
    };

    return (
        <div style={{ textAlign: 'center', maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'stretch', height: '750px', flexDirection: isArabic ? 'row-reverse' : 'row', marginBottom: '30px' }}>
                
                {/* ⬅️ القسم الجانبي */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: isArabic ? 'right' : 'left', paddingTop: '20px', paddingBottom: '20px' }}>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ color: primaryColor, fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isArabic ? `السؤال ${currentQuestionIndex + 1} من ${questions?.length || 1}` : `QUESTION ${currentQuestionIndex + 1} OF ${questions?.length || 1}`}
                        </span>
                    </div>

                    {/* صندوق عرض السؤال */}
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: `2px solid ${primaryColor}`, boxShadow: '0 4px 15px rgba(88, 164, 146, 0.1)', marginBottom: '20px' }}>
                        <h2 style={{ color: darkGreen, fontSize: '1.6rem', lineHeight: '1.5', fontWeight: '700', margin: 0 }}>
                            "{questions[currentQuestionIndex]}"
                        </h2>
                    </div>
                    
                    {/* صندوق التعليمات */}
                    <div style={{ background: '#ffffff', border: 'none', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)' }}>
                        <h4 style={{ color: primaryColor, margin: '0 0 10px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isArabic ? 'row-reverse' : 'row', justifyContent: isArabic ? 'flex-end' : 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            {isArabic ? "تعليمات هامة" : "Important Instructions"}
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: isArabic ? '0' : '20px', paddingRight: isArabic ? '20px' : '0', color: darkGreen, fontSize: '0.95rem', lineHeight: '1.6', textAlign: isArabic ? 'right' : 'left', fontWeight: '500' }}>
                            <li style={{ marginBottom: '8px' }}>{isArabic ? "لديك دقيقة واحدة فقط للإجابة." : "You have exactly 1 minute to answer."}</li>
                            <li style={{ marginBottom: '8px' }}>{isArabic ? "انظر مباشرة إلى الكاميرا أثناء الإجابة." : "Look directly at the camera while answering."}</li>
                            <li>{isArabic ? "استخدم يديك في الشرح بشكل طبيعي." : "Use hand gestures naturally to explain your points."}</li>
                        </ul>
                    </div>

                    {/* 🔥 الأزرار 🔥 */}
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        {status !== 'recording' && status !== 'stopped' && (
                            <button onClick={handleStartRecording} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '700', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(88, 164, 146, 0.25)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkGreen} onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}>
                                <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }}></div>
                                {isArabic ? "بدء الإجابة (دقيقة واحدة)" : "Start Answer (1 Min)"}
                            </button>
                        )}
                        
                        {status === 'recording' && (
                            <button 
                                onClick={stopRecording} 
                                style={{ 
                                    width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '700', 
                                    backgroundColor: darkGreen, color: '#fff', border: 'none', borderRadius: '12px', 
                                    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', 
                                    boxShadow: '0 4px 12px rgba(47, 93, 84, 0.25)', transition: 'background-color 0.2s'
                                }} 
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f4039'} 
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = darkGreen}
                            >
                                <div style={{ width: '14px', height: '14px', background: '#ffffff', borderRadius: '3px' }}></div>
                                <span>{isArabic ? "إنهاء الإجابة" : "Stop Answer"}</span>
                                {/* ✨ [Menna & Roqia: Added fixed-width span to stop button from resizing/jumping] */}
                                <span style={{ display: 'inline-block', minWidth: '65px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                                    ({formatTime(timeLeft)})
                                </span>
                            </button>
                        )}
                        
                        {status === 'stopped' && (
                            <div style={{ display: 'flex', gap: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                <button onClick={() => { clearBlobUrl(); handleStartRecording(); }} style={{ flex: '1', padding: '16px 10px', background: '#ffffff', color: darkGreen, border: `2px solid ${primaryColor}`, borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1.05rem', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = bgColor; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                                    {isArabic ? "إعادة التسجيل" : "Retake"}
                                </button>
                                
                                {!isLastQuestion ? (
                                    <button onClick={() => processVideoAndProceed('next')} disabled={isProcessing} style={{ flex: '2', padding: '16px 10px', fontSize: '1.05rem', fontWeight: '700', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1, transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkGreen} onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}>
                                        {isArabic ? "السؤال التالي" : "Next Question"}
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                ) : (
                                    <button onClick={() => processVideoAndProceed('finish')} disabled={isProcessing} style={{ flex: '2', padding: '16px 10px', fontSize: '1.05rem', fontWeight: '700', backgroundColor: darkGreen, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                                        {isProcessing ? "⏳..." : (isArabic ? "إنهاء وتحليل المقابلة 🚀" : "Finish & Analyze 🚀")}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ➡️ القسم الرئيسي: الكاميرا */}
                <div style={{ flex: '2', height: '100%' }}> 
                    {status === 'stopped' && mediaBlobUrl ? (
                        <video src={mediaBlobUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', border: `2px solid ${primaryColor}`, background: '#000', boxShadow: '0 4px 20px rgba(47, 93, 84, 0.15)' }} />
                    ) : previewStream ? (
                        <VideoPreview stream={previewStream} isArabic={isArabic} isRecording={status === 'recording'} timeLeft={timeLeft} />
                    ) : (
                        <div style={{ height: '100%', background: '#ffffff', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: `2px dashed ${primaryColor}`, fontWeight: '500', fontSize: '1.1rem' }}>
                            {isArabic ? "جاري تجهيز الكاميرا..." : "Loading camera..."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordingStep;