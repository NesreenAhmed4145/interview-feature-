import React, { useState } from 'react';
import axios from 'axios';

const SetupInterview = ({ formData, setFormData, setQuestions, setStep, isArabic }) => {
    const [loading, setLoading] = useState(false);
    
    // اللون الأخضر الداكن المعتمد في هوية الموقع
    const primaryColor = '#2b5a4a'; 

    const handleStartInterview = async () => {
        setLoading(true);
        const form = new FormData();
        form.append('track', formData.track);
        form.append('level', formData.level);
        form.append('language', formData.language);
        form.append('num_questions', formData.numQuestions);

        try {
            const res = await axios.post('http://localhost:5000/generate-question', form);
            let fetchedQuestions = [];
            if (res.data.questions && Array.isArray(res.data.questions)) {
                fetchedQuestions = res.data.questions;
            } else if (res.data.question) {
                fetchedQuestions = [res.data.question]; 
            } else {
                fetchedQuestions = [isArabic ? "حدث خطأ في تحميل السؤال." : "Error loading question."];
            }
            setQuestions(fetchedQuestions);
            setStep(2); 
        } catch (err) {
            alert("Error generating questions. Check backend.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // مكون زر الاختيار المتعدد (Pill Button) بالتصميم الجديد
    const PillOption = ({ active, onClick, label }) => (
        <button
            onClick={onClick}
            style={{
                padding: '8px 20px',
                borderRadius: '25px', 
                border: active ? `1px solid ${primaryColor}` : '1px solid #d1d5db',
                backgroundColor: active ? primaryColor : '#ffffff',
                color: active ? '#ffffff' : '#374151',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                display: 'inline-block'
            }}
        >
            {label}
        </button>
    );

    // ستايل موحد للقوائم المنسدلة (Dropdowns) لتبدو كالصورة
    const selectStyle = {
        width: '100%', 
        padding: '10px 12px', 
        borderRadius: '6px', 
        border: `1px solid ${primaryColor}`, 
        fontSize: '0.95rem', 
        color: '#111827', 
        outline: 'none', 
        backgroundColor: '#ffffff',
        appearance: 'none',
        // إضافة أيقونة السهم الصغير للقائمة المنسدلة بنفس اللون الأخضر
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%232b5a4a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: isArabic ? 'left .7em top 50%' : 'right .7em top 50%',
        backgroundSize: '.65em auto',
        cursor: 'pointer'
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: isArabic ? 'right' : 'left' }}>
            
            {/* --- الهيدر (Header) --- */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: primaryColor, fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px' }}>
                    {isArabic ? "مدرب المقابلات الذكي" : "AI Interview Coach"}
                </h1>
                <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '700px', margin: 0 }}>
                    {isArabic 
                        ? "المنصة الذكية المتكاملة لطلاب علوم الحاسب. تدرب على المقابلات، ابني سيرتك الذاتية، وحدد مسارك." 
                        : "The all-in one AI platform for computer science students. Practice interviews, build resumes, your path."}
                </p>
            </div>

            {/* --- صندوق إعدادات المقابلة (Form Box) --- */}
            <div style={{ 
                border: `1px solid ${primaryColor}`, 
                borderRadius: '10px', 
                padding: '30px', 
                backgroundColor: '#ffffff',
                maxWidth: '550px' // تحديد العرض ليكون على الجانب مثل الصورة
            }}>
                <h2 style={{ fontSize: '1.25rem', color: '#111827', fontWeight: 'bold', marginBottom: '25px', marginTop: 0 }}>
                    {isArabic ? "إعدادات المقابلة" : "Interview Configuration"}
                </h2>

                {/* 1. Target Role */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                        {isArabic ? "المجال المستهدف" : "Target Role"}
                    </label>
                    <select 
                        value={formData.track} 
                        onChange={(e) => setFormData({...formData, track: e.target.value})}
                        style={selectStyle}
                    >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Data Scientist">Data Scientist</option>
                    </select>
                </div>

                {/* 2. Experience Level */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                        {isArabic ? "مستوى الخبرة" : "Experience Level"}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <PillOption active={formData.level === 'Junior'} onClick={() => setFormData({...formData, level: 'Junior'})} label={isArabic ? 'مبتدئ' : 'Junior'} />
                        <PillOption active={formData.level === 'Mid-Level'} onClick={() => setFormData({...formData, level: 'Mid-Level'})} label={isArabic ? 'متوسط' : 'Mid-Level'} />
                        <PillOption active={formData.level === 'Senior'} onClick={() => setFormData({...formData, level: 'Senior'})} label={isArabic ? 'خبير' : 'Senior'} />
                    </div>
                </div>

                {/* 3. Interview Language */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                        {isArabic ? "لغة المقابلة" : "Interview Language"}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <PillOption active={formData.language === 'en'} onClick={() => setFormData({...formData, language: 'en'})} label="English" />
                        <PillOption active={formData.language === 'ar'} onClick={() => setFormData({...formData, language: 'ar'})} label="Arabic" />
                    </div>
                </div>

                {/* 4. Number of Questions */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                        {isArabic ? "عدد الأسئلة" : "Number of Questions"}
                    </label>
                    <select 
                        value={formData.numQuestions} 
                        onChange={(e) => setFormData({...formData, numQuestions: parseInt(e.target.value)})}
                        style={selectStyle}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>

                {/* Submit Button */}
                <button 
                    onClick={handleStartInterview} 
                    disabled={loading}
                    style={{ 
                        width: '100%', padding: '12px', borderRadius: '6px', 
                        backgroundColor: primaryColor, color: '#fff', fontSize: '1rem', 
                        fontWeight: '600', border: 'none', cursor: 'pointer', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                        transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading 
                        ? (isArabic ? "⏳ جاري التحضير..." : "⏳ Preparing...") 
                        : (
                            <>
                                {isArabic ? "ابدأ المقابلة التجريبية" : "Start Mock Interview"}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}>
                                    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </>
                        )
                    }
                </button>
            </div>
            
        </div>
    );
};

export default SetupInterview;