// Page builders for the Boxenza static site. Every function returns an HTML string.
const D = require('./data');
const { illus } = require('./illus');
const PRICING = require('./pricing.json');
const { dielineFor } = require('./dielines');

const BRAND = 'Boxenza';
const SITE_URL = process.env.SITE_URL || 'https://www.boxenza.com';
const CONTACT = { email: 'sales@boxenza.com', whatsapp: '+1 202 960 7921', whatsappLink: 'https://wa.me/12029607921' };

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const linkEmails = s => s.replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '<a href="mailto:$1">$1</a>');
const slugify = s => String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// SEO: keep meta descriptions within 155 chars, cutting at a word boundary.
const cutAtWord = (s, n) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > 40 ? cut.slice(0, sp) : cut).trim();
};
const trimDesc = d => cutAtWord(d, 155);
const firstSentence = s => { const i = s.indexOf('. '); return i === -1 ? s : s.slice(0, i + 1); };

// illustration files: shape + palette -> /img/<shape>-<pal>.svg
const IMAGES = new Map();
function imgSrc(shape, pal) {
  const key = shape + '-' + pal;
  if (!IMAGES.has(key)) IMAGES.set(key, illus(shape, pal));
  return '/img/' + key + '.svg';
}
const img = (shape, pal, alt, extra) => {
  const eager = extra && extra.indexOf('loading="eager"') >= 0;
  const rest = eager ? extra.replace(' loading="eager"', '') : (extra || '');
  return `<img src="${imgSrc(shape, pal)}" alt="${esc(alt || '')}" width="300" height="300" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"'}${rest}>`;
};

// Real product photos (installed 2026-11-16): /photos/<CODE>-<n>.jpg (1080x1080),
// dielines /photos/<CODE>-d.jpg, category covers /photos/covers/cover-<slug>.jpg (1200x896)
const photo = (src, w, h, alt, extra) => {
  const eager = extra && extra.indexOf('loading="eager"') >= 0;
  const rest = eager ? extra.replace(' loading="eager"', '') : (extra || '');
  return `<img src="${src}" alt="${esc(alt || '')}" width="${w}" height="${h}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"'}${rest}>`;
};
const viewPhoto = (code, n, alt, extra) => photo('/photos/' + code + '-' + n + '.jpg', 1080, 1080, alt, extra);
const coverPhoto = (slug, alt, extra) => photo('/photos/covers/cover-' + slug + '.jpg', 1200, 896, alt, extra);
// Category hero themes (2026-11-17): every category gets its OWN colour theme.
// The scrim tint is the dark version of the wall colour Claude renders in the
// photo (see category-heroes-bg-theme-brief-for-claude.md) — same hue family,
// so the tint and the future themed photo harmonise.
const HERO_TINT = {
  'folding-cartons': '#6B4E12', 'corrugated-boxes': '#2F5D3A', 'rigid-boxes': '#16224A',
  'box-inserts': '#7A1040', 'paper-bags': '#6E4A1F', 'reusable-bags': '#0E4A4A',
  'mailer-bags': '#1D4E6E', 'pouches': '#4E2A5E', 'corporate-packaging': '#24466E',
  'display-boxes': '#6E1F3C', 'labels-stickers': '#4A5A1E', 'tissue-paper': '#0F4C5C',
  'packing-tape': '#7A6210', 'card-inserts': '#3D2A6E', 'eco-packaging': '#8A2A3C',
  'cup-sleeves': '#7C3A12'
};
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
// Full-bleed category hero (like the homepage hero): the group photo is the
// background, the tinted scrim gives the theme colour, text sits on top.
const catHeroBg = c => { const t = HERO_TINT[c.s] || '#16224A'; return 'linear-gradient(90deg, ' + rgba(t, 0.85) + ' 0%, ' + rgba(t, 0.70) + ' 42%, ' + rgba(t, 0.35) + ' 70%, ' + rgba(t, 0.20) + ' 100%), url(\'/photos/category-hero-' + c.s + '.jpg\') center 40% / cover no-repeat'; };
// Menu tiles (installed 2026-11-17): /photos/menu/menu-<slug>.jpg (800x800), no logo (brief v9)
const menuTilePhoto = (slug, alt, extra) => photo('/photos/menu/menu-' + slug + '.jpg', 800, 800, alt, extra);
// Real product photo per industry (style code, View 1) — replaces the generated illustrations on the homepage and /industries/ page.
const IND_PHOTO = { apparel: 'MB01', bakery: 'FC05', 'beer-liquor': 'RB04', beverage: 'CS01', candles: 'RB02', 'candy-sweets': 'FC07', cannabis: 'FC02', chocolate: 'RB03', coffee: 'CS02', cosmetics: 'RB01', ecommerce: 'CB01', electronics: 'BI01', food: 'PO01', gift: 'CP03', jewelry: 'RB05', pets: 'PO02', pharmaceutical: 'FC03', presentation: 'FC04', restaurant: 'PB02', retail: 'DB01', 'shipping-mailer': 'CB02', soap: 'FC06', toy: 'FC08', tea: 'PO03', window: 'FC36', wine: 'RB10', automotive: 'CB03', supplements: 'PO04' };

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
  'eco-packaging': { mat: ['Recycled kraft board', 'Recycled corrugated', 'Responsibly sourced board', 'Compostable film', 'Molded pulp', 'Recycled poly'], opts: ['Soy-based Ink', 'Water-based Ink', 'Foil-free Finish'] },
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

/* ---------- industry icons: one distinct black line icon per industry (PakFactory style) ----------
   Replaces the generic generated shape drawings (bag/tray/auto...) in the Industries mega menu.
   Stroke icons, currentColor so they render in the theme ink (#141A33). */
