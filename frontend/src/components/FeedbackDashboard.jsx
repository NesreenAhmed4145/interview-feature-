// import React, { useState, useRef } from 'react';
// import html2canvas from 'html2canvas';
// import { jsPDF } from 'jspdf';
// import OverallFeedback, { calculateScores } from './OverallFeedback';

// const renderBadge = (label, value, colorHex) => (
//     <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '6px 16px', fontSize: '0.9rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
//         {label} <span style={{ color: colorHex, fontWeight: 'bold' }}>{value}</span>
//     </div>
// );

// const DetailedAnalysisCard = ({ icon, title, value, score, colorHex, tip, isArabic }) => {
//     const safeScore = parseInt(score) || 0;
//     return (
//         <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '15px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                     <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${colorHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: colorHex }}>{icon}</div>
//                     <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{title}</strong>
//                 </div>
//                 <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: colorHex }}>{value}</div>
//             </div>
//             <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '50px', overflow: 'hidden', marginBottom: '15px', direction: 'ltr' }}>
//                 <div style={{ width: `${safeScore}%`, height: '100%', backgroundColor: colorHex, borderRadius: '50px' }}></div>
//             </div>
//             <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <span style={{ fontSize: '1.1rem' }}>💡</span><span style={{ color: '#475569', fontSize: '0.9rem' }}>{tip}</span>
//             </div>
//         </div>
//     );
// };

// const SquareCard = ({ icon, label, value, subLabel, colorHex, isCircular = false }) => {
//     const safeValue = value || 0;
//     const numValue = parseInt(safeValue) || 0;
//     return (
//         <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '25px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '200px' }}>
//             <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: `${colorHex}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', color: colorHex, marginBottom: '15px' }}>{icon}</div>
//             <div style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '600', marginBottom: '15px' }}>{label}</div>
//             {isCircular ? (
//                 <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: `conic-gradient(${colorHex} ${numValue}%, #f1f5f9 ${numValue}%)`, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
//                     <div style={{ width: '70px', height: '70px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>
//                         {safeValue}{typeof safeValue === 'number' || !isNaN(safeValue) ? '%' : ''}
//                     </div>
//                 </div>
//             ) : (<div style={{ fontSize: '2rem', fontWeight: 'bold', color: colorHex, marginBottom: '10px' }}>{safeValue}</div>)}
//             <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 'auto' }}>{subLabel}</div>
//         </div>
//     );
// };

// const FeedbackDashboard = ({ allResults, isArabic, handleStartNew }) => {
//     const [selectedView, setSelectedView] = useState('overall');
//     const [activeTab, setActiveTab] = useState('vision');
//     const [isDownloading, setIsDownloading] = useState(false);
//     const reportRef = useRef();
//     const primaryColor = '#2b5a4a';

//     const handleExportPDF = async () => {
//         const element = reportRef.current;
//         if (!element) return;
//         setIsDownloading(true);
//         try {
//             const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
//             const imgData = canvas.toDataURL('image/png');
//             const pdf = new jsPDF('p', 'mm', [210, (canvas.height * 210) / canvas.width]);
//             pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
//             pdf.save(`Interview_Report.pdf`);
//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             alert("Failed to export PDF.");
//         } finally {
//             setIsDownloading(false);
//         }
//     };

//     let currentResult = {};
//     let b = {}, h = {}, attireStatus = "Casual", isFormal = false, eye = {}, head = {}, face = {}, s = {};
//     let strScore = 0, balanceNum = 0, overallConfidence = 0, wordsCount = 0;
    
//     // Variables for Vision Tab Logic
//     let expScore = 0, crossedScore = 0, faceTouchScore = 0, opennessRaw = "Normal", opennessScore = 50;
//     let expTip = "", strTip = "", openTip = "", crossTip = "", touchTip = "", overallBodyAdvice = "";

//     if (selectedView !== 'overall') {
//         currentResult = allResults[selectedView] || {};
        
//         if (!currentResult.error) {
//             b = currentResult.vision?.body || {};
//             h = currentResult.vision?.hand || {};
//             attireStatus = currentResult.vision?.attire?.status || "Casual";
//             isFormal = attireStatus.toLowerCase().includes('formal');
//             eye = currentResult.vision?.eye_contact || {};
//             head = currentResult.vision?.head_focus || {};
//             face = currentResult.vision?.emotions || {};
//             s = currentResult.speech || {};

//             strScore = b.straight_score || 0;
//             balanceNum = parseInt((b.posture_balance || "0%").replace('%', '')) || 0;
//             balanceNum = Math.min(100, Math.max(0, balanceNum));

//             const transcriptText = s.transcript || "";
//             wordsCount = transcriptText.trim() === "" ? 0 : transcriptText.trim().split(/\s+/).length;
//             overallConfidence = Math.round(((b.engagement_score || 0) + strScore + balanceNum + (h.open_score || 0)) / 4) || 0;

//             // Vision Logic Processing
//             expScore = b.explaining_score || 0;
//             crossedScore = b.crossed_arm_score || 0;
//             faceTouchScore = b.touch_face_score || 0;
//             opennessRaw = b.body_openness || "Normal";
//             opennessScore = opennessRaw === "Open" ? 100 : (opennessRaw === "Normal" ? 50 : 30);

//             expTip = expScore >= 20 ? (isArabic ? "استخدام ممتاز لحركة اليدين في الشرح." : "Great use of hands to illustrate your points.") : (isArabic ? "استخدم يديك أكثر لتوضيح أفكارك." : "Use your hands more to illustrate your points.");
//             strTip = strScore >= 60 ? (isArabic ? "وضعية جلوس ممتازة وثابتة تعكس ثقتك." : "Excellent straight posture. Keep it up!") : (isArabic ? "حافظ على استقامة ظهرك لتبدو أكثر ثقة." : "Keep your back straight to look more confident.");
//             openTip = opennessRaw === "Open" ? (isArabic ? "لغة جسد منفتحة ومرحبة." : "Open and welcoming body language.") : (isArabic ? "حاول فك تشابك أطرافك لتبدو أكثر تقبلاً." : "Try to uncross limbs to look more approachable.");
//             crossTip = crossedScore > 20 ? (isArabic ? "تجنب تكتيف الذراعين لأنه يوحي بالانغلاق أو الدفاعية." : "Avoid crossing your arms as it can signal defensiveness.") : (isArabic ? "لغة جسد منفتحة وممتازة. استمر على ذلك!" : "Open and welcoming body language. Keep it up!");
//             touchTip = faceTouchScore > 20 ? (isArabic ? "تجنب لمس وجهك لأنه قد يشير للتوتر." : "Avoid touching your face as it can signal nervousness.") : (isArabic ? "تحكم ممتاز في حركة اليدين بعيداً عن الوجه." : "Good control over your hand movements.");

