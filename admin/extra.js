// Ampliaciones del editor (0.7.0): página del punto, ajustes del sitio y medición.
// Se carga antes del script principal; usa sus variables (cur, tab, view, LANGS, $, esc, api, status, render, sync) solo al ejecutarse.

// Recomendaciones de cada hueco de imagen (cámbialas aquí si ajustas el diseño)
const SPECS = {
  banner: { ratio: null, rec: '1080×600 px (móvil) o 1920×700 px (escritorio)', maxKB: 300 },
  block: { ratio: 4 / 3, rec: '1000×750', maxKB: 200 },
  photo: { ratio: 16 / 9, rec: '1200×675', maxKB: 200 },
  poster: { ratio: 16 / 9, rec: '1280×720', maxKB: 200 },
  headerImage: { ratio: null, rec: '1080×600 px (móvil) o 1920×700 px (escritorio)', maxKB: 300 },
  bgMobile: { ratio: 9 / 16, rec: '1080×1920', maxKB: 400 },
  bgDesktop: { ratio: 16 / 9, rec: '1920×1080', maxKB: 500 },
  logo: { ratio: null, rec: 'PNG o WebP con fondo transparente, 80 px de alto', maxKB: 100 },
  footerLogo: { ratio: null, rec: 'PNG o WebP con fondo transparente, 60-80 px de alto', maxKB: 100 },
  guideStep: { ratio: 16 / 9, rec: '1200×675 px', maxKB: 200 }
};
function imgDims(f) {
  return new Promise(res => {
    const u = URL.createObjectURL(f), i = new Image();
    i.onload = () => { URL.revokeObjectURL(u); res({ w: i.naturalWidth, h: i.naturalHeight }); };
    i.onerror = () => { URL.revokeObjectURL(u); res(null); };
    i.src = u;
  });
}
// Avisos al subir una imagen: peso, proporción, tamaño y formato (devuelve texto, nunca bloquea la subida)
async function slotWarn(inp) {
  const f = inp.files[0];
  if (!f || !/^image/.test(f.type)) return '';
  const key = inp.dataset.site || (inp.dataset.pgb !== undefined ? 'block' : ({ banner: 'banner', photo: 'photo', videoPoster: 'poster' })[inp.dataset.pg]);
  const sp = SPECS[key], w = [];
  const max = sp ? sp.maxKB : 1500;
  if (f.size > max * 1024) w.push(`pesa ${Math.round(f.size / 1024)} KB (recomendado: menos de ${max} KB)`);
  if (sp && sp.ratio) {
    const d = await imgDims(f);
    if (d) {
      if (Math.abs(d.w / d.h - sp.ratio) / sp.ratio > 0.2) w.push(`tiene una proporción (${d.w}×${d.h}) muy distinta a la recomendada (${sp.rec}) y se recortará`);
      if (d.w < 0.6 * parseInt(sp.rec, 10)) w.push(`es pequeña (${d.w} px de ancho) y puede verse borrosa`);
    }
  }
  if (key !== 'logo' && f.type !== 'image/webp') w.push('no es WebP, el formato recomendado');
  return w.length ? ' Aviso: la imagen ' + w.join('; ') + '.' : '';
}

function emptyPage() {
  const l = () => ({ es: '', en: '', ja: '', zh: '', ko: '' });
  const blk = () => ({ img: '', alt: l(), title: l(), text: l() });
  return { show: false, title: l(), short: l(), long: l(), closing: l(), hint: l(), photo: '', banner: '', bannerAlt: l(),
    blocks: [blk(), blk(), blk()], video: '', videoPoster: '', audio: '', lat: null, lng: null };
}

// Archivos ya subidos en esta experiencia, para reutilizarlos en la página sin subirlos otra vez
function allImages() {
  const u = new Set();
  (cur.elements || []).forEach(e => { if (e.type === 'image' && e.src) u.add(e.src); });
  if (cur.silhouetteSrc) u.add(cur.silhouetteSrc);
  const p = cur.page || {};
  [p.banner, p.photo, p.videoPoster, ...((p.blocks || []).map(b => b.img))].forEach(x => x && u.add(x));
  return [...u];
}
function pgOptions(kind) {
  const urls = new Set();
  (cur.elements || []).forEach(el => {
    if (kind === 'audio' && el.audioSrc) urls.add(el.audioSrc);
    if (kind === 'video') [el.src, el.srcAlt].forEach(x => { if (el.type === 'video' && x && /\.(mp4|webm)$/i.test(x)) urls.add(x); });
  });
  return [...urls];
}
function imgSlot(label, spec, a) {
  const sp = SPECS[spec];
  return `<label>${label}${sp ? ` <small style="display:inline">(recomendado: ${sp.rec}, menos de ${sp.maxKB} KB, WebP)</small>` : ''}</label>
    <input type="file" ${a.file} accept="image/*"><small>${esc(a.cur) || 'Sin archivo'}</small>
    ${a.opts.length ? `<select ${a.sel}><option value="">O elige un archivo ya subido…</option>${a.opts.map(u => `<option value="${esc(u)}" ${a.cur === u ? 'selected' : ''}>${esc(u.split('/').pop())}</option>`).join('')}</select>` : ''}
    ${a.cur ? `<button type="button" ${a.clr}>Quitar</button>` : ''}`;
}
function pgFile(k, accept, label) {
  const pg = cur.page, opts = pgOptions(k);
  return `<label>${label}</label>
    <input type="file" data-pg="${k}" accept="${accept}"><small>${esc(pg[k]) || 'Sin archivo'}</small>
    ${opts.length ? `<select data-pgsel="${k}"><option value="">O elige un archivo ya subido en esta experiencia…</option>${opts.map(u => `<option value="${esc(u)}" ${pg[k] === u ? 'selected' : ''}>${esc(u.split('/').pop())}</option>`).join('')}</select>` : ''}
    ${pg[k] ? `<button type="button" data-pgclear="${k}">Quitar</button>` : ''}`;
}

function pageHtml() {
  if (!cur.page) cur.page = emptyPage();
  const pg = cur.page, L = (o) => esc((o && o[tab]) || ''), imgs = allImages();
  const one = (k, spec, label) => imgSlot(label, spec, { file: `data-pg="${k}"`, sel: `data-pgsel="${k}"`, clr: `data-pgclear="${k}"`, cur: pg[k], opts: imgs });
  const bl = (i) => { const b = pg.blocks[i]; return `<fieldset class="sub"><legend>Bloque ${i + 1} (imagen y texto)</legend>
      ${imgSlot('Imagen', 'block', { file: `data-pgb="${i}"`, sel: `data-pgselb="${i}"`, clr: `data-pgclearb="${i}"`, cur: b.img, opts: imgs })}
      <label>Texto alternativo de la imagen (${LANGS[tab]})</label><input type="text" data-bl="${i}.alt" value="${L(b.alt)}">
      <label>Título (${LANGS[tab]})</label><input type="text" data-bl="${i}.title" value="${L(b.title)}">
      <label>Texto (${LANGS[tab]}). Deja una línea en blanco entre párrafos.</label><textarea data-bl="${i}.text" style="min-height:120px">${L(b.text)}</textarea>
      <small>Si el bloque queda vacío (sin imagen, título ni texto), no se muestra en la página.</small></fieldset>`; };
  const coords = pg.lat !== null && pg.lat !== undefined && pg.lng !== null && pg.lng !== undefined ? `${pg.lat}, ${pg.lng}` : '';
  return `<fieldset><legend>Página del punto (canal página)</legend>
    <small>La composición es fija: banner, tres bloques de imagen y texto, video y cierre. Solo cambias imágenes y textos. Los textos son del idioma de la pestaña elegida arriba (${LANGS[tab]}).${cur.id ? ` <a href="/punto?e=${esc(cur.id)}" target="_blank">Ver la página del punto</a>` : ''}</small>
    <label><input type="checkbox" data-pg="show" ${pg.show ? 'checked' : ''}> Mostrar este punto en el hub</label>
    <label>Título (${LANGS[tab]})</label><input type="text" data-pgl="title" value="${L(pg.title)}">
    <label>Subtítulo del banner y descripción de la tarjeta del hub (${LANGS[tab]})</label><input type="text" data-pgl="short" value="${L(pg.short)}">
    ${one('photo', 'photo', 'Foto de la tarjeta del hub (si la dejas vacía se usa el banner)')}
    <fieldset class="sub"><legend>Banner</legend>
      ${one('banner', 'banner', 'Imagen del banner')}
      <label>Texto alternativo del banner (${LANGS[tab]}). Déjalo vacío si es solo decorativo.</label><input type="text" data-pgl="bannerAlt" value="${L(pg.bannerAlt)}">
    </fieldset>
    ${bl(0)}${bl(1)}${bl(2)}
    <fieldset class="sub"><legend>Video</legend>
      ${pgFile('video', 'video/mp4,video/webm', 'Video (.mp4 o .webm; conviene que pese pocos MB)')}
      ${one('videoPoster', 'poster', 'Imagen de portada del video')}
    </fieldset>
    <fieldset class="sub"><legend>Cierre</legend>
      <label>Texto de cierre (${LANGS[tab]}). Deja una línea en blanco entre párrafos.</label><textarea data-pgl="closing">${L(pg.closing)}</textarea>
      <label>Pista de dónde buscar la señal (${LANGS[tab]})</label><input type="text" data-pgl="hint" value="${L(pg.hint)}">
      ${pgFile('audio', 'audio/*,.mp3,.m4a,.ogg', 'Audio (opcional)')}
      <label>Coordenadas: pega «latitud, longitud» desde Google Maps (clic derecho sobre el lugar)</label>
      <input type="text" data-pg="coords" value="${esc(coords)}" placeholder="20.7, -103.4">
    </fieldset>
  </fieldset>`;
}
function bindPage() {
  const redo = (fn) => (el) => { const h = () => { sync(); fn(el); render(); }; if (el.tagName === 'SELECT') el.onchange = h; else el.onclick = h; };
  document.querySelectorAll('[data-pgsel]').forEach(redo(s => { cur.page[s.dataset.pgsel] = s.value; }));
  document.querySelectorAll('[data-pgselb]').forEach(redo(s => { cur.page.blocks[+s.dataset.pgselb].img = s.value; }));
  document.querySelectorAll('[data-pgclear]').forEach(redo(b => { cur.page[b.dataset.pgclear] = ''; }));
  document.querySelectorAll('[data-pgclearb]').forEach(redo(b => { cur.page.blocks[+b.dataset.pgclearb].img = ''; }));
}
function syncPage() {
  if (!cur || !$('#f_name')) return;
  const pg = cur.page || (cur.page = emptyPage());
  const sh = document.querySelector('[data-pg="show"]'); if (sh) pg.show = sh.checked;
  document.querySelectorAll('[data-pgl]').forEach(i => { const k = i.dataset.pgl; pg[k] = pg[k] || {}; pg[k][tab] = i.value; });
  document.querySelectorAll('[data-bl]').forEach(i => { const [n, k] = i.dataset.bl.split('.'), b = pg.blocks[+n]; b[k] = b[k] || {}; b[k][tab] = i.value; });
  const c = document.querySelector('[data-pg="coords"]');
  if (c) { const m = c.value.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/); pg.lat = m ? +m[1] : null; pg.lng = m ? +m[2] : null; }
}

// ---------------- Ajustes del sitio
let siteData = null, siteTab = 'es', siteSubpage = 'general';
async function loadSite() { siteData = (await api('/api/site')).settings; }
function syncSite() {
  if (!siteData) return;
  if ($('#s_slug')) siteData.siteSlug = $('#s_slug').value.trim();
  if ($('#s_accent')) siteData.accent = $('#s_accent').value;
  if ($('#s_ctaBg')) siteData.ctaBg = $('#s_ctaBg').value;
  if ($('#s_ctaColor')) siteData.ctaColor = $('#s_ctaColor').value;
  if ($('#s_secBg')) siteData.secBg = $('#s_secBg').value;
  if ($('#s_secColor')) siteData.secColor = $('#s_secColor').value;
  if ($('#s_arCtaBg')) siteData.arCtaBg = $('#s_arCtaBg').value;
  if ($('#s_arCtaColor')) siteData.arCtaColor = $('#s_arCtaColor').value;
  if ($('#s_arSecBg')) siteData.arSecBg = $('#s_arSecBg').value;
  if ($('#s_arSecColor')) siteData.arSecColor = $('#s_arSecColor').value;
  if ($('#s_font')) siteData.fontFamily = $('#s_font').value;
  if ($('#s_hbg')) siteData.headerBg = $('#s_hbg').value;
  if ($('#s_hcol')) siteData.headerColor = $('#s_hcol').value;
  if ($('#s_tz')) siteData.timezone = $('#s_tz').value.trim();
  if ($('#s_bg')) siteData.bgColor = $('#s_bg').value;
  if ($('#s_fxm')) siteData.fxMobile = $('#s_fxm').value;
  if ($('#s_fxd')) siteData.fxDesktop = $('#s_fxd').value;
  if ($('#s_mapIframe')) siteData.mapIframe = $('#s_mapIframe').value.trim();

  document.querySelectorAll('[data-sl]').forEach(i => {
    const k = i.dataset.sl; siteData[k] = siteData[k] || {}; siteData[k][siteTab] = i.value;
  });

  siteData.guideSteps = siteData.guideSteps || [{}, {}, {}];
  [0, 1, 2].forEach(i => {
    const st = siteData.guideSteps[i] || (siteData.guideSteps[i] = { img: '', title: {}, text: {} });
    const ti = document.querySelector(`[data-gst="${i}.title"]`);
    if (ti) { st.title = st.title || {}; st.title[siteTab] = ti.value; }
    const tx = document.querySelector(`[data-gst="${i}.text"]`);
    if (tx) { st.text = st.text || {}; st.text[siteTab] = tx.value; }
  });

  siteData.faqList = siteData.faqList || [];
  document.querySelectorAll('[data-faqq]').forEach(inp => {
    const idx = +inp.dataset.faqq;
    siteData.faqList[idx] = siteData.faqList[idx] || { q: {}, a: {} };
    siteData.faqList[idx].q = siteData.faqList[idx].q || {};
    siteData.faqList[idx].q[siteTab] = inp.value;
  });
  document.querySelectorAll('[data-faqa]').forEach(inp => {
    const idx = +inp.dataset.faqa;
    siteData.faqList[idx] = siteData.faqList[idx] || { q: {}, a: {} };
    siteData.faqList[idx].a = siteData.faqList[idx].a || {};
    siteData.faqList[idx].a[siteTab] = inp.value;
  });
}
async function renderSite() {
  if (!siteData) { try { await loadSite(); } catch (e) { $('#main').textContent = 'Error: ' + e.message; return; } }
  const s = siteData, v = (k) => esc((s[k] && s[k][siteTab]) || '');
  const gStepVal = (idx, f) => {
    const st = (s.guideSteps && s.guideSteps[idx]) || {};
    return esc((st[f] && st[f][siteTab]) || '');
  };
  const gStepImg = (idx) => (s.guideSteps && s.guideSteps[idx] && s.guideSteps[idx].img) || '';
  const zones = ['America/Mexico_City', 'America/Monterrey', 'America/Tijuana', 'America/Cancun', 'America/Hermosillo', 'Asia/Tokyo', 'Asia/Seoul', 'America/New_York', 'America/Los_Angeles', 'Europe/Madrid', 'UTC'];
  const img = (k, label) => `<label>${label}${SPECS[k] ? ` <small style="display:inline">(recomendado: ${SPECS[k].rec}, menos de ${SPECS[k].maxKB} KB)</small>` : ''}</label><input type="file" data-site="${k}" accept="image/*"><small>${esc(s[k]) || 'Sin archivo'}</small>${s[k] ? `<button type="button" data-siteclear="${k}">Quitar</button>` : ''}`;
  
  const SUBPAGES = [
    { id: 'general', label: '⚙️ General y Menú', url: '/', desc: 'Colores, logos, cabecera y fondos globales del sitio' },
    { id: 'introduccion', label: '📖 Introducción', url: '/introduccion', desc: 'Página de bienvenida y semblanza de Cocula' },
    { id: 'como-se-usa', label: '🧭 Cómo se usa', url: '/como-se-usa', desc: 'Guía paso a paso para el visitante' },
    { id: 'experiencias', label: '🎭 Experiencias y Mapa', url: '/experiencias', desc: 'Directorio de experiencias, mapa interactivo y frase de cierre' },
    { id: 'faq', label: '❓ FAQ', url: '/faq', desc: 'Preguntas y respuestas frecuentes' },
    { id: 'privacidad', label: '🔒 Privacidad', url: '/privacidad', desc: 'Aviso de privacidad y protección de datos' }
  ];

  const curSub = SUBPAGES.find(p => p.id === siteSubpage) || SUBPAGES[0];

  const guideStepBox = (i) => `
    <fieldset class="sub"><legend>Paso ${i + 1}</legend>
      <label>Imagen del paso (opcional)</label>
      <input type="file" data-guideimg="${i}" accept="image/*"><small>${esc(gStepImg(i)) || 'Sin archivo'}</small>${gStepImg(i) ? `<button type="button" data-guideclear="${i}">Quitar</button>` : ''}
      <label>Título del paso (${LANGS[siteTab]})</label>
      <input type="text" data-gst="${i}.title" value="${gStepVal(i, 'title')}" placeholder="Paso ${i + 1}">
      <label>Texto explicativo (${LANGS[siteTab]})</label>
      <textarea data-gst="${i}.text" style="min-height:70px" placeholder="Instrucciones del paso...">${gStepVal(i, 'text')}</textarea>
    </fieldset>`;

  const langTabs = () => `
    <div style="margin-bottom:14px">
      <small style="display:block;margin-bottom:6px">Idioma actual para editar textos:</small>
      <div class="tabs">${Object.entries(LANGS).map(([k, n]) => `<button type="button" data-st="${k}" class="${k === siteTab ? 'on' : ''}">${n}</button>`).join('')}</div>
    </div>`;

  let subContent = '';

  if (siteSubpage === 'general') {
    subContent = `
      <fieldset><legend>Slug e identidad</legend>
        <label>Slug / Título general del sitio (aparece en la pestaña del navegador)</label>
        <input type="text" id="s_slug" value="${esc(s.siteSlug || 'Cocula, Cuna del Mariachi')}" placeholder="Cocula, Cuna del Mariachi">
        <small>Este texto identifica el sitio en la pestaña del navegador (ej. «Introducción - Cocula, Cuna del Mariachi»). No aparece en la barra superior si ya hay un logo subido.</small>
      </fieldset>
      <fieldset><legend>Imágenes, color y zona horaria</legend>
        ${img('headerImage', 'Imagen del encabezado del hub')}
        ${img('logo', 'Logo del encabezado (opcional)')}
        ${img('footerLogo', 'Logo del pie de página (footer, opcional)')}
        <label>Color de fondo del menú (cabecera fija y pie de página)</label>
        <input type="color" id="s_hbg" value="${esc(s.headerBg || '#000000')}">
        <label>Color de textos e íconos del menú</label>
        <input type="color" id="s_hcol" value="${esc(s.headerColor || '#ffffff')}">
        <label>Tipografía del sitio y visor AR</label>
        <select id="s_font">${['Noto Sans','Montserrat','Poppins','Roboto','Lato','Playfair Display','Merriweather','Oswald'].map(f => `<option value="${f}" ${(s.fontFamily || 'Noto Sans') === f ? 'selected' : ''}>${f}</option>`).join('')}</select>
        <label>Zona horaria de la columna «fecha_hora_local» del CSV</label>
        <input type="text" id="s_tz" list="tzs" value="${esc(s.timezone)}"><datalist id="tzs">${zones.map(z => `<option value="${z}">`).join('')}</datalist>
      </fieldset>
      <fieldset><legend>🎨 Colores de las páginas (Hub, Introducción, Guía, Experiencias, FAQ, Privacidad)</legend>
        <div class="grid">
          <div>
            <label>Color de acento (enlaces y bordes)</label>
            <input type="color" id="s_accent" value="${esc(s.accent)}">
          </div>
          <div>
            <label>Botón principal CTA (fondo)</label>
            <input type="color" id="s_ctaBg" value="${esc(s.ctaBg || s.accent || '#0b6fb3')}">
          </div>
          <div>
            <label>Botón principal CTA (texto)</label>
            <input type="color" id="s_ctaColor" value="${esc(s.ctaColor || '#ffffff')}">
          </div>
        </div>
        <div class="grid2" style="margin-top:8px">
          <div>
            <label>Botón secundario (fondo)</label>
            <input type="color" id="s_secBg" value="${esc(s.secBg || '#ffffff')}">
          </div>
          <div>
            <label>Botón secundario (texto y borde)</label>
            <input type="color" id="s_secColor" value="${esc(s.secColor || s.ctaBg || '#0b6fb3')}">
          </div>
        </div>
      </fieldset>
      <fieldset><legend>📱 Colores de las experiencias AR (visor de cámara)</legend>
        <div class="grid2">
          <div>
            <label>Botón principal CTA (fondo)</label>
            <input type="color" id="s_arCtaBg" value="${esc(s.arCtaBg || s.ctaBg || '#ff4d6d')}">
          </div>
          <div>
            <label>Botón principal CTA (texto)</label>
            <input type="color" id="s_arCtaColor" value="${esc(s.arCtaColor || '#ffffff')}">
          </div>
        </div>
        <div class="grid2" style="margin-top:8px">
          <div>
            <label>Botón secundario / Cerrar (fondo)</label>
            <input type="color" id="s_arSecBg" value="${esc(s.arSecBg || '#2a2f3b')}">
          </div>
          <div>
            <label>Botón secundario / Cerrar (texto)</label>
            <input type="color" id="s_arSecColor" value="${esc(s.arSecColor || '#ffffff')}">
          </div>
        </div>
        <small>Aplica a los botones del visor AR (Permitir cámara, Siguiente, Leer más, Cerrar, Reproducir) y al mockup del teléfono.</small>
      </fieldset>
      <fieldset><legend>Fondo y efecto</legend>
        <small>El fondo va detrás de todo el contenido. En teléfono solo puede ser estático (por ligereza); en escritorio puede tener parallax.</small>
        ${img('bgMobile', 'Imagen de fondo para teléfono (vertical)')}
        ${img('bgDesktop', 'Imagen de fondo para escritorio (horizontal)')}
        <label>Color de fondo de la página (se ve cuando no hay imagen)</label><input type="color" id="s_bg" value="${esc(s.bgColor)}">
        <div class="grid">
          <div><label>Efecto en teléfono</label><select id="s_fxm"><option value="ninguno" ${s.fxMobile === 'ninguno' ? 'selected' : ''}>Ninguno</option><option value="estatico" ${s.fxMobile === 'estatico' ? 'selected' : ''}>Estático</option></select></div>
          <div><label>Efecto en escritorio</label><select id="s_fxd"><option value="ninguno" ${s.fxDesktop === 'ninguno' ? 'selected' : ''}>Ninguno</option><option value="estatico" ${s.fxDesktop === 'estatico' ? 'selected' : ''}>Estático</option><option value="parallax" ${s.fxDesktop === 'parallax' ? 'selected' : ''}>Parallax</option></select></div>
        </div>
      </fieldset>
      <fieldset><legend>Respaldo</legend>
        <p><small>Descarga un .zip con los datos (experiencias, ajustes y mediciones) y todos los archivos subidos.</small></p>
        <a class="primary" style="display:inline-block;text-decoration:none" href="/api/backup.zip" download>Descargar respaldo (.zip)</a>
      </fieldset>`;
  } else if (siteSubpage === 'introduccion') {
    subContent = `
      ${langTabs()}
      <fieldset><legend>Página: Introducción (${LANGS[siteTab]})</legend>
        <label>Título de la bienvenida o semblanza</label>
        <input type="text" data-sl="hubTitle" value="${v('hubTitle')}" placeholder="Cocula, Cuna del Mariachi">
        <label>Texto de la semblanza e introducción. Deja una línea en blanco entre párrafos.</label>
        <textarea data-sl="hubIntro" style="min-height:160px" placeholder="Escribe aquí la historia o semblanza del municipio y del proyecto...">${v('hubIntro')}</textarea>
      </fieldset>`;
  } else if (siteSubpage === 'como-se-usa') {
    subContent = `
      ${langTabs()}
      <fieldset><legend>Página: Cómo se usa (${LANGS[siteTab]})</legend>
        <label>Título de la sección de guía</label>
        <input type="text" data-sl="guideTitle" value="${v('guideTitle')}" placeholder="¿Cómo funciona la experiencia?">
        ${guideStepBox(0)}${guideStepBox(1)}${guideStepBox(2)}
      </fieldset>`;
  } else if (siteSubpage === 'experiencias') {
    subContent = `
      ${langTabs()}
      <fieldset><legend>Página: Experiencias y Mapa interactivo (${LANGS[siteTab]})</legend>
        <p><small>💡 <strong>Nota:</strong> Las experiencias individuales se administran en la sección superior <strong>«Experiencias»</strong>. Para que se muestren en el Hub y en esta página, asegúrate de activar la casilla <em>«Mostrar en el hub»</em> dentro de cada una.</small></p>
        <label>Título del mapa interactivo</label>
        <input type="text" data-sl="mapTitle" value="${v('mapTitle')}" placeholder="Mapa de Puntos de Experiencia">
        <label>Código iframe o enlace de Google Maps (deja vacío para ver el mapa de prueba)</label>
        <textarea id="s_mapIframe" style="min-height:70px" placeholder="<iframe src='https://www.google.com/maps/embed?...' ...></iframe>">${esc(s.mapIframe || '')}</textarea>
        <label>Frase de cierre o despedida</label>
        <textarea data-sl="hubClosing" style="min-height:80px" placeholder="Frase destacada para cerrar el recorrido...">${v('hubClosing')}</textarea>
      </fieldset>`;
  } else if (siteSubpage === 'faq') {
    const list = s.faqList || [];
    const faqRows = list.map((item, idx) => {
      const qVal = esc((item.q && item.q[siteTab]) || '');
      const aVal = esc((item.a && item.a[siteTab]) || '');
      return `
        <fieldset class="sub" style="position:relative;margin-bottom:12px">
          <legend>Pregunta ${idx + 1}</legend>
          <button type="button" data-faqdel="${idx}" class="danger" style="position:absolute;top:6px;right:6px;padding:3px 8px;font-size:0.8rem">✕ Eliminar</button>
          <label>Pregunta (${LANGS[siteTab]})</label>
          <input type="text" data-faqq="${idx}" value="${qVal}" placeholder="¿Cómo inicio la cámara?">
          <label>Respuesta (${LANGS[siteTab]})</label>
          <textarea data-faqa="${idx}" style="min-height:60px" placeholder="Instrucciones o respuesta...">${aVal}</textarea>
        </fieldset>`;
    }).join('');

    subContent = `
      ${langTabs()}
      <fieldset><legend>Página: Preguntas Frecuentes (FAQ) (${LANGS[siteTab]})</legend>
        <label>Título principal de la sección FAQ</label>
        <input type="text" data-sl="faqTitle" value="${v('faqTitle')}" placeholder="Preguntas Frecuentes">
        <div id="faqItemsContainer">${faqRows || '<p><small>Aún no hay preguntas. Haz clic abajo para agregar la primera.</small></p>'}</div>
        <button type="button" id="btnAddFaq" style="margin-top:8px">＋ Añadir pregunta frecuente</button>
      </fieldset>`;
  } else if (siteSubpage === 'privacidad') {
    subContent = `
      ${langTabs()}
      <fieldset><legend>Página: Aviso de Privacidad (${LANGS[siteTab]})</legend>
        <small>Si dejas la privacidad vacía, se muestra un borrador provisional marcado como pendiente de aprobación.</small>
        <label>Texto de «Datos y privacidad». Deja una línea en blanco entre párrafos.</label>
        <textarea data-sl="privacy" style="min-height:240px" placeholder="Escribe aquí el texto legal o aviso de privacidad...">${v('privacy')}</textarea>
      </fieldset>`;
  }

  $('#main').innerHTML = `
    <h1>Ajustes del sitio</h1>
    <p><small>Administra el hub y cada una de las páginas del menú de navegación. Todo es opcional: si dejas un espacio vacío se muestra contenido de prueba.</small></p>
    
    <div class="tabs" style="margin-bottom:12px;flex-wrap:wrap">
      ${SUBPAGES.map(sp => `<button type="button" data-subp="${sp.id}" class="${sp.id === siteSubpage ? 'on' : ''}">${sp.label}</button>`).join('')}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;background:#eef0f4;padding:10px 14px;border-radius:6px;margin-bottom:16px;border:1px solid #d8dbe2">
      <div>
        <strong style="font-size:1rem">${curSub.label}</strong>
        <div style="font-size:0.85rem;color:#555">${curSub.desc}</div>
      </div>
      <a href="${curSub.url}" target="_blank" class="primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;font-size:0.85rem;white-space:nowrap">👁️ Ver página en vivo ↗</a>
    </div>

    ${subContent}

    <div style="margin-top:20px;display:flex;align-items:center;gap:12px">
      <button class="primary" id="btnSaveSite">Guardar ajustes</button>
      <span id="status"></span>
    </div>`;
  if (typeof enhanceColorPickers === 'function') enhanceColorPickers($('#main'));

  document.querySelectorAll('[data-subp]').forEach(b => b.onclick = () => {
    syncSite();
    siteSubpage = b.dataset.subp;
    renderSite();
  });
  document.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
    syncSite();
    siteTab = b.dataset.st;
    renderSite();
  });
  document.querySelectorAll('[data-siteclear]').forEach(b => b.onclick = () => {
    syncSite();
    siteData[b.dataset.siteclear] = '';
    renderSite();
  });
  document.querySelectorAll('[data-guideclear]').forEach(b => b.onclick = () => {
    syncSite();
    const idx = +b.dataset.guideclear;
    if (siteData.guideSteps && siteData.guideSteps[idx]) siteData.guideSteps[idx].img = '';
    renderSite();
  });
  document.querySelectorAll('[data-faqdel]').forEach(b => b.onclick = () => {
    syncSite();
    const idx = +b.dataset.faqdel;
    if (siteData.faqList && siteData.faqList[idx] !== undefined) {
      siteData.faqList.splice(idx, 1);
    }
    renderSite();
  });
  const btnAdd = $('#btnAddFaq');
  if (btnAdd) {
    btnAdd.onclick = () => {
      syncSite();
      siteData.faqList = siteData.faqList || [];
      siteData.faqList.push({ q: {}, a: {} });
      renderSite();
    };
  }
  document.querySelectorAll('[data-site]').forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    syncSite(); status('Subiendo…'); const warnSite = await slotWarn(inp);
    try {
      const fd = new FormData(); fd.append('file', f);
      const { url } = await api('/api/upload', { method: 'POST', body: fd });
      siteData[inp.dataset.site] = url; await renderSite();
      status('Archivo subido. Falta guardar.' + warnSite);
    } catch (e) { status('Error: ' + e.message); }
  });
  document.querySelectorAll('[data-guideimg]').forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    syncSite(); status('Subiendo imagen de guía…');
    try {
      const fd = new FormData(); fd.append('file', f);
      const { url } = await api('/api/upload', { method: 'POST', body: fd });
      const idx = +inp.dataset.guideimg;
      siteData.guideSteps = siteData.guideSteps || [{}, {}, {}];
      siteData.guideSteps[idx] = siteData.guideSteps[idx] || {};
      siteData.guideSteps[idx].img = url;
      await renderSite();
      status('Imagen del paso subida. Falta guardar.');
    } catch (e) { status('Error: ' + e.message); }
  });
  $('#btnSaveSite').onclick = async () => {
    syncSite(); status('Guardando…');
    try {
      siteData = await api('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteData) });
      if (typeof applyPreviewTheme === 'function') applyPreviewTheme();
      await renderSite(); status('✓ Guardado');
    } catch (e) { status('Error: ' + e.message); }
  };
}

// ---------------- Medición
async function renderMetrics() {
  $('#main').innerHTML = '<h1>Medición</h1><p>Cargando…</p>';
  try {
    const r = await api('/api/events/summary');
    const row = x => `<tr><td>${esc(x.nombre)}</td><td>${x.aperturas}</td><td>${x.camara_ok}</td><td>${x.camara_no}</td><td>${x.fija} / ${x.sigue}</td><td>${x.objetivo}</td><td>${x.sin_reconocer}</td><td>${x.completa}</td><td>${x.al_hub}</td><td>${x.error}</td><td>${x.mediana_ms == null ? '' : (x.mediana_ms / 1000).toFixed(1) + ' s'}</td></tr>`;
    const head = '<tr><th>{N}</th><th>Visitas</th><th>Cámara sí</th><th>Cámara no</th><th>Fija / sigue</th><th>Reconoció el objetivo</th><th>No lo reconoció en 15 s</th><th>Llegó al final</th><th>Pasó al hub</th><th>Errores</th><th>Tiempo mediano al reconocer</th></tr>';
    const table = (rows, n) => rows.length ? `<table class="tabla">${head.replace('{N}', n)}${rows.map(row).join('')}</table>` : '<p>Aún no hay datos.</p>';
    $('#main').innerHTML = `
      <style>.tabla{border-collapse:collapse;width:100%;font-size:.85rem;background:#fff}.tabla th,.tabla td{border:1px solid #d8dbe2;padding:6px 8px;text-align:left;vertical-align:top}.tabla th{background:#eef0f4}</style>
      <h1>Medición</h1>
      <p><small>Cuenta visitas (no personas): cada visita tiene un identificador al azar que no se guarda entre visitas. No se guarda la IP. ${r.total} avisos registrados${r.desde ? ` entre ${esc(r.desde)} y ${esc(r.hasta)} (hora universal)` : ''}.</small></p>
      <p>
        <button class="primary" id="btnRefresh">Actualizar</button>
        <a class="primary" style="display:inline-block;text-decoration:none;margin-left:8px" href="/api/events.csv" download>Descargar CSV</a>
        <button class="danger" id="btnClear">Borrar datos de medición</button>
      </p>
      <h2>Por experiencia</h2>${table(r.porExperiencia, 'Experiencia')}
      <h2>Por origen del QR</h2>${table(r.porOrigen, 'Origen')}
      <h2>Páginas (hub, punto, privacidad)</h2>
      ${r.paginas.length ? `<table class="tabla"><tr><th>Página</th><th>Visitas</th></tr>${r.paginas.map(p => `<tr><td>${esc(p.pagina)}</td><td>${p.visitas}</td></tr>`).join('')}</table>` : '<p>Aún no hay datos.</p>'}
      <p><small>Los datos viven en el disco del servidor: descarga el CSV al terminar cada jornada y otra vez antes de apagar o borrar el servicio.</small></p>`;
    $('#btnRefresh').onclick = renderMetrics;
    $('#btnClear').onclick = async () => {
      if (!confirm('Se borrarán TODOS los datos de medición. ¿Ya descargaste el CSV?')) return;
      await api('/api/events?confirm=BORRAR', { method: 'DELETE' }); renderMetrics();
    };
  } catch (e) { $('#main').innerHTML = '<h1>Medición</h1><p>Error: ' + esc(e.message) + '</p>'; }
}

document.addEventListener('DOMContentLoaded', () => {
  const box = document.createElement('div'); box.style.marginTop = '16px';
  box.innerHTML = '<button id="btnSite">⚙ Ajustes del sitio</button><button id="btnMetrics">📊 Medición</button>';
  document.querySelector('aside').appendChild(box);
  $('#btnSite').onclick = () => { view = 'site'; render(); };
  $('#btnMetrics').onclick = () => { view = 'metrics'; render(); };
});
