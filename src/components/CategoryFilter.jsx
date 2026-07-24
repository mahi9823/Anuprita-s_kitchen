import React from 'react';
import { Utensils, UtensilsCrossed, Cookie, Cake, Flame, Users, Check, Leaf } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/foodData';

const iconMap = {
  Utensils,
  UtensilsCrossed,
  Cookie,
  Cake,
  Flame,
  Users
};

export default function CategoryFilter({ 
  selectedCat, 
  setSelectedCat, 
  vegFilter, 
  setVegFilter, 
  lang 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div className="filter-pills">
        {INITIAL_CATEGORIES.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Utensils;
          const isActive = selectedCat === cat.id;

          return (
            <button
              key={cat.id}
              className={`pill-item ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              <IconComponent size={14} />
              <span>{lang === 'mr' ? cat.nameMr : cat.nameEn}</span>
            </button>
          );
        })}
      </div>

      <div className="veg-toggle-bar">
        <button
          className={`tag-btn veg active`}
          style={{ background: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
        >
          <Leaf size={14} />
          <span>{lang === 'mr' ? '१००% शुद्ध शाकाहारी मेनू' : '100% Pure Veg Menu'}</span>
          <Check size={12} />
        </button>

        <button
          className={`tag-btn upvas ${vegFilter === 'upvas' ? 'active' : ''}`}
          onClick={() => setVegFilter(vegFilter === 'upvas' ? 'all' : 'upvas')}
        >
          <Flame size={12} color="#b45309" />
          <span>{lang === 'mr' ? 'उपवास खास' : 'Fasting Only'}</span>
          {vegFilter === 'upvas' && <Check size={12} />}
        </button>
      </div>
    </div>
  );
}
