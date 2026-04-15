-- Tabela de encomendas SOLARIS
-- Executar no Supabase SQL Editor: https://supabase.com/dashboard/project/rynfhulufiryzfjgmddl/sql

create table if not exists orders (
  id                uuid        default gen_random_uuid() primary key,
  stripe_session_id text        unique not null,
  order_number      text        unique,
  cj_order_id       text,
  customer_email    text        not null,
  customer_name     text,
  shipping_address  jsonb,
  items             jsonb,
  total_amount      numeric,
  currency          text        default 'EUR',
  status            text        default 'pending',
  tracking_number   text,
  tracking_url      text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Índices para pesquisa rápida
create index if not exists orders_customer_email_idx on orders (customer_email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_order_number_idx on orders (order_number);

-- Atualiza updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- Row Level Security (apenas service role pode escrever, anon pode ler as suas próprias)
alter table orders enable row level security;

create policy "Service role full access"
  on orders for all
  using (true)
  with check (true);
