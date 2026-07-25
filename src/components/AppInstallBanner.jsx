import React, { useState } from 'react';
import { Smartphone, Download, Sparkles, CheckCircle2, X, ShieldCheck, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export default function AppInstallBanner({
  lang,
  deferredPrompt,
  isStandalone,
  onTriggerInstall,
  installCount
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);

  // If already running inside standalone installed PWA
  if (isStandalone) {
    return (
      <div style={{ padding: '0 10px 10px 10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          borderRadius: '12px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          color: 'white',
          boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)',
          border: '1px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#6ee7b7" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {lang === 'en' ? "Anuprita's Kitchen App Installed ✓" : 'अनुप्रिताज किचन ॲप होम स्क्रीनवर सेव्ह आहे ✓'}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
            {lang === 'en' ? 'PWA Active' : 'ॲप ॲक्टिव्ह'}
          </span>
        </div>
      </div>
    );
  }

  if (isDismissed) return null;

  const isPwaSupported = Boolean(deferredPrompt);

  const handleMainButtonClick = () => {
    if (isPwaSupported) {
      onTriggerInstall();
    } else {
      setShowApkGuide(true);
      onTriggerInstall(); // Triggers direct APK download
    }
  };

  return (
    <>
      <div style={{ padding: '0 10px 12px 10px' }}>
        <div 
          style={{
            background: isPwaSupported
              ? 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #451a03 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #311042 100%)',
            color: 'white',
            borderRadius: '16px',
            padding: '14px 16px',
            border: isPwaSupported ? '1.5px solid #f97316' : '1.5px solid #a855f7',
            boxShadow: isPwaSupported 
              ? '0 6px 20px rgba(234, 88, 12, 0.25)' 
              : '0 6px 20px rgba(168, 85, 247, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsDismissed(true)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#d6d3d1',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Dismiss Banner"
          >
            <X size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* App Icon Box */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <img src="/app_icon.png" alt="App Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1, paddingRight: '16px' }}>
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  background: isPwaSupported ? '#ea580c' : '#9333ea',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isPwaSupported ? <Sparkles size={10} /> : <Smartphone size={10} />}
                  {isPwaSupported 
                    ? (lang === 'en' ? 'PWA Supported Browser' : 'PWA इन्स्टॉलेशन सपोर्टेड')
                    : (lang === 'en' ? 'Android APK Download' : 'Direct Android APK')}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>
                  ⭐ 4.9 ({installCount}+ {lang === 'en' ? 'users' : 'वापरकर्ते'})
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 2px 0', color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                {isPwaSupported
                  ? (lang === 'en' ? 'Install Anuprita\'s Kitchen App' : 'अनुप्रिताज किचन ॲप इन्स्टॉल करा')
                  : (lang === 'en' ? 'Download Android APK App' : 'Android APK ॲप डाउनलोड करा')}
              </h3>

              {/* Subtitle */}
              <p style={{ fontSize: '0.73rem', color: '#e7e5e4', margin: '0 0 10px 0', lineHeight: 1.35 }}>
                {isPwaSupported
                  ? (lang === 'en' 
                      ? 'Add to mobile home screen for 1-click ordering, instant tiffin alerts & offline menu.' 
                      : '१-क्लिक ऑर्डरिंग व ताज्या डबा अपडेट्ससाठी मोबाईल होम स्क्रीनवर ॲप जोडा.')
                  : (lang === 'en' 
                      ? 'Download official Android APK for direct phone installation & fast tiffin ordering.' 
                      : 'थेट फोनवर इन्स्टॉल करण्यासाठी ऑफिशियल अँड्रॉइड APK ॲप डाऊनलोड करा.')}
              </p>

              {/* Action Buttons Container */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={handleMainButtonClick}
                  style={{
                    background: isPwaSupported
                      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                      : 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isPwaSupported
                      ? '0 4px 12px rgba(234, 88, 12, 0.4)'
                      : '0 4px 12px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  {isPwaSupported ? (
                    <>
                      <Smartphone size={14} />
                      <span>{lang === 'en' ? 'Install App (1-Tap)' : '📲 ॲप इन्स्टॉल करा'}</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>{lang === 'en' ? 'Download APK (Android)' : '🤖 APK डाउनलोड करा'}</span>
                    </>
                  )}
                  <ArrowRight size={12} />
                </button>

                {!isPwaSupported && (
                  <button
                    onClick={() => setShowApkGuide(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Info size={12} />
                    <span>{lang === 'en' ? 'How to Install?' : 'कसे इन्स्टॉल करावे?'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APK Installation Steps Modal */}
      {showApkGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            color: '#1c1917'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '10px', color: '#7e22ce' }}>
                  <Download size={18} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1e1b4b' }}>
                  {lang === 'en' ? 'Android APK Installation Guide' : 'अँड्रॉइड APK इन्स्टॉलेशन मार्गदर्शन'}
                </h3>
              </div>
              <button
                onClick={() => setShowApkGuide(false)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.4 }}>
              <strong>{lang === 'en' ? 'Downloading started!' : 'डाऊनलोड सुरु झाले आहे!'}</strong> {lang === 'en' ? 'Your device is downloading ' : 'तुमच्या फोनवर '}
              <code style={{ background: '#dbeafe', padding: '1px 4px', borderRadius: '4px' }}>anupritas_kitchen.apk</code>
            </div>

            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, margin: '0 0 8px 0', color: '#374151' }}>
              {lang === 'en' ? 'Simple 3-Step Installation:' : 'इन्स्टॉल करण्याच्या सोप्या ३ पायऱ्या:'}
            </h4>

            <ol style={{ paddingLeft: '18px', margin: '0 0 16px 0', fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.6 }}>
              <li>
                <strong>{lang === 'en' ? 'Open Downloaded File:' : 'फाईल ओपन करा:'}</strong> {lang === 'en' ? 'Tap on notification or downloads folder to open ' : 'नोटिफिकेशन किंवा डाउनलोड्स फोल्डरमध्ये '} <code>anupritas_kitchen.apk</code>.
              </li>
              <li>
                <strong>{lang === 'en' ? 'Allow Unknown Apps:' : 'परवानगी द्या:'}</strong> {lang === 'en' ? 'If Chrome prompts "Install unknown apps", click Settings & enable "Allow from this source".' : 'जर फोन "Unknown Apps" ची वॉर्निंग दाखवेल, तर Settings मध्ये जाऊन "Allow" पर्याय सुरू करा.'}
              </li>
              <li>
                <strong>{lang === 'en' ? 'Tap Install:' : 'इन्स्टॉल बटनावर क्लिक करा:'}</strong> {lang === 'en' ? 'Click Install and enjoy Anuprita\'s Kitchen app on your home screen!' : 'इन्स्टॉल बटनावर क्लिक करून होम स्क्रीनवरून सोप्या पद्धतीने ऑर्डर करा!'}
              </li>
            </ol>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="/anupritas_kitchen.apk"
                download="Anupritas_Kitchen_Pure_Veg.apk"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>{lang === 'en' ? 'Re-Download APK' : 'पुन्हा APK डाउनलोड करा'}</span>
              </a>
              <button
                onClick={() => setShowApkGuide(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {lang === 'en' ? 'Got It' : 'समजले'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
