const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const qrcode = require('qrcode-generator');
const { buildStencil } = require('./stencil');
const { buildRound } = require('./roundqr');
const { cleanPage, cleanSettings } = require('./lib/site');
const ev = require('./lib/events');
const { writeZip } = require('./lib/zip');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const DATA_FILE = path.join(DATA_DIR, 'experiences.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cambiame';

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const load = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).map(normalize);
const loadSettings = () => {
  try { return cleanSettings(JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))); } catch (e) { return cleanSettings({}); }
};
const readEvents = () => (fs.existsSync(EVENTS_FILE) ? ev.parseLines(fs.readFileSync(EVENTS_FILE, 'utf8')) : []);
const expNames = () => Object.fromEntries(load().map((e) => [e.id, e.name]));
const save = (list) => fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));

// Protección simple con contraseña para el editor y la API de escritura
function auth(req, res, next) {
  const [type, b64] = (req.headers.authorization || '').split(' ');
  if (type === 'Basic' && b64) {
    const pass = Buffer.from(b64, 'base64').toString().split(':').slice(1).join(':');
    const a = Buffer.from(pass), b = Buffer.from(ADMIN_PASSWORD);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Editor"').status(401).send('Se requiere contraseña');
}

const ALLOWED = ['.mind', '.mp4', '.mov', '.webm', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp3', '.m4a', '.ogg'];
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext);
    }
  }),
  fileFilter: (req, file, cb) =>
    cb(null, ALLOWED.includes(path.extname(file.originalname).toLowerCase())),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Convierte experiencias antiguas (un video + textos) al formato de elementos
function normalize(e) {
  if (!Array.isArray(e.elements)) {
    e.elements = [];
    if (e.videoSrc) e.elements.push({ type: 'video', src: e.videoSrc, texts: {} });
    if (e.texts && Object.keys(e.texts).length) e.elements.push({ type: 'text', src: '', texts: e.texts });
  }
  e.page = cleanPage(e.page);
  return e;
}
const cleanLayer = (l = {}) => ({
  start: Math.max(0, Number(l.start) || 0),
  duration: Math.max(0, Number(l.duration) || 0),
  texts: typeof l.texts === 'object' && l.texts ? l.texts : {}
});
const cleanEl = (x = {}) => ({
  type: ['video', 'image', 'text'].includes(x.type) ? x.type : 'text',
  src: String(x.src || ''),
  srcAlt: String(x.srcAlt || ''),
  audioSrc: String(x.audioSrc || ''),
  duration: Math.max(0, Number(x.duration) || 0),
  layers: (Array.isArray(x.layers) ? x.layers : []).slice(0, 20).map(cleanLayer),
  texts: typeof x.texts === 'object' && x.texts ? x.texts : {}
});
const clean = (b = {}) => ({
  name: String(b.name || 'Sin nombre').slice(0, 100),
  targetSrc: String(b.targetSrc || ''),
  silhouetteSrc: String(b.silhouetteSrc || ''),
  elements: (Array.isArray(b.elements) ? b.elements : []).slice(0, 30).map(cleanEl),
  page: cleanPage(b.page)
});

app.use(express.json({ limit: '1mb' }));

app.get('/api/experiences', (req, res) => res.json(load()));

app.post('/api/experiences', auth, (req, res) => {
  const list = load();
  const exp = { id: 'exp-' + Date.now().toString(36), ...clean(req.body) };
  list.push(exp); save(list); res.json(exp);
});

app.put('/api/experiences/:id', auth, (req, res) => {
  const list = load();
  const i = list.findIndex(e => e.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'No existe' });
  list[i] = { id: list[i].id, ...clean(req.body) };
  save(list); res.json(list[i]);
});

app.delete('/api/experiences/:id', auth, (req, res) => {
  save(load().filter(e => e.id !== req.params.id));
  res.json({ ok: true });
});

app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('Archivo no permitido');
  res.json({ url: '/uploads/' + req.file.filename });
});

