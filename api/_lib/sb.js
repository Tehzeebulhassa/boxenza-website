// Small helpers shared by the API functions (files in api/_lib are not deployed as endpoints).
const crypto = require('crypto');

// Works with both Supabase key types: the old "service_role" key (starts with eyJ) and the new "secret" key (sb_secret_...).
// The new key goes only in the apikey header; the old one also goes in Authorization.
function keyHeaders() {
  const k = String(process.env.SUPABASE_SERVICE_KEY || '').trim();
  return k.startsWith('eyJ') ? { apikey: k, Authorization: 'Bearer ' + k } : { apikey: k };
}

const clean = (v, n) => (v == null ? '' : String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n));

function body(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (Buffer.isBuffer(b)) { try { b = JSON.parse(b.toString('utf8')); } catch (e) { b = null; } }
  return b && typeof b === 'object' ? b : {};
}

// Supabase REST (PostgREST) call with the service key. Returns { ok, status, data, total }.
async function sb(path, opts) {
  const env = process.env;
  opts = opts || {};
  const headers = Object.assign(keyHeaders(), { 'Content-Type': 'application/json' }, opts.headers || {});
  const r = await fetch(env.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body)
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!r.ok) console.error('supabase', opts.method || 'GET', path.split('?')[0], r.status, text.slice(0, 300));
  let total = null;
  const cr = r.headers.get('content-range');
  if (cr && cr.indexOf('/') >= 0) { const t = cr.split('/')[1]; if (t !== '*') total = parseInt(t, 10); }
  return { ok: r.ok, status: r.status, data, total };
}

async function sendEmail(to, subject, text, replyTo) {
  const env = process.env;
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [to], subject, text, reply_to: replyTo || undefined })
    });
    if (!r.ok) console.error('email failed', r.status, await r.text());
    return r.ok;
  } catch (e) { console.error('email error', e); return false; }
}

// ---------- admin session tokens (signed, expire after 12 hours) ----------
const TTL = 12 * 60 * 60 * 1000;
function signingKey() {
  const env = process.env;
  return crypto.createHash('sha256').update('bx-admin|' + (env.ADMIN_PASSWORD || '') + '|' + (env.SESSION_SECRET || env.SUPABASE_SERVICE_KEY || '')).digest();
}
function sameText(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
function passwordOk(pw) {
  const want = process.env.ADMIN_PASSWORD || '';
  return want.length >= 8 && sameText(pw || '', want);
}
function makeToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL })).toString('base64url');
  const sig = crypto.createHmac('sha256', signingKey()).update(payload).digest('base64url');
  return payload + '.' + sig;
}
function tokenOk(req) {
  if ((process.env.ADMIN_PASSWORD || '').length < 8) return false;
  const h = String(req.headers.authorization || '');
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  const [payload, sig] = t.split('.');
  if (!payload || !sig) return false;
  const want = crypto.createHmac('sha256', signingKey()).update(payload).digest('base64url');
  if (!sameText(sig, want)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp > Date.now(); } catch (e) { return false; }
}

module.exports = { keyHeaders, clean, body, sb, sendEmail, passwordOk, makeToken, tokenOk };
