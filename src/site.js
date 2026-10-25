// Page builders for the Boxenza static site. Every function returns an HTML string.
const D = require('./data');
const { illus } = require('./illus');
const PRICING = require('./pricing.json');
const { dielineFor } = require('./dielines');

const BRAND = 'Boxenza';
const SITE_URL = process.env.SITE_URL || 'https://www.boxenza.com';
const CONTACT = { email: 'hello@boxenza.com', whatsapp: '+00 000 0000000', whatsappLink: '' }; // placeholders

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// illustration files: shape + palette -> /img/<shape>-<pal>.svg
const IMAGES = new Map();
function imgSrc(shape, pal) {
  const key = shape + '-' + pal;
  if (!IMAGES.has(key)) IMAGES.set(key, illus(shape, pal));
  return '/img/' + key + '.svg';
}
const img = (shape, pal, alt, extra) =>
  `<img src="${imgSrc(shape, pal)}" alt="${esc(alt || '')}" width="300" height="300" loading="lazy" decoding="async"${extra || ''}>`;

// style slugs (unique inside each category)
D.CATS.forEach(c => {
  const used = new Set();
  c.st.forEach(s => {
    let sl = slugify(s[1]);
    if (used.has(sl)) sl += '-' + s[0].toLowerCase();
    used.add(sl);
    s.slug = sl;
  });
});
/* Instant landed price: off until real supplier and shipping rates are in pricing.json.
   Turn back on with:  BX_INSTANT=1 node build.js   (or set INSTANT = true) */
const INSTANT = process.env.BX_INSTANT === '1';
const ip = (on, off) => (INSTANT ? on : off);
const palFor = (c, i) => c.pals[i % c.pals.length];

/* per-category form setup: size fields, materials and extra options */
const BOARD = ['SBS C1S', 'SBS C2S', 'CCNB duplex', 'Natural kraft', 'White kraft', 'Black kraft'];
const FORM = {
  _: { dims: ['Length', 'Width', 'Depth'], req: 3, mat: BOARD, opts: ['Foil Stamping', 'Embossing', 'Debossing', 'Window Patching'] },
  'corrugated-boxes': { mat: ['Corrugated E-flute', 'Corrugated B-flute', 'Corrugated F-flute', 'Double wall (BC-flute)', 'Natural kraft liner', 'White liner'] },
  'rigid-boxes': { mat: ['Greyboard + printed paper', 'Greyboard + textured paper', 'Greyboard + metallic paper', 'Greyboard + kraft paper', 'Greyboard + black paper'], opts: ['Foil Stamping', 'Embossing', 'Debossing', 'Spot UV'] },
  'box-inserts': { mat: ['Paperboard', 'Corrugated', 'EVA foam', 'Polyethylene foam', 'Molded pulp', 'Plastic (PET) tray'], opts: ['Foil Stamping', 'Flocking'] },
  'paper-bags': { dims: ['Width', 'Gusset', 'Height'], mat: ['White kraft paper', 'Brown kraft paper', 'Art paper (coated)', 'Black kraft paper', 'Textured paper'], opts: ['Foil Stamping', 'Embossing', 'Debossing', 'Window Patching'] },
  'reusable-bags': { dims: ['Width', 'Gusset', 'Height'], mat: ['Cotton', 'Canvas', 'Non-woven PP', 'Woven PP', 'Jute', 'Recycled PET (rPET)'], opts: ['Screen Print', 'Full-colour Print', 'Embroidery'] },
  'mailer-bags': { dims: ['Width', 'Height'], req: 2, mat: ['Poly (LDPE)', 'Recycled poly', 'Kraft paper', 'Bubble-lined poly', 'Bubble-lined kraft'], opts: ['Full-colour Print', 'Inside Print', 'Matte Finish', 'Gloss Finish'] },
  'pouches': { dims: ['Width', 'Height', 'Gusset (optional)'], req: 2, mat: ['PET / PE', 'Kraft / PE', 'Foil laminate (PET / AL / PE)', 'Clear PET', 'Recyclable mono-PE', 'Compostable film'], opts: ['Matte Finish', 'Gloss Finish', 'Spot Gloss', 'Clear Window'] },
  'corporate-packaging': { mat: ['Rigid greyboard + printed paper', 'Rigid greyboard + textured paper', 'Corrugated E-flute (mailer)', 'SBS paperboard', 'Kraft board'], opts: ['Foil Stamping', 'Embossing', 'Debossing', 'Spot UV'] },
  'display-boxes': { mat: ['Corrugated E-flute', 'Corrugated B-flute', 'Corrugated double wall', 'SBS paperboard'], opts: ['Foil Stamping', 'Spot UV', 'Window Patching'] },
  'labels-stickers': { dims: ['Width', 'Height'], req: 2, mat: ['White paper', 'White vinyl', 'Clear vinyl', 'Kraft paper', 'Metallic silver', 'Holographic'], opts: ['Gloss Laminate', 'Matte Laminate', 'Foil Stamping', 'Spot UV'] },
  'tissue-paper': { dims: ['Sheet width', 'Sheet height'], req: 2, mat: ['17 gsm tissue', '22 gsm tissue', 'Greaseproof paper', 'Wax-coated paper', 'Recycled tissue'], opts: ['1 Colour Print', '2 Colour Print', 'Full-colour Print'] },
  'packing-tape': { dims: ['Tape width', 'Roll length (yards)'], req: 2, mat: ['BOPP plastic', 'Kraft paper', 'Reinforced kraft (water-activated)', 'Paper (water-activated)'], opts: ['1 Colour Print', '2 Colour Print', 'Full-colour Print'] },
  'card-inserts': { dims: ['Width', 'Height'], req: 2, mat: ['Matte card (350 gsm)', 'Gloss card (350 gsm)', 'Kraft card', 'Uncoated card', 'Textured card'], opts: ['Foil Stamping', 'Embossing', 'Spot UV', 'Rounded Corners'] },
  'eco-packaging': { mat: ['Recycled kraft board', 'Recycled corrugated', 'FSC-certified board', 'Compostable film', 'Molded pulp', 'Recycled poly'], opts: ['Soy-based Ink', 'Water-based Ink', 'Foil-free Finish'] },
  'cup-sleeves': { dims: ['Sleeve width', 'Sleeve height'], req: 2, mat: ['White paperboard', 'Kraft paperboard', 'Corrugated (E-flute)', 'Recycled board'], opts: ['1 Colour Print', 'Full-colour Print', 'Embossing'] }
};
const formFor = s => Object.assign({}, FORM._, FORM[s] || {});
const catUrl = c => '/' + c.s + '/';
const styleUrl = (c, s) => '/' + c.s + '/' + s.slug + '/';
const indUrl = x => '/industries/' + x[0] + '/';
const svcUrl = x => '/services/' + x[0] + '/';

/* ---------- layout ---------- */
function countryOptions() {
  return Object.entries(PRICING.countries).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
}
function currencyOptions() {
  return Object.keys(PRICING.rates).map(k => `<option value="${k}">${k}</option>`).join('');
}

