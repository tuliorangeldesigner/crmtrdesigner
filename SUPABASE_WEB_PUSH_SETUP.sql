-- Execute no SQL Editor para habilitar Web Push real.

create extension if not exists pgcrypto;

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.web_push_events (
  event_key text primary key,
  created_at timestamptz not null default now()
);

alter table public.web_push_subscriptions enable row level security;
alter table public.web_push_events enable row level security;

-- O usuario autenticado so enxerga e gerencia a propria inscricao.
do $$ begin
  create policy web_push_subscriptions_owner_all on public.web_push_subscriptions
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Bloqueia acesso direto de clientes aos eventos (apenas service role via Edge Function).
do $$ begin
  create policy web_push_events_no_client_access on public.web_push_events
    for all
    using (false)
    with check (false);
exception when duplicate_object then null; end $$;
