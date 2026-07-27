import React from 'react';
import { Star, Plus, Minus, Info, Calendar, Clock, Lock, AlertCircle, Flame, Dumbbell } from 'lucide-react';
import VegSymbol from './VegSymbol';

export default function FoodCard({ 
  item, 
  lang, 
  cartQty, 
  onUpdateCart, 
  onOpenDetails 
}) {
  // 2-Day Advance Cutoff Logic calculation
  const publishedDate = item.publishedAt ? new Date(item.publishedAt).getTime() : Date.now();
  const daysDiff = (Date.now() - publishedDate) / (1000 * 60 * 60 * 24);
  const isOrderClosed = item.advanceNoticeDays ? (daysDiff > item.advanceNoticeDays) : false;
  const isOut = !item.inStock || isOrderClosed;

  return (
    <div className="food-card" style={{ opacity: isOut ? 0.75 : 1 }}>
      <div className="food-image-wrapper" onClick={() => onOpenDetails(item)} style={{ cursor: 'pointer' }}>
        <img 
          src={item.image} 
          alt={item.titleMr} 
          className="food-image"
          onError={(e) => {
            e.target.src = '/app_icon.png';
          }}
        />

        <div className="badge-container">
          <VegSymbol size={18} />

          {item.isBestseller && (
            <span className="bestseller-badge">
              {lang === 'mr' ? 'लोकप्रिय' : 'Bestseller'}
            </span>
          )}

          {item.isUpvas && (
            <span className="upvas-badge">
              {lang === 'mr' ? 'उपवास' : 'Upvas'}
            </span>
          )}
        </div>

        <div className="rating-badge">
          <Star size={10} fill="#fbbf24" color="#fbbf24" />
          <span>{item.rating}</span>
        </div>
      </div>

      <div className="food-content">
        <div className="food-header-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h3 
                className="food-title" 
                onClick={() => onOpenDetails(item)} 
                style={{ cursor: 'pointer', margin: 0 }}
              >
                {lang === 'mr' ? item.titleMr : item.titleEn}
              </h3>
              <span className="unit-tag">{lang === 'mr' ? item.unit : item.unitEn}</span>
            </div>
          </div>

          <div className="food-price">
            ₹{item.price}
          </div>
        </div>

        <p 
          className="food-desc"
          onClick={() => onOpenDetails(item)} 
          style={{ cursor: 'pointer' }}
        >
          {lang === 'mr' ? item.descriptionMr : item.descriptionEn}
        </p>

        <div className="food-footer-row">
          <button 
            onClick={() => onOpenDetails(item)}
            style={{
              background: 'none',
              border: 'none',
              color: '#78716c',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              padding: '2px 0'
            }}
          >
            <Info size={12} color="#ea580c" />
            <span>{lang === 'mr' ? 'तपशील' : 'Details'}</span>
          </button>

          {isOrderClosed ? (
            <button 
              className="add-btn"
              disabled
              style={{ background: '#9ca3af', color: 'white', cursor: 'not-allowed', border: 'none', padding: '5px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Lock size={11} />
              <span>{lang === 'mr' ? 'ऑर्डर बंद' : 'Closed'}</span>
            </button>
          ) : !item.inStock ? (
            <button 
              className="add-btn"
              disabled
              style={{ background: '#dc2626', color: 'white', cursor: 'not-allowed', border: 'none', padding: '5px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800 }}
            >
              <span>{lang === 'mr' ? 'संपले' : 'Out of Stock'}</span>
            </button>
          ) : cartQty === 0 ? (
            <button 
              className="add-btn"
              onClick={() => onUpdateCart(item.id, 1)}
            >
              <Plus size={14} />
              <span>{lang === 'mr' ? 'जोडा' : 'ADD'}</span>
            </button>
          ) : (
            <div className="stepper">
              <button 
                className="stepper-btn"
                onClick={() => onUpdateCart(item.id, cartQty - 1)}
              >
                <Minus size={11} />
              </button>
              <span className="stepper-val">{cartQty}</span>
              <button 
                className="stepper-btn"
                onClick={() => onUpdateCart(item.id, cartQty + 1)}
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