//             let negativeFeedbacks = [];
//             if (strScore < 50) negativeFeedbacks.push(isArabic ? "استقامة الظهر" : "sitting straight");
//             if (opennessRaw === "Closed" || crossedScore > 20) negativeFeedbacks.push(isArabic ? "تجنب الانغلاق وتكتيف الذراعين" : "avoiding crossed arms and closed posture");
//             if (faceTouchScore > 20) negativeFeedbacks.push(isArabic ? "تقليل لمس الوجه" : "reducing face touches");
//             if (expScore < 10) negativeFeedbacks.push(isArabic ? "استخدام إيماءات الشرح بثقة" : "using explaining gestures more");

//             if (negativeFeedbacks.length === 0) {
//                 overallBodyAdvice = isArabic ? "أداء مبهر! لغة جسدك كانت احترافية، منفتحة، وتعكس ثقة عالية بالنفس طوال الإجابة." : "Outstanding performance! Your body language was professional, open, and reflected high confidence.";
//             } else {
//                 overallBodyAdvice = (isArabic ? "لتحسين لغة جسدك وجعلها أكثر احترافية، ركز على: " : "To improve your body language and appear more confident, focus on: ") + negativeFeedbacks.join(isArabic ? "، و" : ", and ") + ".";
//             }
//         }
//     }

//     return (
//         <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
//             {/* Navigation Bar */}
//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                 <button 
//                     onClick={() => setSelectedView('overall')}
//                     style={{
//                         padding: '12px 25px', borderRadius: '8px',
//                         border: selectedView === 'overall' ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
//                         backgroundColor: selectedView === 'overall' ? primaryColor : '#ffffff',
//                         color: selectedView === 'overall' ? '#ffffff' : '#475569',
//                         fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
//                         boxShadow: selectedView === 'overall' ? '0 4px 6px rgba(43, 90, 74, 0.3)' : 'none'
//                     }}
//                 >
//                     {isArabic ? "التقييم العام" : "Overall Feedback"}
//                 </button>

//                 {allResults.map((_, index) => (
//                     <button 
//                         key={index}
//                         onClick={() => setSelectedView(index)}
//                         style={{
//                             padding: '12px 25px', borderRadius: '8px',
//                             border: selectedView === index ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
//                             backgroundColor: selectedView === index ? primaryColor : '#ffffff',
//                             color: selectedView === index ? '#ffffff' : '#475569',
//                             fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
//                             boxShadow: selectedView === index ? '0 4px 6px rgba(43, 90, 74, 0.3)' : 'none'
//                         }}
//                     >
//                         {isArabic ? `السؤال ${index + 1}` : `Question ${index + 1}`}
//                     </button>
//                 ))}
//             </div>

//             {/* Content Area */}
//             {selectedView === 'overall' ? (
//                 <OverallFeedback allResults={allResults} isArabic={isArabic} />
//             ) : currentResult.error ? (
//                 <div style={{textAlign: 'center', padding: '50px', color: 'red', fontSize: '1.2rem'}}>
//                     {isArabic ? "حدث خطأ أثناء تحليل هذا السؤال." : "Error analyzing this specific question."}
//                 </div>
//             ) : (
//                 <div className="question-details">
//                     <div className="control-bar" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
//                         <button className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'vision' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "لغة الجسد" : "Body"}</button>
//                         <button className={`tab-btn ${activeTab === 'eye' ? 'active' : ''}`} onClick={() => setActiveTab('eye')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'eye' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "التواصل البصري" : "Eye Contact & Head Pose "}</button>
//                         <button className={`tab-btn ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'face' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "تعابير الوجه" : "Face"}</button>
//                         <button className={`tab-btn ${activeTab === 'speech' ? 'active' : ''}`} onClick={() => setActiveTab('speech')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'speech' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "الصوت" : "Speech"}</button>
//                         <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'content' ? '#e2e8f0' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "المحتوى" : "Content"}</button>
//                     </div>

//                     <div className="result-content" ref={reportRef} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        
//                         <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${primaryColor}`, marginBottom: '30px', textAlign: isArabic ? 'right' : 'left' }}>
//                             <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>"{currentResult.questionText}"</h3>
//                         </div>

//                         {wordsCount < 3 && (
//                             <div style={{
//                                 backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '15px 20px',
//                                 borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px',
//                                 flexDirection: isArabic ? 'row-reverse' : 'row', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
//                             }}>
//                                 <span style={{ fontSize: '1.5rem' }}>⚠️</span>
//                                 <div>
//                                     <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>{isArabic ? "تنبيه: محتوى غير كافٍ للتقييم" : "Warning: Insufficient Content"}</strong>
//                                     <span style={{ fontSize: '1rem' }}>{isArabic ? "لم يتمكن النظام من سماع إجابتك بوضوح أو أن الإجابة كانت قصيرة جداً (أقل من 3 كلمات). التقييمات المعروضة قد لا تكون دقيقة." : "The system could not hear you clearly or the answer was too short (less than 3 words). The evaluations shown may not be accurate."}</span>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'vision' && (
//                             <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
//                              <div style={{ marginBottom: '30px', textAlign: isArabic ? 'right' : 'left' }}>
//     <h3 style={{ fontSize: '1.4rem', color: '#111827', margin: 0 }}>{isArabic ? "تحليل لغة الجسد والمظهر" : "Body Language & Attire"}</h3>
// </div>
                                
