/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA (Simón & Salomé) · FRONTEND V3
 * ============================================================================
 * ARCHIVO: app.js · Motor Lógico SPA Offline-First + Google Apps Script V3
 * ARQUITECTURA (Ingeniería Mecatrónica):
 *   0. BACKDOORs: identidad, configuración, semillas y fallbacks locales.
 *   1. Estado en RAM, utilidades transversales, fechas limpias y capa API GAS.
 *   2. Identidad (Simón/Salo), OneSignal Web Push y botón háptico.
 *   3. Candado Asimétrico de Trivia + Confeti tricolor/azul cielo + Puntos.
 *   4. Navegación (4 pestañas + 2 sub-vistas) y Sincronización Cloud.
 *   5. Compresión de imágenes (Canvas) + Videos con póster y límite 30 MB.
 *   6. Inicio: Marcador, Progreso tricolor y Ruleta del Destino (sin secretos).
 *   7. El Baúl: Pendientes vs Completados aislados + 2 buscadores + Modales.
 *   8. El Mural: Masonry Pinterest + Póster de video + Lightbox + Borrado.
 *   9. Premios: Tienda de cupones canjeables + Saldo real + CRUD.
 *  10. El Reparto: Protagonistas + Secundarios + Vínculo con planes + CRUD.
 *  11. Sabiduría: 3 categorías + Galleta de la fortuna + CRUD.
 *  12. Ajustes: Identidad, Push y Gestor de Preguntas Trampa secretas.
 *  13. Modales, Toasts y Arranque (Bootstrap + Service Worker).
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

