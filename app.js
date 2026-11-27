/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA (Simón & Salomé) · FRONTEND V4.0
 * ============================================================================
 * ARCHIVO: app.js · Motor Lógico SPA Offline-First + Google Apps Script V4.0
 * ARQUITECTURA (Ingeniería Mecatrónica — Sistemas Cliente):
 *   0. BACKDOORs: identidad, configuración V4, OneSignal v16, semillas y respaldos IA.
 *   1. Estado en RAM, utilidades transversales, fechas limpias y capa API / Storage V4.
 *   2. Tema Crepuscular (Dark Mode OKLCH), Mascota 3D Coquí, Badging API y Banner Toque.
 *   3. Identidad (Simón/Salo), OneSignal v16 (`OneSignalSDKWorker.js`), Candado Rápido.
 *   4. Candado Inteligente (Reglas 1, 2 y 4 + `-10 pts`) y Escena Cinemática de Bienvenida.
 *   5. Navegación Unificada y Sincronización Cloud V4 (10 colecciones + notificaciones).
 *   6. Motor Multimedia V4: Imágenes Canvas, Compresor Video 720p@30fps (`WebCodecs` +
 *      `mp4-muxer` + fallback `MediaRecorder` / 480p / Link Drive) y Buscador Música iTunes.
 *   7. Inicio V4: Marcador animado, Mood del Día, Contador Próximo Encuentro y Ruleta.
 *   8. El Baúl V4: Portadas Mágicas (`coverUrl`), Música IG, Retos y Planes Sorpresa.
 *   9. El Mural V4: Filtros (`Todos|Fotos|Videos|Favoritos`), Estrella, Paginación 12x12
 *      y Lightbox con reproductor musical tipo Historia de IG (`<audio id="lightbox-audio">`).
 *  10. Premios V4: Tienda de cupones canjeables, celebración de Coquí y Dobby Premios.
 *  11. El Reparto V4: Protagonistas, Secundarios y Marcador Histórico de Retos.
 *  12. Sabiduría V4: Galleta de la Fortuna (`#btn-random-quote-home`) y CRUD en Ajustes.
 *  13. Inteligencia Artificial: Dobby (`gemini-4-hydrogen`, RAM de sesión, tarjetas 1-toque)
 *      y Protocolo Cine (`TMDB CO` + `Gemini`).
 *  14. Ajustes V4: Frase Dedicada (`once|today`), Mensajes Programados, Preguntas Trampa,
 *      Exportación de Backup JSON, Modales, Toasts y Bootstrap PWA.
 * ============================================================================
 */

// 🛠️ BACKDOOR: IDENTIDAD Y NOMBRE CENTRALIZADO DE LA APP (APP_IDENTITY)
const APP_IDENTITY = {
  NAME: "Bitácora de Palito de Mango y Primavera",
  SHORT_NAME: "Mango & Primavera",
  SUBTITLE: "Simón & Salomé",
  USERS: {
    simon: { id: "simon", name: "Simón", shortName: "Simón", alias: "Palito de Mango", emoji: "🥭", partner: "salo" },
    salo: { id: "salo", name: "Salomé", shortName: "Salo", alias: "Primavera", emoji: "🌸", partner: "simon" }
  }
};

// 🛠️ BACKDOOR: CONFIGURACIÓN DE CONEXIÓN, ONESIGNAL V16, VIDEO WEBCODECS Y STORAGE (APP_CONFIG)
const APP_CONFIG = {
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxQy9VR4nCoM-FUuAP5sjrAAC7q_nf2n0mToEc6aBN46ViPU9hPi--PPRxoRSWDEp4/exec",
  ONESIGNAL_APP_ID: "449bcc81-9a1e-47c9-bc64-ba747c24a12e",
  IMAGE_MAX_WIDTH: 1200,               // Ancho máx. (px) para fotos generales
  IMAGE_QUALITY: 0.8,                  // Calidad JPEG (0.0 a 1.0)
  COVER_MAX_WIDTH: 1000,               // Ancho máx. (px) para Portadas Mágicas (`coverUrl`)
  COVER_QUALITY: 0.82,                 // Calidad JPEG para portadas
  VIDEO_PASSTHROUGH_MB: 30,            // Si pesa < 30 MB, sube directo sin recodificar (instantáneo en iPhone)
  VIDEO_MAX_COMPRESSED_MB: 35,         // Umbral máx. tras comprimir antes de activar Plan B
  MAX_VIDEO_MB: 36,                    // Tope duro de payload hacia Google Apps Script
  VIDEO_TARGET_HEIGHT: 720,            // Resolución objetivo principal (720p)
  VIDEO_FALLBACK_HEIGHT: 480,          // Resolución Plan B ultra-compacto (480p)
  VIDEO_TARGET_FPS: 30,                // Cuadros por segundo objetivo
  VIDEO_BITRATE_720: 2100000,          // ~2.1 Mbps H.264 para 720p
  VIDEO_BITRATE_480: 920000,           // ~920 kbps H.264 para 480p
  MP4_MUXER_ESM_URL: "https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/+esm",
  ITUNES_SEARCH_URL: "https://itunes.apple.com/search",
  ITUNES_LOOKUP_URL: "https://itunes.apple.com/lookup",
  MURAL_PAGE_SIZE: 12,                 // Paginación del Mural (12 en 12)
  TRIVIA_POINTS: 10,                   // +10 pts por acierto (máx. 3 al día)
  TRIVIA_PENALTY_POINTS: 10,           // -10 pts por fallo (piso mínimo 0)
  TRIVIA_MAX_PER_DAY: 3,
  TRIVIA_COOLDOWN_SIZE: 5,             // Regla 1: bloquea las últimas 5 preguntas vistas
  TRIVIA_RETRY_MIN_TURNS: 2,           // Regla 4: peso extra a falladas tras >= 2 turnos
  PLAN_COMPLETION_POINTS: 50,
  MASCOT_ASSETS: {
    happy: "./assets/mascot/coqui-happy.png",
    magic: "./assets/mascot/coqui-magic.png",
    grumpy: "./assets/mascot/coqui-grumpy.png",
    celebrate: "./assets/mascot/coqui-celebrate.png"
  },
  STORAGE_KEYS: {
    IDENTITY: "bitacora_identity_v3",
    PLANS: "bitacora_plans_v3",
    MURAL: "bitacora_mural_v3",
    CUPONES: "bitacora_cupones_v3",
    PUNTOS: "bitacora_puntos_v3",
    SABIDURIA: "bitacora_sabiduria_v3",
    PREGUNTAS: "bitacora_preguntas_v3",
    PERSONAJES: "bitacora_personajes_v3",
    TRIVIA_STATS: "bitacora_trivia_stats_v4",
    THEME: "bitacora_theme_v4",
    DEDICATED_QUOTES: "bitacora_frases_dedicadas_v4",
    SCHEDULED_MSGS: "bitacora_mensajes_programados_v4",
    CONFIGURACION: "bitacora_configuracion_v4",
    INCOMING_TOUCH: "bitacora_incoming_touch_v4",
    BADGE_COUNT: "bitacora_badge_count_v4"
  }
};

// 🛠️ BACKDOOR: BANCO DE TRIVIA ASIMÉTRICO (TRIVIA_BANK — 20 PREGUNTAS OFICIALES)
const TRIVIA_BANK = [
  { id: "preg-01", paraUsuario: "ambos", pregunta: "¿En dónde empezó toda esta historia?", opcionA: "En Hogwarts", opcionB: "En Guatapé", opcionC: "En la universidad", opcionD: "En los sueños de Salomé", opcionCorrecta: "En Guatapé", creadoPor: "" },
  { id: "preg-02", paraUsuario: "ambos", pregunta: "¿En qué mes nos conocimos?", opcionA: "Agosto", opcionB: "Septiembre", opcionC: "Octubre", opcionD: "Diciembre", opcionCorrecta: "Septiembre", creadoPor: "" },
  { id: "preg-03", paraUsuario: "simon", pregunta: "¿Qué camisa tenía puesta Salo el día que se conocieron?", opcionA: "La de Argentina", opcionB: "Una pijama", opcionC: "Las alas de ángel", opcionD: "La del Medellín", opcionCorrecta: "Las alas de ángel | La de Argentina", creadoPor: "salo" },
  { id: "preg-04", paraUsuario: "ambos", pregunta: "¿Quién es el que más toma de los dos?", opcionA: "Simón", opcionB: "Salomé", opcionC: "", opcionD: "", opcionCorrecta: "Simón | Salomé", creadoPor: "" },
  { id: "preg-05", paraUsuario: "salo", pregunta: "¿Qué hay en el vaso de Simón en una noche muy buena?", opcionA: "Un Whisky", opcionB: "Jugo Hit", opcionC: "Té de manzanilla", opcionD: "Agua con gas", opcionCorrecta: "Un Whisky", creadoPor: "simon" },
  { id: "preg-06", paraUsuario: "simon", pregunta: "¿Cuál es el trago favorito de Salomé?", opcionA: "Vino", opcionB: "Aguardiente", opcionC: "Cerveza", opcionD: "Tequila", opcionCorrecta: "Vino", creadoPor: "salo" },
  { id: "preg-07", paraUsuario: "ambos", pregunta: "¿Cuál es el equipo favorito de Salomé y de Simón?", opcionA: "El Barça", opcionB: "El Medellín", opcionC: "Real Madrid", opcionD: "Nacional", opcionCorrecta: "El Barça | El Medellín", creadoPor: "" },
  { id: "preg-08", paraUsuario: "simon", pregunta: "Si Salo no estudiara Medicina, ¿cuál sería su verdadera profesión?", opcionA: "Cantante profesional de despecho", opcionB: "Diseñadora de modas", opcionC: "Chismosa profesional", opcionD: "Ángel de Victoria's Secret", opcionCorrecta: "Diseñadora de modas | Ángel de Victoria's Secret", creadoPor: "salo" },
  { id: "preg-09", paraUsuario: "ambos", pregunta: "¿Quién es el dictador absoluto de la música en los viajes en carro?", opcionA: "Simón", opcionB: "Salomé", opcionC: "El radio", opcionD: "El silencio", opcionCorrecta: "Salomé", creadoPor: "" },
  { id: "preg-10", paraUsuario: "ambos", pregunta: "¿Quién es más probable que termine con guayabo después de salir a tomar?", opcionA: "Simón", opcionB: "Salomé", opcionC: "Ninguno de los dos", opcionD: "El que mezcló tragos", opcionCorrecta: "Simón | Salomé | Ninguno de los dos", creadoPor: "" },
  { id: "preg-11", paraUsuario: "ambos", pregunta: "A la hora de salir, ¿quién se demora más frente al espejo?", opcionA: "Salomé", opcionB: "Salomé", opcionC: "Salomé", opcionD: "Salomé", opcionCorrecta: "Salomé", creadoPor: "" },
  { id: "preg-12", paraUsuario: "simon", pregunta: "¿Qué comida es la que Salomé NO se comería ni aunque le paguen?", opcionA: "Mondongo", opcionB: "Chocolate negro", opcionC: "Carne", opcionD: "Pastas", opcionCorrecta: "Mondongo", creadoPor: "salo" },
  { id: "preg-13", paraUsuario: "simon", pregunta: "¿Cuál es la comida rápida favorita de Salomé?", opcionA: "Salchipapa", opcionB: "Hamburguesa", opcionC: "Pizza", opcionD: "Perritos", opcionCorrecta: "Salchipapa", creadoPor: "salo" },
  { id: "preg-14", paraUsuario: "salo", pregunta: "¿Cuál es la comida rápida que nunca falla para Simón?", opcionA: "Pizza", opcionB: "Hamburguesas de la calle", opcionC: "Sushi", opcionD: "Tacos al pastor", opcionCorrecta: "Pizza", creadoPor: "simon" },
  { id: "preg-15", paraUsuario: "salo", pregunta: "Si tienen que elegir LA comida favorita de Simón, ¿cuál es?", opcionA: "Carne (Punta de anca)", opcionB: "Pastas", opcionC: "Solomito", opcionD: "Pollo", opcionCorrecta: "Carne (Punta de anca)", creadoPor: "simon" },
  { id: "preg-16", paraUsuario: "salo", pregunta: "¿Cuáles son los hobbies y gustos preferidos de Simón?", opcionA: "Lavar los carros", opcionB: "Ir a clases de zumba", opcionC: "Ir a clases de cómo ser el mejor hombre del mundo", opcionD: "Jugar videojuegos, estar con Salo y salir con amigos", opcionCorrecta: "Ir a clases de cómo ser el mejor hombre del mundo | Jugar videojuegos, estar con Salo y salir con amigos", creadoPor: "simon" },
  { id: "preg-17", paraUsuario: "salo", pregunta: "¿Cuál es el género musical preferido de Simón?", opcionA: "Rock", opcionB: "Vallenato", opcionC: "Salsa", opcionD: "Merengue", opcionCorrecta: "Vallenato", creadoPor: "simon" },
  { id: "preg-18", paraUsuario: "salo", pregunta: "¿Cuáles son los artistas favoritos de Simón?", opcionA: "Diomedes Díaz", opcionB: "Travis Scott", opcionC: "Blessd", opcionD: "Kris R", opcionCorrecta: "Diomedes Díaz | Travis Scott", creadoPor: "simon" },
  { id: "preg-19", paraUsuario: "ambos", pregunta: "¿Cuál es el ritual innegociable de música cuando salen en el carro?", opcionA: "Poner reguetón a todo volumen", opcionB: "Poner vallenato de Diomedes Díaz o de Nelson Velásquez", opcionC: "Limpiarse los zapatos antes de subirse", opcionD: "Ir en silencio", opcionCorrecta: "Poner vallenato de Diomedes Díaz o de Nelson Velásquez", creadoPor: "" },
  { id: "preg-20", paraUsuario: "simon", pregunta: "¿Qué le gusta más a Salomé?", opcionA: "Un gloss", opcionB: "Una cobija nueva", opcionC: "Las aceitunas", opcionD: "El chocolate con nueces", opcionCorrecta: "Un gloss", creadoPor: "salo" }
];

// 🛠️ BACKDOOR: FRASES CÓMICAS DE IMPOSTOR (IMPOSTOR_MESSAGES)
const IMPOSTOR_MESSAGES = [
  "¡Oops! Coquí frunció el ceño: un impostor intentó colarse (-10 pts).",
  "¡Vaya! Esa respuesta sonó sospechosa… Coquí anota -10 pts.",
  "Casi lo logras, pero el candado de Mango y Primavera dice que no (-10 pts).",
  "¡Error! Diomedes y Coquí detectaron una falla en tu memoria (-10 pts).",
  "¡No te rindas! Se restaron 10 pts, prueba con otra pregunta de nuestra historia.",
  "¡Ay! El candado cerró compuertas (-10 pts). Va otra pregunta distinta."
];

// 🛠️ BACKDOOR: LISTA MAESTRA INICIAL DE 33 PLANES (INITIAL_PLANS)
const INITIAL_PLANS = [
  { id: "plan-01", title: "Ver Harry Potter y el Cáliz de Fuego", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🧙‍♂️", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-02", title: "Ver Harry Potter y la Orden del Fénix", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🪄", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-03", title: "Ver Harry Potter y el Misterio del Príncipe", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚡", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-04", title: "Ver Harry Potter y las Reliquias de la Muerte", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🦉", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-05", title: "Ver Django Sin Cadenas", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🤠", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-06", title: "Ver Las muñecas de la mafia", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "📺", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-07", title: "Ver El abogado del diablo", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚖️", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-08", title: "Jugar GTA 6", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋🔋", emoji: "🎮", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-09", title: "Ir a Bárbaro Cocina", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥩", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-10", title: "Ir a El Sause", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍽️", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-11", title: "Ir a comer sándwiches de pastrami", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥪", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-12", title: "Hacer empanadas, buñuelos y natilla", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🥟", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-13", title: "Hacer una torta", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🎂", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-14", title: "Competir por comida (Reto TikTok)", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍔", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: true, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-15", title: "Adivinar comida y objetos (con los ojos vendados)", category: "Gastronomía", weather: "🌧️", energy: "🔋", emoji: "🙈", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: true, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-16", title: "Picnic improvisado", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🧺", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-17", title: "Ir a Calixto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🍹", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-18", title: "Ir a María Mezcal", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🌮", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-19", title: "Ir a La Sala del Despecho", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎤", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-20", title: "Ir a las Fiestas del Retiro", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎉", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-21", title: "Ir al Teatro Victoria", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎭", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-22", title: "Juegos de tomar en casa", category: "Rumbas", weather: "🌧️", energy: "🔋🔋", emoji: "🎲", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-23", title: "Ir a un concierto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎶", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-24", title: "Noche de fonda tradicional", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🐎", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-25", title: "Competencia de tragos (a ver quién aguanta más)", category: "Rumbas", weather: "🌧️", energy: "🔋🔋🔋", emoji: "🥃", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: true, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-26", title: "Volver donde todo empezó (Finca en Guatapé)", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🏡", isVip: true, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-27", title: "Tarde de spa", category: "Relax", weather: "🌧️", energy: "🔋", emoji: "💆", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-28", title: "Salo pasando la tarde con mis papás", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "👨‍👩‍👧", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-29", title: "Yo pasando la tarde con los papás de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "☕", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-30", title: "Tarde todos juntos en familia", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "🫶", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-31", title: "Domingo de jacuzzi", category: "Relax", weather: "☀️", energy: "🔋", emoji: "🫧", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-32", title: "Cumple de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🥳", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-33", title: "Hacer una Novena de Navidad juntos", category: "Relax", weather: "🌧️", energy: "🔋🔋", emoji: "🎄", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", coverUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" }
];

// 🛠️ BACKDOOR: CATÁLOGO INICIAL DE CUPONES CANJEABLES (INITIAL_COUPONS)
const INITIAL_COUPONS = [
  { id: "cup-01", titulo: "Masaje de 30 minutos", descripcion: "Vale por un masaje relajante de 30 minutos, sin afanes y con aceite rico.", costoPuntos: 100, icono: "💆", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-02", titulo: "Elegir la peli de la noche", descripcion: "El que canjea elige la película sin derecho a quejas ni vetos.", costoPuntos: 60, icono: "🎬", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-03", titulo: "Boleto de Escape Social", descripcion: "Permiso oficial para cancelar cualquier salida social sin culpas y quedarnos juntos en nuestro refugio.", costoPuntos: 80, icono: "🎟️", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-04", titulo: "Hibernación en Pijama (Amnistía Doméstica)", descripcion: "Un día entero en pijama sin tender la cama ni hacer oficios, solo mimos y pelis.", costoPuntos: 120, icono: "🛌", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-05", titulo: "Cheat Meal Sin Remordimientos", descripcion: "Pedimos nuestro antojo favorito a domicilio (salchipapa, pizza o postre) a la hora que queramos.", costoPuntos: 90, icono: "🍟", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-06", titulo: "Burbuja de Cero Estrés", descripcion: "Tarde de desconexión total del mundo exterior, celulares en silencio y cero preocupaciones.", costoPuntos: 150, icono: "🫧", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-07", titulo: "El Comodín del \"Tráeme / Pásame\"", descripcion: "Vale por 24 horas en las que el otro trae el agua, el snack o el control sin decir ni una palabra.", costoPuntos: 100, icono: "🛎️", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-08", titulo: "Poder de Veto Presidencial", descripcion: "Autoridad absoluta para vetar una película, restaurante o canción del carro al instante.", costoPuntos: 70, icono: "🛑", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-09", titulo: "Dictadura del Outfit", descripcion: "El ganador elige exactamente qué se pone el otro para la próxima cita especial.", costoPuntos: 150, icono: "👗", estado: "disponible", canjeadoPor: "", fechaCanje: "" },
  { id: "cup-10", titulo: "La Razón Automática", descripcion: "Comodín dorado para ganar automáticamente cualquier debate amistoso de pareja por un día.", costoPuntos: 200, icono: "👑", estado: "disponible", canjeadoPor: "", fechaCanje: "" }
];

// 🛠️ BACKDOOR: SALDOS INICIALES DE PUNTOS Y MOOD (INITIAL_PUNTOS)
const INITIAL_PUNTOS = [
  { usuario: "simon", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "", moodActual: "", ultimaFechaMood: "" },
  { usuario: "salo", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "", moodActual: "", ultimaFechaMood: "" }
];

// 🛠️ BACKDOOR: FRASES INICIALES DE SABIDURÍA (INITIAL_SABIDURIA)
const INITIAL_SABIDURIA = [
  { id: "sab-01", categoria: "Animo", frase: "Los días grises también pasan; y cuando pasen, aquí voy a estar con un palito de mango en la mano.", autor: "Simón", creadoPor: "simon" },
  { id: "sab-02", categoria: "Animo", frase: "No tienes que poder con todo hoy. Respira, que la primavera siempre vuelve.", autor: "Salo", creadoPor: "salo" },
  { id: "sab-03", categoria: "Animo", frase: "Eres más fuerte de lo que tu mal día te quiere hacer creer.", autor: "Simón & Salo", creadoPor: "" },
  { id: "sab-04", categoria: "Charras", frase: "Si la vida te da limones, pide un whisky y ponle Diomedes.", autor: "Simón", creadoPor: "simon" },
  { id: "sab-05", categoria: "Charras", frase: "Yo no me demoro arreglándome, es el tiempo el que pasa muy rápido.", autor: "Salo", creadoPor: "salo" },
  { id: "sab-06", categoria: "Charras", frase: "El guayabo es temporal, las historias de la rumba son para siempre.", autor: "Simón & Salo", creadoPor: "" },
  { id: "sab-07", categoria: "Idolos", frase: "La felicidad se puede hallar hasta en los momentos más oscuros, si somos capaces de usar bien la luz.", autor: "Albus Dumbledore", creadoPor: "" },
  { id: "sab-08", categoria: "Idolos", frase: "Pies, ¿para qué los quiero si tengo alas para volar?", autor: "Frida Kahlo", creadoPor: "" },
  { id: "sab-09", categoria: "Idolos", frase: "Las palabras son, en mi no tan humilde opinión, nuestra más inagotable fuente de magia.", autor: "Albus Dumbledore", creadoPor: "" }
];

// 🛠️ BACKDOOR: REPARTO OFICIAL INICIAL (INITIAL_PERSONAJES)
const INITIAL_PERSONAJES = [
  { id: "pj-simon", nombre: "Simón", tipo: "protagonista", rol: "Palito de Mango 🥭 · El Ingeniero Mecatrónico", superpoder: "Arreglar cualquier cosa y armar el plan perfecto", debilidad: "Un whisky en una noche muy buena con un vallenato de Diomedes", photoUrl: "", planesVinculados: [] },
  { id: "pj-salo", nombre: "Salomé", tipo: "protagonista", rol: "Primavera 🌸🩵 · La Futura Doctora", superpoder: "Iluminar cualquier día gris con una sonrisa", debilidad: "Un gloss nuevo y una buena salchipapa", photoUrl: "", planesVinculados: [] },
  { id: "pj-papas-simon", nombre: "Los papás de Simón", tipo: "secundario", rol: "Los suegros consentidores", superpoder: "Recibir con los brazos abiertos (y con comida)", debilidad: "Contar las historias vergonzosas de la infancia", photoUrl: "", planesVinculados: ["plan-28", "plan-30"] },
  { id: "pj-papas-salo", nombre: "Los papás de Salo", tipo: "secundario", rol: "Los guardianes de Primavera", superpoder: "Hacer sentir en casa a cualquiera", debilidad: "Querer enterarse de todos los planes", photoUrl: "", planesVinculados: ["plan-29", "plan-30", "plan-32"] },
  { id: "pj-parche", nombre: "El parche de la rumba", tipo: "secundario", rol: "Los cómplices de las noches épicas", superpoder: "Convertir cualquier salida en una historia", debilidad: "El clásico \"¡una más y nos vamos!\"", photoUrl: "", planesVinculados: ["plan-17", "plan-18", "plan-19", "plan-22", "plan-25"] }
];

// 🛠️ BACKDOOR: FOTOS INICIALES DEL MURAL (INITIAL_MURAL)
const INITIAL_MURAL = [
  { id: "mural-01", caption: "Guatapé: donde empezó toda esta historia 🥭", createdAt: "10 de Septiembre, 2022", mediaType: "image", posterUrl: "", creadoPor: "", isFavorite: true, photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320'><defs><linearGradient id='m1' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23FFCC80'/><stop offset='60%25' stop-color='%23F8BBD0'/><stop offset='100%25' stop-color='%23FFFDF9'/></linearGradient></defs><rect width='400' height='320' fill='url(%23m1)'/><circle cx='310' cy='76' r='34' fill='%23FFB347'/><path d='M0 220 Q100 165 200 210 T400 205 L400 320 L0 320 Z' fill='%23A5D6A7'/><path d='M140 220 C150 115 178 84 206 84 C234 84 258 122 266 220 Z' fill='%2381C784'/><rect y='225' width='400' height='95' fill='%2381D4FA' opacity='0.75'/><path d='M155 252 L245 252 L228 268 L172 268 Z' fill='%23FF8A80'/><text x='200' y='298' font-family='Georgia,serif' font-size='18' font-weight='bold' text-anchor='middle' fill='%232D231E'>Guatapé · Simón &amp; Salomé</text></svg>" },
  { id: "mural-02", caption: "Nuestro refugio de Mango y Primavera 🌸", createdAt: "10 de Septiembre, 2025", mediaType: "image", posterUrl: "", creadoPor: "", isFavorite: false, photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 400'><defs><linearGradient id='m2' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23E1F5FE'/><stop offset='55%25' stop-color='%23FFFDF9'/><stop offset='100%25' stop-color='%23FFCC80'/></linearGradient></defs><rect width='320' height='400' fill='url(%23m2)'/><circle cx='70' cy='80' r='32' fill='%2381D4FA' opacity='0.55'/><circle cx='252' cy='320' r='38' fill='%23A5D6A7' opacity='0.55'/><path d='M160 150 C140 120 96 126 96 164 C96 202 160 244 160 244 C160 244 224 202 224 164 C224 126 180 120 160 150 Z' fill='%23FF8A80'/><circle cx='160' cy='180' r='16' fill='%23FFB347'/><text x='160' y='310' font-family='Georgia,serif' font-size='19' font-weight='bold' text-anchor='middle' fill='%232D231E'>Tú y Yo 🥭🌸</text></svg>" }
];

// 🛠️ BACKDOOR: CATÁLOGO DE MOODS DEL DÍA Y RESPALDOS LOCALES DE DOBBY / PROTOCOLO CINE
const MOOD_CATALOG = {
  "😍": { emoji: "😍", label: "Enamorado/a y radiante", low: false },
  "😊": { emoji: "😊", label: "Feliz y tranquilo/a", low: false },
  "🥱": { emoji: "🥱", label: "Con sueñito / cansado/a", low: false },
  "🥺": { emoji: "🥺", label: "Necesito mimos urgentes", low: true },
  "🌧️": { emoji: "🌧️", label: "Día pesado, abrázame", low: true }
};

const LOCAL_AI_FALLBACKS = {
  prizes: [
    { titulo: "Vale por DJ Absoluto en el Carro", descripcion: "Control total de la playlist en el próximo viaje largo, incluyendo repetir vallenatos o himnos favoritos.", costoPuntos: 75, icono: "🎶" },
    { titulo: "Noche de Domicilio + Cero Platos", descripcion: "El que canjea pide su comida favorita (salchipapa, punta de anca o pizza) y queda exonerado de recoger.", costoPuntos: 95, icono: "🍕" },
    { titulo: "Desayuno Consentido en la Cama", descripcion: "Mañana sin alarmas con cafecito rico, fruta y mimos servidos en la cama por tu pareja.", costoPuntos: 110, icono: "🥐" }
  ],
  plans: [
    { title: "Mirador al atardecer con mecato y playlist", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "🌅", isReto: false },
    { title: "Noche de cócteles caseros: Vino vs Whisky", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🍷", isReto: true },
    { title: "Maratón de pelis con cobija y cata de postres", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🍿", isReto: false }
  ],
  quotes: [
    { frase: "No importa qué tan ruidoso esté el mundo afuera: cuando estamos juntos, siempre es primavera y sabe a mango.", autor: "Dobby 🧦✨", categoria: "Animo" },
    { frase: "Que nunca nos falte un viaje pendiente, un vallenato a todo pulmón y tu risa cerrando el día.", autor: "Simón & Salo", categoria: "Animo" }
  ],
  scheduled_msgs: [
    { texto: "🧦✨ Pasaba por aquí para recordarte que eres mi lugar favorito en el mundo y que hoy vas a brillar muchísimo 🥭🌸" },
    { texto: "💌 Pausa oficial de 10 segundos: respira hondo, sonríe y acuérdate de cuánto te pienso hoy." }
  ],
  movies: [
    { title: "Cuestión de Tiempo (About Time)", year: "2013", type: "Película", duration: "2h 03m", platform: "Alquiler / Streaming", rating: "8.0", synopsis: "Un joven descubre que puede viajar en el tiempo y decide usarlo para construir y agradecer cada instante junto al amor de su vida.", whyForUs: "Ideal para abrazarse bajo cobija y recordar por qué cada detalle cotidiano vale oro.", emoji: "⏳" },
    { title: "Knives Out (Entre Navajas y Secretos)", year: "2019", type: "Película", duration: "2h 10m", platform: "Netflix / Prime Video", rating: "7.9", synopsis: "Un detective brillante investiga el misterioso caso de una excéntrica familia donde todos tienen un motivo oculto.", whyForUs: "Perfecta para competir adivinando quién fue el culpable antes del giro final.", emoji: "🕵️‍♂️" },
    { title: "One Day (Siempre el mismo día)", year: "2024", type: "Miniserie", duration: "14 eps · 30m", platform: "Netflix", rating: "8.1", synopsis: "Dos personas que se cruzan una noche inolvidable siguen reencontrándose el mismo día de cada año mientras sus vidas cambian.", whyForUs: "Tiene esa magia de dos caminos que se necesitaban sin saberlo.", emoji: "🌸" }
  ]
};

const VIDEO_POSTER_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='vp' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23E1F5FE'/><stop offset='55%25' stop-color='%23FFCC80'/><stop offset='100%25' stop-color='%23F8BBD0'/></linearGradient></defs><rect width='400' height='300' fill='url(%23vp)'/><text x='200' y='265' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle' fill='%232D231E'>Video · Toca para reproducir</text></svg>";
const MESES_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const SABIDURIA_LABELS = { Animo: "💛 Para levantar el ánimo", Charras: "😂 Frases charras de los dos", Idolos: "🌟 De nuestros ídolos" };

/* ==========================================================================
   1. ESTADO EN RAM, HELPERS TRANSVERSALES Y CAPA DE STORAGE / API V4
   ========================================================================== */

let lastTriviaId = "", currentTrivia = null, isRuletaRolling = false, isSyncing = false;
let currentRuletaPool = [], currentWinnerPlanId = null;
let editingPlanId = null, pendingPlanMedia = null, pendingPlanCover = null, pendingMuralMedia = null, pendingActorPhoto = null;
let pendingPlanSong = null, pendingMuralSong = null;
let currentLightboxItemId = null, currentLightboxItem = null;
let lastFortuneId = "", lastWelcomeQuoteId = "";
let oneSignalInitialized = false;
let muralActiveFilter = "todos", muralVisibleCount = APP_CONFIG.MURAL_PAGE_SIZE;
let dobbyActiveTask = "chat";
// Historial de Dobby exclusivamente en RAM de sesión (jamás persiste en Sheets ni localStorage)
const dobbySessionHistory = [];
const lastRawVideoFiles = { mural: null, plan: null };
let mp4MuxerModulePromise = null;
let countdownIntervalId = null, lastCelebratedEncuentroKey = "";
let lightboxAudioProgressRaf = null;
const displayedScores = { "score-simon": null, "score-salo": null, "premios-score-simon": null, "premios-score-salo": null };

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const setText = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const escapeHtml = v => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const normText = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const getStored = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const setStored = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn("Storage lleno/error:", e); } };
const hasCloud = () => { const u = String(APP_CONFIG.GAS_WEB_APP_URL || "").trim(); return Boolean(u && !u.includes("PEGA_AQUI") && /^https?:\/\//i.test(u)); };
const isOneSignalConfigured = () => { const id = String(APP_CONFIG.ONESIGNAL_APP_ID || "").trim(); return Boolean(id && !id.startsWith("TU_")); };

/** Fecha local actual en formato YYYY-MM-DD (sin horas). */
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Formatea cualquier fecha a texto elegante en español SIN horas ni minutos.
 * Ej: "2026-11-18" -> "18 de Noviembre, 2026".
 */
function formatCleanDate(val) {
  if (!val) return "";
  const raw = String(val).trim();
  if (!raw) return "";
  if (/^\d{1,2}\s+de\s+[A-Za-zÁÉÍÓÚáéíóú]+,\s+\d{4}$/.test(raw)) return raw;
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const y = Number(isoMatch[1]), m = Number(isoMatch[2]) - 1, d = Number(isoMatch[3]);
    if (m >= 0 && m < 12 && d >= 1 && d <= 31) return `${d} de ${MESES_ES[m]}, ${y}`;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getDate()} de ${MESES_ES[parsed.getMonth()]}, ${parsed.getFullYear()}`;
  }
  return raw.replace(/\s*\d{1,2}:\d{2}(:\d{2})?.*$/, "").trim();
}

/** Normaliza fecha a YYYY-MM-DD para inputs <input type="date"> y comparaciones. */
function toIsoDate(val) {
  if (!val) return "";
  const raw = String(val).trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }
  return "";
}

/** Copia texto al portapapeles con fallback compatible iOS Safari. */
async function copyTextToClipboard(text) {
  const str = String(text || "").trim();
  if (!str) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = str;
    ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return Boolean(ok);
  } catch {
    return false;
  }
}

/** Anima numéricamente un cambio de puntaje con interpolación suave GPU-friendly. */
function animateScoreElement(id, targetValue) {
  const el = $(id);
  if (!el) return;
  const toVal = Math.max(0, Math.round(Number(targetValue) || 0));
  const prevVal = displayedScores[id];
  displayedScores[id] = toVal;

  if (prevVal === null || prevVal === toVal || reducedMotion()) {
    el.textContent = String(toVal);
    return;
  }

  const fromVal = prevVal;
  const delta = toVal - fromVal;
  const duration = 620;
  const startTs = performance.now();
  el.classList.remove("is-score-up", "is-score-down");
  void el.offsetWidth;
  el.classList.add(delta > 0 ? "is-score-up" : "is-score-down");

  const step = now => {
    const t = Math.min(1, (now - startTs) / duration);
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = String(Math.round(fromVal + delta * eased));
    if (t < 1) requestAnimationFrame(step);
    else {
      el.textContent = String(toVal);
      setTimeout(() => el.classList.remove("is-score-up", "is-score-down"), 350);
    }
  };
  requestAnimationFrame(step);
}

/** Determina si un plan secreto sigue bloqueado para el usuario actual. */
function isPlanLocked(plan, currentUser) {
  if (!plan) return false;
  if (plan.isMasked || plan.isLocked) return true;
  if (!plan.isSecreto) return false;
  const unlockIso = toIsoDate(plan.fechaDesbloqueo);
  if (!unlockIso || todayLocal() >= unlockIso) return false;
  if (currentUser && plan.creadoPor && plan.creadoPor === currentUser) return false;
  return true;
}

/** Normaliza metadatos musicales tipo Historia de IG (`song*`). */
function normalizeSongFields(obj = {}, fallback = {}) {
  const songTrackId = String(obj.songTrackId ?? fallback.songTrackId ?? "").trim();
  const songTitle = String(obj.songTitle ?? fallback.songTitle ?? "").trim();
  const songArtist = String(obj.songArtist ?? fallback.songArtist ?? "").trim();
  const songArtwork = String(obj.songArtwork ?? fallback.songArtwork ?? "").trim();
  const songPreviewUrl = String(obj.songPreviewUrl ?? fallback.songPreviewUrl ?? "").trim();
  const defaultSpotify = (songTitle || songArtist)
    ? `https://open.spotify.com/search/${encodeURIComponent(`${songTitle} ${songArtist}`.trim())}`
    : "";
  const songSpotifyUrl = String(obj.songSpotifyUrl ?? fallback.songSpotifyUrl ?? defaultSpotify).trim();
  return { songTrackId, songTitle, songArtist, songArtwork, songPreviewUrl, songSpotifyUrl };
}

/** Normalizadores de colecciones en localStorage (offline-first V4). */
function normalizePlan(p, fallback = {}) {
  const isSecreto = Boolean(p.isSecreto ?? fallback.isSecreto);
  const song = normalizeSongFields(p, fallback);
  return {
    id: String(p.id || fallback.id || `plan-${Date.now()}`),
    title: String(p.title ?? fallback.title ?? "Plan"),
    category: String(p.category || fallback.category || "Relax"),
    weather: String(p.weather || fallback.weather || "☀️"),
    energy: String(p.energy || fallback.energy || "🔋🔋"),
    emoji: String(p.emoji || fallback.emoji || "✨"),
    isVip: Boolean(p.isVip ?? fallback.isVip),
    completed: Boolean(p.completed ?? fallback.completed),
    anecdote: String(p.anecdote ?? fallback.anecdote ?? ""),
    photoUrl: String(p.photoUrl ?? fallback.photoUrl ?? ""),
    updatedAt: formatCleanDate(p.updatedAt ?? fallback.updatedAt ?? ""),
    mediaType: String(p.mediaType ?? fallback.mediaType ?? (p.photoUrl ? "image" : "")),
    posterUrl: String(p.posterUrl ?? fallback.posterUrl ?? ""),
    coverUrl: String(p.coverUrl ?? fallback.coverUrl ?? ""),
    isReto: Boolean(p.isReto ?? fallback.isReto),
    ganadorReto: String(p.ganadorReto ?? fallback.ganadorReto ?? ""),
    isSecreto,
    fechaDesbloqueo: toIsoDate(p.fechaDesbloqueo ?? fallback.fechaDesbloqueo ?? ""),
    creadoPor: String(p.creadoPor ?? fallback.creadoPor ?? ""),
    isMasked: Boolean(p.isMasked),
    ...song
  };
}

function getPlans() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.PLANS, null);
  if (!Array.isArray(stored) || stored.length === 0) return INITIAL_PLANS.map(p => normalizePlan(p));
  return stored.filter(p => p && p.id).map(p => normalizePlan(p));
}
const savePlans = list => setStored(APP_CONFIG.STORAGE_KEYS.PLANS, list);

function normalizeMuralItem(m, fallback = {}) {
  const song = normalizeSongFields(m, fallback);
  const favRaw = m.isFavorite ?? fallback.isFavorite;
  return {
    id: String(m.id || fallback.id || `mural-${Date.now()}`),
    caption: String(m.caption ?? fallback.caption ?? ""),
    photoUrl: String(m.photoUrl ?? fallback.photoUrl ?? ""),
    createdAt: formatCleanDate(m.createdAt ?? fallback.createdAt ?? ""),
    mediaType: (m.mediaType ?? fallback.mediaType) === "video" ? "video" : "image",
    posterUrl: String(m.posterUrl ?? fallback.posterUrl ?? ""),
    creadoPor: String(m.creadoPor ?? fallback.creadoPor ?? ""),
    isFavorite: favRaw === true || favRaw === "true" || favRaw === "TRUE" || favRaw === 1,
    blobUrl: String(m.blobUrl ?? fallback.blobUrl ?? ""),
    ...song
  };
}

function getMural() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.MURAL, null);
  const src = Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_MURAL;
  return src.filter(m => m && m.id).map(m => normalizeMuralItem(m));
}
const saveMural = list => setStored(APP_CONFIG.STORAGE_KEYS.MURAL, list);

