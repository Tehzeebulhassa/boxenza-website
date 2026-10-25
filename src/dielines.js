/* Boxenza dieline generator.
   Every style gets a flat template drawn from its real structure: cut lines (solid),
   fold lines (dashed), glue areas (hatched), perforations (dotted) and L / W / D panel labels.
   Shapes are built from panels; an edge shared by two panels is drawn as a fold, an edge
   on the outside is drawn as a cut. */

const COL = { cut: '#1B2233', fold: '#D21F66', glue: '#C9A06B', perf: '#1BA3C6', label: '#7A8095', paper: '#FFFFFF' };

function make() { return { pieces: [], glue: [], folds: [], perf: [], holes: [], circles: [], labels: [], marks: [] }; }

/* ---------- small helpers ---------- */
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function add(d, poly, kind) { (kind === 'glue' ? d.glue : d.pieces).push(poly); return poly; }
function rect(d, x, y, w, h, kind) { return add(d, R(x, y, w, h), kind); }
function lab(d, x, y, t) { d.labels.push([x, y, t]); }
function fold(d, x1, y1, x2, y2) { d.folds.push([x1, y1, x2, y2]); }
function perf(d, x1, y1, x2, y2) { d.perf.push([x1, y1, x2, y2]); }
function hole(d, poly) { d.holes.push(poly); }
function circle(d, cx, cy, r, kind) { d.circles.push([cx, cy, r, kind || 'cut']); }
function oval(cx, cy, rx, ry) { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; }

/* tuck flap attached to the top (dir=-1) or bottom (dir=1) edge of a panel starting at (x,y) */
function tuck(d, x, y, w, h, dir) {
  const t = h * 0.42, c = Math.min(w, t) * 0.35;
  rect(d, x, dir < 0 ? y - h : y, w, h);
  const y0 = dir < 0 ? y - h : y + h, y1 = y0 + dir * t;
  add(d, [[x, y0], [x + w, y0], [x + w, y1 - dir * c], [x + w - c, y1], [x + c, y1], [x, y1 - dir * c]]);
}
function dust(d, x, y, w, h, dir, flip) {
  const y1 = y + dir * h, a = w * 0.12, b = w * 0.3;
  const pts = flip ? [[x, y], [x + w, y], [x + w - a, y1], [x + b, y1], [x, y + dir * h * 0.4]]
                   : [[x, y], [x + w, y], [x + w, y + dir * h * 0.4], [x + w - b, y1], [x + a, y1]];
  add(d, pts);
}
function glueFlap(d, x, y, h, g, side) { // side -1 = left of x, 1 = right of x
  add(d, [[x, y], [x + side * g, y + h * 0.12], [x + side * g, y + h * 0.88], [x, y + h]], 'glue');
}
/* the 4-panel body of a folding carton: panels L W L W, glue flap on the left */
function body(d, L, W, D, opt = {}) {
  const xs = [0, L, L + W, 2 * L + W, 2 * L + 2 * W];
  const ws = [L, W, L, W];
  ws.forEach((w, i) => { rect(d, xs[i], 0, w, D); });
  glueFlap(d, 0, 0, D, W * 0.4, -1);
  if (!opt.nolabels) { lab(d, L / 2, D / 2, 'L'); lab(d, L + W / 2, D / 2, 'W'); lab(d, L + W + L / 2, D * 0.62, 'D'); }
  return xs;
}

/* ---------- folding carton templates ---------- */
const T = {};
T.ste = (o = {}) => { // straight tuck end: both tucks on the same panel
  const d = make(), L = 4, W = 2, D = 5; const xs = body(d, L, W, D);
  tuck(d, xs[0], 0, L, W, -1); tuck(d, xs[0], D, L, W, 1);
  [1, 3].forEach(i => { dust(d, xs[i], 0, W, W * 0.8, -1, i === 3); dust(d, xs[i], D, W, W * 0.8, 1, i === 3); });
  if (o.hang) { const y = -W - W * 0.42; rect(d, xs[2], -W * 1.6, L, W * 1.6); circle(d, xs[2] + L / 2, -W * 1.0, W * 0.22); }
  if (o.lock) { [[xs[1], 0], [xs[3], 0]].forEach(([x]) => hole(d, R(x + W * 0.35, -W * 0.12, W * 0.3, W * 0.06))); }
  if (o.window) hole(d, R(xs[0] + L * 0.2, D * 0.2, L * 0.6, D * 0.4));
  if (o.tear) { perf(d, xs[0], D * 0.25, xs[2], D * 0.25); perf(d, xs[0] + L * 0.15, D * 0.25, xs[0] + L * 0.15, D * 0.75); perf(d, xs[0] + L * 0.85, D * 0.25, xs[0] + L * 0.85, D * 0.75); }
  return d;
};
T.rte = () => { const d = make(), L = 4, W = 2, D = 5; const xs = body(d, L, W, D);
  tuck(d, xs[2], 0, L, W, -1); tuck(d, xs[0], D, L, W, 1);
  [1, 3].forEach(i => { dust(d, xs[i], 0, W, W * 0.8, -1, i === 3); dust(d, xs[i], D, W, W * 0.8, 1, i === 3); });
  return d; };
T.autoBottom = (o = {}) => { // tuck top + crash lock bottom
  const d = make(), L = 4, W = 2, D = 5; const xs = body(d, L, W, D);
  if (o.fullTop) [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L, g = w * 0.04; add(d, [[xs[i] + g, 0], [xs[i] + w - g, 0], [xs[i] + w - g, -(i % 2 ? W * 0.5 : W)], [xs[i] + g, -(i % 2 ? W * 0.5 : W)]]); });
  else { tuck(d, xs[0], 0, L, W, -1); [1, 3].forEach(i => dust(d, xs[i], 0, W, W * 0.8, -1, i === 3)); }
  [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L, x = xs[i], h = W * 0.75;
    add(d, [[x, D], [x + w, D], [x + w - w * 0.08, D + h], [x + w * 0.45, D + h]]);
    add(d, [[x, D], [x + w * 0.45, D + h], [x + w * 0.1, D + h * 0.55]], 'glue');
    fold(d, x, D, x + w * 0.45, D + h); });
  if (o.lockcap) [xs[1], xs[3]].forEach(x => hole(d, R(x + W * 0.3, -W * 0.1, W * 0.4, W * 0.06)));
  return d; };
T.snapLock = () => { // 1-2-3 bottom
  const d = make(), L = 4, W = 2, D = 5; const xs = body(d, L, W, D);
  tuck(d, xs[0], 0, L, W, -1); [1, 3].forEach(i => dust(d, xs[i], 0, W, W * 0.8, -1, i === 3));
  const h = W * 0.55;
  add(d, [[xs[0], D], [xs[1], D], [xs[1], D + h], [xs[0] + L * 0.7, D + h], [xs[0] + L * 0.6, D + h * 0.6], [xs[0] + L * 0.4, D + h * 0.6], [xs[0] + L * 0.3, D + h], [xs[0], D + h]]);
  add(d, [[xs[2], D], [xs[3], D], [xs[3], D + h * 1.3], [xs[2] + L * 0.62, D + h * 1.3], [xs[2] + L * 0.5, D + h * 1.75], [xs[2] + L * 0.38, D + h * 1.3], [xs[2], D + h * 1.3]]);
  [1, 3].forEach(i => add(d, [[xs[i], D], [xs[i] + W, D], [xs[i] + W * 0.7, D + h * 1.2], [xs[i] + W * 0.3, D + h * 1.2]]));
  return d; };
T.sealEnd = (o = {}) => { const d = make(), L = 4, W = 2, D = 5; const xs = body(d, L, W, D);
  [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L, h = i % 2 ? W * 0.45 : (o.full ? W : W * 0.55), g = w * 0.04;
    add(d, [[xs[i] + g, 0], [xs[i] + w - g, 0], [xs[i] + w - g, -h], [xs[i] + g, -h]]);
    add(d, [[xs[i] + g, D], [xs[i] + w - g, D], [xs[i] + w - g, D + h], [xs[i] + g, D + h]]); });
  if (o.full) [0, 2].forEach(i => { lab(d, xs[i] + L / 2, -W / 2, 'W'); });
  return d; };
T.sleeve = (o = {}) => { const d = make(), L = 5, W = 1.6, D = 3.4;
  const xs = [0, L, L + W, 2 * L + W]; [L, W, L, W].forEach((w, i) => rect(d, xs[i], 0, w, D));
  glueFlap(d, 2 * L + 2 * W, 0, D, W * 0.5, 1);
  lab(d, L / 2, D / 2, 'L'); lab(d, L + W / 2, D / 2, 'W'); lab(d, L * 1.5 + W, D * 0.62, 'D');
  if (o.tuck) { tuck(d, xs[0], 0, L, W, -1); dust(d, xs[1], 0, W, W * 0.8, -1); dust(d, xs[3], 0, W, W * 0.8, -1, true); }
  if (o.thumb) hole(d, oval(L / 2, D, L * 0.12, W * 0.25));
  return d; };
T.tray = (o = {}) => { // walls around a base; variants for corners and doubled walls
  const d = make(), L = 6, W = 4, D = 1.6, dd = o.double ? D : 0;
  rect(d, 0, 0, L, W); lab(d, L / 2, W / 2, 'L × W');
  rect(d, 0, -D, L, D); rect(d, 0, W, L, D); rect(d, -D, 0, D, W); rect(d, L, 0, D, W);
  lab(d, L / 2, -D / 2, 'D');
  if (o.double) { rect(d, 0, -2 * D, L, D); rect(d, 0, W + D, L, D); if (o.double === 'all') { rect(d, -2 * D, 0, D, W); rect(d, L + D, 0, D, W); } }
  const c = o.corner || 'glue';
  [[0, 0, -1, -1], [L, 0, 1, -1], [0, W, -1, 1], [L, W, 1, 1]].forEach(([x, y, sx, sy]) => {
    if (c === 'glue') add(d, [[x, y], [x, y + sy * D], [x + sx * D * 0.8, y + sy * D * 0.2]], 'glue');
    if (c === 'ears') add(d, [[x, y + sy * D], [x + sx * D, y + sy * D], [x + sx * D * 0.75, y + sy * D * 1.7], [x + sx * D * 0.1, y + sy * D * 1.7]]);
    if (c === 'pinch') { add(d, [[x, y], [x + sx * D, y], [x + sx * D, y + sy * D], [x, y + sy * D]]); fold(d, x, y, x + sx * D, y + sy * D); }
    if (c === 'tabs') { add(d, [[x + sx * D, y], [x + sx * D * 1.45, y + sy * D * 0.25], [x + sx * D * 1.45, y + sy * D * 0.75], [x + sx * D, y + sy * D]]); }
  });
  if (o.lid) { rect(d, 0, -dd - D - W, L, W); rect(d, 0, -dd - D - W - D * 0.7, L, D * 0.7); lab(d, L / 2, -dd - D - W / 2, 'Lid');
    if (o.window) hole(d, R(L * 0.2, -dd - D - W * 0.8, L * 0.6, W * 0.6)); }
  if (o.thumb) hole(d, oval(L / 2, W + D, L * 0.08, D * 0.35));
  if (o.front) { hole(d, [[L * 0.2, W + D], [L * 0.8, W + D], [L * 0.7, W + D * 0.35], [L * 0.3, W + D * 0.35]]); }
  if (o.header) { add(d, [[0, -dd - D], [L, -dd - D], [L, -dd - D - W * 0.9], [L * 0.8, -dd - D - W * 1.2], [L * 0.2, -dd - D - W * 1.2], [0, -dd - D - W * 0.9]]); }
  return d; };
T.mailer = (o = {}) => { // roll-end tuck front mailer
  const d = make(), L = 6, W = 4.5, D = 1.4;
  rect(d, 0, 0, L, W); lab(d, L / 2, W / 2, 'Base L × W');
  rect(d, 0, W, L, D); if (o.rollFront !== false) { rect(d, 0, W + D, L, D); add(d, [[L * 0.15, W + 2 * D], [L * 0.3, W + 2 * D + D * 0.35], [L * 0.7, W + 2 * D + D * 0.35], [L * 0.85, W + 2 * D]]); }
  rect(d, 0, -D, L, D); lab(d, L / 2, -D / 2, 'D');
  rect(d, 0, -D - W, L, W); lab(d, L / 2, -D - W / 2, 'Lid');
  if (o.tuckFront !== false) tuck(d, 0, -D - W, L, D, -1);
  [-1, 1].forEach(s => { const x = s < 0 ? -D : L; rect(d, x, 0, D, W); const x2 = s < 0 ? -2 * D : L + D;
    add(d, [[x2, W * 0.08], [x2 + D, 0], [x2 + D, W], [x2, W * 0.92]].map(([px, py]) => [s < 0 ? px : px, py]));
    if (o.ears !== false) { add(d, s < 0 ? [[-D, 0], [0, 0], [-D * 0.15, -D * 0.85], [-D * 0.85, -D * 0.6]] : [[L, 0], [L + D, 0], [L + D * 0.85, -D * 0.6], [L + D * 0.15, -D * 0.85]]); }
    const lx = s < 0 ? -D : L; add(d, s < 0 ? [[lx, -D - W], [0, -D - W], [0, -D], [lx + D * 0.1, -D - W * 0.15]].reverse() : [[L, -D - W], [L + D * 0.9, -D - W * 0.85], [L, -D]]);
  });
  if (o.slots) [L * 0.25, L * 0.75].forEach(x => hole(d, R(x - L * 0.06, W + D - D * 0.04, L * 0.12, D * 0.08)));
  if (o.window) hole(d, R(L * 0.25, -D - W * 0.75, L * 0.5, W * 0.5));
  if (o.thumb) hole(d, oval(L / 2, W + D, L * 0.07, D * 0.3));
  return d; };
T.pillow = () => { const d = make(), L = 4.5, W = 2, H = 6;
  const p = []; const arc = (x0, x1, y, dir) => { for (let i = 0; i <= 12; i++) { const t = i / 12, x = x0 + (x1 - x0) * t; p.push([x, y + dir * Math.sin(Math.PI * t) * W * 0.55]); } };
  arc(0, 2 * L, 0, -1); p.push([2 * L, H]); arc(2 * L, 0, H, 1);
  add(d, p); glueFlap(d, 2 * L, 0, H, W * 0.35, 1); fold(d, L, 0, L, H);
  [0, L].forEach(x => { const q = []; for (let i = 0; i <= 10; i++) { const t = i / 10; q.push([x + L * t, -Math.sin(Math.PI * t) * W * 0.55 + W * 0.35 * Math.sin(Math.PI * t)]); } for (let i = 0; i < q.length - 1; i++) fold(d, q[i][0], q[i][1] + W * 0.2, q[i + 1][0], q[i + 1][1] + W * 0.2); });
  lab(d, L / 2, H / 2, 'L'); lab(d, L * 1.5, H / 2, 'W');
  return d; };
T.gable = (o = {}) => { const d = make(), L = o.square ? 3 : 4, W = 3, D = o.tall ? 6 : (o.square ? 3 : 4), G = o.tall ? 3.4 : 2.6; const xs = body(d, L, W, D);
  [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L; add(d, i % 2 ? [[xs[i], 0], [xs[i] + w, 0], [xs[i] + w / 2, -G]] : [[xs[i], 0], [xs[i] + w, 0], [xs[i] + w, -G], [xs[i], -G]]); });
  [0, 2].forEach(i => { rect(d, xs[i], -G - W * 0.45, L, W * 0.45); hole(d, oval(xs[i] + L / 2, -G - W * 0.22, L * 0.18, W * 0.09)); });
  [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L; add(d, [[xs[i], D], [xs[i] + w, D], [xs[i] + w * 0.9, D + W * 0.6], [xs[i] + w * 0.1, D + W * 0.6]]); });
  return d; };
T.hexagon = (o = {}) => { const d = make(), s = 1.6, H = 5, n = o.sides || 6;
  for (let i = 0; i < n; i++) rect(d, i * s, 0, s, H);
  glueFlap(d, 0, 0, H, s * 0.4, -1);
  const poly = (cx, cy, r, up) => { const p = []; for (let i = 0; i < n; i++) { const a = Math.PI / n * (2 * i + 1) + (up ? 0 : Math.PI); p.push([cx + r * Math.sin(a), cy + r * Math.cos(a)]); } return p; };
  const r = s / (2 * Math.sin(Math.PI / n));
  const top = poly(s / 2, -r * Math.cos(Math.PI / n), r, true); add(d, top);
  const bot = poly(s * 1.5, H + r * Math.cos(Math.PI / n), r, false); add(d, bot);
  lab(d, s / 2, H / 2, 'W'); lab(d, s * 1.5, H * 0.62, 'D');
  return d; };
T.header = () => { const d = make(), W = 4, H = 6; rect(d, 0, 0, W, H); rect(d, 0, -H * 0.3, W, H * 0.3); circle(d, W / 2, -H * 0.15, 0.25); lab(d, W / 2, H / 2, 'W × H'); return d; };
T.takeout = () => { const d = make(), b = 3, t = 4.2, h = 4; // 4 tapered walls around base
  rect(d, 0, 0, b, b); lab(d, b / 2, b / 2, 'Base');
  const w = (t - b) / 2;
  add(d, [[0, 0], [b, 0], [b + w, -h], [-w, -h]]); add(d, [[0, b], [b, b], [b + w, b + h], [-w, b + h]]);
  add(d, [[0, 0], [0, b], [-h, b + w], [-h, -w]]); add(d, [[b, 0], [b, b], [b + h, b + w], [b + h, -w]]);
  [[-w, -h, b + w, -h]].forEach(() => { tuck(d, -w, -h, t, 1.2, -1); });
  circle(d, b / 2, b + h - 0.5, 0.18); return d; };
T.fries = () => { const d = make(); const p = [[0, 0], [1.2, -0.5], [2.4, 0], [3.6, -0.5], [4.8, 0], [4.4, 5], [0.4, 5]]; add(d, p);
  add(d, [[4.8, 0], [7.2, 0.3], [6.8, 5], [4.4, 5]]); glueFlap(d, 7.2, 0.3, 4.7, 0.5, 1);
  add(d, [[0.4, 5], [4.4, 5], [4.1, 6.2], [0.7, 6.2]]); lab(d, 2.4, 2.5, 'Front'); lab(d, 5.8, 2.5, 'Back'); return d; };
T.wedge = () => { const d = make(), s = 4, D = 2.4;
  add(d, [[0, 0], [s, 0], [s / 2, -s * 0.87]]); add(d, [[0, D], [s, D], [s / 2, D + s * 0.87]]);
  rect(d, 0, 0, s, D); rect(d, -D, 0, D, D); rect(d, s, 0, D, D); hole(d, R(s * 0.2, D * 0.2, s * 0.6, D * 0.5));
  tuck(d, s, 0, D, 1, -1); lab(d, s / 2, -s * 0.3, 'Side'); return d; };
T.tulip = () => { const d = make(), b = 3, h = 3;
  rect(d, 0, 0, b, b); lab(d, b / 2, b / 2, 'Base');
  [[0, 0, b, 0, 0, -1], [0, b, b, b, 0, 1], [0, 0, 0, b, -1, 0], [b, 0, b, b, 1, 0]].forEach(([x1, y1, x2, y2, sx, sy]) => {
    const mx = (x1 + x2) / 2 + sx * h * 1.6, my = (y1 + y2) / 2 + sy * h * 1.6;
    add(d, [[x1, y1], [x2, y2], [x2 + sx * h, y2 + sy * h], [mx, my], [x1 + sx * h, y1 + sy * h]]);
    fold(d, x1 + sx * h, y1 + sy * h, x2 + sx * h, y2 + sy * h); });
  return d; };
T.burger = () => { const d = make(), L = 4.5, D = 2.5;
  rect(d, 0, 0, L, L); lab(d, L / 2, L / 2, 'Base');
  rect(d, 0, -D, L, D); rect(d, 0, -D - L, L, L); lab(d, L / 2, -D - L / 2, 'Lid');
  [-1, 1].forEach(s => { const x = s < 0 ? -D : L; rect(d, x, 0, D, L); rect(d, x, -D - L, D, L);
    add(d, [[x, 0], [x + D, 0], [x + D * (s < 0 ? 1 : 0), -D]], 'glue'); });
  rect(d, 0, L, L, D); add(d, [[L * 0.35, L + D], [L * 0.65, L + D], [L * 0.6, L + D * 1.4], [L * 0.4, L + D * 1.4]]);
  hole(d, R(L * 0.4, -D - L - 0.1, L * 0.2, 0.08)); return d; };
T.drawer = (o = {}) => { const d = make(), L = 5, W = 3.4, D = 1.2;
  rect(d, 0, 0, L, W); lab(d, L / 2, W / 2, 'Tray');
  rect(d, 0, -D, L, D); rect(d, 0, W, L, D); rect(d, -D, 0, D, W); rect(d, L, 0, D, W);
  [[0, 0, -1, -1], [L, 0, 1, -1], [0, W, -1, 1], [L, W, 1, 1]].forEach(([x, y, sx, sy]) => add(d, [[x, y], [x, y + sy * D], [x + sx * D * 0.8, y + sy * D * 0.8]], 'glue'));
  if (o.double) { rect(d, 0, -2 * D, L, D); rect(d, 0, W + D, L, D); rect(d, -2 * D, 0, D, W); rect(d, L + D, 0, D, W); }
  hole(d, oval(L / 2, W + D * 0.5, L * 0.07, D * 0.22));
  const x0 = L + D + 1.4; [W + 0.2, D + 0.1, W + 0.2, D + 0.1].forEach((h, i) => rect(d, x0, -D + [0, W + 0.2, W + D + 0.3, 2 * W + D + 0.4][i], L + 0.2, h));
  glueFlap(d, x0 + L + 0.2, -D, W + 0.2, 0.5, 1); lab(d, x0 + L / 2, -D + W / 2, 'Sleeve');
  return d; };
T.lidBase = (o = {}) => { const d = make(), L = 4, W = 3.4, D = 1.1;
  [[0, 'Base', 1], [L + 2 * D + 1.4, 'Lid', o.shallowLid ? 0.55 : 1]].forEach(([x0, t, k]) => {
    const dd = D * k; rect(d, x0, 0, L, W); lab(d, x0 + L / 2, W / 2, t);
    rect(d, x0, -dd, L, dd); rect(d, x0, W, L, dd); rect(d, x0 - dd, 0, dd, W); rect(d, x0 + L, 0, dd, W);
    [[x0, 0, -1, -1], [x0 + L, 0, 1, -1], [x0, W, -1, 1], [x0 + L, W, 1, 1]].forEach(([x, y, sx, sy]) => add(d, [[x, y], [x, y + sy * dd], [x + sx * dd * 0.8, y + sy * dd * 0.8]], 'glue'));
    if (o.double) { rect(d, x0, -2 * dd, L, dd); rect(d, x0, W + dd, L, dd); } });
  if (o.window) hole(d, R(L + 2 * D + 1.4 + L * 0.2, W * 0.2, L * 0.6, W * 0.6));
  return d; };
T.dispenser = () => { const d = T.ste({}); perf(d, 0.4, 1.2, 3.6, 1.2); perf(d, 0.4, 1.2, 0.4, 3.5); perf(d, 3.6, 1.2, 3.6, 3.5); perf(d, 0.4, 3.5, 3.6, 3.5); return d; };

/* ---------- corrugated ---------- */
T.rsc = (o = {}) => { const d = make(), L = 6, W = 4, D = 4.5; const xs = body(d, L, W, D);
  const fh = o.full ? W : W / 2, g = 0.08;
  [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L;
    if (o.bottom !== 'auto' && o.bottom !== 'snap') rect(d, xs[i] + g, D, w - 2 * g, fh);
    rect(d, xs[i] + g, -fh, w - 2 * g, fh); });
  if (o.bottom === 'auto') [0, 1, 2, 3].forEach(i => { const w = i % 2 ? W : L, x = xs[i], h = W * 0.55;
    add(d, [[x + g, D], [x + w - g, D], [x + w * 0.9, D + h], [x + w * 0.45, D + h]]); add(d, [[x + g, D], [x + w * 0.45, D + h], [x + w * 0.12, D + h * 0.55]], 'glue'); fold(d, x + g, D, x + w * 0.45, D + h); });
  if (o.bottom === 'snap') { const h = W * 0.5;
    [0, 2].forEach(i => add(d, [[xs[i] + g, D], [xs[i] + L - g, D], [xs[i] + L - g, D + h], [xs[i] + L * 0.65, D + h], [xs[i] + L * 0.55, D + h * 0.6], [xs[i] + L * 0.45, D + h * 0.6], [xs[i] + L * 0.35, D + h], [xs[i] + g, D + h]]));
    [1, 3].forEach(i => add(d, [[xs[i] + g, D], [xs[i] + W - g, D], [xs[i] + W * 0.75, D + h], [xs[i] + W * 0.25, D + h]])); }
  lab(d, L / 2, -fh / 2, 'W / 2'); if (o.tuckTop) { d.pieces = d.pieces.filter(p => !(Math.min(...p.map(q => q[1])) < -1e-9 && Math.max(...p.map(q => q[1])) <= 1e-9)); tuck(d, xs[0], 0, L, W, -1); [1, 3].forEach(i => dust(d, xs[i], 0, W, W * 0.7, -1, i === 3)); }
  return d; };
T.folder = (o = {}) => { const d = make(), L = 8.5, W = 11, S = 1;
  rect(d, 0, 0, L, W); lab(d, L / 2, W / 2, 'L × W');
  rect(d, -S, 0, S, W); rect(d, -S - L * 0.85, 0, L * 0.85, W);
  rect(d, L, 0, S, W); rect(d, 0, -S * 1.2, L, S * 1.2); rect(d, 0, W, L, S * 1.2);
  if (o.lock) { tuck(d, -S - L * 0.85, 0, L * 0.85, S, -1); hole(d, R(L + S - 0.1, W * 0.3, 0.1, W * 0.4)); }
  if (o.gusset) { rect(d, L + S, 0, S, W); fold(d, L + S * 1.5, 0, L + S * 1.5, W); }
  return d; };
T.wine = (o = {}) => { const d = make(), n = o.n || 2, s = 3.5, H = 12; const W = s * n;
  [W, s, W, s].forEach((w, i) => rect(d, [0, W, W + s, 2 * W + s][i], 0, w, H)); glueFlap(d, 0, 0, H, 0.6, -1);
  [0, W + s].forEach(x => { add(d, [[x, 0], [x + W, 0], [x + W, -3], [x, -3]]); hole(d, oval(x + W / 2, -1.8, W * 0.18, 0.4)); });
  [0, 1, 2, 3].forEach(i => { const w = i % 2 ? s : W, x = [0, W, W + s, 2 * W + s][i]; add(d, [[x, H], [x + w, H], [x + w * 0.9, H + s * 0.6], [x + w * 0.1, H + s * 0.6]]); });
  for (let k = 1; k < n; k++) fold(d, s * k, 0, s * k, H);
  lab(d, W / 2, H / 2, n + ' bottle'); return d; };

/* ---------- rigid ---------- */
T.rigidBook = (o = {}) => { const d = make(), L = 5, W = 3.6, D = 1.2;
  // cover wrap: back board, spine, front board (+ magnet flap)
  rect(d, 0, 0, L, W); rect(d, L, 0, D, W); rect(d, L + D, 0, L, W); if (o.flap) rect(d, 2 * L + D, 0, D, W);
  const ww = 0.6, tot = 2 * L + D + (o.flap ? D : 0);
  rect(d, 0, -ww, tot, ww); rect(d, 0, W, tot, ww); rect(d, -ww, 0, ww, W); rect(d, tot, 0, ww, W);
  lab(d, L / 2, W / 2, 'Back'); lab(d, L + D / 2, W / 2, 'S'); lab(d, L + D + L / 2, W / 2, 'Front');
  if (o.magnet) { circle(d, tot - D / 2, W / 2, 0.22, 'perf'); }
  const y0 = W + ww + 1.4; rect(d, D, y0 + D, L - 0.2, W - 0.2); rect(d, D, y0, L - 0.2, D); rect(d, D, y0 + D + W - 0.2, L - 0.2, D); rect(d, 0, y0 + D, D, W - 0.2); rect(d, D + L - 0.2, y0 + D, D, W - 0.2);
  lab(d, D + L / 2, y0 + D + W / 2, 'Base tray');
  return d; };
T.rigidShoulder = () => { const d = T.lidBase({}); const x0 = 0, y0 = 5.6, L = 4, W = 3.4, n = 0.8;
  [L, W, L, W].forEach((w, i) => rect(d, x0 + [0, L, L + W, 2 * L + W][i], y0, w, n)); lab(d, L + W + L / 2, y0 + n / 2, 'Neck'); return d; };
T.round = () => { const d = make(), r = 2;
  circle(d, r, r, r); circle(d, 2 * r + 1.2 + r, r, r * 1.05); rect(d, 0, 2 * r + 1, 2 * Math.PI * r, 2.4); rect(d, 0, 2 * r + 1 + 2.4 + 0.6, 2 * Math.PI * r * 1.05, 0.9);
  lab(d, r, r, 'Base'); lab(d, 3 * r + 1.2, r, 'Lid'); lab(d, Math.PI * r, 2 * r + 2.2, 'Body strip'); return d; };
T.collapsible = () => { const d = T.rigidBook({ flap: true, magnet: true }); fold(d, 0.6, -0.6, 0.6, 4.2); return d; };

/* ---------- inserts ---------- */
T.insert = (o = {}) => { const d = make(), L = 8, W = 6; rect(d, 0, 0, L, W);
  const k = o.kind || 'foam';
  if (k === 'foam') { hole(d, R(1, 1, 2.6, 4)); hole(d, R(4.4, 1, 2.6, 1.8)); hole(d, R(4.4, 3.2, 2.6, 1.8)); }
  if (k === 'card') { [2, 4, 6].forEach(x => { hole(d, R(x - 0.05, 0, 0.1, W / 2)); }); [3].forEach(y => hole(d, R(0, y - 0.05, L / 2, 0.1))); rect(d, -1, 0, 1, W); rect(d, L, 0, 1, W); }
  if (k === 'plastic') { [1.6, 4, 6.4].forEach(x => [1.8, 4.2].forEach(y => hole(d, oval(x, y, 0.9, 0.9)))); }
  if (k === 'pulp') { [2.2, 5.8].forEach(x => hole(d, oval(x, 3, 1.4, 2.1))); }
  if (k === 'bottle') { hole(d, oval(4, 3, 1.5, 1.5)); }
  lab(d, L / 2, W - 0.4, 'Fits box: L × W'); return d; };

/* ---------- bags ---------- */
T.bag = (o = {}) => { const d = make(), W = 5, G = o.G || 2, H = 7, T2 = 1.2, B = 1.4; if (o.paper) d.paper = o.paper;
  const xs = [0, W, W + G, 2 * W + G]; [W, G, W, G].forEach((w, i) => rect(d, xs[i], 0, w, H)); glueFlap(d, 2 * W + 2 * G, 0, H, 0.5, 1);
  [W, G, W, G].forEach((w, i) => { rect(d, xs[i], -T2, w, T2); rect(d, xs[i], H, w, B); });
  [1, 3].forEach(i => { fold(d, xs[i] + G / 2, 0, xs[i] + G / 2, H); fold(d, xs[i], H, xs[i] + G / 2, H - G / 2); fold(d, xs[i] + G, H, xs[i] + G / 2, H - G / 2); });
  lab(d, W / 2, H / 2, 'W'); lab(d, W + G / 2, H * 0.35, 'G'); lab(d, W + G + W / 2, H * 0.62, 'H');
  if (o.diecut) [0, W + G].forEach(x => hole(d, oval(x + W / 2, 0.6, W * 0.16, 0.28)));
  if (o.rope) [0, W + G].forEach(x => { circle(d, x + W * 0.3, -T2 / 2, 0.13); circle(d, x + W * 0.7, -T2 / 2, 0.13); });
  if (o.ribbon) [0, W + G].forEach(x => { hole(d, R(x + W * 0.25, -T2 * 0.6, W * 0.08, T2 * 0.25)); hole(d, R(x + W * 0.67, -T2 * 0.6, W * 0.08, T2 * 0.25)); });
  if (o.twisted) [0, W + G].forEach(x => { const p = []; for (let i = 0; i <= 12; i++) { const t = i / 12; p.push([x + W * (0.25 + 0.5 * t), -T2 - Math.sin(Math.PI * t) * 1.6]); } for (let i = 0; i < p.length - 1; i++) d.marks.push([p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2, p[i + 1][0], p[i + 1][1]]); });
  if (o.flatHandle) [0, W + G].forEach(x => { rect(d, x + W * 0.2, -T2 - 0.5, W * 0.6, 0.5); });
  if (o.window) hole(d, R(W * 0.25, H * 0.25, W * 0.5, H * 0.35));
  return d; };
T.sos = (o = {}) => { const d = make(), W = 4, G = 2.4, H = 8;
  const xs = [0, W, W + G, 2 * W + G]; [W, G, W, G].forEach((w, i) => rect(d, xs[i], 0, w, H)); glueFlap(d, 2 * W + 2 * G, 0, H, 0.45, 1);
  rect(d, 0, H, 2 * W + 2 * G, G * 0.75); fold(d, 0, H + G * 0.4, 2 * W + 2 * G, H + G * 0.4);
  [1, 3].forEach(i => fold(d, xs[i] + G / 2, 0, xs[i] + G / 2, H));
  if (o.diecut) hole(d, oval(W / 2, 0.8, W * 0.18, 0.3)); else { for (let x = 0; x < 2 * W + 2 * G; x += 0.5) d.marks.push([x, 0, x + 0.25, -0.25, x + 0.5, 0]); }
  lab(d, W / 2, H / 2, 'W'); lab(d, W + G / 2, H * 0.4, 'G'); return d; };
T.tag = () => { const d = make(); add(d, [[0.6, 0], [3, 0], [3, 5], [0, 5], [0, 0.6]]); circle(d, 0.9, 0.9, 0.22); lab(d, 1.5, 3, 'W × H'); return d; };
T.tote = (o = {}) => { const d = make(), W = 6, H = 7, G = o.gusset === false ? 0 : 1.6;
  rect(d, 0, 0, W, H); lab(d, W / 2, H / 2, 'Front'); rect(d, W + 0.8, 0, W, H); lab(d, W * 1.5 + 0.8, H / 2, 'Back');
  if (G) { rect(d, 0, H + 0.8, 2 * W, G); lab(d, W, H + 0.8 + G / 2, 'Gusset strip'); }
  [0, 1].forEach(k => rect(d, 2 * W + 1.6 + k * 0.9, 0, 0.6, H * 1.1)); lab(d, 2 * W + 2.4, H * 1.15, 'Handles');
  perf(d, 0, 0.6, W, 0.6); perf(d, W + 0.8, 0.6, 2 * W + 0.8, 0.6);
  if (o.base) { rect(d, 0, H + 0.8 + (G ? G + 0.6 : 0), W, 1.6); lab(d, W / 2, H + 1.6 + (G ? G + 0.6 : 0), 'Base panel'); }
  if (o.paper) d.paper = o.paper;
  return d; };
T.wineTote = (o = {}) => { const d = T.tote({}); const n = o.n || 4; for (let k = 1; k < n; k++) fold(d, 6 / n * k, 0, 6 / n * k, 7); lab(d, 3, 7.6, n + ' bottle dividers'); return d; };

/* ---------- mailer bags / pouches ---------- */
T.polyMailer = (o = {}) => { const d = make(), W = 6, H = 9, F = 1.6; if (o.paper) d.paper = o.paper;
  rect(d, 0, 0, W, H); rect(d, 0, H, W, H); rect(d, 0, 2 * H, W, F); lab(d, W / 2, H / 2, 'Back'); lab(d, W / 2, H * 1.5, 'Front');
  add(d, R(0.2, 2 * H + 0.3, W - 0.4, 0.5), 'glue'); perf(d, 0, 2 * H - 0.6, W, 2 * H - 0.6);
  if (o.bubble) for (let x = 0.5; x < W; x += 0.9) for (let y = 0.5; y < 2 * H; y += 0.9) d.circles.push([x, y, 0.16, 'perf']);
  return d; };
T.pouch = (o = {}) => { const d = make(), W = 5, H = 8, G = o.gusset ? 1.4 : 0, B = o.stand ? 1.5 : 0; if (o.paper) d.paper = o.paper;
  rect(d, 0, 0, W, H); lab(d, W / 2, H / 2, 'Front'); const x2 = W + (o.side ? 2 * G + 0.8 : 0.8);
  rect(d, x2, 0, W, H); lab(d, x2 + W / 2, H / 2, 'Back');
  if (o.side) { rect(d, W + 0.4, 0, G, H); fold(d, W + 0.4 + G / 2, 0, W + 0.4 + G / 2, H); }
  if (B) { rect(d, 0, H + 0.6, W, B * 2); fold(d, 0, H + 0.6 + B, W, H + 0.6 + B); lab(d, W / 2, H + 0.6 + B / 2, 'Bottom gusset'); }
  if (o.flatBottom) { rect(d, 0, H + 0.6, W, G * 1.6); lab(d, W / 2, H + 0.6 + G * 0.8, 'Flat base'); }
  if (o.zip !== false) { perf(d, 0, 1.4, W, 1.4); perf(d, x2, 1.4, x2 + W, 1.4); }
  [[W, 0.8], [x2 + W, 0.8]].forEach(([x, y]) => d.holes.push([[x, y - 0.12], [x - 0.25, y], [x, y + 0.12]]));
  [0, x2].forEach(x => add(d, [[x, 0], [x + W, 0], [x + W, 0.35], [x, 0.35]], 'glue'));
  if (o.spout) { circle(d, W * 0.8, 0.6, 0.45); }
  if (o.window) hole(d, oval(W / 2, H * 0.6, W * 0.25, H * 0.18));
  if (o.tintie) { rect(d, x2 + W + 0.5, 0, 0.3, W * 1.2); lab(d, x2 + W + 1.2, W * 0.6, 'Tin tie'); }
  return d; };

/* ---------- displays ---------- */
T.counter = () => T.tray({ header: true, front: true });
T.floor = () => { const d = make(), W = 4, H = 12; rect(d, 0, 0, W, H); rect(d, -1.5, 0, 1.5, H); rect(d, W, 0, 1.5, H);
  add(d, [[0, 0], [W, 0], [W, -2.4], [W * 0.85, -3], [W * 0.15, -3], [0, -2.4]]); lab(d, W / 2, -1.4, 'Header');
  [3, 6, 9].forEach(y => { fold(d, -1.5, y, W + 1.5, y); hole(d, R(W * 0.1, y - 0.08, W * 0.8, 0.16)); });
  const x0 = W + 3; [0, 1, 2].forEach(k => { rect(d, x0, k * 2.6, W, 1.6); rect(d, x0, k * 2.6 + 1.6, W, 0.6); lab(d, x0 + W / 2, k * 2.6 + 0.8, 'Shelf ' + (k + 1)); });
  return d; };
T.peg = () => { const d = make(), W = 6, H = 8; rect(d, 0, 0, W, H); rect(d, 0, -2.2, W, 2.2); lab(d, W / 2, -1.1, 'Header');
  [1.5, 3, 4.5].forEach(x => [2.5, 5].forEach(y => hole(d, oval(x, y, 0.15, 0.4)))); rect(d, 0, H, W, 1.4); return d; };
T.dumpbin = () => { const d = T.rsc({}); hole(d, R(1, 1, 4, 1.4)); return d; };

/* ---------- labels / cards / tissue / tape / sleeves ---------- */
const BLEED = (d, x, y, w, h) => { perf(d, x - 0.15, y - 0.15, x + w + 0.15, y - 0.15); perf(d, x + w + 0.15, y - 0.15, x + w + 0.15, y + h + 0.15); perf(d, x + w + 0.15, y + h + 0.15, x - 0.15, y + h + 0.15); perf(d, x - 0.15, y + h + 0.15, x - 0.15, y - 0.15); };
T.label = (o = {}) => { const d = make(), k = o.kind || 'rect';
  if (k === 'round') { circle(d, 2, 2, 2); lab(d, 2, 2, 'Ø'); }
  else if (k === 'diecut') { const p = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, r = 2 + 0.35 * Math.sin(a * 5); p.push([2.4 + r * Math.cos(a), 2.4 + r * Math.sin(a)]); } add(d, p); lab(d, 2.4, 2.4, 'Custom shape'); }
  else if (k === 'sheet') { rect(d, 0, 0, 6, 8); for (let x = 0; x < 3; x++) for (let y = 0; y < 4; y++) hole(d, oval(1 + x * 2, 1 + y * 2, 0.75, 0.75)); lab(d, 3, 8.4, 'Sheet with kiss-cut labels'); }
  else if (k === 'seal') { circle(d, 1.5, 1.5, 1.5); circle(d, 1.5, 1.5, 1.1, 'perf'); lab(d, 1.5, 1.5, 'Seal'); }
  else if (k === 'clear') { const p = []; const rr = 0.5, w = 4.4, h = 2.6; [[w - rr, rr, -0.5], [w - rr, h - rr, 0], [rr, h - rr, 0.5], [rr, rr, 1]].forEach(([cx, cy, st]) => { for (let i = 0; i <= 6; i++) { const a = Math.PI * (st + i / 12); p.push([cx + rr * Math.cos(a), cy - rr * Math.sin(a)]); } }); add(d, p); BLEED(d, 0, 0, w, h); lab(d, w / 2, h / 2, 'Clear film'); d.paper = '#EEF6FA'; }
  else if (k === 'bottle') { rect(d, 0, 0, 7, 3.2); BLEED(d, 0, 0, 7, 3.2); fold(d, 3.5, 0, 3.5, 3.2); lab(d, 1.75, 1.6, 'Front'); lab(d, 5.25, 1.6, 'Back'); }
  else { rect(d, 0, 0, 4, 2.6); BLEED(d, 0, 0, 4, 2.6); lab(d, 2, 1.3, 'W × H'); }
  return d; };
T.card = (o = {}) => { const d = make(), k = o.kind || 'card';
  if (k === 'folded') { rect(d, 0, 0, 5, 7); rect(d, 5, 0, 5, 7); lab(d, 2.5, 3.5, 'Inside'); lab(d, 7.5, 3.5, 'Front'); }
  else if (k === 'holder') { rect(d, 0, 0, 4, 6); rect(d, 4, 0, 4, 6); add(d, [[4, 6], [8, 6], [7.5, 7.4], [4.5, 7.4]]); hole(d, R(4.8, 2, 2.4, 0.08)); hole(d, R(4.8, 3.6, 2.4, 0.08)); lab(d, 2, 3, 'Back'); lab(d, 6, 4.6, 'Card slot'); }
  else if (k === 'qr') { rect(d, 0, 0, 3.5, 2); BLEED(d, 0, 0, 3.5, 2); add(d, R(2.3, 0.5, 1, 1), 'glue'); lab(d, 1.1, 1, 'QR'); }
  else if (k === 'coupon') { rect(d, 0, 0, 5.5, 2.5); perf(d, 4, 0, 4, 2.5); lab(d, 2, 1.25, 'Card'); lab(d, 4.75, 1.25, 'Code'); }
  else { const W = o.w || 4, H = o.h || 6; if (o.paper) d.paper = o.paper; rect(d, 0, 0, W, H); BLEED(d, 0, 0, W, H); perf(d, 0.3, 0.3, W - 0.3, 0.3); lab(d, W / 2, H / 2, 'W × H'); }
  return d; };
T.tissue = (o = {}) => { const d = make(), W = 20, H = 30, k = o.kind || 'repeat'; rect(d, 0, 0, W, H); if (o.paper) d.paper = o.paper;
  if (k === 'position') d.marks.push(['logo', W / 2, H / 2, 3]);
  else if (k === 'rows') for (let y = 3; y < H; y += 6) for (let x = 2; x < W; x += 4) d.marks.push(['logo', x, y, 0.8]);
  else if (o.big) for (let x = 5; x < W; x += 10) for (let y = 5; y < H; y += 10) d.marks.push(['logo', x, y, 2]);
  else for (let x = 2.5; x < W; x += 5) for (let y = 2.5; y < H; y += 5) { const dx = k === 'diagonal' ? ((y / 5) % 2) * 2.5 : 0; if (x + dx < W) d.marks.push(['logo', x + dx, y, 0.9]); }
  lab(d, W / 2, H + 1.5, '20 × 30 in sheet'); return d; };
T.wrap = (o = {}) => { const d = make(), S = o.w || 12, H = o.h || S; rect(d, 0, 0, S, H); if (o.paper) d.paper = o.paper;
  if (o.diag) { fold(d, 0, 0, S, H); fold(d, S, 0, 0, H); } else if (o.cone) { fold(d, 0, H, S, 0); } else if (o.corners) { [[0, 0, 1, 1], [S, 0, -1, 1], [0, H, 1, -1], [S, H, -1, -1]].forEach(([x, y, sx, sy]) => fold(d, x + sx * S * 0.2, y, x, y + sy * H * 0.2)); } else { fold(d, 0, H / 2, S, H / 2); if (!o.oneFold) fold(d, S / 2, 0, S / 2, H); }
  if (o.marks !== false) for (let x = 2; x < S; x += (o.step || 4)) for (let y = 2; y < H; y += (o.step || 4)) d.marks.push(['logo', x, y, o.dot || 0.8]);
  if (o.stack) { rect(d, 0.6, -0.6, S, 0.6); rect(d, S, -0.6, 0.6, S); }
  lab(d, S / 2, H + 1, (o.w || 12) + ' × ' + (o.h || o.w || 12) + ' in sheet'); return d; };
T.tape = (o = {}) => { const d = make(), L = 24, W = 2; rect(d, 0, 0, L, W); if (o.paper) d.paper = o.paper;
  if (o.kind !== 'plain') for (let x = 1.5; x < L; x += 4) d.marks.push([o.kind === 'fragile' ? 'text' : (o.kind === 'void' ? 'void' : 'logo'), x + 1, W / 2, 0.6]);
  if (o.kind === 'reinforced') for (let x = 0; x < L; x += 1) { fold(d, x, 0, x + 1, W); }
  lab(d, L / 2, W + 1, 'Width × repeat length'); return d; };
T.cupSleeve = (o = {}) => { const d = make(), R1 = 9, R2 = 12, a = o.full ? 0.62 : (o.half ? 0.32 : 0.5);
  const pts = [], n = 24; const r2 = o.full ? R2 + 1.2 : R2;
  for (let i = 0; i <= n; i++) { const t = -a + 2 * a * i / n; pts.push([r2 * Math.sin(t), -r2 * Math.cos(t)]); }
  for (let i = n; i >= 0; i--) { const t = -a + 2 * a * i / n; pts.push([R1 * Math.sin(t), -R1 * Math.cos(t)]); }
  add(d, pts);
  const t0 = a, gx = [[R1 * Math.sin(t0), -R1 * Math.cos(t0)], [r2 * Math.sin(t0), -r2 * Math.cos(t0)], [r2 * Math.sin(t0 + 0.08), -r2 * Math.cos(t0 + 0.08)], [R1 * Math.sin(t0 + 0.08), -R1 * Math.cos(t0 + 0.08)]];
  if (!o.lock) add(d, gx, 'glue'); else { add(d, [gx[0], gx[1], [gx[1][0] + 0.9, gx[1][1] + 0.2], [gx[0][0] + 0.9, gx[0][1] + 0.6]]); const t = -a + 0.12; hole(d, R(R1 * Math.sin(t) + 0.1, -((R1 + r2) / 2) * Math.cos(t) - 0.6, 0.12, 1.2)); }
  if (o.paper) d.paper = o.paper;
  if (o.print) for (let i = 1; i < 6; i++) { const t = -a + 2 * a * i / 6; d.marks.push(['logo', ((R1 + r2) / 2) * Math.sin(t), -((R1 + r2) / 2) * Math.cos(t), 0.7]); }
  if (o.window) hole(d, oval(0, -(R1 + r2) / 2, 1.2, 0.8));
  if (o.coupon) { const t = 0.2; perf(d, R1 * Math.sin(t), -R1 * Math.cos(t), r2 * Math.sin(t), -r2 * Math.cos(t)); }
  if (o.flute) for (let i = 1; i < 18; i++) { const t = -a + 2 * a * i / 18; d.perf.push([R1 * Math.sin(t), -R1 * Math.cos(t), r2 * Math.sin(t), -r2 * Math.cos(t)]); }
  lab(d, 0, -(R1 + r2) / 2 + 0.9, 'Sleeve band'); return d; };

/* ---------- which template each style uses ---------- */
function pick(cat, name, shape) {
  const n = name.toLowerCase(), has = (...k) => k.some(x => n.includes(x));
  if (cat === 'folding-cartons' || cat === 'eco-packaging' && shape === 'tuck') {
    if (has('reverse tuck')) return ['rte'];
    if (has('take out box')) return ['takeout'];
    if (n === 't boxes') return ['ste', { window: true }];
    if (has('straight tuck', 'eco product')) return ['ste'];
    if (has('hanging')) return ['ste', { hang: true, lock: true }];
    if (has('5 panel hanger')) return ['ste', { hang: true }];
    if (has('snap lock')) return ['snapLock'];
    if (has('lock cap auto')) return ['autoBottom', { lockcap: true }];
    if (has('auto bottom display')) return ['tray', { header: true }];
    if (has('full flap auto')) return ['autoBottom', { fullTop: true }];
    if (has('auto bottom')) return ['autoBottom'];
    if (has('full overlap seal')) return ['sealEnd', { full: true }];
    if (has('seal end')) return ['sealEnd'];
    if (has('tuck end sleeve')) return ['sleeve', { tuck: true }];
    if (has('wall frame tray & sleeve')) return ['drawer', { double: true }];
    if (has('wall tray & sleeve')) return ['drawer'];
    if (has('wall frame tray & lid')) return ['lidBase', { double: true }];
    if (has('wall tray & lid')) return ['lidBase', { shallowLid: true, double: true }];
    if (has('sleeve')) return ['sleeve', { thumb: true }];
    if (has('pillow')) return ['pillow'];
    if (has('cube shaped')) return ['gable', { square: true }];
    if (has('gable bag')) return ['gable', { tall: true }];
    if (has('gable')) return ['gable'];
    if (has('hexagon')) return ['hexagon', { sides: 6 }];
    if (has('prism')) return ['hexagon', { sides: 3 }];
    if (has('header card')) return ['header'];
    if (has('dispenser')) return ['dispenser'];
    if (has('fries')) return ['fries'];
    if (has('sandwich')) return ['wedge'];
    if (has('tulip')) return ['tulip'];
    if (has('burger')) return ['burger'];
    if (has('take out box', 'take out boxes')) return ['takeout'];
    if (has('takeout paperboard')) return ['tray', { lid: true }];
    if (has('side lock cake')) return ['tray', { lid: true, window: true, corner: 'tabs' }];
    if (has('no glue cake')) return ['tray', { lid: true, corner: 'ears' }];
    if (has('lock cap with double')) return ['tray', { double: 'sides', lid: true }];
    if (has('front cut out')) return ['tray', { front: true, header: true }];
    if (has('side lock tuck top display')) return ['tray', { header: true, corner: 'tabs' }];
    if (has('4 corner display')) return ['tray', { header: true, corner: 'glue' }];
    if (has('6 corner')) return ['tray', { double: 'sides', corner: 'glue' }];
    if (has('four corner')) return ['tray', { corner: 'glue', thumb: true }];
    if (has('4 corner box')) return ['tray', { corner: 'glue' }];
    if (has('simplex')) return ['tray', { corner: 'ears' }];
    if (has('pinch lock')) return ['tray', { corner: 'pinch' }];
    if (has('stripper lock')) return ['tray', { corner: 'tabs' }];
    if (has('double glued side')) return ['tray', { double: 'sides' }];
    if (has('double wall frame tray')) return ['tray', { double: 'all' }];
    if (has('roll end tray')) return ['mailer', { tuckFront: false, ears: false }];
    if (has('roll end tuck top')) return ['mailer', { slots: true }];
    if (has('tab lock')) return ['mailer', { slots: true, rollFront: false }];
    if (has('bookend')) return ['mailer', { thumb: true }];
    if (has('paper mailer')) return ['mailer', {}];
  }
  if (cat === 'corrugated-boxes' || cat === 'eco-packaging' && shape === 'rsc') {
    if (has('pizza')) return ['mailer', { rollFront: false, ears: false }];
    if (has('with insert')) return ['insert', { kind: 'card' }];
    if (has('tuck top auto')) return ['rsc', { tuckTop: true, bottom: 'auto' }];
    if (has('tuck top 1-2-3')) return ['rsc', { tuckTop: true, bottom: 'snap' }];
    if (has('1-2-3')) return ['rsc', { bottom: 'snap' }];
    if (has('auto bottom')) return ['rsc', { bottom: 'auto' }];
    if (has('full slotted')) return ['rsc', { full: true }];
    if (has('slotted', 'eco shipping')) return ['rsc'];
    if (has('reverse tuck')) return ['rte'];
    if (has('book wrap')) return ['folder'];
    if (has('self locking')) return ['folder', { lock: true }];
    if (has('gusset folder')) return ['folder', { gusset: true }];
    if (has('wine')) return ['wine', { n: 2 }];
    if (has('roll ends with lid')) return ['lidBase', {}];
    if (has('3 flap')) return ['mailer', { slots: true }];
    if (has('tab lock')) return ['mailer', { slots: true, rollFront: false }];
    if (has('tuck top corrugated')) return ['mailer', { thumb: true }];
    if (has('one piece')) return ['mailer', { ears: false }];
    return ['mailer'];
  }
  if (cat === 'rigid-boxes' || cat === 'corporate-packaging' || cat === 'eco-packaging' && shape === 'lid') {
    if (has('book style')) return ['rigidBook', {}];
    if (has('flip top')) return ['rigidBook', { magnet: true }];
    if (has('magnetic', 'corporate gift')) return ['rigidBook', { flap: true, magnet: true }];
    if (has('hinged')) return ['rigidBook', { flap: true }];
    if (has('shoulder')) return ['rigidShoulder'];
    if (has('partial')) return ['lidBase', { shallowLid: true }];
    if (has('lift-off', 'executive', 'luxury')) return ['lidBase', {}];
    if (has('match', 'drawer')) return ['drawer'];
    if (has('round')) return ['round'];
    if (has('collapsible')) return ['collapsible'];
    if (has('custom shape')) return ['hexagon', { sides: 6 }];
    if (has('holiday')) return ['lidBase', { window: true }];
    if (has('event')) return ['mailer', { window: true, ears: false }];
    if (has('welcome kit')) return ['mailer', { thumb: true }];
    if (has('gift bags')) return ['bag', { rope: true }];
    if (has('thank-you')) return ['card', { kind: 'folded' }];
    if (has('inserts')) return ['insert', { kind: 'foam' }];
    if (has('folders')) return ['folder', { lock: true }];
  }
  if (cat === 'box-inserts' || (cat === 'eco-packaging' && has('insert'))) {
    if (has('foam')) return ['insert', { kind: 'foam' }];
    if (has('cardboard')) return ['insert', { kind: 'card' }];
    if (has('plastic')) return ['insert', { kind: 'plastic' }];
    if (has('pulp')) return ['insert', { kind: 'pulp' }];
    return ['insert', { kind: 'card' }];
  }
  if (cat === 'paper-bags' || has('shopping bag')) {
    if (has('tag')) return ['tag'];
    if (has('sos')) return ['sos'];
    if (has('die cut')) return ['sos', { diecut: true }];
    if (has('wine', 'liquor')) return ['wine', { n: 1 }];
    if (has('euro')) return ['bag', { rope: true }];
    if (has('gift')) return ['bag', { ribbon: true }];
    if (has('wide gusset')) return ['bag', { G: 3.2, flatHandle: true }];
    if (has('merchandise')) return ['sos', {}];
    if (has('kraft', 'eco')) return ['bag', { twisted: true, paper: '#E9D5B5' }];
    if (has('white')) return ['bag', { flatHandle: true }];
    return ['bag', { twisted: true }];
  }
  if (cat === 'reusable-bags') {
    if (has('custom wine')) return ['wineTote', { n: 6 }];
    if (has('wine')) return ['wineTote', { n: 4 }];
    if (has('canvas')) return ['tote', { gusset: false, base: true }];
    if (has('cotton')) return ['tote', { gusset: false }];
    if (has('jute')) return ['tote', { base: true, paper: '#E3CFA3' }];
    if (has('non-woven')) return ['tote', {}];
    if (has('woven')) return ['tote', { base: true }];
    return ['tote', {}];
  }
  if (cat === 'mailer-bags' || has('mailers')) return has('bubble') ? ['polyMailer', { bubble: true }] : has('paper', 'compostable') ? ['polyMailer', { paper: '#E9D5B5' }] : ['polyMailer', {}];
  if (cat === 'pouches' || has('pouches')) {
    if (has('flat bottom')) return ['pouch', { gusset: true, side: true, flatBottom: true }];
    if (has('flat')) return ['pouch', { zip: false }];
    if (has('spout')) return ['pouch', { stand: true, spout: true, zip: false }];
    if (has('tin-tie')) return ['pouch', { gusset: true, side: true, tintie: true, zip: false }];
    if (has('gusset')) return ['pouch', { gusset: true, side: true, zip: false }];
    if (has('kraft')) return ['pouch', { stand: true, window: true, paper: '#E9D5B5' }];
    if (has('compostable')) return ['pouch', { stand: true, paper: '#EDE3CF' }];
    return ['pouch', { stand: true }];
  }
  if (cat === 'display-boxes') { if (has('floor')) return ['floor']; if (has('peg')) return ['peg']; if (has('dump')) return ['dumpbin']; return ['counter']; }
  if (cat === 'labels-stickers' || has('stickers')) {
    if (has('hang tag')) return ['tag'];
    if (has('die-cut')) return ['label', { kind: 'diecut' }];
    if (has('kiss-cut')) return ['label', { kind: 'sheet' }];
    if (has('seal')) return ['label', { kind: 'seal' }];
    if (has('bottle')) return ['label', { kind: 'bottle' }];
    if (has('clear')) return ['label', { kind: 'clear' }];
    if (has('custom stickers')) return ['label', { kind: 'round' }];
    return ['label', {}];
  }
  if (cat === 'tissue-paper' || has('tissue paper')) {
    if (has('diagonal')) return ['tissue', { kind: 'diagonal' }];
    if (has('position printing') && !has('non')) return ['tissue', { kind: 'position' }];
    if (has('horizontal')) return ['tissue', { kind: 'rows' }];
    if (has('recycled')) return ['tissue', { paper: '#F1EEE6' }];
    if (has('custom printed')) return ['tissue', { big: true }];
    if (has('interleaved')) return ['wrap', { stack: true, w: 12, h: 10, oneFold: true }];
    if (has('tray liner')) return ['wrap', { w: 14, h: 18, marks: true, step: 5, oneFold: true }];
    if (has('basket')) return ['wrap', { w: 12, h: 12, corners: true }];
    if (has('burger')) return ['wrap', { w: 12, h: 12, diag: true }];
    if (has('sandwich')) return ['wrap', { w: 12, h: 16, oneFold: true }];
    if (has('fries')) return ['wrap', { w: 8, h: 8, cone: true, dot: 0.6, step: 3 }];
    if (has('greaseproof')) return ['wrap', { w: 14, h: 14 }];
    if (has('wax')) return ['wrap', { w: 15, h: 15, marks: false, paper: '#FBF6E9' }];
    if (has('bakery')) return ['wrap', { w: 10, h: 10, dot: 0.5, step: 2.5 }];
    return ['wrap', { w: 12, h: 12 }];
  }
  if (cat === 'packing-tape') { if (has('fragile')) return ['tape', { kind: 'fragile' }]; if (has('tamper')) return ['tape', { kind: 'void' }]; if (has('reinforced')) return ['tape', { kind: 'reinforced', paper: '#E9D5B5' }]; if (has('water')) return ['tape', { kind: 'plain', paper: '#DCC29A' }]; if (has('kraft')) return ['tape', { paper: '#E9D5B5' }]; return ['tape', {}]; }
  if (cat === 'card-inserts' || has('card')) {
    if (has('holder')) return ['card', { kind: 'holder' }];
    if (has('qr')) return ['card', { kind: 'qr' }];
    if (has('discount')) return ['card', { kind: 'coupon' }];
    if (has('postcard')) return ['card', { w: 6, h: 4 }];
    if (has('care')) return ['card', { w: 3, h: 4.5 }];
    if (has('kraft')) return ['card', { w: 4, h: 6, paper: '#E9D5B5' }];
    return ['card', { w: 6, h: 4.2 }];
  }
  if (cat === 'cup-sleeves') {
    if (has('full-wrap')) return ['cupSleeve', { full: true }];
    if (has('half-wrap')) return ['cupSleeve', { half: true }];
    if (has('window')) return ['cupSleeve', { window: true }];
    if (has('coupon')) return ['cupSleeve', { coupon: true }];
    if (has('corrugated')) return ['cupSleeve', { flute: true }];
    if (has('glue-free')) return ['cupSleeve', { lock: true }];
    if (has('kraft')) return ['cupSleeve', { paper: '#E9D5B5' }];
    if (has('recycled')) return ['cupSleeve', { paper: '#ECE8DF' }];
    if (has('seasonal')) return ['cupSleeve', { print: true }];
    return ['cupSleeve', {}];
  }
  // fall back on the illustration shape
  return ({ tuck: ['ste'], auto: ['autoBottom'], sleeve: ['sleeve', {}], tray: ['tray', {}], mail: ['mailer', {}], drawer: ['drawer'], lid: ['lidBase', {}], pillow: ['pillow'],
    rsc: ['rsc'], bag: ['bag', {}], flat: ['polyMailer'], insert: ['insert', {}], pouch: ['pouch', { stand: true }], tissue: ['tissue', {}], labels: ['label', {}] })[shape] || ['ste'];
}

