// Service Worker for My Bounce Place PWA
const CACHE_NAME = 'my-bounce-place-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/blog.html',
    '/reviews.html',
    '/privacy-policy.html',
    '/terms-of-service.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/booking.js',
    '/js/reviews.js',
    '/js/data.js',
    '/js/navigation.js',
    '/js/bouncehouses.js',
    '/js/waiver.js',
    '/js/contact.js',
    '/images/princess-castle-1.jpg',
    '/images/jungle-adventure-1.jpg',
    '/images/pirate-ship-1.jpg',
    '/images/space-adventure-1.jpg',
    '/images/sports-arena-1.jpg',
    '/images/superhero-arena-1.jpg',
    '/favicon.ico',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/site.webmanifest'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Handle background sync for offline form submissions
    return new Promise((resolve) => {
        // Check for pending form submissions in IndexedDB
        // and sync them when connection is restored
        resolve();
    });
}

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New bounce house available!',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Bounce Houses',
                icon: '/android-chrome-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/android-chrome-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('My Bounce Place', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/index.html#bounce-houses')
        );
    }
});