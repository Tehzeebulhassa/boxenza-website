# Boxenza Packaging website

Static website (SEO-ready pages) + backend (Vercel functions + Supabase database + Resend email) + admin panel.

## Folder
- `src/data.js` – products, industries, services, MOQ, blog (edit content here)
- `src/pricing.json` – instant price rates (PLACEHOLDER – instant price abhi band hai)
- `src/site.js` – page templates
- `assets/` – CSS, front-end JS, admin panel (`admin.html`), Excel reader (`vendor/`)
- `api/quote.js` – website quote form → database + emails
- `api/admin.js` – admin panel backend (login, quotes, orders, suppliers, rates, dashboard)
- `api/_lib/sb.js` – shared helpers (deploy nahi hota as endpoint)
- `supabase/schema.sql` – database tables
- `node build.js` – website `dist/` folder mein banata hai

## Admin panel (`/admin/`)
- **Home** – naye quotes, follow-ups, win rate, open orders, is mahine ka profit (PKR), kitne paise lene baqi hain
- **Quotes** – website ke quotes + haath se leads (WhatsApp, call, cold email reply). Status, bheja gaya price, follow-up date, private notes, activity log, artwork download, Excel export
- **Orders** – jeeta hua quote ek click mein order. Stage (artwork → sample → production → shipping → delivered), supplier, cost, shipping, PKR rate se profit khud hisaab, tracking number
- **Suppliers** – factories ki list, rating, kya banate hain; unki bhari hui Excel rate sheet seedha import
- **Rates** – sab suppliers ke rates ek jagah; same style + size + quantity par sab se sasta green mein

## Live karne ke steps
1. **Supabase** (free): naya project → SQL Editor → `supabase/schema.sql` poora paste → Run.
   Settings → API se `Project URL` aur `service_role` key copy karo.
2. **Resend** (free): account → apna domain verify karo → API key banao.
3. **Vercel** (free): GitHub repo import karo, phir Settings → Environment Variables:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - `RESEND_API_KEY`, `FROM_EMAIL` (jaise `Boxenza <quotes@yourdomain.com>`), `OWNER_EMAIL` (jahan quotes aayen)
   - `ADMIN_PASSWORD` – lamba password (kam az kam 12 characters)
   - `SITE_URL` – jaise `https://www.yourdomain.com`
4. Redeploy karo, domain connect karo. Admin panel: `https://www.yourdomain.com/admin/`

Keys aur passwords kabhi chat ya code mein mat daalna – sirf Vercel ke Environment Variables mein.
Password badalne se sab purane logins khud band ho jate hain.

## Launch se pehle zaroor badalna
- `src/site.js` mein `CONTACT` – email aur WhatsApp
- Privacy / Terms / Shipping pages (`src/data.js` → `LEGAL`)
- MOQ aur production times (`src/data.js`)
- Instant price: asli rates ke baad `src/pricing.json` aur `BX_INSTANT=1`
