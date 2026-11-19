/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA (Simón & Salomé) · BACKEND V3
 * ============================================================================
 * ARCHIVO: backend.gs (Motor Serverless en Google Apps Script)
 * ARQUITECTURA: API RESTful Serverless sobre Google Workspace (Sheets + Drive)
 *               + Notificaciones Push (OneSignal REST API, Free Tier).
 * DOCUMENTACIÓN: Hiper-comentada en español para Ingeniería Mecatrónica.
 *
 * MAPA DEL ARCHIVO:
 *   0. BACKDOORs (configuración, semillas, gamificación, mensajes push).
 *   1. Inicialización de infraestructura (setupDatabase / ensureDatabase_).
 *   2. Endpoints HTTP (doGet / doPost) protegidos con LockService.
 *   3. Controladores de Planes (add / update / complete / delete).
 *   4. Controladores de Mural y Medios (addMuralPhoto / deleteMedia).
 *   5. Gamificación (answerTrivia / redeemCoupon / manageCoupon).
 *   6. CRUD de Sabiduría, Preguntas Trampa y Personajes (motor genérico).
 *   7. Notificaciones Push OneSignal (sendThinkingPush + disparadores).
 *   8. Capa de acceso a Google Sheets (tablas por nombre de columna).
 *   9. Capa de Google Drive (subida de foto/video/póster y papelera).
 *  10. Fechas limpias (Colombia) y normalizadores de datos.
 *
 * GUÍA DE DESPLIEGUE PASO A PASO:
 *   1. Pega este archivo completo en https://script.google.com (reemplaza el anterior).
 *   2. Verifica ROOT_FOLDER_ID, SPREADSHEET_ID y (opcional) ONESIGNAL_CONFIG abajo.
 *   3. Ejecuta manualmente `setupDatabase` desde el editor para autorizar OAuth
 *      (Sheets, Drive y UrlFetch para OneSignal). Esto crea/extiende las 7 pestañas
 *      SIN borrar datos previos y crea las subcarpetas de Drive.
 *   4. Implementar -> Gestionar implementaciones -> Editar -> Nueva versión
 *      (Ejecutar como: "Yo" | Quién tiene acceso: "Cualquier persona").
 *      Así la URL `/exec` actual de `APP_CONFIG.GAS_WEB_APP_URL` se mantiene.
 *   5. OneSignal: el frontend debe llamar `OneSignal.login("simon")` o
 *      `OneSignal.login("salo")` para que el `external_id` coincida con el destino.
 * ============================================================================
 */

// 🛠️ BACKDOOR: CONFIGURACIÓN DE GOOGLE DRIVE Y GOOGLE SHEETS (IDs DE PRODUCCIÓN)
/**
 * Identificadores de infraestructura en Google Drive y Google Sheets.
 * Si se dejan vacíos ("") o con "TU_...", el sistema opera en modo Plug & Play 100% automático:
 * busca una hoja/carpeta existente llamada "BD_Bitacora_Palito_Mango_Primavera" o la crea él solo.
 */
const ROOT_FOLDER_ID = "";
const SPREADSHEET_ID = "";

// 🛠️ BACKDOOR: CREDENCIALES DE NOTIFICACIONES PUSH (ONESIGNAL_CONFIG)
/**
 * Credenciales de OneSignal (Dashboard -> Settings -> Keys & IDs).
 * Mientras tengan el placeholder "TU_...", el envío de push se omite en silencio
 * (sin lanzar errores) y las respuestas devuelven `push: { sent: false, reason: "ONESIGNAL_NOT_CONFIGURED" }`.
 */
const ONESIGNAL_CONFIG = {
  APP_ID: "TU_ONESIGNAL_APP_ID",
  REST_API_KEY: "TU_ONESIGNAL_REST_API_KEY"
};

// 🛠️ BACKDOOR: PARÁMETROS GENERALES DE LA API (ZONA HORARIA, CARPETAS Y PESTAÑAS)
const BACKEND_VERSION = "v3.0.0";
const APP_TIMEZONE = "America/Bogota";
const APP_WEB_URL = "https://simoncastri13-sys.github.io/bitacora-mango-primavera/";
const LOCK_WAIT_MS = 30000;
const SUBFOLDERS = { PLANES: "Fotos_Planes", MURAL: "Fotos_Mural", PERSONAJES: "Fotos_Personajes" };
const SHEET_NAMES = {
  PLANES: "Planes",
  MURAL: "Mural",
  CUPONES: "Cupones",
  PUNTOS: "Puntos",
  SABIDURIA: "Sabiduria",
  PREGUNTAS: "Preguntas_Trampa",
  PERSONAJES: "Personajes"
};

// 🛠️ BACKDOOR: ESQUEMA DE COLUMNAS DE LAS 7 PESTAÑAS (HEADERS_)
/**
 * Si una pestaña ya existe con menos columnas (p. ej. "Planes" V2 con 11 columnas),
 * las columnas faltantes se AGREGAN al final sin tocar los datos previos.
 * La lectura/escritura se hace por NOMBRE de columna (no por posición).
 */
const HEADERS_ = {
  PLANES: ["id", "title", "category", "weather", "energy", "emoji", "isVip", "completed", "anecdote", "photoUrl", "updatedAt", "mediaType", "posterUrl", "isReto", "ganadorReto", "isSecreto", "fechaDesbloqueo", "creadoPor"],
  MURAL: ["id", "caption", "photoUrl", "createdAt", "mediaType", "posterUrl", "creadoPor"],
  CUPONES: ["id", "titulo", "descripcion", "costoPuntos", "icono", "estado", "canjeadoPor", "fechaCanje"],
  PUNTOS: ["usuario", "puntosTotales", "preguntasRespondidasHoy", "ultimaFechaTrivia"],
  SABIDURIA: ["id", "categoria", "frase", "autor", "creadoPor"],
  PREGUNTAS: ["id", "paraUsuario", "pregunta", "opcionA", "opcionB", "opcionC", "opcionD", "opcionCorrecta", "creadoPor"],
  PERSONAJES: ["id", "nombre", "tipo", "rol", "superpoder", "debilidad", "photoUrl", "planesVinculados"]
};

/** Columna que actúa como llave primaria en cada pestaña. */
const PRIMARY_KEYS_ = { PLANES: "id", MURAL: "id", CUPONES: "id", PUNTOS: "usuario", SABIDURIA: "id", PREGUNTAS: "id", PERSONAJES: "id" };

/** Columnas de fecha: ISO local Colombia ("yyyy-MM-dd") vs. fecha limpia ("18 de Noviembre, 2026"). */
const DATE_ISO_COLUMNS_ = ["fechaDesbloqueo", "ultimaFechaTrivia"];
const DATE_CLEAN_COLUMNS_ = ["updatedAt", "createdAt", "fechaCanje"];

// 🛠️ BACKDOOR: USUARIOS DE LA APP (IDENTIDADES SIMÓN Y SALO)
const USERS_ = {
  simon: { id: "simon", nombre: "Simón", emoji: "🥭", partner: "salo" },
  salo: { id: "salo", nombre: "Salo", emoji: "🌸", partner: "simon" }
};

// 🛠️ BACKDOOR: REGLAS DE GAMIFICACIÓN (GAMIFICATION_CONFIG)
const GAMIFICATION_CONFIG = {
  TRIVIA_POINTS: 10,                       // Puntos por respuesta correcta
  TRIVIA_MAX_PER_DAY: 3,                   // Máximo de preguntas con puntos por día (hora Colombia)
  TRIVIA_COUNT_WRONG_ANSWERS: false,       // true = las respuestas incorrectas también consumen cupo diario
  PLAN_COMPLETION_POINTS: 50,              // Puntos por completar un plan
  PLAN_POINTS_REQUIRE_MEDIA_AND_ANECDOTE: true, // Exige foto/video + anécdota para otorgar los +50
  ALLOW_DELETE_PROTAGONISTS: false         // Protege las fichas de Simón y Salo contra borrado
};

// 🛠️ BACKDOOR: PLANTILLAS DE NOTIFICACIONES PUSH (PUSH_MESSAGES)
/** Variables disponibles: {emoji} {nombre} {plan} {cupon} {fecha} {caption}. */
const PUSH_MESSAGES = {
  PLAN_ADDED: { heading: "✨ Nuevo plan en el Baúl", message: "{emoji} {nombre} añadió un nuevo plan: {plan}" },
  PLAN_MEDIA: { heading: "📸 Nuevo recuerdo", message: "{emoji} {nombre} subió un recuerdo al plan \"{plan}\"" },
  PLAN_COMPLETED: { heading: "✅ ¡Plan completado!", message: "{emoji} {nombre} completó \"{plan}\" y dejó su anécdota 💛" },
  MURAL_MEDIA: { heading: "🖼️ Nuevo en El Mural", message: "{emoji} {nombre} subió algo nuevo al Mural: {caption}" },
  COUPON_REDEEMED: { heading: "🎟️ ¡Cupón canjeado!", message: "{emoji} {nombre} canjeó el cupón \"{cupon}\". ¡Te toca cumplir! 😏" },
  SECRET_PLAN: { heading: "🤫 Plan Secreto", message: "🤫 {nombre} acaba de preparar un Plan Secreto para ti... Se desbloquea el {fecha} 👀🎁" },
  THINKING_SIMON: { heading: "🥭🌸", message: "🥭 Simón se acaba de acordar de ti justo ahora..." },
  THINKING_SALO: { heading: "🥭🌸", message: "🌸 Salo te acaba de mandar un abrazo express..." }
};

// 🛠️ BACKDOOR: LISTA MAESTRA DE 33 PLANES INICIALES (INITIAL_PLANS_SEED)
/**
 * Semilla oficial con los 33 planes iniciales de Simón y Salomé.
 * Solo se inserta si la pestaña "Planes" está vacía y nunca antes fue sembrada.
 */
const INITIAL_PLANS_SEED = [
  // Categoría 1: Pelis y Juegos (8 planes)
  { id: "plan-01", title: "Ver Harry Potter y el Cáliz de Fuego", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚡", isVip: false },
  { id: "plan-02", title: "Ver Harry Potter y la Orden del Fénix", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🪄", isVip: false },
  { id: "plan-03", title: "Ver Harry Potter y el Misterio del Príncipe", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🧪", isVip: false },
  { id: "plan-04", title: "Ver Harry Potter y las Reliquias de la Muerte", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🦉", isVip: false },
  { id: "plan-05", title: "Ver Django Sin Cadenas", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "🤠", isVip: false },
  { id: "plan-06", title: "Ver Las muñecas de la mafia", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "📺", isVip: false },
  { id: "plan-07", title: "Ver El abogado del diablo", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋", emoji: "⚖️", isVip: false },
  { id: "plan-08", title: "Jugar GTA 6", category: "Pelis y Juegos", weather: "🌧️", energy: "🔋🔋", emoji: "🎮", isVip: false },
  // Categoría 2: Gastronomía (8 planes)
  { id: "plan-09", title: "Ir a Bárbaro Cocina", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥩", isVip: false },
  { id: "plan-10", title: "Ir a El Sause", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍽️", isVip: false },
  { id: "plan-11", title: "Ir a comer sándwiches de pastrami", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🥪", isVip: false },
  { id: "plan-12", title: "Hacer empanadas, buñuelos y natilla", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🥟", isVip: false },
  { id: "plan-13", title: "Hacer una torta", category: "Gastronomía", weather: "🌧️", energy: "🔋🔋", emoji: "🎂", isVip: false },
  { id: "plan-14", title: "Competir por comida (Reto TikTok)", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🍔", isVip: false },
  { id: "plan-15", title: "Adivinar comida y objetos (con los ojos vendados)", category: "Gastronomía", weather: "🌧️", energy: "🔋", emoji: "🙈", isVip: false },
  { id: "plan-16", title: "Picnic improvisado", category: "Gastronomía", weather: "☀️", energy: "🔋🔋", emoji: "🧺", isVip: false },
  // Categoría 3: Rumbas (9 planes)
  { id: "plan-17", title: "Ir a Calixto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🕺", isVip: false },
  { id: "plan-18", title: "Ir a María Mezcal", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🍹", isVip: false },
  { id: "plan-19", title: "Ir a La Sala del Despecho", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎤", isVip: false },
  { id: "plan-20", title: "Ir a las Fiestas del Retiro", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎺", isVip: false },
  { id: "plan-21", title: "Ir al Teatro Victoria", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎭", isVip: false },
  { id: "plan-22", title: "Juegos de tomar en casa", category: "Rumbas", weather: "🌧️", energy: "🔋🔋", emoji: "🍻", isVip: false },
  { id: "plan-23", title: "Ir a un concierto", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎸", isVip: false },
  { id: "plan-24", title: "Noche de fonda tradicional", category: "Rumbas", weather: "☀️", energy: "🔋🔋🔋", emoji: "🪗", isVip: false },
  { id: "plan-25", title: "Competencia de tragos (a ver quién aguanta más)", category: "Rumbas", weather: "🌧️", energy: "🔋🔋🔋", emoji: "🥃", isVip: false },
  // Categoría 4: Relax (8 planes — Incluye el Plan #26 VIP Guatapé)
  { id: "plan-26", title: "Volver donde todo empezó (Finca en Guatapé)", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🏡", isVip: true },
  { id: "plan-27", title: "Tarde de spa", category: "Relax", weather: "🌧️", energy: "🔋", emoji: "🧖‍♀️", isVip: false },
  { id: "plan-28", title: "Salo pasando la tarde con mis papás", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "👨‍👩‍👦", isVip: false },
  { id: "plan-29", title: "Yo pasando la tarde con los papás de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "👨‍👩‍👧", isVip: false },
  { id: "plan-30", title: "Tarde todos juntos en familia", category: "Relax", weather: "☀️", energy: "🔋🔋", emoji: "💛", isVip: false },
  { id: "plan-31", title: "Domingo de jacuzzi", category: "Relax", weather: "☀️", energy: "🔋", emoji: "🫧", isVip: false },
  { id: "plan-32", title: "Cumple de Salo", category: "Relax", weather: "☀️", energy: "🔋🔋🔋", emoji: "🎉", isVip: false },
  { id: "plan-33", title: "Hacer una Novena de Navidad juntos", category: "Relax", weather: "🌧️", energy: "🔋🔋", emoji: "🎄", isVip: false }
];

// 🛠️ BACKDOOR: CATÁLOGO INICIAL DE CUPONES CANJEABLES (INITIAL_COUPONS_SEED)
const INITIAL_COUPONS_SEED = [
  { id: "cup-01", titulo: "Masaje de 30 minutos", descripcion: "Vale por un masaje relajante de 30 minutos, sin afanes y con aceite rico.", costoPuntos: 100, icono: "💆", estado: "disponible" },
  { id: "cup-02", titulo: "Elegir la peli de la noche", descripcion: "El que canjea elige la película sin derecho a quejas ni vetos.", costoPuntos: 60, icono: "🎬", estado: "disponible" },
  { id: "cup-03", titulo: "Boleto de Escape Social", descripcion: "Permiso oficial para cancelar cualquier salida social sin culpas y quedarnos juntos en nuestro refugio.", costoPuntos: 80, icono: "🎟️", estado: "disponible" },
  { id: "cup-04", titulo: "Hibernación en Pijama (Amnistía Doméstica)", descripcion: "Un día entero en pijama sin tender la cama ni hacer oficios, solo mimos y pelis.", costoPuntos: 120, icono: "🛌", estado: "disponible" },
  { id: "cup-05", titulo: "Cheat Meal Sin Remordimientos", descripcion: "Pedimos nuestro antojo favorito a domicilio (salchipapa, pizza o postre) a la hora que queramos.", costoPuntos: 90, icono: "🍟", estado: "disponible" },
  { id: "cup-06", titulo: "Burbuja de Cero Estrés", descripcion: "Tarde de desconexión total del mundo exterior, celulares en silencio y cero preocupaciones.", costoPuntos: 150, icono: "🫧", estado: "disponible" },
  { id: "cup-07", titulo: "El Comodín del \"Tráeme / Pásame\"", descripcion: "Vale por 24 horas en las que el otro trae el agua, el snack o el control sin decir ni una palabra.", costoPuntos: 100, icono: "🛎️", estado: "disponible" },
  { id: "cup-08", titulo: "Poder de Veto Presidencial", descripcion: "Autoridad absoluta para vetar una película, restaurante o canción del carro al instante.", costoPuntos: 70, icono: "🛑", estado: "disponible" },
  { id: "cup-09", titulo: "Dictadura del Outfit", descripcion: "El ganador elige exactamente qué se pone el otro para la próxima cita especial.", costoPuntos: 150, icono: "👗", estado: "disponible" },
  { id: "cup-10", titulo: "La Razón Automática", descripcion: "Comodín dorado para ganar automáticamente cualquier debate amistoso de pareja por un día.", costoPuntos: 200, icono: "👑", estado: "disponible" }
];

// 🛠️ BACKDOOR: SALDOS INICIALES DE PUNTOS (INITIAL_PUNTOS_SEED)
const INITIAL_PUNTOS_SEED = [
  { usuario: "simon", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" },
  { usuario: "salo", puntosTotales: 0, preguntasRespondidasHoy: 0, ultimaFechaTrivia: "" }
];

// 🛠️ BACKDOOR: FRASES INICIALES DE SABIDURÍA (INITIAL_SABIDURIA_SEED)
/** Categorías válidas: "Animo" (💛 levantar el ánimo), "Charras" (😂 de los dos), "Idolos" (🌟 de nuestros ídolos). */
const INITIAL_SABIDURIA_SEED = [
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

// 🛠️ BACKDOOR: BANCO INICIAL DE PREGUNTAS TRAMPA (INITIAL_PREGUNTAS_SEED)
/**
 * Clasificación asimétrica del candado (20 preguntas migradas desde TRIVIA_BANK de app.js):
 *   - paraUsuario "simon": preguntas sobre Salo (preparadas por Salo, le salen a Simón).
 *   - paraUsuario "salo":  preguntas sobre Simón (preparadas por Simón, le salen a Salo).
 *   - paraUsuario "ambos": historia compartida (le salen a los dos).
 * `opcionCorrecta` admite varias respuestas válidas separadas por "|" (o ";"),
 * o la letra de la opción ("A", "B", "C", "D"). La comparación ignora tildes y mayúsculas.
 */
const INITIAL_PREGUNTAS_SEED = [
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

// 🛠️ BACKDOOR: REPARTO OFICIAL INICIAL (INITIAL_PERSONAJES_SEED)
/** tipo: "protagonista" | "secundario". planesVinculados: array de IDs de planes del Baúl. */
const INITIAL_PERSONAJES_SEED = [
  { id: "pj-simon", nombre: "Simón", tipo: "protagonista", rol: "Palito de Mango 🥭 · El Ingeniero Mecatrónico", superpoder: "Arreglar cualquier cosa y armar el plan perfecto", debilidad: "Un whisky en una noche muy buena con un vallenato de Diomedes", photoUrl: "", planesVinculados: [] },
  { id: "pj-salo", nombre: "Salomé", tipo: "protagonista", rol: "Primavera 🌸🩵 · La Futura Doctora", superpoder: "Iluminar cualquier día gris con una sonrisa", debilidad: "Un gloss nuevo y una buena salchipapa", photoUrl: "", planesVinculados: [] },
  { id: "pj-papas-simon", nombre: "Los papás de Simón", tipo: "secundario", rol: "Los suegros consentidores", superpoder: "Recibir con los brazos abiertos (y con comida)", debilidad: "Contar las historias vergonzosas de la infancia", photoUrl: "", planesVinculados: ["plan-28", "plan-30"] },
  { id: "pj-papas-salo", nombre: "Los papás de Salo", tipo: "secundario", rol: "Los guardianes de Primavera", superpoder: "Hacer sentir en casa a cualquiera", debilidad: "Querer enterarse de todos los planes", photoUrl: "", planesVinculados: ["plan-29", "plan-30", "plan-32"] },
  { id: "pj-parche", nombre: "El parche de la rumba", tipo: "secundario", rol: "Los cómplices de las noches épicas", superpoder: "Convertir cualquier salida en una historia", debilidad: "El clásico \"¡una más y nos vamos!\"", photoUrl: "", planesVinculados: ["plan-17", "plan-18", "plan-19", "plan-22", "plan-25"] }
];

/** Semillas por pestaña (las de Puntos además se garantizan por usuario en cada arranque). */
const SEEDS_ = {
  PLANES: INITIAL_PLANS_SEED,
  MURAL: [],
  CUPONES: INITIAL_COUPONS_SEED,
  PUNTOS: INITIAL_PUNTOS_SEED,
  SABIDURIA: INITIAL_SABIDURIA_SEED,
  PREGUNTAS: INITIAL_PREGUNTAS_SEED,
  PERSONAJES: INITIAL_PERSONAJES_SEED
};

const FALLBACK_NAMES_ = {
  ROOT_FOLDER: "Bitacora_Mango_Primavera_Media",
  SPREADSHEET: "BD_Bitacora_Palito_Mango_Primavera",
  PROP_FOLDER_ID: "BITACORA_ROOT_FOLDER_ID",
  PROP_SHEET_ID: "BITACORA_SPREADSHEET_ID",
  PROP_SEEDED_PREFIX: "BITACORA_SEEDED_"
};

const MESES_ = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** Zona horaria de las celdas tipo Date (se toma del Spreadsheet en ensureDatabase_). */
let CELL_TZ_ = APP_TIMEZONE;

/* ==========================================================================
   1. INICIALIZACIÓN AUTOMÁTICA DE INFRAESTRUCTURA (setupDatabase)
   ========================================================================== */

/**
 * Ejecutar MANUALMENTE desde el editor de Apps Script.
 * Autoriza OAuth, crea/extiende las 7 pestañas (sin borrar datos), siembra datos
 * iniciales en pestañas vacías y crea las subcarpetas de Drive.
 * @return {Object} Resumen con IDs y URLs de la infraestructura.
 */
function setupDatabase() {
  const ctx = ensureDatabase_();
  const rootFolder = getOrCreateRootFolder_();
  const subPlanes = getOrCreateSubfolder_(rootFolder, SUBFOLDERS.PLANES);
  const subMural = getOrCreateSubfolder_(rootFolder, SUBFOLDERS.MURAL);
  const subPersonajes = getOrCreateSubfolder_(rootFolder, SUBFOLDERS.PERSONAJES);
  const counts = {};
  Object.keys(ctx.tables).forEach(function(key) { counts[SHEET_NAMES[key]] = readRows_(ctx.tables[key]).length; });
  const summary = {
    status: "ok",
    version: BACKEND_VERSION,
    spreadsheetId: ctx.spreadsheet.getId(),
    spreadsheetUrl: ctx.spreadsheet.getUrl(),
    rootFolderId: rootFolder.getId(),
    rootFolderUrl: rootFolder.getUrl(),
    planesFolderId: subPlanes.getId(),
    muralFolderId: subMural.getId(),
    personajesFolderId: subPersonajes.getId(),
    oneSignalConfigured: isOneSignalConfigured_(),
    rowCounts: counts
  };
  Logger.log("=== 🥭🌸 BITÁCORA MANGO Y PRIMAVERA " + BACKEND_VERSION + ": BASE DE DATOS LISTA ===");
  Logger.log("Spreadsheet ID:  " + summary.spreadsheetId + " | URL: " + summary.spreadsheetUrl);
  Logger.log("Drive Root ID:   " + summary.rootFolderId + " | URL: " + summary.rootFolderUrl);
  Logger.log("Subcarpetas OK:  " + SUBFOLDERS.PLANES + ", " + SUBFOLDERS.MURAL + ", " + SUBFOLDERS.PERSONAJES);
  Logger.log("Filas por pestaña: " + JSON.stringify(counts));
  Logger.log("OneSignal configurado: " + summary.oneSignalConfigured);
  return summary;
}

/**
 * Garantiza las 7 pestañas con sus columnas (agregando las faltantes al final),
 * siembra datos iniciales en pestañas vacías nunca sembradas y garantiza las filas
 * de puntos de "simon" y "salo".
 * @return {{spreadsheet: Spreadsheet, tables: Object}} Contexto de tablas por clave.
 */
function ensureDatabase_() {
  const spreadsheet = resolveSpreadsheet_();
  try { CELL_TZ_ = spreadsheet.getSpreadsheetTimeZone() || APP_TIMEZONE; } catch (ignore) { CELL_TZ_ = APP_TIMEZONE; }
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties() || {};
  const tables = {};

  Object.keys(HEADERS_).forEach(function(key) {
    const sheetName = SHEET_NAMES[key];
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
    const headers = ensureHeaders_(sheet, HEADERS_[key]);
    const table = buildTable_(key, sheet, headers);
    tables[key] = table;

    const seedFlag = FALLBACK_NAMES_.PROP_SEEDED_PREFIX + key;
    if (!allProps[seedFlag]) {
      if (sheet.getLastRow() <= 1 && SEEDS_[key] && SEEDS_[key].length > 0) {
        bulkInsertRecords_(table, SEEDS_[key]);
      }
      props.setProperty(seedFlag, new Date().toISOString());
    }
  });

  ensurePuntosRows_(tables.PUNTOS);
  return { spreadsheet: spreadsheet, tables: tables };
}

/**
 * Asegura la fila 1 de encabezados. Si la hoja está vacía escribe todos; si ya existe,
 * agrega al final solo las columnas faltantes (migración no destructiva V2 -> V3).
 * @return {string[]} Encabezados reales de la hoja (en su orden físico).
 */
function ensureHeaders_(sheet, requiredHeaders) {
  const lastCol = sheet.getLastColumn();
  if (sheet.getLastRow() === 0 || lastCol === 0) {
    ensureColumnCapacity_(sheet, requiredHeaders.length);
    const range = sheet.getRange(1, 1, 1, requiredHeaders.length);
    range.setValues([requiredHeaders]);
    styleHeaderRange_(range);
    sheet.setFrozenRows(1);
    return requiredHeaders.slice();
  }
  const current = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h || "").trim(); });
  const missing = requiredHeaders.filter(function(h) { return current.indexOf(h) === -1; });
  if (missing.length > 0) {
    ensureColumnCapacity_(sheet, lastCol + missing.length);
    const addRange = sheet.getRange(1, lastCol + 1, 1, missing.length);
    addRange.setValues([missing]);
    styleHeaderRange_(addRange);
  }
  if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
  return current.concat(missing);
}

/** Inserta columnas físicas si la hoja no tiene suficientes. */
function ensureColumnCapacity_(sheet, neededColumns) {
  const maxCols = sheet.getMaxColumns();
  if (neededColumns > maxCols) sheet.insertColumnsAfter(maxCols, neededColumns - maxCols);
}

/** Estilo Mango pastel para encabezados. */
function styleHeaderRange_(range) {
  range.setFontWeight("bold").setBackground("#FFE0B2").setFontColor("#2D231E");
}

/** Garantiza que existan las filas de puntos de "simon" y "salo". */
function ensurePuntosRows_(table) {
  const rows = readRows_(table);
  const present = {};
  rows.forEach(function(r) { present[normalizeUser_(r.data.usuario)] = true; });
  INITIAL_PUNTOS_SEED.forEach(function(seed) {
    if (!present[seed.usuario]) appendRecord_(table, seed);
  });
}

/* ==========================================================================
   2. ENDPOINTS HTTP SERVERLESS (doGet y doPost)
   ========================================================================== */

/**
 * Endpoint HTTP GET.
 *   - `?action=ping`                       -> diagnóstico rápido (sin lock).
 *   - `?action=getAppData` | `?action=getAll` (por defecto) -> las 7 listas.
 *   - `&usuario=simon|salo` (opcional)     -> enmascara planes secretos ajenos bloqueados.
 */
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = String(params.action || "getAppData").trim();
  if (action === "ping") {
    return jsonResponse_({ status: "ok", pong: true, version: BACKEND_VERSION, today: todayIsoBogota_(), todayClean: formatCleanDate_(new Date()), oneSignalConfigured: isOneSignalConfigured_() });
  }
  return runWithLock_(function() {
    const ctx = ensureDatabase_();
    if (action === "getAppData" || action === "getAll" || action === "") {
      return buildAppData_(ctx, normalizeUser_(params.usuario));
    }
    throw appError_("UNKNOWN_ACTION", "Acción GET no reconocida: " + action);
  });
}

/**
 * Endpoint HTTP POST (`Content-Type: text/plain;charset=utf-8` para evitar preflight CORS).
 * Cuerpo: `{ "action": "<accion>", "payload": { ... } }` (también acepta campos planos).
 * Todo el procesamiento ocurre dentro de `LockService.getScriptLock()` para que
 * Simón y Salo nunca se pisen puntos, cupones ni filas.
 */
function doPost(e) {
  let body;
  try {
    if (!e || !e.postData || !e.postData.contents) throw appError_("EMPTY_BODY", "Cuerpo POST vacío. Se esperaba un payload JSON.");
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_(errorToResponse_(err.code ? err : appError_("INVALID_JSON", "JSON inválido: " + (err && err.message ? err.message : String(err)))));
  }
  const action = String(body.action || "").trim();
  const payload = (body.payload && typeof body.payload === "object") ? body.payload : body;
  const handler = getRoutes_()[action];
  if (!handler) return jsonResponse_({ status: "error", code: "UNKNOWN_ACTION", message: "Acción POST no reconocida: " + action });
  return runWithLock_(function() {
    const ctx = ensureDatabase_();
    return handler(ctx, payload);
  });
}

/** Tabla de ruteo de acciones POST. */
function getRoutes_() {
  return {
    getAppData: function(ctx, p) { return buildAppData_(ctx, normalizeUser_(p.usuario)); },
    getAll: function(ctx, p) { return buildAppData_(ctx, normalizeUser_(p.usuario)); },
    addPlan: handleAddPlan_,
    updatePlan: function(ctx, p) { return applyPlanUpdate_(ctx, p, false); },
    completePlan: function(ctx, p) { return applyPlanUpdate_(ctx, p, true); },
    deletePlan: handleDeletePlan_,
    addMuralPhoto: handleAddMuralPhoto_,
    deleteMedia: handleDeleteMedia_,
    answerTrivia: handleAnswerTrivia_,
    redeemCoupon: handleRedeemCoupon_,
    manageCoupon: handleManageCoupon_,
    manageSabiduria: handleManageSabiduria_,
    managePreguntas: handleManagePreguntas_,
    managePersonajes: handleManagePersonajes_,
    sendThinkingPush: handleSendThinkingPush_
  };
}

/**
 * Ejecuta `fn` bajo el semáforo global del script (Mutex) y empaqueta la respuesta JSON.
 * Libera SIEMPRE el lock en `finally`.
 */
function runWithLock_(fn) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    try {
      lock.waitLock(LOCK_WAIT_MS);
      hasLock = true;
    } catch (lockErr) {
      throw appError_("LOCK_TIMEOUT", "El servidor está ocupado guardando otro cambio. Intenta de nuevo en unos segundos.");
    }
    const result = fn();
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_(errorToResponse_(err));
  } finally {
    if (hasLock) {
      try { lock.releaseLock(); } catch (ignore) {}
    }
  }
}

/** Construye la respuesta completa con las 7 listas. */
function buildAppData_(ctx, viewer) {
  const today = todayIsoBogota_();
  return {
    status: "ok",
    version: BACKEND_VERSION,
    timestamp: new Date().toISOString(),
    today: today,
    todayClean: formatCleanDate_(new Date()),
    usuario: viewer || "",
    plans: listPlans_(ctx, viewer),
    mural: listMural_(ctx),
    cupones: listCupones_(ctx),
    puntos: listPuntos_(ctx),
    sabiduria: listSabiduria_(ctx),
    preguntas: listPreguntas_(ctx),
    personajes: listPersonajes_(ctx)
  };
}

/* ==========================================================================
   3. CONTROLADORES DE PLANES (addPlan / updatePlan / completePlan / deletePlan)
   ========================================================================== */

/**
 * addPlan: inserta un plan nuevo (idempotente por `id`).
 * Si `isSecreto` es true exige `fechaDesbloqueo` y dispara push misteriosa; si no,
 * dispara push "Nuevo plan añadido".
 */
function handleAddPlan_(ctx, p) {
  const table = ctx.tables.PLANES;
  const id = cleanStr_(p.id) || generateId_("plan");
  const existing = findRowById_(table, id);
  if (existing) {
    return { status: "ok", duplicated: true, plan: normalizePlan_(existing.data), push: { sent: false, reason: "DUPLICATE" } };
  }
  const creador = normalizeUser_(p.creadoPor || p.usuario);
  const isReto = parseBool_(p.isReto);
  const isSecreto = parseBool_(p.isSecreto);
  const fecha = isSecreto ? toIsoDate_(p.fechaDesbloqueo, APP_TIMEZONE) : "";
  if (isSecreto && !fecha) throw appError_("MISSING_UNLOCK_DATE", "Un plan secreto necesita 'fechaDesbloqueo' (YYYY-MM-DD).");

  const data = {
    id: id,
    title: cleanStr_(p.title) || "Nuevo Plan",
    category: cleanStr_(p.category) || "Relax",
    weather: cleanStr_(p.weather) || "☀️",
    energy: cleanStr_(p.energy) || "🔋🔋",
    emoji: cleanStr_(p.emoji) || "✨",
    isVip: parseBool_(p.isVip),
    completed: parseBool_(p.completed),
    anecdote: p.anecdote !== undefined ? String(p.anecdote) : "",
    photoUrl: "",
    updatedAt: formatCleanDate_(new Date()),
    mediaType: "",
    posterUrl: "",
    isReto: isReto,
    ganadorReto: isReto ? normalizeWinner_(p.ganadorReto) : "",
    isSecreto: isSecreto,
    fechaDesbloqueo: fecha,
    creadoPor: creador
  };

  if (hasMediaPayload_(p)) {
    const media = uploadMediaBundle_(p, SUBFOLDERS.PLANES, id);
    data.photoUrl = media.url;
    data.mediaType = media.mediaType;
    data.posterUrl = media.posterUrl;
  } else if (isHttpUrl_(p.photoUrl)) {
    data.photoUrl = String(p.photoUrl).trim();
    data.mediaType = normalizeMediaType_(p.mediaType, data.photoUrl);
    data.posterUrl = isHttpUrl_(p.posterUrl) ? String(p.posterUrl).trim() : "";
  }

  appendRecord_(table, data);
  const plan = normalizePlan_(data);
  const push = isSecreto
    ? notifyPartner_(creador, "SECRET_PLAN", { fecha: formatCleanDateFromIso_(fecha) }, { type: "secret_plan", planId: id })
    : notifyPartner_(creador, "PLAN_ADDED", { plan: plan.title }, { type: "plan_added", planId: id });
  return { status: "ok", plan: plan, push: push };
}

/**
 * Núcleo compartido de `updatePlan` y `completePlan`.
 * - Edita: title, category, weather, energy, emoji, isVip, completed, anecdote,
 *   isReto, ganadorReto, isSecreto, fechaDesbloqueo, creadoPor.
 * - Medios: `mediaBase64|imageBase64|videoBase64` (+ `posterBase64` para video) en
 *   "Fotos_Planes"; el medio anterior se envía a la papelera de Drive.
 *   `removeMedia: true` borra el medio actual.
 * - Puntos: +50 al `usuario` SOLO cuando el plan pasa de pendiente a completado
 *   (y, si la regla está activa, tiene foto/video + anécdota). Se ejecuta bajo el lock.
 * - Push: plan secreto nuevo > plan completado > medio nuevo.
 * @param {boolean} forceComplete true para completePlan (marca completed = true).
 */
function applyPlanUpdate_(ctx, p, forceComplete) {
  const table = ctx.tables.PLANES;
  const planId = cleanStr_(p.id);
  if (!planId) throw appError_("MISSING_ID", "El campo 'id' del plan es obligatorio.");
  const row = findRowById_(table, planId);
  if (!row) throw appError_("PLAN_NOT_FOUND", "No se encontró ningún plan con id: " + planId);

  const usuario = normalizeUser_(p.usuario || p.completadoPor);
  const before = normalizePlan_(row.data);
  const d = Object.assign({}, row.data);

  ["title", "category", "weather", "energy", "emoji"].forEach(function(field) {
    if (p[field] !== undefined && cleanStr_(p[field]) !== "") d[field] = cleanStr_(p[field]);
  });
  if (p.isVip !== undefined) d.isVip = parseBool_(p.isVip);
  if (p.anecdote !== undefined) d.anecdote = String(p.anecdote);
  if (forceComplete) d.completed = true;
  else if (p.completed !== undefined) d.completed = parseBool_(p.completed);
  else d.completed = before.completed;

  // Reto de pareja: el ganador solo existe si el switch está activo.
  const isReto = p.isReto !== undefined ? parseBool_(p.isReto) : before.isReto;
  d.isReto = isReto;
  d.ganadorReto = isReto ? normalizeWinner_(p.ganadorReto !== undefined ? p.ganadorReto : before.ganadorReto) : "";

  // Plan secreto: exige fecha de desbloqueo.
  const isSecreto = p.isSecreto !== undefined ? parseBool_(p.isSecreto) : before.isSecreto;
  let fecha = p.fechaDesbloqueo !== undefined ? toIsoDate_(p.fechaDesbloqueo, APP_TIMEZONE) : before.fechaDesbloqueo;
  if (!isSecreto) fecha = "";
  if (isSecreto && !fecha) throw appError_("MISSING_UNLOCK_DATE", "Un plan secreto necesita 'fechaDesbloqueo' (YYYY-MM-DD).");
  d.isSecreto = isSecreto;
  d.fechaDesbloqueo = fecha;

  if (p.creadoPor !== undefined && normalizeUser_(p.creadoPor)) d.creadoPor = normalizeUser_(p.creadoPor);
  else if (!before.creadoPor && isSecreto && usuario) d.creadoPor = usuario;
  else d.creadoPor = before.creadoPor;

  // Medios (foto o video + póster).
  let uploadedMedia = false;
  let trashedFiles = 0;
  if (hasMediaPayload_(p)) {
    const media = uploadMediaBundle_(p, SUBFOLDERS.PLANES, planId);
    trashedFiles += trashDriveFileByUrl_(before.photoUrl) ? 1 : 0;
    trashedFiles += trashDriveFileByUrl_(before.posterUrl) ? 1 : 0;
    d.photoUrl = media.url;
    d.mediaType = media.mediaType;
    d.posterUrl = media.posterUrl;
    uploadedMedia = true;
  } else if (parseBool_(p.removeMedia)) {
    trashedFiles += trashDriveFileByUrl_(before.photoUrl) ? 1 : 0;
    trashedFiles += trashDriveFileByUrl_(before.posterUrl) ? 1 : 0;
    d.photoUrl = "";
    d.mediaType = "";
    d.posterUrl = "";
  } else if (isHttpUrl_(p.photoUrl) && String(p.photoUrl).trim() !== before.photoUrl) {
    d.photoUrl = String(p.photoUrl).trim();
    d.mediaType = normalizeMediaType_(p.mediaType, d.photoUrl);
    d.posterUrl = isHttpUrl_(p.posterUrl) ? String(p.posterUrl).trim() : "";
  } else {
    d.photoUrl = before.photoUrl;
    d.mediaType = before.mediaType;
    d.posterUrl = before.posterUrl;
  }

  d.updatedAt = formatCleanDate_(new Date());
  writeRecord_(table, row.row, d);
  const plan = normalizePlan_(d);

  // Gamificación: +50 solo en la transición pendiente -> completado.
  let awardedPoints = 0;
  let pointsReason = "";
  const justCompleted = !before.completed && plan.completed;
  if (justCompleted) {
    const hasMedia = String(plan.photoUrl || "").trim() !== "";
    const hasAnecdote = String(plan.anecdote || "").trim() !== "";
    if (!usuario) pointsReason = "NO_USER";
    else if (GAMIFICATION_CONFIG.PLAN_POINTS_REQUIRE_MEDIA_AND_ANECDOTE && !(hasMedia && hasAnecdote)) pointsReason = "MISSING_MEDIA_OR_ANECDOTE";
    else {
      addPointsToUser_(ctx, usuario, GAMIFICATION_CONFIG.PLAN_COMPLETION_POINTS);
      awardedPoints = GAMIFICATION_CONFIG.PLAN_COMPLETION_POINTS;
      pointsReason = "PLAN_COMPLETED";
    }
  } else if (forceComplete && before.completed) {
    pointsReason = "ALREADY_COMPLETED";
  }

  // Notificaciones push (una sola por operación, por prioridad).
  const titleForPush = plan.isLocked ? "un Plan Sorpresa 🎁" : plan.title;
  let push = { sent: false, reason: "NO_TRIGGER" };
  const actor = usuario || plan.creadoPor;
  if (!before.isSecreto && plan.isSecreto) {
    push = notifyPartner_(actor, "SECRET_PLAN", { fecha: formatCleanDateFromIso_(plan.fechaDesbloqueo) }, { type: "secret_plan", planId: planId });
  } else if (justCompleted) {
    push = notifyPartner_(actor, "PLAN_COMPLETED", { plan: titleForPush }, { type: "plan_completed", planId: planId });
  } else if (uploadedMedia) {
    push = notifyPartner_(actor, "PLAN_MEDIA", { plan: titleForPush }, { type: "plan_media", planId: planId });
  }

  return {
    status: "ok",
    plan: plan,
    photoUrl: plan.photoUrl,
    posterUrl: plan.posterUrl,
    mediaType: plan.mediaType,
    awardedPoints: awardedPoints,
    pointsReason: pointsReason,
    trashedFiles: trashedFiles,
    puntos: listPuntos_(ctx),
    push: push
  };
}

/**
 * deletePlan: envía foto/video/póster a la papelera de Drive, elimina la fila y
 * desvincula el plan de los Personajes que lo referencian.
 */
function handleDeletePlan_(ctx, p) {
  const table = ctx.tables.PLANES;
  const planId = cleanStr_(p.id);
  if (!planId) throw appError_("MISSING_ID", "El campo 'id' del plan es obligatorio en deletePlan.");
  const row = findRowById_(table, planId);
  if (!row) throw appError_("PLAN_NOT_FOUND", "No se encontró ningún plan con id: " + planId);

  let trashedFiles = 0;
  trashedFiles += trashDriveFileByUrl_(row.data.photoUrl) ? 1 : 0;
  trashedFiles += trashDriveFileByUrl_(row.data.posterUrl) ? 1 : 0;
  table.sheet.deleteRow(row.row);

  // Limpieza referencial en Personajes.planesVinculados.
  let personajesActualizados = 0;
  const pjTable = ctx.tables.PERSONAJES;
  readRows_(pjTable).forEach(function(r) {
    const linked = parseLinkedPlans_(r.data.planesVinculados);
    if (linked.indexOf(planId) !== -1) {
      const updated = Object.assign({}, r.data, { planesVinculados: JSON.stringify(linked.filter(function(x) { return x !== planId; })) });
      writeRecord_(pjTable, r.row, updated);
      personajesActualizados++;
    }
  });

  SpreadsheetApp.flush();
  return { status: "ok", deletedId: planId, trashedFiles: trashedFiles, personajesActualizados: personajesActualizados };
}

/* ==========================================================================
   4. CONTROLADORES DE MURAL Y MEDIOS (addMuralPhoto / deleteMedia)
   ========================================================================== */

/**
 * addMuralPhoto: guarda imagen (thumbnail URL) o video (URL de descarga directa +
 * póster) en "Fotos_Mural", registra la fila con fecha limpia y dispara push.
 */
function handleAddMuralPhoto_(ctx, p) {
  const table = ctx.tables.MURAL;
  const id = cleanStr_(p.id) || generateId_("mural");
  const existing = findRowById_(table, id);
  if (existing) {
    const prev = normalizeMural_(existing.data);
    return { status: "ok", duplicated: true, item: prev, photoUrl: prev.photoUrl, posterUrl: prev.posterUrl, mediaType: prev.mediaType, push: { sent: false, reason: "DUPLICATE" } };
  }
  const creador = normalizeUser_(p.creadoPor || p.usuario);
  const data = {
    id: id,
    caption: cleanStr_(p.caption),
    photoUrl: "",
    createdAt: toCleanDate_(p.createdAt, APP_TIMEZONE) || formatCleanDate_(new Date()),
    mediaType: "",
    posterUrl: "",
    creadoPor: creador
  };
  if (hasMediaPayload_(p)) {
    const media = uploadMediaBundle_(p, SUBFOLDERS.MURAL, id);
    data.photoUrl = media.url;
    data.mediaType = media.mediaType;
    data.posterUrl = media.posterUrl;
  } else if (isHttpUrl_(p.photoUrl)) {
    data.photoUrl = String(p.photoUrl).trim();
    data.mediaType = normalizeMediaType_(p.mediaType, data.photoUrl);
    data.posterUrl = isHttpUrl_(p.posterUrl) ? String(p.posterUrl).trim() : "";
  } else {
    throw appError_("MISSING_MEDIA", "addMuralPhoto requiere 'mediaBase64' / 'imageBase64' / 'videoBase64' o un 'photoUrl' http.");
  }
  appendRecord_(table, data);
  const item = normalizeMural_(data);
  const push = notifyPartner_(creador, "MURAL_MEDIA", { caption: item.caption || (item.mediaType === "video" ? "un video 🎬" : "una foto 📸") }, { type: "mural_media", muralId: id });
  return { status: "ok", item: item, photoUrl: item.photoUrl, posterUrl: item.posterUrl, mediaType: item.mediaType, push: push };
}

/**
 * deleteMedia: envía el archivo (y su póster) a la papelera de Drive con `setTrashed(true)`.
 *   - target "plan":  limpia photoUrl / mediaType / posterUrl del plan.
 *   - target "mural": elimina la fila completa del Mural.
 */
function handleDeleteMedia_(ctx, p) {
  const id = cleanStr_(p.id);
  if (!id) throw appError_("MISSING_ID", "El campo 'id' es obligatorio en deleteMedia.");
  const rawTarget = normalizeText_(p.target || p.tipo || p.source || "");
  let target = "";
  if (rawTarget.indexOf("mural") === 0) target = "mural";
  else if (rawTarget.indexOf("plan") === 0) target = "plan";
  else target = id.indexOf("mural") === 0 ? "mural" : "plan";

  if (target === "mural") {
    const table = ctx.tables.MURAL;
    const row = findRowById_(table, id);
    if (!row) throw appError_("MURAL_NOT_FOUND", "No se encontró ningún elemento del Mural con id: " + id);
    let trashedFiles = 0;
    trashedFiles += trashDriveFileByUrl_(row.data.photoUrl) ? 1 : 0;
    trashedFiles += trashDriveFileByUrl_(row.data.posterUrl) ? 1 : 0;
    table.sheet.deleteRow(row.row);
    SpreadsheetApp.flush();
    return { status: "ok", target: "mural", id: id, deletedId: id, trashedFiles: trashedFiles };
  }

  const table = ctx.tables.PLANES;
  const row = findRowById_(table, id);
  if (!row) throw appError_("PLAN_NOT_FOUND", "No se encontró ningún plan con id: " + id);
  let trashedFiles = 0;
  trashedFiles += trashDriveFileByUrl_(row.data.photoUrl) ? 1 : 0;
  trashedFiles += trashDriveFileByUrl_(row.data.posterUrl) ? 1 : 0;
  const d = Object.assign({}, row.data, { photoUrl: "", mediaType: "", posterUrl: "", updatedAt: formatCleanDate_(new Date()) });
  writeRecord_(table, row.row, d);
  return { status: "ok", target: "plan", id: id, trashedFiles: trashedFiles, plan: normalizePlan_(d) };
}

/* ==========================================================================
   5. GAMIFICACIÓN (answerTrivia / redeemCoupon / manageCoupon)
   ========================================================================== */

/**
 * answerTrivia: +10 pts por respuesta correcta, máximo 3 por día (hora Colombia).
 * Si cambió el día desde `ultimaFechaTrivia`, el contador se reinicia a 0.
 * Validación: si llega `preguntaId` + `respuesta` y la pregunta existe en
 * "Preguntas_Trampa", el servidor decide; si no, usa el booleano `correct`.
 */
function handleAnswerTrivia_(ctx, p) {
  const usuario = normalizeUser_(p.usuario);
  if (!usuario) throw appError_("INVALID_USER", "El campo 'usuario' debe ser 'simon' o 'salo'.");

  let correct;
  let validatedBy = "client";
  const preguntaId = cleanStr_(p.preguntaId || p.questionId);
  if (preguntaId && p.respuesta !== undefined) {
    const qRow = findRowById_(ctx.tables.PREGUNTAS, preguntaId);
    if (qRow) {
      correct = isCorrectAnswer_(normalizePregunta_(qRow.data), p.respuesta);
      validatedBy = "server";
    }
  }
  if (correct === undefined) correct = parseBool_(p.correct !== undefined ? p.correct : p.esCorrecta);

  const table = ctx.tables.PUNTOS;
  const row = findRowById_(table, usuario);
  if (!row) throw appError_("POINTS_ROW_MISSING", "No existe la fila de puntos para " + usuario);
  const today = todayIsoBogota_();
  const max = GAMIFICATION_CONFIG.TRIVIA_MAX_PER_DAY;
  let count = toNumber_(row.data.preguntasRespondidasHoy);
  if (toIsoDate_(row.data.ultimaFechaTrivia, CELL_TZ_) !== today) count = 0;
  const alreadyAtLimit = count >= max;

  let awarded = 0;
  if (!alreadyAtLimit) {
    if (correct) { awarded = GAMIFICATION_CONFIG.TRIVIA_POINTS; count++; }
    else if (GAMIFICATION_CONFIG.TRIVIA_COUNT_WRONG_ANSWERS) { count++; }
  }
  const d = Object.assign({}, row.data, {
    usuario: usuario,
    puntosTotales: toNumber_(row.data.puntosTotales) + awarded,
    preguntasRespondidasHoy: count,
    ultimaFechaTrivia: today
  });
  writeRecord_(table, row.row, d);

  return {
    status: "ok",
    correct: Boolean(correct),
    validatedBy: validatedBy,
    awarded: awarded,
    alreadyAtLimit: alreadyAtLimit,
    limitReached: count >= max,
    remainingToday: Math.max(0, max - count),
    maxPerDay: max,
    puntos: normalizePuntos_(d, today),
    puntosAll: listPuntos_(ctx)
  };
}

/**
 * redeemCoupon: valida bajo el lock que el saldo del `usuario` sea >= `costoPuntos`,
 * descuenta, cambia el cupón a "canjeado" (canjeadoPor + fechaCanje limpia) y
 * notifica a la pareja.
 */
function handleRedeemCoupon_(ctx, p) {
  const usuario = normalizeUser_(p.usuario || p.canjeadoPor);
  if (!usuario) throw appError_("INVALID_USER", "El campo 'usuario' debe ser 'simon' o 'salo'.");
  const cuponId = cleanStr_(p.id || p.cuponId || p.couponId);
  if (!cuponId) throw appError_("MISSING_ID", "El campo 'id' del cupón es obligatorio.");

  const cTable = ctx.tables.CUPONES;
  const cRow = findRowById_(cTable, cuponId);
  if (!cRow) throw appError_("COUPON_NOT_FOUND", "No se encontró ningún cupón con id: " + cuponId);
  const cupon = normalizeCupon_(cRow.data);
  if (cupon.estado !== "disponible") throw appError_("COUPON_NOT_AVAILABLE", "Este cupón ya fue canjeado o cumplido.", { cupon: cupon });

  const pTable = ctx.tables.PUNTOS;
  const pRow = findRowById_(pTable, usuario);
  if (!pRow) throw appError_("POINTS_ROW_MISSING", "No existe la fila de puntos para " + usuario);
  const saldo = toNumber_(pRow.data.puntosTotales);
  if (saldo < cupon.costoPuntos) {
    throw appError_("INSUFFICIENT_POINTS", "Saldo insuficiente: tienes " + saldo + " pts y el cupón cuesta " + cupon.costoPuntos + " pts.", { saldo: saldo, costo: cupon.costoPuntos });
  }

  const nuevoSaldo = saldo - cupon.costoPuntos;
  writeRecord_(pTable, pRow.row, Object.assign({}, pRow.data, { puntosTotales: nuevoSaldo }));
  const cData = Object.assign({}, cRow.data, { estado: "canjeado", canjeadoPor: usuario, fechaCanje: formatCleanDate_(new Date()) });
  writeRecord_(cTable, cRow.row, cData);

  const updated = normalizeCupon_(cData);
  const push = notifyPartner_(usuario, "COUPON_REDEEMED", { cupon: updated.titulo }, { type: "coupon_redeemed", cuponId: cuponId });
  return { status: "ok", cupon: updated, saldo: nuevoSaldo, puntos: listPuntos_(ctx), push: push };
}

/**
 * manageCoupon: CRUD del catálogo de cupones.
 * op: "create" | "update" | "fulfill" (canjeado -> cumplido) | "reactivate" (-> disponible) | "delete".
 */
function handleManageCoupon_(ctx, p) {
  return crudEntity_(ctx, p, {
    table: "CUPONES",
    prefix: "cup",
    listKey: "cupones",
    normalize: normalizeCupon_,
    list: listCupones_,
    build: function(input, prev) {
      const base = prev || {};
      const titulo = input.titulo !== undefined ? cleanStr_(input.titulo) : cleanStr_(base.titulo);
      if (!titulo) throw appError_("MISSING_FIELD", "El cupón necesita 'titulo'.");
      const costo = input.costoPuntos !== undefined ? Math.max(0, Math.round(toNumber_(input.costoPuntos))) : toNumber_(base.costoPuntos);
      return {
        titulo: titulo,
        descripcion: input.descripcion !== undefined ? String(input.descripcion) : String(base.descripcion || ""),
        costoPuntos: costo,
        icono: cleanStr_(input.icono) || cleanStr_(base.icono) || "🎟️",
        estado: prev ? (input.estado !== undefined ? normalizeCouponState_(input.estado) : normalizeCouponState_(base.estado)) : "disponible",
        canjeadoPor: prev ? (input.canjeadoPor !== undefined ? normalizeUser_(input.canjeadoPor) : normalizeUser_(base.canjeadoPor)) : "",
        fechaCanje: prev ? String(base.fechaCanje || "") : ""
      };
    },
    extraOps: {
      fulfill: function(prev) {
        const cur = normalizeCupon_(prev);
        if (cur.estado !== "canjeado") throw appError_("COUPON_NOT_REDEEMED", "Solo se puede marcar como cumplido un cupón canjeado.");
        return { estado: "cumplido" };
      },
      reactivate: function() {
        return { estado: "disponible", canjeadoPor: "", fechaCanje: "" };
      }
    }
  });
}

/* ==========================================================================
   6. CRUD DE SABIDURÍA, PREGUNTAS TRAMPA Y PERSONAJES (MOTOR GENÉRICO)
   ========================================================================== */

/**
 * manageSabiduria: op "create" | "update" | "delete".
 * Campos: categoria ("Animo"|"Charras"|"Idolos"), frase, autor, creadoPor.
 */
function handleManageSabiduria_(ctx, p) {
  return crudEntity_(ctx, p, {
    table: "SABIDURIA",
    prefix: "sab",
    listKey: "sabiduria",
    normalize: normalizeSabiduria_,
    list: listSabiduria_,
    build: function(input, prev, rawPayload) {
      const base = prev || {};
      const frase = input.frase !== undefined ? cleanStr_(input.frase) : cleanStr_(base.frase);
      if (!frase) throw appError_("MISSING_FIELD", "La frase no puede estar vacía.");
      const creador = normalizeUser_(input.creadoPor || rawPayload.usuario);
      return {
        categoria: normalizeSabiduriaCat_(input.categoria !== undefined ? input.categoria : base.categoria),
        frase: frase,
        autor: input.autor !== undefined ? cleanStr_(input.autor) : cleanStr_(base.autor),
        creadoPor: prev ? (normalizeUser_(base.creadoPor) || creador) : creador
      };
    }
  });
}

/**
 * managePreguntas: op "create" | "update" | "delete".
 * Campos: paraUsuario ("simon"|"salo"|"ambos"; por defecto la pareja del creador),
 * pregunta, opcionA..opcionD, opcionCorrecta (varias separadas por "|" o ";"), creadoPor.
 */
function handleManagePreguntas_(ctx, p) {
  return crudEntity_(ctx, p, {
    table: "PREGUNTAS",
    prefix: "preg",
    listKey: "preguntas",
    normalize: normalizePregunta_,
    list: listPreguntas_,
    build: function(input, prev, rawPayload) {
      const base = prev || {};
      const pick = function(field) { return input[field] !== undefined ? cleanStr_(input[field]) : cleanStr_(base[field]); };
      const pregunta = pick("pregunta");
      const correcta = pick("opcionCorrecta");
      if (!pregunta) throw appError_("MISSING_FIELD", "La pregunta no puede estar vacía.");
      if (!correcta) throw appError_("MISSING_FIELD", "Debes indicar 'opcionCorrecta'.");
      const creador = prev ? (normalizeUser_(base.creadoPor) || normalizeUser_(input.creadoPor || rawPayload.usuario)) : normalizeUser_(input.creadoPor || rawPayload.usuario);
      const defaultTarget = creador ? USERS_[creador].partner : "ambos";
      return {
        paraUsuario: normalizeTarget_(input.paraUsuario !== undefined ? input.paraUsuario : base.paraUsuario, defaultTarget),
        pregunta: pregunta,
        opcionA: pick("opcionA"),
        opcionB: pick("opcionB"),
        opcionC: pick("opcionC"),
        opcionD: pick("opcionD"),
        opcionCorrecta: correcta,
        creadoPor: creador
      };
    }
  });
}

/**
 * managePersonajes: op "create" | "update" | "delete".
 * Campos: nombre, tipo ("protagonista"|"secundario"), rol, superpoder, debilidad,
 * planesVinculados (array o JSON string de IDs), foto opcional
 * (`photoBase64|imageBase64|mediaBase64` + `mimeType`) en "Fotos_Personajes",
 * `removePhoto: true` para quitarla. La foto anterior va a la papelera.
 */
function handleManagePersonajes_(ctx, p) {
  return crudEntity_(ctx, p, {
    table: "PERSONAJES",
    prefix: "pj",
    listKey: "personajes",
    normalize: normalizePersonaje_,
    list: listPersonajes_,
    build: function(input, prev, rawPayload, id) {
      const base = prev || {};
      const pick = function(field) { return input[field] !== undefined ? cleanStr_(input[field]) : cleanStr_(base[field]); };
      const nombre = pick("nombre");
      if (!nombre) throw appError_("MISSING_FIELD", "El personaje necesita 'nombre'.");
      let photoUrl = cleanStr_(base.photoUrl);
      const rawPhoto = input.photoBase64 || input.imageBase64 || input.mediaBase64;
      if (rawPhoto && String(rawPhoto).trim() !== "") {
        const saved = saveMediaToSubfolder_(SUBFOLDERS.PERSONAJES, rawPhoto, input.mimeType || "image/jpeg", input.fileName || (id + ".jpg"));
        if (saved.mediaType !== "image") { trashDriveFileById_(saved.fileId); throw appError_("INVALID_MEDIA", "La foto del personaje debe ser una imagen."); }
        if (photoUrl) trashDriveFileByUrl_(photoUrl);
        photoUrl = saved.url;
      } else if (parseBool_(input.removePhoto)) {
        if (photoUrl) trashDriveFileByUrl_(photoUrl);
        photoUrl = "";
      } else if (isHttpUrl_(input.photoUrl)) {
        photoUrl = String(input.photoUrl).trim();
      }
      const linked = input.planesVinculados !== undefined ? parseLinkedPlans_(input.planesVinculados) : parseLinkedPlans_(base.planesVinculados);
      return {
        nombre: nombre,
        tipo: normalizeTipoPersonaje_(input.tipo !== undefined ? input.tipo : base.tipo),
        rol: pick("rol"),
        superpoder: pick("superpoder"),
        debilidad: pick("debilidad"),
        photoUrl: photoUrl,
        planesVinculados: JSON.stringify(linked)
      };
    },
    beforeDelete: function(prev) {
      if (normalizeTipoPersonaje_(prev.tipo) === "protagonista" && !GAMIFICATION_CONFIG.ALLOW_DELETE_PROTAGONISTS) {
        throw appError_("PROTAGONIST_LOCKED", "Los protagonistas (Simón y Salo) no se pueden borrar, solo editar.");
      }
      return trashDriveFileByUrl_(prev.photoUrl) ? 1 : 0;
    }
  });
}

/**
 * Motor CRUD genérico.
 * Payload: `{ op, item: { id, ...campos }, usuario }` (también acepta campos planos).
 * Respuesta: `{ status, op, item, <listKey>: [lista completa actualizada] }`.
 */
function crudEntity_(ctx, p, cfg) {
  const op = normalizeOp_(p.op || p.operation || p.mode || p.accion || p.subAction);
  if (!op) throw appError_("MISSING_OP", "Falta 'op' (create | update | delete" + (cfg.extraOps ? " | " + Object.keys(cfg.extraOps).join(" | ") : "") + ").");
  const input = (p.item && typeof p.item === "object") ? p.item : p;
  const table = ctx.tables[cfg.table];
  const id = cleanStr_(input.id !== undefined ? input.id : p.id);
  const result = { status: "ok", op: op };

  if (op === "create") {
    const newId = id || generateId_(cfg.prefix);
    if (findRowById_(table, newId)) throw appError_("DUPLICATE_ID", "Ya existe un registro con id: " + newId);
    const data = cfg.build(input, null, p, newId);
    data.id = newId;
    appendRecord_(table, data);
    result.item = cfg.normalize(data);
  } else {
    if (!id) throw appError_("MISSING_ID", "El campo 'id' es obligatorio para op '" + op + "'.");
    const row = findRowById_(table, id);
    if (!row) throw appError_("NOT_FOUND", "No se encontró ningún registro con id: " + id);
    if (op === "update") {
      const data = Object.assign({}, row.data, cfg.build(input, row.data, p, id), { id: id });
      writeRecord_(table, row.row, data);
      result.item = cfg.normalize(data);
    } else if (op === "delete") {
      if (cfg.beforeDelete) result.trashedFiles = cfg.beforeDelete(row.data, p) || 0;
      table.sheet.deleteRow(row.row);
      SpreadsheetApp.flush();
      result.item = cfg.normalize(row.data);
      result.deletedId = id;
    } else if (cfg.extraOps && cfg.extraOps[op]) {
      const data = Object.assign({}, row.data, cfg.extraOps[op](row.data, p), { id: id });
      writeRecord_(table, row.row, data);
      result.item = cfg.normalize(data);
    } else {
      throw appError_("UNKNOWN_OP", "Operación no soportada: " + op);
    }
  }
  result[cfg.listKey] = cfg.list(ctx);
  return result;
}

/* ==========================================================================
   7. NOTIFICACIONES PUSH ONESIGNAL (sendThinkingPush + disparadores)
   ========================================================================== */

/** sendThinkingPush: "Estoy pensando en ti 🥭🌸" hacia la pareja del `usuario`. */
function handleSendThinkingPush_(ctx, p) {
  const usuario = normalizeUser_(p.usuario);
  if (!usuario) throw appError_("INVALID_USER", "El campo 'usuario' debe ser 'simon' o 'salo'.");
  const key = usuario === "simon" ? "THINKING_SIMON" : "THINKING_SALO";
  const push = notifyPartner_(usuario, key, {}, { type: "thinking", from: usuario });
  return { status: "ok", from: usuario, to: USERS_[usuario].partner, push: push };
}

/** true si ONESIGNAL_CONFIG tiene valores reales (no placeholders "TU_..."). */
function isOneSignalConfigured_() {
  const appId = String(ONESIGNAL_CONFIG.APP_ID || "").trim();
  const key = String(ONESIGNAL_CONFIG.REST_API_KEY || "").trim();
  return Boolean(appId && key && appId.indexOf("TU_") !== 0 && key.indexOf("TU_") !== 0);
}

/**
 * Envía una push a la pareja de `fromUser` (o a ambos si no se conoce el autor).
 * Destino por alias `external_id` ("simon" | "salo") -> el frontend debe ejecutar
 * `OneSignal.login(usuario)`. Nunca lanza excepciones: devuelve `{ sent, reason, ... }`.
 */
function notifyPartner_(fromUser, templateKey, vars, data) {
  try {
    if (!isOneSignalConfigured_()) return { sent: false, reason: "ONESIGNAL_NOT_CONFIGURED" };
    const template = PUSH_MESSAGES[templateKey];
    if (!template) return { sent: false, reason: "UNKNOWN_TEMPLATE" };
    const from = normalizeUser_(fromUser);
    const sender = from ? USERS_[from] : { nombre: "Tu pareja", emoji: "💛" };
    const targets = from ? [USERS_[from].partner] : ["simon", "salo"];
    const allVars = Object.assign({ nombre: sender.nombre, emoji: sender.emoji, plan: "", cupon: "", fecha: "", caption: "" }, vars || {});
    const fill = function(text) { return String(text).replace(/\{(\w+)\}/g, function(m, k) { return allVars[k] !== undefined ? String(allVars[k]) : m; }); };
    const heading = fill(template.heading);
    const message = fill(template.message);
    const key = String(ONESIGNAL_CONFIG.REST_API_KEY).trim();
    const authHeader = key.indexOf("os_v2_") === 0 ? ("Key " + key) : ("Basic " + key);
    const body = {
      app_id: String(ONESIGNAL_CONFIG.APP_ID).trim(),
      target_channel: "push",
      include_aliases: { external_id: targets },
      headings: { en: heading, es: heading },
      contents: { en: message, es: message },
      data: Object.assign({ from: from || "" }, data || {}),
      web_url: APP_WEB_URL
    };
    const resp = UrlFetchApp.fetch("https://api.onesignal.com/notifications?c=push", {
      method: "post",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: authHeader },
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    });
    const code = resp.getResponseCode();
    let parsed = {};
    try { parsed = JSON.parse(resp.getContentText() || "{}"); } catch (ignore) {}
    const ok = code >= 200 && code < 300 && !parsed.errors;
    return {
      sent: ok,
      code: code,
      targets: targets,
      notificationId: parsed.id || "",
      reason: ok ? "OK" : (parsed.errors ? JSON.stringify(parsed.errors).slice(0, 300) : "HTTP_" + code)
    };
  } catch (err) {
    return { sent: false, reason: "PUSH_EXCEPTION: " + (err && err.message ? err.message : String(err)) };
  }
}

/* ==========================================================================
   8. CAPA DE ACCESO A GOOGLE SHEETS (TABLAS POR NOMBRE DE COLUMNA)
   ========================================================================== */

/** Crea el descriptor de tabla { key, sheet, headers, pk }. */
function buildTable_(key, sheet, headers) {
  return { key: key, sheet: sheet, headers: headers, pk: PRIMARY_KEYS_[key] || "id" };
}

/**
 * Lee todas las filas de datos como `{ row: númeroDeFila, data: { columna: valor } }`.
 * Las celdas Date se convierten a texto (ISO local o fecha limpia según la columna).
 */
function readRows_(table) {
  const sheet = table.sheet;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const width = table.headers.length;
  const values = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  const out = [];
  for (let r = 0; r < values.length; r++) {
    const rowVals = values[r];
    let empty = true;
    for (let c = 0; c < width; c++) {
      if (rowVals[c] !== "" && rowVals[c] !== null && rowVals[c] !== undefined) { empty = false; break; }
    }
    if (empty) continue;
    const data = {};
    for (let c = 0; c < width; c++) {
      const header = table.headers[c];
      if (!header) continue;
      data[header] = normalizeCell_(header, rowVals[c]);
    }
    out.push({ row: r + 2, data: data });
  }
  return out;
}

/** Busca la fila cuyo valor de llave primaria coincide con `id` (comparación de texto). */
function findRowById_(table, id) {
  const target = String(id || "").trim();
  if (!target) return null;
  const rows = readRows_(table);
  for (let i = 0; i < rows.length; i++) {
    const val = String(rows[i].data[table.pk] || "").trim();
    if (val === target || (table.pk === "usuario" && normalizeUser_(val) === target)) return rows[i];
  }
  return null;
}

/** Convierte un objeto en arreglo de celdas según el orden físico de encabezados. */
function recordToRow_(table, data) {
  return table.headers.map(function(h) { return toCellValue_(data[h]); });
}

/** Agrega una fila al final de la pestaña. */
function appendRecord_(table, data) {
  table.sheet.appendRow(recordToRow_(table, data));
  SpreadsheetApp.flush();
}

/** Sobrescribe una fila completa (preserva columnas extra porque `data` viene de readRows_). */
function writeRecord_(table, rowNumber, data) {
  const row = recordToRow_(table, data);
  table.sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  SpreadsheetApp.flush();
}

/** Inserta un lote de registros (semillas) en una sola operación. */
function bulkInsertRecords_(table, records) {
  if (!records || records.length === 0) return;
  const rows = records.map(function(rec) {
    const copy = Object.assign({}, rec);
    if (table.key === "PLANES") {
      copy.completed = false; copy.anecdote = ""; copy.photoUrl = ""; copy.updatedAt = formatCleanDate_(new Date());
      copy.mediaType = ""; copy.posterUrl = ""; copy.isReto = false; copy.ganadorReto = ""; copy.isSecreto = false;
      copy.fechaDesbloqueo = ""; copy.creadoPor = "";
    }
    if (Array.isArray(copy.planesVinculados)) copy.planesVinculados = JSON.stringify(copy.planesVinculados);
    return recordToRow_(table, copy);
  });
  const startRow = Math.max(table.sheet.getLastRow(), 1) + 1;
  table.sheet.getRange(startRow, 1, rows.length, table.headers.length).setValues(rows);
  SpreadsheetApp.flush();
}

/**
 * Normaliza un valor JS a celda segura:
 *  - booleanos y números se guardan nativos;
 *  - textos tipo fecha ("2026-12-24") o que empiezan con = + - @ se prefijan con
 *    apóstrofo para que Sheets NO los convierta en Date ni en fórmula.
 */
function toCellValue_(val) {
  if (val === undefined || val === null) return "";
  if (typeof val === "boolean" || typeof val === "number") return val;
  if (val instanceof Date) return formatCleanDate_(val);
  if (Array.isArray(val) || typeof val === "object") return JSON.stringify(val);
  const s = String(val);
  if (/^[=+\-@]/.test(s) || /^\d{1,4}[-\/.]\d{1,2}[-\/.]\d{1,4}/.test(s)) return "'" + s;
  return s;
}

/** Convierte una celda leída a valor JSON según el tipo de columna. */
function normalizeCell_(header, val) {
  if (DATE_ISO_COLUMNS_.indexOf(header) !== -1) return toIsoDate_(val, CELL_TZ_);
  if (DATE_CLEAN_COLUMNS_.indexOf(header) !== -1) return toCleanDate_(val, CELL_TZ_);
  if (val instanceof Date) return val.toISOString();
  if (val === null || val === undefined) return "";
  return val;
}

/* ---------- Listas normalizadas para el frontend ---------- */

function listPlans_(ctx, viewer) {
  const today = todayIsoBogota_();
  return readRows_(ctx.tables.PLANES).map(function(r) { return maskPlanForViewer_(normalizePlan_(r.data, today), viewer); });
}

function listMural_(ctx) {
  return readRows_(ctx.tables.MURAL).map(function(r) { return normalizeMural_(r.data); }).reverse();
}

function listCupones_(ctx) {
  return readRows_(ctx.tables.CUPONES).map(function(r) { return normalizeCupon_(r.data); });
}

function listPuntos_(ctx) {
  const today = todayIsoBogota_();
  const rows = readRows_(ctx.tables.PUNTOS).map(function(r) { return normalizePuntos_(r.data, today); });
  return rows.filter(function(r) { return r.usuario === "simon" || r.usuario === "salo"; });
}

function listSabiduria_(ctx) {
  return readRows_(ctx.tables.SABIDURIA).map(function(r) { return normalizeSabiduria_(r.data); });
}

function listPreguntas_(ctx) {
  return readRows_(ctx.tables.PREGUNTAS).map(function(r) { return normalizePregunta_(r.data); });
}

function listPersonajes_(ctx) {
  return readRows_(ctx.tables.PERSONAJES).map(function(r) { return normalizePersonaje_(r.data); });
}

/** Suma (o resta) puntos a un usuario. Debe llamarse dentro del lock. */
function addPointsToUser_(ctx, usuario, delta) {
  const table = ctx.tables.PUNTOS;
  const row = findRowById_(table, usuario);
  if (!row) throw appError_("POINTS_ROW_MISSING", "No existe la fila de puntos para " + usuario);
  const d = Object.assign({}, row.data, { usuario: usuario, puntosTotales: toNumber_(row.data.puntosTotales) + delta });
  writeRecord_(table, row.row, d);
  return normalizePuntos_(d, todayIsoBogota_());
}

/* ==========================================================================
   9. CAPA DE GOOGLE DRIVE (FOTO / VIDEO / PÓSTER / PAPELERA)
   ========================================================================== */

/** true si el payload trae algún medio en Base64. */
function hasMediaPayload_(p) {
  const raw = p.mediaBase64 || p.videoBase64 || p.imageBase64;
  return Boolean(raw && String(raw).trim() !== "");
}

/**
 * Sube el medio principal (+ póster si es video) a la subcarpeta indicada.
 * Payload: mediaBase64|imageBase64|videoBase64, mimeType, fileName,
 *          posterBase64, posterMimeType.
 * @return {{url: string, mediaType: string, posterUrl: string, fileId: string}}
 */
function uploadMediaBundle_(p, subfolderName, baseName) {
  const raw = p.mediaBase64 || p.videoBase64 || p.imageBase64;
  const defaultMime = p.videoBase64 ? "video/mp4" : (String(p.mediaType || "").toLowerCase() === "video" ? "video/mp4" : "image/jpeg");
  const mime = String(p.mimeType || p.mediaMimeType || defaultMime).trim();
  const saved = saveMediaToSubfolder_(subfolderName, raw, mime, p.fileName || "");
  let posterUrl = "";
  if (saved.mediaType === "video") {
    if (p.posterBase64 && String(p.posterBase64).trim() !== "") {
      const poster = saveMediaToSubfolder_(subfolderName, p.posterBase64, p.posterMimeType || "image/jpeg", baseName + "_poster_" + Date.now() + ".jpg");
      posterUrl = poster.url;
    } else {
      posterUrl = "https://drive.google.com/thumbnail?id=" + saved.fileId + "&sz=w1200";
    }
  }
  return { url: saved.url, mediaType: saved.mediaType, posterUrl: posterUrl, fileId: saved.fileId };
}

/**
 * Limpia el prefijo DataURL, decodifica el Base64 a Blob, guarda el archivo en la
 * subcarpeta de Drive con acceso ANYONE_WITH_LINK y construye la URL pública:
 *   - imagen: https://drive.google.com/thumbnail?id=ID&sz=w1200
 *   - video:  https://drive.google.com/uc?export=download&id=ID
 */
function saveMediaToSubfolder_(subfolderName, rawBase64, mimeType, fileName) {
  let cleanBase64 = String(rawBase64 || "").trim();
  let effectiveMime = String(mimeType || "image/jpeg").trim().toLowerCase();
  if (cleanBase64.indexOf("data:") === 0 && cleanBase64.indexOf(",") !== -1) {
    const commaIdx = cleanBase64.indexOf(",");
    const header = cleanBase64.slice(0, commaIdx);
    const match = header.match(/^data:([a-zA-Z0-9.+\-\/]+);base64$/i);
    if (match && match[1]) effectiveMime = match[1].toLowerCase();
    cleanBase64 = cleanBase64.slice(commaIdx + 1);
  }
  if (!cleanBase64) throw appError_("MISSING_MEDIA", "El archivo Base64 llegó vacío.");
  const isVideo = effectiveMime.indexOf("video/") === 0;
  const isImage = effectiveMime.indexOf("image/") === 0;
  if (!isVideo && !isImage) throw appError_("INVALID_MEDIA", "Tipo de archivo no soportado: " + effectiveMime);

  const ext = extensionForMime_(effectiveMime);
  let name = String(fileName || "").trim() || ((isVideo ? "video_" : "foto_") + Date.now() + ext);
  if (name.indexOf(".") === -1) name += ext;

  const bytes = Utilities.base64Decode(cleanBase64.replace(/\s/g, ""));
  const blob = Utilities.newBlob(bytes, effectiveMime, name);
  const rootFolder = getOrCreateRootFolder_();
  const targetFolder = getOrCreateSubfolder_(rootFolder, subfolderName);
  const file = targetFolder.createFile(blob);
  const fileId = file.getId();
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    try { file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW); } catch (ignore) {}
  }
  const url = isVideo
    ? "https://drive.google.com/file/d/" + fileId + "/preview"
    : "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200";
  return { fileId: fileId, url: url, mediaType: isVideo ? "video" : "image", mimeType: effectiveMime };
}

/** Extensión de archivo sugerida por MIME. */
function extensionForMime_(mime) {
  const map = {
    "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/heic": ".heic",
    "video/mp4": ".mp4", "video/quicktime": ".mov", "video/webm": ".webm", "video/3gpp": ".3gp"
  };
  return map[mime] || (mime.indexOf("video/") === 0 ? ".mp4" : ".jpg");
}

/** Extrae el ID de archivo de Drive de una URL (`?id=` / `&id=` / `/d/ID`). */
function extractDriveFileId_(url) {
  const s = String(url || "").trim();
  if (!/^https:\/\/(drive|docs)\.google\.com\//i.test(s) && !/googleusercontent\.com\//i.test(s)) return "";
  let m = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  m = s.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  return m ? m[1] : "";
}

/** Envía a la papelera de Drive el archivo referenciado por la URL. Nunca lanza. */
function trashDriveFileByUrl_(url) {
  const id = extractDriveFileId_(url);
  return id ? trashDriveFileById_(id) : false;
}

/** Envía a la papelera de Drive (`setTrashed(true)`) un archivo por ID. Nunca lanza. */
function trashDriveFileById_(fileId) {
  if (!fileId) return false;
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return true;
  } catch (err) {
    Logger.log("No se pudo enviar a la papelera el archivo " + fileId + ": " + (err && err.message ? err.message : err));
    return false;
  }
}

/** Resuelve la carpeta raíz usando `ROOT_FOLDER_ID` o creando "Bitacora_Mango_Primavera_Media". */
function getOrCreateRootFolder_() {
  const configured = String(ROOT_FOLDER_ID || "").trim();
  if (configured && configured.indexOf("TU_") !== 0) {
    try {
      const folder = DriveApp.getFolderById(configured);
      if (folder && !folder.isTrashed()) return folder;
    } catch (e) {
      Logger.log("Aviso: ROOT_FOLDER_ID configurado no encontrado, activando fallback: " + e);
    }
  }
  const props = PropertiesService.getScriptProperties();
  const cachedId = props.getProperty(FALLBACK_NAMES_.PROP_FOLDER_ID);
  if (cachedId) {
    try { const f = DriveApp.getFolderById(cachedId); if (!f.isTrashed()) return f; } catch (ignore) {}
  }
  const it = DriveApp.getFoldersByName(FALLBACK_NAMES_.ROOT_FOLDER);
  while (it.hasNext()) {
    const folder = it.next();
    if (!folder.isTrashed()) { props.setProperty(FALLBACK_NAMES_.PROP_FOLDER_ID, folder.getId()); return folder; }
  }
  const created = DriveApp.createFolder(FALLBACK_NAMES_.ROOT_FOLDER);
  props.setProperty(FALLBACK_NAMES_.PROP_FOLDER_ID, created.getId());
  return created;
}

/** Obtiene o crea una subcarpeta dentro de la carpeta raíz. */
function getOrCreateSubfolder_(rootFolder, subfolderName) {
  const it = rootFolder.getFoldersByName(subfolderName);
  while (it.hasNext()) { const sub = it.next(); if (!sub.isTrashed()) return sub; }
  return rootFolder.createFolder(subfolderName);
}

/** Resuelve el Spreadsheet usando `SPREADSHEET_ID`, caché, hoja activa o creando uno nuevo. */
function resolveSpreadsheet_() {
  const configured = String(SPREADSHEET_ID || "").trim();
  if (configured && configured.indexOf("TU_") !== 0) {
    try {
      return SpreadsheetApp.openById(configured);
    } catch (e) {
      Logger.log("Aviso: SPREADSHEET_ID configurado no encontrado, activando fallback: " + e);
    }
  }
  const props = PropertiesService.getScriptProperties();
  const cachedId = props.getProperty(FALLBACK_NAMES_.PROP_SHEET_ID);
  if (cachedId) { try { return SpreadsheetApp.openById(cachedId); } catch (ignore) {} }
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) { props.setProperty(FALLBACK_NAMES_.PROP_SHEET_ID, active.getId()); return active; }
  } catch (ignore) {}
  const it = DriveApp.getFilesByName(FALLBACK_NAMES_.SPREADSHEET);
  while (it.hasNext()) {
    const file = it.next();
    if (!file.isTrashed() && file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      props.setProperty(FALLBACK_NAMES_.PROP_SHEET_ID, file.getId());
      return SpreadsheetApp.openById(file.getId());
    }
  }
  const created = SpreadsheetApp.create(FALLBACK_NAMES_.SPREADSHEET);
  props.setProperty(FALLBACK_NAMES_.PROP_SHEET_ID, created.getId());
  return created;
}

/* ==========================================================================
   10. FECHAS LIMPIAS (COLOMBIA) Y NORMALIZADORES DE DATOS
   ========================================================================== */

/** Fecha ISO local de Colombia: "yyyy-MM-dd". */
function todayIsoBogota_() {
  return Utilities.formatDate(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
}

/** Fecha limpia sin hora en Colombia: "18 de Noviembre, 2026". */
function formatCleanDate_(date, tz) {
  const d = (date instanceof Date && !isNaN(date.getTime())) ? date : new Date();
  const zone = tz || APP_TIMEZONE;
  const day = Number(Utilities.formatDate(d, zone, "d"));
  const month = Number(Utilities.formatDate(d, zone, "M"));
  const year = Utilities.formatDate(d, zone, "yyyy");
  return day + " de " + MESES_[month - 1] + ", " + year;
}

/** "2026-12-24" -> "24 de Diciembre, 2026" (sin desfases de zona horaria). */
function formatCleanDateFromIso_(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso || "");
  const month = Number(m[2]);
  if (month < 1 || month > 12) return String(iso);
  return Number(m[3]) + " de " + MESES_[month - 1] + ", " + m[1];
}

/**
 * Convierte cualquier representación de fecha a fecha limpia.
 * Acepta Date, ISO con hora ("2026-11-18T05:00:00Z"), ISO corta, "dd/MM/yyyy"
 * o un texto ya limpio (se devuelve tal cual).
 */
function toCleanDate_(val, tz) {
  if (val === null || val === undefined || val === "") return "";
  if (val instanceof Date) return isNaN(val.getTime()) ? "" : formatCleanDate_(val, tz || APP_TIMEZONE);
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? formatCleanDateFromIso_(s) : formatCleanDate_(d, APP_TIMEZONE);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return formatCleanDateFromIso_(s);
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return formatCleanDateFromIso_(dmy[3] + "-" + pad2_(dmy[2]) + "-" + pad2_(dmy[1]));
  return s;
}

/**
 * Convierte cualquier representación de fecha a ISO local "yyyy-MM-dd".
 * Acepta Date, ISO (con o sin hora), "dd/MM/yyyy" y "18 de Noviembre, 2026".
 */
function toIsoDate_(val, tz) {
  if (val === null || val === undefined || val === "") return "";
  if (val instanceof Date) return isNaN(val.getTime()) ? "" : Utilities.formatDate(val, tz || APP_TIMEZONE, "yyyy-MM-dd");
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s.slice(0, 10) : Utilities.formatDate(d, APP_TIMEZONE, "yyyy-MM-dd");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return dmy[3] + "-" + pad2_(dmy[2]) + "-" + pad2_(dmy[1]);
  const clean = normalizeText_(s).match(/^(\d{1,2}) de ([a-z]+),? (\d{4})$/);
  if (clean) {
    const idx = MESES_.map(function(m) { return normalizeText_(m); }).indexOf(clean[2]);
    if (idx !== -1) return clean[3] + "-" + pad2_(idx + 1) + "-" + pad2_(clean[1]);
  }
  return "";
}

function pad2_(n) { return ("0" + String(n)).slice(-2); }

/** Plan normalizado con booleanos reales, defaults y `isLocked` calculado (hora Colombia). */
function normalizePlan_(raw, today) {
  const t = today || todayIsoBogota_();
  const photoUrl = String(raw.photoUrl || "").trim();
  const isReto = parseBool_(raw.isReto);
  const isSecreto = parseBool_(raw.isSecreto);
  const fecha = toIsoDate_(raw.fechaDesbloqueo, CELL_TZ_);
  return {
    id: String(raw.id || "").trim(),
    title: String(raw.title || ""),
    category: String(raw.category || "Relax"),
    weather: String(raw.weather || "☀️"),
    energy: String(raw.energy || "🔋"),
    emoji: String(raw.emoji || "✨"),
    isVip: parseBool_(raw.isVip),
    completed: parseBool_(raw.completed),
    anecdote: String(raw.anecdote || ""),
    photoUrl: photoUrl,
    updatedAt: toCleanDate_(raw.updatedAt, CELL_TZ_),
    mediaType: photoUrl ? normalizeMediaType_(raw.mediaType, photoUrl) : "",
    posterUrl: String(raw.posterUrl || "").trim(),
    isReto: isReto,
    ganadorReto: isReto ? normalizeWinner_(raw.ganadorReto) : "",
    isSecreto: isSecreto,
    fechaDesbloqueo: isSecreto ? fecha : "",
    creadoPor: normalizeUser_(raw.creadoPor),
    isLocked: Boolean(isSecreto && fecha && t < fecha)
  };
}

/**
 * Si se conoce quién consulta (`viewer`) y el plan secreto sigue bloqueado y NO lo
 * creó él, se ocultan título/emoji/anécdota/medios (asimetría de planes sorpresa).
 */
function maskPlanForViewer_(plan, viewer) {
  if (!viewer || !plan.isLocked || plan.creadoPor === viewer) return plan;
  const autor = plan.creadoPor ? USERS_[plan.creadoPor].nombre : "tu pareja";
  return Object.assign({}, plan, {
    title: "🎁 Plan Sorpresa de " + autor,
    emoji: "🎁",
    anecdote: "",
    photoUrl: "",
    posterUrl: "",
    mediaType: "",
    isMasked: true
  });
}

function normalizeMural_(raw) {
  const photoUrl = String(raw.photoUrl || "").trim();
  return {
    id: String(raw.id || "").trim(),
    caption: String(raw.caption || ""),
    photoUrl: photoUrl,
    createdAt: toCleanDate_(raw.createdAt, CELL_TZ_),
    mediaType: photoUrl ? normalizeMediaType_(raw.mediaType, photoUrl) : "",
    posterUrl: String(raw.posterUrl || "").trim(),
    creadoPor: normalizeUser_(raw.creadoPor)
  };
}

function normalizeCupon_(raw) {
  return {
    id: String(raw.id || "").trim(),
    titulo: String(raw.titulo || ""),
    descripcion: String(raw.descripcion || ""),
    costoPuntos: toNumber_(raw.costoPuntos),
    icono: String(raw.icono || "🎟️"),
    estado: normalizeCouponState_(raw.estado),
    canjeadoPor: normalizeUser_(raw.canjeadoPor),
    fechaCanje: toCleanDate_(raw.fechaCanje, CELL_TZ_)
  };
}

/** Puntos normalizados; si la última trivia no fue hoy, el contador visible es 0. */
function normalizePuntos_(raw, today) {
  const t = today || todayIsoBogota_();
  const last = toIsoDate_(raw.ultimaFechaTrivia, CELL_TZ_);
  const count = last === t ? toNumber_(raw.preguntasRespondidasHoy) : 0;
  return {
    usuario: normalizeUser_(raw.usuario),
    puntosTotales: toNumber_(raw.puntosTotales),
    preguntasRespondidasHoy: count,
    ultimaFechaTrivia: last,
    triviaRestanteHoy: Math.max(0, GAMIFICATION_CONFIG.TRIVIA_MAX_PER_DAY - count)
  };
}

function normalizeSabiduria_(raw) {
  return {
    id: String(raw.id || "").trim(),
    categoria: normalizeSabiduriaCat_(raw.categoria),
    frase: String(raw.frase || ""),
    autor: String(raw.autor || ""),
    creadoPor: normalizeUser_(raw.creadoPor)
  };
}

/** Pregunta normalizada + campos derivados `opciones` y `respuestasCorrectas`. */
function normalizePregunta_(raw) {
  const q = {
    id: String(raw.id || "").trim(),
    paraUsuario: normalizeTarget_(raw.paraUsuario, "ambos"),
    pregunta: String(raw.pregunta || ""),
    opcionA: String(raw.opcionA || ""),
    opcionB: String(raw.opcionB || ""),
    opcionC: String(raw.opcionC || ""),
    opcionD: String(raw.opcionD || ""),
    opcionCorrecta: String(raw.opcionCorrecta || ""),
    creadoPor: normalizeUser_(raw.creadoPor)
  };
  q.opciones = [q.opcionA, q.opcionB, q.opcionC, q.opcionD].filter(function(o) { return String(o).trim() !== ""; });
  q.respuestasCorrectas = resolveCorrectAnswers_(q);
  return q;
}

/** Resuelve `opcionCorrecta` ("A" | "Texto" | "Texto 1 | Texto 2") a la lista de textos válidos. */
function resolveCorrectAnswers_(q) {
  const letters = { a: q.opcionA, b: q.opcionB, c: q.opcionC, d: q.opcionD };
  const out = [];
  String(q.opcionCorrecta || "").split(/\s*[|;]\s*/).forEach(function(token) {
    const t = String(token || "").trim();
    if (!t) return;
    const letter = t.length === 1 ? t.toLowerCase() : "";
    const resolved = (letter && letters[letter] && String(letters[letter]).trim() !== "") ? String(letters[letter]).trim() : t;
    if (out.indexOf(resolved) === -1) out.push(resolved);
  });
  return out;
}

/** Compara la respuesta (texto o letra A-D) contra las válidas ignorando tildes/mayúsculas. */
function isCorrectAnswer_(q, respuesta) {
  let r = String(respuesta === undefined || respuesta === null ? "" : respuesta).trim();
  const letters = { a: q.opcionA, b: q.opcionB, c: q.opcionC, d: q.opcionD };
  if (r.length === 1 && letters[r.toLowerCase()]) r = String(letters[r.toLowerCase()]);
  const target = normalizeText_(r);
  if (!target) return false;
  const valid = (q.respuestasCorrectas || resolveCorrectAnswers_(q)).map(normalizeText_);
  return valid.indexOf(target) !== -1;
}

/** Personaje normalizado; `planesVinculados` se entrega como ARRAY (en Sheets es JSON string). */
function normalizePersonaje_(raw) {
  return {
    id: String(raw.id || "").trim(),
    nombre: String(raw.nombre || ""),
    tipo: normalizeTipoPersonaje_(raw.tipo),
    rol: String(raw.rol || ""),
    superpoder: String(raw.superpoder || ""),
    debilidad: String(raw.debilidad || ""),
    photoUrl: String(raw.photoUrl || "").trim(),
    planesVinculados: parseLinkedPlans_(raw.planesVinculados)
  };
}

/** Acepta array, JSON string o lista separada por comas -> array de IDs únicos. */
function parseLinkedPlans_(val) {
  let arr = [];
  if (Array.isArray(val)) arr = val;
  else {
    const s = String(val === undefined || val === null ? "" : val).trim();
    if (!s) arr = [];
    else if (s.charAt(0) === "[") { try { arr = JSON.parse(s); } catch (e) { arr = []; } }
    else arr = s.split(",");
  }
  const out = [];
  (Array.isArray(arr) ? arr : []).forEach(function(x) {
    const id = String(x === undefined || x === null ? "" : x).trim();
    if (id && out.indexOf(id) === -1) out.push(id);
  });
  return out;
}

/** "simon" | "salo" | "" (acepta Simón, Salomé, Salome, Mango, Primavera). */
function normalizeUser_(val) {
  const s = normalizeText_(val);
  if (!s) return "";
  if (s === "simon" || s.indexOf("simon") === 0 || s === "mango" || s === "palito de mango") return "simon";
  if (s === "salo" || s.indexOf("salo") === 0 || s === "primavera") return "salo";
  return "";
}

/** "simon" | "salo" | "ambos". */
function normalizeTarget_(val, fallback) {
  const s = normalizeText_(val);
  if (s === "ambos" || s === "both" || s === "todos") return "ambos";
  return normalizeUser_(val) || fallback || "ambos";
}

/** "simon" | "salo" | "empate" | "". */
function normalizeWinner_(val) {
  const s = normalizeText_(val);
  if (!s) return "";
  if (s.indexOf("empate") === 0 || s === "tie" || s === "draw" || s.indexOf("🤝") !== -1) return "empate";
  return normalizeUser_(val);
}

/** "image" | "video" (infiere por URL si la columna está vacía). */
function normalizeMediaType_(val, url) {
  const s = normalizeText_(val);
  if (s === "video" || s.indexOf("video/") === 0) return "video";
  if (s === "image" || s === "imagen" || s.indexOf("image/") === 0) return "image";
  const u = String(url || "");
  if (/export=download/i.test(u) || /\.(mp4|mov|webm)(\?|$)/i.test(u)) return "video";
  return u ? "image" : "";
}

function normalizeCouponState_(val) {
  const s = normalizeText_(val);
  if (s === "canjeado") return "canjeado";
  if (s === "cumplido") return "cumplido";
  return "disponible";
}

function normalizeSabiduriaCat_(val) {
  const s = normalizeText_(val);
  if (s.indexOf("charr") === 0) return "Charras";
  if (s.indexOf("idol") === 0) return "Idolos";
  return "Animo";
}

function normalizeTipoPersonaje_(val) {
  return normalizeText_(val).indexOf("protagonista") === 0 ? "protagonista" : "secundario";
}

/** Normaliza el nombre de la operación CRUD. */
function normalizeOp_(val) {
  const s = normalizeText_(val);
  const map = {
    create: "create", crear: "create", add: "create", nuevo: "create", insert: "create",
    update: "update", editar: "update", edit: "update", actualizar: "update",
    delete: "delete", borrar: "delete", eliminar: "delete", remove: "delete",
    fulfill: "fulfill", cumplir: "fulfill", cumplido: "fulfill",
    reactivate: "reactivate", reactivar: "reactivate", reset: "reactivate"
  };
  return map[s] || "";
}

/** Minúsculas, sin tildes y espacios colapsados. */
function normalizeText_(val) {
  return String(val === undefined || val === null ? "" : val)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\s+/g, " ").trim();
}

function cleanStr_(val) {
  return String(val === undefined || val === null ? "" : val).trim();
}

function isHttpUrl_(val) {
  return /^https?:\/\//i.test(String(val || "").trim());
}

function toNumber_(val) {
  const n = Number(val);
  return isFinite(n) ? n : 0;
}

/** Convierte valores de celda o JSON (`true`, `"TRUE"`, `"true"`, `1`, `"sí"`) en booleano estricto. */
function parseBool_(val) {
  if (typeof val === "boolean") return val;
  const s = normalizeText_(val);
  return s === "true" || s === "1" || s === "si" || s === "yes";
}

/** ID único legible: prefijo-timestamp-aleatorio. */
function generateId_(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

/** Error de negocio con código estable para el frontend. */
function appError_(code, message, extra) {
  const err = new Error(message);
  err.code = code;
  err.extra = extra || null;
  return err;
}

/** Error -> `{ status: "error", code, message, ...extra }`. */
function errorToResponse_(err) {
  const res = { status: "error", code: (err && err.code) ? err.code : "INTERNAL_ERROR", message: err && err.message ? err.message : String(err) };
  if (err && err.extra) Object.keys(err.extra).forEach(function(k) { res[k] = err.extra[k]; });
  return res;
}

/** Empaqueta un objeto en respuesta JSON (`ContentService.MimeType.JSON`). */
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
