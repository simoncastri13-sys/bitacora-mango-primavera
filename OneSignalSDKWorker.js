/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA · ONESIGNAL SDK WORKER V4.0
 * ============================================================================
 * ARCHIVO: OneSignalSDKWorker.js
 * Integra el Service Worker oficial de OneSignal Web Push SDK v16 en primer
 * lugar y enlaza el motor Offline-First del App Shell (`./sw.js`) bajo el
 * mismo scope sin colisión de controladores en iOS Safari / Android PWA.
 * ============================================================================
 */

// 🛠️ BACKDOOR: IMPORTACIÓN OFICIAL ONESIGNAL V16 + PUENTE APP SHELL V4.0
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts("./sw.js");
