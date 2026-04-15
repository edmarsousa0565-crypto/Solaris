-- Adiciona colunas de shipping ao webhook CJ
-- Executar no Supabase SQL Editor: https://supabase.com/dashboard/project/rynfhulufiryzfjgmddl/sql

alter table orders
  add column if not exists carrier     text,
  add column if not exists shipped_at  timestamptz,
  add column if not exists delivered_at timestamptz;