function getCupones() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.CUPONES, null);
  const src = Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_COUPONS;
  return src.filter(c => c && c.id).map(c => ({
    id: String(c.id),
    titulo: String(c.titulo || ""),
    descripcion: String(c.descripcion || ""),
    costoPuntos: Math.max(0, Number(c.costoPuntos) || 0),
    icono: String(c.icono || "🎟️"),
    estado: ["disponible", "canjeado", "cumplido"].includes(c.estado) ? c.estado : "disponible",
    canjeadoPor: String(c.canjeadoPor || ""),
    fechaCanje: formatCleanDate(c.fechaCanje || "")
  }));
}
const saveCupones = list => setStored(APP_CONFIG.STORAGE_KEYS.CUPONES, list);

function getPuntos() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.PUNTOS, null);
  const base = {
    simon: { usuario: "simon", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "", moodActual: "", ultimaFechaMood: "" },
    salo: { usuario: "salo", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "", moodActual: "", ultimaFechaMood: "" }
  };
  if (Array.isArray(stored)) {
    stored.forEach(row => {
      const u = row?.usuario;
      if (u === "simon" || u === "salo") {
        base[u] = {
          usuario: u,
          puntosTotales: Math.max(0, Number(row.puntosTotales) || 0),
          preguntasRespondidasHoy: Math.max(0, Number(row.preguntasRespondidasHoy) || 0),
          ultimaFechaTrivia: toIsoDate(row.ultimaFechaTrivia || ""),
          moodActual: String(row.moodActual || ""),
          ultimaFechaMood: toIsoDate(row.ultimaFechaMood || "")
        };
      }
    });
  }
  return [base.simon, base.salo];
}
const savePuntos = list => setStored(APP_CONFIG.STORAGE_KEYS.PUNTOS, list);

function getUserPuntos(usuario) {
  const list = getPuntos();
  return list.find(p => p.usuario === usuario) || { usuario, puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "", moodActual: "", ultimaFechaMood: "" };
}

function getSabiduria() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.SABIDURIA, null);
  const src = Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_SABIDURIA;
  return src.filter(s => s && s.id).map(s => ({
    id: String(s.id),
    categoria: ["Animo", "Charras", "Idolos"].includes(s.categoria) ? s.categoria : "Animo",
    frase: String(s.frase || ""),
    autor: String(s.autor || ""),
    creadoPor: String(s.creadoPor || "")
  }));
}
const saveSabiduria = list => setStored(APP_CONFIG.STORAGE_KEYS.SABIDURIA, list);

function normalizePregunta(q) {
  const opts = Array.isArray(q.opciones) && q.opciones.length > 0
    ? q.opciones.filter(Boolean)
    : [q.opcionA, q.opcionB, q.opcionC, q.opcionD].map(v => String(v || "").trim()).filter(Boolean);
  const rawCorrect = String(q.opcionCorrecta || "").trim();
  const letterMap = { A: q.opcionA, B: q.opcionB, C: q.opcionC, D: q.opcionD };
  let correctList = Array.isArray(q.respuestasCorrectas) && q.respuestasCorrectas.length > 0
    ? q.respuestasCorrectas.map(v => String(v || "").trim()).filter(Boolean)
    : rawCorrect.split(/[|;]/).map(s => s.trim()).filter(Boolean).map(tok => {
        const up = tok.toUpperCase();
        return (letterMap[up] && String(letterMap[up]).trim()) ? String(letterMap[up]).trim() : tok;
      });
  if (correctList.length === 0 && opts[0]) correctList = [opts[0]];
  return {
    id: String(q.id || `preg-${Date.now()}`),
    paraUsuario: ["simon", "salo", "ambos"].includes(q.paraUsuario) ? q.paraUsuario : "ambos",
    pregunta: String(q.pregunta || q.question || ""),
    opcionA: String(q.opcionA || opts[0] || ""),
    opcionB: String(q.opcionB || opts[1] || ""),
    opcionC: String(q.opcionC || opts[2] || ""),
    opcionD: String(q.opcionD || opts[3] || ""),
    opcionCorrecta: rawCorrect || correctList.join(" | "),
    creadoPor: String(q.creadoPor || ""),
    opciones: opts,
    respuestasCorrectas: correctList
  };
}

function getPreguntas() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.PREGUNTAS, null);
  const src = Array.isArray(stored) && stored.length > 0 ? stored : TRIVIA_BANK;
  return src.filter(q => q && (q.pregunta || q.question)).map(normalizePregunta);
}
const savePreguntas = list => setStored(APP_CONFIG.STORAGE_KEYS.PREGUNTAS, list);

function getPersonajes() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.PERSONAJES, null);
  const src = Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_PERSONAJES;
  return src.filter(p => p && p.id).map(p => {
    let linked = [];
    if (Array.isArray(p.planesVinculados)) linked = p.planesVinculados.map(String);
    else if (typeof p.planesVinculados === "string" && p.planesVinculados.trim()) {
      try { const parsed = JSON.parse(p.planesVinculados); if (Array.isArray(parsed)) linked = parsed.map(String); } catch { linked = []; }
    }
    return {
      id: String(p.id),
      nombre: String(p.nombre || ""),
      tipo: p.tipo === "protagonista" ? "protagonista" : "secundario",
      rol: String(p.rol || ""),
      superpoder: String(p.superpoder || ""),
      debilidad: String(p.debilidad || ""),
      photoUrl: String(p.photoUrl || ""),
      planesVinculados: linked
    };
  });
}
const savePersonajes = list => setStored(APP_CONFIG.STORAGE_KEYS.PERSONAJES, list);

/** Normaliza Frases Dedicadas aceptando variantes de nombres de columna entre cliente y GAS. */
function normalizeDedicatedQuote(d) {
  if (!d) return null;
  const durRaw = String(d.duracion || d.modoDuracion || d.duration || d.modo || "once").toLowerCase();
  const delivRaw = d.entregada ?? d.delivered ?? (d.estado === "entregada");
  const rawFechaActiva = String(d.fechaActiva || "").trim();
  const activeRaw = rawFechaActiva === "1970-01-01"
    ? false
    : (d.isActive ?? d.activa ?? d.active ?? (d.estado !== "eliminada" && d.estado !== "inactiva"));
  return {
    id: String(d.id || `ded-${Date.now()}`),
    deUsuario: String(d.deUsuario || d.fromUser || d.creadoPor || d.from || ""),
    paraUsuario: String(d.paraUsuario || d.toUser || d.to || ""),
    frase: String(d.frase || d.quote || d.texto || d.text || "").trim(),
    autor: String(d.autor || d.author || "").trim(),
    duracion: durRaw === "today" ? "today" : "once",
    fechaCreacion: toIsoDate(d.fechaActiva || d.fechaCreacion || d.fecha || d.createdAt || todayLocal()) || todayLocal(),
    entregada: delivRaw === true || delivRaw === "true" || delivRaw === "TRUE",
    activa: activeRaw !== false && activeRaw !== "false" && activeRaw !== "FALSE"
  };
}

function getFrasesDedicadas() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.DEDICATED_QUOTES, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(normalizeDedicatedQuote).filter(item => item && item.frase);
}
const saveFrasesDedicadas = list => setStored(APP_CONFIG.STORAGE_KEYS.DEDICATED_QUOTES, list);

/** Obtiene la Frase Dedicada vigente para el usuario receptor actual (si existe). */
function getActiveDedicatedQuoteForUser(user) {
  if (!user) return null;
  const today = todayLocal();
  const list = getFrasesDedicadas().filter(q => q.activa && (q.paraUsuario === user || q.paraUsuario === "ambos"));
  for (let i = list.length - 1; i >= 0; i--) {
    const q = list[i];
    if (q.duracion === "once" && !q.entregada) return q;
    if (q.duracion === "today" && q.fechaCreacion === today) return q;
  }
  return null;
}

/** Normaliza Mensajes Programados (Push diferidos). */
function normalizeScheduledMsg(m) {
  if (!m) return null;
  const sentRaw = m.enviado ?? m.sent ?? (m.estado === "enviado" || m.status === "sent");
  const repCand = m.repetir || m.repeticion || m.repeat || "none";
  return {
    id: String(m.id || `sch-${Date.now()}`),
    deUsuario: String(m.deUsuario || m.creadoPor || m.from || ""),
    paraUsuario: String(m.paraUsuario || m.to || ""),
    mensaje: String(m.mensaje || m.message || m.texto || "").trim(),
    fechaHora: String(m.fechaHora || m.fechaHoraProgramada || m.scheduledAt || m.datetime || m.fechaProgramada || m.sendAt || "").trim(),
    repetir: ["none", "daily", "weekly"].includes(repCand) ? repCand : "none",
    enviado: sentRaw === true || sentRaw === "true" || sentRaw === "TRUE",
    estado: String(m.estado || m.status || (sentRaw ? "enviado" : "pendiente"))
  };
}

function getMensajesProgramados() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.SCHEDULED_MSGS, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(normalizeScheduledMsg).filter(item => item && item.mensaje);
}
const saveMensajesProgramados = list => setStored(APP_CONFIG.STORAGE_KEYS.SCHEDULED_MSGS, list);

/** Normaliza Configuración global (acepta mapa objeto o tabla `{clave, valor}`). */
function normalizeConfiguracion(raw) {
  const base = { proximoEncuentroFecha: "", proximoEncuentroNota: "" };
  if (!raw) return base;
  if (Array.isArray(raw)) {
    raw.forEach(r => {
      const k = String(r?.clave || r?.key || "").trim();
      if (k) base[k] = String(r?.valor ?? r?.value ?? "");
    });
  } else if (typeof raw === "object") {
    Object.keys(raw).forEach(k => { base[k] = String(raw[k] ?? ""); });
  }
  return base;
}

function getConfiguracion() {
  return normalizeConfiguracion(getStored(APP_CONFIG.STORAGE_KEYS.CONFIGURACION, null));
}
const saveConfiguracion = cfg => setStored(APP_CONFIG.STORAGE_KEYS.CONFIGURACION, normalizeConfiguracion(cfg));

/**
 * Envía petición POST a Google Apps Script con `text/plain;charset=utf-8`
 * para sortear el preflight CORS. Devuelve la respuesta JSON o `null` si falla.
 */
async function postToBackend(action, payload, { okMsg = "", offlineMsg = "", silent = false, onSuccess = null, onError = null } = {}) {
  if (!hasCloud()) {
    if (!silent && offlineMsg) showToast(offlineMsg, "success");
    return null;
  }
  try {
    const resp = await fetch(APP_CONFIG.GAS_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload })
    });
    const res = await resp.json();
    if (res?.status === "error") {
      if (onError) onError(res);
      if (!silent) showToast(res.message || "Error al sincronizar con la nube.", "error");
      return res;
    }
    if (onSuccess) onSuccess(res);
    if (!silent && okMsg) showToast(okMsg, "success");
    return res;
  } catch (err) {
    console.warn(`Error cloud (${action}):`, err);
    if (!silent) showToast(offlineMsg || "Guardado localmente (pendiente de nube) 💾", "info");
    return null;
  }
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

/* ==========================================================================
   2. TEMA CREPUSCULAR, MASCOTA 3D COQUÍ, BADGING API Y BANNER PERSISTENTE
   ========================================================================== */

function getStoredTheme() {
  const t = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
  if (t === "dark" || t === "light") return t;
  return "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  if (isDark) document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  try { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, isDark ? "dark" : "light"); } catch {}

  const btn = $("btn-theme-toggle");
  if (btn) {
    btn.textContent = isDark ? "☀️" : "🌙";
    btn.setAttribute("aria-label", isDark ? "Cambiar a modo día" : "Cambiar a modo crepuscular");
    btn.setAttribute("title", isDark ? "Modo día" : "Modo crepuscular");
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", isDark ? "#0B121D" : "#FFB347");
}

function setupThemeToggle() {
  applyTheme(getStoredTheme());
  $("btn-theme-toggle")?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    showToast(next === "dark" ? "🌙 Modo Crepuscular activado" : "☀️ Modo Día Mango & Primavera", "info");
  });
}

// Aplicar tema inmediatamente antes del primer render para evitar destellos
applyTheme(getStoredTheme());

/** Cambia la pose de Coquí (`happy|magic|grumpy|celebrate`) y dispara brinco/chispas opcionales. */
function setCoquiPose(pose = "happy", { jump = false, sparks = false, target = "both" } = {}) {
  const src = APP_CONFIG.MASCOT_ASSETS[pose] || APP_CONFIG.MASCOT_ASSETS.happy;
  if (target === "lock" || target === "both") {
    const img = $("coqui-img");
    if (img && img.getAttribute("src") !== src) img.src = src;
  }
  if (target === "welcome" || target === "both") {
    const wImg = $("coqui-welcome-img");
    if (wImg && wImg.getAttribute("src") !== src) wImg.src = src;
  }
  if (jump || sparks) triggerCoquiJumpAndSparks({ jump, sparks });
}

/** Dispara el salto elástico `.is-jumping` y genera partículas `.coqui-spark` en GPU. */
function triggerCoquiJumpAndSparks({ jump = true, sparks = true } = {}) {
  const mascot = $("coqui-mascot");
  if (jump && mascot && !reducedMotion()) {
    mascot.classList.remove("is-jumping");
    void mascot.offsetWidth;
    mascot.classList.add("is-jumping");
    setTimeout(() => mascot.classList.remove("is-jumping"), 800);
  }
  const sparksBox = $("coqui-sparks");
  if (sparks && sparksBox && !reducedMotion()) {
    sparksBox.innerHTML = "";
    const sparkColors = ["#FFB347", "#81D4FA", "#FF8A80", "#A5D6A7", "#FFF59D", "#F8BBD0"];
    for (let i = 0; i < 8; i++) {
      const sp = document.createElement("span");
      sp.className = "coqui-spark";
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() * 0.35 - 0.17);
      const dist = 34 + Math.round(Math.random() * 28);
      sp.style.setProperty("--tx", `${Math.round(Math.cos(angle) * dist)}px`);
      sp.style.setProperty("--ty", `${Math.round(Math.sin(angle) * dist - 10)}px`);
      sp.style.setProperty("--spark-color", sparkColors[i % sparkColors.length]);
      sparksBox.appendChild(sp);
    }
    setTimeout(() => { if (sparksBox) sparksBox.innerHTML = ""; }, 900);
  }
}

function setupCoquiMascot() {
  const mascot = $("coqui-mascot");
  const coquiQuotes = [
    "🐸✨ ¡Coquí-coquí! Bienvenidos al refugio.",
    "🥭🌸 ¡Pista mágica: responde con el corazón!",
    "🪄✨ Coquí cuida todos sus secretos."
  ];
  mascot?.addEventListener("click", () => {
    if (navigator.vibrate) { try { navigator.vibrate(25); } catch {} }
    triggerCoquiJumpAndSparks({ jump: true, sparks: true });
    showToast(coquiQuotes[Math.floor(Math.random() * coquiQuotes.length)], "info");
  });
}

/** Anexo A — Badging API en ícono de Pantalla de Inicio (iOS 16.4+ / Android PWA). */
async function setAppBadgeCount(count) {
  const safe = Math.max(0, Math.round(Number(count) || 0));
  setStored(APP_CONFIG.STORAGE_KEYS.BADGE_COUNT, safe);
  try {
    if (safe > 0 && typeof navigator.setAppBadge === "function") {
      await navigator.setAppBadge(safe);
    } else if (safe === 0 && typeof navigator.clearAppBadge === "function") {
      await navigator.clearAppBadge();
    }
  } catch {}
}

function incrementAppBadge(delta = 1) {
  const curr = Number(getStored(APP_CONFIG.STORAGE_KEYS.BADGE_COUNT, 0)) || 0;
  setAppBadgeCount(curr + Math.max(1, delta));
}

function clearAppBadgeCount() {
  setAppBadgeCount(0);
}

/** Anexo A — Banner Persistente de Toque ("Pensando en ti") con respuesta en 1 toque. */
function getIncomingTouch() {
  return getStored(APP_CONFIG.STORAGE_KEYS.INCOMING_TOUCH, null);
}

function setIncomingTouch(touchObj) {
  setStored(APP_CONFIG.STORAGE_KEYS.INCOMING_TOUCH, touchObj);
  renderPersistentTouchBanner();
}

function renderPersistentTouchBanner() {
  const touch = getIncomingTouch();
  const user = getCurrentUser();
  const banner = $("banner-persistent-touch");
  const btnThink = $("btn-thinking-of-you");
  const header = $("app-header");

  const isActive = Boolean(touch && touch.from && (!user || touch.from !== user));
  btnThink?.classList.toggle("has-incoming-touch", isActive);
  header?.classList.toggle("has-incoming-touch", isActive);

  if (!banner) return;
  if (!isActive) {
    banner.classList.add("is-hidden");
    return;
  }
  const sender = getUserMeta(touch.from);
  const label = touch.message || `${sender ? `${sender.emoji} ${sender.shortName}` : "Tu pareja"} te mandó un toque: está pensando en ti 💛`;
  setText("persistent-touch-text", label);
  banner.classList.remove("is-hidden");
}

function setupPersistentTouchBanner() {
  renderPersistentTouchBanner();

  $("btn-reply-touch")?.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) {
      $("identity-modal")?.classList.add("is-open");
      return;
    }
    const partner = getUserMeta(getPartnerUser(user));
    setIncomingTouch(null);
    clearAppBadgeCount();
    if (navigator.vibrate) { try { navigator.vibrate([45, 50, 65]); } catch {} }

    await postToBackend("sendThinkingPush", { usuario: user, isReply: true }, {
      okMsg: `💖 ¡Toque devuelto a ${partner?.shortName || "tu pareja"} al instante!`,
      offlineMsg: `💖 ¡Toque de vuelta guardado para ${partner?.shortName || "tu pareja"}!`
    });
  });

  $("btn-dismiss-touch")?.addEventListener("click", () => {
    setIncomingTouch(null);
    clearAppBadgeCount();
  });
}

/* ==========================================================================
   3. IDENTIDAD (SIMÓN / SALO), ONESIGNAL V16 Y CANDADO INSTANTÁNEO
   ========================================================================== */

function getCurrentUser() {
  const val = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.IDENTITY);
  return (val === "simon" || val === "salo") ? val : "";
}

function getPartnerUser(user = getCurrentUser()) {
  if (user === "simon") return "salo";
  if (user === "salo") return "simon";
  return "";
}

function getUserMeta(user) {
  return APP_IDENTITY.USERS[user] || null;
}

function applyAppIdentity() {
  document.title = APP_IDENTITY.NAME;
  setText("app-header-title", APP_IDENTITY.NAME);
  setText("app-header-subtitle", APP_IDENTITY.SUBTITLE);
}

function renderIdentityUI() {
  const user = getCurrentUser();
  const meta = getUserMeta(user);
  const pill = $("user-identity-pill");

  if (pill) {
    pill.classList.remove("is-simon", "is-salo", "is-unknown");
    if (meta) {
      pill.classList.add(`is-${meta.id}`);
      setText("user-identity-emoji", meta.emoji);
      setText("user-identity-name", meta.shortName);
    } else {
      pill.classList.add("is-unknown");
      setText("user-identity-emoji", "👤");
      setText("user-identity-name", "Sin identificar");
    }
  }

  $("settings-identity-simon")?.classList.toggle("is-active", user === "simon");
  $("settings-identity-salo")?.classList.toggle("is-active", user === "salo");
  setText("settings-identity-current", meta
    ? `Este teléfono está configurado como ${meta.emoji} ${meta.name} (${meta.alias}).`
    : "Aún no has elegido quién eres.");

  const partner = getUserMeta(getPartnerUser(user));
  const partnerLabel = partner ? partner.shortName : "mi pareja";
  setText("trampa-partner-name", partnerLabel);
  setText("dedicated-partner-name", partnerLabel);
  renderPersistentTouchBanner();
}

function setCurrentUser(user, { triggerSync = true } = {}) {
  if (user !== "simon" && user !== "salo") return;
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.IDENTITY, user);
  renderIdentityUI();
  loginOneSignalUser(user);
  renderAllViews();
  renderTrampaList();
  renderDedicatedQuotePanel();
  renderScheduledMessagesList();
  const meta = getUserMeta(user);
  showToast(`¡Hola, ${meta.emoji} ${meta.shortName}! Identidad guardada.`, "success");
  if (triggerSync) syncWithBackend(false);
}

/** Anexo B (#btn-lock-now): Bloquea la Bitácora al instante y carga nueva trivia inteligente. */
function lockAppNow() {
  stopLightboxMusic();
  stopModalMusicPreview();
  $$(".modal-overlay.is-open").forEach(m => {
    if (!m.classList.contains("modal-blocking")) closeModal(m.id);
  });
  const welcome = $("scene-quote-welcome");
  if (welcome) {
    welcome.classList.remove("is-leaving");
    welcome.classList.add("is-hidden");
  }
  const lock = $("lock-screen");
  if (lock) {
    lock.style.display = "";
    lock.classList.remove("is-unlocked");
    lock.setAttribute("aria-hidden", "false");
  }
  setCoquiPose("happy", { jump: true, sparks: false, target: "lock" });
  initTriviaLock();
  showToast("🔒 Bitácora bloqueada con candado de trivia", "info");
}

function setupIdentityAndHeader() {
  applyAppIdentity();
  renderIdentityUI();

  const onPickIdentity = ev => {
    const btn = ev.currentTarget;
    const id = btn?.dataset?.identity;
    if (!id) return;
    setCurrentUser(id);
    $("identity-modal")?.classList.remove("is-open");
  };
  $("btn-identity-simon")?.addEventListener("click", onPickIdentity);
  $("btn-identity-salo")?.addEventListener("click", onPickIdentity);
  $("settings-identity-simon")?.addEventListener("click", onPickIdentity);
  $("settings-identity-salo")?.addEventListener("click", onPickIdentity);

  $("user-identity-pill")?.addEventListener("click", () => openSettingsModal());
  $("btn-lock-now")?.addEventListener("click", lockAppNow);

  // Botón háptico "Pensando en ti"
  $("btn-thinking-of-you")?.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) {
      $("identity-modal")?.classList.add("is-open");
      return showToast("Primero elige quién eres para mandar el toque 🥭🌸", "info");
    }
    const btn = $("btn-thinking-of-you");
    if (navigator.vibrate) { try { navigator.vibrate([40, 60, 40]); } catch {} }
    if (btn) {
      btn.classList.remove("is-pulsing");
      void btn.offsetWidth;
      btn.classList.add("is-pulsing");
      setTimeout(() => btn.classList.remove("is-pulsing"), 1900);
    }
    // Si había un toque entrante pendiente, al tocar también limpiamos la alerta
    if (getIncomingTouch()) {
      setIncomingTouch(null);
      clearAppBadgeCount();
    }
    const partner = getUserMeta(getPartnerUser(user));
    await postToBackend("sendThinkingPush", { usuario: user }, {
      okMsg: `💛 Le avisamos a ${partner?.shortName || "tu pareja"} que estás pensando en él/ella`,
      offlineMsg: `💛 Toque de cariño enviado para ${partner?.shortName || "tu pareja"}`
    });
  });

  $("btn-open-settings")?.addEventListener("click", openSettingsModal);
}

const SEEN_NOTIFS_STORAGE_KEY = "bitacora_seen_notifs_v3";

/** Dispara una notificación nativa del sistema iOS/Android (vía Service Worker) + vibración + banner en app. */
async function triggerNativeNotification(heading, message, tag = "") {
  if (navigator.vibrate) {
    try { navigator.vibrate([70, 50, 90]); } catch {}
  }
  showToast(`${heading} · ${message}`, "success");

  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const notifTag = tag || `bitacora-${Date.now()}`;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(heading, {
          body: message,
          tag: notifTag,
          renotify: true,
          vibrate: [80, 50, 100],
          data: { url: "./" }
        });
        return;
      }
    }
    new Notification(heading, { body: message, tag: notifTag });
  } catch (err) {
    console.warn("Aviso al mostrar notificación del sistema:", err);
  }
}

