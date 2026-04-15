-- Adiciona campo shipping_method à tabela featured_products
-- Guarda o método de envio configurado pelo admin (ex: 'cj-direct', 'express', 'registered')

alter table public.featured_products
  add column if not exists shipping_method text;
