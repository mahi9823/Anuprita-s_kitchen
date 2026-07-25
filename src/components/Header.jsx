import React from 'react';
import { Search, Globe, Sparkles, Utensils, User, LogIn, ShieldCheck, Smartphone, Download, CheckCircle2 } from 'lucide-react';
import VegSymbol from './VegSymbol';

export default function Header({ 
  lang, 
  setLang, 
  searchQuery, 
  setSearchQuery, 
  isOwnerMode, 
  setIsOwnerMode,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  deferredPrompt,
  isStandalone,
  onTriggerInstall
}) {
  return (
    <header className="header-bar">
      <div className="header-top">
        <div className="brand-info">
          <div className="brand-logo" style={{ padding: '0', overflow: 'hidden' }}>
            <img src="/app_icon.png" alt="Anuprita's Kitchen Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="brand-title-fancy">
                Anuprita's Kitchen
              </h1>
              <VegSymbol size={18} />
            </div>
            <p className="brand-subtitle">
              {lang === 'en' ? '100% Pure Veg Home Catering' : '१००% घरगुती शुद्ध शाकाहारी कॅटरिंग'}
            </p>
          </div>
        </div>

        {/* TOP RIGHT ACTION BUTTONS: PROMINENT OWNER TAB & INSTALL BUTTON */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* APP INSTALL / DOWNLOAD APK HEADER BUTTON (Only when app is NOT installed) */}
          {!isOwnerMode && !isStandalone && (
            deferredPrompt ? (
              <button
                onClick={onTriggerInstall}
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  border: '1px solid #86efac',
                  color: 'white',
                  padding: '5px 9px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)'
                }}
                title={lang === 'en' ? 'Install App on Home Screen' : 'मोबाईल होम स्क्रीनवर ॲप इन्स्टॉल करा'}
              >
                <Smartphone size={12} />
                <span>{lang === 'en' ? 'Install App' : 'ॲप इन्स्टॉल'}</span>
              </button>
            ) : (
              <button
                onClick={onTriggerInstall}
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                  border: '1px solid #c084fc',
                  color: 'white',
                  padding: '5px 9px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(147, 51, 234, 0.4)'
                }}
                title={lang === 'en' ? 'Download Android APK' : 'अँड्रॉइड APK डाउनलोड करा'}
              >
                <Download size={12} />
                <span>{lang === 'en' ? 'Download APK' : 'APK डाउनलोड'}</span>
              </button>
            )
          )}

          {/* CUSTOMER LOGIN / PROFILE BUTTON */}
          {!isOwnerMode && (
            currentUser ? (
              <button
                onClick={onOpenProfile}
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  color: '#92400e',
                  padding: '5px 9px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <User size={12} />
                <span>{currentUser.name.split(' ')[0]} 👋</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '5px 9px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogIn size={12} />
                <span>{lang === 'en' ? 'Login' : 'लॉगिन'}</span>
              </button>
            )
          )}

          {/* LANGUAGE TOGGLE */}
          <button 
            className="lang-btn" 
            onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
            title="Switch Language"
            style={{ padding: '5px 8px', fontSize: '0.7rem' }}
          >
            <Globe size={12} />
            <span>{lang === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* COMPACT ROUND TOP RIGHT OWNER BUTTON */}
          <button
            onClick={() => setIsOwnerMode(!isOwnerMode)}
            title={isOwnerMode ? (lang === 'en' ? '👑 Owner Mode Active (Click for Customer Mode)' : '👑 मालक मोड सुरू (ग्राहक मोडवर जाण्यासाठी क्लिक करा)') : (lang === 'en' ? '👑 Owner Admin Mode' : '👑 मालक लॉगिन मोड')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isOwnerMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              border: '1.5px solid #fde047',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.45)',
              flexShrink: 0
            }}
          >
            👑
          </button>
        </div>
      </div>

      {!isOwnerMode && (
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={
              lang === 'en' 
                ? 'Search: Puran Poli, Modak, Veg Thali, Idli, Wada Pav...' 
                : 'शोधा: पुरणपोळी, इडली, वाडा पाव, पिठलं भाकरी...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
    </header>
  );
}
