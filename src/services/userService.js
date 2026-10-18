import { supabase } from './supabase.js';

const CUSTOMERS_CACHE_KEY = 'anuprita_kitchen_customers_cache';
const DEVICE_SYNCED_KEY = 'anuprita_kitchen_device_first_open_synced';
const DEVICE_ID_KEY = 'anuprita_kitchen_device_uuid';

/**
 * Normalizes a phone number to 10 clean digits.
 * Strips out +91, 0 prefix, spaces, dashes, parentheses.
 *
 * @param {string|number} mobile
 * @returns {string} 10-digit phone string, or empty string if invalid
 */
export function normalizeMobile(mobile) {
  if (!mobile) return '';
  const cleaned = String(mobile).replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
}

/**
 * Normalizes and returns a stable unique user ID.
 * - For customers: 'cust_' + 10-digit mobile number
 * - For owners/admins: Supabase Auth user ID (UUID)
 * 
 * @param {Object} user
 * @returns {string | null}
 */
export function getStableUserId(user) {
  if (!user) return null;
  if (user.role === 'owner' && user.id) {
    return String(user.id);
  }
  if (user.mobile) {
    const cleanPhone = normalizeMobile(user.mobile);
    if (cleanPhone && cleanPhone.length === 10) return `cust_${cleanPhone}`;
  }
  if (user.id && !user.id.startsWith('CUST-')) {
    return String(user.id);
  }
  return user.id ? String(user.id) : null;
}

/**
 * Tracks the first time this app/device is opened.
 * Runs on app startup, independently from customer login.
 * Uses persistent localStorage to avoid reporting repeated launches from the same device.
 */
export async function trackDeviceFirstOpen() {
  if (typeof window === 'undefined') return;

  if (localStorage.getItem(DEVICE_SYNCED_KEY) === 'true') {
    return;
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + (typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 12) + Date.now().toString(36));
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  // Detect platform (Android vs Web)
  let platform = 'web';
  if (navigator.userAgent.includes('Android') || window.Capacitor?.isNativePlatform?.()) {
    platform = 'android';
  } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    platform = 'ios';
  }

  try {
    // 1. Try secure RPC function
    const { error: rpcError } = await supabase.rpc('record_device_first_open', {
      device_id: deviceId,
      device_platform: platform
    });

    if (!rpcError) {
      localStorage.setItem(DEVICE_SYNCED_KEY, 'true');
      return;
    }

    // 2. Direct insert fallback
    const { error: insertError } = await supabase
      .from('app_devices')
      .insert({ id: deviceId, platform });

    if (!insertError || insertError.code === '23505') {
      localStorage.setItem(DEVICE_SYNCED_KEY, 'true');
    }
  } catch (err) {
    console.warn('[userService] Failed to record device first-open:', err);
  }
}

/**
 * Helper to get local cache of known customer profiles.
 */
function getLocalCustomerCache() {
  try {
    const raw = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[userService] Failed to read local customer cache:', err);
    return {};
  }
}

/**
 * Helper to update local cache of known customer profiles.
 */
function setLocalCustomerCache(cache) {
  try {
    localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('[userService] Failed to save local customer cache:', err);
  }
}

/**
 * Searches for an existing customer profile by normalized 10-digit mobile number.
 * Searches Supabase app_users first, then falls back to local cache or previous session.
 * 
 * @param {string} mobileNumber
 * @returns {Promise<{ profile: Object | null, error: string | null }>}
 */
