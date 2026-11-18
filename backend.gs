/**
 * ============================================================================
 * 🥭🌸 BITÁCORA DE PALITO DE MANGO Y PRIMAVERA (Simón & Salomé)
 * ============================================================================
 * ARCHIVO: backend.gs (Motor Serverless en Google Apps Script)
 * ARQUITECTURA: API RESTful Serverless sobre Google Workspace (Sheets + Drive)
 * DOCUMENTACIÓN: Hiper-comentada en español para Ingeniería Mecatrónica.
 *
 * GUÍA DE DESPLIEGUE PASO A PASO:
 *   1. Pega este archivo en https://script.google.com
 *   2. (Opcional) Reemplaza ROOT_FOLDER_ID y SPREADSHEET_ID abajo, o déjalos
 *      con su texto placeholder para que el script cree carpeta y hoja en automático.
 *   3. Ejecuta manualmente `setupDatabase` desde el editor para autorizar OAuth,
 *      crear `"Fotos_Planes"` y `"Fotos_Mural"`, y sembrar los 33 planes iniciales.
 *   4. Implementar -> Nueva implementación -> Aplicación web:
 *      Ejecutar como: "Yo" | Quién tiene acceso: "Cualquier persona".
 *   5. Copia la URL `/exec` y pégala en `APP_CONFIG.GAS_WEB_APP_URL` dentro de `app.js`.
 * ============================================================================
 */

// 🛠️ BACKDOOR: CONFIGURACIÓN DE GOOGLE DRIVE Y GOOGLE SHEETS
/**
 * Identificadores de infraestructura en Google Drive y Google Sheets.
 * Si mantienen el placeholder o quedan vacíos, el sistema opera en modo Plug & Play
 * creando o reutilizando automáticamente la carpeta y hoja en la cuenta de Google.
 */
const ROOT_FOLDER_ID = "TU_DRIVE_FOLDER_ID_AQUI";
const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI";
const SUBFOLDERS = { PLANES: "Fotos_Planes", MURAL: "Fotos_Mural" };
const SHEET_NAMES = { PLANES: "Planes", MURAL: "Mural" };

const FALLBACK_NAMES_ = {
  ROOT_FOLDER: "Bitacora_Mango_Primavera_Media",
  SPREADSHEET: "BD_Bitacora_Palito_Mango_Primavera",
  PROP_FOLDER_ID: "BITACORA_ROOT_FOLDER_ID",
  PROP_SHEET_ID: "BITACORA_SPREADSHEET_ID"
};

const HEADERS_ = {
  PLANES: ["id", "title", "category", "weather", "energy", "emoji", "isVip", "completed", "anecdote", "photoUrl", "updatedAt"],
  MURAL: ["id", "caption", "photoUrl", "createdAt"]
};

// 🛠️ BACKDOOR: LISTA MAESTRA DE 33 PLANES INICIALES (INITIAL_PLANS_SEED)
/**
 * Semilla oficial con los 33 planes iniciales de Simón y Salomé.
 * Si la pestaña "Planes" está vacía (<= 1 fila), se insertan automáticamente.
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

/* ==========================================================================
   1. INICIALIZACIÓN AUTOMÁTICA DE INFRAESTRUCTURA (setupDatabase)
   ========================================================================== */

/**
 * Inicializa manualmente o bajo demanda toda la infraestructura en Google Workspace:
 * carpeta raíz en Drive, subcarpetas `"Fotos_Planes"` y `"Fotos_Mural"`, archivo
 * Spreadsheet, pestañas `"Planes"` y `"Mural"` y los 33 planes iniciales.
 */
function setupDatabase() {
  const ctx = ensureDatabase_();
  const rootFolder = getOrCreateRootFolder_();
  const subPlanes = getOrCreateSubfolder_(rootFolder, SUBFOLDERS.PLANES);
  const subMural = getOrCreateSubfolder_(rootFolder, SUBFOLDERS.MURAL);
  const summary = {
    status: "ok",
    spreadsheetId: ctx.spreadsheet.getId(),
    spreadsheetUrl: ctx.spreadsheet.getUrl(),
    rootFolderId: rootFolder.getId(),
    rootFolderUrl: rootFolder.getUrl(),
    planesFolderId: subPlanes.getId(),
    muralFolderId: subMural.getId()
  };
  Logger.log("=== 🥭🌸 BITÁCORA MANGO Y PRIMAVERA: BASE DE DATOS LISTA ===");
  Logger.log("Spreadsheet ID:  " + summary.spreadsheetId + " | URL: " + summary.spreadsheetUrl);
  Logger.log("Drive Root ID:   " + summary.rootFolderId + " | URL: " + summary.rootFolderUrl);
  Logger.log("Subcarpetas OK:  " + SUBFOLDERS.PLANES + " y " + SUBFOLDERS.MURAL);
  return summary;
}

