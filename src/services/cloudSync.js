// 100% Free Realtime Cloud Database Relay Service for Anuprita's Kitchen
export const CLOUD_BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019f950f-0ccd-7c5d-bc4e-05c29e33d8aa';

// Upload Owner Menu & Today's Special State to Cloud Blob
export async function pushStateToCloud(items, todayMenu) {
  try {
    const payload = {
      updatedAt: new Date().toISOString(),
      updatedTimestamp: Date.now(),
      items: items,
      todayMenu: todayMenu
    };

    const res = await fetch(CLOUD_BLOB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('☁️ [CloudSync] Menu & Prices successfully synced to Cloud for all devices!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ [CloudSync Error] Failed to push menu to cloud:', error);
    return false;
  }
}

// Fetch Latest Owner Menu & Today's Special State from Cloud Blob
export async function fetchStateFromCloud() {
  try {
    const res = await fetch(CLOUD_BLOB_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.items && Array.isArray(data.items)) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ [CloudSync Error] Failed to fetch menu from cloud:', error);
    return null;
  }
}
