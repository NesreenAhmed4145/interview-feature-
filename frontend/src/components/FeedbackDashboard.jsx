import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const renderBadge = (label, value, colorHex) => (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '6px 16px', fontSize: '0.9rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        {label} <span style={{ color: colorHex, fontWeight: 'bold' }}>{value}</span>
    </div>
);

const DetailedAnalysisCard = ({ icon, title, value, score, colorHex, tip, isArabic }) => {
    const safeScore = parseInt(score) || 0;
    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${colorHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: colorHex }}>{icon}</div>
                    <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{title}</strong>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: colorHex }}>{value}</div>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '50px', overflow: 'hidden', marginBottom: '15px', direction: 'ltr' }}>
                <div style={{ width: `${safeScore}%`, height: '100%', backgroundColor: colorHex, borderRadius: '50px' }}></div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: '1.1rem' }}>💡</span><span style={{ color: '#475569', fontSize: '0.9rem' }}>{tip}</span>
            </div>
        </div>
    );
};

const SquareCard = ({ icon, label, value, subLabel, colorHex, isCircular = false }) => {
    const safeValue = value || 0;
    const numValue = parseInt(safeValue) || 0;
    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '25px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '200px' }}>
            <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: `${colorHex}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', color: colorHex, marginBottom: '15px' }}>{icon}</div>
            <div style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '600', marginBottom: '15px' }}>{label}</div>
            {isCircular ? (
                <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: `conic-gradient(${colorHex} ${numValue}%, #f1f5f9 ${numValue}%)`, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '70px', height: '70px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>
                        {safeValue}{typeof safeValue === 'number' || !isNaN(safeValue) ? '%' : ''}
                    </div>
                </div>
            ) : (<div style={{ fontSize: '2rem', fontWeight: 'bold', color: colorHex, marginBottom: '10px' }}>{safeValue}</div>)}
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 'auto' }}>{subLabel}</div>
        </div>
    );
};