/**
 * Garantiza que existan las pestañas `"Planes"` y `"Mural"` con sus encabezados
 * en negrita y fila 1 congelada. Si `"Planes"` está vacía, inserta los 33 planes.
 */
function ensureDatabase_() {
  const spreadsheet = resolveSpreadsheet_();
  let planesSheet = spreadsheet.getSheetByName(SHEET_NAMES.PLANES) || spreadsheet.insertSheet(SHEET_NAMES.PLANES);
  ensureHeaders_(planesSheet, HEADERS_.PLANES);

  if (planesSheet.getLastRow() <= 1) {
    const nowIso = new Date().toISOString();
    const seedRows = INITIAL_PLANS_SEED.map(function(p) {
      return [p.id, p.title, p.category, p.weather, p.energy, p.emoji, Boolean(p.isVip), false, "", "", nowIso];
    });
    planesSheet.getRange(2, 1, seedRows.length, HEADERS_.PLANES.length).setValues(seedRows);
    SpreadsheetApp.flush();
  }

  let muralSheet = spreadsheet.getSheetByName(SHEET_NAMES.MURAL) || spreadsheet.insertSheet(SHEET_NAMES.MURAL);
  ensureHeaders_(muralSheet, HEADERS_.MURAL);
  return { spreadsheet: spreadsheet, planesSheet: planesSheet, muralSheet: muralSheet };
}

/** Configura la fila 1 de encabezados con estilo Mango pastel y congela la fila superior. */
function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setFontWeight("bold").setBackground("#FFE0B2").setFontColor("#2D231E");
    sheet.setFrozenRows(1);
  } else if (sheet.getFrozenRows() < 1) {
    sheet.setFrozenRows(1);
  }
}

/* ==========================================================================
   2. ENDPOINTS HTTP SERVERLESS (doGet y doPost)
   ========================================================================== */

/**
 * Endpoint HTTP GET (`?action=getAll`).
 * Lee las pestañas `"Planes"` y `"Mural"`, normaliza booleanos (`isVip`, `completed`)
 * y responde JSON puro `{ status: "ok", plans: [...], mural: [...] }`.
 */
function doGet(e) {
  try {
    const ctx = ensureDatabase_();
    const plans = readSheetRecords_(ctx.planesSheet, HEADERS_.PLANES).map(normalizePlanRecord_);
    const mural = readSheetRecords_(ctx.muralSheet, HEADERS_.MURAL).reverse();
    return jsonResponse_({ status: "ok", timestamp: new Date().toISOString(), plans: plans, mural: mural });
  } catch (err) {
    return jsonResponse_({ status: "error", message: err && err.message ? err.message : String(err) });
  }
}

/**
 * Endpoint HTTP POST.
 * Parsea `e.postData.contents` (`text/plain;charset=utf-8`), adquiere semáforo Mutex
 * con `LockService.getScriptLock().waitLock(15000)` y rutea las 3 acciones:
 *   - `updatePlan`: actualiza `completed`, `anecdote`, `updatedAt` y foto en `"Fotos_Planes"`.
 *   - `addPlan`: inserta un nuevo plan en `"Planes"` evitando duplicados por `id`.
 *   - `addMuralPhoto`: guarda imagen en `"Fotos_Mural"` e inserta registro en `"Mural"`.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Cuerpo POST vacío. Se esperaba un payload JSON.");
    }
    const body = JSON.parse(e.postData.contents);
    const action = String(body.action || "").trim();
    const payload = (body.payload && typeof body.payload === "object") ? body.payload : body;

    lock.waitLock(15000);
    hasLock = true;
    const ctx = ensureDatabase_();

    if (action === "updatePlan") return jsonResponse_(handleUpdatePlan_(ctx.planesSheet, payload));
    if (action === "addPlan") return jsonResponse_(handleAddPlan_(ctx.planesSheet, payload));
    if (action === "addMuralPhoto") return jsonResponse_(handleAddMuralPhoto_(ctx.muralSheet, payload));
    throw new Error("Acción POST no reconocida: " + action);
  } catch (err) {
    return jsonResponse_({ status: "error", message: err && err.message ? err.message : String(err) });
  } finally {
    if (hasLock) {
      try { lock.releaseLock(); } catch (ignore) {}
    }
  }
}

/* ==========================================================================
   3. CONTROLADORES DE ACCIONES POST (PLANES Y MURAL)
   ========================================================================== */

