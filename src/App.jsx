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
import AppInstallBanner from './components/AppInstallBanner';
import { INITIAL_ITEMS } from './data/foodData';
import { pushStateToCloud, fetchStateFromCloud } from './services/cloudSync';
import { Sparkles, Leaf, AlertCircle, Calendar, Code, RefreshCw, Zap, CloudCheck } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en'); // Default language set to English
  const [items, setItems] = useState(() => {
    // Force reset cache version key to v35 for Bhagar Shengdana Amti menu addition
    const versionKey = 'anuprita_kitchen_v35_bhagar_amti';
    const hasSynced = localStorage.getItem(versionKey);
    
    if (!hasSynced) {
      localStorage.setItem(versionKey, 'true');
      localStorage.setItem('anuprita_kitchen_items_v35', JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }

    const saved = localStorage.getItem('anuprita_kitchen_items_v35');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [todayMenu, setTodayMenu] = useState(() => {
    const todayKey = 'anuprita_today_menu_v34_ekadashi_upvas';
    const newMenu = {
      breakfast: 'साबूदाणा खिचडी (Sabudana Khichdi)',
      lunch: 'एकादशी उपवास स्पेशल थाळी - उपवास टिक्की, साबूदाणा खिचडी, काकडी कोशिंबीर व रताळे कीस',
      dinner: 'एकादशी उपवास स्पेशल थाळी - उपवास टिक्की, साबूदाणा खिचडी, काकडी कोशिंबीर व रताळे कीस'
    };

    if (!localStorage.getItem(todayKey)) {
      localStorage.setItem(todayKey, 'true');
      localStorage.setItem('anuprita_kitchen_today_menu', JSON.stringify(newMenu));
      pushStateToCloud(INITIAL_ITEMS, newMenu);
      return newMenu;
    }
    const saved = localStorage.getItem('anuprita_kitchen_today_menu');
    return saved ? JSON.parse(saved) : newMenu;
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_cart_v26');
    return saved ? JSON.parse(saved) : {};
  });

  const [ordersList, setOrdersList] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_orders_v26');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_user');
    return saved ? JSON.parse(saved) : null;
  });

  // App Install, Visitor & OTP Signup Live Tracking State (Reset old dummy counts)
  const [installCount, setInstallCount] = useState(() => {
    const resetKey = 'anuprita_reset_dummy_stats_v3';
    if (!localStorage.getItem(resetKey)) {
      localStorage.setItem(resetKey, 'true');
      localStorage.setItem('anuprita_kitchen_install_count', '0');
      localStorage.setItem('anuprita_kitchen_visitor_count', '1');
      localStorage.setItem('anuprita_kitchen_signup_count', '0');
      return 0;
    }
    const saved = localStorage.getItem('anuprita_kitchen_install_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [visitorCount, setVisitorCount] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_visitor_count');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [signupCount, setSignupCount] = useState(() => {
    const saved = localStorage.getItem('anuprita_kitchen_signup_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastCloudSyncTime, setLastCloudSyncTime] = useState(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  // Default Owner WhatsApp Mobile Number set to 7507969291
  const [whatsappNumber, setWhatsappNumber] = useState('7507969291');
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

  // AUTOMATIC CLOUD SYNC: Auto-pull latest menu & prices from Cloud database every 5 minutes (300,000 ms) + on app focus!
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
        // Seed cloud database with latest menu including stepper add-ons!
        pushStateToCloud(INITIAL_ITEMS, todayMenu);
      }
      setIsSyncingCloud(false);
    };

    // Initial fetch & push latest menu to Cloud
    pushStateToCloud(INITIAL_ITEMS, todayMenu);
    syncFromCloud();

    // Auto-sync every 2 minutes (2 * 60 * 1000 = 120000 ms)
    const TWO_MINUTES = 2 * 60 * 1000;
    const intervalId = setInterval(syncFromCloud, TWO_MINUTES);

    // Instant auto-sync whenever customer re-opens or focuses the app tab
    const handleFocus = () => {
      syncFromCloud();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // PWA Install Prompt State & Handlers
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleModeChange = (e) => {
      if (e.matches) setIsStandalone(true);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          localStorage.setItem('anuprita_installed_device', 'true');
          setInstallCount((prev) => {
            const updated = prev + 1;
            localStorage.setItem('anuprita_kitchen_install_count', updated.toString());
            return updated;
          });
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install error:', err);
      }
    } else {
      // Trigger Direct APK Download for browsers without PWA install prompt
      const link = document.createElement('a');
      link.href = '/anupritas_kitchen.apk';
      link.download = 'Anupritas_Kitchen_Pure_Veg.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      localStorage.setItem('anuprita_installed_device', 'true');
      setInstallCount((prev) => {
        const updated = prev + 1;
        localStorage.setItem('anuprita_kitchen_install_count', updated.toString());
        return updated;
      });
    }
  };

  // Track app installation and unique mobile visits
  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasTrackedVisit = sessionStorage.getItem('anuprita_visited_session');

    if (!hasTrackedVisit) {
      sessionStorage.setItem('anuprita_visited_session', 'true');
      setVisitorCount((prev) => {
        const updated = prev + 1;
        localStorage.setItem('anuprita_kitchen_visitor_count', updated.toString());
        return updated;
      });
    }

    if (isStandaloneMode) {
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

    localStorage.setItem('anuprita_kitchen_items_v35', JSON.stringify(itemsToSave));
    localStorage.setItem('anuprita_kitchen_today_menu', JSON.stringify(todayMenuToSave));

    // Upload to Cloud Database so all customer devices receive the update immediately!
    pushStateToCloud(itemsToSave, todayMenuToSave).then(() => {
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    });
  };

  useEffect(() => {
    localStorage.setItem('anuprita_kitchen_items_v35', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('anuprita_kitchen_cart_v26', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('anuprita_kitchen_orders_v26', JSON.stringify(ordersList));
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

  // Cart quantity update handler supporting custom add-ons
  const handleUpdateCart = (itemId, qty, addons = null) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[itemId];
      } else {
        if (addons !== null) {
          updated[itemId] = { qty, addons };
        } else {
          const currentVal = updated[itemId];
          if (typeof currentVal === 'object') {
            updated[itemId] = { ...currentVal, qty };
          } else {
            updated[itemId] = qty;
          }
        }
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
    setSignupCount((prev) => {
      const updated = prev + 1;
      localStorage.setItem('anuprita_kitchen_signup_count', updated.toString());
      return updated;
    });
  };

  const handleResetStats = () => {
    setInstallCount(0);
    setVisitorCount(1);
    setSignupCount(0);
    localStorage.setItem('anuprita_kitchen_install_count', '0');
    localStorage.setItem('anuprita_kitchen_visitor_count', '1');
    localStorage.setItem('anuprita_kitchen_signup_count', '0');
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

    // Upvas items should appear ONLY in the Fasting Only category (or when upvas filter tag is selected)
    const isUpvasItem = item.category === 'upvas' || item.isUpvas === true;
    if (isUpvasItem && selectedCat !== 'upvas' && vegFilter !== 'upvas' && !searchQuery) {
      return false;
    }

    // Category filter
    if (selectedCat !== 'all') {
      if (selectedCat === 'bulk') {
        if (!item.isBestseller) return false;
      } else if (selectedCat === 'upvas') {
        if (!isUpvasItem) return false;
      } else if (item.category !== selectedCat) {
        return false;
      }
    }

    // Upvas tag filter
    if (vegFilter === 'upvas' && !item.isUpvas) return false;

    return true;
  });

  const cartTotalCount = Object.values(cartItems).reduce((a, b) => a + (typeof b === 'object' ? b.qty : b), 0);

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
        deferredPrompt={deferredPrompt}
        isStandalone={isStandalone}
        onTriggerInstall={handleTriggerInstall}
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
          signupCount={signupCount}
          onResetStats={handleResetStats}
        />
      ) : activeTab === 'catering' ? (
        /* Catering Budget & Quantity Calculator View */
        <CateringCalculator lang={lang} whatsappNumber={whatsappNumber} />
      ) : (
        /* Customer Menu Showcase View */
        <main style={{ paddingBottom: '12px' }}>
          {/* Android App Installation Banner (Compact) */}
          <AppInstallBanner
            lang={lang}
            deferredPrompt={deferredPrompt}
            isStandalone={isStandalone}
            onTriggerInstall={handleTriggerInstall}
            installCount={installCount}
          />

          {/* Today's Special Menu Showcase Card */}
          <TodaySpecialMenu todayMenu={todayMenu} lang={lang} />

          {/* Category Filter Pills */}
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
                filteredItems.map((item) => {
                  const cartVal = cartItems[item.id];
                  const cartQty = typeof cartVal === 'object' ? cartVal.qty : (cartVal || 0);
                  return (
                    <FoodCard
                      key={item.id}
                      item={item}
                      lang={lang}
                      cartQty={cartQty}
                      onUpdateCart={handleUpdateCart}
                      onOpenDetails={(selected) => setSelectedDetailItem(selected)}
                    />
                  );
                })
              )}
            </div>
          )}
        </main>
      )}

      {/* Clean & Subtle Footer */}
      <footer style={{ textAlign: 'center', padding: '12px 10px 16px 10px', color: '#a8a29e', fontSize: '0.7rem', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <span>{lang === 'en' ? 'Owner: Reva M. Hosing' : 'मालक: रेवा म. होसिंग'}</span>
        <span>•</span>
        <span>{lang === 'en' ? 'Dev: Mahesh U. Hosing' : 'डेव्हलपर: महेश उ. होसिंग'}</span>
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
          cartQty={typeof cartItems[selectedDetailItem.id] === 'object' ? cartItems[selectedDetailItem.id].qty : (cartItems[selectedDetailItem.id] || 0)}
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
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
