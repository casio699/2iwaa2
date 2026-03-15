const CACHE_NAME = 'al-menassa-v1';
const STATIC_ASSETS = [
  '/',
  '/shelters',
  '/housing',
  '/hotlines',
  '/alerts',
  '/news',
  '/threats',
  '/help',
  '/hospitals',
  '/financial',
  '/reports',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Check if response exists and is valid
        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }

        // Clone response to cache it (only cache successful responses)
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache).catch(() => {
            // Ignore cache errors
          });
        });

        return networkResponse;
      }).catch((error) => {
        console.log('Network request failed:', error);
        // Return offline fallback for HTML requests
        if (event.request.mode === 'navigate') {
          return caches.match('/').then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return a basic offline page if no cached version
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/html'
              })
            });
          });
        }
        // For other requests, just fail
        throw error;
      });
    }).catch((error) => {
      console.log('Service worker error:', error);
      throw error;
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'تنبيه جديد من Al-Menassa',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'default',
      requireInteraction: data.urgent || false,
      data: data,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Al-Menassa', options)
    );
  } catch (error) {
    console.log('Push notification error:', error);
    // Show a basic notification even if data parsing fails
    event.waitUntil(
      self.registration.showNotification('Al-Menassa', {
        body: 'تنبيه جديد',
        tag: 'fallback'
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = '/';
  
  if (notificationData.type === 'threat') {
    url = '/threats';
  } else if (notificationData.type === 'shelter') {
    url = '/shelters';
  } else if (notificationData.type === 'alert') {
    url = '/alerts';
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'submit-report') {
    event.waitUntil(submitPendingReports());
  }
});

async function submitPendingReports() {
  // Get pending reports from IndexedDB and submit them
  // This is a placeholder - actual implementation would use IndexedDB
  console.log('Submitting pending reports...');
}