// 🛠️ BACKDOOR: CONFIGURACIÓN DE CONEXIÓN, MEDIOS Y STORAGE (APP_CONFIG)
const APP_CONFIG = {
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxQy9VR4nCoM-FUuAP5sjrAAC7q_nf2n0mToEc6aBN46ViPU9hPi--PPRxoRSWDEp4/exec",
  ONESIGNAL_APP_ID: "TU_ONESIGNAL_APP_ID",
  IMAGE_MAX_WIDTH: 1200, // Límite de ancho (px) tras compresión Canvas
  IMAGE_QUALITY: 0.8,    // Factor de calidad JPEG (0.0 a 1.0)
  MAX_VIDEO_MB: 30,      // Límite máximo de video directo (usar Atajo iOS si supera)
  TRIVIA_POINTS: 10,
  TRIVIA_MAX_PER_DAY: 3,
  PLAN_COMPLETION_POINTS: 50,
  STORAGE_KEYS: {
    IDENTITY: "bitacora_identity_v3",
    PLANS: "bitacora_plans_v3",
    MURAL: "bitacora_mural_v3",
    CUPONES: "bitacora_cupones_v3",
    PUNTOS: "bitacora_puntos_v3",
    SABIDURIA: "bitacora_sabiduria_v3",
    PREGUNTAS: "bitacora_preguntas_v3",
    PERSONAJES: "bitacora_personajes_v3"
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
  "¡Oops! Parece que un impostor intentó entrar sin saber la historia.",
  "¡Vaya! Esa respuesta sonó sospechosa… inténtalo de nuevo.",
  "Casi lo logras, pero el candado de Mango y Primavera dice que no.",
  "¡Error! Diomedes y el destino detectaron una falla en tu memoria.",
  "¡No te rindas! Prueba con otra pregunta de nuestra historia.",
  "¡Ay! El candado cerró compuertas. Va otra pregunta distinta."
];

// 🛠️ BACKDOOR: LISTA MAESTRA INICIAL DE 33 PLANES (INITIAL_PLANS)
const INITIAL_PLANS = [
  { id: "plan-01", title: "Ver Harry Potter y el Cáliz de Fuego", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🧙‍♂️", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-02", title: "Ver Harry Potter y la Orden del Fénix", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🪄", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-03", title: "Ver Harry Potter y el Misterio del Príncipe", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚡", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-04", title: "Ver Harry Potter y las Reliquias de la Muerte", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🦉", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-05", title: "Ver Django Sin Cadenas", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🤠", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-06", title: "Ver Las muñecas de la mafia", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "📺", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-07", title: "Ver El abogado del diablo", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚖️", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-08", title: "Jugar GTA 6", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋🔋", emoji: "🎮", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-09", title: "Ir a Bárbaro Cocina", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥩", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-10", title: "Ir a El Sause", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍽️", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-11", title: "Ir a comer sándwiches de pastrami", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥪", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-12", title: "Hacer empanadas, buñuelos y natilla", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🥟", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-13", title: "Hacer una torta", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🎂", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-14", title: "Competir por comida (Reto TikTok)", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍔", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: true, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-15", title: "Adivinar comida y objetos (con los ojos vendados)", category: "Gastronomía", weather: "🌧️", energy: "🔋", emoji: "🙈", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: true, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-16", title: "Picnic improvisado", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🧺", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-17", title: "Ir a Calixto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🍹", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-18", title: "Ir a María Mezcal", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🌮", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-19", title: "Ir a La Sala del Despecho", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎤", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-20", title: "Ir a las Fiestas del Retiro", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎉", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-21", title: "Ir al Teatro Victoria", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎭", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-22", title: "Juegos de tomar en casa", category: "Rumbas", weather: "🌧️", energy: "🔋🔋", emoji: "🎲", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-23", title: "Ir a un concierto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎶", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-24", title: "Noche de fonda tradicional", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🐎", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-25", title: "Competencia de tragos (a ver quién aguanta más)", category: "Rumbas", weather: "🌧️", energy: "🔋🔋🔋", emoji: "🥃", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: true, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-26", title: "Volver donde todo empezó (Finca en Guatapé)", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🏡", isVip: true, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-27", title: "Tarde de spa", category: "Relax", weather: "🌧️", energy: "🔋", emoji: "💆", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-28", title: "Salo pasando la tarde con mis papás", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "👨‍👩‍👧", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-29", title: "Yo pasando la tarde con los papás de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "☕", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-30", title: "Tarde todos juntos en familia", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "🫶", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-31", title: "Domingo de jacuzzi", category: "Relax", weather: "☀️", energy: "🔋", emoji: "🫧", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-32", title: "Cumple de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🥳", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" },
  { id: "plan-33", title: "Hacer una Novena de Navidad juntos", category: "Relax", weather: "🌧️", energy: "🔋🔋", emoji: "🎄", isVip: false, completed: false, anecdote: "", photoUrl: "", mediaType: "", posterUrl: "", isReto: false, ganadorReto: "", isSecreto: false, fechaDesbloqueo: "", creadoPor: "" }
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

// 🛠️ BACKDOOR: SALDOS INICIALES DE PUNTOS (INITIAL_PUNTOS)
const INITIAL_PUNTOS = [
  { usuario: "simon", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" },
  { usuario: "salo", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" }
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
  { id: "mural-01", caption: "Guatapé: donde empezó toda esta historia 🥭", createdAt: "10 de Septiembre, 2022", mediaType: "image", posterUrl: "", creadoPor: "", photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320'><defs><linearGradient id='m1' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23FFCC80'/><stop offset='60%25' stop-color='%23F8BBD0'/><stop offset='100%25' stop-color='%23FFFDF9'/></linearGradient></defs><rect width='400' height='320' fill='url(%23m1)'/><circle cx='310' cy='76' r='34' fill='%23FFB347'/><path d='M0 220 Q100 165 200 210 T400 205 L400 320 L0 320 Z' fill='%23A5D6A7'/><path d='M140 220 C150 115 178 84 206 84 C234 84 258 122 266 220 Z' fill='%2381C784'/><rect y='225' width='400' height='95' fill='%2381D4FA' opacity='0.75'/><path d='M155 252 L245 252 L228 268 L172 268 Z' fill='%23FF8A80'/><text x='200' y='298' font-family='Georgia,serif' font-size='18' font-weight='bold' text-anchor='middle' fill='%232D231E'>Guatapé · Simón &amp; Salomé</text></svg>" },
  { id: "mural-02", caption: "Nuestro refugio de Mango y Primavera 🌸", createdAt: "10 de Septiembre, 2025", mediaType: "image", posterUrl: "", creadoPor: "", photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 400'><defs><linearGradient id='m2' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23E1F5FE'/><stop offset='55%25' stop-color='%23FFFDF9'/><stop offset='100%25' stop-color='%23FFCC80'/></linearGradient></defs><rect width='320' height='400' fill='url(%23m2)'/><circle cx='70' cy='80' r='32' fill='%2381D4FA' opacity='0.55'/><circle cx='252' cy='320' r='38' fill='%23A5D6A7' opacity='0.55'/><path d='M160 150 C140 120 96 126 96 164 C96 202 160 244 160 244 C160 244 224 202 224 164 C224 126 180 120 160 150 Z' fill='%23FF8A80'/><circle cx='160' cy='180' r='16' fill='%23FFB347'/><text x='160' y='310' font-family='Georgia,serif' font-size='19' font-weight='bold' text-anchor='middle' fill='%232D231E'>Tú y Yo 🥭🌸</text></svg>" }
];

const VIDEO_POSTER_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='vp' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23E1F5FE'/><stop offset='55%25' stop-color='%23FFCC80'/><stop offset='100%25' stop-color='%23F8BBD0'/></linearGradient></defs><rect width='400' height='300' fill='url(%23vp)'/><text x='200' y='265' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle' fill='%232D231E'>Video · Toca para reproducir</text></svg>";
const MESES_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const SABIDURIA_LABELS = { Animo: "💛 Para levantar el ánimo", Charras: "😂 Frases charras de los dos", Idolos: "🌟 De nuestros ídolos" };

/* ==========================================================================
   1. ESTADO EN RAM, HELPERS TRANSVERSALES Y CAPA DE STORAGE / API
   ========================================================================== */

let lastTriviaId = "", currentTrivia = null, isRuletaRolling = false, isSyncing = false;
let currentRuletaPool = [], currentWinnerPlanId = null;
let editingPlanId = null, pendingPlanMedia = null, pendingMuralMedia = null, pendingActorPhoto = null;
let currentLightboxItemId = null, lastFortuneId = "";
let oneSignalInitialized = false;

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
  return "";
}

/** Determina si un plan secreto sigue bloqueado para el usuario actual. */
function isPlanLocked(plan, currentUser) {
  if (!plan) return false;
  if (plan.isMasked) return true;
  if (!plan.isSecreto) return false;
  const unlockIso = toIsoDate(plan.fechaDesbloqueo);
  if (!unlockIso || todayLocal() >= unlockIso) return false;
  if (currentUser && plan.creadoPor && plan.creadoPor === currentUser) return false;
  return true;
}

/** Normalizadores de colecciones en localStorage (offline-first). */
function normalizePlan(p, fallback = {}) {
  const isSecreto = Boolean(p.isSecreto ?? fallback.isSecreto);
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
    isReto: Boolean(p.isReto ?? fallback.isReto),
    ganadorReto: String(p.ganadorReto ?? fallback.ganadorReto ?? ""),
    isSecreto,
    fechaDesbloqueo: toIsoDate(p.fechaDesbloqueo ?? fallback.fechaDesbloqueo ?? ""),
    creadoPor: String(p.creadoPor ?? fallback.creadoPor ?? ""),
    isMasked: Boolean(p.isMasked)
  };
}

function getPlans() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.PLANS, null);
  if (!Array.isArray(stored) || stored.length === 0) return INITIAL_PLANS.map(p => normalizePlan(p));
  return stored.filter(p => p && p.id).map(p => normalizePlan(p));
}
const savePlans = list => setStored(APP_CONFIG.STORAGE_KEYS.PLANS, list);

function getMural() {
  const stored = getStored(APP_CONFIG.STORAGE_KEYS.MURAL, null);
  const src = Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_MURAL;
  return src.filter(m => m && m.id).map(m => ({
    id: String(m.id),
    caption: String(m.caption || ""),
    photoUrl: String(m.photoUrl || ""),
    createdAt: formatCleanDate(m.createdAt || ""),
    mediaType: m.mediaType === "video" ? "video" : "image",
    posterUrl: String(m.posterUrl || ""),
    creadoPor: String(m.creadoPor || "")
  }));
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
    simon: { usuario: "simon", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" },
    salo: { usuario: "salo", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" }
  };
  if (Array.isArray(stored)) {
    stored.forEach(row => {
      const u = row?.usuario;
      if (u === "simon" || u === "salo") {
        base[u] = {
          usuario: u,
          puntosTotales: Math.max(0, Number(row.puntosTotales) || 0),
          preguntasRespondidasHoy: Math.max(0, Number(row.preguntasRespondidasHoy) || 0),
          ultimaFechaTrivia: toIsoDate(row.ultimaFechaTrivia || "")
        };
      }
    });
  }
  return [base.simon, base.salo];
}
const savePuntos = list => setStored(APP_CONFIG.STORAGE_KEYS.PUNTOS, list);

function getUserPuntos(usuario) {
  const list = getPuntos();
  return list.find(p => p.usuario === usuario) || { usuario, puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" };
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
   2. IDENTIDAD (SIMÓN / SALO), ONESIGNAL PUSH Y BOTÓN "PENSANDO EN TI"
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
  setText("trampa-partner-name", partner ? partner.shortName : "mi pareja");
}

function setCurrentUser(user, { triggerSync = true } = {}) {
  if (user !== "simon" && user !== "salo") return;
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.IDENTITY, user);
  renderIdentityUI();
  loginOneSignalUser(user);
  renderAllViews();
  renderTrampaList();
  const meta = getUserMeta(user);
  showToast(`¡Hola, ${meta.emoji} ${meta.shortName}! Identidad guardada.`, "success");
  if (triggerSync) syncWithBackend(false);
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

  // Botón háptico "Pensando en ti"
  $("btn-thinking-of-you")?.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) {
      $("identity-modal")?.classList.add("is-open");
      return showToast("Primero elige quién eres para mandar el toque 🥭🌸", "info");
    }
    const btn = $("btn-thinking-of-you");
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    if (btn) {
      btn.classList.remove("is-pulsing");
      void btn.offsetWidth;
      btn.classList.add("is-pulsing");
      setTimeout(() => btn.classList.remove("is-pulsing"), 1900);
    }
    const partner = getUserMeta(getPartnerUser(user));
    await postToBackend("sendThinkingPush", { usuario: user }, {
      okMsg: `💛 Le avisamos a ${partner?.shortName || "tu pareja"} que estás pensando en él/ella`,
      offlineMsg: `💛 Toque de cariño enviado para ${partner?.shortName || "tu pareja"}`
    });
  });

  $("btn-open-settings")?.addEventListener("click", openSettingsModal);
}

/** Inicializa OneSignal Web Push v16 si APP_ID está configurado. */
function initOneSignal() {
  if (oneSignalInitialized || !isOneSignalConfigured()) {
    updatePushStatusUI();
    return;
  }
  oneSignalInitialized = true;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      await OneSignal.init({
        appId: APP_CONFIG.ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true
      });
      const user = getCurrentUser();
      if (user) await OneSignal.login(user);
      updatePushStatusUI();
    } catch (err) {
      console.warn("OneSignal init omitido:", err);
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
  if (!isOneSignalConfigured()) {
    txt.textContent = "Las notificaciones push se activarán automáticamente cuando configures ONESIGNAL_APP_ID en app.js y backend.gs.";
    btn.textContent = "🔔 Notificaciones (pendiente de App ID)";
    return;
  }
  const granted = typeof Notification !== "undefined" && Notification.permission === "granted";
  txt.textContent = granted
    ? "Notificaciones activas en este dispositivo ✅"
    : "Activa las notificaciones para enterarte cuando el otro suba algo, complete un plan o piense en ti.";
  btn.textContent = granted ? "✅ Notificaciones activas" : "🔔 Activar notificaciones";
}

function handleEnablePush() {
  if (!isOneSignalConfigured()) {
    return showToast("Configura ONESIGNAL_APP_ID en app.js para activar notificaciones push.", "info");
  }
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      await OneSignal.Notifications.requestPermission();
      const user = getCurrentUser();
      if (user) await OneSignal.login(user);
      updatePushStatusUI();
      showToast("¡Notificaciones configuradas! 🔔", "success");
    } catch (err) {
      showToast("No se pudo activar las notificaciones en este navegador.", "error");
    }
  });
}

