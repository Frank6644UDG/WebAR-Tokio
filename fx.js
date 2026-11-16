// Efecto de fondo: ninguno, estático o parallax. Los ajustes vienen del editor (Ajustes del sitio).
// Mejora progresiva: sin JavaScript o con «reducir movimiento» activado, la página queda sin efecto.
(function () {
  var root = document.documentElement, layer = document.getElementById('fondoEfecto');
  var mqD = window.matchMedia('(min-width: 900px)'), mqR = window.matchMedia('(prefers-reduced-motion: reduce)');
  var s = {}, mode = 'ninguno', ticking = false;

  function pickMode() {
    if (mqR.matches) return 'ninguno';
    var m = mqD.matches ? (s.fxDesktop || 'parallax') : (s.fxMobile || 'estatico');
    return (mqD.matches ? ['ninguno', 'estatico', 'parallax'] : ['ninguno', 'estatico']).indexOf(m) >= 0 ? m : 'ninguno';
  }
  function update() {
    ticking = false;
    var banner = document.getElementById('bannerImg');
    if (!layer) return;
    if (mode !== 'parallax') { layer.style.transform = ''; if (banner) banner.style.transform = ''; return; }
    var vh = window.innerHeight, max = root.scrollHeight - vh;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    layer.style.transform = 'translate3d(0,' + (-p * 0.2 * vh).toFixed(1) + 'px,0)';
    if (banner && banner.parentNode) {
      var r = banner.parentNode.getBoundingClientRect(), h = r.height;
      if (r.bottom > 0 && r.top < vh) banner.style.transform = 'translate3d(0,' + Math.min(0.12 * h, Math.max(0, -r.top * 0.2)).toFixed(1) + 'px,0)';
    }
  }
  function onScroll() { if (!ticking && mode === 'parallax') { ticking = true; window.requestAnimationFrame(update); } }
  function apply() {
    var img = mqD.matches ? s.bgDesktop : s.bgMobile;
    mode = img ? pickMode() : 'ninguno';
    root.setAttribute('data-fx', mode);
    if (root.classList) root.classList.toggle('fx-parallax', mode === 'parallax');
    if (layer) layer.style.backgroundImage = mode === 'ninguno' ? 'none' : 'url("' + img + '")';
    update();
  }
  function listen(mq) { if (mq.addEventListener) mq.addEventListener('change', apply); else if (mq.addListener) mq.addListener(apply); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', apply);
  listen(mqD); listen(mqR);
  window.ARFx = { init: function (settings) { s = settings || {}; apply(); }, mode: function () { return mode; } };
})();
