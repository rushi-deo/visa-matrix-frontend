create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text generated always as (regexp_replace(lower(name), '\s+', '-', 'g')) stored,
  is_external boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null,
  created_at timestamptz not null default now(),
  unique (module, action)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.roles(id) on delete cascade,
  role_name text,
  module text not null,
  action text not null,
  created_at timestamptz not null default now(),
  unique (role_name, module, action)
);

alter table public.users
  add column if not exists role text default 'agent',
  add column if not exists organization_id uuid references public.organizations(id),
  add column if not exists is_external boolean not null default false;

alter table public.audit_logs
  add column if not exists organization_id uuid references public.organizations(id),
  add column if not exists module text,
  add column if not exists entity_id text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists timestamp timestamptz not null default now();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  message text not null,
  module text not null,
  entity_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists organization_id uuid references public.organizations(id),
  add column if not exists created_by uuid references public.users(id);

create table if not exists public.invoices (
  id text primary key,
  application_id text,
  organization_id uuid references public.organizations(id),
  customer text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  payment_status text not null default 'Pending',
  payment_method text,
  invoice_date date,
  due_date date,
  updated_at timestamptz not null default now()
);

alter table public.countries
  add column if not exists name text,
  add column if not exists code text,
  add column if not exists is_active boolean not null default true,
  add column if not exists processing_time text,
  add column if not exists base_price numeric(12,2) default 0,
  add column if not exists currency text default 'INR';

update public.countries
set
  name = coalesce(name, country),
  code = coalesce(code, upper(left(coalesce(country, name), 2))),
  is_active = coalesce(is_active, true),
  currency = coalesce(currency, 'INR');

insert into public.roles (name, description)
values
  ('admin', 'Full platform access'),
  ('manager', 'Operational management access'),
  ('agent', 'Internal agent access'),
  ('external_user', 'External agency access')
on conflict (name) do nothing;

insert into public.permissions (module, action)
values
  ('settings', 'view'),
  ('settings', 'create'),
  ('settings', 'edit'),
  ('settings', 'delete'),
  ('settings', 'approve'),
  ('hr', 'view'),
  ('hr', 'create'),
  ('hr', 'edit'),
  ('hr', 'delete'),
  ('hr', 'approve'),
  ('invoicing', 'view'),
  ('invoicing', 'create'),
  ('invoicing', 'edit'),
  ('invoicing', 'delete'),
  ('invoicing', 'approve'),
  ('notifications', 'view'),
  ('notifications', 'create'),
  ('notifications', 'edit'),
  ('notifications', 'delete'),
  ('audit_logs', 'view')
on conflict (module, action) do nothing;

alter table public.countries enable row level security;

drop policy if exists "countries_read_active" on public.countries;
create policy "countries_read_active"
on public.countries
for select
using (is_active = true);