/**
 * Busca la fila del plan por `payload.id` en `"Planes"`, sube foto opcional a
 * `"Fotos_Planes"` con acceso público y actualiza `completed`, `anecdote`, `photoUrl` y `updatedAt`.
 */
function handleUpdatePlan_(sheet, payload) {
  const planId = String(payload.id || "").trim();
  if (!planId) throw new Error("El campo 'id' del plan es obligatorio en updatePlan.");

  const values = sheet.getDataRange().getValues();
  let targetRowIndex = -1;
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]).trim() === planId) {
      targetRowIndex = r + 1;
      break;
    }
  }
  if (targetRowIndex === -1) throw new Error("No se encontró ningún plan con id: " + planId);

  const currentRow = values[targetRowIndex - 1];
  let photoUrl = String(currentRow[9] || "").trim();
  if (payload.imageBase64 && String(payload.imageBase64).trim() !== "") {
    photoUrl = saveImageToSubfolder_(SUBFOLDERS.PLANES, payload.imageBase64, payload.mimeType || "image/jpeg", payload.fileName || (planId + ".jpg"));
  } else if (payload.photoUrl !== undefined && String(payload.photoUrl).indexOf("http") === 0) {
    photoUrl = String(payload.photoUrl).trim();
  }

  const completed = parseBool_(payload.completed);
  const anecdote = payload.anecdote !== undefined ? String(payload.anecdote) : String(currentRow[8] || "");
  const updatedAt = new Date().toISOString();

  sheet.getRange(targetRowIndex, 8, 1, 4).setValues([[completed, anecdote, photoUrl, updatedAt]]);
  SpreadsheetApp.flush();

  const updatedPlan = {
    id: String(currentRow[0]), title: String(currentRow[1]), category: String(currentRow[2]),
    weather: String(currentRow[3]), energy: String(currentRow[4]), emoji: String(currentRow[5]),
    isVip: parseBool_(currentRow[6]), completed: completed, anecdote: anecdote, photoUrl: photoUrl, updatedAt: updatedAt
  };
  return { status: "ok", photoUrl: photoUrl, plan: updatedPlan };
}

/** Inserta una nueva fila en `"Planes"` verificando idempotencia por `id`. */
function handleAddPlan_(sheet, payload) {
  const nowIso = new Date().toISOString();
  const id = String(payload.id || ("plan-" + Date.now())).trim();
  const existing = readSheetRecords_(sheet, HEADERS_.PLANES);
  for (let i = 0; i < existing.length; i++) {
    if (String(existing[i].id) === id) return { status: "ok", plan: normalizePlanRecord_(existing[i]) };
  }

  const plan = {
    id: id,
    title: String(payload.title || "Nuevo Plan").trim(),
    category: String(payload.category || "Relax").trim(),
    weather: String(payload.weather || "☀️").trim(),
    energy: String(payload.energy || "🔋🔋").trim(),
    emoji: String(payload.emoji || "✨").trim(),
    isVip: parseBool_(payload.isVip),
    completed: parseBool_(payload.completed),
    anecdote: String(payload.anecdote || ""),
    photoUrl: String(payload.photoUrl || ""),
    updatedAt: nowIso
  };
  sheet.appendRow([plan.id, plan.title, plan.category, plan.weather, plan.energy, plan.emoji, plan.isVip, plan.completed, plan.anecdote, plan.photoUrl, plan.updatedAt]);
  SpreadsheetApp.flush();
  return { status: "ok", plan: plan };
}

/** Decodifica `payload.imageBase64`, la almacena en `"Fotos_Mural"` y registra la fila en `"Mural"`. */
function handleAddMuralPhoto_(sheet, payload) {
  const id = String(payload.id || ("mural-" + Date.now())).trim();
  const caption = String(payload.caption || "").trim();
  const createdAt = String(payload.createdAt || new Date().toISOString()).trim();
  let photoUrl = String(payload.photoUrl || "").trim();
  if (payload.imageBase64 && String(payload.imageBase64).trim() !== "") {
    photoUrl = saveImageToSubfolder_(SUBFOLDERS.MURAL, payload.imageBase64, payload.mimeType || "image/jpeg", payload.fileName || (id + ".jpg"));
  }
  const item = { id: id, caption: caption, photoUrl: photoUrl, createdAt: createdAt };
  sheet.appendRow([item.id, item.caption, item.photoUrl, item.createdAt]);
  SpreadsheetApp.flush();
  return { status: "ok", photoUrl: photoUrl, item: item };
}

