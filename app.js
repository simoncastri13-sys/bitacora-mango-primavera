/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA (Simón & Salomé)
 * ============================================================================
 * ARCHIVO: app.js · Motor Lógico SPA Offline-First + Google Apps Script
 * ARQUITECTURA (Ingeniería Mecatrónica):
 *   1. BACKDOORs: parámetros, trivia (20), 33 planes, ideas de premios y mural.
 *   2. Compuerta de Seguridad: candado de trivia en RAM (sin persistencia).
 *   3. Persistencia Dual: escritura optimista local + API REST/CORS GAS.
 *   4. Controladores: Inicio (Progreso/Ruleta), Baúl, Mural, Premios y Modales.
 * ============================================================================
 */

// 🛠️ BACKDOOR: CONFIGURACIÓN DE CONEXIÓN Y PARÁMETROS (APP_CONFIG)
const APP_CONFIG = {
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxQy9VR4nCoM-FUuAP5sjrAAC7q_nf2n0mToEc6aBN46ViPU9hPi--PPRxoRSWDEp4/exec",
  IMAGE_MAX_WIDTH: 1200, // Límite de ancho (px) tras compresión en cliente
  IMAGE_QUALITY: 0.8,    // Factor de calidad JPEG (0.0 a 1.0)
  STORAGE_KEYS: { PLANS: "bitacora_plans_v1", MURAL: "bitacora_mural_v1" }
};

// 🛠️ BACKDOOR: BANCO DE TRIVIA (TRIVIA_BANK)
const TRIVIA_BANK = [
  {
    question: "¿En dónde empezó toda esta historia?",
    options: ["En Hogwarts", "En Guatapé", "En la universidad", "En los sueños de Salomé"],
    correctAnswers: ["En Guatapé"]
  },
  {
    question: "¿En qué mes nos conocimos?",
    options: ["Agosto", "Septiembre", "Octubre", "Diciembre"],
    correctAnswers: ["Septiembre"]
  },
  {
    question: "¿Qué camisa tenía puesta Simón el día que se conocieron?",
    options: ["La de Argentina", "Una pijama", "Las alas de ángel", "La del Medellín"],
    correctAnswers: ["La de Argentina"]
  },
  {
    question: "¿Quién es el que más toma de los dos?",
    options: ["Simón", "Salomé"],
    correctAnswers: ["Simón", "Salomé"]
  },
  {
    question: "¿Qué hay en el vaso de Simón en una noche muy buena?",
    options: ["Un Whisky", "Jugo Hit", "Té de manzanilla", "Agua con gas"],
    correctAnswers: ["Un Whisky"]
  },
  {
    question: "¿Cuál es el trago favorito de Salomé?",
    options: ["Vino", "Aguardiente", "Cerveza", "Tequila"],
    correctAnswers: ["Vino"]
  },
  {
    question: "¿Cuál es el equipo favorito de Salomé y de Simón?",
    options: ["El Barça", "El Medellín", "Real Madrid", "Nacional"],
    correctAnswers: ["El Barça", "El Medellín"]
  },
  {
    question: "Si Salo no estudiara Medicina, ¿cuál sería su verdadera profesión?",
    options: ["Cantante profesional de despecho", "Diseñadora de modas", "Chismosa profesional", "Ángel de Victoria's Secret"],
    correctAnswers: ["Diseñadora de modas", "Ángel de Victoria's Secret"]
  },
  {
    question: "¿Quién es el dictador absoluto de la música en los viajes en carro?",
    options: ["Simón", "Salomé", "El radio", "El silencio"],
    correctAnswers: ["Salomé"]
  },
  {
    question: "¿Quién es más probable que termine con guayabo después de salir a tomar?",
    options: ["Simón", "Salomé", "Ninguno de los dos", "El que mezcló tragos"],
    correctAnswers: ["Simón", "Salomé", "Ninguno de los dos"]
  },
  {
    question: "A la hora de salir, ¿quién se demora más frente al espejo?",
    options: ["Salomé", "Salomé", "Salomé", "Salomé"],
    correctAnswers: ["Salomé"]
  },
  {
    question: "¿Qué comida es la que Salomé NO se comería ni aunque le paguen?",
    options: ["Mondongo", "Chocolate negro", "Carne", "Pastas"],
    correctAnswers: ["Mondongo"]
  },
  {
    question: "¿Cuál es la comida rápida favorita de Salomé?",
    options: ["Salchipapa", "Hamburguesa", "Pizza", "Perritos"],
    correctAnswers: ["Salchipapa"]
  },
  {
    question: "¿Cuál es la comida rápida que nunca falla para Simón?",
    options: ["Pizza", "Hamburguesas de la calle", "Sushi", "Tacos al pastor"],
    correctAnswers: ["Pizza"]
  },
  {
    question: "Si tienen que elegir LA comida favorita de Simón, ¿cuál es?",
    options: ["Carne (Punta de anca)", "Pastas", "Solomito", "Pollo"],
    correctAnswers: ["Carne (Punta de anca)"]
  },
  {
    question: "¿Cuáles son los hobbies y gustos preferidos de Simón?",
    options: ["Lavar los carros", "Ir a clases de zumba", "Ir a clases de cómo ser el mejor hombre del mundo", "Jugar videojuegos, estar con Salo y salir con amigos"],
    correctAnswers: ["Ir a clases de cómo ser el mejor hombre del mundo", "Jugar videojuegos, estar con Salo y salir con amigos"]
  },
  {
    question: "¿Cuál es el género musical preferido de Simón?",
    options: ["Rock", "Vallenato", "Salsa", "Merengue"],
    correctAnswers: ["Vallenato"]
  },
  {
    question: "¿Cuáles son los artistas favoritos de Simón?",
    options: ["Diomedes Díaz", "Travis Scott", "Blessd", "Kris R"],
    correctAnswers: ["Diomedes Díaz", "Travis Scott"]
  },
  {
    question: "¿Cuál es el ritual innegociable de música cuando salen en el carro?",
    options: ["Poner reguetón a todo volumen", "Poner vallenato de Diomedes Díaz o de Nelson Velásquez", "Limpiarse los zapatos antes de subirse", "Ir en silencio"],
    correctAnswers: ["Poner vallenato de Diomedes Díaz o de Nelson Velásquez"]
  },
  {
    question: "¿Qué le gusta más a Salomé?",
    options: ["Un gloss", "Una cobija nueva", "Las aceitunas", "El chocolate con nueces"],
    correctAnswers: ["Un gloss"]
  }
];