/* ==========================================================================
   3. CANDADO ASIMÉTRICO DE TRIVIA (SIN PERSISTENCIA DE SESIÓN)
   ========================================================================== */

function getTriviaPoolForUser() {
  const all = getPreguntas();
  const user = getCurrentUser();
  if (!user) return all;
  const filtered = all.filter(q => q.paraUsuario === user || q.paraUsuario === "ambos");
  return filtered.length > 0 ? filtered : all;
}

function initTriviaLock() {
  const qEl = $("trivia-question"), optsEl = $("trivia-options"), fb = $("trivia-feedback"), card = $("trivia-card");
  const pool = getTriviaPoolForUser();
  if (!qEl || !optsEl || pool.length === 0) return;

  let chosen;
  let guard = 0;
  do {
    chosen = pool[Math.floor(Math.random() * pool.length)];
    guard++;
  } while (chosen.id === lastTriviaId && pool.length > 1 && guard < 10);

  lastTriviaId = chosen.id;
  currentTrivia = chosen;

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

  if (isTriviaSelectionCorrect(currentTrivia, selected)) {
    btn.classList.add("is-correct");
    const user = getCurrentUser();
    let feedbackMsg = "¡Correcto! Bienvenidos a su refugio 🥭🌸";

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
          feedbackMsg = `¡Correcto! +${APP_CONFIG.TRIVIA_POINTS} pts (${me.preguntasRespondidasHoy}/${APP_CONFIG.TRIVIA_MAX_PER_DAY} hoy) 🥭🌸`;
        } else {
          feedbackMsg = `¡Correcto! Límite diario (${APP_CONFIG.TRIVIA_MAX_PER_DAY}/${APP_CONFIG.TRIVIA_MAX_PER_DAY}) completado hoy 🥭🌸`;
        }
      }
      postToBackend("answerTrivia", {
        usuario: user,
        preguntaId: currentTrivia.id,
        respuesta: selected,
        correct: true
      }, {
        silent: true,
        onSuccess: res => {
          if (Array.isArray(res?.puntosAll)) {
            savePuntos(res.puntosAll);
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

    setTimeout(() => {
      const lock = $("lock-screen");
      lock?.classList.add("is-unlocked");
      lock?.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        if (lock) lock.style.display = "none";
        if (!getCurrentUser()) $("identity-modal")?.classList.add("is-open");
      }, reducedMotion() ? 50 : 750);
    }, reducedMotion() ? 80 : 900);
  } else {
    btn.classList.add("is-wrong");
    if (fb) {
      fb.textContent = IMPOSTOR_MESSAGES[Math.floor(Math.random() * IMPOSTOR_MESSAGES.length)];
      fb.classList.remove("is-success");
      fb.classList.add("is-error");
    }
    if (card) {
      card.classList.remove("shake-error");
      void card.offsetWidth;
      card.classList.add("shake-error");
    }
    setTimeout(initTriviaLock, reducedMotion() ? 400 : 1150);
  }
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
   4. NAVEGACIÓN (4 PESTAÑAS + 2 SUB-VISTAS) Y SINCRONIZACIÓN CLOUD
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
  $("btn-open-reparto")?.addEventListener("click", () => { renderReparto(); activateView("view-reparto", "view-inicio"); });
  $("btn-back-from-reparto")?.addEventListener("click", () => activateView("view-inicio"));
  $("btn-open-sabiduria")?.addEventListener("click", () => { renderSabiduria(); activateView("view-sabiduria", "view-inicio"); });
  $("btn-back-from-sabiduria")?.addEventListener("click", () => activateView("view-inicio"));
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
    const user = getCurrentUser();
    const userQuery = user ? `&usuario=${encodeURIComponent(user)}` : "";
    const resp = await fetch(`${APP_CONFIG.GAS_WEB_APP_URL}${sep}action=getAppData${userQuery}`, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.status && data.status !== "ok") throw new Error(data.message || "Error remoto");

    if (Array.isArray(data.plans)) savePlans(data.plans.map(p => normalizePlan(p)));
    if (Array.isArray(data.mural)) saveMural(data.mural);
    if (Array.isArray(data.cupones)) saveCupones(data.cupones);
    if (Array.isArray(data.puntos)) savePuntos(data.puntos);
    if (Array.isArray(data.sabiduria)) saveSabiduria(data.sabiduria);
    if (Array.isArray(data.preguntas) && data.preguntas.length > 0) savePreguntas(data.preguntas.map(normalizePregunta));
    if (Array.isArray(data.personajes)) savePersonajes(data.personajes);

    renderAllViews();
    renderTrampaList();
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

/* ==========================================================================
   5. PROCESAMIENTO DE MEDIOS: IMÁGENES (CANVAS) + VIDEOS (PÓSTER + 30 MB)
   ========================================================================== */

/** Redimensiona a `IMAGE_MAX_WIDTH` y comprime a JPEG en `<canvas>`. */
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Selecciona una imagen válida."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = ev => {
      const img = new Image();
      img.onerror = () => reject(new Error("Formato de imagen incompatible."));
      img.onload = () => {
        const c = document.createElement("canvas");
        const s = Math.min(APP_CONFIG.IMAGE_MAX_WIDTH / img.width, 1);
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("Canvas no disponible."));
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL("image/jpeg", APP_CONFIG.IMAGE_QUALITY);
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

/** Caché en sesión de Blobs de video (evita re-descargar y evita errores de MIME/Range en iOS Safari). */
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

/**
 * Carga y reproduce un video de forma 100% compatible con iOS Safari:
 * 1. Si hay un Blob local en memoria (recién subido o ya descargado), lo reproduce de inmediato en `<video>`.
 * 2. Si viene de Google Drive, descarga el binario por CORS desde `drive.usercontent.google.com`,
 *    lo empaqueta como `Blob` con MIME `video/mp4` (evitando el bloqueo de `application/octet-stream` de Safari)
 *    y lo asigna a `<video>`. Si falla CORS, cae automáticamente al visor `<iframe>` de Drive `/preview`.
 */
async function loadVideoIntoPlayer(vidEl, iframeEl, item) {
  if (!item) return;
  const poster = getEffectivePoster(item);
  const driveId = extractDriveId(item.photoUrl);
  const cachedBlob = (item.blobUrl && item.blobUrl.startsWith("blob:"))
    ? item.blobUrl
    : (SESSION_VIDEO_BLOBS.get(item.id) || (driveId ? SESSION_VIDEO_BLOBS.get(driveId) : ""));

  if (iframeEl) { iframeEl.src = "about:blank"; iframeEl.classList.add("is-hidden"); }

  if (cachedBlob && vidEl) {
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

/** Captura el primer fotograma de un video como miniatura JPEG (Canvas, compatible iOS Safari WebKit). */
function captureVideoPoster(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;

    // En iOS Safari el decodificador de hardware exige que el <video> esté en el DOM
    video.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1;";
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

/** Valida tamaño <= 30 MB, genera póster del primer fotograma y lee video en Base64. */
async function processVideoFile(file) {
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > APP_CONFIG.MAX_VIDEO_MB) {
    throw new Error(`El video pesa ${sizeMb.toFixed(1)} MB (máx. ${APP_CONFIG.MAX_VIDEO_MB} MB). Optimízalo primero con el Atajo de iOS 🎬`);
  }
  const blobUrl = URL.createObjectURL(file);
  const poster = await captureVideoPoster(file);
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el video."));
    reader.onload = ev => resolve(ev.target.result);
    reader.readAsDataURL(file);
  });
  const base64 = String(dataUrl).split(",")[1] || "";
  return {
    mediaType: "video",
    dataUrl,
    blobUrl,
    base64,
    mimeType: file.type || "video/mp4",
    fileName: file.name || `video_${Date.now()}.mp4`,
    posterDataUrl: poster.posterDataUrl,
    posterBase64: poster.posterBase64,
    sizeMb: sizeMb.toFixed(1)
  };
}

/** Conecta un <input type="file" accept="image/*,video/*"> con vista previa dual. */
function bindMediaPicker({ inputId, wrapId, imgId, videoId, metaId, onReady }) {
  $(inputId)?.addEventListener("change", async ev => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(file.name || "");
    try {
      setText(metaId, isVideo ? "Procesando video y póster…" : "Optimizando foto…");
      $(wrapId)?.classList.remove("is-hidden");

      const res = isVideo ? await processVideoFile(file) : await compressImageFile(file);
      onReady(res);

      const img = $(imgId), vid = $(videoId);
      if (res.mediaType === "video") {
        if (img) { img.removeAttribute("src"); img.classList.add("is-hidden"); }
        if (vid) {
          vid.src = res.blobUrl || res.dataUrl;
          if (res.posterDataUrl) vid.poster = res.posterDataUrl;
          vid.classList.remove("is-hidden");
          try { vid.load(); } catch {}
        }
        setText(metaId, `🎥 Video listo (${res.sizeMb} MB)`);
      } else {
        if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
        if (img) { img.src = res.dataUrl; img.classList.remove("is-hidden"); }
        setText(metaId, `📷 ${res.originalKb} KB → ${res.compressedKb} KB`);
      }
    } catch (err) {
      showToast(err.message || "Error al procesar el archivo.", "error");
      ev.target.value = "";
      $(wrapId)?.classList.add("is-hidden");
      setText(metaId, "");
    }
  });
}

