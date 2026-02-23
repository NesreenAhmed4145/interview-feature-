import React from 'react';

// ==========================================
// 🧮 دوال حساب الدرجات (Scoring Logic)
// ==========================================
export const calculateScores = (result) => {
    if (!result || result.error) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

    // 1. Knowledge Score
    const knowledge = result.content?.score || 0;

    // 2. Verbal Communication Score
    const speech = result.speech || {};
    let wpmScore = 100;
    if (speech.wpm < 110) wpmScore = Math.max(0, 100 - (110 - speech.wpm));
    else if (speech.wpm > 160) wpmScore = Math.max(0, 100 - (speech.wpm - 160));

    let pauseScore = 100;
    if (speech.pause_ratio > 45) pauseScore = Math.max(0, 100 - (speech.pause_ratio - 45) * 1.5);
    else if (speech.pause_ratio < 15) pauseScore = 80;

    let toneScore = 80; 
    if (speech.tone?.includes("Dynamic")) toneScore = 100;
    if (speech.tone?.includes("Monotone")) toneScore = 50;

    const verbal = (wpmScore * 0.4) + (pauseScore * 0.4) + (toneScore * 0.2);

    // 3. Non-Verbal Communication Score 
    const vision = result.vision || {};
    const handOpen = vision.hand?.open_score || 0; 
    const explaining = vision.body?.explaining_score || 0; 
    const straightRaw = vision.body?.straight_score || 0; 
    
    const straight = straightRaw > 10 ? 100 : (straightRaw / 10) * 100;

    const eye = vision.eye_contact?.score || 0;
    const head = vision.head_focus?.score || 0;
    const attire = vision.attire?.score || 0;
    const positive = vision.emotions?.positive || 0;

    const nonVerbal = 
        (handOpen * 0.10) + 
        (straight * 0.10) + 
        (explaining * 0.10) + 
        (eye * 0.30) + 
        (head * 0.20) + 
        (attire * 0.10) + 
        (positive * 0.10);

    // 4. Overall Score
    const overall = (knowledge * 0.4) + (verbal * 0.3) + (nonVerbal * 0.3);

    return {
        knowledge: Number(knowledge).toFixed(1),
        verbal: Number(verbal).toFixed(1),
        nonVerbal: Number(nonVerbal).toFixed(1),
        overall: Number(overall).toFixed(1),
        attireScore: Number(attire) // نحتفظ بدرجة الملابس لتقييم الـ Formality Status
    };
};

// ==========================================
// 📊 دالة حساب متوسط المقابلة بالكامل 
// ==========================================
export const calculateInterviewAverages = (allResults) => {
    if (!allResults || allResults.length === 0) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

    let totalKnowledge = 0, totalVerbal = 0, totalNonVerbal = 0, totalOverall = 0, totalAttire = 0;
    let validQuestionsCount = 0;

    allResults.forEach(result => {
        if (!result.error) {
            const scores = calculateScores(result);
            totalKnowledge += parseFloat(scores.knowledge);
            totalVerbal += parseFloat(scores.verbal);
            totalNonVerbal += parseFloat(scores.nonVerbal);
            totalOverall += parseFloat(scores.overall);
            totalAttire += parseFloat(scores.attireScore);
            validQuestionsCount++;
        }
    });

    if (validQuestionsCount === 0) return { knowledge: 0, verbal: 0, nonVerbal: 0, overall: 0, attireScore: 0 };

    return {
        knowledge: (totalKnowledge / validQuestionsCount).toFixed(1),
        verbal: (totalVerbal / validQuestionsCount).toFixed(1),
        nonVerbal: (totalNonVerbal / validQuestionsCount).toFixed(1),
        overall: (totalOverall / validQuestionsCount).toFixed(1),
        attireScore: (totalAttire / validQuestionsCount).toFixed(1)
    };
};

// ==========================================
// 🎨 مكون الكارت الجديد (Pillar Card) المطابق للصورة
// ==========================================
const PillarCard = ({ icon, title, subtitle, score, colorHex, isStatus, statusText, isArabic }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 25px',
            marginBottom: '15px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            flexDirection: isArabic ? 'row-reverse' : 'row'
        }}>
            
            {/* ⬅️ الجزء الأيسر (الأيقونة والنصوص) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <div style={{
                    width: '50px', height: '50px',
                    borderRadius: '12px',
                    backgroundColor: `${colorHex}1A`, // خلفية شفافة بنسبة 10%
                    color: colorHex,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    {icon}
                </div>
                <div style={{ textAlign: isArabic ? 'right' : 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#0f172a' }}>{title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>{subtitle}</div>
                </div>
            </div>

            {/* ➡️ الجزء الأيمن (الدرجة والـ Progress Bar أو الـ Status Pill) */}
            <div style={{ width: '130px', textAlign: isArabic ? 'left' : 'right' }}>
                {isStatus ? (
                    // الـ Status Pill (مثل حالة الملابس)
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        backgroundColor: statusText === 'FORMAL' || statusText === 'رسمي' ? '#dcfce7' : '#ffedd5',
                        color: statusText === 'FORMAL' || statusText === 'رسمي' ? '#166534' : '#c2410c',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}>
                        {isArabic ? `الحالة: ${statusText}` : `STATUS: ${statusText}`}
                    </div>
                ) : (
                    // الـ Progress Bar (لباقي التقييمات)
                    <>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                            {Math.round(score)}/100
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', direction: 'ltr' }}>
                            <div style={{ width: `${score}%`, height: '100%', backgroundColor: colorHex, borderRadius: '4px' }}></div>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};