/** Procesa la cola de notificaciones en la nube, activa Badging API y el Banner Persistente de Toques. */
function processCloudNotifications(notifications) {
  const user = getCurrentUser();
  if (!user || !Array.isArray(notifications) || notifications.length === 0) return;

  let seen = getStored(SEEN_NOTIFS_STORAGE_KEY, null);
  const isFirstInit = !Array.isArray(seen);
  if (isFirstInit) seen = [];

  const now = Date.now();
  const recentWindowMs = 30 * 60 * 1000;
  const mine = notifications
    .filter(n => n && n.id && (!Array.isArray(n.targets) || n.targets.includes(user)) && n.from !== user)
    .sort((a, b) => (Number(a.createdAtMs) || 0) - (Number(b.createdAtMs) || 0));

  let changed = false;
  let newCount = 0;

  mine.forEach(n => {
    if (seen.includes(n.id)) return;
    seen.push(n.id);
    changed = true;
    const age = now - (Number(n.createdAtMs) || now);
    const nType = String(n.type || n.data?.type || "").toLowerCase();
    const isThinkingTouch = nType.includes("thinking") || String(n.message || "").toLowerCase().includes("acordar de ti") || String(n.message || "").toLowerCase().includes("abrazo express") || String(n.message || "").toLowerCase().includes("pensando en ti");

    if (!isFirstInit || age <= recentWindowMs) {
      newCount += 1;
      if (isThinkingTouch) {
        setIncomingTouch({
          id: n.id,
          from: n.from || getPartnerUser(user),
          message: n.message || "",
          createdAtMs: Number(n.createdAtMs) || now
        });
      }
      triggerNativeNotification(n.heading || "🥭🌸 Bitácora", n.message || "Tienes una novedad de tu pareja", `bitacora-${n.id}`);
    }
  });

  if (newCount > 0) incrementAppBadge(newCount);

  if (changed || isFirstInit) {
    if (seen.length > 80) seen = seen.slice(-80);
    setStored(SEEN_NOTIFS_STORAGE_KEY, seen);
  }
}

/**
 * Punto 8: Inicializa OneSignal Web Push SDK v16 con `OneSignalSDKWorker.js`
 * y `scope` dinámico compatible tanto con GitHub Pages (`/bitacora-mango-primavera/`)
 * como con servidor local (`./`).
 */
function initOneSignal() {
  updatePushStatusUI();
  if (oneSignalInitialized || !isOneSignalConfigured()) return;
  oneSignalInitialized = true;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      const swScope = location.pathname.includes("/bitacora-mango-primavera")
        ? "/bitacora-mango-primavera/"
        : "./";
      await OneSignal.init({
        appId: APP_CONFIG.ONESIGNAL_APP_ID,
        serviceWorkerPath: "OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: swScope },
        allowLocalhostAsSecureOrigin: true
      });
      const user = getCurrentUser();
      if (user) await OneSignal.login(user);
      if (OneSignal.Notifications && typeof OneSignal.Notifications.addEventListener === "function") {
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", ev => {
          incrementAppBadge(1);
          const data = ev?.notification?.additionalData || {};
          const title = ev?.notification?.title || "";
          const body = ev?.notification?.body || "";
          if (String(data.type || "").includes("thinking") || body.includes("acordar de ti") || body.includes("abrazo express")) {
            const u = getCurrentUser();
            setIncomingTouch({
              id: `os-${Date.now()}`,
              from: data.from || getPartnerUser(u),
              message: body || title,
              createdAtMs: Date.now()
            });
          }
        });
      }
      updatePushStatusUI();
    } catch (err) {
      console.warn("OneSignal v16 init omitido:", err);
    }
  });
}

function loginOneSignalUser(user) {
  if (!isOneSignalConfigured() || !user) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    try { await OneSignal.login(user); } catch (e) { console.warn("OneSignal login:", e); }
  });
}

function updatePushStatusUI() {
  const txt = $("push-status-text"), btn = $("btn-enable-push");
  if (!txt || !btn) return;
  const hasNativeApi = typeof Notification !== "undefined";
  const perm = hasNativeApi ? Notification.permission : "unsupported";

  if (perm === "granted") {
    txt.textContent = "Notificaciones activas en este dispositivo ✅ Recibirás toques de 'Pensando en ti', frases dedicadas, mensajes programados y recuerdos.";
    btn.textContent = "✅ Notificaciones activas (Toca para probar)";
  } else if (perm === "denied") {
    txt.textContent = "El permiso de notificaciones está bloqueado en tu teléfono. Actívalo en Ajustes del iPhone > Notificaciones > Bitácora.";
    btn.textContent = "🔕 Permiso bloqueado en Ajustes de iOS";
  } else if (!hasNativeApi) {
    txt.textContent = "Las alertas en tiempo real dentro de la app están activas ✅ Para notificaciones de sistema en iPhone, abre la app desde el ícono de tu Pantalla de Inicio ('Agregar a inicio').";
    btn.textContent = "🔔 Probar alerta de pareja";
  } else {
    txt.textContent = "Activa las notificaciones para recibir alertas en tu iPhone cuando tu pareja te mande un toque, programe un mensaje o complete un plan.";
    btn.textContent = "🔔 Activar notificaciones en este teléfono";
  }
}

async function handleEnablePush() {
  const user = getCurrentUser();
  const meta = getUserMeta(user);
  const partner = getUserMeta(getPartnerUser(user));

  if (isOneSignalConfigured()) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
      try {
        await OneSignal.Notifications.requestPermission();
        if (user) await OneSignal.login(user);
        updatePushStatusUI();
      } catch {}
    });
  }

  if (typeof Notification !== "undefined") {
    try {
      const perm = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
      updatePushStatusUI();
      if (perm === "granted") {
        await triggerNativeNotification(
          "🥭🌸 ¡Notificaciones activadas!",
          `Listo ${meta?.shortName || ""}: te avisaremos cada vez que ${partner?.shortName || "tu pareja"} te mande un toque, frase dedicada o recuerdo.`
        );
        syncWithBackend(false, true);
        return;
      } else if (perm === "denied") {
        return showToast("Activa las notificaciones en Ajustes del iPhone > Bitácora 🔔", "error");
      }
    } catch (err) {
      console.warn("Error solicitando permiso Notification:", err);
    }
  }

  await triggerNativeNotification(
    "🥭🌸 ¡Alertas de la Bitácora listas!",
    "Para ver alertas en la pantalla de bloqueo del iPhone, asegúrate de abrir la Bitácora desde tu Pantalla de Inicio."
  );
  syncWithBackend(false, true);
}

/* ==========================================================================
   4. CANDADO ASIMÉTRICO INTELIGENTE (REGLAS 1, 2 Y 4 + PENALIZACIÓN -10 PTS)
      Y FLUJO CINEMÁTICO DE BIENVENIDA (#scene-quote-welcome)
   ========================================================================== */

function getTriviaPoolForUser() {
  const all = getPreguntas();
  const user = getCurrentUser();
  if (!user) return all;
  const filtered = all.filter(q => q.paraUsuario === user || q.paraUsuario === "ambos");
  return filtered.length > 0 ? filtered : all;
}

/**
 * Punto 3 — Motor de Estadísticas del Randomizador Inteligente (`bitacora_trivia_stats_v4`):
 *   - Regla 1: Bloquea las últimas 5 preguntas vistas (`recentIds`, adaptativo si el pool <= 5).
 *   - Regla 2: Balancea favoreciendo las preguntas con menor `count`. Las preguntas nuevas se
 *              inicializan al `minCount` actual del pool (SIN Regla 3 de prioridad forzada).
 *   - Regla 4: Da peso extra (x3.5) a preguntas falladas (`failedPending`) tras >= 2 turnos.
 */
function loadUserTriviaStats() {
  const userKey = getCurrentUser() || "shared";
  const allStats = getStored(APP_CONFIG.STORAGE_KEYS.TRIVIA_STATS, {});
  const bucket = (allStats && typeof allStats[userKey] === "object" && allStats[userKey]) ? allStats[userKey] : {};
  return {
    userKey,
    allStats: (allStats && typeof allStats === "object") ? allStats : {},
    turnCounter: Math.max(0, Number(bucket.turnCounter) || 0),
    recentIds: Array.isArray(bucket.recentIds) ? bucket.recentIds.map(String) : [],
    items: (bucket.items && typeof bucket.items === "object") ? bucket.items : {}
  };
}

function saveUserTriviaStats(state) {
  state.allStats[state.userKey] = {
    turnCounter: state.turnCounter,
    recentIds: state.recentIds.slice(-APP_CONFIG.TRIVIA_COOLDOWN_SIZE),
    items: state.items
  };
  setStored(APP_CONFIG.STORAGE_KEYS.TRIVIA_STATS, state.allStats);
}

function pickSmartTriviaQuestion(pool) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const state = loadUserTriviaStats();

  // Calcular minCount entre preguntas del pool ya registradas (o 0 si el pool es virgen)
  const existingCounts = pool
    .filter(q => state.items[q.id] && typeof state.items[q.id].count === "number")
    .map(q => state.items[q.id].count);
  const minPoolCount = existingCounts.length > 0 ? Math.min(...existingCounts) : 0;

  // Inicializar preguntas nuevas exactamente al `minCount` del pool (sin Regla 3)
  pool.forEach(q => {
    if (!state.items[q.id]) {
      state.items[q.id] = {
        count: minPoolCount,
        failedPending: false,
        lastFailedTurn: -999
      };
    }
  });

  // Regla 1: bloquear las últimas 5 vistas (o pool.length - 1 si hubiera <= 5 preguntas)
  const blockCount = Math.min(APP_CONFIG.TRIVIA_COOLDOWN_SIZE, Math.max(0, pool.length - 1));
  const blockedSet = new Set(state.recentIds.slice(-blockCount));
  let eligible = pool.filter(q => !blockedSet.has(q.id));
  if (eligible.length === 0) eligible = pool.slice();

  // Regla 2 (menor count) + Regla 4 (falladas tras >= 2 turnos reciben peso extra)
  const minEligibleCount = Math.min(...eligible.map(q => Number(state.items[q.id]?.count) || 0));
  const nextTurn = state.turnCounter + 1;

  const weighted = eligible.map(q => {
    const st = state.items[q.id];
    const delta = Math.max(0, (Number(st.count) || 0) - minEligibleCount);
    // Regla 2: máxima preferencia al escalón de menor count
    let weight = delta === 0 ? 12 : delta === 1 ? 4 : Math.max(0.5, 1.5 / (delta + 1));
    // Regla 4: peso extra si fue fallada hace >= 2 turnos
    const turnsSinceFail = nextTurn - (Number(st.lastFailedTurn) || -999);
    if (st.failedPending && turnsSinceFail >= APP_CONFIG.TRIVIA_RETRY_MIN_TURNS) {
      weight *= 3.5;
    }
    return { q, weight };
  });

  const totalWeight = weighted.reduce((acc, item) => acc + item.weight, 0);
  let r = Math.random() * totalWeight;
  let chosen = weighted[weighted.length - 1].q;
  for (const entry of weighted) {
    r -= entry.weight;
    if (r <= 0) {
      chosen = entry.q;
      break;
    }
  }

  // Registrar aparición en `bitacora_trivia_stats_v4`
  state.turnCounter = nextTurn;
  state.items[chosen.id].count = (Number(state.items[chosen.id].count) || 0) + 1;
  state.recentIds = [...state.recentIds.filter(id => id !== chosen.id), chosen.id].slice(-APP_CONFIG.TRIVIA_COOLDOWN_SIZE);
  saveUserTriviaStats(state);

  return chosen;
}

function recordTriviaOutcomeInStats(questionId, wasCorrect) {
  if (!questionId) return;
  const state = loadUserTriviaStats();
  if (!state.items[questionId]) {
    state.items[questionId] = { count: 1, failedPending: false, lastFailedTurn: -999 };
  }
  if (wasCorrect) {
    state.items[questionId].failedPending = false;
  } else {
    state.items[questionId].failedPending = true;
    state.items[questionId].lastFailedTurn = state.turnCounter;
  }
  saveUserTriviaStats(state);
}

function initTriviaLock() {
  const qEl = $("trivia-question"), optsEl = $("trivia-options"), fb = $("trivia-feedback"), card = $("trivia-card");
  const pool = getTriviaPoolForUser();
  if (!qEl || !optsEl || pool.length === 0) return;

  const chosen = pickSmartTriviaQuestion(pool) || pool[0];
  lastTriviaId = chosen.id;
  currentTrivia = chosen;

  setCoquiPose("happy", { target: "lock" });
  card?.classList.remove("shake-error", "unlock-success");
  if (fb) { fb.textContent = ""; fb.classList.remove("is-error", "is-success"); }
  qEl.textContent = currentTrivia.pregunta;
  optsEl.innerHTML = "";

  currentTrivia.opciones.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "trivia-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleTriviaAnswer(opt, btn));
    optsEl.appendChild(btn);
  });
}

function isTriviaSelectionCorrect(trivia, selected) {
  const target = normText(selected);
  return trivia.respuestasCorrectas.some(ans => normText(ans) === target);
}

function handleTriviaAnswer(selected, btn) {
  if (!currentTrivia) return;
  const fb = $("trivia-feedback"), card = $("trivia-card");
  $$("#trivia-options .trivia-option-btn").forEach(b => { b.disabled = true; });
  const user = getCurrentUser();
  const answeredId = currentTrivia.id;

  if (isTriviaSelectionCorrect(currentTrivia, selected)) {
    btn.classList.add("is-correct");
    recordTriviaOutcomeInStats(answeredId, true);
    setCoquiPose("magic", { jump: true, sparks: true, target: "both" });

    let feedbackMsg = "¡Correcto! Coquí abre el portal mágico 🥭🌸";
    if (user) {
      const puntosList = getPuntos();
      const me = puntosList.find(p => p.usuario === user);
      const today = todayLocal();
      if (me) {
        if (me.ultimaFechaTrivia !== today) {
          me.preguntasRespondidasHoy = 0;
          me.ultimaFechaTrivia = today;
        }
        if (me.preguntasRespondidasHoy < APP_CONFIG.TRIVIA_MAX_PER_DAY) {
          me.puntosTotales += APP_CONFIG.TRIVIA_POINTS;
          me.preguntasRespondidasHoy += 1;
          savePuntos(puntosList);
          renderScoreboards();
          feedbackMsg = `¡Correcto! +${APP_CONFIG.TRIVIA_POINTS} pts (${me.preguntasRespondidasHoy}/${APP_CONFIG.TRIVIA_MAX_PER_DAY} hoy) 🪄✨`;
        } else {
          feedbackMsg = `¡Correcto! Cupo diario (${APP_CONFIG.TRIVIA_MAX_PER_DAY}/${APP_CONFIG.TRIVIA_MAX_PER_DAY}) completado hoy 🥭🌸`;
        }
      }
      postToBackend("completeTrivia", {
        usuario: user,
        preguntaId: answeredId,
        respuesta: selected,
        correct: true
      }, {
        silent: true,
        onSuccess: res => {
          const remotePuntos = res?.puntos || res?.puntosAll;
          if (Array.isArray(remotePuntos)) {
            savePuntos(remotePuntos);
            renderScoreboards();
          }
        }
      });
    }

    if (fb) {
      fb.textContent = feedbackMsg;
      fb.classList.remove("is-error");
      fb.classList.add("is-success");
    }
    card?.classList.add("unlock-success");
    launchConfetti();

    // Punto 4: Transición cinemática #lock-screen -> #scene-quote-welcome
    setTimeout(() => {
      const lock = $("lock-screen");
      lock?.classList.add("is-unlocked");
      lock?.setAttribute("aria-hidden", "true");
      openWelcomeQuoteScene();
      setTimeout(() => {
        if (lock) lock.style.display = "none";
      }, reducedMotion() ? 50 : 720);
    }, reducedMotion() ? 80 : 880);
  } else {
    // Punto 3: Fallo -> Coquí grumpy + penalización -10 pts (piso 0) + envío completeTrivia
    btn.classList.add("is-wrong");
    recordTriviaOutcomeInStats(answeredId, false);
    setCoquiPose("grumpy", { jump: true, sparks: false, target: "lock" });
    if (navigator.vibrate) { try { navigator.vibrate([70, 40, 70]); } catch {} }

    let penaltyInfo = "";
    if (user) {
      const puntosList = getPuntos();
      const me = puntosList.find(p => p.usuario === user);
      if (me) {
        const beforePts = me.puntosTotales;
        const afterPts = Math.max(0, beforePts - APP_CONFIG.TRIVIA_PENALTY_POINTS);
        me.puntosTotales = afterPts;
        savePuntos(puntosList);
        renderScoreboards();
        penaltyInfo = ` · Puntaje: ${beforePts} → ${afterPts} pts`;
      }
      postToBackend("completeTrivia", {
        usuario: user,
        preguntaId: answeredId,
        respuesta: selected,
        correct: false
      }, {
        silent: true,
        onSuccess: res => {
          const remotePuntos = res?.puntos || res?.puntosAll;
          if (Array.isArray(remotePuntos)) {
            savePuntos(remotePuntos);
            renderScoreboards();
          }
        }
      });
    }

    if (fb) {
      const baseImpostor = IMPOSTOR_MESSAGES[Math.floor(Math.random() * IMPOSTOR_MESSAGES.length)];
      fb.textContent = `${baseImpostor}${penaltyInfo}`;
      fb.classList.remove("is-success");
      fb.classList.add("is-error");
    }
    if (card) {
      card.classList.remove("shake-error");
      void card.offsetWidth;
      card.classList.add("shake-error");
    }
    setTimeout(initTriviaLock, reducedMotion() ? 450 : 1350);
  }
}

/**
 * Puntos 4 y 5: Escena Cinemática de Frase de Bienvenida (`#scene-quote-welcome`).
 * Prioriza Frase Dedicada vigente para el usuario actual (`💌 Dedicada especialmente por [Nombre] para ti`,
 * marcando entrega inmediata si es `once`), o cae al banco de Sabiduría.
 */
function pickRandomSabiduriaQuote(excludeId = "") {
  const list = getSabiduria();
  if (list.length === 0) {
    return { id: "fallback", categoria: "Animo", frase: "Donde el mundo se apaga y nosotros empezamos.", autor: "Simón & Salo" };
  }
  let chosen = list[0];
  let guard = 0;
  do {
    chosen = list[Math.floor(Math.random() * list.length)];
    guard++;
  } while (chosen.id === excludeId && list.length > 1 && guard < 12);
  return chosen;
}

function renderWelcomeQuoteContent({ preferDedicated = true } = {}) {
  const user = getCurrentUser();
  const dedicated = preferDedicated ? getActiveDedicatedQuoteForUser(user) : null;
  const badgeEl = $("quote-welcome-badge");
  const textEl = $("quote-welcome-text");
  const authorEl = $("quote-welcome-author");
  const scene = $("scene-quote-welcome");

  if (dedicated) {
    const senderMeta = getUserMeta(dedicated.deUsuario) || getUserMeta(getPartnerUser(user));
    const senderName = senderMeta ? `${senderMeta.emoji} ${senderMeta.shortName}` : "tu pareja";
    if (badgeEl) badgeEl.textContent = `💌 Dedicada especialmente por ${senderName} para ti`;
    if (textEl) textEl.textContent = `“${dedicated.frase}”`;
    if (authorEl) authorEl.textContent = dedicated.autor ? `— ${dedicated.autor}` : `— Con amor, ${senderMeta?.shortName || "tu pareja"}`;
    setCoquiPose("magic", { jump: false, sparks: true, target: "welcome" });
    scene?.classList.add("is-dedicated-quote");

    // Si la duración es "once", marcar como entregada para que no se repita en próximos ingresos
    if (dedicated.duracion === "once" && !dedicated.entregada) {
      const updated = getFrasesDedicadas().map(q => (q.id === dedicated.id ? { ...q, entregada: true } : q));
      saveFrasesDedicadas(updated);
      postToBackend("manageDedicatedQuote", {
        subAction: "markDelivered",
        op: "markDelivered",
        id: dedicated.id,
        usuario: user
      }, { silent: true });
    }
    return;
  }

  scene?.classList.remove("is-dedicated-quote");
  const chosen = pickRandomSabiduriaQuote(lastWelcomeQuoteId);
  lastWelcomeQuoteId = chosen.id;
  if (badgeEl) badgeEl.textContent = SABIDURIA_LABELS[chosen.categoria] || "💛 Sabiduría del Refugio";
  if (textEl) textEl.textContent = `“${chosen.frase}”`;
  if (authorEl) authorEl.textContent = chosen.autor ? `— ${chosen.autor}` : "";
}

function openWelcomeQuoteScene() {
  const scene = $("scene-quote-welcome");
  if (!scene) {
    clearAppBadgeCount();
    if (!getCurrentUser()) $("identity-modal")?.classList.add("is-open");
    return;
  }
  renderWelcomeQuoteContent({ preferDedicated: true });
  scene.classList.remove("is-leaving", "is-hidden");
}

function closeWelcomeQuoteScene() {
  const scene = $("scene-quote-welcome");
  clearAppBadgeCount();
  if (!scene) {
    if (!getCurrentUser()) $("identity-modal")?.classList.add("is-open");
    return;
  }
  scene.classList.add("is-leaving");
  setTimeout(() => {
    scene.classList.add("is-hidden");
    scene.classList.remove("is-leaving");
    if (!getCurrentUser()) $("identity-modal")?.classList.add("is-open");
  }, reducedMotion() ? 40 : 450);
}

function setupWelcomeQuoteScene() {
  $("btn-enter-app")?.addEventListener("click", closeWelcomeQuoteScene);
  $("btn-next-quote")?.addEventListener("click", () => {
    renderWelcomeQuoteContent({ preferDedicated: false });
    const textEl = $("quote-welcome-text");
    if (textEl && !reducedMotion()) {
      textEl.classList.remove("card-flip-3d");
      void textEl.offsetWidth;
      textEl.classList.add("card-flip-3d");
    }
  });
}

function launchConfetti() {
  const box = $("confetti-container");
  if (!box) return;
  box.innerHTML = "";
  const red = reducedMotion();
  const cols = ["#FFB347", "#FF8A80", "#81D4FA", "#E1F5FE", "#A5D6A7", "#F8BBD0", "#29B6F6"];
  for (let i = 0; i < (red ? 14 : 60); i++) {
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

/* ==========================================================================
   5. NAVEGACIÓN UNIFICADA Y SINCRONIZACIÓN CLOUD V4 (10 COLECCIONES)
   ========================================================================== */

function activateView(viewId, activeNavTarget = null) {
  const target = $(viewId);
  if (!target) return;
  $$("#app-main .app-view").forEach(v => v.classList.remove("is-active"));
  target.classList.add("is-active");
  $$("#bottom-nav .nav-tab").forEach(t => {
    const match = activeNavTarget ? t.dataset.target === activeNavTarget : t.dataset.target === viewId;
    t.classList.toggle("is-active", match);
  });
  window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
}

function setupNavigation() {
  $$("#bottom-nav .nav-tab").forEach(tab => tab.addEventListener("click", () => {
    if (tab.dataset.target) activateView(tab.dataset.target);
  }));
  $("btn-open-reparto")?.addEventListener("click", () => {
    renderReparto();
    activateView("view-reparto", "view-inicio");
  });
  $("btn-back-from-reparto")?.addEventListener("click", () => activateView("view-inicio"));
}

function updateSyncBadge(cls, label) {
  const badge = $("sync-status-badge");
  if (!badge) return;
  badge.className = `sync-badge ${cls}`;
  const span = badge.querySelector(".sync-label");
  if (span) span.textContent = label;
}

async function syncWithBackend(manual = false, silentBg = false) {
  if (isSyncing) return;
  const btn = $("btn-sync-refresh");
  if (!hasCloud()) {
    updateSyncBadge("is-local", "Local");
    if (manual) showToast("Modo local activo. Configura GAS_WEB_APP_URL para conectar con la nube.", "info");
    return;
  }
  isSyncing = true;
  if (!silentBg) {
    updateSyncBadge("is-syncing", "Sincronizando…");
    if (btn) { btn.classList.add("is-spinning"); btn.disabled = true; }
  }

  try {
    const sep = APP_CONFIG.GAS_WEB_APP_URL.includes("?") ? "&" : "?";
    const user = getCurrentUser();
    const userQuery = user ? `&usuario=${encodeURIComponent(user)}` : "";
    const resp = await fetch(`${APP_CONFIG.GAS_WEB_APP_URL}${sep}action=getAppData${userQuery}&_t=${Date.now()}`, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.status && data.status !== "ok") throw new Error(data.message || "Error remoto");

    if (Array.isArray(data.notifications)) {
      processCloudNotifications(data.notifications);
    }

    const anyModalOpen = Boolean(document.querySelector(".modal-overlay.is-open"));
    if (!silentBg || !anyModalOpen) {
      if (Array.isArray(data.plans)) savePlans(data.plans.map(p => normalizePlan(p)));
      if (Array.isArray(data.mural)) saveMural(data.mural.map(m => normalizeMuralItem(m)));
      if (Array.isArray(data.cupones)) saveCupones(data.cupones);
      if (Array.isArray(data.puntos)) savePuntos(data.puntos);
      if (Array.isArray(data.sabiduria)) saveSabiduria(data.sabiduria);
      if (Array.isArray(data.preguntas) && data.preguntas.length > 0) savePreguntas(data.preguntas.map(normalizePregunta));
      if (Array.isArray(data.personajes)) savePersonajes(data.personajes);
      if (Array.isArray(data.frasesDedicadas)) {
        saveFrasesDedicadas(data.frasesDedicadas);
      } else if (data.dedicatedQuoteForViewer) {
        const dq = normalizeDedicatedQuote(data.dedicatedQuoteForViewer);
        if (dq) {
          const prevDq = getFrasesDedicadas().filter(x => x.id !== dq.id);
          saveFrasesDedicadas([...prevDq, dq]);
        }
      }
      if (Array.isArray(data.mensajesProgramados)) saveMensajesProgramados(data.mensajesProgramados);
      if (data.configuracion) saveConfiguracion(data.configuracion);

      renderAllViews();
      if (!anyModalOpen) {
        renderTrampaList();
        renderDedicatedQuotePanel();
        renderScheduledMessagesList();
      }
    }
    updateSyncBadge("is-online", "En línea");
    if (manual) showToast("Bitácora V4 sincronizada con Google Sheets & Drive ☁️", "success");
  } catch (err) {
    console.warn("Fallo sync cloud:", err);
    if (!silentBg) updateSyncBadge("is-local", "Sin conexión");
    if (manual) showToast("No se pudo conectar con la nube. Trabajando en modo local.", "error");
  } finally {
    isSyncing = false;
    if (!silentBg && btn) { btn.classList.remove("is-spinning"); btn.disabled = false; }
  }
}

/* ==========================================================================
   6. MOTOR MULTIMEDIA V4: IMÁGENES CANVAS + COMPRESOR VIDEO WEBCODECS/MP4
      (720p@30fps + FALLBACK 480p / DRIVE LINK) + BUSCADOR DE MÚSICA ITUNES
   ========================================================================== */

/** Redimensiona a `maxWidth` y comprime a JPEG en `<canvas>`. */
function compressImageFile(file, maxWidth = APP_CONFIG.IMAGE_MAX_WIDTH, quality = APP_CONFIG.IMAGE_QUALITY) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Selecciona una imagen válida."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = ev => {
      const img = new Image();
      img.onerror = () => reject(new Error("Formato de imagen incompatible."));
      img.onload = () => {
        const c = document.createElement("canvas");
        const s = Math.min(maxWidth / img.width, 1);
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("Canvas no disponible."));
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL("image/jpeg", quality);
        const base64 = dataUrl.split(",")[1] || "";
        resolve({
          mediaType: "image",
          dataUrl,
          base64,
          mimeType: "image/jpeg",
          fileName: file.name || `foto_${Date.now()}.jpg`,
          posterDataUrl: "",
          posterBase64: "",
          originalKb: Math.max(1, Math.round(file.size / 1024)),
          compressedKb: Math.max(1, Math.round((base64.length * 3) / 4 / 1024))
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Caché en sesión de Blobs de video (evita re-descargar y sortea errores MIME/Range en iOS Safari). */
const SESSION_VIDEO_BLOBS = new Map();

/** Extrae el ID de archivo de Google Drive desde cualquier variante de URL. */
function extractDriveId(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  let m = s.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m) return m[1];
  m = s.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (m) return m[1];
  return "";
}

/** Obtiene el póster efectivo de un video (póster propio -> miniatura oficial de Drive -> fallback SVG). */
function getEffectivePoster(item) {
  if (!item) return VIDEO_POSTER_FALLBACK;
  if (item.posterUrl && !item.posterUrl.startsWith("data:video/")) return item.posterUrl;
  const driveId = extractDriveId(item.photoUrl);
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  return VIDEO_POSTER_FALLBACK;
}

/** Carga y reproduce un video de forma 100% compatible con iOS Safari y enlaces de Google Drive. */
async function loadVideoIntoPlayer(vidEl, iframeEl, item) {
  if (!item) return;
  const poster = getEffectivePoster(item);
  const driveId = extractDriveId(item.photoUrl);
  const cachedBlob = (item.blobUrl && item.blobUrl.startsWith("blob:"))
    ? item.blobUrl
    : (SESSION_VIDEO_BLOBS.get(item.id) || (driveId ? SESSION_VIDEO_BLOBS.get(driveId) : ""));

  if (iframeEl) { iframeEl.src = "about:blank"; iframeEl.classList.add("is-hidden"); }

  if (cachedBlob && vidEl) {
    vidEl.playsInline = true;
    vidEl.setAttribute("playsinline", "");
    vidEl.setAttribute("webkit-playsinline", "");
    vidEl.poster = poster;
    vidEl.src = cachedBlob;
    vidEl.classList.remove("is-hidden");
    try { vidEl.load(); } catch {}
    return;
  }

  if (driveId) {
    if (vidEl) {
      vidEl.poster = poster;
      vidEl.removeAttribute("src");
      vidEl.classList.remove("is-hidden");
    }
    try {
      const dlUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`;
      const resp = await fetch(dlUrl, { method: "GET", mode: "cors", credentials: "omit" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = await resp.arrayBuffer();
      if (!buf || buf.byteLength < 128) throw new Error("Buffer de video vacío");
      const blob = new Blob([buf], { type: "video/mp4" });
      const blobUrl = URL.createObjectURL(blob);
      SESSION_VIDEO_BLOBS.set(driveId, blobUrl);
      if (item.id) SESSION_VIDEO_BLOBS.set(item.id, blobUrl);
      if (vidEl) {
        vidEl.poster = poster;
        vidEl.src = blobUrl;
        vidEl.classList.remove("is-hidden");
        try { vidEl.load(); } catch {}
      }
      return;
    } catch (err) {
      console.warn("Fallback a Drive Preview iframe:", err);
      if (iframeEl) {
        if (vidEl) { vidEl.pause(); vidEl.removeAttribute("src"); vidEl.classList.add("is-hidden"); }
        iframeEl.src = `https://drive.google.com/file/d/${driveId}/preview`;
        iframeEl.classList.remove("is-hidden");
        return;
      }
    }
  }

  if (vidEl && item.photoUrl && !item.photoUrl.startsWith("data:video/")) {
    vidEl.poster = poster;
    vidEl.src = item.photoUrl;
    vidEl.classList.remove("is-hidden");
  }
}

/** Captura el primer fotograma de un video como miniatura JPEG (Canvas compatible iOS Safari). */
function captureVideoPoster(fileOrBlob) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(fileOrBlob);
    const video = document.createElement("video");
    let settled = false;

    video.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";
    document.body.appendChild(video);

    const done = result => {
      if (settled) return;
      settled = true;
      try { video.pause(); video.removeAttribute("src"); video.load(); } catch {}
      try { video.remove(); } catch {}
      try { URL.revokeObjectURL(url); } catch {}
      resolve(result);
    };

    const capture = () => {
      if (settled) return;
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;
        const scale = Math.min(720 / w, 1);
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(w * scale));
        c.height = Math.max(1, Math.round(h * scale));
        const ctx = c.getContext("2d");
        ctx.drawImage(video, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL("image/jpeg", 0.78);
        if (dataUrl && dataUrl.length > 200) {
          done({ posterDataUrl: dataUrl, posterBase64: dataUrl.split(",")[1] || "" });
        }
      } catch (err) {
        console.warn("Aviso: Canvas poster fallback:", err);
      }
    };

    video.addEventListener("loadedmetadata", () => {
      try {
        const target = Math.min(0.15, (video.duration || 1) / 2);
        video.currentTime = target > 0 ? target : 0.05;
      } catch {}
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => { setTimeout(() => { capture(); }, 140); }).catch(() => { setTimeout(capture, 140); });
      }
    }, { once: true });

    video.addEventListener("seeked", () => { setTimeout(capture, 60); }, { once: true });
    video.addEventListener("timeupdate", () => { capture(); }, { once: true });
    video.addEventListener("loadeddata", () => { setTimeout(capture, 160); }, { once: true });
    video.addEventListener("error", () => done({ posterDataUrl: "", posterBase64: "" }), { once: true });

    setTimeout(() => {
      if (!settled) capture();
      setTimeout(() => done({ posterDataUrl: "", posterBase64: "" }), 350);
    }, 3200);

    video.src = url;
    try { video.load(); } catch {}
  });
}

function readBlobAsBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo codificar el archivo de video."));
    reader.onload = ev => {
      const dataUrl = String(ev.target.result || "");
      resolve({ dataUrl, base64: dataUrl.split(",")[1] || "" });
    };
    reader.readAsDataURL(blob);
  });
}

/** Importa dinámicamente `mp4-muxer` desde jsDelivr (solo cuando se necesita comprimir un video >= 15 MB). */
async function loadMp4MuxerModule() {
  if (!mp4MuxerModulePromise) {
    mp4MuxerModulePromise = import(APP_CONFIG.MP4_MUXER_ESM_URL).catch(err => {
      mp4MuxerModulePromise = null;
      throw err;
    });
  }
  return mp4MuxerModulePromise;
}

/** Calcula dimensiones pares escaladas a `maxShortSide` (720p o 480p) preservando orientación vertical/horizontal. */
function computeTargetVideoDims(srcW, srcH, targetShortSide) {
  const isPortrait = srcH > srcW;
  const shortSide = isPortrait ? srcW : srcH;
  const scale = shortSide > targetShortSide ? (targetShortSide / shortSide) : 1;
  let w = Math.max(2, Math.round(srcW * scale));
  let h = Math.max(2, Math.round(srcH * scale));
  if (w % 2 !== 0) w -= 1;
  if (h % 2 !== 0) h -= 1;
  return { width: Math.max(2, w), height: Math.max(2, h) };
}

/** Verifica en Safari/WebKit que un Blob de video realmente se pueda decodificar y reproducir. */
function canPlayVideoBlob(blob) {
  return new Promise(resolve => {
    if (!blob || blob.size < 256) return resolve(false);
    const url = URL.createObjectURL(blob);
    const v = document.createElement("video");
    let settled = false;
    const finish = ok => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { v.pause(); v.removeAttribute("src"); v.load(); v.remove(); } catch {}
      try { URL.revokeObjectURL(url); } catch {}
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), 6000);
    v.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;";
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.preload = "auto";
    v.onloadeddata = () => finish((v.videoWidth || 0) > 0 && (Number(v.duration) || 0) > 0);
    v.onloadedmetadata = () => {
      if ((v.videoWidth || 0) > 0 && (Number(v.duration) || 0) > 0) finish(true);
    };
    v.onerror = () => finish(false);
    document.body.appendChild(v);
    v.src = url;
    try { v.load(); } catch {}
  });
}

/**
 * Punto 1 — Motor Primario: Compresión en cliente con `WebCodecs` (`VideoEncoder` + `AudioEncoder`)
 * + `mp4-muxer` a 720p@24-30fps (o 480p en Plan B) con reporte real de progreso.
 */
async function compressVideoWithWebCodecs(file, { targetHeight = 720, includeAudio = true, onProgress = null } = {}) {
  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
    throw new Error("WebCodecs no soportado en este navegador.");
  }
  const { Muxer, ArrayBufferTarget } = await loadMp4MuxerModule();

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";
  document.body.appendChild(video);

  try {
    await new Promise((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("No se pudo abrir el video para comprimir."));
      video.src = url;
      try { video.load(); } catch {}
    });

    const duration = Number(video.duration) || 0;
    if (!duration || !Number.isFinite(duration) || duration <= 0) {
      throw new Error("Duración de video inválida.");
    }

    const { width, height } = computeTargetVideoDims(video.videoWidth || 720, video.videoHeight || 1280, targetHeight);
    // 24 fps para clips > 10s acelera la compresión ~20% en iPhone manteniendo fluidez
    const fps = duration > 10 ? Math.min(24, APP_CONFIG.VIDEO_TARGET_FPS) : APP_CONFIG.VIDEO_TARGET_FPS;
    const bitrate = targetHeight <= 480 ? APP_CONFIG.VIDEO_BITRATE_480 : APP_CONFIG.VIDEO_BITRATE_720;

    // Seleccionar perfil H.264 compatible con portrait 720x1280 (Level 4.0 primero, luego 3.1)
    const candidateCodecs = ["avc1.4d0028", "avc1.42e028", "avc1.4d001f", "avc1.42001f", "avc1.640028"];
    let selectedCodec = "";
    for (const codec of candidateCodecs) {
      try {
        const sup = await VideoEncoder.isConfigSupported({
          codec,
          width,
          height,
          bitrate,
          framerate: fps,
          avc: { format: "avc" }
        });
        if (sup && sup.supported) { selectedCodec = codec; break; }
      } catch {}
    }
    if (!selectedCodec) throw new Error("Codificador H.264 WebCodecs no disponible.");

    // Intentar decodificar pista de audio para empaquetarla en AAC (solo si se habilita y produce muestras)
    let audioBuffer = null;
    let canEncodeAudio = false;
    if (includeAudio && typeof AudioEncoder !== "undefined" && typeof AudioData !== "undefined" && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const actx = new Ctx();
        const rawBuf = await file.arrayBuffer();
        audioBuffer = await actx.decodeAudioData(rawBuf.slice(0));
        await actx.close().catch(() => {});
        const aSup = await AudioEncoder.isConfigSupported({
          codec: "mp4a.40.2",
          numberOfChannels: Math.min(2, audioBuffer.numberOfChannels || 1),
          sampleRate: audioBuffer.sampleRate,
          bitrate: 128000
        });
        canEncodeAudio = Boolean(aSup && aSup.supported && audioBuffer.length > 0);
      } catch {
        audioBuffer = null;
        canEncodeAudio = false;
      }
    }

    const target = new ArrayBufferTarget();
    const muxerOpts = {
      target,
      video: { codec: "avc", width, height },
      fastStart: "in-memory"
    };
    const audioChannels = canEncodeAudio && audioBuffer ? Math.min(2, audioBuffer.numberOfChannels || 1) : 0;
    if (canEncodeAudio && audioBuffer) {
      muxerOpts.audio = {
        codec: "aac",
        numberOfChannels: audioChannels,
        sampleRate: audioBuffer.sampleRate
      };
    }

    const muxer = new Muxer(muxerOpts);
    let encoderErr = null;
    let videoChunksCount = 0;

    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => { videoChunksCount++; muxer.addVideoChunk(chunk, meta); },
      error: e => { encoderErr = e; }
    });
    videoEncoder.configure({
      codec: selectedCodec,
      width,
      height,
      bitrate,
      framerate: fps,
      avc: { format: "avc" }
    });

    // Codificar pista de audio si existe y verificar que no falle
    if (canEncodeAudio && audioBuffer) {
      let audioErr = null;
      const audioEncoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: e => { audioErr = e; }
      });
      audioEncoder.configure({
        codec: "mp4a.40.2",
        numberOfChannels: audioChannels,
        sampleRate: audioBuffer.sampleRate,
        bitrate: 128000
      });
      const totalSamples = audioBuffer.length;
      const chunkFrames = 4096;
      const sr = audioBuffer.sampleRate;
      for (let offset = 0; offset < totalSamples; offset += chunkFrames) {
        if (audioErr) throw audioErr;
        const framesCount = Math.min(chunkFrames, totalSamples - offset);
        const planar = new Float32Array(framesCount * audioChannels);
        for (let ch = 0; ch < audioChannels; ch++) {
          const chanData = audioBuffer.getChannelData(ch).subarray(offset, offset + framesCount);
          planar.set(chanData, ch * framesCount);
        }
        const ad = new AudioData({
          format: "f32-planar",
          sampleRate: sr,
          numberOfFrames: framesCount,
          numberOfChannels: audioChannels,
          timestamp: Math.round((offset / sr) * 1000000),
          data: planar
        });
        audioEncoder.encode(ad);
        ad.close();
      }
      await audioEncoder.flush();
      audioEncoder.close();
      if (audioErr) throw audioErr;
    }

    // Muestrear fotogramas a `fps` sobre `<canvas>` y alimentar `VideoEncoder`
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    const totalFrames = Math.max(1, Math.floor(duration * fps));
    const stepSec = 1 / fps;

    for (let i = 0; i < totalFrames; i++) {
      if (encoderErr) throw encoderErr;
      const tSec = Math.min(duration - 0.001, i * stepSec);
      await new Promise(resSeek => {
        let doneSeek = false;
        const finish = () => { if (!doneSeek) { doneSeek = true; resSeek(); } };
        video.addEventListener("seeked", finish, { once: true });
        setTimeout(finish, 140);
        try { video.currentTime = Math.max(0, tSec); } catch { finish(); }
      });

      ctx.drawImage(video, 0, 0, width, height);
      const frame = new VideoFrame(canvas, { timestamp: Math.round(i * stepSec * 1000000) });
      videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
      frame.close();

      if (videoEncoder.encodeQueueSize > 8) {
        await videoEncoder.flush();
      }
      if (onProgress && (i % 4 === 0 || i === totalFrames - 1)) {
        const pct = Math.min(98, Math.round(((i + 1) / totalFrames) * 96));
        onProgress(pct, `Comprimiendo ${targetHeight}p · ${pct}%`);
      }
    }

    await videoEncoder.flush();
    videoEncoder.close();
    if (videoChunksCount === 0) throw new Error("WebCodecs no generó fotogramas.");
    muxer.finalize();

    const outBlob = new Blob([target.buffer], { type: "video/mp4" });
    if (outBlob.size < 256) throw new Error("Buffer MP4 vacío tras WebCodecs.");
    if (onProgress) onProgress(100, `Compresión ${targetHeight}p completada ✅`);
    return outBlob;
  } finally {
    try { video.pause(); video.removeAttribute("src"); video.load(); video.remove(); } catch {}
    try { URL.revokeObjectURL(url); } catch {}
  }
}

/**
 * Punto 1 — Motor de Respaldo Automático: `<canvas>` + `MediaRecorder` stream H.264/MP4 (o WebM).
 */
async function compressVideoWithMediaRecorder(file, { targetHeight = 720, onProgress = null } = {}) {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder no disponible en este navegador.");
  }
  const mimeCandidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm"
  ];
  const chosenMime = mimeCandidates.find(m => {
    try { return MediaRecorder.isTypeSupported(m); } catch { return false; }
  }) || "";

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;";
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";
  document.body.appendChild(video);

  let audioCtx = null;
  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("No se pudo cargar el video en MediaRecorder."));
      video.src = url;
    });

    const duration = Number(video.duration) || 1;
    const { width, height } = computeTargetVideoDims(video.videoWidth || 720, video.videoHeight || 1280, targetHeight);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (typeof canvas.captureStream !== "function") {
      throw new Error("captureStream no disponible en este navegador.");
    }

    const canvasStream = canvas.captureStream(APP_CONFIG.VIDEO_TARGET_FPS);
    // Conectar pista de audio a través de WebAudio sin sonar por altavoz
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        audioCtx = new Ctx();
        const srcNode = audioCtx.createMediaElementSource(video);
        const destNode = audioCtx.createMediaStreamDestination();
        srcNode.connect(destNode);
        destNode.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
      } else {
        video.muted = true;
      }
    } catch {
      video.muted = true;
    }

    const bitrate = targetHeight <= 480 ? APP_CONFIG.VIDEO_BITRATE_480 : APP_CONFIG.VIDEO_BITRATE_720;
    const recOpts = { videoBitsPerSecond: bitrate };
    if (chosenMime) recOpts.mimeType = chosenMime;
    const recorder = new MediaRecorder(canvasStream, recOpts);
    const chunks = [];
    recorder.ondataavailable = ev => { if (ev.data && ev.data.size > 0) chunks.push(ev.data); };

    const recDone = new Promise((resolve, reject) => {
      const doneTimer = setTimeout(() => resolve(), 3500);
      recorder.onstop = () => { clearTimeout(doneTimer); resolve(); };
      recorder.onerror = e => { clearTimeout(doneTimer); reject(e?.error || new Error("Error grabando stream comprimido.")); };
    });

    let activeDraw = true;
    const drawLoop = () => {
      if (!activeDraw) return;
      try { ctx.drawImage(video, 0, 0, width, height); } catch {}
      if (onProgress && duration > 0) {
        const pct = Math.min(95, Math.round((video.currentTime / duration) * 95));
        onProgress(pct, `Optimizando video (${targetHeight}p) · ${pct}%`);
      }
      if (!video.paused && !video.ended) requestAnimationFrame(drawLoop);
    };

    recorder.start(500);
    try {
      await video.play();
    } catch {
      video.muted = true;
      await video.play();
    }
    drawLoop();

    await new Promise(resEnd => {
      video.onended = () => resEnd();
      setTimeout(resEnd, Math.ceil((duration + 2) * 1000));
    });
    activeDraw = false;
    if (onProgress) onProgress(97, `Finalizando video (${targetHeight}p)…`);
    if (recorder.state !== "inactive") {
      try { recorder.requestData(); } catch {}
      try { recorder.stop(); } catch {}
    }
    canvasStream.getTracks().forEach(t => { try { t.stop(); } catch {} });
    await recDone;

    const outType = chosenMime.startsWith("video/webm") ? "video/webm" : "video/mp4";
    const outBlob = new Blob(chunks, { type: outType });
    if (outBlob.size < 256) throw new Error("Salida MediaRecorder vacía.");
    if (onProgress) onProgress(100, `Video optimizado (${targetHeight}p) ✅`);
    return outBlob;
  } finally {
    if (audioCtx) { try { audioCtx.close().catch(() => {}); } catch {} }
    try { video.pause(); video.removeAttribute("src"); video.load(); video.remove(); } catch {}
    try { URL.revokeObjectURL(url); } catch {}
  }
}

/**
 * Orquestador de Video V4:
 *   1. Si pesa `< 15 MB` y no se forzó 480p: sube archivo directo con póster instantáneo.
 *   2. Si `>= 15 MB` (o se pidió 480p): comprime con `WebCodecs` + `mp4-muxer` -> fallback `MediaRecorder`.
 *   3. Si tras comprimir supera `28 MB` o falla en Safari, lanza error con `showFallback: true`
 *      para desplegar `#video-compress-fallback` (`#btn-video-compress-480` + `#input-drive-video-link`).
 */
async function processVideoFile(file, { targetHeight = APP_CONFIG.VIDEO_TARGET_HEIGHT, forceCompress = false, onProgress = null } = {}) {
  const rawSizeMb = file.size / (1024 * 1024);
  const poster = await captureVideoPoster(file);

  // Passthrough directo para clips livianos (< 15 MB)
  if (!forceCompress && rawSizeMb < APP_CONFIG.VIDEO_PASSTHROUGH_MB) {
    if (onProgress) onProgress(100, `Video ligero (${rawSizeMb.toFixed(1)} MB) · Listo ⚡`);
    const blobUrl = URL.createObjectURL(file);
    const { dataUrl, base64 } = await readBlobAsBase64(file);
    return {
      mediaType: "video",
      dataUrl,
      blobUrl,
      base64,
      mimeType: file.type || "video/mp4",
      fileName: file.name || `video_${Date.now()}.mp4`,
      posterDataUrl: poster.posterDataUrl,
      posterBase64: poster.posterBase64,
      sizeMb: rawSizeMb.toFixed(1)
    };
  }

  if (onProgress) onProgress(4, `Preparando compresor ${targetHeight}p…`);
  let finalBlob = null;

  const tryCandidate = async fn => {
    try {
      const candidate = await fn();
      if (candidate && await canPlayVideoBlob(candidate)) return candidate;
      console.warn("El video comprimido no pasó la verificación de reproducción en Safari.");
    } catch (e) {
      console.warn("Intento de compresión falló:", e);
    }
    return null;
  };

  finalBlob = await tryCandidate(() => compressVideoWithWebCodecs(file, { targetHeight, includeAudio: true, onProgress }));
  if (!finalBlob) {
    finalBlob = await tryCandidate(() => compressVideoWithWebCodecs(file, { targetHeight, includeAudio: false, onProgress }));
  }
  if (!finalBlob) {
    finalBlob = await tryCandidate(() => compressVideoWithMediaRecorder(file, { targetHeight, onProgress }));
  }

  // Si ningún motor produjo un MP4 reproducible en Safari, usar archivo original solo si <= 28 MB y reproducible
  if (!finalBlob) {
    if (rawSizeMb <= APP_CONFIG.VIDEO_MAX_COMPRESSED_MB && await canPlayVideoBlob(file)) {
      if (onProgress) onProgress(100, `Video directo (${rawSizeMb.toFixed(1)} MB) ✅`);
      finalBlob = file;
    } else {
      const err = new Error(`No se pudo generar un video compatible en este navegador (${rawSizeMb.toFixed(1)} MB). Usa 480p o pega el link de Google Drive.`);
      err.showFallback = true;
      throw err;
    }
  }

  // Si "comprimido" salió más pesado que el original y el original cabe en el límite, usar original
  if (finalBlob && finalBlob.size > file.size && rawSizeMb <= APP_CONFIG.VIDEO_MAX_COMPRESSED_MB && await canPlayVideoBlob(file)) {
    finalBlob = file;
  }

  const finalMb = finalBlob.size / (1024 * 1024);
  if (finalMb > APP_CONFIG.VIDEO_MAX_COMPRESSED_MB) {
    const err = new Error(`Tras comprimir sigue pesando ${finalMb.toFixed(1)} MB (máx. ${APP_CONFIG.VIDEO_MAX_COMPRESSED_MB} MB). Prueba 480p o pega el link de Google Drive.`);
    err.showFallback = true;
    throw err;
  }

  const blobUrl = URL.createObjectURL(finalBlob);
  const { dataUrl, base64 } = await readBlobAsBase64(finalBlob);
  const ext = (finalBlob.type || "").includes("webm") ? "webm" : "mp4";
  return {
    mediaType: "video",
    dataUrl,
    blobUrl,
    base64,
    mimeType: finalBlob.type || "video/mp4",
    fileName: (file.name ? file.name.replace(/\.[^.]+$/, "") : `video_${Date.now()}`) + `_${targetHeight}p.${ext}`,
    posterDataUrl: poster.posterDataUrl,
    posterBase64: poster.posterBase64,
    sizeMb: finalMb.toFixed(1),
    originalMb: rawSizeMb.toFixed(1)
  };
}

/** Construye un objeto de medio instantáneo a partir de un enlace de Google Drive (Plan B). */
function buildDriveVideoMedia(rawUrl) {
  const fileId = extractDriveId(rawUrl);
  if (!fileId) return null;
  const cleanUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const autoPoster = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  return {
    mediaType: "video",
    isDriveLink: true,
    driveFileId: fileId,
    photoUrl: cleanUrl,
    posterUrl: autoPoster,
    posterDataUrl: autoPoster,
    posterBase64: "",
    dataUrl: cleanUrl,
    blobUrl: "",
    base64: "",
    mimeType: "video/mp4",
    fileName: `drive_${fileId}.mp4`,
    sizeMb: "Drive"
  };
}

/** Conecta un selector de foto/video con compresor WebCodecs, barra `<progress>` y Plan B (480p + Drive Link). */
function bindMediaPicker({
  contextKey = "mural",
  inputId, wrapId, imgId, videoId, metaId,
  progressId, progressLabelId, fallbackId, btn480Id, driveInputId,
  onReady
}) {
  const setProgressUI = (pct, labelTxt, visible = true) => {
    const pEl = $(progressId);
    const lEl = $(progressLabelId);
    if (pEl) {
      pEl.value = Math.max(0, Math.min(100, Number(pct) || 0));
      pEl.classList.toggle("is-hidden", !visible);
    }
    if (lEl) {
      lEl.textContent = labelTxt || "";
      lEl.classList.toggle("is-hidden", !visible || !labelTxt);
    }
  };

  const applyPreview = res => {
    onReady(res);
    $(wrapId)?.classList.remove("is-hidden");
    const img = $(imgId), vid = $(videoId);
    if (res.mediaType === "video") {
      if (img) { img.removeAttribute("src"); img.classList.add("is-hidden"); }
      if (vid) {
        if (res.isDriveLink) {
          loadVideoIntoPlayer(vid, null, res);
        } else {
          vid.src = res.blobUrl || res.dataUrl;
          if (res.posterDataUrl) vid.poster = res.posterDataUrl;
          vid.classList.remove("is-hidden");
          try { vid.load(); } catch {}
        }
      }
      setText(metaId, res.isDriveLink
        ? `☁️ Video enlazado desde Drive (ID: ${res.driveFileId.slice(0, 8)}…)`
        : (res.originalMb ? `🎥 Comprimido: ${res.originalMb} MB → ${res.sizeMb} MB` : `🎥 Video listo (${res.sizeMb} MB)`));
    } else {
      if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
      if (img) { img.src = res.dataUrl; img.classList.remove("is-hidden"); }
      setText(metaId, `📷 ${res.originalKb} KB → ${res.compressedKb} KB`);
    }
  };

  const runVideoPipeline = async (file, targetHeight, forceCompress) => {
    $(fallbackId)?.classList.add("is-hidden");
    setProgressUI(2, `Analizando video (${(file.size / 1048576).toFixed(1)} MB)…`, true);
    setText(metaId, `Optimizando video a ${targetHeight}p@30fps…`);
    $(wrapId)?.classList.remove("is-hidden");
    try {
      const res = await processVideoFile(file, {
        targetHeight,
        forceCompress,
        onProgress: (pct, lbl) => setProgressUI(pct, lbl, true)
      });
      applyPreview(res);
      setTimeout(() => setProgressUI(100, "", false), 1400);
    } catch (err) {
      setProgressUI(0, "", false);
      showToast(err.message || "No se pudo comprimir el video.", "error");
      if (err.showFallback || file.size > APP_CONFIG.VIDEO_PASSTHROUGH_MB * 1048576) {
        $(fallbackId)?.classList.remove("is-hidden");
      }
      setText(metaId, "⚠️ Usa la compresión 480p o pega el enlace del video en Google Drive.");
    }
  };

  $(inputId)?.addEventListener("change", async ev => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(file.name || "");
    if (isVideo) {
      lastRawVideoFiles[contextKey] = file;
      await runVideoPipeline(file, APP_CONFIG.VIDEO_TARGET_HEIGHT, false);
    } else {
      lastRawVideoFiles[contextKey] = null;
      $(fallbackId)?.classList.add("is-hidden");
      setProgressUI(0, "", false);
      try {
        setText(metaId, "Optimizando foto…");
        const res = await compressImageFile(file);
        applyPreview(res);
      } catch (err) {
        showToast(err.message || "Error al procesar la imagen.", "error");
        ev.target.value = "";
        $(wrapId)?.classList.add("is-hidden");
        setText(metaId, "");
      }
    }
  });

  // Botón Plan B #1: Re-comprimir en 480p ultra-compacto
  $(btn480Id)?.addEventListener("click", async () => {
    const rawFile = lastRawVideoFiles[contextKey];
    if (!rawFile) return showToast("Selecciona primero el archivo de video.", "info");
    await runVideoPipeline(rawFile, APP_CONFIG.VIDEO_FALLBACK_HEIGHT, true);
  });

  // Input Plan B #2: Enlace directo de Google Drive con extracción de fileId y auto-póster
  $(driveInputId)?.addEventListener("input", ev => {
    const val = ev.target.value.trim();
    if (!val) return;
    const driveMedia = buildDriveVideoMedia(val);
    if (!driveMedia) return;
    $(fallbackId)?.classList.remove("is-hidden");
    applyPreview(driveMedia);
    showToast("☁️ Video de Google Drive vinculado con póster automático", "success");
  });
}

/* --- Anexo B (#6): Buscador de Música tipo Historia de IG (`itunes.apple.com`) --- */