const IND_ICON = {
  apparel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9.5V7a2 2 0 1 0-2-2"/><path d="M4 17l8-7.5L20 17H4"/></svg>',
  bakery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20v-6.5a6 3.5 0 0 1 12 0V20"/><path d="M12 10V6.5"/><path d="M12 3.8c.8.9.8 1.8 0 2.6-.8-.8-.8-1.7 0-2.6z"/></svg>',
  'beer-liquor': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2.5h4"/><path d="M10 2.5V6l-2 3.5V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9.5L14 6V2.5"/><path d="M8 14.5h8"/></svg>',
  beverage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9h14"/><path d="M7 9l.9 10.2a1 1 0 0 0 1 .8h6.2a1 1 0 0 0 1-.8L17 9"/><path d="M13.5 9L15.5 3"/></svg>',
  candles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21.5h6"/><path d="M10 21.5v-12h4v12"/><path d="M12 6.5V5"/><path d="M12 2.6c.9 1 .9 2 0 2.8-.9-.8-.9-1.8 0-2.8z"/></svg>',
  'candy-sweets': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M8.7 10.2L4 7v10l4.7-3.2"/><path d="M15.3 10.2L20 7v10l-4.7-3.2"/></svg>',
  cannabis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-5.5"/><path d="M12 16.5C10.6 12.5 10.6 7.5 12 3.5c1.4 4 1.4 9 0 13z"/><path d="M12 13.5C9.6 11.5 7.2 8.5 6.7 5.5c2.8.5 4.9 3 5.3 8z"/><path d="M12 13.5c2.4-2 4.8-5 5.3-8-2.8.5-4.9 3-5.3 8z"/><path d="M12 17c-3-.8-6-.6-7.8 1.2 2.2 1.8 5.2 1.6 7.8-1.2z"/><path d="M12 17c3-.8 6-.6 7.8 1.2-2.2 1.8-5.2 1.6-7.8-1.2z"/></svg>',
  chocolate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="1.5"/><path d="M7 9h10M7 15h10M12 3v18"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 10h11v5.5A4.5 4.5 0 0 1 11.5 20h-2A4.5 4.5 0 0 1 5 15.5V10z"/><path d="M16 11h1.2a2.6 2.6 0 0 1 0 5.2H16"/><path d="M9 6.5c0-1.2 1-1.4 1-2.6M13 6.5c0-1.2 1-1.4 1-2.6"/></svg>',
  cosmetics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21.5h6"/><path d="M10 21.5v-8.5h4v8.5"/><path d="M10 13V8.5l2-3.5 2 3.5V13"/></svg>',
  ecommerce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h7.7a1.5 1.5 0 0 0 1.5-1.2L20 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  electronics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10.2" y="10.2" width="3.6" height="3.6"/><path d="M10 7V3.5M14 7V3.5M10 20.5V17M14 20.5V17M7 10H3.5M7 14H3.5M20.5 10H17M20.5 14H17"/></svg>',
  food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 17.5h17"/><path d="M5 17.5a7 7 0 0 1 14 0"/><path d="M12 10.5v-2"/><circle cx="12" cy="7.2" r="1.1"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10.5" rx="1"/><path d="M12 10v10.5M4 14.5h16"/><path d="M12 10C10 7.2 7.2 6.6 6.6 8.4 6 10.3 9 11 12 10z"/><path d="M12 10c2-2.8 4.8-3.4 5.4-1.6.6 1.9-2.4 2.6-5.4 1.6z"/></svg>',
  jewelry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5h10l3 4.5-8 12.5L4 8l3-4.5z"/><path d="M4 8h16"/><path d="M12 3.5L8.5 8 12 20.5 15.5 8 12 3.5z"/></svg>',
  pets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="16.5" rx="4.4" ry="3.4"/><circle cx="6.8" cy="11" r="1.6"/><circle cx="10.3" cy="8.4" r="1.6"/><circle cx="13.7" cy="8.4" r="1.6"/><circle cx="17.2" cy="11" r="1.6"/></svg>',
  pharmaceutical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.6" y="8.6" width="16.8" height="6.8" rx="3.4" transform="rotate(-45 12 12)"/><path d="M12 5.5v13" transform="rotate(-45 12 12)"/></svg>',
  presentation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M12 16v3.5M8.5 19.5h7"/><path d="M7 9h5.5M7 12h9"/></svg>',
  restaurant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v5a2 2 0 0 0 4 0V3"/><path d="M8 3v18"/><path d="M17 3c-2.4 2-2.4 5.5-2.4 8v10"/><path d="M17 3v18"/></svg>',
  retail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5L5 5h14l1 4.5"/><path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M5.5 12.5V20h13v-7.5"/><path d="M10 20v-5h4v5"/></svg>',
  'shipping-mailer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h11v10H2z"/><path d="M13 10h4.2l3 3.2V17H13z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="16.5" cy="18" r="1.8"/></svg>',
  soap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="10.5" width="13" height="8" rx="3.5"/><circle cx="18.5" cy="5" r="1.4"/><circle cx="20.6" cy="8.2" r="1"/></svg>',
  toy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-3.4 0-5.5 2.6-5.5 5.6C6.5 12 9 14.2 12 14.2s5.5-2.2 5.5-5.6C17.5 5.6 15.4 3 12 3z"/><path d="M12 14.2V21c0 1.4-2 1.4-2 0"/></svg>',
  tea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5h12v4.5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4.5z"/><path d="M16 11.5h1a2.5 2.5 0 0 1 0 5h-1"/><path d="M8 7c0-1.1.9-1.3.9-2.3M11.6 7c0-1.1.9-1.3.9-2.3"/><path d="M3 20.5h14"/></svg>',
  window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/><path d="M2.5 21h19"/></svg>',
  wine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10v5a5 5 0 0 1-10 0V3z"/><path d="M7 8h10"/><path d="M12 13v6.5"/><path d="M8 19.5h8"/></svg>',
  automotive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 13.5L5 9.2A2 2 0 0 1 6.9 7.8h10.2a2 2 0 0 1 1.9 1.4l1.5 4.3"/><path d="M3.5 13.5V18h2.3"/><path d="M18.2 18h2.3v-4.5"/><circle cx="8" cy="18" r="1.8"/><circle cx="16" cy="18" r="1.8"/><path d="M9.8 18h4.4"/></svg>',
  supplements: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5h5V6h-5z"/><path d="M8 6h8v14a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V6z"/><path d="M8 13.5h8"/></svg>'
};
const indIcon = s => IND_ICON[s] || '';

