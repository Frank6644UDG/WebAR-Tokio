// QR "redondo" para vinilo impreso: puntos redondos, ojos circulares y medallón circular.
// OJO: por dentro sigue siendo un QR cuadrado; el círculo y el relleno son decoración.
function buildRound(isDark, n, opts = {}) {
  const sizeCm = opts.sizeCm || 60;
  const fg = opts.fg || '#12263a', ringColor = opts.ring || fg;
  const showRing = opts.showRing !== false, filler = opts.filler !== false;
  const half = n / 2, clear = 2.5, gap = 3, t = showRing ? 1.2 : 0;
  const Rw = half * Math.SQRT2 + clear;          // radio del disco blanco
  const R = Rw + t;                                // radio total (con anillo)
  const f = (v) => +v.toFixed(2);
  const dot = (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="0.46"/>`;
  const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  let dots = '', count = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    if (!inFinder(r, c) && isDark(r, c)) { dots += dot(c + 0.5 - half, r + 0.5 - half); count++; }

  // Relleno decorativo: sigue la misma cuadrícula, fuera del QR y de un margen de 3 módulos
  let fill = 0;
  if (filler) {
    let h = 2166136261;
    for (const ch of String(opts.seed || 'qr')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    let s = (h >>> 0) || 1;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const K = Math.ceil(Rw + 1), lim = Rw - 0.7;
    for (let r = -K; r < n + K; r++) for (let c = -K; c < n + K; c++) {
      if (r >= -gap && r < n + gap && c >= -gap && c < n + gap) continue;
      const x = c + 0.5 - half, y = r + 0.5 - half;
      if (Math.hypot(x, y) > lim) continue;
      if (rnd() < 0.5) { dots += dot(x, y); fill++; }
    }
  }

  // Ojos circulares (anillo de 7 módulos de diámetro + centro de 3)
  let eyes = '';
  for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    const cx = f(c0 + 3.5 - half), cy = f(r0 + 3.5 - half);
    eyes += `<circle cx="${cx}" cy="${cy}" r="3" fill="none" stroke="${fg}" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="1.5" fill="${fg}"/>`;
  }
  const disc = showRing
    ? `<circle id="medallon" r="${f(Rw + t / 2)}" fill="#FFFFFF" stroke="${ringColor}" stroke-width="${t}"/>`
    : `<circle id="medallon" r="${f(Rw)}" fill="#FFFFFF"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeCm}cm" height="${sizeCm}cm" viewBox="${f(-R)} ${f(-R)} ${f(2 * R)} ${f(2 * R)}">\n<title>QR redondo para vinilo</title>\n${disc}\n<g id="puntos" fill="${fg}">${dots}</g>\n<g id="ojos">${eyes}</g>\n</svg>`;
  const moduleCm = sizeCm / (2 * R);
  return { svg, modules: n, moduleCm, qrSideCm: moduleCm * n, dots: count, fillerDots: fill };
}
module.exports = { buildRound };