async function searchItunesSongs(term) {
  const q = String(term || "").trim();
  if (!q) return [];
  const url = `${APP_CONFIG.ITUNES_SEARCH_URL}?term=${encodeURIComponent(q)}&entity=song&country=CO&limit=5`;
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return (Array.isArray(data.results) ? data.results : []).map(r => {
    const title = String(r.trackName || "Canción").trim();
    const artist = String(r.artistName || "Artista").trim();
    const art = String(r.artworkUrl100 || r.artworkUrl60 || "").replace("100x100bb", "300x300bb");
    return {
      songTrackId: String(r.trackId || ""),
      songTitle: title,
      songArtist: artist,
      songArtwork: art,
      songPreviewUrl: String(r.previewUrl || ""),
      songSpotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`
    };
  });
}

/** Auto-refresca el `previewUrl` efímero de Apple CDN usando `itunes.apple.com/lookup?id=`. */
async function lookupFreshItunesPreviewUrl(trackId) {
  const cleanId = String(trackId || "").trim();
  if (!cleanId) return "";
  try {
    const resp = await fetch(`${APP_CONFIG.ITUNES_LOOKUP_URL}?id=${encodeURIComponent(cleanId)}&country=CO`);
    if (!resp.ok) return "";
    const data = await resp.json();
    const hit = Array.isArray(data.results) ? data.results.find(r => r.previewUrl) : null;
    return hit ? String(hit.previewUrl) : "";
  } catch {
    return "";
  }
}

function stopModalMusicPreview() {
  const audio = $("music-preview-audio");
  if (audio) {
    try { audio.pause(); audio.currentTime = 0; audio.removeAttribute("src"); } catch {}
  }
  $$(".btn-music-preview.is-playing").forEach(b => {
    b.classList.remove("is-playing");
    b.textContent = "▶️";
  });
  ["mural", "plan"].forEach(p => {
    const b = $(`btn-${p}-music-preview`);
    if (b) { b.classList.remove("is-playing"); b.textContent = "▶️"; }
  });
}

function togglePreviewSnippet(previewUrl, trackId, btnEl) {
  const audio = $("music-preview-audio");
  if (!audio || !previewUrl) return;
  const isSamePlaying = !audio.paused && audio.dataset.trackId === String(trackId);
  stopModalMusicPreview();
  if (isSamePlaying) return;

  audio.dataset.trackId = String(trackId || "");
  audio.src = previewUrl;
  audio.volume = 0.85;
  btnEl?.classList.add("is-playing");
  if (btnEl) btnEl.textContent = "⏸️";

  audio.onended = () => stopModalMusicPreview();
  audio.onerror = async () => {
    if (trackId) {
      const fresh = await lookupFreshItunesPreviewUrl(trackId);
      if (fresh && fresh !== previewUrl) {
        audio.src = fresh;
        audio.play().catch(() => stopModalMusicPreview());
        return;
      }
    }
    stopModalMusicPreview();
  };
  audio.play().catch(() => stopModalMusicPreview());
}

/** Configura el buscador y selector de canción iTunes para `mural` o `plan`. */
function renderSelectedSongInPicker(prefix, songObj) {
  const box = $(`${prefix}-music-selected`);
  const art = $(`${prefix}-music-selected-art`);
  const title = $(`${prefix}-music-selected-title`);
  const artist = $(`${prefix}-music-selected-artist`);
  const results = $(`${prefix}-music-results`);

  if (!songObj || (!songObj.songTitle && !songObj.songPreviewUrl)) {
    box?.classList.add("is-hidden");
    if (art) art.removeAttribute("src");
    if (title) title.textContent = "";
    if (artist) artist.textContent = "";
    return;
  }
  if (art) {
    if (songObj.songArtwork) { art.src = songObj.songArtwork; art.classList.remove("is-hidden"); }
    else art.classList.add("is-hidden");
  }
  if (title) title.textContent = songObj.songTitle || "Canción elegida";
  if (artist) artist.textContent = songObj.songArtist || "";
  box?.classList.remove("is-hidden");
  if (results) results.innerHTML = "";
}

function setupMusicPickerContext(prefix, { getSong, setSong }) {
  const inp = $(`${prefix}-music-search-input`);
  const btnSearch = $(`btn-${prefix}-music-search`);
  const resultsEl = $(`${prefix}-music-results`);
  const btnSelPreview = $(`btn-${prefix}-music-preview`);
  const btnSelClear = $(`btn-${prefix}-music-clear`);

  let cachedResults = [];

  const runSearch = async () => {
    const q = inp?.value.trim() || "";
    if (!q || !resultsEl) return;
    resultsEl.innerHTML = `<p class="settings-hint">🎵 Buscando "${escapeHtml(q)}" en Apple Music…</p>`;
    try {
      cachedResults = await searchItunesSongs(q);
      if (cachedResults.length === 0) {
        resultsEl.innerHTML = `<p class="settings-hint">No encontramos canciones con ese nombre.</p>`;
        return;
      }
      resultsEl.innerHTML = cachedResults.map((track, idx) => `
        <div class="music-result" data-song-idx="${idx}">
          <img class="music-result-art" src="${escapeHtml(track.songArtwork)}" alt="${escapeHtml(track.songTitle)}" loading="lazy">
          <div class="music-result-info">
            <span class="music-result-title">${escapeHtml(track.songTitle)}</span>
            <span class="music-result-artist">${escapeHtml(track.songArtist)}</span>
          </div>
          <button class="btn-music-preview" type="button" data-preview-idx="${idx}" aria-label="Escuchar muestra">▶️</button>
        </div>`).join("");
    } catch (err) {
      console.warn("Error iTunes Search:", err);
      resultsEl.innerHTML = `<p class="settings-hint">⚠️ Sin conexión con iTunes en este momento.</p>`;
    }
  };

  btnSearch?.addEventListener("click", runSearch);
  inp?.addEventListener("keydown", ev => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      runSearch();
    }
  });

  resultsEl?.addEventListener("click", ev => {
    const prevBtn = ev.target.closest("[data-preview-idx]");
    if (prevBtn) {
      ev.stopPropagation();
      const t = cachedResults[Number(prevBtn.dataset.previewIdx)];
      if (t) togglePreviewSnippet(t.songPreviewUrl, t.songTrackId, prevBtn);
      return;
    }
    const row = ev.target.closest("[data-song-idx]");
    if (row) {
      const t = cachedResults[Number(row.dataset.songIdx)];
      if (t) {
        stopModalMusicPreview();
        setSong(t);
        renderSelectedSongInPicker(prefix, t);
        if (inp) inp.value = "";
        showToast(`🎵 "${t.songTitle}" vinculada al recuerdo`, "success");
      }
    }
  });

  btnSelPreview?.addEventListener("click", () => {
    const s = getSong();
    if (s?.songPreviewUrl) togglePreviewSnippet(s.songPreviewUrl, s.songTrackId, btnSelPreview);
  });

  btnSelClear?.addEventListener("click", () => {
    stopModalMusicPreview();
    setSong({ songTrackId: "", songTitle: "", songArtist: "", songArtwork: "", songPreviewUrl: "", songSpotifyUrl: "" });
    renderSelectedSongInPicker(prefix, null);
  });
}

/* ==========================================================================
   7. INICIO V4: MARCADOR ANIMADO, MOOD DEL DÍA, PRÓXIMO ENCUENTRO Y RULETA
   ========================================================================== */

function renderScoreboards() {
  const simon = getUserPuntos("simon");
  const salo = getUserPuntos("salo");
  animateScoreElement("score-simon", simon.puntosTotales);
  animateScoreElement("score-salo", salo.puntosTotales);
  animateScoreElement("premios-score-simon", simon.puntosTotales);
  animateScoreElement("premios-score-salo", salo.puntosTotales);

  const user = getCurrentUser();
  const me = user ? getUserPuntos(user) : null;
  const today = todayLocal();
  const doneToday = me && me.ultimaFechaTrivia === today ? Math.min(APP_CONFIG.TRIVIA_MAX_PER_DAY, me.preguntasRespondidasHoy) : 0;
  setText("trivia-daily-counter", `${doneToday} / ${APP_CONFIG.TRIVIA_MAX_PER_DAY}`);
}

function renderProgressTracker() {
  const plans = getPlans();
  const done = plans.filter(p => p.completed).length;
  const pct = plans.length > 0 ? Math.round((done / plans.length) * 100) : 0;
  setText("progress-count-text", `${done} / ${plans.length} planes completados`);
  setText("progress-percent-text", `${pct}%`);
  if ($("progress-bar-fill")) $("progress-bar-fill").style.width = `${pct}%`;
}

/* --- Anexo B (#1): Mood del Día (`updateMood` + `#banner-mood-alert`) --- */

function getEffectiveTodayMood(puntosRow) {
  if (!puntosRow || !puntosRow.moodActual) return "";
  if (puntosRow.ultimaFechaMood && puntosRow.ultimaFechaMood !== todayLocal()) return "";
  return puntosRow.moodActual;
}

function renderMoodUI() {
  const user = getCurrentUser();
  const partnerId = getPartnerUser(user);
  const simonRow = getUserPuntos("simon");
  const saloRow = getUserPuntos("salo");
  const simonMood = getEffectiveTodayMood(simonRow);
  const saloMood = getEffectiveTodayMood(saloRow);

  setText("mood-status-simon", simonMood ? `🥭 Simón: ${simonMood} ${MOOD_CATALOG[simonMood]?.label || ""}`.trim() : "🥭 Simón: —");
  setText("mood-status-salo", saloMood ? `🌸 Salo: ${saloMood} ${MOOD_CATALOG[saloMood]?.label || ""}`.trim() : "🌸 Salo: —");

  const myMood = user === "simon" ? simonMood : user === "salo" ? saloMood : "";
  setText("pill-mood-user", myMood
    ? `${myMood} ${MOOD_CATALOG[myMood]?.label || "Mi mood"}`
    : "🙂 Mi mood");

  // Banner empático si la pareja está en mood bajito (🥺 o 🌧️)
  const partnerMood = partnerId === "simon" ? simonMood : partnerId === "salo" ? saloMood : "";
  const alertBox = $("banner-mood-alert");
  if (alertBox) {
    if (partnerMood && MOOD_CATALOG[partnerMood]?.low) {
      const pMeta = getUserMeta(partnerId);
      setText("banner-mood-alert-text", `${partnerMood} ${pMeta?.shortName || "Tu pareja"} hoy puso "${MOOD_CATALOG[partnerMood].label}". ¡Mándale un toque o dedícale una frase bonita! 💛`);
      alertBox.classList.remove("is-hidden");
    } else {
      alertBox.classList.add("is-hidden");
    }
  }
}

function setupMoodTracker() {
  $("pill-mood-user")?.addEventListener("click", () => {
    if (!getCurrentUser()) {
      $("identity-modal")?.classList.add("is-open");
      return showToast("Elige quién eres para compartir tu mood de hoy.", "info");
    }
    $("mood-picker")?.classList.toggle("is-hidden");
  });

  $("mood-picker")?.addEventListener("click", async ev => {
    const opt = ev.target.closest(".mood-option");
    if (!opt?.dataset.mood) return;
    const mood = opt.dataset.mood;
    const user = getCurrentUser();
    if (!user) return;

    $("mood-picker")?.classList.add("is-hidden");
    const today = todayLocal();
    const list = getPuntos();
    const me = list.find(r => r.usuario === user);
    if (me) {
      me.moodActual = mood;
      me.ultimaFechaMood = today;
      savePuntos(list);
    }
    renderMoodUI();

    const isLow = Boolean(MOOD_CATALOG[mood]?.low);
    await postToBackend("updateMood", { usuario: user, mood, notify: isLow }, {
      okMsg: isLow ? `${mood} Mood actualizado · Le avisamos con cariño a tu pareja 💛` : `${mood} Mood de hoy guardado`,
      offlineMsg: `${mood} Mood guardado localmente`,
      onSuccess: res => {
        if (Array.isArray(res?.puntos)) { savePuntos(res.puntos); renderMoodUI(); }
      }
    });
  });

  renderMoodUI();
}

/* --- Anexo B (#2): Contador Próximo Encuentro (`setInterval` 1s + confeti en 0) --- */

function updateEncuentroCountdownTick() {
  const cfg = getConfiguracion();
  const rawDate = String(cfg.proximoEncuentroFecha || "").trim();
  const note = String(cfg.proximoEncuentroNota || "").trim();

  setText("countdown-note", note || "Cada segundo nos acerca más 🥭🌸");

  if (!rawDate) {
    setText("countdown-display", "Fija nuestra próxima cita ✨");
    return;
  }

  const target = new Date(rawDate);
  if (Number.isNaN(target.getTime())) {
    setText("countdown-display", formatCleanDate(rawDate) || "Próximo encuentro pronto ✨");
    return;
  }

  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) {
    setText("countdown-display", "🎉 ¡Hoy nos vemos! 🥭🌸");
    // Celebrar con confeti al llegar a 0 (una vez por fecha objetivo dentro de las primeras 24h)
    if (diffMs > -86400000 && lastCelebratedEncuentroKey !== rawDate) {
      lastCelebratedEncuentroKey = rawDate;
      launchConfetti();
      setCoquiPose("celebrate", { jump: true, sparks: true });
    }
    return;
  }

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad2 = n => String(n).padStart(2, "0");
  setText("countdown-display", `${days}d ${pad2(hours)}h ${pad2(mins)}m ${pad2(secs)}s`);
}

function setupProximoEncuentro() {
  updateEncuentroCountdownTick();
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(updateEncuentroCountdownTick, 1000);

  $("btn-edit-encuentro")?.addEventListener("click", () => {
    const form = $("form-encuentro");
    if (!form) return;
    const cfg = getConfiguracion();
    if ($("input-encuentro-date") && cfg.proximoEncuentroFecha) {
      $("input-encuentro-date").value = cfg.proximoEncuentroFecha.slice(0, 16);
    }
    if ($("input-encuentro-note")) $("input-encuentro-note").value = cfg.proximoEncuentroNota || "";
    form.classList.toggle("is-hidden");
  });

  $("btn-cancel-encuentro")?.addEventListener("click", () => {
    $("form-encuentro")?.classList.add("is-hidden");
  });

  $("form-encuentro")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const fecha = $("input-encuentro-date")?.value.trim() || "";
    const nota = $("input-encuentro-note")?.value.trim() || "";
    if (!fecha) return showToast("Selecciona la fecha y hora de nuestro próximo encuentro.", "error");

    const user = getCurrentUser();
    const cfg = getConfiguracion();
    cfg.proximoEncuentroFecha = fecha;
    cfg.proximoEncuentroNota = nota;
    saveConfiguracion(cfg);
    lastCelebratedEncuentroKey = "";
    $("form-encuentro")?.classList.add("is-hidden");
    updateEncuentroCountdownTick();

    await postToBackend("setProximoEncuentro", {
      usuario: user,
      proximoEncuentroFecha: fecha,
      proximoEncuentroNota: nota,
      fecha,
      nota
    }, {
      okMsg: "⏳ ¡Cuenta regresiva activada y compartida con tu pareja! 🥭🌸",
      offlineMsg: "⏳ ¡Cuenta regresiva guardada!",
      onSuccess: res => {
        if (res?.configuracion) {
          saveConfiguracion(res.configuracion);
          updateEncuentroCountdownTick();
        }
      }
    });
  });
}

/* --- La Ruleta del Destino (con vista previa de Portadas Mágicas `coverUrl`) --- */

function setupRuleta() {
  bindFilterBar("ruleta-weather-filter", ".weather-chip", () => { if (!isRuletaRolling) renderRuletaPool(); });
  $("btn-spin-ruleta")?.addEventListener("click", spinRuleta);
  $("btn-open-winner-plan")?.addEventListener("click", () => { if (currentWinnerPlanId) openPlanModal(currentWinnerPlanId); });
  renderRuletaPool();
}

function paintRuletaSlotPlan(p) {
  const slot = $("ruleta-slot-box");
  setText("ruleta-slot-emoji", p.emoji || "✨");
  setText("ruleta-slot-title", p.title);
  setText("ruleta-slot-meta", `${p.category} · ${p.weather} · ${p.energy}`);
  if (slot) {
    let coverImg = slot.querySelector(".ruleta-slot-cover");
    if (p.coverUrl) {
      if (!coverImg) {
        coverImg = document.createElement("img");
        coverImg.className = "ruleta-slot-cover";
        coverImg.alt = "";
        slot.prepend(coverImg);
      }
      coverImg.src = p.coverUrl;
      coverImg.classList.remove("is-hidden");
    } else if (coverImg) {
      coverImg.classList.add("is-hidden");
    }
  }
}

function renderRuletaPool() {
  const weather = document.querySelector("#ruleta-weather-filter .weather-chip.is-active")?.dataset.weather || "Todos";
  const user = getCurrentUser();
  const pool = getPlans().filter(p => !p.completed && !isPlanLocked(p, user) && (weather === "Todos" || p.weather === weather));
  currentRuletaPool = pool;
  setText("ruleta-pool-count", `${pool.length} ${pool.length === 1 ? "plan disponible" : "planes disponibles"}`);
  $("ruleta-winner-actions")?.classList.add("is-hidden");
  currentWinnerPlanId = null;

  const slot = $("ruleta-slot-box");
  slot?.querySelector(".ruleta-slot-cover")?.classList.add("is-hidden");

  const btn = $("btn-spin-ruleta");
  if (pool.length === 0) {
    if (btn) btn.disabled = true;
    setText("ruleta-slot-emoji", "🎉");
    setText("ruleta-slot-title", "Sin planes pendientes aquí");
    setText("ruleta-slot-meta", "Prueba otro clima o añade uno en El Baúl");
  } else if (!isRuletaRolling) {
    if (btn) btn.disabled = false;
    setText("ruleta-slot-emoji", "🎲");
    setText("ruleta-slot-title", "¿Qué haremos hoy?");
    setText("ruleta-slot-meta", "Gira para descubrirlo");
  }
}

function spinRuleta() {
  if (isRuletaRolling || currentRuletaPool.length === 0) return;
  const slot = $("ruleta-slot-box"), btn = $("btn-spin-ruleta"), winBox = $("ruleta-winner-actions");
  isRuletaRolling = true;
  if (btn) btn.disabled = true;
  winBox?.classList.add("is-hidden");
  slot?.classList.add("is-rolling");

  const pool = [...currentRuletaPool];
  const winner = pool[Math.floor(Math.random() * pool.length)];
  const red = reducedMotion();
  const ticker = red ? null : setInterval(() => paintRuletaSlotPlan(pool[Math.floor(Math.random() * pool.length)]), 85);

  setTimeout(() => {
    if (ticker) clearInterval(ticker);
    slot?.classList.remove("is-rolling");
    paintRuletaSlotPlan(winner);
    currentWinnerPlanId = winner.id;
    isRuletaRolling = false;
    if (btn) btn.disabled = false;
    winBox?.classList.remove("is-hidden");
  }, red ? 60 : 1600);
}

/* ==========================================================================
   8. EL BAÚL V4: PORTADAS MÁGICAS (`coverUrl`), MÚSICA IG, RETOS Y SORPRESAS
   ========================================================================== */

function setupBaul() {
  const tabPending = $("baul-tab-pending"), tabCompleted = $("baul-tab-completed");
  const panelPending = $("baul-panel-pending"), panelCompleted = $("baul-panel-completed");

  const switchBaulTab = showCompleted => {
    tabPending?.classList.toggle("is-active", !showCompleted);
    tabPending?.setAttribute("aria-selected", String(!showCompleted));
    tabCompleted?.classList.toggle("is-active", showCompleted);
    tabCompleted?.setAttribute("aria-selected", String(showCompleted));

    panelPending?.classList.toggle("is-active", !showCompleted);
    panelPending?.classList.toggle("is-hidden", showCompleted);
    panelCompleted?.classList.toggle("is-active", showCompleted);
    panelCompleted?.classList.toggle("is-hidden", !showCompleted);
  };

  tabPending?.addEventListener("click", () => switchBaulTab(false));
  tabCompleted?.addEventListener("click", () => switchBaulTab(true));

  bindFilterBar("baul-category-filter", ".category-chip", renderBaul);

  const bindSearch = (inputId, clearId) => {
    const inp = $(inputId), clr = $(clearId);
    inp?.addEventListener("input", () => {
      clr?.classList.toggle("is-hidden", !inp.value);
      renderBaul();
    });
    clr?.addEventListener("click", () => {
      if (inp) inp.value = "";
      clr.classList.add("is-hidden");
      renderBaul();
      inp?.focus();
    });
  };
  bindSearch("search-pending-input", "btn-clear-pending-search");
  bindSearch("search-completed-input", "btn-clear-completed-search");

  const onGridClick = ev => {
    const card = ev.target.closest(".plan-card");
    if (card?.dataset.planId) openPlanModal(card.dataset.planId);
  };
  $("plans-pending-grid")?.addEventListener("click", onGridClick);
  $("plans-completed-grid")?.addEventListener("click", onGridClick);

  $("btn-fab-add-plan")?.addEventListener("click", () => {
    $("form-add-plan")?.reset();
    $("new-plan-winner-group")?.classList.add("is-hidden");
    $("new-plan-unlock-group")?.classList.add("is-hidden");
    $("add-plan-modal")?.classList.add("is-open");
  });

  $("btn-open-movie-protocol")?.addEventListener("click", openMovieProtocolModal);

  setupPlanModals();
  renderBaul();
}

function buildPlanCard(p, user) {
  const locked = isPlanLocked(p, user);
  const card = document.createElement("article");
  card.dataset.planId = p.id;

  if (locked) {
    const creator = getUserMeta(p.creadoPor);
    const creatorName = creator ? creator.shortName : "tu pareja";
    const unlockTxt = formatCleanDate(p.fechaDesbloqueo) || "pronto";
    card.className = "plan-card is-secret-locked card-flip-3d";
    card.innerHTML = `
      <div class="plan-card-head">
        <span class="plan-emoji" aria-hidden="true">🎁</span>
        <h3 class="plan-title">🎁 Plan Sorpresa de ${escapeHtml(creatorName)}</h3>
      </div>
      <div class="plan-badges">
        <span class="plan-badge badge-secreto">⏳ Se desbloquea el ${escapeHtml(unlockTxt)}</span>
      </div>`;
    return card;
  }

  const isRelax = p.category === "Relax";
  const isRain = p.weather === "🌧️";
  card.className = [
    "plan-card",
    p.isVip ? "highlight-card" : "",
    p.completed ? "is-completed" : "",
    p.coverUrl ? "has-cover" : "",
    isRelax ? "is-relax" : "",
    isRain ? "is-rain" : ""
  ].filter(Boolean).join(" ");

  const coverHtml = p.coverUrl
    ? `<div class="plan-card-cover"><img src="${escapeHtml(p.coverUrl)}" alt="${escapeHtml(p.title)}" loading="lazy"></div>`
    : "";

  const winnerBadge = p.isReto && p.ganadorReto
    ? `<span class="plan-badge ${p.ganadorReto === "salo" ? "badge-salo" : p.ganadorReto === "simon" ? "badge-simon" : ""}">${p.ganadorReto === "simon" ? "🏆 Ganó Simón 🥭" : p.ganadorReto === "salo" ? "🏆 Ganó Salo 🌸" : "🤝 Empate"}</span>`
    : (p.isReto ? `<span class="plan-badge badge-reto">🥊 Reto de pareja</span>` : "");

  const secretBadge = p.isSecreto
    ? `<span class="plan-badge badge-secreto">🤫 Sorpresa${p.fechaDesbloqueo ? ` · ${escapeHtml(formatCleanDate(p.fechaDesbloqueo))}` : ""}</span>`
    : "";

  const mediaBadge = p.photoUrl
    ? `<span class="plan-anecdote-badge">${p.mediaType === "video" ? "🎥 Video" : "📷 Foto"}</span>`
    : "";

  const musicBadge = p.songTitle
    ? `<span class="plan-anecdote-badge">🎵 ${escapeHtml(p.songTitle)}</span>`
    : "";

  card.innerHTML = `
    ${coverHtml}
    <div class="plan-card-head">
      <span class="plan-emoji" aria-hidden="true">${escapeHtml(p.emoji || "✨")}</span>
      <h3 class="plan-title">${escapeHtml(p.title)}</h3>
      <span class="plan-status-pill">${p.completed ? "✅ Completado" : "⏳ Pendiente"}</span>
    </div>
    <div class="plan-badges">
      ${p.isVip ? `<span class="plan-vip-badge">VIP · Donde todo empezó</span>` : ""}
      <span class="plan-badge ${isRelax ? "badge-relax" : ""}">${escapeHtml(p.category)}</span>
      <span class="plan-badge ${isRain ? "badge-rain" : ""}">${escapeHtml(p.weather)}</span>
      <span class="plan-badge">${escapeHtml(p.energy)}</span>
      ${winnerBadge}${secretBadge}${mediaBadge}${musicBadge}
      ${p.anecdote ? `<span class="plan-anecdote-badge">📝 Bitácora</span>` : ""}
    </div>`;
  return card;
}

function renderBaul() {
  const user = getCurrentUser();
  const allPlans = getPlans();
  const pendingAll = allPlans.filter(p => !p.completed);
  const completedAll = allPlans.filter(p => p.completed);

  setText("baul-pending-count", String(pendingAll.length));
  setText("baul-completed-count", String(completedAll.length));

  // --- Panel Pendientes ---
  const pendingGrid = $("plans-pending-grid"), pendingEmpty = $("plans-pending-empty");
  if (pendingGrid && pendingEmpty) {
    const cat = document.querySelector("#baul-category-filter .category-chip.is-active")?.dataset.category || "Todos";
    const qPending = normText($("search-pending-input")?.value || "");
    const list = pendingAll
      .filter(p => {
        const locked = isPlanLocked(p, user);
        if (qPending) {
          if (locked) return false;
          return normText(p.title).includes(qPending);
        }
        return cat === "Todos" || (!locked && p.category === cat);
      })
      .sort((a, b) => Number(Boolean(b.isVip)) - Number(Boolean(a.isVip)));

    pendingGrid.innerHTML = "";
    if (list.length === 0) {
      pendingEmpty.classList.remove("is-hidden");
    } else {
      pendingEmpty.classList.add("is-hidden");
      const frag = document.createDocumentFragment();
      list.forEach(p => frag.appendChild(buildPlanCard(p, user)));
      pendingGrid.appendChild(frag);
    }
  }

  // --- Panel Completados ---
  const compGrid = $("plans-completed-grid"), compEmpty = $("plans-completed-empty");
  if (compGrid && compEmpty) {
    const qComp = normText($("search-completed-input")?.value || "");
    const list = completedAll.filter(p => {
      if (!qComp) return true;
      if (isPlanLocked(p, user)) return false;
      return normText(p.title).includes(qComp);
    });

    compGrid.innerHTML = "";
    if (list.length === 0) {
      compEmpty.classList.remove("is-hidden");
    } else {
      compEmpty.classList.add("is-hidden");
      const frag = document.createDocumentFragment();
      list.forEach(p => frag.appendChild(buildPlanCard(p, user)));
      compGrid.appendChild(frag);
    }
  }
}

function getCheckedRadioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function setCheckedRadioValue(name, value) {
  $$(`input[name="${name}"]`).forEach(r => { r.checked = (r.value === value); });
}

function renderPlanCoverInModal(coverUrl) {
  const img = $("plan-cover-preview");
  const wrap = $("plan-cover-wrapper");
  const placeholder = wrap?.querySelector(".cover-placeholder");
  if (coverUrl) {
    if (img) { img.src = coverUrl; img.classList.remove("is-hidden"); }
    placeholder?.classList.add("is-hidden");
  } else {
    if (img) { img.removeAttribute("src"); img.classList.add("is-hidden"); }
    placeholder?.classList.remove("is-hidden");
  }
}

function openPlanModal(planId) {
  const p = getPlans().find(item => item.id === planId);
  const modal = $("plan-modal");
  if (!p || !modal) return;

  stopModalMusicPreview();
  const user = getCurrentUser();
  const locked = isPlanLocked(p, user);
  editingPlanId = p.id;
  pendingPlanMedia = null;
  pendingPlanCover = null;
  pendingPlanSong = normalizeSongFields(p);
  lastRawVideoFiles.plan = null;

  if (locked) {
    const creator = getUserMeta(p.creadoPor);
    const creatorName = creator ? creator.shortName : "tu pareja";
    setText("plan-modal-emoji", "🎁");
    setText("plan-modal-title", `Plan Sorpresa de ${creatorName}`);
    if ($("plan-modal-badges")) $("plan-modal-badges").innerHTML = `<span class="plan-badge badge-secreto">🤫 Secreto</span>`;
    setText("plan-modal-secret-text", `🎁 Plan Sorpresa de ${creatorName} ⏳ Se desbloquea el ${formatCleanDate(p.fechaDesbloqueo) || "pronto"}`);
    $("plan-modal-secret-lock")?.classList.remove("is-hidden");
    $("plan-modal-details")?.classList.add("is-hidden");
    modal.classList.add("is-open");
    return;
  }

  $("plan-modal-secret-lock")?.classList.add("is-hidden");
  $("plan-modal-details")?.classList.remove("is-hidden");

  setText("plan-modal-emoji", p.emoji || "✨");
  setText("plan-modal-title", p.title);
  if ($("plan-modal-badges")) {
    $("plan-modal-badges").innerHTML = `${p.isVip ? `<span class="plan-vip-badge">VIP</span>` : ""}<span class="plan-badge">${escapeHtml(p.category)}</span><span class="plan-badge">${escapeHtml(p.weather)}</span><span class="plan-badge">${escapeHtml(p.energy)}</span>`;
  }

  if ($("plan-edit-title")) $("plan-edit-title").value = p.title;
  if ($("plan-edit-category")) $("plan-edit-category").value = p.category;
  if ($("plan-edit-weather")) $("plan-edit-weather").value = p.weather;
  if ($("plan-edit-energy")) $("plan-edit-energy").value = p.energy;
  if ($("plan-edit-emoji")) $("plan-edit-emoji").value = p.emoji || "✨";

  if ($("plan-modal-completed")) $("plan-modal-completed").checked = Boolean(p.completed);
  setText("plan-modal-status-label", p.completed ? "Completado ✅" : "Pendiente ⏳");

  if ($("plan-is-reto")) $("plan-is-reto").checked = Boolean(p.isReto);
  $("plan-winner-group")?.classList.toggle("is-hidden", !p.isReto);
  setCheckedRadioValue("plan-winner", p.ganadorReto || "");

  if ($("plan-is-secreto")) $("plan-is-secreto").checked = Boolean(p.isSecreto);
  $("plan-unlock-group")?.classList.toggle("is-hidden", !p.isSecreto);
  if ($("plan-unlock-date")) $("plan-unlock-date").value = toIsoDate(p.fechaDesbloqueo);

  if ($("plan-modal-anecdote")) $("plan-modal-anecdote").value = p.anecdote || "";
  if ($("plan-modal-media-input")) $("plan-modal-media-input").value = "";
  if ($("plan-cover-input")) $("plan-cover-input").value = "";
  if ($("input-plan-drive-video-link")) $("input-plan-drive-video-link").value = "";
  setText("plan-modal-media-meta", "");

  // Limpiar UI de compresión de video en el modal
  $("plan-video-compress-progress")?.classList.add("is-hidden");
  $("plan-video-compress-label")?.classList.add("is-hidden");
  $("plan-video-compress-fallback")?.classList.add("is-hidden");

  // Portada Mágica (`coverUrl`)
  renderPlanCoverInModal(p.coverUrl || "");

  // Canción estilo Historia de IG
  if ($("plan-music-search-input")) $("plan-music-search-input").value = "";
  if ($("plan-music-results")) $("plan-music-results").innerHTML = "";
  renderSelectedSongInPicker("plan", p.songTitle ? pendingPlanSong : null);

  const wrap = $("plan-modal-media-wrapper");
  const img = $("plan-modal-photo-preview");
  const vid = $("plan-modal-video-preview");
  if (wrap && img && vid) {
    if (p.photoUrl) {
      wrap.classList.remove("is-hidden");
      if (p.mediaType === "video") {
        img.removeAttribute("src"); img.classList.add("is-hidden");
        loadVideoIntoPlayer(vid, null, p);
      } else {
        vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden");
        img.src = p.photoUrl;
        img.classList.remove("is-hidden");
      }
    } else {
      img.removeAttribute("src"); img.classList.add("is-hidden");
      vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden");
      wrap.classList.add("is-hidden");
    }
  }

  modal.classList.add("is-open");
}

function setupPlanModals() {
  const chkCompleted = $("plan-modal-completed");
  chkCompleted?.addEventListener("change", () => setText("plan-modal-status-label", chkCompleted.checked ? "Completado ✅" : "Pendiente ⏳"));

  $("plan-is-reto")?.addEventListener("change", ev => {
    const on = Boolean(ev.target.checked);
    $("plan-winner-group")?.classList.toggle("is-hidden", !on);
    if (!on) setCheckedRadioValue("plan-winner", "");
  });
  $("new-plan-is-reto")?.addEventListener("change", ev => {
    const on = Boolean(ev.target.checked);
    $("new-plan-winner-group")?.classList.toggle("is-hidden", !on);
    if (!on) setCheckedRadioValue("new-plan-winner", "");
  });

  $("plan-is-secreto")?.addEventListener("change", ev => {
    $("plan-unlock-group")?.classList.toggle("is-hidden", !ev.target.checked);
  });
  $("new-plan-is-secreto")?.addEventListener("change", ev => {
    $("new-plan-unlock-group")?.classList.toggle("is-hidden", !ev.target.checked);
  });

  // Punto 9: Subida de Portada Mágica comprimida en Canvas (`coverUrl`)
  $("plan-cover-input")?.addEventListener("change", async ev => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageFile(file, APP_CONFIG.COVER_MAX_WIDTH, APP_CONFIG.COVER_QUALITY);
      pendingPlanCover = res;
      renderPlanCoverInModal(res.dataUrl);
      showToast(`🖼️ Portada optimizada (${res.compressedKb} KB)`, "success");
    } catch (err) {
      showToast(err.message || "No se pudo cargar la portada.", "error");
      ev.target.value = "";
    }
  });

  // Punto 9: Generar prompt mágico de portada con Dobby (`COUPLE_VISUAL_PROFILE`)
  $("btn-generate-cover-prompt")?.addEventListener("click", () => {
    const title = $("plan-edit-title")?.value.trim() || "Cita romántica";
    const category = $("plan-edit-category")?.value || "Relax";
    const weather = $("plan-edit-weather")?.value || "☀️";
    const energy = $("plan-edit-energy")?.value || "🔋🔋";
    const anecdote = $("plan-modal-anecdote")?.value.trim() || "";
    openDobbyModal("cover_prompt", {
      autoPrompt: `Crea el prompt de portada ilustrada estilo Pixar/acuarela mágica para nuestro plan: "${title}"`,
      contextData: { title, category, weather, energy, anecdote }
    });
  });

  // Selector multimedia del plan + Compresor WebCodecs + Plan B
  bindMediaPicker({
    contextKey: "plan",
    inputId: "plan-modal-media-input",
    wrapId: "plan-modal-media-wrapper",
    imgId: "plan-modal-photo-preview",
    videoId: "plan-modal-video-preview",
    metaId: "plan-modal-media-meta",
    progressId: "plan-video-compress-progress",
    progressLabelId: "plan-video-compress-label",
    fallbackId: "plan-video-compress-fallback",
    btn480Id: "btn-plan-video-compress-480",
    driveInputId: "input-plan-drive-video-link",
    onReady: res => { pendingPlanMedia = res; }
  });

  // Buscador de música iTunes para el plan
  setupMusicPickerContext("plan", {
    getSong: () => pendingPlanSong,
    setSong: s => { pendingPlanSong = normalizeSongFields(s); }
  });

  // Permitir ampliar la foto del plan en Lightbox con su música IG al tocarla
  $("plan-modal-photo-preview")?.addEventListener("click", () => {
    if (!editingPlanId) return;
    const p = getPlans().find(item => item.id === editingPlanId);
    if (!p || !p.photoUrl || p.mediaType === "video") return;
    openLightboxModal({
      ...p,
      ...(pendingPlanSong || {}),
      caption: p.title,
      createdAt: p.updatedAt,
      isFromPlan: true
    });
  });

  // Borrar foto o video de un plan
  $("btn-delete-plan-media")?.addEventListener("click", async () => {
    if (!editingPlanId) return;
    const planId = editingPlanId;
    pendingPlanMedia = null;
    if ($("plan-modal-media-input")) $("plan-modal-media-input").value = "";
    $("plan-modal-photo-preview")?.removeAttribute("src");
    $("plan-modal-photo-preview")?.classList.add("is-hidden");
    const vid = $("plan-modal-video-preview");
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
    $("plan-modal-media-wrapper")?.classList.add("is-hidden");
    setText("plan-modal-media-meta", "");

    const plans = getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx !== -1 && plans[idx].photoUrl) {
      plans[idx] = { ...plans[idx], photoUrl: "", mediaType: "", posterUrl: "" };
      savePlans(plans);
      renderAllViews();
      await postToBackend("deleteMedia", { id: planId, target: "plan" }, {
        okMsg: "Recuerdo borrado y enviado a la papelera de Drive 🗑️",
        offlineMsg: "Foto/video quitado del plan 🗑️"
      });
    }
  });

  // Eliminar plan completo
  $("btn-delete-plan")?.addEventListener("click", async () => {
    if (!editingPlanId) return;
    const planId = editingPlanId;
    const p = getPlans().find(item => item.id === planId);
    if (!p) return;
    if (!window.confirm(`¿Eliminar el plan "${p.title}" para siempre?`)) return;

    savePlans(getPlans().filter(item => item.id !== planId));
    savePersonajes(getPersonajes().map(pj => ({
      ...pj,
      planesVinculados: pj.planesVinculados.filter(id => id !== planId)
    })));
    closeModal("plan-modal");
    renderAllViews();

    await postToBackend("deletePlan", { id: planId }, {
      okMsg: "Plan eliminado del Baúl y de la nube 🗑️",
      offlineMsg: "Plan eliminado del Baúl 🗑️"
    });
  });

  // Guardar cambios del plan (incluye coverUrl, song* y celebración de Coquí)
  $("form-plan-detail")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (!editingPlanId) return;
    const planId = editingPlanId;
    const plans = getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return;

    const prev = plans[idx];
    const title = $("plan-edit-title")?.value.trim() || prev.title;
    const category = $("plan-edit-category")?.value || prev.category;
    const weather = $("plan-edit-weather")?.value || prev.weather;
    const energy = $("plan-edit-energy")?.value || prev.energy;
    const emoji = $("plan-edit-emoji")?.value.trim() || prev.emoji || "✨";
    const completed = Boolean($("plan-modal-completed")?.checked);
    const isReto = Boolean($("plan-is-reto")?.checked);
    const ganadorReto = isReto ? getCheckedRadioValue("plan-winner") : "";
    const isSecreto = Boolean($("plan-is-secreto")?.checked);
    const fechaDesbloqueo = isSecreto ? ($("plan-unlock-date")?.value || "") : "";
    const anecdote = $("plan-modal-anecdote")?.value.trim() || "";

    const media = pendingPlanMedia;
    const cover = pendingPlanCover;
    const song = normalizeSongFields(pendingPlanSong || prev);
    pendingPlanMedia = null;
    pendingPlanCover = null;

    if (isSecreto && !fechaDesbloqueo) {
      return showToast("Elige una fecha de desbloqueo para el plan sorpresa 🤫", "error");
    }

    const user = getCurrentUser();
    if (media?.blobUrl) SESSION_VIDEO_BLOBS.set(planId, media.blobUrl);
    const finalPhotoUrl = media
      ? (media.isDriveLink ? media.photoUrl : (media.mediaType === "video" ? (media.blobUrl || "video-local") : media.dataUrl))
      : prev.photoUrl;
    const finalMediaType = media ? media.mediaType : prev.mediaType;
    const finalPosterUrl = media ? (media.posterUrl || media.posterDataUrl || "") : prev.posterUrl;
    const finalCoverUrl = cover ? cover.dataUrl : prev.coverUrl;
    const creadoPor = prev.creadoPor || (isSecreto ? user : "");

    plans[idx] = normalizePlan({
      ...prev,
      title, category, weather, energy, emoji, completed, anecdote,
      isReto, ganadorReto, isSecreto, fechaDesbloqueo, creadoPor,
      photoUrl: finalPhotoUrl, mediaType: finalMediaType, posterUrl: finalPosterUrl,
      coverUrl: finalCoverUrl,
      ...song,
      updatedAt: formatCleanDate(todayLocal())
    });
    savePlans(plans);

    const justCompleted = !prev.completed && completed;
    const earnedLocally = justCompleted && Boolean(finalPhotoUrl) && Boolean(anecdote) && Boolean(user);
    if (justCompleted) {
      // Punto 10: Coquí celebra al completar un plan
      setCoquiPose("celebrate", { jump: true, sparks: true });
      launchConfetti();
    }
    if (earnedLocally) {
      const pts = getPuntos();
      const me = pts.find(r => r.usuario === user);
      if (me) { me.puntosTotales += APP_CONFIG.PLAN_COMPLETION_POINTS; savePuntos(pts); }
    }

    closeModal("plan-modal");
    renderAllViews();

    const action = justCompleted ? "completePlan" : "updatePlan";
    await postToBackend(action, {
      id: planId,
      usuario: user,
      title, category, weather, energy, emoji, completed, anecdote,
      isReto, ganadorReto, isSecreto, fechaDesbloqueo, creadoPor,
      photoUrl: media?.isDriveLink ? media.photoUrl : undefined,
      posterUrl: media?.isDriveLink ? media.posterUrl : undefined,
      mediaType: media?.isDriveLink ? "video" : undefined,
      mediaBase64: media?.base64 || "",
      mimeType: media?.mimeType || "",
      fileName: media?.fileName || "",
      posterBase64: media?.posterBase64 || "",
      coverBase64: cover?.base64 || "",
      coverMimeType: cover?.mimeType || "",
      coverFileName: cover?.fileName || "",
      ...song
    }, {
      okMsg: earnedLocally ? `🎉 ¡Plan completado con Coquí! +${APP_CONFIG.PLAN_COMPLETION_POINTS} pts ☁️🥭` : "¡Plan guardado en la nube! ☁️🥭",
      offlineMsg: earnedLocally ? `🎉 ¡Plan completado! +${APP_CONFIG.PLAN_COMPLETION_POINTS} pts ✅` : "Plan guardado localmente ✨",
      onSuccess: res => {
        if (res?.plan) {
          const dId = extractDriveId(res.plan.photoUrl);
          if (dId && media?.blobUrl) SESSION_VIDEO_BLOBS.set(dId, media.blobUrl);
          savePlans(getPlans().map(item => (item.id === planId ? normalizePlan(res.plan, item) : item)));
        }
        if (Array.isArray(res?.puntos)) savePuntos(res.puntos);
        renderAllViews();
      }
    });
  });

  // Crear nuevo plan
  $("form-add-plan")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const title = $("new-plan-title")?.value.trim() || "";
    if (!title) return showToast("Escribe un título para el plan.", "error");

    const isReto = Boolean($("new-plan-is-reto")?.checked);
    const ganadorReto = isReto ? getCheckedRadioValue("new-plan-winner") : "";
    const isSecreto = Boolean($("new-plan-is-secreto")?.checked);
    const fechaDesbloqueo = isSecreto ? ($("new-plan-unlock-date")?.value || "") : "";
    if (isSecreto && !fechaDesbloqueo) {
      return showToast("Elige la fecha en la que se desbloquea el plan sorpresa 🤫", "error");
    }

    const user = getCurrentUser();
    const newPlan = normalizePlan({
      id: `plan-${Date.now()}`,
      title,
      category: $("new-plan-category")?.value || "Relax",
      weather: $("new-plan-weather")?.value || "☀️",
      energy: $("new-plan-energy")?.value || "🔋🔋",
      emoji: $("new-plan-emoji")?.value.trim() || "✨",
      isVip: false,
      completed: false,
      anecdote: "",
      photoUrl: "",
      mediaType: "",
      posterUrl: "",
      coverUrl: "",
      isReto,
      ganadorReto,
      isSecreto,
      fechaDesbloqueo,
      creadoPor: user,
      updatedAt: formatCleanDate(todayLocal())
    });

    const plans = getPlans();
    plans.push(newPlan);
    savePlans(plans);
    renderAllViews();
    $("form-add-plan")?.reset();
    closeModal("add-plan-modal");

    await postToBackend("addPlan", { ...newPlan, usuario: user }, {
      okMsg: isSecreto ? "🤫 ¡Plan Secreto guardado y notificación enviada!" : "¡Plan añadido al Baúl y a la nube! ☁️",
      offlineMsg: isSecreto ? "🤫 ¡Plan Secreto añadido al Baúl!" : "¡Nuevo plan añadido al Baúl! 🥭",
      onSuccess: res => {
        if (res?.plan) {
          savePlans(getPlans().map(item => (item.id === newPlan.id ? normalizePlan(res.plan, item) : item)));
          renderAllViews();
        }
      }
    });
  });
}

