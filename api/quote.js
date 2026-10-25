// POST /api/quote — saves a quote request in Supabase, stores the artwork file,
// and emails the owner and the customer (Resend). Configure with environment variables:
// SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, OWNER_EMAIL, FROM_EMAIL
const { keyHeaders, clean, body, sb, sendEmail } = require('./_lib/sb');

const MAX_FILE = 3 * 1024 * 1024; // 3 MB (request body limit on Vercel is ~4.5 MB after base64)
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/svg+xml', 'application/postscript', 'application/illustrator', 'application/octet-stream'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const env = process.env;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return res.status(503).json({ ok: false, error: 'Quote service is not configured yet.' });

  const b = body(req);
  if (!Object.keys(b).length) return res.status(400).json({ ok: false, error: 'Invalid request.' });
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill the hidden field

  const name = clean(b.name, 120), email = clean(b.email, 200);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Please enter your name and a valid email.' });

  const record = {
    name, email, phone: clean(b.phone, 40),
    company: clean(b.company, 200), country: clean(b.country, 60), currency: clean(b.currency, 8),
    product: clean(b.product, 120), qty: clean(b.qty, 60), size: clean(b.size, 120), artwork: clean(b.artwork, 120),
    style_notes: clean(b.style, 500), details: clean(b.details, 4000),
    items: Array.isArray(b.items) ? b.items.slice(0, 20) : [],
    summary: clean(b.summary, 10000), status: 'new', source: 'website'
  };

  // optional artwork file
  if (b.file && b.file.data) {
    const type = clean(b.file.type, 100) || 'application/octet-stream';
    if (ALLOWED.indexOf(type) < 0) return res.status(400).json({ ok: false, error: 'Please upload a PDF, AI, EPS, PNG, JPG or SVG file.' });
    const buf = Buffer.from(String(b.file.data), 'base64');
    if (buf.length > MAX_FILE) return res.status(400).json({ ok: false, error: 'The file is larger than 3 MB. Send it by email after we reply.' });
    const safe = clean(b.file.name, 100).replace(/[^A-Za-z0-9._-]+/g, '_') || 'artwork';
    const path = new Date().toISOString().slice(0, 10) + '/' + Date.now() + '-' + safe;
    try {
      const up = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/artwork/${path}`, {
        method: 'POST',
        headers: Object.assign(keyHeaders(), { 'Content-Type': type }),
        body: buf
      });
      if (!up.ok) throw new Error(up.status + ' ' + (await up.text()));
      record.file_path = path;
    } catch (e) {
      console.error('upload failed', e);
      return res.status(500).json({ ok: false, error: 'File upload failed. Please try again without the file.' });
    }
  }

  const ins = await sb('quotes', { method: 'POST', body: record, headers: { Prefer: 'return=representation' } });
  if (!ins.ok) return res.status(500).json({ ok: false, error: 'Could not save your request. Please try again.' });
  const row = (ins.data && ins.data[0]) || {};
  const ref = 'BX-' + String(row.id || '').padStart(5, '0');
  await sb('activity', { method: 'POST', body: { entity: 'quote', entity_id: row.id, text: 'Quote received from the website' } });

  const site = (env.SITE_URL || '').replace(/\/+$/, '');
  await sendEmail(env.OWNER_EMAIL, `New quote ${ref} from ${name}`,
    record.summary + (record.phone ? '\nPhone / WhatsApp: ' + record.phone : '') +
    (record.file_path ? '\n\nArtwork file is in the admin panel.' : '') + (site ? '\n\nOpen admin: ' + site + '/admin/' : ''), email);
  await sendEmail(email, `We received your quote request (${ref})`,
    `Hi ${name},\n\nThanks for your request. We will reply within one business day with your landed price, a free 3D mockup and the lead time.\n\nReference: ${ref}\n\n${record.summary}\n\nBoxenza Packaging`, env.OWNER_EMAIL);

  return res.status(200).json({ ok: true, ref });
};
