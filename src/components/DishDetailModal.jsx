import React, { useState } from 'react';
import { X, Clock, Star, Flame, Check, Plus, Minus, ChefHat, Lock, Calendar, Dumbbell, Activity, PlusCircle } from 'lucide-react';
import VegSymbol from './VegSymbol';

export default function DishDetailModal({ 
  item, 
  lang, 
  onClose, 
  cartQty, 
  onUpdateCart 
}) {
  if (!item) return null;

  // Track quantity per add-on (e.g. { 'add-bhakri': 2, 'add-chapati': 1 })
  const [addonQuantities, setAddonQuantities] = useState({});

  // 2-Day Advance Cutoff Logic calculation
  const publishedDate = item.publishedAt ? new Date(item.publishedAt).getTime() : Date.now();
  const daysDiff = (Date.now() - publishedDate) / (1000 * 60 * 60 * 24);
  const isOrderClosed = item.advanceNoticeDays ? (daysDiff > item.advanceNoticeDays) : false;

  const handleUpdateAddonQty = (addonId, delta) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[addonId];
      } else {
        updated[addonId] = newQty;
      }
      return updated;
    });
  };

  // Compute extra add-ons total
  const addOnsTotal = item.extraAddOns 
    ? item.extraAddOns.reduce((sum, addon) => sum + (addon.price * (addonQuantities[addon.id] || 0)), 0)
    : 0;

  const itemUnitPrice = item.price + addOnsTotal;

  // Selected add-ons list to pass to cart
  const selectedAddonsList = item.extraAddOns 
    ? item.extraAddOns
        .filter(addon => (addonQuantities[addon.id] || 0) > 0)
        .map(addon => ({
          ...addon,
          qty: addonQuantities[addon.id]
        }))
    : [];

  const handleAddToCartWithAddons = () => {
    onUpdateCart(item.id, Math.max(cartQty, 1), selectedAddonsList);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '220px', width: '100%' }}>
          <img 
            src={item.image} 
            alt={item.titleMr} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/app_icon.png';
            }}
          />
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <VegSymbol size={16} />
              <span style={{ color: '#15803d' }}>{lang === 'mr' ? 'शुद्ध शाकाहारी' : '100% Pure Veg'}</span>
            </span>

            {isOrderClosed && (
              <span style={{ background: '#dc2626', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                🚫 {lang === 'mr' ? '२ दिवसांची ऑर्डर बंद' : '2 Days Expired'}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1917' }}>
                {lang === 'mr' ? item.titleMr : item.titleEn}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.8rem', color: '#78716c' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOrderClosed ? '#dc2626' : '#ea580c', fontWeight: 700 }}>
                  <Calendar size={13} /> {item.advanceNoticeMr || (lang === 'mr' ? '१ दिवस आधी ऑर्डर' : '1 Day Prior Order')}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 700 }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> {item.rating} ({item.reviewsCount} {lang === 'mr' ? 'परीक्षणे' : 'reviews'})
                </span>
              </div>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>
              ₹{itemUnitPrice}
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#44403c', lineHeight: 1.5 }}>
            {lang === 'mr' ? item.descriptionMr : item.descriptionEn}
          </p>

          {/* EXTRA ADD-ONS QUANTITY STEPPER CUSTOMIZER SECTION */}
          {item.extraAddOns && item.extraAddOns.length > 0 && (
            <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '14px', padding: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#9a3412', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={16} color="#ea580c" />
                <span>{lang === 'mr' ? '➕ अतिरिक्त भाकरी, चपाती व सोलकढी जोडा (Extra Add-ons):' : '➕ Select Extra Bhakri, Chapati & Solkadhi:'}</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.extraAddOns.map((addon) => {
                  const qty = addonQuantities[addon.id] || 0;
                  return (
                    <div 
                      key={addon.id} 
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        background: qty > 0 ? '#ffedd5' : 'white',
                        border: qty > 0 ? '1.5px solid #ea580c' : '1px solid #e7e5e4',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: qty > 0 ? 800 : 600, color: '#292524', display: 'block' }}>
                          {lang === 'mr' ? addon.nameMr : addon.nameEn}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c' }}>
                          ₹{addon.price} {lang === 'mr' ? 'प्रति नग' : 'each'}
                        </span>
                      </div>

                      {/* ADDON QUANTITY STEPPER */}
                      <div className="stepper" style={{ padding: '2px 6px' }}>
                        <button 
                          className="stepper-btn" 
                          onClick={() => handleUpdateAddonQty(addon.id, -1)}
                          style={{ background: qty > 0 ? '#ea580c' : '#a8a29e', width: '24px', height: '24px' }}
                        >
                          <Minus size={12} />
                        </button>

                        <span className="stepper-val" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '0 8px', minWidth: '20px', textAlign: 'center' }}>
                          {qty}
                        </span>

                        <button 
                          className="stepper-btn" 
                          onClick={() => handleUpdateAddonQty(addon.id, 1)}
                          style={{ background: '#ea580c', width: '24px', height: '24px' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {addOnsTotal > 0 && (
                <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: 800, color: '#9a3412', textAlign: 'right' }}>
                  {lang === 'mr' ? `एकूण अतिरिक्त आकार: +₹${addOnsTotal}` : `Total Extra Addons: +₹${addOnsTotal}`}
                </div>
              )}
            </div>
          )}

          {/* NUTRITIONAL BREAKDOWN BOX */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} color="#ea580c" />
              <span>{lang === 'mr' ? 'पोषण मूल्य व उष्मांक (Nutritional Facts per serving):' : 'Nutritional Facts per serving:'}</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: '#fef2f2', padding: '8px 4px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.65rem', color: '#991b1b', fontWeight: 700, display: 'block' }}>
                  🔥 {lang === 'mr' ? 'कॅलरीज' : 'Calories'}
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#dc2626' }}>
                  {item.calories || 450} <span style={{ fontSize: '0.6rem' }}>kcal</span>
                </strong>
              </div>

              <div style={{ background: '#f0fdf4', padding: '8px 4px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 700, display: 'block' }}>
                  💪 {lang === 'mr' ? 'प्रथिने' : 'Protein'}
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#16a34a' }}>
                  {item.protein || '14g'}
                </strong>
              </div>

              <div style={{ background: '#fff7ed', padding: '8px 4px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                <span style={{ fontSize: '0.65rem', color: '#9a3412', fontWeight: 700, display: 'block' }}>
                  🌾 {lang === 'mr' ? 'कार्बोहायड्रेट' : 'Carbs'}
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#ea580c' }}>
                  {item.carbs || '55g'}
                </strong>
              </div>

              <div style={{ background: '#fefce8', padding: '8px 4px', borderRadius: '10px', border: '1px solid #fef08a' }}>
                <span style={{ fontSize: '0.65rem', color: '#854d0e', fontWeight: 700, display: 'block' }}>
                  🥑 {lang === 'mr' ? 'स्निग्धता' : 'Fats'}
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#ca8a04' }}>
                  {item.fat || '12g'}
                </strong>
              </div>
            </div>
          </div>

          {/* Ingredients list */}
          {item.ingredientsMr && item.ingredientsMr.length > 0 && (
            <div style={{ background: '#ecfdf5', border: '1px dashed #a7f3d0', borderRadius: '12px', padding: '14px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ChefHat size={16} />
                <span>{lang === 'mr' ? 'वापरलेले शुद्ध साहित्य (Ingredients):' : 'Pure Veg Ingredients Used:'}</span>
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(lang === 'mr' ? item.ingredientsMr : item.ingredientsEn).map((ing, i) => (
                  <span 
                    key={i} 
                    style={{
                      background: 'white',
                      color: '#065f46',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    ✓ {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart bottom bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #e7e5e4' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#78716c' }}>
                {lang === 'mr' ? 'एकूण मू्ल्य:' : 'Price:'}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>
                ₹{itemUnitPrice * Math.max(cartQty, 1)}
              </div>
            </div>

            {isOrderClosed ? (
              <button 
                className="add-btn" 
                disabled 
                style={{ background: '#9ca3af', color: 'white', cursor: 'not-allowed', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Lock size={16} />
                <span>{lang === 'mr' ? 'ऑर्डर बंद' : 'Order Closed'}</span>
              </button>
            ) : cartQty === 0 ? (
              <button 
                className="add-btn" 
                onClick={handleAddToCartWithAddons}
                style={{ background: '#16a34a' }}
              >
                <Plus size={16} />
                <span>{lang === 'mr' ? 'बास्केटमध्ये जोडा' : 'Add to Basket'}</span>
              </button>
            ) : (
              <div className="stepper" style={{ padding: '4px 8px' }}>
                <button className="stepper-btn" onClick={() => onUpdateCart(item.id, cartQty - 1)} style={{ background: '#16a34a' }}>
                  <Minus size={14} />
                </button>
                <span className="stepper-val" style={{ fontSize: '1rem', padding: '0 14px' }}>{cartQty}</span>
                <button className="stepper-btn" onClick={() => onUpdateCart(item.id, cartQty + 1)} style={{ background: '#16a34a' }}>
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
