import React, { useState } from 'react';
import { X, User, MapPin, CheckCircle2, ArrowRight, AlertCircle, Info, Sparkles, RefreshCw, LogIn, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findCustomerProfile, saveCustomerProfile, normalizeMobile } from '../services/userService';

export default function CustomerAuthModal({ lang, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Handle Login with existing Mobile Number
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanMobile = normalizeMobile(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage(
        lang === 'en'
          ? 'Please enter a valid 10-digit mobile number.'
          : 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const { profile, error } = await findCustomerProfile(cleanMobile);

      if (error) {
        setErrorMessage(error);
        setIsLoading(false);
        return;
      }

      if (profile && profile.name) {
        // Existing customer profile found!
        try {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.6 }
          });
        } catch (err) {
          console.log(err);
        }

        setInfoMessage(
          lang === 'en'
            ? `Welcome back, ${profile.name}!`
            : `स्वागत आहे, ${profile.name}!`
        );

        setTimeout(() => {
          onLoginSuccess(profile);
        }, 500);
      } else {
        // No existing profile found for this mobile number; switch to Register tab
        setAuthMode('register');
        setInfoMessage(
          lang === 'en'
            ? `No profile found for +91 ${cleanMobile}. Please enter your full name to complete quick registration.`
            : `+91 ${cleanMobile} या नंबरवर खाते आढळले नाही. कृपया नोंदणी पूर्ण करण्यासाठी आपले नाव प्रविष्ट करा.`
        );
      }
    } catch (err) {
      console.error('[CustomerAuthModal] Error finding profile:', err);
      setErrorMessage(
        err.message ||
          (lang === 'en' ? 'Failed to find account. Please try again.' : 'खाते शोधताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Customer Signup / Registration
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const trimmedName = name.trim();
    const cleanMobile = normalizeMobile(mobile);

    if (!trimmedName) {
      setErrorMessage(
        lang === 'en' ? 'Please enter your full name.' : 'कृपया तुमचे पूर्ण नाव प्रविष्ट करा.'
      );
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage(
        lang === 'en'
          ? 'Please enter a valid 10-digit mobile number.'
          : 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const { profile, error } = await saveCustomerProfile({
        name: trimmedName,
        mobile: cleanMobile,
        address: address.trim()
      });

      if (error || !profile) {
        setErrorMessage(
          error ||
            (lang === 'en' ? 'Failed to save customer profile.' : 'नोंदणी सेव्ह करताना त्रुटी आली.')
        );
        setIsLoading(false);
        return;
      }

      // Registration successful!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }

      setInfoMessage(
        lang === 'en'
          ? `Welcome to Anuprita's Kitchen, ${profile.name}!`
          : `अनुप्रिताज किचनमध्ये आपले स्वागत आहे, ${profile.name}!`
      );

      setTimeout(() => {
        onLoginSuccess(profile);
      }, 500);
    } catch (err) {
      console.error('[CustomerAuthModal] Error creating profile:', err);
      setErrorMessage(
        err.message ||
          (lang === 'en' ? 'Failed to register. Please check your connection.' : 'नोंदणी करताना त्रुटी आली. कृपया नेटवर्क तपासा.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', borderRadius: '20px', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{ padding: '16px 20px', background: '#fdf8f6', borderBottom: '1px solid #f5e0d8' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ea580c', padding: '6px', borderRadius: '10px', color: 'white' }}>
              <User size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1c1917' }}>
                {authMode === 'login'
                  ? (lang === 'en' ? 'Customer Login' : 'ग्राहक लॉगिन')
                  : (lang === 'en' ? 'Customer Registration' : 'ग्राहक नोंदणी')}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#78716c', margin: 0 }}>
                {authMode === 'login'
                  ? (lang === 'en' ? 'Login with your 10-digit mobile number' : '१० अंकी मोबाईल नंबरने लॉगिन करा')
                  : (lang === 'en' ? 'Enter name and mobile to create your account' : 'खाते तयार करण्यासाठी नाव व मोबाईल नंबर टाका')}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f5f5f4',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '14px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setInfoMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: authMode === 'login' ? '#ffffff' : 'transparent',
                color: authMode === 'login' ? '#ea580c' : '#78716c',
                boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={14} />
              <span>{lang === 'en' ? 'Quick Login' : 'मोबाईल लॉगिन'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
                setInfoMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: authMode === 'register' ? '#ffffff' : 'transparent',
                color: authMode === 'register' ? '#ea580c' : '#78716c',
                boxShadow: authMode === 'register' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={14} />
              <span>{lang === 'en' ? 'New Register' : 'नवीन नोंदणी'}</span>
            </button>
          </div>

          {/* Quick Notice Card */}
          <div
            style={{
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}
          >
            <Sparkles size={16} color="#ea580c" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.74rem', color: '#9a3412', fontWeight: 700, lineHeight: 1.35 }}>
              {authMode === 'login'
                ? (lang === 'en'
                    ? 'Enter your mobile number. We will load your profile and past orders instantly.'
                    : 'तुमचा मोबाईल नंबर टाका. तुमचे प्रोफाइल व मागील ऑर्डर्स त्वरित लोड होतील.')
                : (lang === 'en'
                    ? 'Enter your full name and mobile number to create your profile.'
                    : 'प्रोफाइल तयार करण्यासाठी तुमचे पूर्ण नाव आणि मोबाईल नंबर टाका.')}
            </span>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info / Success Message Box */}
          {infoMessage && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 1.4
              }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{infoMessage}</span>
            </div>
          )}

          {authMode === 'login' ? (
            /* TAB 1: QUICK LOGIN FORM (Mobile Only) */
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#374151' }}>
                  {lang === 'en' ? 'Mobile Number (10 Digits) *' : 'मोबाईल नंबर (१० अंक) *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    autoFocus
                    className="form-input"
                    style={{
                      paddingLeft: '48px',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '1px'
                    }}
                    placeholder="98220XXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading ? '#9a3412' : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
                  marginTop: '4px'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" />
                    <span>{lang === 'en' ? 'Finding Account...' : 'खाते शोधत आहे...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'en' ? 'Find Account & Login' : 'खाते शोधा व लॉगिन करा'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ea580c',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {lang === 'en' ? 'New customer? Click here to register' : 'नवीन ग्राहक? येथे नोंदणी करा'}
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTRATION FORM (Full Name + Mobile + Optional Address) */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#374151' }}>
                  {lang === 'en' ? 'Full Name *' : 'तुमचे पूर्ण नाव *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }}
                  />
                  <input
                    type="text"
                    required
                    autoFocus
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
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className="form-input"
                    style={{
                      paddingLeft: '48px',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '1px'
                    }}
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
                disabled={isLoading}
                style={{
                  background: isLoading ? '#15803d' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                  marginTop: '4px'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" />
                    <span>{lang === 'en' ? 'Saving Profile...' : 'नोंदणी सेव्ह होत आहे...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{lang === 'en' ? 'Register & Start Ordering' : 'नोंदणी करा व सुरू करा'}</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#16a34a',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {lang === 'en' ? 'Already registered? Click here to login' : 'आधीच नोंदणी केली आहे? लॉगिन करा'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Account Notice */}
          <p style={{ fontSize: '0.67rem', color: '#a8a29e', textAlign: 'center', marginTop: '16px', lineHeight: 1.35, marginBottom: 0 }}>
            {lang === 'en'
              ? 'Mobile and name entry provides account identification for convenience and order history.'
              : 'सोयीस्कर प्रवेश: मोबाईल नंबर व नाव तुमची ऑर्डर माहिती आणि हिस्ट्री जोडण्यासाठी वापरले जाते.'}
          </p>
        </div>
      </div>
    </div>
  );
}