export async function findCustomerProfile(mobileNumber) {
  const cleanPhone = normalizeMobile(mobileNumber);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { profile: null, error: 'Please enter a valid 10-digit mobile number' };
  }

  const stableId = `cust_${cleanPhone}`;

  // 1. Try secure RPC function
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_customer_profile', {
      customer_phone: cleanPhone
    });

    if (!rpcError && rpcData) {
      const profile = {
        id: rpcData.id,
        name: rpcData.name || '',
        mobile: rpcData.mobile || cleanPhone,
        address: rpcData.address || '',
        role: rpcData.role || 'customer',
        last_login_at: rpcData.last_login_at || new Date().toISOString(),
        joinedDate: rpcData.created_at ? new Date(rpcData.created_at).toLocaleDateString() : new Date().toLocaleDateString()
      };

      const cache = getLocalCustomerCache();
      cache[cleanPhone] = profile;
      setLocalCustomerCache(cache);

      return { profile, error: null };
    }
  } catch {
    // Fall back to direct query
  }

  // 2. Direct table fallback query
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', stableId)
      .eq('role', 'customer')
      .maybeSingle();

    if (!error && data) {
      const profile = {
        id: data.id,
        name: data.name || '',
        mobile: data.mobile || cleanPhone,
        address: data.address || '',
        role: data.role || 'customer',
        last_login_at: data.last_login_at || new Date().toISOString(),
        joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString()
      };

      const cache = getLocalCustomerCache();
      cache[cleanPhone] = profile;
      setLocalCustomerCache(cache);

      return { profile, error: null };
    }
  } catch {
    // Ignore and fallback to local cache
  }

  // 3. Check local customer cache
  const cache = getLocalCustomerCache();
  if (cache[cleanPhone]) {
    return { profile: cache[cleanPhone], error: null };
  }

  // 4. Check active user in localStorage if mobile matches
  try {
    const saved = JSON.parse(localStorage.getItem('anuprita_kitchen_user') || 'null');
    if (saved && normalizeMobile(saved.mobile) === cleanPhone) {
      return { profile: saved, error: null };
    }
  } catch {
    // Ignore
  }

  return { profile: null, error: null };
}

/**
 * Creates or updates a customer profile.
 * Avoids duplicate records for the same normalized mobile number.
 * 
 * @param {Object} param0 - { name, mobile, address }
 * @returns {Promise<{ profile: Object | null, error: string | null }>}
 */
export async function saveCustomerProfile({ name, mobile, address = '' }) {
  const cleanPhone = normalizeMobile(mobile);
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    return { profile: null, error: 'Full name is required' };
  }
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { profile: null, error: 'A valid 10-digit mobile number is required' };
  }

  const stableId = `cust_${cleanPhone}`;

  let existingAddress = '';
  const cache = getLocalCustomerCache();
  if (cache[cleanPhone]?.address) {
    existingAddress = cache[cleanPhone].address;
  }

  const profile = {
    id: stableId,
    name: trimmedName,
    mobile: cleanPhone,
    phone: `+91${cleanPhone}`,
    address: address.trim() || existingAddress,
    role: 'customer',
    joinedDate: cache[cleanPhone]?.joinedDate || new Date().toLocaleDateString(),
    last_login_at: new Date().toISOString()
  };

  // 1. Save in local cache immediately
  cache[cleanPhone] = profile;
  setLocalCustomerCache(cache);

  // 2. Persist to Supabase
  await recordUserLogin(profile);

  return { profile, error: null };
}

