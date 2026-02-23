import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SetupInterview = ({ formData, setFormData, setQuestions, setStep, isArabic }) => {
    const [loading, setLoading] = useState(false);
    
    // 🎨 باليت ألوان الموقع المعتمدة
    const primaryColor = '#58A492'; // النعناع (للأزرار والتحديدات)
    const darkGreen = '#2F5D54';    // الأخضر الغامق (للعناوين والنصوص)
    const bgColor = '#F0F7F5';      // الأوف وايت المخضر (للخلفية)

    // جعل خلفية الـ body بالكامل تأخذ اللون الأوف وايت المخضر
    useEffect(() => {
        document.body.style.backgroundColor = bgColor;
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

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

    // مكون زر الاختيار المتعدد (Pill Button)
    const PillOption = ({ active, onClick, label }) => (
        <button
            onClick={onClick}
            style={{
                padding: '8px 20px',
                borderRadius: '25px', 
                border: active ? `1px solid ${primaryColor}` : '1px solid #cbd5e1',
                backgroundColor: active ? primaryColor : '#ffffff',
                color: active ? '#ffffff' : '#64748b',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                display: 'inline-block'
            }}
        >
            {label}
        </button>
    );

    // 🌟 مكون القائمة المنسدلة المخصص (Custom Select) للتحكم في ألوان التحديد
    const CustomSelect = ({ value, options, onChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        // إغلاق القائمة عند النقر خارجها
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
                {/* الزر الرئيسي للقائمة */}
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%', 
                        padding: '12px 12px', 
                        borderRadius: '8px', 
                        border: isOpen ? `2px solid ${primaryColor}` : `1px solid #cbd5e1`, 
                        fontSize: '0.95rem', 
                        color: darkGreen, 
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border 0.2s ease'
                    }}
                >
                    <span>{value}</span>
                    {/* أيقونة السهم */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                {/* خيارات القائمة المنسدلة */}
                {isOpen && (
                    <ul style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '5px',
                        padding: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        listStyle: 'none',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxSizing: 'border-box'
                    }}>
                        {options.map((option, index) => (
                            <li 
                                key={index}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '12px 15px',
                                    fontSize: '0.95rem',
                                    color: value === option.value ? '#ffffff' : darkGreen,
                                    backgroundColor: value === option.value ? primaryColor : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease, color 0.2s ease',
                                    borderBottom: index < options.length - 1 ? '1px solid #f1f5f9' : 'none'
                                }}
                                // تأثير التمرير (Hover) المخصص
                                onMouseEnter={(e) => {
                                    if (value !== option.value) {
                                        e.target.style.backgroundColor = '#e6f2ef'; // لون أخضر فاتح جداً عند التمرير
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) {
                                        e.target.style.backgroundColor = '#ffffff';
                                    }
                                }}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: isArabic ? 'right' : 'left' }}>
            
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* --- الهيدر (Header) --- */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: darkGreen, fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                        {isArabic ? "مدرب المقابلات الذكي" : "AI Interview Coach"}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
                        {isArabic 
                            ? "المنصة الذكية المتكاملة لطلاب علوم الحاسب. تدرب على المقابلات، ابني سيرتك الذاتية، وحدد مسارك." 
                            : "The all-in one AI platform for computer science students. Practice interviews, build resumes, your path."}
                    </p>
                </div>

                {/* --- صندوق إعدادات المقابلة (Form Box) --- */}
                <div style={{ 
                    border: `1px solid #dbece8`, 
                    borderRadius: '12px', 
                    padding: '40px', 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ fontSize: '1.3rem', color: darkGreen, fontWeight: 'bold', marginBottom: '25px', marginTop: 0, borderBottom: `1px solid ${bgColor}`, paddingBottom: '15px' }}>
                        {isArabic ? "إعدادات المقابلة" : "Interview Configuration"}
                    </h2>

                    {/* 1. Target Role (باستخدام المكون المخصص الجديد) */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
                            {isArabic ? "المجال المستهدف" : "Target Role"}
                        </label>
                        <CustomSelect 
                            value={formData.track} 
                            onChange={(val) => setFormData({...formData, track: val})}
                            options={[
                                { value: "Computer Science", label: "Computer Science" },
                                { value: "Software Engineer", label: "Software Engineer" },
                                { value: "Frontend Developer", label: "Frontend Developer" },
                                { value: "Backend Developer", label: "Backend Developer" },
                                { value: "Data Scientist", label: "Data Scientist" }
                            ]}
                        />
                    </div>

                    {/* 2. Experience Level */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
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
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
                            {isArabic ? "لغة المقابلة" : "Interview Language"}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <PillOption active={formData.language === 'en'} onClick={() => setFormData({...formData, language: 'en'})} label="English" />
                            <PillOption active={formData.language === 'ar'} onClick={() => setFormData({...formData, language: 'ar'})} label="Arabic" />
                        </div>
                    </div>

                    {/* 4. Number of Questions (باستخدام المكون المخصص الجديد) */}
                    <div style={{ marginBottom: '35px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: darkGreen, marginBottom: '10px' }}>
                            {isArabic ? "عدد الأسئلة" : "Number of Questions"}
                        </label>
                        <CustomSelect 
                            value={formData.numQuestions.toString()} 
                            onChange={(val) => setFormData({...formData, numQuestions: parseInt(val)})}
                            options={[
                                { value: "1", label: "1" },
                                { value: "2", label: "2" },
                                { value: "3", label: "3" },
                                { value: "4", label: "4" },
                                { value: "5", label: "5" }
                            ]}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handleStartInterview} 
                        disabled={loading}
                        style={{ 
                            width: '100%', padding: '14px', borderRadius: '8px', 
                            backgroundColor: primaryColor, color: '#fff', fontSize: '1.05rem', 
                            fontWeight: '600', border: 'none', cursor: 'pointer', 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 6px rgba(88, 164, 146, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkGreen}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                    >
                        {loading 
                            ? (isArabic ? "⏳ جاري التحضير..." : "⏳ Preparing...") 
                            : (
                                <>
                                    {isArabic ? "ابدأ المقابلة التجريبية" : "Start Mock Interview"}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isArabic ? 'rotate(180deg)' : 'none' }}>
                                        <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </>
                            )
                        }
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default SetupInterview;