-- Boxenza database. Run in Supabase: Dashboard > SQL Editor > New query > paste all > Run.
-- Safe to run again later: it only adds what is missing and never deletes data.

-- ---------- quotes (requests from the website, or leads added by hand) ----------
create table if not exists public.quotes (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  status      text not null default 'new',
  name        text not null,
  email       text not null,
  company     text,
  country     text,
  currency    text,
  product     text,
  qty         text,
  size        text,
  artwork     text,
  style_notes text,
  details     text,
  items       jsonb not null default '[]'::jsonb,
  summary     text,
  file_path   text
);
alter table public.quotes add column if not exists updated_at      timestamptz not null default now();
alter table public.quotes add column if not exists phone           text;
alter table public.quotes add column if not exists source          text not null default 'website';
alter table public.quotes add column if not exists notes           text;
alter table public.quotes add column if not exists quoted_price    numeric(12,2);
alter table public.quotes add column if not exists quoted_currency text;
alter table public.quotes add column if not exists follow_up       date;
alter table public.quotes alter column email drop not null;
alter table public.quotes drop constraint if exists quotes_status_check;
alter table public.quotes add constraint quotes_status_check
  check (status in ('new', 'contacted', 'quoted', 'won', 'lost'));
create index if not exists quotes_created_idx on public.quotes (created_at desc);
create index if not exists quotes_status_idx  on public.quotes (status);

-- ---------- suppliers ----------
create table if not exists public.suppliers (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  name           text not null,
  city           text,
  contact_person text,
  phone          text,
  whatsapp       text,
  email          text,
  address        text,
  categories     text[] not null default '{}',
  rating         smallint check (rating between 1 and 5),
  notes          text,
  active         boolean not null default true
);

-- ---------- supplier rates (typed in, or imported from the Excel rate sheets) ----------
create table if not exists public.supplier_rates (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  supplier_id     bigint not null references public.suppliers (id) on delete cascade,
  batch           text,              -- one Excel import = one batch, so it can be removed in one go
  category        text,
  style_code      text,
  style           text,
  size_name       text,
  length          numeric(8,2),
  width           numeric(8,2),
  depth           numeric(8,2),
  unit            text not null default 'in',
  material        text,              -- e.g. "3 ply", "5 ply"; empty = the sheet's default spec
  qty             integer not null check (qty > 0),
  rate_pkr        numeric(12,2) not null check (rate_pkr >= 0),
  moq             integer,
  sample_cost_pkr numeric(12,2),
  lead_days       integer,
  note            text
);
create index if not exists rates_lookup_idx   on public.supplier_rates (category, style_code, qty);
create index if not exists rates_supplier_idx on public.supplier_rates (supplier_id);

-- ---------- orders (a won quote becomes an order) ----------
create table if not exists public.orders (
  id                 bigint generated always as identity primary key,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  quote_id           bigint references public.quotes (id) on delete set null,
  supplier_id        bigint references public.suppliers (id) on delete set null,
  stage              text not null default 'artwork'
                     check (stage in ('artwork', 'sample', 'production', 'shipping', 'delivered', 'cancelled')),
  customer_name      text not null,
  customer_email     text,
  company            text,
  country            text,
  product            text not null,
  qty                integer,
  currency           text not null default 'USD',
  sale_price         numeric(12,2),    -- total the customer pays, in "currency"
  paid               numeric(12,2) not null default 0,
  fx_rate            numeric(12,4),    -- PKR for 1 unit of "currency" (e.g. 280 for USD)
  supplier_cost_pkr  numeric(12,2),
  shipping_cost_pkr  numeric(12,2),
  other_cost_pkr     numeric(12,2),
  carrier            text,
  tracking_no        text,
  due_date           date,
  notes              text
);
create index if not exists orders_stage_idx on public.orders (stage);

-- ---------- activity log (status changes and notes) ----------
create table if not exists public.activity (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  entity     text not null check (entity in ('quote', 'order', 'supplier')),
  entity_id  bigint not null,
  text       text not null
);
create index if not exists activity_entity_idx on public.activity (entity, entity_id, created_at desc);

-- ---------- keep updated_at fresh ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['quotes', 'suppliers', 'orders'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------- lock everything: no public access, only the server (service key) can read or write ----------
alter table public.quotes         enable row level security;
alter table public.suppliers      enable row level security;
alter table public.supplier_rates enable row level security;
alter table public.orders         enable row level security;
alter table public.activity       enable row level security;

-- ---------- private bucket for artwork files ----------
insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', false)
on conflict (id) do nothing;
