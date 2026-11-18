// 우리 동네 빵집의 하루 — Watercolor Brush. One painted sheet: a bakery from 05:00 to 21:00.
// Everything is a pure function of t; anything random runs under withSeed.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
window.DUR = 30;
const BEAT = 60 / 96;
let PAPER_IMG;

// ---------- wash helpers ----------
function washPoly(c, pts, fill, a, passes = 3, jit = 4) {
  for (let p = 0; p < passes; p++) {
    c.beginPath();
    pts.forEach(([x, y], i) => { const xx = x + (i % 2 ? rnd(-jit, jit) : 0), yy = y + (i % 3 === 0 ? rnd(-jit, jit) : 0); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); });
    c.closePath(); c.globalAlpha = a / passes * 1.6; c.fillStyle = fill; c.fill();
  }
  c.globalAlpha = 1;
}
const wash = (c, pts, fill, a, seed, passes = 3, jit = 4) => withSeed(seed, () => washPoly(c, pts, fill, a, passes, jit));
function rectPts(x0, y0, x1, y1, wob = 6, seed = 1, st = 18) {
  const P = [], n = u => (vnoise(seed * 13.1 + u * .023) - .5) * 2 * wob;
  for (let x = x0; x < x1; x += st) P.push([x, y0 + n(x)]);
  for (let y = y0; y < y1; y += st) P.push([x1 + n(y + 500), y]);
  for (let x = x1; x > x0; x -= st) P.push([x, y1 + n(x + 900)]);
  for (let y = y1; y > y0; y -= st) P.push([x0 + n(y + 1400), y]);
  return P;
}
function ellPts(cx, cy, rx, ry, wob = .08, seed = 1, n = 44) {
  const P = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 1 + (vnoise(seed * 7.3 + i * .45) - .5) * 2 * wob; P.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  return P;
}
// brush-edge wipe: clip to the part of a box revealed so far ('lr' left→right, 'tb' top→bottom)
function wipe(c, p, x0, y0, x1, y1, dir = 'lr', seed = 3) {
  c.beginPath();
  if (dir === 'lr') {
    const e = lerp(x0 - 120, x1 + 120, eio(p));
    c.moveTo(x0 - 200, y0 - 200);
    for (let y = y0 - 200; y <= y1 + 200; y += 20) c.lineTo(e + (vnoise(seed + y * .012) - .5) * 160, y);
    c.lineTo(x0 - 200, y1 + 200);
  } else {
    const e = lerp(y0 - 120, y1 + 120, eio(p));
    c.moveTo(x0 - 200, y0 - 200);
    for (let x = x0 - 200; x <= x1 + 200; x += 20) c.lineTo(x, e + (vnoise(seed + x * .012) - .5) * 160);
    c.lineTo(x1 + 200, y0 - 200);
  }
  c.closePath(); c.clip();
}
const fade2 = (t, a, b, fi = .5, fo = .5) => ss(seg(t, a, a + fi)) * (1 - ss(seg(t, b - fo, b)));

// ---------- time of day ----------
function keyCol(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) return mixc(keys[i][1], keys[i + 1][1], ss(seg(t, keys[i][0], keys[i + 1][0])));
  return keys[keys.length - 1][1];
}
const SKY_TOP = [[7.5, '#34405c'], [10.0, '#8f9cba'], [12.5, '#a9c4d8'], [17.5, '#9cbfd9'], [20.5, '#b4b6c6'], [22.8, '#6e6a8c'], [24.5, '#2c3552']];
const SKY_BOT = [[7.5, '#6a6f8a'], [10.0, '#efc3a8'], [12.5, '#efe2c4'], [17.5, '#e6e6d0'], [20.5, '#f0c98f'], [22.8, '#e3977e'], [24.5, '#4f5675']];
const NIGHT = t => t < 11.5 ? 1 - ss(seg(t, 7.5, 11.5)) : ss(seg(t, 21.8, 24.5));
const UPPER_LIT = t => ss(seg(t, 22.6, 22.75));                 // the flat upstairs: light on at 21:00

// ---------- camera ----------
// keys: [t, cx, cy, z]; zoom interpolated in log space
const CAM = [[0, 840, 672, 7], [2.8, 840, 672, 6.4], [7.6, 960, 560, 1], [12.4, 960, 560, 1], [17.2, 850, 705, 1.85], [17.8, 850, 705, 1.85], [20.4, 960, 575, 1], [24.9, 960, 575, 1], [29.2, 925, 785, 3.6], [30, 925, 785, 3.6]];
const camX = monotone(CAM.map(k => [k[0], k[1]])), camY = monotone(CAM.map(k => [k[0], k[2]])), camZ = monotone(CAM.map(k => [k[0], Math.log(k[3])]));
const cam = t => ({ x: camX(t), y: camY(t), z: Math.exp(camZ(t)) });
const toScr = (C, x, y) => [W / 2 + (x - C.x) * C.z, H / 2 + (y - C.y) * C.z];

// ---------- world layout ----------
const VIG = [70, 215, 1850, 1000];          // the painted area of the sheet; outside it is bare paper
const GROUND = 840;
const SHOP = [560, 300, 1360, GROUND], WIN = [620, 575, 1080, 820], DOOR = [1120, 575, 1260, GROUND];
const OVEN = { x0: 770, x1: 910, y0: 590, y1: 700, mx: 840, my: 668 };
const SHELF1 = 745, SHELF2 = 812;
const HERO = { x: 860, y: SHELF2 };

// ---------- bread ----------
function breadDraw(c, k, x, y, sc, p, al, seed) {
  if (p <= 0 || al <= 0) return;
  withSeed(seed, () => {
    c.save(); c.translate(x, y); c.globalAlpha = 1;
    const A = al * ss(p);
    if (k === 'bun') {
      washPoly(c, ellPts(0, -19 * sc, 34 * sc, 20 * sc, .06, seed), '#d9944a', .75 * A, 3, 1.2 * sc);
      const S = [mk(qcurve(-26 * sc, -24 * sc, 26 * sc, -26 * sc, -12 * sc, 12), 13 * sc, '#a9622c', { prof: 'brush', nb: 4, a: .8 }),
                 mk(qcurve(-30 * sc, -6 * sc, 30 * sc, -6 * sc, 6 * sc, 12), 6 * sc, '#b8743a', { prof: 'even', nb: 0, a: .55 })];
      for (const s of S) drawS(c, s, seg(p, .35, 1), null, al);
      for (let i = 0; i < 6; i++) { const sx = rnd(-14, 14) * sc, sy = rnd(-33, -26) * sc; drawS(c, mk(qcurve(sx, sy, sx + 2.2 * sc, sy - .6 * sc, 0, 3), 2.4 * sc, '#f4e3c0', { prof: 'even', nb: 0, a: .9 }), seg(p, .7, 1), null, al); }
    } else if (k === 'bread') {
      washPoly(c, rectPts(-36 * sc, -34 * sc, 36 * sc, 0, 1.5 * sc, seed, 6 * sc), '#e7bf86', .75 * A, 3, 1 * sc);
      const S = [];
      for (let i = 0; i < 3; i++) { const cx = (-24 + i * 24) * sc; S.push(mk(qcurve(cx - 14 * sc, -34 * sc, cx + 14 * sc, -34 * sc, -14 * sc, 10), 12 * sc, '#a9622c', { prof: 'leaf', nb: 3, a: .82 })); }
      S.push(mk(qcurve(33 * sc, -32 * sc, 33 * sc, -2 * sc, 2 * sc, 8), 8 * sc, '#c98c4f', { prof: 'even', nb: 2, a: .6 }));
      for (const s of S) drawS(c, s, seg(p, .35, 1), null, al);
    } else {   // croissant: five swollen segments along an arc
      for (let i = 0; i < 5; i++) {
        const a0 = Math.PI * (1.08 + i * .168), a1 = a0 + .2, r = 28 * sc, w = [12, 20, 26, 20, 12][i] * sc;
        drawS(c, mk(qcurve(Math.cos(a0) * r, -4 * sc + Math.sin(a0) * r * .55 + 6 * sc, Math.cos(a1) * r, -4 * sc + Math.sin(a1) * r * .55 + 6 * sc, -w * .4, 8), w, i % 2 ? '#b8702f' : '#d48d45', { prof: 'leaf', nb: 3, a: .85 }), seg(p, i * .12, i * .12 + .5), null, al);
      }
    }
    drawS(c, mk(qcurve(-30 * sc, 1, 30 * sc, 1, 0, 8), 3 * sc, INK2, { prof: 'even', nb: 0, a: .35 }), seg(p, .6, 1), null, al);
    c.restore();
  });
}
// shelf loaves: [kind, x, shelf y, vanish time, seed]
const LOAVES = [
  ['bread', 680, SHELF1, 20.0, 11], ['croi', 780, SHELF1, 21.25, 12], ['bun', 870, SHELF1, 18.75, 13], ['bread', 960, SHELF1, 16.25, 14], ['croi', 1040, SHELF1, 20.625, 15],
  ['bun', 670, SHELF2, 19.375, 16], ['croi', 762, SHELF2, 21.875, 17], ['bun', HERO.x, SHELF2, 99, 18], ['bread', 960, SHELF2, 16.875, 19], ['bun', 1040, SHELF2, 22.5, 20],
];
const BURST = 12.5;

// ---------- people ----------
function figure(c, x, y, ph, sc, col, seed, al, bag) {
  if (al <= 0) return;
  withSeed(seed, () => {
    const sw = Math.sin(ph * Math.PI * 2), bob = Math.abs(Math.cos(ph * Math.PI * 2)) * 3 * sc;
    const hipY = y - 74 * sc + bob, shY = y - 146 * sc + bob, S = [];
    for (const s of [1, -1]) { const a = s * sw * .36; S.push(mk(qcurve(x, hipY, x + Math.sin(a) * 76 * sc, hipY + Math.cos(a) * 74 * sc, 0, 6), 13 * sc, '#4a4440', { prof: 'even', nb: 0, a: .85 })); }
    S.push(mk(qcurve(x, shY, x + 2 * sc, hipY + 14 * sc, 4 * sc, 8), 44 * sc, col, { prof: 'leaf', nb: 4, a: .85 }));
    const arms = [];
    for (const s of [1, -1]) { const a = -s * sw * .3; arms.push([x + Math.sin(a) * 60 * sc, shY + 8 * sc + Math.cos(a) * 60 * sc]); S.push(mk(qcurve(x, shY + 8 * sc, arms[arms.length - 1][0], arms[arms.length - 1][1], 0, 6), 11 * sc, mixc(col, '#2b2520', .3), { prof: 'even', nb: 0, a: .8 })); }
    S.push(mk(qcurve(x, shY - 36 * sc, x + sc, shY - 6 * sc, 0, 5), 30 * sc, '#d8a27c', { prof: 'leaf', nb: 0, a: .9 }));
    S.push(mk(qcurve(x - 12 * sc, shY - 34 * sc, x + 12 * sc, shY - 33 * sc, -9 * sc, 5), 14 * sc, '#3d3129', { prof: 'even', nb: 2, a: .85 }));
    for (const s of S) drawS(c, s, 1, null, al);
    if (bag) { const [bx, by] = arms[0]; washPoly(c, rectPts(bx - 13 * sc, by - 4 * sc, bx + 13 * sc, by + 30 * sc, 1.5, seed + 3, 5), '#c9a46c', .9 * al, 3, 1); }
  });
}
// walkers: [t0, x0, t1, x1, scale, colour, seed, bag, entersDoor]
const WALK = [
  [5.5, -60, 10.0, 1190, 1, '#8a6a5a', 41, false, true],
  [15.0, -80, 19.0, 1190, .95, '#7c8a5a', 42, false, true],
  [17.6, 2000, 24.0, -100, .95, '#9a6b5a', 43, true, false],
  [20.5, -80, 26.0, 2000, 1.05, '#5f7486', 44, false, false],
];
const STRIDE = 110;   // px of walk per gait cycle
function walkers(c, t) {
  for (const [t0, x0, t1, x1, sc, col, seed, bag, door] of WALK) {
    if (t < t0) continue;
    const u = Math.min(t, t1), x = lerp(x0, x1, seg(u, t0, t1)), ph = Math.abs(x - x0) / STRIDE;
    const al = door ? 1 - ss(seg(t, t1, t1 + .5)) : 1;
    if (t > t1 + .5 && door) continue;
    if (!door && t > t1) continue;
    figure(c, x, GROUND + 2, door && t > t1 ? 0 : ph, sc, col, seed, al, bag);
  }
}

// ---------- strokes built once ----------
let ST = {};
function build() {
  withSeed(101, () => {
    const B = ST.bricks = [];
    for (let i = 0; i < 170; i++) {
      const x = rnd(SHOP[0] + 14, SHOP[2] - 40), y = rnd(SHOP[1] + 40, GROUND - 30);
      const inWin = x > WIN[0] - 30 && x < WIN[2] + 10 && y > WIN[1] - 30 && y < WIN[3] + 20, inDoor = x > DOOR[0] - 50 && y > DOOR[1] - 30;
      const inSign = y > 350 && y < 560 && x > 590 && x < 1330, inUp = y < 470 && (x < 710 || x > 1210);
      if (inWin || inDoor || inSign || inUp) continue;
      B.push(mk(qcurve(x, y, x + rnd(22, 34), y + rnd(-1, 1), 0, 4), rnd(6, 9), pick(['#c48463', '#b9765a', '#cf9070']), { prof: 'even', nb: 2, a: rnd(.35, .6) }));
    }
  });
  withSeed(102, () => {
    ST.cornice = [mk(qcurve(SHOP[0] - 20, SHOP[1] + 6, SHOP[2] + 20, SHOP[1] + 4, 2, 30), 26, '#7b5845', { prof: 'even', nb: 7, a: .85 }),
                  mk(qcurve(SHOP[0] - 6, GROUND - 10, SHOP[2] + 6, GROUND - 12, 0, 30), 20, '#8d6a55', { prof: 'even', nb: 6, a: .75 })];
    // window frame (blue-grey) and shelves
    const [a, b, c, d] = WIN, F = '#5f7486';
    ST.frame = [mk(qcurve(a - 6, b, c + 6, b, 0, 16), 13, F, { prof: 'even', nb: 4 }), mk(qcurve(c, b - 4, c, d + 4, 0, 12), 13, F, { prof: 'even', nb: 4 }),
                mk(qcurve(c + 6, d, a - 6, d, 0, 16), 15, F, { prof: 'even', nb: 4 }), mk(qcurve(a, d + 4, a, b - 4, 0, 12), 13, F, { prof: 'even', nb: 4 })];
    ST.glint = [mk(qcurve(1000, 590, 940, 680, 0, 8), 10, '#fbf3e3', { prof: 'leaf', nb: 3, a: .55 }), mk(qcurve(1040, 600, 1005, 650, 0, 6), 6, '#fbf3e3', { prof: 'leaf', nb: 2, a: .5 })];
    ST.shelves = [mk(qcurve(a + 16, SHELF1 + 3, c - 16, SHELF1 + 3, 0, 14), 8, '#8a5a3c', { prof: 'even', nb: 3 }), mk(qcurve(a + 16, SHELF2 + 3, c - 16, SHELF2 + 3, 0, 14), 8, '#8a5a3c', { prof: 'even', nb: 3 })];
    // oven: brick arch around a glowing mouth
    const O = OVEN, ar = [];
    for (let i = 0; i <= 10; i++) { const an = Math.PI + i / 10 * Math.PI; ar.push([O.mx + Math.cos(an) * 64, O.my + Math.sin(an) * 52]); }
    ST.ovenArch = [];
    for (let i = 0; i < ar.length - 1; i++) ST.ovenArch.push(mk(qcurve(ar[i][0], ar[i][1], ar[i + 1][0], ar[i + 1][1], 0, 4), 16, pick(['#7b4a36', '#8d5a40']), { prof: 'even', nb: 3, a: .85 }));
    ST.ovenArch.push(mk(qcurve(O.mx - 70, O.my + 34, O.mx + 70, O.my + 34, 0, 10), 14, '#7b4a36', { prof: 'even', nb: 4, a: .85 }));
    // door
    const [d0, d1, d2] = DOOR, D = '#8a5a3c';
    ST.door = [mk(qcurve(d0, d1 + 4, d0, GROUND, 0, 10), 14, D, { prof: 'even', nb: 4 }), mk(qcurve(d2, d1 + 4, d2, GROUND, 0, 10), 14, D, { prof: 'even', nb: 4 }),
               mk(qcurve(d0 - 6, d1, d2 + 6, d1, 0, 10), 14, D, { prof: 'even', nb: 4 }), mk(qcurve(d2 - 24, 720, d2 - 24, 726, 0, 3), 9, INK2, { prof: 'even', nb: 0 })];
    ST.bell = [mk(qcurve(d0 + 6, d1 + 12, d0 + 6, d1 + 30, 0, 5), 16, '#c8442a', { prof: 'leaf', nb: 3, a: .95 })];
    // awning: sage stripes on bare paper, scalloped hem
    const AW = ST.awning = [];
    for (let x = 610; x < 1320; x += 80) AW.push(mk(qcurve(x + 20, 476, x + 20, 532, 0, 6), 40, '#9fb28a', { prof: 'even', nb: 6, a: .75 }));
    for (let x = 600; x < 1320; x += 40) AW.push(mk(qcurve(x + 4, 540, x + 36, 540, 10, 6), 9, x % 80 === 40 ? '#9fb28a' : '#7f9a6c', { prof: 'even', nb: 2, a: .7 }));
    AW.push(mk(qcurve(592, 472, 1328, 472, 0, 30), 10, '#4e6e3c', { prof: 'even', nb: 4, a: .85 }));
    // upper windows and neighbours' windows
    ST.upper = [];
    for (const x of [600, 1230]) { ST.upper.push(mk(qcurve(x, 350, x + 90, 350, 0, 6), 9, INK2, { prof: 'even', nb: 2, a: .7 }), mk(qcurve(x, 452, x + 90, 452, 0, 6), 11, INK2, { prof: 'even', nb: 2, a: .7 }), mk(qcurve(x + 45, 352, x + 45, 450, 0, 6), 5, INK2, { prof: 'even', nb: 0, a: .6 })); }
    ST.neigh = [];
    for (const [x, y] of [[170, 480], [330, 480], [170, 640], [330, 640], [1420, 520], [1580, 520], [1420, 680], [1580, 680]]) ST.neigh.push(mk(qcurve(x, y + 40, x + 90, y + 40, 0, 6), 70, '#a9b4bb', { prof: 'even', nb: 5, a: .4 }));
    ST.curb = [mk(qcurve(60, GROUND + 4, 1860, GROUND + 2, 0, 60), 6, INK2, { prof: 'even', nb: 4, a: .7 })];
    ST.signEdge = [mk(qcurve(716, 362, 1204, 362, 0, 20), 8, '#5b3a28', { prof: 'even', nb: 3 }), mk(qcurve(1204, 454, 716, 454, 0, 20), 8, '#5b3a28', { prof: 'even', nb: 3 })];
  });
}

// ---------- the scene, in world coordinates ----------
function drawWorld(c, t) {
  const p = (a, b) => seg(t, a, b);
  const N = NIGHT(t), skyP = p(5.0, 7.0);
  // sky (a two-colour wash, its colour is the clock)
  if (skyP > 0) {
    c.save(); wipe(c, skyP, VIG[0], VIG[1], VIG[2], GROUND, 'tb', 5);
    const g = c.createLinearGradient(0, VIG[1], 0, GROUND); g.addColorStop(0, keyCol(SKY_TOP, t)); g.addColorStop(1, keyCol(SKY_BOT, t));
    wash(c, rectPts(VIG[0], VIG[1], VIG[2], GROUND + 20, 18, 2, 14), g, .62, 201, 3, 2.5);
    c.restore();
  }
  // neighbours, lighter and less saturated (farther)
  const nP = p(5.2, 6.8);
  if (nP > 0) {
    c.save(); wipe(c, nP, 100, 380, 1830, GROUND, 'lr', 9);
    wash(c, rectPts(110, 400, 560, GROUND, 6, 4), '#c4c9c6', .5, 202); wash(c, rectPts(1360, 440, 1820, GROUND, 6, 5), '#d6c3a6', .5, 203);
    c.restore(); drawList(c, ST.neigh, p(5.8, 7.0));
  }
  // ground
  const gP = p(5.0, 6.6);
  if (gP > 0) { c.save(); wipe(c, gP, VIG[0], GROUND, VIG[2], VIG[3], 'lr', 11); wash(c, rectPts(VIG[0], GROUND - 4, VIG[2], VIG[3], 12, 6, 14), '#cdbfa6', .55, 204, 3, 2.5); c.restore(); drawList(c, ST.curb, p(5.4, 6.6)); }
  // facade
  const fP = p(4.8, 6.2);
  if (fP > 0) {
    c.save(); wipe(c, fP, SHOP[0], SHOP[1], SHOP[2], GROUND, 'lr', 13);
    c.beginPath(); c.rect(-5000, -5000, 10000, 10000); c.rect(WIN[2], WIN[1], WIN[0] - WIN[2], WIN[3] - WIN[1]); c.clip('evenodd');   // the window stays its own wash
    wash(c, rectPts(SHOP[0], SHOP[1], SHOP[2], GROUND, 4, 7), '#dfae8a', .7, 205);
    c.restore();
    drawList(c, ST.bricks, p(5.4, 6.8)); drawList(c, ST.cornice, p(5.0, 6.4));
  }
  // upper windows (lit at night)
  const uP = p(6.2, 7.0);
  if (uP > 0) {
    for (const [x, s] of [[600, 206], [1230, 207]]) wash(c, rectPts(x, 350, x + 90, 452, 3, s), mixc('#90a4b5', '#f2c46d', UPPER_LIT(t)), .7 * ss(uP), s);
    drawList(c, ST.upper, uP);
  }
  // shop window interior: warm wall, oven, shelves
  const iP = p(3.6, 4.8);
  if (iP > 0) { c.save(); wipe(c, iP, WIN[0], WIN[1], WIN[2], WIN[3], 'lr', 17); wash(c, rectPts(WIN[0], WIN[1], WIN[2], WIN[3], 3, 8), '#efd2a0', .6, 208); wash(c, rectPts(WIN[0], 760, WIN[2], WIN[3], 3, 9), '#d8b282', .45, 209); c.restore(); }
  const oP = p(3.0, 4.2);
  if (oP > 0) {
    const O = OVEN;
    wash(c, ellPts(O.mx, O.my - 4, 70, 58, .05, 3), '#6b4a3c', .8 * ss(oP), 210, 3, 2);
    drawList(c, ST.ovenArch, oP);
  }
  // the oven mouth glow and the bun inside: the opening bloom
  {
    const O = OVEN, g = c.createRadialGradient(O.mx, O.my, 4, O.mx, O.my, 60);
    g.addColorStop(0, rgba('#ffd27a', .9)); g.addColorStop(1, rgba('#f2a24c', 0));
    const gl = ss(p(2.6, 3.6)) * (1 - .3 * ss(p(12.3, 12.8)));
    if (gl > 0) { c.globalAlpha = gl; c.fillStyle = g; c.beginPath(); c.ellipse(O.mx, O.my, 58, 38, 0, 0, 7); c.fill(); c.globalAlpha = 1; }
    bloom(c, t);
  }
  drawList(c, ST.shelves, p(4.6, 5.2));
  // loaves: burst onto the shelves, then sold one per beat
  for (let i = 0; i < LOAVES.length; i++) {
    const [k, x, y, tv, sd] = LOAVES[i], t0 = BURST + i * .06, al = 1 - ss(seg(t, tv, tv + .35));
    breadDraw(c, k, x, y, k === 'bread' ? .95 : 1, seg(t, t0, t0 + .4), al, sd);
    if (t > tv && t < tv + .6) { const q = seg(t, tv, tv + .6); c.globalAlpha = (1 - q) * .8; c.fillStyle = '#f6eedd'; c.beginPath(); c.ellipse(x, y - 20 - q * 24, 26 + q * 26, 16 + q * 14, 0, 0, 7); c.fill(); c.globalAlpha = 1; }
  }
  drawList(c, ST.frame, p(4.2, 5.2)); drawList(c, ST.glint, p(5.0, 5.4));
  // awning, door, sign
  drawList(c, ST.awning, p(5.8, 6.9));
  const dP = p(6.0, 7.0);
  if (dP > 0) { wash(c, rectPts(DOOR[0], DOOR[1], DOOR[2], GROUND, 3, 10), '#a7744f', .7 * ss(dP), 211); wash(c, rectPts(DOOR[0] + 22, DOOR[1] + 22, DOOR[2] - 22, 700, 3, 12), '#efd2a0', .65 * ss(dP), 212); drawList(c, ST.door, dP); }
  drawList(c, ST.bell, p(7.0, 7.3));
  const sP = p(6.4, 7.2);
  if (sP > 0) { c.save(); wipe(c, sP, 720, 365, 1200, 452, 'lr', 19); wash(c, rectPts(720, 365, 1200, 452, 3, 13), '#8a5a3c', .85, 213); c.restore(); drawList(c, ST.signEdge, sP); }
  walkers(c, t);
  // night: the sheet darkens under the sky, the windows keep their lamp light
  if (N > 0 && skyP > 0) {
    c.save(); wipe(c, skyP, VIG[0], VIG[1], VIG[2], VIG[3], 'tb', 5);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = rgba('#7c88ad', .5 * N);
    c.beginPath(); rectPts(VIG[0], VIG[1], VIG[2], VIG[3], 18, 2, 14).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.fill();
    c.globalCompositeOperation = 'screen';
    c.fillStyle = rgba('#f7c76a', .62 * N); c.fillRect(WIN[0] + 6, WIN[1] + 6, WIN[2] - WIN[0] - 12, WIN[3] - WIN[1] - 12);
    c.fillStyle = rgba('#f7c76a', .45 * N * UPPER_LIT(t)); for (const x of [600, 1230]) c.fillRect(x + 4, 354, 82, 94);
    c.restore();
  }
}
// the bun in the oven: a wet bloom of ochre that tightens into bread
function bloom(c, t) {
  const fade = 1 - ss(seg(t, 12.3, 12.7)); if (t <= 0 || fade <= 0) return;
  const g = seg(t, 0, 1.4), r = lerp(.15, 1.18, eo(g)) - .16 * ss(seg(t, 1.4, 2.6)), O = OVEN;
  withSeed(301, () => {
    washPoly(c, ellPts(O.mx, O.my + 2, 34 * r, 21 * r, .09 * (1.4 - ss(seg(t, 1.2, 2.6))), 5, 60), '#d9944a', .8 * fade, 4, .5);
    washPoly(c, ellPts(O.mx + 6, O.my + 6, 22 * r, 12 * r, .15, 6), '#c47a35', .35 * fade * ss(seg(t, .6, 1.6)), 3, 1);
  });
  // crust: the shape becomes bread
  withSeed(302, () => {
    const S = [mk(qcurve(O.mx - 27, O.my - 6, O.mx + 27, O.my - 8, -12, 14), 12, '#a9622c', { prof: 'brush', nb: 5, a: .8 }),
               mk(qcurve(O.mx - 30, O.my + 18, O.mx + 30, O.my + 18, 6, 12), 5, '#8a4f22', { prof: 'even', nb: 0, a: .5 })];
    for (const s of S) drawS(c, s, seg(t, 1.5, 2.6), null, fade);
    for (let i = 0; i < 6; i++) { const sx = O.mx + rnd(-14, 14), sy = O.my + rnd(-14, -8); drawS(c, mk(qcurve(sx, sy, sx + 2.4, sy - .6, 0, 3), 2.4, '#f4e3c0', { prof: 'even', nb: 0, a: .9 }), seg(t, 2.3 + i * .05, 2.5 + i * .05), null, fade); }
  });
}

// ---------- text ----------
let REG = [];
function halo(c) { c.shadowColor = rgba(PAPER, .95); c.shadowBlur = 14; }
function hand(txt, x, y, p, o = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${o.size || 46}px Hand`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width, x0 = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
  REG.push({ id: o.id || txt, text: txt, x0, y0: y - (o.size || 46) * .6, x1: x0 + w, y1: y + (o.size || 46) * .6, ...(o.pass ? { pass: true } : {}) });
  ctx.beginPath(); ctx.rect(x0 - 8, y - 60, (w + 16) * eo(p), 120); ctx.clip();
  halo(ctx); ctx.fillStyle = rgba(o.col || INK, o.a ?? .9); ctx.fillText(txt, x0, y); ctx.fillText(txt, x0, y);
  ctx.restore();
}
function leader(x0, y0, x1, y1, p, bend = 20, a = .75) {
  if (p <= 0) return;
  const pts = qcurve(x0, y0, x1, y1, bend, 16), m = Math.max(1, Math.round(16 * clamp(p)));
  ctx.beginPath(); for (let i = 0; i <= m; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = rgba(INK, a); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
  if (p >= 1) { ctx.beginPath(); ctx.arc(x1, y1, 3.5, 0, 7); ctx.fillStyle = rgba(INK, a); ctx.fill(); }
}
// a hand note with a pen leader to a point in the world
function note(t, C, t0, t1, wx, wy, dx, dy, txt, o = {}) {
  const f = 1 - ss(seg(t, t1 - .5, t1)); if (t < t0 || f <= 0) return;
  const [ax, ay] = toScr(C, wx, wy), lx = ax + dx, ly = ay + dy;
  ctx.save(); ctx.globalAlpha = f;
  ctx.font = `700 ${o.size || 46}px Hand`; const w = ctx.measureText(txt).width;
  const ex = dx < 0 ? lx + w * .5 : lx + w * .5, ey = ly + (dy < 0 ? 30 : -30);
  leader(ex, ey, ax, ay, seg(t, t0, t0 + .6), o.bend ?? 18);
  hand(txt, lx, ly, seg(t, t0 + .3, t0 + 1.3), { ...o, id: txt });
  ctx.restore();
}
function mono(t, t0, t1, txt) {
  const f = fade2(t, t0, t1, .4, .5); if (f <= 0) return;
  ctx.save(); ctx.font = '500 30px Mono'; ctx.letterSpacing = '5px'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width;
  REG.push({ id: 'clock', text: txt, x0: 96, y0: 74, x1: 96 + w, y1: 110 });
  ctx.globalAlpha = f; halo(ctx); ctx.fillStyle = rgba(INK, .85); ctx.fillText(txt, 96, 92);
  ctx.restore();
  withSeed(500 + Math.round(t0 * 10), () => drawS(ctx, mk(qcurve(96, 122, 96 + Math.min(w, 200), 121, 0, 10), 5, '#c8442a', { prof: 'even', nb: 2, a: .8 }), seg(t, t0 + .1, t0 + .6), null, f));
}
function title(t) {
  const t0 = 10.0, t1 = 14.8, f = fade2(t, t0, t1, .3, .6); if (f <= 0) return;
  const txt = '우리 동네 빵집의 하루';
  ctx.save(); ctx.font = '500 70px "Serif KR"'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width, x0 = W / 2 - w / 2, y = 150;
  REG.push({ id: 'title', text: txt, x0, y0: y - 45, x1: x0 + w, y1: y + 45 });
  ctx.beginPath(); ctx.rect(x0 - 10, y - 80, (w + 20) * eo(seg(t, t0, t0 + 1.0)), 160); ctx.clip();
  ctx.globalAlpha = f; halo(ctx); ctx.fillStyle = rgba(INK, .88); ctx.fillText(txt, x0, y);
  ctx.restore();
}
function signText(C, t) {
  const p = seg(t, 7.0, 7.6); if (p <= 0) return;
  const [x, y] = toScr(C, 960, 410), s = C.z;
  ctx.save(); ctx.font = `700 ${Math.round(66 * s)}px Hand`; ctx.textBaseline = 'middle';
  const txt = '동네 빵집', w = ctx.measureText(txt).width;
  REG.push({ id: 'sign', text: txt, x0: x - w / 2, y0: y - 40 * s, x1: x + w / 2, y1: y + 40 * s, pass: true });
  ctx.beginPath(); ctx.rect(x - w / 2 - 10, y - 60 * s, (w + 20) * eo(p), 120 * s); ctx.clip();
  ctx.fillStyle = rgba('#f6ead2', .95); ctx.fillText(txt, x - w / 2, y);
  ctx.restore();
}

// ---------- the ending: everything mists back to paper around the last bun ----------
function mistAround(C, t) {
  const q = eio(seg(t, 25.0, 28.4)); if (q <= 0) return;
  const [hx, hy] = toScr(C, HERO.x, HERO.y - 34);
  for (const [lift, a] of [[90, .5], [0, 1]]) {
    const R = lerp(1500, 210 * C.z / 3, q) + lift;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H);
    for (let i = 0; i <= 64; i++) { const an = -i / 64 * Math.PI * 2, rr = R * (1 + (vnoise(i * .22 + lift + t * .3) - .5) * .24); i ? ctx.lineTo(hx + Math.cos(an) * rr, hy + Math.sin(an) * rr * .8) : ctx.moveTo(hx + rr, hy); }
    ctx.closePath(); ctx.clip('evenodd'); ctx.globalAlpha = a; ctx.drawImage(PAPER_IMG, 0, 0); ctx.restore();
  }
}

// ---------- frame ----------
function render(t) {
  REG = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(PAPER_IMG, 0, 0);
  const C = cam(t);
  ctx.setTransform(C.z, 0, 0, C.z, W / 2 - C.x * C.z, H / 2 - C.y * C.z);
  drawWorld(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  signText(C, t);
  mistAround(C, t);
  mono(t, 3.0, 9.4, '05:00 · 220°C');
  mono(t, 10.0, 17.2, '07:30');
  mono(t, 17.5, 20.6, '12:00');
  mono(t, 20.8, 22.8, '16:00');
  mono(t, 23.0, 26.6, '21:00');
  title(t);
  note(t, C, 10.3, 13.4, 1215, 760, 110, 210, '첫 손님', { bend: -18 });
  note(t, C, 13.75, 18.6, 680, SHELF1 - 30, -170, 300, '식빵');
  note(t, C, 14.375, 18.6, 780, SHELF1 - 26, 10, 330, '크루아상');
  note(t, C, 15.0, 18.6, HERO.x, HERO.y - 30, 260, 210, '단팥빵', { bend: -18 });
  note(t, C, 19.2, 23.6, 960, SHELF2 - 40, 300, 175, '거의 다 팔렸어요', { bend: -18 });
  note(t, C, 25.6, 30.5, HERO.x + 30, HERO.y - 40, 190, -170, '내일 새벽에 또', { size: 56, bend: 20 });
}
window.render = render;
window.TEXTS = t => { render(t); return REG; };

// ---------- sound events (exported by events.mjs; mix.py reads them) ----------
const EV = [{ t: .05, type: 'bloom' }];
for (const [t, d, pan] of [[1.5, 1.1, 0], [3.0, 1.2, -.1], [3.6, 1.2, -.2], [4.2, 1.0, .1], [4.8, 1.4, -.3], [5.0, 2.0, 0], [5.2, 1.6, .4], [5.8, 1.1, .1], [6.0, 1.0, .5], [6.4, .8, 0]]) EV.push({ t, type: 'rustle', d, pan });
EV.push({ t: 7.6, type: 'lift' });
for (const [t, pan] of [[3.0, -.7], [7.0, 0], [10.0, -.7], [10.3, .3], [13.75, -.4], [14.375, -.1], [15.0, .3], [17.5, -.7], [19.2, .4], [20.8, -.7], [23.0, -.7], [25.6, .3]]) EV.push({ t, type: 'scratch', pan });
EV.push({ t: 10.0, type: 'title' });
for (const t of [10.0, 19.0]) EV.push({ t, type: 'bell', pan: .25 });
EV.push({ t: BURST, type: 'burst' });
for (const [k, x, y, tv] of LOAVES) if (tv < 30) EV.push({ t: tv, type: 'sold', pan: (x - 860) / 500 });
EV.push({ t: 22.6, type: 'lamp', pan: .2 });
EV.push({ t: 25.0, type: 'mist', d: 3.4 });
for (const [t0, x0, t1, x1, sc] of WALK) {           // a footstep on every half gait cycle
  const n = Math.floor(Math.abs(x1 - x0) / STRIDE * 2);
  for (let i = 1; i <= n; i++) { const t = t0 + (i * STRIDE / 2) / Math.abs(x1 - x0) * (t1 - t0); const x = lerp(x0, x1, seg(t, t0, t1)); if (x > -40 && x < 1960) EV.push({ t, type: 'step', pan: clamp((x - 960) / 960, -1, 1), v: sc }); }
}
window.EV = EV.sort((a, b) => a.t - b.t);

(async () => {
  PAPER_IMG = new Image(); PAPER_IMG.src = 'paper.jpg'; await PAPER_IMG.decode();
  await Promise.all([document.fonts.load('500 70px "Serif KR"', '우리 동네 빵집의 하루'), document.fonts.load('700 46px Hand', '동네 빵집 첫 손님'), document.fonts.load('500 30px Mono', '05:00')]);
  build();
  window.READY = true;
})();
