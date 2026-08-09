import React, { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle2, Sparkles, AlertCircle, ChefHat, Truck, Moon, Sun } from 'lucide-react';

export default function KitchenLiveStatus({ lang }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000); // update every 15 seconds
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Time boundaries in minutes:
  // 6:00 AM = 360 min
  // 11:30 AM = 690 min
  // 3:30 PM (15:30) = 930 min
  // 10:00 PM (22:00) = 1320 min

  let statusKey = 'morning_prep';
  if (timeInMinutes >= 360 && timeInMinutes < 690) {
    statusKey = 'morning_prep'; // 6:00 AM - 11:30 AM (Order Ready / Preparation Live)
  } else if (timeInMinutes >= 690 && timeInMinutes < 930) {
    statusKey = 'lunch_service'; // 11:30 AM - 3:30 PM (Hot Lunch & Tiffin Delivery)
  } else if (timeInMinutes >= 930 && timeInMinutes < 1320) {
    statusKey = 'evening_prep'; // 3:30 PM - 10:00 PM (Evening Snacks & Dinner Service)
  } else {
    statusKey = 'closed'; // 10:00 PM - 6:00 AM (Closed, reopens at 6 AM)
  }

  // Format time display string (e.g., "06:15 AM")
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="kitchen-live-card" style={{
      margin: '12px 16px 4px 16px',
      borderRadius: '16px',
      background: statusKey === 'closed' 
        ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' 
        : 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
      color: 'white',
      padding: '16px',
      boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      border: '1.5px solid rgba(255, 255, 255, 0.2)'
    }}>
      {/* Background Subtle Watermark Pattern */}
      <div style={{
        position: 'absolute',
        right: '-10px',
        bottom: '-15px',
        opacity: 0.12,
        pointerEvents: 'none',
        transform: 'rotate(-15deg)'
      }}>
        <ChefHat size={120} color="white" />
      </div>

      {/* Top Header Row: Live Badge & Real-Time Clock */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: statusKey === 'closed' ? 'rgba(238, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusKey === 'closed' ? '#fbbf24' : '#22c55e',
              boxShadow: statusKey === 'closed' ? '0 0 8px #fbbf24' : '0 0 10px #22c55e',
              animation: 'pulse 1.5s infinite'
            }} />
            {statusKey === 'morning_prep' && (lang === 'mr' ? '६:०० AM किचन लाईव्ह' : '6:00 AM KITCHEN LIVE')}
            {statusKey === 'lunch_service' && (lang === 'mr' ? 'डिलिव्हरी लाईव्ह' : 'DELIVERY LIVE')}
            {statusKey === 'evening_prep' && (lang === 'mr' ? 'नाश्ता व जेवण सेवा' : 'EVENING SERVICE')}
            {statusKey === 'closed' && (lang === 'mr' ? 'सकाळी ६:०० उघडेल' : 'OPENS AT 6:00 AM')}
          </span>
        </div>

        {/* Realtime Clock Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fef3c7'
        }}>
          <Clock size={13} color="#fde047" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Main Status Content Banner */}
      {statusKey === 'morning_prep' && (
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
            <Flame size={20} color="#fde047" style={{ animation: 'bounce 2s infinite' }} />
            {lang === 'mr' 
              ? '६:०० AM पासून ताज्या ऑर्डर्सची तयारी सुरू!' 
              : '6:00 AM Kitchen Open! Orders Prep Live'}
          </h3>
          <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.95, lineHeight: 1.4, color: '#ffedd5' }}>
            {lang === 'mr'
              ? 'सकाळी ६:०० वाजल्यापासून किचनमध्ये ताज्या पोळ्या, रस्सा भाजी, थाळी व गरमागरम डबे तयार होण्यास सुरुवात झाली आहे!'
              : 'Starting at 6:00 AM daily, fresh chapatis, gravies, thalis & home tiffins are actively cooked fresh in our kitchen!'}
          </p>
        </div>
      )}

      {statusKey === 'lunch_service' && (
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
            <Truck size={20} color="#fde047" />
            {lang === 'mr' 
              ? 'दुपारचे गरमागरम जेवण व डबा डिलिव्हरी सुरू!' 
              : 'Hot Lunch & Tiffin Delivery Live!'}
          </h3>
          <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.95, lineHeight: 1.4, color: '#ffedd5' }}>
            {lang === 'mr'
              ? 'सकाळी ६ वाजता तयार झालेले ताजे अन्न आता ग्राहकांपर्यंत गरमागरम पोहोचवले जात आहे.'
              : 'Fresh meals prepped from 6:00 AM are currently out for hot home delivery!'}
          </p>
        </div>
      )}

      {statusKey === 'evening_prep' && (
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
            <ChefHat size={20} color="#fde047" />
            {lang === 'mr' 
              ? 'संध्याकाळचा नाश्ता व रात्रीच्या जेवणाची तयारी' 
              : 'Evening Snacks & Dinner Service Live'}
          </h3>
          <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.95, lineHeight: 1.4, color: '#ffedd5' }}>
            {lang === 'mr'
              ? 'गरमागरम वडा पाव, पिठलं भाकरी व रात्रीच्या जेवणाची ऑर्डर स्वीकारली जात आहे.'
              : 'Accepting hot evening snack orders, Pithla Bhakri & dinner thalis.'}
          </p>
        </div>
      )}

      {statusKey === 'closed' && (
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px', color: '#fef08a' }}>
            <Moon size={20} color="#fde047" />
            {lang === 'mr' 
              ? 'किचन बंद - उद्या सकाळी ६:०० वाजता पुन्हा उघडेल' 
              : 'Kitchen Closed - Reopens Tomorrow at 6:00 AM'}
          </h3>
          <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.92, lineHeight: 1.4, color: '#e0e7ff' }}>
            {lang === 'mr'
              ? 'दररोज सकाळी ६:०० वाजता किचन उघडते व ऑर्डर्सची ताजी तयारी सुरू होते. तुम्ही उद्याच्या सकाळसाठी पूर्व-ऑर्डर करू शकता!'
              : 'Our kitchen opens every morning at 6:00 AM for fresh order preps. Feel free to place your pre-orders now!'}
          </p>
        </div>
      )}

      {/* Graphical 6:00 AM Order Prep Timeline / Progress Steps */}
      <div style={{
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fef3c7' }}>
          <span>{lang === 'mr' ? '६:०० AM दैनंदिन तयारी टाइमलाईन (Daily 6 AM Prep):' : 'Daily 6:00 AM Order Prep Timeline:'}</span>
          <span style={{ fontSize: '0.68rem', opacity: 0.9, background: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: '4px' }}>
            100% Pure Veg
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '4px' }}>
          {/* Step 1 */}
          <div style={{
            background: statusKey !== 'closed' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 8px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fde047' }}>06:00 AM</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lang === 'mr' ? 'ताजी तयारी सुरू' : 'Fresh Prep Start'}
            </div>
            <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>
              {lang === 'mr' ? 'भाजी व साहित्य' : 'Veggies & Spices'}
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            background: (statusKey === 'morning_prep' || statusKey === 'lunch_service') ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 8px',
            border: (statusKey === 'morning_prep' || statusKey === 'lunch_service') ? '1px solid #fde047' : '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fde047' }}>07:30 AM</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lang === 'mr' ? 'ऑर्डर कुकिंग' : 'Orders Cooking'}
            </div>
            <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>
              {lang === 'mr' ? 'पोळी, वरण-भात' : 'Fresh Tiffins'}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            background: statusKey === 'lunch_service' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 8px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fde047' }}>11:30 AM</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lang === 'mr' ? 'डिलिव्हरी तयार' : 'Ready to Dispatch'}
            </div>
            <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>
              {lang === 'mr' ? 'गरम डबा' : 'Hot Meal Out'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
