// FRIENDS ESCAPE — oddiy multiplayer server (Express + Socket.IO)
const express = require('express'), http = require('http'), path = require('path');
const { Server } = require('socket.io');
const app = express(), srv = http.createServer(app);
const io = new Server(srv, { cors: { origin: '*' }, maxHttpBufferSize: 1e5 });
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.get('/health', (q, r) => r.send('ok'));

const CHARS = ['miku', 'jinx', 'haz'];
const rooms = new Map();
const clean = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
const pub = r => ({
  code: r.code, host: r.hostId, state: r.state, mode: r.mode,
  players: [...r.players.values()].map(p => ({ id: p.id, name: p.name, char: p.char, ready: p.ready }))
});
const num = v => (typeof v === 'number' && isFinite(v)) ? v : 0;

io.on('connection', s => {
  let room = null;
  const me = () => room && room.players.get(s.id);
  const leave = () => {
    if (!room) return;
    const r = room; room = null;
    s.leave(r.code); r.players.delete(s.id);
    if (!r.players.size) { rooms.delete(r.code); return; }
    if (r.hostId === s.id) r.hostId = r.players.keys().next().value;
    if ([...r.players.values()].every(p => !p.ig)) r.state = 'lobby';
    io.to(r.code).emit('room', pub(r));
  };

  s.on('join', d => {
    d = d || {};
    const code = clean(d.room);
    if (code.length !== 5) return;
    const name = String(d.name || 'Oyinchi').slice(0, 14);
    const char = CHARS.includes(d.char) ? d.char : 'miku';
    let r = rooms.get(code);
    if (r && room === r) { const p = me(); p.name = name; p.char = char; io.to(code).emit('room', pub(r)); return; }
    if (r && r.players.size >= 4) { s.emit('full'); return; }
    if (r && r.state === 'game') { s.emit('busy'); return; }
    leave();
    if (!r) { r = { code, hostId: s.id, players: new Map(), state: 'lobby', mode: 'co', seed: 0 }; rooms.set(code, r); }
    room = r; s.join(code);
    r.players.set(s.id, { id: s.id, name, char, ready: false, ig: false });
    io.to(code).emit('room', pub(r));
  });

  s.on('upd', d => {
    const p = me(); if (!p || !d) return;
    p.name = String(d.name || p.name).slice(0, 14);
    if (CHARS.includes(d.char)) p.char = d.char;
    p.ready = !!d.ready;
    io.to(room.code).emit('room', pub(room));
  });

  s.on('mode', m => {
    if (!room || room.hostId !== s.id || room.state !== 'lobby') return;
    if (m === 'co' || m === 'race') { room.mode = m; io.to(room.code).emit('room', pub(room)); }
  });

  s.on('start', () => {
    if (!room || room.hostId !== s.id || room.state !== 'lobby') return;
    room.state = 'game';
    room.seed = 1 + Math.floor(Math.random() * 2147483646);
    room.players.forEach(p => { p.ig = true; p.ready = false; });
    io.to(room.code).emit('go', { seed: room.seed, mode: room.mode, order: [...room.players.keys()] });
    io.to(room.code).emit('room', pub(room));
  });

  s.on('back', () => {
    const p = me(); if (!p) return;
    p.ig = false;
    if ([...room.players.values()].every(q => !q.ig)) room.state = 'lobby';
    io.to(room.code).emit('room', pub(room));
  });

  s.on('chat', d => { const p = me(); if (!p || !d) return; s.to(room.code).emit('chat', { name: p.name, text: String(d.text || '').slice(0, 120) }); });
  s.on('emote', d => { if (room && d) s.to(room.code).emit('emote', { id: s.id, e: String(d.e || '').slice(0, 10) }); });
  s.on('pos', d => {
    if (!room || room.state !== 'game' || !d) return;
    s.to(room.code).volatile.emit('pos', { id: s.id, x: num(d.x), y: num(d.y), z: num(d.z), yaw: num(d.yaw), vx: num(d.vx), vz: num(d.vz), vy: num(d.vy), sw: d.sw ? 1 : 0, cr: d.cr ? 1 : 0, g: d.g ? 1 : 0 });
  });
  s.on('mon', d => { if (room && room.hostId === s.id && d) s.to(room.code).volatile.emit('mon', { x: num(d.x), z: num(d.z), yaw: num(d.yaw), mode: String(d.mode || '') }); });
  s.on('heard', d => { if (room && d && room.hostId !== s.id) io.to(room.hostId).emit('heard', { x: num(d.x), z: num(d.z), spd: num(d.spd) }); });
  s.on('ev', d => { if (room && d) s.to(room.code).emit('ev', d); });
  s.on('race', d => { if (room && d) s.to(room.code).emit('end', { n: String(d.n || '').slice(0, 14) }); });
  s.on('rtc', d => {
    if (!room || !d || !room.players.has(d.to)) return;
    io.to(d.to).emit('rtc', { from: s.id, data: d.data });
  });
  s.on('disconnect', leave);
});

const PORT = process.env.PORT || 3000;
srv.listen(PORT, () => console.log('FRIENDS ESCAPE server: http://localhost:' + PORT));
