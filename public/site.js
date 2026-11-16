// Páginas informativas (canal página): hub, página de punto y privacidad.
// El contenido sale del editor (/api/site). La composición de la página de punto es fija; solo cambian imágenes y textos.
(() => {
  const LANGS = { es: 'Español', en: 'English', ja: '日本語', zh: '中文', ko: '한국어' };
  const T = {
    es: { menu: 'Menú', menuHub: 'Todos los puntos', hubTitle: 'Puntos de experiencia', hubIntro: 'Texto de introducción provisional.', seeMore: 'Ver más', visited: 'Visitado', howTo: 'Cómo llegar', hint: 'Dónde buscar la señal', back: 'Volver al hub', thanks: 'Gracias por visitarnos. Aquí están los otros puntos.', noPoints: 'Aún no hay puntos publicados.', privacy: 'Datos y privacidad', listen: 'Escuchar', notFound: 'No se encontró este punto.', draft: 'Borrador pendiente de aprobación', test: 'Contenido de prueba', noText: 'Texto largo provisional de la página del punto.' },
    en: { menu: 'Menu', menuHub: 'All points', hubTitle: 'Experience points', hubIntro: 'Placeholder introduction text.', seeMore: 'See more', visited: 'Visited', howTo: 'Get directions', hint: 'Where to find the sign', back: 'Back to hub', thanks: 'Thanks for visiting. Here are the other points.', noPoints: 'No points published yet.', privacy: 'Data and privacy', listen: 'Listen', notFound: 'Point not found.', draft: 'Draft pending approval', test: 'Test content', noText: 'Placeholder long text for this point page.' },
    ja: { menu: 'メニュー', menuHub: 'すべてのスポット', hubTitle: '体験スポット', hubIntro: '仮の紹介文です。', seeMore: '詳しく見る', visited: '訪問済み', howTo: '行き方', hint: '案内表示の場所', back: 'ハブに戻る', thanks: 'ご来訪ありがとうございました。他のスポットはこちら。', noPoints: 'まだ公開されたスポットはありません。', privacy: 'データとプライバシー', listen: '音声を聞く', notFound: 'スポットが見つかりません。', draft: '承認待ちの下書き', test: 'テスト用コンテンツ', noText: 'このスポットページの仮の長文です。' },
    zh: { menu: '菜单', menuHub: '所有地点', hubTitle: '体验点', hubIntro: '临时介绍文字。', seeMore: '了解更多', visited: '已访问', howTo: '导航前往', hint: '指示牌位置', back: '返回中心页', thanks: '感谢参观，这里是其他地点。', noPoints: '尚无已发布的地点。', privacy: '数据与隐私', listen: '收听', notFound: '未找到该地点。', draft: '待批准的草稿', test: '测试内容', noText: '该地点页面的临时长文本。' },
    ko: { menu: '메뉴', menuHub: '모든 장소', hubTitle: '체험 장소', hubIntro: '임시 소개 문구입니다.', seeMore: '자세히 보기', visited: '방문함', howTo: '길 안내', hint: '표지 위치', back: '허브로 돌아가기', thanks: '방문해 주셔서 감사합니다. 다른 장소는 여기에 있습니다.', noPoints: '아직 공개된 장소가 없습니다.', privacy: '데이터 및 개인정보', listen: '듣기', notFound: '장소를 찾을 수 없습니다.', draft: '승인 대기 중인 초안', test: '테스트 콘텐츠', noText: '이 장소 페이지의 임시 긴 글입니다.' }
  };
  // Borradores provisionales del texto de privacidad (se reemplazan desde el editor)
  const DRAFT = {
    es: ['Esta experiencia forma parte de una prueba académica de usabilidad de un sistema de turismo cultural.',
      '¿Qué se registra? De forma anónima: la hora, el punto donde se escaneó, el idioma, el tipo de teléfono y de navegador (por ejemplo «iPhone, Safari») y los pasos que se completan (permiso de cámara, reconocimiento del objetivo, fin de la experiencia, paso al hub).',
      '¿Qué no se registra? No se guardan nombres, correos, cuentas, fotos ni video de la cámara. La cámara se usa solo para reconocer la imagen en tu teléfono. No se usan cookies de seguimiento y la plataforma no guarda tu dirección IP.',
      'Registros técnicos: el servicio de alojamiento puede conservar sus propios registros técnicos, que pueden incluir la dirección IP.',
      'Para qué se usa: solo para evaluar y mejorar la prueba. Los datos se analizan de forma agregada para un trabajo de tesis.',
      'Contacto: [nombre y correo de la persona responsable del proyecto]'],
    en: ['This experience is part of an academic usability test of a cultural tourism system.',
      'What is recorded? Anonymously: the time, the point where you scanned, the language, the type of phone and browser (for example “iPhone, Safari”) and the steps completed (camera permission, target recognition, end of the experience, moving on to the hub).',
      'What is not recorded? No names, emails, accounts, photos or camera video are stored. The camera is used only to recognise the image on your phone. No tracking cookies are used and the platform does not store your IP address.',
      'Technical logs: the hosting service may keep its own technical logs, which may include the IP address.',
      'What it is used for: only to evaluate and improve the test. The data are analysed in aggregate for a thesis.',
      'Contact: [name and email of the person responsible for the project]'],
    ko: ['이 경험은 문화 관광 시스템의 사용성에 관한 학술 시범 테스트의 일부입니다.',
      '무엇이 기록되나요? 익명으로 다음 정보가 기록됩니다: 시간, 스캔한 장소, 언어, 휴대전화와 브라우저 종류(예: “iPhone, Safari”), 완료한 단계(카메라 허용, 대상 인식, 체험 종료, 허브 이동).',
      '무엇이 기록되지 않나요? 이름, 이메일, 계정, 카메라 사진이나 영상은 저장되지 않습니다. 카메라는 휴대전화 안에서 이미지를 인식하는 데만 사용됩니다. 추적용 쿠키는 사용하지 않으며, 플랫폼은 IP 주소를 저장하지 않습니다.',
      '기술 로그: 호스팅 서비스는 IP 주소가 포함될 수 있는 자체 기술 로그를 보관할 수 있습니다.',
      '사용 목적: 시범 테스트를 평가하고 개선하는 데에만 사용되며, 데이터는 논문을 위해 집계된 형태로 분석됩니다.',
      '문의: [프로젝트 책임자의 이름과 이메일]']
  };

  const $ = (s) => document.querySelector(s);
  const q = new URLSearchParams(location.search);
  const PAGE = document.body.dataset.page;
  let data = { settings: {}, points: [] };

  function pickLang() {
    let l = q.get('l') || '';
    try { l = l || localStorage.getItem('ar-lang') || ''; } catch (e) {}
    if (T[l]) return l;
    for (const x of navigator.languages || [navigator.language]) { const c = String(x || '').toLowerCase().slice(0, 2); if (T[c]) return c; }
    return 'en';
  }
  let lang = pickLang();
  const t = (k) => (T[lang] && T[lang][k]) || T.en[k] || '';
  const pick = (o) => (o && (o[lang] || o.en || o.es || Object.values(o).find(Boolean))) || '';
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const paras = (arr, parent) => arr.forEach((p) => parent.appendChild(el('p', '', p)));
  const split = (text) => String(text || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const visited = () => { try { return JSON.parse(localStorage.getItem('ar-visitados') || '[]'); } catch (e) { return []; } };
  const mapsUrl = (p) => 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng;
  const caja = (cls) => el('section', 'caja' + (cls ? ' ' + cls : ''));
  const spacer = () => el('div', 'espaciador');
  const directions = (pg, cls) => { const go = el('a', cls, t('howTo')); go.href = mapsUrl(pg); go.target = '_blank'; go.rel = 'noopener'; return go; };
  const hasCoords = (pg) => pg.lat !== null && pg.lat !== undefined && pg.lng !== null && pg.lng !== undefined;

  // Cabecera común: logo, menú, idioma y colores
  function shell(s) {
    const logo = $('#logo'), lt = $('#logoText');
    if (s.logo) { logo.src = s.logo; logo.hidden = false; lt.textContent = ''; }
    else { logo.hidden = true; lt.textContent = pick(s.hubTitle) || t('hubTitle'); }
    $('#logoLink').href = '/hub?l=' + lang;
    $('#navHub').textContent = t('menuHub'); $('#navHub').href = '/hub?l=' + lang;
    $('#navPriv').textContent = t('privacy'); $('#navPriv').href = '/privacidad?l=' + lang;
    $('#menuBtnLabel').textContent = t('menu'); $('#mainNav').setAttribute('aria-label', t('menu'));
    $('#privLink').textContent = t('privacy'); $('#privLink').href = '/privacidad?l=' + lang;
    document.documentElement.style.setProperty('--color-acento', s.accent || '#0b6fb3');
    document.documentElement.style.setProperty('--color-fondo-pagina', s.bgColor || '#eef1f6');
  }

  function banner(src, alt, id) {
    const b = el('section', 'banner');
    const img = el('img', 'banner-img'); img.id = id || 'bannerImg'; img.src = src; img.alt = alt || ''; b.appendChild(img);
    return b;
  }

  function renderHub(s, box) {
    const title = pick(s.hubTitle), intro = pick(s.hubIntro);
    if (s.headerImage) { box.appendChild(banner(s.headerImage, '')); box.appendChild(spacer()); }
    const head = caja('intro');
    if (!title || !intro) head.appendChild(el('p', 'etiqueta', t('test')));
    head.appendChild(el('h1', '', title || t('hubTitle')));
    head.appendChild(el('p', '', intro || t('hubIntro')));
    if (q.get('from') === 'exp') head.appendChild(el('p', 'aviso', t('thanks')));
    box.appendChild(head);
    if (!data.points.length) { box.appendChild(caja()).appendChild(el('p', 'vacio', t('noPoints'))); return; }
    const seen = visited(), grid = el('div', 'tarjetas');
    data.points.forEach((pt) => {
      const pg = pt.page, name = pick(pg.title) || pt.name, card = el('article', 'tarjeta'), photo = pg.photo || pg.banner;
      if (photo) { const img = el('img', 'foto'); img.src = photo; img.alt = ''; img.loading = 'lazy'; card.appendChild(img); }
      const body = el('div', 'cuerpo');
      body.appendChild(el('h2', '', name));
      const sh = pick(pg.short); if (sh) body.appendChild(el('p', '', sh));
      if (seen.includes(pt.id)) body.appendChild(el('p', 'visitado', '✓ ' + t('visited')));
      const act = el('div', 'acciones');
      const more = el('a', 'boton', t('seeMore')); more.href = '/punto?e=' + encodeURIComponent(pt.id) + '&l=' + lang; act.appendChild(more);
      if (hasCoords(pg)) act.appendChild(directions(pg, 'boton secundario'));
      body.appendChild(act); card.appendChild(body); grid.appendChild(card);
    });
    box.appendChild(grid);
  }

  // Página de punto: composición fija. Banner, tres bloques, video y cierre. Lo vacío no se muestra.
  function renderPunto(s, box) {
    const pt = data.points.find((p) => p.id === q.get('e'));
    if (!pt) { box.appendChild(caja()).appendChild(el('p', 'vacio', t('notFound'))); return; }
    const pg = pt.page, name = pick(pg.title) || pt.name;
    const blocks = (pg.blocks || []).filter((b) => b.img || pick(b.title) || pick(b.text));
    const closing = split(pick(pg.closing) || pick(pg.long));
    document.title = name;

    const ban = banner(pg.banner || '', pick(pg.bannerAlt));
    if (!pg.banner) ban.removeChild(ban.firstChild);
    const bt = el('div', 'banner-texto'); bt.appendChild(el('h1', '', name));
    const sh = pick(pg.short); if (sh) bt.appendChild(el('p', '', sh));
    ban.appendChild(bt); box.appendChild(ban); box.appendChild(spacer());

    if (!pg.banner && !blocks.length && !closing.length && !pg.video) {
      const c = caja(); c.appendChild(el('p', 'etiqueta', t('test'))); c.appendChild(el('p', '', t('noText'))); box.appendChild(c);
    }
    if (blocks.length) {
      const sec = el('section', 'bloques');
      blocks.forEach((b) => {
        const art = el('article', 'bloque' + (b.img ? '' : ' sin-imagen')), title = pick(b.title);
        if (b.img) { const m = el('div', 'bloque-media'), i = el('img'); i.src = b.img; i.alt = pick(b.alt) || title || ''; i.loading = 'lazy'; m.appendChild(i); art.appendChild(m); }
        const tx = el('div', 'bloque-texto');
        if (title) tx.appendChild(el('h2', '', title));
        paras(split(pick(b.text)), tx); art.appendChild(tx); sec.appendChild(art);
      });
      box.appendChild(sec);
    }
    if (pg.video) {
      const vs = caja('video-caja'), v = el('video'); v.controls = true; v.preload = 'metadata'; v.setAttribute('playsinline', '');
      if (pg.videoPoster) v.poster = pg.videoPoster;
      v.src = pg.video; vs.appendChild(v); box.appendChild(vs);
    }
    const hint = pick(pg.hint);
    if (closing.length || hint || pg.audio || hasCoords(pg)) {
      const c = caja('cierre');
      paras(closing, c);
      if (hint) { const h = el('aside', 'pista'); h.appendChild(el('strong', '', t('hint') + ': ')); h.appendChild(document.createTextNode(hint)); c.appendChild(h); }
      if (pg.audio) { const a = el('audio'); a.controls = true; a.src = pg.audio; a.setAttribute('aria-label', t('listen')); c.appendChild(a); }
      if (hasCoords(pg)) c.appendChild(directions(pg, 'boton'));
      box.appendChild(c);
    }
    const back = el('a', 'volver', '← ' + t('back')); back.href = '/hub?l=' + lang; box.appendChild(back);
  }

  function renderPriv(s, box) {
    document.title = t('privacy');
    const own = split(pick(s.privacy)), c = caja();
    if (!own.length) c.appendChild(el('p', 'etiqueta', t('draft')));
    c.appendChild(el('h1', '', t('privacy')));
    paras(own.length ? own : (DRAFT[lang] || DRAFT.en), c);
    box.appendChild(c);
    const back = el('a', 'volver', '← ' + t('back')); back.href = '/hub?l=' + lang; box.appendChild(back);
  }

  function render() {
    document.documentElement.lang = lang;
    const s = data.settings || {};
    shell(s);
    const box = $('#content'); box.textContent = '';
    ({ hub: renderHub, punto: renderPunto, privacidad: renderPriv })[PAGE](s, box);
    $('#langSel').value = lang;
    if (window.ARFx) window.ARFx.init(s);
  }

  async function init() {
    document.documentElement.classList.add('js');
    const sel = $('#langSel');
    Object.entries(LANGS).forEach(([k, v]) => { const o = el('option', '', v); o.value = k; sel.appendChild(o); });
    sel.onchange = () => {
      lang = sel.value;
      try { localStorage.setItem('ar-lang', lang); } catch (e) {}
      if (window.ARTrack) window.ARTrack.track('idioma', { ch: 'pagina', d: lang, lang });
      render();
    };
    const hd = $('#siteHeader'), mb = $('#menuBtn');
    const closeMenu = () => { hd.classList.remove('abierto'); mb.setAttribute('aria-expanded', 'false'); };
    mb.addEventListener('click', () => { const o = !hd.classList.contains('abierto'); hd.classList.toggle('abierto', o); mb.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && hd.classList.contains('abierto')) { closeMenu(); mb.focus(); } });
    try { data = await (await fetch('/api/site')).json(); } catch (e) {}
    render();
    if (window.ARTrack) window.ARTrack.track('pagina', { ch: 'pagina', d: PAGE, lang });
  }
  init();
})();
