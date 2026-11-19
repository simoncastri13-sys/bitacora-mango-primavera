/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA · SERVICE WORKER (OFFLINE-FIRST)
 * ============================================================================
 * ARCHIVO: sw.js
 * ESTRATEGIA:
 *   1. Cache-First para el App Shell estático (./, index.html, styles.css, app.js, manifest.json).
 *   2. Network-Only (no cachear) para streams de video de Drive y endpoints de OneSignal.
 *   3. Network-First con fallback a caché para la API de Google Apps Script y miniaturas de Drive.
 *   4. Purga automática de cachés obsoletas (`v1`, `v2`, etc.) al activar `v3`.
 * ============================================================================
 */

// 🛠️ BACKDOOR: CONFIGURACIÓN DEL SERVICE WORKER (SW_CONFIG)
const SW_CONFIG = {
  // Nombre de la caché del App Shell (subir versión fuerza purga de cachés anteriores).
  CACHE_NAME: 'bitacora-mango-primavera-shell-v3',
  // Recursos estáticos que forman el "App Shell".
  SHELL_ASSETS: [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
  ],
  // Patrones que NUNCA se guardan en caché (streams de video, OneSignal, Spotify embed).
  NETWORK_ONLY_PATTERNS: [
    /onesignal\.com/i,
    /cdn\.onesignal\.com/i,
    /api\.onesignal\.com/i,
    /drive\.google\.com\/uc\?export=download/i,
    /open\.spotify\.com/i,
    /scdn\.co/i
  ],
  // Patrones que deben usar la estrategia Network-First (con respaldo offline en caché).
  NETWORK_FIRST_PATTERNS: [
    /\.googleapis\.com/i,               // Google APIs
    /script\.googleusercontent\.com/i,  // Apps Script endpoints (GET)
    /script\.google\.com/i,             // Apps Script base URL
    /drive\.google\.com\/thumbnail/i,   // Miniaturas de fotos y pósters de Drive
    /\?action=/i                        // Parámetro de acción en GAS
  ]
};

/**
 * Instala el Service Worker, pre-cachea el App Shell y toma el relevo de inmediato.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SW_CONFIG.CACHE_NAME)
      .then(cache => cache.addAll(SW_CONFIG.SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activa el Service Worker, elimina todas las cachés antiguas y reclama los clientes.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== SW_CONFIG.CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/**
 * Intercepta peticiones GET:
 *   - Peticiones con cabecera `Range` (streaming `<video>`) o `NETWORK_ONLY_PATTERNS`:
 *     pasan directo a la red sin tocar Cache Storage.
 *   - `NETWORK_FIRST_PATTERNS`: red primero, caché si no hay conexión.
 *   - `SHELL_ASSETS`: caché primero (carga instantánea en el celular).
 *   - Resto de GET: red primero con fallback a caché.
 */
self.addEventListener('fetch', event => {
  const { request } = event;

  // No interceptar POST/PUT/DELETE (mutaciones hacia GAS u OneSignal) ni peticiones Range de video.
  if (request.method !== 'GET' || request.headers.has('range')) {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // No cachear nunca OneSignal, Spotify ni descargas directas de video.
  const isNetworkOnly = SW_CONFIG.NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(url.href));
  if (isNetworkOnly) {
    event.respondWith(fetch(request));
    return;
  }

  const isNetworkFirst = SW_CONFIG.NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
  const isShellAsset = url.origin === self.location.origin && SW_CONFIG.SHELL_ASSETS.some(asset => {
    try {
      const assetPath = new URL(asset, self.location.href).pathname;
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
    event.respondWith(networkFirst(request));
  }
});

/**
 * Estrategia Cache-First (`ignoreSearch: true` para que `./index.html?v=...`
 * o la raíz con query params coincidan con el App Shell pre-cacheado).
 */
async function cacheFirst(request) {
  const cache = await caches.open(SW_CONFIG.CACHE_NAME);
  const cachedResponse = await cache.match(request, { ignoreSearch: true });
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
 * Estrategia Network-First con fallback a caché y a `./index.html` en navegaciones.
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
    if (request.mode === 'navigate') {
      const shellFallback = await cache.match('./index.html', { ignoreSearch: true });
      if (shellFallback) return shellFallback;
    }
    return new Response(
      JSON.stringify({ status: 'error', code: 'OFFLINE', message: 'Recurso no disponible y sin conexión' }),
      {
        status: 504,
        statusText: 'Gateway Timeout',
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

/**
 * Canal de mensajes desde la app (`SKIP_WAITING` o `CLEAR_CACHE`).
 */
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
    );
  }
});
