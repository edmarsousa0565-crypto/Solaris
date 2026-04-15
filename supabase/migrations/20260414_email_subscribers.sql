-- Tabela de subscritores de email — popup de boas-vindas SOLARIS

create table if not exists email_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  discount_code text,
  source        text default 'popup',
  discount_used boolean default false,
  subscribed_at timestamptz default now()
);

-- Índice para lookups rápidos por email
create index if not exists email_subscribers_email_idx on email_subscribers (email);

-- Row Level Security: apenas o service role tem acesso (endpoint server-side)
alter table email_subscribers enable row level security;

-- Sem políticas públicas — todo o acesso passa pelo endpoint /api/email/subscribe
-- que usa a SUPABASE_SERVICE_KEY (bypassa RLS)
