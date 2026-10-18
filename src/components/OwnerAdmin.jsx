import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit2, 
  Power, 
  Save, 
  Trash2, 
  Lock, 
  Utensils, 
  Calendar, 
  Camera, 
  Image as ImageIcon, 
  Users, 
  CheckCircle2 as CloudCheck, 
  Flame, 
  Dumbbell, 
  RefreshCw
} from 'lucide-react';

import { INITIAL_CATEGORIES } from '../data/foodData';
import { fetchDashboardMetrics } from '../services/userService';

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
  { label: 'खमंग पोहे चिवडा (Pohe Chiwda)', url: '/images/pohe_chivda.jpg' },
  { label: 'अनुप्रिताज किचन ब्रँड आयकॉन', url: '/app_icon.png' }
];

export default function OwnerAdmin({ 
  items, 
  onAddItem, 
  onRemoveItem, 
  onToggleStock, 
  onUpdatePrice, 
  lang,
  onLockOwner,
  todayMenu: _todayMenu,
  onUpdateTodayMenu: _onUpdateTodayMenu,
  onUpdateItems
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingThaliId, setEditingThaliId] = useState(null);
  const [editingThaliItems, setEditingThaliItems] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');

  // Dashboard Live Metrics State (Supabase)
  const [metrics, setMetrics] = useState({
    firstOpenDevices: null,
    totalRegisteredCustomers: null,
    uniqueCustomersLoggedIn: null
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

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

  // Edit price inline
  const [editingId, setEditingId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');

  // Helper to trigger visual feedback message
  const triggerSyncAlert = (msg) => {
    setSyncMessage(msg);
    setTimeout(() => setSyncMessage(''), 4000);
  };

  // Fetch live persistent dashboard metrics from Supabase
  const loadDashboardMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const res = await fetchDashboardMetrics();
      if (res.error) {
        setMetricsError(res.error);
        setMetrics({
          firstOpenDevices: null,
          totalRegisteredCustomers: null,
          uniqueCustomersLoggedIn: null
        });
      } else {
        setMetrics({
          firstOpenDevices: res.firstOpenDevices ?? 0,
          totalRegisteredCustomers: res.totalRegisteredCustomers ?? 0,
          uniqueCustomersLoggedIn: res.uniqueCustomersLoggedIn ?? 0
        });
      }
    } catch (err) {
      setMetricsError(err.message || 'Failed to load dashboard metrics');
      setMetrics({
        firstOpenDevices: null,
        totalRegisteredCustomers: null,
        uniqueCustomersLoggedIn: null
      });
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  const handleSaveThaliItems = (itemId) => {
    const list = editingThaliItems.split(',').map((s) => s.trim()).filter(Boolean);
    const updatedItems = items.map((i) => {
      if (i.id === itemId) {
        return { ...i, ingredientsMr: list, ingredientsEn: list };
      }
      return i;
    });
    setEditingThaliId(null);
    if (onUpdateItems) onUpdateItems(updatedItems);
    triggerSyncAlert(lang === 'en' ? 'Thali Menu Updated & Broadcasted!' : 'थाळीतील घटक बदलले! सर्व मोबाईलमध्ये अपडेट झाले.');
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
    const file = e.target.files?.[0];
    if (file) {
      compressAndProcessFile(file, (compressedUrl) => {
        callback(compressedUrl);
      });
    }
  };

  const handleChangeItemPhoto = (itemId, photoUrl) => {
    const updatedItems = items.map(i => i.id === itemId ? { ...i, image: photoUrl } : i);
    setEditingPhotoId(null);
    if (onUpdateItems) onUpdateItems(updatedItems);
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
      triggerSyncAlert(lang === 'en' ? 'Price updated & broadcasted to all devices!' : 'किंमत बदलली! सर्व मोबाईलवर नवीन किंमत १ सेकंदात अपडेट झाली.');
    }
    setEditingId(null);
  };

  const handleConfirmDelete = (id, name) => {
    if (window.confirm(lang === 'en' ? `Are you sure you want to remove "${name}"?` : `तुम्हाला नक्की "${name}" हा पदार्थ काढून टाकायचा आहे का?`)) {
      onRemoveItem(id);
      triggerSyncAlert(lang === 'en' ? 'Item removed from all customer apps!' : 'पदार्थ काढून टाकला! सर्व मोबाईलवरून लगेच निघून गेला.');
    }
  };

  return (
    <div className="owner-panel">
      {/* SYNC NOTIFICATION TOAST */}
      {syncMessage && (
        <div style={{ background: '#16a34a', color: 'white', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}>
          <CloudCheck size={16} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* COMPACT SINGLE ROW: TOTAL REGISTERED CUSTOMERS */}
      <div 
        style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Left: Icon and Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '8px', 
            background: '#dcfce7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={15} color="#16a34a" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontSize: '0.78rem', 
              fontWeight: 800, 
              color: '#166534', 
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {lang === 'en' ? 'Total Registered Customers' : 'एकूण नोंदणीकृत ग्राहक'}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#15803d', fontWeight: 600 }}>
              {lang === 'en' ? 'Live Supabase count' : 'थेट डेटाबेस नोंदणी'}
            </div>
          </div>
        </div>

        {/* Right: Count and Actions (Refresh & Lock) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {metricsLoading ? (
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
              ...
            </span>
          ) : metricsError ? (
            <button
              onClick={loadDashboardMetrics}
              title={metricsError}
              style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? 'Retry' : 'पुन्हा बघा'}
            </button>
          ) : (
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', minWidth: '22px', textAlign: 'right' }}>
              {metrics.totalRegisteredCustomers ?? 0}
            </span>
          )}

          <button
            onClick={loadDashboardMetrics}
            disabled={metricsLoading}
            title={lang === 'en' ? 'Refresh count' : 'रिफ्रेश करा'}
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '4px 6px',
              borderRadius: '6px',
              cursor: metricsLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={11} style={{ animation: metricsLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          {onLockOwner && (
            <button
              onClick={onLockOwner}
              title={lang === 'en' ? 'Lock Owner Admin' : 'ॲडमिन लॉक करा'}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}
            >
              <Lock size={10} />
              <span>{lang === 'en' ? 'Lock' : 'लॉक'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <button 
        className="submit-btn" 
        onClick={() => setShowAddModal(true)}
        style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', margin: '2px 0 6px 0', padding: '9px' }}
      >
        <Plus size={16} />
        <span style={{ fontSize: '0.85rem' }}>{lang === 'en' ? '➕ Add New Item / Dish' : '➕ नवीन थाळी किंवा पदार्थ जोडा'}</span>
      </button>

      {/* MANAGE & EDIT PRICE & THALI INCLUDED DISHES SECTION */}
      <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1c1917', marginBottom: '6px' }}>
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
                    {INITIAL_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'en' ? c.nameEn : c.nameMr}
                      </option>
                    ))}
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