//                                 <div style={{ display: 'flex', gap: '30px', flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
//                                     <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column' }}>
//                                         <DetailedAnalysisCard icon="⚡" title={isArabic ? 'إيماءات الشرح' : 'Explaining Gestures'} value={`${expScore}%`} score={expScore} colorHex="#a855f7" tip={expTip} isArabic={isArabic} />
//                                         <DetailedAnalysisCard icon="🪑" title={isArabic ? 'الجلوس باستقامة' : 'Sitting Straight'} value={`${strScore}%`} score={strScore} colorHex="#3b82f6" tip={strTip} isArabic={isArabic} />
//                                         <DetailedAnalysisCard icon="👤" title={isArabic ? 'انفتاح الجسم' : 'Body Openness'} value={isArabic ? (opennessRaw === 'Open' ? 'منفتح (Open)' : (opennessRaw === 'Closed' ? 'منغلق (Closed)' : 'عادي (Normal)')) : opennessRaw} score={opennessScore} colorHex={opennessScore > 50 ? "#22c55e" : (opennessScore === 50 ? "#64748b" : "#475569")} tip={openTip} isArabic={isArabic} />
//                                     </div>

//                                     <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
//                                         <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
//                                             <SquareCard icon='🖐️' label={isArabic ? 'يد مفتوحة' : 'Open Hands'} value={h.open_score || 0} subLabel={isArabic ? 'تبني الثقة' : 'Trust'} colorHex='#10b981' isCircular={true} />
//                                             <SquareCard icon='✊' label={isArabic ? 'يد مغلقة' : 'Closed Hands'} value={h.clasped_score || 0} subLabel={isArabic ? 'توحي بالتوتر' : 'Nervous'} colorHex='#64748b' isCircular={true} />
//                                         </div>
//                                         <DetailedAnalysisCard icon="🙅" title={isArabic ? 'تكتيف الذراعين (سلبي)' : 'Crossed Arms (Negative)'} value={`${crossedScore}%`} score={crossedScore} colorHex={crossedScore > 20 ? '#ef4444' : '#10b981'} tip={crossTip} isArabic={isArabic} />
//                                         <DetailedAnalysisCard icon="😳" title={isArabic ? 'لمس الوجه (سلبي)' : 'Face Touches (Negative)'} value={faceTouchScore > 20 ? (isArabic ? 'مرتفع' : 'High') : `${faceTouchScore}%`} score={faceTouchScore} colorHex={faceTouchScore > 20 ? '#ef4444' : '#10b981'} tip={touchTip} isArabic={isArabic} />
//                                     </div>
//                                 </div>

//                                 <div style={{ marginTop: '-100px',width:'50%' }}>
//                                     <DetailedAnalysisCard icon="👔" title={isArabic ? 'المظهر الرسمي' : 'Formal Attire'} value={isArabic ? (isFormal ? "رسمي (Formal)" : "غير رسمي (Casual)") : attireStatus} score={isFormal ? 100 : 35} colorHex={isFormal ? "#22c55e" : "#f97316"} tip={isFormal ? (isArabic ? "مظهر احترافي وممتاز للمقابلة. 🌟" : "Excellent professional attire! 🌟") : (isArabic ? "حاول ارتداء ملابس رسمية (مثل بليزر أو قميص) لتبدو أكثر احترافية." : "Consider wearing a blazer or formal shirt for a more professional look.")} isArabic={isArabic} />
//                                 </div>

//                                 <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: isArabic ? 'none' : `6px solid ${primaryColor}`, borderRight: isArabic ? `6px solid ${primaryColor}` : 'none', padding: '20px', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                     <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', color: primaryColor, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                                         <span>💡</span> {isArabic ? "نصيحة الأداء الجسدي الكلية:" : "Body Language Performance Advice:"}
//                                     </strong>
//                                     <p style={{ margin: 0, color: '#475569', fontSize: '1.05rem', lineHeight: '1.6' }}>
//                                         {overallBodyAdvice}
//                                     </p>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'eye' && (
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                 <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px', textAlign: isArabic ? 'right' : 'left' }}>
//                                     <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>{isArabic ? "تحليل التواصل البصري (Eye & Head Tracking)" : "Eye & Head Tracking"}</h2>
//                                 </div>
//                                 <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                                     <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                                         <SquareCard icon='👁️' label={isArabic ? 'التواصل البصري' : 'Eye Contact'} value={eye.score} colorHex='#0d9488' isCircular={true} />
//                                         <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '12px', padding: '20px', color: '#0f766e', fontSize: '1.05rem', lineHeight: '1.6', textAlign: isArabic ? 'right' : 'left', flexGrow: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                             <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصيحة:" : "Advice:"}</strong>
//                                             {eye.advice || (isArabic ? "لا توجد نصيحة متاحة." : "No advice available.")}
//                                         </div>
//                                     </div>
//                                     <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                                         <SquareCard icon='👤' label={isArabic ? 'توجيه الرأس' : 'Head Pose'} value={head.score} colorHex='#3b82f6' isCircular={true} />
//                                         <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px', color: '#1d4ed8', fontSize: '1.05rem', lineHeight: '1.6', textAlign: isArabic ? 'right' : 'left', flexGrow: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                             <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصيحة:" : "Advice:"}</strong>
//                                             {head.advice || (isArabic ? "لا توجد نصيحة متاحة." : "No advice available.")}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'face' && (
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                 <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px', textAlign: isArabic ? 'right' : 'left' }}>
//                                     <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>{isArabic ? "التعابير العاطفية (Emotional Expression)" : "Emotional Expression"}</h2>
//                                 </div>
//                                 <div style={{ display: 'flex', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
//                                     <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                         <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😃</div>
//                                         <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600', marginBottom: '10px' }}>{isArabic ? 'إيجابي (Positive)' : 'Positive'}</div>
//                                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{face.positive || 0}%</div>
//                                     </div>
//                                     <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                         <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😐</div>
//                                         <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600', marginBottom: '10px' }}>{isArabic ? 'محايد (Neutral)' : 'Neutral'}</div>
//                                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#64748b' }}>{face.neutral || 0}%</div>
//                                     </div>
//                                     <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                         <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😥</div>
//                                         <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600', marginBottom: '10px' }}>{isArabic ? 'سلبي (Negative)' : 'Negative'}</div>
//                                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{face.negative || 0}%</div>
//                                     </div>
//                                 </div>
//                                 {(() => {
//                                     const p = face.positive || 0, n = face.neutral || 0, neg = face.negative || 0;
//                                     const maxScore = Math.max(p, n, neg);
//                                     let feedbackText = "";
//                                     if (maxScore === p && p > 0) feedbackText = isArabic ? "أظهرت حماساً وثقة عالية! ابتسامتك وتعبيراتك الإيجابية تترك انطباعاً ممتازاً." : "You showed great enthusiasm and confidence! Your positive expressions leave an excellent impression.";
//                                     else if (maxScore === neg && neg > 0) feedbackText = isArabic ? "بدوت متوتراً أو قلقاً بعض الشيء. تذكر أن تسترخي وتأخذ نفساً عميقاً، الابتسام يقلل من حدة التوتر." : "You seemed a bit stressed or concerned. Remember to relax, take a deep breath, and smile to leave a welcoming impression.";
//                                     else feedbackText = isArabic ? "كانت تعابيرك محايدة وهادئة في الغالب. هذا أمر احترافي، لكن حاول الابتسام في بعض الأحيان لإظهار تفاعل وحيوية أكبر." : "Your expressions were mostly calm and neutral. While professional, try to smile occasionally to show more engagement and energy.";

