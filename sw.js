// Bena Flash Global PLT - PWA Service Worker
const CACHE_NAME = "bena-flash-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/src/main.tsx"
];

// Install Event - Pre-cache essential static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Pre-caching offline assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("[Service Worker] Clearing old cache:", cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Serve assets from cache, update in background (Stale-While-Revalidate)
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests and avoid caching third-party APIs / Firebase or our backend /api/ routes
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.url.includes("firestore.googleapis.com") ||
    request.url.includes("identitytoolkit.googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in the background to update the cache for next time
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Silently fail if offline
          });
        return cachedResponse;
      }

      // If not cached, fetch from network and cache it
      return fetch(request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// Push Notification Listener (Existing Feature)
self.addEventListener("push", function (event) {
  let data = {
    title: "Bena Flash Global",
    body: "Kemaskini portal dikesan."
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: "Bena Flash Global",
        body: event.data.text()
      };
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "1"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler (Existing Feature)
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