/**
 * Records a successful user login in the Supabase database.
 * Uses secure RPC if available, or direct upsert with onConflict: 'id'.
 * 
 * @param {Object} user - User object containing stable ID or mobile number
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export async function recordUserLogin(user) {
  const stableId = getStableUserId(user);
  if (!stableId) {
    console.warn('[UserTracking] Missing stable user ID, skipping record');
    return { success: false, error: 'Missing stable user ID' };
  }

  const isOwner = user.role === 'owner';
  const cleanPhone = user.mobile ? normalizeMobile(user.mobile) : null;

  // 1. For customers: use secure RPC function (hardcoded role: customer)
  if (!isOwner && cleanPhone) {
    try {
      const { error: rpcError } = await supabase.rpc('record_customer_login', {
        customer_phone: cleanPhone,
        customer_name: user.name || null,
        customer_address: user.address || null
      });

      if (!rpcError) {
        return { success: true, error: null };
      }
    } catch {
      // Fall through to direct upsert
    }
  }

  // 2. Direct table upsert fallback
  const fullPayload = {
    id: stableId,
    role: user.role || 'customer',
    name: user.name || null,
    mobile: cleanPhone,
    address: user.address || null,
    last_login_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('app_users')
      .upsert(fullPayload, { onConflict: 'id' });

    if (error) {
      if (error.code === '42703' || error.message?.includes('column')) {
        const basicPayload = {
          id: stableId,
          role: user.role || 'customer',
          last_login_at: new Date().toISOString()
        };
        const { error: fallbackError } = await supabase
          .from('app_users')
          .upsert(basicPayload, { onConflict: 'id' });
        if (fallbackError) {
          console.warn('[UserTracking] Fallback upsert failed:', fallbackError.message);
          return { success: false, error: fallbackError.message };
        }
        return { success: true, error: null };
      }

      console.warn('[UserTracking] Supabase upsert failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.warn('[UserTracking] Network or unexpected error:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Fetches the three live persistent metrics for the Owner Admin Dashboard:
 * 1. App First-Open Devices
 * 2. Total Registered Customers
 * 3. Unique Customers Logged In
 * 
 * Never returns fake zeros or fabricated success on database failures.
 * 
 * @returns {Promise<{
 *   firstOpenDevices: number | null,
 *   totalRegisteredCustomers: number | null,
 *   uniqueCustomersLoggedIn: number | null,
 *   error: string | null
 * }>}
 */