function megaPanels() {
  const mgi = (href, src, title, sub, cls) =>
    `<a class="mgi" href="${href}"><span class="tile${cls ? ' ' + cls : ''}">${src}</span><span><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</span></a>`;
  const catByName = n => D.CATS.find(c => c.n === n);
  const prodGroup = (heading, names) =>
    `<div class="mg-group"><p class="mg-head">${esc(heading)}</p><div class="mg-list">` +
    names.map(n => { const c = catByName(n); return mgi(catUrl(c), menuTilePhoto(c.s, c.n), c.n, c.d, 'photo'); }).join('') +
    `</div></div>`;
  const prod = `<div class="mg" data-panel="products"><div><p class="eyebrow">Products</p><div class="mg-groups">` +
    prodGroup('Products', ['Folding Cartons', 'Corrugated Boxes', 'Rigid Boxes', 'POP Displays', 'Corporate Packaging']) +
    prodGroup('Custom Bags', ['Paper Shopping Bags', 'Reusable Shopping Bags', 'Mailer Shipping Bags', 'Flexible Pouches']) +
    prodGroup('Others', ['Box Inserts', 'Stickers and Labels', 'Tissue Paper and Liners', 'Packing Tape', 'Card Inserts', 'Eco-friendly Packaging', 'Cup Sleeves']) +
    `</div></div>` + ip(`<a class="mg-promo photo" href="/instant-price/">${photo('/photos/hero-group-alt.jpg', 1920, 1080, 'Custom packaging for every product')}<div class="promo-body"><b>Instant landed price</b><span>Pick a style, enter your size and country, and see the full price to your door.</span><span class="more">Get a price →</span></div></a>`, `<a class="mg-promo photo" href="/quote/">${photo('/photos/hero-group-alt.jpg', 1920, 1080, 'Custom packaging for every product')}<div class="promo-body"><b>Free quote in one business day</b><span>Send your size, quantity and country. We reply with the full price to your door and a free 3D mockup.</span><span class="more">Request a quote →</span></div></a>`) + `</div>`;
  const gridIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></g></svg>`;
  const ind = `<div class="mg" data-panel="industries" hidden><div><p class="eyebrow">Shop by industry</p><div class="mg-grid ind">` +
    D.IND.map(x => mgi(indUrl(x), indIcon(x[0]) || img(x[3], x[4], ''), x[1])).join('') +
    mgi('/industries/', gridIcon, 'See all industries') +
    `</div></div><a class="mg-promo photo" href="/industries/">${photo('/photos/menu/menu-panel-industries.jpg', 1200, 800, 'Custom packaging for every industry')}<div class="promo-body"><b>All industries</b><span>See the packaging that suits your kind of product.</span><span class="more">See all industries →</span></div></a></div>`;
  const svcCard = x => `<a class="svc-card" href="${svcUrl(x)}"><span class="tile photo">${photo('/photos/menu/menu-service-' + x[0] + '.jpg', 1200, 800, x[1])}</span><span class="svc-body"><b>${esc(x[1])}</b><span>${esc(x[2])}</span><span class="more">Explore →</span></span></a>`;
  const svc = `<div class="mg" data-panel="services" hidden><div><p class="eyebrow">Services</p><div class="svc-grid">` +
    D.SVC.map(svcCard).join('') +
    `</div></div><a class="mg-promo photo" href="/quote/">${photo('/photos/menu/menu-panel-services.jpg', 1200, 900, 'Free 3D mockup')}<div class="promo-body"><b>Free 3D mockup</b><span>Send a rough idea and we turn it into a dieline and a 3D preview.</span><span class="more">Request a quote →</span></div></a></div>`;
  return prod + ind + svc;
}

// Header/footer mark: open-box cube from boxenza-logo-light.svg (Option 1 final, 2026-11-15).
// Cube polygons copied verbatim from the logo file; site header/footer are white (--card),
// so the light version's cube is correct here. Wordmark stays as HTML text ("Boxenza Packaging").
const LOGO = `<svg viewBox="14 7 112 126" aria-hidden="true"><g transform="translate(14,14) scale(1.12)"><polygon points="6.70,51.00 50.00,26.00 93.30,51.00 50.00,76.00" fill="#FAD9E4"/><polygon points="6.70,25.00 50.00,0.00 50.00,26.00 6.70,51.00" fill="#F4B8CC"/><polygon points="50.00,0.00 93.30,25.00 93.30,51.00 50.00,26.00" fill="#E98AAB"/><polygon points="6.70,25.00 50.00,50.00 50.00,100.00 6.70,75.00" fill="#1C2140"/><polygon points="50.00,50.00 93.30,25.00 93.30,75.00 50.00,100.00" fill="#D9336E"/><polyline points="6.70,25.00 50.00,50.00 93.30,25.00" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.4" stroke-linejoin="round"/></g></svg>`;

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap topbar-in">
  <span class="tb-msg">${ip('Worldwide delivery. Shipping, duties and taxes included in every estimate.', 'Worldwide delivery. Free quote within one business day, with shipping and duties included.')}</span>
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
        <li><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></li><li>WhatsApp: <a href="${CONTACT.whatsappLink}">${esc(CONTACT.whatsapp)}</a></li><li>Delivering worldwide</li>
      </ul></div>
    </div>
    <p class="legal">&copy; ${new Date().getFullYear()} ${BRAND} Packaging. <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/shipping/">Shipping</a></p>
  </div>
</footer>`;
}

function layout({ path, title, desc, body, jsonld, bodyClass, preload }) {
  const full = path === '/' && title === 'Home' ? `${BRAND} | Custom Packaging, Priced to Your Door` : `${title} | ${BRAND}`;
  const canon = SITE_URL + path;
  const d = trimDesc(desc);
  const ld = (jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(d)}">${title === 'Page not found' ? '\n<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(d)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${SITE_URL}/photos/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#16224A">
${preload || ''}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JVGN36JLMT"></script>
<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-JVGN36JLMT');</script>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css?v=7">
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
const catCard = (c, small, eager) => `<a class="cat" href="${catUrl(c)}"><span class="tile">${coverPhoto(c.s, c.n, eager ? ' loading="eager"' : '')}</span><span class="ct"><h3>${esc(small ? c.n : (c.cn || c.n))}</h3><span>${esc(c.d)}</span></span></a>`;
const styleCard = (c, s, i, hidden) =>
  `<a class="style" href="${styleUrl(c, s)}" data-tabs="${s[3].join(' ')}"${hidden ? ' hidden' : ''}><span class="tile hv"><span class="v1">${viewPhoto(s[0], 1, s[1], i < 4 ? ' loading="eager"' : '')}</span><span class="v2">${viewPhoto(s[0], 2, s[1] + ', open view')}</span></span><span class="code">${s[0]}</span><span class="name">${esc(s[1])}</span></a>`;

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- shown instead of the estimator while INSTANT is off ---------- */
function quoteBox() {
  return `<div class="est est-quote">
  <div class="est-head"><b>Free quote in one business day</b></div>
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
const QTYS = [250, 500, 1000, 2500, 5000, 10000, 25000];
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
      <p class="lede">${ip('Pick a style, enter your size and country, and see the full landed price straight away, with shipping, duties and taxes included. Then we design, proof, print and deliver it anywhere in the world.', 'Pick a style, send your size and country, and get the full price to your door within one business day, with shipping, duties and taxes included. Then we design, proof, print and deliver it anywhere in the world.')}</p>
      <div class="cta-row">
        ${ip('<a class="btn btn-light" href="/instant-price/">Get an instant price</a>', '<a class="btn btn-light" href="/quote/">Get a free quote</a>')}
        <a class="btn ghost" href="/#products">Browse packaging styles</a>
      </div>
      <ul class="hero-facts">${ip('<li><b>7</b> currencies</li>', '<li><b>1 business day</b> quote</li>')}<li><b>Free</b> 3D mockup</li></ul>
    </div>
  </div>
</section>
<div class="strip"><div class="strip-track">
  <div class="strip-in">
    <span>${CHECK}${ip('Instant landed price', 'Free quote in one business day')}</span><span>${CHECK}No surprise customs bills</span><span>${CHECK}Free 3D mockup</span><span>${CHECK}Production photos before shipping</span>
  </div>
  <div class="strip-in" aria-hidden="true">
    <span>${CHECK}${ip('Instant landed price', 'Free quote in one business day')}</span><span>${CHECK}No surprise customs bills</span><span>${CHECK}Free 3D mockup</span><span>${CHECK}Production photos before shipping</span>
  </div>
</div></div>
${ip(`<script>window.BX_HERO=${JSON.stringify(HERO_EXAMPLES)};</script>`, '')}

<section class="sec alt" id="products">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Products</p><h2>Custom printed packaging for every product</h2><p class="lede">Everything your brand needs to pack, ship and sell, from one place.</p></div><a class="btn ghost" href="/products/">See all products</a></div>
    <div class="cats">${D.CATS.map((c, i) => catCard(c, false, i < 4)).join('')}</div>
  </div>
</section>

<section class="sec" id="usp">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Why ${BRAND}</p><h2>The price you see is the price you pay</h2><p class="lede">Most packaging suppliers quote the boxes and leave you to find out about freight, duty and tax on delivery. We show it all up front.</p></div></div>
    <div class="why">
      <div><h3>Landed price, up front</h3><p>Production, door-to-door shipping, import duty and tax in one number, in your currency.</p></div>
      ${ip('<div><h3>Instant estimate</h3><p>Enter size, quantity and country and see a price range in seconds. No waiting for a sales call.</p></div>', '<div><h3>Quote in one business day</h3><p>Send your size, quantity and country and get the full price within one business day. No waiting for a sales call.</p></div>')}
      <div><h3>See it before it ships</h3><p>A free 3D mockup before print, and photos of your finished order before it leaves.</p></div>
      <div><h3>Made right, or made again</h3><p>If your order does not match the approved proof, we reprint it.</p></div>
    </div>
  </div>
</section>

<section class="sec alt" id="industries">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">Industries</p><h2>Packaging for your industry</h2><p class="lede">Every industry has its own rules for protection, labelling and shelf appeal.</p></div><a class="btn ghost" href="/industries/">See all industries</a></div>
    <div class="cats small four">${['cosmetics', 'food', 'coffee', 'candles', 'apparel', 'ecommerce', 'jewelry', 'bakery'].map(k => D.IND.find(x => x[0] === k)).map(x => `<a class="cat" href="${indUrl(x)}"><span class="tile">${viewPhoto(IND_PHOTO[x[0]] || 'FC05', 1, x[1])}</span><span class="ct"><h3>${esc(x[1])}</h3></span></a>`).join('')}</div>
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
      ${ip('<li><h3>Instant price</h3><p>Choose a style, size, quantity and country. Orders start from 250 pieces. See the landed price, then request your quote.</p></li>', '<li><h3>Free quote</h3><p>Send your style, size, quantity and country. Orders start from 250 pieces. Within one business day you get the full price to your door.</p></li>')}
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

<section class="sec"><div class="wrap">${ip(band('Ready to see your landed price?', 'Get an instant price', '/instant-price/'), band('Ready to start? Get your free quote in one business day.', 'Request a quote', '/quote/'))}</div></section>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Organization', name: BRAND + ' Packaging', url: SITE_URL,
    email: CONTACT.email, description: 'Custom printed packaging delivered worldwide with shipping, duties and taxes included.'
  }, {
    '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: SITE_URL
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } }))
  }];
  return { path: '/', title: 'Home', desc: ip('Custom printed boxes, bags, mailers and pouches with an instant landed price, delivered worldwide from 250 pieces. Free 3D mockup.', 'Custom printed boxes, bags, mailers and pouches, delivered worldwide from 250 pieces. Free 3D mockup, free quote in one business day.'), body, jsonld: ld, preload: '<link rel="preload" as="image" href="/photos/hero-group-alt.jpg" fetchpriority="high">' };
};

