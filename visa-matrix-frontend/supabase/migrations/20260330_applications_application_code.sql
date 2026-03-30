alter table public.applications
  add column if not exists application_code text;

create unique index if not exists applications_application_code_unique_idx
on public.applications (application_code)
where application_code is not null;
