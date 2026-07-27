import React from 'react';
import { ShoppingBag, CheckCircle2, Calendar, Send, Sparkles } from 'lucide-react';
import { TIFFIN_PACKAGES } from '../data/foodData';

export default function TiffinPlans({ lang, whatsappNumber }) {
  const handleInquireTiffin = (pkg) => {
    const title = lang === 'en' ? pkg.titleEn : pkg.titleMr;
    const msgEn = `Hello Reva Hosing! I would like to inquire about the *${title}* for daily lunch tiffin service.%0A%0A` +
      `📌 *Package:* ${title}%0A` +
      `💰 *Price:* ₹${pkg.price} (${lang === 'en' ? pkg.unitEn : pkg.unitMr})%0A%0A` +
      `Please let me know start date & details. Thank you!`;

    const targetPhone = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/91${targetPhone}?text=${msgEn}`, '_blank');
  };

  return (
    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)' }}>
        <span className="welcome-badge">
          <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
          {lang === 'en' ? 'Daily Pure Veg Home Tiffin Service' : 'रोजचा घरगुती शुद्ध शाकाहारी डबा'}
        </span>
        <h2 className="welcome-title">
          {lang === 'en' ? 'Healthy Homemade Daily Tiffin Plans' : 'स्वादिष्ट व पौष्टिक घरगुती डबा योजना'}
        </h2>
        <p className="welcome-subtitle">
          {lang === 'en' 
            ? 'Freshly cooked home meals delivered for lunch. Book 1 day in advance.' 
            : 'दुपारच्या जेवणासाठी गरमागरम शुद्ध घरगुती डबा. १ दिवस आधी नाव नोंदणी करा.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TIFFIN_PACKAGES.map((pkg) => (
          <div key={pkg.id} className="food-card" style={{ padding: '12px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c1917' }}>
                  {lang === 'en' ? pkg.titleEn : pkg.titleMr}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                  <Calendar size={10} /> {lang === 'en' ? pkg.advanceNoticeEn : pkg.advanceNoticeMr}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ea580c' }}>₹{pkg.price}</span>
                <div style={{ fontSize: '0.68rem', color: '#78716c' }}>{lang === 'en' ? pkg.unitEn : pkg.unitMr}</div>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#57534e', lineHeight: 1.35 }}>
              {lang === 'en' ? pkg.descriptionEn : pkg.descriptionMr}
            </p>

            <button 
              className="submit-btn" 
              onClick={() => handleInquireTiffin(pkg)}
              style={{ marginTop: '4px', padding: '8px', fontSize: '0.8rem' }}
            >
              <Send size={14} />
              <span>{lang === 'en' ? 'Book Tiffin Plan via WhatsApp' : 'व्हॉट्सॲपवर डबा योजना बुक करा'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
