// Limpieza (sanitización) de los datos que vienen del editor: página del punto y ajustes del sitio.
const LANGS = ['es', 'en', 'ja', 'zh', 'ko'];
const DEFAULT_TZ = 'America/Mexico_City';

const upl = (v) => (/^\/uploads\/[\w.-]+$/.test(String(v || '')) ? String(v) : '');
const langObj = (o, max) => {
  const r = {};
  for (const k of LANGS) r[k] = String((o && o[k]) || '').slice(0, max);
  return r;
};
const coord = (v, lim) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isFinite(n) && Math.abs(n) <= lim ? n : null;
};
const validTz = (tz) => {
  if (typeof tz !== 'string' || !tz) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch (e) { return false; }
};

// Contenido propio de la página de cada punto (canal página); todo es opcional
const cleanPage = (p = {}) => ({
  show: !!p.show,
  title: langObj(p.title, 120),
  short: langObj(p.short, 300),
  long: langObj(p.long, 6000),
  hint: langObj(p.hint, 400),
  photo: upl(p.photo),
  audio: upl(p.audio),
  lat: coord(p.lat, 90),
  lng: coord(p.lng, 180)
});

const cleanSettings = (b = {}) => ({
  headerImage: upl(b.headerImage),
  logo: upl(b.logo),
  accent: /^#[0-9a-f]{6}$/i.test(b.accent || '') ? b.accent : '#0b6fb3',
  timezone: validTz(b.timezone) ? b.timezone : DEFAULT_TZ,
  hubTitle: langObj(b.hubTitle, 120),
  hubIntro: langObj(b.hubIntro, 600),
  privacy: langObj(b.privacy, 8000)
});

module.exports = { LANGS, cleanPage, cleanSettings, validTz, DEFAULT_TZ };
