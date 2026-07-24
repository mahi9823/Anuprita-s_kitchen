import React from 'react';
import { Star, Plus, Minus, Info, Calendar, Clock, Lock, AlertCircle } from 'lucide-react';
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
          <VegSymbol size={20} />

          {item.isBestseller && (
            <span className="bestseller-badge">
              {lang === 'mr' ? 'लोकावडता' : 'Bestseller'}
            </span>
          )}

          {item.isUpvas && (
            <span className="upvas-badge">
              {lang === 'mr' ? 'उपवास खास' : 'Upvas Special'}
            </span>
          )}

          {isOrderClosed && (
            <span style={{ background: '#dc2626', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
              {lang === 'mr' ? '🚫 २ दिवसांची ऑर्डर बंद' : '🚫 2 Days Notice Expired'}
            </span>
          )}
        </div>

        <div className="rating-badge">
          <Star size={11} fill="#fbbf24" color="#fbbf24" />
          <span>{item.rating}</span>
          <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>({item.reviewsCount})</span>
        </div>
      </div>

      <div className="food-content">
        <div className="food-header-row">
          <div>
            <h3 
              className="food-title" 
              onClick={() => onOpenDetails(item)} 
              style={{ cursor: 'pointer' }}
            >
              {lang === 'mr' ? item.titleMr : item.titleEn}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="unit-tag">{lang === 'mr' ? item.unit : item.unitEn}</span>
              <span style={{ fontSize: '0.65rem', color: isOrderClosed ? '#dc2626' : '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', background: isOrderClosed ? '#fef2f2' : '#fff7ed', padding: '2px 5px', borderRadius: '4px' }}>
                <Calendar size={10} />
                <span>{item.advanceNoticeMr || (lang === 'mr' ? '१ दिवस आधी नोंदवा' : 'Order 1 Day Prior')}</span>
              </span>
            </div>
          </div>

          <div className="food-price">
            ₹{item.price}
          </div>
        </div>

        <p className="food-desc">
          {lang === 'mr' ? item.descriptionMr : item.descriptionEn}
        </p>

        <div className="food-footer-row">
          <button 
            onClick={() => onOpenDetails(item)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ea580c',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '2px 0'
            }}
          >
            <Info size={13} />
            <span>{lang === 'mr' ? 'साहित्य पाहा' : 'Ingredients'}</span>
          </button>

          {isOrderClosed ? (
            <button 
              className="add-btn"
              disabled
              style={{ background: '#9ca3af', color: 'white', cursor: 'not-allowed', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Lock size={12} />
              <span>{lang === 'mr' ? 'ऑर्डर बंद (२ दिवस संपले)' : 'Order Closed'}</span>
            </button>
          ) : !item.inStock ? (
            <button 
              className="add-btn"
              disabled
              style={{ background: '#dc2626', color: 'white', cursor: 'not-allowed', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 800 }}
            >
              <span>{lang === 'mr' ? 'संपले' : 'Out of Stock'}</span>
            </button>
          ) : cartQty === 0 ? (
            <button 
              className="add-btn"
              onClick={() => onUpdateCart(item.id, 1)}
            >
              <Plus size={15} />
              <span>{lang === 'mr' ? 'जोडा' : 'ADD'}</span>
            </button>
          ) : (
            <div className="stepper">
              <button 
                className="stepper-btn"
                onClick={() => onUpdateCart(item.id, cartQty - 1)}
              >
                <Minus size={12} />
              </button>
              <span className="stepper-val">{cartQty}</span>
              <button 
                className="stepper-btn"
                onClick={() => onUpdateCart(item.id, cartQty + 1)}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
