import React from 'react';

export default function VegSymbol({ size = 20, showLabel = false, labelText = '100% Pure Veg', lang = 'en' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '2px solid #15803d',
          borderRadius: '4px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flexShrink: 0
        }}
        title="100% Pure Veg"
      >
        <div 
          style={{
            width: `${Math.round(size * 0.5)}px`,
            height: `${Math.round(size * 0.5)}px`,
            borderRadius: '50%',
            background: '#15803d'
          }}
        />
      </div>

      {showLabel && (
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {labelText}
        </span>
      )}
    </div>
  );
}