/* ==========================================================================
   9. EL MURAL V4: FILTROS, FAVORITOS (`toggleFavoriteMural`), PAGINACIÓN 12x12
      Y LIGHTBOX CON REPRODUCTOR MUSICAL IG (`<audio id="lightbox-audio">`)
   ========================================================================== */

function stopLightboxMusic() {
  if (lightboxAudioProgressRaf) {
    cancelAnimationFrame(lightboxAudioProgressRaf);
    lightboxAudioProgressRaf = null;
  }
  const audio = $("lightbox-audio");
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
    } catch {}
  }
  const pill = $("lightbox-music-pill");
  if (pill) {
    pill.classList.add("is-hidden");
    pill.classList.remove("is-paused");
  }
  const prog = $("lightbox-music-progress");
  if (prog) prog.value = 0;
}

/**
 * Anexo B (#6): Inicia música tipo Historia de IG en el Lightbox EXCLUSIVAMENTE para fotos.
 * Si el token CDN de Apple expiró, consulta `itunes.apple.com/lookup?id=` y reanuda automáticamente.
 */
async function startLightboxMusic(item) {
  stopLightboxMusic();
  if (!item || item.mediaType === "video") return;
  if (!item.songTitle && !item.songPreviewUrl && !item.songTrackId) return;

  const pill = $("lightbox-music-pill");
  const art = $("lightbox-music-art");
  const titleEl = $("lightbox-music-title");
  const prog = $("lightbox-music-progress");
  const muteBtn = $("btn-lightbox-music-mute");
  const spotifyLink = $("lightbox-music-spotify");
  const audio = $("lightbox-audio");
  if (!pill || !audio) return;

  if (art) {
    if (item.songArtwork) { art.src = item.songArtwork; art.classList.remove("is-hidden"); }
    else art.classList.add("is-hidden");
  }
  if (titleEl) {
    titleEl.textContent = item.songArtist
      ? `${item.songTitle} · ${item.songArtist}`
      : (item.songTitle || "Canción del recuerdo");
  }
  if (spotifyLink) {
    spotifyLink.href = item.songSpotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(`${item.songTitle} ${item.songArtist}`.trim())}`;
  }
  if (prog) prog.value = 0;
  pill.classList.remove("is-hidden", "is-paused");

  let activeUrl = item.songPreviewUrl;
  if (!activeUrl && item.songTrackId) {
    activeUrl = await lookupFreshItunesPreviewUrl(item.songTrackId);
  }
  if (!activeUrl) {
    pill.classList.add("is-paused");
    return;
  }

  let refreshedOnce = false;
  audio.muted = false;
  if (muteBtn) muteBtn.textContent = "🔊";

  audio.ontimeupdate = () => {
    if (prog && audio.duration > 0) {
      prog.value = Math.min(100, Math.round((audio.currentTime / audio.duration) * 100));
    }
  };

  audio.onerror = async () => {
    if (refreshedOnce || !item.songTrackId) {
      pill.classList.add("is-paused");
      return;
    }
    refreshedOnce = true;
    const freshUrl = await lookupFreshItunesPreviewUrl(item.songTrackId);
    if (freshUrl && freshUrl !== activeUrl) {
      activeUrl = freshUrl;
      // Persistir la URL renovada en caché local para próximas aperturas
      if (item.isFromPlan) {
        savePlans(getPlans().map(p => (p.id === item.id ? { ...p, songPreviewUrl: freshUrl } : p)));
      } else {
        saveMural(getMural().map(m => (m.id === item.id ? { ...m, songPreviewUrl: freshUrl } : m)));
      }
      audio.src = freshUrl;
      audio.play().then(() => pill.classList.remove("is-paused")).catch(() => pill.classList.add("is-paused"));
    } else {
      pill.classList.add("is-paused");
    }
  };

  audio.src = activeUrl;
  audio.play()
    .then(() => { pill.classList.remove("is-paused"); })
    .catch(() => {
      // Si el navegador bloquea autoplay hasta toque, marcar EQ en pausa para que el botón 🔊 lo active
      pill.classList.add("is-paused");
      if (muteBtn) muteBtn.textContent = "▶️";
    });
}

function updateLightboxFavoriteBtnUI(isFav, visible = true) {
  const btn = $("btn-lightbox-favorite");
  if (!btn) return;
  btn.classList.toggle("is-hidden", !visible);
  btn.classList.toggle("is-favorite", Boolean(isFav));
  btn.setAttribute("aria-pressed", String(Boolean(isFav)));
  btn.textContent = isFav ? "⭐" : "☆";
}

function openLightboxModal(item) {
  if (!item) return;
  currentLightboxItem = item;
  currentLightboxItemId = item.isFromPlan ? null : item.id;

  const img = $("lightbox-img"), vid = $("lightbox-video"), iframe = $("lightbox-iframe");
  const delBtn = $("btn-delete-mural-item");
  delBtn?.classList.toggle("is-hidden", Boolean(item.isFromPlan));
  updateLightboxFavoriteBtnUI(Boolean(item.isFavorite), !item.isFromPlan);

  if (item.mediaType === "video") {
    // Regla estricta Anexo B: en videos la música del Lightbox SIEMPRE está pausada y oculta
    stopLightboxMusic();
    if (img) { img.removeAttribute("src"); img.classList.add("is-hidden"); }
    loadVideoIntoPlayer(vid, iframe, item);
  } else {
    if (iframe) { iframe.src = "about:blank"; iframe.classList.add("is-hidden"); }
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
    if (img) { img.src = item.photoUrl; img.classList.remove("is-hidden"); }
    startLightboxMusic(item);
  }

  setText("lightbox-caption", item.caption || "");
  setText("lightbox-date", formatCleanDate(item.createdAt));
  $("lightbox-modal")?.classList.add("is-open");
}

async function handleToggleMuralFavorite(muralId) {
  if (!muralId) return;
  const list = getMural();
  const idx = list.findIndex(m => m.id === muralId);
  if (idx === -1) return;

  const nextFav = !list[idx].isFavorite;
  list[idx] = { ...list[idx], isFavorite: nextFav };
  saveMural(list);

  if (currentLightboxItemId === muralId && currentLightboxItem) {
    currentLightboxItem.isFavorite = nextFav;
    updateLightboxFavoriteBtnUI(nextFav, true);
  }
  renderMural();

  await postToBackend("toggleFavoriteMural", {
    id: muralId,
    isFavorite: nextFav,
    usuario: getCurrentUser()
  }, {
    silent: true,
    onSuccess: res => {
      if (res?.item) {
        saveMural(getMural().map(m => (m.id === muralId ? normalizeMuralItem(res.item, m) : m)));
        renderMural();
      }
    }
  });
}

function setupMural() {
  $("btn-upload-mural")?.addEventListener("click", () => {
    stopModalMusicPreview();
    pendingMuralMedia = null;
    pendingMuralSong = null;
    lastRawVideoFiles.mural = null;
    $("form-mural-upload")?.reset();
    if ($("mural-date-input")) $("mural-date-input").value = todayLocal();
    if ($("input-drive-video-link")) $("input-drive-video-link").value = "";
    if ($("mural-music-search-input")) $("mural-music-search-input").value = "";
    if ($("mural-music-results")) $("mural-music-results").innerHTML = "";
    renderSelectedSongInPicker("mural", null);

    $("video-compress-progress")?.classList.add("is-hidden");
    $("video-compress-label")?.classList.add("is-hidden");
    $("video-compress-fallback")?.classList.add("is-hidden");
    $("mural-preview-wrapper")?.classList.add("is-hidden");
    $("mural-preview-img")?.removeAttribute("src");
    $("mural-preview-img")?.classList.add("is-hidden");
    const vid = $("mural-preview-video");
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
    setText("mural-media-meta", "");
    $("mural-upload-modal")?.classList.add("is-open");
  });

  bindMediaPicker({
    contextKey: "mural",
    inputId: "mural-media-input",
    wrapId: "mural-preview-wrapper",
    imgId: "mural-preview-img",
    videoId: "mural-preview-video",
    metaId: "mural-media-meta",
    progressId: "video-compress-progress",
    progressLabelId: "video-compress-label",
    fallbackId: "video-compress-fallback",
    btn480Id: "btn-video-compress-480",
    driveInputId: "input-drive-video-link",
    onReady: res => { pendingMuralMedia = res; }
  });

  setupMusicPickerContext("mural", {
    getSong: () => pendingMuralSong,
    setSong: s => { pendingMuralSong = normalizeSongFields(s); }
  });

  // Filtros del Mural: Todos | Fotos | Videos | Favoritos
  bindFilterBar("mural-filter-chips", ".category-chip", chip => {
    muralActiveFilter = chip.dataset.filter || "todos";
    muralVisibleCount = APP_CONFIG.MURAL_PAGE_SIZE;
    renderMural();
  });

  // Paginación 12 en 12
  $("btn-mural-load-more")?.addEventListener("click", () => {
    muralVisibleCount += APP_CONFIG.MURAL_PAGE_SIZE;
    renderMural();
  });

  $("form-mural-upload")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (!pendingMuralMedia) return showToast("Selecciona primero una foto, un video o pega un enlace de Drive.", "error");
    const media = pendingMuralMedia;
    const song = normalizeSongFields(pendingMuralSong || {});
    pendingMuralMedia = null;
    pendingMuralSong = null;
    stopModalMusicPreview();

    const id = `mural-${Date.now()}`;
    const caption = $("mural-caption-input")?.value.trim() || "Recuerdo de Mango & Primavera";
    const rawDate = $("mural-date-input")?.value || todayLocal();
    const cleanDate = formatCleanDate(rawDate);
    const user = getCurrentUser();

    if (media.blobUrl) SESSION_VIDEO_BLOBS.set(id, media.blobUrl);

    const newItem = normalizeMuralItem({
      id,
      caption,
      createdAt: cleanDate,
      photoUrl: media.isDriveLink ? media.photoUrl : (media.mediaType === "video" ? (media.blobUrl || "") : media.dataUrl),
      mediaType: media.mediaType,
      posterUrl: media.posterUrl || media.posterDataUrl || "",
      creadoPor: user,
      isFavorite: false,
      blobUrl: media.blobUrl || "",
      ...song
    });
    saveMural([newItem, ...getMural()]);
    renderMural();
    $("form-mural-upload")?.reset();
    $("mural-preview-wrapper")?.classList.add("is-hidden");
    closeModal("mural-upload-modal");

    await postToBackend("addMuralPhoto", {
      id,
      caption,
      createdAt: rawDate,
      creadoPor: user,
      usuario: user,
      isFavorite: false,
      photoUrl: media.isDriveLink ? media.photoUrl : undefined,
      posterUrl: media.isDriveLink ? media.posterUrl : undefined,
      mediaType: media.mediaType,
      mediaBase64: media.base64 || "",
      mimeType: media.mimeType || "",
      fileName: media.fileName || "",
      posterBase64: media.posterBase64 || "",
      ...song
    }, {
      okMsg: media.mediaType === "video" ? "¡Video subido al Mural y guardado en Drive! ☁️🎥" : "¡Foto subida al Mural y guardada en Drive! ☁️📸",
      offlineMsg: "¡Recuerdo guardado en El Mural! 🌸",
      onSuccess: res => {
        if (res?.item || res?.photoUrl) {
          const cloudPhotoUrl = res.photoUrl || res.item?.photoUrl || "";
          const dId = extractDriveId(cloudPhotoUrl);
          if (dId && media.blobUrl) SESSION_VIDEO_BLOBS.set(dId, media.blobUrl);
          saveMural(getMural().map(m => (m.id === id ? normalizeMuralItem({
            ...m,
            ...(res.item || {}),
            photoUrl: cloudPhotoUrl || m.photoUrl,
            posterUrl: res.posterUrl || res.item?.posterUrl || m.posterUrl,
            createdAt: formatCleanDate(res.item?.createdAt || m.createdAt)
          }, m) : m)));
          renderMural();
        }
      }
    });
  });

  // Clic en tarjeta del Mural (estrella de favorito vs apertura de Lightbox)
  $("mural-grid")?.addEventListener("click", ev => {
    const favBtn = ev.target.closest("[data-fav-mural-id]");
    if (favBtn) {
      ev.stopPropagation();
      handleToggleMuralFavorite(favBtn.dataset.favMuralId);
      return;
    }
    const card = ev.target.closest(".mural-card");
    const item = getMural().find(m => m.id === card?.dataset.muralId);
    if (item) openLightboxModal(item);
  });

  // Estrella de favorito dentro del Lightbox
  $("btn-lightbox-favorite")?.addEventListener("click", () => {
    if (currentLightboxItemId) handleToggleMuralFavorite(currentLightboxItemId);
  });

  // Silenciar / reanudar música en Lightbox
  $("btn-lightbox-music-mute")?.addEventListener("click", () => {
    const audio = $("lightbox-audio");
    const pill = $("lightbox-music-pill");
    const btn = $("btn-lightbox-music-mute");
    if (!audio) return;
    if (audio.paused) {
      audio.muted = false;
      audio.play().then(() => {
        pill?.classList.remove("is-paused");
        if (btn) btn.textContent = "🔊";
      }).catch(() => {});
      return;
    }
    audio.muted = !audio.muted;
    pill?.classList.toggle("is-paused", audio.muted);
    if (btn) btn.textContent = audio.muted ? "🔇" : "🔊";
  });

  // Borrar elemento del Mural desde Lightbox
  $("btn-delete-mural-item")?.addEventListener("click", async () => {
    if (!currentLightboxItemId) return;
    const itemId = currentLightboxItemId;
    if (!window.confirm("¿Eliminar este recuerdo del Mural?")) return;

    saveMural(getMural().filter(m => m.id !== itemId));
    closeModal("lightbox-modal");
    renderMural();

    await postToBackend("deleteMedia", { id: itemId, target: "mural" }, {
      okMsg: "Recuerdo eliminado del Mural y de Drive 🗑️",
      offlineMsg: "Recuerdo eliminado del Mural 🗑️"
    });
  });

  renderMural();
}

function getFilteredMuralItems() {
  const all = getMural();
  if (muralActiveFilter === "fotos") return all.filter(m => m.mediaType !== "video");
  if (muralActiveFilter === "videos") return all.filter(m => m.mediaType === "video");
  if (muralActiveFilter === "favoritos") return all.filter(m => Boolean(m.isFavorite));
  return all;
}

function renderMural() {
  const grid = $("mural-grid"), empty = $("mural-empty"), loadMoreBtn = $("btn-mural-load-more");
  if (!grid || !empty) return;
  const filtered = getFilteredMuralItems();
  grid.innerHTML = "";

  if (filtered.length === 0) {
    empty.classList.remove("is-hidden");
    loadMoreBtn?.classList.add("is-hidden");
    return;
  }
  empty.classList.add("is-hidden");

  const visibleSlice = filtered.slice(0, muralVisibleCount);
  const frag = document.createDocumentFragment();

  visibleSlice.forEach(item => {
    const card = document.createElement("article");
    card.className = ["mural-card", item.isFavorite ? "is-favorite" : ""].filter(Boolean).join(" ");
    card.dataset.muralId = item.id;

    const isVideo = item.mediaType === "video";
    const mediaHtml = isVideo
      ? `<div class="mural-media video-card"><img class="video-poster" src="${escapeHtml(getEffectivePoster(item))}" alt="${escapeHtml(item.caption || "Video recuerdo")}" loading="lazy"></div>`
      : `<div class="mural-media"><img src="${escapeHtml(item.photoUrl)}" alt="${escapeHtml(item.caption || "Recuerdo")}" loading="lazy"></div>`;

    const songChip = (!isVideo && item.songTitle)
      ? `<span class="mural-song-tag">🎵 ${escapeHtml(item.songTitle)}</span>`
      : "";

    card.innerHTML = `
      <button class="mural-fav-btn ${item.isFavorite ? "is-favorite" : ""}" type="button" data-fav-mural-id="${escapeHtml(item.id)}" aria-pressed="${String(Boolean(item.isFavorite))}" aria-label="Marcar favorito">${item.isFavorite ? "⭐" : "☆"}</button>
      ${mediaHtml}
      <div class="mural-card-body">
        ${songChip}
        <p class="mural-caption">${escapeHtml(item.caption || "")}</p>
        <span class="mural-date">${escapeHtml(formatCleanDate(item.createdAt))}</span>
      </div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);

  if (loadMoreBtn) {
    const remaining = filtered.length - visibleSlice.length;
    loadMoreBtn.classList.toggle("is-hidden", remaining <= 0);
    if (remaining > 0) {
      loadMoreBtn.textContent = `Cargar más recuerdos (${remaining} más) ⬇️`;
    }
  }
}

/* ==========================================================================
   10. PREMIOS V4: TIENDA DE CUPONES + DOBBY PREMIOS + CELEBRACIÓN DE COQUÍ
   ========================================================================== */

function setupPremios() {
  $("btn-add-coupon")?.addEventListener("click", () => openCouponModal(null));

  // Punto 2/6: Botón directo para que Dobby invente premios personalizados
  $("btn-dobby-prizes")?.addEventListener("click", () => {
    openDobbyModal("prizes", {
      autoPrompt: "¡Inventa 3 cupones románticos, divertidos y creativos para nuestra tienda de premios!"
    });
  });

  $("coupons-catalog-grid")?.addEventListener("click", ev => {
    const editBtn = ev.target.closest(".coupon-edit-btn");
    if (editBtn?.dataset.couponId) { openCouponModal(editBtn.dataset.couponId); return; }
    const redeemBtn = ev.target.closest(".coupon-redeem-btn");
    if (redeemBtn?.dataset.couponId) handleRedeemCoupon(redeemBtn.dataset.couponId);
  });

  $("coupons-redeemed-list")?.addEventListener("click", ev => {
    const fulfillBtn = ev.target.closest(".coupon-fulfill-btn");
    if (fulfillBtn?.dataset.couponId) handleCouponStateOp(fulfillBtn.dataset.couponId, "fulfill");
    const reactivateBtn = ev.target.closest(".coupon-reactivate-btn");
    if (reactivateBtn?.dataset.couponId) handleCouponStateOp(reactivateBtn.dataset.couponId, "reactivate");
  });

  $("form-coupon")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const id = $("coupon-id")?.value.trim() || "";
    const titulo = $("coupon-title")?.value.trim() || "";
    const descripcion = $("coupon-description")?.value.trim() || "";
    const costoPuntos = Math.max(0, Number($("coupon-cost")?.value) || 0);
    const icono = $("coupon-icon")?.value.trim() || "🎟️";
    if (!titulo) return showToast("Escribe un título para el cupón.", "error");

    const op = id ? "update" : "create";
    const list = getCupones();
    const itemId = id || `cup-${Date.now()}`;
    const item = { id: itemId, titulo, descripcion, costoPuntos, icono, estado: "disponible", canjeadoPor: "", fechaCanje: "" };

    if (id) {
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) list[idx] = { ...list[idx], titulo, descripcion, costoPuntos, icono };
    } else {
      list.push(item);
    }
    saveCupones(list);
    closeModal("coupon-modal");
    renderPremios();

    await postToBackend("manageCoupon", { op, item }, {
      okMsg: id ? "Cupón actualizado ☁️🎟️" : "Nuevo cupón añadido a la tienda ☁️🎟️",
      offlineMsg: id ? "Cupón actualizado 🎟️" : "Nuevo cupón creado 🎟️",
      onSuccess: res => { if (Array.isArray(res?.cupones)) { saveCupones(res.cupones); renderPremios(); } }
    });
  });

  $("btn-delete-coupon")?.addEventListener("click", async () => {
    const id = $("coupon-id")?.value.trim() || "";
    if (!id || !window.confirm("¿Eliminar este cupón de la tienda?")) return;
    saveCupones(getCupones().filter(c => c.id !== id));
    closeModal("coupon-modal");
    renderPremios();
    await postToBackend("manageCoupon", { op: "delete", item: { id } }, {
      okMsg: "Cupón eliminado 🗑️",
      offlineMsg: "Cupón eliminado 🗑️",
      onSuccess: res => { if (Array.isArray(res?.cupones)) { saveCupones(res.cupones); renderPremios(); } }
    });
  });

  renderPremios();
}

function openCouponModal(couponId) {
  const modal = $("coupon-modal");
  if (!modal) return;
  const c = couponId ? getCupones().find(item => item.id === couponId) : null;
  setText("coupon-modal-title", c ? "Editar cupón" : "Nuevo cupón");
  if ($("coupon-id")) $("coupon-id").value = c ? c.id : "";
  if ($("coupon-icon")) $("coupon-icon").value = c ? c.icono : "🎟️";
  if ($("coupon-cost")) $("coupon-cost").value = c ? String(c.costoPuntos) : "50";
  if ($("coupon-title")) $("coupon-title").value = c ? c.titulo : "";
  if ($("coupon-description")) $("coupon-description").value = c ? c.descripcion : "";
  $("btn-delete-coupon")?.classList.toggle("is-hidden", !c);
  modal.classList.add("is-open");
}

async function handleRedeemCoupon(couponId) {
  const user = getCurrentUser();
  if (!user) {
    $("identity-modal")?.classList.add("is-open");
    return showToast("Elige quién eres para canjear un cupón.", "info");
  }
  const list = getCupones();
  const c = list.find(item => item.id === couponId);
  if (!c || c.estado !== "disponible") return;

  const pts = getPuntos();
  const me = pts.find(p => p.usuario === user);
  if (!me || me.puntosTotales < c.costoPuntos) {
    return showToast(`Necesitas ${c.costoPuntos} pts (tienes ${me?.puntosTotales || 0} pts).`, "error");
  }
  if (!window.confirm(`¿Canjear "${c.titulo}" por ${c.costoPuntos} pts?`)) return;

  me.puntosTotales -= c.costoPuntos;
  c.estado = "canjeado";
  c.canjeadoPor = user;
  c.fechaCanje = formatCleanDate(todayLocal());
  savePuntos(pts);
  saveCupones(list);

  // Punto 10: Coquí celebra el canje del cupón
  setCoquiPose("celebrate", { jump: true, sparks: true });
  launchConfetti();
  renderScoreboards();
  renderPremios();

  await postToBackend("redeemCoupon", { id: couponId, usuario: user }, {
    okMsg: `🎟️ ¡Canjeaste "${c.titulo}"! Coquí ya le avisó a tu pareja 😏`,
    offlineMsg: `🎟️ ¡Cupón "${c.titulo}" canjeado!`,
    onSuccess: res => {
      if (Array.isArray(res?.puntos)) savePuntos(res.puntos);
      if (res?.cupon) saveCupones(getCupones().map(item => (item.id === couponId ? res.cupon : item)));
      renderScoreboards();
      renderPremios();
    },
    onError: () => syncWithBackend(false)
  });
}

async function handleCouponStateOp(couponId, op) {
  const list = getCupones();
  const c = list.find(item => item.id === couponId);
  if (!c) return;
  if (op === "fulfill") c.estado = "cumplido";
  if (op === "reactivate") { c.estado = "disponible"; c.canjeadoPor = ""; c.fechaCanje = ""; }
  saveCupones(list);
  renderPremios();

  await postToBackend("manageCoupon", { op, item: { id: couponId } }, {
    okMsg: op === "fulfill" ? "✅ ¡Cupón marcado como cumplido!" : "♻️ Cupón devuelto a la tienda",
    offlineMsg: op === "fulfill" ? "✅ Cupón cumplido" : "♻️ Cupón reactivado",
    onSuccess: res => { if (Array.isArray(res?.cupones)) { saveCupones(res.cupones); renderPremios(); } }
  });
}

