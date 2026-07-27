import React, { useState } from 'react';
import { Sun, Coffee, ChefHat, ChevronDown, ChevronUp } from 'lucide-react';

export default function TodaySpecialMenu({ todayMenu, lang }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!todayMenu) return null;

  return (
    <div style={{ padding: '4px 10px 8px 10px' }}>
      <div 
        style={{
          background: '#ffffff',
          color: '#1c1917',
          borderRadius: '14px',
          padding: '10px 12px',
          border: '1px solid #fed7aa',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)'
        }}
      >
        <div 
          onClick={() => setIsExpanded(!isExpanded)} 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#fff7ed', padding: '6px', borderRadius: '50%', color: '#ea580c', display: 'flex' }}>
              <ChefHat size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9a3412', margin: 0 }}>
                {lang === 'en' ? "Today's Special Menu" : "आजचा खास डबा मेनू"}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#78716c', margin: 0 }}>
                {todayMenu.lunch || (lang === 'en' ? 'Paneer Masala + Dal Rice' : 'पनीर मसाला + वरण भात')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', background: '#fff7ed', color: '#c2410c', padding: '3px 9px', borderRadius: '10px', fontWeight: 800, border: '1px solid #ffedd5', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <span>{lang === 'en' ? 'Fresh' : 'ताजा'}</span>
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #fed7aa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Breakfast */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
              <Coffee size={13} color="#b45309" />
              <strong style={{ color: '#b45309', minWidth: '55px' }}>{lang === 'en' ? 'Breakfast:' : 'नाश्ता:'}</strong>
              <span style={{ color: '#44403c' }}>{todayMenu.breakfast || '-'}</span>
            </div>

            {/* Lunch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
              <Sun size={13} color="#ea580c" />
              <strong style={{ color: '#ea580c', minWidth: '55px' }}>{lang === 'en' ? 'Lunch:' : 'दुपारी:'}</strong>
              <span style={{ color: '#44403c' }}>{todayMenu.lunch || '-'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