/* ---------- edges: shared = fold, outside = cut ---------- */
function edges(polys) {
  const E = [];
  polys.forEach(p => p.forEach((a, i) => { const b = p[(i + 1) % p.length]; if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 1e-6) E.push([a, b]); }));
  const out = { cut: [], fold: [] };
  E.forEach(([a, b], idx) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy, iv = [];
    E.forEach(([c, e], j) => {
      if (j === idx) return;
      const cr1 = dx * (c[1] - a[1]) - dy * (c[0] - a[0]), cr2 = dx * (e[1] - a[1]) - dy * (e[0] - a[0]);
      if (Math.abs(cr1) > 1e-6 * Math.sqrt(len2) || Math.abs(cr2) > 1e-6 * Math.sqrt(len2)) return;
      let t1 = ((c[0] - a[0]) * dx + (c[1] - a[1]) * dy) / len2, t2 = ((e[0] - a[0]) * dx + (e[1] - a[1]) * dy) / len2;
      if (t1 > t2) [t1, t2] = [t2, t1];
      t1 = Math.max(0, t1); t2 = Math.min(1, t2); if (t2 - t1 > 1e-6) iv.push([t1, t2]);
    });
    iv.sort((p, q) => p[0] - q[0]); const merged = [];
    iv.forEach(v => { const m = merged[merged.length - 1]; if (m && v[0] <= m[1] + 1e-6) m[1] = Math.max(m[1], v[1]); else merged.push(v.slice()); });
    let t = 0; const P = s => [a[0] + dx * s, a[1] + dy * s];
    merged.forEach(([s, e]) => { if (s > t + 1e-6) out.cut.push([P(t), P(s)]); out.fold.push([P(s), P(e)]); t = e; });
    if (t < 1 - 1e-6) out.cut.push([P(t), P(1)]);
  });
  return out;
}

const f = v => Math.round(v * 100) / 100;
function render(d, title) {
  const all = [...d.pieces, ...d.glue].flat().concat(d.holes.flat());
  d.circles.forEach(([x, y, r]) => { all.push([x - r, y - r], [x + r, y + r]); });
  d.labels.forEach(([x, y]) => all.push([x, y]));
  let x0 = Math.min(...all.map(p => p[0])), x1 = Math.max(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), y1 = Math.max(...all.map(p => p[1]));
  const bw = x1 - x0, bh = y1 - y0, S = Math.max(bw, bh * 1.2) / 100, pad = 6 * S;
  const legH = 12 * S;
  const vb = [x0 - pad, y0 - pad, bw + 2 * pad, bh + 2 * pad + legH].map(f).join(' ');
  const sw = f(0.55 * S), id = 'h' + Math.random().toString(36).slice(2, 7);
  const line = (s, cls) => `<path d="${s.map(([a, b]) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`).join('')}" class="${cls}"/>`;
  const E = edges([...d.pieces, ...d.glue]);
  const polyPath = p => 'M' + p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
  let o = `<svg viewBox="${vb}" role="img" aria-label="${title} dieline" class="dl"><defs><pattern id="${id}" width="${f(2.2 * S)}" height="${f(2.2 * S)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${f(2.2 * S)}" height="${f(2.2 * S)}" fill="#F6EEDF"/><path d="M0 0V${f(2.2 * S)}" stroke="${COL.glue}" stroke-width="${f(0.5 * S)}"/></pattern>`;
  o += `<style>.dl .c{stroke:${COL.cut};stroke-width:${sw};fill:none;stroke-linecap:round}.dl .k{stroke:${COL.fold};stroke-width:${sw};fill:none;stroke-dasharray:${f(2 * S)} ${f(1.4 * S)}}.dl .p{stroke:${COL.perf};stroke-width:${sw};fill:none;stroke-dasharray:${f(0.5 * S)} ${f(1 * S)};stroke-linecap:round}.dl text{font-family:ui-monospace,Menlo,Consolas,monospace;fill:${COL.label}}</style></defs>`;
  o += `<rect x="${f(x0 - pad)}" y="${f(y0 - pad)}" width="${f(bw + 2 * pad)}" height="${f(bh + 2 * pad + legH)}" fill="#F7F8FB"/>`;
  d.pieces.forEach(p => { o += `<path d="${polyPath(p)}" fill="${d.paper || COL.paper}"/>`; });
  d.glue.forEach(p => { o += `<path d="${polyPath(p)}" fill="url(#${id})"/>`; });
  d.marks.forEach(m => {
    if (m[0] === 'logo') o += `<circle cx="${f(m[1])}" cy="${f(m[2])}" r="${f(m[3])}" fill="#FCE8F0"/><circle cx="${f(m[1])}" cy="${f(m[2])}" r="${f(m[3] * 0.45)}" fill="#F2B8CF"/>`;
    else if (m[0] === 'text') o += `<text x="${f(m[1])}" y="${f(m[2] + m[3] * 0.4)}" font-size="${f(m[3] * 1.4)}" text-anchor="middle" style="fill:#D21F66;font-weight:700">FRAGILE</text>`;
    else if (m[0] === 'void') o += `<text x="${f(m[1])}" y="${f(m[2] + m[3] * 0.4)}" font-size="${f(m[3] * 1.4)}" text-anchor="middle" style="fill:#1BA3C6;font-weight:700">VOID</text>`;
    else o += `<path d="M${m.slice(0, 2).map(f).join(' ')}L${m.slice(2, 4).map(f).join(' ')}L${m.slice(4, 6).map(f).join(' ')}" class="c"/>`;
  });
  o += line(E.fold, 'k') + line(E.cut, 'c');
  if (d.folds.length) o += line(d.folds.map(([a, b, c, e]) => [[a, b], [c, e]]), 'k');
  if (d.perf.length) o += line(d.perf.map(([a, b, c, e]) => [[a, b], [c, e]]), 'p');
  d.holes.forEach(p => { o += `<path d="${polyPath(p)}" fill="#F7F8FB" class="c"/>`; });
  d.circles.forEach(([x, y, r, k]) => { o += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" ${k === 'perf' ? 'fill="none" class="p"' : `fill="${r > 1 ? COL.paper : '#F7F8FB'}" class="c"`}/>`; });
  d.labels.forEach(([x, y, t]) => { o += `<text x="${f(x)}" y="${f(y + 1.3 * S)}" font-size="${f(3.6 * S)}" text-anchor="middle">${t}</text>`; });
  // legend (wraps to a second row when the drawing is narrow)
  const items = [['c', 'Cut line'], ['k', 'Fold line']];
  if (d.glue.length) items.push(['g', 'Glue area']);
  if (d.perf.length || d.circles.some(c => c[3] === 'perf')) items.push(['p', 'Perforation / guide']);
  const fs = 3.2 * S, iw = t => (9 + t.length * 2.05) * S + 5 * S, avail = bw + 2 * pad - 4 * S;
  let lx = x0 - pad + 4 * S, ly = y1 + pad + 5 * S, rows = 1;
  items.forEach(([k, t]) => {
    if (lx + iw(t) > x0 - pad + avail + 4 * S && lx > x0 - pad + 4.1 * S) { lx = x0 - pad + 4 * S; ly += 6 * S; rows++; }
    o += k === 'g' ? `<rect x="${f(lx)}" y="${f(ly - 1.6 * S)}" width="${f(7 * S)}" height="${f(3.2 * S)}" fill="url(#${id})"/>` : `<path d="M${f(lx)} ${f(ly)}H${f(lx + 7 * S)}" class="${k}"/>`;
    o += `<text x="${f(lx + 9 * S)}" y="${f(ly + 1.2 * S)}" font-size="${f(fs)}">${t}</text>`;
    lx += iw(t);
  });
  if (rows > 1) o = o.replace(/viewBox="([^"]+)"/, (m, v) => { const q = v.split(' ').map(Number); q[3] += (rows - 1) * 6 * S; return `viewBox="${q.map(f).join(' ')}"`; }).replace(/(<rect x="[^"]+" y="[^"]+" width="[^"]+" height=")([^"]+)(" fill="#F7F8FB"\/>)/, (m, a1, h, a3) => a1 + f(Number(h) + (rows - 1) * 6 * S) + a3);
  return o + '</svg>';
}

function dielineFor(cat, style) {
  const [key, opt] = pick(cat, style[1], style[2]);
  const d = (T[key] || T.ste)(opt || {});
  return render(d, style[1].replace(/&/g, '&amp;').replace(/"/g, '&quot;'));
}

module.exports = { dielineFor, pick };