/* ==========================================================================
   6. INICIO: MARCADOR, PROGRESO TRICOLOR Y RULETA DEL DESTINO
   ========================================================================== */

function renderScoreboards() {
  const simon = getUserPuntos("simon");
  const salo = getUserPuntos("salo");
  setText("score-simon", String(simon.puntosTotales));
  setText("score-salo", String(salo.puntosTotales));
  setText("premios-score-simon", String(simon.puntosTotales));
  setText("premios-score-salo", String(salo.puntosTotales));

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

function setupRuleta() {
  bindFilterBar("ruleta-weather-filter", ".weather-chip", () => { if (!isRuletaRolling) renderRuletaPool(); });
  $("btn-spin-ruleta")?.addEventListener("click", spinRuleta);
  $("btn-open-winner-plan")?.addEventListener("click", () => { if (currentWinnerPlanId) openPlanModal(currentWinnerPlanId); });
  renderRuletaPool();
}

function renderRuletaPool() {
  const weather = document.querySelector("#ruleta-weather-filter .weather-chip.is-active")?.dataset.weather || "Todos";
  const user = getCurrentUser();
  // Excluye completados y planes secretos aún bloqueados
  const pool = getPlans().filter(p => !p.completed && !isPlanLocked(p, user) && (weather === "Todos" || p.weather === weather));
  currentRuletaPool = pool;
  setText("ruleta-pool-count", `${pool.length} ${pool.length === 1 ? "plan disponible" : "planes disponibles"}`);
  $("ruleta-winner-actions")?.classList.add("is-hidden");
  currentWinnerPlanId = null;

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
  const paint = p => {
    setText("ruleta-slot-emoji", p.emoji || "✨");
    setText("ruleta-slot-title", p.title);
    setText("ruleta-slot-meta", `${p.category} · ${p.weather} · ${p.energy}`);
  };
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

/* ==========================================================================
   7. EL BAÚL: PENDIENTES VS COMPLETADOS AISLADOS + 2 BUSCADORES + MODALES
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

  // Buscadores independientes (coincidencia estricta por título)
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
    card.className = "plan-card is-secret-locked";
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
    isRelax ? "is-relax" : "",
    isRain ? "is-rain" : ""
  ].filter(Boolean).join(" ");

  const winnerBadge = p.isReto && p.ganadorReto
    ? `<span class="plan-badge ${p.ganadorReto === "salo" ? "badge-salo" : p.ganadorReto === "simon" ? "badge-simon" : ""}">${p.ganadorReto === "simon" ? "🏆 Ganó Simón 🥭" : p.ganadorReto === "salo" ? "🏆 Ganó Salo 🌸" : "🤝 Empate"}</span>`
    : (p.isReto ? `<span class="plan-badge badge-reto">🥊 Reto de pareja</span>` : "");

  const secretBadge = p.isSecreto
    ? `<span class="plan-badge badge-secreto">🤫 Sorpresa${p.fechaDesbloqueo ? ` · ${escapeHtml(formatCleanDate(p.fechaDesbloqueo))}` : ""}</span>`
    : "";

  const mediaBadge = p.photoUrl
    ? `<span class="plan-anecdote-badge">${p.mediaType === "video" ? "🎥 Video" : "📷 Foto"}</span>`
    : "";

  card.innerHTML = `
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
      ${winnerBadge}${secretBadge}${mediaBadge}
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
          // Búsqueda quirúrgica estricta por título; planes secretos bloqueados excluidos
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

function openPlanModal(planId) {
  const p = getPlans().find(item => item.id === planId);
  const modal = $("plan-modal");
  if (!p || !modal) return;

  const user = getCurrentUser();
  const locked = isPlanLocked(p, user);
  editingPlanId = p.id;
  pendingPlanMedia = null;

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
  setText("plan-modal-media-meta", "");

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

  // Switch condicional Reto -> selector de ganador
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

  // Switch condicional Secreto -> fecha de desbloqueo
  $("plan-is-secreto")?.addEventListener("change", ev => {
    $("plan-unlock-group")?.classList.toggle("is-hidden", !ev.target.checked);
  });
  $("new-plan-is-secreto")?.addEventListener("change", ev => {
    $("new-plan-unlock-group")?.classList.toggle("is-hidden", !ev.target.checked);
  });

  bindMediaPicker({
    inputId: "plan-modal-media-input",
    wrapId: "plan-modal-media-wrapper",
    imgId: "plan-modal-photo-preview",
    videoId: "plan-modal-video-preview",
    metaId: "plan-modal-media-meta",
    onReady: res => { pendingPlanMedia = res; }
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
    // Limpiar también de personajes vinculados
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

  // Guardar cambios del plan
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
    pendingPlanMedia = null;

    if (isSecreto && !fechaDesbloqueo) {
      return showToast("Elige una fecha de desbloqueo para el plan sorpresa 🤫", "error");
    }

    const user = getCurrentUser();
    if (media?.blobUrl) SESSION_VIDEO_BLOBS.set(planId, media.blobUrl);
    const finalPhotoUrl = media ? (media.mediaType === "video" ? (media.blobUrl || "video-local") : media.dataUrl) : prev.photoUrl;
    const finalMediaType = media ? media.mediaType : prev.mediaType;
    const finalPosterUrl = media ? (media.posterDataUrl || "") : prev.posterUrl;
    const creadoPor = prev.creadoPor || (isSecreto ? user : "");

    plans[idx] = {
      ...prev,
      title, category, weather, energy, emoji, completed, anecdote,
      isReto, ganadorReto, isSecreto, fechaDesbloqueo, creadoPor,
      photoUrl: finalPhotoUrl, mediaType: finalMediaType, posterUrl: finalPosterUrl,
      updatedAt: formatCleanDate(todayLocal())
    };
    savePlans(plans);

    // Puntos optimistas (+50 pts al completar con foto/video + anécdota)
    const earnedLocally = !prev.completed && completed && Boolean(finalPhotoUrl) && Boolean(anecdote) && Boolean(user);
    if (earnedLocally) {
      const pts = getPuntos();
      const me = pts.find(r => r.usuario === user);
      if (me) { me.puntosTotales += APP_CONFIG.PLAN_COMPLETION_POINTS; savePuntos(pts); }
    }

    closeModal("plan-modal");
    renderAllViews();

    const action = (!prev.completed && completed) ? "completePlan" : "updatePlan";
    await postToBackend(action, {
      id: planId,
      usuario: user,
      title, category, weather, energy, emoji, completed, anecdote,
      isReto, ganadorReto, isSecreto, fechaDesbloqueo, creadoPor,
      mediaBase64: media?.base64 || "",
      mimeType: media?.mimeType || "",
      fileName: media?.fileName || "",
      posterBase64: media?.posterBase64 || ""
    }, {
      okMsg: earnedLocally ? `¡Plan completado! +${APP_CONFIG.PLAN_COMPLETION_POINTS} pts ☁️🥭` : "¡Plan guardado en la nube! ☁️🥭",
      offlineMsg: earnedLocally ? `¡Plan completado! +${APP_CONFIG.PLAN_COMPLETION_POINTS} pts ✅` : "Plan guardado localmente ✨",
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
   8. EL MURAL: MASONRY + PÓSTER VIDEO + LIGHTBOX + BORRADO
   ========================================================================== */

function setupMural() {
  $("btn-upload-mural")?.addEventListener("click", () => {
    pendingMuralMedia = null;
    $("form-mural-upload")?.reset();
    if ($("mural-date-input")) $("mural-date-input").value = todayLocal();
    $("mural-preview-wrapper")?.classList.add("is-hidden");
    $("mural-preview-img")?.removeAttribute("src");
    $("mural-preview-img")?.classList.add("is-hidden");
    const vid = $("mural-preview-video");
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
    setText("mural-media-meta", "");
    $("mural-upload-modal")?.classList.add("is-open");
  });

  bindMediaPicker({
    inputId: "mural-media-input",
    wrapId: "mural-preview-wrapper",
    imgId: "mural-preview-img",
    videoId: "mural-preview-video",
    metaId: "mural-media-meta",
    onReady: res => { pendingMuralMedia = res; }
  });

  $("form-mural-upload")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (!pendingMuralMedia) return showToast("Selecciona primero una foto o un video para el Mural.", "error");
    const media = pendingMuralMedia;
    pendingMuralMedia = null;

    const id = `mural-${Date.now()}`;
    const caption = $("mural-caption-input")?.value.trim() || "Recuerdo de Mango & Primavera";
    const rawDate = $("mural-date-input")?.value || todayLocal();
    const cleanDate = formatCleanDate(rawDate);
    const user = getCurrentUser();

    if (media.blobUrl) SESSION_VIDEO_BLOBS.set(id, media.blobUrl);

    const newItem = {
      id,
      caption,
      createdAt: cleanDate,
      photoUrl: media.mediaType === "video" ? (media.blobUrl || "") : media.dataUrl,
      mediaType: media.mediaType,
      posterUrl: media.posterDataUrl || "",
      creadoPor: user,
      blobUrl: media.blobUrl || ""
    };
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
      mediaBase64: media.base64,
      mimeType: media.mimeType,
      fileName: media.fileName,
      posterBase64: media.posterBase64 || ""
    }, {
      okMsg: media.mediaType === "video" ? "¡Video subido al Mural y guardado en Drive! ☁️🎥" : "¡Foto subida al Mural y guardada en Drive! ☁️📸",
      offlineMsg: "¡Recuerdo guardado en El Mural! 🌸",
      onSuccess: res => {
        if (res?.item || res?.photoUrl) {
          const cloudPhotoUrl = res.photoUrl || res.item?.photoUrl || "";
          const dId = extractDriveId(cloudPhotoUrl);
          if (dId && media.blobUrl) SESSION_VIDEO_BLOBS.set(dId, media.blobUrl);
          saveMural(getMural().map(m => (m.id === id ? {
            ...m,
            photoUrl: cloudPhotoUrl || m.photoUrl,
            posterUrl: res.posterUrl || res.item?.posterUrl || m.posterUrl,
            createdAt: formatCleanDate(res.item?.createdAt || m.createdAt)
          } : m)));
          renderMural();
        }
      }
    });
  });

  // Abrir Lightbox (foto o video bajo demanda)
  $("mural-grid")?.addEventListener("click", ev => {
    const card = ev.target.closest(".mural-card");
    const item = getMural().find(m => m.id === card?.dataset.muralId);
    if (!item) return;
    currentLightboxItemId = item.id;

    const img = $("lightbox-img"), vid = $("lightbox-video"), iframe = $("lightbox-iframe");
    if (item.mediaType === "video") {
      if (img) { img.removeAttribute("src"); img.classList.add("is-hidden"); }
      loadVideoIntoPlayer(vid, iframe, item);
    } else {
      if (iframe) { iframe.src = "about:blank"; iframe.classList.add("is-hidden"); }
      if (vid) { vid.pause(); vid.removeAttribute("src"); vid.classList.add("is-hidden"); }
      if (img) { img.src = item.photoUrl; img.classList.remove("is-hidden"); }
    }
    setText("lightbox-caption", item.caption || "");
    setText("lightbox-date", formatCleanDate(item.createdAt));
    $("lightbox-modal")?.classList.add("is-open");
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
    card.className = "mural-card";
    card.dataset.muralId = item.id;

    const isVideo = item.mediaType === "video";
    const mediaHtml = isVideo
      ? `<div class="mural-media video-card"><img class="video-poster" src="${escapeHtml(getEffectivePoster(item))}" alt="${escapeHtml(item.caption || "Video recuerdo")}" loading="lazy"></div>`
      : `<div class="mural-media"><img src="${escapeHtml(item.photoUrl)}" alt="${escapeHtml(item.caption || "Recuerdo")}" loading="lazy"></div>`;

    card.innerHTML = `${mediaHtml}<div class="mural-card-body"><p class="mural-caption">${escapeHtml(item.caption || "")}</p><span class="mural-date">${escapeHtml(formatCleanDate(item.createdAt))}</span></div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ==========================================================================
   9. PREMIOS: TIENDA DE CUPONES CANJEABLES + SALDO REAL + CRUD
   ========================================================================== */

function setupPremios() {
  $("btn-add-coupon")?.addEventListener("click", () => openCouponModal(null));

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
  renderScoreboards();
  renderPremios();

  await postToBackend("redeemCoupon", { id: couponId, usuario: user }, {
    okMsg: `🎟️ ¡Canjeaste "${c.titulo}"! Le avisamos a tu pareja 😏`,
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
   10. EL REPARTO: PROTAGONISTAS + SECUNDARIOS + PLANES VINCULADOS + CRUD
   ========================================================================== */

function setupReparto() {
  $("btn-add-actor")?.addEventListener("click", () => openActorModal(null));

  const onCastClick = ev => {
    const card = ev.target.closest(".cast-card");
    if (card?.dataset.actorId) openActorModal(card.dataset.actorId);
  };
  $("protagonists-grid")?.addEventListener("click", onCastClick);
  $("actors-grid")?.addEventListener("click", onCastClick);

  // Foto de avatar del personaje (compresión Canvas)
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

  // Poblar checklist de planes del Baúl (excluye secretos bloqueados)
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

function renderReparto() {
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
   11. SABIDURÍA: 3 CATEGORÍAS + GALLETA DE LA FORTUNA + CRUD
   ========================================================================== */

function setupSabiduria() {
  bindFilterBar("sabiduria-filter-bar", ".category-chip", renderSabiduria);
  $("btn-random-sabiduria")?.addEventListener("click", openFortuneModal);
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
  if (list.length === 0) return showToast("Añade primero una frase de sabiduría 💛", "info");
  let chosen;
  let guard = 0;
  do {
    chosen = list[Math.floor(Math.random() * list.length)];
    guard++;
  } while (chosen.id === lastFortuneId && list.length > 1 && guard < 10);
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
   12. AJUSTES: IDENTIDAD, PUSH Y GESTOR DE PREGUNTAS TRAMPA SECRETAS
   ========================================================================== */

function openSettingsModal() {
  renderIdentityUI();
  updatePushStatusUI();
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

  // Muestra solo las preguntas creadas por mí (o dirigidas exclusivamente a mi pareja)
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
  $("btn-cancel-trampa-edit")?.addEventListener("click", resetTrampaForm);

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
      // Determinar letra correcta
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

/* ==========================================================================
   13. MODALES, TOASTS Y ARRANQUE (BOOTSTRAP)
   ========================================================================== */

function closeModal(modalId) {
  const modal = $(modalId);
  if (!modal) return;
  modal.classList.remove("is-open");
  // Detener streaming de video al cerrar Lightbox o Plan Modal
  if (modalId === "lightbox-modal") {
    const vid = $("lightbox-video");
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); vid.classList.add("is-hidden"); }
    const iframe = $("lightbox-iframe");
    if (iframe) { iframe.src = "about:blank"; iframe.classList.add("is-hidden"); }
    currentLightboxItemId = null;
  } else if (modalId === "plan-modal") {
    const vid = $("plan-modal-video-preview");
    if (vid) { vid.pause(); }
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
  renderProgressTracker();
  renderRuletaPool();
  renderBaul();
  renderMural();
  renderPremios();
  renderReparto();
  renderSabiduria();
}

function initApp() {
  setupIdentityAndHeader();
  initOneSignal();
  initTriviaLock();
  setupNavigation();
  setupRuleta();
  setupBaul();
  setupMural();
  setupPremios();
  setupReparto();
  setupSabiduria();
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
}

if ("serviceWorker" in navigator) {
  let swRefreshing = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || swRefreshing) return;
    swRefreshing = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
      .then(reg => { try { reg.update(); } catch {} })
      .catch(() => {});
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initApp);
else initApp();
