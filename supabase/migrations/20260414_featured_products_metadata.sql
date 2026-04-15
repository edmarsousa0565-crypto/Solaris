-- Adiciona colunas de metadata e preço personalizado à tabela featured_products
-- Necessário para o sistema de produtos vencedores SOLARIS

alter table public.featured_products
  add column if not exists vids             jsonb    default '[]',
  add column if not exists custom_name      text,
  add column if not exists custom_description text,
  add column if not exists custom_image     text,
  add column if not exists custom_price     numeric,   -- preço de venda personalizado em EUR
  add column if not exists collection       text    default 'Solaris',
  add column if not exists category         text,
  add column if not exists sort_order       integer default 0;

-- Índice para ordenação
create index if not exists featured_products_sort_order_idx on public.featured_products (sort_order);

-- RLS: service role tem acesso total, anon pode apenas ler
alter table public.featured_products enable row level security;

drop policy if exists "Anon read featured" on public.featured_products;
create policy "Anon read featured"
  on public.featured_products for select
  using (true);

drop policy if exists "Service write featured" on public.featured_products;
create policy "Service write featured"
  on public.featured_products for all
  using (true)
  with check (true);
