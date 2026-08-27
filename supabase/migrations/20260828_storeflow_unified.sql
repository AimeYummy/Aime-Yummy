-- StoreFlow + AIME YUMMY unified Supabase schema.
-- Run after the existing AIME menu/order migrations.

alter table if exists public.menu_items
  add column if not exists hpp numeric not null default 0,
  add column if not exists stock integer not null default 0,
  add column if not exists pcs_per_mika integer not null default 1,
  add column if not exists in_stock boolean not null default false,
  add column if not exists available boolean not null default true;

update public.menu_items
set stock = coalesce(stock, 0),
    pcs_per_mika = greatest(coalesce(pcs_per_mika, 1), 1),
    in_stock = (coalesce(stock, 0) > 0),
    available = (coalesce(available, true) and coalesce(stock, 0) > 0);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menu_items(id) on delete cascade,
  type text not null check (type in ('IN','OUT')),
  quantity_mika integer not null default 0,
  pcs_per_mika integer not null default 1,
  quantity_pcs integer not null check (quantity_pcs >= 0),
  reference_type text,
  reference_id text,
  description text,
  user_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists stock_movements_menu_idx on public.stock_movements(menu_id, created_at desc);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  capacity integer not null default 4 check (capacity > 0),
  status text not null default 'Kosong',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.orders
  add column if not exists table_id uuid references public.tables(id) on delete set null,
  add column if not exists stock_deducted boolean not null default false;
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_table_idx on public.orders(table_id);

-- Public storefront may only read active menu; all writes stay server-side.
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.stock_movements enable row level security;
alter table public.tables enable row level security;

drop policy if exists "public read menu" on public.menu_items;
create policy "public read active menu" on public.menu_items
  for select to anon, authenticated using (available = true);

drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders" on public.orders
  for insert to anon, authenticated with check (true);

drop policy if exists "public read orders" on public.orders;
create policy "public read orders" on public.orders
  for select to anon, authenticated using (false);

drop policy if exists "public read active tables" on public.tables;
create policy "public read active tables" on public.tables
  for select to anon, authenticated using (is_active = true);

drop policy if exists "public read stock movements" on public.stock_movements;
create policy "public read stock movements" on public.stock_movements
  for select to anon, authenticated using (false);