//                                     return (
//                                         <div style={{ marginTop: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: isArabic ? 'none' : `6px solid ${primaryColor}`, borderRight: isArabic ? `6px solid ${primaryColor}` : 'none', padding: '25px', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                             <h4 style={{ margin: '0 0 10px 0', color: primaryColor, fontSize: '1.2rem' }}>{isArabic ? "تحليل الأداء (Analysis Feedback)" : "Analysis Feedback"}</h4>
//                                             <p style={{ margin: 0, color: '#475569', fontSize: '1.1rem', lineHeight: '1.6' }}>{feedbackText}</p>
//                                         </div>
//                                     );
//                                 })()}
//                             </div>
//                         )}

//                         {activeTab === 'speech' && (
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                 <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px', textAlign: isArabic ? 'right' : 'left' }}>
//                                     <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>{isArabic ? "تحليل الصوت والتحدث (Speech & Audio Analysis)" : "Speech & Audio Analysis"}</h2>
//                                 </div>
//                                 <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                                     <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                         <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🗣️</div>
//                                         <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>{isArabic ? 'سرعة التحدث' : 'Speaking Pace'}</div>
//                                         <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '10px' }}>
//                                             <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{s.wpm || 0}</span>
//                                             <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold' }}>WPM</span>
//                                         </div>
//                                         <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: s.wpm_feedback === 'Perfect' ? '#16a34a' : '#ea580c' }}>{s.wpm_feedback || "N/A"}</div>
//                                     </div>
//                                     <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                         <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎙️</div>
//                                         <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>{isArabic ? 'نبرة الصوت' : 'Voice Tone'}</div>
//                                         <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: primaryColor, marginBottom: '5px', textAlign: 'center' }}>{s.tone || "N/A"}</div>
//                                         <div style={{ width: '50px', height: '4px', backgroundColor: primaryColor, borderRadius: '2px', marginTop: '5px' }}></div>
//                                     </div>
//                                     <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                         <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⏸️</div>
//                                         <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>{isArabic ? 'نسبة التوقف' : 'Pauses Ratio'}</div>
//                                         <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>{s.pause_ratio || 0}%</div>
//                                         <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: s.speech_pattern === 'Balanced' ? '#16a34a' : '#ea580c' }}>{s.speech_pattern || "N/A"}</div>
//                                     </div>
//                                 </div>
//                                 <div style={{ marginTop: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: isArabic ? 'none' : `6px solid ${primaryColor}`, borderRight: isArabic ? `6px solid ${primaryColor}` : 'none', padding: '20px', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                     <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', color: primaryColor, flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصيحة الأداء الصوتي:" : "Vocal Performance Advice:"}</strong>
//                                     <p style={{ margin: 0, color: '#475569', fontSize: '1.05rem', lineHeight: '1.6' }}>
//                                         {isArabic ? (s.wpm_feedback === 'Perfect' && s.speech_pattern === 'Balanced' ? "أداء صوتي ممتاز! حافظت على سرعة مناسبة وتوقفات طبيعية ومريحة للمستمع." : "حاول الحفاظ على وتيرة تنفس منتظمة. التحدث بسرعة قد يجعلك تبدو متوتراً، بينما التوقفات الطويلة قد توحي بالتردد. تدرب على الإجابة بهدوء.") : (s.wpm_feedback === 'Perfect' && s.speech_pattern === 'Balanced' ? "Excellent vocal performance! You maintained a great pace and natural pauses." : "Try to maintain a steady breathing rhythm. Speaking too fast can make you seem nervous, while long pauses might imply hesitation. Practice pacing your answers.")}
//                                     </p>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'content' && (
//                             <div style={{ textAlign: isArabic ? 'right' : 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
//                                     <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.8rem' }}>{isArabic ? "المدرب الذكي" : "Smart AI Coach"}</h2>
//                                     <div style={{ backgroundColor: '#8b5cf6', color: '#fff', padding: '8px 24px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.3rem' }}>{currentResult.content?.score || 0}/100</div>
//                                 </div>
//                                 <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//                                     <h4 style={{ color: '#e11d48', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row', justifyContent: isArabic ? 'flex-start' : 'flex-start' }}><span>📢</span> {isArabic ? "ملاحظات عامة:" : "General Feedback:"}</h4>
//                                     <p style={{ color: '#475569', lineHeight: '1.8', margin: 0, fontSize: '1.05rem' }}>{currentResult.content?.feedback || (isArabic ? "لا يوجد تعليق متاح." : "No feedback available.")}</p>
//                                 </div>
//                                 <div style={{ display: 'flex', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'stretch', flexWrap: 'wrap' }}>
//                                     <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '25px' }}>
//                                         <h4 style={{ color: '#b45309', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصائح للتحسين:" : "Tips to Improve:"}</h4>
//                                         <ul style={{ color: '#713f12', lineHeight: '1.8', paddingLeft: isArabic ? '0' : '20px', paddingRight: isArabic ? '20px' : '0', margin: 0, fontSize: '1.05rem' }}>
//                                             {currentResult.content?.tips && currentResult.content.tips.length > 0 ? (currentResult.content.tips.map((tip, idx) => (<li key={idx} style={{ marginBottom: '12px' }}>{tip}</li>))) : (<li>{isArabic ? "لا توجد نصائح إضافية." : "No additional tips."}</li>)}
//                                         </ul>
//                                     </div>
//                                     <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '25px' }}>
//                                         <h4 style={{ color: '#15803d', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>✅</span> {isArabic ? "الإجابة النموذجية:" : "Ideal Answer:"}</h4>
//                                         <p style={{ color: '#166534', lineHeight: '1.8', margin: 0, fontSize: '1.05rem' }}>{currentResult.content?.ideal_answer || (isArabic ? "غير متاح." : "N/A")}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px'}}>
//                 <button onClick={handleExportPDF} disabled={isDownloading} style={{ padding: '12px 30px', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
//                     {isDownloading ? "⏳ Generating..." : "📄 Export PDF"}
//                 </button>
//                 <button onClick={handleStartNew} style={{ padding: '12px 30px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
//                     {isArabic ? "بدء مقابلة جديدة" : "Start New Interview"}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default FeedbackDashboard;
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import OverallFeedback, { calculateScores } from './OverallFeedback';

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
    const [selectedView, setSelectedView] = useState('overall');
    const [activeTab, setActiveTab] = useState('vision');
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef();
    
    // ✨ [Menna & Roqia: Colors]
    const primaryColor = '#58A492'; // Mint Green
    const darkGreen = '#2F5D54';    // Dark Green
    const bgColor = '#F0F7F5';      // Off-white Greenish

    useEffect(() => {
        document.body.style.backgroundColor = bgColor;
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    const handleExportPDF = async () => {
        const element = reportRef.current;
        if (!element) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', [210, (canvas.height * 210) / canvas.width]);
            pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
            pdf.save(`Interview_Report.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to export report.");
        } finally {
            setIsDownloading(false);
        }
    };

    let currentResult = {};
    let b = {}, h = {}, attireStatus = "Casual", isFormal = false, eye = {}, head = {}, face = {}, s = {};
    let strScore = 0, balanceNum = 0, overallConfidence = 0, wordsCount = 0;
    
    let expScore = 0, crossedScore = 0, faceTouchScore = 0, opennessRaw = "Normal", opennessScore = 50;
    let expTip = "", strTip = "", openTip = "", crossTip = "", touchTip = "", overallBodyAdvice = "";

    if (selectedView !== 'overall') {
        currentResult = allResults[selectedView] || {};
        
        if (!currentResult.error) {
            b = currentResult.vision?.body || {};
            h = currentResult.vision?.hand || {};
            attireStatus = currentResult.vision?.attire?.status || "Casual";
            isFormal = attireStatus.toLowerCase().includes('formal');
            eye = currentResult.vision?.eye_contact || {};
            head = currentResult.vision?.head_focus || {};
            face = currentResult.vision?.emotions || {};
            s = currentResult.speech || {};

            strScore = b.straight_score || 0;
            balanceNum = parseInt((b.posture_balance || "0%").replace('%', '')) || 0;
            balanceNum = Math.min(100, Math.max(0, balanceNum));

            const transcriptText = s.transcript || "";
            wordsCount = transcriptText.trim() === "" ? 0 : transcriptText.trim().split(/\s+/).length;
            overallConfidence = Math.round(((b.engagement_score || 0) + strScore + balanceNum + (h.open_score || 0)) / 4) || 0;

            expScore = b.explaining_score || 0;
            crossedScore = b.crossed_arm_score || 0;
            faceTouchScore = b.touch_face_score || 0;
            opennessRaw = b.body_openness || "Normal";
            opennessScore = opennessRaw === "Open" ? 100 : (opennessRaw === "Normal" ? 50 : 30);

            expTip = expScore >= 20 ? (isArabic ? "استخدام ممتاز لحركة اليدين في الشرح." : "Great use of hands to illustrate your points.") : (isArabic ? "استخدم يديك أكثر لتوضيح أفكارك." : "Use your hands more to illustrate your points.");
            strTip = strScore >= 60 ? (isArabic ? "وضعية جلوس ممتازة وثابتة تعكس ثقتك." : "Excellent straight posture. Keep it up!") : (isArabic ? "حافظ على استقامة ظهرك لتبدو أكثر ثقة." : "Keep your back straight to look more confident.");
            openTip = opennessRaw === "Open" ? (isArabic ? "لغة جسد منفتحة ومرحبة." : "Open and welcoming body language.") : (isArabic ? "حاول فك تشابك أطرافك لتبدو أكثر تقبلاً." : "Try to uncross limbs to look more approachable.");
            crossTip = crossedScore > 20 ? (isArabic ? "تجنب تكتيف الذراعين لأنه يوحي بالانغلاق أو الدفاعية." : "Avoid crossing your arms as it can signal defensiveness.") : (isArabic ? "لغة جسد منفتحة وممتازة. استمر على ذلك!" : "Open and welcoming body language. Keep it up!");
            touchTip = faceTouchScore > 20 ? (isArabic ? "تجنب لمس وجهك لأنه قد يشير للتوتر." : "Avoid touching your face as it can signal nervousness.") : (isArabic ? "تحكم ممتاز في حركة اليدين بعيداً عن الوجه." : "Good control over your hand movements.");

            let negativeFeedbacks = [];
            if (strScore < 50) negativeFeedbacks.push(isArabic ? "استقامة الظهر" : "sitting straight");
            if (opennessRaw === "Closed" || crossedScore > 20) negativeFeedbacks.push(isArabic ? "تجنب الانغلاق وتكتيف الذراعين" : "avoiding crossed arms and closed posture");
            if (faceTouchScore > 20) negativeFeedbacks.push(isArabic ? "تقليل لمس الوجه" : "reducing face touches");
            if (expScore < 10) negativeFeedbacks.push(isArabic ? "استخدام إيماءات الشرح بثقة" : "using explaining gestures more");

            if (negativeFeedbacks.length === 0) {
                overallBodyAdvice = isArabic ? "أداء مبهر! لغة جسدك كانت احترافية، منفتحة، وتعكس ثقة عالية بالنفس طوال الإجابة." : "Outstanding performance! Your body language was professional, open, and reflected high confidence.";
            } else {
                overallBodyAdvice = (isArabic ? "لتحسين لغة جسدك وجعلها أكثر احترافية، ركز على: " : "To improve your body language and appear more confident, focus on: ") + negativeFeedbacks.join(isArabic ? "، و" : ", and ") + ".";
            }
        }
    }

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* ✨ [Menna & Roqia: Header Area containing Tabs and Export Button side by side] */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                
                {/* Navigation Tabs */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                    <button 
                        onClick={() => setSelectedView('overall')}
                        style={{
                            padding: '12px 25px', borderRadius: '8px',
                            border: 'none',
                            backgroundColor: selectedView === 'overall' ? primaryColor : '#ffffff',
                            color: selectedView === 'overall' ? '#ffffff' : darkGreen,
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: selectedView === 'overall' ? '0 4px 6px rgba(88, 164, 146, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => {
                            if(selectedView !== 'overall') e.currentTarget.style.backgroundColor = '#eefdf9';
                            else e.currentTarget.style.backgroundColor = darkGreen;
                        }}
                        onMouseOut={(e) => {
                            if(selectedView !== 'overall') e.currentTarget.style.backgroundColor = '#ffffff';
                            else e.currentTarget.style.backgroundColor = primaryColor;
                        }}
                    >
                        {isArabic ? "التقييم العام" : "Overall Feedback"}
                    </button>

                    {allResults.map((_, index) => (
                        <button 
                            key={index}
                            onClick={() => setSelectedView(index)}
                            style={{
                                padding: '12px 25px', borderRadius: '8px',
                                border: 'none',
                                backgroundColor: selectedView === index ? primaryColor : '#ffffff',
                                color: selectedView === index ? '#ffffff' : darkGreen,
                                fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: selectedView === index ? '0 4px 6px rgba(88, 164, 146, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={(e) => {
                                if(selectedView !== index) e.currentTarget.style.backgroundColor = '#eefdf9';
                                else e.currentTarget.style.backgroundColor = darkGreen;
                            }}
                            onMouseOut={(e) => {
                                if(selectedView !== index) e.currentTarget.style.backgroundColor = '#ffffff';
                                else e.currentTarget.style.backgroundColor = primaryColor;
                            }}
                        >
                            {isArabic ? `السؤال ${index + 1}` : `Question ${index + 1}`}
                        </button>
                    ))}
                </div>

                {/* ✨ [Menna & Roqia: Export Report Button moved to the top right/left] */}
                <button 
                    onClick={handleExportPDF} 
                    disabled={isDownloading} 
                    style={{ 
                        backgroundColor: '#ffffff', color: darkGreen, border: 'none', 
                        padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                        transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(47, 93, 84, 0.1)' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eefdf9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {isDownloading ? (isArabic ? "⏳ جاري المعالجة..." : "⏳ Generating...") : (isArabic ? "📄 تصدير التقرير" : " Export Report")}
                </button>
            </div>

            {/* Content Area */}
            {selectedView === 'overall' ? (
                <OverallFeedback allResults={allResults} isArabic={isArabic} />
            ) : currentResult.error ? (
                <div style={{textAlign: 'center', padding: '50px', color: 'red', fontSize: '1.2rem'}}>
                    {isArabic ? "حدث خطأ أثناء تحليل هذا السؤال." : "Error analyzing this specific question."}
                </div>
            ) : (
                <div className="question-details">
                    <div className="control-bar" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'vision' ? primaryColor : 'transparent', color: activeTab === 'vision' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "لغة الجسد" : "Body"}</button>
                        <button className={`tab-btn ${activeTab === 'eye' ? 'active' : ''}`} onClick={() => setActiveTab('eye')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'eye' ? primaryColor : 'transparent', color: activeTab === 'eye' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "التواصل البصري" : "Eye Contact & Head Pose "}</button>
                        <button className={`tab-btn ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'face' ? primaryColor : 'transparent', color: activeTab === 'face' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "تعابير الوجه" : "Face"}</button>
                        <button className={`tab-btn ${activeTab === 'speech' ? 'active' : ''}`} onClick={() => setActiveTab('speech')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'speech' ? primaryColor : 'transparent', color: activeTab === 'speech' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "الصوت" : "Speech"}</button>
                        <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: activeTab === 'content' ? primaryColor : 'transparent', color: activeTab === 'content' ? '#fff' : darkGreen, fontWeight: 'bold', cursor: 'pointer' }}> {isArabic ? "المحتوى" : "Content"}</button>
                    </div>

                    <div className="result-content" ref={reportRef} style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #dbece8', boxShadow: '0 4px 15px rgba(47, 93, 84, 0.05)' }}>
                        
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${primaryColor}`, marginBottom: '30px', textAlign: isArabic ? 'right' : 'left' }}>
                            <h3 style={{ margin: 0, color: darkGreen, fontSize: '1.4rem' }}>"{currentResult.questionText}"</h3>
                        </div>

                        {wordsCount < 3 && (
                            <div style={{
                                backgroundColor: '#fff4f4', border: '1px solid #fca5a5', color: '#b91c1c', padding: '15px 20px',
                                borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px',
                                flexDirection: isArabic ? 'row-reverse' : 'row', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>{isArabic ? "تنبيه: محتوى غير كافٍ للتقييم" : "Warning: Insufficient Content"}</strong>
                                    <span style={{ fontSize: '1rem' }}>{isArabic ? "لم يتمكن النظام من سماع إجابتك بوضوح أو أن الإجابة كانت قصيرة جداً (أقل من 3 كلمات). التقييمات المعروضة قد لا تكون دقيقة." : "The system could not hear you clearly or the answer was too short (less than 3 words). The evaluations shown may not be accurate."}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'vision' && (
                            <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
                             <div style={{ marginBottom: '30px', textAlign: isArabic ? 'right' : 'left' }}>
                                <h3 style={{ fontSize: '1.4rem', color: darkGreen, margin: 0 }}>{isArabic ? "تحليل لغة الجسد والمظهر" : "Body Language & Attire"}</h3>
                            </div>
                                
                                <div style={{ display: 'flex', gap: '30px', flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                                    <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column' }}>
                                        <DetailedAnalysisCard icon="⚡" title={isArabic ? 'إيماءات الشرح' : 'Explaining Gestures'} value={`${expScore}%`} score={expScore} colorHex={primaryColor} tip={expTip} isArabic={isArabic} />
                                        <DetailedAnalysisCard icon="🪑" title={isArabic ? 'الجلوس باستقامة' : 'Sitting Straight'} value={`${strScore}%`} score={strScore} colorHex={primaryColor} tip={strTip} isArabic={isArabic} />
                                        <DetailedAnalysisCard icon="👤" title={isArabic ? 'انفتاح الجسم' : 'Body Openness'} value={isArabic ? (opennessRaw === 'Open' ? 'منفتح (Open)' : (opennessRaw === 'Closed' ? 'منغلق (Closed)' : 'عادي (Normal)')) : opennessRaw} score={opennessScore} colorHex={opennessScore > 50 ? primaryColor : (opennessScore === 50 ? "#64748b" : "#475569")} tip={openTip} isArabic={isArabic} />
                                    </div>

                                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                            <SquareCard icon='🖐️' label={isArabic ? 'يد مفتوحة' : 'Open Hands'} value={h.open_score || 0} subLabel={isArabic ? 'تبني الثقة' : 'Trust'} colorHex={primaryColor} isCircular={true} />
                                            <SquareCard icon='✊' label={isArabic ? 'يد مغلقة' : 'Closed Hands'} value={h.clasped_score || 0} subLabel={isArabic ? 'توحي بالتوتر' : 'Nervous'} colorHex='#64748b' isCircular={true} />
                                        </div>
                                        <DetailedAnalysisCard icon="🙅" title={isArabic ? 'تكتيف الذراعين (سلبي)' : 'Crossed Arms (Negative)'} value={`${crossedScore}%`} score={crossedScore} colorHex={crossedScore > 20 ? '#ef4444' : primaryColor} tip={crossTip} isArabic={isArabic} />
                                        <DetailedAnalysisCard icon="😳" title={isArabic ? 'لمس الوجه (سلبي)' : 'Face Touches (Negative)'} value={faceTouchScore > 20 ? (isArabic ? 'مرتفع' : 'High') : `${faceTouchScore}%`} score={faceTouchScore} colorHex={faceTouchScore > 20 ? '#ef4444' : primaryColor} tip={touchTip} isArabic={isArabic} />
                                    </div>
                                </div>

                                <div style={{ marginTop: '-100px',width:'50%' }}>
                                    <DetailedAnalysisCard icon="👔" title={isArabic ? 'المظهر الرسمي' : 'Formal Attire'} value={isArabic ? (isFormal ? "رسمي (Formal)" : "غير رسمي (Casual)") : attireStatus} score={isFormal ? 100 : 35} colorHex={isFormal ? primaryColor : "#f97316"} tip={isFormal ? (isArabic ? "مظهر احترافي وممتاز للمقابلة. 🌟" : "Excellent professional attire! 🌟") : (isArabic ? "حاول ارتداء ملابس رسمية (مثل بليزر أو قميص) لتبدو أكثر احترافية." : "Consider wearing a blazer or formal shirt for a more professional look.")} isArabic={isArabic} />
                                </div>

                                <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: isArabic ? 'none' : `6px solid ${primaryColor}`, borderRight: isArabic ? `6px solid ${primaryColor}` : 'none', padding: '20px', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', color: primaryColor, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                        <span>💡</span> {isArabic ? "نصيحة الأداء الجسدي الكلية:" : "Body Language Performance Advice:"}
                                    </strong>
                                    <p style={{ margin: 0, color: darkGreen, fontSize: '1.05rem', lineHeight: '1.6' }}>
                                        {overallBodyAdvice}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'eye' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px', textAlign: isArabic ? 'right' : 'left' }}>
                                    <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.5rem' }}>{isArabic ? "تحليل التواصل البصري (Eye & Head Tracking)" : "Eye & Head Tracking"}</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                    <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <SquareCard icon='👁️' label={isArabic ? 'التواصل البصري' : 'Eye Contact'} value={eye.score} colorHex={primaryColor} isCircular={true} />
                                        <div style={{ backgroundColor: '#f0f7f5', border: `1px solid ${primaryColor}`, borderRadius: '12px', padding: '20px', color: darkGreen, fontSize: '1.05rem', lineHeight: '1.6', textAlign: isArabic ? 'right' : 'left', flexGrow: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصيحة:" : "Advice:"}</strong>
                                            {eye.advice || (isArabic ? "لا توجد نصيحة متاحة." : "No advice available.")}
                                        </div>
                                    </div>
                                    <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <SquareCard icon='👤' label={isArabic ? 'توجيه الرأس' : 'Head Pose'} value={head.score} colorHex={primaryColor} isCircular={true} />
                                        <div style={{ backgroundColor: '#f0f7f5', border: `1px solid ${primaryColor}`, borderRadius: '12px', padding: '20px', color: darkGreen, fontSize: '1.05rem', lineHeight: '1.6', textAlign: isArabic ? 'right' : 'left', flexGrow: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصيحة:" : "Advice:"}</strong>
                                            {head.advice || (isArabic ? "لا توجد نصيحة متاحة." : "No advice available.")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'face' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px', textAlign: isArabic ? 'right' : 'left' }}>
                                    <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.5rem' }}>{isArabic ? "التعابير العاطفية (Emotional Expression)" : "Emotional Expression"}</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😃</div>
                                        <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600', marginBottom: '10px' }}>{isArabic ? 'إيجابي (Positive)' : 'Positive'}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor }}>{face.positive || 0}%</div>
                                    </div>
                                    <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😐</div>
                                        <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600', marginBottom: '10px' }}>{isArabic ? 'محايد (Neutral)' : 'Neutral'}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#64748b' }}>{face.neutral || 0}%</div>
                                    </div>
                                    <div style={{ flex: '1', minWidth: '150px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😥</div>
                                        <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600', marginBottom: '10px' }}>{isArabic ? 'سلبي (Negative)' : 'Negative'}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{face.negative || 0}%</div>
                                    </div>
                                </div>
                                {(() => {
                                    const p = face.positive || 0, n = face.neutral || 0, neg = face.negative || 0;
                                    const maxScore = Math.max(p, n, neg);
                                    let feedbackText = "";
                                    if (maxScore === p && p > 0) feedbackText = isArabic ? "أظهرت حماساً وثقة عالية! ابتسامتك وتعبيراتك الإيجابية تترك انطباعاً ممتازاً." : "You showed great enthusiasm and confidence! Your positive expressions leave an excellent impression.";
                                    else if (maxScore === neg && neg > 0) feedbackText = isArabic ? "بدوت متوتراً أو قلقاً بعض الشيء. تذكر أن تسترخي وتأخذ نفساً عميقاً، الابتسام يقلل من حدة التوتر." : "You seemed a bit stressed or concerned. Remember to relax, take a deep breath, and smile to leave a welcoming impression.";
                                    else feedbackText = isArabic ? "كانت تعابيرك محايدة وهادئة في الغالب. هذا أمر احترافي، لكن حاول الابتسام في بعض الأحيان لإظهار تفاعل وحيوية أكبر." : "Your expressions were mostly calm and neutral. While professional, try to smile occasionally to show more engagement and energy.";

                                    return (
                                        <div style={{ marginTop: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: isArabic ? 'none' : `6px solid ${primaryColor}`, borderRight: isArabic ? `6px solid ${primaryColor}` : 'none', padding: '25px', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: primaryColor, fontSize: '1.2rem' }}>{isArabic ? "تحليل الأداء (Analysis Feedback)" : "Analysis Feedback"}</h4>
                                            <p style={{ margin: 0, color: darkGreen, fontSize: '1.1rem', lineHeight: '1.6' }}>{feedbackText}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {activeTab === 'speech' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px', textAlign: isArabic ? 'right' : 'left' }}>
                                    <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.5rem' }}>{isArabic ? "تحليل الصوت والتحدث (Speech & Audio Analysis)" : "Speech & Audio Analysis"}</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                    <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🗣️</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>{isArabic ? 'سرعة التحدث' : 'Speaking Pace'}</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{s.wpm || 0}</span>
                                            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold' }}>WPM</span>
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: s.wpm_feedback === 'Perfect' ? primaryColor : '#ea580c' }}>{s.wpm_feedback || "N/A"}</div>
                                    </div>
                                    <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎙️</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>{isArabic ? 'نبرة الصوت' : 'Voice Tone'}</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: primaryColor, marginBottom: '5px', textAlign: 'center' }}>{s.tone || "N/A"}</div>
                                        <div style={{ width: '50px', height: '4px', backgroundColor: primaryColor, borderRadius: '2px', marginTop: '5px' }}></div>
                                    </div>
                                    <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⏸️</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>{isArabic ? 'نسبة التوقف' : 'Pauses Ratio'}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>{s.pause_ratio || 0}%</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: s.speech_pattern === 'Balanced' ? primaryColor : '#ea580c' }}>{s.speech_pattern || "N/A"}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: isArabic ? 'none' : `6px solid ${primaryColor}`, borderRight: isArabic ? `6px solid ${primaryColor}` : 'none', padding: '20px', textAlign: isArabic ? 'right' : 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.1rem', color: primaryColor, flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصيحة الأداء الصوتي:" : "Vocal Performance Advice:"}</strong>
                                    <p style={{ margin: 0, color: darkGreen, fontSize: '1.05rem', lineHeight: '1.6' }}>
                                        {isArabic ? (s.wpm_feedback === 'Perfect' && s.speech_pattern === 'Balanced' ? "أداء صوتي ممتاز! حافظت على سرعة مناسبة وتوقفات طبيعية ومريحة للمستمع." : "حاول الحفاظ على وتيرة تنفس منتظمة. التحدث بسرعة قد يجعلك تبدو متوتراً، بينما التوقفات الطويلة قد توحي بالتردد. تدرب على الإجابة بهدوء.") : (s.wpm_feedback === 'Perfect' && s.speech_pattern === 'Balanced' ? "Excellent vocal performance! You maintained a great pace and natural pauses." : "Try to maintain a steady breathing rhythm. Speaking too fast can make you seem nervous, while long pauses might imply hesitation. Practice pacing your answers.")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div style={{ textAlign: isArabic ? 'right' : 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                                    <h2 style={{ color: darkGreen, margin: 0, fontSize: '1.8rem' }}>{isArabic ? "المدرب الذكي" : "Smart AI Coach"}</h2>
                                    <div style={{ backgroundColor: primaryColor, color: '#fff', padding: '8px 24px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.3rem' }}>{currentResult.content?.score || 0}/100</div>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h4 style={{ color: darkGreen, marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row', justifyContent: isArabic ? 'flex-start' : 'flex-start' }}><span>📢</span> {isArabic ? "ملاحظات عامة:" : "General Feedback:"}</h4>
                                    <p style={{ color: '#475569', lineHeight: '1.8', margin: 0, fontSize: '1.05rem' }}>{currentResult.content?.feedback || (isArabic ? "لا يوجد تعليق متاح." : "No feedback available.")}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'stretch', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '25px' }}>
                                        <h4 style={{ color: '#b45309', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>💡</span> {isArabic ? "نصائح للتحسين:" : "Tips to Improve:"}</h4>
                                        <ul style={{ color: '#713f12', lineHeight: '1.8', paddingLeft: isArabic ? '0' : '20px', paddingRight: isArabic ? '20px' : '0', margin: 0, fontSize: '1.05rem' }}>
                                            {currentResult.content?.tips && currentResult.content.tips.length > 0 ? (currentResult.content.tips.map((tip, idx) => (<li key={idx} style={{ marginBottom: '12px' }}>{tip}</li>))) : (<li>{isArabic ? "لا توجد نصائح إضافية." : "No additional tips."}</li>)}
                                        </ul>
                                    </div>
                                    <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f0f7f5', border: `1px solid ${primaryColor}`, borderRadius: '12px', padding: '25px' }}>
                                        <h4 style={{ color: darkGreen, marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isArabic ? 'row-reverse' : 'row' }}><span>✅</span> {isArabic ? "الإجابة النموذجية:" : "Ideal Answer:"}</h4>
                                        <p style={{ color: darkGreen, lineHeight: '1.8', margin: 0, fontSize: '1.05rem' }}>{currentResult.content?.ideal_answer || (isArabic ? "غير متاح." : "N/A")}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ✨ [Menna & Roqia: Start New Interview button - Only this remains at the bottom] */}
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                <button 
                    onClick={handleStartNew} 
                    style={{ 
                        backgroundColor: primaryColor, color: '#ffffff', border: 'none', 
                        padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', 
                        cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(88, 164, 146, 0.3)' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkGreen}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                >
                    {isArabic ? "بدء مقابلة جديدة" : "Start New Interview"}
                </button>
            </div>
        </div>
    );
};

export default FeedbackDashboard;