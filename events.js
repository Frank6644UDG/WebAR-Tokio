// Medición anónima: validación de avisos, resumen y exportación a CSV.
// No se guarda la IP ni el texto completo del navegador: solo un resumen (sistema y navegador).
const LANGS = ['es', 'en', 'ja', 'zh', 'ko'];
const EVENTS = new Set(['abre', 'camara_ok', 'camara_no', 'modo', 'silueta', 'objetivo', 'objetivo_perdido',
  'sin_reconocer', 'escena', 'completa', 'cierra', 'leer_mas', 'al_hub', 'repetir', 'idioma', 'privacidad', 'error', 'pagina']);

function parseUA(ua = '') {
  let so = 'Otro', m;
  if (/iPhone|iPad|iPod/.test(ua)) { m = ua.match(/OS (\d+)[_\d]*/); so = 'iOS' + (m ? ' ' + m[1] : ''); }
  else if ((m = ua.match(/Android (\d+)/))) so = 'Android ' + m[1];
  else if (/Windows/.test(ua)) so = 'Windows';
  else if (/Mac OS X/.test(ua)) so = 'macOS';
  else if (/Linux/.test(ua)) so = 'Linux';
  let nav = 'Otro';
  if (/SamsungBrowser/.test(ua)) nav = 'Samsung Internet';
  else if (/EdgA|EdgiOS|Edg\//.test(ua)) nav = 'Edge';
  else if (/FxiOS|Firefox/.test(ua)) nav = 'Firefox';
  else if (/OPR\/|Opera/.test(ua)) nav = 'Opera';
  else if (/CriOS|Chrome/.test(ua)) nav = 'Chrome';
  else if (/Safari/.test(ua)) nav = 'Safari';
  return { so, nav };
}

function makeRecord(b, ua, nowIso) {
  if (!b || typeof b !== 'object' || !EVENTS.has(b.ev)) return null;
  const v = String(b.v || ''), e = String(b.e || ''), s = String(b.s || '');
  if (!/^[\w-]{4,40}$/.test(v) || !/^[\w-]{0,40}$/.test(e) || !/^[\w-]{0,20}$/.test(s)) return null;
  const tc = Number(b.tc), now = Date.parse(nowIso);
  const okT = isFinite(tc) && Math.abs(tc - now) < 7 * 864e5;
  const n = b.n === undefined || b.n === null || b.n === '' ? null : Number(b.n);
  const u = parseUA(ua);
  return {
    ts: nowIso, tc: okT ? new Date(tc).toISOString() : null, v, ev: b.ev,
    ch: b.ch === 'pagina' ? 'pagina' : 'experiencia', e, s,
    lang: LANGS.includes(b.lang) ? b.lang : '',
    d: String(b.d == null ? '' : b.d).replace(/[\u0000-\u001f]/g, ' ').slice(0, 60),
    n: n !== null && isFinite(n) ? n : null, so: u.so, nav: u.nav
  };
}

function parseLines(text) {
  const out = [];
  for (const line of String(text || '').split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch (e) { /* línea dañada: se omite */ }
  }
  return out;
}

function fmtLocal(iso, tz) {
  if (!iso) return '';
  const f = new Intl.DateTimeFormat('sv-SE', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return f.format(new Date(iso));
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

function toCSV(rs, tz, names = {}) {
  const head = ['fecha_hora_utc', 'fecha_hora_local', 'fecha_hora_telefono_utc', 'visita', 'canal', 'evento',
    'experiencia_id', 'experiencia', 'origen', 'idioma', 'detalle', 'numero', 'so', 'navegador'];
  const rows = rs.map((r) => [r.ts, fmtLocal(r.ts, tz), r.tc || '', r.v, r.ch, r.ev, r.e, names[r.e] || '', r.s, r.lang, r.d, r.n, r.so, r.nav]);
  return '\ufeff' + [head, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

function summarize(rs, names = {}) {
  const per = {}, org = {}, pages = {};
  const mk = () => ({ aperturas: new Set(), camara_ok: new Set(), camara_no: new Set(), fija: new Set(), sigue: new Set(),
    objetivo: new Set(), sin_reconocer: new Set(), completa: new Set(), al_hub: new Set(), error: new Set(), ms: [] });
  const get = (o, k) => (o[k] = o[k] || mk());
  for (const r of rs) {
    if (r.ch === 'pagina') { const p = r.d || 'otra'; (pages[p] = pages[p] || new Set()).add(r.v); continue; }
    for (const b of [get(per, r.e || '(sin id)'), get(org, r.s || '(sin origen)')]) {
      if (r.ev === 'abre') b.aperturas.add(r.v);
      else if (r.ev === 'camara_ok') b.camara_ok.add(r.v);
      else if (r.ev === 'camara_no') b.camara_no.add(r.v);
      else if (r.ev === 'modo') (r.d === 'fija' ? b.fija : b.sigue).add(r.v);
      else if (r.ev === 'objetivo') { b.objetivo.add(r.v); if (r.n != null) b.ms.push(r.n); }
      else if (r.ev === 'sin_reconocer') b.sin_reconocer.add(r.v);
      else if (r.ev === 'completa') b.completa.add(r.v);
      else if (r.ev === 'al_hub') b.al_hub.add(r.v);
      else if (r.ev === 'error') b.error.add(r.v);
    }
  }
  const out = (o, label) => Object.entries(o).map(([k, b]) => ({
    clave: k, nombre: label ? label(k) : k, aperturas: b.aperturas.size, camara_ok: b.camara_ok.size, camara_no: b.camara_no.size,
    fija: b.fija.size, sigue: b.sigue.size, objetivo: b.objetivo.size, sin_reconocer: b.sin_reconocer.size,
    completa: b.completa.size, al_hub: b.al_hub.size, error: b.error.size, mediana_ms: median(b.ms)
  }));
  return {
    total: rs.length, desde: rs.length ? rs[0].ts : null, hasta: rs.length ? rs[rs.length - 1].ts : null,
    porExperiencia: out(per, (k) => names[k] || k), porOrigen: out(org),
    paginas: Object.entries(pages).map(([k, s]) => ({ pagina: k, visitas: s.size }))
  };
}

module.exports = { EVENTS, parseUA, makeRecord, parseLines, toCSV, summarize, fmtLocal };
