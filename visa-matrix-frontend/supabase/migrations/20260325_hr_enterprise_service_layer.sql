create extension if not exists pgcrypto;

create table if not exists public.roles (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id text primary key default gen_random_uuid()::text,
  module text not null,
  action text not null,
  created_at timestamptz not null default now(),
  unique (module, action)
);

create table if not exists public.role_permissions (
  id text primary key default gen_random_uuid()::text,
  role_id text not null references public.roles(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.employee_salary_structure (
  id text primary key default gen_random_uuid()::text,
  employee_id text not null,
  currency text not null default 'INR',
  tax_regime text not null default 'new',
  salary_components jsonb not null default '{}'::jsonb,
  effective_from date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id)
);

create table if not exists public.payroll_logs (
  id text primary key default gen_random_uuid()::text,
  employee_id text not null,
  pay_period text not null,
  gross_pay numeric(14, 2) not null default 0,
  tax_amount numeric(14, 2) not null default 0,
  net_pay numeric(14, 2) not null default 0,
  status text not null default 'processed',
  payslip jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_definitions (
  id text primary key default gen_random_uuid()::text,
  module text not null,
  name text not null,
  steps jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_instances (
  id text primary key default gen_random_uuid()::text,
  workflow_definition_id text references public.workflow_definitions(id) on delete set null,
  module text not null,
  reference_id text not null,
  status text not null default 'pending',
  current_step integer not null default 1,
  steps jsonb not null default '[]'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id text,
  type text,
  message text,
  read_status boolean not null default false,
  created_at timestamptz not null default now()
);

alter table if exists public.roles enable row level security;
alter table if exists public.permissions enable row level security;
alter table if exists public.role_permissions enable row level security;
alter table if exists public.employee_salary_structure enable row level security;
alter table if exists public.payroll_logs enable row level security;
alter table if exists public.workflow_definitions enable row level security;
alter table if exists public.workflow_instances enable row level security;
alter table if exists public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'roles' and policyname = 'roles_select_policy'
  ) then
    create policy roles_select_policy on public.roles for select using (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'permissions' and policyname = 'permissions_select_policy'
  ) then
    create policy permissions_select_policy on public.permissions for select using (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'role_permissions' and policyname = 'role_permissions_all_policy'
  ) then
    create policy role_permissions_all_policy on public.role_permissions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'employee_salary_structure' and policyname = 'employee_salary_structure_all_policy'
  ) then
    create policy employee_salary_structure_all_policy on public.employee_salary_structure for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payroll_logs' and policyname = 'payroll_logs_all_policy'
  ) then
    create policy payroll_logs_all_policy on public.payroll_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'workflow_definitions' and policyname = 'workflow_definitions_all_policy'
  ) then
    create policy workflow_definitions_all_policy on public.workflow_definitions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'workflow_instances' and policyname = 'workflow_instances_all_policy'
  ) then
    create policy workflow_instances_all_policy on public.workflow_instances for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_all_policy'
  ) then
    create policy notifications_all_policy on public.notifications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