// 🛠️ BACKDOOR: FRASES CÓMICAS DE IMPOSTOR (IMPOSTOR_MESSAGES)
const IMPOSTOR_MESSAGES = [
  "¡Oops! Parece que un impostor intentó entrar sin saber la historia.",
  "¡Vaya! Esa respuesta sonó sospechosa… inténtalo de nuevo.",
  "Casi lo logras, pero el candado de Mango y Primavera dice que no.",
  "¡Error! Diomedes y el destino detectaron una falla en tu memoria.",
  "¡No te rindas! Prueba con otra pregunta de nuestra historia.",
  "¡Ay! El candado cerró compuertas. Va otra pregunta distinta."
];

// 🛠️ BACKDOOR: LISTA MAESTRA INICIAL DE 33 PLANES (INITIAL_PLANS)
const INITIAL_PLANS = [
  { id: "plan-01", title: "Ver Harry Potter y el Cáliz de Fuego", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🧙‍♂️", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-02", title: "Ver Harry Potter y la Orden del Fénix", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🪄", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-03", title: "Ver Harry Potter y el Misterio del Príncipe", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚡", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-04", title: "Ver Harry Potter y las Reliquias de la Muerte", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🦉", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-05", title: "Ver Django Sin Cadenas", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🤠", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-06", title: "Ver Las muñecas de la mafia", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "📺", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-07", title: "Ver El abogado del diablo", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚖️", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-08", title: "Jugar GTA 6", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋🔋", emoji: "🎮", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-09", title: "Ir a Bárbaro Cocina", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥩", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-10", title: "Ir a El Sause", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍽️", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-11", title: "Ir a comer sándwiches de pastrami", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥪", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-12", title: "Hacer empanadas, buñuelos y natilla", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🥟", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-13", title: "Hacer una torta", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🎂", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-14", title: "Competir por comida (Reto TikTok)", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍔", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-15", title: "Adivinar comida y objetos (con los ojos vendados)", category: "Gastronomía", weather: "🌧️", energy: "🔋", emoji: "🙈", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-16", title: "Picnic improvisado", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🧺", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-17", title: "Ir a Calixto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🍹", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-18", title: "Ir a María Mezcal", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🌮", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-19", title: "Ir a La Sala del Despecho", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎤", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-20", title: "Ir a las Fiestas del Retiro", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎉", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-21", title: "Ir al Teatro Victoria", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎭", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-22", title: "Juegos de tomar en casa", category: "Rumbas", weather: "🌧️", energy: "🔋🔋", emoji: "🎲", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-23", title: "Ir a un concierto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎶", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-24", title: "Noche de fonda tradicional", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🐎", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-25", title: "Competencia de tragos (a ver quién aguanta más)", category: "Rumbas", weather: "🌧️", energy: "🔋🔋🔋", emoji: "🥃", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-26", title: "Volver donde todo empezó (Finca en Guatapé)", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🏡", isVip: true, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-27", title: "Tarde de spa", category: "Relax", weather: "🌧️", energy: "🔋", emoji: "💆", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-28", title: "Salo pasando la tarde con mis papás", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "👨‍👩‍👧", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-29", title: "Yo pasando la tarde con los papás de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "☕", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-30", title: "Tarde todos juntos en familia", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "🫶", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-31", title: "Domingo de jacuzzi", category: "Relax", weather: "☀️", energy: "🔋", emoji: "🫧", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-32", title: "Cumple de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🥳", isVip: false, completed: false, anecdote: "", photoUrl: "" },
  { id: "plan-33", title: "Hacer una Novena de Navidad juntos", category: "Relax", weather: "🌧️", energy: "🔋🔋", emoji: "🎄", isVip: false, completed: false, anecdote: "", photoUrl: "" }
];