function renderPremios() {
  renderScoreboards();
  const catGrid = $("coupons-catalog-grid"), catEmpty = $("coupons-catalog-empty");
  const redList = $("coupons-redeemed-list"), redEmpty = $("coupons-redeemed-empty");
  if (!catGrid || !redList) return;

  const user = getCurrentUser();
  const myBalance = user ? getUserPuntos(user).puntosTotales : 0;
  const all = getCupones();
  const available = all.filter(c => c.estado === "disponible");
  const redeemed = all.filter(c => c.estado !== "disponible");

  catGrid.innerHTML = "";
  if (available.length === 0) {
    catEmpty?.classList.remove("is-hidden");
  } else {
    catEmpty?.classList.add("is-hidden");
    const frag = document.createDocumentFragment();
    available.forEach(c => {
      const canAfford = !user || myBalance >= c.costoPuntos;
      const card = document.createElement("article");
      card.className = "coupon-card";
      card.innerHTML = `
        <span class="coupon-icon" aria-hidden="true">${escapeHtml(c.icono || "🎟️")}</span>
        <h4 class="coupon-title">${escapeHtml(c.titulo)}</h4>
        <p class="coupon-desc">${escapeHtml(c.descripcion)}</p>
        <div class="coupon-footer">
          <span class="coupon-cost">⭐ ${c.costoPuntos} pts</span>
          <div class="coupon-actions">
            <button class="coupon-edit-btn" type="button" data-coupon-id="${escapeHtml(c.id)}" aria-label="Editar cupón">✏️</button>
            <button class="coupon-redeem-btn" type="button" data-coupon-id="${escapeHtml(c.id)}" ${canAfford ? "" : "disabled"}>Canjear</button>
          </div>
        </div>`;
      frag.appendChild(card);
    });
    catGrid.appendChild(frag);
  }

  redList.innerHTML = "";
  if (redeemed.length === 0) {
    redEmpty?.classList.remove("is-hidden");
  } else {
    redEmpty?.classList.add("is-hidden");
    const frag = document.createDocumentFragment();
    redeemed.forEach(c => {
      const fulfilled = c.estado === "cumplido";
      const byMeta = getUserMeta(c.canjeadoPor);
      const item = document.createElement("article");
      item.className = ["coupon-redeemed-item", fulfilled ? "is-fulfilled" : "", c.canjeadoPor === "salo" ? "is-by-salo" : ""].filter(Boolean).join(" ");
      item.innerHTML = `
        <span class="coupon-icon" aria-hidden="true">${escapeHtml(c.icono || "🎟️")}</span>
        <div class="coupon-redeemed-main">
          <p class="coupon-redeemed-title">${escapeHtml(c.titulo)}</p>
          <p class="coupon-redeemed-meta">${byMeta ? `${byMeta.emoji} ${byMeta.shortName}` : "Canjeado"}${c.fechaCanje ? ` · ${escapeHtml(formatCleanDate(c.fechaCanje))}` : ""}</p>
        </div>
        <div class="coupon-actions">
          ${fulfilled
            ? `<span class="coupon-state-pill">✅ Cumplido</span><button class="coupon-edit-btn coupon-reactivate-btn" type="button" data-coupon-id="${escapeHtml(c.id)}" title="Volver a tienda" aria-label="Volver a tienda">♻️</button>`
            : `<button class="btn btn-soft btn-sm coupon-fulfill-btn" type="button" data-coupon-id="${escapeHtml(c.id)}">✓ Cumplir</button>`}
        </div>`;
      frag.appendChild(item);
    });
    redList.appendChild(frag);
  }
}

/* ==========================================================================
   11. EL REPARTO V4: MARCADOR HISTÓRICO DE RETOS + FICHAS DE PERSONAJES
   ========================================================================== */

function setupReparto() {
  $("btn-add-actor")?.addEventListener("click", () => openActorModal(null));

  const onCastClick = ev => {
    const card = ev.target.closest(".cast-card");
    if (card?.dataset.actorId) openActorModal(card.dataset.actorId);
  };
  $("protagonists-grid")?.addEventListener("click", onCastClick);
  $("actors-grid")?.addEventListener("click", onCastClick);

  $("actor-photo-input")?.addEventListener("change", async ev => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageFile(file);
      pendingActorPhoto = res;
      if ($("actor-photo-img")) { $("actor-photo-img").src = res.dataUrl; $("actor-photo-img").classList.remove("is-hidden"); }
      $("actor-photo-placeholder")?.classList.add("is-hidden");
    } catch (err) {
      showToast(err.message || "Error al cargar la foto.", "error");
      ev.target.value = "";
    }
  });

  $("form-actor")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const id = $("actor-id")?.value.trim() || "";
    const nombre = $("actor-name")?.value.trim() || "";
    if (!nombre) return showToast("Escribe el nombre del personaje.", "error");

    const tipo = $("actor-type")?.value === "protagonista" ? "protagonista" : "secundario";
    const rol = $("actor-role")?.value.trim() || "";
    const superpoder = $("actor-superpower")?.value.trim() || "";
    const debilidad = $("actor-weakness")?.value.trim() || "";
    const planesVinculados = Array.from($$("#actor-plans-checklist input[type='checkbox']:checked")).map(cb => cb.value);
    const photo = pendingActorPhoto;
    pendingActorPhoto = null;

    const op = id ? "update" : "create";
    const list = getPersonajes();
    const itemId = id || `pj-${Date.now()}`;
    const existing = list.find(p => p.id === id);
    const record = {
      id: itemId,
      nombre,
      tipo: existing?.tipo === "protagonista" ? "protagonista" : tipo,
      rol,
      superpoder,
      debilidad,
      photoUrl: photo ? photo.dataUrl : (existing?.photoUrl || ""),
      planesVinculados
    };

    if (id && existing) {
      savePersonajes(list.map(p => (p.id === id ? record : p)));
    } else {
      savePersonajes([...list, record]);
    }
    closeModal("actor-modal");
    renderReparto();

    await postToBackend("managePersonajes", {
      op,
      item: {
        ...record,
        photoBase64: photo?.base64 || "",
        mimeType: photo?.mimeType || "",
        fileName: photo?.fileName || ""
      }
    }, {
      okMsg: id ? "Ficha del personaje actualizada ☁️🎭" : "Personaje añadido al Reparto ☁️🎭",
      offlineMsg: id ? "Ficha actualizada 🎭" : "Personaje añadido 🎭",
      onSuccess: res => { if (Array.isArray(res?.personajes)) { savePersonajes(res.personajes); renderReparto(); } }
    });
  });

  $("btn-delete-actor")?.addEventListener("click", async () => {
    const id = $("actor-id")?.value.trim() || "";
    if (!id || !window.confirm("¿Eliminar este actor del Reparto?")) return;
    savePersonajes(getPersonajes().filter(p => p.id !== id));
    closeModal("actor-modal");
    renderReparto();
    await postToBackend("managePersonajes", { op: "delete", item: { id } }, {
      okMsg: "Actor eliminado del Reparto 🗑️",
      offlineMsg: "Actor eliminado 🗑️",
      onSuccess: res => { if (Array.isArray(res?.personajes)) { savePersonajes(res.personajes); renderReparto(); } }
    });
  });

  renderReparto();
}

function openActorModal(actorId) {
  const modal = $("actor-modal");
  if (!modal) return;
  pendingActorPhoto = null;
  const pj = actorId ? getPersonajes().find(p => p.id === actorId) : null;
  const isProtag = pj?.tipo === "protagonista";

  setText("actor-modal-title", pj ? `Editar a ${pj.nombre}` : "Nuevo actor");
  if ($("actor-id")) $("actor-id").value = pj ? pj.id : "";
  if ($("actor-type")) $("actor-type").value = pj ? pj.tipo : "secundario";
  $("actor-type-group")?.classList.toggle("is-hidden", Boolean(isProtag));
  if ($("actor-name")) $("actor-name").value = pj ? pj.nombre : "";
  if ($("actor-role")) $("actor-role").value = pj ? pj.rol : "";
  if ($("actor-superpower")) $("actor-superpower").value = pj ? pj.superpoder : "";
  if ($("actor-weakness")) $("actor-weakness").value = pj ? pj.debilidad : "";
  if ($("actor-photo-input")) $("actor-photo-input").value = "";

  const img = $("actor-photo-img"), ph = $("actor-photo-placeholder");
  if (pj?.photoUrl) {
    if (img) { img.src = pj.photoUrl; img.classList.remove("is-hidden"); }
    ph?.classList.add("is-hidden");
  } else {
    if (img) { img.removeAttribute("src"); img.classList.add("is-hidden"); }
    ph?.classList.remove("is-hidden");
  }

  $("btn-delete-actor")?.classList.toggle("is-hidden", !pj || isProtag);

  const checklist = $("actor-plans-checklist");
  if (checklist) {
    const user = getCurrentUser();
    const visiblePlans = getPlans().filter(p => !isPlanLocked(p, user));
    const selectedSet = new Set(pj?.planesVinculados || []);
    checklist.innerHTML = "";
    if (visiblePlans.length === 0) {
      checklist.innerHTML = `<p class="checklist-empty">No hay planes disponibles para vincular.</p>`;
    } else {
      const frag = document.createDocumentFragment();
      visiblePlans.forEach(p => {
        const lbl = document.createElement("label");
        lbl.className = "checklist-item";
        lbl.innerHTML = `<input type="checkbox" value="${escapeHtml(p.id)}" ${selectedSet.has(p.id) ? "checked" : ""}><span>${escapeHtml(p.emoji || "✨")} ${escapeHtml(p.title)}</span>`;
        frag.appendChild(lbl);
      });
      checklist.appendChild(frag);
    }
  }

  modal.classList.add("is-open");
}

function buildCastCard(pj, plansById, user) {
  const card = document.createElement("article");
  const isSimon = pj.id === "pj-simon" || normText(pj.nombre).includes("simon");
  const isSalo = pj.id === "pj-salo" || normText(pj.nombre).includes("salo");
  card.className = ["cast-card", isSimon ? "is-simon" : "", isSalo ? "is-salo" : ""].filter(Boolean).join(" ");
  card.dataset.actorId = pj.id;

  const fallbackEmoji = isSimon ? "🥭" : isSalo ? "🌸" : "🎭";
  const avatarHtml = pj.photoUrl
    ? `<img src="${escapeHtml(pj.photoUrl)}" alt="${escapeHtml(pj.nombre)}" loading="lazy">`
    : `<span aria-hidden="true">${fallbackEmoji}</span>`;

  const linkedTags = (pj.planesVinculados || [])
    .map(id => plansById.get(id))
    .filter(p => p && !isPlanLocked(p, user))
    .map(p => `<span class="cast-plan-tag">${escapeHtml(p.emoji || "✨")} ${escapeHtml(p.title)}</span>`)
    .join("");

  card.innerHTML = `
    <span class="cast-edit-hint" aria-hidden="true">✏️</span>
    <div class="cast-card-head">
      <div class="cast-avatar">${avatarHtml}</div>
      <div>
        <h4 class="cast-name">${escapeHtml(pj.nombre)}</h4>
        ${pj.rol ? `<span class="cast-role">${escapeHtml(pj.rol)}</span>` : ""}
      </div>
    </div>
    <div class="cast-stats">
      ${pj.superpoder ? `<div class="cast-stat cast-stat-power"><span class="cast-stat-label">⚡ Superpoder:</span><span class="cast-stat-value">${escapeHtml(pj.superpoder)}</span></div>` : ""}
      ${pj.debilidad ? `<div class="cast-stat cast-stat-weak"><span class="cast-stat-label">💥 Debilidad:</span><span class="cast-stat-value">${escapeHtml(pj.debilidad)}</span></div>` : ""}
    </div>
    ${linkedTags ? `<div class="cast-plans">${linkedTags}</div>` : ""}`;
  return card;
}

/** Anexo B (#4): Renderiza el Marcador Histórico de Retos en `#reparto-retos-scoreboard`. */
function renderRetosScoreboard() {
  const box = $("reparto-retos-scoreboard");
  if (!box) return;
  const retos = getPlans().filter(p => p.isReto);
  const simonWins = retos.filter(p => p.ganadorReto === "simon").length;
  const saloWins = retos.filter(p => p.ganadorReto === "salo").length;
  const ties = retos.filter(p => p.ganadorReto === "empate").length;
  const pendingRetos = retos.filter(p => !p.ganadorReto).length;

  let statusLine = "Serie empatada: ¡el próximo reto define al líder! 🔥";
  if (simonWins > saloWins) statusLine = `🏆 Simón lidera la serie histórica (+${simonWins - saloWins})`;
  else if (saloWins > simonWins) statusLine = `🏆 Salo lidera la serie histórica (+${saloWins - simonWins})`;
  else if (simonWins === 0 && saloWins === 0 && ties === 0) {
    statusLine = `Hay ${pendingRetos} ${pendingRetos === 1 ? "reto pendiente" : "retos pendientes"} en El Baúl listos para competir 🥊`;
  }

  box.innerHTML = `
    <div class="scoreboard-card scoreboard-compact">
      <div class="score-side score-side-simon">
        <span class="score-emoji" aria-hidden="true">🥭</span>
        <span class="score-name">Simón</span>
        <strong class="score-value">${simonWins}</strong>
        <span class="score-unit">${simonWins === 1 ? "victoria" : "victorias"}</span>
      </div>
      <div class="score-vs" aria-hidden="true">🥊</div>
      <div class="score-side score-side-salo">
        <span class="score-emoji" aria-hidden="true">🌸</span>
        <span class="score-name">Salo</span>
        <strong class="score-value">${saloWins}</strong>
        <span class="score-unit">${saloWins === 1 ? "victoria" : "victorias"}</span>
      </div>
      <p class="score-daily">${escapeHtml(statusLine)}${ties > 0 ? ` · 🤝 ${ties} ${ties === 1 ? "empate" : "empates"}` : ""}</p>
    </div>`;
}

function renderReparto() {
  renderRetosScoreboard();
  const proGrid = $("protagonists-grid"), actGrid = $("actors-grid"), actEmpty = $("actors-empty");
  if (!proGrid || !actGrid) return;
  const user = getCurrentUser();
  const plansById = new Map(getPlans().map(p => [p.id, p]));
  const all = getPersonajes();
  const protags = all.filter(p => p.tipo === "protagonista");
  const actors = all.filter(p => p.tipo !== "protagonista");

  proGrid.innerHTML = "";
  const pFrag = document.createDocumentFragment();
  protags.forEach(pj => pFrag.appendChild(buildCastCard(pj, plansById, user)));
  proGrid.appendChild(pFrag);

  actGrid.innerHTML = "";
  if (actors.length === 0) {
    actEmpty?.classList.remove("is-hidden");
  } else {
    actEmpty?.classList.add("is-hidden");
    const aFrag = document.createDocumentFragment();
    actors.forEach(pj => aFrag.appendChild(buildCastCard(pj, plansById, user)));
    actGrid.appendChild(aFrag);
  }
}

/* ==========================================================================
   12. SABIDURÍA V4: GALLETA DE LA FORTUNA (#btn-random-quote-home) Y CRUD
   ========================================================================== */

function setupSabiduria() {
  bindFilterBar("sabiduria-filter-bar", ".category-chip", renderSabiduria);
  $("btn-random-quote-home")?.addEventListener("click", openFortuneModal);
  $("btn-fortune-another")?.addEventListener("click", openFortuneModal);
  $("btn-add-sabiduria")?.addEventListener("click", () => openSabiduriaModal(null));

  $("sabiduria-grid")?.addEventListener("click", ev => {
    const btn = ev.target.closest(".sabiduria-edit-btn");
    if (btn?.dataset.sabiduriaId) openSabiduriaModal(btn.dataset.sabiduriaId);
  });

  $("form-sabiduria")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const id = $("sabiduria-id")?.value.trim() || "";
    const categoria = $("sabiduria-category")?.value || "Animo";
    const frase = $("sabiduria-phrase")?.value.trim() || "";
    const autor = $("sabiduria-author")?.value.trim() || "";
    if (!frase) return showToast("Escribe la frase de sabiduría.", "error");

    const user = getCurrentUser();
    const op = id ? "update" : "create";
    const itemId = id || `sab-${Date.now()}`;
    const item = { id: itemId, categoria, frase, autor, creadoPor: user };
    const list = getSabiduria();
    if (id) saveSabiduria(list.map(s => (s.id === id ? { ...s, categoria, frase, autor } : s)));
    else saveSabiduria([item, ...list]);

    closeModal("sabiduria-modal");
    renderSabiduria();

    await postToBackend("manageSabiduria", { op, usuario: user, item }, {
      okMsg: id ? "Frase actualizada ☁️💛" : "Frase guardada en la nube ☁️💛",
      offlineMsg: id ? "Frase actualizada 💛" : "Frase añadida 💛",
      onSuccess: res => { if (Array.isArray(res?.sabiduria)) { saveSabiduria(res.sabiduria); renderSabiduria(); } }
    });
  });

  $("btn-delete-sabiduria")?.addEventListener("click", async () => {
    const id = $("sabiduria-id")?.value.trim() || "";
    if (!id || !window.confirm("¿Eliminar esta frase?")) return;
    saveSabiduria(getSabiduria().filter(s => s.id !== id));
    closeModal("sabiduria-modal");
    renderSabiduria();
    await postToBackend("manageSabiduria", { op: "delete", item: { id } }, {
      okMsg: "Frase eliminada 🗑️",
      offlineMsg: "Frase eliminada 🗑️",
      onSuccess: res => { if (Array.isArray(res?.sabiduria)) { saveSabiduria(res.sabiduria); renderSabiduria(); } }
    });
  });

  renderSabiduria();
}

function openSabiduriaModal(sabId) {
  const modal = $("sabiduria-modal");
  if (!modal) return;
  const s = sabId ? getSabiduria().find(item => item.id === sabId) : null;
  setText("sabiduria-modal-title", s ? "Editar frase" : "Nueva frase");
  if ($("sabiduria-id")) $("sabiduria-id").value = s ? s.id : "";
  if ($("sabiduria-category")) $("sabiduria-category").value = s ? s.categoria : "Animo";
  if ($("sabiduria-phrase")) $("sabiduria-phrase").value = s ? s.frase : "";
  if ($("sabiduria-author")) $("sabiduria-author").value = s ? s.autor : "";
  $("btn-delete-sabiduria")?.classList.toggle("is-hidden", !s);
  modal.classList.add("is-open");
}

function openFortuneModal() {
  const list = getSabiduria();
  if (list.length === 0) return showToast("Añade primero una frase de sabiduría en Ajustes 💛", "info");
  const chosen = pickRandomSabiduriaQuote(lastFortuneId);
  lastFortuneId = chosen.id;

  setText("fortune-category-label", SABIDURIA_LABELS[chosen.categoria] || "💛 Sabiduría");
  setText("fortune-phrase", `“${chosen.frase}”`);
  setText("fortune-author", chosen.autor ? `— ${chosen.autor}` : "");

  const cookie = $("fortune-cookie");
  if (cookie) {
    cookie.classList.remove("is-cracked");
    void cookie.offsetWidth;
    cookie.classList.add("is-cracked");
  }
  $("sabiduria-fortune-modal")?.classList.add("is-open");
}

