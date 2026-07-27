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

        {/* TOP RIGHT ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {/* CUSTOMER LOGIN / PROFILE AVATAR BUTTON */}
          {!isOwnerMode && (
            currentUser ? (
              <button
                onClick={onOpenProfile}
                title={lang === 'en' ? `Customer Account: ${currentUser.name}` : `ग्राहक खाते: ${currentUser.name}`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1.5px solid #f59e0b',
                  color: '#78350f',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)',
                  flexShrink: 0
                }}
              >
                {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U'}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogIn size={13} />
                <span>{lang === 'en' ? 'Login' : 'लॉगिन'}</span>
              </button>
            )
          )}

          {/* LANGUAGE TOGGLE */}
          <button 
            className="lang-btn" 
            onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
            title="Switch Language"
            style={{ padding: '5px 9px', fontSize: '0.72rem', borderRadius: '16px' }}
          >
            <Globe size={13} />
            <span>{lang === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* COMPACT ROUND TOP RIGHT OWNER BUTTON */}
          <button
            onClick={() => setIsOwnerMode(!isOwnerMode)}
            title={isOwnerMode ? (lang === 'en' ? '👑 Owner Mode Active' : '👑 मालक मोड सुरू') : (lang === 'en' ? '👑 Owner Admin Mode' : '👑 मालक लॉगिन मोड')}
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
          <Search size={16} className="search-icon" color="#9ca3af" />
          <input
            type="text"
            className="search-input"
            placeholder={
              lang === 'en' 
                ? 'Search: Puran Poli, Modak, Veg Thali, Idli...' 
                : 'शोधा: पुरणपोळी, इडली, वाडा पाव, पिठलं भाकरी...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#e5e7eb',
                border: 'none',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4b5563',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </header>
  );
}
