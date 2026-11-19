// Builds the static site into ./dist  —  run: node build.js
const fs = require('fs');
const path = require('path');
const { INSTANT, P, layout, D, IMAGES, SITE_URL, catUrl, styleUrl, indUrl, svcUrl } = require('./src/site');
const PRICING = require('./src/pricing.json');

// node build.js            -> dist/    (for Vercel, clean URLs)
// node build.js --preview  -> preview/ (open index.html directly, all links relative)
const PREVIEW = process.argv.includes('--preview');
const OUT = path.join(__dirname, PREVIEW ? 'preview' : 'dist');
function relativize(html, pagePath) {
  const depth = pagePath === '/' ? 0 : pagePath.split('/').filter(Boolean).length;
  const pre = '../'.repeat(depth);
  return html
    .replace(/(href|src)="\/(?!\/)([^"]*)"/g, (m, attr, v) => {
      let h = '', i = v.indexOf('#');
      if (i >= 0) { h = v.slice(i); v = v.slice(0, i); }
      if (v === '' || v.endsWith('/')) v += 'index.html';
      return `${attr}="${pre}${v}${h}"`;
    })
    .replace('<script src="' + pre + 'assets/pricing.js">', `<script>window.BX_BASE=${JSON.stringify(pre)};</script><script src="${pre}assets/pricing.js">`)
}
const render = p => PREVIEW ? relativize(layout(p), p.path) : layout(p);
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, content) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};

const pages = [P.home(), P.products(), ...(INSTANT ? [P.instantPrice()] : []), P.quote(), P.industries(), P.options(), P.dielines(), P.search(), P.why(), P.moq(), P.ptimes(), P.blog(), P.about(), P.contact()];
D.CATS.forEach(c => { pages.push(P.category(c)); c.st.forEach((s, i) => pages.push(P.style(c, i))); });
D.IND.forEach(x => pages.push(P.industry(x)));
D.SVC.forEach(x => pages.push(P.service(x)));
D.BLOG.forEach(b => pages.push(P.article(b)));
Object.keys(D.LEGAL).forEach(k => pages.push(P.legal(k, D.LEGAL[k])));

pages.forEach(p => write(p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + 'index.html', render(p)));
const nf = P.notFound();
write('404.html', render(Object.assign({}, nf, { path: '/' })));

for (const [key, svg] of IMAGES) write('img/' + key + '.svg', svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

// Real product photos: copy photos/ -> dist/photos/ (549 views + 183 dielines + 16 covers)
(function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
})(path.join(__dirname, 'photos'), path.join(OUT, 'photos'));

write('assets/style.css', fs.readFileSync(path.join(__dirname, 'assets/style.css')));
write('assets/app.js', fs.readFileSync(path.join(__dirname, 'assets/app.js')));
const adminCats = D.CATS.map(c => ({ s: c.s, n: c.n, st: c.st.map(x => [x[0], x[1]]) }));
write('admin/index.html', fs.readFileSync(path.join(__dirname, 'assets/admin.html'), 'utf8').replace('/*BX_CATS*/[]', () => JSON.stringify(adminCats).replace(/</g, '\\u003c')));
write('assets/vendor/xlsx.full.min.js', fs.readFileSync(path.join(__dirname, 'assets/vendor/xlsx.full.min.js')));
write('assets/pricing.js', 'window.BX_PRICING=' + JSON.stringify(PRICING) + ';');

// Search index: every style, category, industry, service, article and key page,
// rebuilt on every build so it never goes stale. Served as /assets/search-index.json
// and fetched lazily the first time a visitor types in the search box.
(function buildSearchIndex() {
  const idx = [];
  const add = (t, n, u, k, extra) => idx.push(Object.assign({ t: t, n: n, u: u, k: k.toLowerCase() }, extra || {}));
  D.CATS.forEach(c => {
    add('category', c.n, catUrl(c), c.n + ' boxes packaging');
    c.st.forEach(s => add('style', s[1], styleUrl(c, s), s[0] + ' ' + s[1] + ' ' + c.n, { c: s[0], cat: c.n }));
  });
  D.IND.forEach(x => add('industry', x[1], indUrl(x), x[1] + ' industry packaging'));
  D.SVC.forEach(x => add('service', x[1], svcUrl(x), x[1] + ' service'));
  D.BLOG.forEach(b => add('article', b[1], '/blog/' + b[0] + '/', b[1] + ' ' + b[2]));
  Object.keys(D.LEGAL).forEach(k => add('page', D.LEGAL[k][0], '/' + k + '/', D.LEGAL[k][0]));
  [['Home', '/', 'custom packaging boxes bags pouches home'],
    ['All products', '/products/', 'products styles all packaging'],
    ['Packaging by industry', '/industries/', 'industries packaging by industry'],
    ['Option library', '/option-library/', 'materials printing finishes coatings options'],
    ['Free dielines', '/free-dielines/', 'free dielines download templates'],
    ['Minimum order quantities', '/minimum-order-quantities/', 'minimum order quantity moq'],
    ['Production times', '/production-times/', 'production times lead time'],
    ['Why us', '/why-us/', 'why choose boxenza'],
    ['About', '/about/', 'about boxenza company'],
    ['Contact', '/contact/', 'contact email phone'],
    ['Packaging guides', '/blog/', 'blog guides articles'],
    ['Request a quote', '/quote/', 'quote price estimate request order']].forEach(p => add('page', p[0], p[1], p[2]));
  write('assets/search-index.json', JSON.stringify(idx));
})();
write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,6 58,20 32,34 6,20" fill="#F9CFDD"/><polygon points="58,20 32,34 32,60 58,46" fill="#D21F66"/><polygon points="6,20 32,34 32,60 6,46" fill="#FFFFFF"/><path d="M32,6 L6,20 L32,34" fill="none" stroke="#141A33" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M6,20 L6,46 L32,60" fill="none" stroke="#141A33" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M32,6 L58,20 L32,34 L32,60" fill="none" stroke="#D21F66" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>');
const favIco = path.join(__dirname, 'favicon.ico');
if (fs.existsSync(favIco)) write('favicon.ico', fs.readFileSync(favIco));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.filter(p => p.path !== '/search/').map(p => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${pages.length} pages and ${IMAGES.size} images into ${path.basename(OUT)}/`);
