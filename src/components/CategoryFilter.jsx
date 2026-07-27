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
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
      <div className="filter-pills" style={{ padding: 0 }}>
        {INITIAL_CATEGORIES.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Utensils;
          const isActive = selectedCat === cat.id;

          return (
            <button
              key={cat.id}
              className={`pill-item ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              <IconComponent size={13} />
              <span>{lang === 'mr' ? cat.nameMr : cat.nameEn}</span>
            </button>
          );
        })}

        {/* Upvas Fasting Tag Toggle Button inline with category pills */}
        <button
          className={`pill-item ${vegFilter === 'upvas' ? 'active' : ''}`}
          style={vegFilter === 'upvas' ? {} : { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
          onClick={() => setVegFilter(vegFilter === 'upvas' ? 'all' : 'upvas')}
        >
          <Flame size={13} color={vegFilter === 'upvas' ? 'white' : '#b45309'} />
          <span>{lang === 'mr' ? 'उपवास खास' : 'Fasting Only'}</span>
        </button>
      </div>
    </div>
  );
}