/* ==========================================================================
   4. GESTIÓN DE GOOGLE DRIVE Y GOOGLE SHEETS (HELPERS PRIVADOS)
   ========================================================================== */

/**
 * Limpia el prefijo DataURL si existe, decodifica el Base64 a Blob, guarda el
 * archivo en la subcarpeta de Drive, aplica `ANYONE_WITH_LINK` y construye la URL HD.
 */
function saveImageToSubfolder_(subfolderName, rawBase64, mimeType, fileName) {
  let cleanBase64 = String(rawBase64 || "").trim();
  let effectiveMime = String(mimeType || "image/jpeg").trim();
  if (cleanBase64.indexOf(",") !== -1) {
    const parts = cleanBase64.split(",");
    const match = parts[0].match(/^data:(image\/[a-zA-Z0-9.+-]+);base64$/i);
    if (match && match[1]) effectiveMime = match[1].toLowerCase();
    cleanBase64 = parts.slice(1).join(",");
  }
  const bytes = Utilities.base64Decode(cleanBase64.replace(/\s/g, ""));
  const blob = Utilities.newBlob(bytes, effectiveMime, fileName || ("foto_" + Date.now() + ".jpg"));
  const rootFolder = getOrCreateRootFolder_();
  const targetFolder = getOrCreateSubfolder_(rootFolder, subfolderName);
  const file = targetFolder.createFile(blob);
  const fileId = file.getId();
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    try { file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW); } catch (ignore) {}
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
}

/** Resuelve la carpeta raíz en Drive usando `ROOT_FOLDER_ID` o creando `"Bitacora_Mango_Primavera_Media"`. */
function getOrCreateRootFolder_() {
  const configured = String(ROOT_FOLDER_ID || "").trim();
  if (configured && configured !== "TU_DRIVE_FOLDER_ID_AQUI") return DriveApp.getFolderById(configured);
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

/** Obtiene o crea una subcarpeta (`"Fotos_Planes"` o `"Fotos_Mural"`) dentro de la carpeta raíz. */
function getOrCreateSubfolder_(rootFolder, subfolderName) {
  const it = rootFolder.getFoldersByName(subfolderName);
  while (it.hasNext()) { const sub = it.next(); if (!sub.isTrashed()) return sub; }
  return rootFolder.createFolder(subfolderName);
}

/** Resuelve el Spreadsheet usando `SPREADSHEET_ID`, la hoja activa o creando `"BD_Bitacora_Palito_Mango_Primavera"`. */
function resolveSpreadsheet_() {
  const configured = String(SPREADSHEET_ID || "").trim();
  if (configured && configured !== "TU_SPREADSHEET_ID_AQUI") return SpreadsheetApp.openById(configured);
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

/** Transforma las filas de una pestaña de Google Sheets en objetos JSON mapeados por `headers`. */
function readSheetRecords_(sheet, headers) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getDataRange().getValues();
  const result = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0] && !row[1]) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const val = row[c];
      obj[headers[c]] = (val instanceof Date) ? val.toISOString() : (val !== undefined && val !== null ? val : "");
    }
    result.push(obj);
  }
  return result;
}

/** Normaliza los campos de un plan garantizando booleanos reales en `isVip` y `completed`. */
function normalizePlanRecord_(raw) {
  return {
    id: String(raw.id || ""), title: String(raw.title || ""), category: String(raw.category || "Relax"),
    weather: String(raw.weather || "☀️"), energy: String(raw.energy || "🔋"), emoji: String(raw.emoji || "✨"),
    isVip: parseBool_(raw.isVip), completed: parseBool_(raw.completed), anecdote: String(raw.anecdote || ""),
    photoUrl: String(raw.photoUrl || ""), updatedAt: String(raw.updatedAt || "")
  };
}

/** Convierte valores de celda o JSON (`true`, `"TRUE"`, `"true"`, `1`) en booleano estricto. */
function parseBool_(val) {
  if (typeof val === "boolean") return val;
  const s = String(val || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "si" || s === "sí";
}

/** Empaqueta un objeto en respuesta JSON de Google Apps Script (`ContentService.MimeType.JSON`). */
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
