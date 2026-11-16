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

const hexOr = (v, d) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : d);
const oneOf = (v, list, d) => (list.includes(v) ? v : d);

// Un bloque de la página: imagen, texto alternativo, título y texto por idioma
const cleanBlock = (b = {}) => ({ img: upl(b.img), alt: langObj(b.alt, 200), title: langObj(b.title, 120), text: langObj(b.text, 3000) });

// Contenido propio de la página de cada punto (canal página); todo es opcional.
// Composición fija: banner, 3 bloques de imagen y texto, video y cierre.
const cleanPage = (p = {}) => ({
  show: !!p.show,
  title: langObj(p.title, 120),
  short: langObj(p.short, 300),
  long: langObj(p.long, 6000),          // se conserva por compatibilidad con la 0.7.0
  closing: langObj(p.closing, 6000),
  hint: langObj(p.hint, 400),
  photo: upl(p.photo),                  // foto de la tarjeta del hub (si falta, se usa el banner)
  banner: upl(p.banner),
  bannerAlt: langObj(p.bannerAlt, 200),
  blocks: [0, 1, 2].map((i) => cleanBlock((Array.isArray(p.blocks) ? p.blocks : [])[i])),
  video: upl(p.video),
  videoPoster: upl(p.videoPoster),
  audio: upl(p.audio),
  lat: coord(p.lat, 90),
  lng: coord(p.lng, 180)
});

const cleanSettings = (b = {}) => ({
  headerImage: upl(b.headerImage),
  logo: upl(b.logo),
  accent: hexOr(b.accent, '#0b6fb3'),
  bgColor: hexOr(b.bgColor, '#eef1f6'),
  bgMobile: upl(b.bgMobile),
  bgDesktop: upl(b.bgDesktop),
  fxMobile: oneOf(b.fxMobile, ['ninguno', 'estatico'], 'estatico'),
  fxDesktop: oneOf(b.fxDesktop, ['ninguno', 'estatico', 'parallax'], 'parallax'),
  timezone: validTz(b.timezone) ? b.timezone : DEFAULT_TZ,
  hubTitle: langObj(b.hubTitle, 120),
  hubIntro: langObj(b.hubIntro, 600),
  privacy: langObj(b.privacy, 8000)
});

module.exports = { LANGS, cleanPage, cleanSettings, validTz, DEFAULT_TZ };
