import React, { useState } from 'react';
import { Smartphone, Download, Sparkles, CheckCircle2, X, ShieldCheck, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export default function AppInstallBanner({
  lang,
  deferredPrompt,
  isStandalone,
  onTriggerInstall,
  installCount
}) {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('anuprita_install_banner_dismissed') === 'true';
  });
  const [showApkGuide, setShowApkGuide] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('anuprita_install_banner_dismissed', 'true');
  };

  // If already running inside standalone installed PWA
  if (isStandalone || isDismissed) {
    return null;
  }

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
      <div style={{ padding: '4px 10px 8px 10px' }}>
        <div 
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '8px 12px',
            border: '1px solid #3f3f46',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <img src="/app_icon.png" alt="App Icon" style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0, objectFit: 'cover' }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isPwaSupported
                  ? (lang === 'en' ? 'Anuprita\'s Kitchen App' : 'अनुप्रिताज किचन ॲप')
                  : (lang === 'en' ? 'Download Android App' : 'अँड्रॉइड ॲप डाउनलोड करा')}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lang === 'en' ? 'Fast ordering from home screen' : 'होम स्क्रीनवरून जलद ऑर्डर करा'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={handleMainButtonClick}
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: 'white',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Smartphone size={11} />
              <span>{lang === 'en' ? 'Install' : 'इन्स्टॉल'}</span>
            </button>

            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71717a',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
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
