import React, { useState } from 'react';
import { X, User, Phone, MapPin, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CustomerAuthModal({ lang, onClose, onLoginSuccess }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!name || !mobile || mobile.length < 10) {
      alert(lang === 'en' ? 'Please enter a valid 10-digit mobile number and name.' : 'कृपया १० अंकी मोबाईल नंबर आणि नाव प्रविष्ट करा.');
      return;
    }
    // Simulate sending OTP
    setOtpStep(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const userObj = {
      id: 'CUST-' + mobile.slice(-4) + Math.floor(100 + Math.random() * 900),
      name,
      mobile,
      address,
      joinedDate: new Date().toLocaleDateString()
    };
    onLoginSuccess(userObj);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#16a34a" />
            <h3 className="modal-title">
              {lang === 'en' ? 'Customer Login / Register' : 'ग्राहक लॉगिन / नोंदणी'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {!otpStep ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.82rem', color: '#57534e', lineHeight: 1.4 }}>
              {lang === 'en' 
                ? 'Login to identify your orders, track status, and auto-fill delivery details.' 
                : 'ऑर्डर ट्रॅक करण्यासाठी व डिलिव्हरी पत्ता ऑटो-फिल करण्यासाठी लॉगिन करा.'}
            </p>

            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Full Name *' : 'तुमचे पूर्ण नाव *'}</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder={lang === 'en' ? 'e.g. Supriya Deshpande' : 'उदा. सुप्रिया देशपांडे'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Mobile Number *' : 'मोबाईल नंबर *'}</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="98220XXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Default Delivery Address (Optional)' : 'डिलिव्हरी पत्ता (पर्यायी)'}</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#78716c' }} />
                <textarea
                  rows={2}
                  className="form-textarea"
                  style={{ paddingLeft: '38px' }}
                  placeholder={lang === 'en' ? 'Flat no, Society, Area, City...' : 'घर क्र., सोसायटी, परिसर...'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{ background: '#16a34a', marginTop: '6px' }}>
              <span>{lang === 'en' ? 'Continue with OTP' : 'OTP मिळवा व लॉगिन करा'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ShieldCheck size={48} color="#16a34a" />
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{lang === 'en' ? 'Verify OTP' : 'OTP प्रविष्ट करा'}</h4>
              <p style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '2px' }}>
                {lang === 'en' ? `Sent 4-digit code to +91 ${mobile}` : `+91 ${mobile} वर पाठवलेला OTP भरा`}
              </p>
            </div>

            <input
              type="text"
              required
              maxLength={4}
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontWeight: 800 }}
              placeholder="1234"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />

            <button type="submit" className="submit-btn" style={{ background: '#16a34a' }}>
              <CheckCircle size={18} />
              <span>{lang === 'en' ? 'Verify & Complete Login' : 'सत्यापित करा व लॉगिन पूर्ण करा'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
