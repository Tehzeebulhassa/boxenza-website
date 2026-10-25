// Isometric illustration engine (from the demo). illus(shape, palette) -> SVG string
  var C30 = Math.cos(Math.PI / 6), S = 34;
  function P(x, y, z) { return [(x - y) * C30 * S, (x + y) * 0.5 * S - z * S]; }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function hx(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mix(a, b, t) {
    var A = hx(a), B = hx(b);
    return '#' + [0, 1, 2].map(function (i) { return ('0' + Math.round(A[i] + (B[i] - A[i]) * t).toString(16)).slice(-2); }).join('');
  }
  function shade(c, k) { return k >= 0 ? mix(c, '#ffffff', k) : mix(c, '#000000', -k); }
  function tones(c) { return { top: shade(c, 0.22), left: c, right: shade(c, -0.17), inL: shade(c, -0.05), inR: shade(c, -0.26), floor: shade(c, -0.42) }; }

  var UID = 0;
  function Ctx() { this.o = []; this.defs = []; this.b = [1e9, 1e9, -1e9, -1e9]; this.id = 'g' + (++UID) + '_'; this.n = 0; }
  Ctx.prototype.grad = function (ps, c1, c2) {
    var y0 = 1e9, y1 = -1e9, x = 0, i, id = this.id + (++this.n);
    for (i = 0; i < ps.length; i++) { if (ps[i][1] < y0) y0 = ps[i][1]; if (ps[i][1] > y1) y1 = ps[i][1]; x += ps[i][0]; }
    x /= ps.length;
    this.defs.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + y1.toFixed(1) + '"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.polyG = function (ps, c1, c2) {
    this.add(ps);
    var g = this.grad(ps, c1, c2);
    this.o.push('<polygon points="' + pts(ps) + '" fill="' + g + '" stroke="' + g + '" stroke-width=".8" stroke-linejoin="round"/>');
  };
  Ctx.prototype.hl = function (ps, op) {
    this.o.push('<polyline points="' + pts(ps) + '" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="' + (op || 0.5) + '"/>');
  };
  Ctx.prototype.add = function (ps) {
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (p[0] < this.b[0]) this.b[0] = p[0];
      if (p[1] < this.b[1]) this.b[1] = p[1];
      if (p[0] > this.b[2]) this.b[2] = p[0];
      if (p[1] > this.b[3]) this.b[3] = p[1];
    }
  };
  Ctx.prototype.poly = function (ps, fill, op) {
    this.add(ps);
    this.o.push('<polygon points="' + pts(ps) + '" fill="' + fill + '" stroke="' + fill + '" stroke-width=".8" stroke-linejoin="round"' + (op ? ' opacity="' + op + '"' : '') + '/>');
  };
  Ctx.prototype.line = function (ps, stroke, w) {
    this.add(ps);
    this.o.push('<polyline points="' + pts(ps) + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>');
  };
  Ctx.prototype.arc = function (p1, p2, rise, stroke, w) {
    this.add([p1, p2, [p1[0], p1[1] - rise], [p2[0], p2[1] - rise]]);
    this.o.push('<path d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' C' + p1[0].toFixed(1) + ' ' + (p1[1] - rise).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + (p2[1] - rise).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round"/>');
  };
  Ctx.prototype.shadow = function (ox, oy, w, d) {
    var ps = [P(ox + 0.12, oy + 0.12, 0), P(ox + w + 0.45, oy + 0.12, 0), P(ox + w + 0.45, oy + d + 0.45, 0), P(ox + 0.12, oy + d + 0.45, 0)];
    this.add(ps);
    var fid = this.id + 'b';
    this.defs.push('<filter id="' + fid + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>');
    this.o.push('<polygon points="' + pts(ps) + '" fill="#0A1028" opacity=".2" filter="url(#' + fid + ')"/>');
  };
  Ctx.prototype.svg = function () {
    var b = this.b, w = b[2] - b[0], h = b[3] - b[1], m = Math.max(w, h) * 1.14, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    return '<svg viewBox="' + (cx - m / 2).toFixed(1) + ' ' + (cy - m / 2).toFixed(1) + ' ' + m.toFixed(1) + ' ' + m.toFixed(1) + '" aria-hidden="true" focusable="false">' + (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + this.o.join('') + '</svg>';
  };

  function box(c, ox, oy, oz, w, d, h, col) {
    var t = tones(col);
    var top = [P(ox, oy, oz + h), P(ox + w, oy, oz + h), P(ox + w, oy + d, oz + h), P(ox, oy + d, oz + h)];
    var L = [P(ox, oy + d, oz), P(ox + w, oy + d, oz), P(ox + w, oy + d, oz + h), P(ox, oy + d, oz + h)];
    var R = [P(ox + w, oy, oz), P(ox + w, oy + d, oz), P(ox + w, oy + d, oz + h), P(ox + w, oy, oz + h)];
    c.polyG(L, shade(t.left, 0.08), shade(t.left, -0.1)); c.polyG(R, shade(t.right, 0.06), shade(t.right, -0.12)); c.polyG(top, shade(t.top, 0.1), t.top);
    c.hl([top[3], top[2], top[1]], 0.6); c.hl([L[1], L[2]], 0.28);
    return { top: top, L: L, R: R, t: t };
  }
  function tray(c, ox, oy, oz, w, d, h, col, mid) {
    var t = tones(col);
    c.poly([P(ox, oy, oz), P(ox + w, oy, oz), P(ox + w, oy + d, oz), P(ox, oy + d, oz)], t.floor);
    c.poly([P(ox, oy, oz), P(ox, oy + d, oz), P(ox, oy + d, oz + h), P(ox, oy, oz + h)], t.inR);
    c.poly([P(ox, oy, oz), P(ox + w, oy, oz), P(ox + w, oy, oz + h), P(ox, oy, oz + h)], t.inL);
    if (mid) mid();
    var L = [P(ox, oy + d, oz), P(ox + w, oy + d, oz), P(ox + w, oy + d, oz + h), P(ox, oy + d, oz + h)];
    var R = [P(ox + w, oy, oz), P(ox + w, oy + d, oz), P(ox + w, oy + d, oz + h), P(ox + w, oy, oz + h)];
    c.polyG(L, shade(t.left, 0.08), shade(t.left, -0.1)); c.polyG(R, shade(t.right, 0.06), shade(t.right, -0.12));
    c.line([P(ox, oy + d, oz + h), P(ox + w, oy + d, oz + h), P(ox + w, oy, oz + h)], t.top, 2);
    c.hl([L[3], L[2], R[3]], 0.55);
    return { L: L, R: R, t: t };
  }
  function flap(c, ox, oy, z, w, len, col) {
    var F = [P(ox, oy, z), P(ox + w, oy, z), P(ox + w, oy - 0.12, z + len), P(ox, oy - 0.12, z + len)];
    c.poly(F, col);
    return F;
  }
  function fp(F, u, v) {
    var A = F[0], B = F[1], D = F[3];
    return [A[0] + (B[0] - A[0]) * u + (D[0] - A[0]) * v, A[1] + (B[1] - A[1]) * u + (D[1] - A[1]) * v];
  }
  function patch(c, F, u0, v0, u1, v1, fill) { c.poly([fp(F, u0, v0), fp(F, u1, v0), fp(F, u1, v1), fp(F, u0, v1)], fill); }
  function circ(c, cx, cy, z, r, fill) {
    var ps = [];
    for (var i = 0; i < 28; i++) { var a = i / 28 * Math.PI * 2; ps.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z)); }
    c.poly(ps, fill);
  }
  function decor(c, f, a1, a2, kind, onlyL) {
    if (kind === 0) {
      patch(c, f.L, 0.14, 0.2, 0.86, 0.8, a1);
      patch(c, f.L, 0.24, 0.3, 0.46, 0.7, a2);
      patch(c, f.L, 0.54, 0.34, 0.78, 0.4, a2); patch(c, f.L, 0.54, 0.48, 0.74, 0.53, a2); patch(c, f.L, 0.54, 0.6, 0.68, 0.65, a2);
      if (!onlyL) { patch(c, f.R, 0.18, 0.22, 0.82, 0.78, a1); patch(c, f.R, 0.3, 0.38, 0.7, 0.44, a2); patch(c, f.R, 0.3, 0.52, 0.6, 0.57, a2); }
    } else {
      patch(c, f.L, 0, 0.36, 1, 0.6, a1); patch(c, f.L, 0, 0.66, 1, 0.7, a2);
      if (!onlyL) { patch(c, f.R, 0, 0.36, 1, 0.6, a1); patch(c, f.R, 0, 0.66, 1, 0.7, a2); }
    }
  }

  var PAL = [
    ['#F2F4F6', '#D21F66', '#F2B632'], ['#C9A06B', '#2B3A55', '#F2F4F6'], ['#2F5D8C', '#F2B632', '#F2F4F6'],
    ['#E4574C', '#F2F4F6', '#2B3A55'], ['#F0C9D0', '#2B3A55', '#223577'], ['#3E3B4F', '#F2B632', '#F0C9D0'], ['#9FB4E0', '#F2F4F6', '#2B3A55'], ['#B9C2CC', '#2B3A55', '#F2B632']
  ];

  function illus(shape, pi) {
    var pal = PAL[pi % PAL.length], col = pal[0], a1 = pal[1], a2 = pal[2], c = new Ctx(), t = tones(col), f, w, d, h, F;
    switch (shape) {
      case 'sleeve':
        c.shadow(0, 0, 2.4, 1.2); f = box(c, 0, 0, 0, 2.4, 1.2, 0.95, col);
        patch(c, f.R, 0.1, 0.12, 0.9, 0.88, t.floor); decor(c, f, a1, a2, 0, true); break;
      case 'pillow':
        c.add([[-72, -50], [72, 58]]);
        c.o.push('<ellipse cx="4" cy="50" rx="68" ry="8" fill="#000" opacity=".1"/>');
        c.o.push('<path d="M-66 24 C-30 40 30 40 66 24 L66 34 C30 50 -30 50 -66 34 Z" fill="' + t.right + '"/>');
        c.o.push('<path d="M-66 -28 C-30 -44 30 -44 66 -28 L66 24 C30 40 -30 40 -66 24 Z" fill="' + col + '"/>');
        c.o.push('<rect x="-34" y="-14" width="68" height="26" rx="3" fill="' + a1 + '"/><circle cx="0" cy="-1" r="7" fill="' + a2 + '"/>');
        break;
      case 'tuck':
        c.shadow(0, 0, 1.3, 1.3); flap(c, 0, 0, 1.9, 1.3, 1.0, t.top);
        f = box(c, 0, 0, 0, 1.3, 1.3, 1.9, col); decor(c, f, a1, a2, 0, false); break;
      case 'auto':
        c.shadow(0, 0, 1.5, 1.0); f = box(c, 0, 0, 0, 1.5, 1.0, 1.9, col);
        decor(c, f, a1, a2, 1, false); c.line([fp(f.top, 0, 0.5), fp(f.top, 1, 0.5)], t.right, 1.3); break;
      case 'tray':
        c.shadow(0, 0, 2.2, 1.5); f = tray(c, 0, 0, 0, 2.2, 1.5, 0.75, col); decor(c, f, a1, a2, 0, true); break;
      case 'traydisp':
        c.shadow(0, 0, 2.2, 1.4); F = flap(c, 0, 0, 0.75, 2.2, 1.2, a1);
        patch(c, F, 0.18, 0.25, 0.82, 0.75, a2); patch(c, F, 0.32, 0.4, 0.68, 0.6, a1);
        f = tray(c, 0, 0, 0, 2.2, 1.4, 0.75, col); decor(c, f, a1, a2, 1, true); break;
      case 'lid':
        c.shadow(0, 0, 2, 1.6); box(c, 0, 0, 0, 1.9, 1.5, 0.75, col);
        f = box(c, -0.08, -0.08, 0.55, 2.06, 1.66, 0.4, shade(col, 0.05)); decor(c, f, a1, a2, 1, false); break;
      case 'gift':
        c.shadow(0, 0, 2, 1.6); box(c, 0, 0, 0, 1.9, 1.5, 0.75, col);
        f = box(c, -0.08, -0.08, 0.55, 2.06, 1.66, 0.4, shade(col, 0.05));
        patch(c, f.top, 0.44, 0, 0.56, 1, a1); patch(c, f.L, 0.44, 0, 0.56, 1, a1); break;
      case 'drawer':
        c.shadow(0, 0, 3, 1.5); f = box(c, 0, 0, 0, 1.7, 1.4, 0.95, col);
        patch(c, f.R, 0.1, 0.14, 0.9, 0.86, t.floor); decor(c, f, a1, a2, 1, true);
        F = tray(c, 1.7, 0.12, 0.06, 1.3, 1.16, 0.7, shade(col, 0.1)); decor(c, F, a1, a2, 0, true); break;
      case 'mail':
        c.shadow(0, 0, 2, 1.5); flap(c, 0, 0, 0.85, 2, 1.15, t.top);
        f = tray(c, 0, 0, 0, 2, 1.5, 0.85, col); decor(c, f, a1, a2, 0, true); break;
      case 'rsc':
        c.shadow(0, 0, 1.9, 1.4); f = box(c, 0, 0, 0, 1.9, 1.4, 1.3, col);
        patch(c, f.top, 0.44, 0, 0.56, 1, shade(col, -0.14)); decor(c, f, a1, a2, 0, true); break;
      case 'insert':
        c.shadow(0, 0, 2.4, 1.7);
        f = tray(c, 0, 0, 0, 2.4, 1.7, 0.55, col, function () {
          circ(c, 0.75, 0.75, 0.02, 0.36, t.floor); circ(c, 1.65, 0.75, 0.02, 0.36, t.floor);
          c.poly([P(0.35, 1.15, 0.02), P(2.05, 1.15, 0.02), P(2.05, 1.45, 0.02), P(0.35, 1.45, 0.02)], t.floor);
        }); break;
      case 'bag': case 'bagw': case 'wine': case 'sos':
        var dm = { bag: [1.5, 0.7, 2], bagw: [2, 0.9, 1.6], wine: [0.9, 0.9, 2.5], sos: [1.3, 0.8, 2.1] }[shape];
        w = dm[0]; d = dm[1]; h = dm[2];
        c.shadow(0, 0, w, d);
        var hc = shade(col, -0.5), rise = h * S * 0.32;
        if (shape !== 'sos') c.arc(P(w * 0.3, 0, h), P(w * 0.7, 0, h), rise, hc, 3);
        f = box(c, 0, 0, 0, w, d, h, col);
        if (shape === 'sos') c.line([P(0, d, h - 0.2), P(w, d, h - 0.2), P(w, 0, h - 0.2)], t.right, 1.4);
        else c.poly(f.top, t.inR);
        if (shape !== 'sos') c.arc(P(w * 0.3, d, h), P(w * 0.7, d, h), rise, hc, 3);
        decor(c, f, a1, a2, 0, true); break;
      case 'flat': case 'flatp':
        var th = shape === 'flat' ? 0.1 : 0.28;
        c.shadow(0, 0, 2.4, 1.7); f = box(c, 0, 0, 0, 2.4, 1.7, th, col);
        patch(c, f.top, 0, 0, 1, 0.16, t.right); patch(c, f.top, 0.14, 0.3, 0.56, 0.78, a1); patch(c, f.top, 0.64, 0.3, 0.86, 0.46, a2); break;
      case 'pouch':
        c.add([[-62, -80], [62, 98]]);
        c.o.push('<ellipse cx="0" cy="88" rx="50" ry="8" fill="#000" opacity=".1"/>');
        c.o.push('<path d="M-48 -74 H48 L58 52 Q60 82 36 82 H-36 Q-60 82 -58 52 Z" fill="' + col + '"/>');
        c.o.push('<path d="M-48 -74 H-30 L-40 82 H-36 Q-60 82 -58 52 Z" fill="#fff" opacity=".2"/>');
        c.o.push('<path d="M-58 56 Q0 92 58 56 L58 52 Q0 86 -58 52 Z" fill="' + t.right + '"/>');
        c.o.push('<rect x="-48" y="-74" width="96" height="11" fill="' + t.right + '" opacity=".55"/>');
        c.o.push('<rect x="-50" y="-52" width="100" height="5" fill="' + t.inR + '" opacity=".5"/>');
        c.o.push('<circle cx="0" cy="8" r="26" fill="' + a1 + '"/><circle cx="0" cy="8" r="10" fill="' + a2 + '"/>');
        break;
      case 'tote':
        w = 1.9; d = 0.35; h = 2.0;
        c.shadow(0, 0, w, d);
        c.arc(P(w * 0.25, 0, h), P(w * 0.75, 0, h), h * S * 0.55, shade(col, -0.3), 5);
        f = box(c, 0, 0, 0, w, d, h, col); c.poly(f.top, t.inR);
        c.arc(P(w * 0.25, d, h), P(w * 0.75, d, h), h * S * 0.55, shade(col, -0.3), 5);
        decor(c, f, a1, a2, 0, true); break;
      case 'tin':
        c.add([[-64, -66], [64, 74]]);
        c.o.push('<ellipse cx="8" cy="64" rx="62" ry="12" fill="#000" opacity=".1"/>');
        c.o.push('<path d="M-54 -22 V52 A54 16 0 0 0 54 52 V-22 Z" fill="' + col + '"/>');
        c.o.push('<path d="M-54 -22 V52 A54 16 0 0 0 -34 66 V-14 Z" fill="#fff" opacity=".22"/>');
        c.o.push('<rect x="-32" y="4" width="64" height="30" rx="3" fill="' + a1 + '"/><circle cx="0" cy="19" r="8" fill="' + a2 + '"/>');
        c.o.push('<path d="M-58 -46 V-22 A58 17 0 0 0 58 -22 V-46 Z" fill="' + t.right + '"/>');
        c.o.push('<ellipse cx="0" cy="-46" rx="58" ry="17" fill="' + t.top + '"/>');
        c.o.push('<ellipse cx="0" cy="-46" rx="44" ry="11" fill="none" stroke="' + t.inL + '" stroke-width="1.5"/>');
        break;
      case 'cupsleeve':
        c.add([[-66, -72], [66, 78]]);
        c.o.push('<ellipse cx="6" cy="72" rx="52" ry="9" fill="#000" opacity=".1"/>');
        c.o.push('<path d="M-40 -34 L-32 62 Q0 74 32 62 L40 -34 Z" fill="#FFFFFF"/>');
        c.o.push('<path d="M-46 -52 V-42 A46 9 0 0 0 46 -42 V-52 Z" fill="' + t.right + '"/>');
        c.o.push('<ellipse cx="0" cy="-52" rx="46" ry="9" fill="' + t.top + '"/>');
        c.o.push('<path d="M-43 -16 L-37 42 Q0 54 37 42 L43 -16 Q0 -4 -43 -16 Z" fill="' + col + '"/>');
        c.o.push('<path d="M-41 6 L-39 22 Q0 34 39 22 L41 6 Q0 18 -41 6 Z" fill="' + a1 + '"/>');
        c.o.push('<circle cx="0" cy="22" r="7" fill="' + a2 + '"/>');
        break;
      case 'tape':
        c.add([[-68, -34], [68, 70]]);
        c.o.push('<ellipse cx="6" cy="38" rx="64" ry="22" fill="#000" opacity=".1"/>');
        c.o.push('<path d="M-60 0 V26 A60 24 0 0 0 60 26 V0 Z" fill="' + t.right + '"/>');
        c.o.push('<ellipse cx="0" cy="0" rx="60" ry="24" fill="' + col + '"/>');
        c.o.push('<ellipse cx="0" cy="0" rx="44" ry="17" fill="none" stroke="' + a1 + '" stroke-width="9"/>');
        c.o.push('<ellipse cx="0" cy="0" rx="26" ry="10" fill="#E9ECEC"/>');
        c.o.push('<path d="M-22 22 L-62 44 L-32 56 L8 30 Z" fill="' + col + '"/>');
        c.o.push('<path d="M-30 33 L-48 44 L-40 47 L-20 37 Z" fill="' + a1 + '"/>');
        break;
      case 'tissue':
        c.add([[-70, -44], [72, 56]]);
        c.o.push('<ellipse cx="6" cy="44" rx="62" ry="14" fill="#000" opacity=".09"/>');
        [30, 21, 12].forEach(function (y) {
          c.o.push('<path d="M-56 ' + y + ' L8 ' + (y - 22) + ' L64 ' + (y + 4) + ' L0 ' + (y + 26) + ' Z" fill="' + t.right + '" stroke="#fff" stroke-width="1" opacity=".95"/>');
        });
        c.o.push('<path d="M-56 3 L8 -19 L64 7 L0 31 Z" fill="' + col + '"/>');
        [[-22, 6], [-6, 12], [14, 4], [30, 14], [-2, -4], [22, -6]].forEach(function (p) {
          c.o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="' + a1 + '"/>');
        });
        c.o.push('<path d="M8 -19 L36 -8 L18 -2 Z" fill="' + a2 + '" opacity=".95"/>');
        break;
      case 'labels':
        c.shadow(0, 0, 2.4, 1.7); f = box(c, 0, 0, 0, 2.4, 1.7, 0.06, col);
        circ(c, 0.65, 0.6, 0.07, 0.32, a1); circ(c, 1.5, 0.6, 0.07, 0.32, a2); circ(c, 0.65, 1.2, 0.07, 0.26, a2);
        c.poly([P(1.2, 1.0, 0.07), P(2.1, 1.0, 0.07), P(2.1, 1.45, 0.07), P(1.2, 1.45, 0.07)], a1); break;
      case 'disp': case 'dispt':
        var tall = shape === 'dispt';
        w = tall ? 1.7 : 2.4; d = 1.3; h = tall ? 1.3 : 0.75;
        c.shadow(0, 0, w, d); F = flap(c, 0, 0, h, w, tall ? 1.6 : 1.2, a1);
        patch(c, F, 0.18, 0.25, 0.82, 0.75, a2); patch(c, F, 0.3, 0.4, 0.7, 0.6, a1);
        tray(c, 0, 0, 0, w, d, h, col, function () {
          var n = tall ? 2 : 3, i, ih = tall ? 0.8 : 0.6;
          for (i = 0; i < n; i++) box(c, 0.18 + i * (w - 0.4) / n, 0.3, 0.02, 0.5, 0.5, ih, i % 2 ? a1 : a2);
        }); break;
    }
    return c.svg();
  }
module.exports = { illus: illus };
