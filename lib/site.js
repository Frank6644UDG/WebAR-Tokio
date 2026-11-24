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

// Un paso de la guía de uso
const cleanGuideStep = (g = {}) => ({
  img: upl(g.img),
  title: langObj(g.title, 120),
  text: langObj(g.text, 600)
});

const cleanIframe = (v) => {
  if (!v) return '';
  const s = String(v).trim();
  const m = s.match(/src=["'](https:\/\/[^"']+)["']/i);
  if (m) return m[1];
  if (/^https:\/\//i.test(s)) return s;
  return s.slice(0, 1000);
};

// Un elemento de FAQ
const cleanFaqItem = (f = {}) => ({
  q: langObj(f.q, 250),
  a: langObj(f.a, 2500)
});

const FONTS = ['Noto Sans', 'Montserrat', 'Poppins', 'Roboto', 'Lato', 'Playfair Display', 'Merriweather', 'Oswald'];
const cleanSettings = (b = {}) => ({
  siteSlug: typeof b.siteSlug === 'string' && b.siteSlug.trim() ? b.siteSlug.trim().slice(0, 120) : 'Cocula, Cuna del Mariachi',
  headerImage: upl(b.headerImage),
  logo: upl(b.logo),
  footerLogo: upl(b.footerLogo),
  headerBg: hexOr(b.headerBg, '#000000'),
  headerColor: hexOr(b.headerColor, '#ffffff'),
  accent: hexOr(b.accent, '#0b6fb3'),
  ctaBg: hexOr(b.ctaBg, hexOr(b.accent, '#0b6fb3')),
  ctaColor: hexOr(b.ctaColor, '#ffffff'),
  secBg: hexOr(b.secBg, '#ffffff'),
  secColor: hexOr(b.secColor, hexOr(b.ctaBg, '#0b6fb3')),
  arCtaBg: hexOr(b.arCtaBg, hexOr(b.ctaBg, '#ff4d6d')),
  arCtaColor: hexOr(b.arCtaColor, '#ffffff'),
  arSecBg: hexOr(b.arSecBg, '#2a2f3b'),
  arSecColor: hexOr(b.arSecColor, '#ffffff'),
  fontFamily: oneOf(b.fontFamily, FONTS, 'Noto Sans'),
  bgColor: hexOr(b.bgColor, '#eef1f6'),
  bgMobile: upl(b.bgMobile),
  bgDesktop: upl(b.bgDesktop),
  fxMobile: oneOf(b.fxMobile, ['ninguno', 'estatico'], 'estatico'),
  fxDesktop: oneOf(b.fxDesktop, ['ninguno', 'estatico', 'parallax'], 'parallax'),
  timezone: validTz(b.timezone) ? b.timezone : DEFAULT_TZ,
  hubTitle: langObj(b.hubTitle, 120),
  hubIntro: langObj(b.hubIntro, 600),
  guideTitle: langObj(b.guideTitle, 150),
  guideSteps: [0, 1, 2].map((i) => cleanGuideStep((Array.isArray(b.guideSteps) ? b.guideSteps : [])[i])),
  mapTitle: langObj(b.mapTitle, 150),
  mapIframe: cleanIframe(b.mapIframe),
  hubClosing: langObj(b.hubClosing, 1000),
  faqTitle: langObj(b.faqTitle, 150),
  faqList: (Array.isArray(b.faqList) ? b.faqList : []).slice(0, 30).map(cleanFaqItem),
  privacy: langObj(b.privacy, 8000)
});

module.exports = { LANGS, cleanPage, cleanSettings, validTz, DEFAULT_TZ };
