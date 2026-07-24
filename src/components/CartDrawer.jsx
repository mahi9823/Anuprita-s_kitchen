import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Trash2, CheckCircle2, User, Phone, MapPin, Send } from 'lucide-react';
import VegSymbol from './VegSymbol';

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
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [deliveryNote, setDeliveryNote] = useState('');

  const cartList = Object.keys(cartItems).map((id) => {
    const item = foodItems.find((f) => f.id === id);
    return {
      ...item,
      qty: cartItems[id]
    };
  }).filter(Boolean);

  const subtotal = cartList.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 30) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSendWhatsAppOrder = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert(lang === 'en' ? 'Please enter your name and phone number.' : 'कृपया तुमचे नाव व नंबर भरा.');
      return;
    }

    const itemizedText = cartList
      .map(
        (item) =>
          `• ${lang === 'en' ? item.titleEn : item.titleMr} x ${item.qty} = ₹${
            item.price * item.qty
          }`
      )
      .join('%0A');

    const msgEn =
      `🚩 *NEW ORDER - ANUPRITA'S KITCHEN* 🚩%0A%0A` +
      `👤 *Customer Name:* ${customerName}%0A` +
      `📱 *Mobile Number:* ${customerPhone}%0A` +
      `📍 *Delivery Address:* ${deliveryAddress || 'Home Pickup'}%0A` +
      (deliveryNote ? `📝 *Special Note:* ${deliveryNote}%0A` : '') +
      `----------------------------------------%0A` +
      `🍽️ *ORDERED ITEMS (1 Day Prior Booking):*%0A` +
      `${itemizedText}%0A` +
      `----------------------------------------%0A` +
      `💵 *Subtotal:* ₹${subtotal}%0A` +
      `🚚 *Delivery Fee:* ₹${deliveryFee === 0 ? 'FREE' : deliveryFee}%0A` +
      `💰 *GRAND TOTAL AMOUNT:* ₹${grandTotal}%0A%0A` +
      `Hello *Reva Hosing*! Please confirm my order. Thank you! 🙏`;

    const orderData = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customerName,
      customerPhone,
      customerAddress: deliveryAddress,
      itemsSummary: cartList.map(i => (lang === 'en' ? i.titleEn : i.titleMr) + ' x' + i.qty).join(', '),
      total: grandTotal,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };

    onOrderPlaced(orderData);

    const targetPhone = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/91${targetPhone}?text=${msgEn}`, '_blank');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#ea580c" />
            <h3 className="modal-title">
              {lang === 'en' ? 'Your Food Basket' : 'तुमची ऑर्डर बास्केट'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {cartList.length > 0 && (
              <button
                onClick={onClearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {lang === 'en' ? 'Clear' : 'खाली करा'}
              </button>
            )}
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {cartList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#78716c' }}>
            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {lang === 'en' ? 'Your basket is currently empty.' : 'तुमची बास्केट रिकामी आहे.'}
            </p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
              {lang === 'en' ? 'Select delicious veg items to order.' : 'स्वादिष्ट शाकाहारी पदार्थ निवडा.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {cartList.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image} alt={item.titleMr} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">
                      {lang === 'en' ? item.titleEn : item.titleMr}
                    </h4>
                    <div className="cart-item-price">
                      ₹{item.price} x {item.qty} = <strong style={{ color: '#ea580c' }}>₹{item.price * item.qty}</strong>
                    </div>
                  </div>

                  <div className="stepper" style={{ transform: 'scale(0.9)' }}>
                    <button
                      className="stepper-btn"
                      onClick={() => onUpdateCart(item.id, item.qty - 1)}
                    >
                      -
                    </button>
                    <span className="stepper-val">{item.qty}</span>
                    <button
                      className="stepper-btn"
                      onClick={() => onUpdateCart(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#57534e' }}>
                <span>{lang === 'en' ? 'Subtotal' : 'पदार्थांची एकूण किंमत'}</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#57534e' }}>
                <span>{lang === 'en' ? 'Delivery Fee' : 'डिलिव्हरी शुल्क'}</span>
                <span>{deliveryFee === 0 ? <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE</span> : '₹' + deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800, color: '#9a3412', borderTop: '1px dashed #fdba74', paddingTop: '4px', marginTop: '2px' }}>
                <span>{lang === 'en' ? 'Grand Total Amount' : 'एकूण बिल रक्कम'}</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleSendWhatsAppOrder} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Your Full Name *' : 'तुमचे नाव *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="उदा. राहुल शर्मा"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'WhatsApp Mobile Number *' : 'व्हॉट्सॲप नंबर *'}</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="9403276767"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Delivery Address' : 'डिलिव्हरीचा पत्ता'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="फ्लॅट क्र, सोसायटी, परिसर..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '4px', background: '#25D366' }}>
                <Send size={16} />
                <span>{lang === 'en' ? 'Send Order to Reva Hosing via WhatsApp' : 'रेवा होसिंग ताईंना व्हॉट्सॲपवर ऑर्डर पाठवा'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
