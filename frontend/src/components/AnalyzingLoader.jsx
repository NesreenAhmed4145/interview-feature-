import React, { useState } from 'react';

// ✨ [Menna & Roqia: Smart Loading Screen with Email Option]
const AnalyzingLoader = ({ isArabic, onSendToEmail }) => {
    // 🎨 باليت الألوان
    const primaryColor = '#58A492'; // النعناع
    const darkGreen = '#2F5D54';    // الأخضر الغامق
    const bgColor = '#F0F7F5';      // الأوف وايت المخضر

    const [showEmailInput, setShowEmailInput] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmitEmail = () => {
        if (!email.includes('@')) {
            alert(isArabic ? "الرجاء إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
            return;
        }
        
        // هنا بنبعت الإيميل للـ Backend (الدالة دي بتيجي من الملف الأب)
        onSendToEmail(email);
        setIsSubmitted(true);
    };

    return (
        <div style={{
            minHeight: '80vh', display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor, 
            fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px'
        }}>
            
            {/* 🌀 أنيميشن التحميل */}
            <div style={{
                width: '60px', height: '60px', border: `6px solid #dbece8`, 
                borderTop: `6px solid ${primaryColor}`, borderRadius: '50%', 
                animation: 'spin 1s linear infinite', marginBottom: '30px'
            }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

            <h2 style={{ color: darkGreen, fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>
                {isArabic ? "جاري تحليل أدائك بالذكاء الاصطناعي..." : "Analyzing your performance..."}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '40px', textAlign: 'center' }}>
                {isArabic ? "قد يستغرق هذا بضع دقائق. يرجى عدم إغلاق الصفحة." : "This might take a few minutes. Please don't close the page."}
            </p>

            {/* 📧 قسم إدخال الإيميل */}
            <div style={{ 
                backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', 
                border: `1px solid #dbece8`, boxShadow: '0 4px 20px rgba(47, 93, 84, 0.08)', 
                width: '100%', maxWidth: '450px', textAlign: 'center' 
            }}>
                
                {isSubmitted ? (
                    // رسالة النجاح بعد إدخال الإيميل
                    <div>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                        <h3 style={{ color: darkGreen, margin: '0 0 10px 0' }}>
                            {isArabic ? "تم استلام بريدك بنجاح!" : "Email received!"}
                        </h3>
                        <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>
                            {isArabic ? "يمكنك إغلاق هذه الصفحة الآن، وسنرسل لك النتائج فور جاهزيتها." : "You can close this page. We'll email you the results once ready."}
                        </p>
                    </div>
                ) : !showEmailInput ? (
                    // زرار "أرسل لي النتيجة"
                    <div>
                        <h4 style={{ color: darkGreen, marginTop: 0, marginBottom: '15px' }}>
                            {isArabic ? "لا ترغب في الانتظار؟" : "Don't want to wait?"}
                        </h4>
                        <button 
                            onClick={() => setShowEmailInput(true)}
                            style={{
                                backgroundColor: '#ffffff', color: primaryColor, border: `2px solid ${primaryColor}`,
                                padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                                cursor: 'pointer', transition: 'all 0.2s ease', width: '100%'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eefdf9'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                            {isArabic ? "أرسل لي النتيجة على الإيميل 📩" : "Email me the results 📩"}
                        </button>
                    </div>
                ) : (
                    // حقل إدخال الإيميل
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ color: darkGreen, margin: 0, textAlign: isArabic ? 'right' : 'left' }}>
                            {isArabic ? "أدخل بريدك الإلكتروني:" : "Enter your email:"}
                        </h4>
                        <input 
                            type="email" 
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1',
                                fontSize: '1rem', outline: 'none', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr'
                            }}
                        />
                        <button 
                            onClick={handleSubmitEmail}
                            style={{
                                backgroundColor: primaryColor, color: '#ffffff', border: 'none',
                                padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                                cursor: 'pointer', transition: 'all 0.2s ease', width: '100%'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = darkGreen; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
                        >
                            {isArabic ? "تأكيد الإرسال" : "Confirm"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyzingLoader;