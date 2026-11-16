// Ampliaciones del editor (0.7.0): página del punto, ajustes del sitio y medición.
// Se carga antes del script principal; usa sus variables (cur, tab, view, LANGS, $, esc, api, status, render, sync) solo al ejecutarse.

// Recomendaciones de cada hueco de imagen (cámbialas aquí si ajustas el diseño)
const SPECS = {
  banner: { ratio: 16 / 7, rec: '1600×700', maxKB: 300 },
  block: { ratio: 4 / 3, rec: '1000×750', maxKB: 200 },
  photo: { ratio: 16 / 9, rec: '1200×675', maxKB: 200 },
  poster: { ratio: 16 / 9, rec: '1280×720', maxKB: 200 },
  headerImage: { ratio: 16 / 7, rec: '1600×700', maxKB: 300 },
  bgMobile: { ratio: 9 / 16, rec: '1080×1920', maxKB: 400 },
  bgDesktop: { ratio: 16 / 9, rec: '1920×1080', maxKB: 500 },
  logo: { ratio: null, rec: 'PNG o WebP con fondo transparente, 80 px de alto', maxKB: 100 }
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
let siteData = null, siteTab = 'es';
async function loadSite() { siteData = (await api('/api/site')).settings; }
function syncSite() {
  if (!siteData || !$('#s_accent')) return;
  siteData.accent = $('#s_accent').value; siteData.timezone = $('#s_tz').value.trim();
  siteData.bgColor = $('#s_bg').value; siteData.fxMobile = $('#s_fxm').value; siteData.fxDesktop = $('#s_fxd').value;
  document.querySelectorAll('[data-sl]').forEach(i => { const k = i.dataset.sl; siteData[k] = siteData[k] || {}; siteData[k][siteTab] = i.value; });
}
async function renderSite() {
  if (!siteData) { try { await loadSite(); } catch (e) { $('#main').textContent = 'Error: ' + e.message; return; } }
  const s = siteData, v = (k) => esc((s[k] && s[k][siteTab]) || '');
  const zones = ['America/Mexico_City', 'America/Monterrey', 'America/Tijuana', 'America/Cancun', 'America/Hermosillo', 'Asia/Tokyo', 'Asia/Seoul', 'America/New_York', 'America/Los_Angeles', 'Europe/Madrid', 'UTC'];
  const img = (k, label) => `<label>${label}${SPECS[k] ? ` <small style="display:inline">(recomendado: ${SPECS[k].rec}, menos de ${SPECS[k].maxKB} KB)</small>` : ''}</label><input type="file" data-site="${k}" accept="image/*"><small>${esc(s[k]) || 'Sin archivo'}</small>${s[k] ? `<button type="button" data-siteclear="${k}">Quitar</button>` : ''}`;
  $('#main').innerHTML = `
    <h1>Ajustes del sitio</h1>
    <p><small>Controlan el hub y las páginas informativas. Todo es opcional: si dejas un espacio vacío se muestra un texto provisional marcado como «Contenido de prueba».</small></p>
    <fieldset><legend>Imágenes, color y zona horaria</legend>
      ${img('headerImage', 'Imagen del encabezado del hub (recomendado: 1600×600 px y menos de 500 KB)')}
      ${img('logo', 'Logo (opcional)')}
      <label>Color de acento (usa un color oscuro para que el texto blanco de los botones se lea bien)</label>
      <input type="color" id="s_accent" value="${esc(s.accent)}">
      <label>Zona horaria de la columna «fecha_hora_local» del CSV</label>
      <input type="text" id="s_tz" list="tzs" value="${esc(s.timezone)}"><datalist id="tzs">${zones.map(z => `<option value="${z}">`).join('')}</datalist>
    </fieldset>
    <fieldset><legend>Fondo y efecto</legend>
      <small>El fondo va detrás de todo el contenido. En teléfono solo puede ser estático (por ligereza); en escritorio puede tener parallax. Quien tenga activada la opción «reducir movimiento» no verá el efecto.</small>
      ${img('bgMobile', 'Imagen de fondo para teléfono (vertical)')}
      ${img('bgDesktop', 'Imagen de fondo para escritorio (horizontal)')}
      <label>Color de fondo de la página (se ve cuando no hay imagen)</label><input type="color" id="s_bg" value="${esc(s.bgColor)}">
      <div class="grid">
        <div><label>Efecto en teléfono</label><select id="s_fxm"><option value="ninguno" ${s.fxMobile === 'ninguno' ? 'selected' : ''}>Ninguno</option><option value="estatico" ${s.fxMobile === 'estatico' ? 'selected' : ''}>Estático</option></select></div>
        <div><label>Efecto en escritorio</label><select id="s_fxd"><option value="ninguno" ${s.fxDesktop === 'ninguno' ? 'selected' : ''}>Ninguno</option><option value="estatico" ${s.fxDesktop === 'estatico' ? 'selected' : ''}>Estático</option><option value="parallax" ${s.fxDesktop === 'parallax' ? 'selected' : ''}>Parallax</option></select></div>
      </div>
    </fieldset>
    <fieldset><legend>Textos por idioma</legend>
      <div class="tabs">${Object.entries(LANGS).map(([k, n]) => `<button data-st="${k}" class="${k === siteTab ? 'on' : ''}">${n}</button>`).join('')}</div>
      <label>Título del hub (${LANGS[siteTab]})</label><input type="text" data-sl="hubTitle" value="${v('hubTitle')}">
      <label>Introducción del hub (${LANGS[siteTab]})</label><textarea data-sl="hubIntro" style="min-height:80px">${v('hubIntro')}</textarea>
      <label>Texto de «Datos y privacidad» (${LANGS[siteTab]}). Deja una línea en blanco entre párrafos.</label><textarea data-sl="privacy" style="min-height:220px">${v('privacy')}</textarea>
      <small>Si dejas la privacidad vacía, se muestra un borrador provisional marcado como pendiente de aprobación.</small>
    </fieldset>
    <button class="primary" id="btnSaveSite">Guardar ajustes</button><span id="status"></span>
    <fieldset style="margin-top:20px"><legend>Respaldo</legend>
      <p><small>Descarga un .zip con los datos (experiencias, ajustes y mediciones) y todos los archivos subidos.</small></p>
      <a class="primary" style="display:inline-block;text-decoration:none" href="/api/backup.zip" download>Descargar respaldo (.zip)</a>
    </fieldset>`;
  document.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { syncSite(); siteTab = b.dataset.st; renderSite(); });
  document.querySelectorAll('[data-siteclear]').forEach(b => b.onclick = () => { syncSite(); siteData[b.dataset.siteclear] = ''; renderSite(); });
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
  $('#btnSaveSite').onclick = async () => {
    syncSite(); status('Guardando…');
    try {
      siteData = await api('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteData) });
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
