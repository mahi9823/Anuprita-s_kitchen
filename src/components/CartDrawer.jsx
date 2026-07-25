import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, CheckCircle, AlertCircle, Sparkles, MapPin, User, Phone, Navigation } from 'lucide-react';

export default function CartDrawer({
  cartItems,
  foodItems,
  lang,
  onClose,
  onUpdateCart,
  onClearCart,
  whatsappNumber,
  onOrderPlaced,
  currentUser
}) {
  const [custName, setCustName] = useState(currentUser?.name || '');
  const [custPhone, setCustPhone] = useState(currentUser?.mobile || currentUser?.phone || '');
  const [custAddress, setCustAddress] = useState(currentUser?.address || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect current GPS location
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'तुमच्या ब्राऊजरमध्ये GPS सपोर्ट उपलब्ध नाही.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        
        setCustAddress((prev) => {
          const currentText = prev ? prev + ' ' : '';
          return `${currentText}[📍 GPS लोकेशन: https://maps.google.com/?q=${lat},${lng}]`;
        });

        setIsLocating(false);
        alert(lang === 'en' ? 'Exact GPS Location attached successfully!' : 'तुमचे अचूक GPS लोकेशन जोडले गेले आहे!');
      },
      (error) => {
        setIsLocating(false);
        alert(lang === 'en' ? 'Unable to retrieve location. Please type manually.' : 'लोकेशन मिळवता आले नाही. कृपया पत्ता हाताने टाईप करा.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Compute cart items array with custom extra add-ons
  const cartList = Object.entries(cartItems).map(([itemId, cartVal]) => {
    const item = foodItems.find((f) => f.id === itemId);
    if (!item) return null;

    const qty = typeof cartVal === 'object' ? cartVal.qty : cartVal;
    const addons = typeof cartVal === 'object' ? (cartVal.addons || []) : [];

    const addonsTotal = addons.reduce((sum, a) => sum + (a.price * a.qty), 0);
    const unitPrice = item.price + addonsTotal;

    return {
      item,
      qty,
      addons,
      unitPrice,
      itemTotal: unitPrice * qty
    };
  }).filter(Boolean);

  const subtotal = cartList.reduce((acc, curr) => acc + curr.itemTotal, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!custName || !custPhone || !custAddress) {
      alert(lang === 'en' ? 'Please fill all customer details.' : 'कृपया नाव, फोन नंबर व पत्ता भरा.');
      return;
    }

    setIsSubmitting(true);

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const itemsSummary = cartList.map((c) => {
      const addonText = c.addons.length > 0 
        ? ` (${c.addons.map(a => `+${a.qty}x ${a.nameMr}`).join(', ')})`
        : '';
      return `${c.qty}x ${lang === 'en' ? c.item.titleEn : c.item.titleMr}${addonText}`;
    }).join(', ');

    const orderData = {
      id: orderId,
      customerName: custName,
      customerPhone: custPhone,
      customerAddress: custAddress,
      itemsSummary,
      total: subtotal,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };

    // Save order history locally
    onOrderPlaced(orderData);

    // Format WhatsApp order message sent to Reva Hosing (9403276767)
    let waMessage = `*🚩 नवीन जेवण / थाळी ऑर्डर (${orderId})*\n\n`;
    waMessage += `*ग्राहक नाव:* ${custName}\n`;
    waMessage += `*फोन नंबर:* ${custPhone}\n`;
    waMessage += `*डिलिव्हरी पत्ता व मॅप:* ${custAddress}\n\n`;
    waMessage += `*ऑर्डर केलेले पदार्थ:*\n`;

    cartList.forEach((c, idx) => {
      waMessage += `${idx + 1}. *${c.item.titleMr}* x ${c.qty} = ₹${c.itemTotal}\n`;
      if (c.addons.length > 0) {
        c.addons.forEach((a) => {
          waMessage += `   └─ ➕ *${a.nameMr}* (${a.qty} नग) = +₹${a.price * a.qty}\n`;
        });
      }
    });

    waMessage += `\n*एकूण बिल रक्कम:* ₹${subtotal}\n`;
    waMessage += `*ऑर्डर वेळ:* १ दिवस आधी बुक केली.\n\n`;
    waMessage += `_अनुप्रिताज किचन मोबाईल ॲपवरून पाठवले._`;

    const encodedMsg = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/91${whatsappNumber}?text=${encodedMsg}`;

    window.open(waUrl, '_blank');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '16px 20px', background: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#ea580c" />
            <h3 className="modal-title" style={{ color: '#9a3412' }}>
              {lang === 'en' ? 'Your Food Basket' : 'तुमची जेवणाची बास्केट'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {cartList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#78716c' }}>
              <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ fontWeight: 700 }}>
                {lang === 'en' ? 'Your basket is empty.' : 'तुमच्या बास्केटमध्ये कोणताही पदार्थ नाही.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Selected Cart Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cartList.map(({ item, qty, addons, unitPrice, itemTotal }) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      background: '#fcfaf8',
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1px solid #e7e5e4'
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.titleMr}
                      style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/app_icon.png'; }}
                    />

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c1917' }}>
                        {lang === 'en' ? item.titleEn : item.titleMr}
                      </h4>

                      {/* Render custom extra add-ons */}
                      {addons.length > 0 && (
                        <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          {addons.map((a, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 800 }}>
                              + {a.qty}x {lang === 'en' ? a.nameEn : a.nameMr} (+₹{a.price * a.qty})
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 800, marginTop: '2px' }}>
                        ₹{itemTotal} <span style={{ fontSize: '0.68rem', color: '#78716c', fontWeight: 500 }}>(₹{unitPrice} x {qty})</span>
                      </div>
                    </div>

                    <div className="stepper" style={{ padding: '2px 6px' }}>
                      <button className="stepper-btn" onClick={() => onUpdateCart(item.id, qty - 1)}>
                        <Minus size={12} />
                      </button>
                      <span className="stepper-val" style={{ fontSize: '0.85rem' }}>{qty}</span>
                      <button className="stepper-btn" onClick={() => onUpdateCart(item.id, qty + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Card */}
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#065f46', fontSize: '0.9rem' }}>
                  {lang === 'en' ? 'Total Bill Amount:' : 'एकूण बिल रक्कम:'}
                </span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.3rem' }}>
                  ₹{subtotal}
                </span>
              </div>

              {/* Customer Details Form */}
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={15} color="#ea580c" />
                  <span>{lang === 'en' ? 'Delivery Details:' : 'डिलिव्हरीसाठी तुमची माहिती भरा:'}</span>
                </h4>

                <div className="form-group">
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder={lang === 'en' ? 'Full Name *' : 'तुमचे नाव *'}
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <input 
                    type="tel" 
                    required 
                    className="form-input" 
                    placeholder={lang === 'en' ? 'WhatsApp Mobile Number *' : 'व्हॉट्सॲप मोबाईल नंबर *'}
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#44403c' }}>
                      {lang === 'en' ? 'Delivery Address *' : 'संपूर्ण पत्ता *'}
                    </label>

                    {/* Auto GPS Detect Button */}
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '10px',
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Navigation size={11} className={isLocating ? 'spin-icon' : ''} />
                      <span>{isLocating ? (lang === 'en' ? 'Locating...' : 'शोधत आहे...') : (lang === 'en' ? '📍 Add GPS Location' : '📍 माझे GPS लोकेशन जोडा')}</span>
                    </button>
                  </div>

                  <textarea 
                    rows={2} 
                    required 
                    className="form-textarea" 
                    placeholder={lang === 'en' ? 'Complete Delivery Address & Landmark *' : 'घर नंबर, सोसायटी नाव, एरिया व लँडमार्क *'}
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="submit-btn" 
                  style={{ background: '#25D366', marginTop: '6px', fontSize: '0.95rem' }}
                >
                  <Send size={18} />
                  <span>
                    {isSubmitting 
                      ? (lang === 'en' ? 'Sending...' : 'पाठवत आहे...') 
                      : (lang === 'en' ? 'Confirm & Send Order via WhatsApp' : 'ऑर्डर नक्की करा व व्हॉट्सॲपवर पाठवा')}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
