create table if not exists public.visa_questions (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  label text not null,
  type text not null check (type in ('text', 'date', 'select', 'number', 'boolean')),
  required boolean not null default false,
  options jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visa_questions_country_id_idx
on public.visa_questions(country_id);

alter table public.visa_questions enable row level security;

drop policy if exists "allow read visa questions" on public.visa_questions;
create policy "allow read visa questions"
on public.visa_questions
for select
using (true);
