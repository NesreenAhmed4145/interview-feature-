import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";

// ==========================================
// 🎨 مكون الكاميرا 
// ==========================================
const VideoPreview = ({ stream, isArabic, isRecording }) => {
    const videoRef = useRef(null);
    const primaryColor = '#2b5a4a'; 
    
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', background: '#0f172a', border: isRecording ? '3px solid #ef4444' : '1px solid #e2e8f0', boxShadow: isRecording ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>
            <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: isRecording ? '#ef4444' : '#22c55e', borderRadius: '50%', animation: isRecording ? 'pulse 1s infinite' : 'none' }}></div>
                    {isRecording ? (isArabic ? "جاري التسجيل" : "Recording") : (isArabic ? "الكاميرا جاهزة" : "Camera Ready")}
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
    const primaryColor = '#2b5a4a'; 
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    const { status, startRecording, stopRecording, mediaBlobUrl, previewStream, clearBlobUrl } = useReactMediaRecorder({ 
        video: true, audio: true, askPermissionOnMount: true
    });

    // تحويل الـ URL الخاص بالفيديو إلى ملف حقيقي وإرساله للـ App.jsx
    const processVideoAndProceed = async (actionType) => {
        if (!mediaBlobUrl) return;
        setIsProcessing(true);
        const videoBlob = await fetch(mediaBlobUrl).then(r => r.blob());
        const videoFile = new File([videoBlob], `answer_${currentQuestionIndex}.mp4`, { type: "video/mp4" });
        
        if (actionType === 'next') {
            onNext(videoFile);
            clearBlobUrl(); // تفريغ الفيديو استعداداً للسؤال التالي
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
                        <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isArabic ? `السؤال ${currentQuestionIndex + 1} من ${questions?.length || 1}` : `QUESTION ${currentQuestionIndex + 1} OF ${questions?.length || 1}`}
                        </span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <h2 style={{ color: '#111827', fontSize: '1.6rem', lineHeight: '1.5', fontWeight: '700', margin: 0 }}>
                            "{questions[currentQuestionIndex]}"
                        </h2>
                    </div>
                    
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                        <h4 style={{ color: primaryColor, margin: '0 0 10px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isArabic ? 'row-reverse' : 'row', justifyContent: isArabic ? 'flex-end' : 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            {isArabic ? "تعليمات هامة" : "Important Instructions"}
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: isArabic ? '0' : '20px', paddingRight: isArabic ? '20px' : '0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', textAlign: isArabic ? 'right' : 'left' }}>
                            <li style={{ marginBottom: '8px' }}>{isArabic ? "انظر مباشرة إلى الكاميرا أثناء الإجابة." : "Look directly at the camera while answering."}</li>
                            <li style={{ marginBottom: '8px' }}>{isArabic ? "استخدم يديك في الشرح بشكل طبيعي." : "Use hand gestures naturally to explain your points."}</li>
                            <li>{isArabic ? "تحدث بصوت واضح ومسموع." : "Speak clearly and at a moderate pace."}</li>
                        </ul>
                    </div>

                    {/* 🔥 الأزرار الجديدة 🔥 */}
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        {status !== 'recording' && status !== 'stopped' && (
                            <button onClick={startRecording} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '700', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}>
                                <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }}></div>
                                {isArabic ? "بدء الإجابة" : "Start Answer"}
                            </button>
                        )}
                        
                        {status === 'recording' && (
                            <button onClick={stopRecording} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '700', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(17, 24, 39, 0.25)' }}>
                                <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '3px' }}></div>
                                {isArabic ? "إنهاء الإجابة" : "Stop Answer"}
                            </button>
                        )}
                        
                        {status === 'stopped' && (
                            <div style={{ display: 'flex', gap: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                <button onClick={() => { clearBlobUrl(); startRecording(); }} style={{ flex: '1', padding: '16px 10px', background: '#ffffff', color: '#4b5563', border: '2px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1.05rem' }}>
                                    {isArabic ? "إعادة التسجيل" : "Retake"}
                                </button>
                                
                                {!isLastQuestion ? (
                                    <button onClick={() => processVideoAndProceed('next')} disabled={isProcessing} style={{ flex: '2', padding: '16px 10px', fontSize: '1.05rem', fontWeight: '700', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1 }}>
                                        {isArabic ? "السؤال التالي" : "Next Question"}
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                ) : (
                                    <button onClick={() => processVideoAndProceed('finish')} disabled={isProcessing} style={{ flex: '2', padding: '16px 10px', fontSize: '1.05rem', fontWeight: '700', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1 }}>
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
                        <video src={mediaBlobUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', border: `1px solid ${primaryColor}`, background: '#000' }} />
                    ) : previewStream ? (
                        <VideoPreview stream={previewStream} isArabic={isArabic} isRecording={status === 'recording'} />
                    ) : (
                        <div style={{ height: '100%', background: '#f8fafc', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '2px dashed #cbd5e1', fontWeight: '500', fontSize: '1.1rem' }}>
                            {isArabic ? "جاري تجهيز الكاميرا..." : "Loading camera..."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordingStep;