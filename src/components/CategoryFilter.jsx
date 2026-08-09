import React from 'react';
import { Utensils, UtensilsCrossed, Cookie, Cake, Flame, Users, Check, Leaf, Coffee, Sparkles, Heart, Smile, ShoppingBag } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/foodData';

const iconMap = {
  Utensils,
  UtensilsCrossed,
  Cookie,
  Cake,
  Flame,
  Users,
  Coffee,
  Sparkles,
  Heart,
  Smile,
  ShoppingBag
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
      </div>
    </div>
  );
}
