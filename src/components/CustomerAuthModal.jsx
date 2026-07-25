import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerAuthModal({ lang, onClose, onLoginSuccess }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showSmsToast, setShowSmsToast] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpStep, timer]);

  const generateAndSendOtp = () => {
    // Generate random 4-digit OTP code
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setShowSmsToast(true);
    setTimer(30);
    setCanResend(false);
    setErrorMessage('');

    // Hide SMS notification toast after 10 seconds
    setTimeout(() => {
      setShowSmsToast(false);
    }, 10000);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(lang === 'en' ? 'Please enter your full name.' : 'कृपया तुमचे पूर्ण नाव प्रविष्ट करा.');
      return;
    }
    if (!mobile || mobile.length < 10) {
      setErrorMessage(lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    setErrorMessage('');
    setOtpStep(true);
    generateAndSendOtp();
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    generateAndSendOtp();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpCode.length !== 4) {
      setErrorMessage(lang === 'en' ? 'Please enter 4-digit OTP code.' : 'कृपया ४ अंकी OTP प्रविष्ट करा.');
      return;
    }

    // Verify entered OTP with generated OTP (or demo '1234')
    if (otpCode === generatedOtp || otpCode === '1234') {
      setIsVerifying(true);
      
      // Trigger success confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }

      setTimeout(() => {
        const userObj = {
          id: 'CUST-' + mobile.slice(-4) + Math.floor(100 + Math.random() * 900),
          name: name.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          joinedDate: new Date().toLocaleDateString()
        };
        onLoginSuccess(userObj);
      }, 600);
    } else {
      setErrorMessage(lang === 'en' ? 'Incorrect OTP code! Please check SMS notification.' : 'चुकीचा OTP कोड! कृपया एसएमएस तपासा आणि पुन्हा प्रयत्न करा.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', borderRadius: '20px', overflow: 'hidden' }}>
        
        {/* SMS Notification Banner Toast */}
        {showSmsToast && (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
            color: 'white',
            padding: '10px 14px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #818cf8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#4f46e5', padding: '5px', borderRadius: '50%' }}>
                <MessageSquare size={14} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#c7d2fe', fontSize: '0.7rem' }}>
                  💬 SMS Alert (+91 {mobile}):
                </div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>
                  {lang === 'en' ? `Anuprita's Kitchen OTP Code: ` : `अनुप्रिताज किचन OTP कोड: `}
                  <strong style={{ color: '#fef08a', fontSize: '0.9rem', letterSpacing: '2px', background: '#3730a3', padding: '1px 6px', borderRadius: '4px' }}>
                    {generatedOtp}
                  </strong>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSmsToast(false)}
              style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '16px 20px', background: '#fdf8f6', borderBottom: '1px solid #f5e0d8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ea580c', padding: '6px', borderRadius: '10px', color: 'white' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1c1917' }}>
                {otpStep 
                  ? (lang === 'en' ? 'Mobile OTP Verification' : 'मोबाईल OTP पडताळणी') 
                  : (lang === 'en' ? 'Customer Signup / Login' : 'ग्राहक नोंदणी व लॉगिन')}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#78716c', margin: 0 }}>
                {otpStep 
                  ? (lang === 'en' ? 'Enter 4-digit code sent to your phone' : 'तुमच्या फोनवर आलेला ४ अंकी कोड टाका') 
                  : (lang === 'en' ? 'Enter mobile number to receive OTP' : 'OTP मिळवण्यासाठी मोबाईल नंबर टाका')}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Error Message Box */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {!otpStep ? (
            /* STEP 1: MOBILE NUMBER & NAME ENTRY FORM */
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#ea580c" />
                <span style={{ fontSize: '0.76rem', color: '#9a3412', fontWeight: 700, lineHeight: 1.3 }}>
                  {lang === 'en' 
                    ? 'Enter your mobile number. We will send an SMS OTP for instant 1-click login.' 
                    : 'मोबाईल नंबर प्रविष्ट करा. त्वरित लॉगिनसाठी SMS द्वारे OTP पाठवला जाईल.'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#374151' }}>
                  {lang === 'en' ? 'Full Name *' : 'तुमचे पूर्ण नाव *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '38px', borderRadius: '10px', fontSize: '0.88rem' }}
                    placeholder={lang === 'en' ? 'e.g. Rahul Sharma' : 'उदा. राहुल शर्मा'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#374151' }}>
                  {lang === 'en' ? 'Mobile Number (10 Digits) *' : 'मोबाईल नंबर (१० अंक) *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontWeight: 800, fontSize: '0.85rem' }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className="form-input"
                    style={{ paddingLeft: '48px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '1px' }}
                    placeholder="98220XXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: '#4b5563' }}>
                  {lang === 'en' ? 'Delivery Address (Optional)' : 'डिलिव्हरी पत्ता (पर्यायी)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#78716c' }} />
                  <textarea
                    rows={2}
                    className="form-textarea"
                    style={{ paddingLeft: '38px', borderRadius: '10px', fontSize: '0.82rem' }}
                    placeholder={lang === 'en' ? 'Flat no, Building, Area...' : 'घर क्र., इमारत, परिसर...'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
                  marginTop: '4px'
                }}
              >
                <span>{lang === 'en' ? 'Send OTP & Register' : 'OTP मिळवा व नोंदणी करा'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* STEP 2: 4-DIGIT OTP VERIFICATION FORM */
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <div style={{ display: 'inline-flex', background: '#dcfce7', padding: '10px', borderRadius: '50%', color: '#15803d', marginBottom: '8px' }}>
                  <Phone size={24} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                  {lang === 'en' ? `OTP Sent to +91 ${mobile}` : `+91 ${mobile} वर OTP पाठवला आहे`}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'en' ? 'Check SMS notification or enter code below:' : 'एसएमएस नोटिफिकेशन तपासा किंवा खालील कोड टाका:'}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSmsToast(true)}
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    marginTop: '6px',
                    cursor: 'pointer'
                  }}
                >
                  💬 {lang === 'en' ? 'Show SMS OTP Toast Again' : 'पुन्हा SMS OTP पहा'}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', display: 'block', fontWeight: 800, color: '#334155' }}>
                  {lang === 'en' ? 'Enter 4-Digit Verification Code *' : '४-अंकी OTP कोड टाका *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  autoFocus
                  className="form-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.6rem',
                    letterSpacing: '12px',
                    fontWeight: 900,
                    borderRadius: '12px',
                    padding: '10px',
                    border: '2px solid #ea580c',
                    background: '#fff7ed',
                    color: '#9a3412'
                  }}
                  placeholder="••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {/* Resend Timer & Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setErrorMessage('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                >
                  ← {lang === 'en' ? 'Change Number' : 'नंबर बदला'}
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RefreshCw size={12} />
                    <span>{lang === 'en' ? 'Resend OTP' : 'पुन्हा OTP पाठवा'}</span>
                  </button>
                ) : (
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>
                    {lang === 'en' ? `Resend in ${timer}s` : `${timer} सेकांदात पुन्हा पाठवा`}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                style={{
                  background: isVerifying ? '#16a34a' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" />
                    <span>{lang === 'en' ? 'Verifying...' : 'पडताळणी होत आहे...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{lang === 'en' ? 'Verify OTP & Complete Signup' : 'OTP पडताळा व साइन अप करा'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
