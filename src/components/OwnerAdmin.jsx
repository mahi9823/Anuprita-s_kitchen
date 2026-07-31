import React, { useState } from 'react';
import { Plus, Edit2, CheckCircle, Clock, TrendingUp, ShoppingBag, Package, Power, Save, PhoneCall, Sparkles, Leaf, User, Phone, MapPin, Trash2, Lock, Coffee, Sun, Moon, MessageSquare, Check, AlertCircle, Utensils, IndianRupee, CheckCircle2, XCircle, Calendar, DollarSign, Camera, Image as ImageIcon, Smartphone, Users, Cloud, CheckCircle2 as CloudCheck, Flame, Dumbbell, Navigation, Map } from 'lucide-react';
import { pushStateToCloud } from '../services/cloudSync';

const PRESET_APP_PHOTOS = [
  { label: 'गरमागरम आलू पराठा (Aloo Paratha)', url: '/images/aloo_paratha.jpg' },
  { label: 'शेवभाजी व बाजरी भाकरी थाळी (Shev Bhaji)', url: '/images/shev_bhaji_thali_1784915706656.jpg' },
  { label: 'भाजणीचे थालीपीठ (Thalipith)', url: '/images/thalipith_1784915295277.jpg' },
  { label: 'दाक्षिणात्य इडली सांबार (Idli Sambar)', url: '/images/idli_sambar_1784903222164.jpg' },
  { label: 'पुरणपोळी थाळी (Puran Poli Thali)', url: '/images/puran_poli_thali_1784869158979.jpg' },
  { label: 'शाही शाकाहारी थाळी (Veg Thali)', url: '/images/special_veg_thali_1784869181230.jpg' },
  { label: 'पिठलं भाकरी व ठेचा (Pithla Bhakri)', url: '/images/pithla_bhakri_thecha_1784888304481.jpg' },
  { label: 'बटाटा ब्रेड पकोडा (Bread Pakoda)', url: '/images/bread_pakoda_1784902323620.jpg' },
  { label: 'बटाटा वाडा पाव (Wada Pav)', url: '/images/wada_pav_1784901817037.jpg' },
  { label: 'ग्रिल्ड ब्रेड सँडविच (Bread Sandwich)', url: '/images/bread_sandwich_1784901830620.jpg' },
  { label: 'कोथिंबीर वडी (Kothimbir Vadi)', url: '/images/kothimbir_vadi_1784869216924.jpg' },
  { label: 'साबूदाणा वडी (Sabudana Vadi)', url: '/images/sabudana_vadi_1784869227907.jpg' },
  { label: 'साबूदाणा खिचडी (Sabudana Khichdi)', url: '/images/sabudana_khichdi_1784888061331.jpg' },
  { label: 'रताळ्याचा कीस (Ratalyacha Khis)', url: '/images/ratalyacha_khis_1784888078795.jpg' },
  { label: 'अनुप्रिताज किचन ब्रँड आयकॉन', url: '/app_icon.png' }
];