// QR para el editor: stencil (cuadrado, para pintar) o redondo (vinilo impreso)
app.get('/api/qr.svg', auth, (req, res) => {
  const url = String(req.query.url || '');
  if (!/^https?:\/\//i.test(url) || url.length > 300) return res.status(400).send('URL no válida');
  const num = (v, d, lo, hi) => Math.min(hi, Math.max(lo, Number(v) || d));
  const hex = (v, d) => (/^#?[0-9a-f]{6}$/i.test(String(v || '')) ? '#' + String(v).replace('#', '') : d);
  const ecc = ['M', 'Q', 'H'].includes(req.query.ecc) ? req.query.ecc : 'H';
  const qr = qrcode(0, ecc); qr.addData(url); qr.make();
  const n = qr.getModuleCount();
  const dark = (row, col) => qr.isDark(row, col);
  if (req.query.mode === 'round') {
    const r = buildRound(dark, n, {
      sizeCm: num(req.query.size, 60, 10, 300), fg: hex(req.query.fg, '#12263a'), ring: hex(req.query.ringColor, '#0b6fb3'),
      showRing: req.query.showRing !== '0', filler: req.query.filler !== '0', seed: url
    });
    res.set({ 'X-QR-Modules': String(n), 'X-QR-Module-Cm': r.moduleCm.toFixed(2), 'X-QR-Side-Cm': r.qrSideCm.toFixed(1) });
    return res.type('image/svg+xml').send(r.svg);
  }
  const sizeCm = num(req.query.size, 40, 5, 300);
  const r = buildStencil(dark, n, { sizeCm, bridge: num(req.query.bridge, 0.3, 0.15, 0.5) });
  res.set({ 'X-QR-Modules': String(n), 'X-QR-Bridges': String(r.bridges), 'X-QR-Connected': String(r.connected),
            'X-QR-Module-Cm': (sizeCm / n).toFixed(2), 'X-QR-Side-Cm': String(sizeCm) });
  res.type('image/svg+xml').send(r.svg);
});

// ---- Canal página: datos públicos del sitio (ajustes y puntos publicados en el hub)
app.get('/api/site', (req, res) => {
  const points = load().filter((e) => e.page.show).map((e) => ({ id: e.id, name: e.name, page: e.page }));
  res.json({ settings: loadSettings(), points });
});
app.put('/api/settings', auth, (req, res) => {
  const s = cleanSettings(req.body);
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
  res.json(s);
});

// ---- Medición anónima (sin IP ni cookies; la IP solo se usa en memoria para limitar abusos)
const hits = new Map();
const limited = (ip) => {
  const now = Date.now();
  let h = hits.get(ip);
  if (!h || now - h.t0 > 60000) { h = { t0: now, n: 0 }; hits.set(ip, h); }
  return ++h.n > 300;
};
setInterval(() => { const now = Date.now(); for (const [k, h] of hits) if (now - h.t0 > 120000) hits.delete(k); }, 300000).unref();

app.post('/api/event', (req, res) => {
  if (limited(req.ip)) return res.status(429).end();
  const rec = ev.makeRecord(req.body, req.headers['user-agent'], new Date().toISOString());
  if (!rec) return res.status(400).end();
  try {
    if (fs.existsSync(EVENTS_FILE) && fs.statSync(EVENTS_FILE).size > 50 * 1024 * 1024) return res.status(507).end();
    fs.appendFileSync(EVENTS_FILE, JSON.stringify(rec) + '\n');
  } catch (e) { return res.status(500).end(); }
  res.status(204).end();
});
app.get('/api/events/summary', auth, (req, res) => res.json(ev.summarize(readEvents(), expNames())));
app.get('/api/events.csv', auth, (req, res) => {
  const csv = ev.toCSV(readEvents(), loadSettings().timezone, expNames());
  res.set({ 'Content-Disposition': 'attachment; filename="mediciones-' + new Date().toISOString().slice(0, 10) + '.csv"' });
  res.type('text/csv; charset=utf-8').send(csv);
});
app.delete('/api/events', auth, (req, res) => {
  if (req.query.confirm !== 'BORRAR') return res.status(400).send('Falta la confirmación');
  if (fs.existsSync(EVENTS_FILE)) fs.unlinkSync(EVENTS_FILE);
  res.json({ ok: true });
});

// ---- Respaldo: datos y archivos subidos en un solo .zip
app.get('/api/backup.zip', auth, async (req, res) => {
  const files = [];
  for (const f of [DATA_FILE, SETTINGS_FILE, EVENTS_FILE]) if (fs.existsSync(f)) files.push({ name: 'datos/' + path.basename(f), path: f });
  for (const n of fs.readdirSync(UPLOAD_DIR)) {
    const p = path.join(UPLOAD_DIR, n);
    if (fs.statSync(p).isFile()) files.push({ name: 'archivos/' + n, path: p });
  }
  res.set({ 'Content-Disposition': 'attachment; filename="respaldo-' + new Date().toISOString().slice(0, 10) + '.zip"' });
  res.type('application/zip');
  try { await writeZip(res, files); } catch (e) { res.destroy(e); }
});

// ---- Páginas del hub (direcciones limpias)
const page = (n) => (req, res) => res.sendFile(path.join(__dirname, 'public', n + '.html'));
app.get('/hub', page('hub'));
app.get('/privacidad', page('privacidad'));
app.get('/punto', page('punto'));

app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/admin', auth, express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log('Servidor listo en el puerto ' + PORT));
