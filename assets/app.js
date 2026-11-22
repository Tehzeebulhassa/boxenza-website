/* Boxenza front-end: menu, tabs, instant landed price, quote basket and quote form. */
(function () {
  'use strict';
  var PR = window.BX_PRICING || { rates: { USD: 1 }, symbols: { USD: '$' }, countries: {}, categories: {}, qtyTiers: [[1, 1]], options: {}, addOn: 0, range: 0.12 };
  function $(id) { return document.getElementById(id); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  // u(): turns a site path into a working link (also in the offline preview build)
  function u(p) {
    if (typeof window.BX_BASE !== 'string') return p;
    var h = '', i = p.indexOf('#');
    if (i >= 0) { h = p.slice(i); p = p.slice(0, i); }
    var q = '', j = p.indexOf('?');
    if (j >= 0) { q = p.slice(j); p = p.slice(0, j); }
    p = p.replace(/^\//, '');
    if (p === '' || /\/$/.test(p)) p += 'index.html';
    return window.BX_BASE + p + q + h;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- country & currency ---------- */
  var EU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  function guessCountry() {
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en-US']);
    for (var i = 0; i < langs.length; i++) {
      var m = /-([A-Za-z]{2})$/.exec(langs[i] || '');
      if (!m) continue;
      var r = m[1].toUpperCase();
      if (r === 'UK') r = 'GB';
      if (PR.countries[r]) return r;
      if (EU.indexOf(r) >= 0) return 'EU';
      return 'OTHER';
    }
    return 'US';
  }
  var country = store.get('bx_country', null) || guessCountry();
  var cur = store.get('bx_cur', null) || (PR.countries[country] ? PR.countries[country].currency : 'USD');
  var listeners = [];
  function onLocChange(fn) { listeners.push(fn); }
  function fireLoc() { listeners.forEach(function (fn) { fn(); }); }

  var selCountry = $('bx-country'), selCur = $('bx-cur');
  if (selCountry) {
    selCountry.value = country;
    selCountry.addEventListener('change', function () {
      country = selCountry.value; store.set('bx_country', country);
      cur = PR.countries[country] ? PR.countries[country].currency : 'USD'; store.set('bx_cur', cur); if (selCur) selCur.value = cur;
      fireLoc();
    });
  }
  if (selCur) {
    selCur.value = cur;
    selCur.addEventListener('change', function () { cur = selCur.value; store.set('bx_cur', cur); fireLoc(); });
  }
  function countryName(k) { return PR.countries[k] ? PR.countries[k].name : 'your country'; }
  function money(usd) {
    var v = usd * (PR.rates[cur] || 1), sym = PR.symbols[cur] || (cur + ' ');
    if (v === 0) return sym + '0';
    var dec = v < 10 ? 2 : 0;
    return sym + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  /* ---------- estimate ---------- */
  function tierMult(q) {
    var t = PR.qtyTiers, m = t[0][1];
    for (var i = 0; i < t.length; i++) { if (q >= t[i][0]) m = t[i][1]; }
    return m;
  }
  function estimate(o) {
    if (window.BX_INSTANT === false) return null; // instant price switched off
    var c = PR.categories[o.cat]; if (!c) return null;
    var k = o.unit === 'mm' ? 1 / 25.4 : 1;
    var l = +o.dims[0] * k, w = +o.dims[1] * k, d = +o.dims[2] * k;
    if (!(l > 0 && w > 0)) return null;
    if (!(d > 0)) d = 0.1;
    var r = c.refDims, ratio;
    if (c.mode === 'tape') { ratio = (l / r[0]) * (+o.dims[1] / r[1]); } // width in unit, length always in yards
    else { var ref = 2 * (r[0] * r[1] + r[0] * r[2] + r[1] * r[2]); ratio = (2 * (l * w + l * d + w * d)) / ref; }
    var f = Math.min(12, Math.max(0.25, Math.pow(ratio, 0.75)));
    var extra = 0;
    (o.opts || []).forEach(function (n) { extra += PR.options[n] != null ? PR.options[n] : (PR.optDefault || 0); });
    extra += (o.adds || []).length * (PR.addOn || 0);
    var qty = +o.qty || 1000;
    var unitGoods = c.unit * f * tierMult(qty) * (1 + extra);
    var goods = unitGoods * qty;
    var res = { qty: qty, goods: goods };
    var ct = PR.countries[o.country];
    if (!ct) { res.partial = true; res.total = goods; return res; }
    var kg = c.kg * Math.max(ratio, 0.2) * qty * 1.1;
    res.ship = Math.max(ct.minShip, kg * ct.shipPerKg);
    res.duty = (goods + res.ship) * ct.duty;
    res.tax = (goods + res.ship + res.duty) * ct.tax;
    res.total = goods + res.ship + res.duty + res.tax;
    return res;
  }
  function renderEst(box, e) {
    if (!box) return;
    var to = box.querySelector('[data-est-country]');
    if (to) to.textContent = countryName(country);
    var body = box.querySelector('.est-body');
    if (!e) { body.innerHTML = '<p class="est-empty">Enter the length and width to see your price.</p>'; return; }
    var lo = e.total * (1 - PR.range), hi = e.total * (1 + PR.range);
    var html = '<div class="est-total">' + money(lo) + ' – ' + money(hi) + '</div>' +
      '<div class="est-unit">' + money(lo / e.qty) + ' – ' + money(hi / e.qty) + ' per piece · ' + e.qty.toLocaleString('en-US') + ' pieces</div>';
    if (e.partial) {
      html += '<div class="est-lines"><span>Production</span><span>' + money(e.goods) + '</span></div>' +
        '<p class="est-empty" style="font-size:0.85rem">Shipping, duty and tax to your country are priced in your quote.</p>';
    } else {
      html += '<div class="est-lines"><span>Production</span><span>' + money(e.goods) + '</span><span>Door-to-door shipping</span><span>' + money(e.ship) + '</span>' +
        '<span>Import duty</span><span>' + money(e.duty) + '</span><span>Import tax / VAT</span><span>' + money(e.tax) + '</span></div>';
    }
    body.innerHTML = html;
  }

  /* ---------- quote basket ---------- */
  var basket = store.get('bx_basket', []);
  if (!Array.isArray(basket)) basket = [];
  function saveBasket() {
    store.set('bx_basket', basket);
    var t = basket.length ? ' (' + basket.length + ')' : '';
    var qn = $('qn'); if (qn) qn.textContent = t;
    $$('[data-qn]').forEach(function (x) { x.textContent = t; });
  }
  saveBasket();

  function pressed(root, kind) {
    return $$('.opt[data-kind="' + kind + '"][aria-pressed="true"]', root).map(function (x) { return x.getAttribute('data-val'); });
  }
  document.addEventListener('click', function (e) {
    var op = e.target.closest('.opt');
    if (op) { op.setAttribute('aria-pressed', op.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); op.dispatchEvent(new Event('change', { bubbles: true })); }
  });

  /* ---------- product page ---------- */
  var ppf = $('pp-form');
  if (ppf) {
    var ppBox = $('pp-est');
    var readPP = function () {
      return { cat: ppf.getAttribute('data-cat'), dims: [$('pp-l').value, $('pp-w').value, $('pp-d').value], unit: $('pp-unit').value,
        qty: $('pp-qty').value, opts: pressed(ppf, 'opt'), adds: pressed(ppf, 'add'), country: country };
    };
    var updPP = function () {
      var e = estimate(readPP());
      renderEst(ppBox, e);
      var bt = $('buy-total');
      if (bt) bt.textContent = e ? money(e.total * (1 - PR.range)) + ' – ' + money(e.total * (1 + PR.range)) : '';
    };
    ppf.addEventListener('input', updPP); ppf.addEventListener('change', updPP); onLocChange(updPP); updPP();
    ppf.querySelector('[data-add]').addEventListener('click', function () {
      var o = readPP(), msg = $('pp-msg');
      var need = +(ppf.querySelector('[data-req]') || { getAttribute: function () { return 3; } }).getAttribute('data-req');
      if (o.dims.slice(0, need).some(function (v) { return !v; })) { msg.className = 'pp-msg err'; msg.textContent = 'Enter the ' + (need === 3 ? 'three sizes' : 'size') + ' marked * to add this style to your quote.'; $('pp-l').focus(); return; }
      basket.push({ code: ppf.getAttribute('data-code'), name: ppf.getAttribute('data-name'), cat: o.cat, catName: ppf.getAttribute('data-catname'),
        dims: [o.dims[0], o.dims[1], o.dims[2] || '-'], unit: o.unit, mat: $('pp-mat').value, print: $('pp-print').value, fin: $('pp-fin').value, opts: o.opts, adds: o.adds, qty: o.qty });
      saveBasket();
      msg.className = 'pp-msg'; msg.innerHTML = 'Added to your quote. <a href="' + u('/quote/') + '">View my quote</a>';
    });
    // gallery
    var main = $('pp-main-wrap');
    $$('[data-thumb]').forEach(function (th) {
      th.addEventListener('click', function () {
        var k = th.getAttribute('data-thumb');
        $$('.pp-view', main).forEach(function (v) { v.hidden = v.getAttribute('data-view') !== k; });
        $$('[data-thumb]').forEach(function (x) { x.setAttribute('aria-current', x === th ? 'true' : 'false'); });
      });
    });
    main.addEventListener('click', function (e) {
      if (e.target.closest('[data-expand]')) { main.classList.add('expanded'); return; }
      if (main.classList.contains('expanded')) main.classList.remove('expanded');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') main.classList.remove('expanded'); });
  }

  /* ---------- instant price page ---------- */
  var ipf = $('ip-form');
  if (ipf && window.BX_CATALOG) {
    var cat = $('ip-cat'), sty = $('ip-style'), ipBox = $('ip-est');
    var fillStyles = function () {
      var c = window.BX_CATALOG.filter(function (x) { return x.s === cat.value; })[0];
      sty.innerHTML = c.st.map(function (s, i) { return '<option value="' + i + '">' + esc(s[1]) + ' (' + s[0] + ')</option>'; }).join('');
      ['l', 'w', 'd'].forEach(function (k, j) {
        var inp = $('ip-' + k), f = inp.parentNode, lab = f.querySelector('label');
        f.hidden = !c.dims[j]; if (!c.dims[j]) inp.value = '';
        lab.textContent = c.dims[j] || 'Depth';
      });
      var og = $('ip-opts'); if (og) og.innerHTML = c.opts.map(function (n) { return '<button type="button" class="opt" data-kind="opt" data-val="' + esc(n) + '" aria-pressed="false">' + esc(n) + '</button>'; }).join('');
    };
    var current = function () {
      var c = window.BX_CATALOG.filter(function (x) { return x.s === cat.value; })[0];
      return { c: c, s: c.st[+sty.value || 0] };
    };
    var readIP = function () {
      return { cat: cat.value, dims: [$('ip-l').value, $('ip-w').value, $('ip-d').value], unit: $('ip-unit').value, qty: $('ip-qty').value, opts: pressed(ipf, 'opt'), adds: [], country: country };
    };
    var updIP = function () {
      var cs = current();
      $('ip-link').href = u('/' + cs.c.s + '/' + cs.s[2] + '/');
      renderEst(ipBox, estimate(readIP()));
    };
    var params = new URLSearchParams(location.search);
    if (params.get('cat')) cat.value = params.get('cat');
    fillStyles();
    cat.addEventListener('change', function () { fillStyles(); updIP(); });
    ipf.addEventListener('input', updIP); ipf.addEventListener('change', updIP); onLocChange(updIP); updIP();
    ipf.querySelector('[data-ip-add]').addEventListener('click', function () {
      var o = readIP(), cs = current(), msg = $('ip-msg');
      if (!o.dims[0] || !o.dims[1]) { msg.className = 'pp-msg err'; msg.textContent = 'Enter the size first.'; $('ip-l').focus(); return; }
      basket.push({ code: cs.s[0], name: cs.s[1], cat: cs.c.s, catName: cs.c.n, dims: [o.dims[0], o.dims[1], o.dims[2] || '-'], unit: o.unit,
        mat: 'Need consultation', print: 'Need consultation', fin: 'Need consultation', opts: o.opts, adds: [], qty: o.qty });
      saveBasket();
      msg.className = 'pp-msg'; msg.innerHTML = 'Added to your quote. <a href="' + u('/quote/') + '">View my quote</a>';
    });
  }

  /* ---------- tabs (category styles, option library) ---------- */
  $$('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-tab');
      $$('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      $$('#cat-grid .style').forEach(function (card) { card.hidden = t !== 'all' && (' ' + card.getAttribute('data-tabs') + ' ').indexOf(' ' + t + ' ') < 0; });
    });
  });
  $$('[data-otab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-otab');
      $$('[data-otab]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      $$('[data-ogroup]').forEach(function (g) { g.hidden = g.getAttribute('data-ogroup') !== t; });
    });
  });

  /* ---------- search ---------- */
  var searchIdx = null, searchReq = null;
  function loadSearchIndex() {
    if (searchIdx) return Promise.resolve(searchIdx);
    if (searchReq) return searchReq;
    searchReq = fetch(u('/assets/search-index.json')).then(function (r) { return r.json(); }).then(function (j) { searchIdx = j; return j; }).catch(function () { searchReq = null; return []; });
    return searchReq;
  }
  var SEARCH_TYPE = { style: 0, category: 1, industry: 2, service: 3, article: 4, page: 5 };
  function searchScore(e, q) {
    var name = e.n.toLowerCase();
    if (name.indexOf(q) === 0) return 0;
    if (e.c && e.c.toLowerCase() === q) return 0;
    if (name.indexOf(q) >= 0) return 1;
    if (e.k.indexOf(q) >= 0) return 2;
    return 3;
  }
  function matchSearch(idx, q) {
    q = (q || '').trim().toLowerCase();
    if (q.length < 2) return [];
    var words = q.split(/\s+/), out = [];
    idx.forEach(function (e) {
      for (var i = 0; i < words.length; i++) { if (e.k.indexOf(words[i]) < 0) return; }
      out.push({ e: e, s: searchScore(e, q) });
    });
    out.sort(function (a, b) { return (a.s - b.s) || (SEARCH_TYPE[a.e.t] - SEARCH_TYPE[b.e.t]) || (a.e.n < b.e.n ? -1 : 1); });
    return out.map(function (x) { return x.e; });
  }
  function searchMeta(e) {
    if (e.t === 'style') return e.c + ' · ' + e.cat;
    if (e.t === 'category') return 'Category';
    if (e.t === 'industry') return 'Industry';
    if (e.t === 'service') return 'Service';
    if (e.t === 'article') return 'Guide';
    return 'Page';
  }
  function searchRow(e) {
    return '<a class="bx-row" href="' + u(e.u) + '"><span class="bx-rn">' + esc(e.n) + '</span><span class="bx-rm">' + esc(searchMeta(e)) + '</span></a>';
  }
  function searchAllUrl(q) { return u('/search/?q=' + encodeURIComponent(q)); }

  var bxBar = $('bx-bar'), bxToggle = $('bx-toggle'), bxInput = $('bx-input'), bxForm = $('bx-form'), bxRes = $('bx-results');
  var bxInputD = $('bx-input-desk'), bxFormD = $('bx-form-desk'), bxResD = $('bx-results-desk');
  function bxOpenBar(focus) {
    if (!bxBar) return;
    bxBar.hidden = false;
    bxToggle.setAttribute('aria-expanded', 'true');
    if (typeof closeMenu === 'function') closeMenu();
    if (focus !== false && bxInput) bxInput.focus();
  }
  function bxCloseBar() {
    if (!bxBar || bxBar.hidden) return;
    bxBar.hidden = true;
    bxToggle.setAttribute('aria-expanded', 'false');
    if (bxWired) bxWired.close();
  }
  // Wires one search input + its results box. Same behaviour for the header
  // box (desktop) and the slide-down bar (narrow screens): live dropdown,
  // arrow keys to pick a result, Enter to open it, Escape to close.
  function bxWire(input, res, form, onEsc) {
    if (!input || !res) return null;
    var timer = null, items = [], active = -1;
    function close() { res.hidden = true; active = -1; items = []; }
    function show(q) {
      loadSearchIndex().then(function (idx) {
        if (input.value.trim() !== q) return; // typed on since
        items = matchSearch(idx, q).slice(0, 8);
        if (!items.length) {
          res.innerHTML = '<div class="bx-no">No results for &ldquo;' + esc(q) + '&rdquo;. <a href="' + searchAllUrl(q) + '">See all results</a></div>';
        } else {
          res.innerHTML = items.map(searchRow).join('') + '<a class="bx-all" href="' + searchAllUrl(q) + '">See all results for &ldquo;' + esc(q) + '&rdquo;</a>';
        }
        res.hidden = false; active = -1;
      });
    }
    if (form) form.setAttribute('action', u('/search/'));
    input.addEventListener('input', function () {
      var q = input.value;
      if (timer) clearTimeout(timer);
      if (q.trim().length < 2) { close(); return; }
      timer = setTimeout(function () { show(q.trim()); }, 160);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); input.blur(); if (onEsc) onEsc(); return; }
      if (res.hidden || !items.length) return;
      var rows = $$('.bx-row', res);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = e.key === 'ArrowDown' ? (active + 1) % rows.length : (active - 1 + rows.length) % rows.length;
        rows.forEach(function (r, i) { r.classList.toggle('active', i === active); });
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        window.location.href = rows[active].getAttribute('href');
      }
    });
    return { close: close, input: input };
  }
  var bxWired = bxWire(bxInput, bxRes, bxForm, function () { bxCloseBar(); if (bxToggle) bxToggle.focus(); });
  var bxWiredD = bxWire(bxInputD, bxResD, bxFormD, null);
  if (bxBar && bxToggle) {
    bxToggle.addEventListener('click', function () { if (bxBar.hidden) bxOpenBar(); else bxCloseBar(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1200) bxCloseBar(); });
  }
  document.addEventListener('click', function (e) {
    if (bxBar && bxToggle) {
      if (e.target.closest('#bx-toggle')) return;
      if (e.target.closest('#burger')) { bxCloseBar(); }
      else if (e.target.closest('[data-menu]')) { bxCloseBar(); }
      else if (!e.target.closest('#bx-bar')) { bxCloseBar(); }
    }
    if (bxWiredD && !e.target.closest('.bx-search.desk')) bxWiredD.close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') bxCloseBar(); });

  /* ---------- search results page ---------- */
  var sres = $('search-results');
  if (sres) {
    var sq = new URLSearchParams(location.search).get('q') || '';
    var sstatus = $('search-status');
    if (bxInput) bxInput.value = sq;
    if (bxInputD) bxInputD.value = sq;
    if (sq) {
      document.title = 'Results for "' + sq + '" | Boxenza';
      if (window.innerWidth < 1200) bxOpenBar(false);
    }
    if (sq.trim().length < 2) {
      sstatus.textContent = 'Type at least 2 letters in the search box to search.';
    } else {
      loadSearchIndex().then(function (idx) {
        var all = matchSearch(idx, sq);
        if (!all.length) {
          sstatus.textContent = 'No results for "' + sq + '". Try a style name, a code like FC05, or a product such as mailer box.';
          return;
        }
        sstatus.textContent = all.length + ' result' + (all.length === 1 ? '' : 's') + ' for "' + sq + '"';
        var groups = {};
        all.forEach(function (e) { (groups[e.t] = groups[e.t] || []).push(e); });
        var order = ['style', 'category', 'industry', 'service', 'article', 'page'];
        var labels = { style: 'Styles', category: 'Categories', industry: 'Industries', service: 'Services', article: 'Guides', page: 'Pages' };
        sres.innerHTML = order.filter(function (t) { return groups[t]; }).map(function (t) {
          return '<h2 class="sub">' + labels[t] + ' (' + groups[t].length + ')</h2>' + groups[t].map(searchRow).join('');
        }).join('');
      });
    }
  }

  /* ---------- mega menu ---------- */
  var mega = $('mega'), navBtns = $$('[data-menu]'), openMenu = null;
  function closeMenu() { if (!mega) return; mega.hidden = true; openMenu = null; navBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); }
  function openM(k) {
    mega.hidden = false; openMenu = k;
    $$('[data-panel]', mega).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== k; });
    navBtns.forEach(function (b) { b.setAttribute('aria-expanded', b.getAttribute('data-menu') === k ? 'true' : 'false'); });
  }
  if (mega) {
    var hoverOK = !!(window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 761px)').matches);
    var closeTimer = null;
    function cancelClose() { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } }
    function scheduleClose() { if (closeTimer) return; closeTimer = setTimeout(function () { closeTimer = null; closeMenu(); }, 180); }
    navBtns.forEach(function (b) {
      var k = b.getAttribute('data-menu');
      b.addEventListener('click', function () { if (openMenu === k) closeMenu(); else openM(k); });
      if (hoverOK) b.addEventListener('mouseenter', function () { cancelClose(); openM(k); });
    });
    if (hoverOK) {
      mega.addEventListener('mouseenter', cancelClose);
      mega.addEventListener('mouseleave', scheduleClose);
      $('site-top').addEventListener('mouseleave', scheduleClose);
      $$('.nav a').forEach(function (a) { a.addEventListener('mouseenter', scheduleClose); });
    }
    document.addEventListener('click', function (e) { if (!e.target.closest('.top')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- prefetch internal pages on hover/focus ---------- */
  /* Makes the next page load near-instant: the browser fetches it while
     the visitor is still deciding to click. Same-origin pages only. */
  var prefetched = {};
  function prefetchPage(href) {
    if (!href || prefetched[href]) return;
    if (href.charAt(0) !== '/' || href.indexOf('//') === 0) return;
    if (href.indexOf('#') >= 0 || href === window.location.pathname) return;
    prefetched[href] = true;
    var l = document.createElement('link');
    l.rel = 'prefetch'; l.href = href;
    document.head.appendChild(l);
  }
  document.addEventListener('mouseover', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (a) prefetchPage(a.getAttribute('href'));
  });
  document.addEventListener('focusin', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (a) prefetchPage(a.getAttribute('href'));
  });

  /* ---------- hero price card ---------- */
  var pcard = $('pcard');
  if (pcard && window.BX_HERO && window.BX_HERO.length > 1) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hIdx = 0, paused = false;
    var fmtC = function (usd, c) {
      var k = PR.countries[c].currency, v = usd * PR.rates[k], dec = v < 10 ? 2 : 0;
      return (PR.symbols[k] || k + ' ') + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };
    var q = function (sel) { return pcard.querySelector(sel); };
    var showHero = function (i) {
      var ex = window.BX_HERO[i];
      var e = estimate({ cat: ex.cat, dims: ex.dims, unit: 'in', qty: ex.qty, opts: [], adds: [], country: ex.country });
      if (!e) return;
      pcard.classList.add('swap');
      setTimeout(function () {
        q('[data-pc-route]').textContent = ex.label + ' to ' + PR.countries[ex.country].name;
        q('[data-pc-flag]').textContent = ex.flag;
        q('[data-pc-unit]').textContent = fmtC(e.total / e.qty, ex.country) + ' per piece, everything included';
        var spans = q('[data-pc-bar]').children, parts = [e.goods, e.ship, e.duty, e.tax];
        for (var j = 0; j < spans.length; j++) spans[j].style.width = (parts[j] / e.total * 100).toFixed(1) + '%';
        var tot = q('[data-pc-total]');
        pcard.classList.remove('swap');
        if (reduce) { tot.textContent = fmtC(e.total, ex.country); return; }
        var t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 700), ease = 1 - Math.pow(1 - p, 3);
          tot.textContent = fmtC(e.total * (0.55 + 0.45 * ease), ex.country);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, reduce ? 0 : 220);
    };
    pcard.addEventListener('mouseenter', function () { paused = true; });
    pcard.addEventListener('mouseleave', function () { paused = false; });
    setInterval(function () {
      if (paused || document.hidden) return;
      hIdx = (hIdx + 1) % window.BX_HERO.length;
      showHero(hIdx);
    }, 4500);
  }

  /* ---------- mobile menu ---------- */
  var burger = $('burger'), mpanel = $('mpanel');
  if (burger && mpanel) {
    var setMenu = function (open) {
      mpanel.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', function () { setMenu(mpanel.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---------- quote page ---------- */
  var form = $('quote-form');
  if (form) {
    var qCountry = $('country');
    qCountry.value = PR.countries[country] ? country : 'OTHER';
    qCountry.addEventListener('change', function () {
      country = qCountry.value; store.set('bx_country', country);
      if (selCountry) selCountry.value = country;
      if (PR.countries[country]) { cur = PR.countries[country].currency; store.set('bx_cur', cur); if (selCur) selCur.value = cur; }
      fireLoc();
    });
    onLocChange(function () { qCountry.value = PR.countries[country] ? country : 'OTHER'; renderBasket(); });

    var itemEst = function (it) { return estimate({ cat: it.cat, dims: it.dims, unit: it.unit, qty: it.qty, opts: it.opts, adds: it.adds, country: country }); };
    var renderBasket = function () {
      var el = $('basket'), has = basket.length > 0;
      if (!has) { el.hidden = true; el.innerHTML = ''; return; }
      el.hidden = false;
      el.innerHTML = '<h3>Styles in your quote</h3><ul>' + basket.map(function (it, k) {
        var e = itemEst(it);
        var est = e ? money(e.total * (1 - PR.range)) + ' – ' + money(e.total * (1 + PR.range)) + (e.partial ? ' (production only)' : ' landed') : '';
        return '<li><span><b>' + esc(it.name) + '</b><span>' + esc(it.code) + ' · ' + esc(it.catName) + '</span><span>' + esc(it.dims.join(' x ') + ' ' + it.unit + ', qty ' + it.qty) + '</span>' +
          (est ? '<span class="est-mini">' + est + '</span>' : '') + '</span><button type="button" class="rm" data-rm="' + k + '" aria-label="Remove ' + esc(it.name) + '">Remove</button></li>';
      }).join('') + '</ul><p class="note">' + (window.BX_INSTANT === false ? 'Add more styles from any product page. We price all of them in your quote.' : 'Estimates to ' + esc(countryName(country)) + '. Add more from any style page or the <a href="' + u('/instant-price/') + '">instant price</a> tool.') + '</p>';
    };
    $('basket').addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) { basket.splice(+rm.getAttribute('data-rm'), 1); saveBasket(); renderBasket(); }
    });
    renderBasket();

    var val = function (id) { return ($(id).value || '').trim(); };
    var line = function (it) {
      var p = [it.dims.join(' x ') + ' ' + it.unit, 'Material: ' + it.mat, 'Print: ' + it.print, 'Finishing: ' + it.fin];
      if (it.opts.length) p.push('Options: ' + it.opts.join(', '));
      if (it.adds.length) p.push('Add-ons: ' + it.adds.join(', '));
      p.push('Qty: ' + it.qty);
      var e = itemEst(it);
      if (e) p.push('Estimate: ' + money(e.total * (1 - PR.range)) + ' - ' + money(e.total * (1 + PR.range)));
      return '- ' + it.name + ' (' + it.code + '): ' + p.join(' | ');
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var has = basket.length > 0;
      var text = [
        'Quote request', 'Name: ' + val('name'), 'Email: ' + val('email'), 'Phone / WhatsApp: ' + (val('phone') || '-'),
        'Delivery country: ' + (PR.countries[qCountry.value] ? PR.countries[qCountry.value].name : 'Other'), 'Currency: ' + cur,
        'Styles:' + (has ? '\n' + basket.map(line).join('\n') : ' -')
      ].filter(function (x) { return x !== null; }).join('\n');

      var showFallback = function (why) {
        $('summary').textContent = text;
        $('result-note').textContent = why || '';
        $('mailto').href = 'mailto:sales@boxenza.com?subject=' + encodeURIComponent('Quote request from ' + val('name')) + '&body=' + encodeURIComponent(text);
        $('copy-note').textContent = '';
        $('result').hidden = false;
        $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      var btn = $('q-submit'), note = $('form-note');
      var payload = {
        name: val('name'), email: val('email'), phone: val('phone'), country: PR.countries[qCountry.value] ? PR.countries[qCountry.value].name : 'Other',
        currency: cur, items: basket, summary: text, website: val('website')
      };
      var send = function () {
        btn.disabled = true; btn.textContent = 'Sending…';
        fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { j.status = r.status; return j; }); })
          .then(function (j) {
            btn.disabled = false; btn.textContent = 'Get my quote';
            if (j.ok) {
              form.hidden = true; $('result').hidden = true;
              $('ref').textContent = j.ref || '';
              $('thanks').hidden = false; $('thanks').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              basket = []; saveBasket(); renderBasket();
            } else if (j.status === 400) {
              note.textContent = j.error || 'Please check the form.';
            } else {
              showFallback('Our quote form is having trouble. Please email this summary to us instead.');
            }
          })
          .catch(function () { btn.disabled = false; btn.textContent = 'Get my quote'; showFallback('Could not send. Please email this summary to us instead.'); });
      };
      var f = $('file').files && $('file').files[0];
      if (f) {
        if (f.size > 3 * 1024 * 1024) { note.textContent = 'The file is larger than 3 MB. Remove it and send it by email after we reply.'; return; }
        var rd = new FileReader();
        rd.onload = function () {
          var ext = (f.name.split('.').pop() || '').toLowerCase();
          var type = f.type || ({ ai: 'application/illustrator', eps: 'application/postscript', svg: 'image/svg+xml', pdf: 'application/pdf' })[ext] || 'application/octet-stream';
          payload.file = { name: f.name, type: type, data: String(rd.result).split(',')[1] || '' };
          send();
        };
        rd.onerror = function () { note.textContent = 'Could not read the file. Try again without it.'; };
        rd.readAsDataURL(f);
      } else { send(); }
    });
    $('copy').addEventListener('click', function () {
      var t = $('summary').textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { $('copy-note').textContent = 'Copied.'; }, function () { $('copy-note').textContent = 'Select the text above and copy it.'; });
      } else { $('copy-note').textContent = 'Select the text above and copy it.'; }
    });
  }
})();