// 🛠️ BACKDOOR: IDEAS INICIALES DE PREMIOS (PREMIOS_IDEAS)
const PREMIOS_IDEAS = [
  { id: "premio-01", category: "Sin penas, sin pesares", subtitle: "Desconexión y cero culpa", emoji: "🎟️", badge: "5 planes", title: "Boleto de Escape Social", description: "Permiso oficial para cancelar cualquier salida social sin culpas y quedarnos juntos en nuestro refugio." },
  { id: "premio-02", category: "Sin penas, sin pesares", subtitle: "Desconexión y cero culpa", emoji: "🛌", badge: "5 planes", title: "Hibernación en Pijama (Amnistía Doméstica)", description: "Un día entero en pijama sin tender la cama ni hacer oficios, solo mimos y pelis." },
  { id: "premio-03", category: "Sin penas, sin pesares", subtitle: "Desconexión y cero culpa", emoji: "🍟", badge: "5 planes", title: "Cheat Meal Sin Remordimientos", description: "Pedimos nuestro antojo favorito a domicilio (salchipapa, pizza o postre) a la hora que queramos." },
  { id: "premio-04", category: "Sin penas, sin pesares", subtitle: "Desconexión y cero culpa", emoji: "🫧", badge: "10 planes", title: "Burbuja de Cero Estrés", description: "Tarde de desconexión total del mundo exterior, celulares en silencio y cero preocupaciones." },
  { id: "premio-05", category: "Dinámicas de Poder", subtitle: "Privilegios de pareja", emoji: "🛎️", badge: "5 planes", title: "El Comodín del \"Tráeme / Pásame\"", description: "Vale por 24 horas en las que el otro trae el agua, el snack o el control sin decir ni una palabra." },
  { id: "premio-06", category: "Dinámicas de Poder", subtitle: "Privilegios de pareja", emoji: "🛑", badge: "5 planes", title: "Poder de Veto Presidencial", description: "Autoridad absoluta para vetar una película, restaurante o canción del carro al instante." },
  { id: "premio-07", category: "Dinámicas de Poder", subtitle: "Privilegios de pareja", emoji: "👗", badge: "10 planes", title: "Dictadura del Outfit", description: "El ganador elige exactamente qué se pone el otro para la próxima cita especial." },
  { id: "premio-08", category: "Dinámicas de Poder", subtitle: "Privilegios de pareja", emoji: "👑", badge: "10 planes", title: "La Razón Automática", description: "Comodín dorado para ganar automáticamente cualquier debate amistoso de pareja por un día." }
];

// 🛠️ BACKDOOR: FOTOS INICIALES DEL MURAL (INITIAL_MURAL)
const INITIAL_MURAL = [
  { id: "mural-01", caption: "Guatapé: donde empezó toda esta historia 🥭", createdAt: "2022-09-10", photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320'><defs><linearGradient id='m1' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23FFCC80'/><stop offset='60%25' stop-color='%23F8BBD0'/><stop offset='100%25' stop-color='%23FFFDF9'/></linearGradient></defs><rect width='400' height='320' fill='url(%23m1)'/><circle cx='310' cy='76' r='34' fill='%23FFB347'/><path d='M0 220 Q100 165 200 210 T400 205 L400 320 L0 320 Z' fill='%23A5D6A7'/><path d='M140 220 C150 115 178 84 206 84 C234 84 258 122 266 220 Z' fill='%2381C784'/><rect y='225' width='400' height='95' fill='%23B2DFDB' opacity='0.85'/><path d='M155 252 L245 252 L228 268 L172 268 Z' fill='%23FF8A80'/><text x='200' y='298' font-family='Georgia,serif' font-size='18' font-weight='bold' text-anchor='middle' fill='%232D231E'>Guatapé · Simón &amp; Salomé</text></svg>" },
  { id: "mural-02", caption: "Nuestro refugio de Mango y Primavera 🌸", createdAt: "2025-09-10", photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 400'><defs><linearGradient id='m2' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23F8BBD0'/><stop offset='55%25' stop-color='%23FFFDF9'/><stop offset='100%25' stop-color='%23FFCC80'/></linearGradient></defs><rect width='320' height='400' fill='url(%23m2)'/><circle cx='70' cy='80' r='32' fill='%23FFB347' opacity='0.45'/><circle cx='252' cy='320' r='38' fill='%23A5D6A7' opacity='0.55'/><path d='M160 150 C140 120 96 126 96 164 C96 202 160 244 160 244 C160 244 224 202 224 164 C224 126 180 120 160 150 Z' fill='%23FF8A80'/><circle cx='160' cy='180' r='16' fill='%23FFB347'/><text x='160' y='310' font-family='Georgia,serif' font-size='19' font-weight='bold' text-anchor='middle' fill='%232D231E'>Tú y Yo 🥭🌸</text></svg>" }
];

/* ==================== ESTADO EN RAM Y HELPERS TRANSVERSALES ==================== */
let lastTriviaIndex = -1, currentTrivia = null, isRuletaRolling = false, isSyncing = false;
let currentRuletaPool = [], currentWinnerPlanId = null, editingPlanId = null;
let pendingPlanPhoto = null, pendingMuralPhoto = null;

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const setText = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const escapeHtml = v => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const getStored = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const setStored = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn(e); } };
const hasCloud = () => { const u = String(APP_CONFIG.GAS_WEB_APP_URL || "").trim(); return Boolean(u && !u.includes("PEGA_AQUI") && /^https?:\/\//i.test(u)); };

/** Envía POST con `text/plain` para evitar preflight CORS y reintenta actualización local si falla. */
async function postToBackend(action, payload, okMsg, offlineMsg, onCloudUrl) {
  if (!hasCloud()) return showToast(offlineMsg, "success");
  try {
    const resp = await fetch(APP_CONFIG.GAS_WEB_APP_URL, {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload })
    });
    const res = await resp.json();
    const url = res?.photoUrl || res?.item?.photoUrl;
    if (res?.status === "ok" && url && onCloudUrl) onCloudUrl(url);
    showToast(okMsg, "success");
  } catch (err) {
    console.warn(`Error cloud (${action}):`, err);
    showToast("Guardado localmente (pendiente de nube) 💾", "info");
  }
}