function megaPanels() {
  const mgi = (href, src, title, sub) =>
    `<a class="mgi" href="${href}"><span class="tile">${src}</span><span><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</span></a>`;
  const prod = `<div class="mg" data-panel="products"><div><p class="eyebrow">Products</p><div class="mg-grid">` +
    D.CATS.map(c => mgi(catUrl(c), img(c.sh, c.tp, ''), c.n)).join('') +
    `</div></div>` + ip(`<a class="mg-promo" href="/instant-price/"><b>Instant landed price</b><span>Pick a style, enter your size and country, and see the full price to your door.</span><span class="more">Get a price →</span></a>`, `<a class="mg-promo" href="/quote/"><b>Free quote in 24 hours</b><span>Send your size, quantity and country. We reply with the full price to your door and a free 3D mockup.</span><span class="more">Request a quote →</span></a>`) + `</div>`;
  const ind = `<div class="mg" data-panel="industries" hidden><div><p class="eyebrow">Shop by industry</p><div class="mg-grid">` +
    D.IND.map(x => mgi(indUrl(x), img(x[3], x[4], ''), x[1])).join('') +
    `</div></div><a class="mg-promo" href="/industries/"><b>All industries</b><span>See the packaging that suits your kind of product.</span><span class="more">See all industries →</span></a></div>`;
  const svc = `<div class="mg" data-panel="services" hidden><div><p class="eyebrow">Services</p><div class="mg-grid">` +
    D.SVC.map(x => mgi(svcUrl(x), img(x[3], x[4], ''), x[1], x[2])).join('') +
    `</div></div><a class="mg-promo" href="/quote/"><b>Free 3D mockup</b><span>Send a rough idea and we turn it into a dieline and a 3D preview.</span><span class="more">Request a quote →</span></a></div>`;
  return prod + ind + svc;
}

const LOGO = `<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3 24 8.5v11L14 25 4 19.5v-11Z" fill="var(--accent)"/><path d="M4 8.5 14 14l10-5.5M14 14v11" fill="none" stroke="var(--card)" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap topbar-in">
  <span class="tb-msg">${ip('Worldwide delivery. Shipping, duties and taxes included in every estimate.', 'Worldwide delivery. Free quote within 24 hours, with shipping and duties included.')}</span>
  ${ip(`<div class="loc">
    <label>Ship to <select id="bx-country" aria-label="Ship to country">${countryOptions()}<option value="OTHER">Other country</option></select></label>
    <label>Currency <select id="bx-cur" aria-label="Currency">${currencyOptions()}</select></label>
  </div>`, '')}
</div></div>
<header class="top" id="site-top">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${BRAND} Packaging, home">${LOGO}${BRAND}<span>&nbsp;Packaging</span></a>
    <nav class="nav" aria-label="Main">
      <button type="button" class="mnav" data-menu="products" aria-expanded="false">Products</button>
      <button type="button" class="mnav" data-menu="industries" aria-expanded="false">Industries</button>
      <button type="button" class="mnav" data-menu="services" aria-expanded="false">Services</button>
      ${ip('<a href="/instant-price/">Instant price</a>', '<a href="/#process">How it works</a>')}
      <a href="/why-us/">Why us</a>
    </nav>
    <a class="btn hdr-cta" href="/quote/">Request a quote<span id="qn" class="qn"></span></a>
    <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="mpanel" aria-label="Open menu"><span></span><span></span><span></span></button>
  </div>
  <div class="mega" id="mega" hidden><div class="mwrap">${megaPanels()}</div></div>
  <nav class="mpanel" id="mpanel" aria-label="Mobile" hidden>
    ${ip('<a class="mp-cta btn" href="/instant-price/">Get an instant price</a>', '<a class="mp-cta btn" href="/quote/">Get a free quote</a>')}
    <details><summary>Products</summary><div class="mp-list">${D.CATS.map(c => `<a href="${catUrl(c)}">${esc(c.n)}</a>`).join('')}<a href="/products/"><b>All products</b></a></div></details>
    <details><summary>Industries</summary><div class="mp-list">${D.IND.map(x => `<a href="${indUrl(x)}">${esc(x[1])}</a>`).join('')}</div></details>
    <details><summary>Services</summary><div class="mp-list">${D.SVC.map(x => `<a href="${svcUrl(x)}">${esc(x[1])}</a>`).join('')}</div></details>
    <a href="/why-us/">Why us</a>
    <a href="/option-library/">Option library</a>
    <a href="/minimum-order-quantities/">Minimum order quantities</a>
    <a href="/contact/">Contact</a>
    <a href="/quote/">Request a quote<span class="qn" data-qn></span></a>
  </nav>
</header>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="brand" href="/">${LOGO}${BRAND}<span>&nbsp;Packaging</span></a>
        <p class="note" style="margin-top:0.75rem;max-width:28ch">Custom boxes, bags and mailers, made to your size and delivered worldwide.</p>
      </div>
      <div><h3>Products</h3><ul>${D.CATS.map(c => `<li><a href="${catUrl(c)}">${esc(c.n)}</a></li>`).join('')}</ul></div>
      <div><h3>Company</h3><ul>
        <li><a href="/about/">About us</a></li>
        <li><a href="/contact/">Contact us</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/industries/">Industries</a></li>
        <li><a href="/services/structural-design/">Services</a></li>
        <li><a href="/option-library/">Option library</a></li>
        <li><a href="/minimum-order-quantities/">Minimum order quantities</a></li>
        <li><a href="/production-times/">Production times</a></li>
        <li><a href="/why-us/">Why us</a></li>
        <li><a href="/#process">How it works</a></li>
        <li><a href="/#faq">FAQ</a></li>
        ${ip('<li><a href="/instant-price/">Instant price</a></li>', '')}
        <li><a href="/quote/">Request a quote</a></li>
      </ul></div>
      <div><h3>Contact</h3><ul>
        <li>${esc(CONTACT.email)}</li><li>WhatsApp: ${esc(CONTACT.whatsapp)}</li><li>Delivering worldwide</li>
      </ul></div>
    </div>
    <p class="legal">&copy; ${new Date().getFullYear()} ${BRAND} Packaging. <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/shipping/">Shipping</a></p>
  </div>
</footer>`;
}

function layout({ path, title, desc, body, jsonld, bodyClass }) {
  const full = path === '/' && title === 'Home' ? `${BRAND} | Custom Packaging, Priced to Your Door` : `${title} | ${BRAND}`;
  const canon = SITE_URL + path;
  const ld = (jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">${title === 'Page not found' ? '\n<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#16224A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
${ld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${header()}
<main id="main">
${body}
</main>
${footer()}
<script>window.BX_INSTANT=${INSTANT};</script><script src="/assets/pricing.js"></script>
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

/* ---------- shared blocks ---------- */
function crumbs(trail) {
  // trail: [[label, href?], ...]
  const items = [['Home', '/']].concat(trail);
  const html = items.map((t, i) => {
    const last = i === items.length - 1;
    return (i ? '<span aria-hidden="true">/</span>' : '') + (last ? `<span aria-current="page">${esc(t[0])}</span>` : `<a href="${t[1]}">${esc(t[0])}</a>`);
  }).join('');
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t[0], item: SITE_URL + (t[1] || '') }))
  };
  return { html: `<nav class="crumbs" aria-label="Breadcrumb">${html}</nav>`, ld };
}
const band = (text, label, href) => `<div class="band"><h2>${esc(text)}</h2><a class="btn" href="${href || '/quote/'}">${esc(label || 'Get a free quote')}</a></div>`;
const pageHead = (h, lede, extra) => `<div class="head pagehead"><div><h1>${esc(h)}</h1><p class="lede">${esc(lede)}</p></div>${extra === undefined ? '<a class="btn" href="/quote/">Request a quote</a>' : extra}</div>`;
const infoCards = items => `<div class="why">${items.map(x => `<div><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join('')}</div>`;
const catCard = (c, small) => `<a class="cat" href="${catUrl(c)}"><span class="tile">${img(c.sh, c.tp, c.n)}</span><span class="ct"><h3>${esc(small ? c.n : (c.cn || c.n))}</h3><span>${esc(c.d)}</span></span></a>`;
const styleCard = (c, s, i, hidden) =>
  `<a class="style" href="${styleUrl(c, s)}" data-tabs="${s[3].join(' ')}"${hidden ? ' hidden' : ''}><span class="tile hv"><span class="v1">${img(s[2], palFor(c, i), s[1])}</span><span class="v2">${img(s[2], palFor(c, i) + 1, '')}</span></span><span class="code">${s[0]}</span><span class="name">${esc(s[1])}</span></a>`;

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- shown instead of the estimator while INSTANT is off ---------- */
function quoteBox() {
  return `<div class="est est-quote">
  <div class="est-head"><b>Free quote in 24 hours</b></div>
  <p class="est-empty">Add this style with your size and quantity, then send the quote form. We reply within one business day with the full price to your door (production, shipping, duty and tax), a free 3D mockup and the lead time.</p>
</div>`;
}
/* ---------- estimator (instant landed price) ---------- */
function estimatorBox(id) {
  return `<div class="est" id="${id}" aria-live="polite">
  <div class="est-head"><b>Instant landed price</b><span class="est-to">to <span data-est-country></span></span></div>
  <div class="est-body"><p class="est-empty">Enter the size to see your price.</p></div>
  <p class="est-note">Estimate includes production, door-to-door shipping, import duty and tax. Your quote confirms the final price.</p>
</div>`;
}
const QTYS = [100, 250, 500, 1000, 2500, 5000, 10000, 25000];
const qtySelect = (id, sel) => `<select id="${id}">${QTYS.map(q => `<option value="${q}"${q === sel ? ' selected' : ''}>${q.toLocaleString('en-US')}</option>`).join('')}</select>`;

/* ---------- hero price examples (computed with the same formula as the site) ---------- */
const HERO_EXAMPLES = [
  { cat: 'corrugated-boxes', label: 'Mailer box, 10 x 8 x 4 in, 1,000 pcs', dims: [10, 8, 4], qty: 1000, country: 'GB', flag: 'GB' },
  { cat: 'folding-cartons', label: 'Cosmetic carton, 2 x 2 x 6 in, 2,500 pcs', dims: [2, 2, 6], qty: 2500, country: 'US', flag: 'US' },
  { cat: 'paper-bags', label: 'Paper shopping bag, 10 x 4 x 12 in, 1,000 pcs', dims: [10, 4, 12], qty: 1000, country: 'AE', flag: 'AE' },
  { cat: 'rigid-boxes', label: 'Rigid gift box, 8 x 6 x 3 in, 500 pcs', dims: [8, 6, 3], qty: 500, country: 'AU', flag: 'AU' }
];
function estNode(o) {
  const c = PRICING.categories[o.cat], ct = PRICING.countries[o.country];
  const r = c.refDims, ref = 2 * (r[0] * r[1] + r[0] * r[2] + r[1] * r[2]);
  const [l, w, d] = o.dims, ratio = (2 * (l * w + l * d + w * d)) / ref;
  const f = Math.min(12, Math.max(0.25, Math.pow(ratio, 0.75)));
  let m = PRICING.qtyTiers[0][1]; PRICING.qtyTiers.forEach(t => { if (o.qty >= t[0]) m = t[1]; });
  const goods = c.unit * f * m * o.qty;
  const ship = Math.max(ct.minShip, c.kg * Math.max(ratio, 0.2) * o.qty * 1.1 * ct.shipPerKg);
  const duty = (goods + ship) * ct.duty, tax = (goods + ship + duty) * ct.tax;
  return { goods, ship, duty, tax, total: goods + ship + duty + tax };
}
function moneyNode(usd, country) {
  const cur = PRICING.countries[country].currency, v = usd * PRICING.rates[cur];
  const dec = v < 10 ? 2 : 0;
  return esc((PRICING.symbols[cur] || cur + ' ') + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
}

/* ---------- pages ---------- */
const P = {};

P.home = () => {
  // floating collage: [left%, top%, width%, shape, palette]
  const collage = [[2, 4, 20, 'flat', 6], [8, 26, 15, 'bag', 3], [76, 2, 15, 'pouch', 2], [87, 32, 12, 'cupsleeve', 1], [33, 6, 40, 'mail', 1], [76, 50, 16, 'gift', 5], [54, 66, 24, 'sleeve', 0]]
    .map((x, i) => `<div class="hit" style="left:${x[0]}%;top:${x[1]}%;width:${x[2]}%;--d:${(i * 0.09).toFixed(2)}s;--b:${(5.5 + (i % 3) * 0.9).toFixed(1)}s">${img(x[3], x[4], '', ' loading="eager"')}</div>`).join('');
  const ex = HERO_EXAMPLES[0], e = estNode(ex);
  const pct = v => (v / e.total * 100).toFixed(1) + '%';
  const faq = [
    INSTANT ? ['How does the instant price work?', 'Pick a style, enter your size, quantity and delivery country. You see an estimate of the full landed price: production, door-to-door shipping, import duty and tax. Your quote then confirms the final number, so there are no surprise bills on delivery.']
      : ['How do I get a price?', 'Send your style, size, quantity and delivery country with the quote form. Within one business day we reply with the full price to your door: production, door-to-door shipping, import duty and tax, so there are no surprise bills on delivery.'],
    ['Which countries do you deliver to?', ip('We deliver worldwide. Instant landed prices are available for the United States, the United Kingdom, the European Union, the UAE, Saudi Arabia, Australia and Canada. For any other country, request a quote and we price it for you.', 'We deliver worldwide, door to door, including the United States, the United Kingdom, the European Union, the UAE, Saudi Arabia, Australia and Canada. Every quote includes shipping, duty and tax to your country.')],
    ['What is your minimum order quantity (MOQ)?', 'Minimums depend on the product and print method. Offset printing gets cheaper per unit as quantities grow. See the <a href="/minimum-order-quantities/">minimum order quantities page</a> for a guide by product.'],
    ['How long does production take?', 'It depends on the product, quantity, print method and finish. Every quote gives an estimated lead time, counted from proof approval. See the <a href="/production-times/">production times page</a>. Shipping time is extra.'],
    ['Will I see my packaging before it is printed?', 'Yes. We send a free 3D mockup and a digital proof. Production starts only after you approve it, and we send photos of your finished order before it ships.'],
    ['What artwork files do you need?', 'Vector artwork (AI, EPS or PDF) works best. If you only have a logo or an idea, tell us and we will help with the layout for free.']
  ];
  const body = `
<section class="hero3">
  <div class="wrap hero3-grid">
    <div class="hero3-copy">
      <p class="eyebrow">Boxes, bags, mailers and pouches</p>
      <h1>Custom packaging, priced to your door.</h1>
      <p class="lede">${ip('Pick a style, enter your size and country, and see the full landed price straight away, with shipping, duties and taxes included. Then we design, proof, print and deliver it anywhere in the world.', 'Pick a style, send your size and country, and get the full price to your door within 24 hours, with shipping, duties and taxes included. Then we design, proof, print and deliver it anywhere in the world.')}</p>
      <div class="cta-row">
        ${ip('<a class="btn btn-light" href="/instant-price/">Get an instant price</a>', '<a class="btn btn-light" href="/quote/">Get a free quote</a>')}
        <a class="btn ghost" href="/#products">Browse packaging styles</a>
      </div>
      <ul class="hero-facts">${ip('<li><b>7</b> currencies</li>', '<li><b>24 h</b> quote</li>')}<li><b>Free</b> 3D mockup</li></ul>
    </div>
    <div class="hero3-stage">
      <div class="stage-floor" aria-hidden="true"></div>
      <div class="hits" aria-hidden="true">${collage}</div>
${ip(`      <div class="pcard" id="pcard" aria-live="polite">
        <div class="pc-top"><span class="pc-label">Example landed price</span><span class="pc-flag" data-pc-flag>${esc(ex.flag)}</span></div>
        <p class="pc-route" data-pc-route>${esc(ex.label)} to ${esc(PRICING.countries[ex.country].name)}</p>
        <p class="pc-total" data-pc-total>${moneyNode(e.total, ex.country)}</p>
        <p class="pc-unit" data-pc-unit>${moneyNode(e.total / ex.qty, ex.country)} per piece, everything included</p>
        <div class="pc-bar" data-pc-bar><span class="s1" style="width:${pct(e.goods)}"></span><span class="s2" style="width:${pct(e.ship)}"></span><span class="s3" style="width:${pct(e.duty)}"></span><span class="s4" style="width:${pct(e.tax)}"></span></div>
        <ul class="pc-legend"><li><i class="s1"></i>Production</li><li><i class="s2"></i>Shipping</li><li><i class="s3"></i>Duty</li><li><i class="s4"></i>Tax</li></ul>
        <a class="pc-link" href="/instant-price/">Price your own size</a>
      </div>`, `      <div class="pcard qcard">
        <div class="pc-top"><span class="pc-label">Free quote in 24 hours</span></div>
        <ol class="qc-steps"><li><b>Send</b> your style, size, quantity and country</li><li><b>Get</b> the full price to your door, with shipping, duty and tax</li><li><b>See</b> a free 3D mockup before anything is printed</li></ol>
        <a class="pc-link" href="/quote/">Request a quote</a>
      </div>`)}
    </div>
  </div>
</section>
<div class="strip"><div class="strip-track">
  <div class="strip-in">
    <span>${CHECK}${ip('Instant landed price', 'Free quote in 24 hours')}</span><span>${CHECK}No surprise customs bills</span><span>${CHECK}Free 3D mockup</span><span>${CHECK}Production photos before shipping</span>
  </div>
  <div class="strip-in" aria-hidden="true">
    <span>${CHECK}${ip('Instant landed price', 'Free quote in 24 hours')}</span><span>${CHECK}No surprise customs bills</span><span>${CHECK}Free 3D mockup</span><span>${CHECK}Production photos before shipping</span>
  </div>
</div></div>
${ip(`<script>window.BX_HERO=${JSON.stringify(HERO_EXAMPLES)};</script>`, '')}

<section class="sec alt" id="products">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Products</p><h2>Custom printed packaging for every product</h2><p class="lede">Everything your brand needs to pack, ship and sell, from one place.</p></div><a class="btn ghost" href="/products/">See all products</a></div>
    <div class="cats">${D.CATS.map(c => catCard(c)).join('')}</div>
  </div>
</section>

<section class="sec" id="usp">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Why ${BRAND}</p><h2>The price you see is the price you pay</h2><p class="lede">Most packaging suppliers quote the boxes and leave you to find out about freight, duty and tax on delivery. We show it all up front.</p></div></div>
    <div class="why">
      <div><h3>Landed price, up front</h3><p>Production, door-to-door shipping, import duty and tax in one number, in your currency.</p></div>
      ${ip('<div><h3>Instant estimate</h3><p>Enter size, quantity and country and see a price range in seconds. No waiting for a sales call.</p></div>', '<div><h3>Quote in 24 hours</h3><p>Send your size, quantity and country and get the full price within one business day. No waiting for a sales call.</p></div>')}
      <div><h3>See it before it ships</h3><p>A free 3D mockup before print, and photos of your finished order before it leaves.</p></div>
      <div><h3>Made right, or made again</h3><p>If your order does not match the approved proof, we reprint it.</p></div>
    </div>
  </div>
</section>

<section class="sec alt" id="industries">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Industries</p><h2>Packaging for your industry</h2><p class="lede">Every industry has its own rules for protection, labelling and shelf appeal.</p></div><a class="btn ghost" href="/industries/">See all industries</a></div>
    <div class="cats small four">${['cosmetics', 'food', 'coffee', 'candles', 'apparel', 'ecommerce', 'jewelry', 'bakery'].map(k => D.IND.find(x => x[0] === k)).map(x => `<a class="cat" href="${indUrl(x)}"><span class="tile">${img(x[3], x[4], x[1])}</span><span class="ct"><h3>${esc(x[1])}</h3></span></a>`).join('')}</div>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Services</p><h2>Design help included</h2><p class="lede">From the first dieline to the final proof, our team is there at every step.</p></div></div>
    <div class="svcs">${D.SVC.map(x => `<a class="scard" href="${svcUrl(x)}"><h3>${esc(x[1])}</h3><p>${esc(x[2])}</p><span class="more">Learn more →</span></a>`).join('')}</div>
  </div>
</section>

<section class="sec alt" id="process">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">How it works</p><h2>From brief to doorstep in four steps</h2></div></div>
    <ol class="steps">
      ${ip('<li><h3>Instant price</h3><p>Choose a style, size, quantity and country. See the landed price, then request your quote.</p></li>', '<li><h3>Free quote</h3><p>Send your style, size, quantity and country. Within 24 hours you get the full price to your door.</p></li>')}
      <li><h3>Free 3D mockup</h3><p>We build a dieline to your exact size, place your artwork and send a 3D preview.</p></li>
      <li><h3>Approve the proof</h3><p>Production starts only when you are happy with the digital proof.</p></li>
      <li><h3>Photos, then delivery</h3><p>We send photos of your finished order, then deliver it to your door with duties paid.</p></li>
    </ol>
  </div>
</section>

<section class="sec" id="faq">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">FAQ</p><h2>Questions, answered</h2></div></div>
    <div class="faq">${faq.map(q => `<details><summary>${esc(q[0])}</summary><p>${q[1]}</p></details>`).join('')}</div>
  </div>
</section>

<section class="sec"><div class="wrap">${ip(band('Ready to see your landed price?', 'Get an instant price', '/instant-price/'), band('Ready to start? Get your free quote in 24 hours.', 'Request a quote', '/quote/'))}</div></section>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Organization', name: BRAND + ' Packaging', url: SITE_URL,
    email: CONTACT.email, description: 'Custom printed packaging delivered worldwide with shipping, duties and taxes included.'
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } }))
  }];
  return { path: '/', title: 'Home', desc: ip('Custom printed boxes, bags, mailers and pouches with an instant landed price: production, shipping, duties and taxes included. Free 3D mockup. Delivered worldwide.', 'Custom printed boxes, bags, mailers and pouches. Free quote in 24 hours with shipping, duties and taxes included. Free 3D mockup. Delivered worldwide.'), body, jsonld: ld };
};

P.products = () => {
  const cr = crumbs([['Products']]);
  return { path: '/products/', title: 'Custom Packaging Products', desc: 'Browse every custom packaging product: folding cartons, mailer boxes, rigid boxes, paper bags, pouches, labels and more. Delivered worldwide.',
    jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('All packaging products', ip('Pick a product to see every style, then get an instant landed price for your size and country.', 'Pick a product to see every style, then request a free quote for your size and country.'))}<div class="cats">${D.CATS.map(c => catCard(c)).join('')}</div><div class="pad">${band('Not sure which one fits? Ask us.')}</div></div>` };
};

P.category = c => {
  const cr = crumbs([['Products', '/products/'], [c.n]]);
  const tabs = [['all', `All styles (${c.st.length})`]].concat(c.tabs).map((t, i) => `<button type="button" class="tab" role="tab" data-tab="${t[0]}" aria-selected="${i === 0}">${esc(t[1])}</button>`).join('');
  const grid = c.st.map((s, i) => styleCard(c, s, i, false)).join('');
  const more = D.CATS.filter(x => x.s !== c.s).map(x => `<a href="${catUrl(x)}"><span class="tile">${img(x.sh, x.tp, x.n)}</span><span>${esc(x.n)}</span></a>`).join('');
  const body = `<div class="wrap">${cr.html}
  ${pageHead(c.h, c.i)}
  <div class="tabs" role="tablist" aria-label="Styles">${tabs}</div>
  <div class="styles" id="cat-grid">${grid}</div>
</div>
<section class="sec alt"><div class="wrap"><div class="head"><div><p class="eyebrow">Typical options</p><h2>${esc(c.n)}: what to expect</h2></div></div>
  <dl class="specs">${c.specs.map(s => `<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl></div></section>
<section class="sec"><div class="wrap"><div class="head"><div><h2>More packaging</h2></div></div><div class="mini">${more}</div>
  <div style="margin-top:2.5rem">${band('Not seeing your style? We make custom structures.', 'Request a quote')}</div></div></section>`;
  return { path: catUrl(c), title: 'Custom ' + c.n, desc: `${c.i} ${c.st.length} styles, made to your size, ${ip('with an instant landed price to your country', 'with a free quote in 24 hours')}.`, body, jsonld: [cr.ld] };
};

P.style = (c, i) => {
  const s = c.st[i], p0 = palFor(c, i);
  const cr = crumbs([['Products', '/products/'], [c.n, catUrl(c)], [s[1]]]);
  const views = [
    img(s[2], p0, s[1] + ' illustration', ' loading="eager"'),
    `<div class="view-flip">${img(s[2], p0, s[1] + ' reverse view')}</div>`,
    `<div class="view-zoom">${img(s[2], p0 + 1, s[1] + ' alternative design')}</div>`,
    `<div class="dl-wrap">${dielineFor(c.s, s)}<p class="dl-note">Illustrative dieline. Your exact dieline is made to your size after your quote.</p></div>`
  ];
  const labels = ['Design 1', 'Design 2', 'Design 3', 'Dieline'];
  const sel = list => '<option>Need consultation</option>' + list.map(o => `<option>${esc(o[0])}</option>`).join('');
  const chips = (list, kind) => list.map(o => `<button type="button" class="opt" data-kind="${kind}" data-val="${esc(o)}" aria-pressed="false">${esc(o)}</button>`).join('');
  const adds = D.ADDS[c.s] || [];
  const F = formFor(c.s);
  const rel = c.st.map((x, j) => [x, j]).filter(([, j]) => j !== i).slice(0, 5).map(([x, j]) => styleCard(c, x, j, false)).join('');
  const body = `<div class="crumbwrap"><div class="wrap">${cr.html}</div></div>
<div class="wrap"><div class="pp">
  <div>
    <div class="pp-main" id="pp-main-wrap">${views.map((v, k) => `<div class="tile pp-view" data-view="${k}"${k ? ' hidden' : ''}>${v}</div>`).join('')}<button type="button" class="expand" data-expand>⊕ Click to expand</button></div>
    <div class="thumbs">${views.map((v, k) => `<button type="button" class="thumb" data-thumb="${k}" aria-label="View ${labels[k]}" aria-current="${k === 0}"><span class="tile">${v}</span></button>`).join('')}</div>
  </div>
  <form class="pp-info" id="pp-form" data-cat="${c.s}" data-code="${s[0]}" data-name="${esc(s[1])}" data-catname="${esc(c.n)}" onsubmit="return false">
    <p class="pp-code">${s[0]} · ${esc(c.n)}</p>
    <h1>${esc(s[1])}</h1>
    <p class="pp-desc">${esc(s[4])}</p>
    <div class="pp-f" style="max-width:12rem"><label for="pp-unit">Units</label><select id="pp-unit"><option value="in">Inches</option><option value="mm">Millimetres</option></select></div>
    <div class="pp-row dims3" data-req="${F.req}">
      ${['l', 'w', 'd'].map((k, j) => `<div class="pp-f"${F.dims[j] ? '' : ' hidden'}><label for="pp-${k}">${esc(F.dims[j] || 'Depth')}${j < F.req ? ' <span class="req">*</span>' : ''}</label><input id="pp-${k}" type="number" min="0" step="any" inputmode="decimal"></div>`).join('\n      ')}
    </div>
    <div class="pp-row">
      <div class="pp-f"><label for="pp-mat">Material</label><select id="pp-mat">${sel(F.mat.map(m => [m]))}</select></div>
      <div class="pp-f"><label for="pp-print">Print</label><select id="pp-print">${sel(D.OPTS.print[1])}</select></div>
      <div class="pp-f"><label for="pp-fin">Finishing</label><select id="pp-fin">${sel(D.OPTS.coat[1])}</select></div>
    </div>
    <div class="pp-g"><b>Additional options</b><div class="opts">${chips(F.opts, 'opt')}</div></div>
    ${adds.length ? `<div class="pp-g"><b>Add-on</b><div class="opts">${chips(adds, 'add')}</div></div>` : ''}
    <div class="pp-f" style="max-width:12rem"><label for="pp-qty">Quantity</label>${qtySelect('pp-qty', 1000)}</div>
    ${ip(estimatorBox('pp-est'), quoteBox())}
    <div class="buy"><span class="buy-total" id="buy-total"></span><button type="button" class="btn add" data-add><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Add to quote</button></div>
    <p class="pp-msg" id="pp-msg" role="status"></p>
  </form>
</div>
<h2 class="sub">About this style</h2>
<dl class="specs">${c.specs.map(x => `<div><dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl>
<p style="margin-top:1rem"><a class="more" href="/option-library/">Browse the full option library →</a></p>
<h2 class="sub">More ${esc(c.n.toLowerCase())} styles</h2>
<div class="styles">${rel}</div></div>`;
  return { path: styleUrl(c, s), title: `${s[1]} | Custom ${c.n}`, desc: `${s[4]} Custom ${s[1].toLowerCase()} made to your size, ${ip('with an instant landed price including shipping and duties', 'with a free quote including shipping and duties')}.`, body, jsonld: [cr.ld] };
};

P.instantPrice = () => {
  const cr = crumbs([['Instant price']]);
  const catalog = D.CATS.map(c => { const F = formFor(c.s); return { s: c.s, n: c.n, dims: F.dims, req: F.req, opts: F.opts, st: c.st.map(x => [x[0], x[1], x.slug]) }; });
  const body = `<div class="wrap">${cr.html}
${pageHead('Instant landed price', 'Choose a product, enter your size, quantity and delivery country. See the full price to your door, with shipping, duties and taxes included.', '')}
<div class="ip-grid">
  <form class="ip-form" id="ip-form" onsubmit="return false">
    <div class="pp-row two">
      <div class="pp-f"><label for="ip-cat">Product</label><select id="ip-cat">${D.CATS.map(c => `<option value="${c.s}">${esc(c.n)}</option>`).join('')}</select></div>
      <div class="pp-f"><label for="ip-style">Style</label><select id="ip-style"></select></div>
    </div>
    <div class="pp-f" style="max-width:12rem"><label for="ip-unit">Units</label><select id="ip-unit"><option value="in">Inches</option><option value="mm">Millimetres</option></select></div>
    <div class="pp-row dims3">
      <div class="pp-f"><label for="ip-l">Length</label><input id="ip-l" type="number" min="0" step="any" inputmode="decimal"></div>
      <div class="pp-f"><label for="ip-w">Width</label><input id="ip-w" type="number" min="0" step="any" inputmode="decimal"></div>
      <div class="pp-f"><label for="ip-d">Depth</label><input id="ip-d" type="number" min="0" step="any" inputmode="decimal"></div>
    </div>
    <div class="pp-f" style="max-width:12rem"><label for="ip-qty">Quantity</label>${qtySelect('ip-qty', 1000)}</div>
    <div class="pp-g"><b>Additional options</b><div class="opts" id="ip-opts"></div></div>
    <div class="buy"><button type="button" class="btn add" data-ip-add>Add to quote</button><a class="more" id="ip-link" href="#">See this style →</a></div>
    <p class="pp-msg" id="ip-msg" role="status"></p>
  </form>
  <div>${estimatorBox('ip-est')}
    <ul class="checks" style="margin-top:1rem"><li>Change the delivery country and currency at the top of the page.</li><li>Prices update as you type.</li><li>Need another country? <a href="/quote/">Request a quote</a>.</li></ul>
  </div>
</div>
<script>window.BX_CATALOG=${JSON.stringify(catalog)};</script>
<div class="pad">${band('Happy with the estimate? Lock it in with a free quote.', 'Request a quote')}</div></div>`;
  return { path: '/instant-price/', title: 'Instant Landed Price for Custom Packaging', desc: 'Get an instant price for custom boxes, bags and mailers including production, door-to-door shipping, import duty and tax, in your currency.', body, jsonld: [cr.ld] };
};

P.quote = () => {
  const cr = crumbs([['Request a quote']]);
  const countries = Object.entries(PRICING.countries).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('') + '<option value="OTHER">Other country</option>';
  const body = `<div class="wrap">${cr.html}
<div class="quote-grid">
  <div class="quote-side">
    <div style="display:grid;gap:0.7rem"><p class="eyebrow">Free quote</p><h1 style="font-size:clamp(1.9rem,4.4vw,2.8rem)">Tell us what you need</h1>
    <p class="lede">A rough size and quantity is enough to start. We reply with your landed price, a free 3D mockup and the lead time.</p></div>
    <ul class="checks"><li>Landed price: shipping, duty and tax included</li><li>Free 3D mockup and digital proof</li><li>Production photos before shipping</li><li>Delivery worldwide</li></ul>
    <div class="contact"><b>Contact</b><span>Email: ${esc(CONTACT.email)}</span><span>WhatsApp: ${esc(CONTACT.whatsapp)}</span></div>
  </div>
  <div style="display:grid;gap:1rem;min-width:0">
    <div id="basket" class="basket" hidden></div>
    <form id="quote-form">
      <div class="row">
        <div class="field"><label for="name">Name</label><input id="name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="row">
        <div class="field"><label for="company">Company or brand</label><input id="company" name="company" type="text" autocomplete="organization"></div>
        <div class="field"><label for="phone">Phone or WhatsApp (optional)</label><input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div>
      </div>
      <div class="row">
        <div class="field"><label for="country">Delivery country</label><select id="country" name="country">${countries}</select></div>
      </div>
      <div class="row manual">
        <div class="field"><label for="product">Product</label><select id="product" name="product"><option value="">Select…</option>${D.CATS.map(c => `<option>${esc(c.n)}</option>`).join('')}<option>Not sure yet</option></select></div>
        <div class="field"><label for="qty">Quantity</label><select id="qty" name="qty"><option value="">Approx. quantity…</option><option>100 – 250</option><option>250 – 500</option><option>500 – 1,000</option><option>1,000 – 5,000</option><option>5,000 – 25,000</option><option>25,000+</option><option>Not sure yet</option></select></div>
      </div>
      <p class="note" id="from-basket" hidden style="margin:0">Product, size and quantity come from the styles in your quote above. Remove them to enter these by hand.</p>
      <fieldset class="field manual"><legend>Size (optional)</legend>
        <div class="dims"><label for="dl">LENGTH<input id="dl" name="dl" type="number" min="0" step="any" inputmode="decimal"></label><label for="dw">WIDTH<input id="dw" name="dw" type="number" min="0" step="any" inputmode="decimal"></label><label for="dh">HEIGHT<input id="dh" name="dh" type="number" min="0" step="any" inputmode="decimal"></label></div>
        <div class="units"><label for="u-in"><input id="u-in" type="radio" name="unit" value="in" checked> inches</label><label for="u-mm"><input id="u-mm" type="radio" name="unit" value="mm"> mm</label></div>
      </fieldset>
      <div class="row">
        <div class="field"><label for="art">Artwork</label><select id="art" name="art"><option>I have print-ready artwork</option><option>I have a logo only</option><option>I need design help</option></select></div>
        <div class="field"><label for="style">Style notes (optional)</label><input id="style" name="style" type="text" placeholder="e.g. mailer box with an insert"></div>
      </div>
      <div class="field"><label for="details">Project details (optional)</label><textarea id="details" name="details" placeholder="What goes inside, finishes you like, deadline…"></textarea></div>
      <div class="field"><label for="file">Artwork or logo (optional, up to 3 MB)</label><input id="file" name="file" type="file" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.svg"></div>
      <div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <button class="btn" type="submit" id="q-submit">Get my quote</button>
      <p class="note" id="form-note">We reply within one business day.</p>
    </form>
    <div id="thanks" class="thanks" hidden aria-live="polite"><h2>Thank you, we have your request.</h2><p>Your reference is <b id="ref"></b>. We sent a copy to your email and will reply within one business day with your landed price, a free 3D mockup and the lead time.</p></div>
    <div id="result" hidden aria-live="polite"><b class="eyebrow">Your request summary</b><p class="note" id="result-note"></p><pre id="summary"></pre>
      <div class="cta-row"><a class="btn" id="mailto" href="#">Email this request</a><button class="btn ghost" type="button" id="copy">Copy summary</button></div><p class="note" id="copy-note"></p></div>
  </div>
</div></div>`;
  return { path: '/quote/', title: 'Request a Free Quote', desc: 'Request a free custom packaging quote with your landed price, a free 3D mockup and lead time. Delivered worldwide.', body, jsonld: [cr.ld] };
};

P.industries = () => {
  const cr = crumbs([['Industries']]);
  return { path: '/industries/', title: 'Packaging by Industry', desc: 'Custom packaging for cosmetics, food, coffee, candles, apparel, jewelry, electronics, supplements and e-commerce brands worldwide.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Packaging by industry', 'Every industry has its own rules for protection, labelling and shelf appeal. Pick yours to see the packaging that suits it.')}
<div class="cats small">${D.IND.map(x => `<a class="cat" href="${indUrl(x)}"><span class="tile">${img(x[3], x[4], x[1])}</span><span class="ct"><h3>${esc(x[1])}</h3><span>${esc(x[2])}</span></span></a>`).join('')}</div>
<div class="pad">${band('Your industry is not listed? Tell us what you sell.')}</div></div>` };
};
P.industry = x => {
  const cr = crumbs([['Industries', '/industries/'], [x[1]]]);
  return { path: indUrl(x), title: `Custom Packaging for ${x[1]}`, desc: `${x[6]} Custom packaging for ${x[1].toLowerCase()} brands, delivered worldwide ${ip('with an instant landed price', 'with a free quote in 24 hours')}.`, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Custom packaging for ' + x[1].toLowerCase(), x[6])}
<h2 class="sub">Popular packaging</h2><div class="cats small">${x[5].map(sl => catCard(D.BY[sl], true)).join('')}</div>
<h2 class="sub">Things to consider</h2>${infoCards(x[7])}
<div class="pad">${band('Tell us about your ' + x[1].toLowerCase() + ' product.')}</div></div>` };
};
P.service = x => {
  const cr = crumbs([['Services', '/#services'], [x[1]]]);
  return { path: svcUrl(x), title: x[1], desc: x[5], jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead(x[1], x[5])}<h2 class="sub">What you get</h2>${infoCards(x[6])}
<h2 class="sub">Other services</h2><div class="svcs">${D.SVC.filter(y => y[0] !== x[0]).map(y => `<a class="scard" href="${svcUrl(y)}"><h3>${esc(y[1])}</h3><p>${esc(y[2])}</p><span class="more">Learn more →</span></a>`).join('')}</div>
<div class="pad">${band('Start with a free quote.')}</div></div>` };
};
P.options = () => {
  const cr = crumbs([['Option library']]);
  const keys = ['mat', 'print', 'fin', 'coat'];
  const tabs = keys.map((k, i) => `<button type="button" class="tab" role="tab" data-otab="${k}" aria-selected="${i === 0}">${esc(D.OPTS[k][0])}</button>`).join('');
  const groups = keys.map((k, i) => `<div class="ogrid" data-ogroup="${k}"${i ? ' hidden' : ''}>${D.OPTS[k][1].map(o => `<div class="ocard"><h3>${esc(o[0])}</h3><p>${esc(o[1])}</p>${o[2] ? '<span class="chip eco">Recyclable option</span>' : ''}</div>`).join('')}</div>`).join('');
  return { path: '/option-library/', title: 'Packaging Materials, Printing & Finishes', desc: 'Every stock, print method, finish and coating for custom packaging: kraft, SBS, corrugated, foil, emboss, spot UV, soft-touch and more.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Option library', 'Every stock, print method, finish and coating you can choose from. Not sure what to pick? Describe your product and we will recommend a combination.')}
<div class="tabs" role="tablist" aria-label="Option groups">${tabs}</div>${groups}<div class="pad">${band('Want help choosing? We will recommend options.', 'Ask for advice')}</div></div>` };
};
P.why = () => {
  const cr = crumbs([['Why us']]);
  return { path: '/why-us/', title: 'Why Brands Choose Us', desc: 'Landed prices up front, a free 3D mockup, production photos before shipping and a reprint guarantee. Custom packaging delivered worldwide.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Why brands choose ' + BRAND, 'Custom packaging should be simple to price, simple to order and reliable to receive. This is how we work.')}
${infoCards([['Landed price, up front', 'Production, shipping, import duty and tax in one number, in your currency. No surprise bills on delivery.'], ip(['Instant estimate', 'Enter size, quantity and country and see a price in seconds.'], ['Quote in 24 hours', 'Send size, quantity and country and get the full price within one business day.']), ['Free 3D mockup', 'See your design on the real structure before anything is printed.'], ['Production photos', 'We send photos of your finished order before it ships.'], ['Reprint guarantee', 'If the order does not match the approved proof, we reprint it.'], ['Clear minimums', 'See the minimum order for every product on our MOQ page before you ask for a quote.'], ['Sustainable options', 'Recycled and FSC-certified stock, soy and water-based inks, right-sized structures.'], ['Worldwide delivery', 'Door-to-door delivery with duties paid to the US, UK, EU, Gulf, Australia, Canada and more.']])}
<div class="pad">${ip(band('Ready to see your landed price?', 'Get an instant price', '/instant-price/'), band('Ready to start? Get your free quote in 24 hours.', 'Request a quote', '/quote/'))}</div></div>` };
};
P.moq = () => {
  const cr = crumbs([['Minimum order quantities']]);
  const rows = D.MOQROWS.map(r => `<tr><th scope="row">${r[1] ? `<a href="/${r[1]}/">${esc(r[0])}</a>` : esc(r[0])}</th><td>${esc(r[2] + ' ' + r[3])}</td><td>${esc(r[4])}</td></tr>`).join('');
  return { path: '/minimum-order-quantities/', title: 'Minimum Order Quantities (MOQ)', desc: 'Minimum order quantities for custom boxes, bags, pouches, labels and more, and what affects them.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Minimum order quantities (MOQ)', 'The smallest order we can make for each product. These are starting points; your quote confirms the exact minimum for your size, material, print and finish.')}