export async function fetchDashboardMetrics() {
  try {
    // 1. Try secure RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_dashboard_metrics');
    if (!rpcError && rpcData && typeof rpcData === 'object') {
      return {
        firstOpenDevices: typeof rpcData.first_open_devices === 'number' ? rpcData.first_open_devices : 0,
        totalRegisteredCustomers: typeof rpcData.total_registered_customers === 'number' ? rpcData.total_registered_customers : 0,
        uniqueCustomersLoggedIn: typeof rpcData.unique_customers_logged_in === 'number' ? rpcData.unique_customers_logged_in : 0,
        error: null
      };
    }

    // 2. Direct fallback queries with PostgREST
    const devicePromise = supabase
      .from('app_devices')
      .select('id', { count: 'exact', head: true });

    const registeredPromise = supabase
      .from('app_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .not('name', 'is', null);

    const loggedInPromise = supabase
      .from('app_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .not('last_login_at', 'is', null);

    const [deviceRes, registeredRes, loggedInRes] = await Promise.all([
      devicePromise,
      registeredPromise,
      loggedInPromise
    ]);

    if (deviceRes.error || registeredRes.error || loggedInRes.error) {
      const err = deviceRes.error || registeredRes.error || loggedInRes.error;
      const isMissingTable = err.code === 'PGRST205' || err.message?.includes('schema cache');
      return {
        firstOpenDevices: null,
        totalRegisteredCustomers: null,
        uniqueCustomersLoggedIn: null,
        error: isMissingTable 
          ? 'Database tables not found in Supabase. Please apply the migration script.'
          : (err.message || 'Error connecting to database')
      };
    }

    return {
      firstOpenDevices: deviceRes.count ?? 0,
      totalRegisteredCustomers: registeredRes.count ?? 0,
      uniqueCustomersLoggedIn: loggedInRes.count ?? 0,
      error: null
    };
  } catch (err) {
    console.error('[userService] fetchDashboardMetrics exception:', err);
    return {
      firstOpenDevices: null,
      totalRegisteredCustomers: null,
      uniqueCustomersLoggedIn: null,
      error: err.message || 'Failed to load dashboard statistics'
    };
  }
}

/**
 * Backward compatibility wrapper for registered user count.
 */
export async function fetchRegisteredUserCount() {
  const metrics = await fetchDashboardMetrics();
  return {
    count: metrics.totalRegisteredCustomers,
    error: metrics.error,
    needsMigration: Boolean(metrics.error && metrics.error.includes('migration'))
  };
}

// -------------------------------------------------------------
// SAVED DELIVERY ADDRESSES MANAGEMENT
// -------------------------------------------------------------

const ADDRESSES_STORAGE_PREFIX = 'anuprita_kitchen_saved_addresses_';

/**
 * Normalizes a storage key for saved delivery addresses.
 *
 * @param {string} mobile
 * @returns {string}
 */
function getAddressStorageKey(mobile) {
  const cleanPhone = mobile ? normalizeMobile(mobile) : '';
  return `${ADDRESSES_STORAGE_PREFIX}${cleanPhone || 'guest'}`;
}

/**
 * Retrieves saved delivery addresses for a given customer mobile number.
 * If no saved addresses exist yet but the customer profile has an existing address,
 * initializes an initial Home Address entry.
 *
 * @param {string} mobile
 * @param {string} fallbackAddress
 * @returns {Array<Object>}
 */
export function getSavedAddresses(mobile, fallbackAddress = '') {
  const key = getAddressStorageKey(mobile);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[userService] Failed to load saved addresses:', e);
  }

  // Fallback: if user already has an address in profile, seed a default home address
  if (fallbackAddress && fallbackAddress.trim()) {
    const initialHome = {
      id: 'addr_home_default',
      label: 'Home (घर)',
      isHome: true,
      flatNo: '',
      building: '',
      area: fallbackAddress.trim(),
      city: 'नाशिक (Nashik)',
      state: 'महाराष्ट्र (Maharashtra)',
      pincode: '',
      fullAddress: fallbackAddress.trim(),
      recipientName: '',
      recipientPhone: '',
      gpsLocation: '',
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(key, JSON.stringify([initialHome]));
    } catch {
      // Ignore
    }
    return [initialHome];
  }

  return [];
}

/**
 * Saves or updates a delivery address for a customer.
 * When isHome is true, sets this address as the default home address and clears isHome on other entries.
 *
 * @param {string} mobile
 * @param {Object} addressData
 * @param {boolean} isHome
 * @returns {{ address: Object, allAddresses: Array<Object> }}
 */
export function saveCustomerAddress(mobile, addressData, isHome = false) {
  const key = getAddressStorageKey(mobile);
  const existing = getSavedAddresses(mobile);

  const addressItem = {
    id: addressData.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    label: addressData.label || (isHome ? 'Home (घर)' : 'Delivery Address'),
    isHome: Boolean(isHome),
    flatNo: (addressData.flatNo || '').trim(),
    building: (addressData.building || '').trim(),
    area: (addressData.area || '').trim(),
    city: (addressData.city || 'नाशिक (Nashik)').trim(),
    state: (addressData.state || 'महाराष्ट्र (Maharashtra)').trim(),
    pincode: (addressData.pincode || '').trim(),
    fullAddress: (addressData.fullAddress || '').trim(),
    recipientName: (addressData.recipientName || '').trim(),
    recipientPhone: (addressData.recipientPhone || '').trim(),
    gpsLocation: (addressData.gpsLocation || '').trim(),
    updatedAt: new Date().toISOString()
  };

  let updatedList = existing;
  if (isHome) {
    updatedList = updatedList.map((a) => ({ ...a, isHome: false }));
  }

  const existingIdx = updatedList.findIndex((a) => a.id === addressItem.id);
  if (existingIdx >= 0) {
    updatedList[existingIdx] = addressItem;
  } else {
    updatedList = [addressItem, ...updatedList];
  }

  try {
    localStorage.setItem(key, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('[userService] Failed to persist saved addresses:', e);
  }

  return { address: addressItem, allAddresses: updatedList };
}

/**
 * Removes a saved delivery address by ID.
 *
 * @param {string} mobile
 * @param {string} addressId
 * @returns {Array<Object>}
 */
export function deleteCustomerAddress(mobile, addressId) {
  const key = getAddressStorageKey(mobile);
  const existing = getSavedAddresses(mobile);
  const updatedList = existing.filter((a) => a.id !== addressId);
  try {
    localStorage.setItem(key, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('[userService] Failed to delete saved address:', e);
  }
  return updatedList;
}

