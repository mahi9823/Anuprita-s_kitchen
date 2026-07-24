import React from 'react';
import { Search, Globe, Sparkles, Utensils, User, LogIn, ShieldCheck } from 'lucide-react';
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
  onOpenProfile
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

        {/* TOP RIGHT ACTION BUTTONS: PROMINENT OWNER TAB */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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

          {/* PROMINENT TOP RIGHT OWNER TAB BUTTON */}
          <button
            onClick={() => setIsOwnerMode(!isOwnerMode)}
            style={{
              background: isOwnerMode ? '#f59e0b' : '#ea580c',
              border: '1.5px solid #fde047',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
            }}
          >
            <ShieldCheck size={13} color="#fef08a" />
            <span>{isOwnerMode ? (lang === 'en' ? 'Customer Mode' : 'ग्राहक मोड') : (lang === 'en' ? '👑 Owner' : '👑 मालक')}</span>
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
