import React, { useState, useRef, useEffect, memo } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";

// ✨ Helper function to format seconds into MM:SS
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// ==========================================
// ⏱️ 1. مكون العداد الخاص بالزرار (مستقل لمنع الرعشة)
// ==========================================
const ButtonTimer = memo(({ isRecording, onTimeUp, resetKey }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        setTimeLeft(60);
    }, [resetKey]);

    useEffect(() => {
        if (!isRecording) return;
        if (timeLeft === 0) {
            onTimeUp();
            return;
        }
        const intervalId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [isRecording, timeLeft, onTimeUp]);

    return (
        <span style={{ display: 'inline-block', minWidth: '60px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.05em' }}>
            ({formatTime(timeLeft)})
        </span>
    );
});

// ==========================================
// 🎥 2. مكون الكاميرا (متجمد ومعزول كلياً لمنع الرعشة)
// ==========================================
const CameraFeed = memo(({ stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            if (videoRef.current.srcObject !== stream) {
                videoRef.current.srcObject = stream;
            }
        }
    }, [stream]);

    return (
        <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                display: 'block', 
                backgroundColor: '#0f172a',
                transform: 'translateZ(0)' // إجبار كارت الشاشة على فصل الطبقة
            }} 
        />
    );
}, (prevProps, nextProps) => prevProps.stream?.id === nextProps.stream?.id);

// ==========================================
// ⏱️ 3. مكون الطبقة الشفافة والعداد اللي فوق الكاميرا
// ==========================================
const CameraOverlay = memo(({ status, isArabic, stopRecording, resetKey, primaryColor }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        setTimeLeft(60);
    }, [resetKey]);

    useEffect(() => {
        if (status !== 'recording') return;
        if (timeLeft === 0) {
            stopRecording();
            return;
        }
        const intervalId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [status, timeLeft, stopRecording]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.15)', transform: 'translateZ(0)' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(47, 93, 84, 0.8)', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', background: status === 'recording' ? '#ef4444' : primaryColor, borderRadius: '50%' }}></div>
                {status === 'recording' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{isArabic ? "جاري التسجيل" : "Recording"}</span>
                        <span style={{ display: 'inline-block', minWidth: '45px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1em' }}>
                            ({formatTime(timeLeft)})
                        </span>
                    </div>
                ) : (
                    <span>{isArabic ? "الكاميرا جاهزة" : "Camera Ready"}</span>
                )}
            </div>
            <div style={{ position: 'absolute', top: '5%', left: '5%', right: '5%', bottom: '12%', border: '3px dashed rgba(255, 255, 255, 0.6)', borderRadius: '16px' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: primaryColor, color: '#ffffff', padding: '8px 20px', borderRadius: '25px', fontSize: '0.9rem', fontWeight: '500', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    {isArabic ? "اجعل الجزء العلوي من جسمك داخل الإطار" : "Keep your upper body within the frame"}
                </span>
            </div>
        </div>
    );
});

