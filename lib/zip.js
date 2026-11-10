// Escritor mínimo de archivos .zip (sin compresión, por partes) para respaldar datos y archivos sin librerías externas.
const fs = require('fs');

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (crc, buf) => {
  let c = crc ^ 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};
const dos = (d) => ({
  time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
  date: (((d.getFullYear() - 1980) & 0x7f) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
});

// out: algo con write(buf, cb) y end(); files: [{ name, path }]
async function writeZip(out, files) {
  let offset = 0;
  const central = [];
  const w = (buf) => new Promise((res, rej) => { offset += buf.length; out.write(buf, (e) => (e ? rej(e) : res())); });
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8'), st = fs.statSync(f.path), { time, date } = dos(st.mtime);
    const start = offset, h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0808, 6); h.writeUInt16LE(0, 8);
    h.writeUInt16LE(time, 10); h.writeUInt16LE(date, 12); h.writeUInt16LE(name.length, 26);
    await w(Buffer.concat([h, name]));
    let crc = 0, size = 0;
    for await (const chunk of fs.createReadStream(f.path)) { crc = crc32(crc, chunk); size += chunk.length; await w(chunk); }
    const dd = Buffer.alloc(16);
    dd.writeUInt32LE(0x08074b50, 0); dd.writeUInt32LE(crc, 4); dd.writeUInt32LE(size, 8); dd.writeUInt32LE(size, 12);
    await w(dd);
    central.push({ name, time, date, crc, size, start });
  }
  const cdStart = offset;
  for (const c of central) {
    const h = Buffer.alloc(46);
    h.writeUInt32LE(0x02014b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(20, 6); h.writeUInt16LE(0x0808, 8);
    h.writeUInt16LE(c.time, 12); h.writeUInt16LE(c.date, 14); h.writeUInt32LE(c.crc, 16);
    h.writeUInt32LE(c.size, 20); h.writeUInt32LE(c.size, 24); h.writeUInt16LE(c.name.length, 28); h.writeUInt32LE(c.start, 42);
    await w(Buffer.concat([h, c.name]));
  }
  const cdSize = offset - cdStart, e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(central.length, 8); e.writeUInt16LE(central.length, 10);
  e.writeUInt32LE(cdSize, 12); e.writeUInt32LE(cdStart, 16);
  await w(e);
  out.end();
}
module.exports = { writeZip };
