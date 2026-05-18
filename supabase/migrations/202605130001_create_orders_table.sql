-- Create orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  total_amount numeric not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.produits on delete set null,
  quantity integer not null,
  unit_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (optional, but we can leave as anon)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Create policies for anon and authenticated users if needed.
-- For simplicity, we allow anon to insert (since we use anon key) and select own orders.
create policy "Allow anon insert on orders"
  on public.orders
  for insert
  to anon
  with check (true);

create policy "Allow anon insert on order_items"
  on public.order_items
  for insert
  to anon
  with check (true);

-- Optionally allow users to view their own orders (requires auth)
-- We'll skip for now.