<div class="moqt-wrap"><table class="moqt"><thead><tr><th scope="col">Product</th><th scope="col">Typical minimum</th><th scope="col">Notes</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2 class="sub">What affects the minimum</h2>${infoCards([['Print method', 'Digital printing uses no plates, so short runs are practical. Offset suits larger quantities.'], ['Finish and add-ons', 'Foil, embossing, custom inserts and special coatings can raise the minimum.'], ['Size and material', 'Very large pieces or special stock can need bigger runs.'], ['Several designs', 'Minimums usually apply to each design. Ask us about several versions in one order.']])}
<div class="pad">${band('Not sure how many to order? Ask us.', 'Request a quote')}</div></div>` };
};
P.ptimes = () => {
  const cr = crumbs([['Production times']]);
  const rows = D.PTROWS.map(r => `<tr><th scope="row"><a href="/${r[1]}/">${esc(r[0])}</a></th><td>${esc(r[2] + ' business days')}</td></tr>`).join('');
  return { path: '/production-times/', title: 'Production Times', desc: 'How long custom packaging takes to make, counted from proof approval, and what changes the lead time.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Production times', 'A guide to how long each product takes to make, counted from proof approval. Shipping time is extra. Your quote gives the estimate for your order.')}
<div class="moqt-wrap"><table class="moqt moqt2"><thead><tr><th scope="col">Product</th><th scope="col">Typical production time</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2 class="sub">What changes the time</h2>${infoCards([['Product and quantity', 'Larger orders and more complex structures take longer.'], ['Finishes and add-ons', 'Foil, embossing, special coatings and custom inserts add steps.'], ['Time of year', 'Busy seasons stretch lead times, so order early for holidays and launches.'], ['Proof approval', 'The clock starts when you approve the proof, so quick approval saves time.']])}
<div class="callout" role="note"><b>Note:</b> These are estimates counted from proof approval, not guaranteed delivery dates. <a href="/contact/">Contact us</a> if you have a deadline.</div>
<div class="pad">${band('Need it by a certain date? Tell us.', 'Request a quote')}</div></div>` };
};
P.blog = () => {
  const cr = crumbs([['Blog']]);
  return { path: '/blog/', title: 'Packaging Guides', desc: 'Short, practical guides for choosing and ordering custom packaging.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Packaging guides', 'Short, practical guides for choosing and ordering custom packaging.')}<div class="svcs">${D.BLOG.map(b => `<a class="scard" href="/blog/${b[0]}/"><h3>${esc(b[1])}</h3><p>${esc(b[2])}</p><span class="more">Read more →</span></a>`).join('')}</div><div class="pad">${ip(band('Ready to see your landed price?', 'Get an instant price', '/instant-price/'), band('Ready to start? Get your free quote in 24 hours.', 'Request a quote', '/quote/'))}</div></div>` };
};
P.article = b => {
  const cr = crumbs([['Blog', '/blog/'], [b[1]]]);
  return { path: '/blog/' + b[0] + '/', title: b[1], desc: b[2] + ' ' + b[3][0].slice(0, 110), jsonld: [cr.ld, { '@context': 'https://schema.org', '@type': 'Article', headline: b[1], publisher: { '@type': 'Organization', name: BRAND } }],
    body: `<div class="wrap">${cr.html}<article class="article"><h1>${esc(b[1])}</h1>${b[3].map(p => `<p>${esc(p)}</p>`).join('')}</article><div class="pad">${band('Have a packaging question? Ask us.', 'Request a quote')}</div></div>` };
};
P.legal = (k, L) => {
  const cr = crumbs([[L[0]]]);
  return { path: '/' + k + '/', title: L[0], desc: `${BRAND} ${L[0].toLowerCase()}.`, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}<article class="article"><h1>${esc(L[0])}</h1><p class="note-box">Placeholder text. Replace this page with your own policy before launch.</p>${L.slice(1).map(x => `<h2>${esc(x[0])}</h2><p>${esc(x[1])}</p>`).join('')}</article><div class="pad"></div></div>` };
};
P.about = () => {
  const cr = crumbs([['About us']]);
  return { path: '/about/', title: 'About Us', desc: `About ${BRAND}: custom packaging with landed prices up front, delivered worldwide.`, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('About ' + BRAND, 'We started ' + BRAND + ' because ordering custom packaging from abroad meant guesswork: unclear prices, surprise customs bills and no idea what would arrive. We fixed that.')}
${infoCards([['What we do', 'Custom boxes, bags, mailers, pouches, labels and more, made to your size.'], ['Who we serve', 'Growing brands worldwide, from first runs to repeat orders in the tens of thousands.'], ['How we work', ip('Instant landed price, free 3D mockup, proof approval, production photos, then delivery with duties paid.', 'Free quote in 24 hours, free 3D mockup, proof approval, production photos, then delivery with duties paid.')]])}
<div class="pad">${band('Let us price your packaging.')}</div></div>` };
};
P.contact = () => {
  const cr = crumbs([['Contact us']]);
  return { path: '/contact/', title: 'Contact Us', desc: `Contact ${BRAND} about custom packaging styles, materials or orders.`, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Contact us', 'Questions about a style, a material or an order? Send a message or request a quote.')}
<div class="why"><div><h3>Email</h3><p class="mono">${esc(CONTACT.email)}</p></div><div><h3>WhatsApp</h3><p class="mono">${esc(CONTACT.whatsapp)}</p></div><div><h3>Hours</h3><p>Monday to Friday, 9:00 to 18:00 (GMT+5)</p></div><div><h3>Delivery</h3><p>Worldwide, door to door</p></div></div>
<div class="pad">${ip(band('The fastest way to start is an instant price.', 'Get an instant price', '/instant-price/'), band('The fastest way to start is a free quote.', 'Request a quote', '/quote/'))}</div></div>` };
};
P.notFound = () => ({ path: '/404', title: 'Page not found', desc: 'Page not found.',
  body: `<div class="wrap"><div class="pad">${pageHead('Page not found', 'The page you are looking for has moved or does not exist.', '<a class="btn" href="/">Go to the home page</a>')}</div></div>` });

module.exports = { P, layout, D, IMAGES, SITE_URL, catUrl, styleUrl, indUrl, svcUrl, INSTANT };
