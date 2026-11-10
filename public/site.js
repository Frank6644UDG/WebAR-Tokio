// Páginas informativas (canal página): hub, página de punto y privacidad.
// El contenido sale del editor (/api/site). Para rediseñar una página basta con conservar los elementos con id
// (ver README, sección «Qué no hay que borrar»).
(() => {
  const LANGS = { es: 'Español', en: 'English', ja: '日本語', zh: '中文', ko: '한국어' };
  const T = {
    es: { hubTitle: 'Puntos de experiencia', hubIntro: 'Texto de introducción provisional.', seeMore: 'Ver más', visited: 'Visitado', howTo: 'Cómo llegar', hint: 'Dónde buscar la señal', back: 'Volver al hub', thanks: 'Gracias por visitarnos. Aquí están los otros puntos.', noPoints: 'Aún no hay puntos publicados.', privacy: 'Datos y privacidad', listen: 'Escuchar', notFound: 'No se encontró este punto.', draft: 'Borrador pendiente de aprobación', test: 'Contenido de prueba', noText: 'Texto largo provisional de la página del punto.' },
    en: { hubTitle: 'Experience points', hubIntro: 'Placeholder introduction text.', seeMore: 'See more', visited: 'Visited', howTo: 'Get directions', hint: 'Where to find the sign', back: 'Back to hub', thanks: 'Thanks for visiting. Here are the other points.', noPoints: 'No points published yet.', privacy: 'Data and privacy', listen: 'Listen', notFound: 'Point not found.', draft: 'Draft pending approval', test: 'Test content', noText: 'Placeholder long text for this point page.' },
    ja: { hubTitle: '体験スポット', hubIntro: '仮の紹介文です。', seeMore: '詳しく見る', visited: '訪問済み', howTo: '行き方', hint: '案内表示の場所', back: 'ハブに戻る', thanks: 'ご来訪ありがとうございました。他のスポットはこちら。', noPoints: 'まだ公開されたスポットはありません。', privacy: 'データとプライバシー', listen: '音声を聞く', notFound: 'スポットが見つかりません。', draft: '承認待ちの下書き', test: 'テスト用コンテンツ', noText: 'このスポットページの仮の長文です。' },
    zh: { hubTitle: '体验点', hubIntro: '临时介绍文字。', seeMore: '了解更多', visited: '已访问', howTo: '导航前往', hint: '指示牌位置', back: '返回中心页', thanks: '感谢参观，这里是其他地点。', noPoints: '尚无已发布的地点。', privacy: '数据与隐私', listen: '收听', notFound: '未找到该地点。', draft: '待批准的草稿', test: '测试内容', noText: '该地点页面的临时长文本。' },
    ko: { hubTitle: '체험 장소', hubIntro: '임시 소개 문구입니다.', seeMore: '자세히 보기', visited: '방문함', howTo: '길 안내', hint: '표지 위치', back: '허브로 돌아가기', thanks: '방문해 주셔서 감사합니다. 다른 장소는 여기에 있습니다.', noPoints: '아직 공개된 장소가 없습니다.', privacy: '데이터 및 개인정보', listen: '듣기', notFound: '장소를 찾을 수 없습니다.', draft: '승인 대기 중인 초안', test: '테스트 콘텐츠', noText: '이 장소 페이지의 임시 긴 글입니다.' }
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
  const badge = (on) => { const b = $('#testBadge'); b.textContent = t('test'); b.hidden = !on; };

  function renderHub(s, box) {
    const title = pick(s.hubTitle), intro = pick(s.hubIntro);
    $('#siteTitle').textContent = title || t('hubTitle');
    $('#siteIntro').textContent = intro || t('hubIntro');
    badge(!title || !intro);
    $('#thanks').hidden = q.get('from') !== 'exp';
    $('#thanks').textContent = t('thanks');
    if (!data.points.length) { box.appendChild(el('p', 'vacio', t('noPoints'))); return; }
    const seen = visited(), grid = el('div', 'tarjetas');
    data.points.forEach((pt) => {
      const pg = pt.page, name = pick(pg.title) || pt.name, card = el('article', 'tarjeta');
      if (pg.photo) { const img = el('img', 'foto'); img.src = pg.photo; img.alt = name; img.loading = 'lazy'; card.appendChild(img); }
      const body = el('div', 'cuerpo');
      body.appendChild(el('h2', '', name));
      const sh = pick(pg.short); if (sh) body.appendChild(el('p', '', sh));
      if (seen.includes(pt.id)) body.appendChild(el('p', 'visitado', '✓ ' + t('visited')));
      const act = el('div', 'acciones');
      const more = el('a', 'boton', t('seeMore')); more.href = '/punto?e=' + encodeURIComponent(pt.id) + '&l=' + lang; act.appendChild(more);
      if (pg.lat !== null && pg.lng !== null) { const go = el('a', 'boton secundario', t('howTo')); go.href = mapsUrl(pg); go.target = '_blank'; go.rel = 'noopener'; act.appendChild(go); }
      body.appendChild(act); card.appendChild(body); grid.appendChild(card);
    });
    box.appendChild(grid);
  }

  function renderPunto(s, box) {
    const back = el('a', 'volver', '← ' + t('back')); back.href = '/hub?l=' + lang; box.appendChild(back);
    const pt = data.points.find((p) => p.id === q.get('e'));
    if (!pt) { $('#siteTitle').textContent = ''; box.appendChild(el('p', 'vacio', t('notFound'))); badge(false); return; }
    const pg = pt.page, name = pick(pg.title) || pt.name, long = split(pick(pg.long));
    $('#siteTitle').textContent = name; document.title = name;
    $('#siteIntro').textContent = pick(pg.short);
    badge(!long.length);
    if (pg.photo) { const img = el('img', 'foto grande'); img.src = pg.photo; img.alt = name; box.appendChild(img); }
    const txt = el('div', 'texto'); paras(long.length ? long : [t('noText')], txt); box.appendChild(txt);
    const hint = pick(pg.hint);
    if (hint) { const h = el('aside', 'pista'); h.appendChild(el('strong', '', t('hint') + ': ')); h.appendChild(document.createTextNode(hint)); box.appendChild(h); }
    if (pg.audio) { const a = el('audio'); a.controls = true; a.src = pg.audio; a.setAttribute('aria-label', t('listen')); box.appendChild(a); }
    if (pg.lat !== null && pg.lng !== null) { const go = el('a', 'boton', t('howTo')); go.href = mapsUrl(pg); go.target = '_blank'; go.rel = 'noopener'; box.appendChild(go); }
  }

  function renderPriv(s, box) {
    $('#siteTitle').textContent = t('privacy'); document.title = t('privacy');
    $('#siteIntro').textContent = '';
    const own = split(pick(s.privacy));
    badge(false);
    if (!own.length) { const d = el('p', 'etiqueta', t('draft')); box.appendChild(d); }
    const txt = el('div', 'texto'); paras(own.length ? own : (DRAFT[lang] || DRAFT.en), txt); box.appendChild(txt);
    const back = el('a', 'volver', '← ' + t('back')); back.href = '/hub?l=' + lang; box.appendChild(back);
  }

  function render() {
    document.documentElement.lang = lang;
    const s = data.settings || {};
    document.documentElement.style.setProperty('--color-acento', s.accent || '#0b6fb3');
    const logo = $('#logo'); if (s.logo) { logo.src = s.logo; logo.hidden = false; }
    const hero = $('#headerImg'); if (PAGE === 'hub' && s.headerImage) { hero.src = s.headerImage; hero.hidden = false; }
    $('#privLink').textContent = t('privacy'); $('#privLink').href = '/privacidad?l=' + lang;
    const box = $('#content'); box.textContent = '';
    ({ hub: renderHub, punto: renderPunto, privacidad: renderPriv })[PAGE](s, box);
    $('#langSel').value = lang;
  }

  async function init() {
    const sel = $('#langSel');
    Object.entries(LANGS).forEach(([k, v]) => { const o = el('option', '', v); o.value = k; sel.appendChild(o); });
    sel.onchange = () => {
      lang = sel.value;
      try { localStorage.setItem('ar-lang', lang); } catch (e) {}
      if (window.ARTrack) window.ARTrack.track('idioma', { ch: 'pagina', d: lang, lang });
      render();
    };
    try { data = await (await fetch('/api/site')).json(); } catch (e) {}
    render();
    if (window.ARTrack) window.ARTrack.track('pagina', { ch: 'pagina', d: PAGE, lang });
  }
  init();
})();