const FeedbackDashboard = ({ allResults, isArabic, handleStartNew }) => {
    // 🌟 حالة جديدة للتنقل بين الأسئلة 🌟
    const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
    const [activeTab, setActiveTab] = useState('vision');
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef();
    const primaryColor = '#2b5a4a';

    const handleExportPDF = async () => {
        const element = reportRef.current;
        if (!element) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', [210, (canvas.height * 210) / canvas.width]);
            pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
            pdf.save(`Interview_Report_Q${selectedQuestionIdx + 1}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to export PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    // جلب نتيجة السؤال المحدد حالياً
    const currentResult = allResults[selectedQuestionIdx] || {};
    
    if (currentResult.error) {
        return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>Error analyzing this specific question.</div>;
    }

    const b = currentResult.vision?.body || {};
    const h = currentResult.vision?.hand || {};
    const attireStatus = currentResult.vision?.attire?.status || "Casual";
    const isFormal = attireStatus.toLowerCase().includes('formal');
    const eye = currentResult.vision?.eye_contact || {};
    const head = currentResult.vision?.head_focus || {};
    const face = currentResult.vision?.emotions || {};
    const s = currentResult.speech || {};

    const strScore = b.straight_score || 0;
    let balanceNum = parseInt((b.posture_balance || "0%").replace('%', '')) || 0;
    balanceNum = Math.min(100, Math.max(0, balanceNum));
    const opennessRaw = b.body_openness || "Normal";
    const opennessScore = opennessRaw === "Open" ? 100 : (opennessRaw === "Normal" ? 50 : 30);
    const overallConfidence = Math.round(((b.engagement_score || 0) + strScore + balanceNum + (h.open_score || 0)) / 4) || 0;

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* 🌟 شريط التنقل بين الأسئلة (Question Navigator) 🌟 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                {allResults.map((_, index) => (
                    <button 
                        key={index}
                        onClick={() => setSelectedQuestionIdx(index)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: selectedQuestionIdx === index ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
                            backgroundColor: selectedQuestionIdx === index ? primaryColor : '#ffffff',
                            color: selectedQuestionIdx === index ? '#ffffff' : '#475569',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {isArabic ? `السؤال ${index + 1}` : `Question ${index + 1}`}
                    </button>
                ))}
            </div>

            <div className="control-bar" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'vision' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>👤 {isArabic ? "لغة الجسد" : "Body"}</button>
                <button className={`tab-btn ${activeTab === 'eye' ? 'active' : ''}`} onClick={() => setActiveTab('eye')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'eye' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>👁️ {isArabic ? "التواصل البصري" : "Eye Contact"}</button>
                <button className={`tab-btn ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'face' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>😊 {isArabic ? "تعابير الوجه" : "Face"}</button>
                <button className={`tab-btn ${activeTab === 'speech' ? 'active' : ''}`} onClick={() => setActiveTab('speech')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'speech' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>🎙️ {isArabic ? "الصوت" : "Speech"}</button>
                <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'content' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>🧠 {isArabic ? "المحتوى" : "Content"}</button>
            </div>

            <div className="result-content" ref={reportRef} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                
                {/* طباعة نص السؤال المختار أعلى التقرير */}
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${primaryColor}`, marginBottom: '30px', textAlign: isArabic ? 'right' : 'left' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>"{currentResult.questionText}"</h3>
                </div>

                {activeTab === 'vision' && (
                    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                            <h3 style={{ fontSize: '1.4rem', color: '#111827', margin: 0 }}>{isArabic ? "تحليل لغة الجسد والمظهر" : "Body Language & Attire"}</h3>
                            {renderBadge(isArabic ? 'نسبة الثقة:' : 'Confidence:', `${overallConfidence}%`, '#16a34a')}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '30px', flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                            <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column' }}>
                                <DetailedAnalysisCard icon="🔥" title={isArabic ? 'التفاعل العام' : 'Engagement'} value={`${b.engagement_score || 0}%`} score={b.engagement_score} colorHex={b.engagement_score >= 50 ? '#22c55e' : '#f97316'} tip={isArabic ? "كن حيوياً." : "Be energetic."} isArabic={isArabic} />
                                <DetailedAnalysisCard icon="⚡" title={isArabic ? 'إيماءات الشرح' : 'Gestures'} value={`${b.explaining_score || 0}%`} score={b.explaining_score} colorHex="#a855f7" tip={isArabic ? "استخدم يديك." : "Use hands."} isArabic={isArabic} />
                                <DetailedAnalysisCard icon="🪑" title={isArabic ? 'استقامة الجلوس' : 'Posture'} value={`${strScore}%`} score={strScore} colorHex="#3b82f6" tip={isArabic ? "اجلس مستقيماً." : "Sit straight."} isArabic={isArabic} />
                                <DetailedAnalysisCard icon="⚖️" title={isArabic ? 'توازن الجسم' : 'Balance'} value={`${balanceNum}%`} score={balanceNum} colorHex="#0ea5e9" tip={isArabic ? "حافظ على استقرارك." : "Keep stable."} isArabic={isArabic} />
                            </div>

                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <SquareCard icon='🖐️' label={isArabic ? 'مفتوحة' : 'Open'} value={h.open_score || 0} subLabel={isArabic ? 'تبني الثقة' : 'Trust'} colorHex='#10b981' isCircular={true} />
                                    <SquareCard icon='✊' label={isArabic ? 'مغلقة' : 'Closed'} value={h.clasped_score || 0} subLabel={isArabic ? 'توحي بالتوتر' : 'Nervous'} colorHex='#64748b' isCircular={true} />
                                </div>
                                <DetailedAnalysisCard icon="🙅" title={isArabic ? 'تكتيف الذراعين' : 'Crossed Arms'} value={`${b.crossed_arm_score || 0}%`} score={b.crossed_arm_score} colorHex={b.crossed_arm_score > 20 ? '#ef4444' : '#10b981'} tip={isArabic ? "تجنب التكتيف." : "Avoid crossing."} isArabic={isArabic} />
                                <DetailedAnalysisCard icon="😊" title={isArabic ? 'لمس الوجه' : 'Face Touches'} value={`${b.touch_face_score || 0}%`} score={b.touch_face_score} colorHex={b.touch_face_score > 20 ? '#ef4444' : '#10b981'} tip={isArabic ? "تجنب لمس وجهك." : "Avoid face touch."} isArabic={isArabic} />
                            </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <DetailedAnalysisCard icon="👔" title={isArabic ? 'المظهر الرسمي' : 'Formal Attire'} value={isArabic ? (isFormal ? "رسمي" : "غير رسمي") : attireStatus} score={isFormal ? 100 : 35} colorHex={isFormal ? "#22c55e" : "#f97316"} tip={isArabic ? "ارتد ملابس احترافية." : "Wear professional attire."} isArabic={isArabic} />
                        </div>
                    </div>
                )}

                {/* باقي التابات تعمل بناءً على currentResult.eye, currentResult.speech وهكذا */}
                 {activeTab === 'eye' && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <SquareCard icon='👁️' label={isArabic ? 'التواصل البصري' : 'Eye Contact'} value={eye.score} subLabel={isArabic ? 'التركيز الكلي' : 'Overall Focus'} colorHex='#0d9488' isCircular={true} />
                        <SquareCard icon='👤' label={isArabic ? 'توجيه الرأس' : 'Head Pose'} value={head.score} subLabel={isArabic ? 'النظر للكاميرا' : 'Camera Attention'} colorHex='#3b82f6' isCircular={true} />
                    </div>
                )}

                {activeTab === 'face' && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <SquareCard icon='😊' label={isArabic ? 'معدل الابتسام' : 'Smile Frequency'} value={face.positive} subLabel={isArabic ? 'الإيجابية' : 'Positivity'} colorHex='#eab308' isCircular={true} />
                        <SquareCard icon='😐' label={isArabic ? 'الحالة المحايدة' : 'Neutral State'} value={face.neutral} subLabel={isArabic ? 'وجه هادئ' : 'Resting Face'} colorHex='#64748b' isCircular={true} />
                    </div>
                )}

                {activeTab === 'speech' && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <SquareCard icon='⏱️' label={isArabic ? 'سرعة التحدث' : 'Pace (WPM)'} value={s.wpm} subLabel={s.wpm_feedback} colorHex='#3b82f6' />
                        <SquareCard icon='⏸️' label={isArabic ? 'نسبة التوقف' : 'Pauses Ratio'} value={s.pause_ratio} subLabel={s.speech_pattern} colorHex='#a855f7' isCircular={true} />
                    </div>
                )}

                {activeTab === 'content' && (
                    <div style={{ textAlign: isArabic ? 'right' : 'left', padding: '20px', background: '#fff', borderRadius: '12px' }}>
                        <h3 style={{ color: '#1e293b' }}>{isArabic ? "تعليق المحتوى" : "Content Feedback"}</h3>
                        <p style={{ lineHeight: '1.8', color: '#475569' }}>{currentResult.content?.feedback}</p>
                    </div>
                )}

            </div>

            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px'}}>
                <button onClick={handleExportPDF} disabled={isDownloading} style={{ padding: '12px 30px', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isDownloading ? "⏳ Generating..." : "📄 Export PDF"}
                </button>
                <button onClick={handleStartNew} style={{ padding: '12px 30px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isArabic ? "بدء مقابلة جديدة" : "Start New Interview"}
                </button>
            </div>
        </div>
    );
};

export default FeedbackDashboard;