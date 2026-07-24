import React from 'react';
import { X, User, Phone, MapPin, Clock, PackageCheck, LogOut, ShoppingBag } from 'lucide-react';

export default function CustomerOrdersModal({ currentUser, ordersList, lang, onClose, onLogout }) {
  // Filter orders matching current user's mobile or ID
  const myOrders = ordersList.filter((o) => 
    o.mobileNumber === currentUser?.mobile || o.customerName === currentUser?.name
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#16a34a" />
            <h3 className="modal-title">{lang === 'en' ? 'My Customer Profile' : 'माझे प्रोफाइल व ऑर्डर्स'}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Customer Info Card */}
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}>
              {currentUser?.name}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={12} />
              <span>+91 {currentUser?.mobile}</span>
            </div>
            {currentUser?.address && (
              <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} />
                <span>{currentUser.address}</span>
              </div>
            )}
          </div>

          <button 
            onClick={onLogout}
            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={12} />
            <span>{lang === 'en' ? 'Logout' : 'बाहेर पडा'}</span>
          </button>
        </div>

        {/* Orders list */}
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c1917', marginTop: '10px' }}>
          {lang === 'en' ? `Order History (${myOrders.length})` : `माझ्या मागील ऑर्डर्स (${myOrders.length})`}
        </h4>

        {myOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#78716c' }}>
            <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontWeight: 600 }}>{lang === 'en' ? 'No orders placed yet.' : 'अजून कोणतीही ऑर्डर दिली नाही.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {myOrders.map((ord) => (
              <div key={ord.orderId} style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.85rem' }}>
                    ID: {ord.orderId}
                  </span>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <PackageCheck size={11} /> {lang === 'en' ? 'Confirmed' : 'कन्फर्म'}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />
                  <span>{ord.date}</span>
                </div>

                <div style={{ borderTop: '1px dashed #e7e5e4', paddingTop: '6px', fontSize: '0.82rem', color: '#44403c' }}>
                  {ord.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                      <span>• {lang === 'en' ? it.titleEn : it.titleMr} (x{it.qty})</span>
                      <span style={{ fontWeight: 700 }}>₹{it.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e7e5e4', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.9rem' }}>
                  <span>{lang === 'en' ? 'Total Amount:' : 'एकूण रक्कम:'}</span>
                  <span style={{ color: '#16a34a' }}>₹{ord.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
