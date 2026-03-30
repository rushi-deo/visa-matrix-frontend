create extension if not exists pgcrypto;

create table if not exists public.departments (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists departments_org_name_unique
  on public.departments (coalesce(organization_id, ''), lower(name));

create table if not exists public.employees (
  id text primary key default gen_random_uuid()::text,
  user_id text,
  organization_id text,
  name text not null,
  email text not null,
  phone text,
  role text,
  department_id text references public.departments(id) on delete set null,
  status text not null default 'onboarding' check (status in ('onboarding', 'active', 'exit')),
  joining_date date,
  exit_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employees_user_id_unique
  on public.employees (user_id)
  where user_id is not null;

create unique index if not exists employees_org_email_unique
  on public.employees (coalesce(organization_id, ''), lower(email));

create index if not exists employees_department_idx on public.employees (department_id);
create index if not exists employees_status_idx on public.employees (status);
create index if not exists employees_name_idx on public.employees (name);

create table if not exists public.leaves (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  employee_id text not null references public.employees(id) on delete cascade,
  type text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by text,
  approved_role text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leaves_employee_idx on public.leaves (employee_id);
create index if not exists leaves_status_idx on public.leaves (status);
create index if not exists leaves_date_range_idx on public.leaves (start_date, end_date);

create table if not exists public.attendance (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  employee_id text not null references public.employees(id) on delete cascade,
  date date not null,
  status text not null default 'present',
  check_in timestamptz,
  check_out timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists attendance_employee_date_unique
  on public.attendance (employee_id, date);

create index if not exists attendance_status_idx on public.attendance (status);
create index if not exists attendance_date_idx on public.attendance (date);

create table if not exists public.workflows (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  name text not null,
  type text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_steps (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  workflow_id text not null references public.workflows(id) on delete cascade,
  step_order integer not null,
  approver_role text not null check (approver_role in ('admin', 'hr', 'employee')),
  created_at timestamptz not null default now()
);

create unique index if not exists workflow_steps_order_unique
  on public.workflow_steps (workflow_id, step_order);

create index if not exists workflow_steps_role_idx on public.workflow_steps (approver_role);

create table if not exists public.polls (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  question text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_responses (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  poll_id text not null references public.polls(id) on delete cascade,
  employee_id text not null references public.employees(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists poll_responses_unique
  on public.poll_responses (poll_id, employee_id);

create table if not exists public.feedback (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  from_employee text references public.employees(id) on delete set null,
  to_employee text not null references public.employees(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_to_employee_idx on public.feedback (to_employee);

create table if not exists public.kudos (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  from_employee text references public.employees(id) on delete set null,
  to_employee text not null references public.employees(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists kudos_to_employee_idx on public.kudos (to_employee);

create table if not exists public.announcements (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  title text not null,
  message text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  employee_id text not null references public.employees(id) on delete cascade,
  message text not null,
  read_status boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_employee_idx on public.notifications (employee_id);
create index if not exists notifications_read_idx on public.notifications (read_status);

create table if not exists public.documents (
  id text primary key default gen_random_uuid()::text,
  organization_id text,
  employee_id text not null references public.employees(id) on delete cascade,
  type text not null,
  file_url text not null,
  file_name text,
  bucket_name text,
  storage_path text,
  uploaded_at timestamptz not null default now()
);

create index if not exists documents_employee_idx on public.documents (employee_id);
create index if not exists documents_uploaded_at_idx on public.documents (uploaded_at desc);

insert into storage.buckets (id, name, public)
values ('hr-documents', 'hr-documents', true)
on conflict (id) do nothing;
