// 🛠️ BACKDOOR: SERVICE WORKER CONFIGURATION (SW_CONFIG)
const SW_CONFIG = {
  // Nombre de la caché del App Shell.
  CACHE_NAME: 'bitacora-mango-primavera-shell-v1',
  // Recursos estáticos que forman el "App Shell".
  SHELL_ASSETS: [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
  ],
  // Patrones que deben usar la estrategia Network-First.
  NETWORK_FIRST_PATTERNS: [
    /\.googleapis\.com/,          // Google APIs
    /script\.googleusercontent\.com/, // Apps Script endpoints (GET/POST)
    /script\.google\.com/,        // Apps Script base URL
    /\?action=/                    // Parámetro de acción en GAS
  ]
};

/**
 * Instala el Service Worker y cachea los recursos del App Shell.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SW_CONFIG.CACHE_NAME).then(cache => {
      return cache.addAll(SW_CONFIG.SHELL_ASSETS);
    })
  );
});

/**
 * Activa el Service Worker y elimina caches obsoletas.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== SW_CONFIG.CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  // Tomar control inmediato de los clientes existentes.
  self.clients.claim();
});

/**
 * Estrategia de respuesta para peticiones fetch.
 * - Recursos estáticos del shell: Cache-First.
 * - Peticiones que coinciden con NETWORK_FIRST_PATTERNS: Network-First.
 * - Otros GET: Network-First con fallback al cache.
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar POST/PUT/DELETE (e.g., enviar datos a GAS).
  if (request.method !== 'GET') {
    return;
  }

  // Determinar si la URL coincide con algún patrón Network-First.
  const isNetworkFirst = SW_CONFIG.NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href));

  // Verificar si la URL corresponde a un asset del shell.
  const isShellAsset = SW_CONFIG.SHELL_ASSETS.some(asset => {
    try {
      const assetPath = new URL(asset, self.location.origin).pathname;
      return assetPath === url.pathname;
    } catch (e) {
      return false;
    }
  });

  if (isNetworkFirst) {
    event.respondWith(networkFirst(request));
  } else if (isShellAsset) {
    event.respondWith(cacheFirst(request));
  } else {
    // Por defecto: intentar la red y fallback al cache.
    event.respondWith(networkFirst(request));
  }
});

/**
 * Estrategia Cache-First.
 */
async function cacheFirst(request) {
  const cache = await caches.open(SW_CONFIG.CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

/**
 * Estrategia Network-First.
 */
async function networkFirst(request) {
  const cache = await caches.open(SW_CONFIG.CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Recurso no disponible y sin conexión', {
      status: 504,
      statusText: 'Gateway Timeout'
    });
  }
}

/**
 * Escucha mensajes para controlar la cache manualmente.
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
