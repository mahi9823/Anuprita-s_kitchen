import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import FoodCard from './components/FoodCard';
import CateringCalculator from './components/CateringCalculator';
import CartDrawer from './components/CartDrawer';
import DishDetailModal from './components/DishDetailModal';
import OwnerAdmin from './components/OwnerAdmin';
import BottomNav from './components/BottomNav';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import OwnerPinModal from './components/OwnerPinModal';
import TiffinPlans from './components/TiffinPlans';
import TodaySpecialMenu from './components/TodaySpecialMenu';
import { INITIAL_ITEMS } from './data/foodData';
import { pushStateToCloud, fetchStateFromCloud } from './services/cloudSync';
import { Sparkles, Leaf, AlertCircle, Calendar, Code, RefreshCw, Zap, CloudCheck } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en'); // Default language set to English
  const [items, setItems] = useState(() => {
    // Force reset cache version key to v25 for Extra Add-ons sync
    const versionKey = 'anuprita_kitchen_v25_extra_addons';
    const hasSynced = localStorage.getItem(versionKey);
    
    if (!hasSynced) {
      localStorage.setItem(versionKey, 'true');
      localStorage.setItem('anuprita_kitchen_items_v25', JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }

    const saved = localStorage.getItem('anuprita_kitchen_items_v25');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [todayMenu, setTodayMenu] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_today_menu');
    return saved ? JSON.parse(saved) : {
      breakfast: 'भाजणीचे थालीपीठ, इ़डली सांबार व वाडा पाव (Thalipith & Wada Pav)',
      lunch: 'खानदेशी शेव भाजी + बाजरी भाकरी थाळी (Shev Bhaji & Bajra Bhakri)',
      dinner: 'बेसन पिठलं + शेव भाजी + ज्वारी भाकरी (Pithla & Bhakri)'
    };
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_cart_v25');
    return saved ? JSON.parse(saved) : {};
  });

  const [ordersList, setOrdersList] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_orders_v25');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_user');
    return saved ? JSON.parse(saved) : null;
  });

  // App Install & Visitor Tracking State
  const [installCount, setInstallCount] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_install_count');
    return saved ? parseInt(saved, 10) : 18; // Base installs count
  });

  const [visitorCount, setVisitorCount] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_visitor_count');
    return saved ? parseInt(saved, 10) : 142; // Base visitors count
  });

  const [lastCloudSyncTime, setLastCloudSyncTime] = useState(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('9403276767');
  const [selectedCat, setSelectedCat] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOwnerPinModal, setShowOwnerPinModal] = useState(false);

  // AUTOMATIC REALTIME CLOUD SYNC: Pull latest owner edits from Cloud database every 10 seconds!
  useEffect(() => {
    const syncFromCloud = async () => {
      setIsSyncingCloud(true);
      const cloudData = await fetchStateFromCloud();
      if (cloudData && cloudData.items && cloudData.items.length > 0) {
        setItems(cloudData.items);
        if (cloudData.todayMenu) {
          setTodayMenu(cloudData.todayMenu);
        }
        setLastCloudSyncTime(new Date().toLocaleTimeString());
      } else {
        // Seed cloud database with latest menu including extra add-ons!
        pushStateToCloud(INITIAL_ITEMS, todayMenu);
      }
      setIsSyncingCloud(false);
    };

    // Initial fetch on app open
    syncFromCloud();

    // Poll every 10 seconds for real-time background sync on all customer phones
    const intervalId = setInterval(syncFromCloud, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Track app installation and unique mobile visits
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasTrackedVisit = sessionStorage.getItem('anuprita_visited_session');

    if (!hasTrackedVisit) {
      sessionStorage.setItem('anuprita_visited_session', 'true');
      setVisitorCount((prev) => {
        const updated = prev + 1;
        localStorage.setItem('anuprita_kitchen_visitor_count', updated.toString());
        return updated;
      });
    }

    if (isStandalone) {
      const hasTrackedInstall = localStorage.getItem('anuprita_installed_device');
      if (!hasTrackedInstall) {
        localStorage.setItem('anuprita_installed_device', 'true');
        setInstallCount((prev) => {
          const updated = prev + 1;
          localStorage.setItem('anuprita_kitchen_install_count', updated.toString());
          return updated;
        });
      }
    }

    const handleAppInstalled = () => {
      localStorage.setItem('anuprita_installed_device', 'true');
      setInstallCount((prev) => {
        const updated = prev + 1;
        localStorage.setItem('anuprita_kitchen_install_count', updated.toString());
        return updated;
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  // Helper to commit state locally & upload to Cloud Database immediately!
  const commitAndPushState = (newItems, newTodayMenu) => {
    const itemsToSave = newItems !== undefined ? newItems : items;
    const todayMenuToSave = newTodayMenu !== undefined ? newTodayMenu : todayMenu;

    setItems(itemsToSave);
    setTodayMenu(todayMenuToSave);

    localStorage.setItem('anuprita_kitchen_items_v25', JSON.stringify(itemsToSave));
    localStorage.setItem('anuprita_kitchen_today_menu', JSON.stringify(todayMenuToSave));

    // Upload to Cloud Database so all customer devices receive the update immediately!
    pushStateToCloud(itemsToSave, todayMenuToSave).then(() => {
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    });
  };

  useEffect(() => {
    localStorage.setItem('anuprita_kitchen_items_v25', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('anuprita_kitchen_cart_v25', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('anuprita_kitchen_orders_v25', JSON.stringify(ordersList));
  }, [ordersList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('anuprita_kitchen_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('anuprita_kitchen_user');
    }
  }, [currentUser]);

  // Force hard refresh app cache function for mobile devices
  const handleForceRefreshMenu = async () => {
    setIsSyncingCloud(true);
    const cloudData = await fetchStateFromCloud();
    if (cloudData && cloudData.items) {
      setItems(cloudData.items);
      if (cloudData.todayMenu) setTodayMenu(cloudData.todayMenu);
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } else {
      setItems(INITIAL_ITEMS);
    }
    setIsSyncingCloud(false);
  };

  // Cart quantity update handler
  const handleUpdateCart = (itemId, qty) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = qty;
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems({});
  };

  const handleAddItem = (newItem) => {
    const updated = [newItem, ...items];
    commitAndPushState(updated, todayMenu);
  };

  const handleRemoveItem = (id) => {
    const updated = items.filter((item) => item.id !== id);
    commitAndPushState(updated, todayMenu);
  };

  const handleToggleStock = (id) => {
    const updated = items.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item));
    commitAndPushState(updated, todayMenu);
  };

  const handleUpdatePrice = (id, newPrice) => {
    const updated = items.map((item) => (item.id === id ? { ...item, price: newPrice } : item));
    commitAndPushState(updated, todayMenu);
  };

  const handleUpdateTodayMenu = (newMenu) => {
    commitAndPushState(items, newMenu);
  };

  const handleOrderPlaced = (orderData) => {
    setOrdersList((prev) => [orderData, ...prev]);
    setCartItems({});
  };

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfileModal(false);
  };

  const handleToggleOwnerMode = () => {
    if (isOwnerAuthenticated) {
      const newMode = !isOwnerMode;
      setIsOwnerMode(newMode);
      if (newMode) setActiveTab('owner');
      else setActiveTab('menu');
    } else {
      setShowOwnerPinModal(true);
    }
  };

  const handleOwnerPinSuccess = () => {
    setIsOwnerAuthenticated(true);
    setShowOwnerPinModal(false);
    setIsOwnerMode(true);
    setActiveTab('owner');
  };

  const handleLockOwner = () => {
    setIsOwnerAuthenticated(false);
    setIsOwnerMode(false);
    setActiveTab('menu');
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitleMr = item.titleMr.toLowerCase().includes(q);
      const matchTitleEn = item.titleEn.toLowerCase().includes(q);
      const matchDesc = item.descriptionMr.toLowerCase().includes(q);
      if (!matchTitleMr && !matchTitleEn && !matchDesc) return false;
    }

    // Category filter
    if (selectedCat !== 'all') {
      if (selectedCat === 'bulk') {
        if (!item.isBestseller) return false;
      } else if (selectedCat === 'upvas') {
        if (item.category !== 'upvas' && !item.isUpvas) return false;
      } else if (item.category !== selectedCat) {
        return false;
      }
    }

    // Upvas tag filter
    if (vegFilter === 'upvas' && !item.isUpvas) return false;

    return true;
  });

  const cartTotalCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        lang={lang}
        setLang={setLang}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOwnerMode={isOwnerMode}
        setIsOwnerMode={handleToggleOwnerMode}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Owner Mode View */}
      {isOwnerMode || activeTab === 'owner' ? (
        <OwnerAdmin
          items={items}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onToggleStock={handleToggleStock}
          onUpdatePrice={handleUpdatePrice}
          ordersList={ordersList}
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          lang={lang}
          onLockOwner={handleLockOwner}
          todayMenu={todayMenu}
          onUpdateTodayMenu={handleUpdateTodayMenu}
          installCount={installCount}
          visitorCount={visitorCount}
        />
      ) : activeTab === 'catering' ? (
        /* Catering Budget & Quantity Calculator View */
        <CateringCalculator lang={lang} whatsappNumber={whatsappNumber} />
      ) : (
        /* Customer Menu Showcase View */
        <main>
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="welcome-badge">
                <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                {lang === 'en' ? 'Daily Tiffin & Home Catering' : 'रोजचा डबा व घरगुती कॅटरिंग'}
              </span>

              {/* REALTIME CLOUD LIVE SYNC BADGE */}
              <button
                onClick={handleForceRefreshMenu}
                style={{
                  background: isSyncingCloud ? '#2563eb' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                }}
                title="Cloud Realtime Sync Active"
              >
                <RefreshCw size={10} className={isSyncingCloud ? 'spin-icon' : ''} />
                <span>{isSyncingCloud ? (lang === 'en' ? 'Syncing...' : 'सिंक होत आहे...') : (lang === 'en' ? 'Live Cloud Synced' : '☁️ थेट सिंक')}</span>
              </button>
            </div>
            <h2 className="welcome-title">
              {lang === 'en' ? "Anuprita's Kitchen - Home Cooked Veg" : "अनुप्रिताज किचन - शुद्ध घरगुती जेवण"}
            </h2>
            <p className="welcome-subtitle">
              {lang === 'en' 
                ? 'Daily lunch & dinner tiffin plans, thali meals & bulk catering up to 100+ guests. Please book 1 day in advance.' 
                : 'रोजचा घरगुती डबा, पुरणपोळी थाळी व १००+ व्यक्तींचे कॅटरिंग. १ दिवस आधी ऑर्डर बुक करा.'}
            </p>
          </div>

          {/* Today's Special Breakfast, Lunch, & Dinner Showcase Card */}
          <TodaySpecialMenu todayMenu={todayMenu} lang={lang} />

          {/* Category Filter Pills & Tags */}
          <CategoryFilter
            selectedCat={selectedCat}
            setSelectedCat={setSelectedCat}
            vegFilter={vegFilter}
            setVegFilter={setVegFilter}
            lang={lang}
          />

          {/* Tiffin Service Section when Tiffin pill selected */}
          {selectedCat === 'tiffin' ? (
            <TiffinPlans lang={lang} whatsappNumber={whatsappNumber} />
          ) : (
            /* Menu Food Grid */
            <div className="food-grid">
              {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#78716c' }}>
                  <AlertCircle size={40} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p style={{ fontWeight: 700 }}>
                    {lang === 'en' ? 'No food items found matching criteria.' : 'कोणतेही पदार्थ सापडले नाहीत.'}
                  </p>
                  <button 
                    onClick={handleForceRefreshMenu}
                    style={{ marginTop: '10px', background: '#ea580c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={12} /> {lang === 'en' ? 'Refresh Menu' : 'मेनू रिफ्रेश करा'}
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    lang={lang}
                    cartQty={cartItems[item.id] || 0}
                    onUpdateCart={handleUpdateCart}
                    onOpenDetails={(selected) => setSelectedDetailItem(selected)}
                  />
                ))
              )}
            </div>
          )}
        </main>
      )}

      {/* App Developer Branding Footer */}
      <footer style={{ textAlign: 'center', padding: '16px 10px 10px 10px', color: '#78716c', fontSize: '0.72rem', fontWeight: 600 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f5f5f4', padding: '4px 12px', borderRadius: '14px', border: '1px solid #e7e5e4' }}>
          <Code size={12} color="#ea580c" />
          <span>{lang === 'en' ? 'App Developer: ' : 'ॲप डेव्हलपर: '}</span>
          <strong style={{ color: '#ea580c', fontWeight: 800 }}>Mahesh Hosing</strong>
        </div>
      </footer>

      {/* Cart Modal / Drawer */}
      {activeTab === 'cart' && (
        <CartDrawer
          cartItems={cartItems}
          foodItems={items}
          lang={lang}
          onClose={() => setActiveTab('menu')}
          onUpdateCart={handleUpdateCart}
          onClearCart={handleClearCart}
          whatsappNumber={whatsappNumber}
          onOrderPlaced={handleOrderPlaced}
          currentUser={currentUser}
        />
      )}

      {/* Dish Detail Modal */}
      {selectedDetailItem && (
        <DishDetailModal
          item={selectedDetailItem}
          lang={lang}
          onClose={() => setSelectedDetailItem(null)}
          cartQty={cartItems[selectedDetailItem.id] || 0}
          onUpdateCart={handleUpdateCart}
        />
      )}

      {/* Customer Login Modal */}
      {showAuthModal && (
        <CustomerAuthModal
          lang={lang}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Customer Profile & Past Orders History Modal */}
      {showProfileModal && (
        <CustomerOrdersModal
          currentUser={currentUser}
          ordersList={ordersList}
          lang={lang}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Owner Security PIN Modal */}
      {showOwnerPinModal && (
        <OwnerPinModal
          lang={lang}
          onClose={() => setShowOwnerPinModal(false)}
          onLoginSuccess={handleOwnerPinSuccess}
        />
      )}

      {/* Bottom Sticky Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'owner') {
            if (isOwnerAuthenticated) {
              setActiveTab('owner');
              setIsOwnerMode(true);
            } else {
              setShowOwnerPinModal(true);
            }
          } else {
            setActiveTab(tab);
            setIsOwnerMode(false);
          }
        }}
        cartCount={cartTotalCount}
        lang={lang}
        isOwnerMode={isOwnerMode}
      />
    </div>
  );
}
