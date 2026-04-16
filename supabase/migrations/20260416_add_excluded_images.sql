-- Armazena lista de URLs de imagens a excluir da galeria do produto
alter table public.featured_products
  add column if not exists excluded_images jsonb default '[]'::jsonb;
