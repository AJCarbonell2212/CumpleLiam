/**
 * Backend del RSVP — Primer cumpleaños de Liam
 * Pega este código en Extensiones > Apps Script de tu Google Sheet.
 * Cambia ADMIN_KEY por una clave tuya antes de implementar.
 */
const ADMIN_KEY = 'CAMBIA-ESTA-CLAVE';

const SHEET_RSVP = 'Confirmaciones';
const SHEET_GUESTS = 'Invitados';
const RSVP_HEADERS = ['Fecha', 'Nombre', 'Asistirá', 'Adultos', 'Niños', 'Teléfono', 'Mensaje', 'ID invitado', 'Nombre en enlace'];
const GUEST_HEADERS = ['ID', 'Nombre', 'Teléfono', 'Creado'];

function doGet() {
  return json_({ ok: true, msg: 'RSVP de Liam activo' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (d.action) {
      case 'rsvp': return json_(saveRsvp_(d));
      case 'list': requireKey_(d); return json_(list_());
      case 'addGuest': requireKey_(d); return json_(addGuest_(d));
      case 'deleteGuest': requireKey_(d); return json_(deleteGuest_(d));
      default: return json_({ ok: false, error: 'Acción desconocida' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function saveRsvp_(d) {
  const nombre = clean_(d.nombre, 80);
  if (!nombre) return { ok: false, error: 'Falta el nombre' };
  const asiste = d.asiste === true || d.asiste === 'si';
  sheet_(SHEET_RSVP, RSVP_HEADERS).appendRow([
    new Date(), nombre, asiste ? 'Sí' : 'No',
    asiste ? num_(d.adultos) : 0, asiste ? num_(d.ninos) : 0,
    clean_(d.telefono, 30), clean_(d.mensaje, 500),
    clean_(d.invitadoId, 20), clean_(d.invitado, 80)
  ]);
  return { ok: true };
}

function list_() {
  const rsvps = rows_(SHEET_RSVP, RSVP_HEADERS).map(function (r) {
    return {
      fecha: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      nombre: r[1], asiste: r[2], adultos: r[3], ninos: r[4],
      telefono: r[5], mensaje: r[6], invitadoId: r[7], invitado: r[8]
    };
  });
  const guests = rows_(SHEET_GUESTS, GUEST_HEADERS).map(function (r) {
    return { id: String(r[0]), nombre: r[1], telefono: String(r[2]), creado: r[3] instanceof Date ? r[3].toISOString() : String(r[3]) };
  });
  return { ok: true, rsvps: rsvps, guests: guests };
}

function addGuest_(d) {
  const nombre = clean_(d.nombre, 80);
  if (!nombre) return { ok: false, error: 'Falta el nombre' };
  const id = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  const tel = String(d.telefono || '').replace(/[^0-9]/g, '').slice(0, 15);
  sheet_(SHEET_GUESTS, GUEST_HEADERS).appendRow([id, nombre, tel ? "'" + tel : '', new Date()]);
  return { ok: true, id: id };
}

function deleteGuest_(d) {
  const sh = sheet_(SHEET_GUESTS, GUEST_HEADERS);
  const values = sh.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]) === String(d.id)) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: false, error: 'Invitado no encontrado' };
}

function requireKey_(d) {
  if (ADMIN_KEY === 'CAMBIA-ESTA-CLAVE') throw new Error('Configura ADMIN_KEY en Apps Script');
  if (d.key !== ADMIN_KEY) throw new Error('Clave incorrecta');
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

function rows_(name, headers) {
  const v = sheet_(name, headers).getDataRange().getValues();
  return v.slice(1).filter(function (r) { return r.join('') !== ''; });
}

// Evita que un texto se interprete como fórmula en la hoja
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function num_(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : Math.max(0, Math.min(n, 30));
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
