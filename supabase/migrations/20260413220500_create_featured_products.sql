create table public.featured_products (
  pid text primary key,
  created_at timestamp default now()
);
