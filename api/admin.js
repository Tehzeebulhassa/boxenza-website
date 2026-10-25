// /api/admin — private API for the admin panel (one endpoint, ?r= picks the resource).
// Login: POST ?r=login {password} -> {token}. Every other call needs "Authorization: Bearer <token>".
// Needs env: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD (12+ characters recommended).
const { baseUrl, keyHeaders, clean, body, sb, passwordOk, makeToken, tokenOk } = require('./_lib/sb');

const QUOTE_STATUS = ['new', 'contacted', 'quoted', 'won', 'lost'];
const STAGES = ['artwork', 'sample', 'production', 'shipping', 'delivered', 'cancelled'];
const ENTITIES = ['quote', 'order', 'supplier'];

// Allowed fields per table and their type: t=text(max), n=number, i=integer, d=date, b=boolean, a=text list, e=one of
const T = n => ['t', n], N = ['n'], I = ['i'], D = ['d'], B = ['b'], A = ['a'], E = l => ['e', l];
const FIELDS = {
  quotes: { status: E(QUOTE_STATUS), name: T(120), email: T(200), phone: T(40), company: T(200), country: T(60), currency: T(8),
    product: T(120), qty: T(60), size: T(120), details: T(4000), notes: T(4000), quoted_price: N, quoted_currency: T(8), follow_up: D, source: T(30) },
  orders: { quote_id: I, supplier_id: I, stage: E(STAGES), customer_name: T(120), customer_email: T(200), company: T(200), country: T(60),
    product: T(400), qty: I, currency: T(8), sale_price: N, paid: N, fx_rate: N, supplier_cost_pkr: N, shipping_cost_pkr: N, other_cost_pkr: N,
    carrier: T(60), tracking_no: T(80), due_date: D, notes: T(4000) },
  suppliers: { name: T(160), city: T(60), contact_person: T(120), phone: T(40), whatsapp: T(40), email: T(200), address: T(300),
    categories: A, rating: I, notes: T(4000), active: B },
  supplier_rates: { supplier_id: I, batch: T(80), category: T(80), style_code: T(20), style: T(160), size_name: T(60), length: N, width: N, depth: N,
    unit: T(4), material: T(60), qty: I, rate_pkr: N, moq: I, sample_cost_pkr: N, lead_days: I, note: T(300) }
};

class Bad extends Error {}
function pick(table, src, partial) {
  const out = {}, spec = FIELDS[table];
  for (const k of Object.keys(spec)) {
    if (!(k in src)) continue;
    const [type, arg] = spec[k], v = src[k];
    const empty = v === null || v === undefined || v === '';
    if (type === 't') out[k] = empty ? null : clean(v, arg) || null;
    else if (type === 'n' || type === 'i') {
      if (empty) { out[k] = null; continue; }
      const x = type === 'i' ? parseInt(String(v).replace(/,/g, ''), 10) : Number(String(v).replace(/,/g, ''));
      if (!isFinite(x)) throw new Bad(k.replace(/_/g, ' ') + ' must be a number');
      out[k] = x;
    } else if (type === 'd') {
      if (empty) { out[k] = null; continue; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) throw new Bad(k.replace(/_/g, ' ') + ' must be a date');
      out[k] = String(v);
    } else if (type === 'b') out[k] = v === true || v === 'true' || v === 1 || v === '1';
    else if (type === 'a') out[k] = (Array.isArray(v) ? v : String(v || '').split(',')).map(x => clean(x, 60)).filter(Boolean).slice(0, 30);
    else if (type === 'e') {
      if (arg.indexOf(String(v)) < 0) throw new Bad(k + ' must be one of: ' + arg.join(', '));
      out[k] = String(v);
    }
  }
  if (!partial && table === 'suppliers' && !out.name) throw new Bad('Supplier name is required');
  if (table === 'suppliers' && out.rating != null && (out.rating < 1 || out.rating > 5)) throw new Bad('Rating must be 1 to 5');
  return out;
}

// error text for the admin, with the database's own reason so problems are easy to spot
const dbFail = (r, msg) => [r.status === 401 || r.status === 403 ? 502 : 500, { ok: false,
  error: msg + ' Database said: ' + (r.status || '') + ' ' + clean((r.data && (r.data.message || r.data.msg || r.data.error || r.data.hint)) || r.data || '', 200) }];
