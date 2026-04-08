const CACHE_NAME = 'errand-magics-delivery-v1.0';
const STATIC_CACHE = 'static-cache-v2.0';
const DYNAMIC_CACHE = 'dynamic-cache-v2.0';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap'
];

const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Advanced fetch handler with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http/https schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Bypass for localhost to avoid issues during development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // Handle different resource types with appropriate strategies
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});

// Cache-first strategy (good for static assets)
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Update cache in background
      updateCache(request, cache);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache-first failed:', error);
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Network-first strategy (good for API calls)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({
      error: 'Offline - No cached data available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background cache update
async function updateCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse);
    }
  } catch (error) {
    console.log('Background update failed:', error);
  }
}

// Enhanced push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New delivery order available',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      image: data.image,
      data: data.data || {},
      tag: data.tag || 'delivery-notification',
      requireInteraction: data.urgent || false,
      vibrate: data.urgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
      actions: [
        {
          action: 'accept',
          title: '✅ Accept Order',
          icon: '/icon-accept.png'
        },
        {
          action: 'view',
          title: '👁️ View Details',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: '❌ Dismiss',
          icon: '/icon-dismiss.png'
        }
      ],
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Errand Magics Delivery', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();

  const { action, notification } = event;
  const data = notification.data || {};

  let urlToOpen = '/';

  switch (action) {
    case 'accept':
      urlToOpen = `/?action=accept&orderId=${data.orderId || ''}`;
      break;
    case 'view':
      urlToOpen = `/?action=view&orderId=${data.orderId || ''}`;
      break;
    case 'dismiss':
      return; // Just close, don't open app
    default:
      urlToOpen = '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  switch (event.tag) {
    case 'order-status-sync':
      event.waitUntil(syncOrderStatuses());
      break;
    case 'location-sync':
      event.waitUntil(syncLocationUpdates());
      break;
    case 'earnings-sync':
      event.waitUntil(syncEarningsData());
      break;
    default:
      event.waitUntil(doBackgroundSync());
  }
});

// Sync functions for different data types
async function syncOrderStatuses() {
  try {
    console.log('Syncing order statuses...');
    const pendingUpdates = await getStoredData('pendingOrderUpdates') || [];

    for (const update of pendingUpdates) {
      try {
        await fetch('/api/orders/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        });
      } catch (error) {
        console.log('Failed to sync order update:', error);
      }
    }

    await clearStoredData('pendingOrderUpdates');
  } catch (error) {
    console.error('Order status sync failed:', error);
  }
}

async function syncLocationUpdates() {
  try {
    console.log('Syncing location updates...');
    const pendingLocations = await getStoredData('pendingLocationUpdates') || [];

    for (const location of pendingLocations) {
      try {
        await fetch('/api/location/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(location)
        });
      } catch (error) {
        console.log('Failed to sync location:', error);
      }
    }

    await clearStoredData('pendingLocationUpdates');
  } catch (error) {
    console.error('Location sync failed:', error);
  }
}

async function syncEarningsData() {
  try {
    console.log('Syncing earnings data...');
    // Fetch latest earnings data when connection is restored
    const response = await fetch('/api/earnings/sync');
    if (response.ok) {
      const data = await response.json();
      await storeData('latestEarnings', data);
    }
  } catch (error) {
    console.error('Earnings sync failed:', error);
  }
}

async function doBackgroundSync() {
  console.log('General background sync');
  await Promise.all([
    syncOrderStatuses(),
    syncLocationUpdates(),
    syncEarningsData()
  ]);
}

// IndexedDB helpers for offline data storage
async function storeData(key, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ErrandMagicsDeliveryDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      store.put({ key, data, timestamp: Date.now() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ErrandMagicsDeliveryDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ErrandMagicsDeliveryDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

// Handle app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'earnings-update') {
    event.waitUntil(syncEarningsData());
  }
});

console.log('Service Worker: Advanced PWA Service Worker loaded successfully!');
