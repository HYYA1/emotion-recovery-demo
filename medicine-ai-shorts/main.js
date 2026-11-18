// 약 봉투, AI한테 물어보세요 — Mascot Screencast, 1080×1920, 30 fps.
// One phone on a warm wallpaper. The touch dot is the user; the pixel mascot is the AI. Pure function of t.
const cv = document.getElementById('c');
cv.width = innerWidth; cv.height = innerHeight;
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
window.DUR = 60;

// ---------- utilities ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const back = t => { t = clamp(t); const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const F = (w, s) => `${w} ${s}px KR`;

// ---------- voice timeline (seconds); W(id, i) = when word i of a line starts ----------
const VO = { v01: .3, v02: 2.8, v03: 7.3, v04: 11.9, v05: 14.6, v06: 18.4, v07: 22.3, v08: 26.9, q01: 30.4, v09: 33.2, v10: 36.4, v11: 41.8, v12: 47.8, v13: 53.2 };
let WORDS = {};
const Wd = (id, i) => VO[id] + Math.max(0, WORDS[id][i][1]);
const SHUT = () => VO.v07 + WORDS.v07[7][2] - .02;   // the shutter fires right after "찰칵!" is said, so it never masks the word

// ---------- colours ----------
const C = { ink: '#1F2328', grey: '#6B7280', line: '#E5E7EB', blue: '#3B6FE0', blueL: '#EAF0FF', bg: '#FFFFFF', bg2: '#F5F6F8',
  mas: '#FF8A3D', masD: '#D96A22', eye: '#2A2622', cheek: '#FF6F7D', spark: '#FFD23F', red: '#E5483B', green: '#2FB36B' };

// ---------- phone (world = frame pixels at zoom 1) ----------
const PH = { x: 150, y: 120, w: 780, h: 1440, r: 96 };
const SX = 172, SY = 142, SW = 736, SH = 1396, SR = 76;
const wpt = (lx, ly) => [SX + lx, SY + ly];

// ---------- camera: keys [t, cx, cy, z]; screen = (540 + (x-cx)z, 840 + (y-cy)z) ----------
const CAMK = [[0, 470, 700, 2.6], [2.5, 470, 700, 2.75], [3.7, 540, 840, 1], [7.2, 540, 840, 1], [11.8, 540, 815, 1.05],
  [12.0, 540, 840, 1], [14.4, 540, 860, 1.07], [14.6, 540, 840, 1], [15.7, 540, 840, 1], [16.5, 540, 420, 1.5], [18.3, 540, 420, 1.5],
  [19.0, 540, 1150, 1.55], [20.9, 540, 1150, 1.55], [21.6, 540, 840, 1], [22.0, 540, 840, 1], [22.45, 400, 1340, 1.55],
  [22.9, 540, 840, 1.04], [26.1, 540, 840, 1.04], [26.5, 540, 840, 1], [27.0, 720, 1360, 1.55], [27.6, 540, 1150, 1.22],
  [31.9, 540, 1150, 1.22], [32.35, 690, 540, 1.4], [32.95, 690, 540, 1.4], [33.45, 482, 1060, 1.48], [35.8, 482, 1060, 1.48],
  [36.5, 540, 880, 1.04], [41.4, 540, 870, 1.04], [41.8, 540, 840, 1], [47.5, 540, 840, 1], [47.8, 540, 840, 1], [48.7, 540, 790, 1.42],
  [52.8, 540, 790, 1.42], [53.3, 540, 840, 1], [57.0, 540, 840, 1], [59.0, 540, 830, 1.04], [60, 540, 830, 1.04]];
function track(keys, i, log) {
  return t => {
    if (t <= keys[0][0]) return keys[0][i];
    for (let k = 0; k < keys.length - 1; k++) if (t < keys[k + 1][0]) {
      const a = keys[k], b = keys[k + 1], u = eio(seg(t, a[0], b[0]));
      return log ? Math.exp(lerp(Math.log(a[i]), Math.log(b[i]), u)) : lerp(a[i], b[i], u);
    }
    return keys[keys.length - 1][i];
  };
}
const camX = track(CAMK, 1), camY = track(CAMK, 2), camZ = track(CAMK, 3, true);
const cam = t => ({ x: camX(t), y: camY(t), z: camZ(t) });
const toScr = (K, x, y) => [540 + (x - K.x) * K.z, 840 + (y - K.y) * K.z];
const camSpeed = t => { const a = cam(t - 1 / 30), b = cam(t); return Math.hypot((b.x - a.x) * b.z, (b.y - a.y) * b.z) + Math.abs(Math.log(b.z / a.z)) * 1200; };

// ---------- drawing helpers ----------
function rr(c, x, y, w, h, r, fill, stroke, lw = 2) { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
function circ(c, x, y, r, fill, stroke, lw = 2) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
function txt(c, s, x, y, font, col, align = 'left', base = 'middle') { c.font = font; c.fillStyle = col; c.textAlign = align; c.textBaseline = base; c.fillText(s, x, y); }
function shadow(c, b = 30, y = 10, a = .18) { c.shadowColor = `rgba(0,0,0,${a})`; c.shadowBlur = b; c.shadowOffsetY = y; }
function noShadow(c) { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; }

// glyphs (vector icons, drawn in a 100-unit box centred at x,y with scale s)
function glyph(c, kind, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s / 100, s / 100); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'mic') { rr(c, -16, -40, 32, 52, 16, col); c.beginPath(); c.arc(0, 0, 30, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); c.beginPath(); c.moveTo(0, 30); c.lineTo(0, 44); c.moveTo(-16, 44); c.lineTo(16, 44); c.stroke(); }
  else if (kind === 'cam') { rr(c, -42, -24, 84, 58, 12, null, col); c.lineWidth = 9; c.stroke(); circ(c, 0, 5, 15, null, col, 9); rr(c, -16, -36, 32, 14, 4, col); }
  else if (kind === 'phone') { c.beginPath(); c.moveTo(-30, -36); c.quadraticCurveTo(-40, 10, 6, 40); c.lineTo(26, 28); c.lineTo(10, 8); c.lineTo(-2, 16); c.quadraticCurveTo(-16, 2, -18, -14); c.lineTo(-6, -24); c.lineTo(-16, -44); c.closePath(); c.fill(); }
  else if (kind === 'chat') { rr(c, -40, -32, 80, 56, 18, col); c.beginPath(); c.moveTo(-18, 20); c.lineTo(-28, 40); c.lineTo(2, 22); c.fill(); }
  else if (kind === 'photo') { rr(c, -40, -32, 80, 64, 10, null, col); c.stroke(); c.beginPath(); c.moveTo(-32, 24); c.lineTo(-8, -2); c.lineTo(8, 12); c.lineTo(18, 2); c.lineTo(34, 24); c.stroke(); circ(c, 16, -14, 7, col); }
  else if (kind === 'clock') { circ(c, 0, 0, 38, null, col, 9); c.beginPath(); c.moveTo(0, -22); c.lineTo(0, 0); c.lineTo(16, 10); c.stroke(); }
  else if (kind === 'gear') { for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); rr(c, -8, -44, 16, 18, 3, col); c.restore(); } circ(c, 0, 0, 30, null, col, 12); }
  else if (kind === 'spark') { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 14 : 44; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); circ(c, 30, -30, 8, col); }
  else if (kind === 'check') { c.lineWidth = 12; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-8, 22); c.lineTo(32, -22); c.stroke(); }
  else if (kind === 'cal') { rr(c, -38, -30, 76, 68, 10, null, col); c.stroke(); c.beginPath(); c.moveTo(-38, -10); c.lineTo(38, -10); c.moveTo(-18, -42); c.lineTo(-18, -24); c.moveTo(18, -42); c.lineTo(18, -24); c.stroke(); }
  else if (kind === 'bell') { c.beginPath(); c.moveTo(-32, 22); c.quadraticCurveTo(-26, 14, -26, -6); c.quadraticCurveTo(-24, -36, 0, -36); c.quadraticCurveTo(24, -36, 26, -6); c.quadraticCurveTo(26, 14, 32, 22); c.closePath(); c.fill(); circ(c, 0, 32, 9, col); }
  else if (kind === 'speaker') { c.beginPath(); c.moveTo(-36, -12); c.lineTo(-18, -12); c.lineTo(4, -32); c.lineTo(4, 32); c.lineTo(-18, 12); c.lineTo(-36, 12); c.closePath(); c.fill(); c.beginPath(); c.arc(8, 0, 18, -.9, .9); c.stroke(); c.beginPath(); c.arc(8, 0, 34, -.9, .9); c.stroke(); }
  else if (kind === 'back') { c.lineWidth = 10; c.beginPath(); c.moveTo(12, -26); c.lineTo(-14, 0); c.lineTo(12, 26); c.stroke(); }
  else if (kind === 'send') { c.beginPath(); c.moveTo(-36, -30); c.lineTo(38, 0); c.lineTo(-36, 30); c.lineTo(-24, 0); c.closePath(); c.fill(); }
  c.restore();
}

// the medicine envelope (fictional pharmacy). Its fine print is the problem: small, grey, a little soft.
const ENV_LINES = ['1일 3회 · 식후 30분 · 1정씩', '아침 / 점심 / 저녁', '조제일 2026.11.18 · 3일분', '실온 보관 · 어린이 손에 닿지 않게', '복용 중 음주를 피하십시오'];
function envelope(c, x, y, w, h, o = {}) {
  const band = o.band || '#2E9E6A';
  c.save(); shadow(c, 24 * w / 600, 8 * w / 600, .16); rr(c, x, y, w, h, 18 * w / 600, '#FDFBF6'); noShadow(c);
  c.beginPath(); c.roundRect(x, y, w, h, 18 * w / 600); c.clip();
  c.fillStyle = band; c.fillRect(x, y, w, h * .16);
  txt(c, '튼튼약국', x + w * .07, y + h * .08, F(900, h * .058), '#fff');
  txt(c, '복약 안내', x + w * .93, y + h * .08, F(700, h * .032), 'rgba(255,255,255,.85)', 'right');
  txt(c, '김○○ 님', x + w * .07, y + h * .23, F(700, h * .04), '#3A3F45');
  const blur = (o.blur ?? 1.2) * w / 600 * ZOOM;
  c.filter = blur > .05 ? `blur(${blur}px)` : 'none';
  for (let i = 0; i < ENV_LINES.length; i++) txt(c, ENV_LINES[i], x + w * .07, y + h * (.32 + i * .055), F(500, h * .022), '#7C8188');
  c.strokeStyle = '#C9CDD2'; c.lineWidth = Math.max(1, w / 400);
  for (let r = 0; r < 4; r++) { c.beginPath(); c.moveTo(x + w * .07, y + h * (.62 + r * .06)); c.lineTo(x + w * .93, y + h * (.62 + r * .06)); c.stroke(); }
  for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + w * (.07 + k * .2867), y + h * .62); c.lineTo(x + w * (.07 + k * .2867), y + h * .80); c.stroke(); }
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) txt(c, ['아침', '점심', '저녁'][k] + ' ' + (r + 1), x + w * (.12 + k * .2867), y + h * (.65 + r * .06), F(500, h * .02), '#8A8F96');
  c.filter = 'none';
  txt(c, '문의 02-000-0000', x + w * .07, y + h * .9, F(500, h * .02), '#9AA0A6');
  if (o.scan !== undefined && o.scan > 0 && o.scan < 1) {   // the AI reading: a highlight sweeping down the print
    const sy = y + h * lerp(.28, .82, o.scan);
    const g = c.createLinearGradient(0, sy - h * .05, 0, sy + h * .01); g.addColorStop(0, 'rgba(255,210,63,0)'); g.addColorStop(1, 'rgba(255,210,63,.55)');
    c.fillStyle = g; c.fillRect(x, sy - h * .05, w, h * .06);
  }
  c.restore();
}

// ---------- pixel mascot (original): 16×12 grid, an AI helper with an antenna spark ----------
function mgrid(p) {
  const P = new Map(), put = (cx, r, v = 1) => P.set(cx + ',' + r, v);
  put(7, 0, 4); put(8, 0, 4); put(7, 1, 3); put(8, 1, 3);            // antenna spark + stem
  for (let r = 2; r <= 9; r++) for (let x = 2; x <= 13; x++) { if ((r === 2 || r === 9) && (x === 2 || x === 13)) continue; put(x, r); }
  const arms = p.arms || 'down';
  if (arms === 'up') for (const r of [2, 3, 4]) { put(0, r); put(1, r); put(14, r); put(15, r); }
  else if (arms === 'wave') { for (const r of [6, 7]) { put(0, r); put(1, r); } for (const r of [2, 3, 4]) { put(14, r); put(15, r); } }
  else if (arms !== 'tuck') for (const r of [6, 7]) for (const x of [0, 1, 14, 15]) put(x, r);
  const L = { stand: [[4, 2], [5, 2], [10, 2], [11, 2]], walkA: [[4, 2], [5, 2], [10, 1], [11, 1]], walkB: [[4, 1], [5, 1], [10, 2], [11, 2]], tuck: [[4, 1], [5, 1], [10, 1], [11, 1]] }[p.legs || 'stand'];
  for (const [x, h] of L) for (let r = 10; r < 10 + h; r++) put(x, r, 5);
  const E = { n: [[5, 4], [5, 5], [10, 4], [10, 5]], l: [[4, 4], [4, 5], [9, 4], [9, 5]], r: [[6, 4], [6, 5], [11, 4], [11, 5]], u: [[5, 3], [5, 4], [10, 3], [10, 4]],
    d: [[5, 5], [5, 6], [10, 5], [10, 6]], blink: [[5, 5], [10, 5]], happy: [[4, 5], [5, 4], [6, 5], [9, 5], [10, 4], [11, 5]], wide: [[5, 3], [5, 4], [5, 5], [10, 3], [10, 4], [10, 5]],
    sad: [[4, 4], [5, 5], [11, 4], [10, 5]] }[p.eyes || 'n'];
  for (const [x, r] of E) put(x, r, 2);
  put(3, 7, 6); put(12, 7, 6);                                         // cheeks
  if (p.eyes === 'happy') { put(7, 7, 2); put(8, 7, 2); }
  return [...P].map(([k, v]) => { const [x, r] = k.split(',').map(Number); return [x, r, v]; });
}
const MPAL = { 1: C.mas, 2: C.eye, 3: C.masD, 4: C.spark, 5: C.masD, 6: C.cheek };
const MPX = 8;
// x,y = midpoint under the feet (world); sq > 0 squash, < 0 stretch
function drawMascot(c, x, y, p) {
  const px = MPX * (p.scale ?? 1), sq = p.sq || 0, sx = 1 + sq * .6, sy = 1 - sq;
  const G = mgrid(p), w = 16 * px * sx, h = 12 * px * sy;
  x = Math.round(x * 2 / px) * px / 2; y = Math.round(y * 2 / px) * px / 2;      // stepped to half a pixel
  c.save(); c.globalAlpha = p.op ?? 1;
  if (p.shadow) { c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(x, y + 2, 6 * px * p.shadow, 1.1 * px, 0, 0, 7); c.fill(); }
  for (const [gx, gy, v] of G) {
    const cx = p.flip ? 15 - gx : gx;
    c.fillStyle = MPAL[v]; c.fillRect(x - w / 2 + cx * px * sx, y - h + gy * px * sy, px * sx + .6, px * sy + .6);
  }
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x - w / 2 + 2 * px * sx, y - h + 9 * px * sy, 12 * px * sx, px * sy);   // a darker bottom row = volume
  c.restore();
}
function pixart(c, rows, x, y, px, pal, op = 1) {
  c.save(); c.globalAlpha = op;
  rows.forEach((row, r) => [...row].forEach((ch, k) => { if (pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x + k * px, y + r * px, px + .5, px + .5); } }));
  c.restore();
}
const P_Q = ['.kkk.', 'k...k', '...k.', '..k..', '..k..', '.....', '..k..'];
const P_SWEAT = ['.b.', 'bbb', 'bbb', '.b.'];
const P_HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];
const P_SPARK = ['..y..', '..y..', 'yy.yy', '..y..', '..y..'];
const P_MAG = ['..kkkk...', '.kwwwwk..', 'kwwwwwwk.', 'kwwwwwwk.', 'kwwwwwwk.', '.kwwwwk..', '..kkkkk..', '......kk.', '.......kk', '........k'];
const P_NOTE = ['..kk', '..kb', '..k.', 'kkk.', 'kkk.'];

// ---------- mascot timeline ----------
// moves: [t0, t1, type, x, y, opts]; 'jump' (arc), 'walk', 'pop' (appear), 'hide', 'show' (appear in place), 'scroll' marks chat-anchored positions
let MOVES = [], POSES = [];
function buildMascot() {
  const j = (t0, t1, x, y, o = {}) => MOVES.push([t0, t1, 'jump', x, y, o]);
  const w = (t0, t1, x, y, o = {}) => MOVES.push([t0, t1, 'walk', x, y, o]);
  const pz = (t0, t1, e) => POSES.push([t0, t1, e]);
  MOVES.push([3.85, 4.1, 'pop', 540, 200, {}]);
  j(4.12, 4.6, 430, 392, { h: 120 });
  pz(4.6, 5.2, { eyes: 'd' }); pz(4.72, 4.95, { arms: 'up', sq: .25 });
  pz(5.38, 6.1, { eyes: 'd' }); pz(6.12, 7.2, { eyes: 'happy', arms: 'up', spark: true });
  j(7.25, 7.75, 300, 362, { h: 100 });
  w(8.1, 9.8, 700, 362);
  pz(9.06, 9.6, { eyes: 'l' }); pz(9.86, 10.4, { eyes: 'r' }); pz(10.4, 11.8, { eyes: 'u', q: true }); pz(10.84, 11.2, { eyes: 'l', q: true }); pz(11.2, 11.6, { eyes: 'r', q: true });
  j(11.95, 12.45, 540, 732, { h: 90 });
  pz(12.5, 14.5, { eyes: 'sad', sweat: true });
  j(14.65, 15.15, 420, 292, { h: 120 });
  pz(16.18, 17.6, { eyes: 'r', arms: 'up', spark: true });
  j(18.6, 19.15, 540, 1102, { h: 140 });
  pz(19.15, 20.36, { eyes: 'd', arms: 'wave' });
  j(20.45, 20.85, 700, 1102, { h: 70 });
  MOVES.push([20.9, 20.9, 'hide', 0, 0, {}]);
  MOVES.push([21.45, 21.75, 'show', 540, 606, {}]);
  pz(21.75, 22.5, { eyes: 'happy' });
  MOVES.push([22.5, 22.5, 'hide', 0, 0, {}]);
  MOVES.push([26.5, 26.8, 'show', 312, 1152, {}]);
  pz(26.8, 27.15, { eyes: 'happy' });
  j(27.2, 27.65, 720, 1122, { h: 120 });
  pz(27.65, 30.35, { eyes: 'u', dance: true }); pz(30.4, 31.9, { eyes: 'happy', dance: true });
  j(32.05, 32.45, 640, 342, { h: 160, scroll: true });
  w(32.45, 32.9, 820, 342, { scroll: true, run: true });
  pz(32.45, 32.9, { eyes: 'd' });
  j(32.95, 33.35, 420, 862, { h: 110, scroll: true });
  pz(33.5, 36.0, { eyes: 'happy', spark: true });
  j(38.35, 38.8, 420, 1482 - 0, { h: 120, scroll: true });
  pz(38.8, 40.2, { eyes: 'd', nod: true }); pz(40.24, 41.5, { eyes: 'happy', heart: true });
  const tileY = [472, 702, 932, 1162], wt = [Wd('v11', 0), Wd('v11', 2), Wd('v11', 3), Wd('v11', 4)];
  for (let i = 0; i < 4; i++) j(wt[i] - .36, wt[i], 760, tileY[i], { h: i ? 70 : 140 });
  pz(46.52, 47.6, { eyes: 'happy', arms: 'up', spark: true });
  j(47.85, 48.3, 780, 662, { h: 130 });
  pz(49.28, 50.6, { eyes: 'u', arms: 'up' }); pz(50.92, 53.0, { eyes: 'happy', heart: true, spark: true });
  j(53.05, 53.45, 700, 842, { h: 130 });
  pz(53.6, 55.6, { eyes: 'happy', arms: 'up', spark: true });
  j(56.5, 56.95, 322, 1192, { h: 120 });
  pz(56.95, 57.4, { eyes: 'u' });
  MOVES.push([57.45, 58.7, 'ride', 0, 0, {}]);
  MOVES.push([58.7, 58.7, 'hide', 0, 0, {}]);
}
// the shared message: a card that flies from the contact up and out of frame
const flyPos = t => { const u = eio(seg(t, 57.45, 58.7)); return [lerp(322, 900, u) + Math.sin(u * 3) * 40, lerp(1192, -260, u) - Math.sin(u * Math.PI) * 120]; };

function mascotState(t) {
  let x = 540, y = 200, vis = false, scroll = false, st = { legs: 'stand', arms: 'down', eyes: 'n', sq: 0, flip: false, op: 1, scale: 1 };
  for (const [t0, t1, ty, tx, tyy, o] of MOVES) {
    if (t < t0) {
      if ((ty === 'jump') && t > t0 - .12 && vis) st.sq = .3 * Math.sin(Math.PI * seg(t, t0 - .12, t0));     // anticipation crouch
      break;
    }
    if (ty === 'hide') { vis = false; continue; }
    if (ty === 'pop' || ty === 'show') {
      vis = true; x = tx; y = tyy; scroll = !!o.scroll;
      if (t < t1) { const u = seg(t, t0, t1); st.scale = back(u); st.burst = u; }
      continue;
    }
    if (ty === 'ride') { if (t < t1) { [x, y] = flyPos(t); st.legs = 'stand'; st.arms = 'up'; st.eyes = 'happy'; st.ride = true; scroll = false; return { x, y, vis, scroll, st }; } continue; }
    const ox = x, oy = y;
    if (t < t1) {
      const u = seg(t, t0, t1);
      if (ty === 'jump') {
        const h = o.h ?? 100, uu = ss(u);
        x = lerp(ox, tx, uu); y = lerp(oy, tyy, uu) - h * 4 * u * (1 - u);
        st.legs = 'tuck'; st.arms = 'up'; st.sq = u < .5 ? -.18 * (1 - u * 2) : 0; st.flip = tx < ox;
      } else {
        x = lerp(ox, tx, u); y = lerp(oy, tyy, u);
        const step = Math.floor(t / (o.run ? .07 : .13)) % 2; st.legs = step ? 'walkA' : 'walkB'; st.flip = tx < ox; y -= step ? MPX * .5 : 0;
      }
      scroll = !!o.scroll || (scroll && !!o.scroll);
      return { x, y, vis, scroll: !!o.scroll, st };
    }
    x = tx; y = tyy; scroll = !!o.scroll;
    if (ty === 'jump' && t < t1 + .22) { const v = seg(t, t1, t1 + .22); st.sq = .32 * Math.sin(Math.PI * v) * (1 - v * .4); st.dust = v; }
  }
  return { x, y, vis, scroll, st };
}
function poseAt(t) {
  const p = {};
  for (const [a, b, e] of POSES) if (t >= a && t < b) Object.assign(p, e);
  return p;
}
function renderMascot(c, t) {
  const M = mascotState(t); if (!M.vis) return;
  const p = Object.assign({}, M.st), q = poseAt(t);
  if (!M.st.ride) Object.assign(p, q, { sq: (q.sq ?? 0) + M.st.sq, legs: M.st.legs, flip: M.st.flip });
  if (p.legs === 'tuck' || p.legs === 'walkA' || p.legs === 'walkB') { if (!q.arms || p.legs === 'tuck') p.arms = M.st.legs === 'tuck' ? 'up' : (q.arms || 'down'); }
  // idle: breathe on the beat, blink irregularly, dance
  const beat = .6, ph = (t % beat) / beat;
  if (p.legs === 'stand' && !p.sq) p.sq = .04 * Math.max(0, Math.sin(ph * Math.PI * 2));
  if (p.dance && p.legs === 'stand') { p.sq = .14 * Math.abs(Math.sin(ph * Math.PI)); p.flip = Math.floor(t / beat) % 2 === 1; }
  if (p.nod && p.legs === 'stand') { const nn = Math.sin(t * 9); p.eyes = nn > 0 ? 'd' : 'n'; p.sq = .08 * Math.max(0, nn); }
  if (!p.eyes || p.eyes === 'n') { const bt = (t * 1.0) % 3.7; if (bt > 3.55) p.eyes = 'blink'; else p.eyes = p.eyes || 'n'; }
  let { x, y } = M;
  if (M.scroll) y -= chatScroll(t);
  p.shadow = p.legs === 'stand' || p.legs?.startsWith('walk') ? 1 : 0;
  if (M.st.burst !== undefined && M.st.burst < 1) {           // pixel burst on appearing
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 30 + 90 * eo(M.st.burst); c.fillStyle = i % 2 ? C.mas : C.spark; c.globalAlpha = 1 - M.st.burst; c.fillRect(x + Math.cos(a) * d - 5, y - 50 + Math.sin(a) * d - 5, 10, 10); }
    c.globalAlpha = 1;
  }
  if (M.st.dust !== undefined) {
    const v = M.st.dust;
    for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1, k = (i >> 1) + 1, e = eo(v); const sz = 9 * (1 - v * .7); c.fillStyle = `rgba(190,180,165,${1 - v})`; c.fillRect(x + sd * (24 + k * 18) * e - sz / 2, y - (6 + k * 5) * Math.sin(Math.PI * v * .9) - sz, sz, sz); }
  }
  if (M.st.ride) {   // the message card it rides on
    c.save(); c.translate(x, y + 6); c.rotate(-.12); shadow(c, 20, 8, .2); rr(c, -80, 0, 160, 96, 16, '#fff'); noShadow(c);
    glyph(c, 'send', 0, 48, 70, C.blue); c.restore();
  }
  drawMascot(c, x, y, p);
  const top = y - 12 * MPX * (p.scale ?? 1) - 12;
  if (p.q) pixart(c, P_Q, x + 40, top - 70, 9, { k: C.eye });
  if (p.sweat) pixart(c, P_SWEAT, x + 58, top + 4 + 8 * (t % 1), 7, { b: '#7FB6E8' });
  if (p.heart) { const b = 1 + .15 * Math.sin(t * 10); pixart(c, P_HEART, x - 28 * b, top - 64, 8 * b, { r: '#E0543A' }); }
  if (p.spark) for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1, o = .5 + .5 * Math.sin(t * 7 + i * 2); pixart(c, P_SPARK, x + Math.cos(a) * 95 - 15, top + 30 + Math.sin(a) * 40 - 15, 6, { y: C.spark }, o); }
}

// ---------- the phone's screens ----------
const statusBar = (c, dark) => {
  const col = dark ? '#fff' : C.ink;
  txt(c, '10:24', 64, 34, F(700, 30), col);
  rr(c, SW - 116, 22, 50, 24, 6, null, col, 3); rr(c, SW - 112, 26, 34, 16, 3, col);
  for (let i = 0; i < 4; i++) rr(c, SW - 196 + i * 12, 40 - i * 6, 8, 8 + i * 6, 2, col);
};

// A: a photo of the envelope
function scrPhoto(c, t) {
  c.fillStyle = '#16181C'; c.fillRect(0, 0, SW, SH); statusBar(c, true);
  glyph(c, 'back', 50, 110, 60, '#fff');
  envelope(c, 68, 250, 600, 820, { blur: lerp(3.2, 1.3, seg(t, 2.6, 3.6)) });
  // a pixel magnifier hovering over the fine print, then tossed away
  const m0 = 3.0, toss = 4.8;
  if (t > m0) {
    let mx = 400 + 20 * Math.sin(t * 2.4), my = 470 + 14 * Math.cos(t * 3), rot = 0, op = ss(seg(t, m0, m0 + .3));
    if (t > toss) { const u = seg(t, toss, toss + .7); mx += 700 * u; my -= 520 * u - 900 * u * u; rot = u * 9; op *= 1 - seg(t, toss + .5, toss + .7); }
    if (op > 0) { c.save(); c.translate(mx + 45, my + 50); c.rotate(rot); pixart(c, P_MAG, -45, -50, 10, { k: '#3A3F45', w: 'rgba(200,225,255,.55)' }, op); c.restore(); }
  }
  // the promise: the fine print gets a sparkle as "the phone reads it"
  if (t > 6.12) { const o = ss(seg(t, 6.12, 6.5)); for (let i = 0; i < 5; i++) pixart(c, P_SPARK, 120 + i * 105, 500 + (i % 2) * 40 + 8 * Math.sin(t * 5 + i), 7, { y: C.spark }, o * (.5 + .5 * Math.sin(t * 6 + i))); }
}
// B: the gallery, four envelopes
const GCELL = [[32, 220], [384, 220], [32, 660], [384, 660]], GBAND = ['#2E9E6A', '#3B6FE0', '#E58A2B', '#8B5CC7'];
function scrGallery(c, t, intro) {
  c.fillStyle = C.bg; c.fillRect(0, 0, SW, SH); statusBar(c);
  txt(c, '사진', 40, 130, F(900, 60), C.ink);
  for (let i = 0; i < 4; i++) {
    const [gx, gy] = GCELL[i];
    if (i === 0 && intro < 1) { const u = eio(intro); envelope(c, lerp(68, gx, u), lerp(250, gy, u), lerp(600, 320, u), lerp(820, 400, u), { band: GBAND[0], blur: 1.3 }); continue; }
    c.globalAlpha = i === 0 ? 1 : ss(seg(intro, .4, 1)); envelope(c, gx, gy, 320, 400, { band: GBAND[i], blur: .8 }); c.globalAlpha = 1;
  }
}
// C: calling the son
function scrCall(c, t) {
  const g = c.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#2D3550'); g.addColorStop(1, '#1B2033'); c.fillStyle = g; c.fillRect(0, 0, SW, SH); statusBar(c, true);
  circ(c, 368, 330, 110, '#5B6A93'); txt(c, '아', 368, 334, F(900, 100), '#fff', 'center');
  txt(c, '아들', 368, 640, F(900, 92), '#fff', 'center');
  txt(c, '휴대전화', 368, 730, F(500, 40), 'rgba(255,255,255,.7)', 'center');
  circ(c, 368, 1180, 84, C.green); glyph(c, 'phone', 368, 1180, 90, '#fff');
}
// D: home screen
const APPS = [['전화', '#2FB36B', 'phone'], ['문자', '#F2B705', 'chat'], ['카메라', '#4B5563', 'cam'], ['사진', '#E8505B', 'photo'], ['시계', '#1F2937', 'clock'], ['설정', '#8B95A1', 'gear'], ['날씨', '#4FA3E3', 'spark'], ['AI 도우미', C.blue, 'spark'], ['캘린더', '#E8505B', 'cal']];
const APPX = [58, 283, 508], APPY = [400, 680, 960];
function scrHome(c, t) {
  const g = c.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#CFE3FF'); g.addColorStop(1, '#F5E7FF'); c.fillStyle = g; c.fillRect(0, 0, SW, SH); statusBar(c);
  // the assistant widget
  const pulse = t > 16.18 && t < 18.2 ? .5 + .5 * Math.sin((t - 16.18) * 8) : 0;
  shadow(c, 24, 8, .12); rr(c, 40, 150, 656, 150, 75, 'rgba(255,255,255,.92)'); noShadow(c);
  circ(c, 115, 225, 52 + pulse * 8, C.mas); glyph(c, 'mic', 115, 225, 70, '#fff');
  txt(c, '말로 물어보세요', 190, 226, F(700, 46), C.ink);
  for (let i = 0; i < 9; i++) {
    const [name, col, gl] = APPS[i], x = APPX[i % 3], y = APPY[Math.floor(i / 3)];
    let s = 1;
    if (name === 'AI 도우미' && t > Wd('v06', 4) - .1 && t < Wd('v06', 4) + .25) s = .9;
    c.save(); c.translate(x + 85, y + 85); c.scale(s, s);
    shadow(c, 18, 6, .15); rr(c, -85, -85, 170, 170, 42, col); noShadow(c);
    glyph(c, gl, 0, 0, 100, '#fff');
    c.restore();
    txt(c, name, x + 85, y + 215, F(700, 36), C.ink, 'center');
    if (name === 'AI 도우미' && t > 18.3 && t < 20.9) { c.save(); c.strokeStyle = C.mas; c.lineWidth = 8; c.globalAlpha = .5 + .5 * Math.sin(t * 8); c.beginPath(); c.roundRect(x - 12, y - 12, 194, 194, 50); c.stroke(); c.restore(); }
  }
}
// E: the AI chat app
const CHAT = { photo: [396, 200, 300, 360], q1: [, 590], ans1: [30, 720, 560, 440], q2: [, 1220], ans2: [30, 1350, 560, 300] };
const chatScroll = t => 480 * eio(seg(t, 36.35, 36.85));
function bubbleUser(c, s, yTop, o = 1) {
  c.font = F(700, 46); const w = c.measureText(s).width + 64;
  c.globalAlpha = o; rr(c, SW - 30 - w, yTop, w, 96, 48, C.blue); txt(c, s, SW - 30 - w / 2, yTop + 50, F(700, 46), '#fff', 'center'); c.globalAlpha = 1;
}
function answerCard(c, x, y, w, h, lines, o, t0, t, extra) {
  c.save(); c.globalAlpha = o; shadow(c, 26, 8, .12); rr(c, x, y, w, h, 34, '#fff'); noShadow(c); rr(c, x, y, w, h, 34, null, C.line, 2);
  circ(c, x + 52, y + 52, 26, C.blueL); glyph(c, 'spark', x + 52, y + 52, 34, C.blue); txt(c, 'AI 도우미', x + 92, y + 53, F(700, 30), C.grey);
  if (t < t0 + .1) { for (let i = 0; i < 3; i++) circ(c, x + 60 + i * 34, y + 130, 10, `rgba(107,114,128,${.3 + .7 * Math.abs(Math.sin(t * 6 + i))})`); }
  else lines.forEach(([s, f, col], i) => { const a = ss(seg(t, t0 + i * .18, t0 + i * .18 + .25)); c.globalAlpha = o * a; txt(c, s, x + 36, y + 130 + i * 74 + (1 - a) * 12, f, col); });
  c.globalAlpha = o; if (extra && t > t0 + .6) extra(c);
  c.restore();
}
function inputBar(c, t, att) {
  rr(c, 0, 1210, SW, SH - 1210, 0, C.bg); c.fillStyle = C.line; c.fillRect(0, 1210, SW, 2);
  circ(c, 90, 1290, 52, C.bg2); glyph(c, 'cam', 90, 1290, 62, C.ink);
  rr(c, 160, 1244, 410, 92, 46, C.bg2); txt(c, '메시지', 196, 1291, F(500, 38), '#9CA3AF');
  circ(c, 646, 1290, 52, C.blue); glyph(c, 'mic', 646, 1290, 64, '#fff');
  if (att > 0) {   // the photo attached, waiting above the bar
    c.save(); c.globalAlpha = ss(att); shadow(c, 20, 6, .15); rr(c, 40, 1010, 200, 180, 22, '#fff'); noShadow(c);
    envelope(c, 64, 1022, 140, 160, { blur: 1 }); circ(c, 222, 1026, 22, '#374151'); txt(c, '×', 222, 1028, F(700, 34), '#fff', 'center'); c.restore();
  }
}
function scrApp(c, t) {
  c.fillStyle = C.bg; c.fillRect(0, 0, SW, SH);
  const sc = chatScroll(t), sent = t >= 32.0;
  // conversation (scrolls)
  c.save(); c.beginPath(); c.rect(0, 170, SW, 1040); c.clip(); c.translate(0, -sc);
  if (!sent) {
    const o = 1 - ss(seg(t, 31.9, 32.1));
    txt(c, '무엇이든', SW / 2, 500, F(900, 64), C.ink, 'center'); txt(c, '물어보세요', SW / 2, 584, F(900, 64), C.ink, 'center');
    txt(c, '사진을 찍거나 말로 물어봐도 돼요', SW / 2, 670, F(500, 34), C.grey, 'center');
  } else {
    const u = eo(seg(t, 32.0, 32.35)), [px, py, pw, ph] = CHAT.photo;
    c.save(); c.globalAlpha = u; c.translate(0, (1 - u) * 300);
    shadow(c, 22, 8, .14); rr(c, px, py, pw, ph, 28, '#fff'); noShadow(c);
    envelope(c, px + 14, py + 14, pw - 28, ph - 28, { blur: 1, scan: seg(t, 32.35, 32.95) });
    bubbleUser(c, '이 약 어떻게 먹어?', 590, 1);
    c.restore();
    if (t > 32.85) {
      const [ax, ay, aw, ah] = CHAT.ans1;
      answerCard(c, ax, ay, aw, ah, [['하루 3번,', F(900, 56), C.ink], ['밥 먹고 30분 뒤', F(900, 56), C.ink], ['1알씩 드세요.', F(900, 56), C.ink], ['정확한 건 약사님께 꼭 확인하세요.', F(500, 30), C.grey]],
        ss(seg(t, 32.85, 33.05)), 32.95, t, c2 => { rr(c2, ax + 36, ay + ah - 92, 250, 64, 32, C.blueL); glyph(c2, 'speaker', ax + 82, ay + ah - 60, 40, C.blue); txt(c2, '읽어 주기', ax + 118, ay + ah - 59, F(700, 32), C.blue); });
    }
    if (t > 37.45) { const u2 = eo(seg(t, 37.45, 37.75)); c.save(); c.globalAlpha = u2; c.translate(0, (1 - u2) * 120); bubbleUser(c, '술 마셔도 돼?', CHAT.q2[1], 1); c.restore(); }
    if (t > 37.75) { const [ax, ay, aw, ah] = CHAT.ans2; answerCard(c, ax, ay, aw, ah, [['술은 피하세요.', F(900, 56), C.ink], ['약사님께도 꼭 물어보세요.', F(500, 30), C.grey]], ss(seg(t, 37.75, 37.95)), 38.3, t); }
  }
  c.restore();
  // header
  c.fillStyle = C.bg; c.fillRect(0, 0, SW, 170); statusBar(c); glyph(c, 'back', 50, 116, 56, C.ink);
  txt(c, 'AI 도우미', SW / 2, 116, F(900, 44), C.ink, 'center'); c.fillStyle = C.line; c.fillRect(0, 168, SW, 2);
  inputBar(c, t, t > 26.45 && t < 32.0 ? seg(t, 26.45, 26.7) : 0);
  // listening panel
  const L1 = [27.1, 32.0], L2 = [36.85, 37.45];
  for (const [a, b] of [L1, L2]) {
    if (t < a || t > b + .25) continue;
    const u = eo(seg(t, a, a + .3)) * (1 - eo(seg(t, b, b + .25))), y0 = lerp(SH, 980, u);
    shadow(c, 30, -6, .12); rr(c, 0, y0, SW, SH - y0 + 40, [40, 40, 0, 0], '#fff'); noShadow(c);
    const pr = 80 + 10 * Math.abs(Math.sin(t * 7));
    circ(c, SW / 2, y0 + 130, pr + 24, 'rgba(59,111,224,.15)'); circ(c, SW / 2, y0 + 130, 80, C.blue); glyph(c, 'mic', SW / 2, y0 + 130, 100, '#fff');
    for (let i = 0; i < 9; i++) { const hgt = 16 + 40 * Math.abs(Math.sin(t * 9 + i * 1.3)) * (t > a + .4 ? 1 : 0); rr(c, SW / 2 - 200 + i * 50, y0 + 255 - hgt / 2, 16, hgt, 8, C.blue); }
    let said = '';
    if (a === L1[0]) { const ws = ['이', '약', '어떻게', '먹어?']; ws.forEach((w, i) => { if (t >= Wd('q01', i)) said += (said ? ' ' : '') + w; }); }
    else if (t > a + .2) said = '술 마셔도 돼?';
    txt(c, said || '듣고 있어요…', SW / 2, y0 + 335, said ? F(900, 54) : F(500, 40), said ? C.ink : C.grey, 'center');
  }
  // camera viewfinder (opens out of the camera button, closes into the attached photo)
  if (t > 22.5 && t < 26.6) {
    const op = eo(seg(t, 22.5, 22.85)), cl = eo(seg(t, 26.3, 26.55));
    const x0 = lerp(38, 0, op), y0 = lerp(1238, 0, op), x1 = lerp(142, SW, op), y1 = lerp(1342, SH, op);
    const fx0 = lerp(x0, 40, cl), fy0 = lerp(y0, 1010, cl), fx1 = lerp(x1, 240, cl), fy1 = lerp(y1, 1190, cl);
    c.save(); c.beginPath(); c.roundRect(fx0, fy0, fx1 - fx0, fy1 - fy0, lerp(52, 0, op)); c.clip();
    c.translate(fx0, fy0); c.scale((fx1 - fx0) / SW, (fy1 - fy0) / SH);
    c.fillStyle = '#0E0F12'; c.fillRect(0, 0, SW, SH);
    c.fillStyle = '#B98B5E'; c.fillRect(0, 140, SW, 1010);
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(90,60,30,${.08 + .04 * (i % 2)})`; c.fillRect(0, 140 + i * 170, SW, 60); }
    const fill = eio(seg(t, Wd('v07', 4) - .1, Wd('v07', 4) + .5));
    const ex = lerp(190, 64, fill), ey = lerp(340, 190, fill), ew = lerp(356, 608, fill), eh = lerp(480, 830, fill);
    c.save(); c.translate(ex + ew / 2, ey + eh / 2); c.rotate(lerp(-.08, 0, fill)); envelope(c, -ew / 2, -eh / 2, ew, eh, { blur: 1.1 }); c.restore();
    if (fill > .6) { c.strokeStyle = C.spark; c.lineWidth = 8; const k = 60, b = [40, 170, SW - 40, 1120]; c.globalAlpha = ss(seg(fill, .6, 1));
      for (const [x, y, dx, dy] of [[b[0], b[1], 1, 1], [b[2], b[1], -1, 1], [b[0], b[3], 1, -1], [b[2], b[3], -1, -1]]) { c.beginPath(); c.moveTo(x, y + dy * k); c.lineTo(x, y); c.lineTo(x + dx * k, y); c.stroke(); } c.globalAlpha = 1; }
    txt(c, '사진', SW / 2, 80, F(700, 36), '#fff', 'center');
    const press = t > SHUT() - .05 && t < SHUT() + .15 ? .88 : 1;
    circ(c, SW / 2, 1270, 74, null, '#fff', 8); circ(c, SW / 2, 1270, 60 * press, '#fff');
    const fl = t > SHUT() ? 1 - seg(t, SHUT(), SHUT() + .3) : 0;
    if (fl > 0) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(0, 0, SW, SH); }
    c.restore();
  }
}
// F: a memo with the four steps
const TILES = [['앱 열기', 'spark'], ['찰칵 찍기', 'cam'], ['마이크로 묻기', 'mic'], ['끝! 답 듣기', 'check']], TILEY = [330, 560, 790, 1020];
function scrMemo(c, t) {
  c.fillStyle = '#FFF9EC'; c.fillRect(0, 0, SW, SH); statusBar(c);
  txt(c, '메모', 40, 110, F(700, 36), C.grey);
  txt(c, '약 봉투 읽는 법', 40, 210, F(900, 62), C.ink);
  const hit = [Wd('v11', 0), Wd('v11', 2), Wd('v11', 3), Wd('v11', 4)];
  for (let i = 0; i < 4; i++) {
    const y = TILEY[i], on = t > hit[i] - .02, pop = on ? 1 + .05 * Math.sin(Math.PI * seg(t, hit[i], hit[i] + .25)) : 1;
    const a = ss(seg(t, 41.7 + i * .12, 41.95 + i * .12));
    c.save(); c.globalAlpha = a; c.translate(SW / 2, y + 100); c.scale(pop, pop); c.translate(-SW / 2, -(y + 100));
    shadow(c, 18, 6, .1); rr(c, 48, y, 640, 200, 36, on ? '#fff' : '#FFFDF7'); noShadow(c);
    rr(c, 48, y, 640, 200, 36, null, on ? C.mas : '#EADFC8', on ? 7 : 3);
    circ(c, 140, y + 100, 56, on ? C.mas : '#F1E6D0'); glyph(c, TILES[i][1], 140, y + 100, 64, on ? '#fff' : C.grey);
    txt(c, ['①', '②', '③', '④'][i] + ' ' + TILES[i][0], 222, y + 102, F(900, 50), C.ink);
    c.restore();
  }
}
// G: lock screen with tomorrow's reminder
function scrLock(c, t) {
  const g = c.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#FFD9B8'); g.addColorStop(1, '#C9B8F2'); c.fillStyle = g; c.fillRect(0, 0, SW, SH); statusBar(c);
  txt(c, '10:24', SW / 2, 290, F(700, 170), '#fff', 'center'); txt(c, '11월 18일 화요일', SW / 2, 410, F(700, 40), '#fff', 'center');
  const u = back(seg(t, 47.75, 48.15));
  c.save(); c.translate(SW / 2, 635); c.scale(lerp(.8, 1, u), lerp(.8, 1, u)); c.globalAlpha = clamp(u); c.translate(-SW / 2, -635);
  shadow(c, 26, 10, .16); rr(c, 40, 520, 656, 230, 40, 'rgba(255,255,255,.95)'); noShadow(c);
  rr(c, 76, 556, 60, 60, 16, '#E8505B'); glyph(c, 'cal', 106, 588, 44, '#fff');
  txt(c, '캘린더 · 내일', 156, 588, F(700, 30), C.grey);
  txt(c, '내일 오전 10시 · 병원 진료', 76, 660, F(900, 44), C.ink);
  txt(c, '약 봉투 받으면 AI한테 물어보기', 76, 714, F(500, 36), '#374151');
  c.restore();
}
// H: the end card — subscribe and share
function scrEnd(c, t) {
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, SW, SH); statusBar(c);
  circ(c, SW / 2, 380, 120, '#FFF1E6'); drawMascot(c, SW / 2, 446, { eyes: 'happy', arms: 'up', scale: 1.1 });
  txt(c, '쉬운 휴대폰 꿀팁', SW / 2, 556, F(900, 58), C.ink, 'center');
  const subT = Wd('v13', 0) + .25, done = t > subT;
  const press = t > subT - .08 && t < subT + .12 ? .94 : 1;
  c.save(); c.translate(SW / 2, 760); c.scale(press, press);
  rr(c, -200, -60, 400, 120, 60, done ? '#E5E7EB' : C.red); txt(c, done ? '구독중' : '구독', done ? -10 : 0, 2, F(900, 54), done ? C.ink : '#fff', 'center');
  if (done) glyph(c, 'bell', 96, 0, 44, C.ink);
  c.restore();
  // share sheet
  const sh0 = Wd('v13', 4) - .3;
  if (t > sh0) {
    const u = eo(seg(t, sh0, sh0 + .35)), y0 = lerp(SH, 900, u);
    shadow(c, 30, -6, .14); rr(c, 0, y0, SW, SH - y0 + 40, [40, 40, 0, 0], '#fff'); noShadow(c);
    if (t > 58.6) txt(c, '보냈어요 ✓', 40, y0 + 80, F(900, 46), C.green); else txt(c, '보내기', 40, y0 + 80, F(900, 46), C.ink);
    const people = [['엄마', '#FFB37A'], ['아빠', '#8EC5FF'], ['가족방', '#B9E4A8']];
    people.forEach(([n, col], i) => { const x = 150 + i * 218; circ(c, x, y0 + 220, 70, col); txt(c, n[0], x, y0 + 222, F(900, 56), '#fff', 'center'); txt(c, n, x, y0 + 340, F(700, 38), C.ink, 'center');
      if (i === 0 && t > 57.3) { circ(c, x + 50, y0 + 170, 26, C.green); glyph(c, 'check', x + 50, y0 + 170, 34, '#fff'); } });
  }
}

// which screen, with transitions inside the phone
function drawScreen(c, t) {
  const slide = (A, B, t0, d = .4) => { const u = eio(seg(t, t0, t0 + d)); c.save(); c.translate(-SW * .3 * u, 0); A(c, t); c.restore(); c.save(); c.translate(SW * (1 - u), 0); shadow(c, 40, 0, .25); c.fillStyle = '#fff'; c.fillRect(0, 0, SW, SH); noShadow(c); B(c, t); c.restore(); };
  if (t < 7.2) return scrPhoto(c, t);
  if (t < 11.9) return scrGallery(c, t, seg(t, 7.2, 7.7));
  if (t < 12.3) return slide((c2, tt) => scrGallery(c2, tt, 1), scrCall, 11.9);
  if (t < 14.5) return scrCall(c, t);
  if (t < 14.9) return slide(scrCall, scrHome, 14.5);
  if (t < 20.95) return scrHome(c, t);
  if (t < 21.5) {   // app opens out of its icon
    scrHome(c, t); const u = eio(seg(t, 20.95, 21.45)), ix = APPX[1], iy = APPY[2];
    const x0 = lerp(ix, 0, u), y0 = lerp(iy, 0, u), x1 = lerp(ix + 170, SW, u), y1 = lerp(iy + 170, SH, u);
    c.save(); c.beginPath(); c.roundRect(x0, y0, x1 - x0, y1 - y0, lerp(42, 0, u)); c.clip(); c.translate(x0, y0); c.scale((x1 - x0) / SW, (y1 - y0) / SH); scrApp(c, t); c.restore(); return;
  }
  if (t < 41.55) return scrApp(c, t);
  if (t < 41.95) { const u = eio(seg(t, 41.55, 41.95)); scrApp(c, t); c.save(); c.translate(0, SH * (1 - u)); scrMemo(c, t); c.restore(); return; }
  if (t < 47.6) return scrMemo(c, t);
  if (t < 48.0) return slide(scrMemo, scrLock, 47.6);
  if (t < 52.9) return scrLock(c, t);
  if (t < 53.3) return slide(scrLock, scrEnd, 52.9);
  return scrEnd(c, t);
}

// ---------- the touch dot (the user) ----------
let TAPS = [];
function buildTaps() {
  TAPS = [[Wd('v06', 4), 540, 1187], [VO.v07 + .05, 262, 1432], [SHUT(), 540, 1412], [VO.v08 + .05, 818, 1432], [31.95, 540, 1252],
    [36.75, 818, 1432], [37.45, 540, 1252], [Wd('v13', 0) + .25, 540, 902], [57.3, 322, 1262]];
}
function drawTouch(c, t) {
  for (const [tt, x, y] of TAPS) {
    if (t < tt - .7 || t > tt + .6) continue;
    const u = eo(seg(t, tt - .7, tt - .12)), sx = lerp(x + 140, x, u), sy = lerp(y + 200, y, u);
    const a = ss(seg(t, tt - .7, tt - .5)) * (1 - ss(seg(t, tt + .3, tt + .6))), press = t > tt - .06 && t < tt + .1 ? .8 : 1;
    if (t > tt) { const v = seg(t, tt, tt + .45); c.strokeStyle = `rgba(255,255,255,${(1 - v) * .9})`; c.lineWidth = 6; c.beginPath(); c.arc(x, y, 36 + 70 * eo(v), 0, 7); c.stroke(); }
    c.save(); c.globalAlpha = a; shadow(c, 14, 4, .25); circ(c, sx, sy, 38 * press, 'rgba(255,255,255,.7)', 'rgba(80,90,110,.55)', 4); noShadow(c); c.restore();
  }
  // the call that isn't made: the dot goes to the call button, hesitates, and leaves
  if (t > 12.2 && t < 14.4) {
    const [bx, by] = wpt(368, 1180);
    let x, y;
    if (t < 13.1) { const u = eo(seg(t, 12.2, 13.1)); x = lerp(bx + 260, bx + 10, u); y = lerp(by + 300, by + 30, u); }
    else if (t < 13.6) { x = bx + 10 + 8 * Math.sin(t * 20); y = by + 30 + 5 * Math.cos(t * 17); }
    else { const u = ss(seg(t, 13.6, 14.3)); x = lerp(bx + 10, bx + 300, u); y = lerp(by + 30, by + 290, u); }
    const a = ss(seg(t, 12.2, 12.4)) * (1 - ss(seg(t, 14.0, 14.4)));
    c.save(); c.globalAlpha = a; circ(c, x, y, 38, 'rgba(255,255,255,.7)', 'rgba(80,90,110,.55)', 4); c.restore();
  }
}

// ---------- HUD (screen space) ----------
let REG = [];
const STEPS = [[18.2, 22.2, '①', '앱 열기'], [22.2, 26.7, '②', '사진 찍기'], [26.7, 32.0, '③', '마이크로 묻기'], [32.0, 41.6, '④', '답 듣기']];
function stepPill(c, t) {
  for (const [a, b, n, s] of STEPS) {
    const u = ss(seg(t, a, a + .3)) * (1 - ss(seg(t, b - .2, b))); if (u <= 0) continue;
    c.font = F(900, 50); const w = c.measureText(s).width + 160, x = W / 2 - w / 2, y = 34 - (1 - u) * 40;
    c.save(); c.globalAlpha = u; shadow(c, 20, 6, .15); rr(c, x, y, w, 96, 48, 'rgba(255,255,255,.94)'); noShadow(c);
    circ(c, x + 56, y + 48, 32, C.blue); txt(c, n, x + 56, y + 50, F(900, 40), '#fff', 'center'); txt(c, s, x + 100, y + 50, F(900, 50), C.ink);
    c.restore();
    REG.push({ id: 'step', text: n + ' ' + s, x0: x, y0: y, x1: x + w, y1: y + 96 });
  }
}
const CAPS = [[.25, 2.75, '약 봉투 글씨,\n보이세요?'], [2.75, 5.3, '이제 돋보기\n찾지 마세요.'], [5.3, 7.3, '휴대폰이 읽어 줘요!'], [7.3, 9.06, '약 봉투가 서너 개면,'],
  [9.06, 11.85, '아침 약인지 저녁 약인지\n헷갈리죠.'], [11.85, 14.55, '자식한테 매번\n묻기도 미안하고요.'], [14.55, 18.35, '이제 글자 칠 필요 없이,\n말로 물어보세요.'],
  [18.35, 22.25, '먼저 챗GPT나 제미나이 같은\nAI 앱을 여세요.'], [22.25, 26.85, '카메라를 누르고,\n약 봉투를 꽉 차게 대고, 찰칵!'], [26.85, 30.35, '마이크를 누르고,\n말하듯이 물어보세요.'],
  [30.35, 32.4, '“이 약 어떻게 먹어?”'], [33.15, 36.3, '그러면 크고 쉬운 말로\n알려 줘요.'], [36.35, 39.2, '궁금한 건 또 물어보세요.'], [39.2, 41.75, '몇 번을 물어도 괜찮아요.'],
  [41.75, 47.75, '앱 열고, 찰칵, 마이크.\n끝! 쉽죠?'], [47.75, 50.85, '내일 병원 가시면\n꼭 써 보세요.'], [50.85, 53.15, '충분히 하실 수 있어요!'],
  [53.15, 56.25, '구독하시면 꿀팁\n계속 알려 드려요.'], [56.25, 59.7, '부모님께도\n꼭 보내 드리세요!']];
window.CAPS = CAPS;
function caption(c, t) {
  for (const [a, b, s] of CAPS) {
    if (t < a || t >= b) continue;
    const u = ss(seg(t, a, a + .12)), L = s.split('\n'); c.font = F(900, 56);
    const w = Math.max(...L.map(l => c.measureText(l).width)) + 80, h = L.length * 72 + 44, y = 1745 - h / 2;
    c.save(); c.globalAlpha = u; shadow(c, 24, 8, .2); rr(c, W / 2 - w / 2, y, w, h, 36, 'rgba(255,255,255,.95)'); noShadow(c);
    L.forEach((l, i) => txt(c, l, W / 2, y + 22 + 36 + i * 72, F(900, 56), s.startsWith('“') ? C.blue : C.ink, 'center'));
    c.restore();
  }
}
function safety(c, t) {
  const u = ss(seg(t, 33.0, 33.3)) * (1 - ss(seg(t, 41.3, 41.6))); if (u <= 0) return;
  const s = '※ 정확한 복용법은 약사·의사와 꼭 확인하세요'; c.font = F(700, 34); const w = c.measureText(s).width + 56, y = 1580;
  c.save(); c.globalAlpha = u; rr(c, W / 2 - w / 2, y, w, 62, 31, 'rgba(31,35,40,.86)'); txt(c, s, W / 2, y + 32, F(700, 34), '#FFE08A', 'center'); c.restore();
  REG.push({ id: 'safety', text: s, x0: W / 2 - w / 2, y0: y, x1: W / 2 + w / 2, y1: y + 62 });
}
function spotlight(c, t, K) {
  const a = ss(seg(t, 33.4, 33.8)) * (1 - ss(seg(t, 35.6, 36.1))); if (a <= 0) return;
  const [cx, cy] = toScr(K, SX + 310, SY + 940);
  const g = c.createRadialGradient(cx, cy, 300 * K.z, cx, cy, 760 * K.z); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,12,20,${.5 * a})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// register texts the viewer must read (world → screen boxes) for the reading-time check
function regTexts(t, K) {
  const box = (id, s, x0, y0, x1, y1, pass) => { const [a, b] = toScr(K, x0, y0), [c2, d] = toScr(K, x1, y1); REG.push({ id, text: s, x0: a, y0: b, x1: c2, y1: d, ...(pass ? { pass: true } : {}) }); };
  if (t >= 14.9 && t < 20.95) box('widget', '말로 물어보세요', SX + 190, SY + 200, SX + 560, SY + 252);
  if (t >= 33.2 && t < 41.55) { const sc = chatScroll(t); box('ans1', '하루 3번, 밥 먹고 30분 뒤 1알씩 드세요.', SX + 66, SY + 820 - sc, SX + 520, SY + 1050 - sc); }
  if (t >= 38.5 && t < 41.55) { const sc = chatScroll(t); box('ans2', '술은 피하세요.', SX + 66, SY + 1450 - sc, SX + 420, SY + 1510 - sc); }
  if (t >= 41.95 && t < 47.6) for (let i = 0; i < 4; i++) box('tile' + i, TILES[i][0], SX + 222, SY + TILEY[i] + 70, SX + 600, SY + TILEY[i] + 130);
  if (t >= 48.15 && t < 52.9) { box('notif1', '내일 오전 10시 · 병원 진료', SX + 76, SY + 636, SX + 640, SY + 684); box('notif2', '약 봉투 받으면 AI한테 물어보기', SX + 76, SY + 694, SX + 640, SY + 734); }
  if (t >= 53.3) box('endtitle', '쉬운 휴대폰 꿀팁', SX + 140, SY + 526, SX + 596, SY + 586);
}

// ---------- frame ----------
function wallpaper(c) {
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#FFE6CF'); g.addColorStop(.55, '#FDE7EF'); g.addColorStop(1, '#E6E0FA'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 26; i++) { const x = hash(i) * W, y = hash(i + 50) * H, r = 20 + 60 * hash(i + 99); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
}
let WALL, ZOOM = 1;
function render(t) {
  REG = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const K = cam(t), spd = camSpeed(t); ZOOM = K.z;
  // world layer
  ctx.save();
  ctx.setTransform(K.z, 0, 0, K.z, 540 - K.x * K.z, 840 - K.y * K.z);
  ctx.drawImage(WALL, -2000, -2000, W + 4000, H + 4000);
  shadow(ctx, 60, 24, .3); rr(ctx, PH.x, PH.y, PH.w, PH.h, PH.r, '#1E1E22'); noShadow(ctx);
  rr(ctx, PH.x + 6, PH.y + 6, PH.w - 12, PH.h - 12, PH.r - 6, null, '#3A3A42', 3);
  ctx.save(); ctx.beginPath(); ctx.roundRect(SX, SY, SW, SH, SR); ctx.clip(); ctx.translate(SX, SY); drawScreen(ctx, t); ctx.restore();
  circ(ctx, 540, 178, 15, '#0B0B0D');
  renderMascot(ctx, t);
  drawTouch(ctx, t);
  ctx.restore();
  regTexts(t, K);
  // motion blur on whips only: smear the finished world layer
  if (spd > 900) { const b = Math.min(10, (spd - 900) / 140); ctx.save(); ctx.globalAlpha = .45; ctx.filter = `blur(${b}px)`; ctx.drawImage(cv, 0, 0); ctx.restore(); ctx.filter = 'none'; }
  spotlight(ctx, t, K);
  stepPill(ctx, t); safety(ctx, t); caption(ctx, t);
}
window.render = render;
window.TEXTS = t => { render(t); return REG; };

// ---------- sound events ----------
function buildEvents() {
  const E = [];
  for (const [id, t] of Object.entries(VO)) E.push({ t, type: 'vo', id });
  for (const [t] of TAPS) E.push({ t, type: 'tap' });
  for (const t of [7.2, 11.9, 14.5, 41.55, 47.6, 52.9]) E.push({ t, type: 'swish' });
  E.push({ t: 20.95, type: 'open' });
  E.push({ t: 3.0, type: 'blip', f: 1 }); E.push({ t: 3.85, type: 'pop' }); E.push({ t: 4.8, type: 'toss' });
  E.push({ t: 6.12, type: 'sparkle' }); E.push({ t: 10.4, type: 'qblip' });
  for (const [t0, t1, ty, , , o] of MOVES) { if (ty === 'jump') { E.push({ t: t0, type: 'jump' }); E.push({ t: t1, type: 'land' }); } if (ty === 'show') E.push({ t: t0, type: 'pop' }); if (ty === 'hide') E.push({ t: t0, type: 'unpop' }); if (ty === 'walk') for (let s = t0; s < t1; s += o.run ? .07 : .13) E.push({ t: s, type: 'step8' }); if (ty === 'ride') E.push({ t: t0, type: 'send' }); }
  E.push({ t: 22.5, type: 'open' }); E.push({ t: SHUT(), type: 'shutter' }); E.push({ t: 26.3, type: 'close' });
  E.push({ t: 27.1, type: 'micon' }); E.push({ t: 31.95, type: 'micoff' }); E.push({ t: 36.85, type: 'micon' }); E.push({ t: 37.45, type: 'micoff' });
  E.push({ t: 32.0, type: 'whoosh' }); E.push({ t: 32.95, type: 'chime' }); E.push({ t: 38.3, type: 'chime' }); E.push({ t: 37.45, type: 'whoosh' });
  E.push({ t: 32.0, type: 'drop' }); E.push({ t: 32.9, type: 'back' });
  [Wd('v11', 0), Wd('v11', 2), Wd('v11', 3), Wd('v11', 4)].forEach((t, i) => E.push({ t, type: 'hop', n: i }));
  E.push({ t: 47.75, type: 'notif' }); E.push({ t: 40.24, type: 'heart' }); E.push({ t: 50.92, type: 'heart' }); E.push({ t: 53.6, type: 'sparkle' });
  E.push({ t: Wd('v13', 4) - .3, type: 'open' }); E.push({ t: 58.6, type: 'done' });
  E.push({ t: 18.2, type: 'chapter' }); E.push({ t: 22.2, type: 'chapter' }); E.push({ t: 26.7, type: 'chapter' }); E.push({ t: 32.0, type: 'chapter' });
  window.EV = E.sort((a, b) => a.t - b.t);
}

(async () => {
  WORDS = await (await fetch('voices/words.json')).json();
  await Promise.all([document.fonts.load(F(900, 56), '가'), document.fonts.load(F(700, 40), '가'), document.fonts.load(F(500, 40), '가')]);
  WALL = document.createElement('canvas'); WALL.width = W; WALL.height = H; wallpaper(WALL.getContext('2d'));
  buildMascot(); buildTaps(); buildEvents();
  window.READY = true;
})();