const idOf = v => { const n = parseInt(v, 10); return n > 0 ? n : 0; };
const lim = (v, d, max) => Math.min(Math.max(parseInt(v, 10) || d, 1), max);
const off = v => Math.max(parseInt(v, 10) || 0, 0);
const enc = encodeURIComponent;
// search text -> safe PostgREST "or" filter over the given columns
function search(q, cols) {
  q = String(q || '').replace(/[^\p{L}\p{N}@.\-_+ ]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (!q) return '';
  const parts = cols.map(c => `${c}.ilike."*${q}*"`);
  const m = q.match(/^(bx-?|#)?0*(\d{1,9})$/i);
  if (m) parts.push('id.eq.' + m[2]);
  return '&or=' + enc('(' + parts.join(',') + ')');
}
const today = q => (/^\d{4}-\d{2}-\d{2}$/.test(String(q.today || '')) ? q.today : new Date().toISOString().slice(0, 10));
const log = (entity, id, text) => sb('activity', { method: 'POST', body: { entity, entity_id: id, text: clean(text, 1000) } });
const fmt = (cur, n) => (cur || '') + ' ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const orderProfit = o => {
  if (o.sale_price == null || !o.fx_rate) return null;
  return o.sale_price * o.fx_rate - (o.supplier_cost_pkr || 0) - (o.shipping_cost_pkr || 0) - (o.other_cost_pkr || 0);
};

// ---------- handlers ----------
const H = {};

H.stats = async q => {
  const t = today(q), month = t.slice(0, 7);
  const [qs, os] = await Promise.all([
    sb('quotes?select=id,created_at,status,name,company,product,follow_up&order=created_at.desc&limit=5000'),
    sb('orders?select=id,created_at,stage,customer_name,product,currency,sale_price,paid,fx_rate,supplier_cost_pkr,shipping_cost_pkr,other_cost_pkr,due_date&limit=5000')
  ]);
  if (!qs.ok) return dbFail(qs, 'Could not load the dashboard.');
  if (!os.ok) return dbFail(os, 'Could not load the dashboard.');
  const quotes = qs.data, orders = os.data;
  const since = new Date(Date.parse(t) - 29 * 864e5).toISOString().slice(0, 10);
  const byStatus = {}; QUOTE_STATUS.forEach(s => (byStatus[s] = 0));
  quotes.forEach(x => (byStatus[x.status] = (byStatus[x.status] || 0) + 1));
  const followUps = quotes.filter(x => x.follow_up && x.follow_up <= t && x.status !== 'won' && x.status !== 'lost')
    .sort((a, b) => (a.follow_up < b.follow_up ? -1 : 1)).slice(0, 20);
  const byStage = {}; STAGES.forEach(s => (byStage[s] = 0));
  orders.forEach(o => (byStage[o.stage] = (byStage[o.stage] || 0) + 1));
  const open = orders.filter(o => o.stage !== 'delivered' && o.stage !== 'cancelled');
  const in7 = new Date(Date.parse(t) + 7 * 864e5).toISOString().slice(0, 10);
  const dueSoon = open.filter(o => o.due_date && o.due_date <= in7).sort((a, b) => (a.due_date < b.due_date ? -1 : 1)).slice(0, 20);
  let revenue = 0, profit = 0, missingFx = 0;
  const unpaid = {};
  orders.forEach(o => {
    if (o.stage === 'cancelled') return;
    if (o.sale_price != null && o.sale_price - (o.paid || 0) > 0) unpaid[o.currency] = (unpaid[o.currency] || 0) + (o.sale_price - (o.paid || 0));
    if (o.created_at.slice(0, 7) !== month || o.sale_price == null) return;
    const p = orderProfit(o);
    if (p == null) { missingFx++; return; }
    revenue += o.sale_price * o.fx_rate; profit += p;
  });
  const decided = byStatus.won + byStatus.lost;
  return [200, { ok: true, today: t,
    quotes: { total: quotes.length, byStatus, last30: quotes.filter(x => x.created_at.slice(0, 10) >= since).length,
      winRate: decided ? Math.round((byStatus.won / decided) * 100) : null, recent: quotes.slice(0, 6), followUps },
    orders: { total: orders.length, open: open.length, byStage, dueSoon,
      month: { revenue_pkr: Math.round(revenue), profit_pkr: Math.round(profit), missingFx }, unpaid } }];
};

// ----- quotes -----
H.quotes = {
  GET: async q => {
    if (q.id) {
      const id = idOf(q.id);
      const [r, a, o] = await Promise.all([
        sb(`quotes?id=eq.${id}&select=*`),
        sb(`activity?entity=eq.quote&entity_id=eq.${id}&order=created_at.desc&limit=100`),
        sb(`orders?quote_id=eq.${id}&select=id,stage`)
      ]);
      if (!r.ok || !r.data.length) return [404, { ok: false, error: 'Quote not found.' }];
      return [200, { ok: true, row: r.data[0], activity: a.data || [], orders: o.data || [] }];
    }
    let f = '';
    if (QUOTE_STATUS.indexOf(q.status) >= 0) f += '&status=eq.' + q.status;
    if (q.status === 'open') f += '&status=in.(new,contacted,quoted)';
    if (q.follow === 'due') f += '&follow_up=lte.' + today(q) + '&status=not.in.(won,lost)';
    f += search(q.q, ['name', 'email', 'company', 'phone', 'product', 'country']);
    const cols = q.full ? '*' : 'id,created_at,status,name,email,phone,company,country,product,qty,items,quoted_price,quoted_currency,follow_up,source,file_path';
    const r = await sb(`quotes?select=${cols}${f}&order=created_at.desc&limit=${lim(q.limit, 50, 5000)}&offset=${off(q.offset)}`, { headers: { Prefer: 'count=exact' } });
    if (!r.ok) return dbFail(r, 'Could not load quotes.');
    return [200, { ok: true, rows: r.data, total: r.total }];
  },
  POST: async (q, b) => {
    const rec = pick('quotes', b);
    if (!rec.name) throw new Bad('Name is required');
    if (rec.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rec.email)) throw new Bad('Email looks wrong');
    rec.source = rec.source || 'manual';
    rec.status = rec.status || 'new';
    rec.summary = [rec.product && 'Product: ' + rec.product, rec.qty && 'Quantity: ' + rec.qty, rec.size && 'Size: ' + rec.size, rec.details].filter(Boolean).join('\n');
    const r = await sb('quotes', { method: 'POST', body: rec, headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Could not save the lead.' }];
    await log('quote', r.data[0].id, 'Lead added by hand' + (rec.source !== 'manual' ? ' (' + rec.source + ')' : ''));
    return [200, { ok: true, row: r.data[0] }];
  },
  PATCH: async (q, b) => {
    const id = idOf(b.id);
    if (!id) throw new Bad('Missing id');
    const ch = pick('quotes', b, true);
    if (!Object.keys(ch).length) throw new Bad('Nothing to change');
    const old = await sb(`quotes?id=eq.${id}&select=status,quoted_price,quoted_currency,follow_up`);
    if (!old.ok || !old.data.length) return [404, { ok: false, error: 'Quote not found.' }];
    const o = old.data[0];
    const r = await sb(`quotes?id=eq.${id}`, { method: 'PATCH', body: ch, headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Update failed.' }];
    const n = r.data[0], notes = [];
    if (n.status !== o.status) notes.push(`Status: ${o.status} → ${n.status}`);
    if (n.quoted_price != null && (Number(n.quoted_price) !== Number(o.quoted_price) || n.quoted_currency !== o.quoted_currency)) notes.push('Price sent: ' + fmt(n.quoted_currency, n.quoted_price));
    if (n.follow_up && n.follow_up !== o.follow_up) notes.push('Follow-up on ' + n.follow_up);
    for (const t of notes) await log('quote', id, t);
    return [200, { ok: true, row: n }];
  },
  DELETE: async q => {
    const id = idOf(q.id);
    if (!id) throw new Bad('Missing id');
    const r = await sb(`quotes?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Delete failed.' }];
    await sb(`activity?entity=eq.quote&entity_id=eq.${id}`, { method: 'DELETE' });
    const fp = r.data && r.data[0] && r.data[0].file_path;
    if (fp) {
      try {
        await fetch(`${baseUrl()}/storage/v1/object/artwork/${fp}`, { method: 'DELETE',
          headers: keyHeaders() });
      } catch (e) { /* the file stays in storage; harmless */ }
    }
    return [200, { ok: true }];
  }
};

H.file = async q => {
  const path = String(q.path || '');
  if (!/^[\w./-]+$/.test(path) || path.indexOf('..') >= 0) throw new Bad('Bad file path');
  const base = baseUrl();
  const r = await fetch(`${base}/storage/v1/object/sign/artwork/${path}`, {
    method: 'POST',
    headers: Object.assign(keyHeaders(), { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn: 3600 })
  });
  if (!r.ok) return [404, { ok: false, error: 'File not found.' }];
  const j = await r.json();
  return [200, { ok: true, url: base + '/storage/v1' + (j.signedURL || j.signedUrl) }];
};

H.activity = {
  GET: async q => {
    if (ENTITIES.indexOf(q.entity) < 0) throw new Bad('Bad entity');
    const r = await sb(`activity?entity=eq.${q.entity}&entity_id=eq.${idOf(q.id)}&order=created_at.desc&limit=100`);
    return [200, { ok: true, rows: r.data || [] }];
  },
  POST: async (q, b) => {
    if (ENTITIES.indexOf(b.entity) < 0 || !idOf(b.entity_id)) throw new Bad('Bad entity');
    const text = clean(b.text, 1000);
    if (!text) throw new Bad('Write a note first');
    const r = await sb('activity', { method: 'POST', body: { entity: b.entity, entity_id: idOf(b.entity_id), text }, headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Could not save the note.' }];
    return [200, { ok: true, row: r.data[0] }];
  }
};

// ----- orders -----
function quoteProduct(qt) {
  if (Array.isArray(qt.items) && qt.items.length) {
    return qt.items.map(it => `${it.name || 'Item'}${it.dims ? ' ' + it.dims.join(' x ') + ' ' + (it.unit || '') : ''}${it.qty ? ', qty ' + it.qty : ''}`).join('; ').slice(0, 400);
  }
  return [qt.product, qt.size && qt.size !== 'Not given' ? qt.size : ''].filter(Boolean).join(', ') || 'Custom packaging';
}
H.orders = {
  GET: async q => {
    if (q.id) {
      const id = idOf(q.id);
      const [r, a] = await Promise.all([
        sb(`orders?id=eq.${id}&select=*,supplier:suppliers(id,name,city,phone,whatsapp)`),
        sb(`activity?entity=eq.order&entity_id=eq.${id}&order=created_at.desc&limit=100`)
      ]);
      if (!r.ok || !r.data.length) return [404, { ok: false, error: 'Order not found.' }];
      return [200, { ok: true, row: r.data[0], activity: a.data || [] }];
    }
    let f = '';
    if (STAGES.indexOf(q.stage) >= 0) f += '&stage=eq.' + q.stage;
    if (q.stage === 'open') f += '&stage=not.in.(delivered,cancelled)';
    f += search(q.q, ['customer_name', 'customer_email', 'company', 'product', 'tracking_no', 'country']);
    const r = await sb(`orders?select=*,supplier:suppliers(id,name)${f}&order=created_at.desc&limit=${lim(q.limit, 50, 5000)}&offset=${off(q.offset)}`, { headers: { Prefer: 'count=exact' } });
    if (!r.ok) return dbFail(r, 'Could not load orders.');
    return [200, { ok: true, rows: r.data, total: r.total }];
  },
  POST: async (q, b) => {
    const rec = pick('orders', b);
    let quote = null;
    if (rec.quote_id) {
      const r = await sb(`quotes?id=eq.${rec.quote_id}&select=*`);
      if (!r.ok || !r.data.length) throw new Bad('That quote no longer exists');
      quote = r.data[0];
      const fill = { customer_name: quote.name, customer_email: quote.email, company: quote.company, country: quote.country,
        product: quoteProduct(quote), currency: quote.quoted_currency || quote.currency || 'USD', sale_price: quote.quoted_price };
      for (const k of Object.keys(fill)) if (rec[k] == null && fill[k] != null) rec[k] = fill[k];
    }
    if (!rec.customer_name) throw new Bad('Customer name is required');
    if (!rec.product) throw new Bad('Product is required');
    rec.currency = (rec.currency || 'USD').toUpperCase();
    const r = await sb('orders', { method: 'POST', body: rec, headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Could not create the order.' }];
    const row = r.data[0];
    await log('order', row.id, quote ? `Order created from quote BX-${String(quote.id).padStart(5, '0')}` : 'Order created');
    if (quote && quote.status !== 'won') {
      await sb(`quotes?id=eq.${quote.id}`, { method: 'PATCH', body: { status: 'won' } });
      await log('quote', quote.id, `Status: ${quote.status} → won (order #${row.id})`);
    }
    return [200, { ok: true, row }];
  },
  PATCH: async (q, b) => {
    const id = idOf(b.id);
    if (!id) throw new Bad('Missing id');
    const ch = pick('orders', b, true);
    delete ch.quote_id;
    if (!Object.keys(ch).length) throw new Bad('Nothing to change');
    if ('customer_name' in ch && !ch.customer_name) throw new Bad('Customer name is required');
    if ('product' in ch && !ch.product) throw new Bad('Product is required');
    if (ch.currency) ch.currency = ch.currency.toUpperCase();
    const old = await sb(`orders?id=eq.${id}&select=stage,tracking_no,paid,supplier_id`);
    if (!old.ok || !old.data.length) return [404, { ok: false, error: 'Order not found.' }];
    const o = old.data[0];
    const r = await sb(`orders?id=eq.${id}`, { method: 'PATCH', body: ch, headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Update failed.' }];
    const n = r.data[0];
    if (n.stage !== o.stage) await log('order', id, `Stage: ${o.stage} → ${n.stage}`);
    if (n.tracking_no && n.tracking_no !== o.tracking_no) await log('order', id, `Tracking: ${n.carrier ? n.carrier + ' ' : ''}${n.tracking_no}`);
    if (Number(n.paid) !== Number(o.paid)) await log('order', id, 'Payment received so far: ' + fmt(n.currency, n.paid));
    if (n.supplier_id !== o.supplier_id && n.supplier_id) await log('order', id, 'Supplier set (#' + n.supplier_id + ')');
    return [200, { ok: true, row: n }];
  },
  DELETE: async q => {
    const id = idOf(q.id);
    if (!id) throw new Bad('Missing id');
    const r = await sb(`orders?id=eq.${id}`, { method: 'DELETE' });
    if (!r.ok) return [500, { ok: false, error: 'Delete failed.' }];
    await sb(`activity?entity=eq.order&entity_id=eq.${id}`, { method: 'DELETE' });
    return [200, { ok: true }];
  }
};

// ----- suppliers -----
H.suppliers = {
  GET: async q => {
    if (q.id) {
      const id = idOf(q.id);
      const [r, a] = await Promise.all([
        sb(`suppliers?id=eq.${id}&select=*,supplier_rates(count)`),
        sb(`activity?entity=eq.supplier&entity_id=eq.${id}&order=created_at.desc&limit=100`)
      ]);
      if (!r.ok || !r.data.length) return [404, { ok: false, error: 'Supplier not found.' }];
      return [200, { ok: true, row: r.data[0], activity: a.data || [] }];
    }
    const f = search(q.q, ['name', 'city', 'contact_person', 'phone', 'email']);
    const r = await sb(`suppliers?select=*,supplier_rates(count)${f}&order=name.asc&limit=1000`);
    if (!r.ok) return dbFail(r, 'Could not load suppliers.');
    return [200, { ok: true, rows: r.data }];
  },
  POST: async (q, b) => {
    const rec = pick('suppliers', b);
    const r = await sb('suppliers', { method: 'POST', body: rec, headers: { Prefer: 'return=representation' } });
    if (!r.ok) return [500, { ok: false, error: 'Could not save the supplier.' }];
    await log('supplier', r.data[0].id, 'Supplier added');
    return [200, { ok: true, row: r.data[0] }];
  },
  PATCH: async (q, b) => {
    const id = idOf(b.id);
    if (!id) throw new Bad('Missing id');
    const ch = pick('suppliers', b, true);
    if ('name' in ch && !ch.name) throw new Bad('Supplier name is required');
    if (!Object.keys(ch).length) throw new Bad('Nothing to change');
    const r = await sb(`suppliers?id=eq.${id}`, { method: 'PATCH', body: ch, headers: { Prefer: 'return=representation' } });
    if (!r.ok || !r.data.length) return [500, { ok: false, error: 'Update failed.' }];
    return [200, { ok: true, row: r.data[0] }];
  },
  DELETE: async q => {
    const id = idOf(q.id);
    if (!id) throw new Bad('Missing id');
    const r = await sb(`suppliers?id=eq.${id}`, { method: 'DELETE' });
    if (!r.ok) return [500, { ok: false, error: 'Delete failed.' }];
    await sb(`activity?entity=eq.supplier&entity_id=eq.${id}`, { method: 'DELETE' });
    return [200, { ok: true }];
  }
};

// ----- supplier rates -----
H.rates = {
  GET: async q => {
    if (q.batches) {
      const r = await sb('supplier_rates?select=batch,supplier_id,category,created_at&batch=not.is.null&order=created_at.desc&limit=20000');
      if (!r.ok) return dbFail(r, 'Could not load imports.');
      const m = new Map();
      r.data.forEach(x => {
        const g = m.get(x.batch) || { batch: x.batch, supplier_id: x.supplier_id, created_at: x.created_at, rows: 0, categories: [] };
        g.rows++; if (x.category && g.categories.indexOf(x.category) < 0) g.categories.push(x.category);
        m.set(x.batch, g);
      });
      return [200, { ok: true, rows: [...m.values()] }];
    }
    let f = '';
    if (idOf(q.supplier_id)) f += '&supplier_id=eq.' + idOf(q.supplier_id);
    if (q.category) f += '&category=eq.' + enc(clean(q.category, 80));
    if (idOf(q.qty)) f += '&qty=eq.' + idOf(q.qty);
    if (q.material) f += '&material=eq.' + enc(clean(q.material, 60));
    const s = String(q.q || '').replace(/[^\p{L}\p{N}.\-_ ]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
    if (s) f += '&or=' + enc(`(style.ilike."*${s}*",style_code.ilike."*${s}*",size_name.ilike."*${s}*")`);
    const r = await sb(`supplier_rates?select=*,supplier:suppliers(id,name,city)${f}&order=style_code.asc,size_name.asc,qty.asc,rate_pkr.asc&limit=${lim(q.limit, 500, 5000)}`, { headers: { Prefer: 'count=exact' } });
    if (!r.ok) return dbFail(r, 'Could not load rates.');
    return [200, { ok: true, rows: r.data, total: r.total }];
  },
  POST: async (q, b) => {
    const sid = idOf(b.supplier_id);
    if (!sid) throw new Bad('Choose a supplier first');
    const rows = Array.isArray(b.rows) ? b.rows.slice(0, 2000) : [];
    if (!rows.length) throw new Bad('No rates to save');
    const batch = b.batch ? clean(b.batch, 80) : null;
    const good = []; let skipped = 0;
    for (const x of rows) {
      try {
        const rec = pick('supplier_rates', x);
        rec.supplier_id = sid; rec.batch = batch;
        if (!rec.qty || rec.qty < 1 || rec.rate_pkr == null || rec.rate_pkr < 0) { skipped++; continue; }
        rec.unit = rec.unit === 'mm' ? 'mm' : 'in';
        good.push(rec);
      } catch (e) { skipped++; }
    }
    if (!good.length) throw new Bad('No valid rates found (each row needs a quantity and a rate)');
    const r = await sb('supplier_rates', { method: 'POST', body: good });
    if (!r.ok) return [500, { ok: false, error: 'Could not save the rates.' }];
    return [200, { ok: true, saved: good.length, skipped }];
  },
  DELETE: async q => {
    let f;
    if (idOf(q.id)) f = 'id=eq.' + idOf(q.id);
    else if (q.batch) f = 'batch=eq.' + enc(clean(q.batch, 80));
    else if (idOf(q.supplier_id)) f = 'supplier_id=eq.' + idOf(q.supplier_id);
    else throw new Bad('Say which rates to delete');
    const r = await sb('supplier_rates?' + f, { method: 'DELETE' });
    if (!r.ok) return [500, { ok: false, error: 'Delete failed.' }];
    return [200, { ok: true }];
  }
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const env = process.env, q = req.query || {}, r = String(q.r || '');
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return res.status(503).json({ ok: false, error: 'Database is not connected yet (SUPABASE_URL / SUPABASE_SERVICE_KEY missing).' });
  if ((env.ADMIN_PASSWORD || '').length < 8) return res.status(503).json({ ok: false, error: 'ADMIN_PASSWORD is not set (8+ characters).' });

  if (r === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!passwordOk(body(req).password)) {
      await new Promise(ok => setTimeout(ok, 800)); // slows down password guessing
      return res.status(401).json({ ok: false, error: 'Wrong password.' });
    }
    return res.status(200).json({ ok: true, token: makeToken() });
  }
  if (!tokenOk(req)) return res.status(401).json({ ok: false, error: 'Please log in again.' });

  const h = H[r];
  const fn = typeof h === 'function' ? (req.method === 'GET' ? h : null) : h && h[req.method];
  if (!fn) return res.status(404).json({ ok: false, error: 'Unknown request.' });
  try {
    const [status, out] = await fn(q, body(req));
    return res.status(status).json(out);
  } catch (e) {
    if (e instanceof Bad) return res.status(400).json({ ok: false, error: e.message });
    console.error('admin error', r, e);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Try again.' });
  }
};
