-- Guarda nomes personalizados por variante: { "vid123": "Azul / GG", ... }
alter table public.featured_products
  add column if not exists variant_names jsonb default '{}'::jsonb;