export default function OwnerAdmin({ 
  items, 
  onAddItem, 
  onRemoveItem,
  onToggleStock, 
  onUpdatePrice, 
  ordersList, 
  whatsappNumber, 
  setWhatsappNumber, 
  lang,
  onLockOwner,
  todayMenu,
  onUpdateTodayMenu,
  installCount = 18,
  visitorCount = 142
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [orderFilterTab, setOrderFilterTab] = useState('pending'); // 'pending', 'completed', or 'cancelled'
  const [editingThaliId, setEditingThaliId] = useState(null);
  const [editingThaliItems, setEditingThaliItems] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');

  // New Item State
  const [newTitleMr, setNewTitleMr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCategory, setNewCategory] = useState('daily-upwas');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('थाळी (Plate)');
  const [newAdvanceDays, setNewAdvanceDays] = useState('1'); 
  const [newCalories, setNewCalories] = useState('480');
  const [newProtein, setNewProtein] = useState('15g');
  const [newDescMr, setNewDescMr] = useState('');
  const [newThaliMenuMr, setNewThaliMenuMr] = useState('ताजे घरगुती शाकाहारी साहित्य');
  const [newImage, setNewImage] = useState('/images/shev_bhaji_thali_1784915706656.jpg');

  // Manual Order State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [orderAmount, setOrderAmount] = useState('');

  // Daily menu editor state
  const [breakfastVal, setBreakfastVal] = useState(todayMenu?.breakfast || 'भाजणीचे थालीपीठ, इ़डली सांबार व वाडा पाव');
  const [lunchVal, setLunchVal] = useState(todayMenu?.lunch || 'खानदेशी शेव भाजी + बाजरी भाकरी थाळी');
  const [dinnerVal, setDinnerVal] = useState(todayMenu?.dinner || 'बेसन पिठलं + शेव भाजी + ज्वारी भाकरी');

  // Edit price inline
  const [editingId, setEditingId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');

  // Helper to trigger visual feedback message
  const triggerSyncAlert = (msg) => {
    setSyncMessage(msg);
    setTimeout(() => setSyncMessage(''), 4000);
  };

  // Helper to open Google Maps turn-by-turn navigation for any address string
  const handleOpenGoogleMapNav = (addressStr) => {
    if (!addressStr) return;
    
    // Check if address already contains a direct Google Maps URL
    const gpsMatch = addressStr.match(/https?:\/\/[^\s]+/);
    if (gpsMatch) {
      window.open(gpsMatch[0], '_blank');
    } else {
      const encodedAddress = encodeURIComponent(addressStr);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Orders State (Pending, Completed, Cancelled)
  const [localOrders, setLocalOrders] = useState(() => {
    if (ordersList && ordersList.length > 0) return ordersList;
    return [
      {
        id: 'ORD-1003',
        customerName: 'सुनील देशपांडे (Sunil Deshpande)',
        customerPhone: '9823055443',
        customerAddress: 'कर्वे नगर, पुणे',
        itemsSummary: '१x पुरणपोळी थाळी',
        total: 220,
        date: new Date().toLocaleDateString(),
        time: '01:15 PM',
        status: 'Completed'
      },
      {
        id: 'ORD-1002',
        customerName: 'रमेश पाटील (Ramesh Patil)',
        customerPhone: '9822012345',
        customerAddress: 'फ्लॅट १०२, कोथरूड, पुणे',
        itemsSummary: '२x पुरणपोळी थाळी, १x बासुंदी',
        total: 620,
        date: new Date().toLocaleDateString(),
        time: '12:30 PM',
        status: 'Completed'
      },
      {
        id: 'ORD-1001',
        customerName: 'प्रिया कुलकर्णी (Priya Kulkarni)',
        customerPhone: '9422567890',
        customerAddress: 'घर नं ४५, बाणेर, पुणे [📍 GPS: https://maps.google.com/?q=18.5590,73.7868]',
        itemsSummary: '१x महिना डबा योजना (Monthly Tiffin)',
        total: 3600,
        date: new Date().toLocaleDateString(),
        time: '10:15 AM',
        status: 'Pending'
      }
    ];
  });

  const pendingOrders = localOrders.filter(o => o.status === 'Pending' || o.status === 'pending');
  const completedOrders = localOrders.filter(o => o.status === 'Completed' || o.status === 'completed');
  const cancelledOrders = localOrders.filter(o => o.status === 'Cancelled' || o.status === 'cancelled');

  const totalCompletedRevenue = completedOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalCancelledLostRevenue = cancelledOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalPendingValue = pendingOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const handleSaveDailyMenu = (e) => {
    e.preventDefault();
    const updated = {
      breakfast: breakfastVal,
      lunch: lunchVal,
      updatedAt: new Date().toLocaleTimeString()
    };
    onUpdateTodayMenu(updated);
    pushStateToCloud(items, updated);
    triggerSyncAlert(lang === 'en' ? "Today's menu saved & broadcasted to all customer phones!" : "आजचा खास मेनू बदलला! सर्व ग्राहकांच्या मोबाईलवर अपडेट झाला.");
  };

  const handleSaveThaliItems = (itemId) => {
    const list = editingThaliItems.split(',').map((s) => s.trim()).filter(Boolean);
    const updatedItems = items.map((i) => {
      if (i.id === itemId) {
        return { ...i, ingredientsMr: list, ingredientsEn: list };
      }
      return i;
    });
    setEditingThaliId(null);
    pushStateToCloud(updatedItems, todayMenu);
    triggerSyncAlert(lang === 'en' ? 'Thali Menu Updated & Broadcasted!' : 'थळीतील घटक बदलले! सर्व मोबाईलमध्ये अपडेट झाले.');
  };

  const handleAddManualOrder = (e) => {
    e.preventDefault();
    if (!custName || !orderAmount) {
      alert(lang === 'en' ? 'Please enter customer name and total amount.' : 'कृपया ग्राहकाचे नाव व रक्कमेची नोंद करा.');
      return;
    }

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customerName: custName,
      customerPhone: custPhone || '7507969291',
      customerAddress: custAddress || 'घरगुती डिलिव्हरी',
      itemsSummary: orderDetails || 'घरगुती जेवण ऑर्डर',
      total: parseFloat(orderAmount),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };

    setLocalOrders([newOrder, ...localOrders]);
    setShowManualOrderModal(false);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setOrderDetails('');
    setOrderAmount('');
    triggerSyncAlert(lang === 'en' ? 'New Pending Order Recorded!' : 'ऑर्डरची बाकी (Pending) मध्ये नोंद झाली!');
  };

  const handleChangeOrderStatus = (orderId, newStatus) => {
    setLocalOrders((prev) => {
      const updated = prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
      localStorage.setItem('anuprita_kitchen_orders_v26', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to delete this order record permanently?' : 'ही ऑर्डर रेकॉर्ड लेजरमधून पूर्णपणे हटवायची आहे का?')) {
      setLocalOrders((prev) => {
        const updated = prev.filter((ord) => ord.id !== orderId);
        localStorage.setItem('anuprita_kitchen_orders_v26', JSON.stringify(updated));
        return updated;
      });
      triggerSyncAlert(lang === 'en' ? 'Order record deleted from financial ledger!' : 'ऑर्डर रेकॉर्ड लेजरमधून हटवला गेला!');
    }
  };

  // Resizes and compresses heavy mobile camera photos cleanly
  const compressAndProcessFile = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      compressAndProcessFile(file, (compressedUrl) => {
        callback(compressedUrl);
      });
    }
  };

  const handleChangeItemPhoto = (itemId, photoUrl) => {
    const updatedItems = items.map(i => i.id === itemId ? { ...i, image: photoUrl } : i);
    setEditingPhotoId(null);
    pushStateToCloud(updatedItems, todayMenu);
    triggerSyncAlert(lang === 'en' ? 'Photo updated & broadcasted to all customer apps!' : 'फोटो बदलला! सर्व ग्राहकांच्या मोबाईलवर नवीन फोटो दिसेल.');
  };

  const handleCreateNewItem = (e) => {
    e.preventDefault();
    if (!newTitleMr || !newPrice) {
      alert(lang === 'en' ? 'Please fill title and price.' : 'कृपया नाव आणि किंमत भरा.');
      return;
    }

    const thaliList = newThaliMenuMr.split(',').map((s) => s.trim()).filter(Boolean);
    const advanceDaysNum = parseInt(newAdvanceDays, 10) || 1;

    const newItem = {
      id: 'item-' + Date.now(),
      titleMr: newTitleMr,
      titleEn: newTitleEn || newTitleMr,
      category: newCategory,
      price: parseFloat(newPrice),
      unit: newUnit,
      unitEn: newUnit,
      isVeg: true,
      isUpvas: false,
      isBestseller: false,
      inStock: true,
      rating: 5.0,
      reviewsCount: 1,
      calories: parseInt(newCalories, 10) || 480,
      protein: newProtein || '14g',
      advanceNoticeDays: advanceDaysNum,
      publishedAt: new Date().toISOString(),
      advanceNoticeMr: `${advanceDaysNum} दिवस आधी ऑर्डर द्या`,
      advanceNoticeEn: `${advanceDaysNum} Days Advance Notice Required`,
      prepTime: '२० मि',
      minOrderQty: 1,
      image: newImage || '/images/shev_bhaji_thali_1784915706656.jpg',
      descriptionMr: newDescMr || `घरगुती शाकाहारी स्वादाचा विशेष पदार्थ.`,
      descriptionEn: newDescMr || `Special home-cooked pure veg dish.`,
      ingredientsMr: thaliList.length > 0 ? thaliList : ['शुद्ध शाकाहारी साहित्य', 'घरगुती मसाले'],
      ingredientsEn: thaliList.length > 0 ? thaliList : ['Pure veg ingredients', 'Home-made spices']
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setNewTitleMr('');
    setNewTitleEn('');
    setNewPrice('');
    setNewDescMr('');
    triggerSyncAlert(lang === 'en' ? 'New item published & broadcasted to all customer apps!' : 'नवीन पदार्थ पब्लिश झाला! सर्व ग्राहकांच्या मोबाईलवर लगेच दिसेल.');
  };

  const handleSavePrice = (id) => {
    if (editPriceVal) {
      onUpdatePrice(id, parseFloat(editPriceVal));
      const updatedItems = items.map(i => i.id === id ? { ...i, price: parseFloat(editPriceVal) } : i);
      pushStateToCloud(updatedItems, todayMenu);
      triggerSyncAlert(lang === 'en' ? 'Price updated & broadcasted to all devices!' : 'किंमत बदलली! सर्व मोबाईलवर नवीन किंमत १ सेकंदात अपडेट झाली.');
    }
    setEditingId(null);
  };

  const handleConfirmDelete = (id, name) => {
    if (window.confirm(lang === 'en' ? `Are you sure you want to remove "${name}"?` : `तुम्हाला नक्की "${name}" हा पदार्थ काढून टाकायचा आहे का?`)) {
      onRemoveItem(id);
      const updatedItems = items.filter(i => i.id !== id);
      pushStateToCloud(updatedItems, todayMenu);
      triggerSyncAlert(lang === 'en' ? 'Item removed from all customer apps!' : 'पदार्थ काढून टाकला! सर्व मोबाईलवरून लगेच निघून गेला.');
    }
  };

  const getDisplayedOrders = () => {
    if (orderFilterTab === 'pending') return pendingOrders;
    if (orderFilterTab === 'completed') return completedOrders;
    return cancelledOrders;
  };

  const displayedOrders = getDisplayedOrders();

  return (
    <div className="owner-panel">
      {/* Banner */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)', borderBottom: '2px solid #ea580c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className="welcome-badge" style={{ background: '#ea580c', color: 'white' }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {lang === 'en' ? "Owner: Reva Hosing Dashboard" : 'मालक: रेवा होसिंग डॅशबोर्ड'}
              </span>

              {/* REALTIME CLOUD AUTO-SYNC STATUS BADGE */}
              <span style={{ background: '#16a34a', color: 'white', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Cloud size={11} />
                <span>{lang === 'en' ? 'Cloud Sync: Active' : '☁️ क्लाउड सिंक: चालू'}</span>
              </span>
            </div>

            <h2 className="welcome-title" style={{ color: '#fef08a' }}>
              {lang === 'en' ? 'Reva Hosing - Analytics & Live Sync' : 'रेवा होसिंग - ऑर्डर्स व रिअल-टाईम बदल'}
            </h2>
            <p className="welcome-subtitle">
              {lang === 'en' 
                ? 'Any price or menu change made here instantly updates on all installed customer phones!' 
                : 'येथून बदललेली किंमत किंवा मेनू १ सेकंदात सर्व ग्राहकांच्या मोबाईलवर दिसायला सुरुवात होते!'}
            </p>
          </div>

          <button
            onClick={onLockOwner}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Lock size={13} />
            <span>{lang === 'en' ? 'Lock Panel' : 'लॉक करा'}</span>
          </button>
        </div>
      </div>

      {/* SYNC NOTIFICATION TOAST */}
      {syncMessage && (
        <div style={{ background: '#16a34a', color: 'white', padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
          <CloudCheck size={18} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* APP INSTALLS & VISITORS TRACKER CARD */}
      <div className="stat-grid" style={{ marginBottom: '8px' }}>
        <div className="stat-card" style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
          <span className="stat-lbl" style={{ color: '#1e40af', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Smartphone size={14} color="#2563eb" />
            {lang === 'en' ? 'App Installed Devices' : 'ॲप इन्स्टॉल केलेल्या व्यक्ती'}
          </span>
          <span className="stat-val" style={{ color: '#1d4ed8', fontSize: '1.5rem', fontWeight: 800 }}>
            {installCount} <span style={{ fontSize: '0.72rem', color: '#1e3a8a', fontWeight: 700 }}>{lang === 'en' ? 'Devices' : 'मोबाईल'}</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 700 }}>
            {lang === 'en' ? '✓ Installed Home Screen App' : '✓ मोबाईल होम स्क्रीनवर ॲप वापरकर्ते'}
          </span>
        </div>

        <div className="stat-card" style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff' }}>
          <span className="stat-lbl" style={{ color: '#6b21a8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} color="#9333ea" />
            {lang === 'en' ? 'Total App Visitors' : 'एकूण मोबाईल ॲप भेट'}
          </span>
          <span className="stat-val" style={{ color: '#7e22ce', fontSize: '1.5rem', fontWeight: 800 }}>
            {visitorCount} <span style={{ fontSize: '0.72rem', color: '#581c87', fontWeight: 700 }}>{lang === 'en' ? 'Visits' : 'भेटकर्ते'}</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 700 }}>
            {lang === 'en' ? '🌐 Total Online Unique Visitors' : '🌐 मोबाईलवर ॲप पाहणाऱ्या व्यक्ती'}
          </span>
        </div>
      </div>



      {/* FINANCIAL MONTH-END SUMMARY CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: 'white', padding: '14px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> {lang === 'en' ? 'Net Monthly Income (Completed Orders)' : 'महिन्याचे एकूण मिळालेले जमा उत्पन्न'}
            </span>
            <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
              {lang === 'en' ? 'Net Profit' : 'निव्वळ नफा'}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
            ₹{totalCompletedRevenue}
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px' }}>
            {lang === 'en' 
              ? `From ${completedOrders.length} Successfully Completed & Paid Orders` 
              : `${completedOrders.length} पूर्ण झालेल्या ऑर्डर्समधून मिळालेले पैसे`}
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card" style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}>
            <span className="stat-lbl" style={{ color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={12} /> {lang === 'en' ? 'Pending Sales' : 'बाकी (Pending) ऑर्डर्स'}
            </span>
            <span className="stat-val" style={{ color: '#d97706', fontSize: '1.25rem' }}>₹{totalPendingValue}</span>
            <span style={{ fontSize: '0.68rem', color: '#78716c' }}>({pendingOrders.length} Orders Pending)</span>
          </div>

          <div className="stat-card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <span className="stat-lbl" style={{ color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <XCircle size={12} /> {lang === 'en' ? 'Cancelled Orders' : 'कॅन्सल ऑर्डर्स (Lost)'}
            </span>
            <span className="stat-val" style={{ color: '#dc2626', fontSize: '1.25rem' }}>₹{totalCancelledLostRevenue}</span>
            <span style={{ fontSize: '0.68rem', color: '#991b1b' }}>({cancelledOrders.length} Orders Cancelled)</span>
          </div>
        </div>
      </div>

      {/* PENDING vs COMPLETED vs CANCELLED ORDERS SECTIONS */}
      <div className="calc-card" style={{ background: 'white', border: '1.5px solid #ea580c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={16} color="#ea580c" />
            <span>{lang === 'en' ? 'Detailed Financial Order Ledger' : 'सविस्तर ऑर्डर्स व रकमांचा हिशोब'}</span>
          </h3>

          <button
            onClick={() => setShowManualOrderModal(true)}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={12} />
            <span>{lang === 'en' ? 'Add Order' : 'नवीन नोंद'}</span>
          </button>
        </div>

        {/* Pending vs Completed vs Cancelled Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#f5f5f4', padding: '3px', borderRadius: '12px' }}>
          <button
            onClick={() => setOrderFilterTab('pending')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '9px',
              border: 'none',
              background: orderFilterTab === 'pending' ? '#ea580c' : 'transparent',
              color: orderFilterTab === 'pending' ? 'white' : '#57534e',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}
          >
            <Clock size={12} />
            <span>{lang === 'en' ? `Pending (${pendingOrders.length})` : `बाकी (${pendingOrders.length})`}</span>
          </button>

          <button
            onClick={() => setOrderFilterTab('completed')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '9px',
              border: 'none',
              background: orderFilterTab === 'completed' ? '#16a34a' : 'transparent',
              color: orderFilterTab === 'completed' ? 'white' : '#57534e',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}
          >
            <CheckCircle2 size={12} />
            <span>{lang === 'en' ? `Done (${completedOrders.length})` : `पूर्ण (${completedOrders.length})`}</span>
          </button>

          <button
            onClick={() => setOrderFilterTab('cancelled')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '9px',
              border: 'none',
              background: orderFilterTab === 'cancelled' ? '#dc2626' : 'transparent',
              color: orderFilterTab === 'cancelled' ? 'white' : '#57534e',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}
          >
            <XCircle size={12} />
            <span>{lang === 'en' ? `Cancel (${cancelledOrders.length})` : `कॅन्सल (${cancelledOrders.length})`}</span>
          </button>
        </div>

        {/* Orders List Container */}
        {displayedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#78716c' }}>
            <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: '6px' }} />
            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {orderFilterTab === 'pending' 
                ? (lang === 'en' ? 'No pending orders right now.' : 'सध्या कोणतीही बाकी (Pending) ऑर्डर नाही.') 
                : orderFilterTab === 'completed'
                ? (lang === 'en' ? 'No completed orders yet.' : 'अद्याप कोणतीही पूर्ण झालेली ऑर्डर नाही.')
                : (lang === 'en' ? 'No cancelled orders.' : 'कोणतीही कॅन्सल झालेली ऑर्डर नाही.')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {displayedOrders.map((ord) => (
              <div 
                key={ord.id} 
                style={{
                  background: ord.status === 'Completed' ? '#f0fdf4' : ord.status === 'Cancelled' ? '#fef2f2' : '#fff7ed',
                  border: ord.status === 'Completed' ? '1.5px solid #bbf7d0' : ord.status === 'Cancelled' ? '1.5px solid #fca5a5' : '1.5px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1c1917' }}>
                      {ord.customerName}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#57534e', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={11} color="#ea580c" />
                      <span>{ord.customerPhone}</span>
                      <span style={{ opacity: 0.5 }}>•</span>
                      <Clock size={11} color="#78716c" />
                      <span>{ord.date} {ord.time}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: ord.status === 'Cancelled' ? '#dc2626' : '#ea580c' }}>
                      ₹{ord.total}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#44403c', background: 'white', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e7e5e4' }}>
                  <strong>{lang === 'en' ? 'Items:' : 'ऑर्डर मेनू:'}</strong> {ord.itemsSummary || (ord.items ? ord.items.map(i => i.name + ' x' + i.qty).join(', ') : 'घरगुती ऑर्डर')}
                </div>

                {/* CLICKABLE GOOGLE MAPS DELIVERY ADDRESS BUTTON FOR DELIVERY BOY */}
                {ord.customerAddress && (
                  <div 
                    onClick={() => handleOpenGoogleMapNav(ord.customerAddress)}
                    style={{ 
                      fontSize: '0.75rem', 
                      color: '#1d4ed8', 
                      background: '#eff6ff',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '4px',
                      fontWeight: 700
                    }}
                    title="Click to open Google Maps navigation"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
                      <MapPin size={14} color="#2563eb" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ord.customerAddress}
                      </span>
                    </div>

                    <span style={{ background: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                      <Navigation size={10} />
                      <span>{lang === 'en' ? 'Maps Nav' : '🗺️ रस्ता पाहा'}</span>
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #e7e5e4', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a
                      href={`tel:${ord.customerPhone}`}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Phone size={10} /> {lang === 'en' ? 'Call' : 'फोन'}
                    </a>
                    <a
                      href={`https://wa.me/91${ord.customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#25D366',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <MessageSquare size={10} /> WhatsApp
                    </a>

                    {ord.customerAddress && (
                      <button
                        onClick={() => handleOpenGoogleMapNav(ord.customerAddress)}
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Map size={10} /> {lang === 'en' ? 'Google Maps' : 'गूगल मॅप'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {ord.status !== 'Completed' && (
                      <button
                        onClick={() => handleChangeOrderStatus(ord.id, 'Completed')}
                        style={{
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <CheckCircle2 size={11} />
                        <span>{lang === 'en' ? 'Done & Paid' : 'पूर्ण झाले'}</span>
                      </button>
                    )}

                    {ord.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleChangeOrderStatus(ord.id, 'Cancelled')}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <XCircle size={11} />
                        <span>{lang === 'en' ? 'Cancel' : 'कॅन्सल करा'}</span>
                      </button>
                    )}

                    {ord.status !== 'Pending' && (
                      <button
                        onClick={() => handleChangeOrderStatus(ord.id, 'Pending')}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Clock size={11} />
                        <span>{lang === 'en' ? 'Set Pending' : 'बाकी करा'}</span>
                      </button>
                    )}

                    {/* DELETE ORDER RECORD BUTTON */}
                    <button
                      onClick={() => handleDeleteOrder(ord.id)}
                      title={lang === 'en' ? 'Delete Order Record' : 'ऑर्डर रेकॉर्ड लेजरमधून पूर्णपणे हटवा'}
                      style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fca5a5',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Trash2 size={11} color="#dc2626" />
                      <span>{lang === 'en' ? 'Delete' : 'हटवा'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <button 
        className="submit-btn" 
        onClick={() => setShowAddModal(true)}
        style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}
      >
        <Plus size={18} />
        <span>{lang === 'en' ? '➕ Add New Item / Dish' : '➕ नवीन थाळी किंवा पदार्थ जोडा'}</span>
      </button>

      {/* MANAGE & EDIT PRICE & THALI INCLUDED DISHES SECTION */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1c1917', marginTop: '10px' }}>
        {lang === 'en' ? 'Edit Prices, Photos & Thali Items (' + items.length + ' Items)' : 'पदार्थांची किंमत, फोटो व थाळी घटक बदला (' + items.length + ' पदार्थ)'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => (
          <div key={item.id} className="food-card" style={{ padding: '12px', opacity: item.inStock ? 1 : 0.6 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={item.image} 
                  alt={item.titleMr} 
                  style={{ width: '58px', height: '58px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #ea580c' }} 
                  onError={(e) => { e.target.src = '/app_icon.png'; }}
                />
                <button
                  onClick={() => setEditingPhotoId(editingPhotoId === item.id ? null : item.id)}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    background: '#ea580c',
                    color: 'white',
                    border: '1px solid white',
                    borderRadius: '50%',
                    padding: '3px',
                    cursor: 'pointer'
                  }}
                  title="Change photo"
                >
                  <Camera size={10} />
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {lang === 'en' ? item.titleEn : item.titleMr}
                </h4>

                <div style={{ fontSize: '0.72rem', color: '#78716c', marginTop: '2px', display: 'flex', gap: '8px' }}>
                  <span>🔥 {item.calories || 450} kcal</span>
                  <span>💪 {item.protein || '14g'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#fef3c7', padding: '2px 6px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>₹</span>
                      <input 
                        type="number" 
                        style={{ width: '64px', padding: '2px 4px', fontSize: '0.85rem', fontWeight: 'bold' }} 
                        defaultValue={item.price}
                        onChange={(e) => setEditPriceVal(e.target.value)}
                      />
                      <button onClick={() => handleSavePrice(item.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem' }}>
                        <Save size={12} style={{ display: 'inline', marginRight: '2px' }} />
                        {lang === 'en' ? 'Save' : 'साठवा'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ea580c' }}>
                        ₹{item.price} <span style={{ fontSize: '0.7rem', color: '#78716c', fontWeight: 500 }}>({item.unit})</span>
                      </span>

                      <button 
                        onClick={() => { setEditingId(item.id); setEditPriceVal(item.price); }}
                        style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Edit2 size={11} /> {lang === 'en' ? 'Edit Price' : 'किंमत बदला'}
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => { 
                      setEditingThaliId(item.id); 
                      setEditingThaliItems(item.ingredientsMr ? item.ingredientsMr.join(', ') : ''); 
                    }}
                    style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#ea580c', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Utensils size={11} /> {lang === 'en' ? 'Edit Thali Menu' : 'थाळीतील पदार्थ बदला'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    onToggleStock(item.id);
                    const updatedItems = items.map(i => i.id === item.id ? { ...i, inStock: !i.inStock } : i);
                    pushStateToCloud(updatedItems, todayMenu);
                    triggerSyncAlert(lang === 'en' ? 'Stock status updated & broadcasted!' : 'उपलब्धता बदलली! सर्व मोबाईलवर अपडेट झाली.');
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '16px',
                    border: 'none',
                    background: item.inStock ? '#dcfce7' : '#fee2e2',
                    color: item.inStock ? '#15803d' : '#b91c1c',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Power size={12} />
                  <span>{item.inStock ? (lang === 'en' ? 'In Stock' : 'उपलब्ध') : (lang === 'en' ? 'Out' : 'संपले')}</span>
                </button>

                <button
                  onClick={() => handleConfirmDelete(item.id, lang === 'en' ? item.titleEn : item.titleMr)}
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    border: '1px solid #fca5a5',
                    background: '#fee2e2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Inline Photo Editor Box */}
            {editingPhotoId === item.id && (
              <div style={{ marginTop: '8px', padding: '10px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Camera size={13} /> {lang === 'en' ? 'Upload or Change Photo for this dish:' : 'या पदार्थाचा नवीन फोटो बदला:'}
                </label>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, (newUrl) => handleChangeItemPhoto(item.id, newUrl))}
                    style={{ fontSize: '0.75rem' }} 
                  />
                </div>

                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#78716c', fontWeight: 700 }}>किंवा जुना फोटो निवडा:</span>
                  <select 
                    className="form-select"
                    style={{ fontSize: '0.72rem', marginTop: '2px' }}
                    onChange={(e) => handleChangeItemPhoto(item.id, e.target.value)}
                  >
                    <option value="">-- फोटो निवडा --</option>
                    {PRESET_APP_PHOTOS.map((p, idx) => (
                      <option key={idx} value={p.url}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Inline Thali Menu Items Editor */}
            {editingThaliId === item.id && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9a3412' }}>
                  {lang === 'en' ? 'Thali Included Menu Items (Separate with commas):' : 'थाळीत समाविष्ट पदार्थ (स्वल्पविराम , देऊन जोडा व काढा):'}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingThaliItems}
                  onChange={(e) => setEditingThaliItems(e.target.value)}
                  placeholder="उदा. २ पोळ्या, पनीर भाजी, वांगी, वरण भात, सोलकढी"
                />
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setEditingThaliId(null)}
                    style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {lang === 'en' ? 'Cancel' : 'रद्द'}
                  </button>
                  <button 
                    onClick={() => handleSaveThaliItems(item.id)}
                    style={{ background: '#ea580c', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    {lang === 'en' ? 'Save Thali Items' : 'थाळी पदार्थ साठवा'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Item / Thali Modal with Compressed Photo Upload & Advance Notice & Nutrition Setting */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{lang === 'en' ? 'Add New Dish to Menu' : 'नवीन पदार्थ तयार करा (सर्व मोबाईलवर दिसेल)'}</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateNewItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Item Name (Marathi) *' : 'पदार्थाचे नाव (मराठी) *'}</label>
                <input type="text" required className="form-input" placeholder="उदा. खमंग भाजणीचे थालीपीठ" value={newTitleMr} onChange={(e) => setNewTitleMr(e.target.value)} />
              </div>

              {/* NUTRITION CALORIES & PROTEIN INPUTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Flame size={12} /> {lang === 'en' ? 'Calories (kcal)' : 'उष्मांक (कॅलरीज)'}
                  </label>
                  <input type="number" className="form-input" placeholder="520" value={newCalories} onChange={(e) => setNewCalories(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Dumbbell size={12} /> {lang === 'en' ? 'Protein (e.g. 16g)' : 'प्रथिने (उदा. 16g)'}
                  </label>
                  <input type="text" className="form-input" placeholder="16g" value={newProtein} onChange={(e) => setNewProtein(e.target.value)} />
                </div>
              </div>

              {/* ADVANCE NOTICE DAYS SETTING (e.g. 2 Days Cutoff) */}
              <div className="form-group" style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <label className="form-label" style={{ color: '#1e40af', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} color="#2563eb" />
                  <span>{lang === 'en' ? 'Advance Notice Order Cutoff (Days):' : 'ऑर्डर मुदत (ऑर्डर किती दिवस आधी द्यावी लागेल?):'}</span>
                </label>

                <select 
                  className="form-select" 
                  value={newAdvanceDays} 
                  onChange={(e) => setNewAdvanceDays(e.target.value)}
                  style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '4px' }}
                >
                  <option value="1">१ दिवस आधी नोंदणी आवश्यक</option>
                  <option value="2">२ दिवस आधी नोंदणी आवश्यक (२ दिवसांनंतर ऑटो डिसेबल)</option>
                  <option value="3">३ दिवस आधी नोंदणी आवश्यक</option>
                </select>
              </div>

              {/* FLEXIBLE PHOTO SELECTOR (AUTO COMPRESSED) */}
              <div className="form-group" style={{ background: '#fff7ed', padding: '10px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                <label className="form-label" style={{ color: '#9a3412', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={14} color="#ea580c" />
                  <span>{lang === 'en' ? 'Select Dish Photo:' : 'पदार्थाचा फोटो जोडा:'}</span>
                </label>

                {/* Photo Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
                  <img src={newImage} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ea580c' }} onError={(e) => { e.target.src = '/app_icon.png'; }} />
                  <span style={{ fontSize: '0.72rem', color: '#57534e' }}>{lang === 'en' ? 'Selected Photo Preview' : 'निवडलेला फोटो'}</span>
                </div>

                {/* Option 1: Mobile Gallery / Camera Upload */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#44403c', display: 'block', marginBottom: '2px' }}>
                    📷 {lang === 'en' ? 'Option 1: Upload from Mobile Gallery / Camera' : 'पायरी १: मोबाईल गॅलरी किंवा कॅमेऱ्याने फोटो काढा'}
                  </label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (compressedUrl) => setNewImage(compressedUrl))} className="form-input" style={{ padding: '4px', fontSize: '0.75rem' }} />
                </div>

                {/* Option 2: Choose Old App Preset Photo */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#44403c', display: 'block', marginBottom: '2px' }}>
                    🖼️ {lang === 'en' ? 'Option 2: Pick from App Food Photos' : 'पायरी २: ॲपमधील फोटो निवडा'}
                  </label>
                  <select 
                    className="form-select" 
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {PRESET_APP_PHOTOS.map((p, idx) => (
                      <option key={idx} value={p.url}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Included Items (Commas separated)' : 'पदार्थात समाविष्ट घटक (स्वल्पविराम , देऊन जोडा)'}</label>
                <input type="text" className="form-input" placeholder="उदा. २ थालीपीठ, पांढरे लोणी, दही व ठेचा" value={newThaliMenuMr} onChange={(e) => setNewThaliMenuMr(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'en' ? 'Category' : 'वर्ग (Category)'}</label>
                  <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="daily-upwas">दैनिक उपवास (Daily Upwas)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'en' ? 'Price (₹) *' : 'किंमत (₹) *'}</label>
                  <input type="number" required className="form-input" placeholder="80" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Unit' : 'माप (Unit)'}</label>
                <input type="text" className="form-input" placeholder="उदा. प्लेट (2 Pcs)" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Description' : 'वर्णन (Description)'}</label>
                <textarea rows={2} className="form-textarea" placeholder="पदार्थाची माहिती..." value={newDescMr} onChange={(e) => setNewDescMr(e.target.value)} />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '10px', background: '#ea580c' }}>
                <span>{lang === 'en' ? 'Save & Broadcast to All Devices' : 'पब्लिश करा (सर्व मोबाईलवर सिंक होईल)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