// ==========================================
// 🚀 4. المكون الرئيسي للخطوة
// ==========================================
const RecordingStep = ({ questions, currentQuestionIndex, isArabic, onNext, onFinish }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [retakeKey, setRetakeKey] = useState(0); 
    
    const primaryColor = '#58A492'; 
    const darkGreen = '#2F5D54';    
    const bgColor = '#F0F7F5';      

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    const { status, startRecording, stopRecording, mediaBlobUrl, previewStream, clearBlobUrl } = useReactMediaRecorder({ 
        video: true, audio: true, askPermissionOnMount: true
    });

    const handleStartRecording = () => {
        startRecording();
    };

    const handleRetake = () => {
        clearBlobUrl(); 
        setRetakeKey(prev => prev + 1); 
        handleStartRecording(); 
    };

    useEffect(() => {
        document.body.style.backgroundColor = bgColor;
        document.body.style.overflowY = 'scroll'; 
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.overflowY = '';
        };
    }, []);

    const processVideoAndProceed = async (actionType) => {
        if (!mediaBlobUrl) return;
        setIsProcessing(true);
        const videoBlob = await fetch(mediaBlobUrl).then(r => r.blob());
        const videoFile = new File([videoBlob], `answer_${currentQuestionIndex}.mp4`, { type: "video/mp4" });
        
        if (actionType === 'next') {
            onNext(videoFile);
            clearBlobUrl(); 
            setRetakeKey(prev => prev + 1); 
        } else {
            onFinish(videoFile);
        }
        setIsProcessing(false);
    };

    return (
        <div style={{ textAlign: 'center', maxWidth: '1200px', margin: '0 auto', padding: '10px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', height: '600px', flexDirection: isArabic ? 'row-reverse' : 'row', marginBottom: '20px' }}>
                
                {/* ⬅️ القسم الجانبي */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: isArabic ? 'right' : 'left', paddingTop: '10px', paddingBottom: '10px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ color: primaryColor, fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {isArabic ? `السؤال ${currentQuestionIndex + 1} من ${questions?.length || 1}` : `QUESTION ${currentQuestionIndex + 1} OF ${questions?.length || 1}`}
                            </span>
                        </div>

                        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: `2px solid ${primaryColor}`, boxShadow: '0 4px 15px rgba(88, 164, 146, 0.1)', marginBottom: '15px', boxSizing: 'border-box' }}>
                            <h2 style={{ color: darkGreen, fontSize: '1.4rem', lineHeight: '1.4', fontWeight: '700', margin: 0 }}>
                                "{questions[currentQuestionIndex]}"
                            </h2>
                        </div>
                        
                        <div style={{ background: '#ffffff', border: 'none', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)', boxSizing: 'border-box', direction: isArabic ? 'rtl' : 'ltr' }}>
                            <h4 style={{ color: primaryColor, margin: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                {isArabic ? "تعليمات هامة" : "Important Instructions"}
                            </h4>
                            <ul style={{ margin: 0, paddingInlineStart: '25px', color: darkGreen, fontSize: '0.9rem', lineHeight: '1.5', fontWeight: '500' }}>
                                <li style={{ marginBottom: '6px' }}>{isArabic ? "لديك دقيقة واحدة فقط للإجابة." : "You have exactly 1 minute to answer."}</li>
                                <li style={{ marginBottom: '6px' }}>{isArabic ? "انظر مباشرة إلى الكاميرا أثناء الإجابة." : "Look directly at the camera while answering."}</li>
                                <li>{isArabic ? "استخدم يديك في الشرح بشكل طبيعي." : "Use hand gestures naturally to explain your points."}</li>
                            </ul>
                        </div>
                    </div>

                    {/* 🔥 الأزرار 🔥 */}
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        {status !== 'recording' && status !== 'stopped' && (
                            <button onClick={handleStartRecording} style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: '700', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(88, 164, 146, 0.25)', transition: 'background-color 0.2s', boxSizing: 'border-box' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkGreen} onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}>
                                <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }}></div>
                                {isArabic ? "بدء الإجابة (دقيقة واحدة)" : "Start Answer (1 Min)"}
                            </button>
                        )}
                        
                        {status === 'recording' && (
                            <button 
                                onClick={stopRecording} 
                                style={{ 
                                    width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: '700', 
                                    backgroundColor: darkGreen, color: '#fff', border: 'none', borderRadius: '12px', 
                                    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', 
                                    boxShadow: '0 4px 12px rgba(47, 93, 84, 0.25)', transition: 'background-color 0.2s', boxSizing: 'border-box'
                                }} 
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f4039'} 
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = darkGreen}
                            >
                                <div style={{ width: '14px', height: '14px', background: '#ffffff', borderRadius: '3px' }}></div>
                                <span>{isArabic ? "إنهاء الإجابة" : "Stop Answer"}</span>
                                
                                {/* ✨ رجعنا العداد هنا أهو باستخدام المكون المستقل */}
                                <ButtonTimer 
                                    isRecording={status === 'recording'} 
                                    onTimeUp={stopRecording} 
                                    resetKey={retakeKey} 
                                />
                            </button>
                        )}
                        
                        {status === 'stopped' && (
                            <div style={{ display: 'flex', gap: '12px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                <button onClick={handleRetake} style={{ flex: '1', padding: '14px 10px', background: '#ffffff', color: darkGreen, border: `2px solid ${primaryColor}`, borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = bgColor; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}>
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                    </svg>
                                    {isArabic ? "إعادة" : "Retake"}
                                </button>
                                
                                {!isLastQuestion ? (
                                    <button onClick={() => processVideoAndProceed('next')} disabled={isProcessing} style={{ flex: '2', padding: '14px 10px', fontSize: '1rem', fontWeight: '700', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1, transition: 'background-color 0.2s', boxSizing: 'border-box' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkGreen} onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}>
                                        {isArabic ? "السؤال التالي" : "Next Question"}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                ) : (
                                    <button onClick={() => processVideoAndProceed('finish')} disabled={isProcessing} style={{ flex: '2', padding: '14px 10px', fontSize: '1rem', fontWeight: '700', backgroundColor: darkGreen, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1, transition: 'opacity 0.2s', boxSizing: 'border-box' }}
                                     onMouseOver={(e) =>{ e.currentTarget.style.backgroundColor = darkGreen; }} 
                                     onMouseOut={(e) => {e.currentTarget.style.backgroundColor = primaryColor; }}
                                     >
                                        {isProcessing ? (
                                            <>
                                                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                                                {isArabic ? "جاري المعالجة..." : "Processing..."}
                                            </>
                                        ) : (
                                            <>
                                                {isArabic ? "إنهاء وتحليل المقابلة" : "Finish & Analyze"}
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}>
                                                    <path d="M5 12h14"></path>
                                                    <path d="m12 5 7 7-7 7"></path>
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ➡️ القسم الرئيسي: الكاميرا */}
                <div style={{ flex: '2', height: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#0f172a', border: status === 'recording' ? `3px solid ${darkGreen}` : '1px solid #dbece8', boxSizing: 'border-box' }}> 
                    
                    {status === 'stopped' && mediaBlobUrl ? (
                        <video src={mediaBlobUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
                    ) : previewStream ? (
                        <>
                            <CameraFeed stream={previewStream} />
                            
                            <CameraOverlay 
                                status={status} 
                                isArabic={isArabic} 
                                stopRecording={stopRecording} 
                                resetKey={retakeKey} 
                                primaryColor={primaryColor} 
                            />
                        </>
                    ) : (
                        <div style={{ height: '100%', background: '#ffffff', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', justifyContent: 'center', fontWeight: '500', fontSize: '1.1rem' }}>
                            <svg style={{ animation: 'spin 1.5s linear infinite', color: primaryColor }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                            {isArabic ? "جاري تجهيز الكاميرا..." : "Loading camera..."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordingStep;