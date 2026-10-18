import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, Send, ShoppingBag, 
  AlertCircle, MapPin, Navigation, 
  Home, Gift, BookmarkCheck, ShieldCheck
} from 'lucide-react';
import { 
  normalizeMobile, 
  getSavedAddresses, 
  saveCustomerAddress, 
  saveCustomerProfile 
} from '../services/userService';

export default function CartDrawer({
  cartItems,
  foodItems,
  lang,
  onClose,
  onUpdateCart,
  onClearCart: _onClearCart,
  whatsappNumber,
  onOrderPlaced,
  currentUser
}) {
  // Option A: 'home' (Deliver to My Address)
  // Option B: 'someone_else' (Deliver to Someone Else)
  const [deliveryOption, setDeliveryOption] = useState('home');

  // Customer / Sender Details
  const [custName, setCustName] = useState(currentUser?.name || '');
  const [custPhone, setCustPhone] = useState(currentUser?.mobile || currentUser?.phone || '');

  // Recipient Details (Option B only)
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // Structured Address Fields
  const [flatNo, setFlatNo] = useState('');
  const [building, setBuilding] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('नाशिक (Nashik)');
  const [state, setState] = useState('महाराष्ट्र (Maharashtra)');
  const [pincode, setPincode] = useState('422005');
  const [gpsLocation, setGpsLocation] = useState('');

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // Address Persistence Options
  const [saveAsHomeDefault, setSaveAsHomeDefault] = useState(true);
  const [saveRecipientForFuture, setSaveRecipientForFuture] = useState(false);

  // Status & Feedback
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load saved addresses on mount or when currentUser changes
  useEffect(() => {
    const list = getSavedAddresses(currentUser?.mobile, currentUser?.address || '');
    setSavedAddresses(list);

    // Initial population for 'home' mode
    const homeAddr = list.find((a) => a.isHome) || list[0];
    if (homeAddr) {
      setSelectedAddressId(homeAddr.id);
      applyAddress(homeAddr);
    } else if (currentUser?.address) {
      setArea(currentUser.address);
    }
  }, [currentUser]);

  const applyAddress = (addr) => {
    if (!addr) return;
    setFlatNo(addr.flatNo || '');
    setBuilding(addr.building || '');
    setArea(addr.area || addr.fullAddress || '');
    setCity(addr.city || 'नाशिक (Nashik)');
    setState(addr.state || 'महाराष्ट्र (Maharashtra)');
    setPincode(addr.pincode || '');
    setGpsLocation(addr.gpsLocation || '');
    if (addr.recipientName) setRecipientName(addr.recipientName);
    if (addr.recipientPhone) setRecipientPhone(addr.recipientPhone);
  };

  // Switch between Option A and Option B
  const handleSwitchOption = (option) => {
    setDeliveryOption(option);
    setFormError('');

    if (option === 'home') {
      const homeAddr = savedAddresses.find((a) => a.isHome) || savedAddresses[0];
      if (homeAddr) {
        setSelectedAddressId(homeAddr.id);
        applyAddress(homeAddr);
      } else {
        setSelectedAddressId('new');
        if (currentUser?.address) setArea(currentUser.address);
      }
    } else {
      // Option B: Someone Else
      const otherAddr = savedAddresses.find((a) => !a.isHome);
      if (otherAddr) {
        setSelectedAddressId(otherAddr.id);
        applyAddress(otherAddr);
      } else {
        setSelectedAddressId('new');
        setFlatNo('');
        setBuilding('');
        setArea('');
        setPincode('');
        setGpsLocation('');
        setRecipientName('');
        setRecipientPhone('');
      }
    }
  };

  // Choose from saved address dropdown
  const handleSelectSavedAddress = (id) => {
    setSelectedAddressId(id);
    setFormError('');

    if (id === 'new') {
      setFlatNo('');
      setBuilding('');
      setArea('');
      setCity('नाशिक (Nashik)');
      setState('महाराष्ट्र (Maharashtra)');
      setPincode('');
      setGpsLocation('');
      if (deliveryOption === 'someone_else') {
        setRecipientName('');
        setRecipientPhone('');
      }
    } else {
      const found = savedAddresses.find((a) => a.id === id);
      if (found) {
        applyAddress(found);
      }
    }
  };

  // Auto-detect current GPS location
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'तुमच्या ब्राऊजरमध्ये GPS सपोर्ट उपलब्ध नाही.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        setGpsLocation(mapsLink);
        setIsLocating(false);
        alert(lang === 'en' ? 'Exact GPS Location attached successfully!' : 'तुमचे अचूक GPS लोकेशन जोडले गेले आहे!');
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert(lang === 'en' ? 'Unable to retrieve location. Please type manually.' : 'लोकेशन मिळवता आले नाही. कृपया पत्ता हाताने टाईप करा.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Compute cart items array with custom extra add-ons
  const cartList = Object.entries(cartItems).map(([itemId, cartVal]) => {
    const item = foodItems.find((f) => f.id === itemId);
    if (!item) return null;

    const qty = typeof cartVal === 'object' ? cartVal.qty : cartVal;
    const addons = typeof cartVal === 'object' ? (cartVal.addons || []) : [];

    const addonsTotal = addons.reduce((sum, a) => sum + (a.price * a.qty), 0);
    const unitPrice = item.price + addonsTotal;

    return {
      item,
      qty,
      addons,
      unitPrice,
      itemTotal: unitPrice * qty
    };
  }).filter(Boolean);

  const subtotal = cartList.reduce((acc, curr) => acc + curr.itemTotal, 0);

  // Form Submission
  const handleCheckout = (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Validate Customer / Sender
    const cleanCustName = (custName || '').trim();
    const cleanCustPhone = normalizeMobile(custPhone);

    if (!cleanCustName) {
      setFormError(lang === 'en' ? 'Please enter your full name.' : 'कृपया तुमचे पूर्ण नाव टाका.');
      return;
    }
    if (!cleanCustPhone || cleanCustPhone.length !== 10) {
      setFormError(lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'कृपया तुमचा वैध १० अंकी मोबाईल नंबर टाका.');
      return;
    }

    // 2. Validate Recipient if Option B
    let cleanRecipientName = '';
    let cleanRecipientPhone = '';
    if (deliveryOption === 'someone_else') {
      cleanRecipientName = (recipientName || '').trim();
      cleanRecipientPhone = normalizeMobile(recipientPhone);

      if (!cleanRecipientName) {
        setFormError(lang === 'en' ? 'Please enter recipient name.' : 'कृपया पार्सल घेणाऱ्याचे नाव टाका.');
        return;
      }
      if (!cleanRecipientPhone || cleanRecipientPhone.length !== 10) {
        setFormError(lang === 'en' ? 'Please enter recipient 10-digit mobile number.' : 'कृपया पार्सल घेणाऱ्याचा १० अंकी मोबाईल नंबर टाका.');
        return;
      }
    }

    // 3. Validate Address Fields
    const cleanFlat = (flatNo || '').trim();
    const cleanBuilding = (building || '').trim();
    const cleanArea = (area || '').trim();
    const cleanCity = (city || 'नाशिक (Nashik)').trim();
    const cleanState = (state || 'महाराष्ट्र (Maharashtra)').trim();
    const cleanPin = (pincode || '').trim();

    if (!cleanFlat) {
      setFormError(lang === 'en' ? 'Please enter House / Flat / Floor No.' : 'कृपया घर किंवा फ्लॅट नंबर टाका.');
      return;
    }
    if (!cleanBuilding) {
      setFormError(lang === 'en' ? 'Please enter Building, Society or Landmark.' : 'कृपया इमारत, सोसायटी नाव किंवा लँडमार्क टाका.');
      return;
    }
    if (!cleanArea) {
      setFormError(lang === 'en' ? 'Please enter Street / Area / Colony.' : 'कृपया रस्ता किंवा परिसराचे नाव टाका.');
      return;
    }
    if (!cleanCity) {
      setFormError(lang === 'en' ? 'Please enter City.' : 'कृपया शहराचे नाव टाका.');
      return;
    }
    if (!cleanPin || cleanPin.length < 6) {
      setFormError(lang === 'en' ? 'Please enter a valid 6-digit PIN code.' : 'कृपया ६ अंकी पिन कोड टाका.');
      return;
    }

    setIsSubmitting(true);

    // 4. Construct complete delivery address
    const addressComponents = [
      `फ्लॅट/घर: ${cleanFlat}`,
      `इमारत/सोसायटी: ${cleanBuilding}`,
      `परिसर: ${cleanArea}`,
      `${cleanCity}, ${cleanState}`,
      `पिन: ${cleanPin}`
    ];
    let fullDeliveryAddress = addressComponents.join(', ');
    if (gpsLocation) {
      fullDeliveryAddress += ` [📍 GPS मॅप: ${gpsLocation}]`;
    }

    const addressPayload = {
      id: selectedAddressId !== 'new' ? selectedAddressId : undefined,
      flatNo: cleanFlat,
      building: cleanBuilding,
      area: cleanArea,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPin,
      fullAddress: fullDeliveryAddress,
      gpsLocation: gpsLocation || ''
    };

    // 5. Handle Address Persistence
    if (deliveryOption === 'home') {
      if (saveAsHomeDefault) {
        saveCustomerAddress(cleanCustPhone, {
          ...addressPayload,
          label: 'Home (घर)'
        }, true);

        // Update customer profile with home address
        saveCustomerProfile({
          name: cleanCustName,
          mobile: cleanCustPhone,
          address: fullDeliveryAddress
        }).catch((err) => {
          console.warn('[CartDrawer] Profile update notice:', err);
        });
      }
    } else if (deliveryOption === 'someone_else') {
      if (saveRecipientForFuture) {
        saveCustomerAddress(cleanCustPhone, {
          ...addressPayload,
          label: cleanRecipientName ? `${cleanRecipientName} (Recipient)` : 'Recipient Address',
          recipientName: cleanRecipientName,
          recipientPhone: cleanRecipientPhone
        }, false);
      }
      // Note: We do NOT overwrite customer's home address profile!
    }

    // 6. Generate Order ID and Compile Order
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const itemsSummary = cartList.map((c) => {
      const addonText = c.addons.length > 0 
        ? ` (${c.addons.map(a => `+${a.qty}x ${a.nameMr}`).join(', ')})`
        : '';
      return `${c.qty}x ${lang === 'en' ? c.item.titleEn : c.item.titleMr}${addonText}`;
    }).join(', ');

    const orderData = {
      id: orderId,
      orderId,
      deliveryOption,
      customerName: cleanCustName,
      customerPhone: cleanCustPhone,
      mobileNumber: cleanCustPhone,
      recipientName: deliveryOption === 'someone_else' ? cleanRecipientName : null,
      recipientPhone: deliveryOption === 'someone_else' ? cleanRecipientPhone : null,
      customerAddress: fullDeliveryAddress,
      addressDetails: {
        flatNo: cleanFlat,
        building: cleanBuilding,
        area: cleanArea,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPin,
        gpsLocation: gpsLocation || null
      },
      itemsSummary,
      items: cartList.map((c) => ({
        titleMr: c.item.titleMr,
        titleEn: c.item.titleEn,
        qty: c.qty,
        subtotal: c.itemTotal
      })),
      total: subtotal,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };

    // Save order history locally
    onOrderPlaced(orderData);

    // 7. Format WhatsApp Order Message
    let waMessage = `*🚩 नवीन जेवण / थाळी ऑर्डर (${orderId})*\n\n`;

    if (deliveryOption === 'someone_else') {
      waMessage += `*🎁 डिलिव्हरी प्रकार:* दुसऱ्यासाठी ऑर्डर (Gift / Relative)\n`;
      waMessage += `*ऑर्डर देणारा ग्राहक:* ${cleanCustName} (+91 ${cleanCustPhone})\n`;
      waMessage += `*पार्सल स्वीकारणारा (Recipient):* ${cleanRecipientName}\n`;
      waMessage += `*स्वीकारणाऱ्याचा फोन:* +91 ${cleanRecipientPhone}\n`;
    } else {
      waMessage += `*🏠 डिलिव्हरी प्रकार:* घरपोच डिलिव्हरी (Home Delivery)\n`;
      waMessage += `*ग्राहक नाव:* ${cleanCustName}\n`;
      waMessage += `*फोन नंबर:* +91 ${cleanCustPhone}\n`;
    }

    waMessage += `\n*डिलिव्हरी पत्ता:*\n`;
    waMessage += `• घर/फ्लॅट क्र: ${cleanFlat}\n`;
    waMessage += `• इमारत/सोसायटी: ${cleanBuilding}\n`;
    waMessage += `• परिसर/रस्ता: ${cleanArea}\n`;
    waMessage += `• शहर/राज्य: ${cleanCity}, ${cleanState} - ${cleanPin}\n`;
    if (gpsLocation) {
      waMessage += `• 📍 GPS लोकेशन मॅप: ${gpsLocation}\n`;
    }

    waMessage += `\n*ऑर्डर केलेले पदार्थ:*\n`;
    cartList.forEach((c, idx) => {
      waMessage += `${idx + 1}. *${c.item.titleMr}* x ${c.qty} = ₹${c.itemTotal}\n`;
      if (c.addons.length > 0) {
        c.addons.forEach((a) => {
          waMessage += `   └─ ➕ *${a.nameMr}* (${a.qty} नग) = +₹${a.price * a.qty}\n`;
        });
      }
    });

    waMessage += `\n*एकूण बिल रक्कम:* ₹${subtotal}\n`;
    waMessage += `*ऑर्डर वेळ:* १ दिवस आधी बुक केली.\n\n`;
    waMessage += `_अनुप्रिताज किचन मोबाईल ॲपवरून पाठवले._`;

    const encodedMsg = encodeURIComponent(waMessage);
    const targetPhone = (whatsappNumber || '7507969291').replace(/\D/g, '');
    const waUrl = `https://wa.me/91${targetPhone}?text=${encodedMsg}`;

    window.open(waUrl, '_blank');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '14px 16px', background: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#ea580c" />
            <h3 className="modal-title" style={{ color: '#9a3412', fontSize: '0.98rem' }}>
              {lang === 'en' ? 'Your Food Basket' : 'तुमची जेवणाची बास्केट'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '16px', maxHeight: '78vh', overflowY: 'auto', paddingBottom: 'max(28px, calc(20px + env(safe-area-inset-bottom, 0px)))' }}>
          {cartList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#78716c' }}>
              <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ fontWeight: 700 }}>
                {lang === 'en' ? 'Your basket is empty.' : 'तुमच्या बास्केटमध्ये कोणताही पदार्थ नाही.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Selected Cart Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cartList.map(({ item, qty, addons, unitPrice, itemTotal }) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      background: '#fcfaf8',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: '1px solid #e7e5e4'
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.titleMr}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/app_icon.png'; }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lang === 'en' ? item.titleEn : item.titleMr}
                      </h4>

                      {/* Render custom extra add-ons */}
                      {addons.length > 0 && (
                        <div style={{ marginTop: '1px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          {addons.map((a, i) => (
                            <span key={i} style={{ fontSize: '0.68rem', color: '#ea580c', fontWeight: 800 }}>
                              + {a.qty}x {lang === 'en' ? a.nameEn : a.nameMr} (+₹{a.price * a.qty})
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.76rem', color: '#ea580c', fontWeight: 800, marginTop: '2px' }}>
                        ₹{itemTotal} <span style={{ fontSize: '0.65rem', color: '#78716c', fontWeight: 500 }}>(₹{unitPrice} x {qty})</span>
                      </div>
                    </div>

                    <div className="stepper" style={{ padding: '2px 4px' }}>
                      <button className="stepper-btn" onClick={() => onUpdateCart(item.id, qty - 1)}>
                        <Minus size={11} />
                      </button>
                      <span className="stepper-val" style={{ fontSize: '0.82rem' }}>{qty}</span>
                      <button className="stepper-btn" onClick={() => onUpdateCart(item.id, qty + 1)}>
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Card */}
              <div style={{ background: '#ecfdf5', padding: '10px 12px', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#065f46', fontSize: '0.85rem' }}>
                  {lang === 'en' ? 'Total Bill Amount:' : 'एकूण बिल रक्कम:'}
                </span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.25rem' }}>
                  ₹{subtotal}
                </span>
              </div>

              {/* DELIVERY DETAILS FORM */}
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Section Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={15} color="#ea580c" />
                    <span>{lang === 'en' ? 'Delivery Address & Details' : 'डिलिव्हरी पत्ता व तपशील'}</span>
                  </h4>
                </div>

                {/* 2 DELIVERY ADDRESS OPTIONS: OPTION A vs OPTION B */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* OPTION A: My Home Address */}
                  <button
                    type="button"
                    onClick={() => handleSwitchOption('home')}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: deliveryOption === 'home' ? '2px solid #ea580c' : '1.5px solid #e7e5e4',
                      background: deliveryOption === 'home' ? '#fff7ed' : '#ffffff',
                      color: deliveryOption === 'home' ? '#c2410c' : '#57534e',
                      fontWeight: deliveryOption === 'home' ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      boxShadow: deliveryOption === 'home' ? '0 2px 8px rgba(234, 88, 12, 0.12)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                      <Home size={14} color={deliveryOption === 'home' ? '#ea580c' : '#78716c'} />
                      <span>{lang === 'en' ? 'Deliver to My Address' : 'माझ्या पत्त्यावर'}</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: deliveryOption === 'home' ? '#ea580c' : '#a8a29e', fontWeight: 600 }}>
                      {lang === 'en' ? 'Home Delivery' : 'घरपोच डिलिव्हरी'}
                    </span>
                  </button>

                  {/* OPTION B: Deliver to Someone Else */}
                  <button
                    type="button"
                    onClick={() => handleSwitchOption('someone_else')}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: deliveryOption === 'someone_else' ? '2px solid #ea580c' : '1.5px solid #e7e5e4',
                      background: deliveryOption === 'someone_else' ? '#fff7ed' : '#ffffff',
                      color: deliveryOption === 'someone_else' ? '#c2410c' : '#57534e',
                      fontWeight: deliveryOption === 'someone_else' ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      boxShadow: deliveryOption === 'someone_else' ? '0 2px 8px rgba(234, 88, 12, 0.12)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                      <Gift size={14} color={deliveryOption === 'someone_else' ? '#ea580c' : '#78716c'} />
                      <span>{lang === 'en' ? 'Deliver to Someone Else' : 'दुसऱ्यासाठी ऑर्डर'}</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: deliveryOption === 'someone_else' ? '#ea580c' : '#a8a29e', fontWeight: 600 }}>
                      {lang === 'en' ? 'Relative / Friend' : 'नातेवाईक / मित्र'}
                    </span>
                  </button>
                </div>

                {/* SAFETY NOTICE FOR OPTION B */}
                {deliveryOption === 'someone_else' && (
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#92400e' }}>
                    <ShieldCheck size={14} color="#d97706" style={{ flexShrink: 0 }} />
                    <span>
                      {lang === 'en' 
                        ? 'Ordering for someone else. Your saved home address will not be overwritten.' 
                        : 'दुसऱ्या व्यक्तीसाठी ऑर्डर. तुमचा घरचा सेव्ह केलेला पत्ता बदलला जाणार नाही.'}
                    </span>
                  </div>
                )}

                {/* CUSTOMER / SENDER DETAILS */}
                <div style={{ background: '#fafaf9', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e7e5e4', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#44403c' }}>
                    {deliveryOption === 'someone_else' 
                      ? (lang === 'en' ? 'Your Details (Order Sender):' : 'तुमची माहिती (ऑर्डर देणारा):') 
                      : (lang === 'en' ? 'Your Contact Details:' : 'तुमची संपर्क माहिती:')}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div className="form-group">
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        placeholder={lang === 'en' ? 'Your Name *' : 'तुमचे नाव *'}
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        style={{ padding: '7px 9px', fontSize: '0.78rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="tel" 
                        required 
                        maxLength={10}
                        className="form-input" 
                        placeholder={lang === 'en' ? 'Mobile (10 Digits) *' : 'मोबाईल (१० अंक) *'}
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ''))}
                        style={{ padding: '7px 9px', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* RECIPIENT DETAILS (OPTION B ONLY) */}
                {deliveryOption === 'someone_else' && (
                  <div style={{ background: '#fffbeb', padding: '8px 10px', borderRadius: '10px', border: '1px solid #fef08a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Gift size={12} color="#ca8a04" />
                      <span>{lang === 'en' ? "Recipient's Details (Who will receive food):" : 'पार्सल स्वीकारणाऱ्याची माहिती:'}</span>
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div className="form-group">
                        <input 
                          type="text" 
                          required 
                          className="form-input" 
                          placeholder={lang === 'en' ? "Recipient's Full Name *" : 'स्वीकारणाऱ्याचे नाव *'}
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          style={{ padding: '7px 9px', fontSize: '0.78rem', borderColor: '#fde047' }}
                        />
                      </div>
                      <div className="form-group">
                        <input 
                          type="tel" 
                          required 
                          maxLength={10}
                          className="form-input" 
                          placeholder={lang === 'en' ? 'Recipient Mobile *' : 'स्वीकारणारा मोबाईल *'}
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                          style={{ padding: '7px 9px', fontSize: '0.78rem', borderColor: '#fde047' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SAVED ADDRESS SELECTION DROPDOWN */}
                {savedAddresses.length > 0 && (
                  <div className="form-group" style={{ marginBottom: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#44403c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookmarkCheck size={13} color="#ea580c" />
                        <span>{lang === 'en' ? 'Select Saved Address:' : 'जतन केलेला पत्ता निवडा:'}</span>
                      </label>
                      {selectedAddressId !== 'new' && (
                        <button
                          type="button"
                          onClick={() => handleSelectSavedAddress('new')}
                          style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          + {lang === 'en' ? 'New Address' : 'नवीन पत्ता'}
                        </button>
                      )}
                    </div>
                    <select
                      className="form-select"
                      value={selectedAddressId}
                      onChange={(e) => handleSelectSavedAddress(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: '0.76rem', borderRadius: '8px', border: '1.5px solid #fed7aa', background: '#fffbeb', fontWeight: 600 }}
                    >
                      <option value="new">+ {lang === 'en' ? 'Enter a New Delivery Address' : 'नवीन पत्ता लिहा'}</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.isHome ? '🏠 ' : '📍 '}{addr.label || (addr.isHome ? 'Home' : 'Address')}: {addr.flatNo ? `${addr.flatNo}, ${addr.building}, ${addr.area}` : (addr.fullAddress || '').substring(0, 36)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* STRUCTURED MANUAL ADDRESS FIELDS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#292524' }}>
                      {deliveryOption === 'someone_else' 
                        ? (lang === 'en' ? "Recipient's Delivery Address:" : 'पार्सल डिलिव्हरी पत्ता:') 
                        : (lang === 'en' ? 'Your Delivery Address:' : 'डिलिव्हरी पत्ता:')}
                    </label>

                    {/* Auto GPS Detect Button */}
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Navigation size={11} className={isLocating ? 'spin-icon' : ''} />
                      <span>{isLocating ? (lang === 'en' ? 'Locating...' : 'शोधत आहे...') : (lang === 'en' ? '📍 GPS Location' : '📍 GPS लोकेशन')}</span>
                    </button>
                  </div>

                  {/* Field 1: Flat / House / Floor No */}
                  <div className="form-group">
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder={lang === 'en' ? 'House / Flat / Floor No. *' : 'घर / फ्लॅट क्र., मजला *'}
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* Field 2: Building / Society / Landmark */}
                  <div className="form-group">
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder={lang === 'en' ? 'Building / Society / Landmark *' : 'इमारत, सोसायटी नाव किंवा लँडमार्क *'}
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* Field 3: Street / Area / Colony */}
                  <div className="form-group">
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder={lang === 'en' ? 'Street / Area / Colony *' : 'रस्ता, परिसर, कॉलनी *'}
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* Field 4 & 5: City & PIN Code */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px' }}>
                    <div className="form-group">
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        placeholder={lang === 'en' ? 'City *' : 'शहर *'}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="tel" 
                        required 
                        maxLength={6}
                        className="form-input" 
                        placeholder={lang === 'en' ? 'PIN Code *' : 'पिन कोड *'}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>

                  {/* GPS Map Tag if Linked */}
                  {gpsLocation && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '4px 8px', fontSize: '0.68rem', color: '#1e40af' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#2563eb" />
                        <span>✓ {lang === 'en' ? 'GPS Location Linked' : 'अचूक GPS लोकेशन जोडले आहे'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setGpsLocation('')}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800 }}
                      >
                        ✕ {lang === 'en' ? 'Remove' : 'काढा'}
                      </button>
                    </div>
                  )}

                  {/* CHECKBOXES FOR SAVING ADDRESS */}
                  {deliveryOption === 'home' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#44403c', cursor: 'pointer', marginTop: '2px' }}>
                      <input 
                        type="checkbox" 
                        checked={saveAsHomeDefault}
                        onChange={(e) => setSaveAsHomeDefault(e.target.checked)}
                        style={{ accentColor: '#ea580c' }}
                      />
                      <span>{lang === 'en' ? 'Save as my default home address' : 'हा पत्ता माझ्या प्रोफाइलमध्ये सेव्ह करा'}</span>
                    </label>
                  ) : (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#44403c', cursor: 'pointer', marginTop: '2px' }}>
                      <input 
                        type="checkbox" 
                        checked={saveRecipientForFuture}
                        onChange={(e) => setSaveRecipientForFuture(e.target.checked)}
                        style={{ accentColor: '#ea580c' }}
                      />
                      <span>{lang === 'en' ? 'Save this recipient address for future orders' : 'हा पत्ता पुढील ऑर्डरसाठी सेव्ह करा'}</span>
                    </label>
                  )}
                </div>

                {/* FORM ERROR MESSAGE */}
                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 10px', fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="submit-btn" 
                  style={{ background: '#25D366', marginTop: '4px', fontSize: '0.92rem', padding: '11px' }}
                >
                  <Send size={18} />
                  <span>
                    {isSubmitting 
                      ? (lang === 'en' ? 'Sending...' : 'पाठवत आहे...') 
                      : (lang === 'en' ? 'Confirm & Send Order via WhatsApp' : 'ऑर्डर नक्की करा व व्हॉट्सॲपवर पाठवा')}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