// ==========================================
// 🚀 المكون الرئيسي للتقييم العام
// ==========================================
// ==========================================
// 🚀 المكون الرئيسي للتقييم العام
// ==========================================
const OverallFeedback = ({ allResults, isArabic }) => {
    const scores = calculateInterviewAverages(allResults);

    // تحديد حالة الملابس
    const isFormalOverall = parseFloat(scores.attireScore) >= 50;
    const formalityStatus = isArabic 
        ? (isFormalOverall ? "رسمي" : "غير رسمي") 
        : (isFormalOverall ? "FORMAL" : "CASUAL");

    // نصوص ملخص الأداء
    let overviewText = "";
    if (scores.overall >= 80) overviewText = isArabic ? "أداء ممتاز! لقد أظهرت كفاءة عالية في المعرفة والتواصل." : "Excellent performance! You demonstrated high proficiency in knowledge and communication.";
    else if (scores.overall >= 60) overviewText = isArabic ? "أداء جيد، ولكن هناك مساحة للتحسين في بعض المهارات." : "Good performance, but there is room for improvement in some areas.";
    else overviewText = isArabic ? "الأداء دون التوقعات. تحتاج إلى تدريب مكثف على المعرفة التقنية ومهارات التواصل." : "Performance was below expectations. Significant improvements are needed in knowledge and communication skills.";

    // الأيقونات
    const icons = {
        nonVerbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        verbal: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>,
        knowledge: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
        formality: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
    };

    // 🔥 فحص ما إذا كان هناك أي سؤال إجابته قصيرة جداً 🔥
    let hasShortAnswer = false;
    allResults.forEach(result => {
        if (!result.error) {
            const transcriptText = result.speech?.transcript || "";
            const wordsCount = transcriptText.trim() === "" ? 0 : transcriptText.trim().split(/\s+/).length;
            if (wordsCount < 3) {
                hasShortAnswer = true;
            }
        }
    });

    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '10px', textAlign: isArabic ? 'right' : 'left' }}>
            
            {/* الهيدر العلوي */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.6rem' }}>
                    {isArabic ? "أعمدة التقييم الشامل" : "Overall Assessment Pillars"}
                </h2>
                <div style={{ background: '#2b5a4a', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {isArabic ? "الدرجة الكلية: " : "Total Score: "} {scores.overall}%
                </div>
            </div>

            {/* ⚠️ الشريط التحذيري الخاص بالتقييم العام ⚠️ */}
            {hasShortAnswer && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #f87171',
                    color: '#991b1b',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    textAlign: isArabic ? 'right' : 'left',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>
                            {isArabic ? "تنبيه: محتوى غير كافٍ في بعض الإجابات" : "Warning: Insufficient Content in Some Answers"}
                        </strong>
                        <span style={{ fontSize: '1rem' }}>
                            {isArabic 
                                ? "لم يتمكن النظام من سماع إجابتك بوضوح، أو أن بعض الإجابات كانت قصيرة جداً (أقل من 3 كلمات). الدرجة الكلية المعروضة قد تتأثر بذلك." 
                                : "The system could not hear you clearly, or some answers were too short (less than 3 words). The overall score shown may be affected."}
                        </span>
                    </div>
                </div>
            )}
            
            {/* 🌟 كروت التقييم الأربعة (Pillars) 🌟 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                <PillarCard 
                    icon={icons.nonVerbal}
                    title={isArabic ? "التواصل غير اللفظي" : "Non-Verbal Communication"}
                    subtitle={isArabic ? "لغة الجسد، التواصل البصري، تعابير الوجه" : "Body Language, Eye Contact, Expressions"}
                    score={scores.nonVerbal}
                    colorHex="#3b82f6" 
                    isArabic={isArabic}
                />

                <PillarCard 
                    icon={icons.verbal}
                    title={isArabic ? "التواصل اللفظي" : "Verbal Communication"}
                    subtitle={isArabic ? "وضوح الصوت، سرعة التحدث، النبرة" : "Speech Clarity, Pace, Tone, Filler Words"}
                    score={scores.verbal}
                    colorHex="#a855f7" 
                    isArabic={isArabic}
                />

                <PillarCard 
                    icon={icons.knowledge}
                    title={isArabic ? "المعرفة والمحتوى" : "Knowledge & Content"}
                    subtitle={isArabic ? "الصلة بالموضوع، الدقة التقنية، هيكلة الإجابة" : "Relevance, Structure (STAR), Technical Accuracy"}
                    score={scores.knowledge}
                    colorHex="#22c55e" 
                    isArabic={isArabic}
                />

                <PillarCard 
                    icon={icons.formality}
                    title={isArabic ? "المظهر العام" : "Formality Detection"}
                    subtitle={isArabic ? "الملابس الرسمية والسياق العام" : "Attire, Grooming, Background Context"}
                    isStatus={true}
                    statusText={formalityStatus}
                    colorHex="#f97316" 
                    isArabic={isArabic}
                />

            </div>

            {/* صندوق الملاحظات الكلي */}
            <h3 style={{ color: '#334155', marginTop: '35px', marginBottom: '15px', fontSize: '1.2rem' }}>
                {isArabic ? "نظرة عامة:" : "Overall Overview:"}
            </h3>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: isArabic ? 'none' : '4px solid #2b5a4a', borderRight: isArabic ? '4px solid #2b5a4a' : 'none', color: '#475569', fontSize: '1.05rem', lineHeight: '1.6' }}>
                {overviewText}
            </div>
        </div>
    );
};

export default OverallFeedback;