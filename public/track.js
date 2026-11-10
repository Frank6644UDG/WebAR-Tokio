// Medición anónima compartida por el visor y las páginas.
// Cada visita tiene un identificador al azar que vive solo en esa pestaña (no se guarda entre visitas).
// Si no hay señal, los avisos se guardan en el teléfono y se reenvían al volver la conexión.
(function () {
  var KEY = 'arq';
  function rnd() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
  var VID;
  try { VID = sessionStorage.getItem('arv'); if (!VID) { VID = rnd(); sessionStorage.setItem('arv', VID); } } catch (e) { VID = rnd(); }
  function queue() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function saveQueue(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-200))); } catch (e) {} }
  function send(body) {
    return fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true })
      .then(function (r) { if (!r.ok && r.status !== 400) throw new Error('x'); });
  }
  function flush() {
    var a = queue(); if (!a.length) return; saveQueue([]);
    a.forEach(function (b) { send(b).catch(function () { saveQueue(queue().concat([b])); }); });
  }
  window.ARTrack = {
    vid: VID,
    track: function (ev, extra) {
      var p = new URLSearchParams(location.search);
      var body = Object.assign({ ev: ev, v: VID, e: p.get('e') || '', s: p.get('s') || '', ch: 'experiencia', tc: Date.now() }, extra || {});
      send(body).catch(function () { saveQueue(queue().concat([body])); });
    }
  };
  window.addEventListener('online', flush);
  flush();
})();