function renderSabiduria() {
  const grid = $("sabiduria-grid"), empty = $("sabiduria-empty");
  if (!grid || !empty) return;
  const cat = document.querySelector("#sabiduria-filter-bar .category-chip.is-active")?.dataset.category || "Todas";
  const list = getSabiduria().filter(s => cat === "Todas" || s.categoria === cat);

  grid.innerHTML = "";
  if (list.length === 0) return empty.classList.remove("is-hidden");
  empty.classList.add("is-hidden");

  const frag = document.createDocumentFragment();
  list.forEach(s => {
    const card = document.createElement("article");
    card.className = "sabiduria-card";
    card.dataset.category = s.categoria;
    card.innerHTML = `
      <span class="sabiduria-category-tag">${escapeHtml(SABIDURIA_LABELS[s.categoria] || s.categoria)}</span>
      <p class="sabiduria-phrase">“${escapeHtml(s.frase)}”</p>
      ${s.autor ? `<span class="sabiduria-author">— ${escapeHtml(s.autor)}</span>` : ""}
      <div class="sabiduria-card-actions">
        <button class="sabiduria-edit-btn" type="button" data-sabiduria-id="${escapeHtml(s.id)}" aria-label="Editar frase">✏️</button>
      </div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ==========================================================================
   13. DOBBY IA (`queryDobbyAI`, HISTORIAL EN RAM, TARJETAS 1-TOQUE)
       Y PROTOCOLO CINE (`queryMovieProtocol`: TMDB CO + GEMINI)
   ========================================================================== */

// Registro en RAM para payloads estructurados de botones de 1 toque en tarjetas IA
const AI_CARD_ACTIONS_MAP = new Map();
let aiActionSeq = 0;

function registerAiCardAction(type, data) {
  aiActionSeq += 1;
  const uid = `ai-act-${aiActionSeq}`;
  AI_CARD_ACTIONS_MAP.set(uid, { type, data });
  return uid;
}

function selectDobbyTaskChip(task) {
  dobbyActiveTask = task || "chat";
  $$("#dobby-task-chips .dobby-chip").forEach(c => {
    c.classList.toggle("is-active", c.dataset.task === dobbyActiveTask);
  });
  const placeholders = {
    prizes: "Ej: Cupones divertidos para el fin de semana…",
    plans: "Ej: Cita de bajo presupuesto en día lluvioso…",
    quote: "Ej: Una frase dulce para levantarle el ánimo…",
    scheduled_msg: "Ej: Mensaje de buenos días antes de su examen…",
    cover_prompt: "Describe el plan para ilustrar a Simón, Salo y Coquí…",
    chat: "Escríbele a Dobby…"
  };
  if ($("dobby-input")) $("dobby-input").placeholder = placeholders[dobbyActiveTask] || "Escríbele a Dobby…";
}

function openDobbyModal(initialTask = "chat", { autoPrompt = "", contextData = null } = {}) {
  selectDobbyTaskChip(initialTask);
  $("modal-dobby")?.classList.add("is-open");
  if (autoPrompt) {
    submitDobbyQuery(autoPrompt, initialTask, contextData);
  } else {
    setTimeout(() => $("dobby-input")?.focus(), 120);
  }
}

function buildLocalDobbyFallback(task, prompt, contextData) {
  if (task === "prizes") {
    return {
      reply: "🧦✨ ¡Dobby buscó en su baúl mágico y preparó estos cupones para ustedes!",
      items: LOCAL_AI_FALLBACKS.prizes
    };
  }
  if (task === "plans") {
    return {
      reply: "🧦✨ ¡Aquí tienen ideas de planes pensadas a la medida de Mango y Primavera!",
      items: LOCAL_AI_FALLBACKS.plans
    };
  }
  if (task === "quote") {
    return {
      reply: "🧦✨ Dobby escribió estas frases llenas de cariño:",
      items: LOCAL_AI_FALLBACKS.quotes
    };
  }
  if (task === "scheduled_msg") {
    return {
      reply: "🧦✨ Elige cuál de estos mensajes quieres dejarle programado:",
      items: LOCAL_AI_FALLBACKS.scheduled_msgs
    };
  }
  if (task === "cover_prompt") {
    const planTitle = contextData?.title || prompt || "una cita inolvidable juntos";
    const generatedPrompt = `Pixar & Disney 3D warm storybook illustration of a joyful Colombian couple in their early 20s: Simón (young man with short dark hair, warm smile, casual smart jacket) and Salomé (radiant young woman with expressive eyes, warm smile, sky-blue and pastel coral accents), enjoying "${planTitle}". Beside them floats Coquí, a tiny cute plush beige frog mascot with pearlescent fairy wings, a star-tipped wand, and "I ❤️ PR" on its white belly. Warm golden mango (#FFB347), spring coral (#FF8A80) and sky blue (#81D4FA) lighting, cinematic depth of field, magical cozy atmosphere, high detail, 4k.`;
    return {
      reply: "🧦✨ ¡Listo! Copia este prompt mágico para generar la portada ilustrada de su plan:",
      coverPrompt: generatedPrompt
    };
  }
  return {
    reply: `🧦✨ ¡Dobby escucha con atención! Para "${prompt}", les sugiere apagar el ruido del mundo exterior, poner su playlist favorita y elegir un plan juntos en El Baúl 🥭🌸`,
    items: []
  };
}

/** Normaliza cualquier estructura JSON devuelta por `queryDobbyAI` en tarjetas interactivas de 1 toque. */
function renderDobbyAiBubble(res, task, fallbackPrompt = "", contextData = null) {
  const log = $("dobby-chat-log");
  if (!log) return;

  const payload = (res && res.status !== "error") ? res : buildLocalDobbyFallback(task, fallbackPrompt, contextData);
  const dataRoot = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const replyText = String(dataRoot.reply || dataRoot.message || dataRoot.text || payload.reply || "🧦✨ ¡Aquí tienes las ideas de Dobby!").trim();

  const rawItems = Array.isArray(dataRoot.items) ? dataRoot.items
    : Array.isArray(dataRoot.suggestions) ? dataRoot.suggestions
    : Array.isArray(dataRoot.cards) ? dataRoot.cards
    : Array.isArray(dataRoot.prizes) ? dataRoot.prizes
    : Array.isArray(dataRoot.plans) ? dataRoot.plans
    : Array.isArray(dataRoot.quotes) ? dataRoot.quotes
    : Array.isArray(dataRoot.messages) ? dataRoot.messages
    : [];

  const coverPromptText = String(dataRoot.coverPrompt || dataRoot.imagePrompt || dataRoot.prompt || "").trim();

  let cardsHtml = "";

  if (task === "cover_prompt" || coverPromptText) {
    const promptVal = coverPromptText || buildLocalDobbyFallback("cover_prompt", fallbackPrompt, contextData).coverPrompt;
    const uid = registerAiCardAction("copy-prompt", { prompt: promptVal });
    cardsHtml += `
      <div class="ai-card">
        <strong class="ai-card-title">🎨 Prompt Mágico de Portada</strong>
        <p class="ai-card-text">${escapeHtml(promptVal)}</p>
        <div class="ai-card-actions">
          <button class="btn btn-soft btn-sm" type="button" data-ai-uid="${uid}">📋 Copiar Prompt</button>
        </div>
      </div>`;
  }

  rawItems.forEach(raw => {
    if (!raw) return;
    const obj = typeof raw === "string" ? { texto: raw } : raw;
    const actType = String(obj.actionType || "").toLowerCase();
    if (actType === "cover_prompt") return; // Ya renderizado arriba en coverPromptText

    // 1. Tarjeta de Premio / Cupón
    if (task === "prizes" || actType === "prize" || obj.costoPuntos !== undefined || obj.cost !== undefined) {
      const prize = {
        titulo: String(obj.titulo || obj.title || "Vale especial").trim(),
        descripcion: String(obj.descripcion || obj.description || obj.texto || obj.text || "").trim(),
        costoPuntos: Math.max(10, Number(obj.costoPuntos ?? obj.cost ?? obj.points) || 80),
        icono: String(obj.icono || obj.icon || obj.emoji || "🎁").trim()
      };
      const uid = registerAiCardAction("add-prize", prize);
      cardsHtml += `
        <div class="ai-card">
          <strong class="ai-card-title">${escapeHtml(prize.icono)} ${escapeHtml(prize.titulo)}</strong>
          <span class="ai-card-meta">⭐ ${prize.costoPuntos} pts</span>
          <p class="ai-card-text">${escapeHtml(prize.descripcion)}</p>
          <div class="ai-card-actions">
            <button class="btn btn-soft btn-sm" type="button" data-ai-uid="${uid}">➕ Añadir a Premios</button>
          </div>
        </div>`;
      return;
    }

    // 2. Tarjeta de Plan para El Baúl
    if (task === "plans" || actType === "plan" || obj.category || obj.categoriaPlan || obj.weather) {
      const plan = {
        title: String(obj.title || obj.titulo || "Plan sugerido por Dobby").trim(),
        category: ["Pelis y Juegos", "Gastronomía", "Rumbas", "Relax"].includes(obj.category || obj.categoria) ? (obj.category || obj.categoria) : "Relax",
        weather: (obj.weather || obj.clima) === "🌧️" ? "🌧️" : "☀️",
        energy: ["🔋", "🔋🔋", "🔋🔋🔋"].includes(obj.energy || obj.energia) ? (obj.energy || obj.energia) : "🔋🔋",
        emoji: String(obj.emoji || obj.icono || "✨").trim(),
        isReto: Boolean(obj.isReto),
        description: String(obj.description || obj.descripcion || obj.why || obj.text || "").trim()
      };
      const uid = registerAiCardAction("add-plan", plan);
      cardsHtml += `
        <div class="ai-card">
          <strong class="ai-card-title">${escapeHtml(plan.emoji)} ${escapeHtml(plan.title)}</strong>
          <span class="ai-card-meta">${escapeHtml(plan.category)} · ${escapeHtml(plan.weather)} · ${escapeHtml(plan.energy)}</span>
          ${plan.description ? `<p class="ai-card-text">${escapeHtml(plan.description)}</p>` : ""}
          <div class="ai-card-actions">
            <button class="btn btn-soft btn-sm" type="button" data-ai-uid="${uid}">➕ Guardar en El Baúl</button>
          </div>
        </div>`;
      return;
    }

    // 3. Tarjeta de Frase Dedicada / Sabiduría
    if (task === "quote" || actType === "quote" || obj.frase || obj.quote) {
      const q = {
        frase: String(obj.frase || obj.quote || obj.texto || obj.text || "").trim(),
        autor: String(obj.autor || obj.author || "Dobby 🧦✨").trim()
      };
      if (!q.frase) return;
      const uid = registerAiCardAction("use-quote", q);
      cardsHtml += `
        <div class="ai-card">
          <p class="ai-card-text">“${escapeHtml(q.frase)}”</p>
          <span class="ai-card-meta">— ${escapeHtml(q.autor)}</span>
          <div class="ai-card-actions">
            <button class="btn btn-soft btn-sm" type="button" data-ai-uid="${uid}">💌 Usar frase</button>
          </div>
        </div>`;
      return;
    }

    // 4. Tarjeta de Mensaje Programado
    if (task === "scheduled_msg" || actType === "scheduled_msg" || obj.mensaje || obj.scheduledText) {
      const mText = String(obj.mensaje || obj.scheduledText || obj.message || obj.texto || obj.text || "").trim();
      if (!mText) return;
      const uid = registerAiCardAction("schedule-msg", { mensaje: mText });
      cardsHtml += `
        <div class="ai-card">
          <p class="ai-card-text">${escapeHtml(mText)}</p>
          <div class="ai-card-actions">
            <button class="btn btn-soft btn-sm" type="button" data-ai-uid="${uid}">⏰ Crear mensaje</button>
          </div>
        </div>`;
      return;
    }

    // 5. Tarjeta informativa en modo conversación libre ("chat")
    const infoTxt = String(obj.text || obj.texto || "").trim();
    if (infoTxt) {
      cardsHtml += `
        <div class="ai-card">
          ${obj.title ? `<strong class="ai-card-title">${escapeHtml(obj.emoji || "✨")} ${escapeHtml(obj.title)}</strong>` : ""}
          <p class="ai-card-text">${escapeHtml(infoTxt)}</p>
        </div>`;
    }
  });

  const bubble = document.createElement("div");
  bubble.className = "dobby-msg is-ai";
  bubble.innerHTML = `<p>${escapeHtml(replyText)}</p>${cardsHtml}`;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;

  dobbySessionHistory.push({ role: "model", task, text: replyText });
  if (dobbySessionHistory.length > 16) dobbySessionHistory.splice(0, dobbySessionHistory.length - 16);
}

async function handleAiCardOneTapAction(uid, btnEl) {
  const entry = AI_CARD_ACTIONS_MAP.get(uid);
  if (!entry) return;
  const { type, data } = entry;
  const user = getCurrentUser();

  if (type === "copy-prompt") {
    const ok = await copyTextToClipboard(data.prompt);
    if (ok) {
      if (btnEl) btnEl.textContent = "✅ Prompt copiado";
      showToast("📋 Prompt copiado al portapapeles", "success");
    } else {
      showToast("No se pudo copiar automáticamente.", "error");
    }
    return;
  }

  if (type === "add-prize") {
    const item = {
      id: `cup-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      titulo: data.titulo,
      descripcion: data.descripcion,
      costoPuntos: data.costoPuntos,
      icono: data.icono || "🎁",
      estado: "disponible",
      canjeadoPor: "",
      fechaCanje: ""
    };
    saveCupones([...getCupones(), item]);
    renderPremios();
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = "✅ Añadido a Premios"; }
    await postToBackend("manageCoupon", { op: "create", item }, {
      okMsg: `🎁 "${item.titulo}" añadido a Premios`,
      offlineMsg: `🎁 "${item.titulo}" guardado en Premios`,
      onSuccess: res => { if (Array.isArray(res?.cupones)) { saveCupones(res.cupones); renderPremios(); } }
    });
    return;
  }

  if (type === "add-plan") {
    const newPlan = normalizePlan({
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      title: data.title,
      category: data.category || "Pelis y Juegos",
      weather: data.weather || "🌧️",
      energy: data.energy || "🔋",
      emoji: data.emoji || "🎬",
      isVip: false,
      completed: false,
      anecdote: "",
      photoUrl: "",
      mediaType: "",
      posterUrl: "",
      coverUrl: "",
      isReto: Boolean(data.isReto),
      ganadorReto: "",
      isSecreto: false,
      fechaDesbloqueo: "",
      creadoPor: user,
      updatedAt: formatCleanDate(todayLocal())
    });
    savePlans([...getPlans(), newPlan]);
    renderAllViews();
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = "✅ Guardado en El Baúl"; }
    await postToBackend("addPlan", { ...newPlan, usuario: user }, {
      okMsg: `🥭 "${newPlan.title}" guardado en El Baúl`,
      offlineMsg: `🥭 "${newPlan.title}" añadido al Baúl`,
      onSuccess: res => {
        if (res?.plan) {
          savePlans(getPlans().map(p => (p.id === newPlan.id ? normalizePlan(res.plan, p) : p)));
          renderAllViews();
        }
      }
    });
    return;
  }

  if (type === "use-quote") {
    closeModal("modal-dobby");
    openSettingsModal();
    if ($("dedicated-quote-text")) $("dedicated-quote-text").value = data.frase || "";
    if ($("dedicated-quote-author")) $("dedicated-quote-author").value = data.autor || "";
    $("panel-dedicated-quote")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
    $("dedicated-quote-text")?.focus();
    showToast("💌 Frase lista para dedicársela a tu pareja", "info");
    return;
  }

  if (type === "schedule-msg") {
    closeModal("modal-dobby");
    openSettingsModal();
    if ($("scheduled-message-text")) $("scheduled-message-text").value = data.mensaje || "";
    if ($("scheduled-message-datetime") && !$("scheduled-message-datetime").value) {
      const plus1h = new Date(Date.now() + 3600000);
      const localIso = new Date(plus1h.getTime() - plus1h.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      $("scheduled-message-datetime").value = localIso;
    }
    $("panel-scheduled-messages")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
    $("scheduled-message-text")?.focus();
    showToast("⏰ Elige la hora y programa el mensaje de Dobby", "info");
  }
}

async function submitDobbyQuery(promptText, taskOverride = null, extraContext = null) {
  const log = $("dobby-chat-log");
  const loading = $("dobby-loading");
  const sendBtn = $("btn-dobby-send");
  const task = taskOverride || dobbyActiveTask || "chat";
  const cleanPrompt = String(promptText || "").trim();
  if (!cleanPrompt || !log) return;

  const userBubble = document.createElement("div");
  userBubble.className = "dobby-msg is-user";
  userBubble.textContent = cleanPrompt;
  log.appendChild(userBubble);
  log.scrollTop = log.scrollHeight;

  dobbySessionHistory.push({ role: "user", task, text: cleanPrompt });
  if (dobbySessionHistory.length > 16) dobbySessionHistory.splice(0, dobbySessionHistory.length - 16);

  loading?.classList.remove("is-hidden");
  if (sendBtn) sendBtn.disabled = true;

  const user = getCurrentUser();
  const contextData = {
    ...(extraContext || {}),
    history: dobbySessionHistory.slice(-8),
    existingPlans: getPlans().slice(0, 40).map(p => p.title),
    existingCoupons: getCupones().map(c => c.titulo),
    scores: getPuntos()
  };

  try {
    const res = await postToBackend("queryDobbyAI", {
      prompt: cleanPrompt,
      user: user || "ambos",
      usuario: user || "ambos",
      task,
      contextData
    }, { silent: true });
    renderDobbyAiBubble(res, task, cleanPrompt, contextData);
  } catch {
    renderDobbyAiBubble(null, task, cleanPrompt, contextData);
  } finally {
    loading?.classList.add("is-hidden");
    if (sendBtn) sendBtn.disabled = false;
  }
}

function setupDobbyAI() {
  $("btn-dobby-master")?.addEventListener("click", () => openDobbyModal("chat"));

  $("dobby-task-chips")?.addEventListener("click", ev => {
    const chip = ev.target.closest(".dobby-chip");
    if (!chip?.dataset.task) return;
    const task = chip.dataset.task;
    selectDobbyTaskChip(task);
    const quickPrompts = {
      prizes: "¡Sugiere 3 cupones nuevos e irresistibles para nuestra tienda de premios!",
      plans: "¡Propón 3 planes originales que aún no estén en nuestro Baúl!",
      quote: "Escríbenos 2 frases románticas con guiños a nuestra historia.",
      scheduled_msg: "Dame 2 ideas de mensajes sorpresa cortos para programar hoy."
    };
    if (quickPrompts[task]) {
      submitDobbyQuery(quickPrompts[task], task);
    }
  });

  $("form-dobby")?.addEventListener("submit", ev => {
    ev.preventDefault();
    const inp = $("dobby-input");
    const txt = inp?.value.trim() || "";
    if (!txt) return;
    if (inp) inp.value = "";
    submitDobbyQuery(txt, dobbyActiveTask);
  });

  $("dobby-chat-log")?.addEventListener("click", ev => {
    const btn = ev.target.closest("[data-ai-uid]");
    if (btn?.dataset.aiUid) handleAiCardOneTapAction(btn.dataset.aiUid, btn);
  });
}

/* --- Punto 7: Protocolo Cine (`#modal-movie-protocol` -> `queryMovieProtocol`) --- */

function openMovieProtocolModal() {
  $("modal-movie-protocol")?.classList.add("is-open");
}

function renderMovieRecommendations(recs) {
  const box = $("movie-results");
  if (!box) return;
  const list = Array.isArray(recs) && recs.length > 0 ? recs : LOCAL_AI_FALLBACKS.movies;

  const energyMap = { baja: "🔋", media: "🔋🔋", alta: "🔋🔋🔋" };
  const chosenEnergy = energyMap[$("movie-energy")?.value || "baja"] || "🔋";

  box.innerHTML = list.map(m => {
    const emoji = String(m.emoji || "🍿").trim();
    const title = String(m.title || m.titulo || "Recomendación").trim();
    const year = m.year ? ` (${m.year})` : "";
    const metaParts = [m.type || m.tipo, m.duration || m.duracion, m.platform || m.plataforma, m.rating ? `⭐ ${m.rating}` : ""].filter(Boolean);
    const uid = registerAiCardAction("add-plan", {
      title: `Ver ${title}`,
      category: "Pelis y Juegos",
      weather: "🌧️",
      energy: chosenEnergy,
      emoji,
      isReto: false
    });
    return `
      <article class="movie-card ai-card">
        <strong class="ai-card-title">${escapeHtml(emoji)} ${escapeHtml(title)}${escapeHtml(year)}</strong>
        ${metaParts.length ? `<span class="ai-card-meta">${escapeHtml(metaParts.join(" · "))}</span>` : ""}
        ${m.synopsis ? `<p class="ai-card-text">${escapeHtml(m.synopsis)}</p>` : ""}
        ${m.whyForUs ? `<p class="ai-card-meta">💛 ${escapeHtml(m.whyForUs)}</p>` : ""}
        <div class="ai-card-actions">
          <button class="btn btn-soft btn-sm" type="button" data-ai-uid="${uid}">➕ Guardar en El Baúl</button>
        </div>
      </article>`;
  }).join("");
}

function setupMovieProtocol() {
  $("form-movie-protocol")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const loading = $("movie-loading");
    const btn = $("btn-movie-search");
    const results = $("movie-results");
    if (results) results.innerHTML = "";
    loading?.classList.remove("is-hidden");
    if (btn) btn.disabled = true;

    const payload = {
      type: $("movie-type")?.value || "ambos",
      mood: $("movie-mood")?.value || "romantico",
      energy: $("movie-energy")?.value || "baja",
      platform: $("movie-platform")?.value || "cualquiera",
      query: $("movie-query")?.value.trim() || "",
      currentTitles: getPlans().map(p => p.title),
      usuario: getCurrentUser()
    };

    try {
      const res = await postToBackend("queryMovieProtocol", payload, { silent: true });
      const recs = res?.recommendations || res?.data?.recommendations || res?.items || null;
      renderMovieRecommendations(recs);
    } catch {
      renderMovieRecommendations(null);
    } finally {
      loading?.classList.add("is-hidden");
      if (btn) btn.disabled = false;
    }
  });

  $("movie-results")?.addEventListener("click", ev => {
    const btn = ev.target.closest("[data-ai-uid]");
    if (btn?.dataset.aiUid) handleAiCardOneTapAction(btn.dataset.aiUid, btn);
  });
}

/* ==========================================================================
   14. AJUSTES V4: FRASE DEDICADA, MENSAJES PROGRAMADOS, PREGUNTAS TRAMPA,
       EXPORTACIÓN DE BACKUP JSON, MODALES, TOASTS Y BOOTSTRAP
   ========================================================================== */

/* --- Punto 5: Frase Dedicada (`#panel-dedicated-quote`) --- */

function getMyActiveSentDedicatedQuote(user = getCurrentUser()) {
  if (!user) return null;
  const partner = getPartnerUser(user);
  const today = todayLocal();
  const list = getFrasesDedicadas().filter(q => q.activa && (q.deUsuario === user || q.paraUsuario === partner));
  for (let i = list.length - 1; i >= 0; i--) {
    const q = list[i];
    if (q.duracion === "once" && !q.entregada) return q;
    if (q.duracion === "today" && q.fechaCreacion === today) return q;
  }
  return null;
}

function renderDedicatedQuotePanel() {
  const user = getCurrentUser();
  const partnerMeta = getUserMeta(getPartnerUser(user));
  setText("dedicated-partner-name", partnerMeta ? partnerMeta.shortName : "mi pareja");

  const active = getMyActiveSentDedicatedQuote(user);
  const statusEl = $("dedicated-quote-status");
  const delBtn = $("btn-delete-dedicated-quote");

  if (active) {
    const modeLabel = active.duracion === "today" ? "visible durante todo hoy" : "pendiente de abrir (1 vez)";
    if (statusEl) statusEl.textContent = `💌 Activa (${modeLabel}): “${active.frase}”`;
    delBtn?.classList.remove("is-hidden");
    delBtn.dataset.quoteId = active.id;
  } else {
    if (statusEl) statusEl.textContent = "";
    delBtn?.classList.add("is-hidden");
    if (delBtn) delete delBtn.dataset.quoteId;
  }
}

function setupDedicatedQuotePanel() {
  $("form-dedicated-quote")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const user = getCurrentUser();
    if (!user) return showToast("Elige primero tu identidad arriba en Ajustes.", "error");
    const partner = getPartnerUser(user);

    const frase = $("dedicated-quote-text")?.value.trim() || "";
    const autor = $("dedicated-quote-author")?.value.trim() || getUserMeta(user)?.shortName || "";
    const duracion = getCheckedRadioValue("dedicated-quote-duration") === "today" ? "today" : "once";
    const guardarEnBanco = Boolean($("dedicated-quote-save-bank")?.checked);
    if (!frase) return showToast("Escribe la frase que quieres dedicarle.", "error");

    const newItem = normalizeDedicatedQuote({
      id: `ded-${Date.now()}`,
      deUsuario: user,
      paraUsuario: partner,
      frase,
      autor,
      duracion,
      fechaCreacion: todayLocal(),
      entregada: false,
      activa: true
    });

    // Reemplazar activas previas del mismo emisor y guardar
    const prevClean = getFrasesDedicadas().map(q => (q.deUsuario === user ? { ...q, activa: false } : q));
    saveFrasesDedicadas([...prevClean, newItem]);

    if (guardarEnBanco) {
      const sabItem = { id: `sab-${Date.now()}`, categoria: "Animo", frase, autor, creadoPor: user };
      saveSabiduria([sabItem, ...getSabiduria()]);
      renderSabiduria();
    }

    $("form-dedicated-quote")?.reset();
    renderDedicatedQuotePanel();

    const partnerName = getUserMeta(partner)?.shortName || "tu pareja";
    await postToBackend("manageDedicatedQuote", {
      subAction: "save",
      op: "save",
      usuario: user,
      deUsuario: user,
      paraUsuario: partner,
      frase,
      autor,
      duracion,
      duration: duracion,
      guardarEnBanco,
      archiveInSabiduria: guardarEnBanco,
      categoria: "Animo",
      item: newItem
    }, {
      okMsg: `💌 ¡Frase dedicada enviada con aviso push a ${partnerName}!`,
      offlineMsg: `💌 Frase dedicada guardada para ${partnerName}`,
      onSuccess: res => {
        if (Array.isArray(res?.frasesDedicadas)) saveFrasesDedicadas(res.frasesDedicadas);
        if (Array.isArray(res?.sabiduria)) { saveSabiduria(res.sabiduria); renderSabiduria(); }
        renderDedicatedQuotePanel();
      }
    });
  });

  $("btn-delete-dedicated-quote")?.addEventListener("click", async ev => {
    const id = ev.currentTarget?.dataset?.quoteId || "";
    const user = getCurrentUser();
    saveFrasesDedicadas(getFrasesDedicadas().filter(q => q.id !== id && q.deUsuario !== user));
    renderDedicatedQuotePanel();

    await postToBackend("manageDedicatedQuote", {
      subAction: "delete",
      op: "delete",
      id,
      usuario: user
    }, {
      okMsg: "Frase dedicada retirada 🗑️",
      offlineMsg: "Frase dedicada retirada 🗑️"
    });
  });

  renderDedicatedQuotePanel();
}

/* --- Punto 8: Mensajes Programados (`#panel-scheduled-messages` -> `manageScheduledMessages`) --- */

function resetScheduledMessageForm() {
  $("form-scheduled-message")?.reset();
  if ($("scheduled-message-id")) $("scheduled-message-id").value = "";
  setText("btn-save-scheduled-message", "⏰ Programar mensaje");
  $("btn-cancel-scheduled-edit")?.classList.add("is-hidden");
}

function formatScheduledDateTimeLabel(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} · ${hh}:${mm}`;
}

function renderScheduledMessagesList() {
  const listEl = $("scheduled-messages-list"), emptyEl = $("scheduled-messages-empty");
  if (!listEl) return;
  const user = getCurrentUser();
  const mine = user
    ? getMensajesProgramados().filter(m => m.deUsuario === user || !m.deUsuario)
    : [];

  listEl.innerHTML = "";
  if (mine.length === 0) {
    emptyEl?.classList.remove("is-hidden");
    return;
  }
  emptyEl?.classList.add("is-hidden");

  const repeatLabels = { none: "1 vez", daily: "Diario", weekly: "Semanal" };
  const frag = document.createDocumentFragment();
  mine.forEach(m => {
    const row = document.createElement("div");
    row.className = "trampa-item scheduled-item";
    const statusBadge = m.enviado ? "✅ Enviado" : "⏳ Pendiente";
    row.innerHTML = `
      <div class="scheduled-item-body">
        <span class="trampa-item-text">${escapeHtml(m.mensaje)}</span>
        <span class="settings-hint">${escapeHtml(formatScheduledDateTimeLabel(m.fechaHora))} · ${escapeHtml(repeatLabels[m.repetir] || "1 vez")} · ${statusBadge}</span>
      </div>
      <button class="trampa-item-btn sched-edit-btn" type="button" data-sched-id="${escapeHtml(m.id)}" aria-label="Editar mensaje">✏️</button>
      <button class="trampa-item-btn sched-del-btn" type="button" data-sched-id="${escapeHtml(m.id)}" aria-label="Eliminar mensaje">🗑️</button>`;
    frag.appendChild(row);
  });
  listEl.appendChild(frag);
}

function setupScheduledMessagesPanel() {
  $("btn-cancel-scheduled-edit")?.addEventListener("click", resetScheduledMessageForm);

  // Botón mágico para que Dobby redacte el mensaje directamente en el formulario
  $("btn-ai-scheduled-message")?.addEventListener("click", async () => {
    const btn = $("btn-ai-scheduled-message");
    if (btn) { btn.disabled = true; btn.textContent = "🧦✨ Dobby está escribiendo…"; }
    try {
      const user = getCurrentUser();
      const res = await postToBackend("queryDobbyAI", {
        prompt: "Escribe un mensaje sorpresa corto, tierno y genuino para enviar por notificación push a mi pareja.",
        user: user || "ambos",
        usuario: user || "ambos",
        task: "scheduled_msg",
        contextData: {}
      }, { silent: true });

      const root = res?.data || res || {};
      const items = root.items || root.messages || root.suggestions || [];
      let picked = "";
      if (Array.isArray(items) && items.length > 0) {
        const first = items[0];
        picked = typeof first === "string" ? first : String(first.mensaje || first.texto || first.message || "");
      } else if (root.reply && !Array.isArray(items)) {
        picked = String(root.reply);
      }
      if (!picked) {
        const fb = LOCAL_AI_FALLBACKS.scheduled_msgs;
        picked = fb[Math.floor(Math.random() * fb.length)].texto;
      }
      if ($("scheduled-message-text")) {
        $("scheduled-message-text").value = picked.slice(0, 200);
        $("scheduled-message-text").focus();
      }
      showToast("🧦✨ ¡Dobby redactó un mensaje para ti!", "success");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "🧦✨ Que Dobby lo escriba"; }
    }
  });

  $("scheduled-messages-list")?.addEventListener("click", async ev => {
    const editBtn = ev.target.closest(".sched-edit-btn");
    if (editBtn?.dataset.schedId) {
      const m = getMensajesProgramados().find(x => x.id === editBtn.dataset.schedId);
      if (!m) return;
      if ($("scheduled-message-id")) $("scheduled-message-id").value = m.id;
      if ($("scheduled-message-text")) $("scheduled-message-text").value = m.mensaje;
      if ($("scheduled-message-datetime")) $("scheduled-message-datetime").value = m.fechaHora.slice(0, 16);
      if ($("scheduled-message-repeat")) $("scheduled-message-repeat").value = m.repetir || "none";
      setText("btn-save-scheduled-message", "Actualizar mensaje");
      $("btn-cancel-scheduled-edit")?.classList.remove("is-hidden");
      $("scheduled-message-text")?.focus();
      return;
    }

    const delBtn = ev.target.closest(".sched-del-btn");
    if (delBtn?.dataset.schedId) {
      const id = delBtn.dataset.schedId;
      if (!window.confirm("¿Cancelar y eliminar este mensaje programado?")) return;
      saveMensajesProgramados(getMensajesProgramados().filter(x => x.id !== id));
      renderScheduledMessagesList();
      await postToBackend("manageScheduledMessages", {
        op: "delete",
        subAction: "delete",
        id,
        item: { id },
        usuario: getCurrentUser()
      }, {
        okMsg: "Mensaje programado eliminado 🗑️",
        offlineMsg: "Mensaje eliminado 🗑️",
        onSuccess: res => {
          if (Array.isArray(res?.mensajesProgramados)) {
            saveMensajesProgramados(res.mensajesProgramados);
            renderScheduledMessagesList();
          }
        }
      });
    }
  });

  $("form-scheduled-message")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const user = getCurrentUser();
    if (!user) return showToast("Elige primero tu identidad arriba en Ajustes.", "error");
    const partner = getPartnerUser(user);

    const id = $("scheduled-message-id")?.value.trim() || "";
    const mensaje = $("scheduled-message-text")?.value.trim() || "";
    const fechaHora = $("scheduled-message-datetime")?.value.trim() || "";
    const repetir = $("scheduled-message-repeat")?.value || "none";
    if (!mensaje || !fechaHora) return showToast("Escribe el mensaje y selecciona fecha y hora.", "error");

    const op = id ? "update" : "create";
    const itemId = id || `sch-${Date.now()}`;
    const item = normalizeScheduledMsg({
      id: itemId,
      deUsuario: user,
      paraUsuario: partner,
      mensaje,
      fechaHora,
      repetir,
      enviado: false,
      estado: "pendiente"
    });

    const list = getMensajesProgramados();
    if (id) saveMensajesProgramados(list.map(x => (x.id === id ? item : x)));
    else saveMensajesProgramados([item, ...list]);

    resetScheduledMessageForm();
    renderScheduledMessagesList();

    await postToBackend("manageScheduledMessages", {
      op,
      subAction: op,
      usuario: user,
      deUsuario: user,
      paraUsuario: partner,
      item: {
        ...item,
        fechaHoraProgramada: fechaHora,
        scheduledAt: fechaHora,
        repeticion: repetir,
        repeat: repetir,
        message: mensaje
      }
    }, {
      okMsg: id ? "⏰ Mensaje programado actualizado ☁️" : "⏰ ¡Mensaje programado en la nube! Se enviará a la hora exacta 🚀",
      offlineMsg: "⏰ Mensaje programado guardado localmente",
      onSuccess: res => {
        if (Array.isArray(res?.mensajesProgramados)) {
          saveMensajesProgramados(res.mensajesProgramados);
          renderScheduledMessagesList();
        }
      }
    });
  });

  renderScheduledMessagesList();
}

/* --- Anexo B (#5): Exportar Copia de Seguridad Completa en JSON (`#btn-export-backup-json`) --- */

function exportFullBackupJson() {
  const payload = {
    app: APP_IDENTITY.NAME,
    version: "v4.0.0",
    exportedAt: new Date().toISOString(),
    exportedBy: getCurrentUser() || "sin_identificar",
    plans: getPlans(),
    mural: getMural(),
    cupones: getCupones(),
    puntos: getPuntos(),
    sabiduria: getSabiduria(),
    preguntas: getPreguntas(),
    personajes: getPersonajes(),
    frasesDedicadas: getFrasesDedicadas(),
    mensajesProgramados: getMensajesProgramados(),
    configuracion: getConfiguracion()
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bitacora-mango-primavera-backup-${todayLocal()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} }, 1500);
  showToast("💾 Copia de seguridad JSON descargada", "success");
}

/* --- Ajustes Generales y Gestor de Preguntas Trampa --- */

function openSettingsModal() {
  renderIdentityUI();
  updatePushStatusUI();
  renderDedicatedQuotePanel();
  renderScheduledMessagesList();
  renderSabiduria();
  resetTrampaForm();
  renderTrampaList();
  $("settings-modal")?.classList.add("is-open");
}

function resetTrampaForm() {
  $("form-trampa-question")?.reset();
  if ($("trampa-question-id")) $("trampa-question-id").value = "";
  setText("btn-save-trampa", "Guardar pregunta");
  $("btn-cancel-trampa-edit")?.classList.add("is-hidden");
}

function renderTrampaList() {
  const listEl = $("trampa-questions-list"), emptyEl = $("trampa-empty");
  if (!listEl) return;
  const user = getCurrentUser();
  const partner = getPartnerUser(user);

  const mine = user
    ? getPreguntas().filter(q => q.creadoPor === user || (q.paraUsuario === partner && q.creadoPor !== partner))
    : [];

  listEl.innerHTML = "";
  if (mine.length === 0) {
    emptyEl?.classList.remove("is-hidden");
    return;
  }
  emptyEl?.classList.add("is-hidden");

  const frag = document.createDocumentFragment();
  mine.forEach(q => {
    const row = document.createElement("div");
    row.className = "trampa-item";
    row.innerHTML = `
      <span class="trampa-item-text">${escapeHtml(q.pregunta)}</span>
      <button class="trampa-item-btn trampa-edit-btn" type="button" data-trampa-id="${escapeHtml(q.id)}" aria-label="Editar pregunta">✏️</button>
      <button class="trampa-item-btn trampa-del-btn" type="button" data-trampa-id="${escapeHtml(q.id)}" aria-label="Eliminar pregunta">🗑️</button>`;
    frag.appendChild(row);
  });
  listEl.appendChild(frag);
}

function setupSettings() {
  $("btn-enable-push")?.addEventListener("click", handleEnablePush);
  $("btn-export-backup-json")?.addEventListener("click", exportFullBackupJson);
  $("btn-cancel-trampa-edit")?.addEventListener("click", resetTrampaForm);

  setupDedicatedQuotePanel();
  setupScheduledMessagesPanel();

  $("trampa-questions-list")?.addEventListener("click", async ev => {
    const editBtn = ev.target.closest(".trampa-edit-btn");
    if (editBtn?.dataset.trampaId) {
      const q = getPreguntas().find(item => item.id === editBtn.dataset.trampaId);
      if (!q) return;
      if ($("trampa-question-id")) $("trampa-question-id").value = q.id;
      if ($("trampa-question-text")) $("trampa-question-text").value = q.pregunta;
      if ($("trampa-option-a")) $("trampa-option-a").value = q.opcionA;
      if ($("trampa-option-b")) $("trampa-option-b").value = q.opcionB;
      if ($("trampa-option-c")) $("trampa-option-c").value = q.opcionC;
      if ($("trampa-option-d")) $("trampa-option-d").value = q.opcionD;
      const firstAns = normText(q.respuestasCorrectas[0] || q.opcionCorrecta);
      let letter = "A";
      if (normText(q.opcionB) === firstAns) letter = "B";
      else if (normText(q.opcionC) === firstAns) letter = "C";
      else if (normText(q.opcionD) === firstAns) letter = "D";
      if ($("trampa-correct")) $("trampa-correct").value = letter;
      setText("btn-save-trampa", "Actualizar pregunta");
      $("btn-cancel-trampa-edit")?.classList.remove("is-hidden");
      $("trampa-question-text")?.focus();
      return;
    }

    const delBtn = ev.target.closest(".trampa-del-btn");
    if (delBtn?.dataset.trampaId) {
      const id = delBtn.dataset.trampaId;
      if (!window.confirm("¿Eliminar esta pregunta trampa?")) return;
      savePreguntas(getPreguntas().filter(q => q.id !== id));
      renderTrampaList();
      await postToBackend("managePreguntas", { op: "delete", item: { id } }, {
        okMsg: "Pregunta eliminada 🗑️",
        offlineMsg: "Pregunta eliminada 🗑️",
        onSuccess: res => { if (Array.isArray(res?.preguntas)) { savePreguntas(res.preguntas.map(normalizePregunta)); renderTrampaList(); } }
      });
    }
  });

  $("form-trampa-question")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const user = getCurrentUser();
    if (!user) return showToast("Elige primero tu identidad arriba para guardar preguntas trampa.", "error");
    const partner = getPartnerUser(user);

    const id = $("trampa-question-id")?.value.trim() || "";
    const pregunta = $("trampa-question-text")?.value.trim() || "";
    const opcionA = $("trampa-option-a")?.value.trim() || "";
    const opcionB = $("trampa-option-b")?.value.trim() || "";
    const opcionC = $("trampa-option-c")?.value.trim() || "";
    const opcionD = $("trampa-option-d")?.value.trim() || "";
    const correctLetter = $("trampa-correct")?.value || "A";
    const mapLetter = { A: opcionA, B: opcionB, C: opcionC, D: opcionD };
    const opcionCorrecta = mapLetter[correctLetter] || opcionA;

    if (!pregunta || !opcionA || !opcionB) {
      return showToast("Escribe la pregunta y al menos las opciones A y B.", "error");
    }

    const op = id ? "update" : "create";
    const itemId = id || `preg-${Date.now()}`;
    const item = normalizePregunta({
      id: itemId,
      paraUsuario: partner,
      pregunta,
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      opcionCorrecta,
      creadoPor: user
    });

    const list = getPreguntas();
    if (id) savePreguntas(list.map(q => (q.id === id ? item : q)));
    else savePreguntas([...list, item]);

    resetTrampaForm();
    renderTrampaList();

    await postToBackend("managePreguntas", { op, usuario: user, item }, {
      okMsg: id ? "Pregunta trampa actualizada ☁️📝" : `¡Pregunta secreta guardada para ${getUserMeta(partner)?.shortName || "tu pareja"}! 🤫`,
      offlineMsg: "Pregunta trampa guardada localmente 📝",
      onSuccess: res => { if (Array.isArray(res?.preguntas)) { savePreguntas(res.preguntas.map(normalizePregunta)); renderTrampaList(); } }
    });
  });
}

/* --- Modales, Toasts, Render Global y Bootstrap PWA V4 --- */

function closeModal(modalId) {
  const modal = $(modalId);
  if (!modal) return;
  modal.classList.remove("is-open");

  if (modalId === "lightbox-modal") {
    stopLightboxMusic();
    const vid = $("lightbox-video");
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); vid.classList.add("is-hidden"); }
    const iframe = $("lightbox-iframe");
    if (iframe) { iframe.src = "about:blank"; iframe.classList.add("is-hidden"); }
    currentLightboxItemId = null;
    currentLightboxItem = null;
  } else if (modalId === "plan-modal") {
    stopModalMusicPreview();
    const vid = $("plan-modal-video-preview");
    if (vid) vid.pause();
  } else if (modalId === "mural-upload-modal") {
    stopModalMusicPreview();
    const vid = $("mural-preview-video");
    if (vid) vid.pause();
  }
}

function setupModalClose() {
  document.addEventListener("click", ev => {
    const btn = ev.target.closest("[data-close-modal]");
    if (btn) {
      const id = btn.getAttribute("data-close-modal");
      if (id) closeModal(id);
      else btn.closest(".modal-overlay")?.classList.remove("is-open");
      return;
    }
    if (ev.target.classList?.contains("modal-overlay") && !ev.target.classList.contains("modal-blocking")) {
      closeModal(ev.target.id);
    }
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape") {
      $$(".modal-overlay.is-open").forEach(m => {
        if (!m.classList.contains("modal-blocking")) closeModal(m.id);
      });
    }
  });
}

function showToast(msg, type = "info") {
  const box = $("toast-container");
  if (!box || !msg) return;
  const t = document.createElement("div");
  t.className = `toast toast-${["info", "success", "error"].includes(type) ? type : "info"}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => {
    t.classList.add("is-leaving");
    setTimeout(() => t.remove(), reducedMotion() ? 50 : 320);
  }, 3200);
}

function renderAllViews() {
  renderScoreboards();
  renderMoodUI();
  updateEncuentroCountdownTick();
  renderProgressTracker();
  renderRuletaPool();
  renderBaul();
  renderMural();
  renderPremios();
  renderReparto();
  renderSabiduria();
}

function initApp() {
  setupThemeToggle();
  setupCoquiMascot();
  setupPersistentTouchBanner();
  setupIdentityAndHeader();
  initOneSignal();
  initTriviaLock();
  setupWelcomeQuoteScene();
  setupNavigation();
  setupMoodTracker();
  setupProximoEncuentro();
  setupRuleta();
  setupBaul();
  setupMural();
  setupPremios();
  setupReparto();
  setupSabiduria();
  setupDobbyAI();
  setupMovieProtocol();
  setupSettings();
  setupModalClose();
  renderAllViews();

  $("btn-sync-refresh")?.addEventListener("click", () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => { try { r.update(); } catch {} })).catch(() => {});
    }
    syncWithBackend(true);
  });
  syncWithBackend(false);

  // Pulso silencioso cada 18s cuando la ventana está visible y al enfocar la app
  setInterval(() => {
    if (!document.hidden && getCurrentUser()) syncWithBackend(false, true);
  }, 18000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (!getIncomingTouch()) clearAppBadgeCount();
      if (getCurrentUser()) syncWithBackend(false, true);
    }
  });
  window.addEventListener("focus", () => {
    if (!getIncomingTouch()) clearAppBadgeCount();
    if (getCurrentUser()) syncWithBackend(false, true);
  });
}

// Registro resiliente del Service Worker:
// OneSignalSDKWorker.js importa tanto el SDK Push v16 como `./sw.js` (caché v4.0),
// evitando guerras de controladores en el mismo scope; si estamos offline o sin OneSignal,
// registramos `./sw.js` directamente como respaldo.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swScope = location.pathname.includes("/bitacora-mango-primavera")
      ? "/bitacora-mango-primavera/"
      : "./";
    const targetWorker = (isOneSignalConfigured() && navigator.onLine)
      ? "./OneSignalSDKWorker.js"
      : "./sw.js";
    navigator.serviceWorker.register(targetWorker, { scope: swScope, updateViaCache: "none" })
      .then(reg => { try { reg.update(); } catch {} })
      .catch(() => {
        navigator.serviceWorker.register("./sw.js", { scope: swScope, updateViaCache: "none" }).catch(() => {});
      });
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initApp);
else initApp();
