import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle, ShieldCheck } from 'lucide-react';

export default function OwnerPinModal({ lang, onClose, onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerifyPin = (e) => {
    e.preventDefault();
    // Owner PIN Security Check
    if (pin === '1234' || pin === '9403') {
      onLoginSuccess();
    } else {
      setErrorMsg(lang === 'en' ? 'Incorrect Security PIN!' : 'चुकीचा मालक पिन!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="#ea580c" />
            <h3 className="modal-title">{lang === 'en' ? 'Owner Security Login' : 'रेवा होसिंग मालक लॉगिन'}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleVerifyPin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '50%', border: '1.5px solid #fed7aa' }}>
              <KeyRound size={40} color="#ea580c" />
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
              {lang === 'en' ? 'Enter 4-Digit Owner PIN' : '४-अंकी मालक पिन प्रविष्ट करा'}
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '2px' }}>
              {lang === 'en' ? 'To add, remove dishes & edit daily menu' : 'रोजचे मेनू पदार्थ जोडण्यासाठी व काढण्यासाठी'}
            </p>
          </div>

          <div className="form-group">
            <input
              type="password"
              required
              maxLength={4}
              autoFocus
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '10px', fontWeight: 800 }}
              placeholder="••••"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setErrorMsg(''); }}
            />
          </div>

          {errorMsg && (
            <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>
              {errorMsg}
            </span>
          )}

          <button type="submit" className="submit-btn" style={{ background: '#ea580c' }}>
            <ShieldCheck size={18} />
            <span>{lang === 'en' ? 'Login to Owner Panel' : 'मालक डॅशबोर्ड उघडा'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