/** Redimensiona a `IMAGE_MAX_WIDTH` y comprime a JPEG en `<canvas>` antes de enviar Base64. */
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Selecciona una imagen válida."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = ev => {
      const img = new Image();
      img.onerror = () => reject(new Error("Formato de imagen incompatible."));
      img.onload = () => {
        const c = document.createElement("canvas"), s = Math.min(APP_CONFIG.IMAGE_MAX_WIDTH / img.width, 1);
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("Canvas no disponible."));
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL("image/jpeg", APP_CONFIG.IMAGE_QUALITY), base64 = dataUrl.split(",")[1] || "";
        resolve({
          dataUrl, base64, mimeType: "image/jpeg", fileName: file.name || `foto_${Date.now()}.jpg`,
          originalKb: Math.max(1, Math.round(file.size / 1024)), compressedKb: Math.max(1, Math.round((base64.length * 3) / 4 / 1024))
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function bindPhotoPicker(inputId, wrapId, imgId, metaId, onReady) {
  $(inputId)?.addEventListener("change", async ev => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageFile(file);
      onReady(res);
      if ($(imgId)) $(imgId).src = res.dataUrl;
      $(wrapId)?.classList.remove("is-hidden");
      setText(metaId, `Original: ${res.originalKb} KB → Optimizada: ${res.compressedKb} KB`);
    } catch (err) { showToast(err.message, "error"); ev.target.value = ""; }
  });
}

function bindFilterBar(barId, sel, onChange) {
  $(barId)?.addEventListener("click", ev => {
    const chip = ev.target.closest(sel);
    if (!chip) return;
    $(barId).querySelectorAll(sel).forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    onChange(chip);
  });
}

function getPlans() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.PLANS, null);
  if (!Array.isArray(stored) || stored.length === 0) return INITIAL_PLANS.map(p => ({ ...p }));
  const map = new Map(INITIAL_PLANS.map(p => [p.id, { ...p }]));
  stored.forEach(p => {
    if (!p?.id) return;
    const base = map.get(p.id) || {};
    map.set(p.id, { ...base, ...p, isVip: Boolean(p.isVip ?? base.isVip), completed: Boolean(p.completed), anecdote: String(p.anecdote || ""), photoUrl: String(p.photoUrl || base.photoUrl || "") });
  });
  return Array.from(map.values());
}
const savePlans = list => setStored(APP_CONFIG.STORAGE_KEYS.PLANS, list);
const getMural = () => { const s = getStored(APP_CONFIG.STORAGE_KEYS.MURAL, null); return Array.isArray(s) && s.length > 0 ? s : INITIAL_MURAL.map(m => ({ ...m })); };
const saveMural = list => setStored(APP_CONFIG.STORAGE_KEYS.MURAL, list);

/* ==================== 1. CANDADO DE TRIVIA (SIN PERSISTENCIA) ==================== */

function initTriviaLock() {
  const qEl = $("trivia-question"), optsEl = $("trivia-options"), fb = $("trivia-feedback"), card = $("trivia-card");
  if (!qEl || !optsEl || TRIVIA_BANK.length === 0) return;
  let idx;
  do { idx = Math.floor(Math.random() * TRIVIA_BANK.length); } while (idx === lastTriviaIndex && TRIVIA_BANK.length > 1);
  lastTriviaIndex = idx;
  currentTrivia = TRIVIA_BANK[idx];
  window.currentTrivia = currentTrivia;

  card?.classList.remove("shake-error", "unlock-success");
  if (fb) { fb.textContent = ""; fb.classList.remove("is-error", "is-success"); }
  qEl.textContent = currentTrivia.question;
  optsEl.innerHTML = "";
  currentTrivia.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "trivia-option-btn"; btn.textContent = opt;
    btn.addEventListener("click", () => handleTriviaAnswer(opt, btn));
    optsEl.appendChild(btn);
  });
}

