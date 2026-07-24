import React, { useState } from 'react';
import { Users, Calculator, Send, CheckCircle2, Sparkles, Leaf } from 'lucide-react';
import { CATERING_PACKAGES } from '../data/foodData';

export default function CateringCalculator({ lang, whatsappNumber }) {
  const [guestCount, setGuestCount] = useState(30);
  const [eventType, setEventType] = useState('satyanarayan');
  const [selectedDessert, setSelectedDessert] = useState('modak');
  const [selectedMain, setSelectedMain] = useState('veg_thali');

  const calculateEstimate = () => {
    const count = parseInt(guestCount) || 1;
    let ratePerHead = 190;

    if (selectedMain === 'pithla_bhakri') ratePerHead = 150;
    if (selectedMain === 'royal_feast') ratePerHead = 260;

    if (selectedDessert === 'modak') ratePerHead += 30;
    if (selectedDessert === 'puran_poli') ratePerHead += 40;

    const totalCost = count * ratePerHead;

    const puranPoliCount = count * 2;
    const modakCount = count * 2;
    const sweetKg = (count * 0.1).toFixed(1);
    const riceKg = (count * 0.15).toFixed(1);
    const dalLiters = (count * 0.12).toFixed(1);

    return {
      ratePerHead,
      totalCost,
      puranPoliCount,
      modakCount,
      sweetKg,
      riceKg,
      dalLiters
    };
  };

  const est = calculateEstimate();

  const handleSendWhatsAppEstimate = () => {
    const textMr = `नमस्ते अनुप्रिता ताई! मला *Anuprita's Kitchen* च्या शाकाहारी कॅटरिंग ऑर्डरची चौकशी करायची आहे:%0A%0A` +
      `📌 *कार्यक्रम:* ${eventType}%0A` +
      `👥 *पाहुणे (Guests):* ${guestCount} जण%0A` +
      `🍲 *मुख्य जेवण:* ${selectedMain}%0A` +
      `🍨 *गोड पदार्थ:* ${selectedDessert}%0A` +
      `💰 *अंदाजे एकूण खर्च:* ₹${est.totalCost} (अंदाजे ₹${est.ratePerHead}/व्यक्ति)%0A%0A` +
      `कृपया माझ्यासाठी कोटेशन व वेळ कन्फर्म करा. धन्यवाद!`;

    const textEn = `Hello Anuprita! I would like to inquire about pure veg bulk catering for my event:%0A%0A` +
      `📌 *Event:* ${eventType}%0A` +
      `👥 *Guests:* ${guestCount}%0A` +
      `🍲 *Main Course:* ${selectedMain}%0A` +
      `🍨 *Dessert:* ${selectedDessert}%0A` +
      `💰 *Est Total:* ₹${est.totalCost} (Approx ₹${est.ratePerHead}/head)%0A%0A` +
      `Please confirm availability & quotation. Thank you!`;

    const message = lang === 'en' ? textEn : textMr;
    const targetPhone = whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/91${targetPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="welcome-banner">
        <span className="welcome-badge">
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
          {lang === 'en' ? '100% Pure Veg Catering Calculator' : '१००% शुद्ध शाकाहारी कॅटरिंग मोजणी'}
        </span>
        <h2 className="welcome-title">
          {lang === 'en' ? "Anuprita's Kitchen Budget Estimator" : "Anuprita's Kitchen कॅटरिंग बजेट मोजणी"}
        </h2>
        <p className="welcome-subtitle">
          {lang === 'en' 
            ? 'Get instant accurate estimates for food quantity in Kg/Pcs and total budget for pure veg events.' 
            : 'सत्यनारायण पूजा, लग्न किंवा घरगुती सोहळ्यासाठी शाकाहारी अन्नाचा अचूक अंदाज काढा.'}
        </p>
      </div>

      {/* Guest count slider & input */}
      <div className="calc-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} color="#ea580c" />
            <span>{lang === 'en' ? 'Total Guests Count:' : 'एकूण पाहुण्यांची संख्या (Guests Count):'}</span>
          </label>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ea580c' }}>
            {guestCount} {lang === 'en' ? 'Pax' : 'जण'}
          </span>
        </div>

        <input 
          type="range" 
          min="10" 
          max="300" 
          step="5"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          style={{ accentColor: '#ea580c', cursor: 'pointer', width: '100%', height: '8px' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {[15, 30, 50, 100, 200].map((num) => (
            <button
              key={num}
              onClick={() => setGuestCount(num)}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: guestCount === num ? '1.5px solid #ea580c' : '1px solid #d6d3d1',
                background: guestCount === num ? '#ea580c' : 'white',
                color: guestCount === num ? 'white' : '#44403c',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {num} {lang === 'en' ? 'Pax' : 'व्यक्ती'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu options selection */}
      <div className="calc-card" style={{ background: 'white' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c1917', marginBottom: '8px' }}>
          {lang === 'en' ? 'Select Veg Catering Options:' : 'शाकाहारी मेनू निवड (Veg Options):'}
        </h3>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Main Course:' : 'मुख्य जेवण (Main Veg Dishes):'}</label>
          <select className="form-select" value={selectedMain} onChange={(e) => setSelectedMain(e.target.value)}>
            <option value="veg_thali">{lang === 'en' ? 'Shahi Veg Feast Thali' : 'शाही शाकाहारी मेजवानी थाळी'}</option>
            <option value="pithla_bhakri">{lang === 'en' ? 'Pithla Bhakri & Kharda Thecha' : 'गावरान पिठलं भाकरी व ठेचा'}</option>
            <option value="royal_feast">{lang === 'en' ? 'Royal Modak/Amrakhand Feast' : 'रॉयल अम्रखंड/मोदक थाळी'}</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: '8px' }}>
          <label className="form-label">{lang === 'en' ? 'Sweet Option:' : 'गोड पदार्थ (Sweet Item):'}</label>
          <select className="form-select" value={selectedDessert} onChange={(e) => setSelectedDessert(e.target.value)}>
            <option value="modak">{lang === 'en' ? 'Ukadiche Modak' : 'गरमागरम उकडीचे मोदक (Ukadiche Modak)'}</option>
            <option value="puran_poli">{lang === 'en' ? 'Puran Poli with Ghee' : 'साजूक तुपातील पुरणपोळी (Puran Poli)'}</option>
            <option value="gulab_jamun">{lang === 'en' ? 'Keshari Basundi / Jamun' : 'केसरी बासुंदी / गुलाबजामुन (Basundi/Jamun)'}</option>
          </select>
        </div>
      </div>

      {/* Estimation display */}
      <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calculator size={18} color="#ea580c" />
          <span>{lang === 'en' ? 'Estimated Requirement Summary:' : 'अन्नधान्य व खर्चाचा अंदाज:'}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
          <div style={{ background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
            <span style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 700 }}>
              {selectedDessert === 'puran_poli' ? (lang === 'en' ? 'Puran Polis Needed' : 'पुरणपोळ्या लागतील') : (lang === 'en' ? 'Modaks Needed' : 'मोदक लागतील')}
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c' }}>
              {selectedDessert === 'puran_poli' ? est.puranPoliCount : est.modakCount} {lang === 'en' ? 'Pcs' : 'नग'}
            </div>
          </div>

          <div style={{ background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
            <span style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 700 }}>
              {lang === 'en' ? 'Rice Required' : 'तांदूळ (भातासाठी)'}
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c' }}>
              {est.riceKg} {lang === 'en' ? 'Kg' : 'किग्रॅ'}
            </div>
          </div>

          <div style={{ background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
            <span style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 700 }}>
              {lang === 'en' ? 'Dal / Amti' : 'वरण / आमटी'}
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c' }}>
              {est.dalLiters} {lang === 'en' ? 'Ltrs' : 'लीटर'}
            </div>
          </div>

          <div style={{ background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
            <span style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 700 }}>
              {lang === 'en' ? 'Estimated Cost' : 'अंदाजे एकूण खर्च'}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c2410c' }}>
              ₹{est.totalCost}
            </div>
          </div>
        </div>

        <button
          className="submit-btn"
          onClick={handleSendWhatsAppEstimate}
          style={{ width: '100%', marginTop: '16px' }}
        >
          <Send size={18} />
          <span>{lang === 'en' ? 'Send Inquiry to Anuprita via WhatsApp' : 'अनुप्रिता ताईंना व्हॉट्सॲपवर पाठवा'}</span>
        </button>
      </div>

      {/* Pre-packaged catering deals */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1c1917', marginTop: '8px' }}>
        {lang === 'en' ? 'Pure Veg Catering Packages' : 'शाकाहारी रेडीमेड कॅटरिंग पॅकेजेस'}
      </h3>

      {CATERING_PACKAGES.map((pkg) => (
        <div key={pkg.id} className="food-card" style={{ padding: '16px', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ea580c' }}>
              {lang === 'en' ? pkg.titleEn : pkg.titleMr}
            </h4>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
              ₹{pkg.pricePerHead} / {lang === 'en' ? 'Head' : 'व्यक्ति'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(lang === 'en' ? pkg.menuIncludesEn : pkg.menuIncludesMr).map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.82rem', color: '#44403c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#ea580c" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
