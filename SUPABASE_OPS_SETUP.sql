-- Execute este script no SQL Editor do Supabase para habilitar persistencia multiusuario do modulo operacional.

create table if not exists public.ops_settings (
  id text primary key default 'default',
  distribution_mode text not null default 'fila' check (distribution_mode in ('fila', 'primeiro')),
  prospector_percent integer not null default 10,
  executor_percent integer not null default 45,
  agency_percent integer not null default 45,
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_professionals (
  id uuid primary key references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  specialties text[] not null default array['design']::text[],
  active_jobs integer not null default 0,
  max_active_jobs integer not null default 2,
  quality_score integer not null default 80,
  sla_score integer not null default 80,
  is_available boolean not null default true,
  last_assigned_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_queue (
  id text primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  lead_name text not null,
  service_type text not null,
  specialty text not null check (specialty in ('design','video','motion','web','social','trafego')),
  status text not null default 'aguardando' check (status in ('aguardando','atribuido','em_producao','entregue')),
  assigned_professional_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ops_settings enable row level security;
alter table public.ops_professionals enable row level security;
alter table public.ops_queue enable row level security;

-- Politicas simples para admin total (ajuste conforme sua politica de seguranca)
do $$ begin
  create policy ops_settings_admin_all on public.ops_settings
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ops_professionals_admin_all on public.ops_professionals
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ops_queue_admin_all on public.ops_queue
    for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

insert into public.ops_settings (id, distribution_mode, prospector_percent, executor_percent, agency_percent)
values ('default', 'fila', 10, 45, 45)
on conflict (id) do nothing;
