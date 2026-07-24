import React from 'react';
import { Sun, Moon, Coffee, Sparkles, ChefHat, Calendar } from 'lucide-react';

export default function TodaySpecialMenu({ todayMenu, lang }) {
  if (!todayMenu) return null;

  return (
    <div style={{ padding: '0 10px 10px 10px' }}>
      <div 
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '14px',
          border: '1.5px solid #ea580c',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ChefHat size={18} color="#fef08a" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fef08a', fontFamily: "'Playfair Display', serif" }}>
              {lang === 'en' ? "Today's Special Menu" : "आजचा खास डबा व नाश्ता मेनू"}
            </h3>
          </div>

          <span style={{ fontSize: '0.62rem', background: '#ea580c', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Sparkles size={9} /> {lang === 'en' ? 'Fresh Today' : 'आजचा ताजा'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Breakfast Menu */}
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#fef3c7', padding: '6px', borderRadius: '50%', color: '#b45309' }}>
              <Coffee size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#fde047', fontWeight: 800 }}>
                {lang === 'en' ? 'Breakfast (Morning)' : 'सकाळचा नाश्ता'}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                {todayMenu.breakfast || (lang === 'en' ? 'Kanda Pohe & Kothimbir Vadi' : 'कांदा पोहे व कोथिंबीर वडी')}
              </div>
            </div>
          </div>

          {/* Lunch Menu */}
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ffedd5', padding: '6px', borderRadius: '50%', color: '#ea580c' }}>
              <Sun size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#fdba74', fontWeight: 800 }}>
                {lang === 'en' ? 'Lunch Box (1:00 PM)' : 'दुपारचा डबा (२ भाज्या + पोळी/भाकरी)'}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                {todayMenu.lunch || (lang === 'en' ? 'Paneer Masala + Bharli Vangi + Dal Rice' : 'पनीर मसाला + भरली वांगी + वरण भात')}
              </div>
            </div>
          </div>

          {/* Dinner Menu */}
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#e0e7ff', padding: '6px', borderRadius: '50%', color: '#3730a3' }}>
              <Moon size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#c7d2fe', fontWeight: 800 }}>
                {lang === 'en' ? 'Dinner Box (8:00 PM)' : 'रात्रीचा डबा (२ भाज्या + पोळी/भाकरी)'}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                {todayMenu.dinner || (lang === 'en' ? 'Besan Pithla + Shev Bhaji + Bhakri' : 'बेसन पिठलं + शेव भाजी + ज्वारी भाकरी')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