function handleTriviaAnswer(selected, btn) {
  if (!currentTrivia) return;
  const fb = $("trivia-feedback"), card = $("trivia-card");
  $$("#trivia-options .trivia-option-btn").forEach(b => { b.disabled = true; });
  if (currentTrivia.correctAnswers.includes(selected)) {
    btn.classList.add("is-correct");
    if (fb) { fb.textContent = "¡Correcto! Bienvenidos a su refugio 🥭🌸"; fb.classList.remove("is-error"); fb.classList.add("is-success"); }
    card?.classList.add("unlock-success");
    launchConfetti();
    setTimeout(() => { const lock = $("lock-screen"); lock?.classList.add("is-unlocked"); lock?.setAttribute("aria-hidden", "true"); }, reducedMotion() ? 80 : 850);
  } else {
    btn.classList.add("is-wrong");
    if (fb) { fb.textContent = IMPOSTOR_MESSAGES[Math.floor(Math.random() * IMPOSTOR_MESSAGES.length)]; fb.classList.remove("is-success"); fb.classList.add("is-error"); }
    if (card) { card.classList.remove("shake-error"); void card.offsetWidth; card.classList.add("shake-error"); }
    setTimeout(initTriviaLock, reducedMotion() ? 400 : 1150);
  }
}

function launchConfetti() {
  const box = $("confetti-container");
  if (!box) return;
  box.innerHTML = "";
  const red = reducedMotion(), cols = ["#FFB347", "#FFCC80", "#FF8A80", "#F8BBD0", "#A5D6A7", "#FFFFFF", "#F57C00"];
  for (let i = 0; i < (red ? 12 : 55); i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.style.setProperty("--x", `${(Math.random() * 100).toFixed(2)}%`);
    p.style.setProperty("--size", `${(Math.random() * 8 + 6).toFixed(1)}px`);
    p.style.setProperty("--color", cols[i % cols.length]);
    p.style.setProperty("--dur", red ? "0.01s" : `${(Math.random() * 1.4 + 2).toFixed(2)}s`);
    p.style.setProperty("--delay", red ? "0s" : `${(Math.random() * 0.4).toFixed(2)}s`);
    p.style.setProperty("--drift", `${Math.round(Math.random() * 80 - 40)}px`);
    p.style.setProperty("--rot", `${Math.round(Math.random() * 540 + 180)}deg`);
    box.appendChild(p);
  }
  setTimeout(() => { box.innerHTML = ""; }, red ? 200 : 4000);
}

/* ==================== 2. NAVEGACIÓN Y SINCRONIZACIÓN CLOUD ==================== */

function setupNavigation() {
  const tabs = $$("#bottom-nav .nav-tab"), views = $$("#app-main .app-view");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    const view = tab.dataset.target ? $(tab.dataset.target) : null;
    if (!view) return;
    views.forEach(v => v.classList.remove("is-active")); view.classList.add("is-active");
    tabs.forEach(t => t.classList.remove("is-active")); tab.classList.add("is-active");
  }));
}

function updateSyncBadge(cls, label) {
  const badge = $("sync-status-badge");
  if (!badge) return;
  badge.className = `sync-badge ${cls}`;
  const span = badge.querySelector(".sync-label");
  if (span) span.textContent = label;
}

async function syncWithBackend(manual = false) {
  if (isSyncing) return;
  const btn = $("btn-sync-refresh");
  if (!hasCloud()) {
    updateSyncBadge("is-local", "Local");
    if (manual) showToast("Modo local activo. Configura GAS_WEB_APP_URL para conectar con la nube.", "info");
    return;
  }
  isSyncing = true;
  updateSyncBadge("is-syncing", "Sincronizando…");
  if (btn) { btn.classList.add("is-spinning"); btn.disabled = true; }

  try {
    const sep = APP_CONFIG.GAS_WEB_APP_URL.includes("?") ? "&" : "?";
    const resp = await fetch(`${APP_CONFIG.GAS_WEB_APP_URL}${sep}action=getAll`, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.status && data.status !== "ok") throw new Error(data.message || "Error remoto");

    if (Array.isArray(data.plans) && data.plans.length > 0) {
      const map = new Map(getPlans().map(p => [p.id, p]));
      data.plans.forEach(r => {
        if (!r?.id) return;
        const l = map.get(r.id) || {};
        map.set(r.id, { ...l, ...r, isVip: Boolean(r.isVip ?? l.isVip), completed: Boolean(r.completed), photoUrl: r.photoUrl || l.photoUrl || "", anecdote: r.anecdote !== undefined ? String(r.anecdote) : (l.anecdote || "") });
      });
      savePlans(Array.from(map.values()));
    }
    if (Array.isArray(data.mural) && data.mural.length > 0) {
      const mMap = new Map();
      data.mural.forEach(item => { if (item?.id) mMap.set(item.id, item); });
      getMural().forEach(l => { if (l?.id && !mMap.has(l.id) && !l.id.startsWith("mural-0")) mMap.set(l.id, l); });
      saveMural(Array.from(mMap.values()));
    }
    renderAllViews();
    updateSyncBadge("is-online", "En línea");
    if (manual) showToast("Bitácora sincronizada con Google Sheets & Drive ☁️", "success");
  } catch (err) {
    console.warn("Fallo sync cloud:", err);
    updateSyncBadge("is-local", "Sin conexión");
    if (manual) showToast("No se pudo conectar con la nube. Trabajando en modo local.", "error");
  } finally {
    isSyncing = false;
    if (btn) { btn.classList.remove("is-spinning"); btn.disabled = false; }
  }
}

