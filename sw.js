/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA · SERVICE WORKER V4.0 (OFFLINE-FIRST)
 * ============================================================================
 * ARCHIVO: sw.js
 * ESTRATEGIA V4.0:
 *   1. Pre-caché del App Shell completo + `./OneSignalSDKWorker.js` + las 4 poses
 *      3D de la mascota Coquí (`coqui-{happy,magic,grumpy,celebrate}.png`).
 *   2. Network-Only (pase directo a red sin interferir CORS ni Range) para
 *      OneSignal, streams de video de Drive, Spotify, Apple iTunes Search/Lookup,
 *      previews de audio/portadas (`mzstatic.com`) y catálogo de cine (`themoviedb.org`).
 *   3. Network-First con respaldo offline en Cache Storage para Google Apps Script,
 *      miniaturas de Google Drive, librerías ESM (`jsdelivr.net`) y App Shell.
 *   4. Purga automática de cachés obsoletas (`v1`, `v2`, `v3.x`) al activar `v4.0`.
 * ============================================================================
 */

// 🛠️ BACKDOOR: CONFIGURACIÓN DEL SERVICE WORKER (SW_CONFIG V4.0)
const SW_CONFIG = {
  // Nombre de la caché del App Shell V4.0 (fuerza purga limpia de v3.x y previas).
  CACHE_NAME: 'bitacora-mango-primavera-shell-v4.0',
  // Recursos estáticos esenciales pre-cacheados al instalar la PWA.
  SHELL_ASSETS: [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './OneSignalSDKWorker.js',
    './assets/mascot/coqui-happy.png',
    './assets/mascot/coqui-magic.png',
    './assets/mascot/coqui-grumpy.png',
    './assets/mascot/coqui-celebrate.png'
  ],
  // Patrones que pasan directo a la red (streams multimedia, OneSignal, Spotify, iTunes, Apple CDN y TMDB).
  NETWORK_ONLY_PATTERNS: [
    /onesignal\.com/i,
    /cdn\.onesignal\.com/i,
    /api\.onesignal\.com/i,
    /drive\.google\.com\/uc\?export=download/i,
    /drive\.usercontent\.google\.com/i,
    /drive\.google\.com\/file\//i,
    /open\.spotify\.com/i,
    /scdn\.co/i,
    /itunes\.apple\.com/i,
    /mzstatic\.com/i,
    /themoviedb\.org/i,
    /tmdb\.org/i
  ],
  // Patrones que usan estrategia Network-First con respaldo offline en caché.
  NETWORK_FIRST_PATTERNS: [
    /\.googleapis\.com/i,               // Google APIs y Google Fonts
    /\.gstatic\.com/i,                  // Fuentes estáticas
    /cdn\.jsdelivr\.net/i,              // Módulos ESM dinámicos (mp4-muxer WebCodecs)
    /script\.googleusercontent\.com/i,  // Apps Script endpoints (GET)
    /script\.google\.com/i,             // Apps Script base URL
    /drive\.google\.com\/thumbnail/i,   // Miniaturas de fotos y pósters de Drive
    /\?action=/i                        // Parámetro de acción en GAS
  ]
};

/**
 * Instala el Service Worker V4.0, pre-cachea el App Shell + Mascota Coquí
 * (tolerante a fallos individuales para no abortar la instalación) y toma el relevo.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SW_CONFIG.CACHE_NAME)
      .then(cache => Promise.all(
        SW_CONFIG.SHELL_ASSETS.map(asset =>
          fetch(new Request(asset, { cache: 'reload' }))
            .then(resp => (resp && resp.status === 200 ? cache.put(asset, resp) : null))
            .catch(() => cache.add(asset).catch(() => null))
        )
      ))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activa el Service Worker V4.0, elimina todas las cachés anteriores (`!== v4.0`)
 * y reclama inmediatamente las ventanas abiertas.
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
 *   - POST/PUT/DELETE o cabeceras `Range` (`<video>` / `<audio>`): directo a red.
 *   - `NETWORK_ONLY_PATTERNS` (`itunes.apple.com`, `mzstatic.com`, `themoviedb.org`,
 *     OneSignal, streams de Drive, Spotify): directo a red.
 *   - `SHELL_ASSETS`: Network-First revalidando caché HTTP para recibir updates al instante,
 *     con respaldo instantáneo en Cache Storage cuando no hay red.
 *   - `NETWORK_FIRST_PATTERNS` y resto de GET: Network-First con fallback a caché.
 */
self.addEventListener('fetch', event => {
  const { request } = event;

  // No interceptar mutaciones ni peticiones parciales Range de video/audio.
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

  // Permitir red directa sin cachear para iTunes, mzstatic, TMDB, OneSignal, Spotify y descargas de video.
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
    event.respondWith(networkFirst(request, false));
  } else if (isShellAsset) {
    event.respondWith(networkFirst(request, true));
  } else {
    event.respondWith(networkFirst(request, false));
  }
});

/**
 * Estrategia Cache-First (`ignoreSearch: true` para activos versionados con query string).
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
 * Cuando `bypassHttpCache` es true (App Shell), fuerza `cache: 'no-cache'` contra GitHub Pages.
 */
async function networkFirst(request, bypassHttpCache = false) {
  const cache = await caches.open(SW_CONFIG.CACHE_NAME);
  try {
    const fetchReq = bypassHttpCache ? new Request(request, { cache: 'no-cache' }) : request;
    const networkResponse = await fetch(fetchReq);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request, { ignoreSearch: bypassHttpCache });
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

/**
 * Al tocar una notificación local de la Bitácora (`tag: bitacora-*`) en iOS/Android,
 * enfoca o abre la ventana activa sin interferir con el listener propio de OneSignal SDK v16.
 */
self.addEventListener('notificationclick', event => {
  const tag = String((event.notification && event.notification.tag) || '');
  // Si el Service Worker corre fusionado con OneSignalSDK.sw.js y la notificación no es local nuestra,
  // dejamos que OneSignal gestione su propio click/deep-link.
  if (typeof self.OneSignal !== 'undefined' && tag && !tag.startsWith('bitacora-')) {
    return;
  }
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
