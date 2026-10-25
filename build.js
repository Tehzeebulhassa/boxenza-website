// Builds the static site into ./dist  —  run: node build.js
const fs = require('fs');
const path = require('path');
const { INSTANT, P, layout, D, IMAGES, SITE_URL } = require('./src/site');
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

const pages = [P.home(), P.products(), ...(INSTANT ? [P.instantPrice()] : []), P.quote(), P.industries(), P.options(), P.why(), P.moq(), P.ptimes(), P.blog(), P.about(), P.contact()];
D.CATS.forEach(c => { pages.push(P.category(c)); c.st.forEach((s, i) => pages.push(P.style(c, i))); });
D.IND.forEach(x => pages.push(P.industry(x)));
D.SVC.forEach(x => pages.push(P.service(x)));
D.BLOG.forEach(b => pages.push(P.article(b)));
Object.keys(D.LEGAL).forEach(k => pages.push(P.legal(k, D.LEGAL[k])));

pages.forEach(p => write(p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + 'index.html', render(p)));
const nf = P.notFound();
write('404.html', render(Object.assign({}, nf, { path: '/' })));

for (const [key, svg] of IMAGES) write('img/' + key + '.svg', svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

write('assets/style.css', fs.readFileSync(path.join(__dirname, 'assets/style.css')));
write('assets/app.js', fs.readFileSync(path.join(__dirname, 'assets/app.js')));
const adminCats = D.CATS.map(c => ({ s: c.s, n: c.n, st: c.st.map(x => [x[0], x[1]]) }));
write('admin/index.html', fs.readFileSync(path.join(__dirname, 'assets/admin.html'), 'utf8').replace('/*BX_CATS*/[]', () => JSON.stringify(adminCats).replace(/</g, '\\u003c')));
write('assets/vendor/xlsx.full.min.js', fs.readFileSync(path.join(__dirname, 'assets/vendor/xlsx.full.min.js')));
write('assets/pricing.js', 'window.BX_PRICING=' + JSON.stringify(PRICING) + ';');
write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path d="M14 3 24 8.5v11L14 25 4 19.5v-11Z" fill="#D21F66"/><path d="M4 8.5 14 14l10-5.5M14 14v11" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>');

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.map(p => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${pages.length} pages and ${IMAGES.size} images into ${path.basename(OUT)}/`);