/* ==================== 3. INICIO: PROGRESO Y RULETA SLOT ==================== */

function renderProgressTracker() {
  const plans = getPlans(), done = plans.filter(p => p.completed).length;
  const pct = plans.length > 0 ? Math.round((done / plans.length) * 100) : 0;
  setText("progress-count-text", `${done} / ${plans.length} planes completados`);
  setText("progress-percent-text", `${pct}%`);
  if ($("progress-bar-fill")) $("progress-bar-fill").style.width = `${pct}%`;
}

function setupRuleta() {
  bindFilterBar("ruleta-weather-filter", ".weather-chip", () => { if (!isRuletaRolling) renderRuletaPool(); });
  $("btn-spin-ruleta")?.addEventListener("click", spinRuleta);
  $("btn-open-winner-plan")?.addEventListener("click", () => { if (currentWinnerPlanId) openPlanModal(currentWinnerPlanId); });
  renderRuletaPool();
}

function renderRuletaPool() {
  const weather = document.querySelector("#ruleta-weather-filter .weather-chip.is-active")?.dataset.weather || "Todos";
  const pool = getPlans().filter(p => !p.completed && (weather === "Todos" || p.weather === weather));
  currentRuletaPool = pool;
  setText("ruleta-pool-count", `${pool.length} ${pool.length === 1 ? "plan disponible" : "planes disponibles"}`);
  $("ruleta-winner-actions")?.classList.add("is-hidden");
  currentWinnerPlanId = null;

  const btn = $("btn-spin-ruleta");
  if (pool.length === 0) {
    if (btn) btn.disabled = true;
    setText("ruleta-slot-emoji", "🎉"); setText("ruleta-slot-title", "Sin planes pendientes aquí"); setText("ruleta-slot-meta", "Prueba otro clima o añade uno en El Baúl");
  } else if (!isRuletaRolling) {
    if (btn) btn.disabled = false;
    setText("ruleta-slot-emoji", "🎲"); setText("ruleta-slot-title", "¿Qué haremos hoy?"); setText("ruleta-slot-meta", "Gira para descubrirlo");
  }
}

function spinRuleta() {
  if (isRuletaRolling || currentRuletaPool.length === 0) return;
  const slot = $("ruleta-slot-box"), btn = $("btn-spin-ruleta"), winBox = $("ruleta-winner-actions");
  isRuletaRolling = true;
  if (btn) btn.disabled = true;
  winBox?.classList.add("is-hidden");
  slot?.classList.add("is-rolling");

  const pool = [...currentRuletaPool], winner = pool[Math.floor(Math.random() * pool.length)], red = reducedMotion();
  const paint = p => { setText("ruleta-slot-emoji", p.emoji || "✨"); setText("ruleta-slot-title", p.title); setText("ruleta-slot-meta", `${p.category} · ${p.weather} · ${p.energy}`); };
  const ticker = red ? null : setInterval(() => paint(pool[Math.floor(Math.random() * pool.length)]), 85);

  setTimeout(() => {
    if (ticker) clearInterval(ticker);
    slot?.classList.remove("is-rolling");
    paint(winner);
    currentWinnerPlanId = winner.id;
    isRuletaRolling = false;
    if (btn) btn.disabled = false;
    winBox?.classList.remove("is-hidden");
  }, red ? 60 : 1600);
}

/* ==================== 4. EL BAÚL DE PLANES (VIP + MODALES) ==================== */

function setupBaul() {
  bindFilterBar("baul-category-filter", ".category-chip", renderBaul);
  bindFilterBar("baul-status-filter", ".status-chip", renderBaul);
  $("baul-plans-grid")?.addEventListener("click", ev => {
    const card = ev.target.closest(".plan-card");
    if (card?.dataset.planId) openPlanModal(card.dataset.planId);
  });
  $("btn-fab-add-plan")?.addEventListener("click", () => $("add-plan-modal")?.classList.add("is-open"));
  setupPlanModals();
  renderBaul();
}

