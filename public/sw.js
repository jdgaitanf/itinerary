// Service Worker para Itinerario PWA
const CACHE_NAME = 'itinerario-v1.6';
const ASSETS_TO_CACHE = [
  '/itinerary/',
  '/itinerary/index.html',
  '/itinerary/data/viaje-raiz.json'
];

// Instalación: cachear assets iniciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando assets iniciales');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Error en instalación del SW:', error);
      })
  );
  self.skipWaiting();
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones: estrategia cache-first
self.addEventListener('fetch', event => {
  // Ignorar peticiones a Google Fonts y Material Symbols (siempre online)
  if (event.request.url.includes('googleapis.com') || 
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Si está en cache, devolverlo
          return cachedResponse;
        }

        // Si no está en cache, hacer fetch y cachear
        return fetch(event.request)
          .then(networkResponse => {
            // Solo cachear respuestas exitosas de tipo basic
            if (!networkResponse || networkResponse.status !== 200 || 
                networkResponse.type !== 'basic' || 
                !event.request.url.startsWith(self.location.origin)) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Error cacheando respuesta:', error);
              });

            return networkResponse;
          })
          .catch(error => {
            console.error('Error en fetch:', error);
            // Para archivos JSON, devolver un mensaje de error
            if (event.request.url.endsWith('.json')) {
              return new Response(JSON.stringify({
                error: 'No disponible offline',
                message: 'Este recurso requiere conexión a internet para cargarse inicialmente'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            // Para otros recursos, devolver error
            return new Response('Recurso no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});