P.products = () => {
  const cr = crumbs([['Products']]);
  const itemListLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Custom packaging products', itemListElement: D.CATS.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.n, url: SITE_URL + catUrl(c) })) };
  return { path: '/products/', title: 'Custom Packaging Products', desc: 'Browse every custom packaging product: folding cartons, mailer boxes, rigid boxes, paper bags, pouches, labels and more. Delivered worldwide.',
    jsonld: [cr.ld, itemListLd],
    body: `<div class="wrap">${cr.html}${pageHead('All packaging products', ip('Pick a product to see every style, then get an instant landed price for your size and country.', 'Pick a product to see every style, then request a free quote for your size and country.'))}<div class="cats">${D.CATS.map((c, i) => catCard(c, false, i < 4)).join('')}</div><div class="pad">${band('Not sure which one fits? Ask us.')}</div></div>` };
};

P.category = c => {
  const cr = crumbs([['Products', '/products/'], [c.n]]);
  const tabs = c.tabs.concat([['all', `All styles (${c.st.length})`]]).map((t, i) => `<button type="button" class="tab" role="tab" data-tab="${t[0]}" aria-selected="${i === 0}">${esc(t[1])}</button>`).join('');
  const grid = c.st.map((s, i) => styleCard(c, s, i, !s[3].includes(c.tabs[0][0]))).join('');
  const more = D.CATS.filter(x => x.s !== c.s).map(x => `<a href="${catUrl(x)}"><span class="tile">${coverPhoto(x.s, x.n)}</span><span>${esc(x.n)}</span></a>`).join('');
  // FAQ: one category-specific question (popular styles) + materials + the generic questions, with FAQPage schema
  const pop = c.st.filter(s => s[3].includes('pop'));
  const shown = pop.slice(0, 3).map(s => s[1].toLowerCase());
  const shownTxt = shown.length > 2 ? shown.slice(0, -1).join(', ') + ' and ' + shown[shown.length - 1] : shown.join(' and ');
  const faq = [
    [`What ${c.n.toLowerCase()} do you make?`, `Our most popular ${esc(c.n.toLowerCase())} are ${esc(shownTxt)} — plus ${c.st.length - shown.length} more styles in this range, all made to your size, printed with your design.`],
    [`What materials do you use for ${c.n.toLowerCase()}?`, `For ${esc(c.n.toLowerCase())} we use ${esc(c.specs[0][1])}.`],
    ['How do I get a price?', 'Send your style, size, quantity and delivery country with the quote form. Within one business day we reply with the full price to your door: production, door-to-door shipping, import duty and tax, so there are no surprise bills on delivery.'],
    ['What is your minimum order quantity (MOQ)?', 'Minimums depend on the product and print method. Offset printing gets cheaper per unit as quantities grow. See the <a href="/minimum-order-quantities/">minimum order quantities page</a> for a guide by product.'],
    ['Will I see my packaging before it is printed?', 'Yes. We send a free 3D mockup and a digital proof. Production starts only after you approve it, and we send photos of your finished order before it ships.']
  ];
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const itemListLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: c.n + ' styles', itemListElement: c.st.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s[1], url: SITE_URL + styleUrl(c, s) })) };
  const body = `<div class="wrap">${cr.html}</div>
  <section class="cat-hero2" style="background: ${catHeroBg(c)}"><div class="wrap cat-hero2-in">
    <div class="cat-hero2-copy"><h1>${esc(c.h)}</h1><p class="lede">${esc(c.i)}</p>
    <div class="cta-row"><a class="btn" href="/quote/">Request a quote</a><a class="btn ghost" href="#cat-grid">See styles</a></div></div>
  </div></section>
<div class="wrap">
  <div class="tabs" role="tablist" aria-label="Styles">${tabs}</div>
  <div class="styles" id="cat-grid">${grid}</div>
</div>
<section class="sec alt"><div class="wrap"><div class="head"><div><p class="eyebrow">Typical options</p><h2>${esc(c.n)}: what to expect</h2></div></div>
  <dl class="specs">${c.specs.map(s => `<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl></div></section>
<section class="sec" id="faq">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">FAQ</p><h2>Questions, answered</h2></div></div>
    <div class="faq">${faq.map(q => `<details><summary>${esc(q[0])}</summary><p>${q[1]}</p></details>`).join('')}</div>
  </div>
</section>
<section class="sec"><div class="wrap"><div class="head"><div><h2>More packaging</h2></div></div><div class="mini">${more}</div>
  <div style="margin-top:2.5rem">${band('Not seeing your style? We make custom structures.', 'Request a quote')}</div></div></section>`;
  return { path: catUrl(c), title: c.ct || ('Custom ' + c.n), desc: `${c.d} ${c.st.length} styles, made to your size, printed with your design. Free 3D mockup and free quote in one business day.`, body, jsonld: [cr.ld, itemListLd, faqLd], preload: '<link rel="preload" as="image" href="/photos/category-hero-' + c.s + '.jpg" fetchpriority="high">' };
};

P.style = (c, i) => {
  const s = c.st[i], p0 = palFor(c, i);
  const cr = crumbs([['Products', '/products/'], [c.n, catUrl(c)], [s[1]]]);
  const views = [
    viewPhoto(s[0], 1, s[1] + ' photo', ' loading="eager"'),
    viewPhoto(s[0], 2, s[1] + ' photo, view 2'),
    viewPhoto(s[0], 3, s[1] + ' photo, view 3'),
    `<div class="dl-wrap">${photo('/photos/' + s[0] + '-d.jpg', 1080, 1080, s[1] + ' dieline')}<p class="dl-note">Free dieline for this style. <a href="/photos/${s[0]}-d.jpg" download>Download the dieline (JPG)</a> Your exact dieline is made to your size after your quote.</p></div>`
  ];
  const labels = ['View 1', 'View 2', 'View 3', 'Dieline'];
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
  const styleName = /^custom /i.test(s[1]) ? s[1] : 'Custom ' + s[1];
  const sd = `${s[4]} ${styleName} made to your size, printed with your design. Free 3D mockup, free quote in one business day, delivered worldwide.`;
  const productLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: s[1], description: s[4], category: c.n,
    brand: { '@type': 'Brand', name: BRAND },
    url: SITE_URL + styleUrl(c, s),
    image: SITE_URL + '/photos/' + s[0] + '-1.jpg'
  };
  return { path: styleUrl(c, s), title: styleName + ', Made to Your Size', desc: sd, body, jsonld: [cr.ld, productLd] };
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
    <div class="contact"><b>Contact</b><span>Email: <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></span><span>WhatsApp: <a href="${CONTACT.whatsappLink}">${esc(CONTACT.whatsapp)}</a></span></div>
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
        <div class="field"><label for="qty">Quantity</label><select id="qty" name="qty"><option value="">Approx. quantity…</option><option>250 – 500</option><option>500 – 1,000</option><option>1,000 – 5,000</option><option>5,000 – 25,000</option><option>25,000+</option><option>Not sure yet</option></select></div>
      </div>
      <p class="note" style="margin:0">Minimum order starts at 250 pieces. <a href="/minimum-order-quantities/">See minimums for every product</a>.</p>
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
  return { path: '/quote/', title: 'Request a Free Quote', desc: 'Request a free custom packaging quote with your landed price, a free 3D mockup and lead time. Delivered worldwide, from 250 pieces.', body, jsonld: [cr.ld] };
};

P.industries = () => {
  const cr = crumbs([['Industries']]);
  const itemListLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Packaging by industry', itemListElement: D.IND.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[1], url: SITE_URL + indUrl(x) })) };
  return { path: '/industries/', title: 'Packaging by Industry', desc: 'Custom packaging for cosmetics, food, coffee, candles, apparel, jewelry, electronics, supplements and e-commerce brands worldwide.', jsonld: [cr.ld, itemListLd],
    body: `<div class="wrap">${cr.html}${pageHead('Packaging by industry', 'Every industry has its own rules for protection, labelling and shelf appeal. Pick yours to see the packaging that suits it.')}
<div class="cats small">${D.IND.map((x, i) => `<a class="cat" href="${indUrl(x)}"><span class="tile">${viewPhoto(IND_PHOTO[x[0]] || 'FC05', 1, x[1], i < 4 ? ' loading="eager"' : '')}</span><span class="ct"><h3>${esc(x[1])}</h3><span>${esc(x[2])}</span></span></a>`).join('')}</div>
<div class="pad">${band('Your industry is not listed? Tell us what you sell.')}</div></div>` };
};
// Industry tab labels: short single names (PakFactory style) so the tab row stays on one line
const IND_TAB = { 'folding-cartons': 'Cartons', 'corrugated-boxes': 'Corrugated', 'rigid-boxes': 'Rigid', 'box-inserts': 'Inserts', 'paper-bags': 'Bags', 'reusable-bags': 'Reusable', 'mailer-bags': 'Mailers', 'pouches': 'Pouches', 'corporate-packaging': 'Corporate', 'display-boxes': 'Displays', 'labels-stickers': 'Labels', 'tissue-paper': 'Tissue', 'packing-tape': 'Tape', 'card-inserts': 'Cards', 'eco-packaging': 'Eco', 'cup-sleeves': 'Sleeves' };
P.industry = x => {
  const cr = crumbs([['Industries', '/industries/'], [x[1]]]);
  const indName = x[1].toLowerCase();
  const cats = x[5].map(sl => D.BY[sl]);
  const heroCat = cats[0];
  // Popular packaging: real category group photos (category heroes) instead of the invented-brand covers
  const popCards = cats.map(c => `<a class="cat" href="${catUrl(c)}"><span class="tile">${photo('/photos/category-hero-' + c.s + '.jpg', 1200, 800, c.n)}</span><span class="ct"><h3>${esc(c.n)}</h3><span>${esc(c.d)}</span></span></a>`).join('');
  // Recommended styles: the popular styles of the related categories, with a tab per category
  const popStyles = cats.flatMap(c => c.st.filter(s => s[3].includes('pop')).map(s => [c, s]));
  const tabs = [['all', `All styles (${popStyles.length})`]].concat(cats.map(c => [c.s, (IND_TAB[c.s] || c.n) + ` (${c.st.filter(s => s[3].includes('pop')).length})`])).map((t, i) => `<button type="button" class="tab" role="tab" data-tab="${t[0]}" aria-selected="${i === 0}">${esc(t[1])}</button>`).join('');
  const grid = popStyles.map(([c, s], i) => { const s2 = [...s]; s2.slug = s.slug; s2[3] = [c.s]; return styleCard(c, s2, i, false); }).join('');
  // Materials & finishes per related category (from the quote-form data)
  const mats = cats.map(c => { const f = formFor(c.s); return `<div><dt>${esc(c.n)}</dt><dd>Materials: ${esc(f.mat.join(', '))}. Options: ${esc(f.opts.join(', '))}.</dd></div>`; }).join('');
  // FAQ: one industry-specific question (lists what we actually make for this industry) + the site's generic questions
  const madeList = cats.map(c => c.n.toLowerCase());
  const made = madeList.length > 2 ? madeList.slice(0, -1).join(', ') + ', and ' + madeList[madeList.length - 1] : madeList.join(' and ');
  const faq = [
    [`What ${indName} packaging do you make?`, `We make ${esc(made)} for ${esc(indName)} — all made to your size, printed with your design, and delivered to your door.`],
    ['How do I get a price?', 'Send your style, size, quantity and delivery country with the quote form. Within one business day we reply with the full price to your door: production, door-to-door shipping, import duty and tax, so there are no surprise bills on delivery.'],
    ['Which countries do you deliver to?', 'We deliver worldwide, door to door, including the United States, the United Kingdom, the European Union, the UAE, Saudi Arabia, Australia and Canada. Every quote includes shipping, duty and tax to your country.'],
    ['What is your minimum order quantity (MOQ)?', 'Minimums depend on the product and print method. Offset printing gets cheaper per unit as quantities grow. See the <a href="/minimum-order-quantities/">minimum order quantities page</a> for a guide by product.'],
    ['Will I see my packaging before it is printed?', 'Yes. We send a free 3D mockup and a digital proof. Production starts only after you approve it, and we send photos of your finished order before it ships.']
  ];
  const itemListLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Recommended ' + indName + ' packaging styles', itemListElement: popStyles.map(([c, s], i) => ({ '@type': 'ListItem', position: i + 1, name: s[1], url: SITE_URL + styleUrl(c, s) })) };
  const ld = [cr.ld, itemListLd, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) }];
  const body = `<div class="wrap">${cr.html}</div>
  <section class="cat-hero2" style="background: ${catHeroBg(heroCat)}"><div class="wrap cat-hero2-in">
    <div class="cat-hero2-copy"><h1>${esc('Custom packaging for ' + indName)}</h1><p class="lede">${esc(x[6])}</p>
    <div class="cta-row"><a class="btn" href="/quote/">Request a quote</a><a class="btn ghost" href="#cat-grid">See styles</a></div></div>
  </div></section>
<div class="wrap">
<h2 class="sub">Popular packaging</h2><div class="cats small pop" style="--n:${cats.length}">${popCards}</div>
<h2 class="sub">Recommended packaging styles</h2>
  <div class="tabs" role="tablist" aria-label="Styles">${tabs}</div>
  <div class="styles" id="cat-grid">${grid}</div>
<h2 class="sub">Things to consider</h2>${infoCards(x[7])}
</div>
<section class="sec alt"><div class="wrap"><div class="head"><div><p class="eyebrow">Materials & finishes</p><h2>${esc(x[1])}: what to expect</h2></div></div>
  <dl class="specs">${mats}</dl></div></section>
<section class="sec" id="faq">
  <div class="wrap">
    <div class="head"><div><p class="eyebrow">FAQ</p><h2>Questions, answered</h2></div></div>
    <div class="faq">${faq.map(q => `<details><summary>${esc(q[0])}</summary><p>${q[1]}</p></details>`).join('')}</div>
  </div>
</section>
<div class="wrap"><div class="pad">${band('Tell us about your ' + indName + ' product.')}</div></div>`;
  return { path: indUrl(x), title: `Custom Packaging for ${x[1]}`, desc: `Custom packaging for ${indName} brands. ${x[6]} Made to your size, printed with your design, delivered worldwide.`, jsonld: ld, body, preload: '<link rel="preload" as="image" href="/photos/category-hero-' + heroCat.s + '.jpg" fetchpriority="high">' };
};
P.service = x => {
  const cr = crumbs([['Services', '/#services'], [x[1]]]);
  return { path: svcUrl(x), title: x[1].length < 18 ? x[1] + ' — Custom Packaging Services' : x[1], desc: x[5] + ' Free 3D mockup and digital proof included.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead(x[1], x[5])}<div class="svc-hero">${photo('/photos/menu/menu-service-' + x[0] + '.jpg', 1200, 800, x[1])}</div><h2 class="sub">What you get</h2>${infoCards(x[6])}
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
${infoCards([['Landed price, up front', 'Production, shipping, import duty and tax in one number, in your currency. No surprise bills on delivery.'], ip(['Instant estimate', 'Enter size, quantity and country and see a price in seconds.'], ['Quote in one business day', 'Send size, quantity and country and get the full price within one business day.']), ['Free 3D mockup', 'See your design on the real structure before anything is printed.'], ['Production photos', 'We send photos of your finished order before it ships.'], ['Reprint guarantee', 'If the order does not match the approved proof, we reprint it.'], ['Clear minimums', 'See the minimum order for every product on our MOQ page before you ask for a quote.'], ['Sustainable options', 'Recycled and responsibly sourced stock, soy and water-based inks, right-sized structures.'], ['Worldwide delivery', 'Door-to-door delivery with duties paid to the US, UK, EU, Gulf, Australia, Canada and more.']])}
<div class="pad">${ip(band('Ready to see your landed price?', 'Get an instant price', '/instant-price/'), band('Ready to start? Get your free quote in one business day.', 'Request a quote', '/quote/'))}</div></div>` };
};
P.moq = () => {
  const cr = crumbs([['Minimum order quantities']]);
  const rows = D.MOQROWS.map(r => `<tr><th scope="row">${r[1] ? `<a href="/${r[1]}/">${esc(r[0])}</a>` : esc(r[0])}</th><td>${esc(r[2] + ' ' + r[3])}</td><td>${esc(r[4])}</td></tr>`).join('');
  return { path: '/minimum-order-quantities/', title: 'Minimum Order Quantities (MOQ)', desc: 'Minimum order quantities for custom boxes, bags, pouches, labels and more, what affects them, and how to order from 250 pieces.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Minimum order quantities (MOQ)', 'The smallest order we can make for each product. These are starting points; your quote confirms the exact minimum for your size, material, print and finish.')}
<div class="moqt-wrap"><table class="moqt"><thead><tr><th scope="col">Product</th><th scope="col">Typical minimum</th><th scope="col">Notes</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2 class="sub">What affects the minimum</h2>${infoCards([['Print method', 'Digital printing uses no plates, so short runs are practical. Offset suits larger quantities.'], ['Finish and add-ons', 'Foil, embossing, custom inserts and special coatings can raise the minimum.'], ['Size and material', 'Very large pieces or special stock can need bigger runs.'], ['Several designs', 'Minimums usually apply to each design. Ask us about several versions in one order.']])}
<div class="pad">${band('Not sure how many to order? Ask us.', 'Request a quote')}</div></div>` };
};
P.ptimes = () => {
  const cr = crumbs([['Production times']]);
  const rows = D.PTROWS.map(r => `<tr><th scope="row"><a href="/${r[1]}/">${esc(r[0])}</a></th><td>${esc(r[2] + ' business days')}</td></tr>`).join('');
  return { path: '/production-times/', title: 'Production Times for Custom Packaging', desc: 'How long custom packaging takes to make, counted from proof approval, what changes the lead time, and how to plan your order.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Production times', 'A guide to how long each product takes to make, counted from proof approval. Shipping time is extra. Your quote gives the estimate for your order.')}
<div class="moqt-wrap"><table class="moqt moqt2"><thead><tr><th scope="col">Product</th><th scope="col">Typical production time</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2 class="sub">What changes the time</h2>${infoCards([['Product and quantity', 'Larger orders and more complex structures take longer.'], ['Finishes and add-ons', 'Foil, embossing, special coatings and custom inserts add steps.'], ['Time of year', 'Busy seasons stretch lead times, so order early for holidays and launches.'], ['Proof approval', 'The clock starts when you approve the proof, so quick approval saves time.']])}
<div class="callout" role="note"><b>Note:</b> These are estimates counted from proof approval, not guaranteed delivery dates. <a href="/contact/">Contact us</a> if you have a deadline.</div>
<div class="pad">${band('Need it by a certain date? Tell us.', 'Request a quote')}</div></div>` };
};
P.blog = () => {
  const cr = crumbs([['Blog']]);
  return { path: '/blog/', title: 'Custom Packaging Guides', desc: 'Short, practical guides for choosing and ordering custom packaging: dielines, printing methods, measuring, materials and finishes.', jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Packaging guides', 'Short, practical guides for choosing and ordering custom packaging.')}<div class="svcs">${D.BLOG.map(b => { const thumb = b[5] || ((b[3].find(x => x && x.img) || {}).img); return `<a class="scard" href="/blog/${b[0]}/">${thumb ? `<span class="tile${b[6] === 'contain' ? ' fit-contain' : ''}">${photo(thumb, 1200, 900, b[1])}</span>` : ''}<h3>${esc(b[1])}</h3><p>${esc(b[2])}</p><span class="more">Read more →</span></a>`; }).join('')}</div><div class="pad">${ip(band('Ready to see your landed price?', 'Get an instant price', '/instant-price/'), band('Ready to start? Get your free quote in one business day.', 'Request a quote', '/quote/'))}</div></div>` };
};
P.article = b => {
  const cr = crumbs([['Blog', '/blog/'], [b[1]]]);
  const firstPara = b[3].find(x => typeof x === 'string') || '';
  const articleDesc = b[4] || (b[2] + ' ' + cutAtWord(firstPara, 110));
  const blocks = b[3].map(x => typeof x === 'string' ? `<p>${esc(x)}</p>` : x.h ? `<h2>${esc(x.h)}</h2>` : `<figure>${photo(x.img, 1080, 1080, x.cap || b[1])}${x.cap ? `<figcaption>${esc(x.cap)}</figcaption>` : ''}</figure>`).join('');
  return { path: '/blog/' + b[0] + '/', title: b[1], desc: articleDesc, jsonld: [cr.ld, { '@context': 'https://schema.org', '@type': 'Article', headline: b[1], publisher: { '@type': 'Organization', name: BRAND } }],
    body: `<div class="wrap">${cr.html}<article class="article"><h1>${esc(b[1])}</h1>${blocks}</article><div class="pad">${band('Have a packaging question? Ask us.', 'Request a quote')}</div></div>` };
};
P.legal = (k, L) => {
  const cr = crumbs([[L[0]]]);
  const legalTitle = {
    privacy: 'Privacy Policy — How We Handle Your Data',
    terms: 'Terms & Conditions — Ordering from Boxenza',
    shipping: 'Shipping Policy — Worldwide Delivery, Duties Paid'
  }[k] || L[0];
  const legalDesc = {
    privacy: 'How Boxenza collects, uses and protects your personal information when you request a quote, order custom packaging or browse this website.',
    terms: 'The terms for ordering custom packaging from Boxenza, including quotes, payment, production, delivery, defects and reprints.',
    shipping: 'How your custom packaging is delivered worldwide, door to door, with production, shipping, duty and tax in one landed price.'
  }[k] || `${BRAND} ${L[0].toLowerCase()}.`;
  return { path: '/' + k + '/', title: legalTitle, desc: legalDesc, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}<article class="article"><h1>${esc(L[0])}</h1>${L.slice(1).map(x => `<h2>${esc(x[0])}</h2><p>${linkEmails(esc(x[1]))}</p>`).join('')}</article><div class="pad"></div></div>` };
};
P.about = () => {
  const cr = crumbs([['About us']]);
  return { path: '/about/', title: 'About Boxenza — Custom Packaging, Priced to Your Door', desc: `About ${BRAND}: custom packaging with landed prices up front, a free 3D mockup, digital proof and delivery worldwide, from 250 pieces.`, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('About ' + BRAND, 'We started ' + BRAND + ' because ordering custom packaging from abroad meant guesswork: unclear prices, surprise customs bills and no idea what would arrive. We fixed that.')}
<article class="article"><p>Every quote states the full landed price up front: production, door-to-door shipping, import duty and tax. The price you approve is the price you pay — no surprise bills on delivery.</p>
<p>We make 16 kinds of packaging — folding cartons, corrugated mailer boxes, rigid gift boxes, box inserts, paper and reusable bags, mailer bags, pouches, corporate gift packaging, displays, labels, tissue, tape, card inserts, eco-friendly packaging and cup sleeves — in 183 styles, each made to your size, stock and print. Every order starts with a free 3D mockup and a digital proof. Production only starts after you approve it, and we send photos of your finished order before it ships.</p>
<p>Orders start from 250 pieces. You pay 50% before production and the remaining 50% after production, before shipping. We deliver worldwide, door to door, and your quote arrives within one business day.</p></article>
<div class="about-photos">${photo('/photos/hero-group-alt.jpg', 1200, 675, 'Custom packaging made by Boxenza')}${photo('/photos/category-hero-folding-cartons.jpg', 1200, 800, 'Custom printed folding cartons')}${photo('/photos/category-hero-rigid-boxes.jpg', 1200, 800, 'Custom rigid gift boxes')}</div>
${infoCards([['What we do', 'Custom boxes, bags, mailers, pouches, labels and more, made to your size.'], ['Who we serve', 'Growing brands worldwide, from first runs to repeat orders in the tens of thousands.'], ['How we work', ip('Instant landed price, free 3D mockup, proof approval, production photos, then delivery with duties paid.', 'Free quote in one business day, free 3D mockup, proof approval, production photos, then delivery with duties paid.')]])}
<div class="pad">${band('Let us price your packaging.')}</div></div>` };
};
P.contact = () => {
  const cr = crumbs([['Contact us']]);
  return { path: '/contact/', title: 'Contact Boxenza — Free Quote in One Business Day', desc: `Contact ${BRAND} about custom packaging styles, materials or orders. We reply within one business day with your landed price.`, jsonld: [cr.ld],
    body: `<div class="wrap">${cr.html}${pageHead('Contact us', 'Email us, message us on WhatsApp, or request a quote.')}
<div class="why"><div><h3>Email</h3><p class="mono"><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></p></div><div><h3>WhatsApp</h3><p class="mono"><a href="${CONTACT.whatsappLink}">${esc(CONTACT.whatsapp)}</a></p></div><div><h3>Hours</h3><p>Monday to Friday, 9:00 to 18:00 (GMT+5)</p></div><div><h3>Delivery</h3><p>Worldwide, door to door</p></div></div>
<div style="margin-top:2.5rem"><h2 class="sub">What happens after you get in touch</h2>${infoCards([['1. We reply in one business day', 'With your full landed price — production, shipping, duty and tax — and a free 3D mockup of your packaging.'], ['2. You approve the proof', 'We send a digital proof of your artwork on the dieline. Production starts only after you approve it.'], ['3. We ship your order', 'We send photos of your finished order before it ships, then deliver it worldwide, door to door.']])}</div>
<div class="pad">${ip(band('The fastest way to start is an instant price.', 'Get an instant price', '/instant-price/'), band('The fastest way to start is a free quote.', 'Request a quote', '/quote/'))}</div></div>` };
};
P.notFound = () => ({ path: '/404', title: 'Page not found', desc: 'Page not found.',
  body: `<div class="wrap"><div class="pad">${pageHead('Page not found', 'The page you are looking for has moved or does not exist.', '<a class="btn" href="/">Go to the home page</a>')}</div></div>` });

module.exports = { P, layout, D, IMAGES, SITE_URL, catUrl, styleUrl, indUrl, svcUrl, INSTANT };