function renderBaul() {
  const grid = $("baul-plans-grid"), empty = $("baul-empty");
  if (!grid || !empty) return;
  const cat = document.querySelector("#baul-category-filter .category-chip.is-active")?.dataset.category || "Todos";
  const st = document.querySelector("#baul-status-filter .status-chip.is-active")?.dataset.status || "Todos";
  const list = getPlans()
    .filter(p => (cat === "Todos" || p.category === cat) && (st === "Todos" || (st === "Pendientes" && !p.completed) || (st === "Completados" && p.completed)))
    .sort((a, b) => Number(Boolean(b.isVip)) - Number(Boolean(a.isVip)));

  grid.innerHTML = "";
  if (list.length === 0) return empty.classList.remove("is-hidden");
  empty.classList.add("is-hidden");

  const frag = document.createDocumentFragment();
  list.forEach(p => {
    const card = document.createElement("article");
    card.dataset.planId = p.id;
    card.className = ["plan-card", p.isVip ? "highlight-card" : "", p.completed ? "is-completed" : ""].filter(Boolean).join(" ");
    card.innerHTML = `
      <div class="plan-card-head">
        <span class="plan-emoji" aria-hidden="true">${escapeHtml(p.emoji || "✨")}</span>
        <h3 class="plan-title">${escapeHtml(p.title)}</h3>
        <span class="plan-status-pill">${p.completed ? "✅ Completado" : "⏳ Pendiente"}</span>
      </div>
      <div class="plan-badges">
        ${p.isVip ? `<span class="plan-vip-badge">👑 VIP · Donde todo empezó</span>` : ""}
        <span class="plan-badge">${escapeHtml(p.category)}</span><span class="plan-badge">${escapeHtml(p.weather)}</span><span class="plan-badge">${escapeHtml(p.energy)}</span>
        ${p.photoUrl ? `<span class="plan-anecdote-badge">📷 Foto</span>` : ""}${p.anecdote ? `<span class="plan-anecdote-badge">📝 Bitácora</span>` : ""}
      </div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

function openPlanModal(planId) {
  const p = getPlans().find(item => item.id === planId), modal = $("plan-modal");
  if (!p || !modal) return;
  editingPlanId = p.id; pendingPlanPhoto = null;
  setText("plan-modal-emoji", p.emoji || "✨");
  setText("plan-modal-title", p.title);
  if ($("plan-modal-badges")) {
    $("plan-modal-badges").innerHTML = `${p.isVip ? `<span class="plan-vip-badge">👑 VIP</span>` : ""}<span class="plan-badge">${escapeHtml(p.category)}</span><span class="plan-badge">${escapeHtml(p.weather)}</span><span class="plan-badge">${escapeHtml(p.energy)}</span>`;
  }
  if ($("plan-modal-completed")) $("plan-modal-completed").checked = Boolean(p.completed);
  setText("plan-modal-status-label", p.completed ? "Completado ✅" : "Pendiente ⏳");
  if ($("plan-modal-anecdote")) $("plan-modal-anecdote").value = p.anecdote || "";
  if ($("plan-modal-photo-input")) $("plan-modal-photo-input").value = "";
  setText("plan-modal-photo-meta", "");

  const wrap = $("plan-modal-photo-wrapper"), prev = $("plan-modal-photo-preview");
  if (wrap && prev) {
    if (p.photoUrl) { prev.src = p.photoUrl; wrap.classList.remove("is-hidden"); }
    else { prev.removeAttribute("src"); wrap.classList.add("is-hidden"); }
  }
  modal.classList.add("is-open");
}

function setupPlanModals() {
  const chk = $("plan-modal-completed");
  chk?.addEventListener("change", () => setText("plan-modal-status-label", chk.checked ? "Completado ✅" : "Pendiente ⏳"));
  bindPhotoPicker("plan-modal-photo-input", "plan-modal-photo-wrapper", "plan-modal-photo-preview", "plan-modal-photo-meta", r => { pendingPlanPhoto = r; });

  $("form-plan-detail")?.addEventListener("submit", ev => {
    ev.preventDefault();
    if (!editingPlanId) return;
    const planId = editingPlanId, completed = Boolean(chk?.checked), anecdote = $("plan-modal-anecdote")?.value.trim() || "";
    const photo = pendingPlanPhoto; pendingPlanPhoto = null;
    const plans = getPlans(), idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return;

    plans[idx] = { ...plans[idx], completed, anecdote, photoUrl: photo ? photo.dataUrl : plans[idx].photoUrl, updatedAt: new Date().toISOString() };
    savePlans(plans); renderAllViews();
    $("plan-modal")?.classList.remove("is-open");

    postToBackend("updatePlan", {
      id: planId, completed, anecdote, imageBase64: photo?.base64 || "", mimeType: photo?.mimeType || "", fileName: photo?.fileName || ""
    }, "¡Plan actualizado y guardado en la nube! ☁️🥭", completed ? "¡Plan completado! ✅" : "Anécdota guardada ✨",
    url => { savePlans(getPlans().map(p => (p.id === planId ? { ...p, photoUrl: url } : p))); renderBaul(); });
  });

  $("form-add-plan")?.addEventListener("submit", ev => {
    ev.preventDefault();
    const title = $("new-plan-title")?.value.trim() || "";
    if (!title) return showToast("Escribe un título para el plan.", "error");
    const newPlan = {
      id: `plan-${Date.now()}`, title, category: $("new-plan-category")?.value || "Relax",
      weather: $("new-plan-weather")?.value || "☀️", energy: $("new-plan-energy")?.value || "🔋🔋",
      emoji: $("new-plan-emoji")?.value.trim() || "✨", isVip: false, completed: false, anecdote: "", photoUrl: "", updatedAt: new Date().toISOString()
    };
    const plans = getPlans(); plans.push(newPlan); savePlans(plans); renderAllViews();
    $("form-add-plan")?.reset();
    $("add-plan-modal")?.classList.remove("is-open");
    postToBackend("addPlan", newPlan, "¡Plan añadido al Baúl y a la nube! ☁️", "¡Nuevo plan añadido al Baúl! 🥭");
  });
}

/* ==================== 5. EL MURAL (PINTEREST + LIGHTBOX) ==================== */

function setupMural() {
  $("btn-upload-mural")?.addEventListener("click", () => {
    pendingMuralPhoto = null; $("form-mural-upload")?.reset();
    if ($("mural-date-input")) $("mural-date-input").value = todayLocal();
    $("mural-preview-wrapper")?.classList.add("is-hidden"); $("mural-preview-img")?.removeAttribute("src");
    setText("mural-photo-meta", ""); $("mural-upload-modal")?.classList.add("is-open");
  });
  bindPhotoPicker("mural-photo-input", "mural-preview-wrapper", "mural-preview-img", "mural-photo-meta", r => { pendingMuralPhoto = r; });

  $("form-mural-upload")?.addEventListener("submit", ev => {
    ev.preventDefault();
    if (!pendingMuralPhoto) return showToast("Selecciona primero una foto para el Mural.", "error");
    const id = `mural-${Date.now()}`, caption = $("mural-caption-input")?.value.trim() || "Recuerdo de Mango & Primavera";
    const createdAt = $("mural-date-input")?.value || todayLocal(), photo = pendingMuralPhoto;
    pendingMuralPhoto = null;

    saveMural([{ id, caption, createdAt, photoUrl: photo.dataUrl }, ...getMural()]);
    renderMural(); $("form-mural-upload")?.reset();
    $("mural-preview-wrapper")?.classList.add("is-hidden"); $("mural-upload-modal")?.classList.remove("is-open");

    postToBackend("addMuralPhoto", {
      id, caption, createdAt, imageBase64: photo.base64, mimeType: photo.mimeType, fileName: photo.fileName
    }, "¡Foto subida al Mural y guardada en Drive! ☁️📸", "¡Recuerdo guardado en El Mural! 🌸",
    url => { saveMural(getMural().map(m => (m.id === id ? { ...m, photoUrl: url } : m))); renderMural(); });
  });

  $("mural-grid")?.addEventListener("click", ev => {
    const item = getMural().find(m => m.id === ev.target.closest(".mural-card")?.dataset.muralId);
    if (!item) return;
    if ($("lightbox-img")) $("lightbox-img").src = item.photoUrl;
    setText("lightbox-caption", item.caption || ""); setText("lightbox-date", item.createdAt || "");
    $("lightbox-modal")?.classList.add("is-open");
  });
  renderMural();
}

function renderMural() {
  const grid = $("mural-grid"), empty = $("mural-empty");
  if (!grid || !empty) return;
  const items = getMural();
  grid.innerHTML = "";
  if (items.length === 0) return empty.classList.remove("is-hidden");
  empty.classList.add("is-hidden");

  const frag = document.createDocumentFragment();
  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "mural-card"; card.dataset.muralId = item.id;
    card.innerHTML = `<img src="${escapeHtml(item.photoUrl)}" alt="${escapeHtml(item.caption || "Recuerdo")}" loading="lazy"><div class="mural-card-body"><p class="mural-caption">${escapeHtml(item.caption || "")}</p><span class="mural-date">${escapeHtml(item.createdAt || "")}</span></div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ==================== 6. PREMIOS, MODALES, TOASTS Y BOOTSTRAP ==================== */

function renderPremios() {
  const board = $("premios-board");
  if (!board) return;
  const groups = new Map();
  PREMIOS_IDEAS.forEach(i => { if (!groups.has(i.category)) groups.set(i.category, []); groups.get(i.category).push(i); });
  board.innerHTML = "";
  groups.forEach((ideas, cat) => {
    const sec = document.createElement("section");
    sec.className = "premios-category";
    sec.innerHTML = `<h3 class="premios-category-title">${escapeHtml(cat)} · ${escapeHtml(ideas[0].subtitle)}</h3><div class="premios-grid">${ideas.map(i => `<article class="premio-idea-card"><span class="premio-idea-badge">${escapeHtml(i.badge)}</span><h4>${escapeHtml(i.emoji)} ${escapeHtml(i.title)}</h4><p>${escapeHtml(i.description)}</p></article>`).join("")}</div>`;
    board.appendChild(sec);
  });
}

function setupModalClose() {
  document.addEventListener("click", ev => {
    const btn = ev.target.closest("[data-close-modal]");
    if (btn) { const id = btn.getAttribute("data-close-modal"); ((id && $(id)) || btn.closest(".modal-overlay"))?.classList.remove("is-open"); return; }
    if (ev.target.classList?.contains("modal-overlay")) ev.target.classList.remove("is-open");
  });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape") $$(".modal-overlay.is-open").forEach(m => m.classList.remove("is-open")); });
}

function showToast(msg, type = "info") {
  const box = $("toast-container");
  if (!box || !msg) return;
  const t = document.createElement("div");
  t.className = `toast toast-${["info", "success", "error"].includes(type) ? type : "info"}`;
  t.textContent = msg; box.appendChild(t);
  setTimeout(() => { t.classList.add("is-leaving"); setTimeout(() => t.remove(), reducedMotion() ? 50 : 320); }, 3000);
}

function renderAllViews() { renderProgressTracker(); renderRuletaPool(); renderBaul(); renderMural(); }

function initApp() {
  initTriviaLock(); setupNavigation(); renderProgressTracker();
  setupRuleta(); setupBaul(); setupMural(); renderPremios(); setupModalClose();
  $("btn-sync-refresh")?.addEventListener("click", () => syncWithBackend(true));
  syncWithBackend(false);
}

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initApp);
else initApp();
